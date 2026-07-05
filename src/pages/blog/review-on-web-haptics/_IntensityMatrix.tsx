import { useState } from "react";

const PWM_CYCLE = 100; // ms per cycle
const TOGGLE_MIN = 10; // ms (minimum interval = fastest = strongest)
const TOGGLE_MAX = 90; // ms (range added at lowest intensity)
const WINDOW_MS = 300; // time window visualized

function pct(ms: number) {
  return `${(ms / WINDOW_MS) * 100}%`;
}

type Bar = { start: number; width: number };

const androidBars = (onTime: number): Bar[] => {
  const bars: Bar[] = [];
  for (let t = 0; t < WINDOW_MS; t += PWM_CYCLE) {
    const width = Math.min(onTime, WINDOW_MS - t);
    if (width > 0) bars.push({ start: t, width });
  }
  return bars;
};

const iosTicks = (interval: number): number[] => {
  const ticks: number[] = [];
  for (let t = 0; t <= WINDOW_MS; t += interval) ticks.push(t);
  return ticks;
};

export default function IntensityMatrix() {
  const [intensity, setIntensity] = useState(0.7);

  const onTime = intensity * PWM_CYCLE;
  const offTime = (1 - intensity) * PWM_CYCLE;
  const toggleInterval = TOGGLE_MIN + (1 - intensity) * TOGGLE_MAX;
  const bars = androidBars(onTime);
  const ticks = iosTicks(toggleInterval);

  return (
    <section
      className="solutions-inline intensity-matrix"
      aria-label="Intensity implementation comparison"
    >
      <div className="intensity-matrix__slider-row">
        <label htmlFor="intensity-slider" className="intensity-matrix__label">
          intensity
        </label>
        <input
          id="intensity-slider"
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={intensity}
          onChange={(e) => setIntensity(parseFloat(e.target.value))}
          className="intensity-matrix__slider"
        />
        <span className="intensity-matrix__value">{intensity.toFixed(2)}</span>
      </div>

      <div className="intensity-matrix__rows">
        {/* Android row */}
        <div className="intensity-matrix__row">
          <div className="intensity-matrix__meta">
            <span className="intensity-matrix__platform">Android</span>
            <span className="intensity-matrix__detail">
              PWM · on <strong>{onTime.toFixed(0)}</strong>ms / off{" "}
              <strong>{offTime.toFixed(0)}</strong>ms
            </span>
          </div>
          <div className="intensity-track" aria-hidden="true">
            {bars.map((bar, i) => (
              <span
                key={i}
                className="intensity-track__bar"
                style={{ left: pct(bar.start), width: pct(bar.width) }}
              />
            ))}
          </div>
        </div>

        {/* iOS row */}
        <div className="intensity-matrix__row">
          <div className="intensity-matrix__meta">
            <span className="intensity-matrix__platform">iOS</span>
            <span className="intensity-matrix__detail">
              click freq · interval <strong>{toggleInterval.toFixed(0)}</strong>
              ms
            </span>
          </div>
          <div className="intensity-track" aria-hidden="true">
            {ticks.map((tick, i) => (
              <span
                key={i}
                className="intensity-track__tick"
                style={{ left: pct(tick) }}
              />
            ))}
          </div>
        </div>
      </div>

      <p className="intensity-matrix__legend">{WINDOW_MS}ms window</p>
    </section>
  );
}
