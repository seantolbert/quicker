import { defineSection } from "../define";
import { Pricing } from "./Pricing";
import { pricingProps } from "./schema";

export default defineSection({
  type: "pricing",
  label: "Pricing",
  description: "1-3 pricing tiers. Only when the prompt mentions prices or plans.",
  variants: { tiers: "Tier cards; the featured tier is inverted." },
  props: pricingProps,
  components: ["eyebrow", "heading", "intro", "tier", "tier.name", "tier.price", "tier.features", "tier.cta", "note"],
  motion: ["reveal", "reveal-group"],
  concepts: ["soft-focus"],
  file: "Pricing.tsx",
  propsType: "PricingProps",
  Component: Pricing,
});
