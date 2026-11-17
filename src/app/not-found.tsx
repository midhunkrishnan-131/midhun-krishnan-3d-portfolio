import { Container } from "@/components/layout/Container";
import { ButtonLink } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Heading } from "@/components/ui/Heading";
import { PageSceneFrame } from "@/components/sections/PageSceneFrame";

export default function NotFound() {
  return (
    <main id="main" tabIndex={-1} className="relative z-10 focus:outline-none">
      <section className="py-(--section-space)">
        <Container size="wide">
          <div className="grid items-center gap-12 lg:grid-cols-12">
            <div className="flex flex-col gap-6 lg:col-span-5">
              <Eyebrow>Lost</Eyebrow>
              <Heading level={1} variant="display">
                This page is not here.
              </Heading>
              <p className="max-w-prose text-lead text-paper-dim">
                The path you followed does not match anything on this site. The
                story is still being written — start again from the beginning,
                or from the work.
              </p>
              <div className="flex flex-wrap gap-4">
                <ButtonLink href="/" data-magnetic>
                  Back to the story
                </ButtonLink>
                <ButtonLink href="/projects" data-magnetic>
                  All projects
                </ButtonLink>
              </div>
            </div>
            <PageSceneFrame
              scene="lost"
              className="lg:col-span-7 lg:aspect-auto lg:h-[60svh]"
            />
          </div>
        </Container>
      </section>
    </main>
  );
}
