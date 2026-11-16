import { getSection } from "@/data/navigation";
import { site } from "@/data/site";
import { SectionShell } from "@/components/layout/SectionShell";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Heading } from "@/components/ui/Heading";

export function HeroSection() {
  const section = getSection("hero");
  return (
    <SectionShell
      section={section}
      customHeading
      className="flex min-h-svh items-end border-t-0 pt-[calc(var(--header-height)+4rem)] pb-16"
    >
      <div className="flex flex-col gap-8">
        <Eyebrow number={section.number}>Prologue</Eyebrow>
        <Heading level={1} variant="display" id={`${section.id}-heading`}>
          {site.name}
        </Heading>
        <p className="font-display text-title text-paper-dim italic">
          {site.title}
        </p>
      </div>
    </SectionShell>
  );
}
