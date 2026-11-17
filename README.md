# Midhun Krishnan — A Story Still Being Written

Immersive long-scrolling 3D portfolio for Midhun Krishnan. The homepage is a
sequence of individual 3D chapters rather than one continuous camera journey.
Project details live at `/projects` and `/projects/[slug]`.

This repository is the source of truth for the site. Facts about Midhun,
projects and skills are edited in `src/data/`. Do not invent professional
achievements, certifications, clients, statistics, search rankings, traffic or
unverified technologies when updating copy.

Some story chapters still contain placeholder text, marked with
`placeholder: true` in `src/data/story.ts`. A few projects still need verified
GitHub or demo links. Those gaps are intentional.

## Stack (pinned versions)

- next 16.4.6 (App Router), react / react-dom 19.3.1, typescript 5.9.3
- tailwindcss 4.3.5 + @tailwindcss/turbopack 4.3.5
- three 0.187.0, @react-three/fiber 9.8.2, @react-three/drei 10.7.9
- @react-three/postprocessing 3.2.2, postprocessing 6.39.6
- gsap 3.15.1, @gsap/react 2.1.2, lenis 1.3.27, motion 14.14.0
- zustand 5.1.0, clsx 2.1.1, tailwind-merge 3.7.0, schema-dts 2.1.0
- Dev: eslint 9.39.5, eslint-config-next 16.4.6, prettier 3.10.1,
  prettier-plugin-tailwindcss 0.8.1, @types/node 22.20.5,
  @types/react 19.3.0, @types/react-dom 19.3.0, @types/three 0.187.0

These pins are intentional. TypeScript stays below 6.1, ESLint on 9, Three.js
below 0.188 and React below 19.4 because of current plugin and R3F support.

## Requirements

Node.js 20.19 or newer (see `engines` in `package.json`). `.nvmrc` is set to 26
to match the machine this project is developed on. Node 22 LTS also works.

Git is required to clone the repository.

## Setup

```bash
git clone https://github.com/midhunkrishnan-131/midhun-krishnan-3d-portfolio.git
cd midhun-krishnan-3d-portfolio
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The project catalogue is
at [http://localhost:3000/projects](http://localhost:3000/projects).

`NEXT_PUBLIC_SITE_URL` in `.env.local` is used for `metadataBase`, canonical
URLs, the sitemap and JSON-LD. Leave it as `http://localhost:3000` for local
work. Set the real public origin in the host's environment before a production
deploy.

Query flags: `?gl=force` keeps the WebGL canvas on; `?gl=off` shows the static
fallbacks. Reduced-motion preferences disable Lenis, typography motion, the
custom cursor and the card-arranging animation.

## Scripts

- `npm run dev` — start the development server
- `npm run build` — production build
- `npm run start` — serve the production build
- `npm run lint` / `npm run lint:fix` — ESLint
- `npm run typecheck` — `next typegen` and `tsc --noEmit`
- `npm run format` / `npm run format:check` — Prettier
- `npm run check` — lint, typecheck and build
- `npm run seo:check` — start the production build and assert titles, canonicals,
  Open Graph tags, robots, sitemap and JSON-LD (run `npm run build` first)

## Editing content

All project copy is edited in **`src/data/projects.ts`**. Each entry needs a
unique `slug` (this becomes `/projects/[slug]`), a status
(`completed`, `in-progress`, `prototype` or `planned`), and honest fields for
summary, objectives, architecture, challenges and technologies. Leave arrays
empty when the fact is not known — the site hides empty sections. Set
`githubUrl` and `demoUrl` only after the URL has been checked and opens. List
unconfirmed technologies in `technologiesToConfirm`, and open questions in
`needsVerification`. MYX AI must remain the flagship (`featured: true`).

Story chapters live in **`src/data/story.ts`**. Keep `placeholder: true` on any
chapter whose copy is still temporary. Site identity (name, roles, email,
phone, GitHub, LinkedIn, location) is in **`src/data/site.ts`**. Skills are in
**`src/data/skills.ts`**. Chapter order and header links are in
**`src/data/navigation.ts`**. After adding a project, also add a glyph in the
projects scene or rely on the default glyph fallback.

## Structure

- `src/app` — App Router routes, metadata, icons, sitemap and robots
- `src/app/projects` — project catalogue and `[slug]` detail pages
- `src/components/sections` — homepage chapters
- `src/components/three` — shared canvas, views and per-section scenes
- `src/components/animations` — Lenis, GSAP ScrollTrigger, typography motion
- `src/components/interaction` — custom cursor and scroll-driven card arranger
- `src/components/seo` — JSON-LD helper
- `src/data` — editable site, story, project and skill data
- `src/lib/seo` — titles, canonical URLs, Open Graph helpers and schema
- `scripts/seo-check.mjs` — technical SEO assertions against a production build

## Accessibility

The document uses semantic landmarks (`header`, `main`, `footer`, `nav`), a
skip link, visible focus styles and text alternatives on meaningful images.
Decorative 3D fallbacks are marked `aria-hidden`. Prefer reduced motion is
honoured as described above.

## Display mode

A **3D / Flat** control sits at the bottom-right of every page. Flat turns the WebGL canvas off and leaves the static artwork for each section (the same result as `?gl=off`). The choice is saved in `localStorage`. `?gl=force` and `?gl=off` still override it for a single visit.

The visual language uses an ink/paper palette (`#000000` / `#E9E7E2`), monospace labels, and the house ease `cubic-bezier(.77, 0, .18, 1)`.

## Deploy notes

The intended host is Vercel. Do not deploy until the site has been reviewed
locally.

1. Create a Vercel project from this GitHub repository (or `vercel` CLI).
2. Set `NEXT_PUBLIC_SITE_URL` to the public origin, with no trailing slash
   (for example `https://example.com`).
3. Use `npm run build` as the build command (the default for Next.js).
4. After the first production URL is live, run `npm run seo:check` against
   that origin if you want to re-assert metadata, then submit the sitemap
   (`/sitemap.xml`) in Google Search Console.

The production domain is not decided in this repository yet.
