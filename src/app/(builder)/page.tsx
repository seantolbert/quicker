import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { listProjects } from "@/lib/store";
import { CreateSite } from "./CreateSite";

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-24">
      <h1 className="text-4xl font-semibold tracking-tight">Quicker</h1>
      <p className="mt-3 text-zinc-600">
        Paste a Google Business Profile link or describe a site. The site is built from real business data, and every section and
        component is labeled so an agent can edit it by ID.
      </p>
      <CreateSite />
      <Suspense fallback={<p className="mt-16 text-sm text-zinc-500">Loading projects…</p>}>
        <ProjectList />
      </Suspense>
    </main>
  );
}

async function ProjectList() {
  await connection();
  const projects = await listProjects();
  if (projects.length === 0) return null;
  return (
    <section className="mt-16">
      <h2 className="text-sm font-medium text-zinc-500">Projects</h2>
      <ul className="mt-4 divide-y divide-zinc-200 border-y border-zinc-200">
        {projects.map((p) => (
          <li key={p.id}>
            <Link href={`/p/${p.id}`} className="flex items-baseline justify-between gap-6 py-4 hover:bg-white">
              <span className="font-medium">{p.name}</span>
              <span className="shrink-0 text-xs text-zinc-500">
                {p.status === "ready" ? new Date(p.updatedAt).toLocaleDateString() : p.status}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
