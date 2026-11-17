import { writeExport } from "@/lib/export";
import { applyIntake } from "@/lib/intake/enforce";
import { getDirection, getIntake, getSpec, projectDir, updateProject } from "@/lib/store";

export async function POST(_req: Request, ctx: RouteContext<"/api/export/[id]">) {
  const { id } = await ctx.params;
  const [stored, intake, direction] = await Promise.all([getSpec(id), getIntake(id), getDirection(id)]);
  // Re-apply the intake so photo rights changed since generation are current.
  const spec = stored && intake ? applyIntake(stored, intake, direction) : stored;
  if (!spec) return Response.json({ error: "Generate the site before exporting" }, { status: 404 });
  const exportPath = await writeExport(spec, projectDir(id), direction);
  await updateProject(id, { exportPath });
  return Response.json({ path: exportPath });
}
