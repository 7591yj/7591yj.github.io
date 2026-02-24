import type { Project } from "../../types";

interface Props {
  project: Project;
  dimmed: boolean;
  highlighted: boolean;
  style: React.CSSProperties;
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerEnter: () => void;
  onPointerLeave: () => void;
}

export default function GraphNode({
  project,
  dimmed,
  highlighted,
  style,
  onPointerDown,
  onPointerEnter,
  onPointerLeave,
}: Props) {
  return (
    <div
      className="graph-node"
      style={{
        ...style,
        opacity: dimmed ? 0.4 : 1,
        transition: "opacity 0.3s ease",
      }}
      onPointerDown={onPointerDown}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      <div
        className="graph-node__border"
        style={{
          background: highlighted
            ? "var(--color-border-hover)"
            : "var(--color-border)",
        }}
      >
        <div className="graph-node__inner">
          <div className="graph-node__header">
            <span
              className={`graph-node__led ${project.status === "released" ? "led--released" : "led--indev"}`}
            />
            <h3 className="graph-node__title">{project.title}</h3>
          </div>
          <p className="graph-node__subtitle">{project.subtitle}</p>
          <div className="graph-node__tech">
            {project.tech.map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
