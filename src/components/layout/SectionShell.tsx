import type { ReactNode } from "react";
import type { SectionNavItem } from "@/types/navigation";
import { cn } from "@/lib/utils/cn";
import { Container } from "@/components/layout/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Heading } from "@/components/ui/Heading";

interface SectionShellProps {
  section: SectionNavItem;
  children?: ReactNode;
  className?: string;
  /** Hide the default heading block when a section renders its own (e.g. the hero's h1). */
  customHeading?: boolean;
}

/**
 * Semantic chapter wrapper: <section id aria-labelledby> + numbered eyebrow + h2.
 * All text stays in server-rendered HTML; 3D slots sit beside it in later phases.
 */
export function SectionShell({
  section,
  children,
  className,
  customHeading = false,
}: SectionShellProps) {
  const headingId = `${section.id}-heading`;
  return (
    <section
      id={section.id}
      aria-labelledby={headingId}
      className={cn(
        "relative border-t border-line py-(--section-space)",
        className,
      )}
    >
      <Container size="wide">
        {customHeading ? null : (
          <header className="flex flex-col gap-6">
            <Eyebrow number={section.number}>Chapter</Eyebrow>
            <Heading level={2} id={headingId}>
              {section.title}
            </Heading>
          </header>
        )}
        {children}
      </Container>
    </section>
  );
}
