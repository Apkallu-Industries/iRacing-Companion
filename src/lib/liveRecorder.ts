import { useCallback, useEffect, useRef, useState } from "react";
import type { Telemetry } from "./telemetry-types";
import { supabase } from "@/integrations/supabase/client";
import { recordTelemetrySessionMeta } from "./history.functions";

/**
 * Pit Wall live recording format ("pwlap"):
 *   v2 (current) — column-oriented capture of every numeric channel the
 *                  bridge exposes. Mirrors how iRacing's .ibt is laid out
 *                  (one Float32 column per channel) so we can grow the
 *                  channel list without breaking the workbench.
 *   v1 (legacy)  — slim row-oriented samples, still readable by the adapter.
 *
 * Channels captured today:
 *   timing  : SessionTime, LapDelta, LapDistPct (synthetic if absent)
 *   driver  : Throttle, Brake, Clutch, SteeringWheelAngle
 *   engine  : RPM, Gear, Speed (m/s), SpeedKph
 *   forces  : LatAccel, LongAccel
 *   fuel    : FuelLevel, FuelLapsRemaining
 *   tires   : LFTempCM/RFTempCM/LRTempCM/RRTempCM,
 *             LFPressure/RF/LR/RR, LFwearPct/.../RRwearPct
 *   weather : AirTemp, TrackTempCrew
 *   network : Latency
 *   setup   : dcBrakeBias
 *   + anything in Telemetry.extras (bridge passthrough)
 */
const SAMPLE_HZ = 60;
const MAX_DURATION_S = 60 * 60 * 4; // 4 h hard cap so a forgotten recording can't OOM the tab

export interface ChannelColumn {
  unit: string;
  group: string;
  data: number[];
}

export interface RecordingDocV2 {
  version: 2;
  format: "pwlap";
  track: string;
  car: string;
  startedAt: string;
  durationS: number;
  sampleRate: number;
  bestLapS: number | null;
  source: "live" | "simulated";
  /** Wall-clock seconds since recording start, one entry per sample. */
  t: number[];
  /** Column-oriented channels: `channels[name].data[i]` is the value at sample i. */
  channels: Record<string, ChannelColumn>;
}

/* ────────────────────────────────────────────────────── back-compat v1 */
export interface RecordingSampleV1 {
  t: number;
  spd: number;
  rpm: number;
  gear: number;
  thr: number;
  brk: number;
  clu: number;
  str: number;
  gLat: number;
  gLon: number;
  fuel: number;
  delta: number;
}
export interface RecordingDocV1 {
  version: 1;
  format: "pwlap";
  track: string;
  car: string;
  startedAt: string;
  durationS: number;
  sampleRate: number;
  bestLapS: number | null;
  source: "live" | "simulated";
  samples: RecordingSampleV1[];
}

export type RecordingDoc = RecordingDocV2 | RecordingDocV1;
/** v1 row sample alias kept for older imports. */
export type RecordingSample = RecordingSampleV1;

export type RecorderState = "idle" | "recording" | "saving";

/* ─────────────────────────────────────────────────── channel definitions */

type Pick = (t: Telemetry) => number;
interface ChannelDef {
  name: string;
  unit: string;
  group: string;
  pick: Pick;
}

const STATIC_CHANNELS: ChannelDef[] = [
  // Engine / velocity
  { name: "Speed", unit: "m/s", group: "Velocity", pick: (t) => t.speedKph / 3.6 },
  { name: "SpeedKph", unit: "kph", group: "Velocity", pick: (t) => t.speedKph },
  { name: "RPM", unit: "rpm", group: "Engine", pick: (t) => t.rpm },
  { name: "Gear", unit: "", group: "Engine", pick: (t) => t.gear },
  // Driver
  { name: "Throttle", unit: "%", group: "Driver", pick: (t) => t.throttle },
  { name: "Brake", unit: "%", group: "Driver", pick: (t) => t.brake },
  { name: "Clutch", unit: "%", group: "Driver", pick: (t) => t.clutch },
  {
    name: "SteeringWheelAngle",
    unit: "rad",
    group: "Driver",
    pick: (t) => (t.steeringDeg * Math.PI) / 180,
  },
  { name: "SteeringDeg", unit: "deg", group: "Driver", pick: (t) => t.steeringDeg },
  // Forces
  { name: "LatAccel", unit: "m/s^2", group: "Forces", pick: (t) => t.gLat * 9.81 },
  { name: "LongAccel", unit: "m/s^2", group: "Forces", pick: (t) => t.gLon * 9.81 },
  // Fuel
  { name: "FuelLevel", unit: "L", group: "Fuel", pick: (t) => t.fuelRemainingL },
  { name: "FuelLapsRemaining", unit: "", group: "Fuel", pick: (t) => t.lapsEstimated },
  // Timing
  { name: "LapDelta", unit: "s", group: "Timing", pick: (t) => t.deltaSec },
  // Tires — temps, pressures, wear
  { name: "LFTempCM", unit: "C", group: "Tires", pick: (t) => t.tires.fl.tempC },
  { name: "RFTempCM", unit: "C", group: "Tires", pick: (t) => t.tires.fr.tempC },
  { name: "LRTempCM", unit: "C", group: "Tires", pick: (t) => t.tires.rl.tempC },
  { name: "RRTempCM", unit: "C", group: "Tires", pick: (t) => t.tires.rr.tempC },
  { name: "LFpressure", unit: "bar", group: "Tires", pick: (t) => t.tires.fl.pressureBar },
  { name: "RFpressure", unit: "bar", group: "Tires", pick: (t) => t.tires.fr.pressureBar },
  { name: "LRpressure", unit: "bar", group: "Tires", pick: (t) => t.tires.rl.pressureBar },
  { name: "RRpressure", unit: "bar", group: "Tires", pick: (t) => t.tires.rr.pressureBar },
  { name: "LFwearPct", unit: "%", group: "Tires", pick: (t) => t.tires.fl.wearPct },
  { name: "RFwearPct", unit: "%", group: "Tires", pick: (t) => t.tires.fr.wearPct },
  { name: "LRwearPct", unit: "%", group: "Tires", pick: (t) => t.tires.rl.wearPct },
  { name: "RRwearPct", unit: "%", group: "Tires", pick: (t) => t.tires.rr.wearPct },
  // Weather / car setup live
  { name: "AirTemp", unit: "C", group: "Weather", pick: (t) => t.airTempC },
  { name: "TrackTempCrew", unit: "C", group: "Weather", pick: (t) => t.trackTempC },
  { name: "dcBrakeBias", unit: "%", group: "Setup", pick: (t) => t.brakeBias },
  // Network
  { name: "Latency", unit: "ms", group: "Network", pick: (t) => t.latencyMs },
];

const STATIC_CHANNEL_NAMES = new Set(STATIC_CHANNELS.map((d) => d.name));

function emptyStore(): Record<string, ChannelColumn> {
  const out: Record<string, ChannelColumn> = {};
  for (const def of STATIC_CHANNELS) {
    out[def.name] = { unit: def.unit, group: def.group, data: [] };
  }
  return out;
}

function pushSample(
  store: Record<string, ChannelColumn>,
  tSec: number,
  ts: number[],
  snap: Telemetry,
) {
  ts.push(+tSec.toFixed(4));
  for (const def of STATIC_CHANNELS) {
    store[def.name].data.push(+def.pick(snap).toFixed(4));
  }
  // Bridge passthrough — any extra numeric channel the bridge ships.
  if (snap.extras) {
    for (const [k, v] of Object.entries(snap.extras)) {
      if (typeof v !== "number" || !isFinite(v)) continue;

      // Skip if this channel is already captured as a static channel (O(1) Set lookup)
      if (STATIC_CHANNEL_NAMES.has(k)) continue;

      let col = store[k];
      if (!col) {
        // Backfill missing samples with NaN so all columns stay aligned.
        col = { unit: "", group: "Bridge", data: new Array(ts.length - 1).fill(NaN) };
        store[k] = col;
      }
      col.data.push(+v.toFixed(4));
    }
    // Any known bridge column that wasn't supplied this tick also gets NaN.
    for (const [name, col] of Object.entries(store)) {
      if (col.group === "Bridge" && col.data.length < ts.length) col.data.push(NaN);
    }
  }
}

export function useLiveRecorder(t: Telemetry) {
  const [state, setState] = useState<RecorderState>("idle");
  const [sampleCount, setSampleCount] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const channels = useRef<Record<string, ChannelColumn>>(emptyStore());
  const tColumn = useRef<number[]>([]);
  const startedAt = useRef<number>(0);
  const lastSample = useRef<number>(0);

  const tRef = useRef(t);
  useEffect(() => {
    tRef.current = t;
  }, [t]);

  useEffect(() => {
    if (state !== "recording") return;
    const id = setInterval(() => {
      const now = performance.now();
      if (now - lastSample.current < 1000 / SAMPLE_HZ - 2) return;
      lastSample.current = now;
      const sec = (now - startedAt.current) / 1000;
      if (sec > MAX_DURATION_S) {
        setState("idle");
        return;
      }
      pushSample(channels.current, sec, tColumn.current, tRef.current);
      setSampleCount(tColumn.current.length);
      setElapsed(sec);
    }, 1000 / SAMPLE_HZ);
    return () => clearInterval(id);
  }, [state]);

  const start = useCallback(() => {
    channels.current = emptyStore();
    tColumn.current = [];
    startedAt.current = performance.now();
    lastSample.current = 0;
    setSampleCount(0);
    setElapsed(0);
    setState("recording");
  }, []);

  const stop = useCallback(() => setState("idle"), []);
  const reset = useCallback(() => {
    channels.current = emptyStore();
    tColumn.current = [];
    setSampleCount(0);
    setElapsed(0);
    setState("idle");
  }, []);

  const save = useCallback(
    async (userId: string | null) => {
      if (tColumn.current.length === 0) throw new Error("Nothing recorded yet");
      setState("saving");
      try {
        const snap = tRef.current;
        const doc: RecordingDocV2 = {
          version: 2,
          format: "pwlap",
          track: snap.track || "Unknown",
          car: snap.car || "Unknown",
          startedAt: new Date(Date.now() - elapsed * 1000).toISOString(),
          durationS: +elapsed.toFixed(2),
          sampleRate: SAMPLE_HZ,
          bestLapS: parseLap(snap.bestLap),
          source: snap.source,
          t: tColumn.current,
          channels: channels.current,
        };
        const json = JSON.stringify(doc);
        const blob = new Blob([json], { type: "application/json" });
        const filename = `${doc.track}-${doc.car}-${Date.now()}.pwlap`.replace(/[^\w.\-]+/g, "_");

        // Always download for instant guest value.
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        if (!userId) {
          return { sessionId: null as string | null, filename, blob };
        }

        const path = `${userId}/${crypto.randomUUID()}-${filename}`;
        const { error: upErr } = await supabase.storage
          .from("telemetry")
          .upload(path, blob, { contentType: "application/json", upsert: false });
        if (upErr) throw upErr;

        // Offload database insertion to the backend Server Function.
        // This natively commits metadata to MongoDB, saves the full telemetry JSON doc locally in MongoDB,
        // and pushes to Supabase fallback reliably.
        const res = await recordTelemetrySessionMeta({
          data: {
            name: filename,
            track: doc.track,
            car: doc.car,
            duration_s: doc.durationS,
            lap_count: 0,
            tick_rate: SAMPLE_HZ,
            num_vars: Object.keys(doc.channels).length,
            file_size: blob.size,
            best_lap_s: doc.bestLapS,
            storage_path: path,
            recorded_at: doc.startedAt,
            fullDoc: doc, // Pass full telemetry payload for local MongoDB zero-latency storage!
          },
        });

        if (!res.ok) throw new Error(res.error || "Failed inserting session metadata");
        return { sessionId: res.id, filename, blob };
      } finally {
        setState("idle");
      }
    },
    [elapsed],
  );

  return {
    state,
    sampleCount,
    elapsed,
    channelCount: Object.keys(channels.current).length,
    start,
    stop,
    reset,
    save,
  };
}

function parseLap(s: string | undefined | null): number | null {
  if (!s) return null;
  const m = /^(\d+):(\d+(?:\.\d+)?)$/.exec(s);
  if (!m) return null;
  return parseInt(m[1], 10) * 60 + parseFloat(m[2]);
}
