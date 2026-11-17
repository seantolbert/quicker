/**
 * Turns whatever the user pasted into something the Places API can resolve:
 * a Place ID, or a text query with optional coordinates to bias the search.
 */
export type ParsedInput =
  | { kind: "place"; placeId: string }
  | { kind: "query"; query: string; near?: { lat: number; lng: number } }
  | { kind: "redirect"; url: string };

const PLACE_ID = /^(ChIJ|GhIJ|EiI|Ei)[\w-]{10,}$/;
const SHORT_HOSTS = ["maps.app.goo.gl", "goo.gl", "g.page", "g.co", "share.google"];

export function parseInput(raw: string): ParsedInput {
  const input = raw.trim();
  if (PLACE_ID.test(input)) return { kind: "place", placeId: input };

  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(input) ? input : `https://${input}`);
    if (!url.hostname.includes(".") || /\s/.test(input)) throw new Error("not a url");
  } catch {
    return { kind: "query", query: input };
  }

  const host = url.hostname.replace(/^www\./, "");
  if (SHORT_HOSTS.some((h) => host === h || host.endsWith(`.${h}`))) return { kind: "redirect", url: url.toString() };

  // Consent interstitial: the real URL is in ?continue=
  const cont = url.searchParams.get("continue");
  if (host.startsWith("consent.") && cont) return parseInput(cont);

  const placeId = url.searchParams.get("query_place_id") ?? url.searchParams.get("place_id");
  if (placeId) return { kind: "place", placeId };

  // /maps/place/<name>/@lat,lng,zoom/data=…!3d<lat>!4d<lng>…
  const name = url.pathname.match(/\/maps\/place\/([^/]+)/)?.[1];
  const exact = url.href.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
  const view = url.pathname.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  const coords = exact ?? view;
  const near = coords ? { lat: Number(coords[1]), lng: Number(coords[2]) } : undefined;
  if (name) return { kind: "query", query: decodeURIComponent(name.replace(/\+/g, " ")), near };

  // /maps/search/?api=1&query=… or google.com/search?q=… (Business Profile share links)
  const q = url.searchParams.get("query") ?? url.searchParams.get("q");
  if (q) return { kind: "query", query: q, near };

  if (url.searchParams.get("cid") || url.searchParams.get("ludocid")) {
    throw new Error("That link only has a Google customer ID. Paste the business name and city instead.");
  }
  if (host.includes("google.")) return { kind: "redirect", url: url.toString() };
  throw new Error("That doesn't look like a Google Maps or Business Profile link. Paste the link, a Place ID, or the business name and city.");
}

/** Follows a short or share link once and parses where it lands. */
export async function resolveInput(raw: string): Promise<Exclude<ParsedInput, { kind: "redirect" }>> {
  const parsed = parseInput(raw);
  if (parsed.kind !== "redirect") return parsed;
  const res = await fetch(parsed.url, { redirect: "follow", signal: AbortSignal.timeout(10_000) });
  const landed = parseInput(res.url);
  if (landed.kind === "redirect") {
    throw new Error("Couldn't read the business from that link. Open it, copy the full Google Maps URL, and paste that instead.");
  }
  return landed;
}
