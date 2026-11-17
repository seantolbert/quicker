import { copyFile, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Direction } from "@/lib/intake/types";
import { CONCEPTS } from "@/sections/_motion/vocabulary";
import { sectionsByType } from "@/sections/registry";
import { collectAssets } from "@/spec/assets";
import type { StoredSpec } from "@/spec/schema";
import { themeVars, type FontName } from "@/spec/theme";
import { agentsMd } from "./agents-md";
import { buildManifest, componentName, SECTIONS_DIR } from "./manifest";

const BUILDER_ROOT = process.cwd();
const SOURCE_SECTIONS = path.join(BUILDER_ROOT, "src", "sections");

export const EXPORT_ROOT = process.env.QUICKER_EXPORT_DIR ?? path.join(BUILDER_ROOT, "exports");

/** Files under a sections subfolder, recursively, as paths relative to src/sections. Tests are skipped. */
async function listFiles(rel: string): Promise<string[]> {
  const entries = await readdir(path.join(SOURCE_SECTIONS, rel), { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((e) =>
      e.isDirectory() ? listFiles(`${rel}/${e.name}`) : Promise.resolve(/\.test\./.test(e.name) ? [] : [`${rel}/${e.name}`]),
    ),
  );
  return nested.flat();
}

const concept = (spec: StoredSpec) => spec.motion?.concept ?? "none";

/** Every file of the exported Next.js project, keyed by relative path. */
export async function buildExportFiles(spec: StoredSpec, direction: Direction | null = null): Promise<Map<string, string>> {
  const files = new Map<string, string>();
  const types = [...new Set(spec.sections.map((s) => s.type))];

  // Section components and the motion runtime: verbatim copies of the
  // builder's library, so the exported site matches the preview exactly.
  const shared = ["labels.ts", ...(await listFiles("_shared")), ...(await listFiles("_motion"))];
  const sectionFiles = types.flatMap((t) => [`${t}/schema.ts`, `${t}/${sectionsByType[t].file}`]);
  for (const rel of [...shared, ...sectionFiles]) {
    files.set(`${SECTIONS_DIR}/${rel}`, await readFile(path.join(SOURCE_SECTIONS, rel), "utf8"));
  }
  files.set("src/app/tokens.css", await readFile(path.join(SOURCE_SECTIONS, "tokens.css"), "utf8"));

  const manifest = buildManifest(spec);
  files.set("site.manifest.json", JSON.stringify(manifest, null, 2) + "\n");
  files.set(`intake/${spec.slug}.direction.json`, directionFile(spec, direction));
  files.set("AGENTS.md", agentsMd(manifest));
  files.set("CLAUDE.md", "@AGENTS.md\n");
  files.set("src/content/site.ts", contentFile(spec));
  files.set("src/app/page.tsx", pageFile(spec));
  files.set("src/app/layout.tsx", layoutFile(spec));
  files.set("src/app/globals.css", globalsCss(spec));
  files.set("package.json", await packageJson(spec));
  files.set("next.config.ts", NEXT_CONFIG);
  files.set("tsconfig.json", TSCONFIG);
  files.set(".gitignore", GITIGNORE);
  files.set("README.md", `# ${spec.meta.name}\n\n${spec.meta.description}\n\n\`\`\`\nnpm install\nnpm run dev\n\`\`\`\n\nSee AGENTS.md for how the site is labeled and where to edit things.\n`);
  return files;
}

/**
 * Writes the export to exports/<slug>/. Generated files are replaced; installed
 * dependencies and the .vercel project link are kept so redeploys update the
 * same Vercel project. Photos and logos the spec uses are copied from
 * `assetsDir` (the project folder) into public/.
 */
export async function writeExport(spec: StoredSpec, assetsDir?: string, direction: Direction | null = null) {
  const out = path.join(/*turbopackIgnore: true*/ EXPORT_ROOT, spec.slug);
  await rm(path.join(out, "src"), { recursive: true, force: true });
  await rm(path.join(out, "public"), { recursive: true, force: true });
  for (const asset of assetsDir ? collectAssets(spec) : []) {
    const file = path.join(out, "public", asset);
    await mkdir(path.dirname(file), { recursive: true });
    await copyFile(path.join(/*turbopackIgnore: true*/ assetsDir!, asset), file);
  }
  for (const [rel, content] of await buildExportFiles(spec, direction)) {
    const file = path.join(out, rel);
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, content);
  }
  return out;
}

// --- generated files -------------------------------------------------------

function contentFile(spec: StoredSpec) {
  const types = [...new Set(spec.sections.map((s) => s.type))];
  const imports = types
    .map((t) => `import type { ${sectionsByType[t].propsType} } from "@/components/sections/${t}/schema";`)
    .join("\n");
  const entries = spec.sections
    .map((s) => `  // @section ${s.id} (${s.type}/${s.variant})\n  "${s.id}": ${indent(JSON.stringify(s.props, null, 2), 2)} satisfies ${sectionsByType[s.type].propsType},`)
    .join("\n\n");
  return `${imports}

/** Site-wide metadata. */
export const site = ${JSON.stringify(spec.meta, null, 2)};

/**
 * Content for every section, keyed by section ID (matches data-section-id in
 * the DOM and the @section comments in src/app/page.tsx).
 */
export const sections = {
${entries}
};
`;
}

function pageFile(spec: StoredSpec) {
  const types = [...new Set(spec.sections.map((s) => s.type))];
  const c = concept(spec);
  const conceptProp = c === "none" ? "" : ` concept="${c}"`;
  const imports = types
    .map((t) => {
      const name = componentName(sectionsByType[t].file);
      return `import { ${name} } from "@/components/sections/${t}/${name}";`;
    })
    .join("\n");
  const line = (s: StoredSpec["sections"][number], pad: string) => {
    const name = componentName(sectionsByType[s.type].file);
    return `${pad}{/* @section ${s.id} (${s.type}/${s.variant}) */}\n${pad}<${name} id="${s.id}" variant="${s.variant}" props={sections["${s.id}"]}${conceptProp} />`;
  };
  // ledger-rule draws a ruled line between main sections.
  const ledger = c === "ledger-rule";
  const joinMain = (lines: string[]) => lines.join(ledger ? "\n        <LedgerRule />\n" : "\n");

  const all = spec.sections;
  const head = all[0]?.type === "navbar" ? [all[0]] : [];
  const foot = all.at(-1)?.type === "footer" && all.length > 1 ? [all.at(-1)!] : [];
  const main = all.slice(head.length, all.length - foot.length);

  return `${imports}${ledger ? '\nimport { LedgerRule } from "@/components/sections/_shared/concepts/LedgerRule";' : ""}
import { sections } from "@/content/site";

export default function Home() {
  return (
    <>
${head.map((s) => line(s, "      ")).join("\n")}
      <main>
${joinMain(main.map((s) => line(s, "        ")))}
      </main>
${foot.map((s) => line(s, "      ")).join("\n")}
    </>
  );
}
`;
}

const fontImport = (font: FontName) => font.replace(/ /g, "_");

function layoutFile(spec: StoredSpec) {
  const { heading, body } = spec.theme.fonts;
  const same = heading === body;
  const imports = same ? fontImport(heading) : `${fontImport(heading)}, ${fontImport(body)}`;
  const decl = (v: string, font: FontName, cssVar: string) =>
    `const ${v} = ${fontImport(font)}({ subsets: ["latin"], variable: "${cssVar}", display: "swap" });`;
  return `import type { Metadata } from "next";
import { ${imports} } from "next/font/google";
import { MotionRoot } from "@/components/sections/_motion/MotionRoot";
import { site } from "@/content/site";
import "./globals.css";

${decl("headingFont", heading, "--font-heading-src")}
${same ? "" : decl("bodyFont", body, "--font-body-src")}

export const metadata: Metadata = {
  title: site.name,
  description: site.description,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={${same ? "headingFont.variable" : "`${headingFont.variable} ${bodyFont.variable}`"}}>
      <body>
        {/* Smooth scroll and scroll motion (desktop, no reduced motion). Concept: ${concept(spec)}, see intake/${spec.slug}.direction.json */}
        <MotionRoot concept="${concept(spec)}">{children}</MotionRoot>
      </body>
    </html>
  );
}
`.replace(/\n\n\n/g, "\n\n");
}

/** The site's direction file: where its motion concept comes from. */
function directionFile(spec: StoredSpec, direction: Direction | null) {
  const c = concept(spec);
  const data = direction
    ? { ...direction, motion: { concept: c, description: CONCEPTS[c] } }
    : { source: "prompt", trade: null, theme: spec.theme, motion: { concept: c, description: CONCEPTS[c] } };
  return JSON.stringify(data, null, 2) + "\n";
}

function globalsCss(spec: StoredSpec) {
  const same = spec.theme.fonts.heading === spec.theme.fonts.body;
  const vars = themeVars(spec.theme, {
    heading: "var(--font-heading-src)",
    body: same ? "var(--font-heading-src)" : "var(--font-body-src)",
  });
  const decls = Object.entries(vars)
    .map(([k, v]) => `  ${k}: ${v};`)
    .join("\n");
  return `@import "tailwindcss";
@import "./tokens.css";

/* Theme generated from the site spec. Change colors, fonts, and radius here. */
:root {
  color-scheme: ${spec.theme.mode};
${decls}
}
`;
}

async function packageJson(spec: StoredSpec) {
  const builder = JSON.parse(await readFile(path.join(BUILDER_ROOT, "package.json"), "utf8"));
  const pick = (names: string[], from: Record<string, string>) =>
    Object.fromEntries(names.map((n) => [n, from[n] ?? builder.dependencies[n] ?? builder.devDependencies[n]]));
  const pkg = {
    name: spec.slug,
    version: "0.1.0",
    private: true,
    scripts: { dev: "next dev", build: "next build", start: "next start" },
    // lenis and gsap are pinned exactly (see the builder's CLAUDE.md).
    dependencies: pick(["gsap", "lenis", "next", "react", "react-dom"], builder.dependencies),
    devDependencies: pick(
      ["@tailwindcss/turbopack", "@types/node", "@types/react", "@types/react-dom", "tailwindcss", "typescript", "zod"],
      builder.devDependencies,
    ),
  };
  return JSON.stringify(pkg, null, 2) + "\n";
}

function indent(text: string, spaces: number) {
  return text.replace(/\n/g, `\n${" ".repeat(spaces)}`);
}

const NEXT_CONFIG = `import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
`;

const TSCONFIG = `${JSON.stringify(
  {
    compilerOptions: {
      target: "ES2017",
      lib: ["dom", "dom.iterable", "esnext"],
      allowJs: true,
      skipLibCheck: true,
      strict: true,
      noEmit: true,
      esModuleInterop: true,
      module: "esnext",
      moduleResolution: "bundler",
      resolveJsonModule: true,
      isolatedModules: true,
      jsx: "react-jsx",
      incremental: true,
      plugins: [{ name: "next" }],
      paths: { "@/*": ["./src/*"] },
    },
    include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts", ".next/dev/types/**/*.ts", "**/*.mts"],
    exclude: ["node_modules"],
  },
  null,
  2,
)}\n`;

const GITIGNORE = `/node_modules
/.next/
/out/
.DS_Store
*.tsbuildinfo
next-env.d.ts
.env*
.vercel
`;
