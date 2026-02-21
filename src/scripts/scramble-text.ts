const chars =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*";
const resolveDelay = 60;

function init() {
  document
    .querySelectorAll<HTMLElement>("[data-scramble]")
    .forEach((el) => {
      const original = el.dataset.scramble || el.textContent || "";
      let frameId: number | null = null;
      let timeoutIds: number[] = [];

      el.addEventListener("mouseenter", () => {
        if (frameId) cancelAnimationFrame(frameId);
        timeoutIds.forEach(clearTimeout);
        timeoutIds = [];

        const resolved = new Array(original.length).fill(false);

        const scramble = () => {
          el.textContent = original
            .split("")
            .map((ch, i) => {
              if (ch === " ") return " ";
              if (resolved[i]) return original[i];
              return chars[Math.floor(Math.random() * chars.length)];
            })
            .join("");

          if (!resolved.every(Boolean)) {
            frameId = requestAnimationFrame(scramble);
          }
        };

        original.split("").forEach((ch, i) => {
          if (ch === " ") {
            resolved[i] = true;
            return;
          }
          const id = window.setTimeout(() => {
            resolved[i] = true;
          }, resolveDelay * (i + 1));
          timeoutIds.push(id);
        });

        frameId = requestAnimationFrame(scramble);
      });

      el.addEventListener("mouseleave", () => {
        if (frameId) cancelAnimationFrame(frameId);
        timeoutIds.forEach(clearTimeout);
        timeoutIds = [];
        el.textContent = original;
      });
    });
}

// Re-run on Astro page transitions
document.addEventListener("astro:page-load", init);
