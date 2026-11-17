import { motion } from "../_motion/vocabulary";
import { cmp, sectionAttrs, type SectionProps } from "../labels";
import type { ContactProps } from "./schema";

export function Contact({ id, variant, props }: SectionProps<ContactProps, "split">) {
  const tel = props.phone ? `tel:${props.phone.replace(/[^\d+]/g, "")}` : undefined;
  const field = "w-full rounded-site border border-site-border bg-site-bg px-4 py-3 text-base text-site-fg";
  return (
    <section {...sectionAttrs(id, "contact", variant, props.heading)} className="py-16 md:py-24">
      <div {...motion("reveal-group")} className="mx-auto grid max-w-6xl gap-12 px-6 md:grid-cols-12 md:px-12">
        <div className="md:col-span-5">
          <h2 {...cmp("contact.heading")} className="font-heading text-3xl tracking-tight md:text-4xl">
            {props.heading}
          </h2>
          {props.body ? (
            <p {...cmp("contact.body")} className="mt-6 max-w-[48ch] text-lg text-site-muted">
              {props.body}
            </p>
          ) : null}
          <dl {...cmp("contact.details")} className="mt-10 space-y-6 text-sm">
            {tel ? (
              <div>
                <dt className="text-site-muted">Phone</dt>
                <dd {...cmp("contact.phone")} className="mt-1 text-lg font-medium">
                  <a href={tel}>{props.phone}</a>
                </dd>
              </div>
            ) : null}
            {props.email ? (
              <div>
                <dt className="text-site-muted">Email</dt>
                <dd {...cmp("contact.email")} className="mt-1 text-lg font-medium">
                  <a href={`mailto:${props.email}`}>{props.email}</a>
                </dd>
              </div>
            ) : null}
            {props.address ? (
              <div>
                <dt className="text-site-muted">Address</dt>
                <dd {...cmp("contact.address")} className="mt-1">
                  {props.address}
                </dd>
              </div>
            ) : null}
            {props.hours?.length ? (
              <div>
                <dt className="text-site-muted">Hours</dt>
                <dd {...cmp("contact.hours")} className="mt-1 space-y-1">
                  {props.hours.map((h, i) => (
                    <p key={i}>{h}</p>
                  ))}
                </dd>
              </div>
            ) : null}
          </dl>
        </div>
        {props.email ? (
          <form
            {...cmp("contact.form")}
            action={`mailto:${props.email}`}
            method="post"
            encType="text/plain"
            className="grid gap-6 rounded-site border border-site-border p-6 md:col-span-6 md:col-start-7 md:p-10"
          >
            {props.fields.map((f, i) => (
              <label key={i} {...cmp("contact.field", i)} className="grid gap-2 text-sm font-medium">
                {f.label}
                {f.type === "textarea" ? (
                  <textarea name={f.name} required={f.required} rows={4} className={field} />
                ) : (
                  <input name={f.name} type={f.type} required={f.required} className={field} />
                )}
              </label>
            ))}
            <button
              {...cmp("contact.submit")}
              type="submit"
              className="inline-flex min-h-12 items-center justify-center rounded-site bg-site-primary px-6 font-medium text-site-primary-fg"
            >
              {props.submitLabel}
            </button>
          </form>
        ) : tel ? (
          <div className="flex flex-col self-start rounded-site border border-site-border p-6 md:col-span-6 md:col-start-7 md:p-10">
            <p className="text-site-muted">Questions? Call us.</p>
            <a
              {...cmp("contact.call")}
              href={tel}
              className="mt-4 font-heading text-3xl whitespace-nowrap tracking-tight underline decoration-site-primary decoration-2 underline-offset-8 lg:text-5xl"
            >
              {props.phone}
            </a>
          </div>
        ) : null}
      </div>
    </section>
  );
}
