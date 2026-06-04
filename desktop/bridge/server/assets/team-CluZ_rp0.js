import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { Settings, Car, Trash2, X } from "lucide-react";
import { C as supabase, K as useTelemetry } from "./router-D8VllJ-f.js";
import { differenceInMinutes, parseISO, addMinutes } from "date-fns";
import "@tanstack/react-query";
import "./charts-IpNGhCyp.js";
import "@supabase/supabase-js";
import "../server.js";
import "seroval";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "@tanstack/react-router/ssr/server";
import "sonner";
import "zustand";
import "zustand/middleware";
import "zod";
import "./auth-middleware-Cz-8T2yV.js";
import "./schema-BU1MXGgz.js";
import "@radix-ui/react-dialog";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-tabs";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "./client.server-Y-0AANJ4.js";
const STALE_THRESHOLD_MS = 3e4;
function useTeamTelemetry(teamCode) {
  const [drivers, setDrivers] = useState(/* @__PURE__ */ new Map());
  const [connected, setConnected] = useState(false);
  const channelRef = useRef(null);
  const stalenessRef = useRef(null);
  const updateStaleness = useCallback(() => {
    setDrivers((prev) => {
      const now = Date.now();
      const next = new Map(prev);
      for (const [key, snap] of next) {
        const staleness = now - snap.timestamp;
        next.set(key, { ...snap, staleness, isOnline: staleness < STALE_THRESHOLD_MS });
      }
      return next;
    });
  }, []);
  useEffect(() => {
    if (!teamCode) {
      setDrivers(/* @__PURE__ */ new Map());
      setConnected(false);
      return;
    }
    const channelName = `team:${teamCode}`;
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }
    const ch = supabase.channel(channelName, {
      config: { broadcast: { ack: false } },
    });
    ch.on("broadcast", { event: "telemetry" }, ({ payload }) => {
      if (!payload?.carNumber) return;
      const opState = payload.carOperationalState;
      const activeDriver = opState?.activeDriver || "Unknown Driver";
      const brakesWear = opState?.fatigueSummary?.brakes ?? 100;
      const mappedTeammate = {
        carNumber: payload.carNumber,
        carName: payload.carName || "Unknown Car",
        driverName: activeDriver,
        carOperationalState: opState,
        // Populated advisory legacy fields from OperationalDigest where possible
        lastLapSec: 0,
        lastLap: "--:--.---",
        bestLap: "--:--.---",
        deltaSec: 0,
        fuelRemainingL: 0,
        fuelBurnPerLap: 0,
        lapsEstimated: opState?.projectedPitLap ? Math.max(0, opState.projectedPitLap) : 0,
        speedKph: 0,
        gear: 0,
        rpm: 0,
        trackTempC: 0,
        trackWetness: 0,
        tires: opState?.fatigueSummary
          ? {
              fl: {
                tempC: 80,
                pressureBar: 2,
                wearPct: brakesWear,
                estWearPct: brakesWear,
                brakeTempC: 300,
                state: "ok",
              },
              fr: {
                tempC: 80,
                pressureBar: 2,
                wearPct: brakesWear,
                estWearPct: brakesWear,
                brakeTempC: 300,
                state: "ok",
              },
              rl: {
                tempC: 80,
                pressureBar: 2,
                wearPct: brakesWear,
                estWearPct: brakesWear,
                brakeTempC: 300,
                state: "ok",
              },
              rr: {
                tempC: 80,
                pressureBar: 2,
                wearPct: brakesWear,
                estWearPct: brakesWear,
                brakeTempC: 300,
                state: "ok",
              },
            }
          : null,
        enduranceState: opState?.fatigueSummary
          ? {
              chassisFatigue: opState.fatigueSummary.chassis,
              brakeWear: opState.fatigueSummary.brakes,
              gearboxStress: opState.fatigueSummary.gearbox,
              ersHealth: opState.fatigueSummary.ersHealth,
            }
          : null,
        adaptationState: opState?.adaptationWindow
          ? {
              event: opState.adaptationWindow.active
                ? "DRIVER_ADAPTATION_ACTIVE"
                : "DRIVER_ADAPTATION_INACTIVE",
              incomingDriver: activeDriver,
              currentLapInWindow: opState.adaptationWindow.currentLapInWindow,
              brakeBiteMismatchPct: 0,
              steeringJitterMismatchPct: 0,
              tireThermalGradientDelta: 0,
            }
          : null,
        timestamp: payload.timestamp || Date.now(),
        publishCount: payload.publishCount || 1,
        isOnline: true,
        staleness: 0,
      };
      setDrivers((prev) => {
        const existing = prev.get(payload.carNumber);
        if (existing) {
          const existingSeq = existing.carOperationalState?.sequenceId ?? 0;
          const incomingSeq = mappedTeammate.carOperationalState?.sequenceId ?? 0;
          const existingTs = existing.timestamp ?? 0;
          const incomingTs = mappedTeammate.timestamp ?? 0;
          if (
            incomingSeq < existingSeq ||
            (incomingSeq === existingSeq && incomingTs <= existingTs)
          ) {
            console.warn(
              `[telemetry-sync] Discarded out-of-order/stale packet: Car ${payload.carNumber} | Inbound Seq: ${incomingSeq} (Existing: ${existingSeq}) | Inbound Ts: ${incomingTs} (Existing: ${existingTs})`,
            );
            return prev;
          }
        }
        const next = new Map(prev);
        next.set(payload.carNumber, mappedTeammate);
        return next;
      });
    });
    ch.subscribe((status) => {
      setConnected(status === "SUBSCRIBED");
    });
    channelRef.current = ch;
    stalenessRef.current = setInterval(updateStaleness, 5e3);
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      if (stalenessRef.current) {
        clearInterval(stalenessRef.current);
        stalenessRef.current = null;
      }
      setConnected(false);
    };
  }, [teamCode, updateStaleness]);
  const driverList = Array.from(drivers.values());
  return {
    drivers,
    connected,
    teamCode,
    driverCount: drivers.size,
    onlineCount: driverList.filter((d) => d.isOnline).length,
  };
}
function formatDuration(minutes) {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}
function Sparkline({ data, color }) {
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
  return /* @__PURE__ */ jsx("svg", {
    width,
    height,
    className: "overflow-visible",
    children: /* @__PURE__ */ jsx("polyline", {
      fill: "none",
      stroke: color,
      strokeWidth: "1.1",
      points,
    }),
  });
}
function TeamPage() {
  const t = useTelemetry();
  const [aiResponse, setAiResponse] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [graphTab, setGraphTab] = useState("fuel");
  const [selectedRosterDriverId, setSelectedRosterDriverId] = useState(null);
  const [hoveredStintIndex, setHoveredStintIndex] = useState(null);
  const [focusMode, setFocusMode] = useState("green");
  const [zoomLevel, setZoomLevel] = useState("6h");
  const [raceDurationHours, setRaceDurationHours] = useState(() => {
    const saved =
      typeof window !== "undefined" ? localStorage.getItem("team_race_duration_h") : null;
    return saved ? Number(saved) : 6;
  });
  useEffect(() => {
    localStorage.setItem("team_race_duration_h", String(raceDurationHours));
  }, [raceDurationHours]);
  const [timelineZoom, setTimelineZoom] = useState(1);
  const [timelinePanOffset, setTimelinePanOffset] = useState(0);
  const totalMin = raceDurationHours * 60;
  const visibleDuration = totalMin / timelineZoom;
  const startTimeOffsetMin = Math.max(0, Math.min(totalMin - visibleDuration, timelinePanOffset));
  const endTimeOffsetMin = startTimeOffsetMin + visibleDuration;
  const mapX = (originalX) => {
    const t2 = (originalX / 600) * totalMin;
    return ((t2 - startTimeOffsetMin) / visibleDuration) * 600;
  };
  const mapPath = (dStr) => {
    return dStr.replace(
      /([MQLC])\s*([-\d.]+),([-\d.]+)(?:\s+([-\d.]+),([-\d.]+))?(?:\s+([-\d.]+),([-\d.]+))?/g,
      (match, cmd, x1, y1, x2, y2, x3, y3) => {
        const rx1 = mapX(parseFloat(x1));
        if (x2 !== void 0 && y2 !== void 0) {
          const rx2 = mapX(parseFloat(x2));
          if (x3 !== void 0 && y3 !== void 0) {
            const rx3 = mapX(parseFloat(x3));
            return `${cmd} ${rx1},${y1} ${rx2},${y2} ${rx3},${y3}`;
          }
          return `${cmd} ${rx1},${y1} ${rx2},${y2}`;
        }
        return `${cmd} ${rx1},${y1}`;
      },
    );
  };
  const getSlotStyle = (stintIdx) => {
    const slotDur = totalMin / 4;
    const slotStartMin = stintIdx * slotDur;
    const slotEndMin = (stintIdx + 1) * slotDur;
    const isVisible = slotEndMin > startTimeOffsetMin && slotStartMin < endTimeOffsetMin;
    if (!isVisible)
      return {
        display: "none",
      };
    const leftPct = Math.max(0, ((slotStartMin - startTimeOffsetMin) / visibleDuration) * 100);
    const rightPct = Math.max(0, ((endTimeOffsetMin - slotEndMin) / visibleDuration) * 100);
    const widthPct = 100 - leftPct - rightPct;
    return {
      position: "absolute",
      left: `calc(${leftPct}% + 1px)`,
      width: `calc(${widthPct}% - 2px)`,
      height: "100%",
    };
  };
  const applyZoomPreset = (preset) => {
    setZoomLevel(preset);
    setTimelinePanOffset(0);
    if (preset === "24h") {
      setTimelineZoom(1);
    } else if (preset === "6h") {
      setTimelineZoom(Math.max(1, raceDurationHours / 6));
    } else if (preset === "1h") {
      setTimelineZoom(Math.max(1, raceDurationHours / 1));
    } else if (preset === "15m") {
      setTimelineZoom(Math.max(1, raceDurationHours / 0.25));
    }
  };
  const dragTimelineRef = useRef(null);
  const onTimelineWheel = (e) => {
    if (!(e.buttons & 1)) return;
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const isGraph = e.currentTarget.classList.contains("timeline-graph-container");
    const offsetLeft = isGraph ? 0 : 110;
    const mouseX = e.clientX - rect.left - offsetLeft;
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
  const onTimelineMouseDown = (e) => {
    if (e.buttons === 3) {
      e.preventDefault();
      dragTimelineRef.current = {
        startX: e.clientX,
        startPanOffset: timelinePanOffset,
      };
    }
  };
  const onTimelineMouseMove = (e) => {
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
  const onContextMenu = (e) => {
    e.preventDefault();
  };
  const [tyreSoftAllowed, setTyreSoftAllowed] = useState(true);
  const [tyreMediumAllowed, setTyreMediumAllowed] = useState(true);
  const [tyreHardAllowed, setTyreHardAllowed] = useState(true);
  const [tyreWetAllowed, setTyreWetAllowed] = useState(true);
  const [showManagerSettings, setShowManagerSettings] = useState(false);
  const handleAnomalyClick = (type, stintIdx) => {
    setHoveredStintIndex(stintIdx);
    setTimeout(() => {
      setHoveredStintIndex((current) => (current === stintIdx ? null : current));
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
  const [teamCode, setTeamCode] = useState(() =>
    typeof window !== "undefined" ? (localStorage.getItem("team_code") ?? "") : "",
  );
  const [teamCodeInput, setTeamCodeInput] = useState("");
  const [showTeamCodePanel, setShowTeamCodePanel] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem("team_code", teamCode);
  }, [teamCode]);
  const { drivers: teamDrivers, connected: teamConnected } = useTeamTelemetry(teamCode || null);
  const generateTeamCode = () => {
    const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
    const code = `PITWALL-${suffix}`;
    setTeamCode(code);
    setTeamCodeInput(code);
  };
  const [drivers, setDrivers] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("team_drivers");
      if (saved) return JSON.parse(saved);
    }
    return [
      {
        id: "d1",
        name: "M. Campbell",
        shortName: "CAM",
        color: "#00D17F",
        status: "Available",
      },
      {
        id: "d2",
        name: "K. Estre",
        shortName: "EST",
        color: "#3B82F6",
        status: "In Garage",
      },
      {
        id: "d3",
        name: "L. Vanthoor",
        shortName: "VAN",
        color: "#FF4D4D",
        status: "Driving",
      },
      {
        id: "d4",
        name: "F. Nasr",
        shortName: "NAS",
        color: "#FFB800",
        status: "Standby",
      },
    ];
  });
  const [cars, setCars] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("team_cars");
      if (saved) return JSON.parse(saved);
    }
    return [
      {
        id: "c1",
        name: "Porsche 963",
        number: "7",
        carClass: "GTP",
      },
      {
        id: "c2",
        name: "BMW M Hybrid V8",
        number: "12",
        carClass: "GTP",
      },
      {
        id: "c3",
        name: "Acura ARX-06",
        number: "93",
        carClass: "GTP",
      },
    ];
  });
  const [stints, setStints] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("team_stints");
      if (saved) return JSON.parse(saved);
    }
    return [
      {
        id: "stint_c1_0",
        carId: "c1",
        driverId: "d3",
        startTime: "2026-05-28T15:00:00.000Z",
        endTime: "2026-05-28T16:12:45.000Z",
        note: "LAPS 1-45",
      },
      {
        id: "stint_c1_1",
        carId: "c1",
        driverId: "d1",
        startTime: "2026-05-28T16:15:20.000Z",
        endTime: "2026-05-28T17:18:00.000Z",
        note: "LAPS 46-90",
      },
      {
        id: "stint_c1_2",
        carId: "c1",
        driverId: "d2",
        startTime: "2026-05-28T17:23:00.000Z",
        endTime: "2026-05-28T18:26:00.000Z",
        note: "LAPS 92-135",
      },
      {
        id: "stint_c1_3",
        carId: "c1",
        driverId: "d3",
        startTime: "2026-05-28T18:28:00.000Z",
        endTime: "2026-05-28T21:00:00.000Z",
        note: "LAPS 137-215",
      },
    ];
  });
  const [weatherEvents, setWeatherEvents] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("team_weather");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [incidents, setIncidents] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("team_incidents");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [raceStartTime, setRaceStartTime] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("team_race_start_time");
      return saved ? saved : "2026-05-28T15:00:00.000Z";
    }
    return "2026-05-28T15:00:00.000Z";
  });
  const [selectedCarId, setSelectedCarId] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("team_selected_car_id");
      return saved ? saved : "c1";
    }
    return "c1";
  });
  const [realTime, setRealTime] = useState(/* @__PURE__ */ new Date());
  const [calcFuelBurn, setCalcFuelBurn] = useState(2.85);
  const [calcStintLaps, setCalcStintLaps] = useState(45);
  const [calcAvgLapTimeSec, setCalcAvgLapTimeSec] = useState(95);
  useEffect(() => {
    localStorage.setItem("team_drivers", JSON.stringify(drivers));
  }, [drivers]);
  useEffect(() => {
    localStorage.setItem("team_cars", JSON.stringify(cars));
    if (cars.length > 0) {
      if (!selectedCarId || !cars.some((c) => c.id === selectedCarId)) {
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
  const [isAddCarOpen, setIsAddCarOpen] = useState(false);
  const [isAddDriverOpen, setIsAddDriverOpen] = useState(false);
  const [isAddWeatherOpen, setIsAddWeatherOpen] = useState(false);
  const [isAddStintOpen, setIsAddStintOpen] = useState(false);
  const [isAddIncidentOpen, setIsAddIncidentOpen] = useState(false);
  const [newCar, setNewCar] = useState({
    name: "",
    number: "",
    carClass: "GT3",
  });
  const [newDriver, setNewDriver] = useState({
    name: "",
    shortName: "",
    color: "#3B82F6",
    status: "Available",
  });
  const [newWeather, setNewWeather] = useState({
    type: "Sunny",
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
    type: "Caution",
    startOffset: 0,
    duration: 15,
  });
  const [stopwatch, setStopwatch] = useState({
    isRunning: false,
    elapsed: 0,
    lastStart: null,
  });
  useEffect(() => {
    const t2 = setInterval(() => {
      setRealTime(/* @__PURE__ */ new Date());
    }, 1e3);
    return () => clearInterval(t2);
  }, []);
  useEffect(() => {
    if (!stopwatch.isRunning) return;
    const t2 = setInterval(() => {
      setStopwatch((prev) => {
        const now = Date.now();
        const start = prev.lastStart ?? now;
        return {
          ...prev,
          elapsed: prev.elapsed + (now - start) / 1e3,
          lastStart: now,
        };
      });
    }, 100);
    return () => clearInterval(t2);
  }, [stopwatch.isRunning]);
  const selectedCar = cars.find((c) => c.id === selectedCarId) || cars[0];
  const activeTeamTelemetry = useMemo(() => {
    if (!selectedCar) return null;
    return teamDrivers.get(selectedCar.number) || null;
  }, [teamDrivers, selectedCar]);
  const activeSnapshotRef = useRef(null);
  useEffect(() => {
    activeSnapshotRef.current = activeTeamTelemetry;
  }, [activeTeamTelemetry]);
  useEffect(() => {
    if (!teamCode || teamDrivers.size === 0) return;
    let carsUpdated = false;
    let driversUpdated = false;
    const nextCars = [...cars];
    const nextDrivers = [...drivers];
    for (const [carNum, snap] of teamDrivers.entries()) {
      const existingCar = nextCars.find((c) => c.number === carNum);
      if (!existingCar && snap.carName) {
        nextCars.push({
          id: `c_discovered_${carNum}`,
          name: snap.carName,
          number: carNum,
          carClass: snap.carName.toUpperCase().includes("GT3")
            ? "GT3"
            : snap.carName.toUpperCase().includes("LMP2")
              ? "LMP2"
              : "GTP",
        });
        carsUpdated = true;
      }
      if (snap.driverName && snap.driverName !== "Unknown Driver") {
        const existingDriver = nextDrivers.find(
          (d) => d.name.toLowerCase() === snap.driverName.toLowerCase(),
        );
        if (!existingDriver) {
          const lastName = snap.driverName.split(" ").slice(-1)[0] || "DRV";
          const shortSig = lastName.slice(0, 3).toUpperCase();
          nextDrivers.push({
            id: `d_discovered_${snap.carNumber}_${Date.now()}`,
            name: snap.driverName,
            shortName: shortSig,
            color:
              "#" +
              Math.floor(Math.random() * 16777215)
                .toString(16)
                .padStart(6, "0"),
            status: snap.isOnline ? "Driving" : "Available",
          });
          driversUpdated = true;
        } else {
          const nextStatus = snap.isOnline ? "Driving" : "Available";
          if (existingDriver.status !== nextStatus) {
            existingDriver.status = nextStatus;
            driversUpdated = true;
          }
        }
      }
    }
    if (carsUpdated) setCars(nextCars);
    if (driversUpdated) setDrivers(nextDrivers);
  }, [teamDrivers, teamCode, cars, drivers]);
  const calculatedFuelRequired = useMemo(() => {
    return Number((calcFuelBurn * calcStintLaps).toFixed(2));
  }, [calcFuelBurn, calcStintLaps]);
  useMemo(() => {
    return Number((calcFuelBurn * 1.5).toFixed(2));
  }, [calcFuelBurn]);
  useMemo(() => {
    const baseWear =
      selectedCar?.carClass === "GTP" ? 1.65 : selectedCar?.carClass === "LMP2" ? 1.45 : 1.25;
    return Number(baseWear.toFixed(2));
  }, [selectedCar]);
  const calculatedStintDurationMin = useMemo(() => {
    return calcStintLaps * (calcAvgLapTimeSec / 60);
  }, [calcStintLaps, calcAvgLapTimeSec]);
  const raceElapsedMs = useMemo(() => {
    return differenceInMinutes(realTime, parseISO(raceStartTime)) * 60 * 1e3;
  }, [realTime, raceStartTime]);
  const raceDurationMs = raceDurationHours * 60 * 60 * 1e3;
  useMemo(() => {
    return Math.max(0, raceDurationMs - Math.max(0, raceElapsedMs));
  }, [raceDurationMs, raceElapsedMs]);
  useMemo(() => {
    if (raceDurationMs <= 0) return 0;
    return Math.min(100, (Math.max(0, raceElapsedMs) / raceDurationMs) * 100);
  }, [raceElapsedMs, raceDurationMs]);
  useMemo(() => {
    const startHour = parseISO(raceStartTime).getHours();
    const elapsedH = Math.max(0, raceElapsedMs) / 36e5;
    const currentHour = (startHour + elapsedH) % 24;
    if (currentHour >= 6 && currentHour < 9)
      return {
        label: "DAWN",
        color: "text-orange-300",
        bg: "bg-orange-500/10",
        border: "border-orange-500/20",
        icon: "🌅",
      };
    if (currentHour >= 9 && currentHour < 18)
      return {
        label: "DAY",
        color: "text-yellow-300",
        bg: "bg-yellow-500/10",
        border: "border-yellow-500/20",
        icon: "☀️",
      };
    if (currentHour >= 18 && currentHour < 21)
      return {
        label: "DUSK",
        color: "text-amber-400",
        bg: "bg-amber-500/10",
        border: "border-amber-500/20",
        icon: "🌇",
      };
    return {
      label: "NIGHT",
      color: "text-blue-300",
      bg: "bg-blue-900/20",
      border: "border-blue-500/20",
      icon: "🌙",
    };
  }, [raceStartTime, raceElapsedMs]);
  useMemo(() => {
    const map = {};
    for (const stint of stints) {
      const start = parseISO(stint.startTime);
      const end = parseISO(stint.endTime);
      const hours = differenceInMinutes(end, start) / 60;
      map[stint.driverId] = (map[stint.driverId] || 0) + hours;
    }
    return map;
  }, [stints]);
  const enduranceFuelPlan = useMemo(() => {
    if (calcFuelBurn <= 0 || calcStintLaps <= 0) return null;
    const totalRaceSec = raceDurationHours * 3600;
    const totalLapsEst = Math.round(totalRaceSec / calcAvgLapTimeSec);
    const fuelPerStint = calcFuelBurn * calcStintLaps;
    const pitStops = Math.ceil(totalLapsEst / calcStintLaps) - 1;
    const totalFuel = calcFuelBurn * totalLapsEst;
    return {
      totalLapsEst,
      pitStops,
      fuelPerStint,
      totalFuel,
    };
  }, [raceDurationHours, calcFuelBurn, calcStintLaps, calcAvgLapTimeSec]);
  const timelineStartTime = parseISO(raceStartTime);
  const handleDeleteCar = (carId) => {
    setCars((prev) => prev.filter((c) => c.id !== carId));
    setStints((prev) => prev.filter((s) => s.carId !== carId));
    if (selectedCarId === carId) {
      const remaining = cars.filter((c) => c.id !== carId);
      setSelectedCarId(remaining.length > 0 ? remaining[0].id : null);
    }
  };
  const handleDeleteDriver = (driverId) => {
    setDrivers((prev) => prev.filter((d) => d.id !== driverId));
    setStints((prev) => prev.filter((s) => s.driverId !== driverId));
  };
  const handleAddCar = (e) => {
    e.preventDefault();
    if (!newCar.name || !newCar.number) return;
    const car = {
      id: `c_${Date.now()}`,
      name: newCar.name,
      number: newCar.number,
      carClass: newCar.carClass,
    };
    setCars((prev) => [...prev, car]);
    setNewCar({
      name: "",
      number: "",
      carClass: "GT3",
    });
    setIsAddCarOpen(false);
    if (!selectedCarId) setSelectedCarId(car.id);
  };
  const handleAddDriver = (e) => {
    e.preventDefault();
    if (!newDriver.name || !newDriver.shortName) return;
    const driver = {
      id: `d_${Date.now()}`,
      name: newDriver.name,
      shortName: newDriver.shortName.toUpperCase(),
      color: newDriver.color,
      status: newDriver.status,
    };
    setDrivers((prev) => [...prev, driver]);
    setNewDriver({
      name: "",
      shortName: "",
      color: "#3B82F6",
      status: "Available",
    });
    setIsAddDriverOpen(false);
  };
  const handleStintDriverDrop = (stintSlotIndex, driverId) => {
    if (!selectedCarId) return;
    const targetStintId = `stint_${selectedCarId}_${stintSlotIndex}`;
    const existingIndex = stints.findIndex(
      (s) => s.carId === selectedCarId && s.id === targetStintId,
    );
    const updatedStints = [...stints];
    if (existingIndex !== -1) {
      updatedStints[existingIndex] = {
        ...updatedStints[existingIndex],
        driverId,
      };
    } else {
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
    setDrivers((prev) =>
      prev.map((d) =>
        d.id === driverId
          ? {
              ...d,
              status: "Driving",
            }
          : d.id !== driverId && d.status === "Driving"
            ? {
                ...d,
                status: "Available",
              }
            : d,
      ),
    );
  };
  const activeStints = useMemo(() => {
    if (!selectedCarId) return [];
    const result = [];
    for (let idx = 0; idx < 4; idx++) {
      const stintId = `stint_${selectedCarId}_${idx}`;
      const existing = stints.find((s) => s.carId === selectedCarId && s.id === stintId);
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
  const [sparkData, setSparkData] = useState({
    speed: Array.from(
      {
        length: 25,
      },
      () => 120,
    ),
    throttle: Array.from(
      {
        length: 25,
      },
      () => 40,
    ),
    brake: Array.from(
      {
        length: 25,
      },
      () => 0,
    ),
    rpm: Array.from(
      {
        length: 25,
      },
      () => 5e3,
    ),
    fuel: Array.from(
      {
        length: 25,
      },
      () => 54,
    ),
  });
  useEffect(() => {
    const interval = setInterval(() => {
      setSparkData((prev) => {
        const appendVal = (arr, val) => [...arr.slice(1), val];
        const snap = activeSnapshotRef.current;
        const nextSpeed =
          snap && snap.speedKph > 0
            ? snap.speedKph
            : t.connected
              ? t.speedKph
              : Math.round(180 + Math.random() * 80);
        const nextThrottle = t.connected ? t.throttle : Math.round(40 + Math.random() * 60);
        const nextBrake = t.connected ? t.brake : Math.round(Math.random() * 10);
        const nextRpm =
          snap && snap.rpm > 0
            ? snap.rpm
            : t.connected
              ? t.rpm
              : Math.round(5500 + Math.random() * 2e3);
        const nextFuel =
          snap && snap.fuelRemainingL > 0
            ? snap.fuelRemainingL
            : t.connected
              ? t.fuelRemainingL
              : Math.round(52.8 + Math.random() * 1.5);
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
  const cycleDriverStatus = (driverId) => {
    setDrivers((prev) =>
      prev.map((d) => {
        if (d.id !== driverId) return d;
        const nextStatus =
          d.status === "Available"
            ? "In Garage"
            : d.status === "In Garage"
              ? "Driving"
              : d.status === "Driving"
                ? "Standby"
                : "Available";
        return {
          ...d,
          status: nextStatus,
        };
      }),
    );
  };
  return /* @__PURE__ */ jsxs("div", {
    className:
      "w-full max-w-[100vw] min-h-screen bg-[#05070a] text-[#E2E4E8] flex flex-col font-mono relative select-none overflow-x-hidden p-0 rounded-none border-0",
    children: [
      /* @__PURE__ */ jsx("div", {
        className:
          "absolute inset-0 bg-[linear-gradient(to_right,#1C2430_1px,transparent_1px),linear-gradient(to_bottom,#1C2430_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-[0.03] pointer-events-none",
      }),
      /* @__PURE__ */ jsxs("header", {
        className:
          "h-10 border-b border-[#1c2430] bg-[#0b0f14] px-3 flex items-center justify-between relative z-10 shrink-0 select-none",
        children: [
          /* @__PURE__ */ jsxs("div", {
            className: "flex items-center gap-2.5",
            children: [
              /* @__PURE__ */ jsx(Link, {
                to: "/",
                className:
                  "text-[8.5px] font-black text-[#7a828c] hover:text-white uppercase tracking-widest border border-[#1c2430] bg-[#11161d] px-2 py-0.5 rounded-none flex items-center gap-1 transition-all cursor-pointer hover:bg-zinc-800",
                children: "← MENU",
              }),
              /* @__PURE__ */ jsx("span", { className: "h-3.5 w-px bg-[#1c2430]" }),
              /* @__PURE__ */ jsx("span", {
                className:
                  "text-white font-black italic tracking-widest text-[11px] bg-gradient-to-r from-red-600 to-red-800 px-1.5 py-0.5 border border-red-500/20 rounded-none font-orbitron",
                children: "PITWALL",
              }),
              /* @__PURE__ */ jsx("span", {
                className:
                  "text-[10px] uppercase tracking-[0.3em] text-[#7a828c] font-bold font-rajdhani hidden sm:inline",
                children: "TEAM COMMAND CENTRE",
              }),
              /* @__PURE__ */ jsx("span", {
                className: "h-3.5 w-px bg-[#1c2430] hidden sm:inline",
              }),
              /* @__PURE__ */ jsx(Link, {
                to: "/team-guide",
                className:
                  "text-[8px] font-black text-[#3B82F6] hover:underline uppercase tracking-widest hidden sm:inline",
                children: "📖 SETUP GUIDE",
              }),
            ],
          }),
          /* @__PURE__ */ jsxs("div", {
            className: "flex items-center gap-6 text-[8.5px] font-rajdhani",
            children: [
              /* @__PURE__ */ jsxs("div", {
                className: "flex items-center gap-1.5",
                children: [
                  /* @__PURE__ */ jsx("span", {
                    className:
                      "size-1.5 rounded-full bg-[#00D17F] shadow-[0_0_6px_#00D17F] animate-pulse",
                  }),
                  /* @__PURE__ */ jsx("span", {
                    className: "font-bold text-[#00D17F] uppercase tracking-widest text-[9.5px]",
                    children: "LIVE",
                  }),
                  /* @__PURE__ */ jsx("span", {
                    className:
                      "text-[#7a828c] uppercase font-bold hidden md:inline tracking-widest text-[9px]",
                    children: "CIRCUIT DE SPA-FRANCORCHAMPS",
                  }),
                ],
              }),
              /* @__PURE__ */ jsx("div", { className: "h-3 w-px bg-[#1c2430]" }),
              /* @__PURE__ */ jsxs("div", {
                className: "hidden lg:flex items-center gap-1.5 tracking-widest text-[9px]",
                children: [
                  /* @__PURE__ */ jsx("span", {
                    className: "text-[#7a828c] uppercase",
                    children: "RACE TIMING:",
                  }),
                  /* @__PURE__ */ jsx("span", {
                    className: "font-black text-white font-mono",
                    children: "06:00:00 - WEC",
                  }),
                ],
              }),
            ],
          }),
          /* @__PURE__ */ jsxs("div", {
            className: "flex items-center gap-3 text-[9px] font-rajdhani",
            children: [
              teamCode &&
                /* @__PURE__ */ jsx("span", {
                  onClick: () => setShowTeamCodePanel(true),
                  className: `text-[8px] font-black uppercase tracking-widest border px-1.5 py-0.5 rounded-none cursor-pointer transition-all ${teamConnected ? "text-[#00D17F] border-[#00D17F]/25 bg-[#00D17F]/5 hover:bg-[#00D17F]/10" : "text-[#FF4D4D] border-red-500/25 bg-red-500/5 hover:bg-red-500/10 animate-pulse"}`,
                  children: teamConnected ? `● SECURE RELAY: ${teamCode}` : `○ OFFLINE RELAY`,
                }),
              /* @__PURE__ */ jsx("button", {
                type: "button",
                onClick: () => setShowManagerSettings(!showManagerSettings),
                className: `text-[8px] font-black uppercase tracking-widest border px-1.5 py-0.5 rounded-none cursor-pointer transition-all ${showManagerSettings ? "text-[#FFB800] border-[#FFB800]/30 bg-[#FFB800]/10 animate-pulse" : "text-[#7a828c] hover:text-white border-[#1c2430] bg-[#0b0f14]"}`,
                children: "🔧 SETTINGS",
              }),
              /* @__PURE__ */ jsx(Link, {
                to: "/settings",
                className:
                  "p-0.5 hover:bg-[#11161d] border border-transparent hover:border-[#1c2430] text-[#7a828c] hover:text-white rounded-none transition-all",
                children: /* @__PURE__ */ jsx(Settings, { className: "w-3.5 h-3.5" }),
              }),
            ],
          }),
        ],
      }),
      /* @__PURE__ */ jsxs("div", {
        className:
          "flex-1 grid gap-0 relative z-10 min-h-0 bg-[#05070a] border-b border-[#1c2430] rounded-none",
        style: {
          gridTemplateColumns: "18% 64% 18%",
        },
        children: [
          /* @__PURE__ */ jsxs("section", {
            className:
              "border-r border-[#1c2430] bg-[#0b0f14] flex flex-col justify-start select-none overflow-hidden h-full rounded-none",
            children: [
              /* @__PURE__ */ jsxs("div", {
                className:
                  "border-b border-[#1c2430] flex flex-col justify-between shrink-0 rounded-none",
                children: [
                  /* @__PURE__ */ jsxs("div", {
                    className:
                      "px-2.5 py-1.5 bg-[#11161d] border-b border-[#1c2430] flex items-center justify-between select-none",
                    children: [
                      /* @__PURE__ */ jsx("span", {
                        className:
                          "text-[9.5px] font-bold tracking-widest text-[#7a828c] uppercase font-rajdhani",
                        children: "1 SELECT CAR",
                      }),
                      /* @__PURE__ */ jsx("button", {
                        onClick: () => setIsAddCarOpen(true),
                        className:
                          "text-[8px] font-black text-[#3B82F6] hover:underline uppercase tracking-widest cursor-pointer",
                        children: "+ ADD CAR",
                      }),
                    ],
                  }),
                  /* @__PURE__ */ jsx("div", {
                    className: "p-1.5 space-y-1.5 max-h-44 overflow-y-auto scrollbar-hide",
                    children: cars.map((c) => {
                      const isSelected = c.id === selectedCarId;
                      const carStints = stints.filter((s) => s.carId === c.id);
                      const assignedDrivers = Array.from(
                        new Set(
                          carStints
                            .map((s) => {
                              const d = drivers.find((drv) => drv.id === s.driverId);
                              return d ? d.name.split(" ").slice(-1)[0] : null;
                            })
                            .filter(Boolean),
                        ),
                      );
                      return /* @__PURE__ */ jsxs(
                        "div",
                        {
                          onClick: () => setSelectedCarId(c.id),
                          className: `p-2 rounded-none border transition-all text-left relative cursor-pointer group flex items-start gap-2.5 ${isSelected ? "bg-[#3B82F6]/5 border-[#3B82F6]/55 shadow-[0_0_8px_rgba(59,130,246,0.1)]" : "bg-[#05070a]/60 border-[#1c2430] hover:border-[#7a828c]/40 hover:bg-[#11161d]"}`,
                          children: [
                            /* @__PURE__ */ jsx("div", {
                              className: `p-1.5 rounded-none bg-[#05070a] border border-[#1c2430] flex items-center justify-center shrink-0 ${isSelected ? "text-[#3B82F6]" : "text-[#7a828c]"}`,
                              children: /* @__PURE__ */ jsx(Car, { className: "w-4 h-4" }),
                            }),
                            /* @__PURE__ */ jsxs("div", {
                              className: "flex-1 min-w-0",
                              children: [
                                /* @__PURE__ */ jsxs("div", {
                                  className: "flex items-center justify-between",
                                  children: [
                                    /* @__PURE__ */ jsx("span", {
                                      className:
                                        "text-[9.5px] font-black text-[#E2E4E8] uppercase tracking-wider truncate",
                                      children: c.name,
                                    }),
                                    /* @__PURE__ */ jsx("span", {
                                      className:
                                        "text-[7px] font-black text-[#7a828c] uppercase tracking-widest bg-[#11161d] border border-[#1c2430] px-1 rounded-none",
                                      children: c.carClass,
                                    }),
                                  ],
                                }),
                                /* @__PURE__ */ jsxs("div", {
                                  className:
                                    "text-[8.5px] font-mono text-[#3B82F6] font-black mt-0.5",
                                  children: ["VEH_#", c.number],
                                }),
                                /* @__PURE__ */ jsxs("div", {
                                  className: "flex flex-wrap items-center gap-1 mt-1",
                                  children: [
                                    assignedDrivers.map((dName, i) =>
                                      /* @__PURE__ */ jsx(
                                        "span",
                                        {
                                          className:
                                            "text-[6.5px] bg-[#11161d] border border-[#1c2430] text-[#7a828c] px-1 rounded-none font-bold uppercase tracking-wider",
                                          children: dName,
                                        },
                                        i,
                                      ),
                                    ),
                                    assignedDrivers.length === 0 &&
                                      /* @__PURE__ */ jsx("span", {
                                        className: "text-[6.5px] text-[#7a828c] italic uppercase",
                                        children: "No stint assigned",
                                      }),
                                  ],
                                }),
                              ],
                            }),
                            /* @__PURE__ */ jsx("button", {
                              onClick: (e) => {
                                e.stopPropagation();
                                handleDeleteCar(c.id);
                              },
                              className:
                                "opacity-0 group-hover:opacity-100 p-0.5 hover:bg-red-500/10 hover:text-red-400 border border-transparent hover:border-red-500/25 rounded-none transition-all cursor-pointer absolute top-1.5 right-1.5",
                              title: "Evict car",
                              children: /* @__PURE__ */ jsx(Trash2, { className: "w-2.5 h-2.5" }),
                            }),
                          ],
                        },
                        c.id,
                      );
                    }),
                  }),
                ],
              }),
              /* @__PURE__ */ jsxs("div", {
                className:
                  "border-b border-[#1c2430] flex-1 flex flex-col min-h-0 bg-[#0b0f14] rounded-none",
                children: [
                  /* @__PURE__ */ jsxs("div", {
                    className:
                      "px-2.5 py-1.5 bg-[#11161d] border-b border-[#1c2430] flex items-center justify-between shrink-0 select-none",
                    children: [
                      /* @__PURE__ */ jsxs("span", {
                        className:
                          "text-[9.5px] font-bold tracking-widest text-[#7a828c] uppercase font-rajdhani",
                        children: [
                          "2 DRIVERS (",
                          selectedCar ? selectedCar.name.toUpperCase() : "NO CAR SELECTED",
                          ")",
                        ],
                      }),
                      /* @__PURE__ */ jsx("button", {
                        onClick: () => setIsAddDriverOpen(true),
                        className:
                          "text-[8px] font-black text-[#3B82F6] hover:underline uppercase tracking-widest cursor-pointer",
                        children: "+ ADD DRIVER",
                      }),
                    ],
                  }),
                  /* @__PURE__ */ jsx("div", {
                    className: "p-1.5 space-y-1.5 flex-1 overflow-y-auto scrollbar-hide",
                    children: drivers.map((d) => {
                      const scheduledStintCount = stints.filter(
                        (s) => s.carId === selectedCarId && s.driverId === d.id,
                      ).length;
                      const isFiltered = selectedRosterDriverId === d.id;
                      const teamSnap = Array.from(teamDrivers.values()).find(
                        (snap) =>
                          snap.driverName.toLowerCase().includes(d.name.toLowerCase()) ||
                          d.name.toLowerCase().includes(snap.driverName.toLowerCase()),
                      );
                      const isTeamOnline = teamSnap?.isOnline ?? false;
                      const statusStr = isTeamOnline ? "Driving" : d.status || "Available";
                      const activeColor =
                        statusStr === "Driving"
                          ? "text-red-400 bg-red-500/10 border-red-500/25 shadow-[0_0_6px_rgba(239,68,68,0.1)]"
                          : statusStr === "Available"
                            ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/25 shadow-[0_0_6px_rgba(16,185,129,0.1)]"
                            : statusStr === "In Garage"
                              ? "text-blue-400 bg-blue-500/10 border-blue-500/25 shadow-[0_0_6px_rgba(59,130,246,0.1)]"
                              : "text-amber-400 bg-amber-500/10 border-amber-500/25 shadow-[0_0_6px_rgba(245,158,11,0.1)]";
                      return /* @__PURE__ */ jsxs(
                        "div",
                        {
                          draggable: "true",
                          onDragStart: (e) => {
                            e.dataTransfer.effectAllowed = "move";
                            e.dataTransfer.setData("text/plain", d.id);
                            e.dataTransfer.setData("driverId", d.id);
                          },
                          onClick: () => {
                            setSelectedRosterDriverId(isFiltered ? null : d.id);
                          },
                          className: `p-2 bg-[#05070a]/50 border rounded-none hover:bg-[#11161d] flex items-center justify-between gap-2.5 group transition-all cursor-grab active:cursor-grabbing relative ${isFiltered ? "border-[#FFB800] bg-[#FFB800]/5" : "border-[#1c2430]"}`,
                          title:
                            "Drag this driver to the timeline, or click to isolate stints. Click status badge to cycle driver availability.",
                          children: [
                            /* @__PURE__ */ jsxs("div", {
                              className: "flex items-center gap-2.5 min-w-0",
                              children: [
                                /* @__PURE__ */ jsx("button", {
                                  type: "button",
                                  onClick: (e) => {
                                    e.stopPropagation();
                                    setSelectedRosterDriverId(isFiltered ? null : d.id);
                                  },
                                  className:
                                    "w-5 h-5 rounded-none flex items-center justify-center text-[8.5px] font-black text-black uppercase shrink-0 font-mono shadow-sm cursor-pointer hover:brightness-125 transition-all",
                                  style: {
                                    backgroundColor: d.color,
                                  },
                                  title: "Click to isolate stints on timeline",
                                  children: d.shortName,
                                }),
                                /* @__PURE__ */ jsxs("div", {
                                  className: "min-w-0",
                                  children: [
                                    /* @__PURE__ */ jsxs("div", {
                                      className:
                                        "text-[9.5px] font-black text-[#E2E4E8] truncate uppercase tracking-wider pr-3 font-rajdhani flex items-center gap-1",
                                      children: [
                                        isTeamOnline &&
                                          /* @__PURE__ */ jsx("span", {
                                            className:
                                              "size-1.5 rounded-full bg-[#00D17F] shadow-[0_0_4px_#00D17F] animate-pulse shrink-0",
                                          }),
                                        d.name,
                                      ],
                                    }),
                                    /* @__PURE__ */ jsx("div", {
                                      className:
                                        "text-[7px] font-bold text-[#7a828c] uppercase tracking-widest mt-0.5 font-rajdhani",
                                      children: "GOLD INDEX",
                                    }),
                                  ],
                                }),
                              ],
                            }),
                            /* @__PURE__ */ jsxs("div", {
                              className: "flex items-center gap-3",
                              children: [
                                /* @__PURE__ */ jsxs("div", {
                                  className: "text-right font-rajdhani",
                                  children: [
                                    /* @__PURE__ */ jsx("span", {
                                      className:
                                        "text-[6.5px] text-[#7a828c] uppercase tracking-widest block font-bold leading-none",
                                      children: "STINTS",
                                    }),
                                    /* @__PURE__ */ jsxs("span", {
                                      className:
                                        "text-[9px] font-black text-white font-mono leading-none tracking-widest block mt-0.5",
                                      children: [scheduledStintCount, " / 5"],
                                    }),
                                  ],
                                }),
                                /* @__PURE__ */ jsx("button", {
                                  type: "button",
                                  onClick: (e) => {
                                    e.stopPropagation();
                                    cycleDriverStatus(d.id);
                                  },
                                  className: `text-[7.5px] font-black uppercase tracking-widest px-1.5 py-0.5 border rounded-none font-mono shrink-0 cursor-pointer select-none hover:brightness-125 transition-all ${activeColor}`,
                                  title: "Click to cycle availability",
                                  children: statusStr,
                                }),
                              ],
                            }),
                            /* @__PURE__ */ jsx("button", {
                              onClick: (e) => {
                                e.stopPropagation();
                                handleDeleteDriver(d.id);
                              },
                              className:
                                "opacity-0 group-hover:opacity-100 p-0.5 hover:bg-red-500/10 hover:text-red-400 border border-transparent hover:border-red-500/25 rounded-none transition-all cursor-pointer absolute right-1 top-1",
                              title: "Evict driver",
                              children: /* @__PURE__ */ jsx(X, { className: "w-2.5 h-2.5" }),
                            }),
                          ],
                        },
                        d.id,
                      );
                    }),
                  }),
                ],
              }),
              /* @__PURE__ */ jsxs("div", {
                className:
                  "border-t border-[#1c2430] bg-[#0b0f14] shrink-0 rounded-none p-2.5 font-mono text-[8px] space-y-2",
                children: [
                  /* @__PURE__ */ jsxs("div", {
                    className:
                      "flex items-center justify-between border-b border-[#1c2430]/60 pb-1.5 select-none font-rajdhani text-[9.5px]",
                    children: [
                      /* @__PURE__ */ jsx("span", {
                        className: "font-bold tracking-widest text-[#7a828c] uppercase",
                        children: "🧮 STRATEGY STINT CALCULATOR",
                      }),
                      /* @__PURE__ */ jsx("button", {
                        type: "button",
                        onClick: () => {
                          if (activeTeamTelemetry) {
                            if (activeTeamTelemetry.fuelBurnPerLap > 0) {
                              setCalcFuelBurn(
                                Number(activeTeamTelemetry.fuelBurnPerLap.toFixed(2)),
                              );
                            }
                            if (activeTeamTelemetry.lastLapSec > 0) {
                              setCalcAvgLapTimeSec(Math.round(activeTeamTelemetry.lastLapSec));
                            }
                          } else if (t.connected) {
                            setCalcFuelBurn(2.85);
                          }
                        },
                        disabled: !activeTeamTelemetry && !t.connected,
                        className:
                          "text-[7.5px] font-black text-[#3B82F6] hover:underline uppercase tracking-widest cursor-pointer disabled:opacity-40 disabled:hover:no-underline",
                        children: "↺ SYNC telemetry",
                      }),
                    ],
                  }),
                  /* @__PURE__ */ jsxs("div", {
                    className: "grid grid-cols-3 gap-2",
                    children: [
                      /* @__PURE__ */ jsxs("div", {
                        className: "flex flex-col gap-1",
                        children: [
                          /* @__PURE__ */ jsx("span", {
                            className: "text-[#7a828c] text-[6.5px] uppercase font-bold",
                            children: "BURN (L/LAP)",
                          }),
                          /* @__PURE__ */ jsx("input", {
                            type: "number",
                            step: "0.01",
                            value: calcFuelBurn,
                            onChange: (e) => setCalcFuelBurn(Number(e.target.value)),
                            className:
                              "w-full bg-[#05070a] border border-[#1c2430] rounded-none px-1.5 py-1 text-white font-mono font-bold text-[8.5px] focus:border-[#3B82F6] focus:outline-none",
                          }),
                        ],
                      }),
                      /* @__PURE__ */ jsxs("div", {
                        className: "flex flex-col gap-1",
                        children: [
                          /* @__PURE__ */ jsx("span", {
                            className: "text-[#7a828c] text-[6.5px] uppercase font-bold",
                            children: "STINT LAPS",
                          }),
                          /* @__PURE__ */ jsx("input", {
                            type: "number",
                            value: calcStintLaps,
                            onChange: (e) => setCalcStintLaps(Number(e.target.value)),
                            className:
                              "w-full bg-[#05070a] border border-[#1c2430] rounded-none px-1.5 py-1 text-white font-mono font-bold text-[8.5px] focus:border-[#3B82F6] focus:outline-none",
                          }),
                        ],
                      }),
                      /* @__PURE__ */ jsxs("div", {
                        className: "flex flex-col gap-1",
                        children: [
                          /* @__PURE__ */ jsx("span", {
                            className: "text-[#7a828c] text-[6.5px] uppercase font-bold",
                            children: "AVG LAP (S)",
                          }),
                          /* @__PURE__ */ jsx("input", {
                            type: "number",
                            value: calcAvgLapTimeSec,
                            onChange: (e) => setCalcAvgLapTimeSec(Number(e.target.value)),
                            className:
                              "w-full bg-[#05070a] border border-[#1c2430] rounded-none px-1.5 py-1 text-white font-mono font-bold text-[8.5px] focus:border-[#3B82F6] focus:outline-none",
                          }),
                        ],
                      }),
                    ],
                  }),
                  /* @__PURE__ */ jsxs("div", {
                    className:
                      "grid grid-cols-2 gap-2 bg-[#05070a] border border-[#1c2430] p-1.5 rounded-none text-[7.5px] leading-tight",
                    children: [
                      /* @__PURE__ */ jsxs("div", {
                        children: [
                          /* @__PURE__ */ jsx("span", {
                            className: "text-[#7a828c] block text-[6.5px]",
                            children: "FUEL PER STINT",
                          }),
                          /* @__PURE__ */ jsxs("span", {
                            className: "text-white font-bold font-mono text-[9px]",
                            children: [calculatedFuelRequired, " L"],
                          }),
                        ],
                      }),
                      /* @__PURE__ */ jsxs("div", {
                        children: [
                          /* @__PURE__ */ jsx("span", {
                            className: "text-[#7a828c] block text-[6.5px]",
                            children: "STINT DURATION",
                          }),
                          /* @__PURE__ */ jsx("span", {
                            className: "text-white font-bold font-mono text-[9px]",
                            children: formatDuration(calculatedStintDurationMin),
                          }),
                        ],
                      }),
                      enduranceFuelPlan &&
                        /* @__PURE__ */ jsx(Fragment, {
                          children: /* @__PURE__ */ jsxs("div", {
                            className:
                              "border-t border-[#1c2430]/50 pt-1 mt-1 col-span-2 grid grid-cols-2 gap-2",
                            children: [
                              /* @__PURE__ */ jsxs("div", {
                                children: [
                                  /* @__PURE__ */ jsx("span", {
                                    className: "text-[#7a828c] block text-[6.5px]",
                                    children: "EST. TOTAL FUEL",
                                  }),
                                  /* @__PURE__ */ jsxs("span", {
                                    className: "text-[#00D17F] font-bold font-mono text-[9px]",
                                    children: [enduranceFuelPlan.totalFuel.toFixed(1), " L"],
                                  }),
                                ],
                              }),
                              /* @__PURE__ */ jsxs("div", {
                                children: [
                                  /* @__PURE__ */ jsx("span", {
                                    className: "text-[#7a828c] block text-[6.5px]",
                                    children: "EST. PIT STOPS",
                                  }),
                                  /* @__PURE__ */ jsxs("span", {
                                    className: "text-[#3B82F6] font-bold font-mono text-[9px]",
                                    children: [enduranceFuelPlan.pitStops, " STOPS"],
                                  }),
                                ],
                              }),
                            ],
                          }),
                        }),
                    ],
                  }),
                ],
              }),
              /* @__PURE__ */ jsxs("div", {
                className: "p-2.5 bg-[#05070a] border-t border-[#1c2430] shrink-0 rounded-none",
                children: [
                  /* @__PURE__ */ jsx("span", {
                    className:
                      "text-[9px] font-bold tracking-[0.2em] text-[#7a828c] uppercase block mb-2 select-none font-rajdhani",
                    children: "3 DRAG & DROP DRIVERS TO TIMELINE",
                  }),
                  /* @__PURE__ */ jsx("div", {
                    className: "flex flex-wrap gap-1.5",
                    children: drivers.map((d) =>
                      /* @__PURE__ */ jsx(
                        "div",
                        {
                          draggable: "true",
                          onDragStart: (e) => {
                            e.dataTransfer.effectAllowed = "move";
                            e.dataTransfer.setData("text/plain", d.id);
                            e.dataTransfer.setData("driverId", d.id);
                          },
                          className:
                            "px-2.5 py-1 rounded-none border cursor-grab select-none font-mono text-[8.5px] font-black uppercase tracking-widest active:cursor-grabbing hover:brightness-125 transition-all shadow-sm",
                          style: {
                            backgroundColor: `${d.color}15`,
                            borderColor: d.color,
                            color: "#E2E4E8",
                          },
                          children: d.name.split(" ").slice(-1)[0],
                        },
                        d.id,
                      ),
                    ),
                  }),
                ],
              }),
            ],
          }),
          /* @__PURE__ */ jsxs("section", {
            className:
              "border-r border-[#1c2430] flex flex-col bg-[#05070a] overflow-hidden h-full rounded-none",
            children: [
              /* @__PURE__ */ jsxs("div", {
                className:
                  "border-b border-[#1c2430] bg-[#0b0f14] p-2.5 flex flex-col justify-between flex-1 min-h-0 relative z-10 rounded-none overflow-y-auto scrollbar-hide",
                children: [
                  /* @__PURE__ */ jsxs("div", {
                    className:
                      "flex flex-wrap items-center justify-between gap-3 mb-2.5 pb-2 border-b border-[#1c2430]/70 select-none font-rajdhani",
                    children: [
                      /* @__PURE__ */ jsxs("div", {
                        className: "flex items-center gap-4 flex-wrap",
                        children: [
                          /* @__PURE__ */ jsx("span", {
                            className:
                              "text-[11px] font-black uppercase tracking-widest text-[#E2E4E8]",
                            children: "4 RACE TIMELINE & STRATEGY PLANNER",
                          }),
                          /* @__PURE__ */ jsxs("div", {
                            className:
                              "flex bg-[#05070a] border border-[#1c2430] rounded-none p-0.5 text-[7px] font-black tracking-widest uppercase",
                            children: [
                              /* @__PURE__ */ jsx("span", {
                                className:
                                  "px-1.5 py-0.5 text-[#7a828c] select-none border-r border-[#1c2430]/60",
                                children: "FOCUS:",
                              }),
                              [
                                {
                                  id: "green",
                                  label: "GREEN_FLAG",
                                  color: "text-[#00D17F] hover:bg-[#00D17F]/10",
                                },
                                {
                                  id: "fcy",
                                  label: "FCY_CAUTION",
                                  color: "text-[#FFB800] hover:bg-[#FFB800]/10 animate-pulse",
                                },
                                {
                                  id: "wet",
                                  label: "RAIN_ONSET",
                                  color: "text-[#3B82F6] hover:bg-[#3B82F6]/10",
                                },
                              ].map((mode) => {
                                const active = focusMode === mode.id;
                                return /* @__PURE__ */ jsx(
                                  "button",
                                  {
                                    type: "button",
                                    onClick: () => {
                                      setFocusMode(mode.id);
                                      if (mode.id === "fcy") setGraphTab("delta");
                                      if (mode.id === "wet") setGraphTab("temp");
                                    },
                                    className: `px-2 py-0.5 cursor-pointer rounded-none border-0 transition-all font-mono font-bold ${active ? "bg-[#1c2430] text-white" : `${mode.color}`}`,
                                    children: mode.label,
                                  },
                                  mode.id,
                                );
                              }),
                            ],
                          }),
                          /* @__PURE__ */ jsxs("div", {
                            className:
                              "flex bg-[#05070a] border border-[#1c2430] rounded-none p-0.5 text-[7px] font-black tracking-widest uppercase font-rajdhani",
                            children: [
                              /* @__PURE__ */ jsx("span", {
                                className:
                                  "px-1.5 py-0.5 text-[#7a828c] select-none border-r border-[#1c2430]/60",
                                children: "ZOOM:",
                              }),
                              ["24h", "6h", "1h", "15m"].map((level) => {
                                const active = zoomLevel === level;
                                return /* @__PURE__ */ jsx(
                                  "button",
                                  {
                                    type: "button",
                                    onClick: () => applyZoomPreset(level),
                                    className: `px-1.8 py-0.5 cursor-pointer rounded-none border-0 transition-all font-mono font-bold ${active ? "bg-[#1c2430] text-white" : "text-[#7a828c] hover:text-white"}`,
                                    children: level.toUpperCase(),
                                  },
                                  level,
                                );
                              }),
                            ],
                          }),
                        ],
                      }),
                      /* @__PURE__ */ jsxs("div", {
                        className:
                          "flex flex-wrap items-center gap-3 text-[7.5px] font-mono tracking-widest uppercase font-black",
                        children: [
                          /* @__PURE__ */ jsxs("div", {
                            className: "text-right",
                            children: [
                              /* @__PURE__ */ jsx("span", {
                                className: "text-[#7a828c] block",
                                children: "RACE DURATION",
                              }),
                              /* @__PURE__ */ jsxs("span", {
                                className: "text-white text-[9px]",
                                children: [String(raceDurationHours).padStart(2, "0"), ":00:00"],
                              }),
                            ],
                          }),
                          /* @__PURE__ */ jsx("div", { className: "w-px h-5 bg-[#1c2430]" }),
                          /* @__PURE__ */ jsxs("div", {
                            className: "text-right",
                            children: [
                              /* @__PURE__ */ jsx("span", {
                                className: "text-[#7a828c] block",
                                children: "START TIME",
                              }),
                              /* @__PURE__ */ jsx("span", {
                                className: "text-white text-[9px]",
                                children: "15:00",
                              }),
                            ],
                          }),
                          /* @__PURE__ */ jsx("div", { className: "w-px h-5 bg-[#1c2430]" }),
                          /* @__PURE__ */ jsxs("div", {
                            className: "text-right",
                            children: [
                              /* @__PURE__ */ jsx("span", {
                                className: "text-[#7a828c] block",
                                children: "TIME SCALE",
                              }),
                              /* @__PURE__ */ jsx("span", {
                                className: "text-[#FFB800] text-[9px]",
                                children: "30 MIN",
                              }),
                            ],
                          }),
                          /* @__PURE__ */ jsx("div", { className: "w-px h-5 bg-[#1c2430]" }),
                          /* @__PURE__ */ jsxs("div", {
                            className: "text-right",
                            children: [
                              /* @__PURE__ */ jsx("span", {
                                className: "text-[#7a828c] block",
                                children: "EST. LAPS",
                              }),
                              /* @__PURE__ */ jsx("span", {
                                className: "text-white text-[9px]",
                                children: "~215",
                              }),
                            ],
                          }),
                          /* @__PURE__ */ jsx("div", { className: "w-px h-5 bg-[#1c2430]" }),
                          /* @__PURE__ */ jsxs("div", {
                            className: "text-right",
                            children: [
                              /* @__PURE__ */ jsx("span", {
                                className: "text-[#7a828c] block",
                                children: "FUEL WINDOW",
                              }),
                              /* @__PURE__ */ jsx("span", {
                                className: "text-[#3B82F6] text-[9px]",
                                children: "18 LAPS",
                              }),
                            ],
                          }),
                          /* @__PURE__ */ jsx("div", { className: "w-px h-5 bg-[#1c2430]" }),
                          /* @__PURE__ */ jsxs("div", {
                            className: "text-right",
                            children: [
                              /* @__PURE__ */ jsx("span", {
                                className: "text-[#7a828c] block",
                                children: "PIT WINDOWS",
                              }),
                              /* @__PURE__ */ jsx("span", {
                                className: "text-[#FF4D4D] text-[9px]",
                                children: "3",
                              }),
                            ],
                          }),
                          /* @__PURE__ */ jsx("div", { className: "w-px h-5 bg-[#1c2430]" }),
                          /* @__PURE__ */ jsxs("div", {
                            className: "text-right",
                            children: [
                              /* @__PURE__ */ jsx("span", {
                                className: "text-[#7a828c] block",
                                children: "STRATEGY SCORE",
                              }),
                              /* @__PURE__ */ jsx("span", {
                                className:
                                  "text-[#00D17F] text-[9px] drop-shadow-[0_0_4px_#00D17F]",
                                children: "92%",
                              }),
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                  showManagerSettings &&
                    /* @__PURE__ */ jsxs("div", {
                      className:
                        "border border-[#FFB800]/30 bg-[#FFB800]/5 p-3 rounded-none mb-3 grid grid-cols-1 md:grid-cols-3 gap-3 relative font-mono text-left select-none shrink-0",
                      children: [
                        /* @__PURE__ */ jsx("div", {
                          className: "absolute top-0 right-0 h-full w-1.5 bg-[#FFB800]",
                        }),
                        /* @__PURE__ */ jsxs("div", {
                          className: "space-y-2 border-r border-[#1c2430] pr-3",
                          children: [
                            /* @__PURE__ */ jsx("span", {
                              className:
                                "text-[9.5px] font-black text-[#FFB800] uppercase tracking-wider block font-rajdhani",
                              children: "🏆 RACE SESSION PARAMETERS",
                            }),
                            /* @__PURE__ */ jsxs("div", {
                              className: "flex flex-col gap-1 text-[8.5px]",
                              children: [
                                /* @__PURE__ */ jsx("label", {
                                  className: "text-[#7a828c] uppercase font-bold",
                                  children: "Race Duration (Hours)",
                                }),
                                /* @__PURE__ */ jsx("div", {
                                  className: "flex bg-black border border-[#1c2430] p-0.5",
                                  children: [1, 2, 4, 6, 12, 24].map((h) => {
                                    const isDur = raceDurationHours === h;
                                    return /* @__PURE__ */ jsxs(
                                      "button",
                                      {
                                        type: "button",
                                        onClick: () => {
                                          setRaceDurationHours(h);
                                          if (h >= 12) {
                                            setZoomLevel("24h");
                                            setTimelineZoom(1);
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
                                        },
                                        className: `flex-1 text-[8px] py-0.5 text-center font-bold border-0 cursor-pointer transition-colors ${isDur ? "bg-[#FFB800] text-black" : "text-[#7a828c] hover:text-white"}`,
                                        children: [h, "H"],
                                      },
                                      h,
                                    );
                                  }),
                                }),
                              ],
                            }),
                            /* @__PURE__ */ jsxs("div", {
                              className: "flex flex-col gap-1 text-[8.5px] pt-1",
                              children: [
                                /* @__PURE__ */ jsx("label", {
                                  className: "text-[#7a828c] uppercase font-bold",
                                  children: "Allowed Tyre Compounds",
                                }),
                                /* @__PURE__ */ jsx("div", {
                                  className:
                                    "grid grid-cols-2 gap-1.5 font-mono text-[8px] text-white",
                                  children: [
                                    {
                                      id: "soft",
                                      label: "SOFT (S1)",
                                      state: tyreSoftAllowed,
                                      setter: setTyreSoftAllowed,
                                      color: "#FF4D4D",
                                    },
                                    {
                                      id: "medium",
                                      label: "MEDIUM (S2)",
                                      state: tyreMediumAllowed,
                                      setter: setTyreMediumAllowed,
                                      color: "#FFB800",
                                    },
                                    {
                                      id: "hard",
                                      label: "HARD (S3)",
                                      state: tyreHardAllowed,
                                      setter: setTyreHardAllowed,
                                      color: "#E2E4E8",
                                    },
                                    {
                                      id: "wet",
                                      label: "WET (S4)",
                                      state: tyreWetAllowed,
                                      setter: setTyreWetAllowed,
                                      color: "#3B82F6",
                                    },
                                  ].map((t2) =>
                                    /* @__PURE__ */ jsxs(
                                      "div",
                                      {
                                        onClick: () => t2.setter(!t2.state),
                                        className:
                                          "flex items-center gap-1.5 cursor-pointer hover:bg-black/40 p-0.5 border border-[#1c2430] bg-black/20",
                                        children: [
                                          /* @__PURE__ */ jsx("span", {
                                            className: "w-1 h-3 shrink-0",
                                            style: {
                                              backgroundColor: t2.state ? t2.color : "#3A3F47",
                                            },
                                          }),
                                          /* @__PURE__ */ jsx("span", {
                                            className: t2.state
                                              ? "font-bold"
                                              : "text-[#7a828c] line-through",
                                            children: t2.label,
                                          }),
                                        ],
                                      },
                                      t2.id,
                                    ),
                                  ),
                                }),
                              ],
                            }),
                            /* @__PURE__ */ jsx("p", {
                              className: "text-[7.5px] text-[#7a828c] font-sans leading-normal",
                              children:
                                "Disallowing compounds grays them out on the timeline and alerts the AI strategist so it never suggests disallowed tyres.",
                            }),
                          ],
                        }),
                        /* @__PURE__ */ jsxs("div", {
                          className: "space-y-2 border-r border-[#1c2430] pr-3 text-[8.5px]",
                          children: [
                            /* @__PURE__ */ jsx("span", {
                              className:
                                "text-[9.5px] font-black text-[#FF4D4D] uppercase tracking-wider block font-rajdhani",
                              children: "⚠️ TELEMETRY CONNECTION ASSISTANT",
                            }),
                            /* @__PURE__ */ jsxs("div", {
                              className: "space-y-1.5 font-sans leading-tight text-[#7a828c]",
                              children: [
                                /* @__PURE__ */ jsxs("div", {
                                  className: "flex gap-1.5 items-start",
                                  children: [
                                    /* @__PURE__ */ jsx("span", {
                                      className: "text-[#FF4D4D] font-bold",
                                      children: "1.",
                                    }),
                                    /* @__PURE__ */ jsxs("p", {
                                      children: [
                                        /* @__PURE__ */ jsx("strong", {
                                          className: "text-white uppercase font-mono text-[7.5px]",
                                          children: "Driver Offline?",
                                        }),
                                        " Ensure driver executed ",
                                        /* @__PURE__ */ jsx("code", {
                                          className:
                                            "font-mono bg-black text-red-400 px-0.5 border border-[#1c2430]",
                                          children: "npm start",
                                        }),
                                        " inside ",
                                        /* @__PURE__ */ jsx("code", {
                                          className:
                                            "font-mono bg-black text-white px-0.5 border border-[#1c2430]",
                                          children: "local-bridge/",
                                        }),
                                        ".",
                                      ],
                                    }),
                                  ],
                                }),
                                /* @__PURE__ */ jsxs("div", {
                                  className: "flex gap-1.5 items-start",
                                  children: [
                                    /* @__PURE__ */ jsx("span", {
                                      className: "text-[#FF4D4D] font-bold",
                                      children: "2.",
                                    }),
                                    /* @__PURE__ */ jsxs("p", {
                                      children: [
                                        /* @__PURE__ */ jsx("strong", {
                                          className: "text-white uppercase font-mono text-[7.5px]",
                                          children: "Handshake Fail?",
                                        }),
                                        " The `SUPABASE_ANON_KEY` inside ",
                                        /* @__PURE__ */ jsx("code", {
                                          className:
                                            "font-mono bg-black text-white px-0.5 border border-[#1c2430]",
                                          children: "local-bridge/.env",
                                        }),
                                        " must match your Project keys.",
                                      ],
                                    }),
                                  ],
                                }),
                                /* @__PURE__ */ jsxs("div", {
                                  className: "flex gap-1.5 items-start",
                                  children: [
                                    /* @__PURE__ */ jsx("span", {
                                      className: "text-[#FF4D4D] font-bold",
                                      children: "3.",
                                    }),
                                    /* @__PURE__ */ jsxs("p", {
                                      children: [
                                        /* @__PURE__ */ jsx("strong", {
                                          className: "text-white uppercase font-mono text-[7.5px]",
                                          children: "Code Mismatch?",
                                        }),
                                        " Ensure driver's `.env` uses your exact capitalized code: ",
                                        /* @__PURE__ */ jsx("strong", {
                                          className:
                                            "text-white font-mono bg-black px-1 border border-[#1c2430]",
                                          children: teamCode || "PITWALL-XXXX",
                                        }),
                                        ".",
                                      ],
                                    }),
                                  ],
                                }),
                                /* @__PURE__ */ jsxs("div", {
                                  className: "flex gap-1.5 items-start",
                                  children: [
                                    /* @__PURE__ */ jsx("span", {
                                      className: "text-[#FF4D4D] font-bold",
                                      children: "4.",
                                    }),
                                    /* @__PURE__ */ jsxs("p", {
                                      children: [
                                        /* @__PURE__ */ jsx("strong", {
                                          className: "text-white uppercase font-mono text-[7.5px]",
                                          children: "DB Paused?",
                                        }),
                                        " Free Supabase projects auto-pause after 7 days. Restore project active status on ",
                                        /* @__PURE__ */ jsx("a", {
                                          href: "https://supabase.com",
                                          target: "_blank",
                                          rel: "noopener noreferrer",
                                          className: "text-[#3B82F6] hover:underline font-mono",
                                          children: "supabase.com",
                                        }),
                                        ".",
                                      ],
                                    }),
                                  ],
                                }),
                              ],
                            }),
                          ],
                        }),
                        /* @__PURE__ */ jsxs("div", {
                          className: "space-y-2 text-[8.5px]",
                          children: [
                            /* @__PURE__ */ jsx("span", {
                              className:
                                "text-[9.5px] font-black text-[#00D17F] uppercase tracking-wider block font-rajdhani",
                              children: "🟢 LIVE SYSTEM SPECIFICATION",
                            }),
                            /* @__PURE__ */ jsxs("div", {
                              className: "space-y-1 font-mono text-[8px] text-[#7a828c]",
                              children: [
                                /* @__PURE__ */ jsxs("div", {
                                  className:
                                    "flex justify-between border-b border-[#1c2430]/50 pb-0.5",
                                  children: [
                                    /* @__PURE__ */ jsx("span", { children: "RACE DURATION:" }),
                                    /* @__PURE__ */ jsxs("span", {
                                      className: "text-white font-bold",
                                      children: [raceDurationHours, " HOURS"],
                                    }),
                                  ],
                                }),
                                /* @__PURE__ */ jsxs("div", {
                                  className:
                                    "flex justify-between border-b border-[#1c2430]/50 pb-0.5",
                                  children: [
                                    /* @__PURE__ */ jsx("span", { children: "ACTIVE CO-PILOTS:" }),
                                    /* @__PURE__ */ jsxs("span", {
                                      className: "text-white font-bold",
                                      children: [drivers.length, " REGISTERED"],
                                    }),
                                  ],
                                }),
                                /* @__PURE__ */ jsxs("div", {
                                  className:
                                    "flex justify-between border-b border-[#1c2430]/50 pb-0.5",
                                  children: [
                                    /* @__PURE__ */ jsx("span", { children: "RELAY PIPELINE:" }),
                                    /* @__PURE__ */ jsx("span", {
                                      className: `font-bold ${teamConnected ? "text-[#00D17F]" : "text-red-400"}`,
                                      children: teamConnected ? "CONNECTED" : "DISCONNECTED",
                                    }),
                                  ],
                                }),
                                /* @__PURE__ */ jsxs("div", {
                                  className: "flex justify-between pb-0.5",
                                  children: [
                                    /* @__PURE__ */ jsx("span", {
                                      children: "DB ROW SEGREGATION:",
                                    }),
                                    /* @__PURE__ */ jsx("span", {
                                      className: "text-white font-bold font-mono",
                                      children: "JWT ROW-SECURITY",
                                    }),
                                  ],
                                }),
                              ],
                            }),
                            /* @__PURE__ */ jsxs("div", {
                              className:
                                "mt-2.5 p-1 bg-black/40 border border-[#1c2430] text-center text-[7px] uppercase text-[#7a828c]",
                              children: [
                                /* @__PURE__ */ jsx("span", {
                                  className: "text-white font-bold",
                                  children: "EXPLANATIVE SUMMARY:",
                                }),
                                " This is your Race Wall Strategy center. Configure race duration and compounds to adapt live fuel math. Send credentials to drivers to sync timing stands.",
                              ],
                            }),
                          ],
                        }),
                      ],
                    }),
                  /* @__PURE__ */ jsxs("div", {
                    onWheel: onTimelineWheel,
                    onMouseDown: onTimelineMouseDown,
                    onMouseMove: onTimelineMouseMove,
                    onMouseUp: onTimelineMouseUp,
                    onMouseLeave: onTimelineMouseUp,
                    onContextMenu,
                    className:
                      "relative border border-[#1c2430] bg-[#05070a] p-2.5 rounded-none overflow-hidden select-none select-none cursor-ew-resize timeline-gantt-container",
                    children: [
                      /* @__PURE__ */ jsx("div", {
                        className:
                          "absolute inset-y-0 left-[110px] right-0 flex pointer-events-none z-0",
                        children: Array.from({
                          length: 7,
                        }).map((_, idx) =>
                          /* @__PURE__ */ jsx(
                            "div",
                            {
                              className:
                                "flex-1 border-l border-[#1c2430]/35 h-full first:border-l-0",
                            },
                            idx,
                          ),
                        ),
                      }),
                      /* @__PURE__ */ jsxs("div", {
                        className: "relative z-10 space-y-3",
                        children: [
                          /* @__PURE__ */ jsxs("div", {
                            className:
                              "flex border-b border-[#1c2430]/60 pb-1.5 font-mono text-[7.5px] text-[#7a828c] font-black uppercase tracking-widest",
                            children: [
                              /* @__PURE__ */ jsx("span", {
                                className: "w-24 shrink-0 text-[#7a828c] font-rajdhani",
                                children: "RACE TIMELINE",
                              }),
                              /* @__PURE__ */ jsx("div", {
                                className: "flex-1 flex justify-between font-mono",
                                children: Array.from({
                                  length: 7,
                                }).map((_, idx) => {
                                  const pct = idx / 6;
                                  const currentMin = startTimeOffsetMin + pct * visibleDuration;
                                  const hrs = Math.floor(currentMin / 60);
                                  const mins = Math.round(currentMin % 60);
                                  let label = "";
                                  if (raceDurationHours >= 4 && timelineZoom < 4) {
                                    label = `${hrs}:${String(mins).padStart(2, "0")}`;
                                    if (idx === 0) label = "START";
                                    if (idx === 6) label = `FINISH (${raceDurationHours}H)`;
                                  } else {
                                    label = `T+${hrs > 0 ? `${hrs}H ` : ""}${mins} MIN`;
                                    if (idx === 0) label = "T+0 MIN";
                                  }
                                  return /* @__PURE__ */ jsx("span", { children: label }, idx);
                                }),
                              }),
                            ],
                          }),
                          selectedCar
                            ? /* @__PURE__ */ jsxs("div", {
                                className: "flex items-center relative py-0.5",
                                children: [
                                  /* @__PURE__ */ jsx("div", {
                                    className: "w-24 shrink-0 pr-2",
                                    children: /* @__PURE__ */ jsxs("span", {
                                      className:
                                        "text-[9px] font-black text-white tracking-widest flex items-center gap-1.5 uppercase leading-none",
                                      children: [
                                        /* @__PURE__ */ jsx("span", {
                                          className: "w-1.5 h-1.5 rounded-full bg-[#3B82F6]",
                                        }),
                                        "#",
                                        selectedCar.number,
                                        " ",
                                        selectedCar.name.split(" ").slice(-1)[0],
                                      ],
                                    }),
                                  }),
                                  /* @__PURE__ */ jsx("div", {
                                    className:
                                      "flex-1 relative bg-[#0b0f14]/80 border border-[#1c2430] p-1 h-12 rounded-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] overflow-hidden",
                                    children: activeStints.map((stint, stintIdx) => {
                                      const driver = drivers.find((d) => d.id === stint.driverId);
                                      const isDimmed =
                                        selectedRosterDriverId &&
                                        stint.driverId !== selectedRosterDriverId;
                                      const isHighlighted =
                                        selectedRosterDriverId &&
                                        stint.driverId === selectedRosterDriverId;
                                      const isHovered = hoveredStintIndex === stintIdx;
                                      const slotStyle = getSlotStyle(stintIdx);
                                      if (slotStyle.display === "none") return null;
                                      return /* @__PURE__ */ jsx(
                                        "div",
                                        {
                                          onDragOver: (e) => e.preventDefault(),
                                          onDrop: (e) => {
                                            const drvId =
                                              e.dataTransfer.getData("text/plain") ||
                                              e.dataTransfer.getData("driverId");
                                            if (drvId) handleStintDriverDrop(stintIdx, drvId);
                                          },
                                          onClick: () => {
                                            if (drivers.length === 0) return;
                                            const currentDriverIdx = drivers.findIndex(
                                              (d) => d.id === stint.driverId,
                                            );
                                            let nextDriverId = "";
                                            if (stint.driverId === "") {
                                              nextDriverId = drivers[0].id;
                                            } else if (currentDriverIdx === drivers.length - 1) {
                                              nextDriverId = "";
                                            } else {
                                              nextDriverId = drivers[currentDriverIdx + 1].id;
                                            }
                                            handleStintDriverDrop(stintIdx, nextDriverId);
                                          },
                                          onMouseEnter: () => setHoveredStintIndex(stintIdx),
                                          onMouseLeave: () => setHoveredStintIndex(null),
                                          className: `rounded-none border relative flex flex-col justify-center items-center px-1.5 select-none overflow-hidden transition-all duration-150 group/slot cursor-pointer ${driver ? "bg-gradient-to-b from-[#11161d] to-[#0b0f14] shadow-md" : "bg-[#05070a] border-dashed border-[#1c2430] hover:bg-[#11161d]/40"} ${isDimmed ? "opacity-25" : "opacity-100"} ${isHighlighted ? "ring-1 ring-[#FFB800]" : ""} ${isHovered ? "brightness-125" : ""}`,
                                          style: {
                                            ...slotStyle,
                                            left: `calc(${parseFloat(slotStyle.left)}% + 2px)`,
                                            width: `calc(${parseFloat(slotStyle.width)}% - 4px)`,
                                            borderColor: driver ? driver.color : "#1C2430",
                                          },
                                          title: driver
                                            ? `Driver: ${driver.name}
${stint.note}. Hover to highlight fuel curve. Click to cycle drivers.`
                                            : "Drag driver here or click to assign.",
                                          children: driver
                                            ? /* @__PURE__ */ jsxs("div", {
                                                className:
                                                  "flex flex-col items-center justify-center pointer-events-none w-full h-full relative",
                                                children: [
                                                  /* @__PURE__ */ jsx("span", {
                                                    className:
                                                      "absolute top-0 inset-x-0 h-[2px] block pointer-events-none",
                                                    style: {
                                                      backgroundColor: driver.color,
                                                    },
                                                  }),
                                                  /* @__PURE__ */ jsx("div", {
                                                    className:
                                                      "text-[9px] font-mono font-black tracking-widest text-[#E2E4E8] uppercase text-center mt-0.5 font-rajdhani pointer-events-none",
                                                    children: driver.shortName,
                                                  }),
                                                  /* @__PURE__ */ jsx("div", {
                                                    className:
                                                      "text-[7px] font-bold text-[#7a828c] uppercase tracking-wider mt-0.5 text-center truncate w-full font-rajdhani pointer-events-none",
                                                    children: stint.note || "Scheduled",
                                                  }),
                                                  /* @__PURE__ */ jsx("div", {
                                                    className:
                                                      "absolute -right-1.5 inset-y-0 flex items-center z-20 pointer-events-none",
                                                    children: /* @__PURE__ */ jsx("div", {
                                                      className:
                                                        "w-[3px] h-3 bg-[#FF4D4D] rounded-none shadow-[0_0_6px_#FF4D4D]",
                                                    }),
                                                  }),
                                                ],
                                              })
                                            : /* @__PURE__ */ jsx("div", {
                                                className:
                                                  "flex flex-col items-center justify-center text-center select-none py-0.5 pointer-events-none w-full h-full",
                                                children: /* @__PURE__ */ jsx("span", {
                                                  className:
                                                    "text-[6.5px] font-black text-[#7a828c]/65 uppercase tracking-wider block font-rajdhani pointer-events-none",
                                                  children: "DROP DRIVER",
                                                }),
                                              }),
                                        },
                                        stint.id,
                                      );
                                    }),
                                  }),
                                ],
                              })
                            : /* @__PURE__ */ jsx("div", {
                                className:
                                  "text-center py-4 text-xs text-[#7a828c] italic uppercase font-rajdhani",
                                children: "Select a car from the left database to schedule stints",
                              }),
                          /* @__PURE__ */ jsxs("div", {
                            className: "flex items-center relative py-0.5",
                            children: [
                              /* @__PURE__ */ jsx("div", {
                                className: "w-24 shrink-0 pr-2",
                                children: /* @__PURE__ */ jsx("span", {
                                  className:
                                    "text-[7px] font-bold text-[#7a828c] tracking-widest uppercase font-rajdhani",
                                  children: "TYRE COMPOUND",
                                }),
                              }),
                              /* @__PURE__ */ jsxs("div", {
                                className:
                                  "flex-1 relative h-4 rounded-none border border-[#1c2430] bg-[#0b0f14]/50 p-[1px] select-none text-[6.5px] overflow-hidden",
                                children: [
                                  /* @__PURE__ */ jsxs("div", {
                                    className: `font-black flex items-center justify-center tracking-widest uppercase font-rajdhani ${tyreSoftAllowed ? "bg-[#FF4D4D]/25 text-[#FF4D4D]" : "bg-black/40 text-[#7a828c] line-through decoration-red-500/50"}`,
                                    style: getSlotStyle(0),
                                    children: ["SOFT (S1) ", !tyreSoftAllowed && "LOCKED"],
                                  }),
                                  /* @__PURE__ */ jsxs("div", {
                                    className: `font-black flex items-center justify-center tracking-widest uppercase font-rajdhani ${tyreMediumAllowed ? "bg-[#FFB800]/25 text-[#FFB800]" : "bg-black/40 text-[#7a828c] line-through decoration-amber-500/50"}`,
                                    style: getSlotStyle(1),
                                    children: ["MEDIUM (S2) ", !tyreMediumAllowed && "LOCKED"],
                                  }),
                                  /* @__PURE__ */ jsxs("div", {
                                    className: `font-black flex items-center justify-center tracking-widest uppercase font-rajdhani ${tyreHardAllowed ? "bg-[#E2E4E8]/15 text-[#E2E4E8]/70" : "bg-black/40 text-[#7a828c] line-through decoration-white/50"}`,
                                    style: getSlotStyle(2),
                                    children: ["HARD (S3) ", !tyreHardAllowed && "LOCKED"],
                                  }),
                                  /* @__PURE__ */ jsxs("div", {
                                    className: `font-black flex items-center justify-center tracking-widest uppercase font-rajdhani ${tyreWetAllowed ? "bg-[#3B82F6]/25 text-[#3B82F6]" : "bg-black/40 text-[#7a828c] line-through decoration-blue-500/50"}`,
                                    style: getSlotStyle(3),
                                    children: ["WET (S4) ", !tyreWetAllowed && "LOCKED"],
                                  }),
                                ],
                              }),
                            ],
                          }),
                          /* @__PURE__ */ jsxs("div", {
                            className: "flex items-center relative py-0.5",
                            children: [
                              /* @__PURE__ */ jsx("div", {
                                className: "w-24 shrink-0 pr-2",
                                children: /* @__PURE__ */ jsx("span", {
                                  className:
                                    "text-[7px] font-bold text-[#7a828c] tracking-widest uppercase font-rajdhani",
                                  children: "FUEL & PIT WINDOW",
                                }),
                              }),
                              /* @__PURE__ */ jsxs("div", {
                                className:
                                  "flex-1 relative h-4 rounded-none border border-[#1c2430] bg-[#0b0f14]/50 p-[1px] font-mono text-[6.5px] overflow-hidden",
                                children: [
                                  /* @__PURE__ */ jsxs("div", {
                                    className: "flex items-center justify-between px-1.5",
                                    style: getSlotStyle(0),
                                    children: [
                                      /* @__PURE__ */ jsx("span", {
                                        className: "text-[#00D17F] font-rajdhani",
                                        children: "MIN_BURN",
                                      }),
                                      /* @__PURE__ */ jsx("span", {
                                        className: "text-white",
                                        children: zoomLevel === "24h" ? "2.65L" : "2.80L",
                                      }),
                                    ],
                                  }),
                                  /* @__PURE__ */ jsxs("div", {
                                    className:
                                      "flex items-center justify-between px-1.5 bg-[#FF4D4D]/5",
                                    style: getSlotStyle(1),
                                    children: [
                                      /* @__PURE__ */ jsx("span", {
                                        className: "text-[#FF4D4D] font-rajdhani",
                                        children: "PIT_WINDOW",
                                      }),
                                      /* @__PURE__ */ jsxs("span", {
                                        className: "text-white",
                                        children: ["LAP ", zoomLevel === "24h" ? "42" : "45"],
                                      }),
                                    ],
                                  }),
                                  /* @__PURE__ */ jsxs("div", {
                                    className: "flex items-center justify-between px-1.5",
                                    style: getSlotStyle(2),
                                    children: [
                                      /* @__PURE__ */ jsx("span", {
                                        className: "text-[#00D17F] font-rajdhani",
                                        children: "MIN_BURN",
                                      }),
                                      /* @__PURE__ */ jsx("span", {
                                        className: "text-white",
                                        children: "2.82L",
                                      }),
                                    ],
                                  }),
                                  /* @__PURE__ */ jsxs("div", {
                                    className:
                                      "flex items-center justify-between px-1.5 bg-[#FF4D4D]/5",
                                    style: getSlotStyle(3),
                                    children: [
                                      /* @__PURE__ */ jsx("span", {
                                        className: "text-[#FF4D4D] font-rajdhani",
                                        children: "PIT_LEGAL",
                                      }),
                                      /* @__PURE__ */ jsx("span", {
                                        className: "text-white",
                                        children: "LAP 180",
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                            ],
                          }),
                          /* @__PURE__ */ jsxs("div", {
                            className: `flex items-center relative py-0.5 transition-all duration-200 ${focusMode === "fcy" ? "bg-yellow-500/5 ring-1 ring-yellow-500/30" : ""}`,
                            children: [
                              /* @__PURE__ */ jsx("div", {
                                className: "w-24 shrink-0 pr-2",
                                children: /* @__PURE__ */ jsx("span", {
                                  className: `text-[7px] font-bold tracking-widest uppercase font-rajdhani transition-colors ${focusMode === "fcy" ? "text-[#FFB800]" : "text-[#7a828c]"}`,
                                  children: "CAUTION FCY %",
                                }),
                              }),
                              /* @__PURE__ */ jsxs("div", {
                                className:
                                  "flex-1 relative h-4 rounded-none border border-[#1c2430] bg-[#0b0f14]/50 p-[1px] font-mono text-[6.5px] overflow-hidden",
                                children: [
                                  /* @__PURE__ */ jsx("div", {
                                    className:
                                      "bg-orange-500/10 flex items-center justify-center font-bold text-orange-400 tracking-wider font-rajdhani",
                                    style: getSlotStyle(0),
                                    children: "FCY RISK: 18% (LOW)",
                                  }),
                                  /* @__PURE__ */ jsx("div", {
                                    className: `bg-red-500/20 flex items-center justify-center font-bold text-red-400 tracking-wider font-rajdhani ${focusMode === "fcy" ? "animate-pulse border-red-500" : ""}`,
                                    style: getSlotStyle(1),
                                    children: "FCY RISK: 75% (CRITICAL)",
                                  }),
                                  /* @__PURE__ */ jsx("div", {
                                    className:
                                      "bg-yellow-500/15 flex items-center justify-center font-bold text-[#FFB800] tracking-wider font-rajdhani",
                                    style: getSlotStyle(2),
                                    children: "FCY RISK: 40% (MEDIUM)",
                                  }),
                                  /* @__PURE__ */ jsx("div", {
                                    className:
                                      "bg-emerald-500/5 flex items-center justify-center font-bold text-[#00D17F] tracking-wider font-rajdhani",
                                    style: getSlotStyle(3),
                                    children: "FCY RISK: 8% (NOMINAL)",
                                  }),
                                ],
                              }),
                            ],
                          }),
                          /* @__PURE__ */ jsxs("div", {
                            className: "flex items-center relative py-0.5",
                            children: [
                              /* @__PURE__ */ jsx("div", {
                                className: "w-24 shrink-0 pr-2",
                                children: /* @__PURE__ */ jsx("span", {
                                  className:
                                    "text-[7px] font-bold text-[#7a828c] tracking-widest uppercase font-rajdhani",
                                  children: "MET WEATHER",
                                }),
                              }),
                              /* @__PURE__ */ jsxs("div", {
                                className: `flex-1 relative transition-all duration-300 rounded-none border border-[#1c2430] bg-[#0b0f14]/50 p-[1px] overflow-hidden ${focusMode === "wet" ? "h-10" : "h-4"}`,
                                children: [
                                  /* @__PURE__ */ jsxs("div", {
                                    className:
                                      "text-[#f59e0b] bg-[#f59e0b]/5 flex flex-col items-center justify-center uppercase tracking-wider font-rajdhani leading-none text-[6.5px] font-bold",
                                    style: getSlotStyle(0),
                                    children: [
                                      /* @__PURE__ */ jsx("span", { children: "100% DRY / SUNNY" }),
                                      focusMode === "wet" &&
                                        /* @__PURE__ */ jsx("span", {
                                          className: "text-[5px] text-[#7a828c] mt-0.5",
                                          children: "SLICK WINDOW",
                                        }),
                                    ],
                                  }),
                                  /* @__PURE__ */ jsxs("div", {
                                    className:
                                      "text-[#60a5fa] bg-[#60a5fa]/5 flex flex-col items-center justify-center uppercase tracking-wider font-rajdhani leading-none text-[6.5px] font-bold",
                                    style: getSlotStyle(1),
                                    children: [
                                      /* @__PURE__ */ jsx("span", {
                                        children: "40% DAMP OVERCAST",
                                      }),
                                      focusMode === "wet" &&
                                        /* @__PURE__ */ jsx("span", {
                                          className: "text-[5px] text-[#60a5fa] mt-0.5",
                                          children: "SLICK CHASSIS OPTIMAL",
                                        }),
                                    ],
                                  }),
                                  /* @__PURE__ */ jsxs("div", {
                                    className:
                                      "text-[#94a3b8] bg-[#94a3b8]/5 flex flex-col items-center justify-center uppercase tracking-wider font-rajdhani leading-none text-[6.5px] font-bold",
                                    style: getSlotStyle(2),
                                    children: [
                                      /* @__PURE__ */ jsx("span", {
                                        children: "65% WET TRANSITION",
                                      }),
                                      focusMode === "wet" &&
                                        /* @__PURE__ */ jsx("span", {
                                          className: "text-[5px] text-[#94a3b8] mt-0.5",
                                          children: "CROSSOVER IN 4 LAPS",
                                        }),
                                    ],
                                  }),
                                  /* @__PURE__ */ jsxs("div", {
                                    className:
                                      "text-blue-400 bg-blue-500/10 flex flex-col items-center justify-center uppercase tracking-wider font-rajdhani leading-none text-[6.5px] font-bold animate-pulse",
                                    style: getSlotStyle(3),
                                    children: [
                                      /* @__PURE__ */ jsx("span", {
                                        children: "80% WET STORM WARNING",
                                      }),
                                      focusMode === "wet" &&
                                        /* @__PURE__ */ jsx("span", {
                                          className: "text-[5px] text-blue-300 mt-0.5",
                                          children: "HEAVY WET TYRES",
                                        }),
                                    ],
                                  }),
                                ],
                              }),
                            ],
                          }),
                          /* @__PURE__ */ jsxs("div", {
                            className:
                              "flex items-center relative py-0.5 border-t border-[#1c2430]/25 pt-1.5 mt-1.5",
                            children: [
                              /* @__PURE__ */ jsx("div", {
                                className: "w-24 shrink-0 pr-2",
                                children: /* @__PURE__ */ jsxs("span", {
                                  className:
                                    "text-[7px] font-bold text-[#7a828c]/60 tracking-widest uppercase font-rajdhani flex items-center gap-1.5",
                                  children: [
                                    /* @__PURE__ */ jsx("span", {
                                      className: "w-1 h-1 bg-[#7a828c] opacity-50",
                                    }),
                                    "RIVAL GHOST",
                                  ],
                                }),
                              }),
                              /* @__PURE__ */ jsxs("div", {
                                className:
                                  "flex-1 relative h-6 rounded-none border border-dashed border-[#1c2430]/65 bg-[#05070a]/20 p-[1px] opacity-60 text-[6.5px] overflow-hidden",
                                children: [
                                  /* @__PURE__ */ jsxs("div", {
                                    className:
                                      "flex flex-col justify-center px-1.5 text-[#7a828c] leading-tight",
                                    style: getSlotStyle(0),
                                    children: [
                                      /* @__PURE__ */ jsx("span", {
                                        className:
                                          "font-bold text-white uppercase text-[6px] font-rajdhani",
                                        children: "#12 BMW HYBRID",
                                      }),
                                      /* @__PURE__ */ jsx("span", {
                                        className: "font-mono text-[5.5px]",
                                        children: "PIT WINDOW: LAP 42-48",
                                      }),
                                    ],
                                  }),
                                  /* @__PURE__ */ jsxs("div", {
                                    className:
                                      "flex flex-col justify-center px-1.5 bg-yellow-500/5 text-[#FFB800]/70 leading-tight",
                                    style: getSlotStyle(1),
                                    children: [
                                      /* @__PURE__ */ jsx("span", {
                                        className: "font-bold uppercase text-[6px] font-rajdhani",
                                        children: "UNDERCUT PROJECTION",
                                      }),
                                      /* @__PURE__ */ jsx("span", {
                                        className: "font-mono text-[5.5px]",
                                        children: "CHANCE: 64% (HIGH)",
                                      }),
                                    ],
                                  }),
                                  /* @__PURE__ */ jsxs("div", {
                                    className:
                                      "flex flex-col justify-center px-1.5 text-[#7a828c] leading-tight",
                                    style: getSlotStyle(2),
                                    children: [
                                      /* @__PURE__ */ jsx("span", {
                                        className:
                                          "font-bold text-white uppercase text-[6px] font-rajdhani",
                                        children: "#3 CADILLAC WTR",
                                      }),
                                      /* @__PURE__ */ jsx("span", {
                                        className: "font-mono text-[5.5px]",
                                        children: "FUEL OFFSET: -1.2 LAPS",
                                      }),
                                    ],
                                  }),
                                  /* @__PURE__ */ jsxs("div", {
                                    className:
                                      "flex flex-col justify-center px-1.5 bg-red-500/5 text-[#FF4D4D]/70 leading-tight",
                                    style: getSlotStyle(3),
                                    children: [
                                      /* @__PURE__ */ jsx("span", {
                                        className: "font-bold uppercase text-[6px] font-rajdhani",
                                        children: "TRAFFIC CONVERGENCE",
                                      }),
                                      /* @__PURE__ */ jsx("span", {
                                        className: "font-mono text-[5.5px]",
                                        children: "LAP 195 · SECTOR 2",
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              /* @__PURE__ */ jsxs("div", {
                className:
                  "border-b border-[#1c2430] bg-[#05070a] p-2.5 h-[160px] flex-none flex flex-col relative select-none rounded-none",
                children: [
                  /* @__PURE__ */ jsxs("div", {
                    className:
                      "flex items-center justify-between border-b border-[#1c2430]/75 pb-1.5 mb-2.5 shrink-0 select-none",
                    children: [
                      /* @__PURE__ */ jsx("div", {
                        className: "flex bg-[#0b0f14] border border-[#1c2430] rounded-none p-0.5",
                        children: [
                          {
                            id: "fuel",
                            label: "FUEL LEVEL (L)",
                            color: "text-[#3B82F6]",
                          },
                          {
                            id: "tyre",
                            label: "TYRE LIFE (%)",
                            color: "text-[#00D17F]",
                          },
                          {
                            id: "temp",
                            label: "TRACK TEMP (°C)",
                            color: "text-[#FFB800]",
                          },
                          {
                            id: "delta",
                            label: "DELTA TO LEADER (S)",
                            color: "text-[#FF4D4D]",
                          },
                        ].map((t2) => {
                          const isActive = graphTab === t2.id;
                          return /* @__PURE__ */ jsx(
                            "button",
                            {
                              onClick: () => setGraphTab(t2.id),
                              className: `px-2.5 py-0.5 text-[8px] font-black uppercase tracking-widest cursor-pointer transition-all rounded-none border-0 ${isActive ? "bg-[#1c2430] text-white" : "text-[#7a828c] hover:text-[#E2E4E8] hover:bg-[#11161d]/50"}`,
                              children: t2.label,
                            },
                            t2.id,
                          );
                        }),
                      }),
                      /* @__PURE__ */ jsx("span", {
                        className: "text-[7px] font-black tracking-widest text-[#7a828c] uppercase",
                        children: "STRATEGIC SIMULATOR CURVES",
                      }),
                    ],
                  }),
                  /* @__PURE__ */ jsxs("div", {
                    onWheel: onTimelineWheel,
                    onMouseDown: onTimelineMouseDown,
                    onMouseMove: onTimelineMouseMove,
                    onMouseUp: onTimelineMouseUp,
                    onMouseLeave: onTimelineMouseUp,
                    onContextMenu,
                    className:
                      "flex-1 min-h-0 relative bg-[#030508] border border-[#1c2430] rounded-none p-2 flex flex-col justify-between shadow-[inset_0_2px_8px_rgba(0,0,0,0.9)] cursor-ew-resize timeline-graph-container",
                    children: [
                      /* @__PURE__ */ jsxs("div", {
                        className:
                          "absolute inset-0 p-2.5 pointer-events-none select-none flex flex-col justify-between font-mono text-[7px] text-[#7a828c]/25 uppercase tracking-widest border-t border-[#1c2430]/5",
                        children: [
                          /* @__PURE__ */ jsxs("div", {
                            className: "flex justify-between border-b border-[#1c2430]/10 pb-0.5",
                            children: [
                              /* @__PURE__ */ jsx("span", { children: "100% / MAX" }),
                              /* @__PURE__ */ jsx("span", { children: "ESTIMATED DOCK" }),
                            ],
                          }),
                          /* @__PURE__ */ jsxs("div", {
                            className: "flex justify-between border-b border-[#1c2430]/10 pb-0.5",
                            children: [
                              /* @__PURE__ */ jsx("span", { children: "75%" }),
                              /* @__PURE__ */ jsx("span", { children: "STINT LAP LIMIT" }),
                            ],
                          }),
                          /* @__PURE__ */ jsxs("div", {
                            className: "flex justify-between border-b border-[#1c2430]/10 pb-0.5",
                            children: [
                              /* @__PURE__ */ jsx("span", { children: "50%" }),
                              /* @__PURE__ */ jsx("span", { children: "PIT RECHARGE" }),
                            ],
                          }),
                          /* @__PURE__ */ jsxs("div", {
                            className: "flex justify-between border-b border-[#1c2430]/10 pb-0.5",
                            children: [
                              /* @__PURE__ */ jsx("span", { children: "25% / MIN" }),
                              /* @__PURE__ */ jsx("span", { children: "CRITICAL LIMIT" }),
                            ],
                          }),
                          /* @__PURE__ */ jsx("div", {
                            className: "flex justify-between font-black text-[#7a828c]/40",
                            children: Array.from({
                              length: 7,
                            }).map((_, idx) => {
                              const pct = idx / 6;
                              const currentMin = startTimeOffsetMin + pct * visibleDuration;
                              const hrs = Math.floor(currentMin / 60);
                              const mins = Math.round(currentMin % 60);
                              if (raceDurationHours >= 4 && timelineZoom < 4) {
                                if (idx === 0)
                                  return /* @__PURE__ */ jsx("span", { children: "T+0:00" }, idx);
                                if (idx === 6)
                                  return /* @__PURE__ */ jsx("span", { children: "FINISH" }, idx);
                                return /* @__PURE__ */ jsxs(
                                  "span",
                                  { children: [hrs, ":", String(mins).padStart(2, "0")] },
                                  idx,
                                );
                              } else {
                                if (idx === 0)
                                  return /* @__PURE__ */ jsx("span", { children: "T+0 MIN" }, idx);
                                return /* @__PURE__ */ jsxs(
                                  "span",
                                  { children: [hrs > 0 ? `${hrs}H ` : "", "$", mins, "M"] },
                                  idx,
                                );
                              }
                            }),
                          }),
                        ],
                      }),
                      /* @__PURE__ */ jsx("div", {
                        className: "w-full h-full relative z-10 pt-1 pb-5 px-1",
                        children: /* @__PURE__ */ jsxs("svg", {
                          viewBox: "0 0 600 120",
                          width: "100%",
                          height: "100%",
                          preserveAspectRatio: "none",
                          className: "w-full h-full block overflow-visible",
                          children: [
                            /* @__PURE__ */ jsx("line", {
                              x1: "0",
                              y1: "30",
                              x2: "600",
                              y2: "30",
                              stroke: "#1c2430",
                              strokeWidth: "0.5",
                              strokeDasharray: "2 2",
                            }),
                            /* @__PURE__ */ jsx("line", {
                              x1: "0",
                              y1: "60",
                              x2: "600",
                              y2: "60",
                              stroke: "#1c2430",
                              strokeWidth: "0.5",
                              strokeDasharray: "2 2",
                            }),
                            /* @__PURE__ */ jsx("line", {
                              x1: "0",
                              y1: "90",
                              x2: "600",
                              y2: "90",
                              stroke: "#1c2430",
                              strokeWidth: "0.5",
                              strokeDasharray: "2 2",
                            }),
                            /* @__PURE__ */ jsx("line", {
                              x1: mapX(100),
                              y1: "0",
                              x2: mapX(100),
                              y2: "120",
                              stroke: "#1c2430",
                              strokeWidth: "0.5",
                              strokeDasharray: "2 2",
                            }),
                            /* @__PURE__ */ jsx("line", {
                              x1: mapX(200),
                              y1: "0",
                              x2: mapX(200),
                              y2: "120",
                              stroke: "#1c2430",
                              strokeWidth: "0.5",
                              strokeDasharray: "2 2",
                            }),
                            /* @__PURE__ */ jsx("line", {
                              x1: mapX(300),
                              y1: "0",
                              x2: mapX(300),
                              y2: "120",
                              stroke: "#1c2430",
                              strokeWidth: "0.5",
                              strokeDasharray: "2 2",
                            }),
                            /* @__PURE__ */ jsx("line", {
                              x1: mapX(400),
                              y1: "0",
                              x2: mapX(400),
                              y2: "120",
                              stroke: "#1c2430",
                              strokeWidth: "0.5",
                              strokeDasharray: "2 2",
                            }),
                            /* @__PURE__ */ jsx("line", {
                              x1: mapX(500),
                              y1: "0",
                              x2: mapX(500),
                              y2: "120",
                              stroke: "#1c2430",
                              strokeWidth: "0.5",
                              strokeDasharray: "2 2",
                            }),
                            graphTab === "fuel" &&
                              /* @__PURE__ */ jsxs(Fragment, {
                                children: [
                                  /* @__PURE__ */ jsx("path", {
                                    d: mapPath("M 5,20 Q 75,70 138,100"),
                                    fill: "none",
                                    stroke: "#3B82F6",
                                    strokeWidth: hoveredStintIndex === 0 ? "3" : "1.8",
                                    opacity:
                                      hoveredStintIndex !== null && hoveredStintIndex !== 0
                                        ? "0.25"
                                        : "1",
                                    className: "transition-all duration-150",
                                  }),
                                  /* @__PURE__ */ jsx("path", {
                                    d: mapPath("M 140,20 Q 210,65 273,95"),
                                    fill: "none",
                                    stroke: "#3B82F6",
                                    strokeWidth: hoveredStintIndex === 1 ? "3" : "1.8",
                                    opacity:
                                      hoveredStintIndex !== null && hoveredStintIndex !== 1
                                        ? "0.25"
                                        : "1",
                                    className: "transition-all duration-150",
                                  }),
                                  /* @__PURE__ */ jsx("path", {
                                    d: mapPath("M 275,20 Q 345,72 408,102"),
                                    fill: "none",
                                    stroke: "#3B82F6",
                                    strokeWidth: hoveredStintIndex === 2 ? "3" : "1.8",
                                    opacity:
                                      hoveredStintIndex !== null && hoveredStintIndex !== 2
                                        ? "0.25"
                                        : "1",
                                    className: "transition-all duration-150",
                                  }),
                                  /* @__PURE__ */ jsx("path", {
                                    d: mapPath("M 410,20 Q 500,55 595,78"),
                                    fill: "none",
                                    stroke: "#3B82F6",
                                    strokeWidth: hoveredStintIndex === 3 ? "3" : "1.8",
                                    opacity:
                                      hoveredStintIndex !== null && hoveredStintIndex !== 3
                                        ? "0.25"
                                        : "1",
                                    className: "transition-all duration-150",
                                  }),
                                  /* @__PURE__ */ jsx("line", {
                                    x1: mapX(138),
                                    y1: "100",
                                    x2: mapX(140),
                                    y2: "20",
                                    stroke: "#FF4D4D",
                                    strokeWidth: "0.8",
                                    strokeDasharray: "2 2",
                                  }),
                                  /* @__PURE__ */ jsx("line", {
                                    x1: mapX(273),
                                    y1: "95",
                                    x2: mapX(275),
                                    y2: "20",
                                    stroke: "#FF4D4D",
                                    strokeWidth: "0.8",
                                    strokeDasharray: "2 2",
                                  }),
                                  /* @__PURE__ */ jsx("line", {
                                    x1: mapX(408),
                                    y1: "102",
                                    x2: mapX(410),
                                    y2: "20",
                                    stroke: "#FF4D4D",
                                    strokeWidth: "0.8",
                                    strokeDasharray: "2 2",
                                  }),
                                  /* @__PURE__ */ jsx("circle", {
                                    cx: mapX(138),
                                    cy: "100",
                                    r: hoveredStintIndex === 0 ? "5" : "3",
                                    fill: "#FFB800",
                                    onMouseEnter: () => setHoveredStintIndex(0),
                                    onMouseLeave: () => setHoveredStintIndex(null),
                                    className: "cursor-pointer transition-all duration-150",
                                  }),
                                  /* @__PURE__ */ jsx("circle", {
                                    cx: mapX(273),
                                    cy: "95",
                                    r: hoveredStintIndex === 1 ? "5" : "3",
                                    fill: "#FFB800",
                                    onMouseEnter: () => setHoveredStintIndex(1),
                                    onMouseLeave: () => setHoveredStintIndex(null),
                                    className: "cursor-pointer transition-all duration-150",
                                  }),
                                  /* @__PURE__ */ jsx("circle", {
                                    cx: mapX(408),
                                    cy: "102",
                                    r: hoveredStintIndex === 2 ? "5" : "3",
                                    fill: "#FFB800",
                                    onMouseEnter: () => setHoveredStintIndex(2),
                                    onMouseLeave: () => setHoveredStintIndex(null),
                                    className: "cursor-pointer transition-all duration-150",
                                  }),
                                  /* @__PURE__ */ jsx("text", {
                                    x: mapX(138),
                                    y: "111",
                                    fill: "#FFB800",
                                    fontSize: "6.5",
                                    textAnchor: "middle",
                                    fontWeight: "bold",
                                    fontFamily: "monospace",
                                    onMouseEnter: () => setHoveredStintIndex(0),
                                    onMouseLeave: () => setHoveredStintIndex(null),
                                    className: "cursor-pointer",
                                    children: "PIT",
                                  }),
                                  /* @__PURE__ */ jsx("text", {
                                    x: mapX(273),
                                    y: "106",
                                    fill: "#FFB800",
                                    fontSize: "6.5",
                                    textAnchor: "middle",
                                    fontWeight: "bold",
                                    fontFamily: "monospace",
                                    onMouseEnter: () => setHoveredStintIndex(1),
                                    onMouseLeave: () => setHoveredStintIndex(null),
                                    className: "cursor-pointer",
                                    children: "PIT",
                                  }),
                                  /* @__PURE__ */ jsx("text", {
                                    x: mapX(408),
                                    y: "113",
                                    fill: "#FFB800",
                                    fontSize: "6.5",
                                    textAnchor: "middle",
                                    fontWeight: "bold",
                                    fontFamily: "monospace",
                                    onMouseEnter: () => setHoveredStintIndex(2),
                                    onMouseLeave: () => setHoveredStintIndex(null),
                                    className: "cursor-pointer",
                                    children: "PIT",
                                  }),
                                  /* @__PURE__ */ jsx("text", {
                                    x: mapX(590),
                                    y: "72",
                                    fill: "#3B82F6",
                                    fontSize: "7.5",
                                    textAnchor: "end",
                                    fontWeight: "bold",
                                    fontFamily: "monospace",
                                    children: "24.6 L",
                                  }),
                                ],
                              }),
                            graphTab === "tyre" &&
                              /* @__PURE__ */ jsxs(Fragment, {
                                children: [
                                  /* @__PURE__ */ jsx("path", {
                                    d: mapPath("M 5,30 C 40,32 90,65 138,85"),
                                    fill: "none",
                                    stroke: "#00D17F",
                                    strokeWidth: hoveredStintIndex === 0 ? "3" : "1.8",
                                    opacity:
                                      hoveredStintIndex !== null && hoveredStintIndex !== 0
                                        ? "0.25"
                                        : "1",
                                    className: "transition-all duration-150",
                                  }),
                                  /* @__PURE__ */ jsx("path", {
                                    d: mapPath("M 140,30 C 175,32 225,60 273,78"),
                                    fill: "none",
                                    stroke: "#00D17F",
                                    strokeWidth: hoveredStintIndex === 1 ? "3" : "1.8",
                                    opacity:
                                      hoveredStintIndex !== null && hoveredStintIndex !== 1
                                        ? "0.25"
                                        : "1",
                                    className: "transition-all duration-150",
                                  }),
                                  /* @__PURE__ */ jsx("path", {
                                    d: mapPath("M 275,30 C 310,32 360,70 408,90"),
                                    fill: "none",
                                    stroke: "#00D17F",
                                    strokeWidth: hoveredStintIndex === 2 ? "3" : "1.8",
                                    opacity:
                                      hoveredStintIndex !== null && hoveredStintIndex !== 2
                                        ? "0.25"
                                        : "1",
                                    className: "transition-all duration-150",
                                  }),
                                  /* @__PURE__ */ jsx("path", {
                                    d: mapPath("M 410,30 C 460,32 530,55 595,72"),
                                    fill: "none",
                                    stroke: "#00D17F",
                                    strokeWidth: hoveredStintIndex === 3 ? "3" : "1.8",
                                    opacity:
                                      hoveredStintIndex !== null && hoveredStintIndex !== 3
                                        ? "0.25"
                                        : "1",
                                    className: "transition-all duration-150",
                                  }),
                                  /* @__PURE__ */ jsx("circle", {
                                    cx: mapX(138),
                                    cy: "85",
                                    r: "3",
                                    fill: "#00D17F",
                                  }),
                                  /* @__PURE__ */ jsx("circle", {
                                    cx: mapX(273),
                                    cy: "78",
                                    r: "3",
                                    fill: "#00D17F",
                                  }),
                                  /* @__PURE__ */ jsx("circle", {
                                    cx: mapX(408),
                                    cy: "90",
                                    r: "3",
                                    fill: "#00D17F",
                                  }),
                                  /* @__PURE__ */ jsx("text", {
                                    x: mapX(590),
                                    y: "65",
                                    fill: "#00D17F",
                                    fontSize: "7.5",
                                    textAnchor: "end",
                                    fontWeight: "bold",
                                    fontFamily: "monospace",
                                    children: "52% LIFE",
                                  }),
                                ],
                              }),
                            graphTab === "temp" &&
                              /* @__PURE__ */ jsxs(Fragment, {
                                children: [
                                  /* @__PURE__ */ jsx("path", {
                                    d: mapPath("M 5,80 Q 150,40 300,55 T 600,90"),
                                    fill: "none",
                                    stroke: "#FFB800",
                                    strokeWidth: "1.8",
                                    className: "drop-shadow-[0_0_4px_rgba(255,184,0,0.3)]",
                                  }),
                                  /* @__PURE__ */ jsx("text", {
                                    x: mapX(590),
                                    y: "102",
                                    fill: "#FFB800",
                                    fontSize: "7.5",
                                    textAnchor: "end",
                                    fontWeight: "bold",
                                    fontFamily: "monospace",
                                    children: "28.4°C",
                                  }),
                                ],
                              }),
                            graphTab === "delta" &&
                              /* @__PURE__ */ jsxs(Fragment, {
                                children: [
                                  /* @__PURE__ */ jsx("path", {
                                    d: mapPath(
                                      "M 5,50 Q 70,53 138,55 M 140,42 Q 205,45 273,46 M 275,35 Q 340,33 408,32 M 410,22 Q 500,16 595,12",
                                    ),
                                    fill: "none",
                                    stroke: "#FF4D4D",
                                    strokeWidth: "1.8",
                                    className: "drop-shadow-[0_0_4px_rgba(255,77,77,0.3)]",
                                  }),
                                  /* @__PURE__ */ jsx("text", {
                                    x: mapX(590),
                                    y: "24",
                                    fill: "#FF4D4D",
                                    fontSize: "7.5",
                                    textAnchor: "end",
                                    fontWeight: "bold",
                                    fontFamily: "monospace",
                                    children: "-12.4s (LEAD)",
                                  }),
                                ],
                              }),
                          ],
                        }),
                      }),
                    ],
                  }),
                ],
              }),
              /* @__PURE__ */ jsx("div", {
                className:
                  "bg-[#05070a] border-t border-[#1c2430] select-none rounded-none overflow-x-auto shrink-0 font-mono",
                children: /* @__PURE__ */ jsxs("table", {
                  className: "w-full text-left font-mono text-[8px] border-collapse",
                  children: [
                    /* @__PURE__ */ jsx("thead", {
                      children: /* @__PURE__ */ jsxs("tr", {
                        className:
                          "bg-[#11161d] border-b border-[#1c2430] text-[#7a828c] font-rajdhani text-[8.5px] font-bold tracking-wider uppercase",
                        children: [
                          /* @__PURE__ */ jsx("th", { className: "px-2 py-1", children: "SYS_ID" }),
                          /* @__PURE__ */ jsx("th", {
                            className: "px-2 py-1",
                            children: "TACTICAL SYSTEM OPERATIONAL CRITERION",
                          }),
                          /* @__PURE__ */ jsx("th", {
                            className: "px-2 py-1 text-right",
                            children: "ACTIVE METRIC",
                          }),
                          /* @__PURE__ */ jsx("th", {
                            className: "px-2 py-1 text-right",
                            children: "OFFSET DELTA",
                          }),
                          /* @__PURE__ */ jsx("th", {
                            className: "px-2 py-1 text-right",
                            children: "TARGET LIMIT",
                          }),
                          /* @__PURE__ */ jsx("th", {
                            className: "px-2 py-1 text-center",
                            children: "COMPLIANCE",
                          }),
                          /* @__PURE__ */ jsx("th", {
                            className: "px-2 py-1",
                            children: "TIMING STATUS COMMENTARY",
                          }),
                        ],
                      }),
                    }),
                    /* @__PURE__ */ jsxs("tbody", {
                      className: "divide-y divide-[#1c2430]/35",
                      children: [
                        /* @__PURE__ */ jsxs("tr", {
                          className: "hover:bg-[#11161d]/40 transition-colors",
                          children: [
                            /* @__PURE__ */ jsx("td", {
                              className: "px-2 py-0.8 text-[#7a828c]",
                              children: "STRAT_01",
                            }),
                            /* @__PURE__ */ jsx("td", {
                              className: "px-2 py-0.8 font-sans font-bold text-white text-[8.5px]",
                              children: "RACE PACE PROJECTION TARGET",
                            }),
                            /* @__PURE__ */ jsx("td", {
                              className: "px-2 py-0.8 text-right font-bold",
                              children: "1:45.850",
                            }),
                            /* @__PURE__ */ jsx("td", {
                              className: "px-2 py-0.8 text-right text-red-400 font-bold",
                              children: "+0.120s",
                            }),
                            /* @__PURE__ */ jsx("td", {
                              className: "px-2 py-0.8 text-right text-[#7a828c]",
                              children: "1:45.730",
                            }),
                            /* @__PURE__ */ jsx("td", {
                              className: "px-2 py-0.8 text-center",
                              children: /* @__PURE__ */ jsx("span", {
                                className:
                                  "text-[#FFB800] bg-[#FFB800]/5 border border-[#FFB800]/25 px-1 uppercase text-[6.5px] tracking-wider rounded-none font-sans font-bold",
                                children: "WARNING",
                              }),
                            }),
                            /* @__PURE__ */ jsx("td", {
                              className: "px-2 py-0.8 text-[#7a828c] truncate",
                              children: "S1 (LA SOURCE) EXCEEDING DELTA WINDOW",
                            }),
                          ],
                        }),
                        /* @__PURE__ */ jsxs("tr", {
                          className: "bg-[#0b0f14]/40 hover:bg-[#11161d]/40 transition-colors",
                          children: [
                            /* @__PURE__ */ jsx("td", {
                              className: "px-2 py-0.8 text-[#7a828c]",
                              children: "STRAT_02",
                            }),
                            /* @__PURE__ */ jsx("td", {
                              className: "px-2 py-0.8 font-sans font-bold text-white text-[8.5px]",
                              children: "FUEL BURN EFFICIENCY RATIO",
                            }),
                            /* @__PURE__ */ jsx("td", {
                              className: "px-2 py-0.8 text-right font-bold",
                              children: "2.85 L/LAP",
                            }),
                            /* @__PURE__ */ jsx("td", {
                              className: "px-2 py-0.8 text-right text-[#00D17F] font-bold",
                              children: "-0.05 L/LAP",
                            }),
                            /* @__PURE__ */ jsx("td", {
                              className: "px-2 py-0.8 text-right text-[#7a828c]",
                              children: "2.80 L/LAP",
                            }),
                            /* @__PURE__ */ jsx("td", {
                              className: "px-2 py-0.8 text-center",
                              children: /* @__PURE__ */ jsx("span", {
                                className:
                                  "text-[#00D17F] bg-[#00D17F]/5 border border-[#00D17F]/25 px-1 uppercase text-[6.5px] tracking-wider rounded-none font-sans font-bold",
                                children: "OPTIMAL",
                              }),
                            }),
                            /* @__PURE__ */ jsx("td", {
                              className: "px-2 py-0.8 text-[#7a828c] truncate",
                              children: "TARGET COMPLIANT FOR 215 LAP STINT LIMIT",
                            }),
                          ],
                        }),
                        /* @__PURE__ */ jsxs("tr", {
                          className: "hover:bg-[#11161d]/40 transition-colors",
                          children: [
                            /* @__PURE__ */ jsx("td", {
                              className: "px-2 py-0.8 text-[#7a828c]",
                              children: "STRAT_03",
                            }),
                            /* @__PURE__ */ jsx("td", {
                              className: "px-2 py-0.8 font-sans font-bold text-white text-[8.5px]",
                              children: "POTENTIAL OVERCUT STRATEGY GAIN",
                            }),
                            /* @__PURE__ */ jsx("td", {
                              className: "px-2 py-0.8 text-right font-bold text-[#00D17F]",
                              children: "+18.650s",
                            }),
                            /* @__PURE__ */ jsx("td", {
                              className: "px-2 py-0.8 text-right text-[#00D17F] font-bold",
                              children: "+3.420s",
                            }),
                            /* @__PURE__ */ jsx("td", {
                              className: "px-2 py-0.8 text-right text-[#7a828c]",
                              children: "+15.230s",
                            }),
                            /* @__PURE__ */ jsx("td", {
                              className: "px-2 py-0.8 text-center",
                              children: /* @__PURE__ */ jsx("span", {
                                className:
                                  "text-[#00D17F] bg-[#00D17F]/5 border border-[#00D17F]/25 px-1 uppercase text-[6.5px] tracking-wider rounded-none font-sans font-bold",
                                children: "OPTIMAL",
                              }),
                            }),
                            /* @__PURE__ */ jsx("td", {
                              className: "px-2 py-0.8 text-[#7a828c] truncate",
                              children: "GREEN CAUTION WINDOW PREDICTION ALIGNED",
                            }),
                          ],
                        }),
                        /* @__PURE__ */ jsxs("tr", {
                          className: "bg-[#0b0f14]/40 hover:bg-[#11161d]/40 transition-colors",
                          children: [
                            /* @__PURE__ */ jsx("td", {
                              className: "px-2 py-0.8 text-[#7a828c]",
                              children: "STRAT_04",
                            }),
                            /* @__PURE__ */ jsx("td", {
                              className: "px-2 py-0.8 font-sans font-bold text-white text-[8.5px]",
                              children: "TYRE WEAR RATIO (FRONT-LEFT)",
                            }),
                            /* @__PURE__ */ jsx("td", {
                              className: "px-2 py-0.8 text-right font-bold",
                              children: "1.65 %/LAP",
                            }),
                            /* @__PURE__ */ jsx("td", {
                              className: "px-2 py-0.8 text-right text-red-400 font-bold",
                              children: "+0.15 %/LAP",
                            }),
                            /* @__PURE__ */ jsx("td", {
                              className: "px-2 py-0.8 text-right text-[#7a828c]",
                              children: "1.50 %/LAP",
                            }),
                            /* @__PURE__ */ jsx("td", {
                              className: "px-2 py-0.8 text-center",
                              children: /* @__PURE__ */ jsx("span", {
                                className:
                                  "text-[#FF4D4D] bg-[#FF4D4D]/5 border border-red-500/25 px-1 uppercase text-[6.5px] tracking-wider rounded-none font-sans font-bold",
                                children: "CRITICAL",
                              }),
                            }),
                            /* @__PURE__ */ jsx("td", {
                              className: "px-2 py-0.8 text-[#7a828c] truncate",
                              children: "DOUBLE STINT NOT ADVISED · HIGH DEGRADATION",
                            }),
                          ],
                        }),
                        /* @__PURE__ */ jsxs("tr", {
                          className: "hover:bg-[#11161d]/40 transition-colors",
                          children: [
                            /* @__PURE__ */ jsx("td", {
                              className: "px-2 py-0.8 text-[#7a828c]",
                              children: "STRAT_05",
                            }),
                            /* @__PURE__ */ jsx("td", {
                              className: "px-2 py-0.8 font-sans font-bold text-white text-[8.5px]",
                              children: "NEXT MANDATORY PIT STOP OPEN",
                            }),
                            /* @__PURE__ */ jsx("td", {
                              className: "px-2 py-0.8 text-right font-bold",
                              children: "LAP 91-97",
                            }),
                            /* @__PURE__ */ jsx("td", {
                              className: "px-2 py-0.8 text-right text-white font-bold",
                              children: "-1.5 LAPS",
                            }),
                            /* @__PURE__ */ jsx("td", {
                              className: "px-2 py-0.8 text-right text-[#7a828c]",
                              children: "LAP 93",
                            }),
                            /* @__PURE__ */ jsx("td", {
                              className: "px-2 py-0.8 text-center",
                              children: /* @__PURE__ */ jsx("span", {
                                className:
                                  "text-[#3B82F6] bg-[#3B82F6]/5 border border-[#3B82F6]/25 px-1 uppercase text-[6.5px] tracking-wider rounded-none font-sans font-bold",
                                children: "LEGAL",
                              }),
                            }),
                            /* @__PURE__ */ jsx("td", {
                              className: "px-2 py-0.8 text-[#7a828c] truncate",
                              children: "RECHARGE ALIGNED WITH PIT WINDOW 2",
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
              }),
            ],
          }),
          /* @__PURE__ */ jsxs("section", {
            className:
              "col-span-1 bg-[#0b0f14] flex flex-col justify-start select-none overflow-hidden h-full rounded-none",
            children: [
              /* @__PURE__ */ jsxs("div", {
                className:
                  "border-b border-[#1c2430] bg-[#05070a] rounded-none font-mono text-[8px] overflow-hidden select-none",
                children: [
                  /* @__PURE__ */ jsxs("div", {
                    className:
                      "bg-[#11161d] border-b border-[#1c2430] px-2.5 py-1.5 flex items-center justify-between font-rajdhani text-[9.5px] font-bold text-white tracking-wider",
                    children: [
                      /* @__PURE__ */ jsxs("div", {
                        className: "flex items-center gap-1.5",
                        children: [
                          /* @__PURE__ */ jsx("span", {
                            className: `size-1.5 rounded-full ${teamConnected ? "bg-[#00D17F] shadow-[0_0_6px_#00D17F]" : "bg-red-500 animate-pulse shadow-[0_0_6px_rgba(239,68,68,0.7)]"}`,
                          }),
                          /* @__PURE__ */ jsx("span", { children: "ACTIVE MONITOR CHANNEL HUD" }),
                        ],
                      }),
                      /* @__PURE__ */ jsxs("div", {
                        className: "flex items-center gap-2",
                        children: [
                          /* @__PURE__ */ jsx("button", {
                            type: "button",
                            onClick: () => setShowTeamCodePanel(true),
                            className: `text-[8px] border px-1.5 py-0.5 uppercase tracking-widest font-mono font-bold transition-all rounded-none cursor-pointer ${teamCode ? "text-[#00D17F] bg-[#00D17F]/10 border-[#00D17F]/30 hover:bg-[#00D17F]/20" : "text-[#3B82F6] bg-[#3B82F6]/10 border-[#3B82F6]/30 hover:bg-[#3B82F6]/20"}`,
                            children: teamCode ? `🔗 ${teamCode}` : "+ JOIN TEAM",
                          }),
                          activeTeamTelemetry &&
                            /* @__PURE__ */ jsx("span", {
                              className:
                                "text-red-400 text-[8px] bg-red-500/10 border border-red-500/25 px-1 py-0.5 uppercase font-mono tracking-widest animate-pulse font-sans font-bold",
                              children: "LIVE",
                            }),
                        ],
                      }),
                    ],
                  }),
                  /* @__PURE__ */ jsxs("div", {
                    className:
                      "p-2 border-b border-[#1c2430]/65 space-y-1 font-sans text-[#7a828c] text-[8.5px] uppercase",
                    children: [
                      /* @__PURE__ */ jsxs("div", {
                        className: "flex justify-between items-center",
                        children: [
                          /* @__PURE__ */ jsx("span", {
                            className: "font-mono text-[#E2E4E8] font-black text-[10px]",
                            children: activeTeamTelemetry
                              ? activeTeamTelemetry.driverName
                              : "L. VANTHOOR",
                          }),
                          /* @__PURE__ */ jsx("span", {
                            className:
                              "font-mono text-white bg-[#11161d] border border-[#1c2430] px-1 rounded-none text-[8.5px]",
                            children:
                              activeTeamTelemetry &&
                              activeTeamTelemetry.carOperationalState?.sequenceId
                                ? `LAP ${activeTeamTelemetry.carOperationalState.sequenceId}`
                                : "LAP 68",
                          }),
                        ],
                      }),
                      /* @__PURE__ */ jsxs("div", {
                        className: "flex justify-between font-mono text-[7px] tracking-wider",
                        children: [
                          /* @__PURE__ */ jsx("span", {
                            children: selectedCar
                              ? selectedCar.name.toUpperCase()
                              : "PORSCHE 963 LMDH",
                          }),
                          /* @__PURE__ */ jsxs("span", {
                            className: "text-[#3B82F6] font-sans font-bold",
                            children: [
                              "WEC ",
                              selectedCar ? selectedCar.carClass : "GTP",
                              " CLASS",
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                  /* @__PURE__ */ jsxs("div", {
                    className:
                      "grid grid-cols-3 gap-0 border-b border-[#1c2430] bg-[#0b0f14] text-center font-mono",
                    children: [
                      /* @__PURE__ */ jsxs("div", {
                        className: "p-1 border-r border-[#1c2430]",
                        children: [
                          /* @__PURE__ */ jsx("span", {
                            className:
                              "text-[6.5px] text-[#7a828c] uppercase tracking-widest block leading-none font-sans font-bold",
                            children: "SPEED",
                          }),
                          /* @__PURE__ */ jsxs("span", {
                            className: "text-[9.5px] font-black text-white block mt-0.5",
                            children: [
                              activeTeamTelemetry
                                ? activeTeamTelemetry.speedKph
                                : t.connected
                                  ? t.speedKph
                                  : 243,
                              " ",
                              /* @__PURE__ */ jsx("span", {
                                className: "text-[6.5px] text-[#3B82F6]",
                                children: "KPH",
                              }),
                            ],
                          }),
                        ],
                      }),
                      /* @__PURE__ */ jsxs("div", {
                        className: "p-1 border-r border-[#1c2430]",
                        children: [
                          /* @__PURE__ */ jsx("span", {
                            className:
                              "text-[6.5px] text-[#7a828c] uppercase tracking-widest block leading-none font-sans font-bold",
                            children: "GEAR",
                          }),
                          /* @__PURE__ */ jsx("span", {
                            className: "text-[9.5px] font-black text-[#FFB800] block mt-0.5",
                            children: activeTeamTelemetry
                              ? activeTeamTelemetry.gear === 0
                                ? "N"
                                : activeTeamTelemetry.gear === -1
                                  ? "R"
                                  : activeTeamTelemetry.gear
                              : t.connected
                                ? t.gear
                                : 6,
                          }),
                        ],
                      }),
                      /* @__PURE__ */ jsxs("div", {
                        className: "p-1",
                        children: [
                          /* @__PURE__ */ jsx("span", {
                            className:
                              "text-[6.5px] text-[#7a828c] uppercase tracking-widest block leading-none font-sans font-bold",
                            children: "RPM",
                          }),
                          /* @__PURE__ */ jsx("span", {
                            className: "text-[9.5px] font-black text-red-400 block mt-0.5",
                            children: activeTeamTelemetry
                              ? activeTeamTelemetry.rpm
                              : t.connected
                                ? t.rpm
                                : 7850,
                          }),
                        ],
                      }),
                    ],
                  }),
                  /* @__PURE__ */ jsxs("div", {
                    className:
                      "space-y-1.5 p-1.5 bg-[#05070a] border-b border-[#1c2430] rounded-none font-mono text-[8px]",
                    children: [
                      /* @__PURE__ */ jsxs("div", {
                        children: [
                          /* @__PURE__ */ jsxs("div", {
                            className: "flex justify-between mb-0.5 leading-none",
                            children: [
                              /* @__PURE__ */ jsx("span", {
                                className: "text-[#00D17F] font-bold text-[7.5px]",
                                children: "THROTTLE",
                              }),
                              /* @__PURE__ */ jsx("span", {
                                className: "text-white font-bold text-[7.5px]",
                                children: t.connected ? `${(t.throttle * 100).toFixed(0)}%` : "78%",
                              }),
                            ],
                          }),
                          /* @__PURE__ */ jsx("div", {
                            className:
                              "h-1 bg-[#11161d] rounded-none overflow-hidden border border-[#1c2430]",
                            children: /* @__PURE__ */ jsx("div", {
                              className: "h-full bg-[#00D17F] rounded-none transition-all",
                              style: {
                                width: t.connected ? `${t.throttle * 100}%` : "78%",
                              },
                            }),
                          }),
                        ],
                      }),
                      /* @__PURE__ */ jsxs("div", {
                        children: [
                          /* @__PURE__ */ jsxs("div", {
                            className: "flex justify-between mb-0.5 leading-none",
                            children: [
                              /* @__PURE__ */ jsx("span", {
                                className: "text-[#FF4D4D] font-bold text-[7.5px]",
                                children: "BRAKE",
                              }),
                              /* @__PURE__ */ jsx("span", {
                                className: "text-white font-bold text-[7.5px]",
                                children: t.connected ? `${(t.brake * 100).toFixed(0)}%` : "12%",
                              }),
                            ],
                          }),
                          /* @__PURE__ */ jsx("div", {
                            className:
                              "h-1 bg-[#11161d] rounded-none overflow-hidden border border-[#1c2430]",
                            children: /* @__PURE__ */ jsx("div", {
                              className: "h-full bg-[#FF4D4D] rounded-none transition-all",
                              style: {
                                width: t.connected ? `${t.brake * 100}%` : "12%",
                              },
                            }),
                          }),
                        ],
                      }),
                    ],
                  }),
                  /* @__PURE__ */ jsxs("div", {
                    className:
                      "p-1.5 space-y-1 border-b border-[#1c2430] bg-[#05070a]/75 text-[8px]",
                    children: [
                      /* @__PURE__ */ jsxs("div", {
                        className:
                          "flex justify-between font-bold border-b border-[#1c2430]/30 pb-0.5 mb-1 text-[7px] text-[#7a828c] tracking-wider uppercase font-rajdhani",
                        children: [
                          /* @__PURE__ */ jsx("span", { children: "TRACK SECTOR" }),
                          /* @__PURE__ */ jsx("span", { children: "DURATION" }),
                          /* @__PURE__ */ jsx("span", { children: "DELTA" }),
                        ],
                      }),
                      /* @__PURE__ */ jsxs("div", {
                        className: "flex justify-between font-mono",
                        children: [
                          /* @__PURE__ */ jsx("span", {
                            className: "text-[#7a828c]",
                            children: "S1 (LA SOURCE)",
                          }),
                          /* @__PURE__ */ jsx("span", {
                            className: "text-white font-bold",
                            children: "28.451",
                          }),
                          /* @__PURE__ */ jsx("span", {
                            className: "text-red-400 font-bold font-sans",
                            children: "+0.156",
                          }),
                        ],
                      }),
                      /* @__PURE__ */ jsxs("div", {
                        className: "flex justify-between font-mono",
                        children: [
                          /* @__PURE__ */ jsx("span", {
                            className: "text-[#7a828c]",
                            children: "S2 (LES COMBES)",
                          }),
                          /* @__PURE__ */ jsx("span", {
                            className: "text-white font-bold",
                            children: "33.782",
                          }),
                          /* @__PURE__ */ jsx("span", {
                            className: "text-[#00D17F] font-bold font-sans",
                            children: "-0.203",
                          }),
                        ],
                      }),
                      /* @__PURE__ */ jsxs("div", {
                        className: "flex justify-between font-mono",
                        children: [
                          /* @__PURE__ */ jsx("span", {
                            className: "text-[#7a828c]",
                            children: "S3 (BLANCHIMONT)",
                          }),
                          /* @__PURE__ */ jsx("span", {
                            className: "text-white font-bold",
                            children: "42.779",
                          }),
                          /* @__PURE__ */ jsx("span", {
                            className: "text-red-400 font-bold font-sans",
                            children: "+0.089",
                          }),
                        ],
                      }),
                    ],
                  }),
                  /* @__PURE__ */ jsxs("div", {
                    className: "p-1.5 font-mono text-[8px] space-y-0.5 bg-[#05070a]",
                    children: [
                      /* @__PURE__ */ jsxs("div", {
                        className: "flex justify-between",
                        children: [
                          /* @__PURE__ */ jsx("span", {
                            className: "text-[#7a828c] font-rajdhani text-[8.5px]",
                            children: "LAST LAP TIME:",
                          }),
                          /* @__PURE__ */ jsx("span", {
                            className: "text-white font-bold",
                            children: activeTeamTelemetry
                              ? activeTeamTelemetry.lastLap
                              : "1:46.012",
                          }),
                        ],
                      }),
                      /* @__PURE__ */ jsxs("div", {
                        className: "flex justify-between",
                        children: [
                          /* @__PURE__ */ jsx("span", {
                            className: "text-[#7a828c] font-rajdhani text-[8.5px]",
                            children: "BEST LAP TIME:",
                          }),
                          /* @__PURE__ */ jsx("span", {
                            className: "text-[#00D17F] font-bold",
                            children: activeTeamTelemetry
                              ? activeTeamTelemetry.bestLap
                              : "1:45.234",
                          }),
                        ],
                      }),
                      /* @__PURE__ */ jsxs("div", {
                        className:
                          "flex justify-between border-t border-[#1c2430]/30 pt-0.5 mt-0.5",
                        children: [
                          /* @__PURE__ */ jsx("span", {
                            className: "text-[#7a828c] font-rajdhani text-[8.5px]",
                            children: "LEADER DELTA:",
                          }),
                          /* @__PURE__ */ jsx("span", {
                            className: "text-red-400 font-bold font-mono tracking-widest italic",
                            children:
                              activeTeamTelemetry && activeTeamTelemetry.deltaSec
                                ? `+${activeTeamTelemetry.deltaSec.toFixed(3)}s`
                                : "+0.842s",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              /* @__PURE__ */ jsxs("div", {
                className:
                  "p-2 bg-[#05070a] border-b border-[#1c2430] rounded-none flex flex-col items-center justify-center",
                children: [
                  /* @__PURE__ */ jsxs("div", {
                    className:
                      "w-full flex items-center justify-between border-b border-[#1c2430]/35 pb-1 mb-1.5 text-[7.5px] font-bold text-[#7a828c] font-rajdhani",
                    children: [
                      /* @__PURE__ */ jsx("span", {
                        className: "uppercase",
                        children: "GP CIRCUIT TACTICAL MAP",
                      }),
                      /* @__PURE__ */ jsx("span", {
                        className:
                          "text-right text-[#FFB800] uppercase tracking-widest font-mono text-[6.5px]",
                        children: "TRAFFIC WINDOW: +4.2s (CLEAR)",
                      }),
                    ],
                  }),
                  /* @__PURE__ */ jsxs("svg", {
                    width: "200",
                    height: "85",
                    viewBox: "0 0 260 110",
                    className: "overflow-visible select-none",
                    children: [
                      /* @__PURE__ */ jsx("path", {
                        d: "M 50,75 L 45,70 L 48,55 L 65,40 L 95,35",
                        fill: "none",
                        stroke: "#475569",
                        strokeWidth: "2.5",
                        strokeLinecap: "round",
                        strokeLinejoin: "round",
                      }),
                      /* @__PURE__ */ jsx("path", {
                        d: "M 95,35 L 140,35 L 175,45 L 195,58 L 220,60",
                        fill: "none",
                        stroke: "#334155",
                        strokeWidth: "2.5",
                        strokeLinecap: "round",
                        strokeLinejoin: "round",
                      }),
                      /* @__PURE__ */ jsx("path", {
                        d: "M 220,60 L 235,55 L 250,68 L 240,80 L 225,82 L 205,75 L 175,95 L 155,90 L 125,75 L 105,80 L 80,72 L 65,85 Z",
                        fill: "none",
                        stroke: "#1e293b",
                        strokeWidth: "2.5",
                        strokeLinecap: "round",
                        strokeLinejoin: "round",
                      }),
                      /* @__PURE__ */ jsx("path", {
                        d: "M 50,75 L 45,70 L 48,55 L 65,40 L 95,35 L 140,35 L 175,45 L 195,58 L 220,60 L 235,55 L 250,68 L 240,80 L 225,82 L 205,75 L 175,95 L 155,90 L 125,75 L 105,80 L 80,72 L 65,85 Z",
                        fill: "none",
                        stroke: "#3B82F6",
                        strokeWidth: "1.2",
                        strokeLinecap: "round",
                        strokeLinejoin: "round",
                      }),
                      /* @__PURE__ */ jsx("path", {
                        d: "M 50,75 L 58,58 L 65,40",
                        fill: "none",
                        stroke: "#FF4D4D",
                        strokeWidth: "2",
                        strokeDasharray: "2 2",
                      }),
                      /* @__PURE__ */ jsx("path", {
                        d: "M 140,35 L 175,45 L 195,58",
                        fill: "none",
                        stroke: "#FFB800",
                        strokeWidth: "3.5",
                        strokeDasharray: "1 1",
                        opacity: "0.8",
                      }),
                      /* @__PURE__ */ jsx("circle", {
                        r: "3",
                        fill: "#FF4D4D",
                        children: /* @__PURE__ */ jsx("animateMotion", {
                          path: "M 50,75 L 45,70 L 48,55 L 65,40 L 95,35 L 140,35 L 175,45 L 195,58 L 220,60 L 235,55 L 250,68 L 240,80 L 225,82 L 205,75 L 175,95 L 155,90 L 125,75 L 105,80 L 80,72 L 65,85 Z",
                          dur: "20s",
                          repeatCount: "indefinite",
                        }),
                      }),
                      /* @__PURE__ */ jsx("text", {
                        x: "32",
                        y: "85",
                        fill: "#7a828c",
                        fontSize: "5.5",
                        fontFamily: "monospace",
                        fontWeight: "bold",
                        children: "LA SOURCE (S1)",
                      }),
                      /* @__PURE__ */ jsx("text", {
                        x: "32",
                        y: "48",
                        fill: "#7a828c",
                        fontSize: "5.5",
                        fontFamily: "monospace",
                        fontWeight: "bold",
                        children: "EAU ROUGE",
                      }),
                      /* @__PURE__ */ jsx("text", {
                        x: "110",
                        y: "27",
                        fill: "#7a828c",
                        fontSize: "5.5",
                        fontFamily: "monospace",
                        fontWeight: "bold",
                        textAnchor: "middle",
                        children: "KEMMEL STR.",
                      }),
                      /* @__PURE__ */ jsx("text", {
                        x: "180",
                        y: "32",
                        fill: "#FFB800",
                        fontSize: "5.5",
                        fontFamily: "monospace",
                        fontWeight: "bold",
                        children: "LES COMBES (FCY)",
                      }),
                      /* @__PURE__ */ jsx("text", {
                        x: "245",
                        y: "50",
                        fill: "#7a828c",
                        fontSize: "5.5",
                        fontFamily: "monospace",
                        fontWeight: "bold",
                        children: "POUHON (S2)",
                      }),
                      /* @__PURE__ */ jsx("text", {
                        x: "188",
                        y: "103",
                        fill: "#7a828c",
                        fontSize: "5.5",
                        fontFamily: "monospace",
                        fontWeight: "bold",
                        children: "BLANCHIMONT",
                      }),
                      /* @__PURE__ */ jsx("text", {
                        x: "100",
                        y: "93",
                        fill: "#7a828c",
                        fontSize: "5.5",
                        fontFamily: "monospace",
                        fontWeight: "bold",
                        children: "BUS STOP (S3)",
                      }),
                      /* @__PURE__ */ jsx("text", {
                        x: "70",
                        y: "60",
                        fill: "#FF4D4D",
                        fontSize: "5",
                        fontFamily: "monospace",
                        fontWeight: "bold",
                        children: "PIT_MERGE",
                      }),
                    ],
                  }),
                ],
              }),
              /* @__PURE__ */ jsxs("div", {
                className:
                  "p-2 bg-[#05070a] rounded-none font-mono text-[8px] space-y-2 flex-1 overflow-y-auto scrollbar-hide",
                children: [
                  /* @__PURE__ */ jsx("span", {
                    className:
                      "text-[7.5px] text-[#7a828c] uppercase font-bold border-b border-[#1c2430]/25 pb-1 mb-1 block font-rajdhani",
                    children: "LIVE CHANNELS STREAM TRACES",
                  }),
                  /* @__PURE__ */ jsxs("div", {
                    className: "flex items-center justify-between",
                    children: [
                      /* @__PURE__ */ jsx("span", {
                        className:
                          "text-[#7a828c] uppercase font-bold w-12 shrink-0 text-[7px] font-rajdhani",
                        children: "SPEED",
                      }),
                      /* @__PURE__ */ jsx(Sparkline, { data: sparkData.speed, color: "#3B82F6" }),
                      /* @__PURE__ */ jsxs("span", {
                        className: "text-white font-bold font-mono w-14 text-right",
                        children: [
                          activeTeamTelemetry
                            ? activeTeamTelemetry.speedKph
                            : t.connected
                              ? t.speedKph
                              : 243,
                          " km/h",
                        ],
                      }),
                    ],
                  }),
                  /* @__PURE__ */ jsxs("div", {
                    className: "flex items-center justify-between",
                    children: [
                      /* @__PURE__ */ jsx("span", {
                        className:
                          "text-[#00D17F] uppercase font-bold w-12 shrink-0 text-[7px] font-rajdhani",
                        children: "THROTTLE",
                      }),
                      /* @__PURE__ */ jsx(Sparkline, {
                        data: sparkData.throttle,
                        color: "#00D17F",
                      }),
                      /* @__PURE__ */ jsx("span", {
                        className: "text-white font-bold font-mono w-14 text-right",
                        children: t.connected ? `${(t.throttle * 100).toFixed(0)}%` : "78%",
                      }),
                    ],
                  }),
                  /* @__PURE__ */ jsxs("div", {
                    className: "flex items-center justify-between",
                    children: [
                      /* @__PURE__ */ jsx("span", {
                        className:
                          "text-[#FF4D4D] uppercase font-bold w-12 shrink-0 text-[7px] font-rajdhani",
                        children: "BRAKE",
                      }),
                      /* @__PURE__ */ jsx(Sparkline, { data: sparkData.brake, color: "#FF4D4D" }),
                      /* @__PURE__ */ jsx("span", {
                        className: "text-white font-bold font-mono w-14 text-right",
                        children: t.connected ? `${(t.brake * 100).toFixed(0)}%` : "12%",
                      }),
                    ],
                  }),
                  /* @__PURE__ */ jsxs("div", {
                    className: "flex items-center justify-between",
                    children: [
                      /* @__PURE__ */ jsx("span", {
                        className:
                          "text-[#7a828c] uppercase font-bold w-12 shrink-0 text-[7px] font-rajdhani",
                        children: "RPM",
                      }),
                      /* @__PURE__ */ jsx(Sparkline, { data: sparkData.rpm, color: "#FFB800" }),
                      /* @__PURE__ */ jsxs("span", {
                        className: "text-white font-bold font-mono w-14 text-right",
                        children: [
                          activeTeamTelemetry
                            ? activeTeamTelemetry.rpm
                            : t.connected
                              ? t.rpm
                              : 7850,
                          " rpm",
                        ],
                      }),
                    ],
                  }),
                  /* @__PURE__ */ jsxs("div", {
                    className: "flex items-center justify-between",
                    children: [
                      /* @__PURE__ */ jsx("span", {
                        className:
                          "text-[#7a828c] uppercase font-bold w-12 shrink-0 text-[7px] font-rajdhani",
                        children: "FUEL",
                      }),
                      /* @__PURE__ */ jsx(Sparkline, { data: sparkData.fuel, color: "#8B5CF6" }),
                      /* @__PURE__ */ jsxs("span", {
                        className: "text-white font-bold font-mono w-14 text-right",
                        children: [
                          activeTeamTelemetry
                            ? activeTeamTelemetry.fuelRemainingL.toFixed(1)
                            : t.connected
                              ? t.fuelRemainingL.toFixed(1)
                              : "54.2",
                          " L",
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      /* @__PURE__ */ jsxs("footer", {
        className:
          "grid grid-cols-5 gap-0 bg-[#0b0f14] relative z-10 shrink-0 select-none rounded-none",
        children: [
          /* @__PURE__ */ jsxs("div", {
            className:
              "p-2.5 border-r border-[#1c2430] font-mono text-[8.5px] space-y-1.5 flex flex-col justify-between rounded-none",
            children: [
              /* @__PURE__ */ jsxs("span", {
                className:
                  "text-[7.5px] font-black text-[#7a828c] uppercase tracking-widest border-b border-[#1c2430]/40 pb-0.5 flex items-center gap-1.5",
                children: [
                  /* @__PURE__ */ jsx("span", { className: "size-1 bg-[#00D17F] rounded-full" }),
                  "6 TEAM STATUS",
                ],
              }),
              /* @__PURE__ */ jsxs("div", {
                className: "grid grid-cols-2 gap-1.5 text-[#7a828c] pt-0.5",
                children: [
                  /* @__PURE__ */ jsxs("div", {
                    children: [
                      /* @__PURE__ */ jsx("span", {
                        className: "block uppercase text-[6.5px] text-[#7a828c] font-bold",
                        children: "TRACK TEMP",
                      }),
                      /* @__PURE__ */ jsx("span", {
                        className: "text-white font-bold font-mono text-[10px]",
                        children: "28.4 °C",
                      }),
                    ],
                  }),
                  /* @__PURE__ */ jsxs("div", {
                    children: [
                      /* @__PURE__ */ jsx("span", {
                        className: "block uppercase text-[6.5px] text-[#7a828c] font-bold",
                        children: "AIR TEMP",
                      }),
                      /* @__PURE__ */ jsx("span", {
                        className: "text-white font-bold font-mono text-[10px]",
                        children: "22.1 °C",
                      }),
                    ],
                  }),
                  /* @__PURE__ */ jsxs("div", {
                    children: [
                      /* @__PURE__ */ jsx("span", {
                        className: "block uppercase text-[6.5px] text-[#7a828c] font-bold",
                        children: "HUMIDITY",
                      }),
                      /* @__PURE__ */ jsx("span", {
                        className: "text-white font-bold font-mono text-[10px]",
                        children: "45%",
                      }),
                    ],
                  }),
                  /* @__PURE__ */ jsxs("div", {
                    children: [
                      /* @__PURE__ */ jsx("span", {
                        className: "block uppercase text-[6.5px] text-[#7a828c] font-bold",
                        children: "WIND VEL",
                      }),
                      /* @__PURE__ */ jsx("span", {
                        className: "text-white font-bold font-mono text-[10px]",
                        children: "6.2 km/h",
                      }),
                    ],
                  }),
                ],
              }),
              /* @__PURE__ */ jsxs("div", {
                className:
                  "pt-1.5 border-t border-[#1c2430]/40 flex justify-between items-center text-[7px] font-bold",
                children: [
                  /* @__PURE__ */ jsx("span", {
                    className: "text-[#7a828c] uppercase",
                    children: "TRACK GRIP",
                  }),
                  /* @__PURE__ */ jsx("span", {
                    className: "text-[#00D17F] font-black uppercase",
                    children: "HIGH",
                  }),
                ],
              }),
            ],
          }),
          /* @__PURE__ */ jsxs("div", {
            className:
              "p-2.5 border-r border-[#1c2430] font-mono text-[8.5px] flex flex-col justify-between rounded-none",
            children: [
              /* @__PURE__ */ jsx("span", {
                className:
                  "text-[7.5px] font-black text-[#7a828c] uppercase tracking-widest border-b border-[#1c2430]/40 pb-0.5",
                children: "DRIVER ROSTER QUICK STATUS",
              }),
              /* @__PURE__ */ jsx("div", {
                className: "space-y-1 py-0.5",
                children: drivers.map((d) => {
                  const indicator =
                    d.status === "Driving"
                      ? "bg-red-400"
                      : d.status === "Available"
                        ? "bg-[#00D17F]"
                        : d.status === "In Garage"
                          ? "bg-[#3B82F6]"
                          : "bg-[#FFB800]";
                  return /* @__PURE__ */ jsxs(
                    "div",
                    {
                      className: "flex items-center justify-between text-[#E2E4E8] leading-none",
                      children: [
                        /* @__PURE__ */ jsxs("div", {
                          className: "flex items-center gap-1.5",
                          children: [
                            /* @__PURE__ */ jsx("span", {
                              className: `w-1.5 h-1.5 rounded-full ${indicator}`,
                            }),
                            /* @__PURE__ */ jsx("span", {
                              className: "uppercase text-[8.5px]",
                              children: d.name,
                            }),
                          ],
                        }),
                        /* @__PURE__ */ jsx("span", {
                          className: "text-[#7a828c] text-[7.5px] uppercase",
                          children: d.status || "Available",
                        }),
                      ],
                    },
                    d.id,
                  );
                }),
              }),
            ],
          }),
          /* @__PURE__ */ jsxs("div", {
            className:
              "p-2.5 border-r border-[#1c2430] font-mono text-[8.5px] flex flex-col justify-between rounded-none",
            children: [
              /* @__PURE__ */ jsx("span", {
                className:
                  "text-[7.5px] font-black text-[#7a828c] uppercase tracking-widest border-b border-[#1c2430]/40 pb-0.5 font-rajdhani",
                children: "PROBABILISTIC FAILURE & RISK MODEL",
              }),
              /* @__PURE__ */ jsxs("div", {
                className: "flex items-center gap-3 py-0.5 flex-1 min-h-0",
                children: [
                  /* @__PURE__ */ jsxs("svg", {
                    width: "80",
                    height: "30",
                    viewBox: "0 0 110 40",
                    className: "overflow-visible opacity-75 shrink-0",
                    children: [
                      /* @__PURE__ */ jsx("path", {
                        d: "M 5,28 L 22,28 A 6,6 0 0,1 34,28 L 65,28 A 6,6 0 0,1 77,28 L 96,28 L 98,22 L 92,20 L 92,10 L 72,12 L 56,12 L 42,16 L 24,18 L 10,24 Z",
                        fill: "none",
                        stroke: "#00D17F",
                        strokeWidth: "1.2",
                      }),
                      /* @__PURE__ */ jsx("circle", {
                        cx: "28",
                        cy: "28",
                        r: "5",
                        fill: "none",
                        stroke: "#00D17F",
                        strokeWidth: "1",
                      }),
                      /* @__PURE__ */ jsx("circle", {
                        cx: "28",
                        cy: "28",
                        r: "2",
                        fill: "#00D17F",
                      }),
                      /* @__PURE__ */ jsx("circle", {
                        cx: "71",
                        cy: "28",
                        r: "5",
                        fill: "none",
                        stroke: "#00D17F",
                        strokeWidth: "1",
                      }),
                      /* @__PURE__ */ jsx("circle", {
                        cx: "71",
                        cy: "28",
                        r: "2",
                        fill: "#00D17F",
                      }),
                      /* @__PURE__ */ jsx("line", {
                        x1: "90",
                        y1: "10",
                        x2: "98",
                        y2: "10",
                        stroke: "#00D17F",
                        strokeWidth: "1.5",
                      }),
                      /* @__PURE__ */ jsx("line", {
                        x1: "94",
                        y1: "10",
                        x2: "94",
                        y2: "20",
                        stroke: "#00D17F",
                        strokeWidth: "0.8",
                      }),
                    ],
                  }),
                  /* @__PURE__ */ jsxs("div", {
                    className: "grid grid-cols-1 gap-x-0 gap-y-0.5 text-[7px] leading-none flex-1",
                    children: [
                      /* @__PURE__ */ jsxs("div", {
                        className: "flex justify-between",
                        children: [
                          /* @__PURE__ */ jsx("span", { children: "PUNCTURE PROB" }),
                          /* @__PURE__ */ jsx("span", {
                            className: "text-[#00D17F] font-bold",
                            children: "8.2% [NOMINAL]",
                          }),
                        ],
                      }),
                      /* @__PURE__ */ jsxs("div", {
                        className: "flex justify-between",
                        children: [
                          /* @__PURE__ */ jsx("span", { children: "BRAKE THERMAL" }),
                          /* @__PURE__ */ jsx("span", {
                            className: "text-[#00D17F] font-bold",
                            children: "640°C [LIMIT 680]",
                          }),
                        ],
                      }),
                      /* @__PURE__ */ jsxs("div", {
                        className: "flex justify-between",
                        children: [
                          /* @__PURE__ */ jsx("span", { children: "HYBRID REGEN DEFICIT" }),
                          /* @__PURE__ */ jsx("span", {
                            className: "text-white font-bold",
                            children: "-0.12 kW",
                          }),
                        ],
                      }),
                      /* @__PURE__ */ jsxs("div", {
                        className: "flex justify-between",
                        children: [
                          /* @__PURE__ */ jsx("span", { children: "OVERHEAT COEFF" }),
                          /* @__PURE__ */ jsx("span", {
                            className: "text-[#00D17F] font-bold",
                            children: "0.14 [NOMINAL]",
                          }),
                        ],
                      }),
                      /* @__PURE__ */ jsxs("div", {
                        className: "flex justify-between",
                        children: [
                          /* @__PURE__ */ jsx("span", { children: "TYRE SLIP LIMIT" }),
                          /* @__PURE__ */ jsx("span", {
                            className: "text-[#FFB800] font-bold",
                            children: "1.05 [WARNING]",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          /* @__PURE__ */ jsxs("div", {
            className:
              "p-2.5 border-r border-[#1c2430] font-mono text-[8.5px] flex flex-col justify-between rounded-none",
            children: [
              /* @__PURE__ */ jsx("span", {
                className:
                  "text-[7.5px] font-black text-[#7a828c] uppercase tracking-widest border-b border-[#1c2430]/40 pb-0.5 font-rajdhani",
                children: "ENGINEERING MESSAGES LOG",
              }),
              /* @__PURE__ */ jsxs("div", {
                className:
                  "space-y-0.5 py-0.5 max-h-12 overflow-y-auto scrollbar-hide text-[#7a828c] text-[7.5px] leading-none select-none",
                children: [
                  /* @__PURE__ */ jsxs("div", {
                    onClick: () => handleAnomalyClick("temp", 3),
                    className:
                      "cursor-pointer hover:bg-[#11161d] hover:text-[#FFB800] p-0.5 transition-all flex justify-between",
                    title: "Click to jump to Stint 4 Track Temp",
                    children: [
                      /* @__PURE__ */ jsxs("span", {
                        children: [
                          /* @__PURE__ */ jsx("span", {
                            className: "text-white",
                            children: "14:32:15",
                          }),
                          " TRACK TEMP RISING +1.2°C",
                        ],
                      }),
                      /* @__PURE__ */ jsx("span", {
                        className:
                          "text-[6px] border border-[#FFB800]/30 px-1 font-bold text-[#FFB800] rounded-none font-rajdhani",
                        children: "ANOMALY",
                      }),
                    ],
                  }),
                  /* @__PURE__ */ jsxs("div", {
                    onClick: () => handleAnomalyClick("pit", 1),
                    className:
                      "cursor-pointer hover:bg-[#11161d] hover:text-[#3B82F6] p-0.5 transition-all flex justify-between",
                    title: "Click to jump to Stint 2 Fuel curve",
                    children: [
                      /* @__PURE__ */ jsxs("span", {
                        children: [
                          /* @__PURE__ */ jsx("span", {
                            className: "text-[#3B82F6]",
                            children: "14:31:48",
                          }),
                          " CAR #7 ENTERED PITS",
                        ],
                      }),
                      /* @__PURE__ */ jsx("span", {
                        className:
                          "text-[6px] border border-[#3B82F6]/30 px-1 font-bold text-[#3B82F6] rounded-none font-rajdhani",
                        children: "PIT_BOX",
                      }),
                    ],
                  }),
                  /* @__PURE__ */ jsxs("div", {
                    onClick: () => handleAnomalyClick("caution", 2),
                    className:
                      "cursor-pointer hover:bg-[#11161d] hover:text-[#FF4D4D] p-0.5 transition-all flex justify-between",
                    title: "Click to jump to Stint 3 Delta timeline",
                    children: [
                      /* @__PURE__ */ jsxs("span", {
                        children: [
                          /* @__PURE__ */ jsx("span", {
                            className: "text-[#FFB800]",
                            children: "14:30:22",
                          }),
                          " YELLOW FLAG SECTOR 2 T7",
                        ],
                      }),
                      /* @__PURE__ */ jsx("span", {
                        className:
                          "text-[6px] border border-red-500/30 px-1 font-bold text-[#FF4D4D] rounded-none font-rajdhani",
                        children: "CAUTION",
                      }),
                    ],
                  }),
                  /* @__PURE__ */ jsxs("div", {
                    onClick: () => handleAnomalyClick("green", 0),
                    className:
                      "cursor-pointer hover:bg-[#11161d] hover:text-[#00D17F] p-0.5 transition-all flex justify-between",
                    title: "Click to jump to Stint 1 Tyre Life",
                    children: [
                      /* @__PURE__ */ jsxs("span", {
                        children: [
                          /* @__PURE__ */ jsx("span", {
                            className: "text-[#00D17F]",
                            children: "14:28:11",
                          }),
                          " GREEN FLAG RESOLVED - SPA OK",
                        ],
                      }),
                      /* @__PURE__ */ jsx("span", {
                        className:
                          "text-[6px] border border-[#00D17F]/30 px-1 font-bold text-[#00D17F] rounded-none font-rajdhani",
                        children: "RESOLVED",
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          /* @__PURE__ */ jsxs("div", {
            className:
              "p-2.5 font-mono text-[8.5px] flex items-stretch gap-2.5 bg-[#05070a]/50 select-none rounded-none",
            children: [
              /* @__PURE__ */ jsx("div", {
                className:
                  "w-10 bg-[#11161d] border border-[#1c2430] rounded-none overflow-hidden shrink-0 flex items-center justify-center",
                children: /* @__PURE__ */ jsx("img", {
                  src: "/images/coach-avatar.png",
                  alt: "AI Coach",
                  className: "w-full h-full object-cover",
                }),
              }),
              /* @__PURE__ */ jsxs("div", {
                className: "flex-1 flex flex-col justify-between min-w-0 leading-tight",
                children: [
                  /* @__PURE__ */ jsxs("div", {
                    children: [
                      /* @__PURE__ */ jsx("span", {
                        className:
                          "text-[#FFB800] font-black uppercase text-[7.5px] tracking-widest block mb-0.5",
                        children: "AI PIT WALL COACH",
                      }),
                      /* @__PURE__ */ jsx("p", {
                        className:
                          "text-[7px] text-[#7a828c] uppercase leading-none font-sans line-clamp-2",
                        children:
                          '"Good pace from Laurens. front tyres are in optimal temperature windows. next stint keep managing fuel. push to speak"',
                      }),
                    ],
                  }),
                  /* @__PURE__ */ jsx("button", {
                    className:
                      "w-full py-0.5 bg-[#FFB800]/10 hover:bg-[#FFB800]/20 border border-[#FFB800]/30 text-[#FFB800] text-[7.5px] font-black uppercase tracking-widest rounded-none transition-all cursor-pointer",
                    children: "PUSH TO SPEAKER",
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      /* @__PURE__ */ jsxs(Fragment, {
        children: [
          showTeamCodePanel &&
            /* @__PURE__ */ jsx("div", {
              className:
                "fixed inset-0 bg-[#05070A]/85 backdrop-blur-sm z-[100] flex items-center justify-center p-4",
              children: /* @__PURE__ */ jsxs("div", {
                className:
                  "w-full max-w-sm bg-[#0b0f14] border border-[#1c2430] rounded-none p-5 relative shadow-2xl",
                children: [
                  /* @__PURE__ */ jsx("button", {
                    type: "button",
                    onClick: () => setShowTeamCodePanel(false),
                    className:
                      "absolute top-4 right-4 p-1 hover:bg-[#11161d] border border-transparent hover:border-[#1c2430] rounded-none text-[#7a828c] hover:text-white transition-all cursor-pointer",
                    children: /* @__PURE__ */ jsx(X, { className: "w-4 h-4" }),
                  }),
                  /* @__PURE__ */ jsx("h3", {
                    className:
                      "text-xs font-black uppercase tracking-widest text-[#E2E4E8] mb-4 border-b border-[#1c2430] pb-2",
                    children: "TEAM CHANNEL CONNECTION",
                  }),
                  /* @__PURE__ */ jsx("div", {
                    className: "space-y-4",
                    children: teamCode
                      ? /* @__PURE__ */ jsxs("div", {
                          className: "space-y-3.5",
                          children: [
                            /* @__PURE__ */ jsxs("div", {
                              className:
                                "p-3 bg-[#00D17F]/5 border border-[#00D17F]/30 text-center font-mono",
                              children: [
                                /* @__PURE__ */ jsx("span", {
                                  className:
                                    "text-[7.5px] font-bold text-[#7a828c] uppercase tracking-widest block mb-1",
                                  children: "ACTIVE CHANNEL",
                                }),
                                /* @__PURE__ */ jsx("span", {
                                  className:
                                    "text-white text-sm font-black tracking-widest block font-orbitron",
                                  children: teamCode,
                                }),
                                /* @__PURE__ */ jsx("span", {
                                  className:
                                    "text-[7px] text-[#00D17F] font-bold uppercase tracking-wider block mt-2",
                                  children: teamConnected
                                    ? "● SECURELY SUBSCRIBED TO REALTIME RELAY"
                                    : "○ SUBMITTING TO RELAY CHANNEL...",
                                }),
                              ],
                            }),
                            /* @__PURE__ */ jsxs("div", {
                              className:
                                "text-[8px] text-[#7a828c] uppercase leading-relaxed font-sans text-center",
                              children: [
                                "Drivers must place the pre-filled ",
                                /* @__PURE__ */ jsx("code", {
                                  className: "text-[#FFB800] font-mono font-bold",
                                  children: ".env",
                                }),
                                " in their bridge directory and run ",
                                /* @__PURE__ */ jsx("code", {
                                  className: "text-[#FFB800] font-mono font-bold",
                                  children: "npm start",
                                }),
                                " to publish telemetry.",
                              ],
                            }),
                            /* @__PURE__ */ jsx("button", {
                              type: "button",
                              onClick: () => {
                                setTeamCode("");
                                setTeamCodeInput("");
                                setShowTeamCodePanel(false);
                              },
                              className:
                                "w-full py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/35 text-red-400 font-black uppercase tracking-widest text-[9px] rounded-none transition-all cursor-pointer",
                              children: "DISCONNECT / LEAVE CHANNEL",
                            }),
                          ],
                        })
                      : /* @__PURE__ */ jsxs("form", {
                          onSubmit: (e) => {
                            e.preventDefault();
                            if (teamCodeInput.trim()) {
                              setTeamCode(teamCodeInput.trim().toUpperCase());
                              setShowTeamCodePanel(false);
                            }
                          },
                          className: "space-y-4",
                          children: [
                            /* @__PURE__ */ jsxs("div", {
                              className: "flex flex-col gap-1.5",
                              children: [
                                /* @__PURE__ */ jsx("label", {
                                  htmlFor: "team-code-input",
                                  className:
                                    "text-[8px] font-black text-[#7a828c] uppercase tracking-widest pl-0.5",
                                  children: "TEAM CODE SEQUENCE",
                                }),
                                /* @__PURE__ */ jsx("input", {
                                  id: "team-code-input",
                                  type: "text",
                                  value: teamCodeInput,
                                  onChange: (e) => setTeamCodeInput(e.target.value),
                                  className:
                                    "w-full bg-[#05070a] border border-[#1c2430] rounded-none px-3 py-2 text-xs font-mono font-bold text-[#E2E4E8] focus:border-[#3B82F6] focus:outline-none uppercase",
                                  placeholder: "PITWALL-XXXX",
                                }),
                              ],
                            }),
                            /* @__PURE__ */ jsxs("div", {
                              className: "grid grid-cols-2 gap-3",
                              children: [
                                /* @__PURE__ */ jsx("button", {
                                  type: "button",
                                  onClick: generateTeamCode,
                                  className:
                                    "py-2 bg-[#FFB800]/10 hover:bg-[#FFB800]/20 border border-[#FFB800]/35 text-[#FFB800] font-black uppercase tracking-widest text-[8.5px] rounded-none transition-all cursor-pointer",
                                  children: "✦ GENERATE CODE",
                                }),
                                /* @__PURE__ */ jsx("button", {
                                  type: "submit",
                                  className:
                                    "py-2 bg-[#3B82F6]/10 hover:bg-[#3B82F6]/20 border border-[#3B82F6]/35 text-[#3B82F6] font-black uppercase tracking-widest text-[8.5px] rounded-none transition-all cursor-pointer",
                                  children: "JOIN CHANNEL",
                                }),
                              ],
                            }),
                          ],
                        }),
                  }),
                ],
              }),
            }),
          isAddCarOpen &&
            /* @__PURE__ */ jsx("div", {
              className:
                "fixed inset-0 bg-[#05070A]/85 backdrop-blur-sm z-[100] flex items-center justify-center p-4",
              children: /* @__PURE__ */ jsxs("div", {
                className:
                  "w-full max-w-sm bg-[#0b0f14] border border-[#1c2430] rounded-none p-5 relative shadow-2xl",
                children: [
                  /* @__PURE__ */ jsx("button", {
                    onClick: () => setIsAddCarOpen(false),
                    className:
                      "absolute top-4 right-4 p-1 hover:bg-[#11161d] border border-transparent hover:border-[#1c2430] rounded-none text-[#7a828c] hover:text-white transition-all cursor-pointer",
                    children: /* @__PURE__ */ jsx(X, { className: "w-4 h-4" }),
                  }),
                  /* @__PURE__ */ jsx("h3", {
                    className:
                      "text-xs font-black uppercase tracking-widest text-[#E2E4E8] mb-4 border-b border-[#1c2430] pb-2",
                    children: "ADD ACTIVE VEHICLE",
                  }),
                  /* @__PURE__ */ jsxs("form", {
                    onSubmit: handleAddCar,
                    className: "space-y-4",
                    children: [
                      /* @__PURE__ */ jsxs("div", {
                        className: "flex flex-col gap-1.5",
                        children: [
                          /* @__PURE__ */ jsx("label", {
                            htmlFor: "car-name",
                            className:
                              "text-[8px] font-black text-[#7a828c] uppercase tracking-widest pl-0.5",
                            children: "CAR MODEL VECTOR",
                          }),
                          /* @__PURE__ */ jsx("input", {
                            id: "car-name",
                            type: "text",
                            value: newCar.name,
                            onChange: (e) =>
                              setNewCar((prev) => ({
                                ...prev,
                                name: e.target.value,
                              })),
                            className:
                              "w-full bg-[#05070a] border border-[#1c2430] rounded-none px-3 py-2 text-xs font-mono font-bold text-[#E2E4E8] focus:border-[#3B82F6] focus:outline-none",
                            placeholder: "PORSCHE 963",
                          }),
                        ],
                      }),
                      /* @__PURE__ */ jsxs("div", {
                        className: "grid grid-cols-2 gap-4",
                        children: [
                          /* @__PURE__ */ jsxs("div", {
                            className: "flex flex-col gap-1.5",
                            children: [
                              /* @__PURE__ */ jsx("label", {
                                htmlFor: "car-num",
                                className:
                                  "text-[8px] font-black text-[#7a828c] uppercase tracking-widest pl-0.5",
                                children: "VEHICLE NO",
                              }),
                              /* @__PURE__ */ jsx("input", {
                                id: "car-num",
                                type: "text",
                                value: newCar.number,
                                onChange: (e) =>
                                  setNewCar((prev) => ({
                                    ...prev,
                                    number: e.target.value,
                                  })),
                                className:
                                  "w-full bg-[#05070a] border border-[#1c2430] rounded-none px-3 py-2 text-xs font-mono font-bold text-[#E2E4E8] focus:border-[#3B82F6] focus:outline-none",
                                placeholder: "7",
                              }),
                            ],
                          }),
                          /* @__PURE__ */ jsxs("div", {
                            className: "flex flex-col gap-1.5",
                            children: [
                              /* @__PURE__ */ jsx("label", {
                                htmlFor: "car-cls",
                                className:
                                  "text-[8px] font-black text-[#7a828c] uppercase tracking-widest pl-0.5",
                                children: "CLASS",
                              }),
                              /* @__PURE__ */ jsxs("select", {
                                id: "car-cls",
                                value: newCar.carClass,
                                onChange: (e) =>
                                  setNewCar((prev) => ({
                                    ...prev,
                                    carClass: e.target.value,
                                  })),
                                className:
                                  "w-full bg-[#05070a] border border-[#1c2430] rounded-none px-3 py-2 text-xs font-mono font-bold text-[#E2E4E8] focus:border-[#3B82F6] focus:outline-none",
                                children: [
                                  /* @__PURE__ */ jsx("option", { value: "GT3", children: "GT3" }),
                                  /* @__PURE__ */ jsx("option", { value: "GTP", children: "GTP" }),
                                  /* @__PURE__ */ jsx("option", {
                                    value: "LMP2",
                                    children: "LMP2",
                                  }),
                                ],
                              }),
                            ],
                          }),
                        ],
                      }),
                      /* @__PURE__ */ jsx("button", {
                        type: "submit",
                        className:
                          "w-full py-2 bg-[#3B82F6]/10 hover:bg-[#3B82F6]/20 border border-[#3B82F6]/35 text-[#3B82F6] font-black uppercase tracking-widest text-[9px] rounded-none transition-all cursor-pointer mt-2",
                        children: "CONFIRM FLEET LINK",
                      }),
                    ],
                  }),
                ],
              }),
            }),
          isAddDriverOpen &&
            /* @__PURE__ */ jsx("div", {
              className:
                "fixed inset-0 bg-[#05070A]/85 backdrop-blur-sm z-[100] flex items-center justify-center p-4",
              children: /* @__PURE__ */ jsxs("div", {
                className:
                  "w-full max-w-sm bg-[#0b0f14] border border-[#1c2430] rounded-none p-5 relative shadow-2xl",
                children: [
                  /* @__PURE__ */ jsx("button", {
                    onClick: () => setIsAddDriverOpen(false),
                    className:
                      "absolute top-4 right-4 p-1 hover:bg-[#11161d] border border-transparent hover:border-[#1c2430] rounded-none text-[#7a828c] hover:text-white transition-all cursor-pointer",
                    children: /* @__PURE__ */ jsx(X, { className: "w-4 h-4" }),
                  }),
                  /* @__PURE__ */ jsx("h3", {
                    className:
                      "text-xs font-black uppercase tracking-widest text-[#E2E4E8] mb-4 border-b border-[#1c2430] pb-2",
                    children: "ADD TEAM DRIVER",
                  }),
                  /* @__PURE__ */ jsxs("form", {
                    onSubmit: handleAddDriver,
                    className: "space-y-4",
                    children: [
                      /* @__PURE__ */ jsxs("div", {
                        className: "flex flex-col gap-1.5",
                        children: [
                          /* @__PURE__ */ jsx("label", {
                            htmlFor: "drv-name",
                            className:
                              "text-[8px] font-black text-[#7a828c] uppercase tracking-widest pl-0.5",
                            children: "FULL DIRECTIVE NAME",
                          }),
                          /* @__PURE__ */ jsx("input", {
                            id: "drv-name",
                            type: "text",
                            value: newDriver.name,
                            onChange: (e) =>
                              setNewDriver((prev) => ({
                                ...prev,
                                name: e.target.value,
                              })),
                            className:
                              "w-full bg-[#05070a] border border-[#1c2430] rounded-none px-3 py-2 text-xs font-mono font-bold text-[#E2E4E8] focus:border-[#3B82F6] focus:outline-none",
                            placeholder: "LAURENS VANTHOOR",
                          }),
                        ],
                      }),
                      /* @__PURE__ */ jsxs("div", {
                        className: "grid grid-cols-2 gap-4",
                        children: [
                          /* @__PURE__ */ jsxs("div", {
                            className: "flex flex-col gap-1.5",
                            children: [
                              /* @__PURE__ */ jsx("label", {
                                htmlFor: "drv-short",
                                className:
                                  "text-[8px] font-black text-[#7a828c] uppercase tracking-widest pl-0.5",
                                children: "3-LETTER SIG",
                              }),
                              /* @__PURE__ */ jsx("input", {
                                id: "drv-short",
                                type: "text",
                                value: newDriver.shortName,
                                onChange: (e) =>
                                  setNewDriver((prev) => ({
                                    ...prev,
                                    shortName: e.target.value,
                                  })),
                                className:
                                  "w-full bg-[#05070a] border border-[#1c2430] rounded-none px-3 py-2 text-xs font-mono font-bold text-[#E2E4E8] focus:border-[#3B82F6] focus:outline-none",
                                placeholder: "VAN",
                              }),
                            ],
                          }),
                          /* @__PURE__ */ jsxs("div", {
                            className: "flex flex-col gap-1.5",
                            children: [
                              /* @__PURE__ */ jsx("label", {
                                htmlFor: "drv-color",
                                className:
                                  "text-[8px] font-black text-[#7a828c] uppercase tracking-widest pl-0.5",
                                children: "SIGNATURE COLOR",
                              }),
                              /* @__PURE__ */ jsx("input", {
                                id: "drv-color",
                                type: "color",
                                value: newDriver.color,
                                onChange: (e) =>
                                  setNewDriver((prev) => ({
                                    ...prev,
                                    color: e.target.value,
                                  })),
                                className:
                                  "w-full bg-[#05070a] border border-[#1c2430] rounded-none h-8 p-0 cursor-pointer",
                              }),
                            ],
                          }),
                        ],
                      }),
                      /* @__PURE__ */ jsx("button", {
                        type: "submit",
                        className:
                          "w-full py-2 bg-[#3B82F6]/10 hover:bg-[#3B82F6]/20 border border-[#3B82F6]/35 text-[#3B82F6] font-black uppercase tracking-widest text-[9px] rounded-none transition-all cursor-pointer mt-2",
                        children: "CONFIRM ROSTER ADDITION",
                      }),
                    ],
                  }),
                ],
              }),
            }),
        ],
      }),
    ],
  });
}
export { TeamPage as component };
