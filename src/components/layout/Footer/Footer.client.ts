function initFooterBackground() {
  const footer = document.querySelector<HTMLElement>(".footer[data-footer-bg]");
  if (!footer || footer.dataset.footerBgReady === "true") return;

  const loadBackground = () => {
    const src = footer.dataset.footerBg;
    if (!src) return;
    footer.style.setProperty("--footer-bg-image", `url("${src}")`);
    footer.dataset.footerBgReady = "true";
  };

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return;
      loadBackground();
      observer.disconnect();
    },
    { rootMargin: "256px 0px" },
  );

  observer.observe(footer);
}

document.addEventListener("astro:page-load", initFooterBackground);
initFooterBackground();
