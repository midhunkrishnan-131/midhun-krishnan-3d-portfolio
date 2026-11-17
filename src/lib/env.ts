const FALLBACK_SITE_URL = "http://localhost:3000";

export const SITE_URL: string = (
  process.env.NEXT_PUBLIC_SITE_URL || FALLBACK_SITE_URL
).replace(/\/+$/, "");

/** Set at GitHub Pages build time so public asset URLs include the repo path. */
export const BASE_PATH: string = (
  process.env.NEXT_PUBLIC_BASE_PATH || ""
).replace(/\/+$/, "");

export const USE_TRAILING_SLASH = Boolean(BASE_PATH);

/** Prefix a root-relative public path with the Pages basePath when one is set. */
export function withBasePath(path: string): string {
  if (!path.startsWith("/") || path.startsWith("//")) return path;
  if (!BASE_PATH) return path;
  if (path === BASE_PATH || path.startsWith(`${BASE_PATH}/`)) return path;
  return `${BASE_PATH}${path}`;
}
