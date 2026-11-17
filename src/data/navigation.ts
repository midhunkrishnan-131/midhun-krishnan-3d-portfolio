import type { NavLink, SectionNavItem } from "@/types/navigation";

/** The twelve homepage chapters, in page order. Single source for nav, footer and section ids. */
export const sections = [
  {
    id: "hero",
    number: "01",
    label: "Prologue",
    title: "A Story Still Being Written",
  },
  { id: "about", number: "02", label: "About me", title: "About me" },
  {
    id: "beginning",
    number: "03",
    label: "The beginning",
    title: "The beginning",
  },
  {
    id: "struggle",
    number: "04",
    label: "The struggle",
    title: "The struggle",
  },
  {
    id: "icici-prudential",
    number: "05",
    label: "ICICI Prudential",
    title: "IT support at ICICI Prudential",
  },
  {
    id: "blackbox-learning",
    number: "06",
    label: "BlackBox Learning",
    title: "BlackBox Learning",
  },
  {
    id: "bca",
    number: "07",
    label: "BCA Computer Science",
    title: "BCA Computer Science",
  },
  {
    id: "perception",
    number: "08",
    label: "SEO at Perception",
    title: "SEO internship at Perception",
  },
  {
    id: "projects",
    number: "09",
    label: "Project universe",
    title: "Interactive project universe",
  },
  { id: "skills", number: "10", label: "Skills", title: "Skills" },
  {
    id: "future",
    number: "11",
    label: "Future vision",
    title: "Future vision",
  },
  { id: "contact", number: "12", label: "Contact", title: "Contact" },
] as const satisfies readonly SectionNavItem[];

export const sectionHref = (id: SectionNavItem["id"]): string => `/#${id}`;

/**
 * Header quick links. "Projects" points at the project universe section until the
 * /projects index ships in Phase 7.
 */
export const primaryLinks: readonly NavLink[] = [
  { href: sectionHref("projects"), label: "Projects" },
  { href: sectionHref("contact"), label: "Contact" },
];

export const getSection = (id: SectionNavItem["id"]): SectionNavItem => {
  const found = sections.find((s) => s.id === id);
  if (!found) throw new Error(`Unknown section id: ${id}`);
  return found;
};
