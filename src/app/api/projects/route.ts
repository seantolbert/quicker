import { createProject } from "@/lib/store";

export async function POST(req: Request) {
  const { prompt } = (await req.json()) as { prompt?: string };
  if (!prompt?.trim()) return Response.json({ error: "Prompt is required" }, { status: 400 });
  const project = await createProject(prompt.trim());
  return Response.json({ id: project.id });
}
