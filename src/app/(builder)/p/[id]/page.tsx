import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getDirection, getIntake, getProject, getSpec } from "@/lib/store";
import { Builder } from "./Builder";

export default function ProjectPage({ params }: PageProps<"/p/[id]">) {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-zinc-500">Loading…</p>}>
      <Project params={params} />
    </Suspense>
  );
}

async function Project({ params }: Pick<PageProps<"/p/[id]">, "params">) {
  const { id } = await params;
  const [project, spec, intake, direction] = await Promise.all([getProject(id), getSpec(id), getIntake(id), getDirection(id)]);
  if (!project) notFound();
  return <Builder initialProject={project} initialSpec={spec} intake={intake} direction={direction} />;
}
