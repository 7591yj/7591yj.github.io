import { triggerHaptic } from "../../../haptics-instance";
import { BOOT } from "../../../haptics";

const HEADER_MENU_OPEN_CLASS = "header--menu-open";

const windowWithHeaderInit = window as Window & {
  __headerInit?: boolean;
};

function headerElement() {
  return document.querySelector(".header");
}

function hamburgerElement() {
  return document.querySelector(".hamburger");
}

function mobileMenuElement() {
  return document.querySelector(".mobile-menu");
}

function closeMenu() {
  const header = headerElement();
  const hamburger = hamburgerElement();
  const mobileMenu = mobileMenuElement();
  if (!header || !hamburger || !mobileMenu) return;
  hamburger.setAttribute("aria-expanded", "false");
  mobileMenu.classList.remove("open");
  header.classList.remove(HEADER_MENU_OPEN_CLASS);
}

function closeLanguageDropdown() {
  document
    .querySelector(".lang-select .lang-dropdown")
    ?.classList.remove("open");
  document
    .querySelector(".lang-select .lang-icon")
    ?.classList.remove("flipped");
}

function toggleMobileMenu(hamburger: HTMLElement) {
  const header = headerElement();
  const mobileMenu = mobileMenuElement();
  if (!header || !mobileMenu) return;

  const expanded = hamburger.getAttribute("aria-expanded") === "true";
  closeLanguageDropdown();
  hamburger.setAttribute("aria-expanded", String(!expanded));
  mobileMenu.classList.toggle("open");
  header.classList.toggle(HEADER_MENU_OPEN_CLASS);
  triggerHaptic(BOOT);
}

function eventTarget(event: MouseEvent): HTMLElement | null {
  return event.target instanceof HTMLElement ? event.target : null;
}

function handleHeaderClick(event: MouseEvent) {
  const target = eventTarget(event);
  const hamburger = target?.closest(".hamburger") as HTMLElement | null;
  if (hamburger) {
    toggleMobileMenu(hamburger);
    return;
  }

  if (target?.closest(".mobile-menu__link")) closeMenu();
}

function closeMenuOnDesktop() {
  if (window.innerWidth > 768) closeMenu();
}

function initHeader() {
  if (windowWithHeaderInit.__headerInit) return;
  windowWithHeaderInit.__headerInit = true;
  document.addEventListener("click", handleHeaderClick);
  window.addEventListener("resize", closeMenuOnDesktop);
}

// Close the menu before the DOM is captured for the view transition
document.addEventListener("astro:before-swap", closeMenu);
initHeader();
