import { motion } from "../_motion/vocabulary";
import { cmp, sectionAttrs, type SectionProps } from "../labels";
import type { StatsProps } from "./schema";

export function Stats({ id, variant, props }: SectionProps<StatsProps, "row">) {
  return (
    <section {...sectionAttrs(id, "stats", variant, props.heading ?? "Key figures")} className="py-16">
      <div className="mx-auto max-w-6xl px-6 md:px-12">
        {props.heading ? (
          <h2 {...cmp("stats.heading")} className="mb-10 max-w-[40ch] font-heading text-2xl tracking-tight">
            {props.heading}
          </h2>
        ) : null}
        {props.placeholder ? (
          <p {...cmp("stats.placeholder")} className="mb-6 inline-block rounded-site border border-dashed border-site-border px-3 py-1 text-xs font-medium uppercase tracking-widest text-site-muted">
            Placeholder figures — replace with real numbers
          </p>
        ) : null}
        <dl {...motion("reveal-group")} className="grid grid-cols-2 gap-x-8 gap-y-10 border-y border-site-border py-10 md:grid-cols-4">
          {props.items.map((item, i) => (
            <div key={i} {...cmp("stats.item", i)} className="flex flex-col">
              <dt {...cmp("stats.item.label", i)} className="text-sm text-site-muted">
                {item.label}
              </dt>
              <dd {...cmp("stats.item.value", i)} {...(props.placeholder ? {} : motion("count"))} className="order-first mt-2 font-heading text-4xl tracking-tight md:text-5xl">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
