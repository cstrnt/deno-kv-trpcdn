import { Handlers, PageProps } from "$fresh/server.ts";
import Head from "../../components/Head.tsx";
import Layout from "../../components/Layout.tsx";
import {
  BUTTON_STYLES,
  INPUT_STYLES,
  SITE_WIDTH_STYLES,
} from "../../utils/constants.ts";
import { z } from "zod";
import { CreateProjectState } from "./_middleware.ts";
import { createProject } from "../../utils/db.ts";
import { redirect } from "@/utils/redirect.ts";

const incomingSchema = z.object({
  name: z.string().min(1),
  domain: z.string().url(),
  slug: z.string().min(3).max(20).regex(/^[a-z0-9-]+$/i),
});

type Data = {
  errors?: z.ZodError<z.infer<typeof incomingSchema>>;
} & CreateProjectState;

export const handler: Handlers<Data, CreateProjectState> = {
  GET(_req, ctx) {
    return ctx.render({
      ...ctx.state,
    });
  },
  async POST(req, ctx) {
    const formData = await req.formData();
    const body = incomingSchema.safeParse(
      Object.fromEntries(formData.entries()),
    );

    if (!body.success) {
      return ctx.render({
        ...ctx.state,
        errors: body.error,
      });
    }

    await createProject({
      domain: body.data.domain,
      name: body.data.name,
      ownerId: ctx.state.user.id,
      slug: body.data.slug,
    });

    return redirect("/dashboard");
  },
};

export default function CreateProjectPage(
  props: PageProps<Data & CreateProjectState>,
) {
  return (
    <>
      <Head title="Create a Project" href={props.url.href} />
      <Layout session={props.data.sessionId}>
        <div class={`${SITE_WIDTH_STYLES} flex-1 px-4`}>
          <h1>Create a new Project!</h1>
          <form method="POST" className="flex flex-col space-y-3 max-w-md">
            <div>
              <div class="flex flex-wrap justify-between">
                <span>
                  <strong>Name</strong>
                </span>
              </div>
              <input
                className={INPUT_STYLES}
                type="text"
                name="name"
                required
              />
              <p className="text-red-400 text-sm">
                {props.data.errors?.formErrors.fieldErrors.name}
              </p>
            </div>
            <div>
              <div class="flex flex-wrap justify-between">
                <span>
                  <strong>Slug</strong>
                </span>
              </div>
              <div>
                <input
                  className={INPUT_STYLES}
                  type="text"
                  name="slug"
                  required
                />
                <span className="text-gray-400 text-xs">
                  This is gonna be the unique identifier for your project. It
                  can only contain letters, numbers, and dashes.
                </span>
                <p className="text-red-400 text-sm">
                  {props.data.errors?.formErrors.fieldErrors.slug}
                </p>
              </div>
            </div>

            <div class="flex flex-wrap justify-between">
              <span>
                <strong>Domain</strong>
              </span>
            </div>
            <div>
              <input
                className={INPUT_STYLES}
                type="text"
                name="domain"
                required
              />
              <span className="text-gray-400 text-xs">
                This should be the full path to your tRPC endpoint. For example:
                {" "}
                <code>https://api.example.com/api/trpc</code>
              </span>
              <p className="text-red-400 text-sm">
                {props.data.errors?.formErrors.fieldErrors.domain}
              </p>
            </div>
            <button className={BUTTON_STYLES} type="submit">Create</button>
          </form>
        </div>
      </Layout>
    </>
  );
}
