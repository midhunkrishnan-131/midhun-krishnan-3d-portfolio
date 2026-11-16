import type { SectionNavItem } from "@/types/navigation";
import { SectionShell } from "@/components/layout/SectionShell";

/** Phase 2 placeholder: semantic section with id + h2 only. Content arrives in Phase 5. */
export function SectionStub({ section }: { section: SectionNavItem }) {
  return <SectionShell section={section} className="min-h-[70svh]" />;
}
