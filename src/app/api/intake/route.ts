import { rm } from "node:fs/promises";
import { buildIntake } from "@/lib/intake/build";
import { createProject, projectDir, updateProject } from "@/lib/store";

export const maxDuration = 120;

/** Creates a project from a Google place: pulls the intake and builds the design direction. */
export async function POST(req: Request) {
  const { placeId } = (await req.json()) as { placeId?: string };
  if (!placeId) return Response.json({ error: "placeId is required" }, { status: 400 });

  const project = await createProject("", { placeId });
  try {
    const { intake, direction } = await buildIntake(projectDir(project.id), placeId);
    await updateProject(project.id, { name: intake.business.name });
    return Response.json({ id: project.id, intake, direction });
  } catch (error) {
    await rm(projectDir(project.id), { recursive: true, force: true });
    return Response.json({ error: error instanceof Error ? error.message : String(error) }, { status: 502 });
  }
}
