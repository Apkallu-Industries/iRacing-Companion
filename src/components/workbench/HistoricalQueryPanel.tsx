/**
 * HistoricalQueryPanel — Cross-Session Intelligence Terminal
 *
 * Surfaces historical telemetry patterns from MongoDB across multiple
 * sessions. The first engineering tool that answers questions like:
 *
 *   "Show every Turn 8 instability event at Spa in the BMW M4 GT3"
 *   "Compare rear stability across last 3 Monza stints"
 *
 * This is the beginning of the Historical Intelligence layer —
 * the transition from session-reactive to session-learnable.
 */

import { useState, useMemo } from "react";
import {
  useSessions,
  useEventQuery,
  useMongoStatus,
  formatSessionLabel,
  formatLapTime,
  type StoredSession,
  type StoredLap,
  type EventQueryParams,
} from "@/lib/session-intelligence/mongoSessionStore";
import { fetchLaps } from "@/lib/session-intelligence/mongoSessionStore";
import {
  Database,
  Search,
  Clock,
  AlertTriangle,
  Zap,
  Activity,
  Shield,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  Info,
} from "lucide-react";

// ─── Category helpers ─────────────────────────────────────────────────────────

const CATEGORIES = [
  { id: "thermal",  label: "THERMAL",   color: "#FF4D4D" },
  { id: "hybrid",   label: "HYBRID",    color: "#8B5CF6" },
  { id: "inputs",   label: "INPUTS",    color: "#00D17F" },
  { id: "dynamics", label: "DYNAMICS",  color: "#3B82F6" },
] as const;

type CategoryId = "thermal" | "hybrid" | "inputs" | "dynamics";

function CategoryIcon({ id, className }: { id: string; className?: string }) {
  switch (id) {
    case "thermal":  return <AlertTriangle className={className} style={{ color: "#FF4D4D" }} />;
    case "hybrid":   return <Zap           className={className} style={{ color: "#8B5CF6" }} />;
    case "inputs":   return <Activity      className={className} style={{ color: "#00D17F" }} />;
    case "dynamics": return <Shield        className={className} style={{ color: "#3B82F6" }} />;
    default:         return <Activity      className={className} style={{ color: "#7A828C" }} />;
  }
}

function severityColor(s: string) {
  if (s === "critical") return "#FF4D4D";
  if (s === "warning")  return "#FFB800";
  return "#3B82F6";
}

// ─── Offline State ────────────────────────────────────────────────────────────

function MongoOfflineState() {
  return (
    <div
      className="flex flex-col items-center justify-center h-full p-6 text-center font-mono"
      style={{ color: "#3D4751" }}
    >
      <Database className="h-8 w-8 mb-3" style={{ color: "#1C2430" }} />
      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7A828C] block mb-1">
        HISTORICAL INTELLIGENCE
      </span>
      <span className="text-[8.5px] leading-relaxed max-w-xs" style={{ color: "#3D4751" }}>
        MongoDB is not connected. Install MongoDB Community Server or ensure
        the PitWallMongoDB service is running to enable cross-session analytics.
      </span>
      <div
        className="mt-4 px-3 py-1.5 rounded-sm text-[8px] font-bold uppercase tracking-widest"
        style={{ backgroundColor: "#0B0F14", border: "1px solid #1C2430", color: "#7A828C" }}
      >
        RECORDING DISABLED
      </div>
    </div>
  );
}

// ─── Session Browser ──────────────────────────────────────────────────────────

function SessionRow({
  session,
  isSelected,
  onSelect,
}: {
  session: StoredSession;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const date = new Date(session.start_time);
  const label = date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" });
  const hasEnded = !!session.end_time;

  return (
    <div
      onClick={onSelect}
      className="flex items-start gap-2 px-3 py-2 cursor-pointer font-mono transition-all"
      style={{
        borderBottom: "1px solid #0D1117",
        backgroundColor: isSelected ? "rgba(59,130,246,0.06)" : "transparent",
        borderLeft: isSelected ? "2px solid #3B82F6" : "2px solid transparent",
      }}
    >
      <div className="flex flex-col flex-1 min-w-0 gap-0.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[9px] font-bold text-white truncate">{session.track}</span>
          <span className="text-[8px] text-[#3D4751] shrink-0 tabular-nums">{label}</span>
        </div>
        <div className="flex items-center gap-2 text-[8px] text-[#7A828C]">
          <span className="truncate">{session.car}</span>
          <span className="shrink-0">·</span>
          <span className="shrink-0 tabular-nums">{session.lap_count} laps</span>
          {!hasEnded && (
            <span className="text-[#00D17F] font-black uppercase tracking-wider">LIVE</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Lap Table ────────────────────────────────────────────────────────────────

function LapTable({ sessionId }: { sessionId: string }) {
  const [laps, setLaps] = useState<StoredLap[]>([]);
  const [loading, setLoading] = useState(true);

  useState(() => {
    fetchLaps(sessionId).then((data) => {
      setLaps(data);
      setLoading(false);
    });
  });

  if (loading) {
    return (
      <div className="p-3 text-[8px] text-[#7A828C] font-mono animate-pulse">
        LOADING LAPS…
      </div>
    );
  }

  if (laps.length === 0) {
    return (
      <div className="p-3 text-[8px] text-[#3D4751] font-mono">NO LAP DATA</div>
    );
  }

  const fastestTime = Math.min(...laps.filter((l) => l.duration_s > 0).map((l) => l.duration_s));

  return (
    <div className="overflow-auto max-h-48">
      <div
        className="grid grid-cols-4 px-3 py-1 font-mono text-[8px] font-bold text-[#7A828C] uppercase tracking-wider sticky top-0"
        style={{ borderBottom: "1px solid #1C2430", backgroundColor: "#0B0F14" }}
      >
        <span>LAP</span>
        <span>TIME</span>
        <span>FUEL</span>
        <span>TRACK °C</span>
      </div>
      {laps.map((lap) => {
        const isFastest = lap.duration_s === fastestTime;
        return (
          <div
            key={lap.lap_number}
            className="grid grid-cols-4 px-3 py-1 font-mono text-[9px] tabular-nums"
            style={{ borderBottom: "1px solid #0D1117" }}
          >
            <span className="text-[#7A828C]">L{lap.lap_number}</span>
            <span
              style={{ color: isFastest ? "#00D17F" : "white" }}
              className="font-bold"
            >
              {formatLapTime(lap.duration_s)}
            </span>
            <span className="text-[#7A828C]">{lap.fuel_remaining_l.toFixed(1)}L</span>
            <span className="text-[#7A828C]">{lap.track_temp_c.toFixed(0)}°</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function HistoricalQueryPanel() {
  const mongo = useMongoStatus();
  const { sessions, loading: sessionsLoading, refresh: refreshSessions } = useSessions();

  const [selectedSession, setSelectedSession] = useState<StoredSession | null>(null);
  const [showLaps, setShowLaps] = useState(false);
  const [activeTab, setActiveTab] = useState<"sessions" | "events">("sessions");

  // Event query state
  const [queryTrack,    setQueryTrack]    = useState("");
  const [queryCar,      setQueryCar]      = useState("");
  const [queryCategory, setQueryCategory] = useState<CategoryId | "">("");
  const [querySeverity, setQuerySeverity] = useState<"" | "critical" | "warning" | "info">("");
  const [queryCorner,   setQueryCorner]   = useState("");
  const [hasQueried,    setHasQueried]    = useState(false);

  const eventParams = useMemo<EventQueryParams>(() => ({
    track:    queryTrack    || undefined,
    car:      queryCar      || undefined,
    category: queryCategory || undefined,
    severity: (querySeverity as EventQueryParams["severity"]) || undefined,
    corner:   queryCorner ? parseInt(queryCorner, 10) : undefined,
  }), [queryTrack, queryCar, queryCategory, querySeverity, queryCorner]);

  const { events, loading: eventsLoading, query: runQuery } = useEventQuery({});

  const handleRunQuery = () => {
    setHasQueried(true);
    runQuery(eventParams);
  };

  const inputStyle = {
    backgroundColor: "#080C10",
    border: "1px solid #1C2430",
    color: "white",
    fontFamily: "monospace",
    fontSize: "9px",
    padding: "4px 8px",
    borderRadius: "2px",
    outline: "none",
    width: "100%",
  };

  // If MongoDB isn't connected, show the offline placeholder
  if (!mongo.connected && !mongo.loading) {
    return (
      <div className="h-full flex flex-col font-mono bg-[#05070A]">
        <div
          className="px-3 py-1.5 flex items-center justify-between shrink-0"
          style={{ borderBottom: "1px solid #1C2430", backgroundColor: "#0B0F14" }}
        >
          <div className="flex items-center gap-1.5">
            <Database className="h-3 w-3 text-[#3D4751]" />
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#7A828C]">
              HISTORICAL INTELLIGENCE
            </span>
          </div>
          <span className="text-[7.5px] text-[#FF4D4D] font-black uppercase tracking-widest">
            MONGO OFFLINE
          </span>
        </div>
        <MongoOfflineState />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col font-mono bg-[#05070A] text-white">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div
        className="px-3 py-1.5 flex items-center justify-between shrink-0"
        style={{ borderBottom: "1px solid #1C2430", backgroundColor: "#0B0F14" }}
      >
        <div className="flex items-center gap-1.5">
          <Database className="h-3 w-3 text-[#3B82F6]" />
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white">
            HISTORICAL INTELLIGENCE
          </span>
        </div>
        <div className="flex items-center gap-2">
          {mongo.connected && (
            <span className="text-[7.5px] text-[#00D17F] font-black uppercase tracking-widest">
              ● MONGO LIVE · {mongo.sampleCount} SAMPLES
            </span>
          )}
          <button
            onClick={refreshSessions}
            className="p-0.5 rounded text-[#7A828C] hover:text-white transition-colors"
          >
            <RefreshCw className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* ── Tabs ───────────────────────────────────────────────────── */}
      <div className="flex shrink-0" style={{ borderBottom: "1px solid #1C2430" }}>
        {(["sessions", "events"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="flex-1 px-3 py-1.5 text-[8px] font-bold uppercase tracking-widest transition-all"
            style={{
              backgroundColor: activeTab === tab ? "#0B0F14" : "transparent",
              color: activeTab === tab ? "white" : "#7A828C",
              borderBottom: activeTab === tab ? "1px solid #3B82F6" : "1px solid transparent",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Sessions Tab ───────────────────────────────────────────── */}
      {activeTab === "sessions" && (
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          {sessionsLoading ? (
            <div className="p-3 text-[8px] text-[#7A828C] animate-pulse">LOADING SESSIONS…</div>
          ) : sessions.length === 0 ? (
            <div className="p-4 flex flex-col items-center text-center gap-1.5">
              <Info className="h-4 w-4 text-[#3D4751]" />
              <span className="text-[8.5px] text-[#7A828C]">
                No sessions recorded yet. Start iRacing with the bridge running
                and MongoDB connected to begin session history.
              </span>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              {sessions.map((session) => (
                <div key={session._id}>
                  <SessionRow
                    session={session}
                    isSelected={selectedSession?._id === session._id}
                    onSelect={() => {
                      setSelectedSession(session);
                      setShowLaps(true);
                    }}
                  />
                  {/* Lap table inline */}
                  {selectedSession?._id === session._id && showLaps && (
                    <div style={{ backgroundColor: "#080C10", borderBottom: "1px solid #1C2430" }}>
                      <div
                        className="flex items-center justify-between px-3 py-1 cursor-pointer"
                        style={{ borderBottom: "1px solid #1C2430" }}
                        onClick={() => setShowLaps((p) => !p)}
                      >
                        <span className="text-[8px] text-[#7A828C] font-bold uppercase tracking-wider">
                          LAP HISTORY
                        </span>
                        <ChevronDown className="h-3 w-3 text-[#7A828C]" />
                      </div>
                      <LapTable sessionId={session._id} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Events Tab ─────────────────────────────────────────────── */}
      {activeTab === "events" && (
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          {/* Filter bar */}
          <div
            className="p-2 flex flex-col gap-1.5 shrink-0"
            style={{ borderBottom: "1px solid #1C2430", backgroundColor: "#080C10" }}
          >
            <div className="grid grid-cols-2 gap-1.5">
              <input
                id="hist-filter-track"
                style={inputStyle}
                placeholder="TRACK (e.g. Spa)"
                value={queryTrack}
                onChange={(e) => setQueryTrack(e.target.value)}
              />
              <input
                id="hist-filter-car"
                style={inputStyle}
                placeholder="CAR (e.g. BMW M4 GT3)"
                value={queryCar}
                onChange={(e) => setQueryCar(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <select
                id="hist-filter-category"
                style={inputStyle}
                value={queryCategory}
                onChange={(e) => setQueryCategory(e.target.value as CategoryId | "")}
              >
                <option value="">ALL CATEGORIES</option>
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
              <select
                id="hist-filter-severity"
                style={inputStyle}
                value={querySeverity}
                onChange={(e) => setQuerySeverity(e.target.value as typeof querySeverity)}
              >
                <option value="">ALL SEVERITY</option>
                <option value="critical">CRITICAL</option>
                <option value="warning">WARNING</option>
                <option value="info">INFO</option>
              </select>
              <input
                id="hist-filter-corner"
                style={inputStyle}
                placeholder="CORNER #"
                value={queryCorner}
                onChange={(e) => setQueryCorner(e.target.value)}
                type="number"
              />
            </div>
            <button
              id="hist-run-query"
              onClick={handleRunQuery}
              className="flex items-center justify-center gap-1.5 py-1 rounded-sm text-[8px] font-bold uppercase tracking-widest transition-all hover:opacity-80"
              style={{ backgroundColor: "#1C2430", color: "#E2E4E8", border: "1px solid #263241" }}
            >
              <Search className="h-3 w-3 text-[#3B82F6]" />
              RUN HISTORICAL QUERY
            </button>
          </div>

          {/* Results */}
          <div className="flex-1 overflow-y-auto">
            {!hasQueried ? (
              <div className="p-4 text-center text-[8.5px] text-[#3D4751]">
                Set filters above and run a query to search across all recorded sessions.
              </div>
            ) : eventsLoading ? (
              <div className="p-3 text-[8px] text-[#7A828C] animate-pulse">QUERYING…</div>
            ) : events.length === 0 ? (
              <div className="p-4 text-[8.5px] text-[#7A828C] text-center">
                No events matched your query.
              </div>
            ) : (
              <div>
                <div
                  className="px-3 py-1 text-[7.5px] text-[#3B82F6] font-black uppercase tracking-widest"
                  style={{ borderBottom: "1px solid #1C2430", backgroundColor: "#080C10" }}
                >
                  {events.length} EVENT{events.length !== 1 ? "S" : ""} FOUND
                </div>
                {events.map((event) => (
                  <div
                    key={event._id}
                    className="px-3 py-2"
                    style={{
                      borderBottom: "1px solid #0D1117",
                      borderLeft: `2px solid ${severityColor(event.severity)}`,
                    }}
                  >
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <div className="flex items-center gap-1.5">
                        <CategoryIcon id={event.category} className="h-3 w-3" />
                        <span className="text-[9px] font-bold text-white">{event.label}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {event.cornerNumber && (
                          <span className="text-[7.5px] text-[#7A828C]">T{event.cornerNumber}</span>
                        )}
                        <span
                          className="text-[7px] font-black uppercase tracking-widest px-1 rounded-xs"
                          style={{ color: severityColor(event.severity) }}
                        >
                          {event.severity}
                        </span>
                      </div>
                    </div>
                    <p className="text-[8px] text-[#7A828C] leading-relaxed">{event.description}</p>
                    <div className="mt-1 flex items-center gap-2 text-[7.5px] text-[#3D4751]">
                      <span>{event.track}</span>
                      <span>·</span>
                      <span>{event.car}</span>
                      <span>·</span>
                      <span>{new Date(event.timestamp).toLocaleDateString("en-GB")}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
