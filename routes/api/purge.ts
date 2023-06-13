import { Handlers } from "$fresh/server.ts";
import { z } from "zod";
import { State } from "../_middleware.ts";
import {
  getProjectByUserId,
  getUserBySessionId,
  purgeCache,
} from "../../utils/db.ts";

const incomingBodySchema = z.object({
  projectId: z.string(),
  queryName: z.string(),
});

export const handler: Handlers<any, State> = {
  async POST(req, ctx) {
    const incomingData = await req.json();

    const bodyResult = incomingBodySchema.safeParse(incomingData);

    if (!bodyResult.success) {
      return new Response("Invalid body", { status: 400 });
    }

    if (!ctx.state.sessionId) {
      return new Response("Not logged in", { status: 401 });
    }
    const user = await getUserBySessionId(ctx.state.sessionId);

    if (!user) {
      return new Response("Not logged in", { status: 401 });
    }

    const userProject = await getProjectByUserId(user.id);

    if (!userProject || userProject.id !== bodyResult.data.projectId) {
      return new Response("Not authorized", { status: 401 });
    }

    await purgeCache(userProject.slug, bodyResult.data.queryName);

    console.log(
      "Purged cache for",
      userProject.slug,
      bodyResult.data.queryName,
    );

    return new Response(JSON.stringify(incomingData), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  },
};
