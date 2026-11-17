/**
 * Image paths in a spec are site-relative ("/photos/photo-1.jpg",
 * "/brand/logo.png"): that's where the exported site serves them from. The
 * builder preview maps them onto the project's files route instead.
 */
const ASSET = /^\/(photos|brand)\/[\w.-]+$/;

export function isAsset(value: unknown): value is string {
  return typeof value === "string" && ASSET.test(value);
}

/** Every asset path the spec references. */
export function collectAssets(spec: unknown): string[] {
  const found = new Set<string>();
  JSON.stringify(spec, (key, value) => {
    if (key === "src" && isAsset(value)) found.add(value);
    return value;
  });
  return [...found];
}

/** Copy of the spec with asset paths prefixed by `base`. */
export function rebaseAssets<T>(spec: T, base: string): T {
  if (!spec) return spec;
  return JSON.parse(JSON.stringify(spec), (key, value) => (key === "src" && isAsset(value) ? `${base}${value}` : value));
}
