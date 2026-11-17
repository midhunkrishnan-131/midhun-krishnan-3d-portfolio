import Link from "next/link";
import type { Project } from "@/types/project";
import { cn } from "@/lib/utils/cn";
import { Heading } from "@/components/ui/Heading";
import { Tag } from "@/components/ui/Tag";
import { StatusBadge } from "@/components/sections/StatusBadge";
import { projectPath } from "@/lib/seo/constants";

export function ProjectSummary({
  project,
  featured = false,
}: {
  project: Project;
  featured?: boolean;
}) {
  const headingId = `catalogue-${project.slug}`;
  const href = projectPath(project.slug);
  return (
    <article
      aria-labelledby={headingId}
      className={cn(
        "flex h-full flex-col gap-5 rounded-lg border border-line bg-ink-950/70 p-6 sm:p-8",
        featured && "border-ember/40",
      )}
    >
      <div className="flex flex-wrap items-center gap-3">
        <StatusBadge status={project.status} />
        {featured ? <Tag tone="neutral">Flagship</Tag> : null}
      </div>
      <Heading
        level={featured ? 2 : 3}
        variant={featured ? "title" : "subtitle"}
        id={headingId}
      >
        <Link
          href={href}
          data-cursor="View"
          className="transition-colors duration-(--duration-fast) hover:text-ember-soft"
        >
          {project.title}
        </Link>
      </Heading>
      <p className={cn("text-paper-dim", featured && "text-lead text-paper")}>
        {featured ? project.summary : project.tagline}
      </p>
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
      <p className="mt-auto pt-2">
        <Link
          href={href}
          data-cursor="View"
          className="text-sm text-paper underline decoration-ember underline-offset-4 hover:text-ember-soft"
        >
          Project details
        </Link>
      </p>
    </article>
  );
}
