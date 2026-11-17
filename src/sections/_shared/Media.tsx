import { motion as motionAttrs, type Effect } from "../_motion/vocabulary";
import { cmp } from "../labels";
import type { z } from "zod";
import type { mediaSchema } from "./schemas";

export type MediaSlot = z.infer<typeof mediaSchema>;

const RIGHTS_LABEL: Record<string, string> = {
  sample_only: "Sample imagery — to be replaced with your photos",
  pending_client_confirmation: "From your website — pending your confirmation",
};

/**
 * A photo slot. With `src` it shows the photo plus its rights label and
 * credit; without, a neutral placeholder whose alt text says what belongs here.
 */
export function Media({
  media,
  name,
  className = "",
  motion,
  parallax = false,
}: {
  media: MediaSlot;
  name: string;
  className?: string;
  /** Effect on the whole figure, e.g. "mask". */
  motion?: Effect;
  /** Slow drift of the photo inside its frame. */
  parallax?: boolean;
}) {
  const rightsLabel = media.rights ? (RIGHTS_LABEL[media.rights] ?? null) : null;
  return (
    <figure
      {...cmp(name)}
      data-placeholder={media.src ? undefined : "image"}
      data-rights={media.rights}
      {...(motion ? motionAttrs(motion) : {})}
      className={`m-0 flex flex-col ${className}`}
    >
      {media.src ? (
        <div
          {...(parallax ? motionAttrs("parallax") : {})}
          className="relative min-h-64 flex-1 overflow-hidden rounded-site bg-site-surface"
        >
          {/* Plain <img>: works unchanged in the builder preview and the exported site. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={media.src} alt={media.alt} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
          {rightsLabel ? (
            <span className="absolute left-3 top-3 rounded-site bg-black/70 px-2 py-1 text-xs font-medium text-white">
              {rightsLabel}
            </span>
          ) : null}
        </div>
      ) : (
        <div
          role="img"
          aria-label={media.alt}
          className="flex min-h-64 flex-1 items-end rounded-site border border-site-border bg-site-surface p-4"
        >
          <span className="max-w-[28ch] text-sm text-site-muted">
            <span className="mb-1 block text-xs font-medium uppercase tracking-widest">Photo</span>
            {media.alt}
          </span>
        </div>
      )}
      {media.note || media.credit ? (
        <figcaption className="mt-3 text-sm text-site-muted">
          {media.note}
          {media.note && media.credit ? " · " : null}
          {media.credit ? <span className="text-xs">{media.credit}</span> : null}
        </figcaption>
      ) : null}
    </figure>
  );
}
