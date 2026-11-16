import type { SectionId } from "@/types/navigation";

/**
 * A piece of on-page copy. `placeholder: true` marks neutral stand-in text that Midhun must
 * replace with his own words before launch (search the codebase for "placeholder: true").
 */
export interface Copy {
  text: string;
  placeholder?: boolean;
}

export interface Fact {
  label: string;
  value: string;
}

export interface Chapter {
  id: SectionId;
  /** Short line above the heading, e.g. "Chapter". */
  kicker: string;
  lead: Copy;
  body: Copy[];
  facts?: Fact[];
}

export interface SkillItem {
  name: string;
  /** false = mentioned but not yet confirmed by Midhun; shown as "to confirm". */
  confirmed: boolean;
}

export interface SkillGroup {
  id: string;
  title: string;
  /** Where the evidence for this group comes from (brief, repo, project data). */
  source: string;
  items: SkillItem[];
}
