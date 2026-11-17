import { notFound } from "next/navigation";
import { getProject, projects } from "@/data/projects";
import { ogContentType, ogSize } from "@/lib/seo/constants";
import { createOgImage } from "@/lib/seo/og";

export const alt = "Project by Midhun Krishnan";
export const size = ogSize;
export const contentType = ogContentType;
export const dynamic = "force-static";

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}


export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  return createOgImage({
    kicker: "Project",
    title: project.title,
    subtitle: project.tagline,
  });
}
