import { conceptAttrs } from "../../_motion/vocabulary";

/** Plumbing: a dial that fills as the visitor scrolls through the steps. Static: full. */
export function PressureGauge() {
  const ticks = Array.from({ length: 9 }, (_, i) => -90 + i * 22.5);
  return (
    <svg {...conceptAttrs("pressure-gauge")} viewBox="0 0 120 70" className="h-auto w-40 shrink-0 text-site-fg">
      <path d="M10 60 A50 50 0 0 1 110 60" fill="none" stroke="var(--q-border)" strokeWidth="6" strokeLinecap="round" />
      <path
        data-fill
        d="M10 60 A50 50 0 0 1 110 60"
        pathLength={1}
        strokeDasharray="1"
        strokeDashoffset="0"
        fill="none"
        stroke="var(--q-primary)"
        strokeWidth="6"
        strokeLinecap="round"
      />
      {ticks.map((deg) => (
        <line key={deg} x1="60" y1="16" x2="60" y2="22" stroke="currentColor" strokeWidth="1.5" transform={`rotate(${deg} 60 60)`} />
      ))}
      <g data-needle transform="rotate(90 60 60)">
        <line x1="60" y1="60" x2="60" y2="24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      </g>
      <circle cx="60" cy="60" r="5" fill="currentColor" />
    </svg>
  );
}
