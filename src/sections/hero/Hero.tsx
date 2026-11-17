import { Action } from "../_shared/Action";
import { Stripe } from "../_shared/concepts/Stripe";
import { Media } from "../_shared/Media";
import { conceptAttrs, motion } from "../_motion/vocabulary";
import { cmp, sectionAttrs, type SectionProps } from "../labels";
import type { HeroProps } from "./schema";

type Variant = "split" | "stacked" | "fullbleed";

export function Hero({ id, variant, props, concept }: SectionProps<HeroProps, Variant>) {
  // Hero copy never animates: visitors read it immediately.
  const copy = (
    <>
      {props.eyebrow ? (
        <p {...cmp("hero.eyebrow")} className="mb-6 text-sm font-medium uppercase tracking-widest text-site-primary">
          {props.eyebrow}
        </p>
      ) : null}
      <h1 {...cmp("hero.headline")} className="font-heading text-4xl leading-[1.05] tracking-tight text-balance md:text-5xl lg:text-6xl">
        {props.headline}
      </h1>
      <p {...cmp("hero.subheadline")} className="mt-6 max-w-[56ch] text-lg text-site-muted md:text-xl">
        {props.subheadline}
      </p>
      <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
        <Action link={props.primaryCta} name="hero.cta.primary" />
        {props.secondaryCta ? <Action link={props.secondaryCta} name="hero.cta.secondary" kind="secondary" /> : null}
      </div>
      {props.proof ? (
        <p {...cmp("hero.proof")} className="mt-8 text-sm text-site-muted">
          {props.proof}
        </p>
      ) : null}
    </>
  );
  const stripe = concept === "vinyl-on" ? <Stripe className="mt-12 w-4/5 origin-left" /> : null;
  const compare = concept === "before-after" && props.media.src && props.compareMedia?.src;

  if (variant === "fullbleed" && props.media.src) {
    return (
      <section {...sectionAttrs(id, "hero", variant, "Hero")} className="relative isolate flex min-h-[85svh] items-end overflow-hidden">
        <figure
          {...cmp("hero.media")}
          {...motion("parallax")}
          data-rights={props.media.rights}
          className="absolute inset-0 -z-10 m-0"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={props.media.src} alt={props.media.alt} fetchPriority="high" className="h-full w-full object-cover" />
          {props.media.credit ? (
            <figcaption className="absolute right-3 bottom-3 max-w-xs rounded-site bg-black/70 px-2 py-1 text-xs text-white">
              {props.media.credit}
            </figcaption>
          ) : null}
        </figure>
        <div className="mx-auto w-full max-w-6xl px-6 pb-12 md:px-12 md:pb-16">
          {/* A solid panel, not a gradient, keeps the copy readable on any photo. */}
          <div className="max-w-2xl rounded-site bg-site-bg p-8 md:p-12">
            {copy}
            {stripe}
          </div>
        </div>
      </section>
    );
  }

  const media = compare ? (
    <figure {...cmp("hero.media")} data-rights={props.media.rights} className="relative m-0 min-h-80 overflow-hidden rounded-site md:min-h-[28rem]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={props.media.src} alt={props.media.alt} className="absolute inset-0 h-full w-full object-cover" />
      <div {...conceptAttrs("before-after", false)} {...cmp("hero.compare")} className="absolute inset-0" style={{ clipPath: "inset(0 0 0 50%)" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={props.compareMedia!.src} alt={props.compareMedia!.alt} className="h-full w-full object-cover" />
      </div>
      <span className="absolute bottom-3 left-3 rounded-site bg-black/70 px-2 py-1 text-xs text-white">Before</span>
      <span className="absolute right-3 bottom-3 rounded-site bg-black/70 px-2 py-1 text-xs text-white">After</span>
    </figure>
  ) : null;

  if (variant === "stacked") {
    return (
      <section {...sectionAttrs(id, "hero", variant, "Hero")} className="py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-6 md:px-12">
          <div className="max-w-4xl">
            {copy}
            {stripe}
          </div>
          {media ? <div className="mt-16">{media}</div> : <Media media={props.media} name="hero.media" motion="mask" parallax className="mt-16 aspect-[21/9]" />}
        </div>
      </section>
    );
  }

  return (
    <section {...sectionAttrs(id, "hero", variant, "Hero")} className="py-16 md:py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 md:grid-cols-12 md:px-12">
        <div className="md:col-span-7">
          {copy}
          {stripe}
        </div>
        <div className="md:col-span-5 md:self-stretch">
          {media ?? <Media media={props.media} name="hero.media" motion="mask" parallax className="h-full min-h-80 md:min-h-[28rem]" />}
        </div>
      </div>
    </section>
  );
}
