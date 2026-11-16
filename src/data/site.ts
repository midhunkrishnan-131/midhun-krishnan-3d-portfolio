/** Site-wide identity. Only facts supplied by Midhun. */
export const site = {
  name: "Midhun Krishnan",
  title: "A Story Still Being Written",
  roles: [
    "BCA Computer Science student",
    "Generative AI Developer in training at BlackBox Learning",
    "SEO Intern at Perception",
  ],
  contact: {
    /** TODO(midhun): add a public email address. null = shown as "to be added", never linked. */
    email: null as string | null,
    /** Verified public profile. */
    github: "https://github.com/midhunkrishnan-131",
    /** TODO(midhun): add your LinkedIn profile URL. */
    linkedin: null as string | null,
  },
} as const;
