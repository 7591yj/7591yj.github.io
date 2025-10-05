// @ts-check

import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { PROD_URL } from "./src/consts.js";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  site: PROD_URL,
  integrations: [mdx(), sitemap()],
});
