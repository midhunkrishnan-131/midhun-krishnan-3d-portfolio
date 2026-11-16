import { getSection } from "@/data/navigation";
import { site } from "@/data/site";
import { SectionShell } from "@/components/layout/SectionShell";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Heading } from "@/components/ui/Heading";
import { ButtonLink } from "@/components/ui/Button";
import { SceneSlot } from "@/components/three/core/SceneSlot";
import { HeroFallbackArt } from "@/components/sections/HeroFallbackArt";
import { sectionHref } from "@/data/navigation";

/**
 * Cinematic hero. All text is server-rendered HTML; the 3D manuscript is a decorative,
 * lazily loaded layer behind it with a static SVG fallback.
 */
export function HeroSection() {
  const section = getSection("hero");
  return (
    <SectionShell
      section={section}
      customHeading
      className="isolate flex min-h-svh items-end overflow-hidden border-t-0 pt-[calc(var(--header-height)+4rem)] pb-16 sm:pb-24"
    >
      <div className="absolute inset-0 -z-10">
        <SceneSlot
          scene="hero"
          fallback={<HeroFallbackArt />}
          className="absolute inset-0"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-ink-950 via-ink-950/70 to-transparent"
        />
      </div>
      <div className="relative flex max-w-4xl flex-col gap-8">
        <Eyebrow number={section.number}>Prologue</Eyebrow>
        <Heading level={1} variant="display" id={`${section.id}-heading`}>
          {site.name}
        </Heading>
        <p className="font-display text-title text-paper-dim italic">
          {site.title}
        </p>
        <ul
          className="flex flex-col gap-1 text-sm text-paper-dim sm:text-base"
          aria-label="Currently"
        >
          {site.roles.map((role) => (
            <li key={role}>{role}</li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-4 pt-2">
          <ButtonLink href={sectionHref("projects")}>
            Explore the projects
          </ButtonLink>
          <ButtonLink href={sectionHref("about")} variant="ghost">
            Read the story
          </ButtonLink>
        </div>
      </div>
    </SectionShell>
  );
}
