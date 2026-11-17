"use client";

import { useEffect, useState } from "react";
import { conceptOf, SiteRenderer, type PartialSpec } from "@/components/SiteRenderer";
import { MotionRoot } from "@/sections/_motion/MotionRoot";
import type { StoredSpec } from "@/spec/schema";
import type { PreviewMessage } from "@/components/preview-messages";

/** Renders the saved spec, then follows live updates posted by the builder window. */
export function PreviewClient({ projectId, initial }: { projectId: string; initial: StoredSpec | null }) {
  const [spec, setSpec] = useState<PartialSpec | null>(initial);
  const [streaming, setStreaming] = useState(false);
  const [labels, setLabels] = useState(false);
  const [motionOn, setMotionOn] = useState(true);
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    function onMessage(e: MessageEvent<PreviewMessage>) {
      if (e.origin !== window.location.origin || e.data?.source !== "quicker") return;
      const msg = e.data;
      if (msg.type === "spec") {
        setSpec(msg.spec as PartialSpec | null);
        setStreaming(msg.streaming);
      } else if (msg.type === "labels") {
        setLabels(msg.on);
      } else if (msg.type === "motion") {
        setMotionOn(msg.on);
      } else if (msg.type === "highlight") {
        const el = document.querySelector(`[data-section-id="${CSS.escape(msg.id)}"]`);
        el?.scrollIntoView({ behavior: "smooth", block: "start" });
        el?.classList.add("q-flash");
        setTimeout(() => el?.classList.remove("q-flash"), 1200);
      }
    }
    window.addEventListener("message", onMessage);
    window.parent?.postMessage({ source: "quicker", type: "ready" }, window.location.origin);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("q-labels", labels);
  }, [labels]);

  return (
    <div
      onMouseOver={
        labels
          ? (e) => {
              const el = (e.target as HTMLElement).closest("[data-component]");
              const section = el?.closest("[data-section-id]")?.getAttribute("data-section-id");
              const index = el?.getAttribute("data-index");
              setHovered(el ? `${section} → ${el.getAttribute("data-component")}${index ? `[${index}]` : ""}` : null);
            }
          : undefined
      }
    >
      {/* Motion starts once the spec is final; while streaming the page stays static. */}
      <MotionRoot concept={conceptOf(spec)} version={streaming ? "streaming" : JSON.stringify(spec)} disabled={streaming || !motionOn}>
        <SiteRenderer spec={spec} streaming={streaming} assetBase={`/api/projects/${projectId}/files`} />
      </MotionRoot>
      {labels && hovered ? (
        <p className="pointer-events-none fixed bottom-4 left-4 z-50 rounded bg-black/85 px-3 py-1.5 font-mono text-xs text-white">
          {hovered}
        </p>
      ) : null}
    </div>
  );
}
