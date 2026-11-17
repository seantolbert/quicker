# Quicker

One prompt in, a working single-page website out. Every section and component in the output is labeled
(`data-section-id`, `data-component`), so an agent can find and edit "the hero headline" or "pricing tier 2" by ID.

## Setup

```bash
cp .env.local.example .env.local   # add AI_GATEWAY_API_KEY (or ANTHROPIC_API_KEY) and GOOGLE_PLACES_API_KEY
npm install
npm run dev                        # http://localhost:3000
```

Deploying needs the Vercel CLI, logged in (`npm i -g vercel@latest && vercel login`).

## From a Google Business Profile

Paste a Maps or Business Profile link (short `maps.app.goo.gl` links, `/maps/place/` URLs, Place IDs, or "name, city").
This follows the `client-site-intake` and `industry-design-direction` skills:

1. **Intake** (`src/lib/intake/build.ts`) pulls Places details, up to 5 reviews, and up to 10 listing photos (`sample_only`). It also reads the
   business's own site (home plus up to 2 about/services pages, within robots.txt) for the logo, email, services, and wording, and extracts the
   logo's primary color. The result is saved to `data/projects/<id>/intake.json`, with `open_questions` wherever the sources disagree or have gaps.
2. **Direction** (`src/lib/intake/direction.ts`) detects the trade. It builds the palette from the trade's base tones with the logo color as the accent (contrast checked),
   uses the trade's approved fonts, and sets the copy voice. You review a summary card before generating.
3. **Generation** sends the facts, verbatim reviews, website text, and the photos themselves to the model, so it can choose and describe the photos.
4. **Enforcement** (`src/lib/intake/enforce.ts`) makes the output agree with the sources. Phone, address, hours, email, and logo come from the intake.
   Testimonials survive only as verbatim quotes, re-attributed to the real reviewer with a link. Stats survive only if their numbers appear in the
   sources. Photo IDs resolve to files with rights labels and credits.
5. **Rights:** Google listing photos show "Sample imagery for …" and website images show "pending confirmation". **Production deploy is
   blocked** until every image used has `rights_status: "client_confirmed"` in `intake.json`. Preview deploys work for demos.

## Motion

Every site gets one **signature concept** from its direction (e.g. the pressure gauge for plumbers, close-up for restaurants) plus a quiet
shared layer: reveals, photo masks and parallax, count-ups on real figures, and Lenis smooth scroll. Like the labels, motion is declared with
attributes (`data-motion`, `data-concept`) and run by one client component, `src/sections/_motion/MotionRoot.tsx` (GSAP and ScrollTrigger).
It runs only at 768px and wider with no reduced-motion preference; otherwise the page is static and fully visible. Use the builder's
**Motion** switch to preview the static version. The trades come from the `industry-design-direction` skill. Food & drink, Beauty & wellness,
Retail, and Professional services are Quicker's own general presets.

## How it works

1. The model (AI SDK 7 through the Vercel AI Gateway) writes a **site spec**: JSON that picks sections from a fixed library and fills in copy and theme. It does not write code.
2. The spec streams into a preview iframe, which renders each section as soon as its props validate.
3. The final spec is validated with Zod and normalized: stable `<type>-<n>` IDs and WCAG contrast fixes. It is then saved to `data/projects/<id>/`, with every version kept.
4. **Export** writes a standalone Next.js project to `exports/<slug>/`, containing the section components, `src/content/site.ts` (all copy keyed by section ID), `site.manifest.json`, and an `AGENTS.md` that maps every labeled section.
5. **Deploy** runs `vercel deploy` in that folder.

## Where things live

| Path | What |
| --- | --- |
| `src/sections/<type>/` | Section library: `schema.ts` (props), `<Name>.tsx` (markup), `index.ts` (registry entry with variants and declared labels) |
| `src/sections/registry.ts` | The list of sections the generator can use |
| `src/sections/labels.ts` | `sectionAttrs()` and `cmp()`: the labeling contract |
| `src/spec/` | SiteSpec schema, theme and fonts, normalization, prompt catalog |
| `src/lib/ai/prompt.ts` | System prompt and model (`QUICKER_MODEL`) |
| `src/lib/export/` | Exporter, manifest, AGENTS.md generator |

## Adding a section type

1. Create `src/sections/<type>/` with `schema.ts`, a component, and `index.ts` using `defineSection`.
2. Spread `sectionAttrs(...)` on the root and `cmp("<type>.<name>")` on every part. List each name in `components`.
3. Add it to `registry.ts`, and add an instance to `src/spec/fixture.ts`.
4. Run `npm test`. The labeling test fails if a component uses a label it didn't declare.

## Scripts

`npm run dev` · `npm test` · `npm run typecheck` · `npm run lint` · `npm run build`
