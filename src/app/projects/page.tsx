import { projects } from "@/data/projects";
import { site } from "@/data/site";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildProjectsIndexGraph } from "@/lib/seo/jsonld";
import { buildProjectsIndexMetadata } from "@/lib/seo/metadata";
import { Container } from "@/components/layout/Container";
import { Breadcrumb } from "@/components/navigation/Breadcrumb";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Heading } from "@/components/ui/Heading";
import { ProjectSummary } from "@/components/projects/ProjectSummary";
import { PageSceneFrame } from "@/components/sections/PageSceneFrame";

export const metadata = buildProjectsIndexMetadata();

export default function ProjectsIndexPage() {
  const featured = projects.filter((project) => project.featured);
  const rest = projects.filter((project) => !project.featured);

  return (
    <main id="main" tabIndex={-1} className="relative z-10 focus:outline-none">
      <JsonLd data={buildProjectsIndexGraph()} />
      <section className="border-b border-line py-(--section-space)">
        <Container>
          <Breadcrumb
            items={[{ label: "Home", href: "/" }, { label: "Projects" }]}
          />
          <div className="mt-10 grid items-center gap-10 lg:grid-cols-12">
            <div className="flex max-w-3xl flex-col gap-6 lg:col-span-5">
              <Eyebrow>Catalogue</Eyebrow>
              <Heading level={1} variant="display">
                Projects
              </Heading>
              <p className="text-lead text-paper-dim">
                Software Midhun can show today, listed from the flagship work
                outward. Status, technologies and links appear only when they
                have been confirmed. The catalogue is edited from{" "}
                <code className="font-mono text-[0.9em] text-paper">
                  src/data/projects.ts
                </code>
                .
              </p>
            </div>
            <PageSceneFrame
              scene="catalogue"
              className="lg:col-span-7 lg:aspect-auto lg:h-[52svh]"
            />
          </div>
        </Container>
      </section>
      {featured.length ? (
        <section
          aria-labelledby="flagship-heading"
          className="border-b border-line py-(--section-space)"
        >
          <Container className="flex flex-col gap-10">
            <Heading level={2} variant="subtitle" id="flagship-heading">
              Flagship
            </Heading>
            {featured.map((project) => (
              <ProjectSummary key={project.slug} project={project} featured />
            ))}
          </Container>
        </section>
      ) : null}
      <section
        aria-labelledby="all-projects-heading"
        className="py-(--section-space)"
      >
        <Container className="flex flex-col gap-10">
          <Heading level={2} variant="subtitle" id="all-projects-heading">
            All projects
          </Heading>
          <ul className="grid gap-6 sm:grid-cols-2">
            {rest.map((project) => (
              <li key={project.slug} className="min-w-0">
                <ProjectSummary project={project} />
              </li>
            ))}
          </ul>
          <p className="text-sm text-paper-faint">
            {projects.length} projects in the catalogue of {site.name}.
          </p>
        </Container>
      </section>
    </main>
  );
}
