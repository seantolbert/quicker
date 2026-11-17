import contact from "./contact";
import cta from "./cta";
import faq from "./faq";
import features from "./features";
import footer from "./footer";
import hero from "./hero";
import navbar from "./navbar";
import pricing from "./pricing";
import process from "./process";
import stats from "./stats";
import testimonials from "./testimonials";

/** Every section type the generator can use. Order here is catalog order. */
export const registry = [navbar, hero, features, process, stats, testimonials, pricing, faq, cta, contact, footer] as const;

export type SectionType = (typeof registry)[number]["type"];

export const sectionsByType = Object.fromEntries(registry.map((s) => [s.type, s])) as {
  [S in (typeof registry)[number] as S["type"]]: S;
};
