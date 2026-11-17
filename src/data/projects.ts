import type { Project } from "@/types/project";

/**
 * Central, editable project content. Source: Midhun's own descriptions (16 Nov 2026)
 * and his CV (17 Nov 2026). MYX AI architecture, CodeDoctor AI, DevAssist, the API
 * Client, Weather CLI and Data Cleaning were also checked against their public
 * GitHub repositories. Rules: no invented features, metrics or results; URLs only
 * when verified; unconfirmed technologies live in technologiesToConfirm.
 * MYX AI remains the flagship project.
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
    slug: "codedoctor-ai",
    title: "CodeDoctor AI",
    tagline: "Intelligent code debugging and logic diagnosis.",
    summary:
      "An AI-assisted Python coding and debugging platform with complete-answer and Socratic logic-hint modes.",
    objectives: [
      "Complete-answer and Socratic logic-hint diagnosis modes.",
      "Isolated Python execution with timeouts, loop protection, memory limits and standard-input support.",
      "Code-health checks, anomaly detection, SQLite diagnosis history, session restore and Groq/Gemini fallback.",
    ],
    architecture: [
      "React and TypeScript frontend with the Monaco Editor.",
      "A FastAPI Python backend.",
      "Groq API integration, with a Gemini fallback.",
    ],
    challenges: [],
    technologies: [
      "React",
      "TypeScript",
      "Monaco Editor",
      "FastAPI",
      "Python",
      "Groq API",
    ],
    technologiesToConfirm: [],
    status: "in-progress",
    statusNote:
      "Public repository verified on 17 Nov 2026. No live demo URL has been verified, and the project is not marked as complete.",
    featured: false,
    image: {
      src: "/images/projects/codedoctor-ai.webp",
      alt: "CodeDoctor AI project preview",
    },
    githubUrl: "https://github.com/midhunkrishnan-131/CodeDoctor--AI",
    demoUrl: null,
    needsVerification: [
      "A real preview image or screenshot.",
      "A live demo URL, if one exists.",
    ],
  },
  {
    slug: "devassist",
    title: "DevAssist",
    tagline: "An engineering-focused command-line LLM client.",
    summary:
      "A CLI LLM client with multi-turn conversations, stateless request demonstrations and streamed responses.",
    objectives: [
      "Multi-turn conversations, stateless request demonstrations and streamed responses.",
      "Token-usage reporting, cost estimates, stop-reason handling, context trimming, 429/5xx retries, JSON-schema invoice extraction and validated calculator tool calling.",
    ],
    architecture: [
      "A Python command-line client using an LLM API, with validation via Pydantic.",
    ],
    challenges: [],
    technologies: ["Python", "LLM API", "Pydantic"],
    technologiesToConfirm: [],
    status: "prototype",
    statusNote:
      "Public repository verified on 17 Nov 2026. Treated as a prototype; no live demo is claimed.",
    featured: false,
    image: {
      src: "/images/projects/devassist.webp",
      alt: "DevAssist project preview",
    },
    githubUrl: "https://github.com/midhunkrishnan-131/LLM-cli-client",
    demoUrl: null,
    needsVerification: ["A real preview image or screenshot."],
  },
  {
    slug: "production-grade-api-client",
    title: "Production-Grade API Client",
    tagline: "A reusable REST client with retries and pagination.",
    summary:
      "A reusable REST client with session reuse, retries for 429/5xx, exponential backoff with jitter and Retry-After support.",
    objectives: [
      "Session reuse, retries for 429/5xx, exponential backoff with jitter and Retry-After support.",
      "Fail-fast handling for other 4xx responses, structured logging, environment validation and generator-based pagination.",
    ],
    architecture: [
      "A Python client built with Requests, with configuration loaded through python-dotenv.",
    ],
    challenges: [],
    technologies: ["Python", "Requests", "python-dotenv"],
    technologiesToConfirm: [],
    status: "prototype",
    statusNote:
      "Public repository verified on 17 Nov 2026. Treated as a prototype; no live demo is claimed.",
    featured: false,
    image: {
      src: "/images/projects/production-grade-api-client.webp",
      alt: "Production-Grade API Client project preview",
    },
    githubUrl: "https://github.com/midhunkrishnan-131/api-client-project",
    demoUrl: null,
    needsVerification: ["A real preview image or screenshot."],
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
      "A Python project focused on cleaning datasets, handling missing values, transforming data and preparing datasets for analysis.",
    objectives: [
      "Clean datasets",
      "Handle missing values",
      "Transform data",
      "Prepare datasets for analysis",
    ],
    architecture: [
      "A Python script that uses Pandas and NumPy, verified against the public repository on 17 Nov 2026.",
    ],
    challenges: [],
    technologies: ["Python", "Pandas", "NumPy"],
    technologiesToConfirm: [],
    status: "prototype",
    statusNote:
      "Public repository verified on 17 Nov 2026 as a Python data-cleaning project. Matplotlib is not present in that repository. No live demo is claimed.",
    featured: false,
    image: {
      src: "/images/projects/python-data-cleaning.webp",
      alt: "Python Data Cleaning project preview",
    },
    githubUrl: "https://github.com/midhunkrishnan-131/Data-cleaning-",
    demoUrl: null,
    needsVerification: ["A real preview image or screenshot."],
  },
  {
    slug: "weather-application",
    title: "Weather CLI",
    tagline: "Current weather from the command line.",
    summary:
      "A Python command-line tool that retrieves and displays current weather information from the OpenWeatherMap API.",
    objectives: [
      "Retrieve current weather information from an API and display it in the terminal.",
    ],
    architecture: [
      "A Python CLI using Requests and python-dotenv, calling the OpenWeatherMap current-weather endpoint. Verified against the public repository on 17 Nov 2026.",
    ],
    challenges: [],
    technologies: ["Python", "Requests", "python-dotenv", "OpenWeatherMap API"],
    technologiesToConfirm: [],
    status: "prototype",
    statusNote:
      "Confirmed as a Python CLI (not a web app) against the public repository on 17 Nov 2026. No live demo is claimed.",
    featured: false,
    image: {
      src: "/images/projects/weather-application.webp",
      alt: "Weather CLI project preview",
    },
    githubUrl: "https://github.com/midhunkrishnan-131/weather-cli",
    demoUrl: null,
    needsVerification: ["A real preview image or screenshot."],
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
