import { defineSection } from "../define";
import { Contact } from "./Contact";
import { contactProps } from "./schema";

export default defineSection({
  type: "contact",
  label: "Contact",
  description: "Contact details and a short form (submits via the visitor's email app). Use for service businesses.",
  variants: { split: "Details on the left, form on the right." },
  props: contactProps,
  components: ["heading", "body", "details", "phone", "email", "address", "hours", "form", "field", "submit", "call"],
  motion: ["reveal-group"],
  file: "Contact.tsx",
  propsType: "ContactProps",
  Component: Contact,
});
