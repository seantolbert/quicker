import { defineSection } from "../define";
import { Cta } from "./Cta";
import { ctaProps } from "./schema";

export default defineSection({
  type: "cta",
  label: "Call to action",
  description: "Inverted closing band that repeats the primary action. Usually just before contact or footer.",
  variants: { band: "Full-width inverted band, heading left, action right." },
  props: ctaProps,
  components: ["heading", "body", "primary", "secondary"],
  motion: ["reveal-group"],
  file: "Cta.tsx",
  propsType: "CtaProps",
  Component: Cta,
});
