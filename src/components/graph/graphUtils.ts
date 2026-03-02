import type { Project } from "../../types";

export interface GraphNode {
  id: string;
  type: "project" | "tech";
  project?: Project;
  label?: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export interface GraphEdge {
  source: string;
  target: string;
}

export function computeTechEdges(
  projectNodes: { id: string; project: Project }[],
): GraphEdge[] {
  return projectNodes.flatMap((p) =>
    p.project.tech.map((t) => ({ source: p.id, target: `tech:${t}` })),
  );
}

/**
 * Place project nodes in an outer ring, tech nodes at the centroid
 * of their connected projects
 */
export function initialPositions(
  projectNodes: { id: string; project: Project }[],
  techIds: string[],
  width: number,
  height: number,
): Map<string, { x: number; y: number }> {
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) * 0.35;

  // Project nodes: outer ring
  const projectPositions = projectNodes.map((_, i) => {
    const angle = (2 * Math.PI * i) / projectNodes.length - Math.PI / 2;
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    };
  });

  // Tech nodes: centroid of connected projects
  const techPositions = techIds.map((techId) => {
    const rawTech = techId.replace("tech:", "");
    const connected = projectNodes
      .map((p, i) => ({ p, i }))
      .filter(({ p }) => p.project.tech.includes(rawTech));

    if (connected.length === 0) return { x: cx, y: cy };

    const avgX =
      connected.reduce((sum, { i }) => sum + projectPositions[i]!.x, 0) /
      connected.length;
    const avgY =
      connected.reduce((sum, { i }) => sum + projectPositions[i]!.y, 0) /
      connected.length;

    return { x: avgX, y: avgY };
  });

  const result = new Map<string, { x: number; y: number }>();
  projectNodes.forEach((p, i) => result.set(p.id, projectPositions[i]!));
  techIds.forEach((id, i) => result.set(id, techPositions[i]!));
  return result;
}
