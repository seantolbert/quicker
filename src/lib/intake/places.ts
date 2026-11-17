import { writeFile } from "node:fs/promises";
import type { Candidate } from "./types";

/** Google Places API (New). The key is read from GOOGLE_PLACES_API_KEY and never logged or stored. */
const BASE = "https://places.googleapis.com/v1";

const DETAIL_FIELDS = [
  "id",
  "displayName",
  "formattedAddress",
  "nationalPhoneNumber",
  "websiteUri",
  "regularOpeningHours",
  "rating",
  "userRatingCount",
  "reviews",
  "photos",
  "googleMapsUri",
  "editorialSummary",
  "primaryType",
  "primaryTypeDisplayName",
  "types",
  "businessStatus",
].join(",");

export type PlaceDetails = {
  id: string;
  displayName?: { text: string };
  formattedAddress?: string;
  nationalPhoneNumber?: string;
  websiteUri?: string;
  regularOpeningHours?: { weekdayDescriptions?: string[] };
  rating?: number;
  userRatingCount?: number;
  reviews?: {
    rating?: number;
    text?: { text: string };
    originalText?: { text: string };
    authorAttribution?: { displayName?: string; uri?: string };
    publishTime?: string;
    relativePublishTimeDescription?: string;
    googleMapsUri?: string;
  }[];
  photos?: {
    name: string;
    widthPx?: number;
    heightPx?: number;
    authorAttributions?: { displayName?: string; uri?: string }[];
  }[];
  googleMapsUri?: string;
  editorialSummary?: { text: string };
  primaryType?: string;
  primaryTypeDisplayName?: { text: string };
  types?: string[];
  businessStatus?: string;
};

function key() {
  const k = process.env.GOOGLE_PLACES_API_KEY;
  if (!k) throw new Error("GOOGLE_PLACES_API_KEY is not set. Add it to .env.local (Places API (New) must be enabled).");
  return k;
}

async function places<T>(path: string, init: RequestInit & { fieldMask?: string } = {}): Promise<T> {
  const { fieldMask, ...rest } = init;
  const res = await fetch(`${BASE}/${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": key(),
      ...(fieldMask ? { "X-Goog-FieldMask": fieldMask } : {}),
    },
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
    throw new Error(`Places API ${res.status}: ${body?.error?.message ?? res.statusText}`);
  }
  return (await res.json()) as T;
}

export async function searchText(query: string, near?: { lat: number; lng: number }): Promise<Candidate[]> {
  const data = await places<{ places?: { id: string; displayName?: { text: string }; formattedAddress?: string }[] }>(
    "places:searchText",
    {
      method: "POST",
      fieldMask: "places.id,places.displayName,places.formattedAddress",
      body: JSON.stringify({
        textQuery: query,
        pageSize: 5,
        ...(near
          ? { locationBias: { circle: { center: { latitude: near.lat, longitude: near.lng }, radius: 1000 } } }
          : {}),
      }),
    },
  );
  return (data.places ?? []).map((p) => ({ placeId: p.id, name: p.displayName?.text ?? p.id, address: p.formattedAddress }));
}

export function getPlace(placeId: string) {
  return places<PlaceDetails>(`places/${encodeURIComponent(placeId)}`, { fieldMask: DETAIL_FIELDS });
}

/** Downloads a listing photo to `file`. Returns false if Google has no image for it. */
export async function downloadPhoto(photoName: string, file: string, maxWidthPx = 1600) {
  const res = await fetch(`${BASE}/${photoName}/media?maxWidthPx=${maxWidthPx}`, {
    headers: { "X-Goog-Api-Key": key() },
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok || !res.headers.get("content-type")?.startsWith("image/")) return false;
  await writeFile(file, Buffer.from(await res.arrayBuffer()));
  return true;
}
