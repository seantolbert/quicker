import type { SiteSpec, StoredSpec } from "./schema";
import { contrast, DEFAULT_THEME, isHex, readableOn, type Theme } from "./theme";

export function slugify(name: string) {
  return (
    name
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/[\s_]+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 48) || "site"
  );
}

/**
 * Gives every section a stable "<type>-<n>" ID. IDs the model already wrote in
 * that form are kept, so running normalize twice changes nothing. Anchor links
 * ("#old-id") are rewritten to follow renamed sections.
 */
export function assignSectionIds(sections: SiteSpec["sections"]): SiteSpec["sections"] {
  const pattern = (type: string) => new RegExp(`^${type}-\\d+$`);
  const used = new Set<string>();
  const keep = sections.map((s) => {
    const ok = pattern(s.type).test(s.id) && !used.has(s.id);
    if (ok) used.add(s.id);
    return ok;
  });

  const renames = new Map<string, string>();
  const withIds = sections.map((s, i) => {
    if (keep[i]) return s;
    let n = 1;
    while (used.has(`${s.type}-${n}`)) n++;
    const id = `${s.type}-${n}`;
    used.add(id);
    if (s.id && !renames.has(s.id)) renames.set(s.id, id);
    return { ...s, id };
  });

  if (renames.size === 0) return withIds;
  return JSON.parse(JSON.stringify(withIds), (key, value) => {
    if (key === "href" && typeof value === "string" && value.startsWith("#")) {
      return `#${renames.get(value.slice(1)) ?? value.slice(1)}`;
    }
    return value;
  });
}

/** Repairs invalid colors and enforces WCAG AA contrast on the pairs the sections use. */
export function fixTheme(theme: Theme): Theme {
  const palette = { ...theme.palette };
  for (const key of Object.keys(palette) as (keyof typeof palette)[]) {
    if (!isHex(palette[key])) palette[key] = DEFAULT_THEME.palette[key];
  }
  if (contrast(palette.fg, palette.bg) < 7) palette.fg = readableOn(palette.bg);
  if (contrast(palette.muted, palette.bg) < 4.5) palette.muted = palette.fg;
  if (contrast(palette.primaryFg, palette.primary) < 4.5) palette.primaryFg = readableOn(palette.primary);
  return { ...theme, palette };
}

export function normalizeSpec(spec: SiteSpec): StoredSpec {
  return {
    version: 1,
    slug: slugify(spec.meta.name),
    meta: spec.meta,
    theme: fixTheme(spec.theme),
    motion: { concept: spec.motion?.concept ?? "none" },
    sections: assignSectionIds(spec.sections),
  };
}
