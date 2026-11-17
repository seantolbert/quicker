import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { logoColors } from "./colors";
import { buildDirection } from "./direction";
import { downloadPhoto, getPlace } from "./places";
import { USER_AGENT } from "./robots";
import type { Direction, ImageRecord, Intake } from "./types";
import { readWebsite, type WebsiteInfo } from "./website";

const MAX_PHOTOS = 10;
const EXT: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif", "image/svg+xml": "svg" };

async function downloadImage(url: string, fileBase: string) {
  // Prefer PNG/JPEG: CDNs (e.g. Squarespace) otherwise negotiate WebP, which the color extractor can't decode.
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, Accept: "image/png,image/jpeg;q=0.9,image/*;q=0.5" },
    signal: AbortSignal.timeout(15_000),
  });
  const type = res.headers.get("content-type")?.split(";")[0] ?? "";
  if (!res.ok || !EXT[type]) return null;
  const data = Buffer.from(await res.arrayBuffer());
  if (data.length > 5_000_000) return null;
  const file = `${fileBase}.${EXT[type]}`;
  await writeFile(file, data);
  return { file, data, type };
}

const digits = (s: string) => s.replace(/\D/g, "").replace(/^1(?=\d{10}$)/, "");

/**
 * Collects everything public about a business into data/projects/<id>/:
 * intake.json, direction.json, photos/, brand/. Follows the
 * client-site-intake and industry-design-direction skills.
 */
export async function buildIntake(projectDir: string, placeId: string): Promise<{ intake: Intake; direction: Direction }> {
  const place = await getPlace(placeId);
  const name = place.displayName?.text ?? "Business";
  const questions: string[] = [];
  const source: Record<string, string> = {
    business: "google_places",
    contact: "google_places",
    hours: "google_places",
    reviews: "google_places",
  };

  // Listing photos: demo use only.
  await mkdir(path.join(projectDir, "photos"), { recursive: true });
  await mkdir(path.join(projectDir, "brand"), { recursive: true });
  const images: ImageRecord[] = [];
  for (const [i, photo] of (place.photos ?? []).slice(0, MAX_PHOTOS).entries()) {
    const rel = `photos/photo-${i + 1}.jpg`;
    if (!(await downloadPhoto(photo.name, path.join(projectDir, rel)).catch(() => false))) continue;
    images.push({
      id: `photo-${i + 1}`,
      path: rel,
      origin: "google_places",
      rights_status: "sample_only",
      alt: `Photo from ${name}'s Google listing`,
      width: photo.widthPx,
      height: photo.heightPx,
      attribution: (photo.authorAttributions ?? []).map((a) => ({ name: a.displayName ?? "Google user", uri: a.uri })),
    });
  }

  // The business's own website.
  let site: WebsiteInfo | null = null;
  let logo: ImageRecord | null = null;
  let colors: Intake["colors"] = { swatches: [], source: "none" };
  if (place.websiteUri) {
    source.website = "website";
    site = await readWebsite(place.websiteUri).catch((err) => {
      questions.push(`Couldn't read ${place.websiteUri} (${err instanceof Error ? err.message : err}).`);
      return null;
    });
    if (site?.robotsBlocked) questions.push(`${site.url} disallows crawling in robots.txt; nothing was read from it.`);

    if (site?.logoUrl) {
      const got = await downloadImage(site.logoUrl, path.join(projectDir, "brand", "logo")).catch(() => null);
      if (got) {
        logo = {
          id: "logo",
          path: path.relative(projectDir, got.file),
          origin: "website",
          source_url: site.logoUrl,
          rights_status: "pending_client_confirmation",
          alt: `${name} logo`,
          attribution: [{ name }],
        };
        const extracted = got.type === "image/svg+xml" ? null : await logoColors(got.data);
        if (extracted) colors = { ...extracted, source: "logo" };
      }
    }
    if (!logo) questions.push("No logo found on the website. Ask the owner for a logo file.");
    if (site?.themeColor) {
      colors.theme_color = site.themeColor;
      if (!colors.primary && /^#[0-9a-f]{6}$/i.test(site.themeColor)) colors = { ...colors, primary: site.themeColor, source: "theme-color" };
    }

    if (site?.ogImage && site.ogImage !== site.logoUrl) {
      const got = await downloadImage(site.ogImage, path.join(projectDir, "photos", "site-1")).catch(() => null);
      if (got && got.type !== "image/svg+xml") {
        images.unshift({
          id: "site-1",
          path: path.relative(projectDir, got.file),
          origin: "website",
          source_url: site.ogImage,
          rights_status: "pending_client_confirmation",
          alt: `Image from ${name}'s website`,
          attribution: [{ name }],
        });
      }
    }
  } else {
    questions.push("No website on the Google listing; services and copy voice come from Google data and reviews only.");
  }

  // Sources disagree → keep both and ask.
  const googlePhone = place.nationalPhoneNumber;
  const sitePhone = site?.phones.find((p) => digits(p).length >= 10);
  const phoneMismatch = googlePhone && sitePhone && digits(googlePhone) !== digits(sitePhone);
  if (phoneMismatch) questions.push(`Phone differs: Google has ${googlePhone}, the website has ${sitePhone}. Which is right?`);

  const domain = place.websiteUri ? new URL(place.websiteUri).hostname.replace(/^www\./, "") : null;
  const email = site?.emails.find((e) => domain && e.endsWith(domain)) ?? site?.emails[0];
  if (!email) questions.push("No public email found; the contact section shows phone and address only (no form).");

  const reviews = (place.reviews ?? [])
    .filter((r) => r.text?.text)
    .map((r) => ({
      author: r.authorAttribution?.displayName ?? "Google user",
      author_uri: r.authorAttribution?.uri,
      rating: r.rating ?? 0,
      text: r.text!.text,
      date: r.publishTime,
      relative_date: r.relativePublishTimeDescription,
      link: r.googleMapsUri ?? place.googleMapsUri,
      attribution: "Google" as const,
    }));
  if (!reviews.length) questions.push("No review text came back from Google; testimonials will be skipped or marked as placeholders.");
  if (images.every((i) => i.rights_status === "sample_only")) {
    questions.push("Every photo is from the Google listing (sample only). Ask the owner to upload their own photos before launch.");
  }
  if (site?.facebookUrl) questions.push(`Facebook page found (${site.facebookUrl}). Recorded only; ask the owner for access or an export.`);
  questions.push("Review text is Google content: re-fetch rather than keeping it long-term, and check current Places API terms.");

  const intake: Intake = {
    retrieved_at: new Date().toISOString(),
    place_id: place.id,
    source,
    business: {
      name,
      primary_type: place.primaryType,
      type_label: place.primaryTypeDisplayName?.text,
      types: place.types ?? [],
      summary: place.editorialSummary?.text,
      rating: place.rating,
      review_count: place.userRatingCount,
      maps_url: place.googleMapsUri,
      business_status: place.businessStatus,
    },
    contact: {
      phone: googlePhone,
      phone_website: phoneMismatch ? sitePhone : undefined,
      address: place.formattedAddress,
      email,
      website: place.websiteUri,
    },
    hours: place.regularOpeningHours?.weekdayDescriptions ?? [],
    services: (site?.headings ?? []).slice(0, 12).map((h) => ({ name: h })),
    reviews,
    images,
    logo,
    colors,
    website: site
      ? {
          url: site.url,
          title: site.title,
          description: site.description,
          excerpt: site.excerpt,
          pages: site.pages,
          robots_blocked: site.robotsBlocked,
        }
      : null,
    facebook_url: site?.facebookUrl ?? null,
    open_questions: questions,
  };
  if (place.businessStatus && place.businessStatus !== "OPERATIONAL") {
    intake.open_questions.unshift(`Google lists this business as ${place.businessStatus}.`);
  }

  const direction = buildDirection(intake);
  await writeFile(path.join(projectDir, "intake.json"), JSON.stringify(intake, null, 2) + "\n");
  await writeFile(path.join(projectDir, "direction.json"), JSON.stringify(direction, null, 2) + "\n");
  return { intake, direction };
}
