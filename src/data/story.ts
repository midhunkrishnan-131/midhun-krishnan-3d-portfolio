import type { Chapter } from "@/types/content";

/**
 * Homepage story copy. Facts come only from Midhun's brief, project descriptions
 * and his CV (17 Nov 2026). Every `placeholder: true` entry is neutral stand-in text
 * still waiting for his own words.
 */
export const chapters = {
  about: {
    id: "about",
    kicker: "Before technology",
    lead: {
      text: "I did not begin as a computer science student or an experienced software developer. Technology was a field I decided to enter and understand.",
    },
    body: [
      {
        text: "I'm Midhun Krishnan — a BCA Computer Science student in Thiruvananthapuram, with IT and technical support experience and practical project work in Python, REST APIs and Generative AI applications.",
      },
      {
        text: "I've built an AI-assisted code diagnosis platform, a command-line LLM client and a reusable API client, and I also work across frontend development and independent software projects alongside my studies.",
      },
      {
        text: "I'm training as a Generative AI Developer at BlackBox Learning and I work as an SEO Intern at Perception.",
      },
      {
        text: "I speak Malayalam (native), Tamil (fluent) and English (conversational).",
      },
    ],
    facts: [
      {
        label: "Studying",
        value:
          "BCA Computer Science — Yenepoya (Deemed to be University), expected 2028",
      },
      {
        label: "Experience",
        value:
          "IT / Technical Support — ICICI Prudential Life Insurance (10 Nov 2024 – 10 Nov 2026)",
      },
      {
        label: "Training",
        value: "Generative AI Developer — BlackBox Learning",
      },
      { label: "Interning", value: "SEO Intern — Perception" },
      { label: "Based in", value: "Thiruvananthapuram, Kerala, India" },
    ],
  },
  beginning: {
    id: "beginning",
    kicker: "The decision",
    lead: {
      text: "I decided to enter technology and start learning from the first line of code.",
    },
    body: [
      {
        text: "That decision is the beginning of this story. The first programme I was proud of still sits on the page beside these words: a short Python introduction, written, then typed, then run.",
      },
    ],
  },
  struggle: {
    id: "struggle",
    kicker: "The struggle",
    lead: {
      text: "Becoming a developer required persistence and practice.",
    },
    body: [
      {
        text: "I learned Python from the beginning. I worked through programming logic, debugged errors, learned how APIs work, and started to understand databases and backend development.",
      },
      {
        text: "I built projects, and I faced coding challenges that did not untangle on the first try. This chapter is that work — fragments, mistakes, and the line that finally holds.",
      },
    ],
  },
  "icici-prudential": {
    id: "icici-prudential",
    kicker: "Experience",
    lead: {
      text: "From 10 November 2024 to 10 November 2026 I worked in IT / Technical Support at ICICI Prudential Life Insurance in Thiruvananthapuram.",
    },
    body: [
      {
        text: "I provided day-to-day technical support and troubleshot computer-system and user-reported issues.",
      },
      {
        text: "I assisted with user account administration, access permissions, system checks and server/system administration activities.",
      },
      {
        text: "I used remote-support tools including TeamViewer, AnyDesk and Remote Desktop (RDP) to assist with troubleshooting.",
      },
      {
        text: "I also scanned and digitised documents and supported organised electronic record management.",
      },
    ],
    facts: [
      { label: "Role", value: "IT / Technical Support" },
      { label: "Organisation", value: "ICICI Prudential Life Insurance" },
      { label: "Location", value: "Thiruvananthapuram" },
      { label: "Dates", value: "10 November 2024 – 10 November 2026" },
    ],
  },
  "blackbox-learning": {
    id: "blackbox-learning",
    kicker: "Training",
    lead: {
      text: "At BlackBox Learning I'm training as a Generative AI Developer.",
    },
    body: [
      {
        text: "That direction runs through my own work: MYX AI uses the Gemini API, CodeDoctor AI uses the Groq API with a Gemini fallback, and DevAssist is a command-line LLM client.",
      },
      {
        text: "The programme covers Python, generative AI, AI application development, retrieval-augmented generation, FastAPI, backend systems, APIs, and practical project work. Those are the tools I am still learning to use with care.",
      },
    ],
    facts: [
      { label: "Role", value: "Generative AI Developer (training)" },
      { label: "Focus", value: "Python, Gen AI, RAG, FastAPI, APIs" },
    ],
  },
  bca: {
    id: "bca",
    kicker: "Foundations",
    lead: {
      text: "I'm studying for a Bachelor of Computer Applications in Computer Science at Yenepoya (Deemed to be University).",
    },
    body: [
      {
        text: "It's an online programme, with expected graduation in 2028.",
      },
      {
        text: "The degree is a formal path through computer science, taken alongside the work I am already doing with Python and generative AI.",
      },
    ],
    facts: [
      { label: "Degree", value: "BCA Computer Science (in progress)" },
      {
        label: "University",
        value: "Yenepoya (Deemed to be University), online programme",
      },
      { label: "Expected graduation", value: "2028" },
    ],
  },
  perception: {
    id: "perception",
    kicker: "Internship",
    lead: { text: "At Perception I work as an SEO Intern." },
    body: [
      {
        text: "It's also why this site treats search as part of the engineering: every chapter lives in real, semantic HTML, so the story stays readable to people and crawlers even without 3D.",
      },
    ],
    facts: [{ label: "Role", value: "SEO Intern" }],
  },
  myx: {
    id: "myx",
    kicker: "Flagship project",
    lead: {
      text: "An autonomous cyber defense and threat intelligence platform for Windows, still being built in public.",
    },
    body: [
      {
        text: "MYX AI is the project I am developing most carefully. What follows is only what the repository already contains, labelled honestly as implemented, in development, or planned.",
      },
    ],
  },
  future: {
    id: "future",
    kicker: "The future",
    lead: { text: "The story is not finished. I'm still building." },
    body: [
      {
        text: "I want to build useful software using artificial intelligence, programming and cybersecurity — work that is careful, and that lasts.",
      },
      {
        text: "I'm seeking Python Developer or Generative AI internship opportunities, and I will keep writing this story as the work continues.",
      },
    ],
  },
} satisfies Record<string, Chapter>;
