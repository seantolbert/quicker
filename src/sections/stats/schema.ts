import { z } from "zod";

export const statsProps = z.object({
  heading: z.string().optional(),
  items: z.array(z.object({ value: z.string(), label: z.string() })).describe("2-4 figures"),
  placeholder: z
    .boolean()
    .describe("true unless every figure was given in the prompt. Placeholder figures are visibly marked."),
});

export type StatsProps = z.infer<typeof statsProps>;
