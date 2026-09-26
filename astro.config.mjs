// @ts-check
import { defineConfig, fontProviders } from "astro/config";
import { satteri } from "@astrojs/markdown-satteri";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import react from "@astrojs/react";
import { headingAnchors } from "./src/lib/headingAnchors.ts";

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
    processor: satteri({ hastPlugins: [headingAnchors] }),
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
