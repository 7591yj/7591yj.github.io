import { useEffect, useRef } from "react";

interface Props {
  className?: string;
  dotColor?: string;
  dotSize?: number;
  gridSpacing?: number;
  repelRadius?: number;
  repelStrength?: number;
}

export default function InteractiveDotGrid({
  className = "",
  dotColor = "rgba(0, 0, 0, 0.5)",
  dotSize = 1,
  gridSpacing = 4,
  repelRadius = 100,
  repelStrength = 18,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // No hover interaction on touch devices — skip entirely
    if (window.matchMedia("(pointer: coarse)").matches) return;

    // Respect user's motion preference
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId = 0;
    let running = false;
    let mouseX = -9999;
    let mouseY = -9999;

    let offscreen: HTMLCanvasElement;
    let cw = 0;
    let ch = 0;
    let dpr = 1;
    let spacingPx = 0;
    let dotPx = 0;
    let cols = 0;
    let rows = 0;

    const displaced = new Map<number, { x: number; y: number }>();

    function buildStaticGrid() {
      offscreen = document.createElement("canvas");
      offscreen.width = cw;
      offscreen.height = ch;
      const offCtx = offscreen.getContext("2d")!;
      offCtx.fillStyle = dotColor;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          offCtx.fillRect(c * spacingPx, r * spacingPx, dotPx, dotPx);
        }
      }
    }

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      dpr = window.devicePixelRatio || 1;
      cw = Math.round(rect.width * dpr);
      ch = Math.round(rect.height * dpr);
      canvas!.width = cw;
      canvas!.height = ch;

      spacingPx = Math.max(1, Math.round(gridSpacing * dpr));
      dotPx = Math.max(1, Math.round(dotSize * dpr));
      cols = Math.floor(cw / spacingPx) + 1;
      rows = Math.floor(ch / spacingPx) + 1;

      displaced.clear();
      buildStaticGrid();
    }

    function onMouseMove(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect();
      mouseX = (e.clientX - rect.left) * dpr;
      mouseY = (e.clientY - rect.top) * dpr;
    }

    function onMouseLeave() {
      mouseX = -9999;
      mouseY = -9999;
    }

    function draw() {
      ctx!.clearRect(0, 0, cw, ch);
      ctx!.drawImage(offscreen, 0, 0);

      const rr = repelRadius * dpr;
      const rr2 = rr * rr;
      const strength = repelStrength * dpr;

      const minCol = Math.max(0, Math.floor((mouseX - rr) / spacingPx) - 1);
      const maxCol = Math.min(cols - 1, Math.ceil((mouseX + rr) / spacingPx) + 1);
      const minRow = Math.max(0, Math.floor((mouseY - rr) / spacingPx) - 1);
      const maxRow = Math.min(rows - 1, Math.ceil((mouseY + rr) / spacingPx) + 1);

      ctx!.fillStyle = dotColor;

      for (let r = minRow; r <= maxRow; r++) {
        for (let c = minCol; c <= maxCol; c++) {
          const ox = c * spacingPx;
          const oy = r * spacingPx;
          const dx = ox - mouseX;
          const dy = oy - mouseY;
          const distSq = dx * dx + dy * dy;

          if (distSq < rr2) {
            const dist = Math.sqrt(distSq);
            const force = (1 - dist / rr) * strength;
            const angle = Math.atan2(dy, dx);
            const key = r * cols + c;

            let dot = displaced.get(key);
            if (!dot) {
              dot = { x: ox, y: oy };
              displaced.set(key, dot);
            }

            dot.x += (ox + Math.cos(angle) * force - dot.x) * 0.2;
            dot.y += (oy + Math.sin(angle) * force - dot.y) * 0.2;

            ctx!.clearRect(ox, oy, dotPx, dotPx);
            ctx!.fillRect(Math.round(dot.x), Math.round(dot.y), dotPx, dotPx);
          }
        }
      }

      for (const [key, dot] of displaced) {
        const c = key % cols;
        const r = Math.floor(key / cols);
        const ox = c * spacingPx;
        const oy = r * spacingPx;
        const dx = ox - mouseX;
        const dy = oy - mouseY;

        if (dx * dx + dy * dy >= rr2) {
          dot.x += (ox - dot.x) * 0.1;
          dot.y += (oy - dot.y) * 0.1;

          if (Math.abs(dot.x - ox) < 0.5 && Math.abs(dot.y - oy) < 0.5) {
            displaced.delete(key);
          } else {
            ctx!.clearRect(ox, oy, dotPx, dotPx);
            ctx!.fillRect(Math.round(dot.x), Math.round(dot.y), dotPx, dotPx);
          }
        }
      }

      if (running) animId = requestAnimationFrame(draw);
    }

    function startLoop() {
      if (running) return;
      running = true;
      animId = requestAnimationFrame(draw);
    }

    function stopLoop() {
      running = false;
      cancelAnimationFrame(animId);
      animId = 0;
    }

    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // Pause the rAF loop when the canvas is scrolled out of view
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) startLoop();
        else stopLoop();
      },
      { threshold: 0 },
    );
    io.observe(canvas);

    window.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseleave", onMouseLeave);

    return () => {
      stopLoop();
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [dotColor, dotSize, gridSpacing, repelRadius, repelStrength]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    />
  );
}
