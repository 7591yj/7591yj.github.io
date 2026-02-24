interface Props {
  label: string;
  dimmed: boolean;
  highlighted: boolean;
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerEnter: () => void;
  onPointerLeave: () => void;
}

export default function TechNode({
  label,
  dimmed,
  highlighted,
  onPointerDown,
  onPointerEnter,
  onPointerLeave,
}: Props) {
  return (
    <div
      className="tech-node"
      style={{
        opacity: dimmed ? 0.4 : 1,
        transition: "opacity 0.3s ease",
      }}
      onPointerDown={onPointerDown}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      <div
        className="tech-node__border"
        style={{
          background: highlighted
            ? "var(--color-border-hover)"
            : "var(--color-border)",
        }}
      >
        <div className="tech-node__inner">{label}</div>
      </div>
    </div>
  );
}
