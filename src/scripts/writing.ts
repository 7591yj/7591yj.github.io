import { gsap, finePointer, reducedMotion } from "./motion/core";

const list = document.querySelector<HTMLElement>("[data-writing-list]");
const preview = document.querySelector<HTMLElement>("[data-writing-preview]");

if (list && preview) {
  const plates = new Map<string, HTMLTemplateElement>();
  for (const tpl of document.querySelectorAll<HTMLTemplateElement>(
    "template[data-plate-tpl]",
  ))
    plates.set(tpl.dataset.plateTpl!, tpl);

  if (finePointer()) {
    const still = reducedMotion();
    const toX = gsap.quickTo(preview, "x", { duration: 0.6, ease: "power3" });
    const toY = gsap.quickTo(preview, "y", { duration: 0.6, ease: "power3" });
    const toR = gsap.quickTo(preview, "rotation", {
      duration: 0.8,
      ease: "power3",
    });
    let lastX = 0;
    let current = "";

    list.addEventListener("pointerover", (event) => {
      const link = (event.target as Element).closest<HTMLElement>(
        "a[data-plate]",
      );
      if (!link) return;
      const id = link.dataset.plate!;
      if (id !== current) {
        current = id;
        preview.replaceChildren(plates.get(id)!.content.cloneNode(true));
      }
      if (!preview.classList.contains("is-visible"))
        gsap.set(preview, { x: event.clientX, y: event.clientY });
      preview.classList.add("is-visible");
    });

    list.addEventListener("pointerout", (event) => {
      const next = event.relatedTarget as Element | null;
      if (!next?.closest?.("a[data-plate]"))
        preview.classList.remove("is-visible");
    });

    list.addEventListener("pointermove", (event) => {
      toX(event.clientX);
      toY(event.clientY);
      if (!still) {
        const lean = gsap.utils.clamp(-12, 12, (event.clientX - lastX) * 0.6);
        toR(lean);
      }
      lastX = event.clientX;
    });

    list.addEventListener(
      "pointermove",
      debounce(() => toR(0), 90),
    );
  }

  list.addEventListener("click", (event) => {
    const link = (event.target as Element).closest<HTMLElement>(
      "a[data-plate]",
    );
    if (!link || event.metaKey || event.ctrlKey || event.shiftKey) return;
    link.querySelector<HTMLElement>(".w-title")!.style.viewTransitionName =
      "hero-title";
  });

  window.addEventListener("pageshow", (event) => {
    if (!event.persisted) return;
    for (const title of list.querySelectorAll<HTMLElement>(".w-title"))
      title.style.viewTransitionName = "";
  });
}

function debounce(fn: () => void, ms: number) {
  let id = 0;
  return () => {
    window.clearTimeout(id);
    id = window.setTimeout(fn, ms);
  };
}
