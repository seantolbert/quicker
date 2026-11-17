"use client";

import { useEffect, useRef } from "react";
import { startMotion } from "./runtime";
import type { ConceptId } from "./vocabulary";

/**
 * The page's single motion provider: Lenis smooth scroll plus GSAP
 * ScrollTrigger, registered once. Wrap the site in it from the root layout.
 * `version` re-initializes after the content changes; `disabled` keeps the
 * page static.
 */
export function MotionRoot({
  concept = "none",
  version,
  disabled = false,
  children,
}: {
  concept?: ConceptId;
  version?: string | number;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (disabled || !ref.current) return;
    return startMotion(ref.current, concept);
  }, [concept, version, disabled]);
  return (
    <div ref={ref} data-motion-root={disabled ? "off" : concept}>
      {children}
    </div>
  );
}
