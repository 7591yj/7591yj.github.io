// @ts-check
import { defineConfig, fontProviders } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import react from "@astrojs/react";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

import icon from "astro-icon";

// https://astro.build/config
export default defineConfig({
  site: "https://7591yj.github.io",
  i18n: {
    locales: ["en", "ja", "ko"],
    defaultLocale: "en",
  },
  markdown: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          behavior: "append",
          content: { type: "text", value: " #" },
          properties: { class: "heading-anchor", ariaHidden: true, tabIndex: -1 },
        },
      ],
    ],
  },
  integrations: [
    mdx(),
    sitemap(),
    react(),
    icon({
      iconDir: "src/icons",
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  experimental: {
    fonts: [
      {
        provider: fontProviders.google(),
        name: "Shippori Mincho",
        cssVariable: "--font-shippori",
      },
    ],
  },
});

