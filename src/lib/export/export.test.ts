import { describe, expect, it } from "vitest";
import { fixtureSpec } from "@/spec/fixture";
import { normalizeSpec } from "@/spec/normalize";
import { buildExportFiles } from ".";

describe("buildExportFiles", async () => {
  const spec = normalizeSpec(fixtureSpec);
  const files = await buildExportFiles(spec);

  it("writes a complete Next.js project with agent docs", () => {
    for (const f of [
      "package.json",
      "tsconfig.json",
      "next.config.ts",
      "AGENTS.md",
      "CLAUDE.md",
      "site.manifest.json",
      "src/app/layout.tsx",
      "src/app/page.tsx",
      "src/app/globals.css",
      "src/app/tokens.css",
      "src/content/site.ts",
      "src/components/sections/labels.ts",
      "src/components/sections/hero/Hero.tsx",
      "src/components/sections/hero/schema.ts",
    ]) {
      expect(files.has(f), f).toBe(true);
    }
    // Builder-only registry files are not exported.
    expect([...files.keys()].some((f) => f.endsWith("/index.ts") || f.endsWith("define.ts"))).toBe(false);
  });

  it("manifest lists every section with its selector and file", () => {
    const manifest = JSON.parse(files.get("site.manifest.json")!);
    expect(manifest.sections.map((s: { id: string }) => s.id)).toEqual(spec.sections.map((s) => s.id));
    const hero = manifest.sections.find((s: { id: string }) => s.id === "hero-1");
    expect(hero.selector).toBe('[data-section-id="hero-1"]');
    expect(files.has(hero.component)).toBe(true);
    expect(hero.components).toContain("hero.headline");
    expect(manifest.propSchemas.hero.type).toBe("object");
  });

  it("page and content are keyed by section id with @section markers", () => {
    const page = files.get("src/app/page.tsx")!;
    const content = files.get("src/content/site.ts")!;
    for (const s of spec.sections) {
      expect(page).toContain(`@section ${s.id} (${s.type}/${s.variant})`);
      expect(page).toContain(`props={sections["${s.id}"]}`);
      expect(content).toContain(`"${s.id}": {`);
    }
    expect(page.indexOf("<Navbar")).toBeLessThan(page.indexOf("<main>"));
    expect(page.indexOf("<Footer")).toBeGreaterThan(page.indexOf("</main>"));
  });

  it("ships the motion runtime, pinned deps, and the direction file", () => {
    for (const f of [
      "src/components/sections/_motion/MotionRoot.tsx",
      "src/components/sections/_motion/runtime.ts",
      "src/components/sections/_motion/vocabulary.ts",
      "src/components/sections/_shared/concepts/PressureGauge.tsx",
      `intake/${spec.slug}.direction.json`,
    ]) {
      expect(files.has(f), f).toBe(true);
    }
    expect([...files.keys()].some((f) => f.includes(".test."))).toBe(false);
    const pkg = JSON.parse(files.get("package.json")!);
    expect(pkg.dependencies.gsap).toBe("3.15.0");
    expect(pkg.dependencies.lenis).toBe("1.3.26");
    expect(files.get("src/app/layout.tsx")).toContain('<MotionRoot concept="none">');
  });

  it("wires a concept through page, layout, manifest, and AGENTS.md", async () => {
    const ledger = await buildExportFiles({ ...spec, motion: { concept: "ledger-rule" } });
    const page = ledger.get("src/app/page.tsx")!;
    expect(page).toContain('concept="ledger-rule"');
    expect(page.match(/<LedgerRule \/>/g)?.length).toBe(spec.sections.length - 3);
    expect(ledger.get("src/app/layout.tsx")).toContain('<MotionRoot concept="ledger-rule">');
    const manifest = JSON.parse(ledger.get("site.manifest.json")!);
    expect(manifest.motion.concept).toBe("ledger-rule");
    expect(manifest.sections.find((s: { id: string }) => s.id === "stats-1").motion.effects).toContain("reveal-group");
    expect(ledger.get("AGENTS.md")).toContain("Signature concept: **`ledger-rule`**");
    expect(JSON.parse(ledger.get(`intake/${spec.slug}.direction.json`)!).motion.concept).toBe("ledger-rule");
  });

  it("loads fonts with next/font and themes through CSS variables", () => {
    expect(files.get("src/app/layout.tsx")).toContain('import { Fraunces, Inter } from "next/font/google"');
    expect(files.get("src/app/globals.css")).toContain("--q-primary: #2f5d3a;");
  });
});
