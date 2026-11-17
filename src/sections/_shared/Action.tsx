import { cmp } from "../labels";

export type Link = { label: string; href: string };

/** Primary action: one per screen. Secondary actions render as text links. */
export function Action({
  link,
  name,
  kind = "primary",
}: {
  link: Link;
  name: string;
  kind?: "primary" | "secondary";
}) {
  if (kind === "secondary") {
    return (
      <a
        {...cmp(name)}
        href={link.href}
        className="inline-flex min-h-12 items-center gap-2 font-medium text-site-fg underline decoration-site-border decoration-2 underline-offset-8 transition-colors hover:decoration-site-primary"
      >
        {link.label}
        <span aria-hidden>→</span>
      </a>
    );
  }
  return (
    <a
      {...cmp(name)}
      href={link.href}
      className="inline-flex min-h-12 items-center rounded-site bg-site-primary px-6 font-medium text-site-primary-fg transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-site-primary"
    >
      {link.label}
    </a>
  );
}
