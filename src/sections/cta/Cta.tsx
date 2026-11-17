import { motion } from "../_motion/vocabulary";
import { cmp, sectionAttrs, type SectionProps } from "../labels";
import type { CtaProps } from "./schema";

export function Cta({ id, variant, props }: SectionProps<CtaProps, "band">) {
  return (
    <section {...sectionAttrs(id, "cta", variant, props.heading)} className="bg-site-fg py-16 text-site-bg md:py-24">
      <div {...motion("reveal-group")} className="mx-auto grid max-w-6xl items-end gap-10 px-6 md:grid-cols-12 md:px-12">
        <div className="md:col-span-8">
          <h2 {...cmp("cta.heading")} className="font-heading text-3xl leading-tight tracking-tight text-balance md:text-5xl">
            {props.heading}
          </h2>
          {props.body ? (
            <p {...cmp("cta.body")} className="mt-6 max-w-[56ch] text-lg opacity-80">
              {props.body}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-x-8 gap-y-4 md:col-span-4 md:justify-end">
          <a
            {...cmp("cta.primary")}
            href={props.primaryCta.href}
            className="inline-flex min-h-12 items-center rounded-site bg-site-primary px-6 font-medium text-site-primary-fg"
          >
            {props.primaryCta.label}
          </a>
          {props.secondaryCta ? (
            <a {...cmp("cta.secondary")} href={props.secondaryCta.href} className="font-medium underline underline-offset-8">
              {props.secondaryCta.label}
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}
