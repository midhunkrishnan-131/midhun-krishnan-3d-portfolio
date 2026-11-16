export type ProjectStatus =
  "completed" | "prototype" | "planned" | "in-progress";

export interface ProjectImage {
  /** Path under /public. Placeholder until real screenshots are supplied. */
  src: string;
  alt: string;
}

export interface Project {
  slug: string;
  title: string;
  tagline: string;
  summary: string;
  objectives: string[];
  /** Architecture as it can be verified today (code or Midhun's own description). */
  architecture: string[];
  challenges: string[];
  /** Technologies confirmed by Midhun or by the source code. */
  technologies: string[];
  /** Technologies mentioned but not yet confirmed; never shown as confirmed. */
  technologiesToConfirm: string[];
  status: ProjectStatus;
  statusNote: string;
  featured: boolean;
  image: ProjectImage;
  /** Only verified public URLs; null otherwise. */
  githubUrl: string | null;
  demoUrl: string | null;
  /** Open questions that must be answered before the copy is final. */
  needsVerification: string[];
}
