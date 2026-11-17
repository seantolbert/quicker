import { conceptAttrs } from "../../_motion/vocabulary";

/** Mobile detailing: the skewed livery stripe. Static: fully on. */
export function Stripe({ className = "" }: { className?: string }) {
  return <div {...conceptAttrs("vinyl-on")} className={`h-4 -skew-x-12 bg-site-primary md:h-6 ${className}`} />;
}
