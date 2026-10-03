import { WebHaptics } from "web-haptics";

const ASTRO_BEFORE_SWAP = "astro:before-swap";
const ASTRO_PAGE_LOAD = "astro:page-load";

// web-haptics debug audio loses the first iOS click gesture.
const create = () => new WebHaptics({ debug: false });

let instance: WebHaptics | null = null;

if (typeof document !== "undefined") {
  instance = create();

  // Release audio and DOM references before Astro swaps pages.
  document.addEventListener(ASTRO_BEFORE_SWAP, () => {
    instance?.destroy();
    instance = null;
  });

  document.addEventListener(ASTRO_PAGE_LOAD, () => {
    instance = create();
  });
}

export function triggerHaptic(pattern: unknown): void {
  try {
    if (!instance) instance = create();
    instance.trigger(pattern as never);
  } catch (error) {
    if (import.meta.env.DEV) console.warn({ error });
  }
}
