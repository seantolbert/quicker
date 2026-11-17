import { readFile } from "node:fs/promises";
import path from "node:path";
import { directionConcept } from "@/lib/intake/direction";
import type { Direction, Intake } from "@/lib/intake/types";

const MAX_IMAGES = 8;

type Part = { type: "text"; text: string } | { type: "file"; mediaType: string; data: Buffer };

/**
 * The user message for a Google Business Profile project: facts, reviews,
 * website wording, the fixed design direction, and the photos themselves so
 * the model can choose and describe them.
 */
export async function intakeMessage(projectDir: string, intake: Intake, direction: Direction | null, notes: string) {
  const b = intake.business;
  const c = intake.contact;
  const lines = [
    "Build the website for this business from its Google Business Profile and its own website.",
    notes.trim() ? `\n## Owner notes (follow these)\n${notes.trim()}` : "",
    "\n## Facts (source of truth: never contradict them or add facts that aren't here)",
    `- Name: ${b.name}`,
    b.type_label ? `- Category: ${b.type_label}` : "",
    c.address ? `- Address: ${c.address}` : "",
    c.phone ? `- Phone: ${c.phone}` : "- Phone: none listed",
    c.email ? `- Email: ${c.email}` : "- Email: none found. Omit email; contact uses phone and address.",
    c.website ? `- Website: ${c.website}` : "",
    b.rating ? `- Google rating: ${b.rating} from ${b.review_count ?? "?"} reviews` : "",
    b.summary ? `- Google summary: ${b.summary}` : "",
    intake.hours.length ? `- Hours:\n${intake.hours.map((h) => `  - ${h}`).join("\n")}` : "- Hours: not listed",
  ];

  if (intake.website && !intake.website.robots_blocked) {
    lines.push(
      "\n## From their website (their services and their own words; match this voice)",
      intake.website.description ? `Description: ${intake.website.description}` : "",
      intake.services.length ? `Headings: ${intake.services.map((s) => s.name).join(" | ")}` : "",
      intake.website.excerpt ? `Page text (excerpt):\n${intake.website.excerpt.slice(0, 4000)}` : "",
    );
  }

  if (intake.reviews.length) {
    lines.push(
      "\n## Google reviews",
      "Testimonials must quote these verbatim: the exact words, or one contiguous excerpt of them. Use the reviewer's name as shown. Anything else is rejected.",
      ...intake.reviews.map((r, i) => `${i + 1}. ${"★".repeat(r.rating)} ${r.author}${r.relative_date ? ` (${r.relative_date})` : ""}: "${r.text}"`),
    );
  }

  if (direction) {
    lines.push(
      "\n## Design direction (fixed)",
      `- Trade: ${direction.trade_label}`,
      `- Copy voice: ${direction.copy_voice}`,
      `- Theme: output exactly ${JSON.stringify(direction.theme)}`,
      `- Motion: output exactly {"concept":"${directionConcept(direction)}"}, and include the section that concept lives in`,
      direction.hero_image ? `- Suggested hero photo: ${direction.hero_image}` : "",
    );
  }

  const images = intake.images.slice(0, MAX_IMAGES);
  if (images.length) {
    lines.push(
      "\n## Photos (attached below, each after its ID)",
      "Set media.photo to the ID that fits each slot and write alt text describing what the photo actually shows. Use each photo at most once. Skip photos that are blurry, dark, or show people's faces up close.",
      ...images.map(
        (img) =>
          `- ${img.id}: ${img.width && img.height ? `${img.width}×${img.height}, ` : ""}${img.origin === "google_places" ? "Google listing" : "their website"}`,
      ),
    );
  } else {
    lines.push("\n## Photos\nNone available. Leave media.photo empty; write alt text for the photo the owner should add.");
  }

  const content: Part[] = [{ type: "text", text: lines.filter(Boolean).join("\n") }];
  for (const img of images) {
    const data = await readFile(path.join(projectDir, img.path)).catch(() => null);
    if (!data) continue;
    const ext = path.extname(img.path).slice(1);
    content.push({ type: "text", text: img.id });
    content.push({ type: "file", mediaType: `image/${ext === "jpg" ? "jpeg" : ext}`, data });
  }
  return { role: "user" as const, content };
}
