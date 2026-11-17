/**
 * Honest MYX AI capability labels, taken from a fresh clone of
 * https://github.com/midhunkrishnan-131/myx-ai-windows at commit 5a4f159
 * (November 2026). Nothing here is a live detection statistic.
 */
export type CapabilityStatus = "implemented" | "in-development" | "planned";

export interface MyxCapability {
  name: string;
  status: CapabilityStatus;
  note: string;
}

export const myxTitle =
  "Autonomous Cyber Defense & Threat Intelligence Platform for Windows";

export const myxRepo = "https://github.com/midhunkrishnan-131/myx-ai-windows";

export const myxCapabilities: readonly MyxCapability[] = [
  {
    name: "Hybrid RAG (BM25, embeddings, RRF)",
    status: "implemented",
    note: "Present in the repository, with tests. A live run needs the backend runtime and an API key.",
  },
  {
    name: "FastAPI backend",
    status: "implemented",
    note: "Implemented in the repository.",
  },
  {
    name: "Windows agent",
    status: "implemented",
    note: "Implemented in the repository.",
  },
  {
    name: "SQLite session store",
    status: "implemented",
    note: "Present as a backend session option.",
  },
  {
    name: "PDF reporting (ReportLab)",
    status: "implemented",
    note: "Implemented in the latest repository work.",
  },
  {
    name: "Gemini explanations",
    status: "in-development",
    note: "Implemented in code; a live run requires an API key.",
  },
  {
    name: "Groq (multi-provider LLM)",
    status: "in-development",
    note: "Present in the server and backend configuration; a live run requires an API key.",
  },
  {
    name: "VirusTotal, Safe Browsing and URLhaus",
    status: "in-development",
    note: "Integration surfaces exist in the repository and require an external API key.",
  },
  {
    name: "PostgreSQL with pgvector",
    status: "planned",
    note: "Scaffolded in the repository; a live runtime is still required.",
  },
];

export const myxArchitecture: readonly { layer: string; detail: string }[] = [
  {
    layer: "Windows agent",
    detail: "Local collection and defensive tooling on the machine.",
  },
  {
    layer: "FastAPI backend",
    detail: "Analysis, session storage and reporting services.",
  },
  {
    layer: "Retrieval and models",
    detail: "Hybrid RAG, with Gemini or Groq when a key is present.",
  },
  {
    layer: "Threat intel connectors",
    detail: "External services such as VirusTotal, when configured.",
  },
];

export const myxStack: readonly string[] = [
  "Python",
  "FastAPI",
  "Windows agent",
  "SQLite",
  "Gemini",
  "Groq",
  "React",
  "TypeScript",
];

export const statusLabel: Record<CapabilityStatus, string> = {
  implemented: "Implemented",
  "in-development": "In development",
  planned: "Planned",
};
