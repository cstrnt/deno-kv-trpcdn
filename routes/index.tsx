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
        <div class={`${SITE_WIDTH_STYLES} flex-1 px-4 py-8`}>
          <h1 className="text-5xl font-bold text-center">
            Welcome to {SITE_NAME}
          </h1>
          <p className="text-center text-xl mt-4">
            TL;DR

            <br />
            1. Create an account
            <br />
            2. Create a project
            <br />
            3. Replace your tRPC url with the one we give you
            <br />
            4. Profit
          </p>
        </div>
      </Layout>
    </>
  );
}
