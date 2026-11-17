import type { SkillGroup } from "@/types/content";

/**
 * Skill groups, taken from Midhun's t71u list (17 Nov 2026).
 * No proficiency levels or years — none were provided.
 */
export const skillGroups: SkillGroup[] = [
  {
    id: "programming",
    title: "Programming",
    source: "Brief (t71u); CV",
    items: [
      { name: "Python", confirmed: true },
      { name: "JavaScript", confirmed: true },
      { name: "HTML5", confirmed: true },
      { name: "CSS3", confirmed: true },
    ],
  },
  {
    id: "ai",
    title: "AI Application Development",
    source: "Brief (t71u); CV; MYX AI and CodeDoctor repositories",
    items: [
      { name: "LLM API Integration", confirmed: true },
      { name: "Prompt Engineering", confirmed: true },
      { name: "Conversation State", confirmed: true },
      { name: "Streaming", confirmed: true },
      { name: "Token Usage", confirmed: true },
      { name: "Structured Outputs", confirmed: true },
      { name: "Tool Calling", confirmed: true },
      { name: "Gemini API", confirmed: true },
      { name: "Groq API", confirmed: true },
      { name: "OpenAI API", confirmed: true },
      { name: "Google Gen AI SDK", confirmed: true },
      { name: "Generative AI", confirmed: true },
    ],
  },
  {
    id: "backend",
    title: "Backend and APIs",
    source: "Brief (t71u); CV; MYX AI, CodeDoctor and API Client repositories",
    items: [
      { name: "FastAPI", confirmed: true },
      { name: "REST APIs", confirmed: true },
      { name: "SQLite", confirmed: true },
      { name: "Node.js", confirmed: true },
      { name: "Express", confirmed: true },
      { name: "Exception Handling", confirmed: true },
      { name: "Retry Logic", confirmed: true },
      { name: "Pagination", confirmed: true },
    ],
  },
  {
    id: "tools",
    title: "Development Tools",
    source: "Brief (t71u); CV",
    items: [
      { name: "Git", confirmed: true },
      { name: "GitHub", confirmed: true },
      { name: "VS Code", confirmed: true },
      { name: "Jupyter Notebook", confirmed: true },
      { name: "Postman", confirmed: true },
      { name: "TeamViewer", confirmed: true },
      { name: "PuTTY", confirmed: true },
      { name: "Wireshark", confirmed: true },
      { name: "AnyDesk", confirmed: true },
      { name: "Remote Desktop", confirmed: true },
    ],
  },
  {
    id: "seo",
    title: "Search Engine Optimisation",
    source: "Brief (t71u); SEO Intern at Perception",
    items: [{ name: "SEO", confirmed: true }],
  },
];
