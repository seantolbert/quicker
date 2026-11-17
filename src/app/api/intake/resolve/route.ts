import { resolveInput } from "@/lib/intake/link";
import { searchText } from "@/lib/intake/places";

/** Google Maps link, Place ID, or "name, city" → matching places. */
export async function POST(req: Request) {
  const { input } = (await req.json()) as { input?: string };
  if (!input?.trim()) return Response.json({ error: "Paste a Google Maps or Business Profile link" }, { status: 400 });
  try {
    const parsed = await resolveInput(input);
    if (parsed.kind === "place") return Response.json({ candidates: [{ placeId: parsed.placeId, name: "", address: "" }], exact: true });
    const candidates = await searchText(parsed.query, parsed.near);
    if (!candidates.length) return Response.json({ error: `No Google listing found for "${parsed.query}"` }, { status: 404 });
    return Response.json({ candidates, exact: false });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : String(error) }, { status: 400 });
  }
}
