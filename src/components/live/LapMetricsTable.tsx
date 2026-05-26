import { useState, useMemo } from "react";
import type { Sample } from "@/lib/useTelemetryBuffer";

export interface LapMetric {
  lapNumber: number;
  lapTime: number | null;
  sector1: number | null;
  sector2: number | null;
  sector3: number | null;
  avgSpeed: number;
  maxGLat: number;
  maxGLon: number;
  minGLon: number;
  fuelAtEnd: number;
  status: "in-progress" | "complete" | "invalid";
}

interface LapMetricsTableProps {
  samples: Sample[];
}

type SortKey = keyof LapMetric;
type SortOrder = "asc" | "desc";

export function LapMetricsTable({ samples }: LapMetricsTableProps) {
  const [sortBy, setSortBy] = useState<SortKey>("lapNumber");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [statusFilter, setStatusFilter] = useState<"all" | "complete" | "in-progress">("all");

  // Generate mock lap data from samples
  const lapMetrics = useMemo<LapMetric[]>(() => {
    if (samples.length === 0) return [];

    // Simulate laps by dividing samples into chunks
    const lapsCount = Math.max(1, Math.floor(samples.length / 240)); // ~240 samples per lap at 60Hz = ~4s
    const laps: LapMetric[] = [];

    for (let lap = 0; lap < lapsCount; lap++) {
      const startIdx = lap * 120;
      const endIdx = Math.min(startIdx + 120, samples.length);
      const lapSamples = samples.slice(startIdx, endIdx);

      if (lapSamples.length === 0) continue;

      const speeds = lapSamples.map((s) => s.speed);
      const gLats = lapSamples.map((s) => Math.abs(s.gLat));
      const gLons = lapSamples.map((s) => s.gLon);

      const lapTime = (lapSamples[lapSamples.length - 1].t - lapSamples[0].t) / 1000;
      const avgSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length;
      const maxGLat = Math.max(...gLats);
      const maxGLon = Math.max(...gLons);
      const minGLon = Math.min(...gLons);

      // Simulate sector times (divide into 3 parts)
      const sectorLen = Math.floor(lapSamples.length / 3);
      const s1Time = sectorLen > 0 ? (lapSamples[sectorLen - 1].t - lapSamples[0].t) / 1000 : null;
      const s2Time =
        sectorLen * 2 > 0
          ? (lapSamples[Math.min(sectorLen * 2 - 1, lapSamples.length - 1)].t -
              lapSamples[sectorLen].t) /
            1000
          : null;
      const s3Time =
        sectorLen * 2 < lapSamples.length
          ? (lapSamples[lapSamples.length - 1].t -
              lapSamples[Math.min(sectorLen * 2, lapSamples.length - 1)].t) /
            1000
          : null;

      laps.push({
        lapNumber: lap + 1,
        lapTime,
        sector1: s1Time,
        sector2: s2Time,
        sector3: s3Time,
        avgSpeed,
        maxGLat,
        maxGLon,
        minGLon,
        fuelAtEnd: Math.random() * 20 + 10, // Mock fuel
        status: lap === lapsCount - 1 ? "in-progress" : "complete",
      });
    }

    return laps;
  }, [samples]);

  // Filter and sort
  const filtered = useMemo(() => {
    let result = lapMetrics;

    if (statusFilter !== "all") {
      result = result.filter((l) => l.status === statusFilter);
    }

    result.sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];

      if (aVal == null) return 1;
      if (bVal == null) return -1;

      let cmp = 0;
      if (typeof aVal === "number") {
        cmp = (aVal as number) - (bVal as number);
      } else {
        cmp = String(aVal).localeCompare(String(bVal));
      }

      return sortOrder === "asc" ? cmp : -cmp;
    });

    return result;
  }, [lapMetrics, sortBy, sortOrder, statusFilter]);

  const handleSort = (key: SortKey) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setSortOrder("asc");
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 border border-zinc-800 rounded overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2 border-b border-zinc-800 bg-zinc-925 flex-shrink-0">
        <div className="text-[11px] uppercase tracking-wider text-zinc-400 mb-2">Lap Metrics</div>
        <div className="flex gap-2 text-[10px]">
          <label className="text-zinc-500">Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="bg-zinc-800 text-zinc-200 px-2 py-0.5 rounded text-[9px] border border-zinc-700"
          >
            <option value="all">All</option>
            <option value="complete">Complete</option>
            <option value="in-progress">In Progress</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 min-h-0 overflow-auto">
        <table className="w-full text-[10px] border-collapse">
          <thead className="sticky top-0 bg-zinc-925 border-b border-zinc-800">
            <tr>
              <HeaderCell
                label="Lap"
                onSort={() => handleSort("lapNumber")}
                active={sortBy === "lapNumber"}
                order={sortOrder}
              />
              <HeaderCell
                label="Time"
                onSort={() => handleSort("lapTime")}
                active={sortBy === "lapTime"}
                order={sortOrder}
              />
              <HeaderCell
                label="S1"
                onSort={() => handleSort("sector1")}
                active={sortBy === "sector1"}
                order={sortOrder}
              />
              <HeaderCell
                label="S2"
                onSort={() => handleSort("sector2")}
                active={sortBy === "sector2"}
                order={sortOrder}
              />
              <HeaderCell
                label="S3"
                onSort={() => handleSort("sector3")}
                active={sortBy === "sector3"}
                order={sortOrder}
              />
              <HeaderCell
                label="Avg Spd"
                onSort={() => handleSort("avgSpeed")}
                active={sortBy === "avgSpeed"}
                order={sortOrder}
              />
              <HeaderCell
                label="Max G Lat"
                onSort={() => handleSort("maxGLat")}
                active={sortBy === "maxGLat"}
                order={sortOrder}
              />
              <HeaderCell
                label="Max G Lon"
                onSort={() => handleSort("maxGLon")}
                active={sortBy === "maxGLon"}
                order={sortOrder}
              />
            </tr>
          </thead>
          <tbody>
            {filtered.map((lap) => (
              <tr
                key={lap.lapNumber}
                className="border-b border-zinc-800 hover:bg-zinc-900 transition-colors"
              >
                <Cell value={lap.lapNumber} status={lap.status} />
                <Cell value={lap.lapTime?.toFixed(2)} unit="s" />
                <Cell value={lap.sector1?.toFixed(2)} unit="s" />
                <Cell value={lap.sector2?.toFixed(2)} unit="s" />
                <Cell value={lap.sector3?.toFixed(2)} unit="s" />
                <Cell value={lap.avgSpeed.toFixed(0)} unit="kph" />
                <Cell value={lap.maxGLat.toFixed(2)} unit="G" />
                <Cell value={lap.maxGLon.toFixed(2)} unit="G" />
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="p-4 text-center text-zinc-500 text-[10px]">No laps yet</div>
        )}
      </div>
    </div>
  );
}

function HeaderCell({
  label,
  onSort,
  active,
  order,
}: {
  label: string;
  onSort: () => void;
  active: boolean;
  order: SortOrder;
}) {
  return (
    <th
      onClick={onSort}
      className={`px-2 py-1 text-left cursor-pointer font-normal ${
        active ? "text-zinc-200 bg-zinc-900" : "text-zinc-500 hover:text-zinc-300"
      }`}
    >
      <div className="flex items-center gap-1">
        {label}
        {active && <span className="text-[8px]">{order === "asc" ? "↑" : "↓"}</span>}
      </div>
    </th>
  );
}

function Cell({
  value,
  unit,
  status,
}: {
  value?: string | number | null;
  unit?: string;
  status?: string;
}) {
  const textColor =
    status === "in-progress"
      ? "text-emerald-400"
      : status === "complete"
        ? "text-zinc-300"
        : "text-zinc-400";

  return (
    <td className={`px-2 py-1 text-right tabular-nums ${textColor}`}>
      {value != null ? (
        <>
          {value}
          {unit && <span className="text-[9px] text-zinc-600 ml-0.5">{unit}</span>}
        </>
      ) : (
        "—"
      )}
    </td>
  );
}
