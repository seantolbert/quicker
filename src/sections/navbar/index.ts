import { defineSection } from "../define";
import { Navbar } from "./Navbar";
import { navbarProps } from "./schema";

export default defineSection({
  type: "navbar",
  label: "Header",
  description: "Sticky site header with brand, anchor links, optional phone and one action. Always first.",
  variants: {
    simple: "Brand left, links and action right.",
    split: "Brand left, links centered, action right.",
  },
  props: navbarProps,
  components: ["brand", "logo", "links", "link", "phone", "cta", "menu"],
  motion: ["header"],
  file: "Navbar.tsx",
  propsType: "NavbarProps",
  Component: Navbar,
});
