import { readFile } from "node:fs/promises";
import path from "node:path";
import { projectDir } from "@/lib/store";

const TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
};

/** Serves a project's downloaded photos and brand files to the builder preview. */
export async function GET(_req: Request, ctx: RouteContext<"/api/projects/[id]/files/[...path]">) {
  const { id, path: parts } = await ctx.params;
  const [folder, file, ...rest] = parts;
  if (rest.length || !["photos", "brand"].includes(folder) || !/^[\w.-]+$/.test(file ?? "") || file.startsWith(".")) {
    return new Response("Not found", { status: 404 });
  }
  const type = TYPES[path.extname(file).toLowerCase()];
  const data = type ? await readFile(path.join(projectDir(id), folder, file)).catch(() => null) : null;
  if (!data) return new Response("Not found", { status: 404 });
  return new Response(data, {
    headers: {
      "Content-Type": type,
      "Cache-Control": "private, max-age=3600",
      // SVGs from third-party sites must not run scripts.
      "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox",
    },
  });
}
