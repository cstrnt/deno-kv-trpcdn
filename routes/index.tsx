// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import type { Handlers, PageProps } from "$fresh/server.ts";
import { SITE_NAME, SITE_WIDTH_STYLES } from "@/utils/constants.ts";
import Layout from "@/components/Layout.tsx";
import Head from "@/components/Head.tsx";
import type { State } from "./_middleware.ts";

export const handler: Handlers<State> = {
  GET(req, ctx) {
    return ctx.render({ ...ctx.state });
  },
};

export default function HomePage(props: PageProps<State>) {
  return (
    <>
      <Head href={props.url.href} />
      <Layout session={props.data.sessionId}>
        <div class={`${SITE_WIDTH_STYLES} flex-1 px-4`}>
          <h1>Welcome to {SITE_NAME}</h1>
        </div>
      </Layout>
    </>
  );
}
