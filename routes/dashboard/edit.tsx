import type { Handlers, PageProps } from "$fresh/server.ts";
import Head from "@/components/Head.tsx";
import { SITE_WIDTH_STYLES } from "@/utils/constants.ts";
import { DashboardState } from "./_middleware.ts";
import Layout from "@/components/Layout.tsx";
import { Input } from "@/components/ui/Input.tsx";
import { Label } from "@/components/ui/Label.tsx";
import { InputGroup } from "@/components/ui/InputGroup.tsx";
import { Button } from "@/components/ui/Button.tsx";
import { z } from "zod";
import { redirect } from "../../utils/redirect.ts";
import { updateProject } from "../../utils/db.ts";

const incomingBodySchema = z.object({
  name: z.string(),
  domain: z.string().url(),
});

type Data = {
  errors?: z.typeToFlattenedError<z.infer<typeof incomingBodySchema>>;
} & DashboardState;

export const handler: Handlers<Data, DashboardState> = {
  GET(_request, ctx) {
    return ctx.render({ ...ctx.state });
  },
  async POST(request, ctx) {
    const formData = await request.formData();

    const parsedFormData = Object.fromEntries(formData.entries());

    const body = incomingBodySchema.safeParse(parsedFormData);

    if (!body.success) {
      return ctx.render({
        ...ctx.state,
        project: {
          ...ctx.state.project,
          ...parsedFormData,
        },
        errors: body.error.flatten(),
      });
    }

    await updateProject({
      slug: ctx.state.project.slug,
      ...body.data,
    });

    return redirect("/dashboard");
  },
};

export default function EditPage(
  { data: { project, sessionId, errors }, ...props }: PageProps<Data>,
) {
  return (
    <>
      <Head title={project.name} href={props.url.href} />
      <Layout session={sessionId}>
        <div class={`${SITE_WIDTH_STYLES} flex-1 px-4 space-y-4 py-8`}>
          <h1 className="text-4xl font-bold">Edit Project</h1>
          <form method="POST">
            <div className="space-y-4">
              <InputGroup>
                <Label htmlFor="name">
                  Name
                </Label>
                <Input
                  type="text"
                  name="name"
                  defaultValue={project.name}
                />
                {errors?.fieldErrors.name && (
                  <p className="text-red-500">
                    {errors.fieldErrors.name}
                  </p>
                )}
              </InputGroup>
              <InputGroup>
                <Label htmlFor="domain">
                  Domain
                </Label>
                <Input
                  type="url"
                  name="domain"
                  defaultValue={project.domain}
                />
                {errors?.fieldErrors.domain && (
                  <p className="text-red-500">
                    {errors.fieldErrors.domain}
                  </p>
                )}
              </InputGroup>
              <Button type="submit">
                Submit
              </Button>
            </div>
          </form>
        </div>
      </Layout>
    </>
  );
}
