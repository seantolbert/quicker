import { conceptAttrs } from "../../_motion/vocabulary";

/** Professional services: a ruled line between sections. Static: fully drawn. */
export function LedgerRule() {
  return (
    <div className="mx-auto max-w-6xl px-6 md:px-12">
      <div {...conceptAttrs("ledger-rule")} className="h-px bg-site-fg" />
    </div>
  );
}
