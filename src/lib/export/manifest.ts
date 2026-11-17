import { z } from "zod";
import { CONCEPTS, EFFECTS } from "@/sections/_motion/vocabulary";
import { sectionsByType } from "@/sections/registry";
import type { StoredSpec } from "@/spec/schema";

export const SECTIONS_DIR = "src/components/sections";

export function componentName(file: string) {
  return file.replace(/\.tsx$/, "");
}

/** Effects a section declares, and whether it renders the page's concept. */
function motionUses(section: StoredSpec["sections"][number], concept: keyof typeof CONCEPTS) {
  const def = sectionsByType[section.type];
  return { effects: [...def.motion], concept: (def.concepts as readonly string[] | undefined)?.includes(concept) ?? false };
}

export function buildManifest(spec: StoredSpec) {
  const types = [...new Set(spec.sections.map((s) => s.type))];
  const concept = spec.motion?.concept ?? "none";
  return {
    version: 1 as const,
    generatedBy: "quicker",
    name: spec.meta.name,
    slug: spec.slug,
    attributes: {
      section: "data-section",
      sectionId: "data-section-id",
      variant: "data-variant",
      component: "data-component",
      index: "data-index",
    },
    theme: spec.theme,
    motion: {
      concept,
      description: CONCEPTS[concept],
      direction: `intake/${spec.slug}.direction.json`,
      runtime: `${SECTIONS_DIR}/_motion/MotionRoot.tsx`,
      runsWhen: "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
      effects: EFFECTS,
    },
    sections: spec.sections.map((s) => {
      const def = sectionsByType[s.type];
      return {
        motion: motionUses(s, concept),
        id: s.id,
        type: s.type,
        label: def.label,
        variant: s.variant,
        selector: `[data-section-id="${s.id}"]`,
        component: `${SECTIONS_DIR}/${s.type}/${def.file}`,
        schema: `${SECTIONS_DIR}/${s.type}/schema.ts`,
        content: `src/content/site.ts → sections["${s.id}"]`,
        components: def.components.map((c) => `${s.type}.${c}`),
      };
    }),
    propSchemas: Object.fromEntries(types.map((t) => [t, z.toJSONSchema(sectionsByType[t].props)])),
  };
}

export type Manifest = ReturnType<typeof buildManifest>;
