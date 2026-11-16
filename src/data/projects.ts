import type { Project } from "@/types/project";

/**
 * Central, editable project content. Source: Midhun's own descriptions (16 Nov 2026).
 * MYX AI architecture additionally checked against its public GitHub repository on 16 Nov 2026.
 * Rules: no invented features, metrics or results; URLs only when verified; unconfirmed
 * technologies live in technologiesToConfirm.
 */
export const projects: Project[] = [
  {
    slug: "myx-ai",
    title: "MYX AI",
    tagline: "An AI-powered Windows security platform.",
    summary:
      "An AI-powered Windows security platform that brings website scanning, LinkGuard, network auditing and endpoint posture assessment together in one place.",
    objectives: [
      "Website scanning",
      "LinkGuard link analysis",
      "Network auditing",
      "Endpoint posture assessment for Windows machines",
    ],
    architecture: [
      "React and TypeScript frontend built with Vite (from the repository's package.json).",
      "A Node.js Express server (server.ts) that serves the Vite app and uses the Google Gen AI SDK for Gemini.",
      "A Python Windows agent (windows_agent/) with collectors for system info, security posture, network diagnostics and Wi-Fi auditing.",
      "The repository also contains a FastAPI, SQLAlchemy and PostgreSQL (pgvector) backend in backend/, which its own status file lists as scaffolded and needing a live backend runtime.",
    ],
    challenges: [],
    technologies: [
      "React",
      "TypeScript",
      "Vite",
      "Express",
      "Python",
      "Gemini API",
    ],
    technologiesToConfirm: [],
    status: "in-progress",
    statusNote:
      "In active development. The repository's own status file marks parts as completed and others (database migrations, live scanners) as scaffolded.",
    featured: true,
    image: {
      src: "/images/projects/myx-ai.webp",
      alt: "MYX AI project preview",
    },
    githubUrl: "https://github.com/midhunkrishnan-131/myx-ai-windows",
    demoUrl: null,
    needsVerification: [
      "Confirm whether the FastAPI + PostgreSQL backend in backend/ is part of the current architecture or an earlier iteration.",
      "Engineering challenges to feature on the detail page.",
      "A real preview image or screenshot.",
    ],
  },
  {
    slug: "docuscan-ocr",
    title: "DocuScan OCR",
    tagline: "Document scanning and OCR for invoice data.",
    summary:
      "A document scanning and OCR application designed to extract invoice information from uploaded documents.",
    objectives: ["Extract invoice information from uploaded documents."],
    architecture: [],
    challenges: [
      "OCR accuracy",
      "Document processing",
      "Structured field extraction",
    ],
    technologies: [],
    technologiesToConfirm: ["Python", "PyTesseract", "FastAPI"],
    status: "planned",
    statusNote:
      "Technologies are listed as planned; implemented features have not been confirmed yet.",
    featured: false,
    image: {
      src: "/images/projects/docuscan-ocr.webp",
      alt: "DocuScan OCR project preview",
    },
    githubUrl: null,
    demoUrl: null,
    needsVerification: [
      "Which features are actually implemented.",
      "GitHub and demo links.",
      "A real preview image.",
    ],
  },
  {
    slug: "python-data-cleaning",
    title: "Python Data Cleaning",
    tagline: "Preparing messy datasets for analysis.",
    summary:
      "Python projects focused on cleaning datasets, handling missing values, transforming data and preparing datasets for analysis.",
    objectives: [
      "Clean datasets",
      "Handle missing values",
      "Transform data",
      "Prepare datasets for analysis",
    ],
    architecture: [],
    challenges: [],
    technologies: [],
    technologiesToConfirm: ["Python", "Pandas", "NumPy", "Matplotlib"],
    status: "in-progress",
    statusNote: "Status and technologies to be confirmed.",
    featured: false,
    image: {
      src: "/images/projects/python-data-cleaning.webp",
      alt: "Python Data Cleaning project preview",
    },
    githubUrl: null,
    demoUrl: null,
    needsVerification: [
      "Confirm technologies used.",
      "Confirm completion status.",
      "GitHub and demo links.",
    ],
  },
  {
    slug: "weather-application",
    title: "Weather Application",
    tagline: "Weather information through API integration.",
    summary:
      "A weather application using API integration to retrieve and display weather information.",
    objectives: ["Retrieve weather information from an API and display it."],
    architecture: [],
    challenges: [],
    technologies: ["Python", "Weather API integration"],
    technologiesToConfirm: [
      "Frontend technology",
      "Specific weather API provider",
    ],
    status: "prototype",
    statusNote:
      "Exact frontend and API technologies to be confirmed before publishing.",
    featured: false,
    image: {
      src: "/images/projects/weather-application.webp",
      alt: "Weather Application project preview",
    },
    githubUrl: null,
    demoUrl: null,
    needsVerification: [
      "Exact frontend technology.",
      "Which weather API is used.",
      "Completion status, GitHub and demo links.",
    ],
  },
  {
    slug: "ai-assistant",
    title: "AI Assistant",
    tagline: "A conversational assistant powered by an LLM API.",
    summary:
      "A conversational AI assistant designed to interact with users, understand questions and generate responses using an LLM API.",
    objectives: [
      "Interact with users conversationally",
      "Understand questions",
      "Generate responses using an LLM API",
    ],
    architecture: [],
    challenges: [],
    technologies: [],
    technologiesToConfirm: ["Gemini API"],
    status: "in-progress",
    statusNote:
      "Gemini API is the known integration direction. Final architecture and implemented functionality are still to be confirmed.",
    featured: false,
    image: {
      src: "/images/projects/ai-assistant.webp",
      alt: "AI Assistant project preview",
    },
    githubUrl: null,
    demoUrl: null,
    needsVerification: [
      "Final architecture.",
      "Implemented functionality.",
      "GitHub and demo links.",
    ],
  },
  {
    slug: "frontend-development-collection",
    title: "Frontend Development Collection",
    tagline: "Interface experiments in HTML, CSS and JavaScript.",
    summary:
      "Frontend development experiments including a Swiggy-inspired clone, a student dashboard, a Facebook-inspired interface and an event website.",
    objectives: [
      "Swiggy-inspired clone",
      "Student dashboard",
      "Facebook-inspired interface",
      "Event website",
    ],
    architecture: [],
    challenges: [],
    technologies: ["HTML", "CSS", "JavaScript"],
    technologiesToConfirm: [],
    status: "prototype",
    statusNote:
      "A collection of frontend experiments. The status of each experiment is still to be confirmed.",
    featured: false,
    image: {
      src: "/images/projects/frontend-development-collection.webp",
      alt: "Frontend Development Collection project preview",
    },
    githubUrl: null,
    demoUrl: null,
    needsVerification: [
      "Status of each experiment.",
      "GitHub and demo links for each experiment.",
    ],
  },
];

export const featuredProject = projects.find((p) => p.featured) ?? projects[0];

export const getProject = (slug: string): Project | undefined =>
  projects.find((p) => p.slug === slug);
