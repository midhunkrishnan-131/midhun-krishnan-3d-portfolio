import type {
  BreadcrumbList,
  CollectionPage,
  CreativeWork,
  Graph,
  ItemPage,
  Person,
  ProfilePage,
  SoftwareSourceCode,
  WebSite,
} from "schema-dts";
import { projects } from "@/data/projects";
import { site } from "@/data/site";
import type { Project } from "@/types/project";
import { SITE_URL } from "@/lib/env";
import {
  DEFAULT_TITLE,
  PERSON_ID,
  PROFILE_PAGE_ID,
  WEBSITE_ID,
  breadcrumbId,
  canonicalUrl,
  homeDescription,
  indexPageDescription,
  personDescription,
  projectPath,
  projectUrl,
  projectWorkId,
  projectsIndexDescription,
} from "@/lib/seo/constants";

const personRef = { "@id": PERSON_ID } as const;
const websiteRef = { "@id": WEBSITE_ID } as const;

function personAddress() {
  const [locality, region, country] = site.location
    .split(",")
    .map((part) => part.trim());
  return {
    "@type": "PostalAddress" as const,
    addressLocality: locality,
    addressRegion: region,
    addressCountry: country === "India" ? "IN" : country,
  };
}

function personSameAs(): string[] {
  return [site.contact.github, site.contact.linkedin];
}

export function buildPerson(): Person {
  return {
    "@type": "Person",
    "@id": PERSON_ID,
    name: site.name,
    url: SITE_URL,
    description: personDescription,
    jobTitle: [...site.roles],
    email: site.contact.email,
    telephone: site.contact.phone,
    address: personAddress(),
    sameAs: personSameAs(),
    mainEntityOfPage: { "@id": PROFILE_PAGE_ID },
  };
}

export function buildWebsite(): WebSite {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: site.name,
    alternateName: site.title,
    url: SITE_URL,
    description: homeDescription,
    inLanguage: "en",
    author: personRef,
    publisher: personRef,
  };
}

export function buildProfilePage(): ProfilePage {
  return {
    "@type": "ProfilePage",
    "@id": PROFILE_PAGE_ID,
    url: SITE_URL,
    name: DEFAULT_TITLE,
    description: homeDescription,
    inLanguage: "en",
    isPartOf: websiteRef,
    mainEntity: personRef,
    about: personRef,
  };
}

function buildBreadcrumb(
  crumbs: readonly { name: string; path: string }[],
): BreadcrumbList {
  const current = crumbs[crumbs.length - 1];
  return {
    "@type": "BreadcrumbList",
    "@id": breadcrumbId(current?.path ?? "/"),
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: canonicalUrl(crumb.path),
    })),
  };
}

/**
 * SoftwareSourceCode for every project (a CreativeWork subtype).
 * `codeRepository` is set only when `githubUrl` is a real URL.
 * Keywords are confirmed technologies only — never `technologiesToConfirm`.
 */
export function buildProjectWork(
  project: Project,
): SoftwareSourceCode | CreativeWork {
  const url = projectUrl(project.slug);
  const shared = {
    "@id": projectWorkId(project.slug),
    name: project.title,
    description: project.summary,
    url,
    author: personRef,
    creator: personRef,
    isPartOf: websiteRef,
    ...(project.technologies.length > 0
      ? { keywords: [...project.technologies] }
      : {}),
  };

  if (project.githubUrl) {
    const source: SoftwareSourceCode = {
      "@type": "SoftwareSourceCode",
      ...shared,
      codeRepository: project.githubUrl,
    };
    return source;
  }

  const work: CreativeWork = {
    "@type": "CreativeWork",
    ...shared,
  };
  return work;
}

function buildProjectPage(project: Project): ItemPage {
  const path = projectPath(project.slug);
  const url = canonicalUrl(path);
  return {
    "@type": "ItemPage",
    "@id": `${url}#page`,
    url,
    name: `${project.title} — ${site.name}`,
    description: project.summary,
    inLanguage: "en",
    isPartOf: websiteRef,
    author: personRef,
    about: { "@id": projectWorkId(project.slug) },
    mainEntity: { "@id": projectWorkId(project.slug) },
    breadcrumb: { "@id": breadcrumbId(path) },
  };
}

/** Profile document: Person, the ProfilePage that describes them, and the WebSite. */
export function buildHomeGraph(): Graph {
  return {
    "@context": "https://schema.org",
    "@graph": [buildPerson(), buildProfilePage(), buildWebsite()],
  };
}

/** Projects index: collection page, breadcrumb, and one linked work per project. */
export function buildProjectsIndexGraph(): Graph {
  const path = "/projects";
  const url = canonicalUrl(path);
  const collection: CollectionPage = {
    "@type": "CollectionPage",
    "@id": `${url}#page`,
    url,
    name: `Projects — ${site.name}`,
    description: projectsIndexDescription(),
    inLanguage: "en",
    isPartOf: websiteRef,
    author: personRef,
    breadcrumb: { "@id": breadcrumbId(path) },
    mainEntity: {
      "@type": "ItemList",
      "@id": `${url}#list`,
      numberOfItems: projects.length,
      itemListElement: projects.map((project, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: project.title,
        url: projectUrl(project.slug),
        item: { "@id": projectWorkId(project.slug) },
      })),
    },
  };

  return {
    "@context": "https://schema.org",
    "@graph": [
      buildPerson(),
      buildWebsite(),
      collection,
      buildBreadcrumb([
        { name: "Home", path: "/" },
        { name: "Projects", path },
      ]),
      ...projects.map((project) => buildProjectWork(project)),
    ],
  };
}

/** Complete archive index: collection page with breadcrumb linking all chapters and sections. */
export function buildIndexPageGraph(): Graph {
  const path = "/index";
  const url = canonicalUrl(path);
  const collection: CollectionPage = {
    "@type": "CollectionPage",
    "@id": `${url}#page`,
    url,
    name: `Index — ${site.name}`,
    description: indexPageDescription(),
    inLanguage: "en",
    isPartOf: websiteRef,
    author: personRef,
    breadcrumb: { "@id": breadcrumbId(path) },
  };

  return {
    "@context": "https://schema.org",
    "@graph": [
      buildPerson(),
      buildWebsite(),
      collection,
      buildBreadcrumb([
        { name: "Home", path: "/" },
        { name: "Index", path },
      ]),
    ],
  };
}

/** One project: breadcrumb, the page, and its SoftwareSourceCode or CreativeWork. */
export function buildProjectGraph(project: Project): Graph {
  const path = projectPath(project.slug);
  return {
    "@context": "https://schema.org",
    "@graph": [
      buildPerson(),
      buildWebsite(),
      buildProjectPage(project),
      buildProjectWork(project),
      buildBreadcrumb([
        { name: "Home", path: "/" },
        { name: "Projects", path: "/projects" },
        { name: project.title, path },
      ]),
    ],
  };
}
