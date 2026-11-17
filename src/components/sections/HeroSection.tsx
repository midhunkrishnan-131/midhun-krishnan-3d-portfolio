import { getSection } from "@/data/navigation";
import { site } from "@/data/site";
import { Container } from "@/components/layout/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Heading } from "@/components/ui/Heading";
import { ButtonLink } from "@/components/ui/Button";
import { SceneSlot } from "@/components/three/core/SceneSlot";
import { HeroFallbackArt } from "@/components/sections/HeroFallbackArt";
import { sectionHref } from "@/data/navigation";

/**
 * Cinematic hero. All text is server-rendered HTML; the 3D manuscript is a decorative,
 * lazily loaded, scroll-scrubbed layer behind it with a static SVG fallback.
 */
export function HeroSection() {
  const section = getSection("hero");
  const headingId = `${section.id}-heading`;
  return (
    // Normal height by default (no-JS, no-WebGL, reduced motion). Only when the 3D view is
    // live does <html data-gl="on"> make it tall so its sticky content pins and scroll
    // scrubs the paper animation (see .hero-pin in globals.css).
    <section
      id={section.id}
      aria-labelledby={headingId}
      data-section={section.id}
      className="hero-pin relative isolate"
    >
      <div className="sticky top-0 flex h-svh min-h-[32rem] items-end overflow-x-clip overflow-y-auto pt-[calc(var(--header-height)+3rem)] pb-16 motion-reduce:relative sm:min-h-[36rem] sm:pt-[calc(var(--header-height)+4rem)] sm:pb-24">
        <div className="absolute inset-0 -z-10">
          <SceneSlot
            scene="hero"
            scrollTargetId={section.id}
            progressMode="pin"
            preload="30% 0px"
            fallback={<HeroFallbackArt />}
            className="absolute inset-0"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-ink-950 via-ink-950/70 to-transparent"
          />
        </div>
        <Container size="wide">
          <div
            data-hero-content
            className="relative flex max-w-4xl flex-col gap-8"
          >
            <Eyebrow number={section.number} data-hero-stage="eyebrow">
              Prologue
            </Eyebrow>
            <Heading
              level={1}
              variant="display"
              id={headingId}
              data-hero-stage="title"
            >
              {site.name}
            </Heading>
            <p
              data-hero-stage="kicker"
              className="font-display text-title text-paper-dim italic"
            >
              {site.title}
            </p>
            <ul
              data-hero-stage="roles"
              className="flex flex-col gap-1 text-sm text-paper-dim sm:text-base"
              aria-label="Currently"
            >
              {site.roles.map((role) => (
                <li key={role}>{role}</li>
              ))}
            </ul>
            <div
              data-hero-stage="actions"
              className="flex flex-wrap gap-4 pt-2"
            >
              <ButtonLink href={sectionHref("projects")} data-magnetic>
                Explore the projects
              </ButtonLink>
              <ButtonLink
                href={sectionHref("about")}
                variant="ghost"
                data-magnetic
              >
                Read the story
              </ButtonLink>
            </div>
          </div>
        </Container>
      </div>
    </section>
  );
}
