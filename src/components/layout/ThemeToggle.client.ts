import { toggleTheme, getCurrentTheme } from "../../scripts/theme";
import { triggerHaptic } from "../../haptics-instance";
import { SWITCH } from "../../haptics";

const windowWithThemeToggle = window as Window & {
  __themeToggleInit?: boolean;
};

const animateIcon = (icon: Element) => {
  if (!(icon instanceof HTMLElement)) return;
  icon.animate(
    [
      { opacity: 0, transform: "scale(0.8)" },
      { opacity: 1, transform: "scale(1)" },
    ],
    {
      duration: 200,
      easing: "cubic-bezier(0.16, 1, 0.3, 1)",
    },
  );
};

function isThemeMutation(mutation: MutationRecord): boolean {
  return (
    mutation.type === "attributes" && mutation.attributeName === "data-theme"
  );
}

function currentThemeIcon(): Element | null {
  const selector = getCurrentTheme() === "light" ? ".icon-sun" : ".icon-moon";
  return document.querySelector(selector);
}

function animateThemeIcon(mutations: MutationRecord[]): void {
  if (!mutations.some(isThemeMutation)) return;
  const icon = currentThemeIcon();
  if (icon) animateIcon(icon);
}

function observeThemeChanges(): void {
  const observer = new MutationObserver(animateThemeIcon);
  observer.observe(document.documentElement, { attributes: true });
}

function themeToggleButton(event: MouseEvent): HTMLElement | null {
  return (event.target as HTMLElement | null)?.closest("#theme-toggle") ?? null;
}

function setViewTransitionOrigin(button: HTMLElement): void {
  const rect = button.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;
  document.documentElement.style.setProperty("--vt-x", `${x}px`);
  document.documentElement.style.setProperty("--vt-y", `${y}px`);
}

function handleThemeToggleClick(event: MouseEvent): void {
  const button = themeToggleButton(event);
  if (!button) return;
  setViewTransitionOrigin(button);
  toggleTheme();
  triggerHaptic(SWITCH);
}

function initThemeToggle(): void {
  if (windowWithThemeToggle.__themeToggleInit) return;
  windowWithThemeToggle.__themeToggleInit = true;
  observeThemeChanges();
  document.addEventListener("click", handleThemeToggleClick);
}

initThemeToggle();
