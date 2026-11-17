import { describe, expect, it } from "vitest";
import { contrast } from "@/spec/theme";
import { buildDirection, detectTrade, directionConcept, PRESETS } from "./direction";
import { fixtureIntake } from "./fixture";
import type { Intake } from "./types";

const withBusiness = (business: Partial<Intake["business"]>, services: string[] = []): Intake => ({
  ...fixtureIntake,
  business: { ...fixtureIntake.business, primary_type: undefined, type_label: undefined, types: [], ...business },
  services: services.map((name) => ({ name })),
});

describe("detectTrade", () => {
  it.each([
    [{ primary_type: "plumber" }, "plumbing"],
    [{ name: "Cool Breeze Heating & Air" }, "hvac"],
    [{ primary_type: "electrician" }, "electrical"],
    [{ primary_type: "roofing_contractor" }, "roofing"],
    [{ name: "Shine On Mobile Detailing" }, "mobile-detailing"],
    [{ primary_type: "general_contractor" }, "general-contractor"],
  ] as const)("%o → %s", (business, trade) => {
    expect(detectTrade(withBusiness({ name: "Acme", ...business })).trade).toBe(trade);
  });

  it.each([
    [{ primary_type: "bakery", type_label: "Bakery" }, "food-drink"],
    [{ type_label: "Barbecue Restaurant" }, "food-drink"],
    [{ primary_type: "hair_care", type_label: "Hair salon" }, "beauty-wellness"],
    [{ primary_type: "clothing_store" }, "retail"],
    [{ type_label: "Law firm" }, "professional-services"],
  ] as const)("general preset %o → %s", (business, trade) => {
    expect(detectTrade(withBusiness({ name: "Acme", ...business })).trade).toBe(trade);
  });

  it("trades win over general presets", () => {
    expect(detectTrade(withBusiness({ name: "Acme", type_label: "Plumbing supply store" })).trade).toBe("plumbing");
  });

  it("falls back to General contractor and asks", () => {
    const intake = withBusiness({ name: "Lockbox Self Storage", primary_type: "storage", type_label: "Self-storage facility" });
    expect(detectTrade(intake)).toMatchObject({ trade: "general-contractor", fallback: true });
    const questions = buildDirection(intake).open_questions.join(" ");
    expect(questions).toMatch(/Self-storage facility.*isn't one of the presets/);
    expect(questions).toMatch(/Before and after concept needs two photos/);
  });
});

describe("buildDirection", () => {
  it("uses the trade's fonts and the logo color as accent, darkened until it reads on the page", () => {
    const d = buildDirection(fixtureIntake);
    expect(d.trade).toBe("plumbing");
    expect(d.theme.fonts).toEqual({ heading: "IBM Plex Sans", body: "IBM Plex Sans" });
    // #e8b04a is too light on the near-white plumbing base, so it's adjusted.
    expect(d.theme.palette.primary).not.toBe("#e8b04a");
    expect(contrast(d.theme.palette.primary, d.theme.palette.bg)).toBeGreaterThanOrEqual(3);
    expect(d.contrast.every((c) => c.pass)).toBe(true);
    expect(d.open_questions.join(" ")).toMatch(/too light/);
    expect(d.hero_image).toBe("photo-1");
  });

  it("keeps a logo color that already has enough contrast", () => {
    const d = buildDirection({ ...fixtureIntake, colors: { primary: "#1d4f7a", swatches: [], source: "logo" } });
    expect(d.theme.palette.primary).toBe("#1d4f7a");
  });

  it("every preset passes WCAG checks with no logo color", () => {
    for (const name of [
      "Plumbing",
      "Heating and Air",
      "Electric",
      "Roofing",
      "Mobile Car Detailing",
      "Builders",
      "Corner Bakery",
      "Hair Studio",
      "Gift Shop",
      "Smith Law Firm",
    ]) {
      const d = buildDirection({ ...withBusiness({ name }), colors: { swatches: [], source: "none" } });
      expect(d.contrast.filter((c) => !c.pass), name).toEqual([]);
    }
  });
});

describe("directionConcept", () => {
  it("reads the concept, including from older direction files that stored a string", () => {
    const d = buildDirection(fixtureIntake);
    expect(directionConcept(d)).toBe("pressure-gauge");
    expect(directionConcept({ ...d, motion: "Pressure gauge: a dial…" })).toBe("pressure-gauge");
  });

  it("every preset has a concept", () => {
    for (const p of Object.values(PRESETS)) expect(p.motion.concept).not.toBe("none");
  });
});
