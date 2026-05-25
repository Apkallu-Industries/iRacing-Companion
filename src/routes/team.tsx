import { createFileRoute, Link } from "@tanstack/react-router";
import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Users,
  Car as CarIcon,
  Clock,
  Plus,
  Trash2,
  Settings,
  Calendar,
  AlertCircle,
  Fuel,
  Cloud,
  Sun,
  CloudSun,
  CloudRain,
  CloudDrizzle,
  CloudLightning,
  Droplets,
  ChevronRight,
  Play,
  Square,
  RefreshCw,
  Timer,
  Calculator,
  Zap,
  ShieldAlert,
  BrainCircuit,
  HelpCircle,
  X,
  PlusCircle,
  FileText,
  Sliders,
} from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import {
  format,
  addHours,
  subHours,
  subMinutes,
  startOfHour,
  addMinutes,
  differenceInMinutes,
  parseISO,
  isWithinInterval,
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

// Types extracted from SimTeam Manager
type Driver = { id: string; name: string; shortName: string; color: string };
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

const CAR_CLASSES = ["GTP", "LMP2", "GT3", "IndyCar", "NASCAR Cup", "NASCAR Xfinity", "NASCAR Trucks", "Touring Car", "GT4", "MX5", "Formula Vee", "Other"] as const;
const CLASS_COLORS: Record<string, string> = { GTP: "#3b82f6", LMP2: "#10b981", GT3: "#f59e0b", SRF3: "#f59e0b", GT4: "#f59e0b", MX5: "#f59e0b", "IndyCar": "#f59e0b", "NASCAR Cup": "#f59e0b", "NASCAR Xfinity": "#f59e0b", "NASCAR Trucks": "#f59e0b", "Touring Car": "#f59e0b", "Other": "#f59e0b" };
const WEATHER_COLORS: Record<WeatherType, string> = {
  Sunny: "#f59e0b",
  "Partly Cloudy": "#60a5fa",
  Overcast: "#94a3b8",
  "Light Rain": "#38bdf8",
  "Heavy Rain": "#2563eb",
  Thunderstorm: "#8b5cf6",
};
const WEATHER_ICONS: Record<WeatherType, string> = {
  Sunny: "Sun",
  "Partly Cloudy": "CloudSun",
  Overcast: "Cloud",
  "Light Rain": "CloudDrizzle",
  "Heavy Rain": "CloudRain",
  Thunderstorm: "CloudLightning",
};

const WeatherIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudDrizzle,
  CloudLightning,
};

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function TeamPage() {
  // SimTeam Core State Variables with localStorage persistence
  const [drivers, setDrivers] = useState<Driver[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("team_drivers");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [cars, setCars] = useState<Car[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("team_cars");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [stints, setStints] = useState<Stint[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("team_stints");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
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
      return saved ? saved : startOfHour(new Date()).toISOString();
    }
    return startOfHour(new Date()).toISOString();
  });
  const [defaultStintDuration, setDefaultStintDuration] = useState<number>(60);
  const [selectedCarId, setSelectedCarId] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("team_selected_car_id");
      return saved ? saved : null;
    }
    return null;
  });
  const [realTime, setRealTime] = useState(new Date());

  // Strategy planner calculator states
  const [calcFuelBurn, setCalcFuelBurn] = useState<number>(3.15);
  const [calcStintLaps, setCalcStintLaps] = useState<number>(22);

  // Sync to localStorage hooks
  useEffect(() => {
    localStorage.setItem("team_drivers", JSON.stringify(drivers));
  }, [drivers]);

  useEffect(() => {
    localStorage.setItem("team_cars", JSON.stringify(cars));
    if (cars.length > 0 && !selectedCarId) {
      setSelectedCarId(cars[0].id);
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
  const [activeTab, setActiveTab] = useState<"timeline" | "strategy" | "calc">("timeline");
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
  const [newDriver, setNewDriver] = useState({ name: "", shortName: "", color: "#3b82f6" });
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

  // simulated live telemetry grid
  const [liveTelemetry, setLiveTelemetry] = useState<
    Record<
      string,
      {
        isActive: boolean;
        driverName?: string;
        speed?: number;
        fuel?: number;
        lapsEstimated?: number;
        rpm?: number;
        gear?: number;
        lapsSincePit?: number;
      }
    >
  >({});

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
    return calcStintLaps * 1.5;
  }, [calcStintLaps]);

  const raceElapsedMs = useMemo(() => {
    return differenceInMinutes(realTime, parseISO(raceStartTime)) * 60 * 1000;
  }, [realTime, raceStartTime]);

  const timelineStartTime = parseISO(raceStartTime);
  const timelineHours = 24;
  const timelineEndTime = addHours(timelineStartTime, timelineHours);

  // Setup sample team stats on "Full Trial Demo" click
  const populateDemoData = () => {
    const baseTime = startOfHour(new Date());
    setRaceStartTime(baseTime.toISOString());

    const demoDrivers: Driver[] = [
      { id: "d1", name: "Lewis Hamilton", shortName: "HAM", color: "#00d2be" },
      { id: "d2", name: "Max Verstappen", shortName: "VER", color: "#1e3d59" },
      { id: "d3", name: "Charles Leclerc", shortName: "LEC", color: "#ff1801" },
    ];

    const demoCars: Car[] = [
      { id: "c1", name: "AMG GT3 Evo", number: "44", carClass: "GT3" },
      { id: "c2", name: "Acura GTP", number: "10", carClass: "GTP" },
    ];

    const demoStints: Stint[] = [
      {
        id: "s1",
        carId: "c1",
        driverId: "d1",
        startTime: baseTime.toISOString(),
        endTime: addMinutes(baseTime, 60).toISOString(),
        note: "Soft Tires, fuel saving",
      },
      {
        id: "s2",
        carId: "c1",
        driverId: "d3",
        startTime: addMinutes(baseTime, 60).toISOString(),
        endTime: addMinutes(baseTime, 120).toISOString(),
        note: "Medium tires, full push",
      },
      {
        id: "s3",
        carId: "c2",
        driverId: "d2",
        startTime: baseTime.toISOString(),
        endTime: addMinutes(baseTime, 90).toISOString(),
        note: "Qualifying mode",
      },
    ];

    const demoWeather: WeatherEvent[] = [
      {
        id: "w1",
        type: "Sunny",
        startTime: baseTime.toISOString(),
        endTime: addHours(baseTime, 2).toISOString(),
      },
      {
        id: "w2",
        type: "Partly Cloudy",
        startTime: addHours(baseTime, 2).toISOString(),
        endTime: addHours(baseTime, 5).toISOString(),
      },
      {
        id: "w3",
        type: "Light Rain",
        startTime: addHours(baseTime, 5).toISOString(),
        endTime: addHours(baseTime, 6).toISOString(),
      },
    ];

    const demoIncidents: RaceIncident[] = [
      {
        id: "i1",
        type: "Caution",
        startTime: addMinutes(baseTime, 45).toISOString(),
        duration: 10,
      },
      {
        id: "i2",
        type: "Safety Car",
        startTime: addMinutes(baseTime, 140).toISOString(),
        duration: 15,
      },
    ];

    setDrivers(demoDrivers);
    setCars(demoCars);
    setStints(demoStints);
    setWeatherEvents(demoWeather);
    setIncidents(demoIncidents);
    setSelectedCarId("c1");

    // Populate active live telemetry cards
    setLiveTelemetry({
      "44": {
        isActive: true,
        driverName: "Lewis Hamilton",
        speed: 254,
        fuel: 42.5,
        lapsEstimated: 14,
        rpm: 7400,
        gear: 5,
        lapsSincePit: 4,
      },
      "10": {
        isActive: true,
        driverName: "Max Verstappen",
        speed: 308,
        fuel: 32.1,
        lapsEstimated: 8,
        rpm: 8100,
        gear: 6,
        lapsSincePit: 12,
      },
    });
  };

  // dynamic tickers to fluctuate mock telemetry data
  useEffect(() => {
    if (Object.keys(liveTelemetry).length === 0) return;
    const t = setInterval(() => {
      setLiveTelemetry((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((num) => {
          const card = next[num];
          if (!card.isActive) return;

          // Randomly fluctuate RPM & speed
          let newRpm = (card.rpm ?? 7000) + Math.round((Math.random() - 0.5) * 600);
          let newGear = card.gear ?? 5;
          if (newRpm >= 8200) {
            newRpm = 5500;
            newGear = Math.min(6, newGear + 1);
          } else if (newRpm <= 5000) {
            newRpm = 7500;
            newGear = Math.max(1, newGear - 1);
          }

          next[num] = {
            ...card,
            rpm: newRpm,
            gear: newGear,
            speed: Math.round((card.speed ?? 200) + (Math.random() - 0.5) * 4),
            fuel: Number(Math.max(0.5, (card.fuel ?? 40) - 0.015).toFixed(2)),
          };
        });
        return next;
      });
    }, 200);
    return () => clearInterval(t);
  }, [liveTelemetry]);

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

  const handleDeleteStint = (stintId: string) => {
    setStints((prev) => prev.filter((s) => s.id !== stintId));
  };

  const handleDeleteWeather = (wId: string) => {
    setWeatherEvents((prev) => prev.filter((w) => w.id !== wId));
  };

  const handleDeleteIncident = (iId: string) => {
    setIncidents((prev) => prev.filter((inc) => inc.id !== iId));
  };

  // Open stint popup handler
  const handleOpenAddStint = () => {
    setNewStint({
      carId: selectedCarId || cars[0]?.id || "",
      driverId: drivers[0]?.id || "",
      startOffset: 0,
      duration: defaultStintDuration,
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
    };
    setDrivers((prev) => [...prev, driver]);
    setNewDriver({ name: "", shortName: "", color: "#3b82f6" });
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

  // UI calculations for Gantt timeline
  const getPositionPercentage = (isoString: string) => {
    const time = parseISO(isoString);
    const diff = differenceInMinutes(time, timelineStartTime);
    return Math.max(0, Math.min(100, (diff / (timelineHours * 60)) * 100));
  };

  const getWidthPercentage = (startIso: string, endIso: string) => {
    const start = parseISO(startIso);
    const end = parseISO(endIso);
    const duration = differenceInMinutes(end, start);
    return Math.max(1, Math.min(100, (duration / (timelineHours * 60)) * 100));
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans relative select-none">
      {/* App Header integrated from iRacing-Companion */}
      <AppHeader>
        <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
          Team Ops
        </span>
      </AppHeader>

      <main className="flex-1 w-full max-w-[1700px] mx-auto px-4 md:px-8 py-8 space-y-8 flex flex-col overflow-hidden">
        {/* Dynamic clocks and simulated trial controls top bar */}
        <section className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-border/40 pb-6 shrink-0">
          <div className="flex flex-wrap items-center gap-6">
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-0.5">
                LOCAL
              </span>
              <div className="flex items-baseline gap-1 font-mono text-xl font-bold text-foreground tracking-widest leading-none">
                {format(realTime, "HH:mm")}
                <span className="text-xs text-muted-foreground">:{format(realTime, "ss")}</span>
              </div>
            </div>

            <div className="w-px h-8 bg-border/40" />

            <div>
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest block mb-0.5">
                RACE TIME
              </span>
              <div className="flex items-baseline gap-1 font-mono text-xl font-bold text-primary tracking-widest leading-none">
                {raceElapsedMs < 0 ? "-" : ""}
                {Math.floor(Math.abs(raceElapsedMs) / 3600000)
                  .toString()
                  .padStart(2, "0")}
                :
                {Math.floor((Math.abs(raceElapsedMs) % 3600000) / 60000)
                  .toString()
                  .padStart(2, "0")}
                <span className="text-xs text-primary/60">
                  :
                  {Math.floor((Math.abs(raceElapsedMs) % 60000) / 1000)
                    .toString()
                    .padStart(2, "0")}
                </span>
              </div>
            </div>

            <div className="w-px h-8 bg-border/40" />

            {/* Stopwatch widget */}
            <div className="flex items-center gap-4 bg-muted/20 border border-border/40 rounded-2xl px-4 py-2">
              <div>
                <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest block">
                  PIT STOPWATCH
                </span>
                <span className="font-mono text-sm font-bold text-amber-500 tracking-wider">
                  {Math.floor(stopwatch.elapsed / 60)
                    .toString()
                    .padStart(2, "0")}
                  :{(Math.floor(stopwatch.elapsed) % 60).toString().padStart(2, "0")}.
                  {Math.floor((stopwatch.elapsed % 1) * 10)}
                </span>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={toggleStopwatch}
                  className={`p-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${stopwatch.isRunning
                    ? "bg-red-500/20 border-red-500/30 text-red-400"
                    : "bg-green-500/20 border-green-500/30 text-green-400"
                    }`}
                >
                  {stopwatch.isRunning ? (
                    <Square className="w-3.5 h-3.5 fill-red-400" />
                  ) : (
                    <Play className="w-3.5 h-3.5 fill-green-400" />
                  )}
                </button>
                <button
                  onClick={resetStopwatch}
                  className="p-1.5 bg-muted hover:bg-muted/80 rounded-lg border border-border/40 text-xs font-bold text-muted-foreground transition-all cursor-pointer"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* Quick populate trial button */}
          <div className="flex items-center gap-3">
            {drivers.length === 0 && (
              <button
                onClick={populateDemoData}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground hover:opacity-90 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg cursor-pointer"
              >
                <Sliders className="w-4 h-4" />
                Populate Full Stint Trial
              </button>
            )}
            <div className="flex p-0.5 bg-muted rounded-2xl border border-border/40">
              <button
                onClick={() => setActiveTab("timeline")}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${activeTab === "timeline"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                Timeline
              </button>
              <button
                onClick={() => setActiveTab("strategy")}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${activeTab === "strategy"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                Fuel Stints
              </button>
            </div>
          </div>
        </section>

        {/* Dynamic sub views */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-0">
          {/* Main Strategy Canvas (Timeline or calculators) */}
          <div className="lg:col-span-8 space-y-8 min-h-0 flex flex-col justify-start">
            {activeTab === "timeline" ? (
              <section className="hairline bg-panel rounded-3xl p-6 relative overflow-hidden flex flex-col justify-start shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 border border-primary/20 text-primary rounded-xl">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-sm font-mono uppercase tracking-widest text-foreground">
                        Race Timeline Coordinator
                      </h2>
                      <p className="text-[10px] text-muted-foreground">
                        Dynamic Gantt scheduling panel
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsAddWeatherOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-muted hover:bg-muted/80 text-xs font-bold uppercase tracking-wider rounded-xl border border-border/40 transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-blue-400" />
                      Weather
                    </button>
                    <button
                      onClick={() => setIsAddIncidentOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-muted hover:bg-muted/80 text-xs font-bold uppercase tracking-wider rounded-xl border border-border/40 transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-red-400" />
                      Incident
                    </button>
                    {cars.length > 0 && (
                      <button
                        onClick={handleOpenAddStint}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-primary text-primary-foreground hover:opacity-90 text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Stint
                      </button>
                    )}
                  </div>
                </div>

                {/* Timeline Grid Rulers */}
                <div className="relative border border-border/30 rounded-2xl bg-muted/10 p-4 select-none overflow-x-auto scrollbar-hide">
                  <div className="min-w-[700px] space-y-6 relative">
                    {/* Gantt Timeline Hours Header */}
                    <div className="flex border-b border-border/40 pb-2 relative z-10 font-mono text-[9px] text-muted-foreground uppercase tracking-widest">
                      {Array.from({ length: 9 }).map((_, idx) => {
                        const hr = idx * 3;
                        return (
                          <div
                            key={idx}
                            className="flex-1 text-left border-l border-border/20 pl-1.5 first:border-l-0"
                          >
                            HR {hr}
                          </div>
                        );
                      })}
                    </div>

                    {/* Active Incident status bars row */}
                    <div className="h-8 flex items-center relative border-b border-border/20 pb-3">
                      <span className="w-20 text-[9px] font-mono text-red-400 font-bold uppercase tracking-wider shrink-0">
                        INCIDENTS
                      </span>
                      <div className="flex-1 h-2 bg-muted/40 rounded-full relative overflow-hidden">
                        {incidents.map((inc) => {
                          const left = getPositionPercentage(inc.startTime);
                          const width = getWidthPercentage(
                            inc.startTime,
                            addMinutes(parseISO(inc.startTime), inc.duration).toISOString(),
                          );
                          return (
                            <div
                              key={inc.id}
                              style={{ left: `${left}%`, width: `${width}%` }}
                              className={`absolute h-full rounded-full flex items-center justify-end pr-1 cursor-pointer group/inc ${inc.type === "Caution"
                                ? "bg-amber-400 shadow-[0_0_8px_#fbbf24]"
                                : inc.type === "Safety Car"
                                  ? "bg-orange-500 shadow-[0_0_8px_#f97316]"
                                  : inc.type === "Red Flag"
                                    ? "bg-red-500 shadow-[0_0_8px_#ef4444]"
                                    : "bg-emerald-500"
                                }`}
                              title={`${inc.type}: ${inc.duration}m (Click to delete)`}
                              onClick={() => handleDeleteIncident(inc.id)}
                            >
                              <X className="w-2 h-2 text-black opacity-0 group-hover/inc:opacity-100 transition-opacity" />
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Meteorological weather timeline rows */}
                    <div className="h-8 flex items-center relative border-b border-border/20 pb-3">
                      <span className="w-20 text-[9px] font-mono text-blue-400 font-bold uppercase tracking-wider shrink-0">
                        WEATHER
                      </span>
                      <div className="flex-1 h-2 bg-muted/40 rounded-full relative overflow-hidden">
                        {weatherEvents.map((w) => {
                          const left = getPositionPercentage(w.startTime);
                          const width = getWidthPercentage(w.startTime, w.endTime);
                          return (
                            <div
                              key={w.id}
                              style={{
                                left: `${left}%`,
                                width: `${width}%`,
                                backgroundColor: WEATHER_COLORS[w.type],
                              }}
                              className="absolute h-full rounded-full transition-all flex items-center justify-end pr-1 cursor-pointer group/wea"
                              title={`${w.type}: ${format(parseISO(w.startTime), "HH:mm")} - ${format(parseISO(w.endTime), "HH:mm")} (Click to delete)`}
                              onClick={() => handleDeleteWeather(w.id)}
                            >
                              <X className="w-2 h-2 text-black opacity-0 group-hover/wea:opacity-100 transition-opacity" />
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Cars stints bars */}
                    <div className="space-y-4 pt-2">
                      {cars.map((car) => {
                        const carStints = stints.filter((s) => s.carId === car.id);
                        return (
                          <div key={car.id} className="flex items-center relative">
                            <div className="w-20 shrink-0">
                              <span className="text-[10px] font-bold text-foreground">
                                #{car.number}
                              </span>
                              <span className="text-[8px] font-mono text-muted-foreground block -mt-1">
                                {car.name}
                              </span>
                            </div>

                            <div className="flex-1 h-8 bg-muted/10 border border-border/20 rounded-xl relative p-1 flex items-center">
                              {carStints.map((stint) => {
                                const left = getPositionPercentage(stint.startTime);
                                const width = getWidthPercentage(stint.startTime, stint.endTime);
                                const driver = drivers.find((d) => d.id === stint.driverId);
                                if (!driver) return null;
                                return (
                                  <div
                                    key={stint.id}
                                    style={{
                                      left: `${left}%`,
                                      width: `${width}%`,
                                      backgroundColor: `${driver.color}20`,
                                      borderColor: driver.color,
                                    }}
                                    className="absolute h-6 rounded-lg border flex items-center justify-between px-2 select-none overflow-hidden transition-all group/stint"
                                    title={`${driver.name}: ${stint.note || "No notes"}`}
                                  >
                                    <span className="text-[8px] font-mono font-black tracking-widest text-zinc-100 leading-none uppercase truncate mr-1">
                                      {driver.shortName}
                                    </span>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteStint(stint.id);
                                      }}
                                      className="opacity-0 group-hover/stint:opacity-100 p-0.5 hover:bg-red-500/30 rounded text-red-400 transition-all duration-150 shrink-0 cursor-pointer"
                                      title="Remove Stint"
                                    >
                                      <X className="w-2.5 h-2.5" />
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}

                      {cars.length === 0 && (
                        <div className="text-center py-6 text-xs text-muted-foreground italic opacity-50 border border-dashed border-border/40 rounded-2xl">
                          Registry empty. Click "Populate Full Stint Trial" or add a car below.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            ) : (
              <section className="hairline bg-panel rounded-3xl p-6 relative overflow-hidden flex flex-col justify-start shadow-xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-primary/10 border border-primary/20 text-primary rounded-xl">
                    <Calculator className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-mono uppercase tracking-widest text-foreground">
                      Pit Fuel Strategy Planner
                    </h2>
                    <p className="text-[10px] text-muted-foreground">
                      Pit Stop & stint target calculator
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
                  <div className="bg-muted/15 border border-border/30 rounded-2xl p-4 space-y-4">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      Calculated Targets
                    </div>
                    <div className="space-y-3.5">
                      <div>
                        <span className="text-muted-foreground block mb-0.5 uppercase text-[9px] tracking-wider">
                          ESTIMATED STINT DURATION
                        </span>
                        <span className="text-sm font-bold text-foreground">
                          {formatDuration(calculatedStintDurationMin)} ({calcStintLaps} Laps)
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block mb-0.5 uppercase text-[9px] tracking-wider">
                          FUEL REQUIRED
                        </span>
                        <span className="text-sm font-bold text-blue-400">
                          {calculatedFuelRequired} Liters
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block mb-0.5 uppercase text-[9px] tracking-wider">
                          RECOMMENDED MARGIN (1.5 LAPS)
                        </span>
                        <span className="text-sm font-bold text-amber-500">
                          {calculatedFuelMargin} Liters
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block mb-0.5 uppercase text-[9px] tracking-wider">
                          EST. TIRE WEAR COEFFICIENT
                        </span>
                        <span className="text-sm font-bold text-emerald-400">
                          {calculatedTireWearCoefficient}% per lap
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted/15 border border-border/30 rounded-2xl p-4 space-y-3 col-span-2">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      Stint Parameters
                    </div>
                    <div className="space-y-4 pt-1 font-sans">
                      <div className="flex flex-col gap-1.5">
                        <label
                          htmlFor="fuel-burn"
                          className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest pl-1"
                        >
                          Avg Fuel Burn per lap (L)
                        </label>
                        <input
                          id="fuel-burn"
                          type="number"
                          step="0.01"
                          value={calcFuelBurn}
                          onChange={(e) => setCalcFuelBurn(parseFloat(e.target.value) || 0)}
                          className="w-full bg-background border border-border/60 rounded-xl px-3 py-2 text-xs font-mono"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label
                          htmlFor="stint-laps"
                          className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest pl-1"
                        >
                          Planned Stint Length (laps)
                        </label>
                        <input
                          id="stint-laps"
                          type="number"
                          value={calcStintLaps}
                          onChange={(e) => setCalcStintLaps(parseInt(e.target.value) || 0)}
                          className="w-full bg-background border border-border/60 rounded-xl px-3 py-2 text-xs font-mono"
                        />
                      </div>
                      <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl text-[10px] text-muted-foreground font-sans leading-normal">
                        Calculates stints for{" "}
                        <span className="font-bold text-foreground">
                          #{selectedCar?.number || "No active car"}
                        </span>
                        . Adjust burn rates and lap targets to update required race fuel.
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Registry Deck (Drivers and Cars lists) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 shrink-0">
              {/* Cars Registry */}
              <div className="hairline bg-panel rounded-3xl p-6 shadow-lg flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-border/40">
                    <div className="flex items-center gap-2">
                      <CarIcon className="w-4.5 h-4.5 text-primary" />
                      <span className="text-xs font-mono uppercase tracking-wider font-bold">
                        Active Cars ({cars.length})
                      </span>
                    </div>
                    <button
                      onClick={() => setIsAddCarOpen(true)}
                      className="p-1.5 hover:bg-muted border border-border/40 rounded-xl text-primary transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto scrollbar-hide pr-1">
                    {cars.map((c) => {
                      const isSelected = c.id === selectedCarId;
                      return (
                        <div
                          key={c.id}
                          onClick={() => setSelectedCarId(c.id)}
                          className={`p-3 rounded-2xl flex flex-col justify-between relative group overflow-hidden transition-all duration-300 cursor-pointer ${isSelected
                            ? "bg-primary/10 border-primary ring-1 ring-primary/40 shadow-[0_0_12px_rgba(var(--primary-rgb),0.15)]"
                            : "bg-muted/20 border-border/30 border hover:border-border/60 hover:bg-muted/30"
                            }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <span
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: CLASS_COLORS[c.carClass] }}
                              />
                              <span className="text-[8px] font-mono font-bold text-muted-foreground uppercase tracking-widest">
                                {c.carClass}
                              </span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteCar(c.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 hover:text-red-400 rounded-lg text-muted-foreground transition-all duration-200 cursor-pointer"
                              title="Delete Car"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="text-xs font-bold truncate pr-6">{c.name}</div>
                          <div className="text-[10px] font-mono text-blue-400 font-bold mt-0.5">
                            #{c.number}
                          </div>
                        </div>
                      );
                    })}
                    {cars.length === 0 && (
                      <div className="col-span-2 text-center py-4 text-[10px] text-muted-foreground italic opacity-50">
                        No cars registered
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Drivers Registry */}
              <div className="hairline bg-panel rounded-3xl p-6 shadow-lg flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-border/40">
                    <div className="flex items-center gap-2">
                      <Users className="w-4.5 h-4.5 text-primary" />
                      <span className="text-xs font-mono uppercase tracking-wider font-bold">
                        Active Drivers ({drivers.length})
                      </span>
                    </div>
                    <button
                      onClick={() => setIsAddDriverOpen(true)}
                      className="p-1.5 hover:bg-muted border border-border/40 rounded-xl text-primary transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto scrollbar-hide pr-1">
                    {drivers.map((d) => (
                      <div
                        key={d.id}
                        className="p-3 bg-muted/20 border border-border/30 rounded-2xl flex items-center justify-between relative group overflow-hidden"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white uppercase shrink-0 shadow-sm"
                            style={{ backgroundColor: d.color }}
                          >
                            {d.shortName}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold truncate pr-3">{d.name}</div>
                            <div className="text-[8px] font-mono text-muted-foreground uppercase tracking-widest mt-0.5">
                              Active
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteDriver(d.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 hover:text-red-400 rounded-lg text-muted-foreground transition-all duration-200 cursor-pointer"
                          title="Delete Driver"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    {drivers.length === 0 && (
                      <div className="col-span-2 text-center py-4 text-[10px] text-muted-foreground italic opacity-50">
                        No drivers registered
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Live Paddock Multi-Car Telemetry HUD grid */}
          <div className="lg:col-span-4 min-h-0 flex flex-col justify-start">
            <section className="hairline bg-panel rounded-3xl p-6 backdrop-blur-md shadow-2xl flex-1 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

              <div className="flex-1 flex flex-col justify-start min-h-0">
                <div className="flex items-center justify-between mb-6 border-b border-border/40 pb-4 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-2xl">
                      <Zap className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h2 className="text-sm font-mono uppercase tracking-widest text-foreground font-bold">
                        Paddock Live HUD
                      </h2>
                      <p className="text-[10px] text-muted-foreground">
                        Multi-car active stream relay grid
                      </p>
                    </div>
                  </div>
                  <span className="text-[8px] bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 px-2 py-0.5 rounded-full uppercase font-bold tracking-widest font-mono animate-pulse shrink-0">
                    LOW LATENCY
                  </span>
                </div>

                {/* Telemetry listing cards */}
                <div className="space-y-4 flex-1 overflow-y-auto scrollbar-hide pr-1 min-h-0">
                  {Object.keys(liveTelemetry).map((num) => {
                    const card = liveTelemetry[num];
                    if (!card.isActive) return null;
                    return (
                      <div
                        key={num}
                        className="p-4 bg-muted/25 border border-border/30 rounded-2xl relative overflow-hidden font-mono text-xs"
                      >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-[50px] pointer-events-none" />

                        <div className="flex items-center justify-between mb-3.5 pb-2 border-b border-border/10">
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="font-bold text-foreground font-sans"># {num}</span>
                            <span className="text-[9px] text-muted-foreground truncate uppercase tracking-widest max-w-[120px]">
                              {card.driverName}
                            </span>
                          </div>

                          <span className="text-[9px] font-bold text-blue-400">
                            GEAR {card.gear ?? "--"}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-[8px] text-muted-foreground uppercase tracking-widest block mb-0.5">
                              Velocity
                            </span>
                            <div className="text-lg font-black font-display text-foreground tracking-tighter italic">
                              {card.speed}{" "}
                              <span className="text-[10px] not-italic text-blue-400">MPH</span>
                            </div>
                          </div>
                          <div>
                            <span className="text-[8px] text-muted-foreground uppercase tracking-widest block mb-0.5">
                              Remaining fuel
                            </span>
                            <div className="text-lg font-black font-display text-foreground tracking-tighter italic">
                              {card.fuel}{" "}
                              <span className="text-[10px] not-italic text-blue-400">Liters</span>
                            </div>
                          </div>
                        </div>

                        {/* RPM Indicator bar */}
                        <div className="mt-3 bg-black/40 h-2 rounded-full overflow-hidden flex gap-[2px] p-[1.5px]">
                          {Array.from({ length: 12 }).map((_, idx) => {
                            const limit = (idx / 12) * 8500;
                            const active = (card.rpm ?? 6000) >= limit;
                            const isHigh = limit > 7600;
                            return (
                              <div
                                key={idx}
                                className={`flex-1 h-full rounded-sm transition-colors ${active
                                  ? isHigh
                                    ? "bg-red-500 shadow-[0_0_4px_red]"
                                    : "bg-emerald-500"
                                  : "bg-white/[0.03]"
                                  }`}
                              />
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}

                  {Object.keys(liveTelemetry).length === 0 && (
                    <div className="text-center py-10 text-xs text-muted-foreground italic opacity-50 border border-dashed border-border/40 rounded-2xl">
                      No live connections tracked. Click "Populate Full Stint Trial" above to run
                      simulated live paddock feeds!
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 text-[10px] text-muted-foreground leading-relaxed font-sans shrink-0 border-t border-border/20 pt-4">
                * Relays multiple driver rig bridges simultaneously matching active car numbers for
                race strategy calculations.
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Dynamic Popups / Forms */}
      <>
        {/* Add Car Popup */}
        {isAddCarOpen && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-panel border border-border/60 rounded-3xl p-6 relative shadow-2xl">
              <button
                onClick={() => setIsAddCarOpen(false)}
                className="absolute top-4 right-4 p-1 hover:bg-muted rounded-xl transition-all cursor-pointer"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
              <h3 className="text-sm font-mono uppercase tracking-widest text-foreground mb-4">
                Register Active Car
              </h3>
              <form onSubmit={handleAddCar} className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="car-name-input"
                    className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest pl-1"
                  >
                    Car Model/Name
                  </label>
                  <input
                    id="car-name-input"
                    type="text"
                    value={newCar.name}
                    onChange={(e) => setNewCar((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-background border border-border/60 rounded-xl px-3 py-2 text-xs font-mono"
                    placeholder="Mercedes AMG GT3"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="car-number-input"
                      className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest pl-1"
                    >
                      Car Number
                    </label>
                    <input
                      id="car-number-input"
                      type="text"
                      value={newCar.number}
                      onChange={(e) => setNewCar((prev) => ({ ...prev, number: e.target.value }))}
                      className="w-full bg-background border border-border/60 rounded-xl px-3 py-2 text-xs font-mono"
                      placeholder="44"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="car-class-input"
                      className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest pl-1"
                    >
                      Car Class
                    </label>
                    <select
                      id="car-class-input"
                      value={newCar.carClass}
                      onChange={(e) =>
                        setNewCar((prev) => ({
                          ...prev,
                          carClass: e.target.value as Car["carClass"],
                        }))
                      }
                      className="w-full bg-background border border-border/60 rounded-xl px-3 py-2 text-xs font-mono"
                    >
                      <option value="GT3">GT3</option>
                      <option value="GTP">GTP</option>
                      <option value="LMP2">LMP2</option>
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-primary text-primary-foreground hover:opacity-90 font-bold uppercase tracking-wider text-[10px] rounded-xl shadow cursor-pointer mt-2"
                >
                  Confirm Car Link
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Add Driver Popup */}
        {isAddDriverOpen && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-panel border border-border/60 rounded-3xl p-6 relative shadow-2xl">
              <button
                onClick={() => setIsAddDriverOpen(false)}
                className="absolute top-4 right-4 p-1 hover:bg-muted rounded-xl transition-all cursor-pointer"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
              <h3 className="text-sm font-mono uppercase tracking-widest text-foreground mb-4">
                Register Paddock Driver
              </h3>
              <form onSubmit={handleAddDriver} className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="driver-name-input"
                    className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest pl-1"
                  >
                    Full Driver Name
                  </label>
                  <input
                    id="driver-name-input"
                    type="text"
                    value={newDriver.name}
                    onChange={(e) => setNewDriver((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-background border border-border/60 rounded-xl px-3 py-2 text-xs font-mono"
                    placeholder="Charles Leclerc"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="driver-short-input"
                      className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest pl-1"
                    >
                      Short Code
                    </label>
                    <input
                      id="driver-short-input"
                      type="text"
                      value={newDriver.shortName}
                      onChange={(e) =>
                        setNewDriver((prev) => ({ ...prev, shortName: e.target.value }))
                      }
                      className="w-full bg-background border border-border/60 rounded-xl px-3 py-2 text-xs font-mono"
                      placeholder="LEC"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="driver-color-input"
                      className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest pl-1"
                    >
                      Aesthetic Color
                    </label>
                    <input
                      id="driver-color-input"
                      type="color"
                      value={newDriver.color}
                      onChange={(e) => setNewDriver((prev) => ({ ...prev, color: e.target.value }))}
                      className="w-full bg-background border border-border/60 rounded-xl h-8 text-xs cursor-pointer p-0"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-primary text-primary-foreground hover:opacity-90 font-bold uppercase tracking-wider text-[10px] rounded-xl shadow cursor-pointer mt-2"
                >
                  Confirm Driver Registry
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Add Weather Popup */}
        {isAddWeatherOpen && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-panel border border-border/60 rounded-3xl p-6 relative shadow-2xl">
              <button
                onClick={() => setIsAddWeatherOpen(false)}
                className="absolute top-4 right-4 p-1 hover:bg-muted rounded-xl transition-all cursor-pointer"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
              <h3 className="text-sm font-mono uppercase tracking-widest text-foreground mb-4">
                Forecast Meteorological Event
              </h3>
              <form onSubmit={handleAddWeather} className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="weather-type-input"
                    className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest pl-1"
                  >
                    Weather Climate Type
                  </label>
                  <select
                    id="weather-type-input"
                    value={newWeather.type}
                    onChange={(e) =>
                      setNewWeather((prev) => ({ ...prev, type: e.target.value as WeatherType }))
                    }
                    className="w-full bg-background border border-border/60 rounded-xl px-3 py-2 text-xs font-mono"
                  >
                    <option value="Sunny">Sunny</option>
                    <option value="Partly Cloudy">Partly Cloudy</option>
                    <option value="Overcast">Overcast</option>
                    <option value="Light Rain">Light Rain</option>
                    <option value="Heavy Rain">Heavy Rain</option>
                    <option value="Thunderstorm">Thunderstorm</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="weather-start-input"
                      className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest pl-1"
                    >
                      Start Hour Offset (min)
                    </label>
                    <input
                      id="weather-start-input"
                      type="number"
                      value={newWeather.startOffset}
                      onChange={(e) =>
                        setNewWeather((prev) => ({
                          ...prev,
                          startOffset: parseInt(e.target.value) || 0,
                        }))
                      }
                      className="w-full bg-background border border-border/60 rounded-xl px-3 py-2 text-xs font-mono"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="weather-duration-input"
                      className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest pl-1"
                    >
                      Duration (min)
                    </label>
                    <input
                      id="weather-duration-input"
                      type="number"
                      value={newWeather.duration}
                      onChange={(e) =>
                        setNewWeather((prev) => ({
                          ...prev,
                          duration: parseInt(e.target.value) || 0,
                        }))
                      }
                      className="w-full bg-background border border-border/60 rounded-xl px-3 py-2 text-xs font-mono"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-primary text-primary-foreground hover:opacity-90 font-bold uppercase tracking-wider text-[10px] rounded-xl shadow cursor-pointer mt-2"
                >
                  Confirm Weather Event
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Add Stint Popup */}
        {isAddStintOpen && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-panel border border-border/60 rounded-3xl p-6 relative shadow-2xl">
              <button
                onClick={() => setIsAddStintOpen(false)}
                className="absolute top-4 right-4 p-1 hover:bg-muted rounded-xl transition-all cursor-pointer"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
              <h3 className="text-sm font-mono uppercase tracking-widest text-foreground mb-4">
                Schedule Driver Stint
              </h3>
              <form onSubmit={handleAddStint} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="stint-car-input"
                      className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest pl-1"
                    >
                      Assign to Car
                    </label>
                    <select
                      id="stint-car-input"
                      value={newStint.carId}
                      onChange={(e) => setNewStint((prev) => ({ ...prev, carId: e.target.value }))}
                      className="w-full bg-background border border-border/60 rounded-xl px-3 py-2 text-xs font-mono"
                    >
                      <option value="">-- Choose Car --</option>
                      {cars.map((c) => (
                        <option key={c.id} value={c.id}>
                          #{c.number} {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="stint-driver-input"
                      className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest pl-1"
                    >
                      Select Driver
                    </label>
                    <select
                      id="stint-driver-input"
                      value={newStint.driverId}
                      onChange={(e) =>
                        setNewStint((prev) => ({ ...prev, driverId: e.target.value }))
                      }
                      className="w-full bg-background border border-border/60 rounded-xl px-3 py-2 text-xs font-mono"
                    >
                      <option value="">-- Choose Driver --</option>
                      {drivers.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.shortName})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="stint-start-input"
                      className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest pl-1"
                    >
                      Start Offset (min)
                    </label>
                    <input
                      id="stint-start-input"
                      type="number"
                      value={newStint.startOffset}
                      onChange={(e) =>
                        setNewStint((prev) => ({
                          ...prev,
                          startOffset: parseInt(e.target.value) || 0,
                        }))
                      }
                      className="w-full bg-background border border-border/60 rounded-xl px-3 py-2 text-xs font-mono"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="stint-duration-input"
                      className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest pl-1"
                    >
                      Stint Duration (min)
                    </label>
                    <input
                      id="stint-duration-input"
                      type="number"
                      value={newStint.duration}
                      onChange={(e) =>
                        setNewStint((prev) => ({
                          ...prev,
                          duration: parseInt(e.target.value) || 0,
                        }))
                      }
                      className="w-full bg-background border border-border/60 rounded-xl px-3 py-2 text-xs font-mono"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="stint-note-input"
                    className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest pl-1"
                  >
                    Strategic Notes
                  </label>
                  <input
                    id="stint-note-input"
                    type="text"
                    value={newStint.note}
                    onChange={(e) => setNewStint((prev) => ({ ...prev, note: e.target.value }))}
                    className="w-full bg-background border border-border/60 rounded-xl px-3 py-2 text-xs font-mono"
                    placeholder="Soft compound, save fuel"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-primary text-primary-foreground hover:opacity-90 font-bold uppercase tracking-wider text-[10px] rounded-xl shadow cursor-pointer mt-2"
                >
                  Confirm Stint Schedule
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Add Incident Popup */}
        {isAddIncidentOpen && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-panel border border-border/60 rounded-3xl p-6 relative shadow-2xl">
              <button
                onClick={() => setIsAddIncidentOpen(false)}
                className="absolute top-4 right-4 p-1 hover:bg-muted rounded-xl transition-all cursor-pointer"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
              <h3 className="text-sm font-mono uppercase tracking-widest text-foreground mb-4">
                Inject Track Incident
              </h3>
              <form onSubmit={handleAddIncident} className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="incident-type-input"
                    className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest pl-1"
                  >
                    Incident Warning Level
                  </label>
                  <select
                    id="incident-type-input"
                    value={newIncident.type}
                    onChange={(e) =>
                      setNewIncident((prev) => ({
                        ...prev,
                        type: e.target.value as RaceIncident["type"],
                      }))
                    }
                    className="w-full bg-background border border-border/60 rounded-xl px-3 py-2 text-xs font-mono"
                  >
                    <option value="Caution">Caution (Local Yellow)</option>
                    <option value="Safety Car">Safety Car (Full Caution)</option>
                    <option value="Red Flag">Red Flag (Race Halted)</option>
                    <option value="Green Flag">Green Flag (Cleared)</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="incident-start-input"
                      className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest pl-1"
                    >
                      Start Offset (min)
                    </label>
                    <input
                      id="incident-start-input"
                      type="number"
                      value={newIncident.startOffset}
                      onChange={(e) =>
                        setNewIncident((prev) => ({
                          ...prev,
                          startOffset: parseInt(e.target.value) || 0,
                        }))
                      }
                      className="w-full bg-background border border-border/60 rounded-xl px-3 py-2 text-xs font-mono"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="incident-duration-input"
                      className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest pl-1"
                    >
                      Duration (min)
                    </label>
                    <input
                      id="incident-duration-input"
                      type="number"
                      value={newIncident.duration}
                      onChange={(e) =>
                        setNewIncident((prev) => ({
                          ...prev,
                          duration: parseInt(e.target.value) || 0,
                        }))
                      }
                      className="w-full bg-background border border-border/60 rounded-xl px-3 py-2 text-xs font-mono"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-primary text-primary-foreground hover:opacity-90 font-bold uppercase tracking-wider text-[10px] rounded-xl shadow cursor-pointer mt-2"
                >
                  Confirm Incident Warning
                </button>
              </form>
            </div>
          </div>
        )}
      </>
    </div>
  );
}
