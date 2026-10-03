import {
  gsap,
  ScrollTrigger,
  SplitText,
  inFirstViewport,
  onScreen,
  reducedMotion,
} from "../motion/core";

const diving = document.documentElement.classList.contains("arrive-dive");
const headlines = gsap.utils.toArray<HTMLElement>("[data-split]");
// field.ts carries the subtitle into place during a dive.
const blocks = gsap.utils
  .toArray<HTMLElement>("[data-reveal]")
  .filter((el) => !(diving && el.matches(".entry-sub")));

if (reducedMotion()) {
  gsap.set([...headlines, ...blocks], { autoAlpha: 1 });
} else {
  // motion/core.ts waits for Head.astro's incoming transition.
  const delay = diving ? 0.05 : 0.1;
  const shown = onScreen();
  const play = <T extends gsap.core.Animation>(animation: T) => {
    void shown.then(() => animation.restart(true));
    return animation;
  };

  for (const el of headlines) {
    SplitText.create(el, {
      type: "lines",
      mask: "lines",
      linesClass: "split-line",
      autoSplit: true,
      onSplit: (split) => {
        gsap.set(el, { autoAlpha: 1 });
        return play(
          gsap.from(split.lines, {
            yPercent: 125,
            duration: 1.1,
            stagger: 0.08,
            delay,
            paused: true,
          }),
        );
      },
    });
  }

  const first = blocks.filter(inFirstViewport);
  const rest = blocks.filter((el) => !first.includes(el));

  if (first.length)
    play(
      gsap.fromTo(
        first,
        { autoAlpha: 0, y: 24 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 1,
          stagger: 0.06,
          delay: delay + 0.15,
          paused: true,
        },
      ),
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
