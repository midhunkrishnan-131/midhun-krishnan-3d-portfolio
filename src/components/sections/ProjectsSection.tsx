import Link from "next/link";
import { projects } from "@/data/projects";
import { getSection } from "@/data/navigation";
import type { Project } from "@/types/project";
import { cn } from "@/lib/utils/cn";
import { Container } from "@/components/layout/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Heading } from "@/components/ui/Heading";
import { Tag } from "@/components/ui/Tag";
import { SceneSlot } from "@/components/three/core/SceneSlot";
import { CardArranger } from "@/components/interaction/CardArranger";
import { FocusTarget } from "@/components/sections/FocusTarget";
import { SceneFallback } from "@/components/sections/SceneFallback";
import { StatusBadge } from "@/components/sections/StatusBadge";

function ProjectCard({
  project,
  featured,
}: {
  project: Project;
  featured?: boolean;
}) {
  const headingId = `project-${project.slug}`;
  return (
    <div
      data-arrange-item
      data-arrange-id={project.slug}
      className="min-w-0 rounded-lg"
    >
      <FocusTarget kind="project" id={project.slug}>
        <article
          data-cursor="View"
          aria-labelledby={headingId}
          className={cn(
            "relative flex flex-col gap-5 rounded-lg border border-line bg-ink-950/70 p-6 backdrop-blur-sm transition-colors duration-(--duration-base) group-hover/focus:border-line-strong sm:p-8",
            featured && "border-ember/40 group-hover/focus:border-ember/70",
          )}
        >
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={project.status} />
            {featured ? <Tag tone="neutral">Flagship</Tag> : null}
          </div>
          <Heading
            level={3}
            variant={featured ? "title" : "subtitle"}
            id={headingId}
          >
            <Link
              href={`/projects/${project.slug}`}
              data-cursor="View"
              className="transition-colors duration-(--duration-fast) hover:text-ember-soft"
            >
              {project.title}
            </Link>
          </Heading>
          <p
            className={cn("text-paper-dim", featured && "text-lead text-paper")}
          >
            {featured ? project.summary : project.tagline}
          </p>
          {featured && project.architecture.length ? (
            <ul className="flex flex-col gap-2 border-l border-line pl-5 text-paper-dim">
              {project.architecture.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          ) : null}
          {project.technologies.length ? (
            <ul
              className="flex flex-wrap gap-2"
              aria-label={`${project.title} technologies`}
            >
              {project.technologies.map((tech) => (
                <li key={tech}>
                  <Tag tone="muted">{tech}</Tag>
                </li>
              ))}
            </ul>
          ) : null}
          {project.technologiesToConfirm.length ? (
            <p className="text-sm text-paper-faint">
              Technologies to confirm:{" "}
              {project.technologiesToConfirm.join(", ")}
            </p>
          ) : null}
          <p className="text-sm text-paper-faint">{project.statusNote}</p>
          <div className="flex flex-wrap gap-5 pt-1 text-sm">
            {project.githubUrl ? (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="Open"
                className="text-paper underline decoration-ember underline-offset-4 hover:text-ember-soft"
              >
                View on GitHub
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            ) : (
              <span className="text-paper-faint">GitHub link to be added</span>
            )}
            {project.demoUrl ? (
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="Open"
                className="text-paper underline decoration-ember underline-offset-4 hover:text-ember-soft"
              >
                Live demo<span className="sr-only"> (opens in a new tab)</span>
              </a>
            ) : (
              <span className="text-paper-faint">Demo to be added</span>
            )}
            <Link
              href={`/projects/${project.slug}`}
              data-cursor="View"
              className="text-paper underline decoration-ember underline-offset-4 hover:text-ember-soft"
            >
              Project details
            </Link>
          </div>
        </article>
      </FocusTarget>
    </div>
  );
}

/** Project universe: a sticky 3D orbit beside the cards; MYX AI leads as the flagship. */
export function ProjectsSection() {
  const section = getSection("projects");
  const headingId = `${section.id}-heading`;
  const featured = projects.filter((p) => p.featured);
  const rest = projects.filter((p) => !p.featured);
  // Animation order: other cards first, MYX AI last so it lands in its slot last.
  const arrangeOrder = [
    ...rest.map((project) => project.slug),
    ...featured.map((project) => project.slug),
  ];
  return (
    <section
      id={section.id}
      aria-labelledby={headingId}
      data-section={section.id}
      className="relative border-t border-line py-(--section-space)"
    >
      <Container size="wide">
        <header data-parallax="copy" className="flex max-w-3xl flex-col gap-6">
          <Eyebrow number={section.number}>Selected work</Eyebrow>
          <Heading level={2} id={headingId}>
            {section.title}
          </Heading>
          <p data-reveal="fade" className="text-lead text-paper-dim">
            {projects.length} projects across AI, Python and frontend
            development, each marked honestly as in progress, a prototype or
            planned.
          </p>
          <p data-reveal="fade">
            <Link
              href="/projects"
              data-cursor="View"
              className="text-sm text-paper underline decoration-ember underline-offset-4 hover:text-ember-soft"
            >
              Open the project catalogue
            </Link>
          </p>
        </header>
        <div className="mt-16 grid gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <SceneSlot
              scene="projects"
              fallback={<SceneFallback scene="projects" />}
              className="aspect-square w-full lg:sticky lg:top-[calc(var(--header-height)+2rem)] lg:aspect-auto lg:h-[calc(100svh-var(--header-height)-4rem)]"
            />
          </div>
          <CardArranger
            id="projects-arrange"
            order={arrangeOrder}
            className="flex flex-col gap-6 lg:col-span-7"
          >
            {featured.map((p) => (
              <ProjectCard key={p.slug} project={p} featured />
            ))}
            <div className="grid gap-6 sm:grid-cols-2">
              {rest.map((p) => (
                <ProjectCard key={p.slug} project={p} />
              ))}
            </div>
          </CardArranger>
        </div>
      </Container>
    </section>
  );
}
