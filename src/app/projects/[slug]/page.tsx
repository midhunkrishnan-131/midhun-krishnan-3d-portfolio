import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { projects } from "@/data/projects";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildProjectGraph } from "@/lib/seo/jsonld";
import { buildProjectMetadata } from "@/lib/seo/metadata";
import { Container } from "@/components/layout/Container";
import { Breadcrumb } from "@/components/navigation/Breadcrumb";
import { ButtonLink } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Heading } from "@/components/ui/Heading";
import { Tag } from "@/components/ui/Tag";
import { StatusBadge } from "@/components/sections/StatusBadge";
import { PageSceneFrame } from "@/components/sections/PageSceneFrame";

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

function getProject(slug: string) {
  return projects.find((project) => project.slug === slug);
}

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return buildProjectMetadata(project);
}

function DetailList({
  title,
  items,
}: {
  title: string;
  items: readonly string[];
}) {
  if (items.length === 0) return null;
  const headingId = `${title.toLowerCase().replace(/\s+/g, "-")}-heading`;
  return (
    <section
      aria-labelledby={headingId}
      className="flex flex-col gap-4 border-t border-line pt-10"
    >
      <h2
        id={headingId}
        className="font-sans text-lead font-medium tracking-tight text-paper"
      >
        {title}
      </h2>
      <ul className="flex flex-col gap-3 border-l border-line pl-5 text-paper-dim">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

export default function ProjectDetailPage(props: ProjectPageProps) {
  return (
    <Suspense fallback={<main id="main" tabIndex={-1} className="min-h-svh" />}>
      <ProjectDetail {...props} />
    </Suspense>
  );
}

async function ProjectDetail({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  return (
    <main id="main" tabIndex={-1} className="relative z-10 focus:outline-none">
      <JsonLd data={buildProjectGraph(project)} />
      <article className="py-(--section-space)">
        <Container size="wide" className="flex flex-col gap-10">
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Projects", href: "/projects" },
              { label: project.title },
            ]}
          />
          <div className="grid items-start gap-10 lg:grid-cols-12">
            <div className="flex flex-col gap-10 lg:col-span-6">
              <header className="flex flex-col gap-6">
                <div className="flex flex-wrap items-center gap-3">
                  <Eyebrow>Project</Eyebrow>
                  <StatusBadge status={project.status} />
                  {project.featured ? <Tag tone="neutral">Flagship</Tag> : null}
                </div>
                <Heading level={1} variant="display">
                  {project.title}
                </Heading>
                <p className="text-lead text-paper">{project.tagline}</p>
                <p className="text-paper-dim">{project.summary}</p>
                {project.statusNote ? (
                  <p className="text-sm text-paper-faint">
                    {project.statusNote}
                  </p>
                ) : null}
              </header>
              <DetailList title="Objectives" items={project.objectives} />
              <DetailList title="Architecture" items={project.architecture} />
              <DetailList title="Challenges" items={project.challenges} />
              {project.technologies.length ? (
                <section
                  aria-labelledby="technologies-heading"
                  className="flex flex-col gap-4 border-t border-line pt-10"
                >
                  <h2
                    id="technologies-heading"
                    className="font-sans text-lead font-medium tracking-tight text-paper"
                  >
                    Technologies
                  </h2>
                  <ul
                    className="flex flex-wrap gap-2"
                    aria-label="Confirmed technologies"
                  >
                    {project.technologies.map((tech) => (
                      <li key={tech}>
                        <Tag tone="muted">{tech}</Tag>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
              {project.technologiesToConfirm.length ? (
                <p className="text-sm text-paper-faint">
                  Technologies still to confirm:{" "}
                  {project.technologiesToConfirm.join(", ")}
                </p>
              ) : null}
              {project.needsVerification.length ? (
                <DetailList
                  title="Still to confirm"
                  items={project.needsVerification}
                />
              ) : null}
              <div className="flex flex-wrap gap-4 border-t border-line pt-10">
                {project.githubUrl ? (
                  <ButtonLink href={project.githubUrl} external variant="ghost">
                    View on GitHub
                  </ButtonLink>
                ) : (
                  <p className="text-sm text-paper-faint">
                    GitHub link to be added
                  </p>
                )}
                {project.demoUrl ? (
                  <ButtonLink href={project.demoUrl} external variant="ghost">
                    Live demo
                  </ButtonLink>
                ) : (
                  <p className="text-sm text-paper-faint">Demo to be added</p>
                )}
              </div>
              <p className="text-sm">
                <ButtonLink href="/projects" variant="text">
                  All projects
                </ButtonLink>
              </p>
            </div>
            <PageSceneFrame
              scene="projectDetail"
              slug={project.slug}
              className="lg:sticky lg:top-24 lg:col-span-6 lg:aspect-auto lg:h-[56svh]"
            />
          </div>
        </Container>
      </article>
    </main>
  );
}
