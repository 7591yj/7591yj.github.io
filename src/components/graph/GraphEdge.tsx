interface Props {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label: string;
  highlighted: boolean;
  dimmed: boolean;
  animationDelay: number;
}

export default function GraphEdge({
  x1,
  y1,
  x2,
  y2,
  label,
  highlighted,
  dimmed,
  animationDelay,
}: Props) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

  return (
    <g
      style={{
        opacity: dimmed ? 0.4 : 1,
        transition: "opacity 0.3s ease",
      }}
    >
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
          transition: "stroke 0.3s ease",
          animation: `graph-edge-draw 0.6s ${animationDelay}s ease forwards`,
        }}
      />
      <text
        x={mx}
        y={my - 8}
        textAnchor="middle"
        fill={highlighted ? "var(--color-accent)" : "var(--color-text-muted)"}
        fontFamily="monospace"
        fontSize="0.65rem"
        style={{
          transition: "fill 0.3s ease",
          opacity: 0,
          animation: `graph-fade-in 0.4s ${animationDelay + 0.3}s ease forwards`,
        }}
      >
        {label}
      </text>
    </g>
  );
}
