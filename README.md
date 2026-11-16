# midhun-krishnan-portfolio

**Midhun Krishnan — A Story Still Being Written**

Immersive 3D personal portfolio. Phase 1 of 10 — foundation only.

## Stack (exact pins)

- next 16.4.6 (App Router), react / react-dom 19.3.1, typescript 5.9.3
- tailwindcss 4.3.5 + @tailwindcss/turbopack 4.3.5
- three 0.187.0, @react-three/fiber 9.8.2, @react-three/drei 10.7.9
- @react-three/postprocessing 3.2.2, postprocessing 6.39.6
- gsap 3.15.1, @gsap/react 2.1.2, lenis 1.3.27, motion 14.14.0
- zustand 5.1.0, clsx 2.1.1, tailwind-merge 3.7.0
- Dev: eslint 9.39.5, eslint-config-next 16.4.6, prettier 3.10.1, prettier-plugin-tailwindcss 0.8.1, schema-dts 2.1.0, @types/node 22.20.5, @types/react 19.3.0, @types/react-dom 19.3.0, @types/three 0.187.0

## Requirements

Node.js 20.9.0 or newer (22 LTS recommended, see .nvmrc).

## Setup

Copy .env.example to .env.local and set NEXT_PUBLIC_SITE_URL.

## Scripts

- npm run dev — start the dev server
- npm run build — production build
- npm run start — serve the production build
- npm run lint / npm run lint:fix — ESLint
- npm run typecheck — next typegen + tsc --noEmit
- npm run format / npm run format:check — Prettier
- npm run check — lint, typecheck and build
