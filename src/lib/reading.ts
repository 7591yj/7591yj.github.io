import { readFileSync } from "node:fs";
import type { BlogPostEntry } from "./content";

const CJK = /[\u3040-\u30ff\u3400-\u9fff]/g;

export function readingMinutes(entry: BlogPostEntry): number {
  const path = entry.source.filePath;
  const text = (path ? readFileSync(path, "utf8") : "")
    .replace(/^---[\s\S]*?---/, " ")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/^(import|export) .*$/gm, " ")
    .replace(/<\/?[A-Za-z][^<>\n]*>/g, " ")
    .replace(/\]\([^)]*\)/g, "]");
  const chars = text.match(CJK)?.length ?? 0;
  const words = text.replace(CJK, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 230 + chars / 500));
}

export function outline(
  headings: { depth: number; text: string }[],
  limit = 6,
): string[] {
  if (!headings.length) return [];
  const top = Math.min(...headings.map((h) => h.depth));
  return headings
    .filter((h) => h.depth === top)
    .slice(0, limit)
    .map((h) => h.text);
}
