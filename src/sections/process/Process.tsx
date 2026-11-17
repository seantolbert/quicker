import { PressureGauge } from "../_shared/concepts/PressureGauge";
import { Stripe } from "../_shared/concepts/Stripe";
import { Heading } from "../_shared/Heading";
import { motion } from "../_motion/vocabulary";
import { cmp, sectionAttrs, type SectionProps } from "../labels";
import type { ProcessProps } from "./schema";

export function Process({ id, variant, props, concept }: SectionProps<ProcessProps, "steps">) {
  return (
    <section {...sectionAttrs(id, "process", variant, props.heading)} className="relative overflow-hidden bg-site-surface py-16 md:py-24">
      {concept === "vinyl-on" ? <Stripe className="absolute top-0 -left-4 w-3/5 origin-left" /> : null}
      <div className="mx-auto max-w-6xl px-6 md:px-12">
        <div className="flex flex-wrap items-end justify-between gap-10">
          <Heading type="process" eyebrow={props.eyebrow} heading={props.heading} intro={props.intro} concept={concept} className="max-w-3xl" />
          {concept === "pressure-gauge" ? <PressureGauge /> : null}
        </div>
        <ol {...motion("reveal-group")} className="mt-16 grid gap-12 md:grid-cols-12">
          {props.steps.map((step, i) => (
            <li key={i} {...cmp("process.step", i)} className="md:col-span-4 lg:col-span-3">
              <span {...motion("draw")} aria-hidden className="block h-0.5 bg-site-fg" />
              <p aria-hidden className="mt-6 text-sm font-medium text-site-muted">
                Step {i + 1}
              </p>
              <h3 {...cmp("process.step.title", i)} className="mt-3 font-heading text-xl tracking-tight">
                {step.title}
              </h3>
              <p {...cmp("process.step.body", i)} className="mt-3 text-site-muted">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
