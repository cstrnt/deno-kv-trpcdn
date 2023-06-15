import { Handlers } from "https://deno.land/x/fresh@1.1.6/server.ts";
import {
  getCache,
  getProjectBySlug,
  logRequest,
  purgeCache,
  setCache,
} from "@/utils/db.ts";
import { parseQueryUrl } from "@/utils/trpc.ts";
import { cachified } from "@/utils/queryCache.ts";

const enum INTERNAL_CACHE_HEADER_NAMES {
  CACHE_HIT = "x-trpcdn-cache-hit",
  CACHE_TTL = "x-trpcdn-cache-ttl",
  TIMINGS = "x-trpcdn-timings",
  CACHE_TIME = "x-trpcdn-cache-time",
  HIT_QUERIES = "x-trpcdn-hit-queries",
}

const enum TRPCDN_CACHE_HIT_VALUE {
  HIT = "HIT",
  MISS = "MISS",
  PARTIAL = "PARTIAL",
}

export type TimingIntervals = {
  loadInternalData: number;
  readCache: number;
  loadRemoteData: number;
};

export const handler: Handlers = {
  async GET(req, ctx) {
    const timings = {
      loadInternalData: 0,
      readCache: 0,
      loadRemoteData: 0,
    } satisfies TimingIntervals;

    const now = Date.now();
    const { slug } = ctx.params;

    const project = await getProjectBySlug(slug);

    timings.loadInternalData = Date.now() - now;

    if (!project) {
      return new Response("Not found", { status: 404 });
    }

    const headers = new Headers();

    const currentUrl = new URL(req.url);

    // copy headers from request
    for (const [key, value] of req.headers.entries()) {
      if (key === "host") {
        continue;
      }
      headers.set(key, value);
    }

    const queries = parseQueryUrl(currentUrl, slug);
    const results = await Promise.all(
      queries.map(({ queryName, rawInput }) =>
        cachified({
          ttl: project.cacheTtl,
          getCacheFunction: async () => {
            const cachedValue = await getCache(
              slug,
              queryName,
              rawInput,
            );

            return cachedValue;
          },
          persistFunction: async (value) => {
            await setCache({
              projectSlug: slug,
              queryName,
              input: rawInput,
              value,
            });
          },
          getFreshValueFunction: async () => {
            const now = Date.now();

            const targetUrl = new URL(
              project.domain,
            );
            targetUrl.pathname = targetUrl.pathname + "/" + queryName;
            targetUrl.searchParams.set("input", rawInput);

            const response = await fetch(targetUrl, { headers });
            timings.loadRemoteData = Date.now() - now;
            return response.json();
          },
          meta: { queryName, rawInput },
        })
      ),
    );

    // add timings
    timings.loadRemoteData += Math.max(
      ...results.map((r) => r.timings.loadRemoteData),
    );
    timings.readCache += Math.max(
      ...results.map((r) => r.timings.readCache),
    );

    const returnValue = results.length === 1
      ? results[0].value.value
      : results.map((r) => r.value.value);

    const cachedQueryCount = results.filter((r) => r.isCached).length;

    setTimeout(() => {
      Promise.all(results.map((r) => {
        logRequest({
          isCached: r.isCached,
          queryName: r.meta.queryName,
          projectId: project.id,
          timeInMs: r.endTime - now,
          rawInput: r.meta.rawInput,
        });
      }));
    });

    return new Response(JSON.stringify(returnValue), {
      headers: {
        "content-type": "application/json",
        [INTERNAL_CACHE_HEADER_NAMES.CACHE_HIT]: cachedQueryCount === 0
          ? TRPCDN_CACHE_HIT_VALUE.MISS
          : cachedQueryCount === results.length
          ? TRPCDN_CACHE_HIT_VALUE.HIT
          : TRPCDN_CACHE_HIT_VALUE.PARTIAL,
        [INTERNAL_CACHE_HEADER_NAMES.CACHE_TTL]: (project.cacheTtl / 1000)
          .toFixed(0),
        [INTERNAL_CACHE_HEADER_NAMES.TIMINGS]: JSON.stringify(timings),
        [INTERNAL_CACHE_HEADER_NAMES.HIT_QUERIES]: results.filter((r) =>
          r.isCached
        ).map((r) => r.meta.queryName).join(","),
      },
    });
  },
};
