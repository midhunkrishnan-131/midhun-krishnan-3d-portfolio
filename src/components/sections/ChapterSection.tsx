import type { ReactNode } from "react";
import type { Chapter } from "@/types/content";
import type { SceneKey } from "@/types/three";
import { getSection } from "@/data/navigation";
import { cn } from "@/lib/utils/cn";
import { Container } from "@/components/layout/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Heading } from "@/components/ui/Heading";
import { SceneSlot } from "@/components/three/core/SceneSlot";
import { CopyText } from "@/components/sections/CopyText";
import { SceneFallback } from "@/components/sections/SceneFallback";

interface ChapterSectionProps {
  chapter: Chapter;
  scene?: Exclude<SceneKey, "hero">;
  /** Put the scene on the left on wide screens. */
  reverse?: boolean;
  children?: ReactNode;
}

/**
 * Editorial chapter: numbered eyebrow, h2, a large lead line, body copy and facts — all
 * server-rendered — beside an individual 3D scene slot with a static fallback.
 */
export function ChapterSection({
  chapter,
  scene,
  reverse = false,
  children,
}: ChapterSectionProps) {
  const section = getSection(chapter.id);
  const headingId = `${section.id}-heading`;
  return (
    <section
      id={section.id}
      data-section={section.id}
      aria-labelledby={headingId}
      className="relative border-t border-line py-(--section-space)"
    >
      <Container size="wide">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
          <div
            data-parallax="copy"
            className={cn(
              "flex flex-col gap-8 lg:col-span-5",
              scene
                ? reverse
                  ? "lg:order-2 lg:col-start-8"
                  : ""
                : "lg:col-span-8",
            )}
          >
            <Eyebrow number={section.number}>{chapter.kicker}</Eyebrow>
            <Heading level={2} id={headingId}>
              {section.title}
            </Heading>
            <CopyText
              copy={chapter.lead}
              reveal="words"
              className={cn(
                "font-display text-lead text-paper sm:text-[1.75rem] sm:leading-snug",
                chapter.lead.placeholder && "text-paper-dim",
              )}
            />
            <div className="flex max-w-prose flex-col gap-4 text-paper-dim">
              {chapter.body.map((copy) => (
                <CopyText key={copy.text} copy={copy} reveal="fade" />
              ))}
            </div>
            {chapter.facts?.length ? (
              <dl
                data-reveal="stagger"
                className={cn(
                  "grid gap-px overflow-hidden rounded-lg border border-line bg-line",
                  chapter.facts.length > 1 && "sm:grid-cols-2",
                )}
              >
                {chapter.facts.map((fact) => (
                  <div
                    key={fact.label}
                    className="flex flex-col gap-1 bg-ink-950 p-5"
                  >
                    <dt className="text-micro text-paper-faint uppercase">
                      {fact.label}
                    </dt>
                    <dd className="text-paper">{fact.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
            {children}
          </div>
          {scene ? (
            <SceneSlot
              scene={scene}
              reveal
              fallback={<SceneFallback scene={scene} />}
              className={cn(
                "aspect-square w-full origin-center sm:aspect-[4/3] lg:col-span-7 lg:aspect-auto lg:h-[78svh]",
                reverse && "lg:order-1 lg:col-start-1",
              )}
            />
          ) : null}
        </div>
      </Container>
    </section>
  );
}
