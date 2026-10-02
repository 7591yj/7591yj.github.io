import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

gsap.defaults({ ease: "expo.out", duration: 0.9 });

export { gsap, ScrollTrigger, SplitText };

export const reducedMotion = () =>
  matchMedia("(prefers-reduced-motion: reduce)").matches;

export function each<T extends HTMLElement = HTMLElement>(
  selector: string,
  key: string,
  fn: (el: T) => void,
) {
  document.querySelectorAll<T>(selector).forEach((el) => {
    if (el.dataset[key]) return;
    el.dataset[key] = "true";
    fn(el);
  });
}

export function inFirstViewport(el: Element) {
  return el.getBoundingClientRect().top < window.innerHeight * 0.92;
}
