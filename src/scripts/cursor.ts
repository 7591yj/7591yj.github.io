import { onPointerChange, usingMouse } from "./pointer";

// field.ts can override the shared cursor through aimWith().

export type CursorState =
  "hidden" | "idle" | "target" | "disabled" | "open" | "drag" | "peek";

export interface Aim {
  state: CursorState;
  label?: string;
}

type Resolver = (el: Element | null) => Aim | null | undefined;

const POS_KEY = "cursor-pos";
const HEADING = ".prose :is(h3, h4, h5)[id]";
const CONTROL = `a[href], button, [role='button'], [role='tab'], summary, label[for], select, ${HEADING}`;
const DISABLED = ":disabled, [aria-disabled='true'], [aria-disabled='']";
const TEXT = "input, textarea, [contenteditable]";
const FRAMED = ".shell-top, .shell-dock";
const LOGO = ".shell-logo";

const resolvers: Resolver[] = [];
let el: HTMLElement | null = null;
let label: HTMLElement | null = null;
let x = -1;
let y = -1;
let labelWidth = 0;

export function aimWith(fn: Resolver) {
  resolvers.push(fn);
  refreshCursor();
}

export function refreshCursor() {
  if (!el || !usingMouse() || x < 0 || el.dataset.state === "hidden") return;
  aim(document.elementFromPoint(x, y));
}

function set({ state, label: text }: Aim) {
  if (!el || !label) return;
  if (state !== "hidden" && !usingMouse()) return;
  el.dataset.state = state;
  if (text === undefined || label.textContent === text) return;
  label.textContent = text;
  label.hidden = !text;
  labelWidth = label.offsetWidth;
  flip();
}

function flip() {
  el!.classList.toggle("is-flip-x", x + labelWidth + 24 > innerWidth);
  el!.classList.toggle("is-flip-y", y + 48 > innerHeight);
}

function nameOf(control: Element) {
  if (control.matches(HEADING)) return "#";
  const hint =
    (control as HTMLElement).dataset.cursorLabel ??
    control.getAttribute("title");
  if (hint) return hint;
  if (control.matches("a[href]")) return null;
  const text = control.textContent?.replace(/\s+/g, " ").trim() ?? "";
  return control.getAttribute("aria-label") ?? (text.length <= 24 ? text : "");
}

function aim(target: Element | null) {
  set(claim(target) ?? pageAim(target));
}

function claim(target: Element | null) {
  for (const fn of resolvers) {
    const claimed = fn(target);
    if (claimed) return claimed;
  }
  return null;
}

function pageAim(target: Element | null): Aim {
  if (target?.closest(`${TEXT}, ${LOGO}`)) return { state: "hidden" };
  const control = target?.closest(FRAMED) ? null : target?.closest(CONTROL);
  return control ? controlAim(control) : { state: "idle" };
}

function controlAim(control: Element): Aim {
  const name = nameOf(control);
  if (control.matches(DISABLED))
    return { state: "disabled", label: name ?? "" };
  return namedAim(name);
}

function namedAim(name: string | null): Aim {
  if (name === null) return { state: "open", label: el!.dataset.openLabel };
  return name ? { state: "peek", label: name } : { state: "target" };
}

function place() {
  el!.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  flip();
}

function init() {
  el = document.querySelector<HTMLElement>("[data-shell-cursor]");
  label = el?.querySelector<HTMLElement>("[data-shell-cursor-label]") ?? null;
  // Ignore field.ts detail probes.
  if (!el || window !== window.top) return;
  listen();
  restore();
}

function listen() {
  const sync = () =>
    document.documentElement.classList.toggle("has-cursor", usingMouse());
  sync();

  const follow = (event: PointerEvent) => {
    if (event.pointerType !== "mouse") return;
    x = event.clientX;
    y = event.clientY;
    place();
    aim(event.target instanceof Element ? event.target : null);
  };
  window.addEventListener("pointermove", follow, { passive: true });
  // Re-aim after other pointer handlers update their state.
  for (const type of ["pointerdown", "pointerup"] as const)
    window.addEventListener(type, (event) => {
      follow(event);
      queueMicrotask(refreshCursor);
    });
  window.addEventListener("scroll", refreshCursor, { passive: true });

  const hide = () => set({ state: "hidden" });
  window.addEventListener("pointerout", (event) => {
    if (!event.relatedTarget) hide();
  });
  onPointerChange((mouse) => {
    sync();
    if (!mouse) hide();
  });

  const save = () => {
    if (x >= 0) sessionStorage.setItem(POS_KEY, JSON.stringify({ x, y }));
  };
  window.addEventListener("pagehide", save);
  window.addEventListener("pageswap", save);
}

function restore() {
  const pos = savedPos();
  if (!usingMouse() || typeof pos?.x !== "number") return;
  x = pos.x;
  y = pos.y;
  place();
  aim(document.elementFromPoint(x, y));
}

function savedPos(): { x: number; y: number } | null {
  try {
    const raw = sessionStorage.getItem(POS_KEY);
    sessionStorage.removeItem(POS_KEY);
    return JSON.parse(raw ?? "null");
  } catch {
    return null;
  }
}

init();
