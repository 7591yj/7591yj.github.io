const THEME_KEY = "theme";

export type Theme = "light" | "dark";
export type ThemePreference = Theme | "system";

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

function applyTheme(theme: Theme): void {
  if (!document.startViewTransition) {
    document.documentElement.setAttribute("data-theme", theme);
    return;
  }
  document.startViewTransition(() => {
    document.documentElement.setAttribute("data-theme", theme);
  });
}

export function initTheme(): void {
  const stored = getStoredTheme();
  const theme = stored === "system" || !stored ? getSystemPreference() : stored;
  applyTheme(theme);
}

export function setTheme(preference: ThemePreference): void {
  if (preference === "system") {
    localStorage.removeItem(THEME_KEY);
    applyTheme(getSystemPreference());
  } else {
    localStorage.setItem(THEME_KEY, preference);
    applyTheme(preference);
  }
}

export function getThemePreference(): ThemePreference {
  return getStoredTheme() || "system";
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

// System preference change listener
export function watchSystemPreference(callback?: (theme: Theme) => void): void {
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", (e: MediaQueryListEvent) => {
      if (!getStoredTheme() || getStoredTheme() === "system") {
        const theme = e.matches ? "dark" : "light";
        applyTheme(theme);
        callback?.(theme);
      }
    });
}
