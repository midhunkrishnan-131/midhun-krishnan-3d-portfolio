import { sections } from "@/data/navigation";
import { HeroSection } from "@/components/sections/HeroSection";
import { SectionStub } from "@/components/sections/SectionStub";

export default function Home() {
  return (
    <main id="main" tabIndex={-1} className="focus:outline-none">
      <HeroSection />
      {sections
        .filter((section) => section.id !== "hero")
        .map((section) => (
          <SectionStub key={section.id} section={section} />
        ))}
    </main>
  );
}
