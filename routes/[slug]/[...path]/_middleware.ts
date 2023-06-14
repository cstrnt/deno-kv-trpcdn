import { MiddlewareHandlerContext } from "$fresh/server.ts";
import { State } from "../../_middleware.ts";

function setCorsHeaders(res: Response) {
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type");
}

export async function handler(
  req: Request,
  ctx: MiddlewareHandlerContext<State>,
) {
  if (req.method === "OPTIONS") {
    const res = new Response(null, { status: 204 });
    setCorsHeaders(res);
    return res;
  }

  const res = await ctx.next();
  setCorsHeaders(res);
  return res;
}
