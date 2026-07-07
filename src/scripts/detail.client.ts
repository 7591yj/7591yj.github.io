const COPY_LABEL = "COPY";
const COPIED_LABEL = "COPIED";
const COPY_RESET_DELAY_MS = 2000;

function scrollToHash() {
  const hash = window.location.hash;
  if (!hash) return;
  const el = document.querySelector(hash);
  if (el) el.scrollIntoView({ behavior: "smooth" });
}

function setupCopyButtons() {
  document.querySelectorAll(".prose pre").forEach((pre) => {
    if (pre.querySelector(".copy-btn")) return;
    const btn = document.createElement("button");
    btn.className = "copy-btn";
    btn.textContent = COPY_LABEL;
    btn.setAttribute("aria-label", "Copy code");
    btn.addEventListener("click", async () => {
      const code = pre.querySelector("code");
      if (!code) return;
      try {
        await navigator.clipboard.writeText(code.innerText);
        btn.textContent = COPIED_LABEL;
        btn.classList.add("copied");
        setTimeout(() => {
          btn.textContent = COPY_LABEL;
          btn.classList.remove("copied");
        }, COPY_RESET_DELAY_MS);
      } catch (error) {
        // Clipboard access may be unavailable; leave button unchanged.
        if (import.meta.env.DEV) console.warn({ error });
      }
    });
    pre.appendChild(btn);
  });
}

function setupSweeps() {
  document
    .querySelectorAll("[data-sweep]:not([data-sweep-ready])")
    .forEach((el) => {
      el.setAttribute("data-sweep-ready", "");
      const io = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          io.disconnect();
          el.classList.add("is-swept");
        },
        { threshold: 1.0 },
      );
      io.observe(el);
    });
}

function setupSweepInv() {
  document
    .querySelectorAll(".hover-sweep-text-inv:not([data-sweep-inv-ready])")
    .forEach((el) => {
      el.setAttribute("data-sweep-inv-ready", "");
      const io = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          io.disconnect();
          el.classList.add("is-swept");
        },
        { threshold: 0.5 },
      );
      io.observe(el);
    });
}

function setup() {
  scrollToHash();
  setupCopyButtons();
  setupSweeps();
  setupSweepInv();

  document.querySelectorAll(".heading-anchor").forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      const href = (a as HTMLAnchorElement).getAttribute("href");
      if (!href) return;
      history.pushState(null, "", href);
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    });
  });
  document
    .querySelectorAll(".prose h3[id], .prose h4[id], .prose h5[id]")
    .forEach((heading) => {
      heading.addEventListener("click", (e) => {
        if ((e.target as Element).closest(".heading-anchor")) return;
        e.preventDefault();
        const id = heading.id;
        history.pushState(null, "", `#${id}`);
        heading.scrollIntoView({ behavior: "smooth" });
      });
    });
}

setup();
document.addEventListener("astro:page-load", setup);
