import type { SkillGroup } from "@/types/content";

/**
 * Skill groups, limited to what Midhun's brief and verified project data show.
 * No proficiency levels or years — none were provided.
 */
export const skillGroups: SkillGroup[] = [
  {
    id: "ai",
    title: "AI application development",
    source: "Brief; MYX AI repository",
    items: [
      { name: "Gemini API", confirmed: true },
      { name: "Google Gen AI SDK", confirmed: true },
      { name: "Generative AI (in training)", confirmed: true },
    ],
  },
  {
    id: "python",
    title: "Python development",
    source: "Brief; project descriptions",
    items: [
      { name: "Python", confirmed: true },
      { name: "Pandas", confirmed: false },
      { name: "NumPy", confirmed: false },
      { name: "Matplotlib", confirmed: false },
    ],
  },
  {
    id: "frontend",
    title: "Frontend development",
    source: "Brief; MYX AI repository; frontend collection",
    items: [
      { name: "HTML", confirmed: true },
      { name: "CSS", confirmed: true },
      { name: "JavaScript", confirmed: true },
      { name: "TypeScript", confirmed: true },
      { name: "React", confirmed: true },
      { name: "Vite", confirmed: true },
    ],
  },
  {
    id: "backend",
    title: "Servers & tooling",
    source: "MYX AI repository",
    items: [
      { name: "Node.js", confirmed: true },
      { name: "Express", confirmed: true },
      { name: "Git & GitHub", confirmed: true },
    ],
  },
  {
    id: "seo",
    title: "Search engine optimisation",
    source: "Brief (SEO Intern at Perception)",
    items: [{ name: "SEO", confirmed: true }],
  },
];
