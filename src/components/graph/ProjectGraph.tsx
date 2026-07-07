import {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
  type CSSProperties,
  type PointerEvent,
  type ReactNode,
  type RefObject,
} from "react";
import "./graph.css";
import type { GraphEdge as GraphEdgeType } from "./graphUtils";
import type { Project } from "../../types";
import { useForceSimulation } from "./useForceSimulation";
import GraphNode from "./GraphNode";
import TechNode from "./TechNode";
import GraphEdge from "./GraphEdge";
import FilterBar from "./FilterBar";
import {
  buildInitialGraph,
  buildProjectGraphData,
  findMatchedProjectIds,
  getGraphVisibility,
  type ProjectGraphNode,
} from "./projectGraphModel";

const NODE_WIDTH = 240;
const NODE_HEIGHT = 160;
const TECH_WIDTH = 90;
const TECH_HEIGHT = 28;
const GRAPH_HEIGHT = 700;

interface Props {
  projects: Project[];
  selectTechLabel: string;
  techSelectedTemplate: string;
  clearLabel: string;
  internalBasePath?: string;
}

type PositionMap = Map<string, { x: number; y: number }>;
type Visibility = ReturnType<typeof getGraphVisibility>;
type PointerDownFactory = (index: number) => (e: PointerEvent) => void;

function graphDimensions() {
  return {
    project: { width: NODE_WIDTH, height: NODE_HEIGHT },
    tech: { width: TECH_WIDTH, height: TECH_HEIGHT },
  };
}

function useContainerMeasurement(
  containerRef: RefObject<HTMLDivElement | null>,
) {
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const measure = () => {
      const isMobileViewport = window.innerWidth <= 768;
      setIsMobile(isMobileViewport);
      if (isMobileViewport || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setContainerSize({ width: rect.width, height: GRAPH_HEIGHT });
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [containerRef]);

  return { containerSize, isMobile };
}

function useEnteredAnimation(): boolean {
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return entered;
}

function useSimulationReady(nodeCount: number): boolean {
  const [simulationReady, setSimulationReady] = useState(false);

  useEffect(() => {
    if (nodeCount === 0) return;
    const timer = setTimeout(() => setSimulationReady(true), 500);
    return () => clearTimeout(timer);
  }, [nodeCount]);

  return simulationReady;
}

const SCALE_FULL = "scale(1)";
const SCALE_ENTRY = "scale(0.92)";
const SCALE_MOBILE_ENTRY = "scale(0.95)";
const OPACITY_TRANSITION = "opacity 0.3s ease";

function entryScale(entered: boolean): string {
  return entered ? SCALE_FULL : SCALE_ENTRY;
}

function mobileEntryScale(entered: boolean): string {
  return entered ? SCALE_FULL : SCALE_MOBILE_ENTRY;
}

function mobileOpacity(entered: boolean, dimmed: boolean): number {
  if (!entered) return 0;
  return dimmed ? 0.4 : 1;
}

function cursorForDragging(dragging: boolean, idleCursor: string): string {
  return dragging ? "grabbing" : idleCursor;
}

function delayedEntryTransition(index: number, delayMs: number): string {
  return `opacity 0.4s ${index * delayMs}ms ease, transform 0.4s ${index * delayMs}ms ease`;
}

function nodeTransition(simulationReady: boolean, index: number): string {
  return simulationReady
    ? OPACITY_TRANSITION
    : delayedEntryTransition(index, 80);
}

function techTransition(
  simulationReady: boolean,
  projectCount: number,
  index: number,
): string {
  return simulationReady
    ? OPACITY_TRANSITION
    : delayedEntryTransition(projectCount + index, 60);
}

function mobileWrapperStyle(
  entered: boolean,
  dimmed: boolean,
  index: number,
): CSSProperties {
  return {
    opacity: mobileOpacity(entered, dimmed),
    transform: mobileEntryScale(entered),
    transition: delayedEntryTransition(index, 80),
  };
}

function graphCanvasStyle(dragging: boolean): CSSProperties {
  return {
    position: "relative",
    height: GRAPH_HEIGHT,
    cursor: cursorForDragging(dragging, "default"),
  };
}

function svgStyle(): CSSProperties {
  return {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    zIndex: 1,
  };
}

function projectSpriteStyle(
  position: { x: number; y: number },
  entered: boolean,
  simulationReady: boolean,
  dragging: boolean,
  index: number,
): CSSProperties {
  return {
    position: "absolute",
    left: position.x - NODE_WIDTH / 2,
    top: position.y - NODE_HEIGHT / 2,
    width: NODE_WIDTH,
    zIndex: 2,
    opacity: entered ? 1 : 0,
    transform: entryScale(entered),
    transition: nodeTransition(simulationReady, index),
    cursor: cursorForDragging(dragging, "grab"),
    touchAction: "none",
    userSelect: "none",
  };
}

function techSpriteStyle(
  position: { x: number; y: number },
  entered: boolean,
  simulationReady: boolean,
  dragging: boolean,
  projectCount: number,
  index: number,
): CSSProperties {
  return {
    position: "absolute",
    left: position.x - TECH_WIDTH / 2,
    top: position.y - TECH_HEIGHT / 2,
    width: TECH_WIDTH,
    zIndex: 3,
    opacity: entered ? 1 : 0,
    transform: entryScale(entered),
    transition: techTransition(simulationReady, projectCount, index),
    cursor: cursorForDragging(dragging, "grab"),
    touchAction: "none",
    userSelect: "none",
  };
}

interface FilterControlsProps {
  allTags: string[];
  allTechs: string[];
  activeTags: Set<string>;
  activeTechs: Set<string>;
  onToggleTag: (tag: string) => void;
  onToggleTech: (tech: string) => void;
  onClear: () => void;
  selectTechLabel: string;
  techSelectedTemplate: string;
  clearLabel: string;
}

function FilterControls(props: FilterControlsProps) {
  return <FilterBar {...props} />;
}

interface MobileGraphViewProps {
  filterControls: ReactNode;
  projectNodes: ProjectGraphNode[];
  visibility: Visibility;
  entered: boolean;
  internalBasePath?: string;
}

function MobileGraphView({
  filterControls,
  projectNodes,
  visibility,
  entered,
  internalBasePath,
}: MobileGraphViewProps) {
  return (
    <div className="project-graph project-graph--mobile">
      {filterControls}
      {projectNodes.map((node, index) => (
        <MobileProjectNode
          key={node.id}
          node={node}
          index={index}
          dimmed={visibility.isNodeDimmed(node.id)}
          entered={entered}
          internalBasePath={internalBasePath}
        />
      ))}
    </div>
  );
}

interface MobileProjectNodeProps {
  node: ProjectGraphNode;
  index: number;
  dimmed: boolean;
  entered: boolean;
  internalBasePath?: string;
}

function noopPointer() {}

function MobileProjectNode({
  node,
  index,
  dimmed,
  entered,
  internalBasePath,
}: MobileProjectNodeProps) {
  return (
    <div
      className="graph-node-mobile-wrapper"
      style={mobileWrapperStyle(entered, dimmed, index)}
    >
      <GraphNode
        project={node.project}
        dimmed={dimmed}
        highlighted={false}
        style={{}}
        onPointerDown={noopPointer}
        onPointerEnter={noopPointer}
        onPointerLeave={noopPointer}
        internalBasePath={internalBasePath}
      />
    </div>
  );
}

interface EdgeLayerProps {
  edges: GraphEdgeType[];
  positions: PositionMap;
  visibility: Visibility;
  width: number;
  height: number;
}

function EdgeLayer({
  edges,
  positions,
  visibility,
  width,
  height,
}: EdgeLayerProps) {
  return (
    <svg
      className="project-graph__svg"
      width={width}
      height={height}
      style={svgStyle()}
    >
      {positions.size > 0 &&
        edges.map((edge, index) => (
          <PositionedEdge
            key={`${edge.source}-${edge.target}`}
            edge={edge}
            index={index}
            positions={positions}
            visibility={visibility}
          />
        ))}
    </svg>
  );
}

interface PositionedEdgeProps {
  edge: GraphEdgeType;
  index: number;
  positions: PositionMap;
  visibility: Visibility;
}

function edgeEndpoints(edge: GraphEdgeType, positions: PositionMap) {
  const source = positions.get(edge.source);
  const target = positions.get(edge.target);
  if (!source || !target) return null;
  return { source, target };
}

function PositionedEdge({
  edge,
  index,
  positions,
  visibility,
}: PositionedEdgeProps) {
  const endpoints = edgeEndpoints(edge, positions);
  if (!endpoints) return null;

  return (
    <GraphEdge
      x1={endpoints.source.x}
      y1={endpoints.source.y}
      x2={endpoints.target.x}
      y2={endpoints.target.y}
      highlighted={visibility.isEdgeHighlighted(edge)}
      dimmed={visibility.isEdgeDimmed(edge)}
      animationDelay={0.3 + index * 0.08}
    />
  );
}

interface ProjectNodeLayerProps {
  projectNodes: ProjectGraphNode[];
  positions: PositionMap;
  visibility: Visibility;
  entered: boolean;
  simulationReady: boolean;
  dragging: boolean;
  onPointerDown: PointerDownFactory;
  onHover: (id: string | null) => void;
  internalBasePath?: string;
}

function ProjectNodeLayer({
  projectNodes,
  positions,
  visibility,
  entered,
  simulationReady,
  dragging,
  onPointerDown,
  onHover,
  internalBasePath,
}: ProjectNodeLayerProps) {
  if (positions.size === 0) return null;

  return (
    <>
      {projectNodes.map((node, index) => (
        <ProjectNodeSprite
          key={node.id}
          node={node}
          index={index}
          position={positions.get(node.id)}
          visibility={visibility}
          entered={entered}
          simulationReady={simulationReady}
          dragging={dragging}
          onPointerDown={onPointerDown}
          onHover={onHover}
          internalBasePath={internalBasePath}
        />
      ))}
    </>
  );
}

interface ProjectNodeSpriteProps {
  node: ProjectGraphNode;
  index: number;
  position: { x: number; y: number } | undefined;
  visibility: Visibility;
  entered: boolean;
  simulationReady: boolean;
  dragging: boolean;
  onPointerDown: PointerDownFactory;
  onHover: (id: string | null) => void;
  internalBasePath?: string;
}

function ProjectNodeSprite({
  node,
  index,
  position,
  visibility,
  entered,
  simulationReady,
  dragging,
  onPointerDown,
  onHover,
  internalBasePath,
}: ProjectNodeSpriteProps) {
  if (!position) return null;

  return (
    <div
      style={projectSpriteStyle(
        position,
        entered,
        simulationReady,
        dragging,
        index,
      )}
    >
      <GraphNode
        project={node.project}
        dimmed={visibility.isNodeDimmed(node.id)}
        highlighted={visibility.isNodeHighlighted(node.id)}
        style={{}}
        onPointerDown={onPointerDown(index)}
        onPointerEnter={() => onHover(node.id)}
        onPointerLeave={() => onHover(null)}
        internalBasePath={internalBasePath}
      />
    </div>
  );
}

interface TechNodeLayerProps {
  uniqueTechs: string[];
  projectCount: number;
  positions: PositionMap;
  visibility: Visibility;
  entered: boolean;
  simulationReady: boolean;
  dragging: boolean;
  onPointerDown: PointerDownFactory;
  onHover: (id: string | null) => void;
}

function TechNodeLayer({
  uniqueTechs,
  projectCount,
  positions,
  visibility,
  entered,
  simulationReady,
  dragging,
  onPointerDown,
  onHover,
}: TechNodeLayerProps) {
  if (positions.size === 0) return null;

  return (
    <>
      {uniqueTechs.map((tech, index) => (
        <TechNodeSprite
          key={`tech:${tech}`}
          tech={tech}
          index={index}
          projectCount={projectCount}
          position={positions.get(`tech:${tech}`)}
          visibility={visibility}
          entered={entered}
          simulationReady={simulationReady}
          dragging={dragging}
          onPointerDown={onPointerDown}
          onHover={onHover}
        />
      ))}
    </>
  );
}

interface TechNodeSpriteProps {
  tech: string;
  index: number;
  projectCount: number;
  position: { x: number; y: number } | undefined;
  visibility: Visibility;
  entered: boolean;
  simulationReady: boolean;
  dragging: boolean;
  onPointerDown: PointerDownFactory;
  onHover: (id: string | null) => void;
}

function TechNodeSprite({
  tech,
  index,
  projectCount,
  position,
  visibility,
  entered,
  simulationReady,
  dragging,
  onPointerDown,
  onHover,
}: TechNodeSpriteProps) {
  if (!position) return null;

  const techId = `tech:${tech}`;
  const nodeIndex = projectCount + index;

  return (
    <div
      style={techSpriteStyle(
        position,
        entered,
        simulationReady,
        dragging,
        projectCount,
        index,
      )}
    >
      <TechNode
        label={tech}
        dimmed={visibility.isNodeDimmed(techId)}
        highlighted={visibility.isNodeHighlighted(techId)}
        onPointerDown={onPointerDown(nodeIndex)}
        onPointerEnter={() => onHover(techId)}
        onPointerLeave={() => onHover(null)}
      />
    </div>
  );
}

interface GraphCanvasProps {
  containerRef: RefObject<HTMLDivElement | null>;
  containerSize: { width: number; height: number };
  projectNodes: ProjectGraphNode[];
  uniqueTechs: string[];
  edges: GraphEdgeType[];
  positions: PositionMap;
  visibility: Visibility;
  entered: boolean;
  simulationReady: boolean;
  dragging: boolean;
  onPointerMove: (e: PointerEvent) => void;
  onPointerUp: () => void;
  onPointerDown: PointerDownFactory;
  onHover: (id: string | null) => void;
  internalBasePath?: string;
}

type CanvasLayersProps = Omit<
  GraphCanvasProps,
  "containerRef" | "onPointerMove" | "onPointerUp"
>;

function CanvasLayers({
  containerSize,
  projectNodes,
  uniqueTechs,
  edges,
  positions,
  visibility,
  entered,
  simulationReady,
  dragging,
  onPointerDown,
  onHover,
  internalBasePath,
}: CanvasLayersProps) {
  return (
    <>
      <EdgeLayer
        edges={edges}
        positions={positions}
        visibility={visibility}
        width={containerSize.width}
        height={containerSize.height}
      />
      <ProjectNodeLayer
        projectNodes={projectNodes}
        positions={positions}
        visibility={visibility}
        entered={entered}
        simulationReady={simulationReady}
        dragging={dragging}
        onPointerDown={onPointerDown}
        onHover={onHover}
        internalBasePath={internalBasePath}
      />
      <TechNodeLayer
        uniqueTechs={uniqueTechs}
        projectCount={projectNodes.length}
        positions={positions}
        visibility={visibility}
        entered={entered}
        simulationReady={simulationReady}
        dragging={dragging}
        onPointerDown={onPointerDown}
        onHover={onHover}
      />
    </>
  );
}

function GraphCanvas({
  containerRef,
  dragging,
  onPointerMove,
  onPointerUp,
  ...layerProps
}: GraphCanvasProps) {
  return (
    <div
      ref={containerRef}
      className="project-graph"
      style={graphCanvasStyle(dragging)}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      <div className="project-graph__dot-grid" />
      <CanvasLayers dragging={dragging} {...layerProps} />
    </div>
  );
}

function toggledSet(prev: Set<string>, value: string): Set<string> {
  const next = new Set(prev);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}

function useProjectFilters() {
  const [activeTags, setActiveTags] = useState<Set<string>>(new Set());
  const [activeTechs, setActiveTechs] = useState<Set<string>>(new Set());

  const toggleTag = useCallback((tag: string) => {
    setActiveTags((prev) => toggledSet(prev, tag));
  }, []);

  const toggleTech = useCallback((tech: string) => {
    setActiveTechs((prev) => toggledSet(prev, tech));
  }, []);

  const clearFilters = useCallback(() => {
    setActiveTags(new Set());
    setActiveTechs(new Set());
  }, []);

  return { activeTags, activeTechs, toggleTag, toggleTech, clearFilters };
}

function usePreparedGraph(
  projects: Project[],
  activeTags: Set<string>,
  activeTechs: Set<string>,
  containerSize: { width: number; height: number },
  isMobile: boolean,
) {
  const graphData = useMemo(
    () => buildProjectGraphData(projects, graphDimensions()),
    [projects],
  );
  const matchedIds = useMemo(
    () =>
      findMatchedProjectIds(graphData.projectNodes, activeTags, activeTechs),
    [activeTags, activeTechs, graphData.projectNodes],
  );
  const initialGraph = useMemo(
    () => buildInitialGraph(graphData, containerSize, isMobile),
    [containerSize, graphData, isMobile],
  );
  const simulationReady = useSimulationReady(initialGraph.nodes.length);

  return { graphData, matchedIds, initialGraph, simulationReady };
}

function pointerOffset(
  containerRef: RefObject<HTMLDivElement | null>,
  e: PointerEvent,
) {
  const rect = containerRef.current?.getBoundingClientRect();
  if (!rect) return null;
  return { x: e.clientX - rect.left, y: e.clientY - rect.top };
}

function canMoveDrag(dragging: boolean, isMobile: boolean): boolean {
  return dragging && !isMobile;
}

interface GraphPositionOptions {
  graphData: ReturnType<typeof buildProjectGraphData>;
  initialGraph: ReturnType<typeof buildInitialGraph>;
  containerSize: { width: number; height: number };
  simulationReady: boolean;
  isMobile: boolean;
}

function useGraphPositions({
  graphData,
  initialGraph,
  containerSize,
  simulationReady,
  isMobile,
}: GraphPositionOptions) {
  const [positions, setPositions] = useState<PositionMap>(new Map());
  const onTick = useCallback((pos: PositionMap) => {
    setPositions(new Map(pos));
  }, []);
  const controls = useForceSimulation(
    initialGraph.nodes,
    graphData.edges,
    containerSize,
    graphData.nodeSizes,
    onTick,
    simulationReady && !isMobile,
  );

  return {
    ...controls,
    positions: positions.size > 0 ? positions : initialGraph.positions,
  };
}

interface PointerDragOptions {
  containerRef: RefObject<HTMLDivElement | null>;
  isMobile: boolean;
  startDrag: (index: number) => void;
  moveDrag: (x: number, y: number) => void;
  endDrag: () => void;
}

function usePointerDragHandlers({
  containerRef,
  isMobile,
  startDrag,
  moveDrag,
  endDrag,
}: PointerDragOptions) {
  const [dragging, setDragging] = useState(false);

  const handlePointerDown = useCallback(
    (index: number) => (e: PointerEvent) => {
      if (isMobile) return;
      e.preventDefault();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      setDragging(true);
      startDrag(index);
    },
    [isMobile, startDrag],
  );

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (!canMoveDrag(dragging, isMobile)) return;
      const offset = pointerOffset(containerRef, e);
      if (offset) moveDrag(offset.x, offset.y);
    },
    [containerRef, dragging, isMobile, moveDrag],
  );

  const handlePointerUp = useCallback(() => {
    setDragging(false);
    endDrag();
  }, [endDrag]);

  return { dragging, handlePointerDown, handlePointerMove, handlePointerUp };
}

function useGraphInteractions(
  containerRef: RefObject<HTMLDivElement | null>,
  graphData: ReturnType<typeof buildProjectGraphData>,
  initialGraph: ReturnType<typeof buildInitialGraph>,
  matchedIds: Set<string> | null,
  containerSize: { width: number; height: number },
  simulationReady: boolean,
  isMobile: boolean,
) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const graphPositions = useGraphPositions({
    graphData,
    initialGraph,
    containerSize,
    simulationReady,
    isMobile,
  });
  const dragHandlers = usePointerDragHandlers({
    containerRef,
    isMobile,
    startDrag: graphPositions.startDrag,
    moveDrag: graphPositions.moveDrag,
    endDrag: graphPositions.endDrag,
  });
  const hoverNode = useCallback(
    (id: string | null) => {
      setHoveredNode(id);
      graphPositions.setHovered(id);
    },
    [graphPositions],
  );

  return {
    hoverNode,
    positions: graphPositions.positions,
    visibility: getGraphVisibility(
      hoveredNode,
      matchedIds,
      graphData.adjacency,
    ),
    ...dragHandlers,
  };
}

interface FilterLabels {
  selectTechLabel: string;
  techSelectedTemplate: string;
  clearLabel: string;
}

function filterControlsFor(
  graphData: ReturnType<typeof buildProjectGraphData>,
  filters: ReturnType<typeof useProjectFilters>,
  labels: FilterLabels,
) {
  return (
    <FilterControls
      allTags={graphData.allTags}
      allTechs={graphData.allTechs}
      activeTags={filters.activeTags}
      activeTechs={filters.activeTechs}
      onToggleTag={filters.toggleTag}
      onToggleTech={filters.toggleTech}
      onClear={filters.clearFilters}
      selectTechLabel={labels.selectTechLabel}
      techSelectedTemplate={labels.techSelectedTemplate}
      clearLabel={labels.clearLabel}
    />
  );
}

interface DesktopGraphViewProps {
  containerRef: RefObject<HTMLDivElement | null>;
  containerSize: { width: number; height: number };
  filterControls: ReactNode;
  graph: ReturnType<typeof usePreparedGraph>;
  interactions: ReturnType<typeof useGraphInteractions>;
  entered: boolean;
  internalBasePath?: string;
}

function DesktopGraphView({
  containerRef,
  containerSize,
  filterControls,
  graph,
  interactions,
  entered,
  internalBasePath,
}: DesktopGraphViewProps) {
  return (
    <>
      {filterControls}
      <GraphCanvas
        containerRef={containerRef}
        containerSize={containerSize}
        projectNodes={graph.graphData.projectNodes}
        uniqueTechs={graph.graphData.uniqueTechs}
        edges={graph.graphData.edges}
        positions={interactions.positions}
        visibility={interactions.visibility}
        entered={entered}
        simulationReady={graph.simulationReady}
        dragging={interactions.dragging}
        onPointerMove={interactions.handlePointerMove}
        onPointerUp={interactions.handlePointerUp}
        onPointerDown={interactions.handlePointerDown}
        onHover={interactions.hoverNode}
        internalBasePath={internalBasePath}
      />
    </>
  );
}

interface ProjectGraphContentProps extends DesktopGraphViewProps {
  isMobile: boolean;
}

function ProjectGraphContent({
  isMobile,
  filterControls,
  graph,
  interactions,
  entered,
  internalBasePath,
  ...desktopProps
}: ProjectGraphContentProps) {
  if (isMobile) {
    return (
      <MobileGraphView
        filterControls={filterControls}
        projectNodes={graph.graphData.projectNodes}
        visibility={interactions.visibility}
        entered={entered}
        internalBasePath={internalBasePath}
      />
    );
  }

  return (
    <DesktopGraphView
      filterControls={filterControls}
      graph={graph}
      interactions={interactions}
      entered={entered}
      internalBasePath={internalBasePath}
      {...desktopProps}
    />
  );
}

export default function ProjectGraph({
  projects,
  selectTechLabel,
  techSelectedTemplate,
  clearLabel,
  internalBasePath,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { containerSize, isMobile } = useContainerMeasurement(containerRef);
  const entered = useEnteredAnimation();
  const filters = useProjectFilters();
  const graph = usePreparedGraph(
    projects,
    filters.activeTags,
    filters.activeTechs,
    containerSize,
    isMobile,
  );
  const interactions = useGraphInteractions(
    containerRef,
    graph.graphData,
    graph.initialGraph,
    graph.matchedIds,
    containerSize,
    graph.simulationReady,
    isMobile,
  );
  const filterControls = filterControlsFor(graph.graphData, filters, {
    selectTechLabel,
    techSelectedTemplate,
    clearLabel,
  });

  return (
    <ProjectGraphContent
      containerRef={containerRef}
      containerSize={containerSize}
      filterControls={filterControls}
      graph={graph}
      interactions={interactions}
      entered={entered}
      isMobile={isMobile}
      internalBasePath={internalBasePath}
    />
  );
}
