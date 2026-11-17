import type { ComponentType } from "react";
import type { z } from "zod";
import type { ConceptId, Effect } from "./_motion/vocabulary";
import type { SectionProps } from "./labels";

/**
 * A registry entry. Builder-only: exported sites get the component and schema
 * files, not this definition.
 */
export type SectionDefinition<
  T extends string = string,
  V extends string = string,
  S extends z.ZodType = z.ZodType,
> = {
  type: T;
  label: string;
  /** When the generator should use this section. Goes into the prompt catalog. */
  description: string;
  variants: { [K in V]: string };
  props: S;
  /** Component labels without the type prefix: "headline" → "hero.headline". */
  components: readonly string[];
  /** data-motion effects this section can render (checked by tests, listed in the manifest). */
  motion: readonly Effect[];
  /** Signature concepts whose markup this section renders. */
  concepts?: readonly ConceptId[];
  /** Component file name inside the section folder, e.g. "Hero.tsx". */
  file: string;
  /** Props type name exported from the section's schema.ts. */
  propsType: string;
  Component: ComponentType<SectionProps<z.infer<S>, V>>;
};

export function defineSection<T extends string, V extends string, S extends z.ZodType>(
  def: SectionDefinition<T, V, S>,
) {
  return def;
}
