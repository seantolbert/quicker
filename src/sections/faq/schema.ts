import { z } from "zod";

export const faqProps = z.object({
  heading: z.string(),
  intro: z.string().optional(),
  items: z.array(z.object({ question: z.string(), answer: z.string() })).describe("3-6 questions real customers ask"),
});

export type FaqProps = z.infer<typeof faqProps>;
