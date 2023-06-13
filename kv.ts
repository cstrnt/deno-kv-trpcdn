#!/usr/bin/env -S deno run -A --unstable

import { setup, tw } from "https://esm.sh/twind@0.16.16";
import { getStyleTag, virtualSheet } from "https://esm.sh/twind@0.16.16/sheets";
import { serve } from "https://deno.land/std/http/server.ts";

const sheet = virtualSheet();

const kv = await Deno.openKv();

setup({
  theme: {
    fontFamily: {
      sans: ["Helvetica", "sans-serif"],
      serif: ["Times", "serif"],
    },
  },
  sheet,
});

function renderBody() {
  return `
    <h1 class="${tw`text(3xl blue-500)`}">Hello from Deno</h1>
    <form>
      <input name="user">
      <button class="${tw`text(2xl red-500)`}">
        Submit
      </button>
    </form>
  `;
}

async function ssr() {
  sheet.reset();
  const body = renderBody();
  const styleTag = getStyleTag(sheet);

  const items: Array<{ key: Deno.KvKey; value: any }> = [];
  const entries = kv.list({ prefix: [] });
  for await (const entry of entries) {
    items.push({
      key: entry.key,
      value: entry.value,
    });
  }

  return `<!DOCTYPE html>
    <html lang="en">
      <head>
        <title>Hello from Deno</title>
        ${styleTag}
      </head>
      <body>
        ${body}
        <ul>
            ${
    items.map(({ key, value }) =>
      `<li>${key}: <pre>${JSON.stringify(value, null, 2)}</pre></li>`
    ).join("")
  }
        </ul>
      </body>
    </html>`;
}

const port = 8080;

serve(async () => {
  return new Response(await ssr(), {
    headers: {
      "content-type": "text/html",
    },
  });
}, { port });
