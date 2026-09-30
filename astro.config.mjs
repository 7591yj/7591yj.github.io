// @ts-check
import { defineConfig, fontProviders } from "astro/config";
import { satteri } from "@astrojs/markdown-satteri";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import react from "@astrojs/react";
import { headingAnchors } from "./src/lib/headingAnchors.ts";

import icon from "astro-icon";

export default defineConfig({
  site: "https://7591yj.com",
  prefetch: false,
  experimental: {
    incrementalBuild: true,
  },
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
    server: {
      watch: {
        ignored: ["**/.direnv", "**/.direnv/**"],
      },
    },
  },
  fonts: [
    {
      provider: fontProviders.google(),
      name: "Shippori Mincho",
      cssVariable: "--font-shippori",
    },
    {
      provider: fontProviders.google(),
      name: "Archivo",
      cssVariable: "--font-archivo",
      weights: ["400", "500", "600", "700", "800"],
      styles: ["normal", "italic"],
      fallbacks: ["Hiragino Sans", "Noto Sans JP", "Arial", "sans-serif"],
    },
  ],
});
