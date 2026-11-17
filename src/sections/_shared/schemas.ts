import { z } from "zod";

export const linkSchema = z.object({
  label: z.string().describe("Says what happens next, e.g. 'Book a walk', not 'Learn more'"),
  href: z.string().describe("'#<section-id>' to jump to a section, 'tel:', 'mailto:', or a URL"),
});

export const mediaSchema = z.object({
  alt: z.string().describe("Describes the specific photo shown (or the real photo that belongs here)"),
  note: z.string().optional().describe("Optional visible caption"),
  photo: z.string().optional().describe("ID of a supplied business photo, e.g. 'photo-3'. Omit when no photos were supplied."),
  src: z.string().optional().describe("Set by the app. Omit."),
  // App-set fields are plain strings so a model that fills them anyway can't fail validation; the app overwrites them.
  rights: z.string().optional().describe("Set by the app. Omit."),
  credit: z.string().optional().describe("Set by the app. Omit."),
});
