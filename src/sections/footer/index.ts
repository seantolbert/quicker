import { defineSection } from "../define";
import { Footer } from "./Footer";
import { footerProps } from "./schema";

export default defineSection({
  type: "footer",
  label: "Footer",
  description: "Brand, short tagline, link columns, legal line. Always last.",
  variants: { columns: "Brand on the left, link columns on the right." },
  props: footerProps,
  components: ["brand", "tagline", "column", "link", "legal"],
  motion: [],
  file: "Footer.tsx",
  propsType: "FooterProps",
  Component: Footer,
});
