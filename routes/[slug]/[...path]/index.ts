import { Handlers } from "https://deno.land/x/fresh@1.1.6/server.ts";
import {
  getCache,
  getProjectBySlug,
  logRequest,
  purgeCache,
  setCache,
} from "@/utils/db.ts";
import { parseQueryUrl } from "../../../utils/trpc.ts";

export const handler: Handlers = {
  async GET(req, ctx) {
    const now = Date.now();
    const { slug } = ctx.params;

    const project = await getProjectBySlug(slug);

    if (!project) {
      return new Response("Not found", { status: 404 });
    }
    const projectDomain = new URL(project.domain);
    const headers = new Headers();

    for (const [key, value] of req.headers.entries()) {
      if (key === "host") {
        continue;
      }
      headers.set(key, value);
    }

    const currentUrl = new URL(req.url);

    projectDomain.pathname = projectDomain.pathname +
      currentUrl.pathname.replace(`/${slug}`, "");

    for (const [key, value] of currentUrl.searchParams.entries()) {
      projectDomain.searchParams.set(key, value);
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

    if (cachedValue) {
      // if cache is older than 5 minutes, purge it and return old value once more
      if (Date.now() - cachedValue.createdAt > project.cacheTtl) {
        console.log("Cache expired");
        setTimeout(() => {
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

      return new Response(JSON.stringify(cachedValue), {
        headers: { "content-type": "application/json" },
      });
    }

    const retrievedValue = await fetch(projectDomain, { headers });

    const responseCopy = retrievedValue.clone();
    setTimeout(async () => {
      const data = await responseCopy.json();
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
    return retrievedValue;
  },
};
