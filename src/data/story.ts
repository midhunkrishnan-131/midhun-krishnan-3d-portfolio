import type { Chapter } from "@/types/content";

/**
 * Homepage story copy. Facts come only from Midhun's brief and his project descriptions.
 * Every `placeholder: true` entry is neutral stand-in text.
 * TODO(midhun): replace each placeholder with your own words — beginning, struggles,
 * BlackBox Learning, BCA, Perception and future vision.
 */
export const chapters = {
  about: {
    id: "about",
    kicker: "Who I am",
    lead: {
      text: "I'm Midhun Krishnan — a BCA Computer Science student, a Generative AI Developer in training at BlackBox Learning and an SEO Intern at Perception.",
    },
    body: [
      {
        text: "I work across Python development, frontend development and AI application development, and I build independent software projects alongside my studies.",
      },
      {
        text: "A short personal introduction, in my own words, is on its way.",
        placeholder: true,
      },
    ],
    facts: [
      { label: "Studying", value: "BCA Computer Science" },
      {
        label: "Training",
        value: "Generative AI Developer — BlackBox Learning",
      },
      { label: "Interning", value: "SEO Intern — Perception" },
      { label: "Building", value: "Independent software projects" },
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
  "blackbox-learning": {
    id: "blackbox-learning",
    kicker: "Training",
    lead: {
      text: "At BlackBox Learning I'm training as a Generative AI Developer.",
    },
    body: [
      {
        text: "That direction runs through my own work: MYX AI uses the Gemini API, and my AI Assistant project is heading the same way.",
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
      text: "I'm studying for a Bachelor of Computer Applications in Computer Science.",
    },
    body: [
      {
        text: "My institution, year of study and the subjects that shaped how I think about software will be added here.",
        placeholder: true,
      },
    ],
    facts: [{ label: "Degree", value: "BCA Computer Science (in progress)" }],
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
        text: "Where I want to go next — the problems I want to work on and the developer I want to become — will be shared here in my own words.",
        placeholder: true,
      },
    ],
  },
} satisfies Record<string, Chapter>;
