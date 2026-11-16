# src/lib/seo

Metadata builders (`metadata.ts`), JSON-LD graph builders (`jsonld.ts`) and the Open Graph / icon renderer (`og.tsx`).
No page components. `fonts/` holds WOFF copies of the public Instrument Serif files, because `next/og` accepts WOFF and TTF but not WOFF2.

Project pages call `buildProjectMetadata` / `buildProjectsIndexMetadata` and `buildProjectGraph` / `buildProjectsIndexGraph`.
