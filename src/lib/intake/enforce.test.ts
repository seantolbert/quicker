import { describe, expect, it } from "vitest";
import { fixtureSpec } from "@/spec/fixture";
import { normalizeSpec } from "@/spec/normalize";
import type { Section, StoredSpec } from "@/spec/schema";
import { buildDirection } from "./direction";
import { applyIntake, factNumbers, settleConcept, stripAppFields } from "./enforce";
import { fixtureIntake } from "./fixture";

const base = normalizeSpec(fixtureSpec);
const direction = buildDirection(fixtureIntake);
const find = <T extends Section["type"]>(spec: StoredSpec, type: T) =>
  spec.sections.find((s) => s.type === type) as Extract<Section, { type: T }>;

function withSection<T extends Section["type"]>(type: T, props: Partial<Extract<Section, { type: T }>["props"]>) {
  const spec = structuredClone(base);
  const s = find(spec, type);
  s.props = { ...s.props, ...props } as typeof s.props;
  return spec;
}

describe("applyIntake", () => {
  it("overwrites contact facts with the sources and drops an invented email", () => {
    const out = applyIntake(withSection("contact", { email: "hello@made-up.com", phone: "555" }), fixtureIntake, direction);
    const contact = find(out, "contact").props;
    expect(contact.phone).toBe("(512) 555-0199");
    expect(contact.address).toBe(fixtureIntake.contact.address);
    expect(contact.hours).toEqual(fixtureIntake.hours);
    expect(contact.email).toBeUndefined();
    expect(find(out, "navbar").props.phone).toBe("(512) 555-0199");
    expect(find(out, "navbar").props.logo).toEqual({ src: "/brand/logo.png", alt: "Rio Grande Plumbing logo" });
  });

  it("rewrites tel: and mailto: links to the real phone", () => {
    const out = applyIntake(
      withSection("hero", { primaryCta: { label: "Call now", href: "tel:+15550000000" }, secondaryCta: { label: "Email", href: "mailto:x@y.z" } }),
      fixtureIntake,
      direction,
    );
    const hero = find(out, "hero").props;
    expect(hero.primaryCta.href).toBe("tel:5125550199");
    expect(hero.secondaryCta?.href).toBe("tel:5125550199");
  });

  it("keeps verbatim review excerpts with real attribution, and drops invented ones", () => {
    const out = applyIntake(
      withSection("testimonials", {
        placeholder: true,
        items: [
          { quote: "explained the leak in plain English, and charged exactly what he quoted", name: "Dana" },
          { quote: "Best plumber in Texas!", name: "Fake Person" },
        ],
      }),
      fixtureIntake,
      direction,
    );
    const t = find(out, "testimonials").props;
    expect(t.placeholder).toBe(false);
    expect(t.items).toHaveLength(1);
    expect(t.items[0]).toMatchObject({
      name: "Dana P.",
      rating: 5,
      source: "Google",
      sourceUrl: "https://maps.google.com/review/1",
      authorUrl: "https://www.google.com/maps/contrib/1",
    });
  });

  it("marks testimonials as placeholders when nothing is verbatim", () => {
    const out = applyIntake(
      withSection("testimonials", { placeholder: false, items: [{ quote: "They were great and fast", name: "Sam" }] }),
      fixtureIntake,
      direction,
    );
    expect(find(out, "testimonials").props.placeholder).toBe(true);
  });

  it("only allows stats whose numbers appear in the sources", () => {
    const real = applyIntake(
      withSection("stats", { placeholder: false, items: [{ value: "4.9★", label: "Google rating" }, { value: "212", label: "Reviews" }] }),
      fixtureIntake,
      direction,
    );
    expect(find(real, "stats").props.placeholder).toBe(false);
    const fake = applyIntake(
      withSection("stats", { placeholder: false, items: [{ value: "1,500+", label: "Jobs done" }] }),
      fixtureIntake,
      direction,
    );
    expect(find(fake, "stats").props.placeholder).toBe(true);
    expect(factNumbers(fixtureIntake).has("2009")).toBe(true);
    // Derived: days open per week.
    const allWeek = { ...fixtureIntake, hours: Array.from({ length: 7 }, (_, i) => `Day ${i}: Open 24 hours`) };
    const open247 = applyIntake(withSection("stats", { placeholder: false, items: [{ value: "24/7", label: "Open" }] }), allWeek, direction);
    expect(find(open247, "stats").props.placeholder).toBe(false);
  });

  it("resolves photo IDs with rights and credit, defaults the hero, and drops unknown IDs", () => {
    const spec = withSection("hero", { media: { alt: "Truck", src: "https://hotlink.example/x.jpg" } });
    const out = applyIntake(spec, fixtureIntake, direction);
    const media = find(out, "hero").props.media;
    expect(media).toMatchObject({ photo: "photo-1", src: "/photos/photo-1.jpg", rights: "sample_only" });
    expect(media.credit).toMatch(/Sample imagery for Rio Grande Plumbing/);

    const bad = applyIntake(withSection("hero", { media: { alt: "x", photo: "photo-99" } }), fixtureIntake, null);
    expect(find(bad, "hero").props.media).toEqual({ alt: "x" });
  });

  it("applies the direction theme and motion concept, and is idempotent", () => {
    const once = applyIntake(base, fixtureIntake, direction);
    expect(once.theme).toEqual(direction.theme);
    expect(once.motion).toEqual({ concept: "pressure-gauge" });
    expect(applyIntake(once, fixtureIntake, direction)).toEqual(once);
  });

  it("credits confirmed photos without the sample label", () => {
    const confirmed = { ...fixtureIntake, images: fixtureIntake.images.map((i) => ({ ...i, rights_status: "client_confirmed" as const })) };
    const media = find(applyIntake(base, confirmed, direction), "hero").props.media;
    expect(media.rights).toBe("client_confirmed");
    expect(media.credit).toBe("Photo: Rio Grande Plumbing");
  });
});

describe("stripAppFields", () => {
  it("removes app-only fields the model may have filled", () => {
    const spec = withSection("hero", { media: { alt: "x", src: "https://evil.example/a.jpg", rights: "client_confirmed", photo: "photo-1" } });
    expect(find(stripAppFields(spec), "hero").props.media).toEqual({ alt: "x" });
  });
});

describe("settleConcept", () => {
  const before = { ...base, motion: { concept: "before-after" as const } };
  it("drops before-after without two confirmed hero photos", () => {
    expect(settleConcept(before).motion.concept).toBe("none");
    expect(stripAppFields(before).motion.concept).toBe("none");
  });
  it("keeps before-after with two confirmed photos", () => {
    const spec = structuredClone(before);
    const hero = find(spec, "hero");
    hero.props.media = { alt: "Before", src: "/photos/a.jpg", rights: "client_confirmed" };
    hero.props.compareMedia = { alt: "After", src: "/photos/b.jpg", rights: "client_confirmed" };
    expect(settleConcept(spec).motion.concept).toBe("before-after");
  });
});
