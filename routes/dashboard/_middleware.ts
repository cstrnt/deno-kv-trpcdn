// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { State } from "@/routes/_middleware.ts";
import { MiddlewareHandlerContext } from "$fresh/server.ts";
import { redirect } from "@/utils/redirect.ts";
import {
  getProjectByUserId,
  getUserBySessionId,
  Project,
  User,
} from "@/utils/db.ts";

export interface DashboardState extends State {
  sessionId: string;
  user: User;
  project: Project;
}

export async function handler(
  _req: Request,
  ctx: MiddlewareHandlerContext<DashboardState>,
) {
  const redirectResponse = redirect("/signin");

  if (!ctx.state.sessionId) return redirectResponse;
  const user = await getUserBySessionId(ctx.state.sessionId);

  if (!user) return redirectResponse;
  const project = await getProjectByUserId(user.id);

  if (!project) return redirect("/create-project");

  ctx.state.user = user;
  ctx.state.project = project;
  return await ctx.next();
}
