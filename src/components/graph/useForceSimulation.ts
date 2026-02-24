import { useRef, useCallback, useEffect } from "react";
import type { GraphNode, GraphEdge } from "./graphUtils";

interface SimulationConfig {
  centerStrength: number;
  repulsionStrength: number;
  springStrength: number;
  springLength: number;
  damping: number;
  driftAmplitude: number;
  padding: number;
}

const DEFAULT_CONFIG: SimulationConfig = {
  centerStrength: 0.0001,
  repulsionStrength: 12000,
  springStrength: 0.001,
  springLength: 320,
  damping: 0.96,
  driftAmplitude: 0.015,
  padding: 20,
};

export function useForceSimulation(
  nodes: GraphNode[],
  edges: GraphEdge[],
  containerSize: { width: number; height: number },
  nodeSize: { width: number; height: number },
  onTick: (positions: { x: number; y: number }[]) => void,
  enabled: boolean,
) {
  const nodesRef = useRef(nodes);
  const rafRef = useRef<number>(0);
  const draggedRef = useRef<number | null>(null);
  const hoveredRef = useRef<number | null>(null);
  const timeRef = useRef(0);

  // Keep nodes ref up to date
  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  const startDrag = useCallback((index: number) => {
    draggedRef.current = index;
  }, []);

  const moveDrag = useCallback((x: number, y: number) => {
    if (draggedRef.current !== null) {
      const n = nodesRef.current[draggedRef.current];
      if (n) {
        n.x = x;
        n.y = y;
        n.vx = 0;
        n.vy = 0;
      }
    }
  }, []);

  const endDrag = useCallback(() => {
    draggedRef.current = null;
  }, []);

  const setHovered = useCallback((index: number | null) => {
    hoveredRef.current = index;
    // Kill velocity so it stops in place immediately
    if (index !== null) {
      const n = nodesRef.current[index];
      if (n) {
        n.vx = 0;
        n.vy = 0;
      }
    }
  }, []);

  useEffect(() => {
    if (!enabled || containerSize.width === 0) return;

    const cfg = DEFAULT_CONFIG;
    const cx = containerSize.width / 2;
    const cy = containerSize.height / 2;
    const nw = nodeSize.width;
    const nh = nodeSize.height;

    const tick = () => {
      const ns = nodesRef.current;
      timeRef.current += 1;
      const t = timeRef.current;

      for (let i = 0; i < ns.length; i++) {
        if (i === draggedRef.current || i === hoveredRef.current) continue;

        const node = ns[i];

        // Center gravity
        node.vx += (cx - node.x) * cfg.centerStrength;
        node.vy += (cy - node.y) * cfg.centerStrength;

        // Repulsion from other nodes
        for (let j = 0; j < ns.length; j++) {
          if (i === j) continue;
          const other = ns[j];
          let dx = node.x - other.x;
          let dy = node.y - other.y;
          // Floor distance so overlapping nodes get a strong, stable push
          const rawDist = Math.sqrt(dx * dx + dy * dy);
          const dist = Math.max(rawDist, 80);
          // Nudge apart if perfectly overlapping
          if (rawDist < 1) {
            dx = (Math.random() - 0.5) * 2;
            dy = (Math.random() - 0.5) * 2;
          }
          const force = cfg.repulsionStrength / (dist * dist);
          const nx = rawDist > 1 ? dx / rawDist : dx;
          const ny = rawDist > 1 ? dy / rawDist : dy;
          node.vx += nx * force;
          node.vy += ny * force;
        }

        // Ambient drift — gentle sinusoidal perturbation unique per node
        node.vx += Math.sin(t * 0.02 + i * 2.1) * cfg.driftAmplitude;
        node.vy += Math.cos(t * 0.015 + i * 1.7) * cfg.driftAmplitude;
      }

      // Edge springs
      for (const edge of edges) {
        const si = ns.findIndex((n) => n.id === edge.source);
        const ti = ns.findIndex((n) => n.id === edge.target);
        if (si === -1 || ti === -1) continue;

        const s = ns[si];
        const tgt = ns[ti];
        const dx = tgt.x - s.x;
        const dy = tgt.y - s.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const displacement = dist - cfg.springLength;
        const fx = (dx / dist) * displacement * cfg.springStrength;
        const fy = (dy / dist) * displacement * cfg.springStrength;

        if (si !== draggedRef.current && si !== hoveredRef.current) {
          s.vx += fx;
          s.vy += fy;
        }
        if (ti !== draggedRef.current && ti !== hoveredRef.current) {
          tgt.vx -= fx;
          tgt.vy -= fy;
        }
      }

      // Apply velocity + damping + bounds clamping
      for (let i = 0; i < ns.length; i++) {
        if (i === draggedRef.current || i === hoveredRef.current) continue;
        const node = ns[i];
        node.vx *= cfg.damping;
        node.vy *= cfg.damping;
        node.x += node.vx;
        node.y += node.vy;

        // Bounds clamping (keep node center within padded container)
        const halfW = nw / 2;
        const halfH = nh / 2;
        node.x = Math.max(cfg.padding + halfW, Math.min(containerSize.width - cfg.padding - halfW, node.x));
        node.y = Math.max(cfg.padding + halfH, Math.min(containerSize.height - cfg.padding - halfH, node.y));
      }

      onTick(ns.map((n) => ({ x: n.x, y: n.y })));
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    // Pause when tab hidden
    const handleVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(rafRef.current);
      } else {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      cancelAnimationFrame(rafRef.current);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [enabled, containerSize.width, containerSize.height, edges, nodeSize.width, nodeSize.height, onTick]);

  return { startDrag, moveDrag, endDrag, setHovered };
}
