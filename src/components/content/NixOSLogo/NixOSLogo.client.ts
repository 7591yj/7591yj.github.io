type GeometryGroup = NodeListOf<SVGGeometryElement>;
type TimingGroup = [
  GeometryGroup,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
];

const STROKE_FALLBACK = "currentColor";

function prepareGeometry(el: SVGGeometryElement): void {
  const len = el.getTotalLength();
  el.style.strokeDasharray = String(len);
  el.style.strokeDashoffset = String(len);
  el.style.stroke = el.dataset.stroke ?? STROKE_FALLBACK;
}

function animateGeometry(
  el: SVGGeometryElement,
  index: number,
  timing: TimingGroup,
): void {
  const [
    ,
    base,
    step,
    dashDur,
    fillDur,
    fillDelayAdd,
    strokeDur,
    strokeDelayAdd,
  ] = timing;
  const dashDelay = base + index * step;
  const fillDelay = dashDelay + fillDelayAdd;
  el.style.transition = [
    `stroke-dashoffset ${dashDur}ms ease ${dashDelay}ms`,
    `fill-opacity ${fillDur}ms ease ${fillDelay}ms`,
    `stroke-opacity ${strokeDur}ms ease ${fillDelay + strokeDelayAdd}ms`,
  ].join(", ");
  el.style.strokeDashoffset = "0";
  el.style.fillOpacity = "1";
  el.style.strokeOpacity = "0";
}

function animateGroups(groups: TimingGroup[]): void {
  groups.forEach((group) =>
    group[0].forEach((el, i) => animateGeometry(el, i, group)),
  );
}

function buildGroups(wrap: HTMLElement): TimingGroup[] {
  const arms = wrap.querySelectorAll<SVGGeometryElement>(".nixos-arm");
  const letters = wrap.querySelectorAll<SVGGeometryElement>(".nixos-letter");
  [...arms, ...letters].forEach(prepareGeometry);
  return [
    [arms, 0, 90, 480, 380, 450, 300, 200],
    [letters, 620, 80, 420, 320, 380, 280, 180],
  ];
}

function setupNixOSLogo(wrap: HTMLElement): void {
  wrap.setAttribute("data-ready", "");
  const groups = buildGroups(wrap);
  new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) animateGroups(groups);
    },
    { threshold: 0.3 },
  ).observe(wrap);
}

function setupNixOSLogos(): void {
  document
    .querySelectorAll<HTMLElement>(".nixos-logo-wrap:not([data-ready])")
    .forEach(setupNixOSLogo);
}

setupNixOSLogos();
document.addEventListener("astro:page-load", setupNixOSLogos);
