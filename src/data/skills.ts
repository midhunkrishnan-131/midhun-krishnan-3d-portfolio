import type { SkillGroup } from "@/types/content";

/**
 * Skill groups, limited to Midhun's brief, his CV (17 Nov 2026) and verified project data.
 * No proficiency levels or years — none were provided.
 */
export const skillGroups: SkillGroup[] = [
  {
    id: "ai",
    title: "AI application development",
    source: "CV; brief; MYX AI and CodeDoctor repositories",
    items: [
      { name: "LLM API integration", confirmed: true },
      { name: "Prompt engineering", confirmed: true },
      { name: "Conversation state", confirmed: true },
      { name: "Streaming", confirmed: true },
      { name: "Token usage", confirmed: true },
      { name: "Structured outputs", confirmed: true },
      { name: "Tool calling", confirmed: true },
      { name: "Gemini API", confirmed: true },
      { name: "Groq API", confirmed: true },
      { name: "OpenAI API", confirmed: true },
      { name: "Google Gen AI SDK", confirmed: true },
      { name: "Generative AI (in training)", confirmed: true },
    ],
  },
  {
    id: "python",
    title: "Python development",
    source: "CV; Data Cleaning, DevAssist and API Client repositories",
    items: [
      { name: "Python", confirmed: true },
      { name: "Pandas", confirmed: true },
      { name: "NumPy", confirmed: true },
      { name: "Pydantic", confirmed: true },
      { name: "Python-dotenv", confirmed: true },
      { name: "Matplotlib", confirmed: false },
    ],
  },
  {
    id: "frontend",
    title: "Frontend development",
    source: "CV; MYX AI and CodeDoctor repositories; frontend collection",
    items: [
      { name: "HTML5", confirmed: true },
      { name: "CSS3", confirmed: true },
      { name: "JavaScript", confirmed: true },
      { name: "TypeScript", confirmed: true },
      { name: "React", confirmed: true },
      { name: "Vite", confirmed: true },
      { name: "Monaco Editor", confirmed: true },
    ],
  },
  {
    id: "backend",
    title: "Servers & APIs",
    source: "CV; MYX AI, CodeDoctor and API Client repositories",
    items: [
      { name: "FastAPI", confirmed: true },
      { name: "REST APIs", confirmed: true },
      { name: "SQLite", confirmed: true },
      { name: "Node.js", confirmed: true },
      { name: "Express", confirmed: true },
      { name: "Exception handling", confirmed: true },
      { name: "Retry logic", confirmed: true },
      { name: "Pagination", confirmed: true },
    ],
  },
  {
    id: "tools",
    title: "Tools",
    source: "CV",
    items: [
      { name: "Git", confirmed: true },
      { name: "GitHub", confirmed: true },
      { name: "VS Code", confirmed: true },
      { name: "Jupyter Notebook", confirmed: true },
    ],
  },
  {
    id: "it-support",
    title: "IT support",
    source: "CV (ICICI Prudential Life Insurance)",
    items: [
      { name: "PowerShell", confirmed: true },
      { name: "TeamViewer", confirmed: true },
      { name: "AnyDesk", confirmed: true },
      { name: "Remote Desktop (RDP)", confirmed: true },
      { name: "PuTTY", confirmed: true },
      { name: "Wireshark", confirmed: true },
    ],
  },
  {
    id: "seo",
    title: "Search engine optimisation",
    source: "Brief (SEO Intern at Perception)",
    items: [{ name: "SEO", confirmed: true }],
  },
];
