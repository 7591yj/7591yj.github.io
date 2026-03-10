function init() {
  const targets = Array.from(
    document.querySelectorAll<HTMLElement>(
      "[data-animate]:not([data-animate-ready])",
    ),
  );

  if (targets.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "-50px" },
  );

  targets.forEach((el) => {
    el.dataset.animateReady = "true";
    observer.observe(el);
  });
}

// Re-run on Astro page transitions
document.addEventListener("astro:page-load", init);
init();

export {};
