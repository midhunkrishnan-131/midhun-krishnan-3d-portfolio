import type { Metadata, Viewport } from "next";
import type { Project } from "@/types/project";
import { site } from "@/data/site";
import { SITE_URL } from "@/lib/env";
import {
  DEFAULT_TITLE,
  TITLE_TEMPLATE,
  canonicalUrl,
  homeDescription,
  palette,
  projectPath,
  projectsIndexDescription,
} from "@/lib/seo/constants";

export const rootViewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: palette.ink,
  colorScheme: "dark",
};

const titleTemplate = {
  default: DEFAULT_TITLE,
  template: TITLE_TEMPLATE,
} as const;

/**
 * Root metadata: title template, home description, canonical, robots, and cards.
 * Open Graph and Twitter images come from the opengraph-image file convention.
 */
export const rootMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: titleTemplate,
  description: homeDescription,
  applicationName: site.name,
  authors: [{ name: site.name, url: site.contact.github }],
  creator: site.name,
  publisher: site.name,
  alternates: {
    canonical: canonicalUrl("/"),
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    url: canonicalUrl("/"),
    siteName: site.name,
    title: titleTemplate,
    description: homeDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: titleTemplate,
    description: homeDescription,
  },
};

interface PageSeoInput {
  /** Segment title. The root template appends " — Midhun Krishnan". */
  title: string;
  description: string;
  /** Pathname, starting with `/`. */
  path: string;
}

/** Unique title, description, canonical and social cards for one route. */
export function buildPageMetadata({
  title,
  description,
  path,
}: PageSeoInput): Metadata {
  const canonical = canonicalUrl(path);
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      url: canonical,
      siteName: site.name,
      title,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export function buildProjectsIndexMetadata(): Metadata {
  return buildPageMetadata({
    title: "Projects",
    description: projectsIndexDescription(),
    path: "/projects",
  });
}

export function buildProjectMetadata(project: Project): Metadata {
  return buildPageMetadata({
    title: project.title,
    description: project.summary,
    path: projectPath(project.slug),
  });
}
