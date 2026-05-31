import { useTelemetry } from "@/lib/useTelemetry";
import type { Telemetry } from "@/lib/telemetry-types";

/**
 * F1-style circular speed gauge.
 * Red arc, large central speed readout, KM/H label.
 */
export function F1SpeedGauge({ t }: { t?: Telemetry }) {
  const telemetry = t ?? useTelemetry();
  const speed = Math.round(telemetry.speedKph);
  const maxSpeed = 340; // F1-class ceiling
  const pct = Math.min(1, speed / maxSpeed);

  // Arc params: 240° sweep, starting at 150° (bottom-left)
  const startAngle = 150;
  const sweep = 240;
  const endAngle = startAngle + sweep * pct;
  const r = 54;
  const cx = 64;
  const cy = 64;

  const polarToCart = (deg: number) => ({
    x: cx + r * Math.cos((deg * Math.PI) / 180),
    y: cy + r * Math.sin((deg * Math.PI) / 180),
  });

  const bgStart = polarToCart(startAngle);
  const bgEnd = polarToCart(startAngle + sweep);
  const arcEnd = polarToCart(endAngle);
  const largeArcBg = sweep > 180 ? 1 : 0;
  const largeArc = (endAngle - startAngle) > 180 ? 1 : 0;

  const bgPath = `M ${bgStart.x} ${bgStart.y} A ${r} ${r} 0 ${largeArcBg} 1 ${bgEnd.x} ${bgEnd.y}`;
  const arcPath = pct > 0.001
    ? `M ${bgStart.x} ${bgStart.y} A ${r} ${r} 0 ${largeArc} 1 ${arcEnd.x} ${arcEnd.y}`
    : "";

  // Color: green → amber → red
  const arcColor = speed > 280 ? "var(--destructive)" : speed > 200 ? "#ffb300" : "var(--ch-throttle)";

  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className="text-[9px] uppercase tracking-wider text-muted-foreground">Speed</div>
      <svg viewBox="0 0 128 128" className="w-full max-w-[160px]" aria-label={`Speed: ${speed} KM/H`}>
        {/* Background arc */}
        <path d={bgPath} fill="none" stroke="var(--border)" strokeWidth="6" strokeLinecap="round" />
        {/* Active arc */}
        {arcPath && (
          <path d={arcPath} fill="none" stroke={arcColor} strokeWidth="6" strokeLinecap="round" />
        )}
        {/* Speed number */}
        <text x={cx} y={cy - 2} textAnchor="middle" dominantBaseline="central"
          className="fill-foreground" style={{ fontSize: "32px", fontFamily: "var(--font-mono)", fontWeight: 700 }}>
          {speed}
        </text>
        {/* Unit label */}
        <text x={cx} y={cy + 20} textAnchor="middle"
          className="fill-muted-foreground" style={{ fontSize: "9px", fontFamily: "var(--font-mono)", letterSpacing: "0.1em" }}>
          KM/H
        </text>
      </svg>
    </div>
  );
}
