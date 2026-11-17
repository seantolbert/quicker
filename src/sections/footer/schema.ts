import { z } from "zod";
import { linkSchema } from "../_shared/schemas";

export const footerProps = z.object({
  brand: z.string(),
  tagline: z.string().optional(),
  columns: z.array(z.object({ heading: z.string(), links: z.array(linkSchema) })).describe("0-3 link columns"),
  legal: z.string().describe("e.g. '© 2026 Business Name'"),
});

export type FooterProps = z.infer<typeof footerProps>;
