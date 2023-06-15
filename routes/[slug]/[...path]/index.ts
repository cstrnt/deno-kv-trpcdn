import { Handlers } from "https://deno.land/x/fresh@1.1.6/server.ts";
import {
  getCache,
  getProjectBySlug,
  logRequest,
  purgeCache,
  setCache,
} from "@/utils/db.ts";
import { parseQueryUrl } from "../../../utils/trpc.ts";

const enum INTERNAL_CACHE_HEADER_NAMES {
  CACHE_HIT = "x-trpcdn-cache-hit",
  CACHE_TTL = "x-trpcdn-cache-ttl",
  TIMINGS = "x-trpcdn-timings",
  CACHE_TIME = "x-trpcdn-cache-time",
}

const enum TRPCDN_CACHE_HIT_VALUE {
  HIT = "hit",
  MISS = "miss",
}

type TimingIntervals = {
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
    const targetURL = new URL(project.domain);
    const headers = new Headers();

    const currentUrl = new URL(req.url);

    targetURL.pathname = targetURL.pathname +
      currentUrl.pathname.replace(`/${slug}`, "");

    // copy headers from request
    for (const [key, value] of req.headers.entries()) {
      if (key === "host") {
        continue;
      }
      headers.set(key, value);
    }

    // copy query params from request
    for (const [key, value] of currentUrl.searchParams.entries()) {
      targetURL.searchParams.set(key, value);
    }
    const queries = parseQueryUrl(currentUrl, slug);

    if (queries.length > 1) {
      return new Response("Batch queries not supported", { status: 400 });
    }

    const { rawInput, queryName } = queries[0];

    const cachedValue = await getCache(
      slug,
      queryName,
      rawInput,
    );

    timings.readCache = Date.now() - now - timings.loadInternalData;

    if (cachedValue) {
      // if cache is older than 5 minutes, purge it and return old value once more
      if (Date.now() - cachedValue.createdAt > project.cacheTtl) {
        console.log("Cache expired");
        setTimeout(() => {
          console.log("purging cache");
          purgeCache(slug, queryName, rawInput);
        });
      } else {
        console.log("cached value");
      }

      setTimeout(() => {
        logRequest({
          isCached: true,
          projectId: project.id,
          queryName,
          timeInMs: Date.now() - now,
          rawInput,
        });
      });

      return new Response(JSON.stringify(cachedValue.value), {
        headers: {
          "content-type": "application/json",
          [INTERNAL_CACHE_HEADER_NAMES.CACHE_HIT]: TRPCDN_CACHE_HIT_VALUE.HIT,
          [INTERNAL_CACHE_HEADER_NAMES.CACHE_TTL]: (project.cacheTtl / 1000)
            .toFixed(0),
          [INTERNAL_CACHE_HEADER_NAMES.TIMINGS]: JSON.stringify(timings),
          [INTERNAL_CACHE_HEADER_NAMES.CACHE_TIME]: ((Date.now() -
            cachedValue.createdAt) / 1000).toFixed(0),
        },
      });
    }

    const retrievedValue = await fetch(targetURL, { headers });
    timings.loadRemoteData = Date.now() - now - timings.loadInternalData -
      timings.readCache;

    const responseCopy = retrievedValue.clone();
    setTimeout(async () => {
      // we don't want to cache errors
      if (!responseCopy.ok) {
        return;
      }

      const data = await responseCopy.json();

      // we don't want to cache errors
      if (data.error) {
        return;
      }

      console.log("setting cache");
      logRequest({
        isCached: false,
        projectId: project.id,
        queryName,
        timeInMs: Date.now() - now,
        rawInput,
      });

      setCache({
        projectSlug: slug,
        queryName,
        input: rawInput,
        value: data,
      });
    }, 1);
    console.log("Returning fresh value");

    const responseHeaders = new Headers(retrievedValue.headers);

    responseHeaders.set(
      INTERNAL_CACHE_HEADER_NAMES.CACHE_HIT,
      TRPCDN_CACHE_HIT_VALUE.MISS,
    );
    responseHeaders.set(
      INTERNAL_CACHE_HEADER_NAMES.CACHE_TTL,
      project.cacheTtl.toString(),
    );

    responseHeaders.set(
      INTERNAL_CACHE_HEADER_NAMES.TIMINGS,
      JSON.stringify(timings),
    );

    // copy headers from response so we can add CORS headers
    return new Response(retrievedValue.body, {
      headers: responseHeaders,
    });
  },
};
