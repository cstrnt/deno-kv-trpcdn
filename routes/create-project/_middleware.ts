// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { State } from "@/routes/_middleware.ts";
import { MiddlewareHandlerContext } from "$fresh/server.ts";
import { getProjectByUserId, getUserBySessionId, User } from "@/utils/db.ts";
import { redirect } from "@/utils/redirect.ts";

export interface CreateProjectState extends State {
  sessionId: string;
  user: User;
}

export async function handler(
  _req: Request,
  ctx: MiddlewareHandlerContext<CreateProjectState>,
) {
  const redirectResponse = redirect("/signin");

  if (!ctx.state.sessionId) return redirectResponse;
  const user = await getUserBySessionId(ctx.state.sessionId);

  if (!user) return redirectResponse;
  const project = await getProjectByUserId(user.id);

  if (project) return redirect("/dashboard");

  ctx.state.user = user;
  return await ctx.next();
}
