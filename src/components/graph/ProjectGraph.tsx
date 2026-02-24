import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { allProjects } from "../../data/projects";
import {
  computeTechEdges,
  initialPositions,
  type GraphNode as GraphNodeType,
  type GraphEdge as GraphEdgeType,
} from "./graphUtils";
import { useForceSimulation } from "./useForceSimulation";
import GraphNode from "./GraphNode";
import TechNode from "./TechNode";
import GraphEdge from "./GraphEdge";
import FilterBar from "./FilterBar";

const projectNodes = allProjects.map((p, i) => ({
  id: ["bizlenz", "modulino", "tg-webm", "fireplace"][i],
  project: p,
}));

const NODE_WIDTH = 240;
const NODE_HEIGHT = 160;
const TECH_WIDTH = 90;
const TECH_HEIGHT = 28;
const GRAPH_HEIGHT = 700;

// Only show techs shared by projects
const techCounts = new Map<string, number>();
for (const p of allProjects) {
  for (const t of p.tech) {
    techCounts.set(t, (techCounts.get(t) || 0) + 1);
  }
}
const uniqueTechs = [...techCounts.entries()]
  .filter(([, count]) => count >= 2)
  .map(([t]) => t)
  .sort();
const techIdSet = new Set(uniqueTechs.map((t) => `tech:${t}`));
const techIds = [...techIdSet];

const allEdges: GraphEdgeType[] = computeTechEdges(projectNodes);
const edges = allEdges.filter((e) => techIdSet.has(e.target));

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

/** Derive unique sorted tags and techs from project data */
const allTags = [...new Set(allProjects.flatMap((p) => p.tags))].sort();
const allTechs = [...new Set(allProjects.flatMap((p) => p.tech))].sort();

/** Total node count: projects first, then techs */
const totalNodeCount = projectNodes.length + uniqueTechs.length;

/** Per-node sizes array (projects first, then techs) */
const nodeSizes = [
  ...projectNodes.map(() => ({ width: NODE_WIDTH, height: NODE_HEIGHT })),
  ...uniqueTechs.map(() => ({ width: TECH_WIDTH, height: TECH_HEIGHT })),
];

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

  // Filter state
  const [activeTags, setActiveTags] = useState<Set<string>>(new Set());
  const [activeTechs, setActiveTechs] = useState<Set<string>>(new Set());

  const toggleTag = useCallback((tag: string) => {
    setActiveTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  }, []);

  const toggleTech = useCallback((tech: string) => {
    setActiveTechs((prev) => {
      const next = new Set(prev);
      if (next.has(tech)) next.delete(tech);
      else next.add(tech);
      return next;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setActiveTags(new Set());
    setActiveTechs(new Set());
  }, []);

  // Determine which project IDs match active filters
  const matchedIds = useMemo(() => {
    const hasTagFilter = activeTags.size > 0;
    const hasTechFilter = activeTechs.size > 0;
    if (!hasTagFilter && !hasTechFilter) return null; // null = no filter active

    const ids = new Set<string>();
    for (const node of projectNodes) {
      const matchesTag =
        !hasTagFilter || node.project.tags.some((t) => activeTags.has(t));
      const matchesTech =
        !hasTechFilter || node.project.tech.some((t) => activeTechs.has(t));
      if (matchesTag && matchesTech) ids.add(node.id);
    }
    return ids;
  }, [activeTags, activeTechs]);

  // Measure container + track mobile breakpoint
  useEffect(() => {
    const measure = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({ width: rect.width, height: GRAPH_HEIGHT });
      }
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Trigger entry animation on mount
  useEffect(() => {
    setEntered(true);
  }, []);

  // Initialize node positions once container is measured
  useEffect(() => {
    if (containerSize.width === 0 || isMobile) return;
    const initPos = initialPositions(
      projectNodes,
      techIds,
      containerSize.width,
      containerSize.height,
    );

    const nodes: GraphNodeType[] = [
      ...projectNodes.map((p, i) => ({
        id: p.id,
        type: "project" as const,
        project: p.project,
        x: initPos[i].x,
        y: initPos[i].y,
        vx: 0,
        vy: 0,
      })),
      ...uniqueTechs.map((t, i) => ({
        id: `tech:${t}`,
        type: "tech" as const,
        label: t,
        x: initPos[projectNodes.length + i].x,
        y: initPos[projectNodes.length + i].y,
        vx: 0,
        vy: 0,
      })),
    ];
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
    nodeSizes,
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
  const isNodeHighlighted = (id: string) => hoveredNode === id;
  const isNodeConnected = (id: string) =>
    hoveredNode !== null && adjacency.get(hoveredNode)?.has(id);

  const isProjectDimmedByFilter = (id: string) =>
    matchedIds !== null && !matchedIds.has(id);

  const isTechDimmedByFilter = (techId: string) => {
    if (matchedIds === null) return false;
    // A tech node is dimmed if ALL its connected projects are dimmed
    const connectedProjects = adjacency.get(techId);
    if (!connectedProjects) return true;
    return [...connectedProjects].every((pid) => !matchedIds.has(pid));
  };

  const isNodeDimmed = (id: string) => {
    const dimmedByHover =
      hoveredNode !== null && hoveredNode !== id && !isNodeConnected(id);
    const dimmedByFilter = id.startsWith("tech:")
      ? isTechDimmedByFilter(id)
      : isProjectDimmedByFilter(id);
    return dimmedByHover || dimmedByFilter;
  };

  const isEdgeHighlighted = (edge: GraphEdgeType) =>
    hoveredNode !== null &&
    (edge.source === hoveredNode || edge.target === hoveredNode);
  const isEdgeDimmed = (edge: GraphEdgeType) => {
    const dimmedByHover = hoveredNode !== null && !isEdgeHighlighted(edge);
    const dimmedByFilter =
      matchedIds !== null &&
      (!matchedIds.has(edge.source) || isTechDimmedByFilter(edge.target));
    return dimmedByHover || dimmedByFilter;
  };

  /** Map from node id to its index in positions array */
  const nodeIndex = useMemo(() => {
    const map = new Map<string, number>();
    projectNodes.forEach((p, i) => map.set(p.id, i));
    uniqueTechs.forEach((t, i) =>
      map.set(`tech:${t}`, projectNodes.length + i),
    );
    return map;
  }, []);

  const filterBar = (
    <FilterBar
      allTags={allTags}
      allTechs={allTechs}
      activeTags={activeTags}
      activeTechs={activeTechs}
      onToggleTag={toggleTag}
      onToggleTech={toggleTech}
      onClear={clearFilters}
    />
  );

  // Mobile: vertical card stack
  if (isMobile) {
    return (
      <div className="project-graph project-graph--mobile">
        {filterBar}
        {projectNodes.map((p, i) => (
          <div
            key={p.id}
            className="graph-node-mobile-wrapper"
            style={{
              opacity: entered ? (isNodeDimmed(p.id) ? 0.4 : 1) : 0,
              transform: entered ? "scale(1)" : "scale(0.95)",
              transition: `opacity 0.4s ${i * 80}ms ease, transform 0.4s ${i * 80}ms ease`,
            }}
          >
            <GraphNode
              project={p.project}
              dimmed={isNodeDimmed(p.id)}
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
    <>
      {filterBar}
      <div
        ref={containerRef}
        className="project-graph"
        style={{
          position: "relative",
          height: GRAPH_HEIGHT,
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
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            zIndex: 1,
          }}
        >
          {positions.length > 0 &&
            edges.map((edge, i) => {
              const si = nodeIndex.get(edge.source);
              const ti = nodeIndex.get(edge.target);
              if (si === undefined || ti === undefined) return null;
              if (!positions[si] || !positions[ti]) return null;
              return (
                <GraphEdge
                  key={`${edge.source}-${edge.target}`}
                  x1={positions[si].x}
                  y1={positions[si].y}
                  x2={positions[ti].x}
                  y2={positions[ti].y}
                  highlighted={isEdgeHighlighted(edge)}
                  dimmed={isEdgeDimmed(edge)}
                  animationDelay={0.3 + i * 0.08}
                />
              );
            })}
        </svg>

        {/* Project node layer */}
        {positions.length > 0 &&
          projectNodes.map((p, i) => {
            const pos = positions[i];
            if (!pos) return null;
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
                  onPointerEnter={() => {
                    setHoveredNode(p.id);
                    setHovered(i);
                  }}
                  onPointerLeave={() => {
                    setHoveredNode(null);
                    setHovered(null);
                  }}
                />
              </div>
            );
          })}

        {/* Tech node layer */}
        {positions.length > 0 &&
          uniqueTechs.map((t, i) => {
            const idx = projectNodes.length + i;
            const pos = positions[idx];
            if (!pos) return null;
            const techId = `tech:${t}`;
            return (
              <div
                key={techId}
                style={{
                  position: "absolute",
                  left: pos.x - TECH_WIDTH / 2,
                  top: pos.y - TECH_HEIGHT / 2,
                  width: TECH_WIDTH,
                  zIndex: 3,
                  opacity: entered ? 1 : 0,
                  transform: entered ? "scale(1)" : "scale(0.92)",
                  transition: simulationReady
                    ? "opacity 0.3s ease"
                    : `opacity 0.4s ${(projectNodes.length + i) * 60}ms ease, transform 0.4s ${(projectNodes.length + i) * 60}ms ease`,
                  cursor: dragging ? "grabbing" : "grab",
                  touchAction: "none",
                  userSelect: "none",
                }}
              >
                <TechNode
                  label={t}
                  dimmed={isNodeDimmed(techId)}
                  highlighted={isNodeHighlighted(techId)}
                  onPointerDown={handlePointerDown(idx)}
                  onPointerEnter={() => {
                    setHoveredNode(techId);
                    setHovered(idx);
                  }}
                  onPointerLeave={() => {
                    setHoveredNode(null);
                    setHovered(null);
                  }}
                />
              </div>
            );
          })}
      </div>
    </>
  );
}
