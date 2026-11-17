import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import type { ConceptId } from "./vocabulary";

/** The only conditions under which anything moves (CLAUDE.md and premium-site-design rules). */
export const MOTION_QUERY = "(min-width: 768px) and (prefers-reduced-motion: no-preference)";

let registered = false;

/**
 * Starts smooth scroll, the shared effects, and the page's concept inside
 * `root`. Returns a cleanup that restores the static page.
 */
export function startMotion(root: HTMLElement, concept: ConceptId): () => void {
  if (!registered) {
    gsap.registerPlugin(ScrollTrigger);
    registered = true;
  }
  const mm = gsap.matchMedia();
  mm.add(MOTION_QUERY, () => {
    const lenis = new Lenis({ autoRaf: false, anchors: { offset: -80 } });
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Changes GSAP can't revert itself (text, SVG attributes) register a restore here.
    const restores: (() => void)[] = [];
    applyEffects(root, restores);
    applyConcept(root, concept, restores);
    ScrollTrigger.refresh();

    return () => {
      restores.forEach((restore) => restore());
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, root);
  return () => mm.revert();
}

const all = (root: ParentNode, selector: string) => Array.from(root.querySelectorAll<HTMLElement>(selector));
const once = (trigger: Element, start = "top 88%") => ({ trigger, start, once: true });

// --- shared quiet layer -------------------------------------------------------

function applyEffects(root: HTMLElement, restores: (() => void)[]) {
  for (const el of all(root, '[data-motion="reveal"]')) {
    gsap.from(el, { autoAlpha: 0, y: 24, duration: 0.6, ease: "power2.out", scrollTrigger: once(el) });
  }
  for (const el of all(root, '[data-motion="reveal-group"]')) {
    gsap.from(el.children, { autoAlpha: 0, y: 24, duration: 0.6, ease: "power2.out", stagger: 0.08, scrollTrigger: once(el) });
  }
  for (const el of all(root, '[data-motion="mask"]')) {
    gsap.fromTo(
      el,
      { clipPath: "inset(10% 8% 10% 8%)" },
      { clipPath: "inset(0% 0% 0% 0%)", duration: 0.7, ease: "power3.out", scrollTrigger: once(el, "top 92%") },
    );
  }
  for (const el of all(root, '[data-motion="parallax"]')) {
    const img = el.querySelector("img");
    if (!img) continue;
    gsap.set(img, { scale: 1.12 });
    gsap.fromTo(
      img,
      { yPercent: -5 },
      { yPercent: 5, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } },
    );
  }
  for (const el of all(root, '[data-motion="count"]')) restores.push(countUp(el));
  for (const el of all(root, '[data-motion="draw"]')) {
    gsap.fromTo(
      el,
      { scaleX: 0, transformOrigin: "left center" },
      { scaleX: 1, ease: "none", scrollTrigger: { trigger: el, start: "top 92%", end: "top 65%", scrub: true } },
    );
  }
  for (const el of all(root, '[data-motion="header"]')) {
    // One paused tween created up front, so turning motion off reverts it (tweens made inside callbacks aren't tracked).
    const hide = gsap.to(el, { yPercent: -100, duration: 0.2, ease: "power1.out", paused: true });
    ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        if (self.direction === 1 && self.scroll() > 160) hide.play();
        else if (self.direction === -1) hide.reverse();
      },
    });
  }
  for (const el of all(root, '[data-motion="spotlight"]')) spotlight(el);
}

/** "4.7★" → counts 0 → 4.7 keeping prefix, suffix, decimals and thousands separators. */
function countUp(el: HTMLElement): () => void {
  const text = el.textContent ?? "";
  const restore = () => {
    el.textContent = text;
    el.removeAttribute("aria-label");
  };
  const m = text.match(/^(\D*?)(\d[\d,]*(?:\.\d+)?)([\s\S]*)$/);
  if (!m) return restore;
  const [, prefix, num, suffix] = m;
  const target = Number(num.replace(/,/g, ""));
  const decimals = num.split(".")[1]?.length ?? 0;
  const commas = num.includes(",");
  const state = { v: 0 };
  el.setAttribute("aria-label", text.trim());
  gsap.to(state, {
    v: target,
    duration: 0.8,
    ease: "power2.out",
    scrollTrigger: once(el),
    onUpdate: () => {
      const n = commas
        ? state.v.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
        : state.v.toFixed(decimals);
      el.textContent = `${prefix}${n}${suffix}`;
    },
    onComplete: () => {
      el.textContent = text;
    },
  });
  return restore;
}

/** Pins the quote list and crossfades one quote per scroll step. */
function spotlight(list: HTMLElement) {
  const items = Array.from(list.children) as HTMLElement[];
  if (items.length < 2) return;
  const height = Math.max(...items.map((i) => i.offsetHeight));
  gsap.set(list, { position: "relative", height });
  gsap.set(items, { position: "absolute", inset: 0 });
  gsap.set(items.slice(1), { autoAlpha: 0, y: 16 });
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: list.closest("section") ?? list,
      start: "top 80px",
      end: `+=${items.length * 55}%`,
      pin: true,
      scrub: 0.4,
    },
  });
  items.slice(1).forEach((item, i) => {
    tl.to(items[i], { autoAlpha: 0, y: -16, duration: 0.4 }).to(item, { autoAlpha: 1, y: 0, duration: 0.4 }, "<0.2");
  });
}

// --- signature concepts ------------------------------------------------------

function applyConcept(root: HTMLElement, concept: ConceptId, restores: (() => void)[]) {
  const marks = all(root, `[data-concept="${concept}"]`);
  const scrubbed = (trigger: Element, start = "top 75%", end = "bottom 60%") => ({ trigger, start, end, scrub: true });

  switch (concept) {
    case "airflow-path":
      for (const svg of marks) {
        gsap.fromTo(svg.querySelectorAll("path"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, ease: "none", scrollTrigger: scrubbed(svg.parentElement ?? svg) });
      }
      break;

    case "pressure-gauge":
      for (const gauge of marks) {
        const section = gauge.closest("section") ?? gauge;
        const tl = gsap.timeline({ scrollTrigger: scrubbed(section, "top 70%", "bottom 70%") });
        // Write the SVG rotate() attribute directly: CSS transforms on SVG groups misplace the pivot.
        const needle = gauge.querySelector("[data-needle]");
        const original = needle?.getAttribute("transform");
        if (original) restores.push(() => needle?.setAttribute("transform", original));
        const angle = { deg: -90 };
        tl.fromTo(angle, { deg: -90 }, { deg: 90, ease: "none", onUpdate: () => needle?.setAttribute("transform", `rotate(${angle.deg} 60 60)`) }, 0);
        tl.fromTo(gauge.querySelector("[data-fill]"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, ease: "none" }, 0);
      }
      break;

    case "circuit-trace":
      for (const line of marks) {
        gsap.fromTo(line, { scaleX: 0, transformOrigin: "left center" }, { scaleX: 1, duration: 0.28, ease: "power1.out", scrollTrigger: once(line, "top 85%") });
      }
      break;

    case "layer-stack": {
      const sections = all(root, "main > [data-section-id]").filter((s) => s.dataset.section !== "hero");
      sections.slice(0, -1).forEach((s) => {
        if (getComputedStyle(s).backgroundColor === "rgba(0, 0, 0, 0)") gsap.set(s, { backgroundColor: "var(--q-bg)" });
        ScrollTrigger.create({ trigger: s, start: () => (s.offsetHeight < innerHeight ? "top top" : "bottom bottom"), pin: true, pinSpacing: false });
        gsap.to(s, { scale: 0.96, autoAlpha: 0.6, ease: "none", scrollTrigger: { trigger: s, start: "bottom bottom", end: "bottom top", scrub: true } });
      });
      sections.forEach((s, i) => gsap.set(s, { position: "relative", zIndex: i + 1 }));
      break;
    }

    case "before-after":
      for (const after of marks) {
        gsap.fromTo(
          after,
          { clipPath: "inset(0% 0% 0% 100%)" },
          { clipPath: "inset(0% 0% 0% 0%)", ease: "none", scrollTrigger: scrubbed(after.parentElement ?? after, "top 60%", "bottom 40%") },
        );
      }
      break;

    case "vinyl-on":
      for (const stripe of marks) {
        gsap.fromTo(stripe, { scaleX: 0, transformOrigin: "left center" }, { scaleX: 1, duration: 0.45, ease: "power4.out", scrollTrigger: once(stripe, "top 95%") });
      }
      break;

    case "close-up": {
      // Push in from the parallax base scale (1.12) so the photo always covers its frame.
      const hero = root.querySelector('[data-section="hero"] img');
      if (hero) gsap.fromTo(hero, { scale: 1.12 }, { scale: 1.28, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true } });
      for (const img of all(root, '[data-section]:not([data-section="hero"]) figure img')) {
        gsap.fromTo(img, { scale: 1.18 }, { scale: 1, duration: 0.8, ease: "power2.out", scrollTrigger: once(img) });
      }
      break;
    }

    case "soft-focus":
      for (const img of all(root, '[data-section]:not([data-section="hero"]) figure img')) {
        gsap.fromTo(img, { filter: "blur(10px)", autoAlpha: 0.6 }, { filter: "blur(0px)", autoAlpha: 1, duration: 0.7, ease: "power2.out", scrollTrigger: once(img) });
      }
      for (const rule of marks) {
        gsap.fromTo(rule, { scaleX: 0, transformOrigin: "left center" }, { scaleX: 1, duration: 0.6, ease: "power2.out", scrollTrigger: once(rule) });
      }
      break;

    case "shelf-slide":
      for (const shelf of marks) {
        const row = shelf as HTMLElement;
        const distance = () => row.scrollWidth - row.clientWidth;
        if (distance() <= 0) continue;
        gsap.set(row, { overflow: "visible" });
        gsap.to(row.children, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: { trigger: row.closest("section") ?? row, start: "top 80px", end: () => `+=${distance()}`, pin: true, scrub: 0.4, invalidateOnRefresh: true },
        });
      }
      break;

    case "ledger-rule":
      for (const rule of marks) {
        gsap.fromTo(rule, { scaleX: 0, transformOrigin: "left center" }, { scaleX: 1, ease: "none", scrollTrigger: scrubbed(rule, "top 95%", "top 55%") });
      }
      break;

    case "none":
      break;
  }
}
