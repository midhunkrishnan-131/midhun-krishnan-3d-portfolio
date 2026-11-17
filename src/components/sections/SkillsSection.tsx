import { skillGroups } from "@/data/skills";
import { getSection } from "@/data/navigation";
import { Container } from "@/components/layout/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Heading } from "@/components/ui/Heading";
import { Tag } from "@/components/ui/Tag";
import { SceneSlot } from "@/components/three/core/SceneSlot";
import { CardArranger } from "@/components/interaction/CardArranger";
import { FocusTarget } from "@/components/sections/FocusTarget";
import { SceneFallback } from "@/components/sections/SceneFallback";

/** Skills as groups (no invented proficiency levels) beside a constellation scene. */
export function SkillsSection() {
  const section = getSection("skills");
  const headingId = `${section.id}-heading`;
  return (
    <section
      id={section.id}
      aria-labelledby={headingId}
      data-section={section.id}
      className="relative border-t border-line py-(--section-space)"
    >
      <Container size="wide">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
          <SceneSlot
            scene="skills"
            fallback={<SceneFallback scene="skills" />}
            className="aspect-square w-full lg:order-2 lg:col-span-6 lg:col-start-7 lg:aspect-auto lg:h-[80svh]"
          />
          <div
            data-parallax="copy"
            className="flex flex-col gap-10 lg:order-1 lg:col-span-6"
          >
            <header className="flex flex-col gap-6">
              <Eyebrow number={section.number}>Toolkit</Eyebrow>
              <Heading level={2} id={headingId}>
                {section.title}
              </Heading>
              <p data-reveal="fade" className="text-paper-dim">
                Grouped by what my work and studies actually involve. Items
                marked “to confirm” are mentioned in my project notes but not
                yet confirmed.
              </p>
            </header>
            <CardArranger
              id="skills-arrange"
              order={skillGroups.map((group) => group.id)}
            >
              <ul className="flex flex-col border-t border-line">
                {skillGroups.map((group) => (
                  <li key={group.id}>
                    <div
                      data-arrange-item
                      data-arrange-id={group.id}
                      className="border-b border-line"
                    >
                      <FocusTarget
                        kind="skillGroup"
                        id={group.id}
                        className="py-6"
                      >
                        <h3 className="mb-4 text-lead font-medium text-paper transition-colors group-hover/focus:text-ember-soft">
                          {group.title}
                        </h3>
                        <ul
                          className="flex flex-wrap gap-2"
                          aria-label={group.title}
                        >
                          {group.items.map((item) => (
                            <li key={item.name}>
                              <Tag tone={item.confirmed ? "neutral" : "muted"}>
                                {item.name}
                                {item.confirmed ? null : (
                                  <span className="ml-1 normal-case">
                                    (to confirm)
                                  </span>
                                )}
                              </Tag>
                            </li>
                          ))}
                        </ul>
                      </FocusTarget>
                    </div>
                  </li>
                ))}
              </ul>
            </CardArranger>
          </div>
        </div>
      </Container>
    </section>
  );
}
