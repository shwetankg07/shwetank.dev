// Server-rendered SVG sparkline — no JS, no chart library.
export default function Sparkline({
  data,
  className = "",
}: {
  data: number[];
  className?: string;
}) {
  const w = 120;
  const h = 28;
  const pad = 2;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    return [x, y] as const;
  });
  const path = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ");
  const [lx, ly] = points[points.length - 1];

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      className={className}
      aria-hidden
    >
      <path d={path} fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx={lx} cy={ly} r="2.5" fill="var(--color-npmred)" />
    </svg>
  );
}
