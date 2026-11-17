import { z } from "zod";
import { linkSchema, mediaSchema } from "../_shared/schemas";

export const heroProps = z.object({
  eyebrow: z.string().optional().describe("Short context line: location, category, or credential"),
  headline: z.string().describe("A specific fact or outcome this business can back up. No filler."),
  subheadline: z.string(),
  primaryCta: linkSchema,
  secondaryCta: linkSchema.optional(),
  media: mediaSchema,
  compareMedia: mediaSchema
    .optional()
    .describe("Second photo for a before/after reveal (media = before, compareMedia = after). Only with the before-after concept."),
  proof: z.string().optional().describe("One short proof line, e.g. 'Licensed and insured since 2014'. Only if stated in the prompt."),
});

export type HeroProps = z.infer<typeof heroProps>;
