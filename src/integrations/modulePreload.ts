import { readdir, readFile, writeFile } from "node:fs/promises";
import { join, posix } from "node:path";
import { fileURLToPath } from "node:url";
import type { AstroIntegration } from "astro";

const IMPORT = /(?:from|import)\s*"(\.{1,2}\/[^"]+\.js)"/g;
const SCRIPT = /<script type="module" src="(\/_astro\/[^"]+\.js)"/g;

/** Preloads every static import of a page's scripts, so they load in one round. */
export function modulePreload() {
  return {
    name: "module-preload",
    hooks: {
      "astro:build:done": async ({ dir }) => {
        const root = fileURLToPath(dir);

        const collect = async (src: string, seen: Set<string>) => {
          const code = await readFile(join(root, src), "utf8");
          for (const [, rel] of code.matchAll(IMPORT)) {
            const dep = posix.join(posix.dirname(src), rel);
            if (seen.has(dep)) continue;
            seen.add(dep);
            await collect(dep, seen);
          }
        };

        const files = await readdir(root, { recursive: true });
        for (const file of files.filter((name) => name.endsWith(".html"))) {
          const path = join(root, file);
          const html = await readFile(path, "utf8");
          const entries = [...html.matchAll(SCRIPT)].map(([, src]) => src);
          const seen = new Set(entries);
          for (const src of entries) await collect(src, seen);
          const links = [...seen]
            .filter((src) => !entries.includes(src) && !html.includes(src))
            .map((src) => `<link rel="modulepreload" href="${src}">`)
            .join("");
          if (links) {
            await writeFile(path, html.replace("</head>", `${links}</head>`));
          }
        }
      },
    },
  } satisfies AstroIntegration;
}
