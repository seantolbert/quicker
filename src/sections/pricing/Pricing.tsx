import { Heading } from "../_shared/Heading";
import { motion } from "../_motion/vocabulary";
import { cmp, sectionAttrs, type SectionProps } from "../labels";
import type { PricingProps } from "./schema";

// Literal class names so Tailwind can see them.
const COLUMNS = ["md:max-w-md", "md:max-w-4xl md:grid-cols-2", "md:grid-cols-3"];

export function Pricing({ id, variant, props }: SectionProps<PricingProps, "tiers">) {
  const columns = COLUMNS[Math.max(1, Math.min(props.tiers.length, 3)) - 1];
  return (
    <section {...sectionAttrs(id, "pricing", variant, props.heading)} className="py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-6 md:px-12">
        <Heading type="pricing" eyebrow={props.eyebrow} heading={props.heading} intro={props.intro} className="max-w-3xl" />
        <ul {...motion("reveal-group")} className={`mt-16 grid gap-6 ${columns}`}>
          {props.tiers.map((tier, i) => (
            <li
              key={i}
              {...cmp("pricing.tier", i)}
              data-featured={tier.featured || undefined}
              className={`flex flex-col rounded-site border p-8 ${tier.featured ? "border-site-fg bg-site-fg text-site-bg" : "border-site-border"}`}
            >
              <h3 {...cmp("pricing.tier.name", i)} className="font-heading text-xl">
                {tier.name}
              </h3>
              <p {...cmp("pricing.tier.price", i)} className="mt-6 font-heading text-4xl tracking-tight">
                {tier.price}
                {tier.period ? <span className="ml-1 text-base font-normal opacity-70">{tier.period}</span> : null}
              </p>
              <p className="mt-4 opacity-80">{tier.description}</p>
              <ul {...cmp("pricing.tier.features", i)} className="mt-8 mb-10 space-y-3 text-sm">
                {tier.features.map((f, j) => (
                  <li key={j} className="flex gap-3">
                    <span aria-hidden>—</span>
                    {f}
                  </li>
                ))}
              </ul>
              <a
                {...cmp("pricing.tier.cta", i)}
                href={tier.cta.href}
                className={`mt-auto inline-flex min-h-12 items-center justify-center rounded-site px-6 font-medium ${tier.featured ? "bg-site-primary text-site-primary-fg" : "border border-site-fg"}`}
              >
                {tier.cta.label}
              </a>
            </li>
          ))}
        </ul>
        {props.note ? (
          <p {...cmp("pricing.note")} className="mt-8 text-sm text-site-muted">
            {props.note}
          </p>
        ) : null}
      </div>
    </section>
  );
}
