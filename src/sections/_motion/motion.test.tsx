import type { ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { fixtureSpec } from "@/spec/fixture";
import type { SectionProps } from "../labels";
import { registry } from "../registry";
import { CONCEPT_IDS, EFFECTS } from "./vocabulary";
import { readFileSync } from "node:fs";
import path from "node:path";

const photo = { alt: "Photo", src: "/photos/photo-1.jpg", rights: "sample_only" };
const sample = (type: string) => {
  const s = fixtureSpec.sections.find((x) => x.type === type)!;
  return type === "hero" ? { ...s.props, media: photo, compareMedia: photo } : s.props;
};
const render = (type: string, variant: string, concept: (typeof CONCEPT_IDS)[number]) => {
  const def = registry.find((d) => d.type === type)!;
  const Component = def.Component as ComponentType<SectionProps<unknown>>;
  return renderToStaticMarkup(<Component id={`${type}-1`} variant={variant} props={sample(type)} concept={concept} />);
};
const values = (html: string, attr: string) => [...html.matchAll(new RegExp(`${attr}="([^"]+)"`, "g"))].map((m) => m[1]);

describe("motion vocabulary contract", () => {
  for (const def of registry) {
    for (const variant of Object.keys(def.variants)) {
      it(`${def.type}/${variant} only uses declared effects and the page's own concept`, () => {
        for (const concept of CONCEPT_IDS) {
          const html = render(def.type, variant, concept);
          const motions = values(html, "data-motion");
          expect(motions.filter((m) => !(m in EFFECTS))).toEqual([]);
          expect(motions.filter((m) => !(def.motion as readonly string[]).includes(m))).toEqual([]);
          const concepts = values(html, "data-concept");
          expect(concepts.filter((c) => c !== concept)).toEqual([]);
          if (concepts.length) expect(def.concepts ?? [], `${def.type} must declare ${concept}`).toContain(concept);
        }
      });
    }
  }

  it("hero text never animates", () => {
    for (const variant of ["split", "stacked", "fullbleed"]) {
      const motions = values(render("hero", variant, "none"), "data-motion");
      expect(motions.every((m) => m === "mask" || m === "parallax"), variant).toBe(true);
    }
  });

  it("every concept other than page-level ones renders markup somewhere", () => {
    const pageLevel = new Set(["none", "layer-stack", "close-up", "ledger-rule"]);
    for (const concept of CONCEPT_IDS.filter((c) => !pageLevel.has(c))) {
      const rendered = registry.some((def) =>
        Object.keys(def.variants).some((v) => values(render(def.type, v, concept), "data-concept").includes(concept)),
      );
      expect(rendered, concept).toBe(true);
    }
  });

  it("every concept has an implementation in the runtime", () => {
    const runtime = readFileSync(path.join(__dirname, "runtime.ts"), "utf8");
    for (const concept of CONCEPT_IDS) expect(runtime, concept).toContain(`case "${concept}":`);
  });

  it("no tween runs longer than 800 ms", () => {
    const runtime = readFileSync(path.join(__dirname, "runtime.ts"), "utf8");
    const durations = [...runtime.matchAll(/duration: (\d+(?:\.\d+)?)/g)].map((m) => Number(m[1]));
    expect(durations.length).toBeGreaterThan(5);
    expect(Math.max(...durations)).toBeLessThanOrEqual(0.8);
  });
});
