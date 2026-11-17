import { Vibrant } from "node-vibrant/node";

/**
 * The logo's primary color: the most-used saturated swatch. Raster logos only
 * (SVG isn't decoded); returns null when nothing usable is found.
 */
export async function logoColors(image: Buffer): Promise<{ primary: string; swatches: string[] } | null> {
  try {
    const palette = await Vibrant.from(image).getPalette();
    const swatches = Object.values(palette).filter((s): s is NonNullable<typeof s> => !!s);
    if (!swatches.length) return null;
    const saturated = swatches.filter((s) => s.hsl[1] > 0.25 && s.hsl[2] > 0.12 && s.hsl[2] < 0.88);
    const primary = (saturated.length ? saturated : swatches).sort((a, b) => b.population - a.population)[0];
    return { primary: primary.hex, swatches: swatches.map((s) => s.hex) };
  } catch {
    return null;
  }
}
