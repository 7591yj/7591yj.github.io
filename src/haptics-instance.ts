import { WebHaptics } from "web-haptics";

let instance: WebHaptics | null = null;

if (typeof document !== "undefined") {
  instance = new WebHaptics({ debug: import.meta.env.DEV });

  // Tear down before the DOM swap so internal audio/DOM refs don't go stale
  document.addEventListener("astro:before-swap", () => {
    instance?.destroy();
    instance = null;
  });

  // Fresh instance after each navigation
  document.addEventListener("astro:page-load", () => {
    instance = new WebHaptics({ debug: import.meta.env.DEV });
  });
}

export function triggerHaptic(pattern: unknown): void {
  try {
    if (!instance) instance = new WebHaptics({ debug: import.meta.env.DEV });
    instance.trigger(pattern as never);
  } catch {
    // never let haptic failures break UI
  }
}
