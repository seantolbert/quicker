import { Fragment, type ComponentType, type CSSProperties } from "react";
import type { SectionProps } from "@/sections/labels";
import { LedgerRule } from "@/sections/_shared/concepts/LedgerRule";
import { CONCEPT_IDS, type ConceptId } from "@/sections/_motion/vocabulary";
import { sectionsByType } from "@/sections/registry";
import { rebaseAssets } from "@/spec/assets";
import { fixTheme } from "@/spec/normalize";
import { sectionSchema } from "@/spec/schema";
import { DEFAULT_THEME, themeSchema, themeVars, type Theme } from "@/spec/theme";

export type PartialSpec = {
  theme?: unknown;
  motion?: { concept?: string };
  sections?: ({ id?: string; type?: string; variant?: string; props?: unknown } | undefined)[];
};

function fontsHref(theme: Theme) {
  const families = [...new Set([theme.fonts.heading, theme.fonts.body])]
    .map((f) => `family=${f.replace(/ /g, "+")}:wght@400;500;600;700`)
    .join("&");
  return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}

/**
 * Renders a full or partially streamed spec. Sections render once their props
 * validate; the section still streaming in shows a labeled skeleton. Structure
 * matches the exported page: header, <main>, footer.
 */
export function SiteRenderer({
  spec: raw,
  streaming = false,
  assetBase = "",
}: {
  spec: PartialSpec | null;
  streaming?: boolean;
  /** Prefix for "/photos/…" and "/brand/…" paths (the builder serves them per project). */
  assetBase?: string;
}) {
  const spec = assetBase ? rebaseAssets(raw, assetBase) : raw;
  const parsedTheme = themeSchema.safeParse(spec?.theme);
  const theme = parsedTheme.success ? fixTheme(parsedTheme.data) : DEFAULT_THEME;
  const sections = spec?.sections ?? [];
  const concept = conceptOf(spec);

  const rendered = sections.map((raw, i) => {
    const parsed = sectionSchema.safeParse(raw);
    if (!parsed.success) {
      return { key: `pending-${i}`, type: raw?.type, node: streaming && i === sections.length - 1 ? <Skeleton type={raw?.type} /> : null };
    }
    const s = parsed.data;
    const Component = sectionsByType[s.type].Component as ComponentType<SectionProps<unknown>>;
    return {
      key: `${s.id}-${i}`,
      type: s.type,
      node: <Component id={s.id} variant={s.variant} props={s.props} concept={concept === "none" ? undefined : concept} />,
    };
  });
  const head = rendered[0]?.type === "navbar" ? rendered.slice(0, 1) : [];
  const foot = rendered.length > 1 && rendered.at(-1)?.type === "footer" ? rendered.slice(-1) : [];
  const main = rendered.slice(head.length, rendered.length - foot.length);

  return (
    <div
      style={{ ...(themeVars(theme) as CSSProperties), colorScheme: theme.mode }}
      className="min-h-screen bg-site-bg font-body text-site-fg"
    >
      <link rel="stylesheet" href={fontsHref(theme)} precedence="default" />
      {head.map((r) => (
        <Fragment key={r.key}>{r.node}</Fragment>
      ))}
      <main>
        {main.map((r, i) => (
          <Fragment key={r.key}>
            {concept === "ledger-rule" && i > 0 && r.node ? <LedgerRule /> : null}
            {r.node}
          </Fragment>
        ))}
        {streaming && sections.length === 0 ? <Skeleton /> : null}
      </main>
      {foot.map((r) => (
        <Fragment key={r.key}>{r.node}</Fragment>
      ))}
    </div>
  );
}

function Skeleton({ type }: { type?: string }) {
  return (
    <div className="mx-auto max-w-6xl animate-pulse px-6 py-16 md:px-12">
      <p className="text-sm text-site-muted">Writing {type ? `${type} section` : "site"}…</p>
      <div className="mt-6 h-10 w-2/3 rounded-site bg-site-surface" />
      <div className="mt-4 h-4 w-1/2 rounded-site bg-site-surface" />
    </div>
  );
}

export function conceptOf(spec: PartialSpec | null): ConceptId {
  const c = spec?.motion?.concept;
  return (CONCEPT_IDS as string[]).includes(c ?? "") ? (c as ConceptId) : "none";
}
