import type { ConceptId } from "./_motion/vocabulary";

/**
 * The labeling contract. Every section root and every meaningful element
 * inside it carries data-* attributes so agents can target them by ID:
 *
 *   [data-section-id="hero-1"]                       one section instance
 *   [data-section="pricing"]                          every section of a type
 *   [data-section-id="pricing-1"] [data-component="pricing.tier"][data-index="1"]
 *
 * Component names are always "<section type>.<component>" and must be listed
 * in that section's registry entry.
 */

export type SectionProps<P, V extends string = string> = {
  id: string;
  variant: V;
  props: P;
  /** The page's signature motion concept; sections render its decorative markup when it applies to them. */
  concept?: ConceptId;
};

export function sectionAttrs(id: string, type: string, variant: string, label: string) {
  return {
    id,
    "data-section": type,
    "data-section-id": id,
    "data-variant": variant,
    "aria-label": label,
  } as const;
}

export function cmp(name: string, index?: number) {
  return index === undefined
    ? { "data-component": name }
    : { "data-component": name, "data-index": index };
}
