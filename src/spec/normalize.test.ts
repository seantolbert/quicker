import { describe, expect, it } from "vitest";
import { fixtureSpec } from "./fixture";
import { assignSectionIds, fixTheme, normalizeSpec, slugify } from "./normalize";
import { contrast } from "./theme";

describe("assignSectionIds", () => {
  it("keeps well-formed ids, so normalizing twice is a no-op", () => {
    const once = normalizeSpec(fixtureSpec);
    expect(normalizeSpec(once)).toEqual(once);
    expect(once.sections.map((s) => s.id)).toEqual(fixtureSpec.sections.map((s) => s.id));
  });

  it("renames bad or duplicate ids and rewrites anchor links to match", () => {
    const sections = structuredClone(fixtureSpec.sections);
    sections[2].id = "services"; // features-1 → bad id
    sections[3].id = "features-1"; // now the only valid features-1
    sections[0].props = { ...(sections[0].props as object), links: [{ label: "Services", href: "#services" }] } as never;

    const out = assignSectionIds(sections);
    expect(out[3].id).toBe("features-1");
    expect(out[2].id).toBe("features-2");
    expect((out[0].props as { links: { href: string }[] }).links[0].href).toBe("#features-2");
  });
});

describe("fixTheme", () => {
  it("repairs low-contrast pairs and invalid colors", () => {
    const theme = fixTheme({
      ...fixtureSpec.theme,
      palette: { ...fixtureSpec.theme.palette, fg: "#cccccc", primaryFg: "#2f5d3b", border: "blue" },
    });
    expect(contrast(theme.palette.fg, theme.palette.bg)).toBeGreaterThanOrEqual(7);
    expect(contrast(theme.palette.primaryFg, theme.palette.primary)).toBeGreaterThanOrEqual(4.5);
    expect(theme.palette.border).toMatch(/^#[0-9a-f]{6}$/i);
  });
});

it("slugify", () => {
  expect(slugify("Maya's Walks — Austin!")).toBe("mayas-walks-austin");
  expect(slugify("!!!")).toBe("site");
});
