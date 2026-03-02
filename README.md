# htek.dev — Personal Developer Site

Personal homepage and blog for **Hector Flores** ([@htekdev](https://github.com/htekdev)), built with Astro 5 and deployed to GitHub Pages at [htek.dev](https://htek.dev).

## ✨ Features

- **Blog / Articles** — Long-form technical writing on AI, developer tooling, and software architecture
- **Consulting** — Enterprise consulting page with a Calendly booking embed
- **3D Hero** — Interactive Three.js scene rendered as a React island
- **RSS Feed** — `/rss.xml` generated automatically from the articles collection
- **Article Sync** — Automated cross-posting to DEV.to, Hashnode, and Medium via GitHub Actions
- **SEO** — Structured JSON-LD, Open Graph, and sitemap out of the box
- **Dark-only theme** — Glassmorphism design with cyan / purple / pink accents

## 🛠️ Tech Stack

| Layer | Technology |
| :---- | :--------- |
| Framework | [Astro 5](https://astro.build) (static, `directory` output) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com) via `@tailwindcss/vite` |
| Animations | [GSAP](https://greensock.com/gsap/) + ScrollTrigger |
| 3D | [Three.js](https://threejs.org) + [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) |
| Deployment | GitHub Pages via GitHub Actions (`deploy.yml`) |
| Content | Astro MDX content collections |

## 🗂️ Project Structure

```text
/
├── public/               # Static assets (images, fonts, favicon)
├── scripts/              # Post-build helpers and article sync scripts
│   ├── post-build.mjs    # Generates /path.html copies for GitHub Pages
│   ├── sync-devto.mjs    # Cross-posts to DEV.to
│   ├── sync-hashnode.mjs # Cross-posts to Hashnode
│   └── sync-medium.mjs   # Cross-posts to Medium
├── src/
│   ├── components/       # Reusable Astro + React components
│   ├── content/
│   │   └── articles/     # MDX blog articles (content collection)
│   ├── layouts/          # Base page layout
│   ├── pages/            # Routes: index, /articles/*, /consulting, /rss.xml
│   └── styles/           # global.css — Tailwind @theme brand tokens
├── astro.config.mjs
└── package.json
```

## 🚀 Local Development

```sh
# Install dependencies
npm install

# Start the dev server at http://localhost:4321
npm run dev

# Production build (outputs to ./dist/)
npm run build

# Preview the production build locally
npm run preview
```

## ✍️ Writing an Article

1. Create a new `.mdx` file in `src/content/articles/`:

```sh
touch src/content/articles/my-new-article.mdx
```

2. Add the required frontmatter:

```yaml
---
title: "Article Title"
description: "A compelling 1-2 sentence description."
pubDate: YYYY-MM-DD
tags: ["Tag1", "Tag2"]
draft: false
---
```

3. Run `npm run build` to verify it compiles, then push — the deploy workflow publishes automatically.

## 🤖 Article Cross-Posting

Articles are synced to DEV.to, Hashnode, and Medium automatically when a push includes changes to `src/content/articles/`. The workflow (`.github/workflows/sync-articles.yml`) requires the following repository secrets:

| Secret | Platform |
| :----- | :------- |
| `DEVTO_API_KEY` | DEV.to |
| `HASHNODE_API_KEY` | Hashnode |
| `MEDIUM_TOKEN` | Medium |

You can also run the scripts locally for a dry run:

```sh
DEVTO_API_KEY=<key> node scripts/sync-devto.mjs --dry-run
```

## 🎨 Brand Tokens

Brand colors and fonts are defined as Tailwind CSS custom properties in `src/styles/global.css` under `@theme`:

| Token | Value | Use |
| :---- | :---- | :-- |
| `--color-accent-cyan` | `#00E5FF` | Primary accent, links |
| `--color-accent-purple` | `#7C3AED` | Secondary accent, gradients |
| `--color-accent-pink` | `#EC4899` | Tertiary accent |
| `--color-bg-primary` | `#0A0A0F` | Page background |

## 📡 Deployment

Every push to `main` triggers `.github/workflows/deploy.yml`, which builds the site and publishes it to the `gh-pages` branch. GitHub Pages serves from that branch at [htek.dev](https://htek.dev).

---

Built with ☕ and too many browser tabs by [@htekdev](https://github.com/htekdev).
