import { defineSection } from "../define";
import { Hero } from "./Hero";
import { heroProps } from "./schema";

export default defineSection({
  type: "hero",
  label: "Hero",
  description: "The first screen: specific headline, one primary action, photo slot. Exactly one, right after the navbar.",
  variants: {
    split: "Copy on 7 columns, photo on 5. Default.",
    stacked: "Large left-aligned headline with a wide photo below. For bold, editorial brands.",
    fullbleed: "A strong landscape photo fills the first screen; copy sits on a solid panel. Only with a real photo.",
  },
  props: heroProps,
  components: ["eyebrow", "headline", "subheadline", "cta.primary", "cta.secondary", "proof", "media", "compare"],
  motion: ["mask", "parallax"],
  concepts: ["vinyl-on", "before-after"],
  file: "Hero.tsx",
  propsType: "HeroProps",
  Component: Hero,
});
