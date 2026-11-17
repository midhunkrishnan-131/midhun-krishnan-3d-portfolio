import type { Chapter } from "@/types/content";

/**
 * Homepage story copy. Facts come only from Midhun's brief, project descriptions
 * and his CV (17 Nov 2026). Every `placeholder: true` entry is neutral stand-in text
 * still waiting for his own words.
 */
export const chapters = {
  about: {
    id: "about",
    kicker: "Who I am",
    lead: {
      text: "I'm Midhun Krishnan — a BCA Computer Science student in Thiruvananthapuram, with IT and technical support experience and practical project work in Python, REST APIs and Generative AI applications.",
    },
    body: [
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
    kicker: "Where it started",
    lead: {
      text: "Every story starts with a first line of code.",
      placeholder: true,
    },
    body: [
      {
        text: "How my journey into programming began will be told here, in my own words.",
        placeholder: true,
      },
    ],
  },
  struggle: {
    id: "struggle",
    kicker: "What was hard",
    lead: {
      text: "Learning to build software means meeting problems that don't untangle on the first try.",
      placeholder: true,
    },
    body: [
      {
        text: "The real coding struggles, the experiments that didn't work and what they taught me will be written here.",
        placeholder: true,
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
        text: "What the training covers and what I'm learning there will be added here.",
        placeholder: true,
      },
    ],
    facts: [{ label: "Role", value: "Generative AI Developer (training)" }],
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
        text: "The subjects that have shaped how I think about software will be added here.",
        placeholder: true,
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
      {
        text: "What I work on during the internship and what I'm learning will be added here.",
        placeholder: true,
      },
    ],
    facts: [{ label: "Role", value: "SEO Intern" }],
  },
  future: {
    id: "future",
    kicker: "What's next",
    lead: { text: "The story is still being written." },
    body: [
      {
        text: "I'm seeking Python Developer or Generative AI internship opportunities.",
      },
      {
        text: "Where I want to go next — the problems I want to work on and the developer I want to become — will be shared here in my own words.",
        placeholder: true,
      },
    ],
  },
} satisfies Record<string, Chapter>;
