import { z } from "zod";
import { linkSchema } from "../_shared/schemas";

export const navbarProps = z.object({
  brand: z.string(),
  links: z.array(linkSchema).describe("2-5 anchor links to sections on the page"),
  phone: z.string().optional().describe("Shown as tap-to-call; include for local service businesses"),
  cta: linkSchema.optional(),
  logo: z.object({ src: z.string(), alt: z.string() }).optional().describe("Set by the app. Omit."),
});

export type NavbarProps = z.infer<typeof navbarProps>;
