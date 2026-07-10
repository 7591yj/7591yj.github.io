import { initTheme, watchSystemPreference } from "./theme";
import "./scramble-text.ts";

let scrollAnimateModule: Promise<unknown> | null = null;
let headerScrollModule: Promise<unknown> | null = null;

function hasSelector(selector: string): boolean {
  return document.querySelector(selector) !== null;
}

function loadScrollAnimations(): void {
  if (!hasSelector("[data-animate]")) return;
  scrollAnimateModule ??= import("./scroll-animate.ts");
}

function loadHeaderScroll(): void {
  if (!hasSelector("[data-transparent-header]")) return;
  headerScrollModule ??= import("./header-scroll.ts");
}

function loadPageScripts() {
  loadScrollAnimations();
  loadHeaderScroll();
}

watchSystemPreference();
loadPageScripts();
document.addEventListener("astro:page-load", loadPageScripts);
document.addEventListener("astro:page-load", initTheme);
