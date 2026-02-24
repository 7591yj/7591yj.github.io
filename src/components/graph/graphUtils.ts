import type { Project } from "../../types";

export interface GraphNode {
  id: string;
  project: Project;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export interface GraphEdge {
  source: string;
  target: string;
  label: string;
}

/** Maps tech names to canonical forms so e.g. "Next.js" implies "React" */
const techAliases: Record<string, string[]> = {
  "Next.js": ["React"],
};

function getNormalizedTech(tech: string[]): Set<string> {
  const set = new Set<string>();
  for (const t of tech) {
    set.add(t);
    const aliases = techAliases[t];
    if (aliases) {
      for (const a of aliases) set.add(a);
    }
  }
  return set;
}

export function computeEdges(
  nodes: { id: string; project: Project }[],
): GraphEdge[] {
  const edges: GraphEdge[] = [];
  for (let i = 0; i < nodes.length; i++) {
    const techA = getNormalizedTech(nodes[i].project.tech);
    for (let j = i + 1; j < nodes.length; j++) {
      const techB = getNormalizedTech(nodes[j].project.tech);
      const shared: string[] = [];
      for (const t of techA) {
        if (techB.has(t)) shared.push(t);
      }
      if (shared.length > 0) {
        edges.push({
          source: nodes[i].id,
          target: nodes[j].id,
          label: shared.join(", "),
        });
      }
    }
  }
  return edges;
}

/** Spread nodes in a rough circle around the center */
export function initialPositions(
  count: number,
  width: number,
  height: number,
): { x: number; y: number }[] {
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) * 0.38;
  return Array.from({ length: count }, (_, i) => {
    const angle = (2 * Math.PI * i) / count - Math.PI / 2;
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    };
  });
}
