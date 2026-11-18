import Link from "next/link";
import { sections, sectionHref } from "@/data/navigation";
import { chapters } from "@/data/story";
import { projects } from "@/data/projects";
import { skillGroups } from "@/data/skills";
import { site } from "@/data/site";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildIndexPageGraph } from "@/lib/seo/jsonld";
import { buildIndexPageMetadata } from "@/lib/seo/metadata";
import { Container } from "@/components/layout/Container";
import { Breadcrumb } from "@/components/navigation/Breadcrumb";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Heading } from "@/components/ui/Heading";
import { Tag } from "@/components/ui/Tag";
import { projectPath } from "@/lib/seo/constants";

export const metadata = buildIndexPageMetadata();

export default function IndexPage() {
  const chapterKeys = Object.keys(chapters) as (keyof typeof chapters)[];

  return (
    <main id="main" tabIndex={-1} className="relative z-10 focus:outline-none">
      <JsonLd data={buildIndexPageGraph()} />

      {/* Header Section */}
      <section className="border-b border-line py-(--section-space)">
        <Container>
          <Breadcrumb
            items={[{ label: "Home", href: "/" }, { label: "Index" }]}
          />
          <div className="mt-10 flex max-w-3xl flex-col gap-6">
            <Eyebrow>Directory & Archive</Eyebrow>
            <Heading level={1} variant="display">
              Index
            </Heading>
            <p className="text-lead text-paper-dim">
              A comprehensive table of contents across thirteen story chapters,
              software engineering projects, verified technical capabilities,
              and professional contact channels.
            </p>
          </div>
        </Container>
      </section>

      {/* Chapters Table of Contents */}
      <section
        aria-labelledby="chapters-heading"
        className="border-b border-line py-(--section-space)"
      >
        <Container className="flex flex-col gap-12">
          <div className="flex flex-col gap-2">
            <Eyebrow>Navigation</Eyebrow>
            <Heading level={2} id="chapters-heading">
              Story Chapters
            </Heading>
            <p className="max-w-2xl text-paper-dim">
              The thirteen chapters of the chronological narrative, from
              foundational beginnings to current AI engineering work.
            </p>
          </div>

          <div className="grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {sections.map((section) => {
              const chapterKey = chapterKeys.find(
                (k) => chapters[k].id === section.id,
              );
              const chapter = chapterKey ? chapters[chapterKey] : null;

              return (
                <Link
                  key={section.id}
                  href={sectionHref(section.id)}
                  className="group flex flex-col justify-between gap-6 bg-ink-950 p-6 transition-colors duration-(--duration-base) hover:bg-ink-900"
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-micro text-ember tabular-nums">
                        {section.number}
                      </span>
                      <span className="font-mono text-micro text-paper-faint uppercase">
                        {section.label}
                      </span>
                    </div>
                    <h3 className="font-display text-2xl text-paper transition-colors duration-(--duration-base) group-hover:text-ember-soft">
                      {section.title}
                    </h3>
                    {chapter?.lead.text ? (
                      <p className="line-clamp-2 text-sm text-paper-dim">
                        {chapter.lead.text}
                      </p>
                    ) : null}
                  </div>
                  <span className="inline-flex items-center gap-2 font-mono text-micro text-paper-dim uppercase transition-colors group-hover:text-paper">
                    <span>Jump to section</span>
                    <span aria-hidden="true">→</span>
                  </span>
                </Link>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Projects Directory */}
      <section
        aria-labelledby="projects-dir-heading"
        className="border-b border-line py-(--section-space)"
      >
        <Container className="flex flex-col gap-12">
          <div className="flex flex-col gap-2">
            <Eyebrow>Portfolio</Eyebrow>
            <Heading level={2} id="projects-dir-heading">
              Projects Directory
            </Heading>
            <p className="max-w-2xl text-paper-dim">
              Verified software projects across artificial intelligence, web
              defense, developer tools, and data processing.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <div
                key={project.slug}
                className="flex flex-col justify-between gap-6 rounded-lg border border-line bg-ink-950 p-6"
              >
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-micro text-paper-faint capitalize">
                      {project.status.replace("-", " ")}
                    </span>
                    {project.featured ? (
                      <Tag tone="accent">Flagship</Tag>
                    ) : (
                      <Tag tone="neutral">Project</Tag>
                    )}
                  </div>
                  <div>
                    <h3 className="font-display text-2xl text-paper">
                      <Link
                        href={projectPath(project.slug)}
                        className="transition-colors hover:text-ember-soft"
                      >
                        {project.title}
                      </Link>
                    </h3>
                    <p className="mt-2 line-clamp-3 text-sm text-paper-dim">
                      {project.summary}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {project.technologies.slice(0, 4).map((tech) => (
                      <span
                        key={tech}
                        className="rounded-full border border-line bg-ink-900 px-2.5 py-0.5 font-mono text-micro text-paper-dim"
                      >
                        {tech}
                      </span>
                    ))}
                    {project.technologies.length > 4 ? (
                      <span className="rounded-full border border-line bg-ink-900 px-2 py-0.5 font-mono text-micro text-paper-faint">
                        +{project.technologies.length - 4}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-line pt-4">
                  <Link
                    href={projectPath(project.slug)}
                    className="font-mono text-micro text-paper transition-colors hover:text-ember-soft"
                  >
                    View Details →
                  </Link>
                  {project.githubUrl ? (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-micro text-paper-faint transition-colors hover:text-paper"
                    >
                      GitHub ↗
                    </a>
                  ) : null}
                </div>
              </div>
            ))}
          </div>

          <div>
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 rounded-pill border border-line px-5 py-2.5 font-mono text-micro font-medium text-paper uppercase transition-colors hover:border-paper"
            >
              <span>Explore Full Projects Catalogue</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </Container>
      </section>

      {/* Skills & Capabilities */}
      <section
        aria-labelledby="skills-dir-heading"
        className="border-b border-line py-(--section-space)"
      >
        <Container className="flex flex-col gap-12">
          <div className="flex flex-col gap-2">
            <Eyebrow>Capabilities</Eyebrow>
            <Heading level={2} id="skills-dir-heading">
              Technical Competencies
            </Heading>
            <p className="max-w-2xl text-paper-dim">
              Verified skills grouped by discipline, drawn directly from
              confirmed project implementations and active training.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {skillGroups.map((group) => (
              <div
                key={group.id}
                className="flex flex-col gap-4 rounded-lg border border-line bg-ink-950 p-6"
              >
                <h3 className="font-display text-xl text-paper">
                  {group.title}
                </h3>
                <ul className="flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <li
                      key={item.name}
                      className="rounded border border-line bg-ink-900 px-2.5 py-1 font-mono text-xs text-paper-dim"
                    >
                      {item.name}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Contact & Profiles */}
      <section
        aria-labelledby="contact-dir-heading"
        className="py-(--section-space)"
      >
        <Container className="flex flex-col gap-10">
          <div className="flex flex-col gap-2">
            <Eyebrow>Connect</Eyebrow>
            <Heading level={2} id="contact-dir-heading">
              Profiles & Contact
            </Heading>
          </div>

          <div className="grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            <a
              href={`mailto:${site.contact.email}`}
              className="flex flex-col gap-1 bg-ink-950 p-6 transition-colors hover:bg-ink-900"
            >
              <span className="font-mono text-micro text-paper-faint uppercase">
                Email
              </span>
              <span className="font-mono text-sm text-paper">
                {site.contact.email}
              </span>
            </a>
            <a
              href={site.contact.github}
              target="_blank"
              rel="noreferrer"
              className="flex flex-col gap-1 bg-ink-950 p-6 transition-colors hover:bg-ink-900"
            >
              <span className="font-mono text-micro text-paper-faint uppercase">
                GitHub
              </span>
              <span className="font-mono text-sm text-paper">
                midhunkrishnan-131
              </span>
            </a>
            <a
              href={site.contact.linkedin}
              target="_blank"
              rel="noreferrer"
              className="flex flex-col gap-1 bg-ink-950 p-6 transition-colors hover:bg-ink-900"
            >
              <span className="font-mono text-micro text-paper-faint uppercase">
                LinkedIn
              </span>
              <span className="font-mono text-sm text-paper">
                midhun-krishnan
              </span>
            </a>
            <div className="flex flex-col gap-1 bg-ink-950 p-6">
              <span className="font-mono text-micro text-paper-faint uppercase">
                Location
              </span>
              <span className="text-sm text-paper">{site.location}</span>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
