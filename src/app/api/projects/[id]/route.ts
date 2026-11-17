import { getDirection, getIntake, getProject, getSpec, updateProject } from "@/lib/store";

export async function GET(_req: Request, ctx: RouteContext<"/api/projects/[id]">) {
  const { id } = await ctx.params;
  const project = await getProject(id);
  if (!project) return Response.json({ error: "Not found" }, { status: 404 });
  const [spec, intake, direction] = await Promise.all([getSpec(id), getIntake(id), getDirection(id)]);
  return Response.json({ project, spec, intake, direction });
}

/** Updates the owner notes (the prompt) before generating. */
export async function PATCH(req: Request, ctx: RouteContext<"/api/projects/[id]">) {
  const { id } = await ctx.params;
  if (!(await getProject(id))) return Response.json({ error: "Not found" }, { status: 404 });
  const { prompt } = (await req.json()) as { prompt?: string };
  return Response.json({ project: await updateProject(id, { prompt: (prompt ?? "").trim() }) });
}
