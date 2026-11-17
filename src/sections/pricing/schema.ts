import { z } from "zod";
import { linkSchema } from "../_shared/schemas";

export const pricingProps = z.object({
  eyebrow: z.string().optional(),
  heading: z.string(),
  intro: z.string().optional(),
  tiers: z
    .array(
      z.object({
        name: z.string(),
        price: z.string().describe("e.g. '$25', 'From $120', 'Custom'"),
        period: z.string().optional().describe("e.g. 'per walk', '/month'"),
        description: z.string(),
        features: z.array(z.string()),
        cta: linkSchema,
        featured: z.boolean().describe("At most one tier is featured"),
      }),
    )
    .describe("1-3 tiers"),
  note: z.string().optional().describe("Fine print under the tiers"),
});

export type PricingProps = z.infer<typeof pricingProps>;
