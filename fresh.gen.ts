// DO NOT EDIT. This file is generated by fresh.
// This file SHOULD be checked into source version control.
// This file is automatically updated during development when running `dev.ts`.

import config from "./deno.json" assert { type: "json" };
import * as $0 from "./routes/[slug]/[...path]/index.ts";
import * as $1 from "./routes/_404.tsx";
import * as $2 from "./routes/_500.tsx";
import * as $3 from "./routes/_middleware.ts";
import * as $4 from "./routes/account/_middleware.ts";
import * as $5 from "./routes/account/index.tsx";
import * as $6 from "./routes/account/manage.ts";
import * as $7 from "./routes/account/upgrade.ts";
import * as $8 from "./routes/api/purge.ts";
import * as $9 from "./routes/api/stripe-webhooks.ts";
import * as $10 from "./routes/blog/[slug].tsx";
import * as $11 from "./routes/blog/index.tsx";
import * as $12 from "./routes/callback.ts";
import * as $13 from "./routes/create-project/_middleware.ts";
import * as $14 from "./routes/create-project/index.tsx";
import * as $15 from "./routes/dashboard/_middleware.ts";
import * as $16 from "./routes/dashboard/index.tsx";
import * as $17 from "./routes/index.tsx";
import * as $18 from "./routes/pricing.tsx";
import * as $19 from "./routes/signin.ts";
import * as $20 from "./routes/signout.ts";
import * as $$0 from "./islands/PurgeInput.tsx";

const manifest = {
  routes: {
    "./routes/[slug]/[...path]/index.ts": $0,
    "./routes/_404.tsx": $1,
    "./routes/_500.tsx": $2,
    "./routes/_middleware.ts": $3,
    "./routes/account/_middleware.ts": $4,
    "./routes/account/index.tsx": $5,
    "./routes/account/manage.ts": $6,
    "./routes/account/upgrade.ts": $7,
    "./routes/api/purge.ts": $8,
    "./routes/api/stripe-webhooks.ts": $9,
    "./routes/blog/[slug].tsx": $10,
    "./routes/blog/index.tsx": $11,
    "./routes/callback.ts": $12,
    "./routes/create-project/_middleware.ts": $13,
    "./routes/create-project/index.tsx": $14,
    "./routes/dashboard/_middleware.ts": $15,
    "./routes/dashboard/index.tsx": $16,
    "./routes/index.tsx": $17,
    "./routes/pricing.tsx": $18,
    "./routes/signin.ts": $19,
    "./routes/signout.ts": $20,
  },
  islands: {
    "./islands/PurgeInput.tsx": $$0,
  },
  baseUrl: import.meta.url,
  config,
};

export default manifest;