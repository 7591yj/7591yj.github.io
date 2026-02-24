import { useState, useRef, useCallback, useEffect } from "react";
import { softwareDevelopment, personalProjects } from "../../data/projects";
import {
  computeEdges,
  initialPositions,
  type GraphNode as GraphNodeType,
  type GraphEdge as GraphEdgeType,
} from "./graphUtils";
import { useForceSimulation } from "./useForceSimulation";
import GraphNode from "./GraphNode";
import GraphEdge from "./GraphEdge";

const allProjects = [
  { id: "bizlenz", project: softwareDevelopment[0] },
  { id: "modulino", project: softwareDevelopment[1] },
  { id: "tg-webm", project: personalProjects[0] },
  { id: "fireplace", project: personalProjects[1] },
];

const NODE_WIDTH = 240;
const NODE_HEIGHT = 160;

const edges: GraphEdgeType[] = computeEdges(allProjects);

/** Build adjacency set for fast hover lookups */
function buildAdjacency(edgeList: GraphEdgeType[]): Map<string, Set<string>> {
  const adj = new Map<string, Set<string>>();
  for (const e of edgeList) {
    if (!adj.has(e.source)) adj.set(e.source, new Set());
    if (!adj.has(e.target)) adj.set(e.target, new Set());
    adj.get(e.source)!.add(e.target);
    adj.get(e.target)!.add(e.source);
  }
  return adj;
}

const adjacency = buildAdjacency(edges);

export default function ProjectGraph() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [positions, setPositions] = useState<{ x: number; y: number }[]>([]);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [entered, setEntered] = useState(false);
  const [simulationReady, setSimulationReady] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const nodesRef = useRef<GraphNodeType[]>([]);

  // Measure container + track mobile breakpoint
  useEffect(() => {
    const measure = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({ width: rect.width, height: 600 });
      }
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Trigger entry animation on mount (works for both mobile and desktop)
  useEffect(() => {
    setEntered(true);
  }, []);

  // Initialize node positions once container is measured
  useEffect(() => {
    if (containerSize.width === 0 || isMobile) return;
    const initPos = initialPositions(allProjects.length, containerSize.width, containerSize.height);
    const nodes: GraphNodeType[] = allProjects.map((p, i) => ({
      ...p,
      x: initPos[i].x,
      y: initPos[i].y,
      vx: 0,
      vy: 0,
    }));
    nodesRef.current = nodes;
    setPositions(initPos);

    // Start physics after entry animation completes
    const timer = setTimeout(() => setSimulationReady(true), 500);
    return () => clearTimeout(timer);
  }, [containerSize.width, containerSize.height, isMobile]);

  const onTick = useCallback((pos: { x: number; y: number }[]) => {
    setPositions(pos.map((p) => ({ ...p })));
  }, []);

  const { startDrag, moveDrag, endDrag, setHovered } = useForceSimulation(
    nodesRef.current,
    edges,
    containerSize,
    { width: NODE_WIDTH, height: NODE_HEIGHT },
    onTick,
    simulationReady && !isMobile,
  );

  const handlePointerDown = (index: number) => (e: React.PointerEvent) => {
    if (isMobile) return;
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setDragging(true);
    startDrag(index);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging || isMobile) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    moveDrag(e.clientX - rect.left, e.clientY - rect.top);
  };

  const handlePointerUp = () => {
    setDragging(false);
    endDrag();
  };

  // Determine which nodes/edges are highlighted or dimmed
  const isNodeHighlighted = (id: string) =>
    hoveredNode === id;
  const isNodeConnected = (id: string) =>
    hoveredNode !== null && adjacency.get(hoveredNode)?.has(id);
  const isNodeDimmed = (id: string) =>
    hoveredNode !== null && hoveredNode !== id && !isNodeConnected(id);
  const isEdgeHighlighted = (edge: GraphEdgeType) =>
    hoveredNode !== null && (edge.source === hoveredNode || edge.target === hoveredNode);
  const isEdgeDimmed = (edge: GraphEdgeType) =>
    hoveredNode !== null && !isEdgeHighlighted(edge);

  // Mobile: vertical card stack
  if (isMobile) {
    return (
      <div className="project-graph project-graph--mobile">
        {allProjects.map((p, i) => (
          <div
            key={p.id}
            className="graph-node-mobile-wrapper"
            style={{
              opacity: entered ? 1 : 0,
              transform: entered ? "scale(1)" : "scale(0.95)",
              transition: `opacity 0.4s ${i * 80}ms ease, transform 0.4s ${i * 80}ms ease`,
            }}
          >
            <GraphNode
              project={p.project}
              dimmed={false}
              highlighted={false}
              style={{}}
              onPointerDown={() => {}}
              onPointerEnter={() => {}}
              onPointerLeave={() => {}}
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="project-graph"
      style={{
        position: "relative",
        height: 600,
        cursor: dragging ? "grabbing" : "default",
      }}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* Dot grid background */}
      <div className="project-graph__dot-grid" />

      {/* SVG layer for edges */}
      <svg
        className="project-graph__svg"
        width={containerSize.width}
        height={containerSize.height}
        style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1 }}
      >
        {positions.length > 0 &&
          edges.map((edge, i) => {
            const si = allProjects.findIndex((p) => p.id === edge.source);
            const ti = allProjects.findIndex((p) => p.id === edge.target);
            if (si === -1 || ti === -1) return null;
            return (
              <GraphEdge
                key={`${edge.source}-${edge.target}`}
                x1={positions[si].x}
                y1={positions[si].y}
                x2={positions[ti].x}
                y2={positions[ti].y}
                label={edge.label}
                highlighted={isEdgeHighlighted(edge)}
                dimmed={isEdgeDimmed(edge)}
                animationDelay={0.3 + i * 0.15}
              />
            );
          })}
      </svg>

      {/* Node layer */}
      {positions.map((pos, i) => {
        const p = allProjects[i];
        return (
          <div
            key={p.id}
            style={{
              position: "absolute",
              left: pos.x - NODE_WIDTH / 2,
              top: pos.y - NODE_HEIGHT / 2,
              width: NODE_WIDTH,
              zIndex: 2,
              opacity: entered ? 1 : 0,
              transform: entered ? "scale(1)" : "scale(0.92)",
              transition: simulationReady
                ? "opacity 0.3s ease"
                : `opacity 0.4s ${i * 80}ms ease, transform 0.4s ${i * 80}ms ease`,
              cursor: dragging ? "grabbing" : "grab",
              touchAction: "none",
              userSelect: "none",
            }}
          >
            <GraphNode
              project={p.project}
              dimmed={isNodeDimmed(p.id)}
              highlighted={isNodeHighlighted(p.id)}
              style={{}}
              onPointerDown={handlePointerDown(i)}
              onPointerEnter={() => { setHoveredNode(p.id); setHovered(i); }}
              onPointerLeave={() => { setHoveredNode(null); setHovered(null); }}
            />
          </div>
        );
      })}
    </div>
  );
}
