const THEME_KEY = "theme";
let isWatchingSystemPreference = false;

export type Theme = "light" | "dark";
type ThemePreference = Theme | "system";

function shouldFollowSystemPreference(): boolean {
  const stored = getStoredTheme();
  return !stored || stored === "system";
}

function systemThemeFromEvent(event: MediaQueryListEvent): Theme {
  return event.matches ? "dark" : "light";
}

function getSystemPreference(): Theme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function getStoredTheme(): ThemePreference | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(THEME_KEY) as ThemePreference | null;
  return stored;
}

type TypedTransitionStarter = (options: {
  update: () => void;
  types: string[];
}) => ViewTransition;

function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  if (root.getAttribute("data-theme") === theme) return;

  const update = () => root.setAttribute("data-theme", theme);
  if (!document.startViewTransition) {
    update();
    return;
  }
  try {
    (document.startViewTransition as unknown as TypedTransitionStarter).call(
      document,
      { update, types: ["theme"] },
    );
  } catch {
    document.startViewTransition(update);
  }
}

export function initTheme(): void {
  const stored = getStoredTheme();
  const theme = stored === "system" || !stored ? getSystemPreference() : stored;
  applyTheme(theme);
}

function setTheme(preference: ThemePreference): void {
  if (preference === "system") {
    localStorage.removeItem(THEME_KEY);
    applyTheme(getSystemPreference());
  } else {
    localStorage.setItem(THEME_KEY, preference);
    applyTheme(preference);
  }
}

export function getCurrentTheme(): Theme {
  const stored = getStoredTheme();
  if (stored === "system" || !stored) {
    return getSystemPreference();
  }
  return stored;
}

export function toggleTheme(): void {
  const current = getCurrentTheme();
  setTheme(current === "dark" ? "light" : "dark");
}

export function watchSystemPreference(callback?: (theme: Theme) => void): void {
  if (isWatchingSystemPreference) return;
  isWatchingSystemPreference = true;

  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", (e: MediaQueryListEvent) => {
      if (shouldFollowSystemPreference()) {
        const theme = systemThemeFromEvent(e);
        applyTheme(theme);
        callback?.(theme);
      }
    });
}
