"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Candidate, Direction, Intake } from "@/lib/intake/types";

type Stage =
  | { step: "input" }
  | { step: "pick"; candidates: Candidate[] }
  | { step: "intake"; name?: string }
  | { step: "review"; id: string; intake: Intake; direction: Direction };

async function post<T>(url: string, body: unknown, method = "POST"): Promise<T> {
  const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? res.statusText);
  return data as T;
}

/** Google Business Profile link → intake review → generate. */
export function BusinessForm() {
  const router = useRouter();
  const [link, setLink] = useState("");
  const [stage, setStage] = useState<Stage>({ step: "input" });
  const [picked, setPicked] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run<T>(fn: () => Promise<T>) {
    setBusy(true);
    setError(null);
    try {
      return await fn();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  async function intake(candidate: Candidate) {
    setStage({ step: "intake", name: candidate.name });
    const result = await run(() => post<{ id: string; intake: Intake; direction: Direction }>("/api/intake", { placeId: candidate.placeId }));
    setStage(result ? { step: "review", ...result } : { step: "input" });
  }

  async function lookUp(e: React.FormEvent) {
    e.preventDefault();
    const result = await run(() => post<{ candidates: Candidate[]; exact: boolean }>("/api/intake/resolve", { input: link }));
    if (!result) return;
    if (result.exact || result.candidates.length === 1) return intake(result.candidates[0]);
    setPicked(result.candidates[0].placeId);
    setStage({ step: "pick", candidates: result.candidates });
  }

  async function generate(id: string) {
    const ok = await run(() => post(`/api/projects/${id}`, { prompt: notes }, "PATCH"));
    if (ok) router.push(`/p/${id}`);
  }

  return (
    <div className="mt-6">
      {stage.step === "input" || stage.step === "pick" ? (
        <form onSubmit={lookUp} className="flex gap-2">
          <label htmlFor="gbp" className="sr-only">
            Google Business Profile or Maps link
          </label>
          <input
            id="gbp"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://maps.app.goo.gl/…  or  Business name, City"
            className="min-w-0 flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-3 text-base shadow-sm outline-none focus:border-zinc-900"
          />
          <button
            type="submit"
            disabled={busy || !link.trim()}
            className="rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white disabled:opacity-40"
          >
            {busy ? "Looking up…" : "Look up"}
          </button>
        </form>
      ) : null}

      {stage.step === "pick" ? (
        <fieldset className="mt-4 rounded-lg border border-zinc-200 bg-white p-4">
          <legend className="px-1 text-sm font-medium">Which business?</legend>
          {stage.candidates.map((c) => (
            <label key={c.placeId} className="flex cursor-pointer gap-3 rounded-md p-2 hover:bg-zinc-50">
              <input type="radio" name="place" checked={picked === c.placeId} onChange={() => setPicked(c.placeId)} />
              <span>
                <span className="block text-sm font-medium">{c.name}</span>
                <span className="block text-xs text-zinc-500">{c.address}</span>
              </span>
            </label>
          ))}
          <button
            onClick={() => intake(stage.candidates.find((c) => c.placeId === picked)!)}
            disabled={!picked || busy}
            className="mt-3 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
          >
            Use this business
          </button>
        </fieldset>
      ) : null}

      {stage.step === "intake" ? (
        <p className="mt-2 animate-pulse text-sm text-zinc-600">
          Reading {stage.name || "the business"}: Google listing, reviews, photos, website, logo colors…
        </p>
      ) : null}

      {stage.step === "review" ? (
        <IntakeReview
          id={stage.id}
          intake={stage.intake}
          direction={stage.direction}
          notes={notes}
          setNotes={setNotes}
          busy={busy}
          onGenerate={() => generate(stage.id)}
          onReset={() => setStage({ step: "input" })}
        />
      ) : null}

      {error ? <p className="mt-3 whitespace-pre-line text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

function IntakeReview({
  id,
  intake,
  direction,
  notes,
  setNotes,
  busy,
  onGenerate,
  onReset,
}: {
  id: string;
  intake: Intake;
  direction: Direction;
  notes: string;
  setNotes: (v: string) => void;
  busy: boolean;
  onGenerate: () => void;
  onReset: () => void;
}) {
  const b = intake.business;
  const file = (p: string) => `/api/projects/${id}/files/${p}`;
  const byRights = intake.images.reduce<Record<string, number>>((acc, i) => ({ ...acc, [i.rights_status]: (acc[i.rights_status] ?? 0) + 1 }), {});
  const questions = [...intake.open_questions, ...direction.open_questions];
  const p = direction.theme.palette;

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-4">
        {intake.logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={file(intake.logo.path)} alt="" className="size-14 rounded-md border border-zinc-200 object-contain p-1" />
        ) : null}
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold">{b.name}</h2>
          <p className="text-sm text-zinc-600">
            {[b.type_label, intake.contact.address].filter(Boolean).join(" · ")}
          </p>
          <p className="mt-1 text-sm text-zinc-600">
            {b.rating ? `${b.rating}★ · ${b.review_count} Google reviews · ` : ""}
            {intake.contact.phone ?? "no phone"} · {intake.contact.website ? new URL(intake.contact.website).hostname : "no website"}
          </p>
        </div>
        <button onClick={onReset} className="text-xs text-zinc-500 hover:text-zinc-900">
          Change
        </button>
      </div>

      {intake.images.length ? (
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {intake.images.map((img) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={img.id}
              src={file(img.path)}
              alt={img.id}
              title={`${img.id} · ${img.rights_status}`}
              className="h-20 w-28 shrink-0 rounded-md object-cover"
            />
          ))}
        </div>
      ) : null}

      <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-4">
        <Fact label="Reviews pulled" value={String(intake.reviews.length)} />
        <Fact label="Photos" value={Object.entries(byRights).map(([k, n]) => `${n} ${k.replace(/_/g, " ")}`).join(", ") || "none"} />
        <Fact label="Logo" value={intake.logo ? `found (${intake.colors.source === "logo" ? "colors extracted" : "no colors"})` : "not found"} />
        <Fact label="Trade" value={`${direction.trade_label}${direction.matched_by === "fallback" ? " (fallback)" : ""}`} />
      </dl>

      <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg p-3" style={{ background: p.bg, color: p.fg }}>
        {(["bg", "surface", "fg", "muted", "primary"] as const).map((k) => (
          <span key={k} className="flex items-center gap-1.5 text-xs">
            <span className="size-4 rounded-full border border-black/10" style={{ background: p[k] }} />
            {k}
          </span>
        ))}
        <span className="text-xs">
          {direction.theme.fonts.heading} / {direction.theme.fonts.body}
        </span>
        <span className="ml-auto rounded px-2 py-0.5 text-xs font-medium" style={{ background: p.primary, color: p.primaryFg }}>
          {direction.contrast.every((c) => c.pass) ? "Contrast AA: pass" : "Contrast: check"}
        </span>
      </div>

      {questions.length ? (
        <details className="mt-4 text-sm">
          <summary className="cursor-pointer font-medium text-amber-700">{questions.length} open questions</summary>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-zinc-600">
            {questions.map((q, i) => (
              <li key={i}>{q}</li>
            ))}
          </ul>
        </details>
      ) : null}

      <label htmlFor="notes" className="mt-5 block text-sm font-medium">
        Anything to add? <span className="font-normal text-zinc-500">Specials, what to emphasize, tone. Optional.</span>
      </label>
      <textarea
        id="notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={3}
        placeholder="e.g. Push the weekend brunch. Mention we cater. Keep it warm, not fancy."
        className="mt-2 w-full resize-y rounded-lg border border-zinc-300 p-3 text-sm outline-none focus:border-zinc-900"
      />
      <button
        onClick={onGenerate}
        disabled={busy}
        className="mt-3 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
      >
        Generate site
      </button>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-zinc-500">{label}</dt>
      <dd className="mt-0.5">{value}</dd>
    </div>
  );
}
