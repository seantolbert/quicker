import type { StoredSpec } from "@/spec/schema";
import { directionConcept } from "./direction";
import type { Direction, ImageRecord, Intake } from "./types";

type Json = Record<string, unknown>;

const normQuote = (s: string) =>
  s
    .toLowerCase()
    .replace(/[“”"«»]/g, "")
    .replace(/[‘’]/g, "'")
    .replace(/…|\.\.\./g, "")
    .replace(/\s+/g, " ")
    .trim();

function credit(img: ImageRecord, business: string) {
  const by = img.attribution.map((a) => a.name).join(", ") || "Google user";
  if (img.rights_status === "client_confirmed") return img.origin === "google_places" ? `Photo: ${by}` : undefined;
  if (img.origin === "google_places") return `Sample imagery for ${business}, to be replaced with your photos. Photo: ${by} via Google.`;
  return `From ${business}'s website. Pending confirmation that it can be used.`;
}

/** Walks every object in the spec. */
function walk(node: unknown, visit: (obj: Json) => void) {
  if (Array.isArray(node)) node.forEach((n) => walk(n, visit));
  else if (node && typeof node === "object") {
    visit(node as Json);
    Object.values(node).forEach((v) => walk(v, visit));
  }
}

/** Removes fields only the app may set, so the model can't hotlink images or fake attributions. */
export function stripAppFields(spec: StoredSpec): StoredSpec {
  const out = structuredClone(spec);
  walk(out.sections, (obj) => {
    if ("alt" in obj) for (const k of ["src", "rights", "credit", "photo"]) delete obj[k];
    if ("quote" in obj) for (const k of ["authorUrl", "sourceUrl"]) delete obj[k];
  });
  for (const s of out.sections ?? []) if (s.type === "navbar") delete s.props.logo;
  return settleConcept(out);
}

/**
 * Concepts that need material the page doesn't have fall back to "none":
 * before-after needs two client-confirmed photos in the hero.
 */
export function settleConcept(spec: StoredSpec): StoredSpec {
  if (spec.motion?.concept !== "before-after") return spec;
  const hero = spec.sections?.find((s) => s.type === "hero");
  const ok =
    hero?.props.media.rights === "client_confirmed" &&
    hero.props.compareMedia?.rights === "client_confirmed" &&
    !!hero.props.media.src &&
    !!hero.props.compareMedia.src;
  return ok ? spec : { ...spec, motion: { concept: "none" } };
}

/**
 * Makes the generated spec agree with the intake: the facts come from the
 * sources, never from the model. Applied after normalizeSpec.
 */
export function applyIntake(input: StoredSpec, intake: Intake, direction: Direction | null): StoredSpec {
  const spec = structuredClone(input);
  const name = intake.business.name;
  const images = new Map(intake.images.map((i) => [i.id, i]));
  const phone = intake.contact.phone;
  const tel = phone ? `tel:${phone.replace(/[^\d+]/g, "")}` : undefined;
  const contactId = spec.sections.find((s) => s.type === "contact")?.id;

  if (direction) {
    spec.theme = direction.theme;
    spec.motion = { concept: directionConcept(direction) };
  }

  // Photos: resolve IDs to files with rights and credit; drop unknown IDs.
  const hero = spec.sections.find((s) => s.type === "hero");
  if (hero && !hero.props.media.photo && direction?.hero_image) hero.props.media.photo = direction.hero_image;
  walk(spec.sections, (obj) => {
    if (!("alt" in obj)) return;
    for (const k of ["src", "rights", "credit"]) delete obj[k];
    const img = typeof obj.photo === "string" ? images.get(obj.photo) : undefined;
    if (!img) {
      delete obj.photo;
      return;
    }
    obj.src = `/${img.path}`;
    obj.rights = img.rights_status;
    const text = credit(img, name);
    if (text) obj.credit = text;
  });

  // Links: phone and email always match the sources.
  walk(spec.sections, (obj) => {
    const href = obj.href;
    if (typeof href !== "string") return;
    if (href.startsWith("tel:")) obj.href = tel ?? (contactId ? `#${contactId}` : "#");
    if (href.startsWith("mailto:")) {
      obj.href = intake.contact.email ? `mailto:${intake.contact.email}` : (tel ?? (contactId ? `#${contactId}` : "#"));
    }
  });

  const facts = factNumbers(intake);
  for (const s of spec.sections) {
    switch (s.type) {
      case "navbar":
        if (phone) s.props.phone = phone;
        if (intake.logo) s.props.logo = { src: `/${intake.logo.path}`, alt: `${name} logo` };
        else delete s.props.logo;
        break;
      case "contact":
        if (phone) s.props.phone = phone;
        if (intake.contact.address) s.props.address = intake.contact.address;
        if (intake.hours.length) s.props.hours = intake.hours;
        if (intake.contact.email) s.props.email = intake.contact.email;
        else delete s.props.email;
        break;
      case "testimonials": {
        // Only verbatim quotes from real reviews count as real.
        const matched = s.props.items.flatMap((item) => {
          const q = normQuote(item.quote);
          const review = intake.reviews.find((r) => q.length >= 12 && normQuote(r.text).includes(q));
          if (!review) return [];
          return [
            {
              ...item,
              name: review.author,
              rating: review.rating || undefined,
              source: "Google",
              sourceUrl: review.link,
              authorUrl: review.author_uri,
            },
          ];
        });
        if (matched.length) s.props = { ...s.props, items: matched, placeholder: false };
        else s.props.placeholder = true;
        break;
      }
      case "stats":
        if (!s.props.placeholder) {
          const ok = s.props.items.every((i) => (i.value.match(/\d+(?:\.\d+)?/g) ?? []).every((n) => facts.has(n)));
          if (!ok) s.props.placeholder = true;
        }
        break;
    }
  }
  return settleConcept(spec);
}

/** Every number that appears in the sources, e.g. "4.8", "212". */
export function factNumbers(intake: Intake) {
  const text = [
    intake.business.rating,
    intake.business.review_count,
    intake.business.summary,
    intake.website?.excerpt,
    intake.website?.description,
    intake.services.map((s) => s.name).join(" "),
    intake.reviews.map((r) => r.text).join(" "),
    intake.hours.join(" "),
  ].join(" ");
  const numbers = new Set(text.replace(/,(?=\d{3})/g, "").match(/\d+(?:\.\d+)?/g) ?? []);
  // Derived from the hours: days open per week (so "Open 7 days" or "24/7" check out).
  const openDays = intake.hours.filter((h) => !/closed/i.test(h)).length;
  if (openDays) numbers.add(String(openDays));
  return numbers;
}
