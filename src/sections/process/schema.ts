import { z } from "zod";

export const processProps = z.object({
  eyebrow: z.string().optional(),
  heading: z.string(),
  intro: z.string().optional(),
  steps: z.array(z.object({ title: z.string(), body: z.string() })).describe("2-5 steps a customer goes through, in order"),
});

export type ProcessProps = z.infer<typeof processProps>;
