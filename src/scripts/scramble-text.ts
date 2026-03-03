const charsAscii =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*";
const charsJa =
  "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン";
const resolveDelay = 60;

// Full-width characters
function isWide(ch: string): boolean {
  const code = ch.charCodeAt(0);
  return (
    (code >= 0x3000 && code <= 0x9fff) || // CJK
    (code >= 0xff00 && code <= 0xffef) // full-width latin; half-width kana
  );
}

function randomChar(original: string): string {
  const pool = isWide(original) ? charsJa : charsAscii;
  return pool[Math.floor(Math.random() * pool.length)];
}

function playScramble(el: HTMLElement, original: string) {
  let frameId: number | null = null;
  let timeoutIds: number[] = [];

  const resolved = new Array(original.length).fill(false);

  const scramble = () => {
    el.textContent = original
      .split("")
      .map((ch, i) => {
        if (ch === " " || ch === "\u3000") return ch;
        if (resolved[i]) return original[i];
        return randomChar(original[i]);
      })
      .join("");

    if (!resolved.every(Boolean)) {
      frameId = requestAnimationFrame(scramble);
    }
  };

  original.split("").forEach((ch, i) => {
    if (ch === " " || ch === "\u3000") {
      resolved[i] = true;
      return;
    }
    const id = window.setTimeout(
      () => {
        resolved[i] = true;
      },
      resolveDelay * (i + 1),
    );
    timeoutIds.push(id);
  });

  frameId = requestAnimationFrame(scramble);

  return () => {
    if (frameId) cancelAnimationFrame(frameId);
    timeoutIds.forEach(clearTimeout);
    timeoutIds = [];
  };
}

function initHover(el: HTMLElement, original: string) {
  let cleanup: (() => void) | null = null;

  el.addEventListener("mouseenter", () => {
    cleanup?.();
    cleanup = playScramble(el, original);
  });

  el.addEventListener("mouseleave", () => {
    cleanup?.();
    cleanup = null;
    el.textContent = original;
  });
}

function initViewport(el: HTMLElement, original: string) {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          playScramble(el, original);
          observer.unobserve(el);
        }
      }
    },
    { threshold: 0.5 },
  );
  observer.observe(el);
}

function init() {
  document.querySelectorAll<HTMLElement>("[data-scramble]").forEach((el) => {
    const original = el.dataset.scramble || el.textContent || "";

    if (el.closest("header")) {
      initHover(el, original);
    } else {
      initViewport(el, original);
    }
  });
}

// Re-run on Astro page transitions
document.addEventListener("astro:page-load", init);

export {};
