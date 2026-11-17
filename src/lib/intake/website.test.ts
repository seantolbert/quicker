import { afterEach, describe, expect, it, vi } from "vitest";
import { readWebsite } from "./website";

const HOME = `<!doctype html><html><head>
  <title>Rio Grande Plumbing | Austin</title>
  <meta name="description" content="Family-owned plumbers in East Austin.">
  <meta name="theme-color" content="#1d4f7a">
  <meta property="og:image" content="/img/truck.jpg">
</head><body>
  <header><a href="/"><img src="/img/rgp-logo.png" alt="Rio Grande Plumbing logo"></a>
    <nav><a href="/services">Services</a><a href="/blog">Blog</a></nav></header>
  <main><h1>Same-day plumbing in East Austin</h1><h2>Contact us</h2><p>Call <a href="tel:+15125550199">512-555-0199</a>
  or <a href="mailto:Office@RioGrandePlumbing.example?subject=Hi">email</a>.</p>
  <a href="https://www.facebook.com/riograndeplumbing">Facebook</a></main>
  <script>var x = "ignore me";</script>
</body></html>`;
const SERVICES = `<html><body><main><h2>Water heater repair</h2><p>Tank and tankless.</p><h3>Drain cleaning</h3></main></body></html>`;

function mockSite(pages: Record<string, { body: string; type?: string; status?: number }>) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) => {
      const page = pages[url];
      if (!page) return new Response("missing", { status: 404 });
      const res = new Response(page.body, { status: page.status ?? 200, headers: { "content-type": page.type ?? "text/html" } });
      Object.defineProperty(res, "url", { value: url });
      return res;
    }),
  );
}

afterEach(() => vi.unstubAllGlobals());

describe("readWebsite", () => {
  it("extracts logo, contact links, headings, and subpage text", async () => {
    mockSite({
      "https://rgp.example/robots.txt": { body: "User-agent: *\nDisallow: /blog", type: "text/plain" },
      "https://rgp.example/": { body: HOME },
      "https://rgp.example/services": { body: SERVICES },
    });
    const info = await readWebsite("https://rgp.example/");
    expect(info.logoUrl).toBe("https://rgp.example/img/rgp-logo.png");
    expect(info.ogImage).toBe("https://rgp.example/img/truck.jpg");
    expect(info.themeColor).toBe("#1d4f7a");
    expect(info.emails).toEqual(["office@riograndeplumbing.example"]);
    expect(info.phones).toEqual(["+15125550199"]);
    expect(info.facebookUrl).toBe("https://www.facebook.com/riograndeplumbing");
    expect(info.pages).toEqual(["https://rgp.example/", "https://rgp.example/services"]);
    expect(info.headings).toEqual(["Same-day plumbing in East Austin", "Water heater repair", "Drain cleaning"]);
    expect(info.excerpt).toContain("Tank and tankless.");
    expect(info.excerpt).not.toContain("ignore me");
  });

  it("reads nothing when robots.txt disallows the site", async () => {
    mockSite({
      "https://rgp.example/robots.txt": { body: "User-agent: *\nDisallow: /", type: "text/plain" },
      "https://rgp.example/": { body: HOME },
    });
    const info = await readWebsite("https://rgp.example/");
    expect(info.robotsBlocked).toBe(true);
    expect(info.pages).toEqual([]);
  });
});
