import { describe, expect, it } from "vitest";
import { parseInput } from "./link";

describe("parseInput", () => {
  it("reads name and exact coordinates from a /maps/place URL", () => {
    expect(
      parseInput(
        "https://www.google.com/maps/place/Rio+Grande+Plumbing/@30.2601,-97.7301,17z/data=!3m1!4b1!4m6!3m5!1s0x0:0x1!8m2!3d30.2605!4d-97.7299!16s",
      ),
    ).toEqual({ kind: "query", query: "Rio Grande Plumbing", near: { lat: 30.2605, lng: -97.7299 } });
  });

  it("decodes encoded names", () => {
    expect(parseInput("https://www.google.com/maps/place/Caf%C3%A9+Ol%C3%A9/@1.5,2.5,15z")).toMatchObject({ query: "Café Olé" });
  });

  it("uses Place IDs directly", () => {
    expect(parseInput("ChIJN1t_tDeuEmsRUsoyG83frY4")).toEqual({ kind: "place", placeId: "ChIJN1t_tDeuEmsRUsoyG83frY4" });
    expect(parseInput("https://www.google.com/maps/search/?api=1&query=x&query_place_id=ChIJabc123456789")).toEqual({
      kind: "place",
      placeId: "ChIJabc123456789",
    });
  });

  it("follows short and share links", () => {
    expect(parseInput("https://maps.app.goo.gl/AbCdEf123")).toEqual({ kind: "redirect", url: "https://maps.app.goo.gl/AbCdEf123" });
    expect(parseInput("share.google/xyz")).toMatchObject({ kind: "redirect" });
  });

  it("reads the query from Business Profile search links and consent pages", () => {
    expect(parseInput("https://www.google.com/search?q=Rio+Grande+Plumbing+Austin&kgmid=/g/11")).toMatchObject({
      query: "Rio Grande Plumbing Austin",
    });
    expect(
      parseInput(`https://consent.google.com/m?continue=${encodeURIComponent("https://www.google.com/maps/place/Joe's/@1,2,3z")}`),
    ).toMatchObject({ query: "Joe's" });
  });

  it("treats plain text as a search", () => {
    expect(parseInput("Rio Grande Plumbing, Austin TX")).toEqual({ kind: "query", query: "Rio Grande Plumbing, Austin TX" });
  });

  it("explains links it can't use", () => {
    expect(() => parseInput("https://www.google.com/maps?cid=1234567")).toThrow(/name and city/);
    expect(() => parseInput("https://example.com/about")).toThrow(/Google Maps/);
  });
});
