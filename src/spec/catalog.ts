import { CONCEPTS } from "@/sections/_motion/vocabulary";
import { registry } from "@/sections/registry";

/** Prompt-ready description of the section library. The full prop schemas travel with the output schema. */
export function sectionCatalog() {
  return registry
    .map((def) => {
      const variants = Object.entries(def.variants as Record<string, string>)
        .map(([name, desc]) => `    - ${name}: ${desc}`)
        .join("\n");
      return `- ${def.type} (${def.label}): ${def.description}\n  variants:\n${variants}`;
    })
    .join("\n");
}

/** Prompt-ready list of signature motion concepts. */
export function conceptCatalog() {
  return Object.entries(CONCEPTS)
    .map(([id, desc]) => `- ${id}: ${desc}`)
    .join("\n");
}
