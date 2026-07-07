function preparePath(path: SVGGeometryElement): void {
  const len = path.getTotalLength();
  path.style.strokeDasharray = String(len);
  path.style.strokeDashoffset = String(len);
}

function animateBar(bar: SVGGeometryElement, index: number): void {
  const dashDelay = index * 100;
  const fillDelay = dashDelay + 420;
  bar.style.transition = [
    `stroke-dashoffset 450ms ease ${dashDelay}ms`,
    `fill-opacity 360ms ease ${fillDelay}ms`,
    `stroke-opacity 300ms ease ${fillDelay + 180}ms`,
  ].join(", ");
  bar.style.strokeDashoffset = "0";
  bar.style.fillOpacity = "1";
  bar.style.strokeOpacity = "0";
}

const SWOOSH_TRANSITION = "stroke-dashoffset 650ms ease 480ms";

function animateSwoosh(swoosh: SVGGeometryElement | null): void {
  if (!swoosh) return;
  swoosh.style.transition = SWOOSH_TRANSITION;
  swoosh.style.strokeDashoffset = "0";
}

function setupBizlenzLogo(wrap: HTMLElement): void {
  wrap.setAttribute("data-ready", "");
  const bars = wrap.querySelectorAll<SVGGeometryElement>(".bizlenz-bar");
  const swoosh = wrap.querySelector<SVGGeometryElement>(".bizlenz-swoosh");
  bars.forEach(preparePath);
  if (swoosh) preparePath(swoosh);
  new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return;
      bars.forEach(animateBar);
      animateSwoosh(swoosh);
    },
    { threshold: 0.3 },
  ).observe(wrap);
}

function setupBizlenzLogos(): void {
  document
    .querySelectorAll<HTMLElement>(".bizlenz-logo-wrap:not([data-ready])")
    .forEach(setupBizlenzLogo);
}

setupBizlenzLogos();
document.addEventListener("astro:page-load", setupBizlenzLogos);
