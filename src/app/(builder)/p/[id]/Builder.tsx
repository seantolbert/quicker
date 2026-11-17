"use client";

import { useObject } from "@ai-sdk/react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { OutgoingMessage, PreviewMessage } from "@/components/preview-messages";
import type { Direction, Intake } from "@/lib/intake/types";
import type { Project } from "@/lib/store";
import { sectionsByType } from "@/sections/registry";
import { siteSpecSchema, type StoredSpec } from "@/spec/schema";

type Device = "desktop" | "mobile";

/**
 * While the model streams, photo IDs ("photo-3") aren't resolved yet; map them
 * to their files so photos show up live. The saved spec is resolved server-side.
 */
function resolvePhotos<T>(spec: T, intake: Intake | null): T {
  if (!intake || !spec) return spec;
  const paths = new Map(intake.images.map((i) => [i.id, `/${i.path}`]));
  return JSON.parse(JSON.stringify(spec), (_key, value) => {
    if (value && typeof value === "object" && typeof value.photo === "string" && paths.has(value.photo)) {
      return { ...value, src: paths.get(value.photo) };
    }
    return value;
  });
}

export function Builder({
  initialProject,
  initialSpec,
  intake,
  direction,
}: {
  initialProject: Project;
  initialSpec: StoredSpec | null;
  intake: Intake | null;
  direction: Direction | null;
}) {
  const [project, setProject] = useState(initialProject);
  const [spec, setSpec] = useState(initialSpec);
  const [device, setDevice] = useState<Device>("desktop");
  const [labels, setLabels] = useState(false);
  const [motionOn, setMotionOn] = useState(true);
  const [log, setLog] = useState<string | null>(null);
  const [busy, setBusy] = useState<null | "export" | "deploy">(null);
  const frame = useRef<HTMLIFrameElement>(null);

  const refresh = useCallback(async () => {
    // The server saves the normalized spec just after the stream closes.
    for (let i = 0; i < 40; i++) {
      const res = await fetch(`/api/projects/${project.id}`);
      const data = (await res.json()) as { project: Project; spec: StoredSpec | null };
      if (data.project.status !== "generating") {
        setProject(data.project);
        setSpec(data.spec);
        return;
      }
      await new Promise((r) => setTimeout(r, 500));
    }
  }, [project.id]);

  const { object, submit, isLoading, error, stop } = useObject({
    api: "/api/generate",
    schema: siteSpecSchema,
    onFinish: () => void refresh(),
  });

  // Start generating as soon as a new project opens.
  const started = useRef(false);
  useEffect(() => {
    if (started.current || initialSpec || initialProject.status !== "new") return;
    started.current = true;
    submit({ projectId: initialProject.id });
  }, [initialProject, initialSpec, submit]);

  const streamed = useMemo(() => resolvePhotos(object, intake), [object, intake]);
  const live = isLoading ? streamed : spec;

  const post = useCallback((msg: OutgoingMessage) => {
    frame.current?.contentWindow?.postMessage({ source: "quicker", ...msg }, window.location.origin);
  }, []);

  // Keep the iframe in sync, including after it (re)loads and says "ready".
  const latest = useRef({ live, isLoading, labels, motionOn });
  useEffect(() => {
    latest.current = { live, isLoading, labels, motionOn };
    post({ type: "spec", spec: live ?? null, streaming: isLoading });
  }, [live, isLoading, labels, motionOn, post]);
  useEffect(() => post({ type: "labels", on: labels }), [labels, post]);
  useEffect(() => post({ type: "motion", on: motionOn }), [motionOn, post]);
  useEffect(() => {
    function onMessage(e: MessageEvent<PreviewMessage>) {
      if (e.origin !== window.location.origin || e.data?.source !== "quicker" || e.data.type !== "ready") return;
      const { live, isLoading, labels, motionOn } = latest.current;
      post({ type: "spec", spec: live ?? null, streaming: isLoading });
      post({ type: "labels", on: labels });
      post({ type: "motion", on: motionOn });
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [post]);

  async function exportSite() {
    setBusy("export");
    const res = await fetch(`/api/export/${project.id}`, { method: "POST" });
    const data = await res.json();
    setLog(res.ok ? `Exported to ${data.path}\n\ncd "${data.path}" && npm install && npm run dev` : data.error);
    setBusy(null);
  }

  async function deploySite(prod: boolean) {
    setBusy("deploy");
    setLog("");
    const res = await fetch(`/api/deploy/${project.id}${prod ? "?prod=1" : ""}`, { method: "POST" });
    if (!res.ok || !res.body) {
      setLog((await res.json().catch(() => ({ error: res.statusText }))).error);
      setBusy(null);
      return;
    }
    const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      setLog((l) => (l ?? "") + value);
    }
    setBusy(null);
    void refresh();
  }

  const sections = (live?.sections ?? []).filter((s) => s?.type);
  const failed = project.status === "error" && !isLoading;

  return (
    <div className="grid h-screen grid-cols-[320px_1fr] bg-zinc-100">
      <aside className="flex min-h-0 flex-col border-r border-zinc-200 bg-white">
        <div className="border-b border-zinc-200 p-4">
          <Link href="/" className="text-xs font-medium text-zinc-500 hover:text-zinc-900">
            ← Projects
          </Link>
          <h1 className="mt-2 font-semibold leading-snug">{live?.meta?.name ?? project.name}</h1>
          {intake ? <BusinessCard intake={intake} direction={direction} /> : null}
          {project.prompt ? (
            <p className="mt-2 line-clamp-4 text-sm text-zinc-600">
              {intake ? <span className="font-medium text-zinc-900">Notes: </span> : null}
              {project.prompt}
            </p>
          ) : null}
          <div className="mt-3 flex gap-2">
            {isLoading ? (
              <button onClick={stop} className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm">
                Stop
              </button>
            ) : (
              <button
                onClick={() => submit({ projectId: project.id })}
                className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:border-zinc-900"
              >
                {spec ? "Regenerate" : "Generate"}
              </button>
            )}
          </div>
          {error || failed ? (
            <p className="mt-3 text-sm text-red-600">{error?.message ?? project.error ?? "Generation failed"}</p>
          ) : null}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <div className="flex items-baseline justify-between">
            <h2 className="text-xs font-medium uppercase tracking-wider text-zinc-500">Sections</h2>
            {isLoading ? <span className="text-xs text-zinc-500">streaming…</span> : null}
          </div>
          <ol className="mt-3 space-y-1">
            {sections.map((s, i) => {
              const def = sectionsByType[s!.type as keyof typeof sectionsByType];
              return (
                <li key={i}>
                  <button
                    onClick={() => s?.id && post({ type: "highlight", id: s.id })}
                    className="w-full rounded-md px-2 py-1.5 text-left hover:bg-zinc-100"
                  >
                    <span className="block text-sm font-medium">{def?.label ?? s?.type}</span>
                    <span className="block font-mono text-xs text-zinc-500">
                      {s?.id ?? "…"} · {s?.variant ?? "…"}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="space-y-2 border-t border-zinc-200 p-4">
          <div className="grid grid-cols-3 gap-2">
            <button
              disabled={!spec || isLoading || busy !== null}
              onClick={exportSite}
              className="rounded-md border border-zinc-300 px-2 py-1.5 text-sm disabled:opacity-40"
            >
              {busy === "export" ? "…" : "Export"}
            </button>
            <button
              disabled={!spec || isLoading || busy !== null}
              onClick={() => deploySite(false)}
              className="rounded-md border border-zinc-300 px-2 py-1.5 text-sm disabled:opacity-40"
            >
              Preview
            </button>
            <button
              disabled={!spec || isLoading || busy !== null}
              onClick={() => deploySite(true)}
              className="rounded-md bg-zinc-900 px-2 py-1.5 text-sm text-white disabled:opacity-40"
            >
              {busy === "deploy" ? "Deploying…" : "Deploy"}
            </button>
          </div>
          {project.deployments[0] ? (
            <a
              href={project.deployments[0].url}
              target="_blank"
              rel="noreferrer"
              className="block truncate text-xs text-blue-700 underline"
            >
              {project.deployments[0].url}
            </a>
          ) : null}
          {log !== null ? (
            <pre className="max-h-48 overflow-auto whitespace-pre-wrap rounded-md bg-zinc-950 p-3 font-mono text-[11px] leading-relaxed text-zinc-100">
              {log || "…"}
            </pre>
          ) : null}
        </div>
      </aside>

      <section className="flex min-h-0 flex-col">
        <div className="flex items-center gap-2 border-b border-zinc-200 bg-white px-4 py-2 text-sm">
          {(["desktop", "mobile"] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDevice(d)}
              className={`rounded-md px-3 py-1 capitalize ${device === d ? "bg-zinc-900 text-white" : "hover:bg-zinc-100"}`}
            >
              {d}
            </button>
          ))}
          <label className="ml-4 flex items-center gap-2">
            <input type="checkbox" checked={labels} onChange={(e) => setLabels(e.target.checked)} />
            Show labels
          </label>
          <label className="flex items-center gap-2" title="Off shows what mobile and reduced-motion visitors get">
            <input type="checkbox" checked={motionOn} onChange={(e) => setMotionOn(e.target.checked)} />
            Motion
            {live?.motion?.concept && live.motion.concept !== "none" ? (
              <span className="font-mono text-xs text-zinc-500">{live.motion.concept}</span>
            ) : null}
          </label>
          <a href={`/preview/${project.id}`} target="_blank" className="ml-auto text-zinc-500 hover:text-zinc-900">
            Open preview ↗
          </a>
        </div>
        <div className="flex min-h-0 flex-1 justify-center overflow-auto p-4">
          <iframe
            ref={frame}
            src={`/preview/${project.id}`}
            title="Site preview"
            className="h-full rounded-md border border-zinc-200 bg-white shadow-sm transition-[width]"
            style={{ width: device === "mobile" ? 390 : "100%" }}
          />
        </div>
      </section>
    </div>
  );
}

function BusinessCard({ intake, direction }: { intake: Intake; direction: Direction | null }) {
  const b = intake.business;
  const questions = [...intake.open_questions, ...(direction?.open_questions ?? [])];
  return (
    <div className="mt-2 space-y-1 text-xs text-zinc-600">
      <p>
        From Google Business Profile
        {b.rating ? ` · ${b.rating}★ (${b.review_count ?? 0})` : ""}
        {` · ${intake.images.length} photos · ${intake.reviews.length} reviews`}
      </p>
      {direction ? (
        <p className="flex items-center gap-1.5">
          {direction.trade_label} direction
          {(["bg", "fg", "primary"] as const).map((k) => (
            <span
              key={k}
              title={`${k} ${direction.theme.palette[k]}`}
              className="inline-block size-3 rounded-full border border-zinc-300"
              style={{ background: direction.theme.palette[k] }}
            />
          ))}
        </p>
      ) : null}
      {questions.length ? (
        <details>
          <summary className="cursor-pointer text-amber-700">{questions.length} open questions</summary>
          <ul className="mt-1 list-disc space-y-1 pl-4">
            {questions.map((q, i) => (
              <li key={i}>{q}</li>
            ))}
          </ul>
        </details>
      ) : null}
    </div>
  );
}
