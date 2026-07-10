import { useRef, useCallback, useEffect } from "react";
import type { RefObject } from "react";
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
  springLength: 200,
  damping: 0.96,
  driftAmplitude: 0.015,
  padding: 20,
};

type Excluded = readonly [number | null, number | null];

function isExcluded(idx: number, excluded: Excluded): boolean {
  return idx === excluded[0] || idx === excluded[1];
}

function findNodeIndex(nodes: GraphNode[], id: string): number {
  return nodes.findIndex((n) => n.id === id);
}

function unitComponent(delta: number, rawDist: number): number {
  return rawDist > 1 ? delta / rawDist : delta;
}

function addRepulsionForces(
  node: GraphNode,
  i: number,
  ns: GraphNode[],
  cfg: SimulationConfig,
): void {
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
    node.vx += unitComponent(dx, rawDist) * force;
    node.vy += unitComponent(dy, rawDist) * force;
  }
}

function applyNodeForces(
  ns: GraphNode[],
  cfg: SimulationConfig,
  cx: number,
  cy: number,
  t: number,
  excluded: Excluded,
): void {
  for (let i = 0; i < ns.length; i++) {
    if (isExcluded(i, excluded)) continue;
    const node = ns[i];
    // Center gravity
    node.vx += (cx - node.x) * cfg.centerStrength;
    node.vy += (cy - node.y) * cfg.centerStrength;
    // Repulsion from other nodes
    addRepulsionForces(node, i, ns, cfg);
    // Ambient drift — gentle sinusoidal perturbation unique per node
    node.vx += Math.sin(t * 0.02 + i * 2.1) * cfg.driftAmplitude;
    node.vy += Math.cos(t * 0.015 + i * 1.7) * cfg.driftAmplitude;
  }
}

interface EdgeEndpoints {
  si: number;
  ti: number;
  fx: number;
  fy: number;
}

function resolveEdgeEndpoints(
  ns: GraphNode[],
  edge: GraphEdge,
  cfg: SimulationConfig,
): EdgeEndpoints | null {
  const si = findNodeIndex(ns, edge.source);
  const ti = findNodeIndex(ns, edge.target);
  if (si === -1 || ti === -1) return null;

  const s = ns[si];
  const tgt = ns[ti];
  const dx = tgt.x - s.x;
  const dy = tgt.y - s.y;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;
  const displacement = dist - cfg.springLength;
  return {
    si,
    ti,
    fx: (dx / dist) * displacement * cfg.springStrength,
    fy: (dy / dist) * displacement * cfg.springStrength,
  };
}

function applySpringForce(
  node: GraphNode,
  idx: number,
  fx: number,
  fy: number,
  sign: number,
  excluded: Excluded,
): void {
  if (isExcluded(idx, excluded)) return;
  node.vx += sign * fx;
  node.vy += sign * fy;
}

function applyEdgeSprings(
  ns: GraphNode[],
  edges: GraphEdge[],
  cfg: SimulationConfig,
  excluded: Excluded,
): void {
  for (const edge of edges) {
    const ep = resolveEdgeEndpoints(ns, edge, cfg);
    if (!ep) continue;
    applySpringForce(ns[ep.si], ep.si, ep.fx, ep.fy, 1, excluded);
    applySpringForce(ns[ep.ti], ep.ti, ep.fx, ep.fy, -1, excluded);
  }
}

function clampToBounds(
  node: GraphNode,
  size: { width: number; height: number },
  cfg: SimulationConfig,
  containerSize: { width: number; height: number },
): void {
  const halfW = size.width / 2;
  const halfH = size.height / 2;
  node.x = Math.max(
    cfg.padding + halfW,
    Math.min(containerSize.width - cfg.padding - halfW, node.x),
  );
  node.y = Math.max(
    cfg.padding + halfH,
    Math.min(containerSize.height - cfg.padding - halfH, node.y),
  );
}

function integrateNodes(
  ns: GraphNode[],
  cfg: SimulationConfig,
  containerSize: { width: number; height: number },
  nodeSizes: { width: number; height: number }[],
  excluded: Excluded,
): void {
  for (let i = 0; i < ns.length; i++) {
    if (isExcluded(i, excluded)) continue;
    const node = ns[i];
    // Apply velocity + damping
    node.vx *= cfg.damping;
    node.vy *= cfg.damping;
    node.x += node.vx;
    node.y += node.vy;
    // Bounds clamping using per-node size
    clampToBounds(node, nodeSizes[i] || nodeSizes[0], cfg, containerSize);
  }
}

function buildPositionMap(
  ns: GraphNode[],
): Map<string, { x: number; y: number }> {
  return new Map(ns.map((n) => [n.id, { x: n.x, y: n.y }]));
}

function stepSimulation(
  ns: GraphNode[],
  edges: GraphEdge[],
  cfg: SimulationConfig,
  cx: number,
  cy: number,
  containerSize: { width: number; height: number },
  nodeSizes: { width: number; height: number }[],
  t: number,
  excluded: Excluded,
): void {
  applyNodeForces(ns, cfg, cx, cy, t, excluded);
  applyEdgeSprings(ns, edges, cfg, excluded);
  integrateNodes(ns, cfg, containerSize, nodeSizes, excluded);
}

interface DragControls {
  startDrag: (index: number) => void;
  moveDrag: (x: number, y: number) => void;
  endDrag: () => void;
  setHovered: (id: string | null) => void;
}

interface DragControlState extends DragControls {
  draggedRef: RefObject<number | null>;
  hoveredRef: RefObject<number | null>;
}

function useGraphDragControls(
  nodesRef: RefObject<GraphNode[]>,
): DragControlState {
  const draggedRef = useRef<number | null>(null);
  const hoveredRef = useRef<number | null>(null);

  const startDrag = useCallback((index: number) => {
    draggedRef.current = index;
  }, []);

  const moveDrag = useCallback(
    (x: number, y: number) => {
      if (draggedRef.current !== null) {
        const n = nodesRef.current[draggedRef.current];
        if (n) {
          n.x = x;
          n.y = y;
          n.vx = 0;
          n.vy = 0;
        }
      }
    },
    [nodesRef],
  );

  const endDrag = useCallback(() => {
    draggedRef.current = null;
  }, []);

  const setHovered = useCallback(
    (id: string | null) => {
      if (id === null) {
        hoveredRef.current = null;
        return;
      }
      const idx = findNodeIndex(nodesRef.current, id);
      hoveredRef.current = idx >= 0 ? idx : null;
      const n = nodesRef.current[idx];
      if (n) {
        n.vx = 0;
        n.vy = 0;
      }
    },
    [nodesRef],
  );

  return { draggedRef, hoveredRef, startDrag, moveDrag, endDrag, setHovered };
}

function startSimulationLoop(
  nodesRef: RefObject<GraphNode[]>,
  edges: GraphEdge[],
  containerSize: { width: number; height: number },
  nodeSizes: { width: number; height: number }[],
  onTick: (positions: Map<string, { x: number; y: number }>) => void,
  draggedRef: RefObject<number | null>,
  hoveredRef: RefObject<number | null>,
  rafRef: RefObject<number>,
  timeRef: RefObject<number>,
): () => void {
  const cfg = DEFAULT_CONFIG;
  const cx = containerSize.width / 2;
  const cy = containerSize.height / 2;

  const tick = () => {
    const ns = nodesRef.current;
    const t = (timeRef.current += 1);
    stepSimulation(ns, edges, cfg, cx, cy, containerSize, nodeSizes, t, [
      draggedRef.current,
      hoveredRef.current,
    ]);
    onTick(buildPositionMap(ns));
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
}

function useSimulationLoop(
  nodesRef: RefObject<GraphNode[]>,
  edges: GraphEdge[],
  containerSize: { width: number; height: number },
  nodeSizes: { width: number; height: number }[],
  onTick: (positions: Map<string, { x: number; y: number }>) => void,
  enabled: boolean,
  draggedRef: RefObject<number | null>,
  hoveredRef: RefObject<number | null>,
): void {
  const rafRef = useRef<number>(0);
  const timeRef = useRef(0);

  useEffect(() => {
    if (!enabled || containerSize.width === 0) return;
    return startSimulationLoop(
      nodesRef,
      edges,
      containerSize,
      nodeSizes,
      onTick,
      draggedRef,
      hoveredRef,
      rafRef,
      timeRef,
    );
  }, [
    enabled,
    containerSize.width,
    containerSize.height,
    edges,
    nodeSizes,
    onTick,
    nodesRef,
    draggedRef,
    hoveredRef,
  ]);
}

export function useForceSimulation(
  nodes: GraphNode[],
  edges: GraphEdge[],
  containerSize: { width: number; height: number },
  nodeSizes: { width: number; height: number }[],
  onTick: (positions: Map<string, { x: number; y: number }>) => void,
  enabled: boolean,
) {
  const nodesRef = useRef(nodes);

  // Keep nodes ref up to date
  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  const { draggedRef, hoveredRef, startDrag, moveDrag, endDrag, setHovered } =
    useGraphDragControls(nodesRef);

  useSimulationLoop(
    nodesRef,
    edges,
    containerSize,
    nodeSizes,
    onTick,
    enabled,
    draggedRef,
    hoveredRef,
  );

  return { startDrag, moveDrag, endDrag, setHovered };
}
