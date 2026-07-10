import { triggerHaptic } from "../../../haptics-instance";
import { PING, CONFIRM } from "../../../haptics";

const windowWithLangSelect = window as Window & {
  __langSelectInit?: boolean;
};

export function initLangSelect() {
  if (windowWithLangSelect.__langSelectInit) return;
  windowWithLangSelect.__langSelectInit = true;

  // triggered by HTMLElement.click(); WebHaptics' internal label.click()
  // calls are completely invisible to this handler
  document.addEventListener("pointerdown", (event) => {
    if (!(event.target as HTMLElement).closest(".lang-select")) {
      document.getElementById("lang-dropdown")?.classList.remove("open");
      document
        .getElementById("lang-toggle")
        ?.querySelector(".lang-icon")
        ?.classList.remove("flipped");
    }
  });

  document.addEventListener("click", (event) => {
    const toggle = (event.target as HTMLElement | null)?.closest(
      "#lang-toggle",
    ) as HTMLElement | null;
    if (toggle) {
      const dropdown = document.getElementById("lang-dropdown");
      dropdown?.classList.toggle("open");
      toggle.querySelector(".lang-icon")?.classList.toggle("flipped");
      triggerHaptic(PING);
      return;
    }

    const option = (event.target as HTMLElement | null)?.closest(
      ".lang-option",
    );
    if (option) {
      triggerHaptic(CONFIRM);
    }
  });
}
