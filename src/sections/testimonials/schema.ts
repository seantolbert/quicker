import { z } from "zod";

export const testimonialsProps = z.object({
  heading: z.string(),
  items: z
    .array(
      z.object({
        quote: z.string(),
        name: z.string().describe("First name and last initial"),
        context: z.string().optional().describe("e.g. 'Homeowner, East Austin'"),
        rating: z.number().int().min(1).max(5).optional(),
        source: z.string().optional().describe("Where the review came from, e.g. 'Google'"),
        authorUrl: z.string().optional().describe("Set by the app. Omit."),
        sourceUrl: z.string().optional().describe("Set by the app. Omit."),
      }),
    )
    .describe("1-3 quotes"),
  placeholder: z
    .boolean()
    .describe("true unless the prompt supplied these exact reviews. Never invent reviews and present them as real."),
});

export type TestimonialsProps = z.infer<typeof testimonialsProps>;
