import { parseQueryUrl } from "./trpc.ts";
import { assert } from "std/testing/asserts.ts";

const PROJECT_SLUG = "TEST_PROJECT_SLUG";

Deno.test("[trpc] parses a single query properly", () => {
  const input = { foo: "bar" };

  const url = new URL(
    `http://localhost:8080/${PROJECT_SLUG}/myQuery?input=${
      encodeURIComponent(JSON.stringify(input))
    }`,
  );

  const parsed = parseQueryUrl(url, PROJECT_SLUG);
  assert(parsed.length === 1);

  assert(parsed[0].queryName === "myQuery");
  assert(parsed[0].input.foo === "bar");
});

Deno.test("[trpc] parses a batch query properly", () => {
  const input = {
    0: { foo: "bar" },
    1: { bar: "baz" },
  };

  const url = new URL(
    `http://localhost:8080/${PROJECT_SLUG}/myQuery,myOtherQuery?batch=1&input=${
      encodeURIComponent(JSON.stringify(input))
    }`,
  );

  const parsed = parseQueryUrl(url, PROJECT_SLUG);
  assert(parsed.length === 2);

  assert(parsed[0].queryName === "myQuery");
  assert(parsed[0].input.foo === "bar");

  assert(parsed[1].queryName === "myOtherQuery");
  assert(parsed[1].input.bar === "baz");
});
