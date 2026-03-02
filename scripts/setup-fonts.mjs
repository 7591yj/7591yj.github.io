/**
 * Dev font setup
 *
 * Copies full fonts from font-sources/ to public/fonts/ if the subset
 * files are missing
 */

import { existsSync, mkdirSync, copyFileSync, readdirSync } from "fs";
import { join, resolve } from "path";

const ROOT = resolve(import.meta.dirname, "..");
const SOURCES = join(ROOT, "font-sources");
const TARGET = join(ROOT, "public", "fonts");

const missing =
  !existsSync(TARGET) ||
  readdirSync(SOURCES)
    .filter((f) => f.endsWith(".woff2"))
    .some((f) => !existsSync(join(TARGET, f)));

if (missing) {
  mkdirSync(TARGET, { recursive: true });
  for (const f of readdirSync(SOURCES)) {
    if (!f.endsWith(".woff2")) continue;
    copyFileSync(join(SOURCES, f), join(TARGET, f));
  }
  console.log("Fonts copied from font-sources/ for local dev.");
}
