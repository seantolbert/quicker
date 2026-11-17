import { randomUUID } from "node:crypto";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Direction, Intake } from "@/lib/intake/types";
import type { StoredSpec } from "@/spec/schema";

/**
 * Local file store. One folder per project:
 *   data/projects/<id>/project.json   metadata
 *   data/projects/<id>/prompt.txt     the original prompt
 *   data/projects/<id>/spec.json      current site spec
 *   data/projects/<id>/versions/      every generated spec, timestamped
 *   data/projects/<id>/intake.json    business facts (Google Business Profile projects)
 *   data/projects/<id>/direction.json trade design direction
 *   data/projects/<id>/photos|brand/  downloaded images
 */
const ROOT = path.join(process.cwd(), "data", "projects");

export type Deployment = { url: string; prod: boolean; createdAt: string };

export type Project = {
  id: string;
  name: string;
  prompt: string;
  status: "new" | "generating" | "ready" | "error";
  /** Set for projects started from a Google Business Profile. */
  placeId?: string;
  error?: string;
  createdAt: string;
  updatedAt: string;
  exportPath?: string;
  deployments: Deployment[];
};

export const projectDir = (id: string) => {
  if (!/^[\w-]+$/.test(id)) throw new Error(`Invalid project id: ${id}`);
  return path.join(ROOT, id);
};

async function readJson<T>(file: string): Promise<T | null> {
  try {
    return JSON.parse(await readFile(file, "utf8")) as T;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw err;
  }
}

const writeJson = (file: string, data: unknown) => writeFile(file, JSON.stringify(data, null, 2) + "\n");

export async function createProject(prompt: string, extra: { name?: string; placeId?: string } = {}): Promise<Project> {
  const id = randomUUID().slice(0, 8);
  const now = new Date().toISOString();
  const project: Project = {
    id,
    name: extra.name ?? prompt.slice(0, 60),
    prompt,
    placeId: extra.placeId,
    status: "new",
    createdAt: now,
    updatedAt: now,
    deployments: [],
  };
  await mkdir(path.join(projectDir(id), "versions"), { recursive: true });
  await writeFile(path.join(projectDir(id), "prompt.txt"), prompt + "\n");
  await writeJson(path.join(projectDir(id), "project.json"), project);
  return project;
}

export const getProject = (id: string) => readJson<Project>(path.join(projectDir(id), "project.json"));

export const getSpec = (id: string) => readJson<StoredSpec>(path.join(projectDir(id), "spec.json"));

export const getIntake = (id: string) => readJson<Intake>(path.join(projectDir(id), "intake.json"));

export const getDirection = (id: string) => readJson<Direction>(path.join(projectDir(id), "direction.json"));

export async function updateProject(id: string, patch: Partial<Omit<Project, "id">>) {
  const project = await getProject(id);
  if (!project) throw new Error(`Project not found: ${id}`);
  const next = { ...project, ...patch, updatedAt: new Date().toISOString() };
  await writeJson(path.join(projectDir(id), "project.json"), next);
  return next;
}

export async function saveSpec(id: string, spec: StoredSpec) {
  await writeJson(path.join(projectDir(id), "spec.json"), spec);
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  await writeJson(path.join(projectDir(id), "versions", `${stamp}.json`), spec);
  await updateProject(id, { name: spec.meta.name, status: "ready", error: undefined });
}

export async function listProjects(): Promise<Project[]> {
  const ids = await readdir(ROOT).catch(() => [] as string[]);
  const projects = await Promise.all(ids.map((id) => getProject(id).catch(() => null)));
  return projects
    .filter((p): p is Project => p !== null)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}
