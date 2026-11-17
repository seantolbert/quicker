import { deploy } from "@/lib/deploy";
import { writeExport } from "@/lib/export";
import { applyIntake } from "@/lib/intake/enforce";
import { getDirection, getIntake, getProject, getSpec, projectDir, updateProject } from "@/lib/store";
import { collectAssets } from "@/spec/assets";

export const maxDuration = 300;

/** Re-exports the site, deploys it with the Vercel CLI, and streams the CLI log as plain text. */
export async function POST(req: Request, ctx: RouteContext<"/api/deploy/[id]">) {
  const { id } = await ctx.params;
  const prod = new URL(req.url).searchParams.get("prod") === "1";
  const [project, stored, intake, direction] = await Promise.all([getProject(id), getSpec(id), getIntake(id), getDirection(id)]);
  // Re-apply the intake so photo rights changed since generation are current.
  const spec = stored && intake ? applyIntake(stored, intake, direction) : stored;
  if (!project || !spec) return Response.json({ error: "Generate the site before deploying" }, { status: 404 });

  // Live sites may only use images the client has confirmed in writing.
  if (prod) {
    const records = intake ? [...intake.images, ...(intake.logo ? [intake.logo] : [])] : [];
    const blocked = collectAssets(spec).flatMap((asset) => {
      const rec = records.find((r) => `/${r.path}` === asset);
      return !rec || rec.rights_status !== "client_confirmed" ? [`${asset} (${rec?.rights_status ?? "unknown rights"})`] : [];
    });
    if (blocked.length) {
      return Response.json(
        {
          error: `Production deploy blocked: these images aren't client_confirmed:\n${blocked.join("\n")}\nUse Preview deploy for the demo, or set rights_status to "client_confirmed" in data/projects/${id}/intake.json once the owner confirms in writing, then deploy again.`,
        },
        { status: 409 },
      );
    }
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const log = (text: string) => controller.enqueue(encoder.encode(text));
      try {
        const exportPath = await writeExport(spec, projectDir(id), direction);
        log(`Exported to ${exportPath}\nRunning vercel deploy${prod ? " --prod" : ""}…\n`);
        const url = await deploy(exportPath, prod, log);
        await updateProject(id, {
          exportPath,
          deployments: [{ url, prod, createdAt: new Date().toISOString() }, ...project.deployments],
        });
        log(`\n__DEPLOYED__ ${url}\n`);
      } catch (error) {
        log(`\n__FAILED__ ${error instanceof Error ? error.message : String(error)}\n`);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
