import { useMemo } from "react";

export function MiniTrace({ values, color }: { values: number[]; color: string }) {
  const w = 100;
  const h = 20;

  if (values.length < 2) {
    return <span className="inline-block w-[100px] text-[9px] text-zinc-600">...</span>;
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(1e-6, max - min);

  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * (w - 1);
      const y = h - 1 - ((v - min) / span) * (h - 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  // Build gradient fill path
  const firstX = "0";
  const lastX = (((values.length - 1) / (values.length - 1)) * (w - 1)).toFixed(1);
  const fillPoints = `0,${h} ${points} ${lastX},${h}`;
  const gradId = `mg_${color.replace(/[^a-z0-9]/gi, "")}`;

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="block">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <polygon points={fillPoints} fill={`url(#${gradId})`} />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Current value dot */}
      {values.length > 0 && (
        <circle
          cx={(((values.length - 1) / (values.length - 1)) * (w - 1)).toFixed(1)}
          cy={(h - 1 - ((values[values.length - 1] - min) / span) * (h - 2)).toFixed(1)}
          r="2"
          fill={color}
        />
      )}
    </svg>
  );
}
