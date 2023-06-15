// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import type { Handlers, PageProps } from "$fresh/server.ts";
import { SITE_NAME, SITE_WIDTH_STYLES } from "@/utils/constants.ts";
import Layout from "@/components/Layout.tsx";
import Head from "@/components/Head.tsx";
import type { State } from "./_middleware.ts";
import Logo from "@/components/Logo.tsx";

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
          <div className="flex space-x-2">
            <h1 className="text-5xl font-bold">
              Welcome to
            </h1>
            <Logo className="text-5xl" />
          </div>
          <h2 className="text-2xl font-medium mt-6 mb-12">
            Your dead-simple CDN for your tRPC API.
          </h2>
          <p className="text-xl mt-4">
            <b>TL;DR</b>

            <br />
            1. Create an account
            <br />
            2. Create a project
            <br />
            3. Replace your tRPC url with the one we give you
            <br />
            4. Profit
            <br />
            <br />
            <small>
              Note: Even though it works with batched requests, it is
              recommended to use the regular HTTPLink for faster response times.
            </small>
          </p>
        </div>
      </Layout>
    </>
  );
}
