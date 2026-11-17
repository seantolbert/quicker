import { AirflowPath } from "../_shared/concepts/AirflowPath";
import { Heading } from "../_shared/Heading";
import { conceptAttrs, motion } from "../_motion/vocabulary";
import { cmp, sectionAttrs, type SectionProps } from "../labels";
import type { FeaturesProps } from "./schema";

export function Features({ id, variant, props, concept }: SectionProps<FeaturesProps, "list" | "bento">) {
  const heading = (className: string) => (
    <Heading type="features" eyebrow={props.eyebrow} heading={props.heading} intro={props.intro} concept={concept} className={className} />
  );

  if (variant === "bento" && concept === "shelf-slide") {
    // A sideways row of cards: native horizontal scroll on mobile, pinned slide on desktop.
    return (
      <section {...sectionAttrs(id, "features", variant, props.heading)} className="overflow-hidden py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-6 md:px-12">
          {heading("max-w-3xl")}
          <ul {...conceptAttrs("shelf-slide", false)} className="mt-16 flex snap-x gap-6 overflow-x-auto pb-4">
            {props.items.map((item, i) => (
              <li key={i} {...cmp("features.item", i)} className="w-[min(80vw,24rem)] shrink-0 snap-start rounded-site border border-site-border bg-site-surface p-8 md:p-10">
                <p aria-hidden className="font-heading text-site-primary">{String(i + 1).padStart(2, "0")}</p>
                <h3 {...cmp("features.item.title", i)} className="mt-6 font-heading text-2xl tracking-tight">{item.title}</h3>
                <p {...cmp("features.item.body", i)} className="mt-4 text-site-muted">{item.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    );
  }

  if (variant === "bento") {
    return (
      <section {...sectionAttrs(id, "features", variant, props.heading)} className="py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-6 md:px-12">
          {heading("max-w-3xl")}
          <ul {...motion("reveal-group")} className="mt-16 grid gap-px overflow-hidden rounded-site border border-site-border bg-site-border md:grid-cols-6">
            {props.items.map((item, i) => (
              <li
                key={i}
                {...cmp("features.item", i)}
                className={`relative bg-site-bg p-8 md:p-12 ${i === 0 ? "md:col-span-4 md:row-span-2" : i < 3 ? "md:col-span-2" : "md:col-span-3"}`}
              >
                {concept === "circuit-trace" ? (
                  <>
                    <span {...conceptAttrs("circuit-trace")} className="absolute top-0 left-0 h-0.5 w-full bg-site-primary" />
                    <span aria-hidden className="absolute -top-1 left-8 size-2.5 rounded-full bg-site-primary md:left-12" />
                  </>
                ) : null}
                <h3 {...cmp("features.item.title", i)} className={`font-heading tracking-tight ${i === 0 ? "text-2xl md:text-4xl" : "text-xl"}`}>
                  {item.title}
                </h3>
                <p {...cmp("features.item.body", i)} className="mt-4 max-w-[60ch] text-site-muted">
                  {item.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    );
  }

  const airflow = concept === "airflow-path";
  return (
    <section {...sectionAttrs(id, "features", variant, props.heading)} className="py-16 md:py-24">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 md:grid-cols-12 md:px-12">
        {heading("md:col-span-5 md:self-start md:sticky md:top-24")}
        <ol {...motion("reveal-group")} className={`relative md:col-span-7 md:col-start-6 ${airflow ? "md:pl-10" : ""}`}>
          {airflow ? <AirflowPath count={props.items.length} /> : null}
          {props.items.map((item, i) => (
            <li key={i} {...cmp("features.item", i)} className="grid grid-cols-[3rem_1fr] border-t border-site-border py-8 first:border-t-0 first:pt-0">
              <span aria-hidden className="font-heading text-site-primary">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 {...cmp("features.item.title", i)} className="font-heading text-xl tracking-tight md:text-2xl">
                  {item.title}
                </h3>
                <p {...cmp("features.item.body", i)} className="mt-3 max-w-[60ch] text-site-muted">
                  {item.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
