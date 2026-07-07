import { triggerHaptic } from "../../haptics-instance";
import { KEYPRESS } from "../../haptics";

const windowWithButtonHaptics = window as Window & {
  __buttonHapticsInit?: boolean;
};

if (!windowWithButtonHaptics.__buttonHapticsInit) {
  windowWithButtonHaptics.__buttonHapticsInit = true;

  document.addEventListener("click", (event) => {
    const target = (event.target as HTMLElement | null)?.closest(
      "[data-haptic='nudge']",
    );
    if (!target) return;
    triggerHaptic(KEYPRESS);
  });
}
