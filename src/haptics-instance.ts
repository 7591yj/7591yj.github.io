import { WebHaptics } from "web-haptics";

const ASTRO_BEFORE_SWAP = "astro:before-swap";
const ASTRO_PAGE_LOAD = "astro:page-load";

let instance: WebHaptics | null = null;

if (typeof document !== "undefined") {
  instance = new WebHaptics({ debug: import.meta.env.DEV });

  // Tear down before the DOM swap so internal audio/DOM refs don't go stale
  document.addEventListener(ASTRO_BEFORE_SWAP, () => {
    instance?.destroy();
    instance = null;
  });

  // Fresh instance after each navigation
  document.addEventListener(ASTRO_PAGE_LOAD, () => {
    instance = new WebHaptics({ debug: import.meta.env.DEV });
  });
}

export function triggerHaptic(pattern: unknown): void {
  try {
    if (!instance) instance = new WebHaptics({ debug: import.meta.env.DEV });
    instance.trigger(pattern as never);
  } catch (error) {
    // never let haptic failures break UI
    if (import.meta.env.DEV) console.warn({ error });
  }
}
