import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { fixtureSpec } from "@/spec/fixture";
import { siteSpecSchema } from "@/spec/schema";
import { registry, sectionsByType } from "./registry";
import type { ComponentType } from "react";
import type { SectionProps } from "./labels";

const parsed = siteSpecSchema.parse(fixtureSpec);

// Extra instances for app-set variations: real photo with rights, logo, review links, contact without email.
const extras = siteSpecSchema.shape.sections.parse([
  {
    id: "navbar-2",
    type: "navbar",
    variant: "split",
    props: { ...parsed.sections[0].props, logo: { src: "/brand/logo.png", alt: "Logo" } },
  },
  {
    id: "hero-2",
    type: "hero",
    variant: "stacked",
    props: {
      ...parsed.sections[1].props,
      media: { alt: "Van", photo: "photo-1", src: "/photos/photo-1.jpg", rights: "sample_only", credit: "Photo: A via Google" },
    },
  },
  {
    id: "testimonials-2",
    type: "testimonials",
    variant: "quotes",
    props: {
      heading: "Reviews",
      placeholder: false,
      items: [{ quote: "Great.", name: "Dana P.", source: "Google", sourceUrl: "https://g.co/r", authorUrl: "https://g.co/a" }],
    },
  },
  {
    id: "contact-2",
    type: "contact",
    variant: "split",
    props: { heading: "Call us", phone: "(512) 555-0199", fields: [], submitLabel: "Call for a same-day visit" },
  },
]);
const spec = { ...parsed, sections: [...parsed.sections, ...extras] };

describe("labeling contract", () => {
  it("the fixture covers every registered section type", () => {
    const covered = new Set(spec.sections.map((s) => s.type));
    expect(registry.filter((d) => !covered.has(d.type)).map((d) => d.type)).toEqual([]);
  });

  for (const s of spec.sections) {
    it(`${s.id} (${s.type}/${s.variant}) labels its root and only uses declared component names`, () => {
      const def = sectionsByType[s.type];
      const Component = def.Component as ComponentType<SectionProps<unknown>>;
      const html = renderToStaticMarkup(<Component id={s.id} variant={s.variant} props={s.props} />);

      // React hoists preload hints for eager images ahead of the root element.
      const root = html.replace(/^(<link[^>]*\/>)+/, "").match(/^<(\w+)([^>]*)>/)![2];
      expect(root).toContain(`id="${s.id}"`);
      expect(root).toContain(`data-section="${s.type}"`);
      expect(root).toContain(`data-section-id="${s.id}"`);
      expect(root).toContain(`data-variant="${s.variant}"`);
      expect(root).toContain("aria-label=");

      const used = [...html.matchAll(/data-component="([^"]+)"/g)].map((m) => m[1]);
      expect(used.length).toBeGreaterThan(0);
      const declared = def.components.map((c) => `${s.type}.${c}`);
      expect(used.filter((c) => !declared.includes(c))).toEqual([]);
    });
  }

  it("every variant listed in the registry is accepted by the schema", () => {
    for (const def of registry) {
      for (const variant of Object.keys(def.variants)) {
        const sample = spec.sections.find((s) => s.type === def.type)!;
        expect(siteSpecSchema.shape.sections.element.safeParse({ ...sample, variant }).success).toBe(true);
      }
    }
  });
});

describe("app-set variations", () => {
  const html = (id: string) => {
    const s = spec.sections.find((x) => x.id === id)!;
    const Component = sectionsByType[s.type].Component as ComponentType<SectionProps<unknown>>;
    return renderToStaticMarkup(<Component id={s.id} variant={s.variant} props={s.props} />);
  };

  it("real photos carry rights and a visible sample label", () => {
    const out = html("hero-2");
    expect(out).toContain('data-rights="sample_only"');
    expect(out).toContain('src="/photos/photo-1.jpg"');
    expect(out).toMatch(/Sample imagery/);
    expect(out).not.toContain('data-placeholder="image"');
  });

  it("contact without an email shows a call action instead of a form", () => {
    const out = html("contact-2");
    expect(out).not.toContain("<form");
    expect(out).toContain('data-component="contact.call"');
    expect(out).toContain('href="tel:5125550199"');
  });

  it("review attribution links to the reviewer and the source", () => {
    const out = html("testimonials-2");
    expect(out).toContain('href="https://g.co/a"');
    expect(out).toContain('href="https://g.co/r"');
  });
});
