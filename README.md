# 7591yj.github.io

Personal portfolio and blog — built with [Astro](https://astro.build), styled
with [Tailwind CSS](https://tailwindcss.com), and enhanced with
[React](https://react.dev) for interactive components.

Live at **[7591yj.com](https://www.7591yj.com/)**

## Tech Stack

| Layer         | Technology                                                                                                                            |
| :------------ | :------------------------------------------------------------------------------------------------------------------------------------ |
| Framework     | [Astro](https://astro.build) 7 with [View Transitions](https://docs.astro.build/en/guides/view-transitions/)                          |
| Styling       | [Tailwind CSS](https://tailwindcss.com) 4 + custom design tokens                                                                      |
| Interactivity | [React](https://react.dev) 19, [Framer Motion](https://motion.dev), [Swiper](https://swiperjs.com)                                    |
| Content       | [MDX](https://mdxjs.com) with remark-gfm, rehype-slug, rehype-autolink-headings                                                       |
| Icons         | [astro-icon](https://github.com/natemoo-re/astro-icon) with [Carbon](https://carbondesignsystem.com/elements/icons/library/) icon set |
| Animations    | [Lottie](https://airbnb.io/lottie/) via lottie-react                                                                                  |
| i18n          | Astro built-in i18n (en, ja, ko)                                                                                                      |
| Package mgr   | [pnpm](https://pnpm.io) via [Nix flakes](https://nixos.wiki/wiki/Flakes)                                                              |

## Project Structure

```text
src/
├── components/     # Reusable Astro and React UI components
├── layouts/        # Shared page layouts
├── pages/          # Routes, localized pages, and MDX content
├── scripts/        # Client-side behavior
├── styles/         # Global CSS, design tokens, and prose styles
├── icons/          # Custom SVG icons
├── assets/         # Static source assets
├── consts.ts       # Site-wide constants
└── types.ts        # Shared TypeScript types
```

## Getting Started

> The project environment is defined in `flake.nix` and auto-loaded via
> `direnv`.

### Prerequisites

- [Nix](https://nixos.org/) with flakes enabled
- [direnv](https://direnv.net/)

### Commands

| Command          | Action                                              |
| :--------------- | :-------------------------------------------------- |
| `direnv allow`   | Enable automatic Nix flake activation for this repo |
| `pnpm install`   | Install dependencies                                |
| `pnpm dev`       | Start local dev server at `localhost:4321`          |
| `pnpm build`     | Build production site to `./dist/`                  |
| `pnpm preview`   | Preview production build locally                    |
| `pnpm lint`      | Run ESLint                                          |
| `pnpm typecheck` | Run Astro type checks                               |
| `pnpm check`     | Run formatting, lint, and type checks               |
| `./dev.sh`       | Launch tmux session (dev server + nvim + shell)     |

### Recommended Workflow

1. Ensure Nix flakes and direnv are available on your system.
2. Run `direnv allow` in the repo root.
3. Run `pnpm install`.
4. Use `./dev.sh` to attach or create the tmux workspace.

## Fonts

This project uses [PlemolJP](https://github.com/yuru7/PlemolJP) as the primary
typeface, self-hosted in `public/fonts/`. PlemolJP is licensed under the **SIL
Open Font License, Version 1.1** — see
[`public/fonts/LICENSE_PlemolJP`](public/fonts/LICENSE_PlemolJP) for the full
license text.

[Shippori Mincho](https://fonts.google.com/specimen/Shippori+Mincho) is loaded
via Astro's built-in Fonts API.

## License

Site content and code are personal work. Third-party dependencies are subject to
their own licenses. Font licensing is documented above.
