import { readFile } from "node:fs/promises";
import type { ImageMetadata } from "astro";
import sharp from "sharp";

async function load(src: ImageMetadata | string) {
  if (typeof src === "string") {
    const response = await fetch(src, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) throw new Error(`${response.status} for ${src}`);
    return Buffer.from(await response.arrayBuffer());
  }
  // Not public API; without it the card just goes without a preview.
  const path: unknown = Reflect.get(src, "fsPath");
  if (typeof path !== "string") throw new Error(`No source for ${src.src}`);
  return readFile(path);
}

async function render(src: ImageMetadata | string) {
  try {
    const tiny = await sharp(await load(src))
      .resize(16, 16, { fit: "cover" })
      .webp({ quality: 50 })
      .toBuffer();
    // Blurred in SVG so it scales smoothly instead of as 16px blocks.
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><filter id="b" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="1"/><feComponentTransfer><feFuncA type="discrete" tableValues="1 1"/></feComponentTransfer></filter><image width="16" height="16" preserveAspectRatio="none" filter="url(#b)" href="data:image/webp;base64,${tiny.toString("base64")}"/></svg>`;
    return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
  } catch {
    return undefined;
  }
}

const cache = new Map<ImageMetadata | string, ReturnType<typeof render>>();

/** A tiny blurred data URI to show while the image loads. */
export function previewImage(src: ImageMetadata | string) {
  let preview = cache.get(src);
  if (!preview) cache.set(src, (preview = render(src)));
  return preview;
}
