import { conceptAttrs } from "../../_motion/vocabulary";

/** HVAC: a line down the services list with a branch at each item. Static: fully drawn. */
export function AirflowPath({ count }: { count: number }) {
  return (
    <svg
      {...conceptAttrs("airflow-path")}
      viewBox="0 0 24 100"
      preserveAspectRatio="none"
      className="pointer-events-none absolute top-0 left-0 hidden h-full w-6 text-site-primary md:block"
    >
      <path d="M6 0 V100" pathLength={1} strokeDasharray="1" fill="none" stroke="currentColor" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      {Array.from({ length: count }, (_, i) => {
        const y = ((i + 0.3) / count) * 100;
        return (
          <path key={i} d={`M6 ${y} H22`} pathLength={1} strokeDasharray="1" fill="none" stroke="currentColor" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        );
      })}
    </svg>
  );
}
