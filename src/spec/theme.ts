import { z } from "zod";

/** Variable Google fonts available to generated sites (all load via next/font on export). */
export const FONTS = {
  Inter: "sans-serif",
  Manrope: "sans-serif",
  "DM Sans": "sans-serif",
  "Work Sans": "sans-serif",
  "Libre Franklin": "sans-serif",
  Outfit: "sans-serif",
  "Space Grotesk": "sans-serif",
  "Bricolage Grotesque": "sans-serif",
  "IBM Plex Sans": "sans-serif",
  Fraunces: "serif",
  "Playfair Display": "serif",
  Newsreader: "serif",
  "Source Serif 4": "serif",
} as const;

export type FontName = keyof typeof FONTS;
const fontNames = Object.keys(FONTS) as [FontName, ...FontName[]];

const hex = z.string().describe("6-digit hex, e.g. #1a1a1a");

export const themeSchema = z.object({
  mode: z.enum(["light", "dark"]),
  palette: z.object({
    bg: hex.describe("Page background"),
    surface: hex.describe("Slightly offset background for bands and placeholders"),
    fg: hex.describe("Main text; must contrast strongly with bg"),
    muted: hex.describe("Secondary text; at least 4.5:1 against bg"),
    border: hex.describe("Hairlines and dividers"),
    primary: hex.describe("Brand color for the one primary action"),
    primaryFg: hex.describe("Text on primary; at least 4.5:1 against primary"),
  }),
  fonts: z.object({ heading: z.enum(fontNames), body: z.enum(fontNames) }),
  radius: z.enum(["none", "sm", "md", "lg"]),
});

export type Theme = z.infer<typeof themeSchema>;

export const RADIUS: Record<Theme["radius"], string> = { none: "0px", sm: "4px", md: "8px", lg: "14px" };

export const DEFAULT_THEME: Theme = {
  mode: "light",
  palette: {
    bg: "#faf9f6",
    surface: "#f0eee8",
    fg: "#1c1b19",
    muted: "#5c5a55",
    border: "#dcd9d1",
    primary: "#1f4d3a",
    primaryFg: "#ffffff",
  },
  fonts: { heading: "Fraunces", body: "Inter" },
  radius: "sm",
};

/** CSS custom properties consumed by the Tailwind tokens in site.css / exported globals.css. */
export function themeVars(theme: Theme, fontVars?: { heading: string; body: string }) {
  const p = theme.palette;
  return {
    "--q-bg": p.bg,
    "--q-surface": p.surface,
    "--q-fg": p.fg,
    "--q-muted": p.muted,
    "--q-border": p.border,
    "--q-primary": p.primary,
    "--q-primary-fg": p.primaryFg,
    "--q-radius": RADIUS[theme.radius],
    "--q-font-heading": `${fontVars?.heading ?? `"${theme.fonts.heading}"`}, ${FONTS[theme.fonts.heading]}`,
    "--q-font-body": `${fontVars?.body ?? `"${theme.fonts.body}"`}, ${FONTS[theme.fonts.body]}`,
  };
}

// --- WCAG contrast ---------------------------------------------------------

export function isHex(value: string) {
  return /^#[0-9a-f]{6}$/i.test(value);
}

function luminance(color: string) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(color.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a: string, b: string) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Linear blend of two hex colors; t=0 → a, t=1 → b. */
export function mix(a: string, b: string, t: number) {
  const ch = (c: string, i: number) => parseInt(c.slice(i, i + 2), 16);
  return (
    "#" +
    [1, 3, 5]
      .map((i) => Math.round(ch(a, i) + (ch(b, i) - ch(a, i)) * t).toString(16).padStart(2, "0"))
      .join("")
  );
}

/** Black or white, whichever reads better on `bg`. */
export function readableOn(bg: string) {
  return contrast(bg, "#000000") >= contrast(bg, "#ffffff") ? "#111111" : "#ffffff";
}
