import { defineSection } from "../define";
import { Faq } from "./Faq";
import { faqProps } from "./schema";

export default defineSection({
  type: "faq",
  label: "FAQ",
  description: "Common questions with short, direct answers.",
  variants: { accordion: "Heading on 4 columns, expandable questions on 8." },
  props: faqProps,
  components: ["heading", "intro", "item", "item.question", "item.answer"],
  motion: ["reveal", "reveal-group"],
  concepts: ["soft-focus"],
  file: "Faq.tsx",
  propsType: "FaqProps",
  Component: Faq,
});
