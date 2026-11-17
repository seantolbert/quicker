import { cmp, sectionAttrs, type SectionProps } from "../labels";
import type { FooterProps } from "./schema";

export function Footer({ id, variant, props }: SectionProps<FooterProps, "columns">) {
  return (
    <footer {...sectionAttrs(id, "footer", variant, "Footer")} className="border-t border-site-border py-16">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 md:grid-cols-12 md:px-12">
        <div className="md:col-span-5">
          <p {...cmp("footer.brand")} className="font-heading text-xl font-semibold">
            {props.brand}
          </p>
          {props.tagline ? (
            <p {...cmp("footer.tagline")} className="mt-3 max-w-[40ch] text-site-muted">
              {props.tagline}
            </p>
          ) : null}
        </div>
        <div className="grid gap-8 sm:grid-cols-3 md:col-span-7">
          {props.columns.map((col, i) => (
            <div key={i} {...cmp("footer.column", i)}>
              <p className="text-sm font-medium">{col.heading}</p>
              <ul className="mt-4 space-y-3 text-sm">
                {col.links.map((link, j) => (
                  <li key={j}>
                    <a {...cmp("footer.link", j)} href={link.href} className="text-site-muted hover:text-site-fg">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p {...cmp("footer.legal")} className="text-sm text-site-muted md:col-span-12">
          {props.legal}
        </p>
      </div>
    </footer>
  );
}
