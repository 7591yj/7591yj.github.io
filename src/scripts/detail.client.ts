const COPY_LABEL = "COPY";
const COPIED_LABEL = "COPIED";
const COPY_RESET_DELAY_MS = 2000;

function scrollToHash() {
  const hash = window.location.hash.slice(1);
  if (!hash) return;
  let id = hash;
  try {
    id = decodeURIComponent(hash);
  } catch {
    id = hash;
  }
  const el = document.getElementById(id);
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

function recordHeroSpots() {
  // field.ts reads these positions to land the stack's plate and text.
  const title = document.querySelector<HTMLElement>(".entry-title");
  const sub = document.querySelector<HTMLElement>(".entry-sub");
  const plate = document.querySelector<HTMLElement>(".entry-plate");
  if (!title || !sub || !plate) return;
  const spot = (el: HTMLElement) => {
    let x = 0;
    let y = 0;
    for (
      let e: HTMLElement | null = el;
      e;
      e = e.offsetParent as HTMLElement | null
    ) {
      x += e.offsetLeft;
      y += e.offsetTop;
    }
    return {
      x,
      y,
      width: el.offsetWidth,
      font: parseFloat(getComputedStyle(el).fontSize),
    };
  };
  void document.fonts.ready.then(() => {
    try {
      localStorage.setItem(
        `hero:${location.pathname}:${window.innerWidth}x${window.innerHeight}`,
        JSON.stringify({
          title: spot(title),
          sub: spot(sub),
          plate: spot(plate),
        }),
      );
    } catch {
      return;
    }
  });
}

function setup() {
  scrollToHash();
  recordHeroSpots();
  setupCopyButtons();
  setupSweeps();
  setupSweepInv();

  document
    .querySelectorAll(".prose h3[id], .prose h4[id], .prose h5[id]")
    .forEach((heading) => {
      heading.addEventListener("click", (e) => {
        if ((e.target as Element).closest("a")) return;
        e.preventDefault();
        const id = heading.id;
        history.pushState(null, "", `#${id}`);
        heading.scrollIntoView({ behavior: "smooth" });
      });
    });
}

setup();
document.addEventListener("astro:page-load", setup);
