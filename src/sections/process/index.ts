import { defineSection } from "../define";
import { Process } from "./Process";
import { processProps } from "./schema";

export default defineSection({
  type: "process",
  label: "Process",
  description: "How it works: the ordered steps from first contact to result. On a tinted band for rhythm.",
  variants: { steps: "Numbered steps in a row with a rule above each." },
  props: processProps,
  components: ["eyebrow", "heading", "intro", "step", "step.title", "step.body"],
  motion: ["reveal", "reveal-group", "draw"],
  concepts: ["pressure-gauge", "vinyl-on", "soft-focus"],
  file: "Process.tsx",
  propsType: "ProcessProps",
  Component: Process,
});
