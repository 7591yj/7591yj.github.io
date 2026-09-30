const DIGITS = "0123456789";
const CELL = 1.3;

function start() {
  const code = document.querySelector<HTMLElement>("[data-error-code]");
  if (
    !code ||
    code.dataset.reelsMounted ||
    matchMedia("(prefers-reduced-motion: reduce)").matches
  )
    return;

  code.dataset.reelsMounted = "true";
  void document.fonts.ready.then(() => {
    if (!code.isConnected) return;

    const text = code.textContent ?? "";
    code.setAttribute("aria-label", text);
    code.replaceChildren();

    const reels = [...text].map((digit) => {
      const cell = document.createElement("span");
      cell.className = "error__digit";
      cell.setAttribute("aria-hidden", "true");
      cell.textContent = digit;
      code.append(cell);

      const width = cell.getBoundingClientRect().width;
      const strip = document.createElement("span");
      strip.className = "error__strip";
      cell.style.width = `${width}px`;
      cell.replaceChildren(strip);
      return { digit, strip };
    });

    code.classList.add("error__code--reels");

    reels.forEach(({ digit, strip }, index) => {
      let at = DIGITS.indexOf(digit);
      const glyphs = [digit];
      for (let step = 1; step < 5 + index * 2; step++) {
        at = (at + 1 + Math.floor(Math.random() * 3)) % DIGITS.length;
        glyphs.push(DIGITS[at]);
      }
      glyphs.push(digit, DIGITS[(DIGITS.indexOf(digit) + 1) % DIGITS.length]);
      strip.replaceChildren(
        ...glyphs.map((glyph) => {
          const span = document.createElement("span");
          span.textContent = glyph;
          return span;
        }),
      );

      const landing = glyphs.length - 2;
      const animation = strip.animate(
        [
          { transform: "translateY(0)" },
          { transform: `translateY(${-landing * CELL}em)` },
        ],
        {
          duration: 520 + index * 90,
          easing: "cubic-bezier(0.25, 0.9, 0.35, 1.18)",
          fill: "forwards",
        },
      );
      void animation.finished.then(() => {
        const finalCell = document.createElement("span");
        finalCell.textContent = digit;
        strip.replaceChildren(finalCell);
        animation.cancel();
      });
    });
  });
}

document.addEventListener("astro:page-load", start);
start();
