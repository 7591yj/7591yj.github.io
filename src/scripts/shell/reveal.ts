import {
  gsap,
  ScrollTrigger,
  SplitText,
  inFirstViewport,
  reducedMotion,
} from "../motion/core";

function inViewTransition() {
  try {
    return document.documentElement.matches(":active-view-transition");
  } catch {
    return false;
  }
}

const diving = document.documentElement.classList.contains("arrive-dive");
const headlines = gsap.utils.toArray<HTMLElement>("[data-split]");
// field.ts carries the subtitle into place during a dive.
const blocks = gsap.utils
  .toArray<HTMLElement>("[data-reveal]")
  .filter((el) => !(diving && el.matches(".entry-sub")));

if (reducedMotion()) {
  gsap.set([...headlines, ...blocks], { autoAlpha: 1 });
} else {
  const delay = diving ? 0.05 : inViewTransition() ? 0.35 : 0.1;

  for (const el of headlines) {
    SplitText.create(el, {
      type: "lines",
      mask: "lines",
      autoSplit: true,
      onSplit: (split) => {
        gsap.set(el, { autoAlpha: 1 });
        return gsap.from(split.lines, {
          yPercent: 110,
          duration: 1.1,
          stagger: 0.08,
          delay,
        });
      },
    });
  }

  const first = blocks.filter(inFirstViewport);
  const rest = blocks.filter((el) => !first.includes(el));

  if (first.length)
    gsap.fromTo(
      first,
      { autoAlpha: 0, y: 24 },
      { autoAlpha: 1, y: 0, duration: 1, stagger: 0.06, delay: delay + 0.15 },
    );

  if (rest.length) {
    gsap.set(rest, { autoAlpha: 0, y: 24 });
    ScrollTrigger.batch(rest, {
      start: "top 92%",
      once: true,
      onEnter: (batch) =>
        gsap.to(batch, { autoAlpha: 1, y: 0, duration: 1, stagger: 0.06 }),
    });
  }
}
