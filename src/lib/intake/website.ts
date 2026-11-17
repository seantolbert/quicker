import { parse, type HTMLElement } from "node-html-parser";
import { robotsAllows, USER_AGENT } from "./robots";

export type WebsiteInfo = {
  url: string;
  pages: string[];
  robotsBlocked: boolean;
  title?: string;
  description?: string;
  themeColor?: string;
  logoUrl?: string;
  ogImage?: string;
  emails: string[];
  phones: string[];
  facebookUrl?: string;
  headings: string[];
  excerpt: string;
};

const MAX_BYTES = 2_000_000;
const SUBPAGE = /\b(about|services?|what-we-do|menu|our-work|offerings|treatments|pricing)\b/i;
const GENERIC_HEADING = /^(home|about( us)?|contact( us)?|menu|services|our services|get in touch|follow us|quick links|reviews|testimonials|faq|hours|location|blog|news|gallery|cart|search|subscribe|newsletter|privacy|terms)$/i;

async function get(url: string) {
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, Accept: "text/html,*/*" },
    redirect: "follow",
    signal: AbortSignal.timeout(12_000),
  });
  const len = Number(res.headers.get("content-length") ?? 0);
  if (!res.ok || len > MAX_BYTES) return null;
  return { url: res.url, type: res.headers.get("content-type") ?? "", text: (await res.text()).slice(0, MAX_BYTES) };
}

/** Reads the business's own site: home page plus up to two about/services pages, within robots.txt. */
export async function readWebsite(siteUrl: string): Promise<WebsiteInfo> {
  const origin = new URL(siteUrl).origin;
  const robots = await get(`${origin}/robots.txt`).catch(() => null);
  const allowed = (path: string) => !robots || !robots.type.includes("text") || robotsAllows(robots.text, path);

  const info: WebsiteInfo = { url: siteUrl, pages: [], robotsBlocked: false, emails: [], phones: [], headings: [], excerpt: "" };
  if (!allowed(new URL(siteUrl).pathname || "/")) {
    info.robotsBlocked = true;
    return info;
  }

  const home = await get(siteUrl).catch(() => null);
  if (!home || !home.type.includes("html")) return info;
  const homeDoc = parse(home.text);
  info.pages.push(home.url);

  info.title = homeDoc.querySelector("title")?.text.trim();
  info.description = meta(homeDoc, "description") ?? meta(homeDoc, "og:description");
  info.themeColor = meta(homeDoc, "theme-color");
  info.ogImage = abs(meta(homeDoc, "og:image"), home.url);
  info.logoUrl = findLogo(homeDoc, home.url);

  const subpages = [
    ...new Set(
      homeDoc
        .querySelectorAll("a[href]")
        .map((a) => abs(a.getAttribute("href"), home.url))
        .filter((u): u is string => !!u && u.startsWith(origin) && SUBPAGE.test(new URL(u).pathname)),
    ),
  ].slice(0, 2);

  const docs = [homeDoc];
  for (const u of subpages) {
    if (!allowed(new URL(u).pathname)) continue;
    const page = await get(u).catch(() => null);
    if (page?.type.includes("html")) {
      docs.push(parse(page.text));
      info.pages.push(page.url);
    }
  }

  const texts: string[] = [];
  for (const doc of docs) {
    for (const a of doc.querySelectorAll("a[href]")) {
      const href = a.getAttribute("href") ?? "";
      if (href.startsWith("mailto:")) info.emails.push(decodeURIComponent(href.slice(7).split("?")[0]).trim().toLowerCase());
      if (href.startsWith("tel:")) info.phones.push(href.slice(4).trim());
      if (/facebook\.com\/(?!sharer)/i.test(href)) info.facebookUrl ??= href;
    }
    for (const h of doc.querySelectorAll("h1, h2, h3")) {
      const t = clean(h.text);
      if (t.length > 2 && t.length < 80 && !GENERIC_HEADING.test(t)) info.headings.push(t);
    }
    doc.querySelectorAll("script, style, noscript, svg, iframe, nav, footer").forEach((el) => el.remove());
    texts.push(clean((doc.querySelector("main") ?? doc.querySelector("body") ?? doc).text));
  }

  info.emails = [...new Set(info.emails)].filter((e) => /^[^@\s]+@[^@\s]+\.\w+$/.test(e));
  info.phones = [...new Set(info.phones)];
  info.headings = [...new Set(info.headings)].slice(0, 30);
  info.excerpt = texts.join("\n\n").slice(0, 6000);
  return info;
}

function meta(doc: HTMLElement, name: string) {
  const el = doc.querySelector(`meta[name="${name}"]`) ?? doc.querySelector(`meta[property="${name}"]`);
  return el?.getAttribute("content")?.trim() || undefined;
}

function abs(href: string | undefined, base: string) {
  if (!href || href.startsWith("data:") || href.startsWith("#")) return undefined;
  try {
    const u = new URL(href, base);
    return u.protocol.startsWith("http") ? u.toString().split("#")[0] : undefined;
  } catch {
    return undefined;
  }
}

/** Header logo image first, then apple-touch-icon, then a large PNG icon. */
function findLogo(doc: HTMLElement, base: string) {
  const isLogo = (el: HTMLElement) =>
    /logo/i.test(
      [el.getAttribute("src"), el.getAttribute("alt"), el.getAttribute("class"), el.getAttribute("id"), el.parentNode?.getAttribute?.("class")]
        .filter(Boolean)
        .join(" "),
    );
  const scopes = [doc.querySelector("header"), doc];
  for (const scope of scopes) {
    const img = scope?.querySelectorAll("img").find(isLogo);
    const src = img?.getAttribute("src") ?? img?.getAttribute("data-src");
    if (src) return abs(src, base);
  }
  const touch = doc.querySelector('link[rel="apple-touch-icon"]') ?? doc.querySelector('link[rel="apple-touch-icon-precomposed"]');
  if (touch) return abs(touch.getAttribute("href"), base);
  const icon = doc.querySelectorAll('link[rel~="icon"]').find((l) => /png/i.test(l.getAttribute("href") ?? "") && /(1[2-9]\d|[2-9]\d\d)/.test(l.getAttribute("sizes") ?? ""));
  return icon ? abs(icon.getAttribute("href"), base) : undefined;
}

function clean(text: string) {
  return text.replace(/\s+/g, " ").trim();
}
