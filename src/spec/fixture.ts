import type { SiteSpec } from "./schema";

/** A complete spec using every section type. Used by tests. */
export const fixtureSpec: SiteSpec = {
  meta: { name: "Maya's Walks", description: "Insured dog walking in East Austin since 2019." },
  theme: {
    mode: "light",
    palette: {
      bg: "#faf8f3",
      surface: "#efebe1",
      fg: "#1d1c1a",
      muted: "#5b584f",
      border: "#d9d4c7",
      primary: "#2f5d3a",
      primaryFg: "#ffffff",
    },
    fonts: { heading: "Fraunces", body: "Inter" },
    radius: "sm",
  },
  motion: { concept: "none" },
  sections: [
    {
      id: "navbar-1",
      type: "navbar",
      variant: "simple",
      props: {
        brand: "Maya's Walks",
        links: [
          { label: "Services", href: "#features-1" },
          { label: "Pricing", href: "#pricing-1" },
        ],
        phone: "(512) 555-0143",
        cta: { label: "Book a walk", href: "#contact-1" },
      },
    },
    {
      id: "hero-1",
      type: "hero",
      variant: "split",
      props: {
        eyebrow: "East Austin · Since 2019",
        headline: "Midday walks for East Austin dogs, by the same walker every time.",
        subheadline: "Solo and small-group walks, GPS-tracked, with a photo update after every visit.",
        primaryCta: { label: "Book a walk", href: "#contact-1" },
        secondaryCta: { label: "See prices", href: "#pricing-1" },
        media: { alt: "Maya walking two dogs along Boggy Creek trail" },
        proof: "Licensed and insured",
      },
    },
    {
      id: "features-1",
      type: "features",
      variant: "list",
      props: {
        heading: "What a walk includes",
        items: [
          { title: "Same walker", body: "Your dog sees Maya every visit." },
          { title: "Photo report", body: "A photo and route map after each walk." },
        ],
      },
    },
    {
      id: "features-2",
      type: "features",
      variant: "bento",
      props: {
        heading: "Extras",
        items: [
          { title: "Puppy visits", body: "Three short visits a day." },
          { title: "Key lockbox", body: "No need to be home." },
          { title: "Water refill", body: "Fresh water every visit." },
        ],
      },
    },
    {
      id: "process-1",
      type: "process",
      variant: "steps",
      props: {
        heading: "How booking works",
        steps: [
          { title: "Meet", body: "A free 20-minute meet and greet." },
          { title: "Schedule", body: "Pick regular days or book ad hoc." },
        ],
      },
    },
    {
      id: "stats-1",
      type: "stats",
      variant: "row",
      props: { items: [{ value: "6", label: "Years walking" }], placeholder: true },
    },
    {
      id: "testimonials-1",
      type: "testimonials",
      variant: "quotes",
      props: {
        heading: "From owners",
        items: [
          { quote: "Biscuit waits by the door for her.", name: "Sam R.", rating: 5, source: "Google" },
          { quote: "Reliable every week.", name: "Lee K." },
        ],
        placeholder: true,
      },
    },
    {
      id: "pricing-1",
      type: "pricing",
      variant: "tiers",
      props: {
        heading: "Prices",
        tiers: [
          {
            name: "Group walk",
            price: "$18",
            period: "per walk",
            description: "Up to 3 dogs.",
            features: ["45 minutes"],
            cta: { label: "Book a group walk", href: "#contact-1" },
            featured: false,
          },
          {
            name: "Solo walk",
            price: "$28",
            period: "per walk",
            description: "Just your dog.",
            features: ["45 minutes", "Photo report"],
            cta: { label: "Book a solo walk", href: "#contact-1" },
            featured: true,
          },
        ],
      },
    },
    {
      id: "faq-1",
      type: "faq",
      variant: "accordion",
      props: { heading: "Questions", items: [{ question: "Are you insured?", answer: "Yes, bonded and insured." }] },
    },
    {
      id: "cta-1",
      type: "cta",
      variant: "band",
      props: { heading: "Book a free meet and greet.", primaryCta: { label: "Book a walk", href: "#contact-1" } },
    },
    {
      id: "contact-1",
      type: "contact",
      variant: "split",
      props: {
        heading: "Book a walk",
        email: "hello@mayaswalks.com",
        phone: "(512) 555-0143",
        hours: ["Mon-Fri 10am-4pm"],
        fields: [
          { name: "name", label: "Your name", type: "text", required: true },
          { name: "message", label: "About your dog", type: "textarea", required: false },
        ],
        submitLabel: "Request a meet and greet",
      },
    },
    {
      id: "footer-1",
      type: "footer",
      variant: "columns",
      props: {
        brand: "Maya's Walks",
        columns: [{ heading: "Visit", links: [{ label: "Pricing", href: "#pricing-1" }] }],
        legal: "© 2026 Maya's Walks",
      },
    },
  ],
};
