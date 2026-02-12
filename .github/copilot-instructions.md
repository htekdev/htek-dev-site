# htek.dev — Copilot Instructions

## Project Overview
Personal developer homepage for Hector Flores (htekdev), hosted at htek.dev via GitHub Pages.

## Tech Stack
- **Framework:** Astro 5 (static site generator)
- **Styling:** Tailwind CSS 4 (via @tailwindcss/vite plugin)
- **Animations:** GSAP + ScrollTrigger, CSS animations
- **3D:** Three.js + React Three Fiber (React islands)
- **Deployment:** GitHub Pages with GitHub Actions

## Brand System
- **Colors:** Dark-only theme. Primary bg: #0A0A0F. Accents: #00E5FF (cyan), #7C3AED (purple), #EC4899 (pink)
- **Fonts:** Space Grotesk (headings), Inter (body), JetBrains Mono (code)
- **Style:** Dark glassmorphism, cyan glow effects, gradient borders

## Architecture
- Astro components (`.astro`) for static sections
- React components (`.tsx`) for interactive islands (Three.js, dynamic features)
- Tailwind brand tokens defined in `src/styles/global.css` under `@theme`
- All sections are components imported into `src/pages/index.astro`

## Conventions
- Use Tailwind brand token classes (e.g., `bg-bg-primary`, `text-accent-cyan`)
- Keep JS minimal — prefer CSS animations over JS where possible
- Interactive React islands use `client:visible` directive for lazy loading
- All images go in `public/` directory
