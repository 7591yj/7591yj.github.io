import { useState } from "react";
import type { CSSProperties } from "react";
import { useHaptics } from "./haptics";
import { KEYPRESS, SWITCH, PING, CONFIRM, TICK } from "../../../haptics";

type ShowcaseKind = "responsive" | "frameworks" | "spa" | "pwa";

// --- Responsive ---

function ResponsiveShowcase() {
  const haptics = useHaptics();
  const [desktop, setDesktop] = useState(false);

  const toggle = (next: boolean) => {
    haptics.current?.trigger(TICK);
    setDesktop(next);
  };

  return (
    <section
      className="solutions-inline"
      aria-label="Responsive web design demo"
    >
      <div className="solution-inline__controls">
        <div className="solution-toggle">
          <button
            className={!desktop ? "is-active" : ""}
            onClick={() => toggle(false)}
          >
            Phone
          </button>
          <button
            className={desktop ? "is-active" : ""}
            onClick={() => toggle(true)}
          >
            Desktop
          </button>
          <span className="solution-control__value">
            {desktop ? "Desktop" : "Phone"}
          </span>
        </div>
      </div>
      <div className="responsive-preview" aria-live="polite">
        <div
          className="responsive-preview__frame"
          style={{ width: desktop ? 840 : 360 }}
        >
          <div
            className="responsive-preview__grid"
            style={{
              gridTemplateColumns: desktop
                ? "280px minmax(0, 1fr)"
                : "minmax(0, 1fr)",
              minWidth: desktop ? "640px" : undefined,
              gap: "16px",
              padding: "16px",
              maxWidth: "1100px",
              margin: "0 auto",
            }}
          >
            <div className="responsive-preview__block responsive-preview__block--accent">
              Sidebar
            </div>
            <div className="responsive-preview__block">Main content</div>
          </div>
        </div>
        <div className="responsive-preview__legend">
          <span className="legend-chip">.page</span>
          <span className="legend-chip">.layout</span>
          <span className="legend-note">1 column → 2 columns at 768px</span>
        </div>
      </div>
    </section>
  );
}

// --- Frameworks ---

const DENSITY_LABELS = ["Compact", "Balanced", "Spacious"] as const;

function FrameworksShowcase() {
  const haptics = useHaptics();
  const [density, setDensity] = useState<0 | 1 | 2>(1);

  return (
    <section className="solutions-inline" aria-label="Frameworks demo">
      <div className="solution-inline__controls">
        <div className="solution-toggle">
          {([0, 1, 2] as const).map((d) => (
            <button
              key={d}
              className={density === d ? "is-active" : ""}
              onClick={() => {
                haptics.current?.trigger(TICK);
                setDensity(d);
              }}
            >
              {DENSITY_LABELS[d]}
            </button>
          ))}
          <span className="solution-control__value">
            {DENSITY_LABELS[density]}
          </span>
        </div>
      </div>
      <div
        className="token-preview"
        style={
          {
            "--demo-gap": `${8 + density * 6}px`,
            "--demo-padding": `${10 + density * 8}px`,
            "--demo-radius": "10px",
          } as CSSProperties
        }
      >
        <div className="token-preview__card">
          <div className="token-preview__title">Primary action</div>
          <button className="token-preview__button">Launch</button>
        </div>
        <div className="token-preview__card">
          <div className="token-preview__title">Secondary action</div>
          <button className="token-preview__button token-preview__button--ghost">
            Learn more
          </button>
        </div>
      </div>
    </section>
  );
}

// --- SPA ---

const routes = ["Feed", "Profile", "Settings"] as const;
type Route = (typeof routes)[number];

function SpaShowcase() {
  const haptics = useHaptics();
  const [route, setRoute] = useState<Route>("Feed");
  const [history, setHistory] = useState<Route[]>(["Feed"]);
  const [counters, setCounters] = useState<Record<Route, number>>({
    Feed: 0,
    Profile: 0,
    Settings: 0,
  });

  const navigate = (next: Route) => {
    haptics.current?.trigger(KEYPRESS);
    setRoute(next);
    setHistory((prev) =>
      prev[prev.length - 1] === next ? prev : [...prev, next],
    );
  };

  const goBack = () => {
    if (history.length <= 1) return;
    haptics.current?.trigger(KEYPRESS);
    setHistory((prev) => {
      const next = prev.slice(0, -1);
      setRoute(next[next.length - 1]);
      return next;
    });
  };

  return (
    <section className="solutions-inline" aria-label="SPA demo">
      <div className="spa-preview">
        <div className="spa-preview__tabs" role="tablist">
          {routes.map((r) => (
            <button
              key={r}
              className={`spa-preview__tab ${route === r ? "is-active" : ""}`}
              role="tab"
              aria-selected={route === r}
              onClick={() => navigate(r)}
            >
              {r}
            </button>
          ))}
        </div>
        <div className="spa-preview__panel" role="tabpanel">
          <div className="spa-preview__panel-header">
            <span className="spa-preview__route">{route}</span>
            <button
              className="spa-preview__back"
              onClick={goBack}
              disabled={history.length <= 1}
            >
              Back
            </button>
          </div>
          <p className="spa-preview__copy">
            This view has its own state counter stored in memory.
          </p>
          <div className="spa-preview__counter">
            <strong>{counters[route]}</strong>
            <button
              onClick={() => {
                haptics.current?.trigger(CONFIRM);
                setCounters((prev) => ({ ...prev, [route]: prev[route] + 1 }));
              }}
            >
              Increment
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

// --- PWA ---

const fmtTime = (d: Date) =>
  d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

function PwaShowcase() {
  const haptics = useHaptics();
  const [offline, setOffline] = useState(false);
  const [cachedAt, setCachedAt] = useState<Date | null>(null);

  const fetchUpdate = () => {
    if (offline) return;
    haptics.current?.trigger(PING);
    setCachedAt(new Date());
  };

  const payload = cachedAt
    ? `Payload: "Status synced at ${fmtTime(cachedAt)}."`
    : null;

  return (
    <section className="solutions-inline" aria-label="PWA demo">
      <div className="pwa-compare">
        <div className="pwa-compare__controls">
          <span className={`led ${offline ? "led--hollow" : "led--active"}`} />
          <span className="pwa-compare__status-label">
            {offline ? "Offline" : "Online"}
          </span>
          <button onClick={fetchUpdate} disabled={offline}>
            Fetch update
          </button>
          <button
            className={offline ? "is-active" : ""}
            onClick={() => {
              haptics.current?.trigger(SWITCH);
              setOffline((v) => !v);
            }}
          >
            {offline ? "Go online" : "Go offline"}
          </button>
        </div>

        <div className="pwa-compare__panels">
          <div className="pwa-compare__panel">
            <div className="pwa-compare__panel-title">Without PWA</div>
            <div className="pwa-compare__content">
              {offline ? (
                <>
                  <p className="pwa-compare__error">Network error</p>
                  <p className="pwa-compare__note">
                    No cached data · Cannot serve offline
                  </p>
                </>
              ) : payload ? (
                <>
                  <p className="pwa-compare__payload">{payload}</p>
                  <p className="pwa-compare__note">Live from network</p>
                </>
              ) : (
                <p className="pwa-compare__note">
                  No data yet. Fetch while online.
                </p>
              )}
            </div>
          </div>

          <div className="pwa-compare__panel">
            <div className="pwa-compare__panel-title">With PWA</div>
            <div className="pwa-compare__content">
              {payload ? (
                <>
                  <p className="pwa-compare__payload">{payload}</p>
                  <p className="pwa-compare__note">
                    {offline
                      ? `From cache · ${fmtTime(cachedAt!)}`
                      : `Cached · ${fmtTime(cachedAt!)}`}
                  </p>
                </>
              ) : offline ? (
                <>
                  <p className="pwa-compare__error">Network error</p>
                  <p className="pwa-compare__note">
                    No cache yet. Fetch while online first.
                  </p>
                </>
              ) : (
                <p className="pwa-compare__note">
                  No data yet. Fetch while online.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// --- Dispatcher ---

export default function SolutionsShowcase({ kind }: { kind: ShowcaseKind }) {
  if (kind === "responsive") return <ResponsiveShowcase />;
  if (kind === "frameworks") return <FrameworksShowcase />;
  if (kind === "spa") return <SpaShowcase />;
  return <PwaShowcase />;
}
