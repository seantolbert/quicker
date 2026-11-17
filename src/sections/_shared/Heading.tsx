import { conceptAttrs, motion, type ConceptId } from "../_motion/vocabulary";
import { cmp } from "../labels";

/** Section heading block: optional eyebrow, heading, optional intro. */
export function Heading({
  type,
  eyebrow,
  heading,
  intro,
  className = "",
  concept,
}: {
  type: string;
  eyebrow?: string;
  heading: string;
  intro?: string;
  className?: string;
  concept?: ConceptId;
}) {
  return (
    <div {...motion("reveal")} className={className}>
      {eyebrow ? (
        <p {...cmp(`${type}.eyebrow`)} className="mb-4 text-sm font-medium uppercase tracking-widest text-site-primary">
          {eyebrow}
        </p>
      ) : null}
      <h2 {...cmp(`${type}.heading`)} className="font-heading text-3xl leading-tight tracking-tight text-balance md:text-5xl">
        {heading}
      </h2>
      {concept === "soft-focus" ? <div {...conceptAttrs("soft-focus")} className="mt-6 h-px w-16 bg-site-primary" /> : null}
      {intro ? (
        <p {...cmp(`${type}.intro`)} className="mt-6 max-w-[60ch] text-lg text-site-muted">
          {intro}
        </p>
      ) : null}
    </div>
  );
}
