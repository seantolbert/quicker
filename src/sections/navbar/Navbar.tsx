import { motion } from "../_motion/vocabulary";
import { cmp, sectionAttrs, type SectionProps } from "../labels";
import type { NavbarProps } from "./schema";

export function Navbar({ id, variant, props }: SectionProps<NavbarProps, "simple" | "split">) {
  const tel = props.phone ? `tel:${props.phone.replace(/[^\d+]/g, "")}` : undefined;
  return (
    <header
      {...sectionAttrs(id, "navbar", variant, "Site header")}
      {...motion("header")}
      className="sticky top-0 z-40 border-b border-site-border bg-site-bg/90 backdrop-blur"
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-8 px-6 md:px-12">
        <a {...cmp("navbar.brand")} href="#" className="flex items-center gap-3 font-heading text-lg font-semibold tracking-tight">
          {props.logo?.src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img {...cmp("navbar.logo")} src={props.logo.src} alt={props.logo.alt} className="h-9 w-auto max-w-32 object-contain" />
          ) : null}
          {props.brand}
        </a>
        <nav
          {...cmp("navbar.links")}
          aria-label="Main"
          className={`hidden gap-8 text-sm md:flex ${variant === "split" ? "mx-auto" : "ml-auto"}`}
        >
          {props.links.map((link, i) => (
            <a key={i} {...cmp("navbar.link", i)} href={link.href} className="text-site-muted transition-colors hover:text-site-fg">
              {link.label}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-4 md:ml-0">
          {tel ? (
            <a {...cmp("navbar.phone")} href={tel} className="text-sm font-medium">
              {props.phone}
            </a>
          ) : null}
          {props.cta ? (
            <a
              {...cmp("navbar.cta")}
              href={props.cta.href}
              className="hidden min-h-10 items-center rounded-site bg-site-primary px-4 text-sm font-medium text-site-primary-fg sm:inline-flex"
            >
              {props.cta.label}
            </a>
          ) : null}
          <details {...cmp("navbar.menu")} className="relative md:hidden">
            <summary className="flex min-h-10 cursor-pointer list-none items-center text-sm font-medium [&::-webkit-details-marker]:hidden">
              Menu
            </summary>
            <div className="absolute right-0 mt-3 flex w-56 flex-col rounded-site border border-site-border bg-site-bg p-2 shadow-lg">
              {props.links.map((link, i) => (
                <a key={i} href={link.href} className="rounded-site px-3 py-3 text-sm hover:bg-site-surface">
                  {link.label}
                </a>
              ))}
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
