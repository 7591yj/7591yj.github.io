function setupTerminals() {
  document
    .querySelectorAll<HTMLElement>(".term:not([data-ready])")
    .forEach((term) => {
      term.setAttribute("data-ready", "");

      const typed = term.querySelector<HTMLElement>(".term__typed");
      const cursor = term.querySelector<HTMLElement>(".term__cursor");
      const outputEl = term.querySelector<HTMLElement>(".term__output");
      const command = term.dataset.command ?? "";
      let hasStarted = false;

      const io = new IntersectionObserver(
        (entries) => {
          if (!entries[0].isIntersecting || hasStarted) return;
          hasStarted = true;
          io.disconnect();

          if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
            if (typed) typed.textContent = command;
            if (cursor) cursor.style.display = "none";
            outputEl?.classList.add("is-visible");
            return;
          }

          let i = 0;
          const tick = () => {
            if (!typed) return;
            typed.textContent = command.slice(0, i);
            i++;
            if (i <= command.length) {
              setTimeout(tick, 38 + Math.random() * 32);
            } else {
              setTimeout(() => {
                if (cursor) cursor.style.display = "none";
                if (outputEl) outputEl.classList.add("is-visible");
              }, 280);
            }
          };

          setTimeout(tick, 500);
        },
        { threshold: 0.5 },
      );

      io.observe(term);
    });
}

setupTerminals();
document.addEventListener("astro:page-load", setupTerminals);
