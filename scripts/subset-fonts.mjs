/**
 * Font subsetting script
 *
 * Reads full fonts from font-sources/; scans dist/ HTML for character used
 * and writes subset WOFF2 files to public/fonts/
 *
 * Must run AFTER `astro build` so dist/ contains the full rendered HTML.
 * Re-run `astro build` afterwards to bundle the smaller fonts into dist/
 *
 * Usage:
 *   bun run build && bun run subset-fonts && bun run build
 *   or the combined alias: bun run build:optimized
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join, resolve } from "path";
import subsetFont from "subset-font";

const ROOT = resolve(import.meta.dirname, "..");
const DIST = join(ROOT, "dist");
const SOURCES_DIR = join(ROOT, "font-sources");
const FONTS_DIR = join(ROOT, "public", "fonts");

const FONT_FILES = [
  "PlemolJP-Regular.woff2",
  "PlemolJP-Italic.woff2",
  "PlemolJP-Bold.woff2",
  "PlemolJP-BoldItalic.woff2",
];

// Collect all HTML files from dist/

function findHtml(dir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      results.push(...findHtml(full));
    } else if (entry.endsWith(".html")) {
      results.push(full);
    }
  }
  return results;
}

const htmlFiles = findHtml(DIST);
console.log(`Found ${htmlFiles.length} HTML files in dist/`);

// Extract unique characters

const rawHtml = htmlFiles.map((f) => readFileSync(f, "utf8")).join("");

// Strip tags and HTML entities and collect unique code points
const text = rawHtml
  .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
  .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
  .replace(/<[^>]+>/g, " ")
  .replace(/&[a-z]+;|&#\d+;|&#x[\da-f]+;/gi, " ");

const uniqueChars = [...new Set(text)].join("");
console.log(`Unique characters to include: ${uniqueChars.length}`);

// Subset each font file

for (const filename of FONT_FILES) {
  const sourcePath = join(SOURCES_DIR, filename);
  const fontPath = join(FONTS_DIR, filename);
  const original = readFileSync(sourcePath);
  const originalKB = (original.length / 1024).toFixed(1);

  const subset = await subsetFont(original, uniqueChars, {
    targetFormat: "woff2",
  });

  writeFileSync(fontPath, subset);
  const subsetKB = (subset.length / 1024).toFixed(1);
  const saving = (
    ((original.length - subset.length) / original.length) *
    100
  ).toFixed(0);

  console.log(`${filename}: ${originalKB} KB → ${subsetKB} KB  (−${saving}%)`);
}

console.log("\nDone. Run `bun run build` again to bundle the subset fonts.");
