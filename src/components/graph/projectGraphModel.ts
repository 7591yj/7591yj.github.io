import type { Project } from "../../types";
import {
  computeTechEdges,
  initialPositions,
  type GraphEdge,
  type GraphNode,
} from "./graphUtils";

export interface Size {
  width: number;
  height: number;
}

export interface GraphDimensions {
  project: Size;
  tech: Size;
}

export interface ProjectGraphNode {
  id: string;
  project: Project;
}

export interface ProjectGraphData {
  projectNodes: ProjectGraphNode[];
  uniqueTechs: string[];
  techIds: string[];
  edges: GraphEdge[];
  adjacency: Map<string, Set<string>>;
  allTags: string[];
  allTechs: string[];
  nodeSizes: Size[];
}

export interface InitialGraph {
  positions: Map<string, { x: number; y: number }>;
  nodes: GraphNode[];
}

interface VisibilityState {
  hoveredNode: string | null;
  matchedIds: Set<string> | null;
  adjacency: Map<string, Set<string>>;
}

function toProjectNode(project: Project): ProjectGraphNode {
  return { id: project.slug, project };
}

function countProjectTechs(projects: Project[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const project of projects) {
    for (const tech of project.tech) {
      counts.set(tech, (counts.get(tech) ?? 0) + 1);
    }
  }
  return counts;
}

function sharedTechNames(projects: Project[]): string[] {
  return [...countProjectTechs(projects).entries()]
    .filter(([, count]) => count >= 2)
    .map(([tech]) => tech)
    .sort();
}

function toTechId(tech: string): string {
  return `tech:${tech}`;
}

function filteredTechEdges(
  projectNodes: ProjectGraphNode[],
  techIdSet: Set<string>,
): GraphEdge[] {
  return computeTechEdges(projectNodes).filter((edge) =>
    techIdSet.has(edge.target),
  );
}

function adjacencyBucket(
  adjacency: Map<string, Set<string>>,
  id: string,
): Set<string> {
  const bucket = adjacency.get(id);
  if (bucket) return bucket;
  const next = new Set<string>();
  adjacency.set(id, next);
  return next;
}

function connectEdge(
  adjacency: Map<string, Set<string>>,
  edge: GraphEdge,
): void {
  adjacencyBucket(adjacency, edge.source).add(edge.target);
  adjacencyBucket(adjacency, edge.target).add(edge.source);
}

function buildAdjacency(edges: GraphEdge[]): Map<string, Set<string>> {
  const adjacency = new Map<string, Set<string>>();
  for (const edge of edges) connectEdge(adjacency, edge);
  return adjacency;
}

function sortedUnique(values: string[]): string[] {
  return [...new Set(values)].sort();
}

function repeatedSizes(count: number, size: Size): Size[] {
  return Array.from({ length: count }, () => size);
}

function buildNodeSizes(
  projectCount: number,
  techCount: number,
  dimensions: GraphDimensions,
): Size[] {
  return [
    ...repeatedSizes(projectCount, dimensions.project),
    ...repeatedSizes(techCount, dimensions.tech),
  ];
}

export function buildProjectGraphData(
  projects: Project[],
  dimensions: GraphDimensions,
): ProjectGraphData {
  const projectNodes = projects.map(toProjectNode);
  const uniqueTechs = sharedTechNames(projects);
  const techIdSet = new Set(uniqueTechs.map(toTechId));
  const techIds = [...techIdSet];
  const edges = filteredTechEdges(projectNodes, techIdSet);

  return {
    projectNodes,
    uniqueTechs,
    techIds,
    edges,
    adjacency: buildAdjacency(edges),
    allTags: sortedUnique(projects.flatMap((project) => project.tags)),
    allTechs: sortedUnique(projects.flatMap((project) => project.tech)),
    nodeSizes: buildNodeSizes(
      projectNodes.length,
      uniqueTechs.length,
      dimensions,
    ),
  };
}

function hasActiveFilters(
  activeTags: Set<string>,
  activeTechs: Set<string>,
): boolean {
  return activeTags.size + activeTechs.size > 0;
}

function selectionMatches(
  values: string[],
  activeValues: Set<string>,
): boolean {
  return (
    activeValues.size === 0 || values.some((value) => activeValues.has(value))
  );
}

function projectMatchesFilters(
  project: Project,
  activeTags: Set<string>,
  activeTechs: Set<string>,
): boolean {
  return (
    selectionMatches(project.tags, activeTags) &&
    selectionMatches(project.tech, activeTechs)
  );
}

export function findMatchedProjectIds(
  projectNodes: ProjectGraphNode[],
  activeTags: Set<string>,
  activeTechs: Set<string>,
): Set<string> | null {
  if (!hasActiveFilters(activeTags, activeTechs)) return null;
  return new Set(
    projectNodes
      .filter((node) =>
        projectMatchesFilters(node.project, activeTags, activeTechs),
      )
      .map((node) => node.id),
  );
}

function emptyInitialGraph(): InitialGraph {
  return { positions: new Map<string, { x: number; y: number }>(), nodes: [] };
}

function shouldSkipInitialGraph(
  containerSize: Size,
  isMobile: boolean,
): boolean {
  return containerSize.width === 0 || isMobile;
}

function projectSimulationNodes(
  projectNodes: ProjectGraphNode[],
  positions: Map<string, { x: number; y: number }>,
): GraphNode[] {
  return projectNodes.map((node) => {
    const position = positions.get(node.id)!;
    return {
      id: node.id,
      type: "project" as const,
      project: node.project,
      x: position.x,
      y: position.y,
      vx: 0,
      vy: 0,
    };
  });
}

function techSimulationNodes(
  uniqueTechs: string[],
  positions: Map<string, { x: number; y: number }>,
): GraphNode[] {
  return uniqueTechs.map((tech) => {
    const id = toTechId(tech);
    const position = positions.get(id)!;
    return {
      id,
      type: "tech" as const,
      label: tech,
      x: position.x,
      y: position.y,
      vx: 0,
      vy: 0,
    };
  });
}

export function buildInitialGraph(
  data: ProjectGraphData,
  containerSize: Size,
  isMobile: boolean,
): InitialGraph {
  if (shouldSkipInitialGraph(containerSize, isMobile))
    return emptyInitialGraph();

  const positions = initialPositions(
    data.projectNodes,
    data.techIds,
    containerSize.width,
    containerSize.height,
  );

  return {
    positions,
    nodes: [
      ...projectSimulationNodes(data.projectNodes, positions),
      ...techSimulationNodes(data.uniqueTechs, positions),
    ],
  };
}

function isTechNodeId(id: string): boolean {
  return id.startsWith("tech:");
}

function isConnectedToHovered(id: string, state: VisibilityState): boolean {
  const hovered = state.hoveredNode;
  return hovered !== null && state.adjacency.get(hovered)?.has(id) === true;
}

function isDimmedByHover(id: string, state: VisibilityState): boolean {
  if (state.hoveredNode === null) return false;
  return state.hoveredNode !== id && !isConnectedToHovered(id, state);
}

function isProjectDimmedByFilter(id: string, state: VisibilityState): boolean {
  return state.matchedIds !== null && !state.matchedIds.has(id);
}

function isTechDimmedByFilter(techId: string, state: VisibilityState): boolean {
  if (state.matchedIds === null) return false;
  const connectedProjects = state.adjacency.get(techId);
  if (!connectedProjects) return true;
  return [...connectedProjects].every(
    (projectId) => !state.matchedIds!.has(projectId),
  );
}

function isDimmedByFilter(id: string, state: VisibilityState): boolean {
  return isTechNodeId(id)
    ? isTechDimmedByFilter(id, state)
    : isProjectDimmedByFilter(id, state);
}

function edgeTouchesHovered(edge: GraphEdge, state: VisibilityState): boolean {
  const hovered = state.hoveredNode;
  return (
    hovered !== null && (edge.source === hovered || edge.target === hovered)
  );
}

function isEdgeDimmedByHover(edge: GraphEdge, state: VisibilityState): boolean {
  return state.hoveredNode !== null && !edgeTouchesHovered(edge, state);
}

function isEdgeDimmedByFilter(
  edge: GraphEdge,
  state: VisibilityState,
): boolean {
  return (
    state.matchedIds !== null &&
    (!state.matchedIds.has(edge.source) ||
      isTechDimmedByFilter(edge.target, state))
  );
}

export function getGraphVisibility(
  hoveredNode: string | null,
  matchedIds: Set<string> | null,
  adjacency: Map<string, Set<string>>,
) {
  const state = { hoveredNode, matchedIds, adjacency };
  return {
    isNodeHighlighted: (id: string) => hoveredNode === id,
    isNodeDimmed: (id: string) =>
      isDimmedByHover(id, state) || isDimmedByFilter(id, state),
    isEdgeHighlighted: (edge: GraphEdge) => edgeTouchesHovered(edge, state),
    isEdgeDimmed: (edge: GraphEdge) =>
      isEdgeDimmedByHover(edge, state) || isEdgeDimmedByFilter(edge, state),
  };
}
