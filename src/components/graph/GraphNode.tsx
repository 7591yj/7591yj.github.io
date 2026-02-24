import { useRef } from "react";
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

const DRAG_THRESHOLD = 5;

export default function GraphNode({
  project,
  dimmed,
  highlighted,
  style,
  onPointerDown,
  onPointerEnter,
  onPointerLeave,
}: Props) {
  const pointerOrigin = useRef<{ x: number; y: number } | null>(null);

  const hasLink = !!(project.slug || project.href);
  const linkTarget = project.slug
    ? `/projects/${project.slug}`
    : project.href ?? undefined;
  const isExternal = !project.slug && !!project.href;

  const handleLinkPointerDown = (e: React.PointerEvent) => {
    pointerOrigin.current = { x: e.clientX, y: e.clientY };
  };

  const handleLinkClick = (e: React.MouseEvent) => {
    if (pointerOrigin.current) {
      const dx = e.clientX - pointerOrigin.current.x;
      const dy = e.clientY - pointerOrigin.current.y;
      if (Math.sqrt(dx * dx + dy * dy) > DRAG_THRESHOLD) {
        e.preventDefault();
      }
    }
    pointerOrigin.current = null;
  };

  const nodeClasses = [
    "graph-node",
    !hasLink && "graph-node--no-link",
    project.current && "graph-node--current",
  ]
    .filter(Boolean)
    .join(" ");

  const borderClasses = [
    "graph-node__border",
    project.current && "graph-node__border--current",
    highlighted && "graph-node__border--highlighted",
  ]
    .filter(Boolean)
    .join(" ");

  const borderStyle: React.CSSProperties =
    project.current && !highlighted
      ? {}
      : {
          background: highlighted
            ? "var(--color-border-hover)"
            : "var(--color-border)",
        };

  return (
    <div
      className={nodeClasses}
      style={{
        ...style,
        opacity: dimmed ? 0.4 : 1,
        transition: "opacity 0.3s ease",
      }}
      onPointerDown={onPointerDown}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      <div className={borderClasses} style={borderStyle}>
        <div className="graph-node__inner">
          <div className="graph-node__header">
            <span
              className={`graph-node__led ${project.status === "released" ? "led--released" : "led--indev"}`}
            />
            {hasLink ? (
              <a
                className="graph-node__title graph-node__title--link"
                href={linkTarget}
                {...(isExternal
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                onPointerDown={handleLinkPointerDown}
                onClick={handleLinkClick}
              >
                {project.title}
                <span className="graph-node__arrow">
                  {isExternal ? "\u2197" : "\u2192"}
                </span>
              </a>
            ) : (
              <h3 className="graph-node__title">{project.title}</h3>
            )}
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
