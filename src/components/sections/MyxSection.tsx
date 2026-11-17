import { getSection } from "@/data/navigation";
import { chapters } from "@/data/story";
import {
  myxArchitecture,
  myxCapabilities,
  myxRepo,
  myxStack,
  myxTitle,
  statusLabel,
} from "@/data/myx";
import { Container } from "@/components/layout/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Heading } from "@/components/ui/Heading";
import { ButtonLink } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";
import { CopyText } from "@/components/sections/CopyText";
import { SceneSlot } from "@/components/three/core/SceneSlot";
import { SceneFallback } from "@/components/sections/SceneFallback";

function toneFor(
  status: (typeof myxCapabilities)[number]["status"],
): "neutral" | "accent" | "muted" {
  if (status === "implemented") return "neutral";
  if (status === "in-development") return "accent";
  return "muted";
}

/** Flagship MYX AI chapter: honest capability labels beside the shield scene. */
export function MyxSection() {
  const section = getSection("myx");
  const chapter = chapters.myx;
  const headingId = `${section.id}-heading`;

  return (
    <section
      id={section.id}
      data-section={section.id}
      aria-labelledby={headingId}
      className="relative border-t border-line py-(--section-space)"
    >
      <Container size="wide">
        <div className="grid items-start gap-12 lg:grid-cols-12 lg:gap-8">
          <div
            data-parallax="copy"
            className="flex flex-col gap-8 lg:col-span-5"
          >
            <Eyebrow number={section.number}>{chapter.kicker}</Eyebrow>
            <Heading level={2} id={headingId}>
              {section.title}
            </Heading>
            <p className="font-mono text-micro text-paper-faint uppercase">
              {myxTitle}
            </p>
            <CopyText
              copy={chapter.lead}
              reveal="words"
              className="font-display text-lead text-paper sm:text-[1.75rem] sm:leading-snug"
            />
            {chapter.body.map((copy) => (
              <CopyText
                key={copy.text}
                copy={copy}
                reveal="fade"
                className="max-w-prose text-paper-dim"
              />
            ))}
            <div className="flex flex-wrap gap-3">
              <ButtonLink href={myxRepo} external data-magnetic>
                View on GitHub
              </ButtonLink>
              <ButtonLink href="/projects/myx-ai" data-magnetic>
                Project page
              </ButtonLink>
            </div>
          </div>
          <SceneSlot
            scene="myx"
            reveal
            fallback={<SceneFallback scene="myx" />}
            className="aspect-[5/4] w-full max-h-[min(62svh,26rem)] origin-center sm:aspect-[4/3] sm:max-h-[min(68svh,34rem)] lg:col-span-7 lg:aspect-auto lg:h-[min(70svh,42rem)] lg:max-h-none"
          />
        </div>

        <div className="mt-16 grid gap-12 lg:grid-cols-12">
          <section
            aria-labelledby="myx-architecture-heading"
            className="lg:col-span-5"
          >
            <h3
              id="myx-architecture-heading"
              className="font-sans text-lead font-medium tracking-tight text-paper"
            >
              Architecture
            </h3>
            <ol className="mt-6 flex flex-col border-t border-line">
              {myxArchitecture.map((item, index) => (
                <li
                  key={item.layer}
                  className="flex flex-col gap-1 border-b border-line py-5"
                >
                  <span className="font-mono text-micro text-paper-faint uppercase">
                    0{index + 1} — {item.layer}
                  </span>
                  <span className="text-paper-dim">{item.detail}</span>
                </li>
              ))}
            </ol>
          </section>

          <section
            aria-labelledby="myx-capabilities-heading"
            className="lg:col-span-7"
          >
            <h3
              id="myx-capabilities-heading"
              className="font-sans text-lead font-medium tracking-tight text-paper"
            >
              Capabilities
            </h3>
            <p className="mt-3 max-w-prose text-sm text-paper-faint">
              Labels follow the public repository, not a live deployment. A
              feature is only marked implemented when the code is present.
            </p>
            <ul className="mt-6 flex flex-col border-t border-line">
              {myxCapabilities.map((item) => (
                <li
                  key={item.name}
                  className="flex flex-col gap-2 border-b border-line py-5 sm:flex-row sm:items-start sm:justify-between sm:gap-8"
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-paper">{item.name}</span>
                    <span className="text-sm text-paper-dim">{item.note}</span>
                  </div>
                  <Tag tone={toneFor(item.status)} className="shrink-0">
                    {statusLabel[item.status]}
                  </Tag>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <ul
          className="mt-12 flex flex-wrap gap-2"
          aria-label="Technology stack"
        >
          {myxStack.map((item) => (
            <li key={item}>
              <Tag>{item}</Tag>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
