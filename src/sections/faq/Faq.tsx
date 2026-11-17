import { Heading } from "../_shared/Heading";
import { motion } from "../_motion/vocabulary";
import { cmp, sectionAttrs, type SectionProps } from "../labels";
import type { FaqProps } from "./schema";

export function Faq({ id, variant, props }: SectionProps<FaqProps, "accordion">) {
  return (
    <section {...sectionAttrs(id, "faq", variant, props.heading)} className="py-16 md:py-24">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 md:grid-cols-12 md:px-12">
        <Heading type="faq" heading={props.heading} intro={props.intro} className="md:col-span-4" />
        <div {...motion("reveal-group")} className="md:col-span-8">
          {props.items.map((item, i) => (
            <details key={i} {...cmp("faq.item", i)} className="group border-b border-site-border py-6 first:pt-0">
              <summary
                {...cmp("faq.item.question", i)}
                className="flex cursor-pointer list-none items-start justify-between gap-6 font-heading text-lg md:text-xl [&::-webkit-details-marker]:hidden"
              >
                {item.question}
                <span aria-hidden className="text-site-muted transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p {...cmp("faq.item.answer", i)} className="mt-4 max-w-[65ch] text-site-muted">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
