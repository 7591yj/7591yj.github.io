import { initTheme, watchSystemPreference } from "../theme";
import { onPointerChange } from "../pointer";

watchSystemPreference();
initTheme();

const clock = document.querySelector<HTMLTimeElement>("[data-shell-clock]");
if (clock) {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Tokyo",
    hour: "2-digit",
    minute: "2-digit",
  });
  const tick = () => (clock.textContent = fmt.format(new Date()));
  tick();
  window.setInterval(tick, 15_000);
}

if (document.querySelector("[data-reveal], [data-split]")) {
  void import("./reveal.ts");
}

void import("./logo.ts");

const targetFrame = document.querySelector<HTMLElement>("[data-shell-target]");
if (targetFrame) {
  let hovered: HTMLElement | null = null;

  const placeFrame = (control: HTMLElement) => {
    const rect = control.getBoundingClientRect();
    const radius =
      parseFloat(getComputedStyle(control).borderTopLeftRadius) || 0;
    const pad = radius >= rect.height / 2 ? 0 : 6;
    targetFrame.style.left = `${rect.left - pad}px`;
    targetFrame.style.top = `${rect.top - pad}px`;
    targetFrame.style.width = `${rect.width + pad * 2}px`;
    targetFrame.style.height = `${rect.height + pad * 2}px`;
    targetFrame.style.borderRadius = `${radius >= rect.height / 2 ? rect.height : Math.max(radius, 6)}px`;
  };

  document.addEventListener("pointermove", (event) => {
    if (event.pointerType !== "mouse") return;
    const element = event.target instanceof Element ? event.target : null;
    const control =
      element?.closest<HTMLElement>("a, button, [role='button']") ?? null;
    const next =
      control?.closest(".shell-top, .shell-dock") &&
      !control.matches(".shell-logo")
        ? control
        : null;
    if (next === hovered) return;
    hovered = next;
    targetFrame.classList.remove("is-visible");
    if (next) {
      placeFrame(next);
      void targetFrame.offsetWidth;
      targetFrame.classList.add("is-visible");
    }
  });

  const hideFrame = () => {
    hovered = null;
    targetFrame.classList.remove("is-visible");
  };
  window.addEventListener("pointerout", (event) => {
    if (!event.relatedTarget) hideFrame();
  });
  window.addEventListener("blur", hideFrame);
  onPointerChange((mouse) => {
    if (!mouse) hideFrame();
  });
  window.addEventListener(
    "scroll",
    () => {
      if (hovered) placeFrame(hovered);
    },
    { passive: true },
  );
  window.addEventListener("resize", () => {
    if (hovered) placeFrame(hovered);
  });
}
