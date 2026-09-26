import { useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { useHaptics } from "./_haptics";
import { KEYPRESS, SWITCH, PING, CONFIRM, TICK } from "../../../haptics";

type ShowcaseKind = "responsive" | "frameworks" | "spa" | "pwa";

function ResponsiveToggle({
  desktop,
  onChange,
}: {
  desktop: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <div className="solution-toggle">
      <button
        className={!desktop ? "is-active" : ""}
        onClick={() => onChange(false)}
      >
        Phone
      </button>
      <button
        className={desktop ? "is-active" : ""}
        onClick={() => onChange(true)}
      >
        Desktop
      </button>
      <span className="solution-control__value">
        {desktop ? "Desktop" : "Phone"}
      </span>
    </div>
  );
}

const responsiveGridStyle = (desktop: boolean): CSSProperties => ({
  gridTemplateColumns: desktop ? "280px minmax(0, 1fr)" : "minmax(0, 1fr)",
  minWidth: desktop ? "640px" : undefined,
  gap: "16px",
  padding: "16px",
  maxWidth: "1100px",
  margin: "0 auto",
});

function ResponsivePreview({ desktop }: { desktop: boolean }) {
  return (
    <div
      className="responsive-preview__frame"
      style={{ width: desktop ? 840 : 360 }}
    >
      <div
        className="responsive-preview__grid"
        style={responsiveGridStyle(desktop)}
      >
        <div className="responsive-preview__block responsive-preview__block--accent">
          Sidebar
        </div>
        <div className="responsive-preview__block">Main content</div>
      </div>
    </div>
  );
}

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
        <ResponsiveToggle desktop={desktop} onChange={toggle} />
      </div>
      <div className="responsive-preview" aria-live="polite">
        <ResponsivePreview desktop={desktop} />
        <div className="responsive-preview__legend">
          <span className="legend-chip">.page</span>
          <span className="legend-chip">.layout</span>
          <span className="legend-note">1 column → 2 columns at 768px</span>
        </div>
      </div>
    </section>
  );
}

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

const routes = ["Feed", "Profile", "Settings"] as const;
type Route = (typeof routes)[number];

function SpaTabs({
  route,
  onNavigate,
}: {
  route: Route;
  onNavigate: (r: Route) => void;
}) {
  return (
    <div className="spa-preview__tabs" role="tablist">
      {routes.map((r) => (
        <button
          key={r}
          className={`spa-preview__tab ${route === r ? "is-active" : ""}`}
          role="tab"
          aria-selected={route === r}
          onClick={() => onNavigate(r)}
        >
          {r}
        </button>
      ))}
    </div>
  );
}

function SpaPanelHeader({
  route,
  canGoBack,
  onBack,
}: {
  route: Route;
  canGoBack: boolean;
  onBack: () => void;
}) {
  return (
    <div className="spa-preview__panel-header">
      <span className="spa-preview__route">{route}</span>
      <button
        className="spa-preview__back"
        onClick={onBack}
        disabled={!canGoBack}
      >
        Back
      </button>
    </div>
  );
}

function SpaCounter({
  count,
  onIncrement,
}: {
  count: number;
  onIncrement: () => void;
}) {
  return (
    <div className="spa-preview__counter">
      <strong>{count}</strong>
      <button onClick={onIncrement}>Increment</button>
    </div>
  );
}

function useSpaState() {
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

  const increment = () => {
    haptics.current?.trigger(CONFIRM);
    setCounters((prev) => ({ ...prev, [route]: prev[route] + 1 }));
  };

  return { route, history, counters, navigate, goBack, increment };
}

function SpaShowcase() {
  const { route, history, counters, navigate, goBack, increment } =
    useSpaState();

  return (
    <section className="solutions-inline" aria-label="SPA demo">
      <div className="spa-preview">
        <SpaTabs route={route} onNavigate={navigate} />
        <div className="spa-preview__panel" role="tabpanel">
          <SpaPanelHeader
            route={route}
            canGoBack={history.length > 1}
            onBack={goBack}
          />
          <p className="spa-preview__copy">
            This view has its own state counter stored in memory.
          </p>
          <SpaCounter count={counters[route]} onIncrement={increment} />
        </div>
      </div>
    </section>
  );
}

const fmtTime = (d: Date) =>
  d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

const ledClass = (offline: boolean) =>
  `led ${offline ? "led--hollow" : "led--active"}`;

const pwaStatusLabel = (offline: boolean) => (offline ? "Offline" : "Online");

const toggleLabel = (offline: boolean) =>
  offline ? "Go online" : "Go offline";

const pwaPayload = (cachedAt: Date | null): string | null =>
  cachedAt ? `Payload: "Status synced at ${fmtTime(cachedAt)}."` : null;

const pwaCacheNote = (offline: boolean, cachedAt: Date) =>
  offline
    ? `From cache · ${fmtTime(cachedAt)}`
    : `Cached · ${fmtTime(cachedAt)}`;

function PwaControls({
  offline,
  onFetch,
  onToggle,
}: {
  offline: boolean;
  onFetch: () => void;
  onToggle: () => void;
}) {
  return (
    <div className="pwa-compare__controls">
      <span className={ledClass(offline)} />
      <span className="pwa-compare__status-label">
        {pwaStatusLabel(offline)}
      </span>
      <button onClick={onFetch} disabled={offline}>
        Fetch update
      </button>
      <button className={offline ? "is-active" : ""} onClick={onToggle}>
        {toggleLabel(offline)}
      </button>
    </div>
  );
}

function PwaPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="pwa-compare__panel">
      <div className="pwa-compare__panel-title">{title}</div>
      <div className="pwa-compare__content">{children}</div>
    </div>
  );
}

function WithoutPwaBody({
  offline,
  payload,
}: {
  offline: boolean;
  payload: string | null;
}) {
  if (offline) {
    return (
      <>
        <p className="pwa-compare__error">Network error</p>
        <p className="pwa-compare__note">
          No cached data · Cannot serve offline
        </p>
      </>
    );
  }
  if (payload) {
    return (
      <>
        <p className="pwa-compare__payload">{payload}</p>
        <p className="pwa-compare__note">Live from network</p>
      </>
    );
  }
  return <p className="pwa-compare__note">No data yet. Fetch while online.</p>;
}

function WithPwaBody({
  offline,
  payload,
  cachedAt,
}: {
  offline: boolean;
  payload: string | null;
  cachedAt: Date | null;
}) {
  if (payload) {
    return (
      <>
        <p className="pwa-compare__payload">{payload}</p>
        <p className="pwa-compare__note">{pwaCacheNote(offline, cachedAt!)}</p>
      </>
    );
  }
  if (offline) {
    return (
      <>
        <p className="pwa-compare__error">Network error</p>
        <p className="pwa-compare__note">
          No cache yet. Fetch while online first.
        </p>
      </>
    );
  }
  return <p className="pwa-compare__note">No data yet. Fetch while online.</p>;
}

function PwaShowcase() {
  const haptics = useHaptics();
  const [offline, setOffline] = useState(false);
  const [cachedAt, setCachedAt] = useState<Date | null>(null);

  const fetchUpdate = () => {
    if (offline) return;
    haptics.current?.trigger(PING);
    setCachedAt(new Date());
  };

  const goOnlineToggle = () => {
    haptics.current?.trigger(SWITCH);
    setOffline((v) => !v);
  };

  const payload = pwaPayload(cachedAt);

  return (
    <section className="solutions-inline" aria-label="PWA demo">
      <div className="pwa-compare">
        <PwaControls
          offline={offline}
          onFetch={fetchUpdate}
          onToggle={goOnlineToggle}
        />
        <div className="pwa-compare__panels">
          <PwaPanel title="Without PWA">
            <WithoutPwaBody offline={offline} payload={payload} />
          </PwaPanel>
          <PwaPanel title="With PWA">
            <WithPwaBody
              offline={offline}
              payload={payload}
              cachedAt={cachedAt}
            />
          </PwaPanel>
        </div>
      </div>
    </section>
  );
}

export default function SolutionsShowcase({ kind }: { kind: ShowcaseKind }) {
  if (kind === "responsive") return <ResponsiveShowcase />;
  if (kind === "frameworks") return <FrameworksShowcase />;
  if (kind === "spa") return <SpaShowcase />;
  return <PwaShowcase />;
}
