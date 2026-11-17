/**
 * Motion is labeled like everything else. Sections mark elements with
 * data-motion="<effect>" (the shared quiet layer) and render decorative
 * data-concept="<id>" markup for the page's one signature concept. MotionRoot
 * reads these attributes; nothing animates without them.
 *
 * All motion runs only at 768px and wider with no reduced-motion preference.
 * Otherwise the page is static and fully visible.
 */

export const EFFECTS = {
  reveal: "Fades in and rises 24px once when it scrolls into view (600 ms).",
  "reveal-group": "Its children reveal one after another (80 ms apart).",
  mask: "A photo opens from a smaller inset (700 ms).",
  parallax: "The photo inside drifts slowly as the page scrolls.",
  count: "A real figure counts up to its value (at most 800 ms). The value is in the HTML.",
  draw: "A rule draws across as it scrolls into view.",
  header: "The header hides on scroll down and returns on scroll up (200 ms).",
  spotlight: "Pins the quotes and crossfades one at a time as you scroll (desktop only).",
} as const;

export type Effect = keyof typeof EFFECTS;

export const CONCEPTS = {
  none: "No signature concept; only the shared quiet layer.",
  "airflow-path": "A thin line traces down beside the services list, branching at each service.",
  "pressure-gauge": "A dial beside the how-it-works steps fills as the visitor scrolls through them.",
  "circuit-trace": "Lines draw along the feature cards as each one enters (under 300 ms each).",
  "layer-stack": "Sections stack over each other like shingle courses as the page scrolls.",
  "before-after": "The hero reveals an after photo over a before photo as you scroll. Needs two confirmed photos.",
  "vinyl-on": "A skewed brand-color stripe snaps on left to right in the hero and on the process band.",
  "close-up": "The hero photo slowly pushes in as you scroll; other photos crop in as they enter.",
  "soft-focus": "Photos come into focus as they enter, and short rules draw under section headings.",
  "shelf-slide": "Feature cards slide sideways in a pinned row, like browsing a shelf.",
  "ledger-rule": "Ruled lines draw between sections, and real figures count up.",
} as const;

export type ConceptId = keyof typeof CONCEPTS;
export const CONCEPT_IDS = Object.keys(CONCEPTS) as [ConceptId, ...ConceptId[]];

/** Spread on an element to give it a shared-layer effect. */
export function motion(effect: Effect) {
  return { "data-motion": effect } as const;
}

/** Spread on concept markup. Decorative markup is hidden from assistive tech; content (e.g. a shelf of cards) is not. */
export function conceptAttrs(id: ConceptId, decorative = true) {
  return decorative ? ({ "data-concept": id, "aria-hidden": true } as const) : ({ "data-concept": id } as const);
}
