import { useEffect, useRef, useState } from "react";
import { WebHaptics } from "web-haptics";
import { SOUND_KEY } from "./_haptics";

// Mirrors the library's two haptic paths: when WebHaptics reports native
// support it drives navigator.vibrate; otherwise, in debug mode, it falls
// back to a fake label click. We expose the same choice here for the notice.
function detectSupport(): boolean {
  const vibratesNatively = WebHaptics.isSupported;
  const hasFakeLabelHaptics =
    !WebHaptics.isSupported && navigator.maxTouchPoints > 0;
  return vibratesNatively || hasFakeLabelHaptics;
}

function HapticsNoticeView({
  soundOn,
  onToggle,
}: {
  soundOn: boolean;
  onToggle: () => void;
}) {
  return (
    <aside className="haptics-notice" role="note" aria-live="polite">
      <blockquote>
        This device does not support haptics, so the full experience is not
        there.
      </blockquote>
      <label className="haptics-notice__toggle">
        <input type="checkbox" checked={soundOn} onChange={onToggle} />
        <span>Play sounds instead</span>
      </label>
    </aside>
  );
}

export default function HapticsNotice() {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [soundOn, setSoundOn] = useState(false);
  const haptics = useRef<WebHaptics | null>(null);

  useEffect(() => {
    const supportedNow = detectSupport();
    const stored = localStorage.getItem(SOUND_KEY) === "on";
    queueMicrotask(() => {
      setSupported(supportedNow);
      setSoundOn(stored);
    });
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
    const shouldPlaySound = !soundOn;
    setSoundOn(shouldPlaySound);
    localStorage.setItem(SOUND_KEY, shouldPlaySound ? "on" : "off");
    document.documentElement.dataset.soundFallback = shouldPlaySound
      ? "on"
      : "off";
    haptics.current?.setDebug(shouldPlaySound);
    if (shouldPlaySound) haptics.current?.trigger("nudge");
  };

  if (supported !== false) return null;
  return <HapticsNoticeView soundOn={soundOn} onToggle={toggle} />;
}
