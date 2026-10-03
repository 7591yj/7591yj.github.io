import { triggerHaptic } from "../../haptics-instance";
import { CONFIRM, KEYPRESS, PING, TICK } from "../../haptics";

const GLYPHS = ["英", "日", "한", "あ", "文", "가", "ア", "語", "字", "글"];
const EDGE = 16;
const LEAVE_GRACE = 400;
const reducedMotion = () =>
  matchMedia("(prefers-reduced-motion: reduce)").matches;

function mount(root: HTMLElement) {
  const menu = root.querySelector<HTMLElement>(".shell-lang__menu")!;
  const dot = root.querySelector<HTMLElement>(".shell-lang__dot")!;
  const options = [
    ...root.querySelectorAll<HTMLElement>(".shell-lang__option"),
  ];
  const current = options.findIndex((option) =>
    option.hasAttribute("aria-current"),
  );
  const available = (i: number) =>
    !options[i].hasAttribute("aria-disabled") && i !== current;

  let open = false;
  let target = current;
  let press: {
    id: number;
    x: number;
    wasOpen: boolean;
    moved: boolean;
  } | null = null;
  let closeTimer = 0;
  let committing = false;
  let prefetched = false;

  root.classList.add("is-ready");

  const setTarget = (next: number, silent = false) => {
    if (next === target) return;
    root.dataset.dir = next > target ? "right" : "left";
    options[target].classList.remove("is-target");
    options[next].classList.add("is-target");
    dot.classList.toggle(
      "is-void",
      options[next].hasAttribute("aria-disabled"),
    );
    root.style.setProperty("--at", String(next));
    target = next;
    if (!silent) triggerHaptic(TICK);
  };

  const prefetch = () => {
    if (prefetched) return;
    prefetched = true;
    for (const option of options) {
      if (!(option instanceof HTMLAnchorElement) || option.ariaCurrent)
        continue;
      const link = document.createElement("link");
      link.rel = "prefetch";
      link.href = option.href;
      document.head.append(link);
    }
  };

  const show = (input: "touch" | "fine") => {
    window.clearTimeout(closeTimer);
    if (open || committing) return;
    open = true;
    root.dataset.input = input;
    // The clip leaves the CSS layout box measurable while closed.
    root.style.removeProperty("--shift");
    const overflow = menu.getBoundingClientRect().right - (innerWidth - EDGE);
    if (overflow > 0) root.style.setProperty("--shift", `${overflow}px`);
    root.classList.add("is-open");
    prefetch();
  };

  const hide = () => {
    window.clearTimeout(closeTimer);
    if (!open) return;
    open = false;
    root.classList.remove("is-open", "is-pressed", "is-dragging");
    setTarget(current, true);
  };

  const indexAt = (x: number) => {
    const box = menu.getBoundingClientRect();
    const cell = box.width / options.length;
    return Math.min(
      options.length - 1,
      Math.max(0, Math.floor((x - box.left) / cell)),
    );
  };

  const within = ({ clientX, clientY }: PointerEvent) => {
    const box = menu.getBoundingClientRect();
    return (
      clientX >= box.left &&
      clientX <= box.right &&
      clientY >= box.top &&
      clientY <= box.bottom
    );
  };

  const pullAt = (x: number) => {
    const box = menu.getBoundingClientRect();
    const past = x < box.left ? x - box.left : Math.max(0, x - box.right);
    root.style.setProperty("--pull", `${8 * Math.tanh(past / 40)}px`);
  };

  const refuse = () => {
    const option = options[target];
    triggerHaptic(KEYPRESS);
    option.animate(
      [
        { translate: "0" },
        { translate: "-3px" },
        { translate: "3px" },
        { translate: "-2px" },
        { translate: "0" },
      ],
      { duration: 320, easing: "ease-out" },
    );
    setTarget(current, true);
  };

  const spin = (from: HTMLElement, to: string) => {
    const cells = [from.textContent?.trim() ?? ""];
    while (cells.length < 6) {
      const glyph = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      if (glyph !== cells[cells.length - 1]) cells.push(glyph);
    }
    cells.push(to);
    const strip = document.createElement("span");
    strip.className = "shell-lang__reel";
    strip.setAttribute("aria-hidden", "true");
    strip.replaceChildren(
      ...cells.map((glyph) => {
        const cell = document.createElement("span");
        cell.textContent = glyph;
        return cell;
      }),
    );
    from.replaceChildren(strip);
    const step = from.getBoundingClientRect().height;
    return strip.animate(
      [
        { transform: "translateY(0)" },
        { transform: `translateY(${-(cells.length - 1) * step}px)` },
      ],
      {
        duration: 620,
        easing: "cubic-bezier(0.25, 0.9, 0.35, 1.18)",
        fill: "forwards",
      },
    ).finished;
  };

  const commit = async (i: number) => {
    const option = options[i];
    if (!(option instanceof HTMLAnchorElement) || committing) return;
    triggerHaptic(CONFIRM);
    if (reducedMotion()) return location.assign(option.href);
    committing = true;
    open = false;
    root.classList.remove("is-open", "is-pressed", "is-dragging");
    await spin(options[current], option.textContent?.trim() ?? "");
    location.assign(option.href);
  };

  menu.addEventListener("pointerdown", (event) => {
    if (committing || press || event.button !== 0) return;
    event.preventDefault();
    if (event.pointerType === "mouse") menu.setPointerCapture(event.pointerId);
    const wasOpen = open;
    if (!wasOpen) {
      const mouse = event.pointerType === "mouse";
      show(mouse ? "fine" : "touch");
      if (!mouse) triggerHaptic(PING);
    }
    press = { id: event.pointerId, x: event.clientX, wasOpen, moved: false };
    root.classList.add("is-pressed");
    setTarget(indexAt(event.clientX), !wasOpen);
  });

  menu.addEventListener("pointermove", (event) => {
    if (committing || !press || event.pointerId !== press.id) return;
    if (!press.moved && Math.abs(event.clientX - press.x) > 6) {
      press.moved = true;
      root.classList.add("is-dragging");
    }
    setTarget(indexAt(event.clientX));
    pullAt(event.clientX);
  });

  const release = (event: PointerEvent) => {
    if (!press || event.pointerId !== press.id) return;
    const { wasOpen, moved } = press;
    press = null;
    root.classList.remove("is-pressed", "is-dragging");
    root.style.setProperty("--pull", "0px");
    if (event.type === "pointercancel") return hide();
    if (event.pointerType === "mouse" && !within(event))
      setTarget(current, true);

    if (target !== current) {
      if (available(target)) void commit(target);
      else refuse();
      return;
    }
    if (moved || wasOpen) hide();
  };
  menu.addEventListener("pointerup", release);
  menu.addEventListener("pointercancel", release);

  // Pointer release commits; clicks handle keyboard input only.
  menu.addEventListener("click", (event) => {
    event.preventDefault();
    if (event.detail !== 0) return;
    const i = options.indexOf(event.target as HTMLElement);
    if (i >= 0 && available(i)) void commit(i);
  });

  root.addEventListener("pointerenter", (event) => {
    if (event.pointerType === "mouse") window.clearTimeout(closeTimer);
  });
  root.addEventListener("pointerleave", (event) => {
    if (event.pointerType !== "mouse" || press || !open) return;
    closeTimer = window.setTimeout(hide, LEAVE_GRACE);
  });

  root.addEventListener("focusin", (event) => {
    show("fine");
    const i = options.indexOf(event.target as HTMLElement);
    if (i >= 0) setTarget(i, true);
  });
  root.addEventListener("focusout", (event) => {
    if (!root.contains(event.relatedTarget as Node | null)) hide();
  });
  root.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && open) {
      hide();
      (document.activeElement as HTMLElement | null)?.blur();
      return;
    }
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    const links = options.filter((option) => option.tabIndex >= 0);
    const at = links.indexOf(document.activeElement as HTMLElement);
    const step = event.key === "ArrowRight" ? 1 : -1;
    links[(at + step + links.length) % links.length]?.focus();
    event.preventDefault();
  });

  document.addEventListener("pointerdown", (event) => {
    if (open && !root.contains(event.target as Node)) hide();
  });

  window.addEventListener("pageshow", (event) => {
    if (!event.persisted || !committing) return;
    committing = false;
    setTarget(current, true);
    const code = options[current];
    code.replaceChildren(code.lang.toUpperCase());
  });
}

document
  .querySelectorAll<HTMLElement>("[data-lang-switch]")
  .forEach((root) => mount(root));
