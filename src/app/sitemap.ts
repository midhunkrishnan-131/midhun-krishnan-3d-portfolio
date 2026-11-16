import type { MetadataRoute } from "next";
import { projects } from "@/data/projects";
import { canonicalUrl, projectPath } from "@/lib/seo/constants";

/**
 * Home is a real route. `/projects` and every `/projects/[slug]` are included
 * from src/data/projects.ts even when those pages are not in this branch yet,
 * so the sitemap stays aligned with the project catalogue.
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
