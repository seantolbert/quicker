import { createTextStreamResponse, NoObjectGeneratedError, Output, streamText, toTextStream } from "ai";
import { after } from "next/server";
import { intakeMessage } from "@/lib/ai/intake-prompt";
import { generationModel, systemPrompt } from "@/lib/ai/prompt";
import { applyIntake, stripAppFields } from "@/lib/intake/enforce";
import { getDirection, getIntake, getProject, projectDir, saveSpec, updateProject } from "@/lib/store";
import { normalizeSpec } from "@/spec/normalize";
import { siteSpecSchema, type SiteSpec, type StoredSpec } from "@/spec/schema";

export const maxDuration = 300;

/** Streams a partial SiteSpec as JSON text; saves the validated spec when the stream ends. */
export async function POST(req: Request) {
  const { projectId } = (await req.json()) as { projectId?: string };
  const project = projectId ? await getProject(projectId) : null;
  if (!project) return Response.json({ error: "Project not found" }, { status: 404 });

  const [intake, direction] = await Promise.all([getIntake(project.id), getDirection(project.id)]);
  await updateProject(project.id, { status: "generating", error: undefined });

  let streamError: unknown;
  const input = intake
    ? { messages: [await intakeMessage(projectDir(project.id), intake, direction, project.prompt)] }
    : { prompt: project.prompt };

  const result = streamText({
    model: generationModel(),
    instructions: systemPrompt({ businessData: !!intake }),
    ...input,
    output: Output.object({ schema: siteSpecSchema }),
    onError({ error }) {
      streamError = error;
      console.error("[generate]", error);
    },
  });

  after(async () => {
    try {
      const spec = normalizeSpec(await validOutput(result.output));
      await saveSpec(project.id, intake ? applyIntake(spec, intake, direction) : stripAppFields(spec));
    } catch (error) {
      console.error("[generate] failed to save spec", error);
      const cause = streamError ?? error;
      const message = cause instanceof Error ? cause.message : String(cause);
      // Strip terminal colors from SDK messages.
      await updateProject(project.id, { status: "error", error: message.replace(/\x1b\[[0-9;]*m/g, "") });
    }
  });

  return createTextStreamResponse({ stream: toTextStream({ stream: result.stream }) });
}

/**
 * The validated output. If validation fails, retry once with app-only fields
 * stripped from the raw JSON (models sometimes fill them), so a complete site
 * isn't thrown away over a field the app overwrites anyway.
 */
async function validOutput(output: PromiseLike<unknown>): Promise<SiteSpec> {
  try {
    return (await output) as SiteSpec;
  } catch (error) {
    if (!NoObjectGeneratedError.isInstance(error) || !error.text) throw error;
    let raw: unknown;
    try {
      raw = JSON.parse(error.text);
    } catch {
      throw error;
    }
    const repaired = siteSpecSchema.safeParse(stripAppFields(raw as StoredSpec));
    if (!repaired.success) {
      const issue = repaired.error.issues[0];
      throw new Error(`The model's site didn't match the schema at ${issue.path.join(".")}: ${issue.message}`);
    }
    console.warn("[generate] recovered output after stripping app-only fields");
    return repaired.data as SiteSpec;
  }
}
