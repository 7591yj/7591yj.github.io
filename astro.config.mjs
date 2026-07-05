// @ts-check
import { defineConfig, fontProviders } from "astro/config";
import { unified } from "@astrojs/markdown-remark";
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
  site: "https://7591yj.com",
  prefetch: false,
  i18n: {
    locales: ["en", "ja", "ko"],
    defaultLocale: "en",
  },
  markdown: {
    processor: unified({
      remarkPlugins: [remarkGfm],
      rehypePlugins: [
        rehypeSlug,
        [
          rehypeAutolinkHeadings,
          {
            behavior: "append",
            content: { type: "text", value: " #" },
            properties: {
              class: "heading-anchor",
              ariaHidden: true,
              tabIndex: -1,
            },
          },
        ],
      ],
    }),
    shikiConfig: {
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
    },
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
  fonts: [
    {
      provider: fontProviders.google(),
      name: "Shippori Mincho",
      cssVariable: "--font-shippori",
    },
  ],
});
