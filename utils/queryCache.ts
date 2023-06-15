import { CacheValue } from "@/utils/db.ts";
import { TimingIntervals } from "../routes/[slug]/[...path]/index.ts";

type CachifiedTimings = Omit<TimingIntervals, "loadInternalData">;
type CacheMeta = {
  queryName: string;
  rawInput: string;
};

export async function cachified<T = unknown>(
  {
    getCacheFunction,
    getFreshValueFunction,
    persistFunction,
    ttl,
    meta,
  }: {
    ttl: number;
    getFreshValueFunction: () => Promise<any>;
    persistFunction: (value: any) => Promise<any>;
    getCacheFunction: () => Promise<CacheValue | null>;
    meta: CacheMeta;
  },
): Promise<
  {
    value: CacheValue;
    isCached: boolean;
    timings: CachifiedTimings;
    meta: CacheMeta;
    endTime: number;
  }
> {
  const timings = {
    loadRemoteData: 0,
    readCache: 0,
  } satisfies CachifiedTimings;
  const start = Date.now();
  const cachedValue = await getCacheFunction();
  timings.readCache = Date.now() - start;
  console.log("Retrieved cached value");

  if (cachedValue) {
    if (Date.now() - cachedValue.createdAt < ttl) {
      console.log(`Returning cached value`);
      return {
        value: cachedValue,
        isCached: true,
        timings,
        meta,
        endTime: Date.now(),
      };
    }
  }

  console.log(
    `Fetching fresh value, Reason: ${cachedValue ? "stale" : "miss"}`,
  );
  const freshValue = await getFreshValueFunction();
  timings.loadRemoteData = Date.now() - start - timings.readCache;

  setTimeout(() => {
    console.log("Persisting fresh value asynchronously");
    persistFunction(freshValue);
  }, 0);

  return {
    value: {
      createdAt: Date.now(),
      value: freshValue,
    },
    isCached: false,
    timings,
    meta,
    endTime: Date.now(),
  };
}
