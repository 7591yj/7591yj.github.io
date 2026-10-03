// Media queries miss mice added to touch-first devices.
let mouse = matchMedia("(pointer: fine) and (hover: hover)").matches;
const listeners = new Set<(mouse: boolean) => void>();

function track(event: PointerEvent) {
  const next = event.pointerType === "mouse";
  if (next === mouse) return;
  mouse = next;
  for (const fn of listeners) fn(next);
}

// Update input mode before page pointer handlers run.
for (const type of ["pointerdown", "pointermove"] as const)
  window.addEventListener(type, track, { capture: true, passive: true });

export const usingMouse = () => mouse;

export function onPointerChange(fn: (mouse: boolean) => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function whenMouse(fn: () => void) {
  if (mouse) return fn();
  const off = onPointerChange((next) => {
    if (!next) return;
    off();
    fn();
  });
}
