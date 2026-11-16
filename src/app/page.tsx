import { chapters } from "@/data/story";
import { HeroSection } from "@/components/sections/HeroSection";
import { ChapterSection } from "@/components/sections/ChapterSection";
import { ProjectsSection } from "@/components/sections/ProjectsSection";
import { SkillsSection } from "@/components/sections/SkillsSection";
import { ContactSection } from "@/components/sections/ContactSection";

/** The long-scroll story: eleven chapters, each with its own (lazy, optional) 3D scene. */
export default function Home() {
  return (
    <main id="main" tabIndex={-1} className="relative z-10 focus:outline-none">
      <HeroSection />
      <ChapterSection chapter={chapters.about} />
      <ChapterSection chapter={chapters.beginning} scene="beginning" />
      <ChapterSection chapter={chapters.struggle} scene="struggle" reverse />
      <ChapterSection
        chapter={chapters["blackbox-learning"]}
        scene="blackbox"
      />
      <ChapterSection chapter={chapters.bca} scene="bca" reverse />
      <ChapterSection chapter={chapters.perception} scene="perception" />
      <ProjectsSection />
      <SkillsSection />
      <ChapterSection chapter={chapters.future} scene="future" reverse />
      <ContactSection />
    </main>
  );
}
