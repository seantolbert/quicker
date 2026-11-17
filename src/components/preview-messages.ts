/** Messages between the builder window and the preview iframe (same origin only). */
export type PreviewMessage =
  | { source: "quicker"; type: "ready" }
  | { source: "quicker"; type: "spec"; spec: unknown; streaming: boolean }
  | { source: "quicker"; type: "labels"; on: boolean }
  | { source: "quicker"; type: "motion"; on: boolean }
  | { source: "quicker"; type: "highlight"; id: string };

type DistributiveOmit<T, K extends keyof T> = T extends unknown ? Omit<T, K> : never;

/** A message without its "source" tag, as passed to the builder's post helper. */
export type OutgoingMessage = DistributiveOmit<PreviewMessage, "source">;
