import { z } from "zod";

export const featuresProps = z.object({
  eyebrow: z.string().optional(),
  heading: z.string(),
  intro: z.string().optional(),
  items: z
    .array(z.object({ title: z.string(), body: z.string().describe("1-3 concrete sentences") }))
    .describe("2-6 services, features, or reasons. Each must be specific to this business."),
});

export type FeaturesProps = z.infer<typeof featuresProps>;
