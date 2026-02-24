interface Props {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  highlighted: boolean;
  dimmed: boolean;
  animationDelay: number;
}

export default function GraphEdge({
  x1,
  y1,
  x2,
  y2,
  highlighted,
  dimmed,
  animationDelay,
}: Props) {
  const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={highlighted ? "var(--color-accent)" : "var(--color-border-hover)"}
      strokeWidth={1.5}
      strokeDasharray="6 4"
      strokeDashoffset={length}
      style={{
        opacity: dimmed ? 0.4 : 1,
        transition: "stroke 0.3s ease, opacity 0.3s ease",
        animation: `graph-edge-draw 0.6s ${animationDelay}s ease forwards`,
      }}
    />
  );
}
