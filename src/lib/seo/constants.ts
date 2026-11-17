import { projects } from "@/data/projects";
import { site } from "@/data/site";
import { SITE_URL } from "@/lib/env";

/** Document title when a route does not set its own. */
export const DEFAULT_TITLE = `${site.name} — ${site.title}`;

/** Applied to child route titles. The root segment keeps DEFAULT_TITLE. */
export const TITLE_TEMPLATE = `%s — ${site.name}`;

/** Ink & paper tokens, shared by icons and Open Graph images. */
export const palette = {
  ink: "#000000",
  paper: "#E9E7E2",
  paperDim: "#B3B0A8",
  paperFaint: "#8A8780",
  ember: "#ff7a45",
} as const;

export const ogSize = { width: 1200, height: 630 } as const;
export const ogContentType = "image/png";

/**
 * Page description for the profile. Built only from the roles in src/data/site.ts.
 */
export const homeDescription = `Portfolio of ${site.name}, a ${site.roles[0]}, a ${site.roles[1]} and an ${site.roles[2]}.`;

/** Schema description for the person. Same facts, without the page framing. */
export const personDescription = `${site.name} is a ${site.roles[0]}, a ${site.roles[1]} and an ${site.roles[2]}.`;

export const PERSON_ID = `${SITE_URL}/#person`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
export const PROFILE_PAGE_ID = `${SITE_URL}/#profile`;

/** Absolute canonical URL. `path` is a pathname (`/` or `/projects/...`). */
export function canonicalUrl(path: string): string {
  if (path === "/" || path === "") return SITE_URL;
  const pathname = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${pathname.replace(/\/+$/, "")}`;
}

export function projectPath(slug: string): string {
  return `/projects/${slug}`;
}

export function projectUrl(slug: string): string {
  return canonicalUrl(projectPath(slug));
}

export function projectWorkId(slug: string): string {
  return `${projectUrl(slug)}#work`;
}

export function breadcrumbId(path: string): string {
  return `${canonicalUrl(path)}#breadcrumb`;
}

/** Index description lists real project titles and nothing else. */
export function projectsIndexDescription(): string {
  const titles = projects.map((project) => project.title);
  if (titles.length === 0) return `Software projects by ${site.name}.`;
  const listed =
    titles.length === 1
      ? titles[0]
      : `${titles.slice(0, -1).join(", ")} and ${titles[titles.length - 1]}`;
  return `Software projects by ${site.name}: ${listed}.`;
}
