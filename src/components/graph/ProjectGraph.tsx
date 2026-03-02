import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import "./graph.css";
import type { Project } from "../../types";
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

const NODE_WIDTH = 240;
const NODE_HEIGHT = 160;
const TECH_WIDTH = 90;
const TECH_HEIGHT = 28;
const GRAPH_HEIGHT = 700;

interface Props {
  projects: Project[];
}

function computeGraphVisibility(
  hoveredNode: string | null,
  matchedIds: Set<string> | null,
  adjacency: Map<string, Set<string>>,
) {
  const isNodeHighlighted = (id: string) => hoveredNode === id;
  const isNodeConnected = (id: string) =>
    hoveredNode !== null && adjacency.get(hoveredNode)?.has(id);

  const isProjectDimmedByFilter = (id: string) =>
    matchedIds !== null && !matchedIds.has(id);

  const isTechDimmedByFilter = (techId: string) => {
    if (matchedIds === null) return false;
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

  return { isNodeHighlighted, isNodeDimmed, isEdgeHighlighted, isEdgeDimmed };
}

export default function ProjectGraph({ projects }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [positions, setPositions] = useState<Map<string, { x: number; y: number }>>(new Map());
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [entered, setEntered] = useState(false);
  const [simulationReady, setSimulationReady] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const nodesRef = useRef<GraphNodeType[]>([]);

  // Filter state
  const [activeTags, setActiveTags] = useState<Set<string>>(new Set());
  const [activeTechs, setActiveTechs] = useState<Set<string>>(new Set());

  // Derive all graph data from projects prop
  const {
    projectNodes,
    uniqueTechs,
    techIdSet,
    techIds,
    edges,
    adjacency,
    allTags,
    allTechs,
    nodeSizes,
  } = useMemo(() => {
    const projectNodes = projects.map((p) => ({
      id: p.slug,
      project: p,
    }));

    const techCounts = new Map<string, number>();
    for (const p of projects) {
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

    // Build adjacency set for fast hover lookups
    const adj = new Map<string, Set<string>>();
    for (const e of edges) {
      if (!adj.has(e.source)) adj.set(e.source, new Set());
      if (!adj.has(e.target)) adj.set(e.target, new Set());
      adj.get(e.source)!.add(e.target);
      adj.get(e.target)!.add(e.source);
    }

    const allTags = [...new Set(projects.flatMap((p) => p.tags))].sort();
    const allTechs = [...new Set(projects.flatMap((p) => p.tech))].sort();

    const nodeSizes = [
      ...projectNodes.map(() => ({ width: NODE_WIDTH, height: NODE_HEIGHT })),
      ...uniqueTechs.map(() => ({ width: TECH_WIDTH, height: TECH_HEIGHT })),
    ];

    return {
      projectNodes,
      uniqueTechs,
      techIdSet,
      techIds,
      edges,
      adjacency: adj,
      allTags,
      allTechs,
      nodeSizes,
    };
  }, [projects]);

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
  }, [activeTags, activeTechs, projectNodes]);

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
      ...projectNodes.map((p) => ({
        id: p.id,
        type: "project" as const,
        project: p.project,
        x: initPos.get(p.id)!.x,
        y: initPos.get(p.id)!.y,
        vx: 0,
        vy: 0,
      })),
      ...uniqueTechs.map((t) => ({
        id: `tech:${t}`,
        type: "tech" as const,
        label: t,
        x: initPos.get(`tech:${t}`)!.x,
        y: initPos.get(`tech:${t}`)!.y,
        vx: 0,
        vy: 0,
      })),
    ];
    nodesRef.current = nodes;
    setPositions(initPos);

    // Start physics after entry animation completes
    const timer = setTimeout(() => setSimulationReady(true), 500);
    return () => clearTimeout(timer);
  }, [containerSize.width, containerSize.height, isMobile, projectNodes, techIds, uniqueTechs]);

  const onTick = useCallback((pos: Map<string, { x: number; y: number }>) => {
    setPositions(new Map(pos));
  }, []);

  const { startDrag, moveDrag, endDrag, setHovered } = useForceSimulation(
    nodesRef.current,
    edges,
    containerSize,
    nodeSizes,
    onTick,
    simulationReady && !isMobile,
  );

  const hoverNode = useCallback((id: string | null) => {
    setHoveredNode(id);
    setHovered(id);
  }, [setHovered]);

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

  const { isNodeHighlighted, isNodeDimmed, isEdgeHighlighted, isEdgeDimmed } =
    computeGraphVisibility(hoveredNode, matchedIds, adjacency);

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
          {positions.size > 0 &&
            edges.map((edge, i) => {
              const sp = positions.get(edge.source);
              const tp = positions.get(edge.target);
              if (!sp || !tp) return null;
              return (
                <GraphEdge
                  key={`${edge.source}-${edge.target}`}
                  x1={sp.x}
                  y1={sp.y}
                  x2={tp.x}
                  y2={tp.y}
                  highlighted={isEdgeHighlighted(edge)}
                  dimmed={isEdgeDimmed(edge)}
                  animationDelay={0.3 + i * 0.08}
                />
              );
            })}
        </svg>

        {/* Project node layer */}
        {positions.size > 0 &&
          projectNodes.map((p, i) => {
            const pos = positions.get(p.id);
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
                  onPointerEnter={() => hoverNode(p.id)}
                  onPointerLeave={() => hoverNode(null)}
                />
              </div>
            );
          })}

        {/* Tech node layer */}
        {positions.size > 0 &&
          uniqueTechs.map((t, i) => {
            const idx = projectNodes.length + i;
            const techId = `tech:${t}`;
            const pos = positions.get(techId);
            if (!pos) return null;
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
                  onPointerEnter={() => hoverNode(techId)}
                  onPointerLeave={() => hoverNode(null)}
                />
              </div>
            );
          })}
      </div>
    </>
  );
}
