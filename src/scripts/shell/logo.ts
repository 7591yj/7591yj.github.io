import { whenMouse } from "../pointer";

const DIGITS = "0123456789";
const LETTERS = "abcdefghijklmnopqrstuvwxyz";
// Matches .shell-logo__strip > span in shell.css.
const CELL = 1.3;

interface Reel {
  char: string;
  strip: HTMLSpanElement;
}

function fill(reel: Reel, steps: number) {
  const pool = /\d/.test(reel.char) ? DIGITS : LETTERS;
  let at = pool.indexOf(reel.char);
  const glyphs = [reel.char];
  for (let n = 1; n < steps; n++) {
    at = (at + 1 + Math.floor(Math.random() * 3)) % pool.length;
    glyphs.push(pool[at]);
  }
  glyphs.push(reel.char, pool[(pool.indexOf(reel.char) + 1) % pool.length]);
  reel.strip.replaceChildren(
    ...glyphs.map((glyph) => {
      const cell = document.createElement("span");
      cell.textContent = glyph;
      return cell;
    }),
  );
  return glyphs.length - 2;
}

function mount(logo: HTMLElement) {
  const text = logo.textContent ?? "";
  logo.setAttribute("aria-label", text);
  logo.textContent = "";
  const chars = [...text].map((char) => {
    const el = document.createElement("span");
    el.className = "shell-logo__char";
    el.setAttribute("aria-hidden", "true");
    el.textContent = char;
    logo.append(el);
    return el;
  });
  const widths = chars.map((el) => el.getBoundingClientRect().width);
  const reels: Reel[] = chars.map((el, i) => {
    const reel = {
      char: el.textContent ?? "",
      strip: document.createElement("span"),
    };
    reel.strip.className = "shell-logo__strip";
    el.style.width = `${widths[i]}px`;
    el.replaceChildren(reel.strip);
    fill(reel, 1);
    return reel;
  });
  logo.classList.add("shell-logo--reels");

  let spinning = false;
  const spin = (fromEnd: boolean) => {
    if (spinning) return;
    spinning = true;
    void Promise.all(
      reels.map(async (reel, i) => {
        const rank = fromEnd ? reels.length - 1 - i : i;
        const landing = fill(reel, 5 + rank * 2);
        const animation = reel.strip.animate(
          [
            { transform: "translateY(0)" },
            { transform: `translateY(${-landing * CELL}em)` },
          ],
          {
            duration: 520 + rank * 90,
            easing: "cubic-bezier(0.25, 0.9, 0.35, 1.18)",
            fill: "forwards",
          },
        );
        await animation.finished;
        fill(reel, 1);
        animation.cancel();
      }),
    ).finally(() => {
      spinning = false;
    });
  };

  logo.addEventListener("pointerenter", (event) => {
    if (event.pointerType !== "mouse") return;
    const box = logo.getBoundingClientRect();
    spin(event.clientX > box.left + box.width / 2);
  });
  logo.addEventListener("focus", () => {
    if (logo.matches(":focus-visible")) spin(false);
  });
}

const logo = document.querySelector<HTMLElement>(".shell-logo");
if (logo && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  whenMouse(() => void document.fonts.ready.then(() => mount(logo)));
}

export {};
