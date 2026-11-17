import { defineSection } from "../define";
import { Testimonials } from "./Testimonials";
import { testimonialsProps } from "./schema";

export default defineSection({
  type: "testimonials",
  label: "Testimonials",
  description: "Customer quotes: one large, up to two small. Mark placeholder: true unless the prompt supplied real reviews.",
  variants: {
    quotes: "Lead quote on 7 columns, smaller quotes beside it.",
    spotlight: "One very large quote at a time; on desktop the section pins and steps through them. Use with 3+ strong real quotes.",
  },
  props: testimonialsProps,
  components: ["heading", "placeholder", "item", "item.rating", "item.quote", "item.name", "item.source"],
  motion: ["reveal", "reveal-group", "spotlight"],
  file: "Testimonials.tsx",
  propsType: "TestimonialsProps",
  Component: Testimonials,
});
