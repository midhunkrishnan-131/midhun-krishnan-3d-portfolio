import type { MetadataRoute } from "next";
import { projects } from "@/data/projects";
import { canonicalUrl, projectPath } from "@/lib/seo/constants";

/**
 * Home, `/projects` and every `/projects/[slug]` from src/data/projects.ts.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: canonicalUrl("/"),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: canonicalUrl("/projects"),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...projects.map((project) => ({
      url: canonicalUrl(projectPath(project.slug)),
      changeFrequency: "monthly" as const,
      priority: project.featured ? 0.7 : 0.6,
    })),
  ];
}
