"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const EXAMPLES = [
  "Dog-walking business in East Austin run by Maya. Solo walks $28, group walks $18, puppy visits. Insured, 6 years in business. Phone (512) 555-0143.",
  "Landing page for Ledgerline, a bookkeeping app for freelance designers that turns bank feeds into quarterly tax estimates. Free plan and $12/month Pro.",
];

export function NewProjectForm() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Could not create project");
      setPending(false);
      return;
    }
    router.push(`/p/${data.id}`);
  }

  return (
    <form onSubmit={create} className="mt-6">
      <label htmlFor="prompt" className="sr-only">
        Describe your site
      </label>
      <textarea
        id="prompt"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) e.currentTarget.form?.requestSubmit();
        }}
        rows={5}
        placeholder="Who is it for, what do they offer, what should visitors do? Include real details: prices, phone, location."
        className="w-full resize-y rounded-lg border border-zinc-300 bg-white p-4 text-base shadow-sm outline-none focus:border-zinc-900"
      />
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending || !prompt.trim()}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
        >
          {pending ? "Creating…" : "Generate site"}
        </button>
        <span className="text-xs text-zinc-500">⌘↵</span>
        {error ? <span className="text-sm text-red-600">{error}</span> : null}
      </div>
      <div className="mt-6 space-y-2">
        <p className="text-xs font-medium text-zinc-500">Try</p>
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => setPrompt(ex)}
            className="block w-full rounded-md border border-dashed border-zinc-300 p-3 text-left text-sm text-zinc-600 hover:border-zinc-500"
          >
            {ex}
          </button>
        ))}
      </div>
    </form>
  );
}
