# 7591yj.github.io

Personal portfolio and blog — built with [Astro](https://astro.build), styled
with [Tailwind CSS](https://tailwindcss.com), and enhanced with
[React](https://react.dev) for interactive components.

Live at **[7591yj.com](https://www.7591yj.com/)**

## Tech Stack

| Layer         | Technology                                                                                                                             |
| :------------ | :------------------------------------------------------------------------------------------------------------------------------------- |
| Framework     | [Astro](https://astro.build) 5 with [View Transitions](https://docs.astro.build/en/guides/view-transitions/)                          |
| Styling       | [Tailwind CSS](https://tailwindcss.com) 4 + custom design tokens                                                                      |
| Interactivity | [React](https://react.dev) 19, [Framer Motion](https://motion.dev), [Swiper](https://swiperjs.com)                                   |
| Content       | [MDX](https://mdxjs.com) with remark-gfm, rehype-slug, rehype-autolink-headings                                                       |
| Icons         | [astro-icon](https://github.com/natemoo-re/astro-icon) with [Carbon](https://carbondesignsystem.com/elements/icons/library/) icon set |
| Animations    | [Lottie](https://airbnb.io/lottie/) via lottie-react                                                                                  |
| Package mgr   | [Bun](https://bun.sh) via [Nix](https://nixos.org/)                                                                                   |

## Project Structure

```text
src/
├── components/
│   ├── carousel/          # Swiper-based hero carousel
│   ├── content/           # MDX content components (Accordion, ImageGrid, etc.)
│   ├── graph/             # Force-simulation project graph
│   ├── motion/            # Framer Motion wrappers (FadeInSection, StaggerGrid)
│   ├── Header.astro       # Sticky nav with hamburger menu
│   ├── Footer.astro
│   ├── ThemeToggle.astro  # Light / dark mode
│   └── ...
├── icons/                 # Custom SVG icons
├── layouts/
│   ├── Layout.astro       # Base layout with theme management
│   ├── DetailLayout.astro # Two-column layout with sidebar TOC
│   ├── BlogDetail.astro   # Blog post layout
│   └── ProjectDetail.astro
├── pages/
│   ├── index.astro        # Home
│   ├── projects.astro     # Interactive project explorer
│   ├── blog.astro         # Blog listing
│   ├── about.astro
│   ├── projects/*.mdx     # Individual project write-ups
│   ├── blog/*.mdx         # Blog posts
│   ├── 404.astro
│   └── 500.astro
├── scripts/               # Client-side scripts
│   ├── theme.ts           # Theme persistence (localStorage + system pref)
│   ├── header-scroll.ts   # Header transparency on scroll
│   ├── scramble-text.ts   # Text scramble animation
│   └── scroll-animate.ts  # Scroll-triggered entrance animations
├── styles/
│   ├── global.css         # Tailwind imports & global resets
│   ├── tokens.css         # Design tokens (colors, spacing, timing)
│   ├── animations.css     # Keyframes & transition classes
│   ├── grid.css           # Grid layout utilities
│   ├── prose.css          # Typography for long-form content
│   └── shared.css         # Shared patterns (LED indicators, ticker strips, dot grids)
├── consts.ts              # Site-wide constants (name, socials, etc.)
└── types.ts               # Shared TypeScript interfaces
```

## Getting Started

> `flake.nix` is provided for Nix. Use `nix develop` to enter the development
> shell.

### Prerequisites

- [Bun](https://bun.sh) (or Node.js 22+)

### Commands

| Command           | Action                                     |
| :---------------- | :----------------------------------------- |
| `bun install`     | Install dependencies                       |
| `bun run dev`     | Start local dev server at `localhost:4321`  |
| `bun run build`   | Build production site to `./dist/`         |
| `bun run preview` | Preview production build locally           |

## Fonts

This project uses [PlemolJP](https://github.com/yuru7/PlemolJP) as the primary
typeface, self-hosted in `public/fonts/`. PlemolJP is licensed under the **SIL
Open Font License, Version 1.1** — see
[`public/fonts/LICENSE_PlemolJP`](public/fonts/LICENSE_PlemolJP) for the full
license text.

[Shippori Mincho](https://fonts.google.com/specimen/Shippori+Mincho) is loaded
via Astro's experimental Google Fonts integration.

## License

Site content and code are personal work. Third-party dependencies are subject to
their own licenses. Font licensing is documented above.

Free image hosting by: [imgCDN.dev](https://imgcdn.dev/)
