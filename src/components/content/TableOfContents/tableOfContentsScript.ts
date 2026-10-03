type TOCLink = HTMLAnchorElement;
type SetActive = (slug: string) => void;

function resolveHeadings(links: NodeListOf<TOCLink>): HTMLElement[] {
  const slugs = Array.from(links).map((l) => l.dataset.slug!);
  return slugs
    .map((s) => document.getElementById(s))
    .filter(Boolean) as HTMLElement[];
}

function createActiveTracker(links: NodeListOf<TOCLink>): SetActive {
  let activeSlug = "";
  return (slug: string) => {
    if (slug === activeSlug) return;
    activeSlug = slug;
    links.forEach((l) => {
      const on = l.dataset.slug === slug;
      l.classList.toggle("active", on);
      if (on) l.setAttribute("aria-current", "location");
      else l.removeAttribute("aria-current");
    });
  };
}

function observeHeadings(
  headingEls: HTMLElement[],
  setActive: SetActive,
): void {
  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

      if (visible.length) {
        setActive(visible[0].target.id);
      }
    },
    { rootMargin: "-80px 0px -60% 0px", threshold: 0 },
  );

  headingEls.forEach((el) => observer.observe(el));
}

function bindClickScroll(
  links: NodeListOf<TOCLink>,
  setActive: SetActive,
): void {
  links.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const slug = link.dataset.slug!;
      const target = document.getElementById(slug);
      if (!target) return;
      history.pushState(null, "", `#${slug}`);
      target.scrollIntoView({ behavior: "smooth" });
      setActive(slug);
    });
  });
}

export function initToc() {
  const links = document.querySelectorAll<HTMLAnchorElement>(".toc__link");
  if (!links.length) return;

  const headingEls = resolveHeadings(links);
  if (!headingEls.length) return;

  const setActive = createActiveTracker(links);

  observeHeadings(headingEls, setActive);
  bindClickScroll(links, setActive);

  setActive(headingEls[0].id);
}
