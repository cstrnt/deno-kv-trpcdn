import { Handlers } from "$fresh/server.ts";

export const handler: Handlers = {
  async POST(req, ctx) {
    const l = await req.json();
    console.log(l);
    return new Response(l, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  },
};
