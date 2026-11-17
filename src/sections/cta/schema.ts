import { z } from "zod";
import { linkSchema } from "../_shared/schemas";

export const ctaProps = z.object({
  heading: z.string(),
  body: z.string().optional(),
  primaryCta: linkSchema,
  secondaryCta: linkSchema.optional(),
});

export type CtaProps = z.infer<typeof ctaProps>;
