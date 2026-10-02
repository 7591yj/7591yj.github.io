import { gsap, onScreen } from "./motion/core";
import { onPointerChange, usingMouse } from "./pointer";
import { aimWith, refreshCursor } from "./cursor";
import { triggerHaptic } from "../haptics-instance";
import { TICK } from "../haptics";

type View = "field" | "list";

const CAM_KEY = "field-cam";
const VIEW_KEY = "field-view";

const TILT = 56;
const YAW = -38;
const OPEN = 3.2;
const DRAG_PER_LAYER = 90;
const ORBIT_RATIO = 1.5;
const DENSE_STEP = 24;
// Matches .stack-scene in field.css.
const PERSPECTIVE = 1800;
// Below this tile size the edge tags overrun the plates.
const CRAMPED = 110;
const SCRAMBLE = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789/#*+<>";
// Matches the short landscape query in field.css.
const SHORT = matchMedia(
  "(max-width: 899px) and (max-height: 540px) and (orientation: landscape)",
);

const root = document.querySelector<HTMLElement>("[data-field]");
if (root) initField(root);

function initField(root: HTMLElement) {
  const stage = root.querySelector<HTMLElement>("[data-field-stage]")!;
  const stack = root.querySelector<HTMLElement>("[data-stack]")!;
  const layers = [...root.querySelectorAll<HTMLAnchorElement>("[data-layer]")];
  const rows = [...root.querySelectorAll<HTMLElement>("[data-layer-row]")];
  const cards = [...root.querySelectorAll<HTMLElement>("[data-card]")];
  const scrub = root.querySelector<HTMLElement>("[data-stack-scrub]")!;
  const segments = [...scrub.querySelectorAll<HTMLElement>("[data-scrub]")];
  const info = root.querySelector<HTMLElement>("[data-stack-info]")!;
  const leader = root.querySelector<SVGSVGElement>("[data-stack-leader]")!;
  const leaderPath = leader.querySelector<SVGPathElement>(
    "[data-stack-leader-path]",
  )!;
  const leaderStart = leader.querySelector<SVGCircleElement>(
    "[data-stack-leader-start]",
  )!;
  const index = root.querySelector<HTMLElement>("[data-field-index]")!;
  const preview = root.querySelector<HTMLElement>("[data-field-preview]")!;
  const openLabel = root.dataset.openLabel!;
  const dragLabel = root.dataset.dragLabel!;
  const coords = document.querySelector<HTMLElement>("[data-field-coords]");

  const n = layers.length;
  const last = n - 1;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const clamp = (v: number, lo: number, hi: number) =>
    Math.min(hi, Math.max(lo, v));
  const smooth = (a: number, b: number, x: number) => {
    const t = clamp((x - a) / (b - a), 0, 1);
    return t * t * (3 - 2 * t);
  };

  const cam = {
    pos: 0,
    yaw: YAW,
    tilt: TILT,
    flat: 0,
    lift: 0,
    ox: 0,
    oy: 0,
    zoom: 1,
  };
  let tPos = 0;
  let tYaw = YAW;
  const tTilt = TILT;
  let parallaxX = 0;
  let parallaxY = 0;
  const drop = layers.map(() => 0);
  const scatter = layers.map(() => 0);
  let authored = false;
  let leaving = false;
  let swapping = false;
  let dirty = true;
  // Draw the leader after render() has moved the layers.
  let leaderStale = false;

  const saved = readCam();
  if (saved) {
    cam.pos = tPos = clamp(saved.pos, 0, last);
    cam.yaw = tYaw = saved.yaw;
  }

  let size = 0;
  let gap = 0;
  let narrow = false;

  function measure() {
    const vw = stage.clientWidth;
    const vh = stage.clientHeight;
    narrow = vw < 900;
    if (narrow) {
      const top =
        document.querySelector(".shell-top")?.getBoundingClientRect().bottom ??
        0;
      // field.css places the card beside the stack in short landscape.
      const bottom = SHORT.matches
        ? (document.querySelector(".shell-dock")?.getBoundingClientRect().top ??
          vh)
        : info.getBoundingClientRect().top;
      const band = Math.max(bottom - top - 24, 0);
      const span = SHORT.matches ? info.getBoundingClientRect().left : vw;
      size = Math.min(span * 0.6, band / 1.45, 320);
      root.style.setProperty("--sy", `${((top + bottom) / 2).toFixed(1)}px`);
    } else {
      size = clamp(Math.min(vw * 0.28, vh * 0.44), 220, 420);
      root.style.removeProperty("--sy");
    }
    gap = size * 0.16;
    root.classList.toggle("is-cramped", size < CRAMPED);
    root.style.setProperty("--layer", `${size.toFixed(1)}px`);
    dirty = true;
  }

  let active = -1;
  let lastReadout = "";

  function render() {
    const still = 1 - cam.flat;
    const tilt = cam.tilt * still + parallaxY * still;
    const yaw = cam.yaw + parallaxX * still;
    const recenter =
      narrow && last ? size * 0.33 * (cam.pos / last - 0.5) * 2 : 0;
    let cx = 0;
    let cy = 0;
    if (narrow) {
      const s = size * 0.08 * still;
      const yr = (yaw * Math.PI) / 180;
      const tr = (tilt * Math.PI) / 180;
      const f = PERSPECTIVE / (PERSPECTIVE - s * Math.sin(yr) * Math.sin(tr));
      cx = -s * Math.cos(yr) * f;
      cy = -s * Math.sin(yr) * Math.cos(tr) * f;
    }
    const ox = cam.ox + cx;
    const oy = cam.oy + recenter * still + cy;
    stack.style.transform =
      `translate(${ox.toFixed(1)}px, ${oy.toFixed(1)}px) ` +
      `rotateX(${tilt.toFixed(3)}deg) rotateZ(${yaw.toFixed(3)}deg)`;

    for (let i = 0; i < n; i++) {
      const d = cam.pos - i;
      const above = smooth(0.15, 0.85, d);
      const near = Math.max(0, 1 - Math.abs(d));
      let z = d * gap + gap * OPEN * above;
      z += drop[i] * 900;
      z += scatter[i] * (d > 0 ? 1 : -1) * 900;
      if (i === active) z += cam.lift * size * 0.7;

      let opacity = 1 - 0.78 * above;
      opacity *= 1 - clamp((-d - 2.5) / 2, 0, 0.6);
      opacity *= 1 - clamp((d - 1.5) / 2, 0, 0.8);
      opacity *= 1 - drop[i];
      opacity *= 1 - scatter[i];

      const slide = near * size * 0.08 * still;
      let scale = 0.94 + near * 0.06;
      if (i === active) scale *= cam.zoom;

      const el = layers[i];
      el.style.transform =
        `translate3d(${slide.toFixed(1)}px, 0, ${z.toFixed(1)}px) ` +
        `scale(${scale.toFixed(4)})`;
      el.style.opacity = opacity.toFixed(3);
      el.style.pointerEvents = above > 0.5 ? "none" : "";
    }

    const next = Math.round(clamp(cam.pos, 0, last));
    if (next !== active) {
      setActive(next);
      probeDetail(next);
    }

    leaderStale = true;

    if (coords) {
      const deg = Math.round(((cam.yaw % 360) + 360) % 360);
      const text = `L${pad(active + 1)}/${pad(n)} · ${String(deg).padStart(3, "0")}°`;
      if (text !== lastReadout) coords.textContent = lastReadout = text;
    }
  }

  function setActive(next: number) {
    const prev = active;
    active = next;
    layers.forEach((el, i) => el.classList.toggle("is-active", i === next));
    rows.forEach((el, i) => el.classList.toggle("is-active", i === next));
    cards.forEach((el, i) => el.classList.toggle("is-active", i === next));
    segments.forEach((el, i) => el.classList.toggle("is-active", i === next));
    if (prev !== -1 && !reduced) {
      const title = cards[next].querySelector<HTMLElement>("[data-scramble]");
      if (title) scramble(title);
    }
  }

  let probe: HTMLIFrameElement | null = null;
  let probeTimer = 0;

  function dropProbe() {
    probe?.remove();
    probe = null;
  }

  // Defer the detail-page probe until the intro and input settle.
  function probeDetail(i: number) {
    window.clearTimeout(probeTimer);
    probeTimer = window.setTimeout(() => {
      if (authored) return probeDetail(i);
      if ("requestIdleCallback" in window)
        requestIdleCallback(() => loadProbe(i), { timeout: 2000 });
      else loadProbe(i);
    }, 350);
  }

  function loadProbe(i: number) {
    const layer = layers[i];
    if (i !== active || leaving || readSpots(layer)) return;
    dropProbe();
    const frame = document.createElement("iframe");
    frame.setAttribute("aria-hidden", "true");
    frame.tabIndex = -1;
    frame.style.cssText =
      `position:fixed;left:0;top:0;width:${innerWidth}px;` +
      `height:${innerHeight}px;border:0;visibility:hidden;` +
      "pointer-events:none;z-index:-1";
    frame.src = layer.href;
    probe = frame;
    document.body.append(frame);
    window.setTimeout(() => probe === frame && dropProbe(), 8000);
  }

  window.addEventListener("storage", (event) => {
    if (probe && event.key?.startsWith("hero:")) dropProbe();
  });

  function drawLeader() {
    const show =
      !narrow && !leaving && !swapping && active >= 0 && drop[active] < 0.05;
    leader.classList.toggle("is-visible", show);
    if (!show) return;
    let sx = -Infinity;
    let sy = 0;
    for (const h of layers[active].querySelectorAll(".layer-handle")) {
      const r = h.getBoundingClientRect();
      if (r.left + r.width / 2 > sx) {
        sx = r.left + r.width / 2;
        sy = r.top + r.height / 2;
      }
    }
    const card = cards[active].getBoundingClientRect();
    const ex = card.left - 16;
    const ey = card.top + 8;
    const knee = Math.min(ex - 8, Math.max(ex - 40, sx + 16));
    leaderPath.setAttribute(
      "d",
      `M${sx.toFixed(1)} ${sy.toFixed(1)} L${knee.toFixed(1)} ${ey.toFixed(1)} L${ex.toFixed(1)} ${ey.toFixed(1)}`,
    );
    leaderStart.setAttribute("cx", sx.toFixed(1));
    leaderStart.setAttribute("cy", sy.toFixed(1));
  }

  const scrambles = new WeakMap<HTMLElement, number>();
  function scramble(el: HTMLElement) {
    const text = el.dataset.scramble ?? "";
    cancelAnimationFrame(scrambles.get(el) ?? 0);
    const t0 = performance.now();
    const dur = 420;
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / dur);
      const fixed = Math.floor(k * text.length);
      let out = text.slice(0, fixed);
      for (let i = fixed; i < text.length; i++)
        out +=
          text[i] === " "
            ? " "
            : SCRAMBLE[Math.floor(Math.random() * SCRAMBLE.length)];
      el.textContent = out;
      if (k < 1) scrambles.set(el, requestAnimationFrame(step));
    };
    scrambles.set(el, requestAnimationFrame(step));
  }

  let dragging = false;
  let dragSlop = 10;
  let startX = 0;
  let startY = 0;
  let moved = false;
  let free = true;
  let axis: "x" | "y" | null = null;
  let lastX = 0;
  let lastY = 0;
  let vx = 0;
  let vy = 0;
  let suppressClick = false;

  const locked = () => leaving || swapping || root.dataset.view !== "field";

  function goTo(i: number) {
    tPos = clamp(i, 0, last);
    if (reduced) cam.pos = tPos;
    dirty = true;
  }

  function orbit(deg: number) {
    tYaw += deg;
    if (reduced) cam.yaw = tYaw;
    dirty = true;
  }

  stage.addEventListener("pointerdown", (event) => {
    if (event.button !== 0 || locked()) return;
    dragging = true;
    moved = false;
    startX = lastX = event.clientX;
    startY = lastY = event.clientY;
    free = event.pointerType === "mouse";
    dragSlop = free ? 10 : 16;
    axis = null;
    vx = vy = 0;
    root.classList.add("is-dragging");
    setHot(null);
  });

  window.addEventListener("pointermove", (event) => {
    if (!dragging) {
      if (usingMouse() && !locked()) {
        parallaxX = (event.clientX / innerWidth - 0.5) * 6;
        parallaxY = (event.clientY / innerHeight - 0.5) * -4;
        dirty = true;
      }
      return;
    }
    const dx = event.clientX - lastX;
    const dy = event.clientY - lastY;
    lastX = event.clientX;
    lastY = event.clientY;
    const ox = event.clientX - startX;
    const oy = event.clientY - startY;
    if (!moved && Math.hypot(ox, oy) > dragSlop) {
      moved = true;
      if (!free) axis = Math.abs(ox) > Math.abs(oy) * ORBIT_RATIO ? "x" : "y";
    }
    if (!moved) return;
    vx = axis === "y" ? 0 : free ? dx : -dx;
    vy = axis === "x" ? 0 : dy;
    orbit(vx * 0.3);
    tPos = clamp(tPos - vy / DRAG_PER_LAYER, -0.35, last + 0.35);
    dirty = true;
  });

  const release = () => {
    if (!dragging) return;
    dragging = false;
    root.classList.remove("is-dragging");
    if (moved) suppressClick = true;
    if (!reduced) orbit(vx * 4);
    goTo(Math.round(tPos - (reduced ? 0 : vy / 18)));
  };
  window.addEventListener("pointerup", release);
  window.addEventListener("pointercancel", release);
  // A previous drag must not swallow the next tap.
  window.addEventListener("pointerdown", () => (suppressClick = false), true);

  stage.addEventListener(
    "click",
    (event) => {
      if (suppressClick) {
        suppressClick = false;
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      const target = event.target as Element;
      const row = target.closest<HTMLElement>("[data-layer-row]");
      if (row) {
        return goTo(Number(row.dataset.layerRow));
      }
      const card = target.closest("[data-card]");
      if (card && slid) {
        slid = false;
        event.preventDefault();
        return;
      }
      const layer = target.closest<HTMLAnchorElement>("[data-layer]");
      if ((!layer && !card) || leaving) return;
      if (
        layer &&
        (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
      )
        return;
      event.preventDefault();
      const i = layer && usingMouse() ? Number(layer.dataset.layer) : active;
      if (i === active) dive(i);
      else goTo(i);
    },
    true,
  );
  stage.addEventListener("dragstart", (event) => event.preventDefault());

  const dense = scrub.classList.contains("is-dense");
  let scrubId = -1;
  let scrubY = 0;
  let scrubFrom = 0;
  let scrubbed = false;
  function jump(i: number) {
    i = clamp(i, 0, last);
    if (i === Math.round(tPos)) return;
    goTo(i);
    triggerHaptic(TICK);
  }
  function scrubTo(y: number) {
    const box = scrub.getBoundingClientRect();
    jump(Math.floor(((y - box.top) / box.height) * n));
  }
  scrub.addEventListener("pointerdown", (event) => {
    event.stopPropagation();
    if (event.button !== 0 || locked() || scrubId !== -1) return;
    scrubId = event.pointerId;
    scrubY = event.clientY;
    scrubFrom = Math.round(tPos);
    scrubbed = false;
    scrub.setPointerCapture(scrubId);
    scrub.classList.add("is-scrubbing");
    if (!dense) scrubTo(event.clientY);
  });
  scrub.addEventListener("pointermove", (event) => {
    if (event.pointerId !== scrubId || locked()) return;
    if (!dense) return scrubTo(event.clientY);
    const dy = event.clientY - scrubY;
    if (!scrubbed && Math.abs(dy) <= 8) return;
    scrubbed = true;
    jump(scrubFrom + Math.round(dy / DENSE_STEP));
  });
  const endScrub = (event: PointerEvent) => {
    if (event.pointerId !== scrubId) return;
    if (dense && !scrubbed && event.type === "pointerup" && !locked())
      scrubTo(event.clientY);
    scrubId = -1;
    scrub.classList.remove("is-scrubbing");
  };
  scrub.addEventListener("pointerup", endScrub);
  scrub.addEventListener("pointercancel", endScrub);
  scrub.addEventListener("lostpointercapture", endScrub);

  let slideId = -1;
  let slideX = 0;
  let slideY = 0;
  let slideFrom = 0;
  let slideAxis: "x" | "y" | null = null;
  let slid = false;
  info.addEventListener("pointerdown", (event) => {
    event.stopPropagation();
    if (event.button !== 0 || locked() || slideId !== -1) return;
    slideId = event.pointerId;
    slideX = event.clientX;
    slideY = event.clientY;
    slideFrom = Math.round(tPos);
    slideAxis = null;
    slid = false;
  });
  info.addEventListener("pointermove", (event) => {
    if (event.pointerId !== slideId || locked()) return;
    const ox = event.clientX - slideX;
    const oy = event.clientY - slideY;
    if (!slideAxis) {
      if (Math.hypot(ox, oy) <= 16) return;
      slideAxis = Math.abs(ox) > Math.abs(oy) ? "x" : "y";
      slid = true;
      if (slideAxis === "x") {
        info.setPointerCapture(slideId);
        scrub.classList.add("is-scrubbing");
      }
    }
    if (slideAxis !== "x") return;
    const step = Math.max(info.getBoundingClientRect().width / n, 24);
    jump(slideFrom + Math.round(ox / step));
  });
  const endSlide = (event: PointerEvent) => {
    if (event.pointerId !== slideId) return;
    slideId = -1;
    scrub.classList.remove("is-scrubbing");
  };
  info.addEventListener("pointerup", endSlide);
  info.addEventListener("pointercancel", endSlide);
  info.addEventListener("lostpointercapture", endSlide);

  let wheelAcc = 0;
  let wheelTimer = 0;
  stage.addEventListener(
    "wheel",
    (event) => {
      event.preventDefault();
      if (locked()) return;
      const scale = event.deltaMode === 1 ? 32 : 1;
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
        orbit(-event.deltaX * scale * 0.2);
        return;
      }
      wheelAcc += event.deltaY * scale;
      clearTimeout(wheelTimer);
      wheelTimer = window.setTimeout(() => (wheelAcc = 0), 160);
      if (Math.abs(wheelAcc) >= 60) {
        goTo(Math.round(tPos) + Math.sign(wheelAcc));
        wheelAcc = 0;
      }
    },
    { passive: false },
  );

  window.addEventListener("keydown", (event) => {
    if (locked()) return;
    const target = event.target as HTMLElement;
    if (target.closest?.("input, textarea, [contenteditable]")) return;
    if (event.key === "Enter" && target === document.body) return dive(active);
    const move = {
      ArrowUp: () => goTo(Math.round(tPos) - 1),
      ArrowDown: () => goTo(Math.round(tPos) + 1),
      ArrowLeft: () => orbit(-30),
      ArrowRight: () => orbit(30),
    }[event.key];
    if (!move) return;
    event.preventDefault();
    move();
  });

  let hot: HTMLElement | null = null;
  function setHot(next: HTMLElement | null) {
    if (next === hot) return;
    hot?.classList.remove("is-hot");
    hot = next;
    hot?.classList.add("is-hot");
  }

  stage.addEventListener("pointerover", (event) => {
    if (dragging || leaving || event.pointerType !== "mouse") return;
    const layer = (event.target as Element).closest<HTMLElement>(
      "[data-layer]",
    );
    setHot(layer && !layer.classList.contains("is-active") ? layer : null);
  });
  stage.addEventListener("pointerleave", () => {
    setHot(null);
    parallaxX = parallaxY = 0;
    dirty = true;
  });

  // cursor.ts asks the field for its cursor state first.
  aimWith((el) => {
    if (dragging) return { state: "drag", label: dragLabel };
    if (leaving || swapping) return { state: "idle" };
    if (el?.closest("[data-field-index] li a"))
      return { state: "open", label: openLabel };
    if (!el?.closest("[data-field-stage]")) return null;
    if (el.closest("[data-card].is-active"))
      return { state: "open", label: openLabel };
    if (el.closest("[data-stack-scrub]")) return { state: "target" };
    const layer = el.closest<HTMLElement>("[data-layer]");
    if (!layer) return { state: "idle" };
    if (layer.classList.contains("is-active"))
      return { state: "open", label: openLabel };
    const tag = layer.querySelector(".layer-tag")?.textContent ?? "";
    return { state: "peek", label: tag.replace(/\s+/g, " ").trim() };
  });

  function dive(i: number) {
    const layer = layers[i];
    if (!layer || leaving) return;
    leaving = true;
    authored = true;
    setHot(null);
    refreshCursor();
    writeCam(i, tYaw);

    const card = cards[i];
    const title = card.querySelector<HTMLElement>(".stack-card__title");
    const summary = card.querySelector<HTMLElement>(".stack-card__summary");
    const spots = readSpots(layer);

    const go = () => {
      if (spots && title && summary) {
        settleText([
          [title, spots.title],
          [summary, spots.sub],
        ]);
      } else {
        const plate = layer.querySelector<HTMLElement>(".tile-plate");
        if (plate) plate.style.viewTransitionName = "hero-plate";
        if (title) title.style.viewTransitionName = "hero-title";
        if (summary) summary.style.viewTransitionName = "hero-sub";
      }
      if (!reduced) sessionStorage.setItem("arrive", spots ? "exact" : "dive");
      window.location.href = layer.href;
    };

    if (reduced) return go();

    root.classList.add("is-leaving");
    const target = plateTarget(layer);
    document.documentElement.classList.add("field-leaving");
    const text = title && summary ? textTargets(layer, title, summary) : null;
    const zoom = target.size / (size * 0.62);
    const yaw = (((cam.yaw % 360) + 540) % 360) - 180;
    cam.yaw = yaw;

    const tl = gsap.timeline({
      onUpdate: () => void (dirty = true),
      onComplete: go,
    });
    tl.to(cam, { pos: i, duration: 0.3, ease: "power2.out" }, 0);
    layers.forEach((_, j) => {
      if (j === i) return;
      tl.to(
        scatter,
        { [j]: 1, duration: 0.6, ease: "power3.in" },
        Math.abs(j - i) * 0.05,
      );
    });
    tl.to(cam, { lift: 1, duration: 0.45, ease: "power3.out" }, 0)
      .to(
        cam,
        {
          yaw: yaw >= 0 ? 360 : -360,
          flat: 1,
          duration: 0.95,
          ease: "expo.inOut",
        },
        0.1,
      )
      .to(
        cam,
        {
          lift: 0,
          ox: target.x - stack.offsetLeft,
          oy: target.y - stack.offsetTop,
          zoom,
          duration: 0.8,
          ease: "expo.inOut",
        },
        0.4,
      );
    const photo = layer.querySelector<HTMLElement>(".tile-plate img");
    if (photo)
      tl.to(
        photo,
        { borderRadius: `${(6 / zoom).toFixed(3)}px`, duration: 0.8 },
        0.4,
      );
    if (text)
      for (const [el, to] of text)
        tl.to(el, { ...to, duration: 0.85, ease: "expo.inOut" }, 0.3);
  }

  function settleText(pairs: [HTMLElement, HeroSpot][]) {
    for (const [el, spot] of pairs) {
      gsap.set(el, { clearProps: "transform" });
      el.style.fontSize = `${spot.font}px`;
      el.style.width = `${spot.width}px`;
      el.style.maxWidth = "none";
    }
    for (const [el, spot] of pairs) {
      const r = el.getBoundingClientRect();
      gsap.set(el, { x: spot.x - r.left, y: spot.y - r.top });
    }
  }

  function textTargets(
    layer: HTMLAnchorElement,
    title: HTMLElement,
    summary: HTMLElement,
  ) {
    // Use detail.client.ts measurements, falling back to entry.css.
    const vw = innerWidth;
    let spots: Pick<HeroSpots, "title" | "sub"> | null = readSpots(layer);
    if (!spots) {
      const plate = plateTarget(layer);
      const gutter = clamp(vw * 0.03, 16, 40);
      const titleFont = clamp(vw * 0.054, 36, 80);
      const subFont = clamp(vw * 0.016, 18, 22);
      const lines = (el: HTMLElement) =>
        Math.max(
          1,
          Math.round(
            el.getBoundingClientRect().height /
              parseFloat(getComputedStyle(el).lineHeight),
          ),
        );
      const titleH = titleFont * lines(title);
      const subH = subFont * 1.35 * lines(summary);
      let titleY: number;
      if (vw >= 860) {
        const bottom = plate.y + plate.size / 2;
        titleY = bottom - 140 - 24 - subH - 24 - titleH;
      } else {
        titleY = plate.y + plate.size / 2 + 32 + 38;
      }
      spots = {
        title: { x: gutter, y: titleY, width: 0, font: titleFont },
        sub: { x: gutter, y: titleY + titleH + 24, width: 0, font: subFont },
      };
    }
    const flight = (el: HTMLElement, to: HeroSpot) => {
      const r = el.getBoundingClientRect();
      const font = parseFloat(getComputedStyle(el).fontSize);
      return [
        el,
        {
          x: to.x - r.left,
          y: to.y - r.top,
          scale: to.font / font,
          transformOrigin: "0 0",
        },
      ] as const;
    };
    return [flight(title, spots.title), flight(summary, spots.sub)];
  }

  function plateTarget(layer: HTMLAnchorElement) {
    const plate = readSpots(layer)?.plate;
    if (plate)
      return {
        x: plate.x + plate.width / 2,
        y: plate.y + plate.width / 2,
        size: plate.width,
      };
    const vw = innerWidth;
    const gutter = clamp(vw * 0.03, 16, 40);
    const top = clamp(innerHeight * 0.2, 128, 192);
    let size: number;
    let x: number;
    if (vw >= 860) {
      const gap = clamp(vw * 0.05, 32, 80);
      size = Math.min((vw - gutter * 2 - gap) / 2.25, 480);
      x = vw - gutter - size / 2;
    } else {
      size = Math.min((vw - gutter * 2) * 0.6, 256);
      x = gutter + size / 2;
    }
    return { x, y: top + size / 2, size };
  }

  window.addEventListener("pageshow", (event) => {
    if (!event.persisted) return;
    leaving = false;
    root.classList.remove("is-leaving");
    document.documentElement.classList.remove("field-leaving");
    for (const el of root.querySelectorAll<HTMLElement>(
      ".tile-plate, .stack-card__title, .stack-card__summary",
    ))
      el.style.viewTransitionName = "";
    gsap.set(".stack-card__title, .stack-card__summary", {
      clearProps: "transform,fontSize,width,maxWidth",
    });
    gsap.set(".tile-plate img", { clearProps: "borderRadius" });
    sessionStorage.removeItem("arrive");
    tYaw = cam.yaw;
    gsap.to(scatter, {
      ...Object.fromEntries(scatter.map((_, j) => [j, 0])),
      duration: 0.9,
      ease: "expo.out",
    });
    gsap.to(cam, {
      flat: 0,
      lift: 0,
      ox: 0,
      oy: 0,
      zoom: 1,
      duration: 0.9,
      ease: "expo.out",
      onUpdate: () => void (dirty = true),
      onComplete: () => void (authored = false),
    });
  });

  window.addEventListener("pagehide", () => {
    if (!leaving) writeCam(tPos, tYaw);
  });

  let frame = 0;
  function tick() {
    frame = requestAnimationFrame(tick);
    if (leaderStale) {
      leaderStale = false;
      drawLeader();
    }
    let moving = authored;

    if (!leaving && !swapping) {
      const ease = reduced ? 1 : 0.1;
      cam.pos += (tPos - cam.pos) * ease;
      cam.yaw += (tYaw - cam.yaw) * ease;
      const tiltGoal = dragging ? tTilt - 6 : tTilt;
      cam.tilt += (tiltGoal - cam.tilt) * 0.08;
      moving ||=
        Math.abs(tPos - cam.pos) > 0.0005 ||
        Math.abs(tYaw - cam.yaw) > 0.01 ||
        Math.abs(tiltGoal - cam.tilt) > 0.01;
    }

    if (!moving && !dirty) return;
    dirty = false;
    render();
  }

  const start = () => {
    if (!frame) frame = requestAnimationFrame(tick);
  };
  const stop = () => {
    cancelAnimationFrame(frame);
    frame = 0;
  };

  function intro() {
    if (reduced) return;
    authored = true;
    const full = !saved;
    drop.fill(1);
    cam.yaw = tYaw - (full ? 50 : 18);
    cam.tilt = TILT - (full ? 20 : 8);
    const order = layers.map((_, i) => last - i);
    // Start this motion with the incoming page transition.
    const tl = gsap.timeline({
      paused: true,
      delay: 0.1,
      onUpdate: () => void (dirty = true),
      onComplete: () => void (authored = false),
    });
    order.forEach((i, k) => {
      tl.to(
        drop,
        { [i]: 0, duration: full ? 0.9 : 0.6, ease: "expo.out" },
        k * (full ? 0.07 : 0.04),
      );
    });
    tl.to(
      cam,
      { yaw: tYaw, tilt: TILT, duration: full ? 1.8 : 1.1, ease: "expo.out" },
      0,
    );
    void onScreen().then(() => tl.restart(true));
  }

  function setView(view: View, persist = true) {
    root.dataset.view = view;
    document.documentElement.classList.toggle("shell-fixed", view === "field");
    pressView(view);
    if (persist) sessionStorage.setItem(VIEW_KEY, view);
    if (view === "field") {
      measure();
      dirty = true;
      start();
    } else {
      stop();
      setHot(null);
      window.scrollTo(0, 0);
    }
    refreshCursor();
  }

  document.addEventListener("click", (event) => {
    const btn = (event.target as Element).closest<HTMLElement>(
      "[data-view-btn]",
    );
    if (btn) switchView(btn.dataset.viewBtn as View);
  });

  index.addEventListener("focusin", () => {
    if (root.dataset.view !== "list" && !swapping) setView("list", false);
  });

  function pressView(view: View) {
    for (const btn of document.querySelectorAll<HTMLElement>("[data-view-btn]"))
      btn.setAttribute("aria-pressed", String(btn.dataset.viewBtn === view));
  }

  const wrap = (deg: number) => (((deg % 360) + 540) % 360) - 180;

  function switchView(view: View) {
    if (view === root.dataset.view || swapping || leaving) return;
    if (reduced) return setView(view);
    pressView(view);
    swapping = authored = true;
    setHot(null);
    refreshCursor();
    preview.classList.remove("is-visible");
    root.classList.add("is-swapping");
    index.classList.add("is-dealing");
    parallaxX = parallaxY = 0;
    tPos = Math.round(clamp(tPos, 0, last));
    if (view === "list") dealOut();
    else gatherIn();
  }

  const finish = () => {
    swapping = authored = false;
    refreshCursor();
  };

  function dealOut() {
    const yaw = wrap(cam.yaw);
    tYaw += yaw - cam.yaw;
    cam.yaw = yaw;
    const flatten = { yaw: yaw >= 0 ? 360 : -360, flat: 1 };
    gsap
      .timeline({
        onUpdate: () => void (dirty = true),
        onComplete: () => {
          const tiles = flatTiles();
          setView("list");
          fly(true, tiles, rowBoxes(), () => {
            root.classList.remove("is-swapping");
            finish();
          });
        },
      })
      .to(cam, { pos: tPos, duration: 0.35, ease: "power2.out" }, 0)
      .to(cam, { ...flatten, duration: 0.75, ease: "expo.inOut" }, 0);
  }

  function gatherIn() {
    const rows = rowBoxes();
    document.documentElement.classList.add("shell-fixed");
    measure();
    tYaw = wrap(tYaw);
    Object.assign(cam, { pos: tPos, yaw: tYaw >= 0 ? 360 : -360, flat: 1 });
    Object.assign(cam, { tilt: TILT, lift: 0, ox: 0, oy: 0, zoom: 1 });
    drop.fill(0);
    scatter.fill(0);
    render();
    fly(false, flatTiles(), rows, () => {
      setView("field");
      window.scrollTo(0, 0);
      root.classList.remove("is-swapping");
      index.classList.remove("is-dealing");
      render();
      gsap.to(cam, {
        yaw: tYaw,
        flat: 0,
        duration: 1.1,
        ease: "expo.inOut",
        onUpdate: () => void (dirty = true),
        onComplete: finish,
      });
    });
  }

  const flatTiles = () =>
    layers.map((el) => ({
      box: el.getBoundingClientRect(),
      alpha: Number(el.style.opacity || 1),
    }));

  const rowBoxes = () => {
    const rows: { link: HTMLElement; box: DOMRect }[] = [];
    for (const li of index.querySelectorAll<HTMLElement>("li[data-row]")) {
      const link = li.querySelector<HTMLElement>("a")!;
      rows[Number(li.dataset.row)] = {
        link,
        box: link.getBoundingClientRect(),
      };
    }
    return rows;
  };

  function fly(
    toRows: boolean,
    tiles: ReturnType<typeof flatTiles>,
    rows: ReturnType<typeof rowBoxes>,
    done: () => void,
  ) {
    const chrome = index.querySelectorAll<HTMLElement>(
      ".field-index__count, .field-index__year h2",
    );
    const links = rows.map((row) => row.link);
    const ghosts = layers.map((layer, i) => {
      const el = document.createElement("div");
      el.className = "field-ghost";
      el.classList.toggle("is-active", i === active);
      el.append(layer.querySelector(".layer-face")!.cloneNode(true));
      return el;
    });
    [...ghosts.keys()]
      .sort((a, b) => tiles[a].box.width - tiles[b].box.width)
      .forEach((i) => root.append(ghosts[i]));

    const tl = gsap.timeline({
      defaults: { ease: "power2.out" },
      onComplete: () => {
        done();
        ghosts.forEach((g) => g.remove());
        gsap.set([...links, ...chrome], { clearProps: "opacity,transform" });
      },
    });
    tl.fromTo(
      chrome,
      { opacity: +!toRows },
      { opacity: +toRows, duration: 0.4, stagger: 0.08 },
      toRows ? 0.15 : 0,
    );
    if (toRows) tl.call(() => index.classList.remove("is-dealing"), [], 0.15);

    const order = [...index.querySelectorAll<HTMLElement>("li[data-row]")];
    order.forEach((li, k) => {
      const i = Number(li.dataset.row);
      const g = ghosts[i];
      const face = g.firstElementChild as HTMLElement;
      const [from, to] = toRows
        ? [tiles[i].box, rows[i].box]
        : [rows[i].box, tiles[i].box];
      const at = k * 0.055;
      const tilt = (k % 2 ? 1 : -1) * (toRows ? 1 : -1) * (5 + (i % 3) * 2);
      const { left: x, top: y, width, height } = from;
      gsap.set(g, {
        x,
        y,
        width,
        height,
        opacity: toRows ? tiles[i].alpha : 0,
      });
      gsap.set(face, { borderRadius: toRows ? 8 : 2 });
      gsap.set(face.children, { opacity: +toRows });
      const glide = { duration: 0.8, ease: "expo.inOut" };
      tl.to(g, { opacity: 1, duration: 0.25 }, at)
        .to(g, { x: to.left, width: to.width, ...glide }, at)
        .to(
          g,
          { y: to.top, height: to.height, ...glide, ease: "power4.inOut" },
          at,
        )
        .to(face, { borderRadius: toRows ? 2 : 8, ...glide }, at)
        .to(g, { rotation: tilt, duration: 0.4 }, at)
        .to(g, { rotation: 0, duration: 0.45, ease: "back.out(2.5)" }, at + 0.4)
        .to(
          face.children,
          { opacity: +!toRows, duration: 0.3 },
          toRows ? at : at + 0.5,
        )
        .to(
          g,
          { opacity: toRows ? 0 : tiles[i].alpha, duration: 0.35 },
          at + (toRows ? 0.8 : 0.6),
        )
        .fromTo(
          links[i],
          { opacity: +!toRows, x: toRows ? -16 : 0 },
          {
            opacity: +toRows,
            x: toRows ? 0 : 16,
            duration: toRows ? 0.7 : 0.3,
          },
          toRows ? at + 0.72 : at,
        );
    });
  }

  onPointerChange((mouse) => {
    if (mouse) return;
    setHot(null);
    preview.classList.remove("is-visible");
    parallaxX = parallaxY = 0;
    dirty = true;
  });

  const previewX = (x: number) => x + 96;
  const px = gsap.quickTo(preview, "x", { duration: 0.5, ease: "power3" });
  const py = gsap.quickTo(preview, "y", { duration: 0.5, ease: "power3" });
  index.addEventListener("pointerover", (event) => {
    if (event.pointerType !== "mouse" || swapping) return;
    const row = (event.target as Element).closest<HTMLElement>("li[data-row]");
    if (!row) return;
    const plate = layers[Number(row.dataset.row)]?.querySelector(".tile-plate");
    if (plate) preview.replaceChildren(plate.cloneNode(true));
    if (!preview.classList.contains("is-visible"))
      gsap.set(preview, { x: previewX(event.clientX), y: event.clientY - 100 });
    preview.classList.add("is-visible");
  });
  index.addEventListener("pointerout", (event) => {
    const next = event.relatedTarget as Element | null;
    if (!next?.closest?.("li[data-row]"))
      preview.classList.remove("is-visible");
  });
  index.addEventListener("pointermove", (event) => {
    if (event.pointerType !== "mouse") return;
    px(previewX(event.clientX));
    py(event.clientY - 100);
  });

  window.addEventListener("resize", () => {
    if (root.dataset.view !== "field") return;
    measure();
  });

  new ResizeObserver(() => {
    if (narrow && root.dataset.view === "field") measure();
  }).observe(info);

  const savedView = sessionStorage.getItem(VIEW_KEY) as View | null;
  setView(savedView === "list" ? "list" : "field", false);
  if (root.dataset.view === "field") intro();
  requestAnimationFrame(() => root.classList.add("is-ready"));
}

interface HeroSpot {
  x: number;
  y: number;
  width: number;
  font: number;
}

interface HeroSpots {
  title: HeroSpot;
  sub: HeroSpot;
  plate: HeroSpot;
}

function heroKey(layer: HTMLAnchorElement) {
  return `hero:${new URL(layer.href).pathname}:${innerWidth}x${innerHeight}`;
}

function readSpots(layer: HTMLAnchorElement): HeroSpots | null {
  try {
    const spots = JSON.parse(localStorage.getItem(heroKey(layer)) ?? "null");
    return spots?.plate ? spots : null;
  } catch {
    return null;
  }
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function readCam(): { pos: number; yaw: number } | null {
  try {
    const raw = sessionStorage.getItem(CAM_KEY);
    const cam = raw ? JSON.parse(raw) : null;
    return typeof cam?.pos === "number" && typeof cam?.yaw === "number"
      ? cam
      : null;
  } catch {
    return null;
  }
}

function writeCam(pos: number, yaw: number) {
  sessionStorage.setItem(CAM_KEY, JSON.stringify({ pos, yaw }));
}
