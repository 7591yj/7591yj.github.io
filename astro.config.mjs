// @ts-check
import { defineConfig, fontProviders } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import react from "@astrojs/react";
import remarkGfm from "remark-gfm";

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
  },
  integrations: [mdx(), sitemap(), react(), icon()],
  vite: {
    plugins: [tailwindcss()],
  },
  experimental: {
    fonts: [
      {
        provider: fontProviders.google(),
        name: "IBM Plex Mono",
        cssVariable: "--font-plex",
      },
    ],
  },
});

