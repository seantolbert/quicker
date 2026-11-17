import { z } from "zod";
import { CONCEPT_IDS } from "@/sections/_motion/vocabulary";
import { registry } from "@/sections/registry";
import { themeSchema } from "./theme";

const sectionSchemas = registry.map((def) =>
  z.object({
    id: z.string().describe(`'${def.type}-1', '${def.type}-2', … Links point at '#<id>'.`),
    type: z.literal(def.type),
    variant: z.enum(Object.keys(def.variants) as [string, ...string[]]),
    props: def.props,
  }),
);

export const sectionSchema = z.discriminatedUnion(
  "type",
  sectionSchemas as unknown as [(typeof sectionSchemas)[number], ...(typeof sectionSchemas)[number][]],
);

export const siteSpecSchema = z.object({
  meta: z.object({
    name: z.string().describe("Business or product name"),
    description: z.string().describe("One sentence for the <meta> description"),
  }),
  theme: themeSchema,
  motion: z.object({
    concept: z.enum(CONCEPT_IDS).describe("The page's one signature scroll concept (see the Motion list)"),
  }),
  sections: z.array(sectionSchema).describe("Top-to-bottom order. navbar first, footer last."),
});

type Def = (typeof registry)[number];

/** One section, with props correlated to its type (so `switch (s.type)` narrows `s.props`). */
export type Section = {
  [D in Def as D["type"]]: {
    id: string;
    type: D["type"];
    variant: keyof D["variants"] & string;
    props: z.infer<D["props"]>;
  };
}[Def["type"]];

export type SiteSpec = Omit<z.infer<typeof siteSpecSchema>, "sections"> & { sections: Section[] };

/** A stored spec: generated spec plus fields the app owns. */
export type StoredSpec = SiteSpec & { version: 1; slug: string };
