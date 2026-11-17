import { motion } from "../_motion/vocabulary";
import { cmp, sectionAttrs, type SectionProps } from "../labels";
import type { TestimonialsProps } from "./schema";

export function Testimonials({ id, variant, props }: SectionProps<TestimonialsProps, "quotes" | "spotlight">) {
  const [lead, ...rest] = props.items;
  const header = (
    <div {...motion("reveal")} className="flex flex-wrap items-baseline justify-between gap-4">
      <h2 {...cmp("testimonials.heading")} className="font-heading text-3xl tracking-tight md:text-4xl">
        {props.heading}
      </h2>
      {props.placeholder ? (
        <p {...cmp("testimonials.placeholder")} className="rounded-site border border-dashed border-site-border px-3 py-1 text-xs font-medium uppercase tracking-widest text-site-muted">
          Placeholder reviews — replace with real ones
        </p>
      ) : null}
    </div>
  );

  if (variant === "spotlight") {
    // Server: a plain list of large quotes. Desktop motion pins it and shows one at a time.
    return (
      <section {...sectionAttrs(id, "testimonials", variant, props.heading)} className="py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-6 md:px-12">
          {header}
          <div {...motion("spotlight")} className="mt-12 grid gap-16">
            {props.items.map((item, i) => (
              <Quote key={i} item={item} index={i} large wide />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section {...sectionAttrs(id, "testimonials", variant, props.heading)} className="py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-6 md:px-12">
        {header}
        <div {...motion("reveal-group")} className="mt-12 grid gap-12 md:grid-cols-12">
          {lead ? <Quote item={lead} index={0} large /> : null}
          {rest.length ? (
            <div className="grid gap-10 md:col-span-5 md:col-start-8">
              {rest.map((item, i) => (
                <Quote key={i} item={item} index={i + 1} />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function Quote({
  item,
  index,
  large = false,
  wide = false,
}: {
  item: TestimonialsProps["items"][number];
  index: number;
  large?: boolean;
  wide?: boolean;
}) {
  return (
    <figure {...cmp("testimonials.item", index)} className={`m-0 bg-site-bg ${wide ? "max-w-4xl" : large ? "md:col-span-7" : ""}`}>
      {item.rating ? (
        <p {...cmp("testimonials.item.rating", index)} className="mb-4 text-site-primary" aria-label={`${item.rating} out of 5 stars`}>
          {"★".repeat(item.rating)}
          <span className="text-site-border">{"★".repeat(5 - item.rating)}</span>
        </p>
      ) : null}
      <blockquote {...cmp("testimonials.item.quote", index)} className={`m-0 font-heading tracking-tight ${wide ? "text-3xl leading-snug md:text-5xl" : large ? "text-2xl leading-snug md:text-3xl" : "text-lg"}`}>
        “{item.quote}”
      </blockquote>
      <figcaption className="mt-6 text-sm">
        <span {...cmp("testimonials.item.name", index)} className="font-medium">
          {item.authorUrl ? (
            <a href={item.authorUrl} rel="nofollow noopener" target="_blank" className="underline-offset-4 hover:underline">
              {item.name}
            </a>
          ) : (
            item.name
          )}
        </span>
        {item.context ? <span className="text-site-muted"> · {item.context}</span> : null}
        {item.source ? (
          <span {...cmp("testimonials.item.source", index)} className="text-site-muted">
            {" · via "}
            {item.sourceUrl ? (
              <a href={item.sourceUrl} rel="nofollow noopener" target="_blank" className="underline underline-offset-4">
                {item.source}
              </a>
            ) : (
              item.source
            )}
          </span>
        ) : null}
      </figcaption>
    </figure>
  );
}
