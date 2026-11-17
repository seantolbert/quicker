import type { ConceptId } from "@/sections/_motion/vocabulary";
import { contrast, isHex, mix, readableOn, type FontName, type Theme } from "@/spec/theme";
import type { Direction, ImageRecord, Intake, TradeId } from "./types";

/**
 * Trade presets from the industry-design-direction skill. Base tones follow
 * each trade's palette rule; the accent always comes from the logo.
 */
type Preset = {
  label: string;
  match: RegExp;
  mode: Theme["mode"];
  base: Omit<Theme["palette"], "primary" | "primaryFg">;
  fallbackAccent: string;
  fonts: { heading: FontName; body: FontName };
  radius: Theme["radius"];
  motion: { concept: ConceptId; description: string };
  voice: string;
};

export const PRESETS: Record<TradeId, Preset> = {
  hvac: {
    label: "HVAC",
    match: /\bhvac\b|heating|air ?condition|\bcooling\b|furnace|heat pump/i,
    mode: "light",
    base: { bg: "#f6f4ef", surface: "#ebe7de", fg: "#1f2328", muted: "#545a62", border: "#d8d3c8" },
    fallbackAccent: "#2f4a6b",
    fonts: { heading: "Manrope", body: "Inter" },
    radius: "sm",
    motion: { concept: "airflow-path", description: "Airflow path: a thin SVG line traces down through the service sections, branching at each service." },
    voice: "Plain, direct, reassuring about response time and honest about pricing. No jargon unless the reviews use it.",
  },
  plumbing: {
    label: "Plumbing",
    match: /plumb|drain|sewer|water heater|rooter/i,
    mode: "light",
    base: { bg: "#f4f6f8", surface: "#e5eaee", fg: "#16202a", muted: "#4b5865", border: "#d1d9e0" },
    fallbackAccent: "#1d4f7a",
    fonts: { heading: "IBM Plex Sans", body: "IBM Plex Sans" },
    radius: "sm",
    motion: { concept: "pressure-gauge", description: "Pressure gauge: a scroll-linked SVG dial that fills as the visitor reaches the how-it-works section." },
    voice: "Calm and quick. Put the emergency number and any same-day claim (only if the sources say so) in the first screen.",
  },
  electrical: {
    label: "Electrical",
    match: /electric(?!al engineer)|electrician|\bev charger|lighting install|panel upgrade/i,
    mode: "dark",
    base: { bg: "#0e0f10", surface: "#1a1c1f", fg: "#f4f4f2", muted: "#a9adb2", border: "#2d3035" },
    fallbackAccent: "#f2b33d",
    fonts: { heading: "IBM Plex Sans", body: "IBM Plex Sans" },
    radius: "none",
    motion: { concept: "circuit-trace", description: "Circuit trace: lines draw between service cards as the page scrolls, under 300 ms per line." },
    voice: "Precise and safety-focused. Name the work (panels, EV chargers, lighting), never vague terms. License numbers only if the sources give them.",
  },
  roofing: {
    label: "Roofing",
    match: /roof|gutter|shingle/i,
    mode: "light",
    base: { bg: "#f8f5f0", surface: "#ede7dc", fg: "#231f1a", muted: "#5d554a", border: "#dcd3c5" },
    fallbackAccent: "#7a2e1f",
    fonts: { heading: "Source Serif 4", body: "Inter" },
    radius: "sm",
    motion: { concept: "layer-stack", description: "Layer stack: sections stack like shingle courses on scroll, 2D CSS transforms." },
    voice: "Weather, storm damage, and warranties, but only what the business states.",
  },
  "mobile-detailing": {
    label: "Mobile detailing",
    match: /detail(ing)?\b.*(car|auto|mobile|vehicle)|(car|auto|mobile)\b.*detail|ceramic coating|paint correction/i,
    mode: "light",
    base: { bg: "#f5f4f0", surface: "#eae8e2", fg: "#111111", muted: "#55534e", border: "#d5d3cc" },
    fallbackAccent: "#1f3d8a",
    fonts: { heading: "Manrope", body: "IBM Plex Sans" },
    radius: "none",
    motion: { concept: "vinyl-on", description: "Vinyl on: the livery stripe snaps on left to right; no 3D." },
    voice: "Plain and local. Name the towns served and the radius. Phone number at the largest size. Prices are 'from' amounts from the business.",
  },
  "general-contractor": {
    label: "General contractor",
    match: /contractor|construction|remodel|renovat|builder|handyman|carpentr|cabinet|flooring|painting|concrete|landscap|fenc/i,
    mode: "light",
    base: { bg: "#f7f7f5", surface: "#ebeae6", fg: "#1c1c1a", muted: "#565651", border: "#d7d6d0" },
    fallbackAccent: "#3d5a40",
    fonts: { heading: "Source Serif 4", body: "Inter" },
    radius: "sm",
    motion: { concept: "before-after", description: "Before and after: a scroll-linked reveal comparing two project photos (confirmed rights only)." },
    voice: "Project-first. Show the work before claims.",
  },
  // General presets: Quicker's own, for businesses outside the skill's trades.
  "food-drink": {
    label: "Food & drink",
    match: /restaurant|\bcaf[eé]|coffee|bakery|\bbar\b|brewery|winery|barbecue|bbq|pizz|taco|\bfood|deli\b|diner|bistro|catering|ice cream|donut|meal_takeaway/i,
    mode: "light",
    base: { bg: "#faf6ef", surface: "#f1e9db", fg: "#221c16", muted: "#5e5348", border: "#e0d5c3" },
    fallbackAccent: "#a8461f",
    fonts: { heading: "Fraunces", body: "Inter" },
    radius: "sm",
    motion: { concept: "close-up", description: "Close-up: the hero photo pushes in as you scroll; other photos crop in as they enter." },
    voice: "Sensory and specific. Name the dishes, how they're made, and what regulars order. Hours and location up front.",
  },
  "beauty-wellness": {
    label: "Beauty & wellness",
    match: /beauty|salon|\bhair|barber|\bspa\b|nail|massage|esthetic|lash|brow|wellness|yoga|pilates|tattoo|skin ?care/i,
    mode: "light",
    base: { bg: "#f8f6f4", surface: "#efe9e5", fg: "#1f1b1a", muted: "#5d5553", border: "#e2dad6" },
    fallbackAccent: "#8a5a6b",
    fonts: { heading: "Playfair Display", body: "Manrope" },
    radius: "md",
    motion: { concept: "soft-focus", description: "Soft focus: photos come into focus as they enter; short rules draw under headings. Text never moves." },
    voice: "Calm and personal. Name the treatments and who performs them. Booking is the one primary action.",
  },
  retail: {
    label: "Retail",
    match: /store|\bshop\b|boutique|retail|florist|gift|jewel|furniture|bookstore|outfitter/i,
    mode: "light",
    base: { bg: "#fbfbf9", surface: "#f0efe9", fg: "#161616", muted: "#575752", border: "#dedcd5" },
    fallbackAccent: "#24476b",
    fonts: { heading: "Bricolage Grotesque", body: "Inter" },
    radius: "sm",
    motion: { concept: "shelf-slide", description: "Shelf slide: feature cards slide sideways in a pinned row." },
    voice: "Product-first. What they carry, what makes it worth the trip, hours and parking.",
  },
  "professional-services": {
    label: "Professional services",
    match: /lawyer|attorney|law firm|accounting|accountant|\bcpa\b|insurance|real estate|realtor|dentist|dental|doctor|physician|chiropract|therap|financial|consult|veterinar|optometr|clinic/i,
    mode: "light",
    base: { bg: "#f7f8f9", surface: "#eceff2", fg: "#15191e", muted: "#4f5862", border: "#d6dbe0" },
    fallbackAccent: "#1f3f66",
    fonts: { heading: "Source Serif 4", body: "Inter" },
    radius: "sm",
    motion: { concept: "ledger-rule", description: "Ledger rule: ruled lines draw between sections and real figures count up." },
    voice: "Clear and credible. Say who it's for, what working together looks like, and how to book a consultation. No superlatives.",
  },
};

/** Trades from the skill are matched before the general presets. */
const ORDER: TradeId[] = [
  "hvac",
  "plumbing",
  "electrical",
  "roofing",
  "mobile-detailing",
  "general-contractor",
  "food-drink",
  "beauty-wellness",
  "professional-services",
  "retail",
];

/** The direction's concept; older direction files stored only a description string. */
export function directionConcept(direction: Direction): ConceptId {
  return typeof direction.motion === "object" ? direction.motion.concept : (PRESETS[direction.trade]?.motion.concept ?? "none");
}

export function detectTrade(intake: Intake): { trade: TradeId; matchedBy: string; fallback: boolean } {
  const fields: [string, string | undefined][] = [
    ["Google category", [intake.business.primary_type, intake.business.type_label].filter(Boolean).join(" ")],
    ["business name", intake.business.name],
    ["Google types", intake.business.types.join(" ")],
    ["website services", intake.services.map((s) => s.name).join(" ")],
  ];
  for (const [field, text] of fields) {
    if (!text) continue;
    const hit = ORDER.find((id) => PRESETS[id].match.test(text.replace(/_/g, " ")));
    if (hit) return { trade: hit, matchedBy: field, fallback: false };
  }
  return { trade: "general-contractor", matchedBy: "fallback", fallback: true };
}

/** Moves `color` toward `toward` until it reaches `min` contrast against `bg`. */
function ensureContrast(color: string, bg: string, toward: string, min: number) {
  let c = color;
  for (let t = 0.1; contrast(c, bg) < min && t <= 1; t += 0.1) c = mix(color, toward, t);
  return c;
}

function pickHero(images: ImageRecord[]) {
  const rank = { client_confirmed: 0, pending_client_confirmation: 1, sample_only: 2 } as const;
  const landscape = (i: ImageRecord) => (i.width && i.height ? i.width / i.height : 1);
  return (
    [...images].sort((a, b) => rank[a.rights_status] - rank[b.rights_status] || landscape(b) - landscape(a))[0]?.id ?? null
  );
}

export function buildDirection(intake: Intake): Direction {
  const { trade, matchedBy, fallback } = detectTrade(intake);
  const preset = PRESETS[trade];
  const questions: string[] = [];

  if (fallback) {
    questions.push(
      `"${intake.business.type_label ?? intake.business.primary_type ?? intake.business.name}" isn't one of the presets; used the General contractor palette and type. Confirm or pick a trade.`,
    );
  }

  const logoColor = intake.colors.primary && isHex(intake.colors.primary) ? intake.colors.primary : undefined;
  if (!logoColor) questions.push("No usable logo color found; the accent is a neutral preset color. Ask the owner for their logo or brand color.");

  const { bg, fg } = preset.base;
  // UI contrast for the primary button against the page: at least 3:1.
  const primary = ensureContrast(logoColor ?? preset.fallbackAccent, bg, fg, 3);
  if (logoColor && primary !== logoColor) {
    questions.push(`Logo color ${logoColor} was too light against the page; adjusted to ${primary} for the buttons.`);
  }
  const palette: Theme["palette"] = { ...preset.base, primary, primaryFg: readableOn(primary) };

  if (preset.motion.concept === "before-after" && intake.images.filter((i) => i.rights_status === "client_confirmed").length < 2) {
    questions.push("The Before and after concept needs two photos the owner has confirmed; until then the site uses only the subtle motion layer.");
  }

  const pairs: [string, string, string, number][] = [
    ["text on background", palette.fg, palette.bg, 4.5],
    ["muted text on background", palette.muted, palette.bg, 4.5],
    ["text on surface", palette.fg, palette.surface, 4.5],
    ["button text on accent", palette.primaryFg, palette.primary, 4.5],
    ["accent on background", palette.primary, palette.bg, 3],
  ];

  return {
    trade,
    trade_label: preset.label,
    matched_by: matchedBy,
    theme: { mode: preset.mode, palette, fonts: preset.fonts, radius: preset.radius },
    contrast: pairs.map(([pair, a, b, min]) => {
      const ratio = Math.round(contrast(a, b) * 100) / 100;
      return { pair, ratio, min, pass: ratio >= min };
    }),
    motion: preset.motion,
    copy_voice: preset.voice,
    hero_image: pickHero(intake.images),
    open_questions: questions,
  };
}
