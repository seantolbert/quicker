import { defineSection } from "../define";
import { Stats } from "./Stats";
import { statsProps } from "./schema";

export default defineSection({
  type: "stats",
  label: "Stats",
  description: "A row of 2-4 key figures. Only use when the prompt gives real numbers, or mark placeholder: true.",
  variants: { row: "Figures in a ruled row." },
  props: statsProps,
  components: ["heading", "placeholder", "item", "item.label", "item.value"],
  motion: ["reveal-group", "count"],
  file: "Stats.tsx",
  propsType: "StatsProps",
  Component: Stats,
});
