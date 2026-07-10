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
  internalBasePath?: string;
}

const DRAG_THRESHOLD = 5;
const NO_LINK_CLASS = "graph-node--no-link";
const CURRENT_CLASS = "graph-node--current";
const BORDER_CURRENT_CLASS = "graph-node__border--current";
const BORDER_HIGHLIGHTED_CLASS = "graph-node__border--highlighted";

interface LinkTarget {
  href?: string;
  isExternal: boolean;
}

function resolveLinkTarget(project: Project, basePath: string): LinkTarget {
  const normalized = basePath.replace(/\/$/, "");
  if (project.slug) {
    return { href: `${normalized}/${project.slug}`, isExternal: false };
  }
  return { href: project.href ?? undefined, isExternal: !!project.href };
}

function nodeBodyClassName(hasLink: boolean, isCurrent: boolean): string {
  const classes = ["graph-node"];
  if (!hasLink) classes.push(NO_LINK_CLASS);
  if (isCurrent) classes.push(CURRENT_CLASS);
  return classes.join(" ");
}

function borderClassName(isCurrent: boolean, highlighted: boolean): string {
  const classes = ["graph-node__border"];
  if (isCurrent) classes.push(BORDER_CURRENT_CLASS);
  if (highlighted) classes.push(BORDER_HIGHLIGHTED_CLASS);
  return classes.join(" ");
}

function borderStyleFor(
  project: Project,
  highlighted: boolean,
): React.CSSProperties {
  if (project.current && !highlighted) return {};
  return {
    background: highlighted
      ? "var(--color-border-hover)"
      : "var(--color-border)",
  };
}

function nodeBodyStyle(
  style: React.CSSProperties,
  dimmed: boolean,
): React.CSSProperties {
  return {
    ...style,
    opacity: dimmed ? 0.4 : 1,
    transition: "opacity 0.3s ease",
  };
}

function ledClassName(status: string): string {
  return `graph-node__led ${status === "released" ? "led--released" : "led--indev"}`;
}

function isDragSquashable(
  origin: { x: number; y: number } | null,
  e: React.MouseEvent,
): boolean {
  if (!origin) return false;
  const dx = e.clientX - origin.x;
  const dy = e.clientY - origin.y;
  return Math.sqrt(dx * dx + dy * dy) > DRAG_THRESHOLD;
}

function arrowGlyph(isExternal: boolean): string {
  return isExternal ? "\u2197" : "\u2192";
}

function externalLinkProps(
  isExternal: boolean,
): React.AnchorHTMLAttributes<HTMLAnchorElement> {
  return isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {};
}

interface LinkAnchorProps {
  project: Project;
  link: LinkTarget;
}

function LinkAnchor({ project, link }: LinkAnchorProps) {
  const pointerOrigin = useRef<{ x: number; y: number } | null>(null);

  const onLinkPointerDown = (e: React.PointerEvent) => {
    pointerOrigin.current = { x: e.clientX, y: e.clientY };
  };

  const onLinkClick = (e: React.MouseEvent) => {
    if (isDragSquashable(pointerOrigin.current, e)) e.preventDefault();
    pointerOrigin.current = null;
  };

  return (
    <a
      className="graph-node__title graph-node__title--link"
      href={link.href}
      {...externalLinkProps(link.isExternal)}
      onPointerDown={onLinkPointerDown}
      onClick={onLinkClick}
    >
      {project.title}
      <span className="graph-node__arrow">{arrowGlyph(link.isExternal)}</span>
    </a>
  );
}

interface NodeTitleProps {
  project: Project;
  link: LinkTarget;
}

function NodeTitle({ project, link }: NodeTitleProps) {
  if (link.href === undefined) {
    return <h3 className="graph-node__title">{project.title}</h3>;
  }
  return <LinkAnchor project={project} link={link} />;
}

export default function GraphNode({
  project,
  dimmed,
  highlighted,
  style,
  onPointerDown,
  onPointerEnter,
  onPointerLeave,
  internalBasePath = "/projects",
}: Props) {
  const link = resolveLinkTarget(project, internalBasePath);
  const hasLink = link.href !== undefined;

  return (
    <div
      className={nodeBodyClassName(hasLink, !!project.current)}
      style={nodeBodyStyle(style, dimmed)}
      onPointerDown={onPointerDown}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      <div
        className={borderClassName(!!project.current, highlighted)}
        style={borderStyleFor(project, highlighted)}
      >
        <div className="graph-node__inner">
          <div className="graph-node__header">
            <span className={ledClassName(project.status)} />
            <NodeTitle project={project} link={link} />
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
