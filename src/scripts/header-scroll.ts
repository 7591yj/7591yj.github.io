function init() {
  const header = document.querySelector<HTMLElement>(
    "[data-transparent-header]",
  );
  const hero = document.querySelector<HTMLElement>(
    ".hero-carousel--fullscreen",
  );

  if (!header || !hero) return;

  // Set the correct state immediately
  if (window.scrollY < 1) {
    header.classList.add("header--transparent");
    header.classList.remove("header--scrolled");
  }

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        header.classList.add("header--transparent");
        header.classList.remove("header--scrolled");
      } else {
        header.classList.remove("header--transparent");
        header.classList.add("header--scrolled");
      }
    },
    {
      rootMargin: "-56px 0px 0px 0px",
      threshold: 0,
    },
  );

  observer.observe(hero);

  // Cleanup for ViewTransitions
  document.addEventListener(
    "astro:before-swap",
    () => {
      observer.disconnect();
    },
    { once: true },
  );
}

document.addEventListener("astro:page-load", init);
