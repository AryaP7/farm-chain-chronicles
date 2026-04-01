# Farm Chain Chronicles

Single-page marketing site for **FarmChain**: a Solana devnet–oriented story of food provenance, supply-chain journey, and farmer funding. Built with React, Vite, Tailwind CSS, GSAP (ScrollTrigger), Framer Motion, and the Solana wallet adapter.

## Prerequisites

- **Node.js** 18.x or 20.x (LTS recommended)
- **npm** 9+ (ships with Node)

Python is **not** required for the frontend. See `requirements.txt` for notes.

## Install

```bash
npm install
```

## Scripts

| Command        | Description                          |
|----------------|--------------------------------------|
| `npm run dev`  | Start Vite dev server (hot reload)   |
| `npm run build`| Production build to `dist/`          |
| `npm run preview` | Serve `dist/` locally              |
| `npm run lint` | Run ESLint                           |
| `npm run test` | Run Vitest once                      |
| `npm run test:watch` | Vitest watch mode            |

## Stack

- **Vite 5** + **React 18** + **TypeScript**
- **Tailwind CSS** + **shadcn/ui** (Radix primitives)
- **GSAP** + **ScrollTrigger** — hero map pan, scroll progress, section parallax, staggered reveals (`src/lib/landingAnimations.ts`)
- **Framer Motion** — component-level motion where used
- **@solana/wallet-adapter-react** — Phantom and modal connect flow
- **@solana/web3.js** (transitive) — devnet slot display in landing animations

## Project layout

- `src/pages/` — route pages (e.g. `Index.tsx`)
- `src/components/` — UI sections (`HeroSection`, `JourneySection`, `HeroMapSvg`, etc.)
- `src/lib/` — GSAP init, Solana helpers
- `src/assets/` — images and inline SVG sources (e.g. `hero-map.svg`)
- `index.html` — root shell for Vite

## Solana

The UI targets **Solana Devnet** for demos (slot polling, mock TX strings in animations). Use a devnet-funded wallet when testing transactions from the CTA flow.

## License

Private project (`"private": true` in `package.json`). Adjust as needed.
