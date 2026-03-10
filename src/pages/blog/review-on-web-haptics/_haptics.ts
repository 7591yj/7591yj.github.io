import { useEffect, useRef } from "react";
import { WebHaptics } from "web-haptics";

export const SOUND_KEY = "web-haptics:sound-fallback";

export function useHaptics() {
  const ref = useRef<WebHaptics | null>(null);

  useEffect(() => {
    // debug is the library's audio fallback mechanism, not actual debugging
    const instance = new WebHaptics({
      debug: localStorage.getItem(SOUND_KEY) === "on",
      showSwitch: false,
    });
    ref.current = instance;

    // syncs when HapticsNotice writes data-sound-fallback on toggle
    const observer = new MutationObserver(() =>
      instance.setDebug(localStorage.getItem(SOUND_KEY) === "on")
    );
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-sound-fallback"],
    });

    return () => {
      observer.disconnect();
      instance.destroy();
      ref.current = null;
    };
  }, []);

  return ref;
}
