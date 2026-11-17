export type SectionId =
  | "hero"
  | "about"
  | "beginning"
  | "struggle"
  | "icici-prudential"
  | "blackbox-learning"
  | "bca"
  | "perception"
  | "myx"
  | "projects"
  | "skills"
  | "future"
  | "contact";

export interface SectionNavItem {
  id: SectionId;
  /** Two-digit chapter number shown in the UI, e.g. "01". */
  number: string;
  /** Short label for menus. */
  label: string;
  /** Full section heading. */
  title: string;
}

export interface NavLink {
  href: string;
  label: string;
}
