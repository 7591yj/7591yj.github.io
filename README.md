# 7591yj.github.io

My portfolio and blog at [7591yj.com](https://7591yj.com).

## Stack

- Astro, TypeScript, and Tailwind CSS
- React for interactive components, GSAP for animation, and Swiper for carousels
- MDX content collections with Satteri for Markdown processing

Posts and projects live in `src/content/`, with shared metadata in `en.mdx`
and translations alongside it.

## Development

Use Node.js and pnpm. The Nix dev shell provides both. With Nix and direnv
installed, run `direnv allow` to activate it.

```sh
pnpm install
pnpm dev
```

| Command        | Purpose                           |
| -------------- | --------------------------------- |
| `pnpm build`   | Build the site to `dist/`         |
| `pnpm preview` | Preview the production build      |
| `pnpm check`   | Check formatting, lint, and types |
| `pnpm format`  | Format the project                |
