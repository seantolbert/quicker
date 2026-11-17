import { defineSection } from "../define";
import { Features } from "./Features";
import { featuresProps } from "./schema";

export default defineSection({
  type: "features",
  label: "Features",
  description: "Services, features, or reasons to choose this business. Can appear more than once with different variants.",
  variants: {
    list: "Heading on the left, numbered list on the right. Good for services. Default.",
    bento: "Grid with the first item large. Good for 3-5 product features.",
  },
  props: featuresProps,
  components: ["eyebrow", "heading", "intro", "item", "item.title", "item.body"],
  motion: ["reveal", "reveal-group"],
  concepts: ["airflow-path", "circuit-trace", "shelf-slide", "soft-focus"],
  file: "Features.tsx",
  propsType: "FeaturesProps",
  Component: Features,
});
