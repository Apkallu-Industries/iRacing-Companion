import { createFileRoute, Link } from "@tanstack/react-router";
import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Users,
  Car as CarIcon,
  Plus,
  Trash2,
  Calendar,
  Fuel,
  Cloud,
  Sun,
  CloudSun,
  CloudRain,
  CloudDrizzle,
  CloudLightning,
  X,
  Sliders,
  Timer,
  Calculator,
  Zap,
  ShieldAlert,
  BrainCircuit,
  RefreshCw,
  Settings,
} from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { useWorkbench } from "@/lib/store";
import { resolveLLMUrl } from "@/lib/llm";
import { useTelemetry } from "@/lib/useTelemetry";
import { useTeamTelemetry, DriverTelemetrySnapshot } from "@/lib/useTeamTelemetry";
import {
  format,
  addHours,
  startOfHour,
  addMinutes,
  differenceInMinutes,
  parseISO,
} from "date-fns";

export const Route = createFileRoute("/team")({
  head: () => ({
    meta: [
      { title: "Team Command — Pit Wall Operations Center" },
      {
        name: "description",
        content:
          "Cinematic multi-driver race strategy command center. Coordinate stints, track active telemetry links, and calculate fuel targets.",
      },
    ],
  }),
  component: TeamPage,
});

type Driver = { id: string; name: string; shortName: string; color: string; status?: "Available" | "In Garage" | "Driving" | "Standby" };
type Car = { id: string; name: string; number: string; carClass: "GTP" | "LMP2" | "GT3" };
type Stint = {
  id: string;
  carId: string;
  driverId: string;
  startTime: string;
  endTime: string;
  note?: string;
};
type WeatherType =
  | "Sunny"
  | "Partly Cloudy"
  | "Overcast"
  | "Light Rain"
  | "Heavy Rain"
  | "Thunderstorm";
type WeatherEvent = { id: string; type: WeatherType; startTime: string; endTime: string };
type RaceIncident = {
  id: string;
  type: "Caution" | "Safety Car" | "Red Flag" | "Green Flag";
  startTime: string;
  duration: number;
};

const CLASS_COLORS: Record<string, string> = { GTP: "#3B82F6", LMP2: "#10B981", GT3: "#F59E0B" };
const WEATHER_COLORS: Record<WeatherType, string> = {
  Sunny: "#f59e0b",
  "Partly Cloudy": "#60a5fa",
  Overcast: "#94a3b8",
  "Light Rain": "#38bdf8",
  "Heavy Rain": "#2563eb",
  Thunderstorm: "#8b5cf6",
};

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

// Compact rolling sparkline component
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const width = 140;
  const height = 14;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline fill="none" stroke={color} strokeWidth="1.1" points={points} />
    </svg>
  );
}

function TeamPage() {
  const t = useTelemetry(); // Real bridge — 60Hz local
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Strategy graph active tab selector
  const [graphTab, setGraphTab] = useState<"fuel" | "tyre" | "temp" | "delta">("fuel");

  // Contextual expansion states (Image 2 UX improvements)
  const [selectedRosterDriverId, setSelectedRosterDriverId] = useState<string | null>(null);
  const [hoveredStintIndex, setHoveredStintIndex] = useState<number | null>(null);

  // Active Operational Focus Mode (Green, FCY, Rain)
  const [focusMode, setFocusMode] = useState<"green" | "fcy" | "wet">("green");

  // Temporal Zooming Level (24h, 6h, 1h, 15m)
  const [zoomLevel, setZoomLevel] = useState<"24h" | "6h" | "1h" | "15m">("6h");

  // Le Mans / Endurance config
  const [raceDurationHours, setRaceDurationHours] = useState<number>(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("team_race_duration_h") : null;
    return saved ? Number(saved) : 6;
  });
  useEffect(() => {
    localStorage.setItem("team_race_duration_h", String(raceDurationHours));
  }, [raceDurationHours]);

  // Mouse Zoom & Pan states for dynamic timeline realignment
  const [timelineZoom, setTimelineZoom] = useState(1.0);
  const [timelinePanOffset, setTimelinePanOffset] = useState(0.0); // in minutes

  const totalMin = raceDurationHours * 60;
  const visibleDuration = totalMin / timelineZoom;
  const startTimeOffsetMin = Math.max(0, Math.min(totalMin - visibleDuration, timelinePanOffset));
  const endTimeOffsetMin = startTimeOffsetMin + visibleDuration;

  // Helper to map coordinate X from 0-600 space to zoomed-pan space
  const mapX = (originalX: number) => {
    const t = (originalX / 600) * totalMin;
    return ((t - startTimeOffsetMin) / visibleDuration) * 600;
  };

  // Helper to parse SVG path and map X values
  const mapPath = (dStr: string) => {
    return dStr.replace(/([MQLC])\s*([-\d.]+),([-\d.]+)(?:\s+([-\d.]+),([-\d.]+))?(?:\s+([-\d.]+),([-\d.]+))?/g, (match, cmd, x1, y1, x2, y2, x3, y3) => {
      const rx1 = mapX(parseFloat(x1));
      if (x2 !== undefined && y2 !== undefined) {
        const rx2 = mapX(parseFloat(x2));
        if (x3 !== undefined && y3 !== undefined) {
          const rx3 = mapX(parseFloat(x3));
          return `${cmd} ${rx1},${y1} ${rx2},${y2} ${rx3},${y3}`;
        }
        return `${cmd} ${rx1},${y1} ${rx2},${y2}`;
      }
      return `${cmd} ${rx1},${y1}`;
    });
  };

  // Helper to dynamically size stint slots across zoomed viewport
  const getSlotStyle = (stintIdx: number) => {
    const slotDur = totalMin / 4;
    const slotStartMin = stintIdx * slotDur;
    const slotEndMin = (stintIdx + 1) * slotDur;
    const isVisible = slotEndMin > startTimeOffsetMin && slotStartMin < endTimeOffsetMin;
    if (!isVisible) return { display: "none" };

    const leftPct = Math.max(0, ((slotStartMin - startTimeOffsetMin) / visibleDuration) * 100);
    const rightPct = Math.max(0, ((endTimeOffsetMin - slotEndMin) / visibleDuration) * 100);
    const widthPct = 100 - leftPct - rightPct;
    return {
      position: "absolute" as const,
      left: `calc(${leftPct}% + 1px)`,
      width: `calc(${widthPct}% - 2px)`,
      height: "100%",
    };
  };

  const applyZoomPreset = (preset: "24h" | "6h" | "1h" | "15m") => {
    setZoomLevel(preset);
    setTimelinePanOffset(0);
    if (preset === "24h") {
      setTimelineZoom(1.0);
    } else if (preset === "6h") {
      setTimelineZoom(Math.max(1, raceDurationHours / 6));
    } else if (preset === "1h") {
      setTimelineZoom(Math.max(1, raceDurationHours / 1));
    } else if (preset === "15m") {
      setTimelineZoom(Math.max(1, raceDurationHours / 0.25));
    }
  };

  const dragTimelineRef = useRef<{ startX: number; startPanOffset: number } | null>(null);

  const onTimelineWheel = (e: React.WheelEvent) => {
    // Hold LMB and scroll MMW to zoom in and out
    if (!(e.buttons & 1)) return;
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const isGraph = e.currentTarget.classList.contains("timeline-graph-container");
    const offsetLeft = isGraph ? 0 : 110;
    const mouseX = e.clientX - rect.left - offsetLeft; // offset for the w-24 / 110px label
    const timelineWidth = rect.width - offsetLeft;
    if (timelineWidth <= 0) return;

    const mousePct = Math.max(0, Math.min(1, mouseX / timelineWidth));
    const mouseTimeMin = startTimeOffsetMin + mousePct * visibleDuration;

    const zoomFactor = e.deltaY < 0 ? 1.25 : 1 / 1.25;
    const newZoom = Math.min(48, Math.max(1, timelineZoom * zoomFactor));
    if (newZoom === timelineZoom) return;

    const newVisibleDur = totalMin / newZoom;
    let newStart = mouseTimeMin - mousePct * newVisibleDur;

    newStart = Math.max(0, Math.min(totalMin - newVisibleDur, newStart));

    setTimelineZoom(newZoom);
    setTimelinePanOffset(newStart);
  };

  const onTimelineMouseDown = (e: React.MouseEvent) => {
    // Hold LMB+RMB simultaneously to pan (buttons === 3)
    if (e.buttons === 3) {
      e.preventDefault();
      dragTimelineRef.current = { startX: e.clientX, startPanOffset: timelinePanOffset };
    }
  };

  const onTimelineMouseMove = (e: React.MouseEvent) => {
    if (dragTimelineRef.current && e.buttons === 3) {
      e.preventDefault();
      const rect = e.currentTarget.getBoundingClientRect();
      const isGraph = e.currentTarget.classList.contains("timeline-graph-container");
      const offsetLeft = isGraph ? 0 : 110;
      const timelineWidth = rect.width - offsetLeft;
      if (timelineWidth <= 0) return;

      const dx = e.clientX - dragTimelineRef.current.startX;
      const minDelta = (dx / timelineWidth) * visibleDuration;

      let newStart = dragTimelineRef.current.startPanOffset - minDelta;
      newStart = Math.max(0, Math.min(totalMin - visibleDuration, newStart));
      setTimelinePanOffset(newStart);
    }
  };

  const onTimelineMouseUp = () => {
    dragTimelineRef.current = null;
  };

  const onContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  // Team Manager Active Variables & Compliance
  const [tyreSoftAllowed, setTyreSoftAllowed] = useState(true);
  const [tyreMediumAllowed, setTyreMediumAllowed] = useState(true);
  const [tyreHardAllowed, setTyreHardAllowed] = useState(true);
  const [tyreWetAllowed, setTyreWetAllowed] = useState(true);
  const [showManagerSettings, setShowManagerSettings] = useState(false);

  // Click message handler for Contextual Expansion (jumps to stint/highlights)
  const handleAnomalyClick = (type: "temp" | "pit" | "caution" | "green", stintIdx: number) => {
    setHoveredStintIndex(stintIdx);
    // Auto-reset highlight after 2.5 seconds
    setTimeout(() => {
      setHoveredStintIndex((current) => current === stintIdx ? null : current);
    }, 2500);

    if (type === "temp") {
      setGraphTab("temp");
    } else if (type === "pit") {
      setGraphTab("fuel");
    } else if (type === "caution") {
      setGraphTab("delta");
    } else if (type === "green") {
      setGraphTab("tyre");
    }
  };

  // Team Code — shared between all drivers for multi-car Realtime relay
  const [teamCode, setTeamCode] = useState<string>(() =>
    typeof window !== "undefined" ? (localStorage.getItem("team_code") ?? "") : ""
  );
  const [teamCodeInput, setTeamCodeInput] = useState("");
  const [showTeamCodePanel, setShowTeamCodePanel] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem("team_code", teamCode);
  }, [teamCode]);

  // Subscribe to multi-driver team channel
  const { drivers: teamDrivers, connected: teamConnected, onlineCount } = useTeamTelemetry(
    teamCode || null
  );



  /** Generate a unique team code from race name + random suffix */
  const generateTeamCode = () => {
    const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
    const code = `PITWALL-${suffix}`;
    setTeamCode(code);
    setTeamCodeInput(code);
  };

  // SimTeam Core State Variables with localStorage persistence
  const [drivers, setDrivers] = useState<Driver[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("team_drivers");
      if (saved) return JSON.parse(saved);
    }
    // Default Paddock Roster matching Image 2
    return [
      { id: "d1", name: "M. Campbell", shortName: "CAM", color: "#00D17F", status: "Available" },
      { id: "d2", name: "K. Estre", shortName: "EST", color: "#3B82F6", status: "In Garage" },
      { id: "d3", name: "L. Vanthoor", shortName: "VAN", color: "#FF4D4D", status: "Driving" },
      { id: "d4", name: "F. Nasr", shortName: "NAS", color: "#FFB800", status: "Standby" },
    ];
  });

  const [cars, setCars] = useState<Car[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("team_cars");
      if (saved) return JSON.parse(saved);
    }
    // Default Fleet matching Image 2
    return [
      { id: "c1", name: "Porsche 963", number: "7", carClass: "GTP" },
      { id: "c2", name: "BMW M Hybrid V8", number: "12", carClass: "GTP" },
      { id: "c3", name: "Acura ARX-06", number: "93", carClass: "GTP" },
    ];
  });

  const [stints, setStints] = useState<Stint[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("team_stints");
      if (saved) return JSON.parse(saved);
    }
    // Initialise stints map to pre-populate Porsche stints matching Image 2
    return [
      { id: "stint_c1_0", carId: "c1", driverId: "d3", startTime: "2026-05-28T15:00:00.000Z", endTime: "2026-05-28T16:12:45.000Z", note: "LAPS 1-45" },
      { id: "stint_c1_1", carId: "c1", driverId: "d1", startTime: "2026-05-28T16:15:20.000Z", endTime: "2026-05-28T17:18:00.000Z", note: "LAPS 46-90" },
      { id: "stint_c1_2", carId: "c1", driverId: "d2", startTime: "2026-05-28T17:23:00.000Z", endTime: "2026-05-28T18:26:00.000Z", note: "LAPS 92-135" },
      { id: "stint_c1_3", carId: "c1", driverId: "d3", startTime: "2026-05-28T18:28:00.000Z", endTime: "2026-05-28T21:00:00.000Z", note: "LAPS 137-215" },
    ];
  });

  const [weatherEvents, setWeatherEvents] = useState<WeatherEvent[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("team_weather");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [incidents, setIncidents] = useState<RaceIncident[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("team_incidents");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [raceStartTime, setRaceStartTime] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("team_race_start_time");
      return saved ? saved : "2026-05-28T15:00:00.000Z";
    }
    return "2026-05-28T15:00:00.000Z";
  });
  const [selectedCarId, setSelectedCarId] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("team_selected_car_id");
      return saved ? saved : "c1";
    }
    return "c1";
  });
  const [realTime, setRealTime] = useState(new Date());

  // Strategy planner calculator states
  const [calcFuelBurn, setCalcFuelBurn] = useState<number>(2.85);
  const [calcStintLaps, setCalcStintLaps] = useState<number>(45);
  const [calcAvgLapTimeSec, setCalcAvgLapTimeSec] = useState<number>(95);

  // Sync to localStorage hooks
  useEffect(() => {
    localStorage.setItem("team_drivers", JSON.stringify(drivers));
  }, [drivers]);

  useEffect(() => {
    localStorage.setItem("team_cars", JSON.stringify(cars));
    if (cars.length > 0) {
      if (!selectedCarId || !cars.some(c => c.id === selectedCarId)) {
        setSelectedCarId(cars[0].id);
      }
    } else {
      setSelectedCarId(null);
    }
  }, [cars, selectedCarId]);

  useEffect(() => {
    localStorage.setItem("team_stints", JSON.stringify(stints));
  }, [stints]);

  useEffect(() => {
    localStorage.setItem("team_weather", JSON.stringify(weatherEvents));
  }, [weatherEvents]);

  useEffect(() => {
    localStorage.setItem("team_incidents", JSON.stringify(incidents));
  }, [incidents]);

  useEffect(() => {
    localStorage.setItem("team_race_start_time", raceStartTime);
  }, [raceStartTime]);

  useEffect(() => {
    if (selectedCarId) {
      localStorage.setItem("team_selected_car_id", selectedCarId);
    } else {
      localStorage.removeItem("team_selected_car_id");
    }
  }, [selectedCarId]);

  // Interactive panels
  const [isAddCarOpen, setIsAddCarOpen] = useState(false);
  const [isAddDriverOpen, setIsAddDriverOpen] = useState(false);
  const [isAddWeatherOpen, setIsAddWeatherOpen] = useState(false);
  const [isAddStintOpen, setIsAddStintOpen] = useState(false);
  const [isAddIncidentOpen, setIsAddIncidentOpen] = useState(false);


  // New item states
  const [newCar, setNewCar] = useState({
    name: "",
    number: "",
    carClass: "GT3" as "GT3" | "GTP" | "LMP2",
  });
  const [newDriver, setNewDriver] = useState({ name: "", shortName: "", color: "#3B82F6", status: "Available" as Driver["status"] });
  const [newWeather, setNewWeather] = useState({
    type: "Sunny" as WeatherType,
    startOffset: 0,
    duration: 60,
  });
  const [newStint, setNewStint] = useState({
    carId: "",
    driverId: "",
    startOffset: 0,
    duration: 60,
    note: "",
  });
  const [newIncident, setNewIncident] = useState({
    type: "Caution" as RaceIncident["type"],
    startOffset: 0,
    duration: 15,
  });

  // Stopwatch state
  const [stopwatch, setStopwatch] = useState({
    isRunning: false,
    elapsed: 0,
    lastStart: null as number | null,
  });

  // Update clock every second
  useEffect(() => {
    const t = setInterval(() => {
      setRealTime(new Date());
    }, 1000);
    return () => clearInterval(t);
  }, []);

  // Update stopwatch
  useEffect(() => {
    if (!stopwatch.isRunning) return;
    const t = setInterval(() => {
      setStopwatch((prev) => {
        const now = Date.now();
        const start = prev.lastStart ?? now;
        return {
          ...prev,
          elapsed: prev.elapsed + (now - start) / 1000,
          lastStart: now,
        };
      });
    }, 100);
    return () => clearInterval(t);
  }, [stopwatch.isRunning]);

  // Derived variables
  const selectedCar = cars.find((c) => c.id === selectedCarId) || cars[0];

  // Derived active team telemetry snapshot for the selected car
  const activeTeamTelemetry = useMemo(() => {
    if (!selectedCar) return null;
    return teamDrivers.get(selectedCar.number) || null;
  }, [teamDrivers, selectedCar]);

  // Find active snapshot for sparkline updates
  const activeSnapshotRef = useRef<DriverTelemetrySnapshot | null>(null);
  useEffect(() => {
    activeSnapshotRef.current = activeTeamTelemetry;
  }, [activeTeamTelemetry]);

  // Automatically discover and register cars and drivers from the remote Supabase Realtime channel
  useEffect(() => {
    if (!teamCode || teamDrivers.size === 0) return;

    let carsUpdated = false;
    let driversUpdated = false;
    const nextCars = [...cars];
    const nextDrivers = [...drivers];

    for (const [carNum, snap] of teamDrivers.entries()) {
      // 1. Discover and register car if not exists
      const existingCar = nextCars.find((c) => c.number === carNum);
      if (!existingCar && snap.carName) {
        nextCars.push({
          id: `c_discovered_${carNum}`,
          name: snap.carName,
          number: carNum,
          carClass: snap.carName.toUpperCase().includes("GT3") ? "GT3" : 
                    snap.carName.toUpperCase().includes("LMP2") ? "LMP2" : "GTP",
        });
        carsUpdated = true;
      }

      // 2. Discover and register driver if not exists
      if (snap.driverName && snap.driverName !== "Unknown Driver") {
        const existingDriver = nextDrivers.find(
          (d) => d.name.toLowerCase() === snap.driverName.toLowerCase()
        );
        if (!existingDriver) {
          const lastName = snap.driverName.split(" ").slice(-1)[0] || "DRV";
          const shortSig = lastName.slice(0, 3).toUpperCase();
          nextDrivers.push({
            id: `d_discovered_${snap.carNumber}_${Date.now()}`,
            name: snap.driverName,
            shortName: shortSig,
            color: "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0"),
            status: snap.isOnline ? "Driving" : "Available",
          });
          driversUpdated = true;
        } else {
          const nextStatus = snap.isOnline ? "Driving" : "Available";
          if (existingDriver.status !== nextStatus) {
            existingDriver.status = nextStatus as any;
            driversUpdated = true;
          }
        }
      }
    }

    if (carsUpdated) setCars(nextCars);
    if (driversUpdated) setDrivers(nextDrivers);
  }, [teamDrivers, teamCode, cars, drivers]);

  // Dynamic calculator derivations
  const calculatedFuelRequired = useMemo(() => {
    return Number((calcFuelBurn * calcStintLaps).toFixed(2));
  }, [calcFuelBurn, calcStintLaps]);

  const calculatedFuelMargin = useMemo(() => {
    return Number((calcFuelBurn * 1.5).toFixed(2));
  }, [calcFuelBurn]);

  const calculatedTireWearCoefficient = useMemo(() => {
    const baseWear =
      selectedCar?.carClass === "GTP" ? 1.65 : selectedCar?.carClass === "LMP2" ? 1.45 : 1.25;
    return Number(baseWear.toFixed(2));
  }, [selectedCar]);

  const calculatedStintDurationMin = useMemo(() => {
    return calcStintLaps * (calcAvgLapTimeSec / 60);
  }, [calcStintLaps, calcAvgLapTimeSec]);

  const raceElapsedMs = useMemo(() => {
    return differenceInMinutes(realTime, parseISO(raceStartTime)) * 60 * 1000;
  }, [realTime, raceStartTime]);

  // Le Mans derived values
  const raceDurationMs = raceDurationHours * 60 * 60 * 1000;
  const raceRemainingMs = useMemo(() => {
    return Math.max(0, raceDurationMs - Math.max(0, raceElapsedMs));
  }, [raceDurationMs, raceElapsedMs]);
  const raceProgressPct = useMemo(() => {
    if (raceDurationMs <= 0) return 0;
    return Math.min(100, (Math.max(0, raceElapsedMs) / raceDurationMs) * 100);
  }, [raceElapsedMs, raceDurationMs]);

  // Night/Day cycle for Le Mans (race start ~15:00 local)
  const racePhase = useMemo(() => {
    const startHour = parseISO(raceStartTime).getHours();
    const elapsedH = Math.max(0, raceElapsedMs) / 3_600_000;
    const currentHour = (startHour + elapsedH) % 24;
    if (currentHour >= 6 && currentHour < 9) return { label: "DAWN", color: "text-orange-300", bg: "bg-orange-500/10", border: "border-orange-500/20", icon: "🌅" };
    if (currentHour >= 9 && currentHour < 18) return { label: "DAY", color: "text-yellow-300", bg: "bg-yellow-500/10", border: "border-yellow-500/20", icon: "☀️" };
    if (currentHour >= 18 && currentHour < 21) return { label: "DUSK", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", icon: "🌇" };
    return { label: "NIGHT", color: "text-blue-300", bg: "bg-blue-900/20", border: "border-blue-500/20", icon: "🌙" };
  }, [raceStartTime, raceElapsedMs]);

  // Driver fatigue tracker — sum up stint durations per driver
  const driverHoursMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const stint of stints) {
      const start = parseISO(stint.startTime);
      const end = parseISO(stint.endTime);
      const hours = differenceInMinutes(end, start) / 60;
      map[stint.driverId] = (map[stint.driverId] || 0) + hours;
    }
    return map;
  }, [stints]);

  // 24hr fuel planner
  const enduranceFuelPlan = useMemo(() => {
    if (calcFuelBurn <= 0 || calcStintLaps <= 0) return null;
    const totalRaceSec = raceDurationHours * 3600;
    const totalLapsEst = Math.round(totalRaceSec / calcAvgLapTimeSec);
    const fuelPerStint = calcFuelBurn * calcStintLaps;
    const pitStops = Math.ceil(totalLapsEst / calcStintLaps) - 1;
    const totalFuel = calcFuelBurn * totalLapsEst;
    return { totalLapsEst, pitStops, fuelPerStint, totalFuel };
  }, [raceDurationHours, calcFuelBurn, calcStintLaps, calcAvgLapTimeSec]);

  const timelineStartTime = parseISO(raceStartTime);

  // Setup sample team stats on "Full Trial Demo" click
  const populateDemoData = () => {
    const baseTime = startOfHour(new Date());
    setRaceStartTime(baseTime.toISOString());

    const demoDrivers: Driver[] = [
      { id: "d1", name: "M. Campbell", shortName: "CAM", color: "#00D17F", status: "Available" },
      { id: "d2", name: "K. Estre", shortName: "EST", color: "#3B82F6", status: "In Garage" },
      { id: "d3", name: "L. Vanthoor", shortName: "VAN", color: "#FF4D4D", status: "Driving" },
      { id: "d4", name: "F. Nasr", shortName: "NAS", color: "#FFB800", status: "Standby" },
    ];

    const demoCars: Car[] = [
      { id: "c1", name: "Porsche 963", number: "7", carClass: "GTP" },
      { id: "c2", name: "BMW M Hybrid V8", number: "12", carClass: "GTP" },
      { id: "c3", name: "Acura ARX-06", number: "93", carClass: "GTP" },
    ];

    const demoStints: Stint[] = [
      { id: "stint_c1_0", carId: "c1", driverId: "d3", startTime: baseTime.toISOString(), endTime: addMinutes(baseTime, 72.75).toISOString(), note: "LAPS 1-45" },
      { id: "stint_c1_1", carId: "c1", driverId: "d1", startTime: addMinutes(baseTime, 75.3).toISOString(), endTime: addMinutes(baseTime, 138).toISOString(), note: "LAPS 46-90" },
      { id: "stint_c1_2", carId: "c1", driverId: "d2", startTime: addMinutes(baseTime, 143).toISOString(), endTime: addMinutes(baseTime, 206).toISOString(), note: "LAPS 92-135" },
      { id: "stint_c1_3", carId: "c1", driverId: "d3", startTime: addMinutes(baseTime, 208).toISOString(), endTime: addMinutes(baseTime, 360).toISOString(), note: "LAPS 137-215" },
    ];

    setDrivers(demoDrivers);
    setCars(demoCars);
    setStints(demoStints);
    setSelectedCarId("c1");
  };

  // Delete handlers
  const handleDeleteCar = (carId: string) => {
    setCars((prev) => prev.filter((c) => c.id !== carId));
    setStints((prev) => prev.filter((s) => s.carId !== carId));
    if (selectedCarId === carId) {
      const remaining = cars.filter((c) => c.id !== carId);
      setSelectedCarId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const handleDeleteDriver = (driverId: string) => {
    setDrivers((prev) => prev.filter((d) => d.id !== driverId));
    setStints((prev) => prev.filter((s) => s.driverId !== driverId));
  };

  const handleDeleteWeather = (wId: string) => {
    setWeatherEvents((prev) => prev.filter((w) => w.id !== wId));
  };

  const handleDeleteIncident = (iId: string) => {
    setIncidents((prev) => prev.filter((inc) => inc.id !== iId));
  };

  const evaluateTeamStrategy = async () => {
    setAiLoading(true);
    setAiResponse("");
    try {
      const serializedDrivers = drivers.map(d => `${d.name} (${d.shortName})`).join(", ");
      const serializedCars = cars.map(c => `Car #${c.number} (${c.name}, Class: ${c.carClass})`).join(", ");
      
      const serializedStints = stints.map(s => {
        const dr = drivers.find(d => d.id === s.driverId);
        const cr = cars.find(c => c.id === s.carId);
        return `- Driver: ${dr ? dr.name : "Unknown"} on Car #${cr ? cr.number : "Unknown"}. Scheduled from ${format(parseISO(s.startTime), "HH:mm")} to ${format(parseISO(s.endTime), "HH:mm")}.${s.note ? ` Note: ${s.note}` : ""}`;
      }).join("\n");

      const allowedTyresStr = [
        tyreSoftAllowed && "SOFT",
        tyreMediumAllowed && "MEDIUM",
        tyreHardAllowed && "HARD",
        tyreWetAllowed && "WET"
      ].filter(Boolean).join(", ");

      const prompt = `You are a legendary race strategist and principal race engineer in competitive endurance motorsport. 
Analyze the current team race schedule and timeline:

Active Drivers: ${serializedDrivers || "None registered"}
Active Cars: ${serializedCars || "None registered"}
Active Race Duration: ${raceDurationHours} hours
Allowed Tyre Compounds: ${allowedTyresStr || "None"}

Scheduled Stints:
${serializedStints || "- No stints scheduled"}

Based on this complete operations dashboard, provide a highly specific, professional Race Strategy Briefing:
1. Identify any critical bottlenecks (e.g., driver changes coinciding with weather transitions, gaps in scheduled stints, active incidents causing caution windows).
2. Recommend pit windows and fuel/tire strategy adjustments, taking note of weather changes (like rain transitions requiring wet tires).
3. Draft a clear 'Race Engineer Alert' if any scheduling overlap, driver gap, or double-stint tire wear risk is detected.

CRITICAL STRATEGY CONSTRAINT: You must only suggest tire compounds that are in the Allowed Tyre Compounds list: ${allowedTyresStr || "None"}. Suggesting any compound not allowed in this session is highly illegal and will get the team disqualified. Adjust stint durations based on the active Race Duration of ${raceDurationHours} hours.

Be concise, technical, and authoritative. Speak like a pro-team strategist.`;

      const { llmBaseUrl, llmModelId, llmApiKey } = useWorkbench.getState();
      const url = resolveLLMUrl(llmBaseUrl);
      
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (llmApiKey) {
        headers["Authorization"] = `Bearer ${llmApiKey}`;
      }

      const res = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify({
          model: llmModelId || "local-model",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          stream: true,
        }),
      });

      if (!res.ok) {
        throw new Error(`Failed to query AI Race Engineer (${res.status} ${res.statusText}).`);
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          const lines = chunk.split("\n").filter((l) => l.trim() !== "");
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const dataStr = line.replace("data: ", "");
              if (dataStr === "[DONE]") return;
              try {
                const data = JSON.parse(dataStr);
                const token = data.choices?.[0]?.delta?.content;
                if (token) {
                  setAiResponse((prev) => (prev || "") + token);
                }
              } catch (e) {
                // Ignore parse errors on incomplete chunks
              }
            }
          }
        }
      }
    } catch (err: any) {
      const { llmBaseUrl } = useWorkbench.getState();
      setAiResponse(
        `Error invoking Local LLM: ${err.message}\n\nVerify that your Local LLM Server is running at "${llmBaseUrl}" and CORS is enabled! If using Ollama, launch with OLLAMA_ORIGINS="*" environment variable.`
      );
    } finally {
      setAiLoading(false);
    }
  };

  // Open stint popup handler
  const handleOpenAddStint = () => {
    setNewStint({
      carId: selectedCarId || cars[0]?.id || "",
      driverId: drivers[0]?.id || "",
      startOffset: 0,
      duration: calcStintLaps * (calcAvgLapTimeSec / 60),
      note: "",
    });
    setIsAddStintOpen(true);
  };

  // Command handlers
  const handleAddCar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCar.name || !newCar.number) return;
    const car: Car = {
      id: `c_${Date.now()}`,
      name: newCar.name,
      number: newCar.number,
      carClass: newCar.carClass,
    };
    setCars((prev) => [...prev, car]);
    setNewCar({ name: "", number: "", carClass: "GT3" });
    setIsAddCarOpen(false);
    if (!selectedCarId) setSelectedCarId(car.id);
  };

  const handleAddDriver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDriver.name || !newDriver.shortName) return;
    const driver: Driver = {
      id: `d_${Date.now()}`,
      name: newDriver.name,
      shortName: newDriver.shortName.toUpperCase(),
      color: newDriver.color,
      status: newDriver.status,
    };
    setDrivers((prev) => [...prev, driver]);
    setNewDriver({ name: "", shortName: "", color: "#3B82F6", status: "Available" });
    setIsAddDriverOpen(false);
  };

  const handleAddWeather = (e: React.FormEvent) => {
    e.preventDefault();
    const event: WeatherEvent = {
      id: `w_${Date.now()}`,
      type: newWeather.type,
      startTime: addMinutes(timelineStartTime, newWeather.startOffset).toISOString(),
      endTime: addMinutes(
        timelineStartTime,
        newWeather.startOffset + newWeather.duration,
      ).toISOString(),
    };
    setWeatherEvents((prev) => [...prev, event]);
    setIsAddWeatherOpen(false);
  };

  const handleAddStint = (e: React.FormEvent) => {
    e.preventDefault();
    const targetCarId = newStint.carId || selectedCarId;
    if (!targetCarId || !newStint.driverId) return;
    const stint: Stint = {
      id: `s_${Date.now()}`,
      carId: targetCarId,
      driverId: newStint.driverId,
      startTime: addMinutes(timelineStartTime, newStint.startOffset).toISOString(),
      endTime: addMinutes(
        timelineStartTime,
        newStint.startOffset + newStint.duration,
      ).toISOString(),
      note: newStint.note,
    };
    setStints((prev) => [...prev, stint]);
    setIsAddStintOpen(false);
  };

  const handleAddIncident = (e: React.FormEvent) => {
    e.preventDefault();
    const incident: RaceIncident = {
      id: `i_${Date.now()}`,
      type: newIncident.type,
      startTime: addMinutes(timelineStartTime, newIncident.startOffset).toISOString(),
      duration: newIncident.duration,
    };
    setIncidents((prev) => [...prev, incident]);
    setIsAddIncidentOpen(false);
  };

  // Stopwatch controls
  const toggleStopwatch = () => {
    setStopwatch((prev) => ({
      ...prev,
      isRunning: !prev.isRunning,
      lastStart: prev.isRunning ? null : Date.now(),
    }));
  };

  const resetStopwatch = () => {
    setStopwatch({ isRunning: false, elapsed: 0, lastStart: null });
  };

  // Drag & Drop driver assignment handler
  const handleStintDriverDrop = (stintSlotIndex: number, driverId: string) => {
    if (!selectedCarId) return;
    
    // Stint template mapping matching the 4 slots shown in Image 2
    const targetStintId = `stint_${selectedCarId}_${stintSlotIndex}`;
    const existingIndex = stints.findIndex(s => s.carId === selectedCarId && s.id === targetStintId);
    
    const updatedStints = [...stints];
    if (existingIndex !== -1) {
      updatedStints[existingIndex] = {
        ...updatedStints[existingIndex],
        driverId,
      };
    } else {
      // Calculate start and end offsets based on stint index (90 mins per slot)
      const start = addMinutes(timelineStartTime, stintSlotIndex * 90).toISOString();
      const end = addMinutes(timelineStartTime, (stintSlotIndex + 1) * 90).toISOString();
      updatedStints.push({
        id: targetStintId,
        carId: selectedCarId,
        driverId,
        startTime: start,
        endTime: end,
        note: `LAPS ${stintSlotIndex * 45 + 1}-${(stintSlotIndex + 1) * 45}`,
      });
    }
    setStints(updatedStints);

    // Update driver status in active roster as "Driving"
    setDrivers(prev => prev.map(d => d.id === driverId ? { ...d, status: "Driving" } : d.id !== driverId && d.status === "Driving" ? { ...d, status: "Available" } : d));
  };

  // Helper to fetch scheduled stints for the selected active car
  const activeStints = useMemo(() => {
    if (!selectedCarId) return [];
    
    // We guarantee 4 Stint blocks always map to the timeline track for strategy planning (aligning with Image 2)
    const result = [];
    for (let idx = 0; idx < 4; idx++) {
      const stintId = `stint_${selectedCarId}_${idx}`;
      const existing = stints.find(s => s.carId === selectedCarId && s.id === stintId);
      if (existing) {
        result.push(existing);
      } else {
        const start = addMinutes(timelineStartTime, idx * 90).toISOString();
        const end = addMinutes(timelineStartTime, (idx + 1) * 90).toISOString();
        result.push({
          id: stintId,
          carId: selectedCarId,
          driverId: "",
          startTime: start,
          endTime: end,
          note: `DRAG DRIVER HERE`,
        });
      }
    }
    return result;
  }, [stints, selectedCarId, timelineStartTime]);

  // Live telemetry channel sparkline tracer updates
  const [sparkData, setSparkData] = useState({
    speed: Array.from({ length: 25 }, () => 120),
    throttle: Array.from({ length: 25 }, () => 40),
    brake: Array.from({ length: 25 }, () => 0),
    rpm: Array.from({ length: 25 }, () => 5000),
    fuel: Array.from({ length: 25 }, () => 54),
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setSparkData(prev => {
        const appendVal = (arr: number[], val: number) => [...arr.slice(1), val];
        const snap = activeSnapshotRef.current;
        const nextSpeed = snap && snap.speedKph > 0 ? snap.speedKph : (t.connected ? t.speedKph : Math.round(180 + Math.random() * 80));
        const nextThrottle = t.connected ? t.throttle : Math.round(40 + Math.random() * 60);
        const nextBrake = t.connected ? t.brake : Math.round(Math.random() * 10);
        const nextRpm = snap && snap.rpm > 0 ? snap.rpm : (t.connected ? t.rpm : Math.round(5500 + Math.random() * 2000));
        const nextFuel = snap && snap.fuelRemainingL > 0 ? snap.fuelRemainingL : (t.connected ? t.fuelRemainingL : Math.round(52.8 + Math.random() * 1.5));

        return {
          speed: appendVal(prev.speed, nextSpeed),
          throttle: appendVal(prev.throttle, nextThrottle),
          brake: appendVal(prev.brake, nextBrake),
          rpm: appendVal(prev.rpm, nextRpm),
          fuel: appendVal(prev.fuel, nextFuel),
        };
      });
    }, 200);
    return () => clearInterval(interval);
  }, [t.connected, t.speedKph, t.throttle, t.brake, t.rpm, t.fuelRemainingL]);

  // Helper to toggle driver active status in registry
  const cycleDriverStatus = (driverId: string) => {
    setDrivers(prev => prev.map(d => {
      if (d.id !== driverId) return d;
      const nextStatus: Driver["status"] = 
        d.status === "Available" ? "In Garage" :
        d.status === "In Garage" ? "Driving" :
        d.status === "Driving" ? "Standby" : "Available";
      return { ...d, status: nextStatus };
    }));
  };

  return (
    <div className="w-full max-w-[100vw] min-h-screen bg-[#05070a] text-[#E2E4E8] flex flex-col font-mono relative select-none overflow-x-hidden p-0 rounded-none border-0">
      {/* Raster Backing Scanlines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1C2430_1px,transparent_1px),linear-gradient(to_bottom,#1C2430_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-[0.03] pointer-events-none" />

      {/* Top Main branding & Live Status Timing Header */}
      <header className="h-10 border-b border-[#1c2430] bg-[#0b0f14] px-3 flex items-center justify-between relative z-10 shrink-0 select-none">
        <div className="flex items-center gap-2.5">
          <span className="text-white font-black italic tracking-widest text-[11px] bg-gradient-to-r from-red-600 to-red-800 px-1.5 py-0.5 border border-red-500/20 rounded-none font-orbitron">PITWALL</span>
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#7a828c] font-bold font-rajdhani hidden sm:inline">TEAM COMMAND CENTRE</span>
          <span className="h-3.5 w-px bg-[#1c2430] hidden sm:inline" />
          <Link 
            to="/team-guide" 
            className="text-[8px] font-black text-[#3B82F6] hover:underline uppercase tracking-widest hidden sm:inline"
          >
            📖 SETUP GUIDE
          </Link>
        </div>

        {/* Global Track coordinates & connection status */}
        <div className="flex items-center gap-6 text-[8.5px] font-rajdhani">
          <div className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-[#00D17F] shadow-[0_0_6px_#00D17F] animate-pulse" />
            <span className="font-bold text-[#00D17F] uppercase tracking-widest text-[9.5px]">LIVE</span>
            <span className="text-[#7a828c] uppercase font-bold hidden md:inline tracking-widest text-[9px]">CIRCUIT DE SPA-FRANCORCHAMPS</span>
          </div>

          <div className="h-3 w-px bg-[#1c2430]" />

          <div className="hidden lg:flex items-center gap-1.5 tracking-widest text-[9px]">
            <span className="text-[#7a828c] uppercase">RACE TIMING:</span>
            <span className="font-black text-white font-mono">06:00:00 - WEC</span>
          </div>
        </div>

        {/* Active operator dial */}
        <div className="flex items-center gap-3 text-[9px] font-rajdhani">
          {teamCode && (
            <span 
              onClick={() => setShowTeamCodePanel(true)}
              className={`text-[8px] font-black uppercase tracking-widest border px-1.5 py-0.5 rounded-none cursor-pointer transition-all ${
                teamConnected 
                  ? "text-[#00D17F] border-[#00D17F]/25 bg-[#00D17F]/5 hover:bg-[#00D17F]/10" 
                  : "text-[#FF4D4D] border-red-500/25 bg-red-500/5 hover:bg-red-500/10 animate-pulse"
              }`}
            >
              {teamConnected ? `● SECURE RELAY: ${teamCode}` : `○ OFFLINE RELAY`}
            </span>
          )}
          <button
            type="button"
            onClick={() => setShowManagerSettings(!showManagerSettings)}
            className={`text-[8px] font-black uppercase tracking-widest border px-1.5 py-0.5 rounded-none cursor-pointer transition-all ${
              showManagerSettings 
                ? "text-[#FFB800] border-[#FFB800]/30 bg-[#FFB800]/10 animate-pulse" 
                : "text-[#7a828c] hover:text-white border-[#1c2430] bg-[#0b0f14]"
            }`}
          >
            🔧 SETTINGS
          </button>
          <Link to="/settings" className="p-0.5 hover:bg-[#11161d] border border-transparent hover:border-[#1c2430] text-[#7a828c] hover:text-white rounded-none transition-all">
            <Settings className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Main Grid Deck splits into Column 1 (Left), Column 2 (Center), and Column 3 (Right) - Contiguous Zero Margins */}
      <div 
        className="flex-1 grid gap-0 relative z-10 min-h-0 bg-[#05070a] border-b border-[#1c2430] rounded-none"
        style={{ gridTemplateColumns: "18% 64% 18%" }}
      >
        
        {/* COLUMN 1: SELECT CAR & DRIVER ROSTER DOSSIER - Shared Borders */}
        <section className="border-r border-[#1c2430] bg-[#0b0f14] flex flex-col justify-start select-none overflow-hidden h-full rounded-none">
          
          {/* SECTION 1: SELECT ACTIVE VEHICLE */}
          <div className="border-b border-[#1c2430] flex flex-col justify-between shrink-0 rounded-none">
            <div className="px-2.5 py-1.5 bg-[#11161d] border-b border-[#1c2430] flex items-center justify-between select-none">
              <span className="text-[9.5px] font-bold tracking-widest text-[#7a828c] uppercase font-rajdhani">
                1 SELECT CAR
              </span>
              <button
                onClick={() => setIsAddCarOpen(true)}
                className="text-[8px] font-black text-[#3B82F6] hover:underline uppercase tracking-widest cursor-pointer"
              >
                + ADD CAR
              </button>
            </div>

            <div className="p-1.5 space-y-1.5 max-h-44 overflow-y-auto scrollbar-hide">
              {cars.map((c) => {
                const isSelected = c.id === selectedCarId;
                const carStints = stints.filter(s => s.carId === c.id);
                // Extract driver labels assigned to this car
                const assignedDrivers = Array.from(new Set(carStints.map(s => {
                  const d = drivers.find(drv => drv.id === s.driverId);
                  return d ? d.name.split(" ").slice(-1)[0] : null;
                }).filter(Boolean)));

                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCarId(c.id)}
                    className={`p-2 rounded-none border transition-all text-left relative cursor-pointer group flex items-start gap-2.5 ${
                      isSelected
                        ? "bg-[#3B82F6]/5 border-[#3B82F6]/55 shadow-[0_0_8px_rgba(59,130,246,0.1)]"
                        : "bg-[#05070a]/60 border-[#1c2430] hover:border-[#7a828c]/40 hover:bg-[#11161d]"
                    }`}
                  >
                    {/* Car Silhouette Icon */}
                    <div className={`p-1.5 rounded-none bg-[#05070a] border border-[#1c2430] flex items-center justify-center shrink-0 ${isSelected ? "text-[#3B82F6]" : "text-[#7a828c]"}`}>
                      <CarIcon className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[9.5px] font-black text-[#E2E4E8] uppercase tracking-wider truncate">
                          {c.name}
                        </span>
                        <span className="text-[7px] font-black text-[#7a828c] uppercase tracking-widest bg-[#11161d] border border-[#1c2430] px-1 rounded-none">
                          {c.carClass}
                        </span>
                      </div>
                      <div className="text-[8.5px] font-mono text-[#3B82F6] font-black mt-0.5">
                        VEH_#{c.number}
                      </div>

                      {/* Display assigned drivers */}
                      <div className="flex flex-wrap items-center gap-1 mt-1">
                        {assignedDrivers.map((dName, i) => (
                          <span key={i} className="text-[6.5px] bg-[#11161d] border border-[#1c2430] text-[#7a828c] px-1 rounded-none font-bold uppercase tracking-wider">
                            {dName}
                          </span>
                        ))}
                        {assignedDrivers.length === 0 && (
                          <span className="text-[6.5px] text-[#7a828c] italic uppercase">No stint assigned</span>
                        )}
                      </div>
                    </div>

                    {/* Eviction trigger */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCar(c.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-red-500/10 hover:text-red-400 border border-transparent hover:border-red-500/25 rounded-none transition-all cursor-pointer absolute top-1.5 right-1.5"
                      title="Evict car"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 2: TEAM DRIVERS ROSTER LIST */}
          <div className="border-b border-[#1c2430] flex-1 flex flex-col min-h-0 bg-[#0b0f14] rounded-none">
            <div className="px-2.5 py-1.5 bg-[#11161d] border-b border-[#1c2430] flex items-center justify-between shrink-0 select-none">
              <span className="text-[9.5px] font-bold tracking-widest text-[#7a828c] uppercase font-rajdhani">
                2 DRIVERS ({selectedCar ? selectedCar.name.toUpperCase() : "NO CAR SELECTED"})
              </span>
              <button
                onClick={() => setIsAddDriverOpen(true)}
                className="text-[8px] font-black text-[#3B82F6] hover:underline uppercase tracking-widest cursor-pointer"
              >
                + ADD DRIVER
              </button>
            </div>

            <div className="p-1.5 space-y-1.5 flex-1 overflow-y-auto scrollbar-hide">
              {drivers.map((d) => {
                // Count scheduled stints on selected car
                const scheduledStintCount = stints.filter(s => s.carId === selectedCarId && s.driverId === d.id).length;
                const isFiltered = selectedRosterDriverId === d.id;

                // Match with team real-time channel driver online status
                const teamSnap = Array.from(teamDrivers.values()).find(
                  (snap) => snap.driverName.toLowerCase().includes(d.name.toLowerCase()) || 
                            d.name.toLowerCase().includes(snap.driverName.toLowerCase())
                );
                const isTeamOnline = teamSnap?.isOnline ?? false;
                const statusStr = isTeamOnline ? "Driving" : (d.status || "Available");

                // Set color indicators matching active statuses
                const activeColor = 
                  statusStr === "Driving" ? "text-red-400 bg-red-500/10 border-red-500/25 shadow-[0_0_6px_rgba(239,68,68,0.1)]" :
                  statusStr === "Available" ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/25 shadow-[0_0_6px_rgba(16,185,129,0.1)]" :
                  statusStr === "In Garage" ? "text-blue-400 bg-blue-500/10 border-blue-500/25 shadow-[0_0_6px_rgba(59,130,246,0.1)]" :
                  "text-amber-400 bg-amber-500/10 border-amber-500/25 shadow-[0_0_6px_rgba(245,158,11,0.1)]";

                return (
                  <div
                    key={d.id}
                    draggable="true"
                    onDragStart={(e) => {
                      e.dataTransfer.effectAllowed = "move";
                      e.dataTransfer.setData("text/plain", d.id);
                      e.dataTransfer.setData("driverId", d.id);
                    }}
                    onClick={() => {
                      // Click driver row to isolate their timeline stint block (Contextual Expansion)
                      setSelectedRosterDriverId(isFiltered ? null : d.id);
                    }}
                    className={`p-2 bg-[#05070a]/50 border rounded-none hover:bg-[#11161d] flex items-center justify-between gap-2.5 group transition-all cursor-grab active:cursor-grabbing relative ${
                      isFiltered ? "border-[#FFB800] bg-[#FFB800]/5" : "border-[#1c2430]"
                    }`}
                    title="Drag this driver to the timeline, or click to isolate stints. Click status badge to cycle driver availability."
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Interactive click driver filter (Contextual Expansion) */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRosterDriverId(isFiltered ? null : d.id);
                        }}
                        className="w-5 h-5 rounded-none flex items-center justify-center text-[8.5px] font-black text-black uppercase shrink-0 font-mono shadow-sm cursor-pointer hover:brightness-125 transition-all"
                        style={{ backgroundColor: d.color }}
                        title="Click to isolate stints on timeline"
                      >
                        {d.shortName}
                      </button>

                      <div className="min-w-0">
                        <div className="text-[9.5px] font-black text-[#E2E4E8] truncate uppercase tracking-wider pr-3 font-rajdhani flex items-center gap-1">
                          {isTeamOnline && (
                            <span className="size-1.5 rounded-full bg-[#00D17F] shadow-[0_0_4px_#00D17F] animate-pulse shrink-0" />
                          )}
                          {d.name}
                        </div>
                        <div className="text-[7px] font-bold text-[#7a828c] uppercase tracking-widest mt-0.5 font-rajdhani">
                          GOLD INDEX
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Interactive stint count index */}
                      <div className="text-right font-rajdhani">
                        <span className="text-[6.5px] text-[#7a828c] uppercase tracking-widest block font-bold leading-none">STINTS</span>
                        <span className="text-[9px] font-black text-white font-mono leading-none tracking-widest block mt-0.5">{scheduledStintCount} / 5</span>
                      </div>

                      {/* Status indicator button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          cycleDriverStatus(d.id);
                        }}
                        className={`text-[7.5px] font-black uppercase tracking-widest px-1.5 py-0.5 border rounded-none font-mono shrink-0 cursor-pointer select-none hover:brightness-125 transition-all ${activeColor}`}
                        title="Click to cycle availability"
                      >
                        {statusStr}
                      </button>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteDriver(d.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-red-500/10 hover:text-red-400 border border-transparent hover:border-red-500/25 rounded-none transition-all cursor-pointer absolute right-1 top-1"
                      title="Evict driver"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 3.5: STRATEGY STINT CALCULATOR */}
          <div className="border-t border-[#1c2430] bg-[#0b0f14] shrink-0 rounded-none p-2.5 font-mono text-[8px] space-y-2">
            <div className="flex items-center justify-between border-b border-[#1c2430]/60 pb-1.5 select-none font-rajdhani text-[9.5px]">
              <span className="font-bold tracking-widest text-[#7a828c] uppercase">
                🧮 STRATEGY STINT CALCULATOR
              </span>
              <button
                type="button"
                onClick={() => {
                  if (activeTeamTelemetry) {
                    if (activeTeamTelemetry.fuelBurnPerLap > 0) {
                      setCalcFuelBurn(Number(activeTeamTelemetry.fuelBurnPerLap.toFixed(2)));
                    }
                    if (activeTeamTelemetry.lastLapSec > 0) {
                      setCalcAvgLapTimeSec(Math.round(activeTeamTelemetry.lastLapSec));
                    }
                  } else if (t.connected) {
                    setCalcFuelBurn(2.85);
                  }
                }}
                disabled={!activeTeamTelemetry && !t.connected}
                className="text-[7.5px] font-black text-[#3B82F6] hover:underline uppercase tracking-widest cursor-pointer disabled:opacity-40 disabled:hover:no-underline"
              >
                ↺ SYNC telemetry
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col gap-1">
                <span className="text-[#7a828c] text-[6.5px] uppercase font-bold">BURN (L/LAP)</span>
                <input
                  type="number"
                  step="0.01"
                  value={calcFuelBurn}
                  onChange={(e) => setCalcFuelBurn(Number(e.target.value))}
                  className="w-full bg-[#05070a] border border-[#1c2430] rounded-none px-1.5 py-1 text-white font-mono font-bold text-[8.5px] focus:border-[#3B82F6] focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[#7a828c] text-[6.5px] uppercase font-bold">STINT LAPS</span>
                <input
                  type="number"
                  value={calcStintLaps}
                  onChange={(e) => setCalcStintLaps(Number(e.target.value))}
                  className="w-full bg-[#05070a] border border-[#1c2430] rounded-none px-1.5 py-1 text-white font-mono font-bold text-[8.5px] focus:border-[#3B82F6] focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[#7a828c] text-[6.5px] uppercase font-bold">AVG LAP (S)</span>
                <input
                  type="number"
                  value={calcAvgLapTimeSec}
                  onChange={(e) => setCalcAvgLapTimeSec(Number(e.target.value))}
                  className="w-full bg-[#05070a] border border-[#1c2430] rounded-none px-1.5 py-1 text-white font-mono font-bold text-[8.5px] focus:border-[#3B82F6] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 bg-[#05070a] border border-[#1c2430] p-1.5 rounded-none text-[7.5px] leading-tight">
              <div>
                <span className="text-[#7a828c] block text-[6.5px]">FUEL PER STINT</span>
                <span className="text-white font-bold font-mono text-[9px]">{calculatedFuelRequired} L</span>
              </div>
              <div>
                <span className="text-[#7a828c] block text-[6.5px]">STINT DURATION</span>
                <span className="text-white font-bold font-mono text-[9px]">{formatDuration(calculatedStintDurationMin)}</span>
              </div>
              {enduranceFuelPlan && (
                <>
                  <div className="border-t border-[#1c2430]/50 pt-1 mt-1 col-span-2 grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[#7a828c] block text-[6.5px]">EST. TOTAL FUEL</span>
                      <span className="text-[#00D17F] font-bold font-mono text-[9px]">{enduranceFuelPlan.totalFuel.toFixed(1)} L</span>
                    </div>
                    <div>
                      <span className="text-[#7a828c] block text-[6.5px]">EST. PIT STOPS</span>
                      <span className="text-[#3B82F6] font-bold font-mono text-[9px]">{enduranceFuelPlan.pitStops} STOPS</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* SECTION 3: DRAG & DROP DRIVERS TO TIMELINE CONTAINER */}
          <div className="p-2.5 bg-[#05070a] border-t border-[#1c2430] shrink-0 rounded-none">
            <span className="text-[9px] font-bold tracking-[0.2em] text-[#7a828c] uppercase block mb-2 select-none font-rajdhani">
              3 DRAG & DROP DRIVERS TO TIMELINE
            </span>

            <div className="flex flex-wrap gap-1.5">
              {drivers.map((d) => (
                <div
                  key={d.id}
                  draggable="true"
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = "move";
                    e.dataTransfer.setData("text/plain", d.id);
                    e.dataTransfer.setData("driverId", d.id);
                  }}
                  className="px-2.5 py-1 rounded-none border cursor-grab select-none font-mono text-[8.5px] font-black uppercase tracking-widest active:cursor-grabbing hover:brightness-125 transition-all shadow-sm"
                  style={{
                    backgroundColor: `${d.color}15`,
                    borderColor: d.color,
                    color: "#E2E4E8",
                  }}
                >
                  {d.name.split(" ").slice(-1)[0]}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* COLUMN 2: RACE TIMELINE & TACTICAL STRATEGY GRAPHS - Shared Borders */}
        <section className="border-r border-[#1c2430] flex flex-col bg-[#05070a] overflow-hidden h-full rounded-none">
          
          {/* SECTION 4: RACE TIMELINE & STRATEGY PLANNER */}
          <div className="border-b border-[#1c2430] bg-[#0b0f14] p-2.5 flex flex-col justify-between flex-1 min-h-0 relative z-10 rounded-none overflow-y-auto scrollbar-hide">
            
            {/* Header statistics panel */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-2.5 pb-2 border-b border-[#1c2430]/70 select-none font-rajdhani">
              <div className="flex items-center gap-4 flex-wrap">
                <span className="text-[11px] font-black uppercase tracking-widest text-[#E2E4E8]">
                  4 RACE TIMELINE & STRATEGY PLANNER
                </span>
                
                {/* Active Focus Mode Toggles */}
                <div className="flex bg-[#05070a] border border-[#1c2430] rounded-none p-0.5 text-[7px] font-black tracking-widest uppercase">
                  <span className="px-1.5 py-0.5 text-[#7a828c] select-none border-r border-[#1c2430]/60">FOCUS:</span>
                  {[
                    { id: "green", label: "GREEN_FLAG", color: "text-[#00D17F] hover:bg-[#00D17F]/10" },
                    { id: "fcy", label: "FCY_CAUTION", color: "text-[#FFB800] hover:bg-[#FFB800]/10 animate-pulse" },
                    { id: "wet", label: "RAIN_ONSET", color: "text-[#3B82F6] hover:bg-[#3B82F6]/10" }
                  ].map(mode => {
                    const active = focusMode === mode.id;
                    return (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => {
                          setFocusMode(mode.id as any);
                          // Auto switch graph tabs for contextual expand priority
                          if (mode.id === "fcy") setGraphTab("delta");
                          if (mode.id === "wet") setGraphTab("temp");
                        }}
                        className={`px-2 py-0.5 cursor-pointer rounded-none border-0 transition-all font-mono font-bold ${
                          active 
                            ? "bg-[#1c2430] text-white" 
                            : `${mode.color}`
                        }`}
                      >
                        {mode.label}
                      </button>
                    );
                  })}
                </div>

                {/* Variable Temporal Zooming */}
                <div className="flex bg-[#05070a] border border-[#1c2430] rounded-none p-0.5 text-[7px] font-black tracking-widest uppercase font-rajdhani">
                  <span className="px-1.5 py-0.5 text-[#7a828c] select-none border-r border-[#1c2430]/60">ZOOM:</span>
                  {["24h", "6h", "1h", "15m"].map(level => {
                    const active = zoomLevel === level;
                    return (
                      <button
                        key={level}
                        type="button"
                        onClick={() => applyZoomPreset(level as any)}
                        className={`px-1.8 py-0.5 cursor-pointer rounded-none border-0 transition-all font-mono font-bold ${
                          active 
                            ? "bg-[#1c2430] text-white" 
                            : "text-[#7a828c] hover:text-white"
                        }`}
                      >
                        {level.toUpperCase()}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Timing parameters grid */}
              <div className="flex flex-wrap items-center gap-3 text-[7.5px] font-mono tracking-widest uppercase font-black">
                <div className="text-right">
                  <span className="text-[#7a828c] block">RACE DURATION</span>
                  <span className="text-white text-[9px]">{String(raceDurationHours).padStart(2, '0')}:00:00</span>
                </div>
                <div className="w-px h-5 bg-[#1c2430]" />
                <div className="text-right">
                  <span className="text-[#7a828c] block">START TIME</span>
                  <span className="text-white text-[9px]">15:00</span>
                </div>
                <div className="w-px h-5 bg-[#1c2430]" />
                <div className="text-right">
                  <span className="text-[#7a828c] block">TIME SCALE</span>
                  <span className="text-[#FFB800] text-[9px]">30 MIN</span>
                </div>
                <div className="w-px h-5 bg-[#1c2430]" />
                <div className="text-right">
                  <span className="text-[#7a828c] block">EST. LAPS</span>
                  <span className="text-white text-[9px]">~215</span>
                </div>
                <div className="w-px h-5 bg-[#1c2430]" />
                <div className="text-right">
                  <span className="text-[#7a828c] block">FUEL WINDOW</span>
                  <span className="text-[#3B82F6] text-[9px]">18 LAPS</span>
                </div>
                <div className="w-px h-5 bg-[#1c2430]" />
                <div className="text-right">
                  <span className="text-[#7a828c] block">PIT WINDOWS</span>
                  <span className="text-[#FF4D4D] text-[9px]">3</span>
                </div>
                <div className="w-px h-5 bg-[#1c2430]" />
                <div className="text-right">
                  <span className="text-[#7a828c] block">STRATEGY SCORE</span>
                  <span className="text-[#00D17F] text-[9px] drop-shadow-[0_0_4px_#00D17F]">92%</span>
                </div>
              </div>
            </div>

            {showManagerSettings && (
              <div className="border border-[#FFB800]/30 bg-[#FFB800]/5 p-3 rounded-none mb-3 grid grid-cols-1 md:grid-cols-3 gap-3 relative font-mono text-left select-none shrink-0">
                <div className="absolute top-0 right-0 h-full w-1.5 bg-[#FFB800]" />
                
                {/* Column 1: Race session setup */}
                <div className="space-y-2 border-r border-[#1c2430] pr-3">
                  <span className="text-[9.5px] font-black text-[#FFB800] uppercase tracking-wider block font-rajdhani">
                    🏆 RACE SESSION PARAMETERS
                  </span>
                  
                  {/* Duration input */}
                  <div className="flex flex-col gap-1 text-[8.5px]">
                    <label className="text-[#7a828c] uppercase font-bold">Race Duration (Hours)</label>
                    <div className="flex bg-black border border-[#1c2430] p-0.5">
                      {[1, 2, 4, 6, 12, 24].map((h) => {
                        const isDur = raceDurationHours === h;
                        return (
                          <button
                            key={h}
                            type="button"
                            onClick={() => {
                              setRaceDurationHours(h);
                              // Sync temporal zoom level automatically for elite timing layout UX
                              if (h >= 12) {
                                setZoomLevel("24h");
                                setTimelineZoom(1.0);
                                setTimelinePanOffset(0);
                              } else if (h >= 4) {
                                setZoomLevel("6h");
                                setTimelineZoom(Math.max(1, h / 6));
                                setTimelinePanOffset(0);
                              } else if (h >= 2) {
                                setZoomLevel("6h");
                                setTimelineZoom(Math.max(1, h / 6));
                                setTimelinePanOffset(0);
                              } else {
                                setZoomLevel("1h");
                                setTimelineZoom(Math.max(1, h / 1));
                                setTimelinePanOffset(0);
                              }
                            }}
                            className={`flex-1 text-[8px] py-0.5 text-center font-bold border-0 cursor-pointer transition-colors ${
                              isDur ? "bg-[#FFB800] text-black" : "text-[#7a828c] hover:text-white"
                            }`}
                          >
                            {h}H
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Active tyre compound checklist */}
                  <div className="flex flex-col gap-1 text-[8.5px] pt-1">
                    <label className="text-[#7a828c] uppercase font-bold">Allowed Tyre Compounds</label>
                    <div className="grid grid-cols-2 gap-1.5 font-mono text-[8px] text-white">
                      {[
                        { id: "soft", label: "SOFT (S1)", state: tyreSoftAllowed, setter: setTyreSoftAllowed, color: "#FF4D4D" },
                        { id: "medium", label: "MEDIUM (S2)", state: tyreMediumAllowed, setter: setTyreMediumAllowed, color: "#FFB800" },
                        { id: "hard", label: "HARD (S3)", state: tyreHardAllowed, setter: setTyreHardAllowed, color: "#E2E4E8" },
                        { id: "wet", label: "WET (S4)", state: tyreWetAllowed, setter: setTyreWetAllowed, color: "#3B82F6" },
                      ].map((t) => (
                        <div
                          key={t.id}
                          onClick={() => t.setter(!t.state)}
                          className="flex items-center gap-1.5 cursor-pointer hover:bg-black/40 p-0.5 border border-[#1c2430] bg-black/20"
                        >
                          <span 
                            className="w-1 h-3 shrink-0" 
                            style={{ backgroundColor: t.state ? t.color : "#3A3F47" }}
                          />
                          <span className={t.state ? "font-bold" : "text-[#7a828c] line-through"}>
                            {t.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <p className="text-[7.5px] text-[#7a828c] font-sans leading-normal">
                    Disallowing compounds grays them out on the timeline and alerts the AI strategist so it never suggests disallowed tyres.
                  </p>
                </div>

                {/* Column 2: Driver Connection troubleshooting help */}
                <div className="space-y-2 border-r border-[#1c2430] pr-3 text-[8.5px]">
                  <span className="text-[9.5px] font-black text-[#FF4D4D] uppercase tracking-wider block font-rajdhani">
                    ⚠️ TELEMETRY CONNECTION ASSISTANT
                  </span>
                  <div className="space-y-1.5 font-sans leading-tight text-[#7a828c]">
                    <div className="flex gap-1.5 items-start">
                      <span className="text-[#FF4D4D] font-bold">1.</span>
                      <p>
                        <strong className="text-white uppercase font-mono text-[7.5px]">Driver Offline?</strong> Ensure driver executed <code className="font-mono bg-black text-red-400 px-0.5 border border-[#1c2430]">npm start</code> inside <code className="font-mono bg-black text-white px-0.5 border border-[#1c2430]">local-bridge/</code>.
                      </p>
                    </div>
                    <div className="flex gap-1.5 items-start">
                      <span className="text-[#FF4D4D] font-bold">2.</span>
                      <p>
                        <strong className="text-white uppercase font-mono text-[7.5px]">Handshake Fail?</strong> The `SUPABASE_ANON_KEY` inside <code className="font-mono bg-black text-white px-0.5 border border-[#1c2430]">local-bridge/.env</code> must match your Project keys.
                      </p>
                    </div>
                    <div className="flex gap-1.5 items-start">
                      <span className="text-[#FF4D4D] font-bold">3.</span>
                      <p>
                        <strong className="text-white uppercase font-mono text-[7.5px]">Code Mismatch?</strong> Ensure driver's `.env` uses your exact capitalized code: <strong className="text-white font-mono bg-black px-1 border border-[#1c2430]">{teamCode || "PITWALL-XXXX"}</strong>.
                      </p>
                    </div>
                    <div className="flex gap-1.5 items-start">
                      <span className="text-[#FF4D4D] font-bold">4.</span>
                      <p>
                        <strong className="text-white uppercase font-mono text-[7.5px]">DB Paused?</strong> Free Supabase projects auto-pause after 7 days. Restore project active status on <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-[#3B82F6] hover:underline font-mono">supabase.com</a>.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Column 3: Live telemetry compliance readout */}
                <div className="space-y-2 text-[8.5px]">
                  <span className="text-[9.5px] font-black text-[#00D17F] uppercase tracking-wider block font-rajdhani">
                    🟢 LIVE SYSTEM SPECIFICATION
                  </span>
                  <div className="space-y-1 font-mono text-[8px] text-[#7a828c]">
                    <div className="flex justify-between border-b border-[#1c2430]/50 pb-0.5">
                      <span>RACE DURATION:</span>
                      <span className="text-white font-bold">{raceDurationHours} HOURS</span>
                    </div>
                    <div className="flex justify-between border-b border-[#1c2430]/50 pb-0.5">
                      <span>ACTIVE CO-PILOTS:</span>
                      <span className="text-white font-bold">{drivers.length} REGISTERED</span>
                    </div>
                    <div className="flex justify-between border-b border-[#1c2430]/50 pb-0.5">
                      <span>RELAY PIPELINE:</span>
                      <span className={`font-bold ${teamConnected ? "text-[#00D17F]" : "text-red-400"}`}>
                        {teamConnected ? "CONNECTED" : "DISCONNECTED"}
                      </span>
                    </div>
                    <div className="flex justify-between pb-0.5">
                      <span>DB ROW SEGREGATION:</span>
                      <span className="text-white font-bold font-mono">JWT ROW-SECURITY</span>
                    </div>
                  </div>
                  
                  <div className="mt-2.5 p-1 bg-black/40 border border-[#1c2430] text-center text-[7px] uppercase text-[#7a828c]">
                    <span className="text-white font-bold">EXPLANATIVE SUMMARY:</span> This is your Race Wall Strategy center. Configure race duration and compounds to adapt live fuel math. Send credentials to drivers to sync timing stands.
                  </div>
                </div>
              </div>
            )}

            {/* Gantt Timeline scale rulers - Flush mounted panels */}
            <div 
              onWheel={onTimelineWheel}
              onMouseDown={onTimelineMouseDown}
              onMouseMove={onTimelineMouseMove}
              onMouseUp={onTimelineMouseUp}
              onMouseLeave={onTimelineMouseUp}
              onContextMenu={onContextMenu}
              className="relative border border-[#1c2430] bg-[#05070a] p-2.5 rounded-none overflow-hidden select-none select-none cursor-ew-resize timeline-gantt-container"
            >
              
              {/* Vertical grids backing */}
              <div className="absolute inset-y-0 left-[110px] right-0 flex pointer-events-none z-0">
                {Array.from({ length: 7 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="flex-1 border-l border-[#1c2430]/35 h-full first:border-l-0"
                  />
                ))}
              </div>

              <div className="relative z-10 space-y-3">
                
                {/* Horizontal scale hours header */}
                <div className="flex border-b border-[#1c2430]/60 pb-1.5 font-mono text-[7.5px] text-[#7a828c] font-black uppercase tracking-widest">
                  <span className="w-24 shrink-0 text-[#7a828c] font-rajdhani">RACE TIMELINE</span>
                  <div className="flex-1 flex justify-between font-mono">
                    {Array.from({ length: 7 }).map((_, idx) => {
                      const pct = idx / 6;
                      const currentMin = startTimeOffsetMin + pct * visibleDuration;
                      const hrs = Math.floor(currentMin / 60);
                      const mins = Math.round(currentMin % 60);
                      let label = "";
                      if (raceDurationHours >= 4 && timelineZoom < 4) {
                        label = `${hrs}:${String(mins).padStart(2, '0')}`;
                        if (idx === 0) label = "START";
                        if (idx === 6) label = `FINISH (${raceDurationHours}H)`;
                      } else {
                        label = `T+${hrs > 0 ? `${hrs}H ` : ""}${mins} MIN`;
                        if (idx === 0) label = "T+0 MIN";
                      }
                      return <span key={idx}>{label}</span>;
                    })}
                  </div>
                </div>

                {/* Stint Drag slots track */}
                {selectedCar ? (
                  <div className="flex items-center relative py-0.5">
                    <div className="w-24 shrink-0 pr-2">
                      <span className="text-[9px] font-black text-white tracking-widest flex items-center gap-1.5 uppercase leading-none">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]" />
                        #{selectedCar.number} {selectedCar.name.split(" ").slice(-1)[0]}
                      </span>
                    </div>

                    <div className="flex-1 relative bg-[#0b0f14]/80 border border-[#1c2430] p-1 h-12 rounded-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] overflow-hidden">
                      {activeStints.map((stint, stintIdx) => {
                        const driver = drivers.find(d => d.id === stint.driverId);
                        
                        // Contextual Highlights: Dim stints if they do not match driver selection filter
                        const isDimmed = selectedRosterDriverId && stint.driverId !== selectedRosterDriverId;
                        const isHighlighted = selectedRosterDriverId && stint.driverId === selectedRosterDriverId;
                        const isHovered = hoveredStintIndex === stintIdx;

                        const slotStyle = getSlotStyle(stintIdx);
                        if (slotStyle.display === "none") return null;

                        return (
                          <div
                            key={stint.id}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                              const drvId = e.dataTransfer.getData("text/plain") || e.dataTransfer.getData("driverId");
                              if (drvId) handleStintDriverDrop(stintIdx, drvId);
                            }}
                            onClick={() => {
                              // Click to cycle drivers for easy non-drag touchscreen use
                              if (drivers.length === 0) return;
                              const currentDriverIdx = drivers.findIndex(d => d.id === stint.driverId);
                              let nextDriverId = "";
                              if (stint.driverId === "") {
                                nextDriverId = drivers[0].id;
                              } else if (currentDriverIdx === drivers.length - 1) {
                                nextDriverId = ""; // empty slot
                              } else {
                                nextDriverId = drivers[currentDriverIdx + 1].id;
                              }
                              handleStintDriverDrop(stintIdx, nextDriverId);
                            }}
                            onMouseEnter={() => setHoveredStintIndex(stintIdx)}
                            onMouseLeave={() => setHoveredStintIndex(null)}
                            className={`rounded-none border relative flex flex-col justify-center items-center px-1.5 select-none overflow-hidden transition-all duration-150 group/slot cursor-pointer ${
                              driver 
                                ? "bg-gradient-to-b from-[#11161d] to-[#0b0f14] shadow-md" 
                                : "bg-[#05070a] border-dashed border-[#1c2430] hover:bg-[#11161d]/40"
                            } ${isDimmed ? "opacity-25" : "opacity-100"} ${
                              isHighlighted ? "ring-1 ring-[#FFB800]" : ""
                            } ${isHovered ? "brightness-125" : ""}`}
                            style={{
                              ...slotStyle,
                              left: `calc(${parseFloat(slotStyle.left as string)}% + 2px)`,
                              width: `calc(${parseFloat(slotStyle.width as string)}% - 4px)`,
                              borderColor: driver ? driver.color : "#1C2430"
                            }}
                            title={driver ? `Driver: ${driver.name}\n${stint.note}. Hover to highlight fuel curve. Click to cycle drivers.` : "Drag driver here or click to assign."}
                          >
                            {driver ? (
                              <div className="flex flex-col items-center justify-center pointer-events-none w-full h-full relative">
                                <span 
                                  className="absolute top-0 inset-x-0 h-[2px] block pointer-events-none" 
                                  style={{ backgroundColor: driver.color }}
                                />
                                <div className="text-[9px] font-mono font-black tracking-widest text-[#E2E4E8] uppercase text-center mt-0.5 font-rajdhani pointer-events-none">
                                  {driver.shortName}
                                </div>
                                <div className="text-[7px] font-bold text-[#7a828c] uppercase tracking-wider mt-0.5 text-center truncate w-full font-rajdhani pointer-events-none">
                                  {stint.note || "Scheduled"}
                                </div>

                                {/* Pit Window overlay warning */}
                                <div className="absolute -right-1.5 inset-y-0 flex items-center z-20 pointer-events-none">
                                  <div className="w-[3px] h-3 bg-[#FF4D4D] rounded-none shadow-[0_0_6px_#FF4D4D]" />
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center text-center select-none py-0.5 pointer-events-none w-full h-full">
                                <span className="text-[6.5px] font-black text-[#7a828c]/65 uppercase tracking-wider block font-rajdhani pointer-events-none">
                                  DROP DRIVER
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-xs text-[#7a828c] italic uppercase font-rajdhani">
                    Select a car from the left database to schedule stints
                  </div>
                )}

                {/* Layer 2: Tyre Compound Track */}
                <div className="flex items-center relative py-0.5">
                  <div className="w-24 shrink-0 pr-2">
                    <span className="text-[7px] font-bold text-[#7a828c] tracking-widest uppercase font-rajdhani">
                      TYRE COMPOUND
                    </span>
                  </div>
                  <div className="flex-1 relative h-4 rounded-none border border-[#1c2430] bg-[#0b0f14]/50 p-[1px] select-none text-[6.5px] overflow-hidden">
                    <div 
                      className={`font-black flex items-center justify-center tracking-widest uppercase font-rajdhani ${
                        tyreSoftAllowed ? "bg-[#FF4D4D]/25 text-[#FF4D4D]" : "bg-black/40 text-[#7a828c] line-through decoration-red-500/50"
                      }`}
                      style={getSlotStyle(0)}
                    >
                      SOFT (S1) {!tyreSoftAllowed && "LOCKED"}
                    </div>
                    <div 
                      className={`font-black flex items-center justify-center tracking-widest uppercase font-rajdhani ${
                        tyreMediumAllowed ? "bg-[#FFB800]/25 text-[#FFB800]" : "bg-black/40 text-[#7a828c] line-through decoration-amber-500/50"
                      }`}
                      style={getSlotStyle(1)}
                    >
                      MEDIUM (S2) {!tyreMediumAllowed && "LOCKED"}
                    </div>
                    <div 
                      className={`font-black flex items-center justify-center tracking-widest uppercase font-rajdhani ${
                        tyreHardAllowed ? "bg-[#E2E4E8]/15 text-[#E2E4E8]/70" : "bg-black/40 text-[#7a828c] line-through decoration-white/50"
                      }`}
                      style={getSlotStyle(2)}
                    >
                      HARD (S3) {!tyreHardAllowed && "LOCKED"}
                    </div>
                    <div 
                      className={`font-black flex items-center justify-center tracking-widest uppercase font-rajdhani ${
                        tyreWetAllowed ? "bg-[#3B82F6]/25 text-[#3B82F6]" : "bg-black/40 text-[#7a828c] line-through decoration-blue-500/50"
                      }`}
                      style={getSlotStyle(3)}
                    >
                      WET (S4) {!tyreWetAllowed && "LOCKED"}
                    </div>
                  </div>
                </div>

                {/* Layer 3: Fuel Target & Legality Track */}
                <div className="flex items-center relative py-0.5">
                  <div className="w-24 shrink-0 pr-2">
                    <span className="text-[7px] font-bold text-[#7a828c] tracking-widest uppercase font-rajdhani">
                      FUEL & PIT WINDOW
                    </span>
                  </div>
                  <div className="flex-1 relative h-4 rounded-none border border-[#1c2430] bg-[#0b0f14]/50 p-[1px] font-mono text-[6.5px] overflow-hidden">
                    <div className="flex items-center justify-between px-1.5" style={getSlotStyle(0)}>
                      <span className="text-[#00D17F] font-rajdhani">MIN_BURN</span><span className="text-white">{zoomLevel === "24h" ? "2.65L" : "2.80L"}</span>
                    </div>
                    <div className="flex items-center justify-between px-1.5 bg-[#FF4D4D]/5" style={getSlotStyle(1)}>
                      <span className="text-[#FF4D4D] font-rajdhani">PIT_WINDOW</span><span className="text-white">LAP {zoomLevel === "24h" ? "42" : "45"}</span>
                    </div>
                    <div className="flex items-center justify-between px-1.5" style={getSlotStyle(2)}>
                      <span className="text-[#00D17F] font-rajdhani">MIN_BURN</span><span className="text-white">2.82L</span>
                    </div>
                    <div className="flex items-center justify-between px-1.5 bg-[#FF4D4D]/5" style={getSlotStyle(3)}>
                      <span className="text-[#FF4D4D] font-rajdhani">PIT_LEGAL</span><span className="text-white">LAP 180</span>
                    </div>
                  </div>
                </div>

                {/* Layer 4: FCY / Safety Car Caution Risk */}
                <div className={`flex items-center relative py-0.5 transition-all duration-200 ${focusMode === "fcy" ? "bg-yellow-500/5 ring-1 ring-yellow-500/30" : ""}`}>
                  <div className="w-24 shrink-0 pr-2">
                    <span className={`text-[7px] font-bold tracking-widest uppercase font-rajdhani transition-colors ${focusMode === "fcy" ? "text-[#FFB800]" : "text-[#7a828c]"}`}>
                      CAUTION FCY %
                    </span>
                  </div>
                  <div className="flex-1 relative h-4 rounded-none border border-[#1c2430] bg-[#0b0f14]/50 p-[1px] font-mono text-[6.5px] overflow-hidden">
                    <div className="bg-orange-500/10 flex items-center justify-center font-bold text-orange-400 tracking-wider font-rajdhani" style={getSlotStyle(0)}>
                      FCY RISK: 18% (LOW)
                    </div>
                    <div className={`bg-red-500/20 flex items-center justify-center font-bold text-red-400 tracking-wider font-rajdhani ${focusMode === "fcy" ? "animate-pulse border-red-500" : ""}`} style={getSlotStyle(1)}>
                      FCY RISK: 75% (CRITICAL)
                    </div>
                    <div className="bg-yellow-500/15 flex items-center justify-center font-bold text-[#FFB800] tracking-wider font-rajdhani" style={getSlotStyle(2)}>
                      FCY RISK: 40% (MEDIUM)
                    </div>
                    <div className="bg-emerald-500/5 flex items-center justify-center font-bold text-[#00D17F] tracking-wider font-rajdhani" style={getSlotStyle(3)}>
                      FCY RISK: 8% (NOMINAL)
                    </div>
                  </div>
                </div>

                {/* Layer 5: Weather Environment Rail */}
                <div className="flex items-center relative py-0.5">
                  <div className="w-24 shrink-0 pr-2">
                    <span className="text-[7px] font-bold text-[#7a828c] tracking-widest uppercase font-rajdhani">
                      MET WEATHER
                    </span>
                  </div>
                  <div className={`flex-1 relative transition-all duration-300 rounded-none border border-[#1c2430] bg-[#0b0f14]/50 p-[1px] overflow-hidden ${focusMode === "wet" ? "h-10" : "h-4"}`}>
                    <div className="text-[#f59e0b] bg-[#f59e0b]/5 flex flex-col items-center justify-center uppercase tracking-wider font-rajdhani leading-none text-[6.5px] font-bold" style={getSlotStyle(0)}>
                      <span>100% DRY / SUNNY</span>
                      {focusMode === "wet" && <span className="text-[5px] text-[#7a828c] mt-0.5">SLICK WINDOW</span>}
                    </div>
                    <div className="text-[#60a5fa] bg-[#60a5fa]/5 flex flex-col items-center justify-center uppercase tracking-wider font-rajdhani leading-none text-[6.5px] font-bold" style={getSlotStyle(1)}>
                      <span>40% DAMP OVERCAST</span>
                      {focusMode === "wet" && <span className="text-[5px] text-[#60a5fa] mt-0.5">SLICK CHASSIS OPTIMAL</span>}
                    </div>
                    <div className="text-[#94a3b8] bg-[#94a3b8]/5 flex flex-col items-center justify-center uppercase tracking-wider font-rajdhani leading-none text-[6.5px] font-bold" style={getSlotStyle(2)}>
                      <span>65% WET TRANSITION</span>
                      {focusMode === "wet" && <span className="text-[5px] text-[#94a3b8] mt-0.5">CROSSOVER IN 4 LAPS</span>}
                    </div>
                    <div className="text-blue-400 bg-blue-500/10 flex flex-col items-center justify-center uppercase tracking-wider font-rajdhani leading-none text-[6.5px] font-bold animate-pulse" style={getSlotStyle(3)}>
                      <span>80% WET STORM WARNING</span>
                      {focusMode === "wet" && <span className="text-[5px] text-blue-300 mt-0.5">HEAVY WET TYRES</span>}
                    </div>
                  </div>
                </div>

                {/* Rival Strategy Ghosting Track */}
                <div className="flex items-center relative py-0.5 border-t border-[#1c2430]/25 pt-1.5 mt-1.5">
                  <div className="w-24 shrink-0 pr-2">
                    <span className="text-[7px] font-bold text-[#7a828c]/60 tracking-widest uppercase font-rajdhani flex items-center gap-1.5">
                      <span className="w-1 h-1 bg-[#7a828c] opacity-50" />
                      RIVAL GHOST
                    </span>
                  </div>
                  <div className="flex-1 relative h-6 rounded-none border border-dashed border-[#1c2430]/65 bg-[#05070a]/20 p-[1px] opacity-60 text-[6.5px] overflow-hidden">
                    <div className="flex flex-col justify-center px-1.5 text-[#7a828c] leading-tight" style={getSlotStyle(0)}>
                      <span className="font-bold text-white uppercase text-[6px] font-rajdhani">#12 BMW HYBRID</span>
                      <span className="font-mono text-[5.5px]">PIT WINDOW: LAP 42-48</span>
                    </div>
                    <div className="flex flex-col justify-center px-1.5 bg-yellow-500/5 text-[#FFB800]/70 leading-tight" style={getSlotStyle(1)}>
                      <span className="font-bold uppercase text-[6px] font-rajdhani">UNDERCUT PROJECTION</span>
                      <span className="font-mono text-[5.5px]">CHANCE: 64% (HIGH)</span>
                    </div>
                    <div className="flex flex-col justify-center px-1.5 text-[#7a828c] leading-tight" style={getSlotStyle(2)}>
                      <span className="font-bold text-white uppercase text-[6px] font-rajdhani">#3 CADILLAC WTR</span>
                      <span className="font-mono text-[5.5px]">FUEL OFFSET: -1.2 LAPS</span>
                    </div>
                    <div className="flex flex-col justify-center px-1.5 bg-red-500/5 text-[#FF4D4D]/70 leading-tight" style={getSlotStyle(3)}>
                      <span className="font-bold uppercase text-[6px] font-rajdhani">TRAFFIC CONVERGENCE</span>
                      <span className="font-mono text-[5.5px]">LAP 195 · SECTOR 2</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* SECTION: STRATEGIC FUEL & TYRE DECAY TELEMETRY GRAPH - Edge-to-edge layout */}
          <div className="border-b border-[#1c2430] bg-[#05070a] p-2.5 h-[160px] flex-none flex flex-col relative select-none rounded-none">
            
            {/* Strategy selector tabs */}
            <div className="flex items-center justify-between border-b border-[#1c2430]/75 pb-1.5 mb-2.5 shrink-0 select-none">
              <div className="flex bg-[#0b0f14] border border-[#1c2430] rounded-none p-0.5">
                {[
                  { id: "fuel", label: "FUEL LEVEL (L)", color: "text-[#3B82F6]" },
                  { id: "tyre", label: "TYRE LIFE (%)", color: "text-[#00D17F]" },
                  { id: "temp", label: "TRACK TEMP (°C)", color: "text-[#FFB800]" },
                  { id: "delta", label: "DELTA TO LEADER (S)", color: "text-[#FF4D4D]" },
                ].map((t) => {
                  const isActive = graphTab === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setGraphTab(t.id as any)}
                      className={`px-2.5 py-0.5 text-[8px] font-black uppercase tracking-widest cursor-pointer transition-all rounded-none border-0 ${
                        isActive 
                          ? "bg-[#1c2430] text-white" 
                          : "text-[#7a828c] hover:text-[#E2E4E8] hover:bg-[#11161d]/50"
                      }`}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>

              <span className="text-[7px] font-black tracking-widest text-[#7a828c] uppercase">
                STRATEGIC SIMULATOR CURVES
              </span>
            </div>

            {/* SVG Interactive Telemetry Graph - Shared borders */}
            <div 
              onWheel={onTimelineWheel}
              onMouseDown={onTimelineMouseDown}
              onMouseMove={onTimelineMouseMove}
              onMouseUp={onTimelineMouseUp}
              onMouseLeave={onTimelineMouseUp}
              onContextMenu={onContextMenu}
              className="flex-1 min-h-0 relative bg-[#030508] border border-[#1c2430] rounded-none p-2 flex flex-col justify-between shadow-[inset_0_2px_8px_rgba(0,0,0,0.9)] cursor-ew-resize timeline-graph-container"
            >
              
              <div className="absolute inset-0 p-2.5 pointer-events-none select-none flex flex-col justify-between font-mono text-[7px] text-[#7a828c]/25 uppercase tracking-widest border-t border-[#1c2430]/5">
                <div className="flex justify-between border-b border-[#1c2430]/10 pb-0.5"><span>100% / MAX</span><span>ESTIMATED DOCK</span></div>
                <div className="flex justify-between border-b border-[#1c2430]/10 pb-0.5"><span>75%</span><span>STINT LAP LIMIT</span></div>
                <div className="flex justify-between border-b border-[#1c2430]/10 pb-0.5"><span>50%</span><span>PIT RECHARGE</span></div>
                <div className="flex justify-between border-b border-[#1c2430]/10 pb-0.5"><span>25% / MIN</span><span>CRITICAL LIMIT</span></div>
                <div className="flex justify-between font-black text-[#7a828c]/40">
                  {Array.from({ length: 7 }).map((_, idx) => {
                    const pct = idx / 6;
                    const currentMin = startTimeOffsetMin + pct * visibleDuration;
                    const hrs = Math.floor(currentMin / 60);
                    const mins = Math.round(currentMin % 60);
                    if (raceDurationHours >= 4 && timelineZoom < 4) {
                      if (idx === 0) return <span key={idx}>T+0:00</span>;
                      if (idx === 6) return <span key={idx}>FINISH</span>;
                      return <span key={idx}>{hrs}:{String(mins).padStart(2, '0')}</span>;
                    } else {
                      if (idx === 0) return <span key={idx}>T+0 MIN</span>;
                      return <span key={idx}>{hrs > 0 ? `${hrs}H ` : ""}${mins}M</span>;
                    }
                  })}
                </div>
              </div>

              {/* Dynamic SVG Strategy Graph curve rendering (Contextual Highlight Expansion Sync) */}
              <div className="w-full h-full relative z-10 pt-1 pb-5 px-1">
                <svg viewBox="0 0 600 120" width="100%" height="100%" preserveAspectRatio="none" className="w-full h-full block overflow-visible">
                  
                  {/* Grid Lines */}
                  <line x1="0" y1="30" x2="600" y2="30" stroke="#1c2430" strokeWidth="0.5" strokeDasharray="2 2" />
                  <line x1="0" y1="60" x2="600" y2="60" stroke="#1c2430" strokeWidth="0.5" strokeDasharray="2 2" />
                  <line x1="0" y1="90" x2="600" y2="90" stroke="#1c2430" strokeWidth="0.5" strokeDasharray="2 2" />
                  
                  <line x1={mapX(100)} y1="0" x2={mapX(100)} y2="120" stroke="#1c2430" strokeWidth="0.5" strokeDasharray="2 2" />
                  <line x1={mapX(200)} y1="0" x2={mapX(200)} y2="120" stroke="#1c2430" strokeWidth="0.5" strokeDasharray="2 2" />
                  <line x1={mapX(300)} y1="0" x2={mapX(300)} y2="120" stroke="#1c2430" strokeWidth="0.5" strokeDasharray="2 2" />
                  <line x1={mapX(400)} y1="0" x2={mapX(400)} y2="120" stroke="#1c2430" strokeWidth="0.5" strokeDasharray="2 2" />
                  <line x1={mapX(500)} y1="0" x2={mapX(500)} y2="120" stroke="#1c2430" strokeWidth="0.5" strokeDasharray="2 2" />

                  {graphTab === "fuel" && (
                    <>
                      {/* Segment 1 */}
                      <path
                        d={mapPath("M 5,20 Q 75,70 138,100")}
                        fill="none"
                        stroke="#3B82F6"
                        strokeWidth={hoveredStintIndex === 0 ? "3" : "1.8"}
                        opacity={hoveredStintIndex !== null && hoveredStintIndex !== 0 ? "0.25" : "1"}
                        className="transition-all duration-150"
                      />
                      {/* Segment 2 */}
                      <path
                        d={mapPath("M 140,20 Q 210,65 273,95")}
                        fill="none"
                        stroke="#3B82F6"
                        strokeWidth={hoveredStintIndex === 1 ? "3" : "1.8"}
                        opacity={hoveredStintIndex !== null && hoveredStintIndex !== 1 ? "0.25" : "1"}
                        className="transition-all duration-150"
                      />
                      {/* Segment 3 */}
                      <path
                        d={mapPath("M 275,20 Q 345,72 408,102")}
                        fill="none"
                        stroke="#3B82F6"
                        strokeWidth={hoveredStintIndex === 2 ? "3" : "1.8"}
                        opacity={hoveredStintIndex !== null && hoveredStintIndex !== 2 ? "0.25" : "1"}
                        className="transition-all duration-150"
                      />
                      {/* Segment 4 */}
                      <path
                        d={mapPath("M 410,20 Q 500,55 595,78")}
                        fill="none"
                        stroke="#3B82F6"
                        strokeWidth={hoveredStintIndex === 3 ? "3" : "1.8"}
                        opacity={hoveredStintIndex !== null && hoveredStintIndex !== 3 ? "0.25" : "1"}
                        className="transition-all duration-150"
                      />

                      {/* Verticals pit stops */}
                      <line x1={mapX(138)} y1="100" x2={mapX(140)} y2="20" stroke="#FF4D4D" strokeWidth="0.8" strokeDasharray="2 2" />
                      <line x1={mapX(273)} y1="95" x2={mapX(275)} y2="20" stroke="#FF4D4D" strokeWidth="0.8" strokeDasharray="2 2" />
                      <line x1={mapX(408)} y1="102" x2={mapX(410)} y2="20" stroke="#FF4D4D" strokeWidth="0.8" strokeDasharray="2 2" />

                      {/* Pit stop markers */}
                      <circle
                        cx={mapX(138)}
                        cy="100"
                        r={hoveredStintIndex === 0 ? "5" : "3"}
                        fill="#FFB800"
                        onMouseEnter={() => setHoveredStintIndex(0)}
                        onMouseLeave={() => setHoveredStintIndex(null)}
                        className="cursor-pointer transition-all duration-150"
                      />
                      <circle
                        cx={mapX(273)}
                        cy="95"
                        r={hoveredStintIndex === 1 ? "5" : "3"}
                        fill="#FFB800"
                        onMouseEnter={() => setHoveredStintIndex(1)}
                        onMouseLeave={() => setHoveredStintIndex(null)}
                        className="cursor-pointer transition-all duration-150"
                      />
                      <circle
                        cx={mapX(408)}
                        cy="102"
                        r={hoveredStintIndex === 2 ? "5" : "3"}
                        fill="#FFB800"
                        onMouseEnter={() => setHoveredStintIndex(2)}
                        onMouseLeave={() => setHoveredStintIndex(null)}
                        className="cursor-pointer transition-all duration-150"
                      />
                      <text x={mapX(138)} y="111" fill="#FFB800" fontSize="6.5" textAnchor="middle" fontWeight="bold" fontFamily="monospace" onMouseEnter={() => setHoveredStintIndex(0)} onMouseLeave={() => setHoveredStintIndex(null)} className="cursor-pointer">PIT</text>
                      <text x={mapX(273)} y="106" fill="#FFB800" fontSize="6.5" textAnchor="middle" fontWeight="bold" fontFamily="monospace" onMouseEnter={() => setHoveredStintIndex(1)} onMouseLeave={() => setHoveredStintIndex(null)} className="cursor-pointer">PIT</text>
                      <text x={mapX(408)} y="113" fill="#FFB800" fontSize="6.5" textAnchor="middle" fontWeight="bold" fontFamily="monospace" onMouseEnter={() => setHoveredStintIndex(2)} onMouseLeave={() => setHoveredStintIndex(null)} className="cursor-pointer">PIT</text>
                      <text x={mapX(590)} y="72" fill="#3B82F6" fontSize="7.5" textAnchor="end" fontWeight="bold" fontFamily="monospace">24.6 L</text>
                    </>
                  )}

                  {graphTab === "tyre" && (
                    <>
                      {/* Segment 1 */}
                      <path
                        d={mapPath("M 5,30 C 40,32 90,65 138,85")}
                        fill="none"
                        stroke="#00D17F"
                        strokeWidth={hoveredStintIndex === 0 ? "3" : "1.8"}
                        opacity={hoveredStintIndex !== null && hoveredStintIndex !== 0 ? "0.25" : "1"}
                        className="transition-all duration-150"
                      />
                      {/* Segment 2 */}
                      <path
                        d={mapPath("M 140,30 C 175,32 225,60 273,78")}
                        fill="none"
                        stroke="#00D17F"
                        strokeWidth={hoveredStintIndex === 1 ? "3" : "1.8"}
                        opacity={hoveredStintIndex !== null && hoveredStintIndex !== 1 ? "0.25" : "1"}
                        className="transition-all duration-150"
                      />
                      {/* Segment 3 */}
                      <path
                        d={mapPath("M 275,30 C 310,32 360,70 408,90")}
                        fill="none"
                        stroke="#00D17F"
                        strokeWidth={hoveredStintIndex === 2 ? "3" : "1.8"}
                        opacity={hoveredStintIndex !== null && hoveredStintIndex !== 2 ? "0.25" : "1"}
                        className="transition-all duration-150"
                      />
                      {/* Segment 4 */}
                      <path
                        d={mapPath("M 410,30 C 460,32 530,55 595,72")}
                        fill="none"
                        stroke="#00D17F"
                        strokeWidth={hoveredStintIndex === 3 ? "3" : "1.8"}
                        opacity={hoveredStintIndex !== null && hoveredStintIndex !== 3 ? "0.25" : "1"}
                        className="transition-all duration-150"
                      />

                      <circle cx={mapX(138)} cy="85" r="3" fill="#00D17F" />
                      <circle cx={mapX(273)} cy="78" r="3" fill="#00D17F" />
                      <circle cx={mapX(408)} cy="90" r="3" fill="#00D17F" />
                      <text x={mapX(590)} y="65" fill="#00D17F" fontSize="7.5" textAnchor="end" fontWeight="bold" fontFamily="monospace">52% LIFE</text>
                    </>
                  )}

                  {graphTab === "temp" && (
                    <>
                      {/* Track temp trace */}
                      <path
                        d={mapPath("M 5,80 Q 150,40 300,55 T 600,90")}
                        fill="none"
                        stroke="#FFB800"
                        strokeWidth="1.8"
                        className="drop-shadow-[0_0_4px_rgba(255,184,0,0.3)]"
                      />
                      <text x={mapX(590)} y="102" fill="#FFB800" fontSize="7.5" textAnchor="end" fontWeight="bold" fontFamily="monospace">28.4°C</text>
                    </>
                  )}

                  {graphTab === "delta" && (
                    <>
                      {/* Delta to leader trace */}
                      <path
                        d={mapPath("M 5,50 Q 70,53 138,55 M 140,42 Q 205,45 273,46 M 275,35 Q 340,33 408,32 M 410,22 Q 500,16 595,12")}
                        fill="none"
                        stroke="#FF4D4D"
                        strokeWidth="1.8"
                        className="drop-shadow-[0_0_4px_rgba(255,77,77,0.3)]"
                      />
                      <text x={mapX(590)} y="24" fill="#FF4D4D" fontSize="7.5" textAnchor="end" fontWeight="bold" fontFamily="monospace">-12.4s (LEAD)</text>
                    </>
                  )}
                </svg>
              </div>
            </div>

          </div>

          {/* SECTION: TACTICAL TIMING SHEET SPREADSHEET MATRIX */}
          <div className="bg-[#05070a] border-t border-[#1c2430] select-none rounded-none overflow-x-auto shrink-0 font-mono">
            <table className="w-full text-left font-mono text-[8px] border-collapse">
              <thead>
                <tr className="bg-[#11161d] border-b border-[#1c2430] text-[#7a828c] font-rajdhani text-[8.5px] font-bold tracking-wider uppercase">
                  <th className="px-2 py-1">SYS_ID</th>
                  <th className="px-2 py-1">TACTICAL SYSTEM OPERATIONAL CRITERION</th>
                  <th className="px-2 py-1 text-right">ACTIVE METRIC</th>
                  <th className="px-2 py-1 text-right">OFFSET DELTA</th>
                  <th className="px-2 py-1 text-right">TARGET LIMIT</th>
                  <th className="px-2 py-1 text-center">COMPLIANCE</th>
                  <th className="px-2 py-1">TIMING STATUS COMMENTARY</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1c2430]/35">
                <tr className="hover:bg-[#11161d]/40 transition-colors">
                  <td className="px-2 py-0.8 text-[#7a828c]">STRAT_01</td>
                  <td className="px-2 py-0.8 font-sans font-bold text-white text-[8.5px]">RACE PACE PROJECTION TARGET</td>
                  <td className="px-2 py-0.8 text-right font-bold">1:45.850</td>
                  <td className="px-2 py-0.8 text-right text-red-400 font-bold">+0.120s</td>
                  <td className="px-2 py-0.8 text-right text-[#7a828c]">1:45.730</td>
                  <td className="px-2 py-0.8 text-center"><span className="text-[#FFB800] bg-[#FFB800]/5 border border-[#FFB800]/25 px-1 uppercase text-[6.5px] tracking-wider rounded-none font-sans font-bold">WARNING</span></td>
                  <td className="px-2 py-0.8 text-[#7a828c] truncate">S1 (LA SOURCE) EXCEEDING DELTA WINDOW</td>
                </tr>
                <tr className="bg-[#0b0f14]/40 hover:bg-[#11161d]/40 transition-colors">
                  <td className="px-2 py-0.8 text-[#7a828c]">STRAT_02</td>
                  <td className="px-2 py-0.8 font-sans font-bold text-white text-[8.5px]">FUEL BURN EFFICIENCY RATIO</td>
                  <td className="px-2 py-0.8 text-right font-bold">2.85 L/LAP</td>
                  <td className="px-2 py-0.8 text-right text-[#00D17F] font-bold">-0.05 L/LAP</td>
                  <td className="px-2 py-0.8 text-right text-[#7a828c]">2.80 L/LAP</td>
                  <td className="px-2 py-0.8 text-center"><span className="text-[#00D17F] bg-[#00D17F]/5 border border-[#00D17F]/25 px-1 uppercase text-[6.5px] tracking-wider rounded-none font-sans font-bold">OPTIMAL</span></td>
                  <td className="px-2 py-0.8 text-[#7a828c] truncate">TARGET COMPLIANT FOR 215 LAP STINT LIMIT</td>
                </tr>
                <tr className="hover:bg-[#11161d]/40 transition-colors">
                  <td className="px-2 py-0.8 text-[#7a828c]">STRAT_03</td>
                  <td className="px-2 py-0.8 font-sans font-bold text-white text-[8.5px]">POTENTIAL OVERCUT STRATEGY GAIN</td>
                  <td className="px-2 py-0.8 text-right font-bold text-[#00D17F]">+18.650s</td>
                  <td className="px-2 py-0.8 text-right text-[#00D17F] font-bold">+3.420s</td>
                  <td className="px-2 py-0.8 text-right text-[#7a828c]">+15.230s</td>
                  <td className="px-2 py-0.8 text-center"><span className="text-[#00D17F] bg-[#00D17F]/5 border border-[#00D17F]/25 px-1 uppercase text-[6.5px] tracking-wider rounded-none font-sans font-bold">OPTIMAL</span></td>
                  <td className="px-2 py-0.8 text-[#7a828c] truncate">GREEN CAUTION WINDOW PREDICTION ALIGNED</td>
                </tr>
                <tr className="bg-[#0b0f14]/40 hover:bg-[#11161d]/40 transition-colors">
                  <td className="px-2 py-0.8 text-[#7a828c]">STRAT_04</td>
                  <td className="px-2 py-0.8 font-sans font-bold text-white text-[8.5px]">TYRE WEAR RATIO (FRONT-LEFT)</td>
                  <td className="px-2 py-0.8 text-right font-bold">1.65 %/LAP</td>
                  <td className="px-2 py-0.8 text-right text-red-400 font-bold">+0.15 %/LAP</td>
                  <td className="px-2 py-0.8 text-right text-[#7a828c]">1.50 %/LAP</td>
                  <td className="px-2 py-0.8 text-center"><span className="text-[#FF4D4D] bg-[#FF4D4D]/5 border border-red-500/25 px-1 uppercase text-[6.5px] tracking-wider rounded-none font-sans font-bold">CRITICAL</span></td>
                  <td className="px-2 py-0.8 text-[#7a828c] truncate">DOUBLE STINT NOT ADVISED · HIGH DEGRADATION</td>
                </tr>
                <tr className="hover:bg-[#11161d]/40 transition-colors">
                  <td className="px-2 py-0.8 text-[#7a828c]">STRAT_05</td>
                  <td className="px-2 py-0.8 font-sans font-bold text-white text-[8.5px]">NEXT MANDATORY PIT STOP OPEN</td>
                  <td className="px-2 py-0.8 text-right font-bold">LAP 91-97</td>
                  <td className="px-2 py-0.8 text-right text-white font-bold">-1.5 LAPS</td>
                  <td className="px-2 py-0.8 text-right text-[#7a828c]">LAP 93</td>
                  <td className="px-2 py-0.8 text-center"><span className="text-[#3B82F6] bg-[#3B82F6]/5 border border-[#3B82F6]/25 px-1 uppercase text-[6.5px] tracking-wider rounded-none font-sans font-bold">LEGAL</span></td>
                  <td className="px-2 py-0.8 text-[#7a828c] truncate">RECHARGE ALIGNED WITH PIT WINDOW 2</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* COLUMN 3: LIVE PIT WALL TELEMETRY HUD MONITOR & SPARKLINES (span 1) - Shared Borders */}
        <section className="col-span-1 bg-[#0b0f14] flex flex-col justify-start select-none overflow-hidden h-full rounded-none">
          
          {/* ACTIVE CHANNEL TIMING MONITOR HUD */}
          <div className="border-b border-[#1c2430] bg-[#05070a] rounded-none font-mono text-[8px] overflow-hidden select-none">
            
            {/* Contiguous Status Strip */}
            <div className="bg-[#11161d] border-b border-[#1c2430] px-2.5 py-1.5 flex items-center justify-between font-rajdhani text-[9.5px] font-bold text-white tracking-wider">
              <div className="flex items-center gap-1.5">
                <span className={`size-1.5 rounded-full ${teamConnected ? "bg-[#00D17F] shadow-[0_0_6px_#00D17F]" : "bg-red-500 animate-pulse shadow-[0_0_6px_rgba(239,68,68,0.7)]"}`} />
                <span>ACTIVE MONITOR CHANNEL HUD</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowTeamCodePanel(true)}
                  className={`text-[8px] border px-1.5 py-0.5 uppercase tracking-widest font-mono font-bold transition-all rounded-none cursor-pointer ${
                    teamCode 
                      ? "text-[#00D17F] bg-[#00D17F]/10 border-[#00D17F]/30 hover:bg-[#00D17F]/20" 
                      : "text-[#3B82F6] bg-[#3B82F6]/10 border-[#3B82F6]/30 hover:bg-[#3B82F6]/20"
                  }`}
                >
                  {teamCode ? `🔗 ${teamCode}` : "+ JOIN TEAM"}
                </button>
                {activeTeamTelemetry && (
                  <span className="text-red-400 text-[8px] bg-red-500/10 border border-red-500/25 px-1 py-0.5 uppercase font-mono tracking-widest animate-pulse font-sans font-bold">LIVE</span>
                )}
              </div>
            </div>

            {/* High-density metadata strip */}
            <div className="p-2 border-b border-[#1c2430]/65 space-y-1 font-sans text-[#7a828c] text-[8.5px] uppercase">
              <div className="flex justify-between items-center">
                <span className="font-mono text-[#E2E4E8] font-black text-[10px]">
                  {activeTeamTelemetry ? activeTeamTelemetry.driverName : "L. VANTHOOR"}
                </span>
                <span className="font-mono text-white bg-[#11161d] border border-[#1c2430] px-1 rounded-none text-[8.5px]">
                  {activeTeamTelemetry && activeTeamTelemetry.carOperationalState?.sequenceId 
                    ? `LAP ${activeTeamTelemetry.carOperationalState.sequenceId}` 
                    : "LAP 68"}
                </span>
              </div>
              <div className="flex justify-between font-mono text-[7px] tracking-wider">
                <span>{selectedCar ? selectedCar.name.toUpperCase() : "PORSCHE 963 LMDH"}</span>
                <span className="text-[#3B82F6] font-sans font-bold">WEC {selectedCar ? selectedCar.carClass : "GTP"} CLASS</span>
              </div>
            </div>

            {/* Monospace Telemetry Grid */}
            <div className="grid grid-cols-3 gap-0 border-b border-[#1c2430] bg-[#0b0f14] text-center font-mono">
              <div className="p-1 border-r border-[#1c2430]">
                <span className="text-[6.5px] text-[#7a828c] uppercase tracking-widest block leading-none font-sans font-bold">SPEED</span>
                <span className="text-[9.5px] font-black text-white block mt-0.5">
                  {activeTeamTelemetry ? activeTeamTelemetry.speedKph : (t.connected ? t.speedKph : 243)}{" "}
                  <span className="text-[6.5px] text-[#3B82F6]">KPH</span>
                </span>
              </div>
              <div className="p-1 border-r border-[#1c2430]">
                <span className="text-[6.5px] text-[#7a828c] uppercase tracking-widest block leading-none font-sans font-bold">GEAR</span>
                <span className="text-[9.5px] font-black text-[#FFB800] block mt-0.5">
                  {activeTeamTelemetry 
                    ? activeTeamTelemetry.gear === 0 ? "N" : activeTeamTelemetry.gear === -1 ? "R" : activeTeamTelemetry.gear 
                    : (t.connected ? t.gear : 6)}
                </span>
              </div>
              <div className="p-1">
                <span className="text-[6.5px] text-[#7a828c] uppercase tracking-widest block leading-none font-sans font-bold">RPM</span>
                <span className="text-[9.5px] font-black text-red-400 block mt-0.5">
                  {activeTeamTelemetry ? activeTeamTelemetry.rpm : (t.connected ? t.rpm : 7850)}
                </span>
              </div>
            </div>

            {/* Throttle & Brake visual telemetry input bars */}
            <div className="space-y-1.5 p-1.5 bg-[#05070a] border-b border-[#1c2430] rounded-none font-mono text-[8px]">
              {/* Throttle */}
              <div>
                <div className="flex justify-between mb-0.5 leading-none">
                  <span className="text-[#00D17F] font-bold text-[7.5px]">THROTTLE</span>
                  <span className="text-white font-bold text-[7.5px]">{t.connected ? `${(t.throttle * 100).toFixed(0)}%` : "78%"}</span>
                </div>
                <div className="h-1 bg-[#11161d] rounded-none overflow-hidden border border-[#1c2430]">
                  <div className="h-full bg-[#00D17F] rounded-none transition-all" style={{ width: t.connected ? `${t.throttle * 100}%` : "78%" }} />
                </div>
              </div>

              {/* Brake */}
              <div>
                <div className="flex justify-between mb-0.5 leading-none">
                  <span className="text-[#FF4D4D] font-bold text-[7.5px]">BRAKE</span>
                  <span className="text-white font-bold text-[7.5px]">{t.connected ? `${(t.brake * 100).toFixed(0)}%` : "12%"}</span>
                </div>
                <div className="h-1 bg-[#11161d] rounded-none overflow-hidden border border-[#1c2430]">
                  <div className="h-full bg-[#FF4D4D] rounded-none transition-all" style={{ width: t.connected ? `${t.brake * 100}%` : "12%" }} />
                </div>
              </div>
            </div>

            {/* Sector Splits Tabular Row */}
            <div className="p-1.5 space-y-1 border-b border-[#1c2430] bg-[#05070a]/75 text-[8px]">
              <div className="flex justify-between font-bold border-b border-[#1c2430]/30 pb-0.5 mb-1 text-[7px] text-[#7a828c] tracking-wider uppercase font-rajdhani">
                <span>TRACK SECTOR</span><span>DURATION</span><span>DELTA</span>
              </div>
              <div className="flex justify-between font-mono">
                <span className="text-[#7a828c]">S1 (LA SOURCE)</span>
                <span className="text-white font-bold">28.451</span>
                <span className="text-red-400 font-bold font-sans">+0.156</span>
              </div>
              <div className="flex justify-between font-mono">
                <span className="text-[#7a828c]">S2 (LES COMBES)</span>
                <span className="text-white font-bold">33.782</span>
                <span className="text-[#00D17F] font-bold font-sans">-0.203</span>
              </div>
              <div className="flex justify-between font-mono">
                <span className="text-[#7a828c]">S3 (BLANCHIMONT)</span>
                <span className="text-white font-bold">42.779</span>
                <span className="text-red-400 font-bold font-sans">+0.089</span>
              </div>
            </div>

            {/* Lap Times Data Strip */}
            <div className="p-1.5 font-mono text-[8px] space-y-0.5 bg-[#05070a]">
              <div className="flex justify-between">
                <span className="text-[#7a828c] font-rajdhani text-[8.5px]">LAST LAP TIME:</span>
                <span className="text-white font-bold">
                  {activeTeamTelemetry ? activeTeamTelemetry.lastLap : "1:46.012"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7a828c] font-rajdhani text-[8.5px]">BEST LAP TIME:</span>
                <span className="text-[#00D17F] font-bold">
                  {activeTeamTelemetry ? activeTeamTelemetry.bestLap : "1:45.234"}
                </span>
              </div>
              <div className="flex justify-between border-t border-[#1c2430]/30 pt-0.5 mt-0.5">
                <span className="text-[#7a828c] font-rajdhani text-[8.5px]">LEADER DELTA:</span>
                <span className="text-red-400 font-bold font-mono tracking-widest italic">
                  {activeTeamTelemetry && activeTeamTelemetry.deltaSec 
                    ? `+${activeTeamTelemetry.deltaSec.toFixed(3)}s` 
                    : "+0.842s"}
                </span>
              </div>
            </div>

          </div>

          {/* Animated SVG Spa GP Track Circuit Minimap - Tactical Overlay System */}
          <div className="p-2 bg-[#05070a] border-b border-[#1c2430] rounded-none flex flex-col items-center justify-center">
            <div className="w-full flex items-center justify-between border-b border-[#1c2430]/35 pb-1 mb-1.5 text-[7.5px] font-bold text-[#7a828c] font-rajdhani">
              <span className="uppercase">GP CIRCUIT TACTICAL MAP</span>
              <span className="text-right text-[#FFB800] uppercase tracking-widest font-mono text-[6.5px]">TRAFFIC WINDOW: +4.2s (CLEAR)</span>
            </div>
            
            <svg width="200" height="85" viewBox="0 0 260 110" className="overflow-visible select-none">
              {/* Sector 1 Steel Path */}
              <path
                d="M 50,75 L 45,70 L 48,55 L 65,40 L 95,35"
                fill="none"
                stroke="#475569"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              
              {/* Sector 2 Highlighted Path */}
              <path
                d="M 95,35 L 140,35 L 175,45 L 195,58 L 220,60"
                fill="none"
                stroke="#334155"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Sector 3 Path */}
              <path
                d="M 220,60 L 235,55 L 250,68 L 240,80 L 225,82 L 205,75 L 175,95 L 155,90 L 125,75 L 105,80 L 80,72 L 65,85 Z"
                fill="none"
                stroke="#1e293b"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Main GPS Blue circuit tracing path (No glow effects, pure engineering line) */}
              <path
                d="M 50,75 L 45,70 L 48,55 L 65,40 L 95,35 L 140,35 L 175,45 L 195,58 L 220,60 L 235,55 L 250,68 L 240,80 L 225,82 L 205,75 L 175,95 L 155,90 L 125,75 L 105,80 L 80,72 L 65,85 Z"
                fill="none"
                stroke="#3B82F6"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* TACTICAL OVERLAY: Pit lane merge zone (Dashed Red line) */}
              <path
                d="M 50,75 L 58,58 L 65,40"
                fill="none"
                stroke="#FF4D4D"
                strokeWidth="2"
                strokeDasharray="2 2"
              />
              
              {/* TACTICAL OVERLAY: FCY Caution risk T7-T9 (Yellow alert block overlay) */}
              <path
                d="M 140,35 L 175,45 L 195,58"
                fill="none"
                stroke="#FFB800"
                strokeWidth="3.5"
                strokeDasharray="1 1"
                opacity="0.8"
              />

              {/* Animated active vehicle position dot (No glow, precise solid GPS red tracker dot) */}
              <circle r="3" fill="#FF4D4D">
                <animateMotion
                  path="M 50,75 L 45,70 L 48,55 L 65,40 L 95,35 L 140,35 L 175,45 L 195,58 L 220,60 L 235,55 L 250,68 L 240,80 L 225,82 L 205,75 L 175,95 L 155,90 L 125,75 L 105,80 L 80,72 L 65,85 Z"
                  dur="20s"
                  repeatCount="indefinite"
                />
              </circle>

              {/* Monospace Checkpoints & Sector Tags */}
              <text x="32" y="85" fill="#7a828c" fontSize="5.5" fontFamily="monospace" fontWeight="bold">LA SOURCE (S1)</text>
              <text x="32" y="48" fill="#7a828c" fontSize="5.5" fontFamily="monospace" fontWeight="bold">EAU ROUGE</text>
              <text x="110" y="27" fill="#7a828c" fontSize="5.5" fontFamily="monospace" fontWeight="bold" textAnchor="middle">KEMMEL STR.</text>
              <text x="180" y="32" fill="#FFB800" fontSize="5.5" fontFamily="monospace" fontWeight="bold">LES COMBES (FCY)</text>
              <text x="245" y="50" fill="#7a828c" fontSize="5.5" fontFamily="monospace" fontWeight="bold">POUHON (S2)</text>
              <text x="188" y="103" fill="#7a828c" fontSize="5.5" fontFamily="monospace" fontWeight="bold">BLANCHIMONT</text>
              <text x="100" y="93" fill="#7a828c" fontSize="5.5" fontFamily="monospace" fontWeight="bold">BUS STOP (S3)</text>
              
              {/* Pit Exit Merge tag */}
              <text x="70" y="60" fill="#FF4D4D" fontSize="5" fontFamily="monospace" fontWeight="bold">PIT_MERGE</text>
            </svg>
          </div>

          {/* Live Channels Sparklines trace list */}
          <div className="p-2 bg-[#05070a] rounded-none font-mono text-[8px] space-y-2 flex-1 overflow-y-auto scrollbar-hide">
            <span className="text-[7.5px] text-[#7a828c] uppercase font-bold border-b border-[#1c2430]/25 pb-1 mb-1 block font-rajdhani">
              LIVE CHANNELS STREAM TRACES
            </span>
            
            {/* Speed trace */}
            <div className="flex items-center justify-between">
              <span className="text-[#7a828c] uppercase font-bold w-12 shrink-0 text-[7px] font-rajdhani">SPEED</span>
              <Sparkline data={sparkData.speed} color="#3B82F6" />
              <span className="text-white font-bold font-mono w-14 text-right">
                {activeTeamTelemetry ? activeTeamTelemetry.speedKph : (t.connected ? t.speedKph : 243)} km/h
              </span>
            </div>

            {/* Throttle trace */}
            <div className="flex items-center justify-between">
              <span className="text-[#00D17F] uppercase font-bold w-12 shrink-0 text-[7px] font-rajdhani">THROTTLE</span>
              <Sparkline data={sparkData.throttle} color="#00D17F" />
              <span className="text-white font-bold font-mono w-14 text-right">
                {t.connected ? `${(t.throttle * 100).toFixed(0)}%` : "78%"}
              </span>
            </div>

            {/* Brake trace */}
            <div className="flex items-center justify-between">
              <span className="text-[#FF4D4D] uppercase font-bold w-12 shrink-0 text-[7px] font-rajdhani">BRAKE</span>
              <Sparkline data={sparkData.brake} color="#FF4D4D" />
              <span className="text-white font-bold font-mono w-14 text-right">
                {t.connected ? `${(t.brake * 100).toFixed(0)}%` : "12%"}
              </span>
            </div>

            {/* RPM trace */}
            <div className="flex items-center justify-between">
              <span className="text-[#7a828c] uppercase font-bold w-12 shrink-0 text-[7px] font-rajdhani">RPM</span>
              <Sparkline data={sparkData.rpm} color="#FFB800" />
              <span className="text-white font-bold font-mono w-14 text-right">
                {activeTeamTelemetry ? activeTeamTelemetry.rpm : (t.connected ? t.rpm : 7850)} rpm
              </span>
            </div>

            {/* Fuel trace */}
            <div className="flex items-center justify-between">
              <span className="text-[#7a828c] uppercase font-bold w-12 shrink-0 text-[7px] font-rajdhani">FUEL</span>
              <Sparkline data={sparkData.fuel} color="#8B5CF6" />
              <span className="text-white font-bold font-mono w-14 text-right">
                {activeTeamTelemetry ? activeTeamTelemetry.fuelRemainingL.toFixed(1) : (t.connected ? t.fuelRemainingL.toFixed(1) : "54.2")} L
              </span>
            </div>
          </div>
        </section>

      </div>

      {/* BOTTOM CONSOLE ROW GRID (Snapping edge-to-edge - span 5 columns) - Shared borders */}
      <footer className="grid grid-cols-5 gap-0 bg-[#0b0f14] relative z-10 shrink-0 select-none rounded-none">
        
        {/* Widget 6: TEAM MET WEATHER STATUS */}
        <div className="p-2.5 border-r border-[#1c2430] font-mono text-[8.5px] space-y-1.5 flex flex-col justify-between rounded-none">
          <span className="text-[7.5px] font-black text-[#7a828c] uppercase tracking-widest border-b border-[#1c2430]/40 pb-0.5 flex items-center gap-1.5">
            <span className="size-1 bg-[#00D17F] rounded-full" />
            6 TEAM STATUS
          </span>

          <div className="grid grid-cols-2 gap-1.5 text-[#7a828c] pt-0.5">
            <div>
              <span className="block uppercase text-[6.5px] text-[#7a828c] font-bold">TRACK TEMP</span>
              <span className="text-white font-bold font-mono text-[10px]">28.4 °C</span>
            </div>
            <div>
              <span className="block uppercase text-[6.5px] text-[#7a828c] font-bold">AIR TEMP</span>
              <span className="text-white font-bold font-mono text-[10px]">22.1 °C</span>
            </div>
            <div>
              <span className="block uppercase text-[6.5px] text-[#7a828c] font-bold">HUMIDITY</span>
              <span className="text-white font-bold font-mono text-[10px]">45%</span>
            </div>
            <div>
              <span className="block uppercase text-[6.5px] text-[#7a828c] font-bold">WIND VEL</span>
              <span className="text-white font-bold font-mono text-[10px]">6.2 km/h</span>
            </div>
          </div>
          
          <div className="pt-1.5 border-t border-[#1c2430]/40 flex justify-between items-center text-[7px] font-bold">
            <span className="text-[#7a828c] uppercase">TRACK GRIP</span>
            <span className="text-[#00D17F] font-black uppercase">HIGH</span>
          </div>
        </div>

        {/* Widget: DRIVER ROSTER QUICK STATUS LIGHTS */}
        <div className="p-2.5 border-r border-[#1c2430] font-mono text-[8.5px] flex flex-col justify-between rounded-none">
          <span className="text-[7.5px] font-black text-[#7a828c] uppercase tracking-widest border-b border-[#1c2430]/40 pb-0.5">
            DRIVER ROSTER QUICK STATUS
          </span>

          <div className="space-y-1 py-0.5">
            {drivers.map(d => {
              const indicator = 
                d.status === "Driving" ? "bg-red-400" :
                d.status === "Available" ? "bg-[#00D17F]" :
                d.status === "In Garage" ? "bg-[#3B82F6]" : "bg-[#FFB800]";

              return (
                <div key={d.id} className="flex items-center justify-between text-[#E2E4E8] leading-none">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${indicator}`} />
                    <span className="uppercase text-[8.5px]">{d.name}</span>
                  </div>
                  <span className="text-[#7a828c] text-[7.5px] uppercase">{d.status || "Available"}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Widget: PROBABILISTIC FAILURE RISK & DEGRADATION MODEL */}
        <div className="p-2.5 border-r border-[#1c2430] font-mono text-[8.5px] flex flex-col justify-between rounded-none">
          <span className="text-[7.5px] font-black text-[#7a828c] uppercase tracking-widest border-b border-[#1c2430]/40 pb-0.5 font-rajdhani">
            PROBABILISTIC FAILURE & RISK MODEL
          </span>

          <div className="flex items-center gap-3 py-0.5 flex-1 min-h-0">
            {/* Inline Technical SVG side view blueprint vector layout */}
            <svg width="80" height="30" viewBox="0 0 110 40" className="overflow-visible opacity-75 shrink-0">
              <path
                d="M 5,28 L 22,28 A 6,6 0 0,1 34,28 L 65,28 A 6,6 0 0,1 77,28 L 96,28 L 98,22 L 92,20 L 92,10 L 72,12 L 56,12 L 42,16 L 24,18 L 10,24 Z"
                fill="none"
                stroke="#00D17F"
                strokeWidth="1.2"
              />
              <circle cx="28" cy="28" r="5" fill="none" stroke="#00D17F" strokeWidth="1" />
              <circle cx="28" cy="28" r="2" fill="#00D17F" />
              <circle cx="71" cy="28" r="5" fill="none" stroke="#00D17F" strokeWidth="1" />
              <circle cx="71" cy="28" r="2" fill="#00D17F" />
              {/* Rear Wing */}
              <line x1="90" y1="10" x2="98" y2="10" stroke="#00D17F" strokeWidth="1.5" />
              <line x1="94" y1="10" x2="94" y2="20" stroke="#00D17F" strokeWidth="0.8" />
            </svg>

            <div className="grid grid-cols-1 gap-x-0 gap-y-0.5 text-[7px] leading-none flex-1">
              <div className="flex justify-between"><span>PUNCTURE PROB</span><span className="text-[#00D17F] font-bold">8.2% [NOMINAL]</span></div>
              <div className="flex justify-between"><span>BRAKE THERMAL</span><span className="text-[#00D17F] font-bold">640°C [LIMIT 680]</span></div>
              <div className="flex justify-between"><span>HYBRID REGEN DEFICIT</span><span className="text-white font-bold">-0.12 kW</span></div>
              <div className="flex justify-between"><span>OVERHEAT COEFF</span><span className="text-[#00D17F] font-bold">0.14 [NOMINAL]</span></div>
              <div className="flex justify-between"><span>TYRE SLIP LIMIT</span><span className="text-[#FFB800] font-bold">1.05 [WARNING]</span></div>
            </div>
          </div>
        </div>

        {/* Widget: SCROLLING messages logs timing screen console */}
        <div className="p-2.5 border-r border-[#1c2430] font-mono text-[8.5px] flex flex-col justify-between rounded-none">
          <span className="text-[7.5px] font-black text-[#7a828c] uppercase tracking-widest border-b border-[#1c2430]/40 pb-0.5 font-rajdhani">
            ENGINEERING MESSAGES LOG
          </span>

          <div className="space-y-0.5 py-0.5 max-h-12 overflow-y-auto scrollbar-hide text-[#7a828c] text-[7.5px] leading-none select-none">
            <div
              onClick={() => handleAnomalyClick("temp", 3)}
              className="cursor-pointer hover:bg-[#11161d] hover:text-[#FFB800] p-0.5 transition-all flex justify-between"
              title="Click to jump to Stint 4 Track Temp"
            >
              <span><span className="text-white">14:32:15</span> TRACK TEMP RISING +1.2°C</span>
              <span className="text-[6px] border border-[#FFB800]/30 px-1 font-bold text-[#FFB800] rounded-none font-rajdhani">ANOMALY</span>
            </div>
            <div
              onClick={() => handleAnomalyClick("pit", 1)}
              className="cursor-pointer hover:bg-[#11161d] hover:text-[#3B82F6] p-0.5 transition-all flex justify-between"
              title="Click to jump to Stint 2 Fuel curve"
            >
              <span><span className="text-[#3B82F6]">14:31:48</span> CAR #7 ENTERED PITS</span>
              <span className="text-[6px] border border-[#3B82F6]/30 px-1 font-bold text-[#3B82F6] rounded-none font-rajdhani">PIT_BOX</span>
            </div>
            <div
              onClick={() => handleAnomalyClick("caution", 2)}
              className="cursor-pointer hover:bg-[#11161d] hover:text-[#FF4D4D] p-0.5 transition-all flex justify-between"
              title="Click to jump to Stint 3 Delta timeline"
            >
              <span><span className="text-[#FFB800]">14:30:22</span> YELLOW FLAG SECTOR 2 T7</span>
              <span className="text-[6px] border border-red-500/30 px-1 font-bold text-[#FF4D4D] rounded-none font-rajdhani">CAUTION</span>
            </div>
            <div
              onClick={() => handleAnomalyClick("green", 0)}
              className="cursor-pointer hover:bg-[#11161d] hover:text-[#00D17F] p-0.5 transition-all flex justify-between"
              title="Click to jump to Stint 1 Tyre Life"
            >
              <span><span className="text-[#00D17F]">14:28:11</span> GREEN FLAG RESOLVED - SPA OK</span>
              <span className="text-[6px] border border-[#00D17F]/30 px-1 font-bold text-[#00D17F] rounded-none font-rajdhani">RESOLVED</span>
            </div>
          </div>
        </div>

        {/* Widget: RADIO AI COACH DIRECTIVE */}
        <div className="p-2.5 font-mono text-[8.5px] flex items-stretch gap-2.5 bg-[#05070a]/50 select-none rounded-none">
          {/* Coach photo from the public folder */}
          <div className="w-10 bg-[#11161d] border border-[#1c2430] rounded-none overflow-hidden shrink-0 flex items-center justify-center">
            <img src="/images/coach-avatar.png" alt="AI Coach" className="w-full h-full object-cover" />
          </div>

          <div className="flex-1 flex flex-col justify-between min-w-0 leading-tight">
            <div>
              <span className="text-[#FFB800] font-black uppercase text-[7.5px] tracking-widest block mb-0.5">
                AI PIT WALL COACH
              </span>
              <p className="text-[7px] text-[#7a828c] uppercase leading-none font-sans line-clamp-2">
                "Good pace from Laurens. front tyres are in optimal temperature windows. next stint keep managing fuel. push to speak"
              </p>
            </div>

            <button className="w-full py-0.5 bg-[#FFB800]/10 hover:bg-[#FFB800]/20 border border-[#FFB800]/30 text-[#FFB800] text-[7.5px] font-black uppercase tracking-widest rounded-none transition-all cursor-pointer">
              PUSH TO SPEAKER
            </button>
          </div>
        </div>

      </footer>

      {/* Modal configuration overlays */}
      <>
        {/* TEAM CODE CONFIGURATION PANEL modal */}
        {showTeamCodePanel && (
          <div className="fixed inset-0 bg-[#05070A]/85 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-[#0b0f14] border border-[#1c2430] rounded-none p-5 relative shadow-2xl">
              <button
                type="button"
                onClick={() => setShowTeamCodePanel(false)}
                className="absolute top-4 right-4 p-1 hover:bg-[#11161d] border border-transparent hover:border-[#1c2430] rounded-none text-[#7a828c] hover:text-white transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              <h3 className="text-xs font-black uppercase tracking-widest text-[#E2E4E8] mb-4 border-b border-[#1c2430] pb-2">
                TEAM CHANNEL CONNECTION
              </h3>
              
              <div className="space-y-4">
                {teamCode ? (
                  <div className="space-y-3.5">
                    <div className="p-3 bg-[#00D17F]/5 border border-[#00D17F]/30 text-center font-mono">
                      <span className="text-[7.5px] font-bold text-[#7a828c] uppercase tracking-widest block mb-1">ACTIVE CHANNEL</span>
                      <span className="text-white text-sm font-black tracking-widest block font-orbitron">{teamCode}</span>
                      <span className="text-[7px] text-[#00D17F] font-bold uppercase tracking-wider block mt-2">
                        {teamConnected ? "● SECURELY SUBSCRIBED TO REALTIME RELAY" : "○ SUBMITTING TO RELAY CHANNEL..."}
                      </span>
                    </div>

                    <div className="text-[8px] text-[#7a828c] uppercase leading-relaxed font-sans text-center">
                      Drivers must place the pre-filled <code className="text-[#FFB800] font-mono font-bold">.env</code> in their bridge directory and run <code className="text-[#FFB800] font-mono font-bold">npm start</code> to publish telemetry.
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setTeamCode("");
                        setTeamCodeInput("");
                        setShowTeamCodePanel(false);
                      }}
                      className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/35 text-red-400 font-black uppercase tracking-widest text-[9px] rounded-none transition-all cursor-pointer"
                    >
                      DISCONNECT / LEAVE CHANNEL
                    </button>
                  </div>
                ) : (
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (teamCodeInput.trim()) {
                        setTeamCode(teamCodeInput.trim().toUpperCase());
                        setShowTeamCodePanel(false);
                      }
                    }} 
                    className="space-y-4"
                  >
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="team-code-input" className="text-[8px] font-black text-[#7a828c] uppercase tracking-widest pl-0.5">
                        TEAM CODE SEQUENCE
                      </label>
                      <input
                        id="team-code-input"
                        type="text"
                        value={teamCodeInput}
                        onChange={(e) => setTeamCodeInput(e.target.value)}
                        className="w-full bg-[#05070a] border border-[#1c2430] rounded-none px-3 py-2 text-xs font-mono font-bold text-[#E2E4E8] focus:border-[#3B82F6] focus:outline-none uppercase"
                        placeholder="PITWALL-XXXX"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={generateTeamCode}
                        className="py-2 bg-[#FFB800]/10 hover:bg-[#FFB800]/20 border border-[#FFB800]/35 text-[#FFB800] font-black uppercase tracking-widest text-[8.5px] rounded-none transition-all cursor-pointer"
                      >
                        ✦ GENERATE CODE
                      </button>
                      <button
                        type="submit"
                        className="py-2 bg-[#3B82F6]/10 hover:bg-[#3B82F6]/20 border border-[#3B82F6]/35 text-[#3B82F6] font-black uppercase tracking-widest text-[8.5px] rounded-none transition-all cursor-pointer"
                      >
                        JOIN CHANNEL
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

        {/* REGISTER CAR modal */}
        {isAddCarOpen && (
          <div className="fixed inset-0 bg-[#05070A]/85 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-[#0b0f14] border border-[#1c2430] rounded-none p-5 relative shadow-2xl">
              <button
                onClick={() => setIsAddCarOpen(false)}
                className="absolute top-4 right-4 p-1 hover:bg-[#11161d] border border-transparent hover:border-[#1c2430] rounded-none text-[#7a828c] hover:text-white transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              <h3 className="text-xs font-black uppercase tracking-widest text-[#E2E4E8] mb-4 border-b border-[#1c2430] pb-2">
                ADD ACTIVE VEHICLE
              </h3>
              <form onSubmit={handleAddCar} className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="car-name" className="text-[8px] font-black text-[#7a828c] uppercase tracking-widest pl-0.5">
                    CAR MODEL VECTOR
                  </label>
                  <input
                    id="car-name"
                    type="text"
                    value={newCar.name}
                    onChange={(e) => setNewCar((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-[#05070a] border border-[#1c2430] rounded-none px-3 py-2 text-xs font-mono font-bold text-[#E2E4E8] focus:border-[#3B82F6] focus:outline-none"
                    placeholder="PORSCHE 963"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="car-num" className="text-[8px] font-black text-[#7a828c] uppercase tracking-widest pl-0.5">
                      VEHICLE NO
                    </label>
                    <input
                      id="car-num"
                      type="text"
                      value={newCar.number}
                      onChange={(e) => setNewCar((prev) => ({ ...prev, number: e.target.value }))}
                      className="w-full bg-[#05070a] border border-[#1c2430] rounded-none px-3 py-2 text-xs font-mono font-bold text-[#E2E4E8] focus:border-[#3B82F6] focus:outline-none"
                      placeholder="7"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="car-cls" className="text-[8px] font-black text-[#7a828c] uppercase tracking-widest pl-0.5">
                      CLASS
                    </label>
                    <select
                      id="car-cls"
                      value={newCar.carClass}
                      onChange={(e) =>
                        setNewCar((prev) => ({
                          ...prev,
                          carClass: e.target.value as Car["carClass"],
                        }))
                      }
                      className="w-full bg-[#05070a] border border-[#1c2430] rounded-none px-3 py-2 text-xs font-mono font-bold text-[#E2E4E8] focus:border-[#3B82F6] focus:outline-none"
                    >
                      <option value="GT3">GT3</option>
                      <option value="GTP">GTP</option>
                      <option value="LMP2">LMP2</option>
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-[#3B82F6]/10 hover:bg-[#3B82F6]/20 border border-[#3B82F6]/35 text-[#3B82F6] font-black uppercase tracking-widest text-[9px] rounded-none transition-all cursor-pointer mt-2"
                >
                  CONFIRM FLEET LINK
                </button>
              </form>
            </div>
          </div>
        )}

        {/* REGISTER DRIVER modal */}
        {isAddDriverOpen && (
          <div className="fixed inset-0 bg-[#05070A]/85 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-[#0b0f14] border border-[#1c2430] rounded-none p-5 relative shadow-2xl">
              <button
                onClick={() => setIsAddDriverOpen(false)}
                className="absolute top-4 right-4 p-1 hover:bg-[#11161d] border border-transparent hover:border-[#1c2430] rounded-none text-[#7a828c] hover:text-white transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              <h3 className="text-xs font-black uppercase tracking-widest text-[#E2E4E8] mb-4 border-b border-[#1c2430] pb-2">
                ADD TEAM DRIVER
              </h3>
              <form onSubmit={handleAddDriver} className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="drv-name" className="text-[8px] font-black text-[#7a828c] uppercase tracking-widest pl-0.5">
                    FULL DIRECTIVE NAME
                  </label>
                  <input
                    id="drv-name"
                    type="text"
                    value={newDriver.name}
                    onChange={(e) => setNewDriver((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-[#05070a] border border-[#1c2430] rounded-none px-3 py-2 text-xs font-mono font-bold text-[#E2E4E8] focus:border-[#3B82F6] focus:outline-none"
                    placeholder="LAURENS VANTHOOR"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="drv-short" className="text-[8px] font-black text-[#7a828c] uppercase tracking-widest pl-0.5">
                      3-LETTER SIG
                    </label>
                    <input
                      id="drv-short"
                      type="text"
                      value={newDriver.shortName}
                      onChange={(e) =>
                        setNewDriver((prev) => ({ ...prev, shortName: e.target.value }))
                      }
                      className="w-full bg-[#05070a] border border-[#1c2430] rounded-none px-3 py-2 text-xs font-mono font-bold text-[#E2E4E8] focus:border-[#3B82F6] focus:outline-none"
                      placeholder="VAN"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="drv-color" className="text-[8px] font-black text-[#7a828c] uppercase tracking-widest pl-0.5">
                      SIGNATURE COLOR
                    </label>
                    <input
                      id="drv-color"
                      type="color"
                      value={newDriver.color}
                      onChange={(e) => setNewDriver((prev) => ({ ...prev, color: e.target.value }))}
                      className="w-full bg-[#05070a] border border-[#1c2430] rounded-none h-8 p-0 cursor-pointer"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-[#3B82F6]/10 hover:bg-[#3B82F6]/20 border border-[#3B82F6]/35 text-[#3B82F6] font-black uppercase tracking-widest text-[9px] rounded-none transition-all cursor-pointer mt-2"
                >
                  CONFIRM ROSTER ADDITION
                </button>
              </form>
            </div>
          </div>
        )}
      </>
    </div>
  );
}
