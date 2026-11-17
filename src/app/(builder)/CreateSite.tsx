"use client";

import { useState } from "react";
import { BusinessForm } from "./BusinessForm";
import { NewProjectForm } from "./NewProjectForm";

const MODES = [
  { id: "business", label: "From Google Business Profile" },
  { id: "prompt", label: "Describe it" },
] as const;

export function CreateSite() {
  const [mode, setMode] = useState<(typeof MODES)[number]["id"]>("business");
  return (
    <div className="mt-10">
      <div role="tablist" className="inline-flex rounded-lg bg-zinc-200/70 p-1 text-sm">
        {MODES.map((m) => (
          <button
            key={m.id}
            role="tab"
            aria-selected={mode === m.id}
            onClick={() => setMode(m.id)}
            className={`rounded-md px-3 py-1.5 ${mode === m.id ? "bg-white font-medium shadow-sm" : "text-zinc-600"}`}
          >
            {m.label}
          </button>
        ))}
      </div>
      {mode === "business" ? <BusinessForm /> : <NewProjectForm />}
    </div>
  );
}
