let cleanupCurrent: (() => void) | null = null;

function setHeaderTransparent(header: HTMLElement, transparent: boolean): void {
  header.classList.toggle("header--transparent", transparent);
  header.classList.toggle("header--scrolled", !transparent);
}

function handleHeroIntersection(
  header: HTMLElement,
  entries: IntersectionObserverEntry[],
): void {
  setHeaderTransparent(header, entries[0]?.isIntersecting ?? false);
}

function disconnectObserver(observer: IntersectionObserver): void {
  observer.disconnect();
}

function resolveHeaderAndHero(): [HTMLElement, HTMLElement] | null {
  const header = document.querySelector<HTMLElement>(
    "[data-transparent-header]",
  );
  const hero = document.querySelector<HTMLElement>(
    ".hero-carousel--fullscreen",
  );
  if (!header || !hero) return null;
  return [header, hero];
}

function init() {
  cleanupCurrent?.();
  cleanupCurrent = null;

  const pair = resolveHeaderAndHero();
  if (!pair) return;
  const [header, hero] = pair;

  // Set the correct state immediately
  if (window.scrollY < 1) {
    setHeaderTransparent(header, true);
  }

  const observer = new IntersectionObserver(
    handleHeroIntersection.bind(null, header),
    {
      rootMargin: "-56px 0px 0px 0px",
      threshold: 0,
    },
  );

  observer.observe(hero);
  cleanupCurrent = disconnectObserver.bind(null, observer) as () => void;
}

document.addEventListener("astro:before-swap", () => {
  cleanupCurrent?.();
  cleanupCurrent = null;
});
document.addEventListener("astro:page-load", init);
init();

export {};
