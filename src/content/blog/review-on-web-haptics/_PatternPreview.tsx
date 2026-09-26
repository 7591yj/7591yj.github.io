import { useState } from "react";
import type { Vibration, WebHaptics } from "web-haptics";
import { useHaptics } from "./_haptics";
import { KEYPRESS, SWITCH, BOOT, PING, CONFIRM, TICK } from "../../../haptics";

const PATTERNS = [
  { name: "KEYPRESS", pulses: KEYPRESS },
  { name: "SWITCH", pulses: SWITCH },
  { name: "BOOT", pulses: BOOT },
  { name: "PING", pulses: PING },
  { name: "CONFIRM", pulses: CONFIRM },
  { name: "TICK", pulses: TICK },
] as const;

async function runPattern(
  instance: WebHaptics | null,
  pulses: readonly Vibration[],
) {
  if (instance) await instance.trigger([...pulses]);
}

function PulseSegment({ p, total }: { p: Vibration; total: number }) {
  const intensity = p.intensity ?? 0.5;
  const delay = p.delay ?? 0;
  return (
    <span className="pulse-viz__segment">
      {delay > 0 && (
        <span
          className="pulse-viz__gap"
          style={{ width: `${(delay / total) * 100}%` }}
        />
      )}
      <span
        className="pulse-viz__bar"
        style={{
          width: `${(p.duration / total) * 100}%`,
          height: `${Math.round(4 + intensity * 24)}px`,
          opacity: 0.4 + intensity * 0.6,
        }}
      />
    </span>
  );
}

function PulseViz({ pulses }: { pulses: readonly Vibration[] }) {
  const total = pulses.reduce((sum, p) => sum + (p.delay ?? 0) + p.duration, 0);

  return (
    <div className="pulse-viz" aria-hidden="true">
      {pulses.map((p, i) => (
        <PulseSegment key={i} p={p} total={total} />
      ))}
    </div>
  );
}

export default function PatternPreview() {
  const haptics = useHaptics();
  const [active, setActive] = useState<string | null>(null);

  async function trigger(name: string, pulses: readonly Vibration[]) {
    if (active) return;
    setActive(name);
    await runPattern(haptics.current, pulses);
    setActive(null);
  }

  return (
    <section
      className="solutions-inline pattern-preview"
      aria-label="Haptic pattern showcase"
    >
      <div className="pattern-preview__grid">
        {PATTERNS.map(({ name, pulses }) => (
          <button
            key={name}
            className={`pattern-card${active === name ? " is-active" : ""}`}
            onClick={() => trigger(name, pulses)}
            disabled={active !== null && active !== name}
            aria-label={`Try ${name} pattern`}
          >
            <PulseViz pulses={pulses} />
            <span className="pattern-card__name">{name}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
