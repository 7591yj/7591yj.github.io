import { useEffect, useRef, useState } from "react";
import { WebHaptics } from "web-haptics";
import { SOUND_KEY } from "./haptics";

export default function HapticsNotice() {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [soundOn, setSoundOn] = useState(false);
  const haptics = useRef<WebHaptics | null>(null);

  useEffect(() => {
    // mirror the library's two haptic paths:
    // if (WebHaptics.isSupported) → navigator.vibrate
    // if (!WebHaptics.isSupported || debug) → fake label click
    const vibratesNatively = WebHaptics.isSupported;
    const hasFakeLabelHaptics =
      !WebHaptics.isSupported && navigator.maxTouchPoints > 0;
    setSupported(vibratesNatively || hasFakeLabelHaptics);
    const stored = localStorage.getItem(SOUND_KEY) === "on";
    setSoundOn(stored);
    // debug is the library's audio fallback mechanism, not actual debugging
    haptics.current = new WebHaptics({ debug: stored, showSwitch: false });
    // write attribute so useHaptics instances on the page can sync
    document.documentElement.dataset.soundFallback = stored ? "on" : "off";

    return () => {
      haptics.current?.destroy();
      haptics.current = null;
    };
  }, []);

  const toggle = () => {
    const next = !soundOn;
    setSoundOn(next);
    localStorage.setItem(SOUND_KEY, next ? "on" : "off");
    document.documentElement.dataset.soundFallback = next ? "on" : "off";
    haptics.current?.setDebug(next);
    if (next) haptics.current?.trigger("nudge");
  };

  if (supported !== false) return null;

  return (
    <aside className="haptics-notice" role="note" aria-live="polite">
      <blockquote>
        This device does not support haptics, so the full experience is not
        there.
      </blockquote>
      <label className="haptics-notice__toggle">
        <input type="checkbox" checked={soundOn} onChange={toggle} />
        <span>Play sounds instead</span>
      </label>
    </aside>
  );
}
