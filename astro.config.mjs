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
  image: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "7591yj.x02.me",
        pathname: "/i/**",
      },
    ],
  },
  // Keep component selectors level with shared CSS.
  scopedStyleStrategy: "where",
  // Only links that opt in with data-astro-prefetch, i.e. the shell nav.
  prefetch: { prefetchAll: false, defaultStrategy: "hover" },
  redirects: {
    "/projects": "/",
    "/ja/projects": "/ja/",
  },
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
      name: "Archivo",
      cssVariable: "--font-archivo",
      weights: ["400", "500", "600", "700", "800"],
      styles: ["normal", "italic"],
      // global.css composes locale fonts before system fallbacks.
      fallbacks: [],
    },
    {
      provider: fontProviders.google(),
      name: "Noto Sans JP",
      cssVariable: "--font-noto-sans-jp",
      weights: ["400 800"],
      styles: ["normal"],
      fallbacks: [],
    },
    {
      provider: fontProviders.google(),
      name: "IBM Plex Mono",
      cssVariable: "--font-plex-mono",
      weights: ["400", "500", "700"],
      styles: ["normal", "italic"],
      fallbacks: [],
    },
    {
      provider: fontProviders.google(),
      name: "IBM Plex Sans JP",
      cssVariable: "--font-plex-sans-jp",
      weights: ["400", "500", "700"],
      styles: ["normal"],
      fallbacks: [],
    },
  ],
});
