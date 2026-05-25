import type { IbtParsed, IbtChannel, IbtLap } from "@/lib/ibt/types";
import type { RecordingDoc, RecordingDocV1, RecordingDocV2 } from "@/lib/liveRecorder";

/**
 * Adapter: turn a .pwlap recording into an IbtParsed structure so the full
 * Workbench (StackedTraces, TrackMap, GG, Cinema, AI Coach, …) can analyze
 * it just like a real .ibt file.
 *
 * Handles v2 column-oriented docs (current) and v1 row-oriented docs (legacy).
 */

function statsOf(data: Float32Array) {
  let min = Infinity,
    max = -Infinity,
    sum = 0,
    n = 0;
  for (let i = 0; i < data.length; i++) {
    const v = data[i];
    if (!Number.isFinite(v)) continue;
    if (v < min) min = v;
    if (v > max) max = v;
    sum += v;
    n++;
  }
  return {
    min: isFinite(min) ? min : 0,
    max: isFinite(max) ? max : 0,
    avg: n ? sum / n : 0,
  };
}

function channelFromArray(
  name: string,
  unit: string,
  group: string,
  desc: string,
  arr: ArrayLike<number>,
): IbtChannel {
  const data = new Float32Array(arr.length);
  for (let i = 0; i < arr.length; i++) data[i] = arr[i];
  const { min, max, avg } = statsOf(data);
  return { name, unit, desc, type: 4, data, min, max, avg, group };
}

function inferGroup(name: string): string {
  const n = name.toLowerCase();
  if (/(throttle|brake|clutch|steer|handbrake|driver)/.test(n)) return "Driver Inputs";
  if (/(speed|velocity|accel|yaw|pitch|roll|gear|rpm|enginerpm|track)/.test(n)) return "Vehicle";
  if (/(fuel|engine|oil|water|coolant|mgu|battery|kers|drs|boost|manifold)/.test(n))
    return "Engine";
  if (
    /(tire|tyre|temp|press|carcass|tread|wear|cf|cm|cl|lf|rf|lr|rr)/.test(n) &&
    /(temp|press|wear|tread|cold|carcass)/.test(n)
  )
    return "Tires";
  if (/(shock|spring|ride|damper|susp|arb|height|defl)/.test(n)) return "Suspension";
  if (/(session|lap|race|incident|flag|pit|track|surface|sector)/.test(n)) return "Session";
  if (/(weather|wind|air|track(temp|surface|wetness|usage)|humidity|skies|fog|precip)/.test(n))
    return "Environment";
  if (/(cpu|fps|frame|gpu|mem|latency|ping)/.test(n)) return "System";
  return "Other";
}

function parsedFromV2(doc: RecordingDocV2): IbtParsed {
  const numTicks = doc.t.length;
  const channels: Record<string, IbtChannel> = {};

  for (const [name, col] of Object.entries(doc.channels)) {
    // Standardize group names to match IBT groups
    const grp = inferGroup(name) || col.group;
    channels[name] = channelFromArray(name, col.unit, grp, name, col.data);
  }

  // Synthetic timing channels the workbench leans on.
  const sessionTime = new Float32Array(numTicks);
  for (let i = 0; i < numTicks; i++) sessionTime[i] = doc.t[i];
  channels["SessionTime"] = {
    name: "SessionTime",
    unit: "s",
    desc: "Session time",
    type: 4,
    data: sessionTime,
    min: 0,
    max: doc.durationS,
    avg: doc.durationS / 2,
    group: "Timing",
  };
  if (!channels["LapDistPct"]) {
    const lapDistPct = new Float32Array(numTicks);
    for (let i = 0; i < numTicks; i++) lapDistPct[i] = numTicks > 1 ? i / (numTicks - 1) : 0;
    channels["LapDistPct"] = {
      name: "LapDistPct",
      unit: "",
      desc: "Lap distance (synthetic)",
      type: 4,
      data: lapDistPct,
      min: 0,
      max: 1,
      avg: 0.5,
      group: "Timing",
    };
  }

  // Reconstruct trackXY if velocity and yaw are present
  let trackXY: IbtParsed["trackXY"] | undefined;
  const vxCh = channels["VelocityX"];
  const vyCh = channels["VelocityY"];
  const yawCh = channels["Yaw"] || channels["YawNorth"];

  if (vxCh && vyCh && yawCh && numTicks > 1) {
    const x = new Float32Array(numTicks);
    const y = new Float32Array(numTicks);
    let px = 0,
      py = 0;
    const tickRate = doc.sampleRate || 60;
    const dt = 1 / Math.max(1, tickRate);
    let minX = 0,
      maxX = 0,
      minY = 0,
      maxY = 0;
    for (let t = 0; t < numTicks; t++) {
      const yaw = yawCh.data[t];
      const vx = vxCh.data[t];
      const vy = vyCh.data[t];
      const cs = Math.cos(yaw),
        sn = Math.sin(yaw);
      const wx = vx * cs - vy * sn;
      const wy = vx * sn + vy * cs;
      px += wx * dt;
      py += wy * dt;
      x[t] = px;
      y[t] = py;
      if (px < minX) minX = px;
      else if (px > maxX) maxX = px;
      if (py < minY) minY = py;
      else if (py > maxY) maxY = py;
    }
    trackXY = { x, y, minX, maxX, minY, maxY };
  }

  // Parse laps from the Lap channel if present, otherwise fallback to single stint lap
  let laps: IbtLap[] = [];
  const lapCh = channels["Lap"];
  if (lapCh && numTicks > 0) {
    let curLap = lapCh.data[0];
    let curStart = 0;
    for (let t = 1; t < numTicks; t++) {
      const v = lapCh.data[t];
      if (v !== curLap) {
        laps.push({
          lap: curLap,
          startTick: curStart,
          endTick: t - 1,
          timeS: sessionTime[t - 1] - sessionTime[curStart],
        });
        curLap = v;
        curStart = t;
      }
    }
    laps.push({
      lap: curLap,
      startTick: curStart,
      endTick: numTicks - 1,
      timeS: sessionTime[numTicks - 1] - sessionTime[curStart],
    });
  } else {
    laps =
      numTicks > 0
        ? [{ lap: 1, startTick: 0, endTick: numTicks - 1, timeS: doc.bestLapS ?? doc.durationS }]
        : [];
  }

  return {
    meta: {
      ver: 2,
      tickRate: doc.sampleRate || 60,
      numVars: Object.keys(channels).length,
      numTicks,
      durationS: doc.durationS,
      bufLen: 0,
      trackName: doc.track,
      trackDisplayName: doc.track,
      carName: doc.car,
      driverName: undefined,
      recordedAt: doc.startedAt,
      bestLapS: doc.bestLapS ?? undefined,
      sessionInfoYaml: undefined,
    },
    channels,
    channelNames: Object.keys(channels),
    laps,
    trackXY,
  };
}

function parsedFromV1(doc: RecordingDocV1): IbtParsed {
  // Convert v1 row samples to columns, then reuse v2 path.
  const t = doc.samples.map((s) => s.t);
  const v2: RecordingDocV2 = {
    version: 2,
    format: "pwlap",
    track: doc.track,
    car: doc.car,
    startedAt: doc.startedAt,
    durationS: doc.durationS,
    sampleRate: doc.sampleRate,
    bestLapS: doc.bestLapS,
    source: doc.source,
    t,
    channels: {
      Speed: { unit: "m/s", group: "Velocity", data: doc.samples.map((s) => s.spd / 3.6) },
      SpeedKph: { unit: "kph", group: "Velocity", data: doc.samples.map((s) => s.spd) },
      RPM: { unit: "rpm", group: "Engine", data: doc.samples.map((s) => s.rpm) },
      Gear: { unit: "", group: "Engine", data: doc.samples.map((s) => s.gear) },
      Throttle: { unit: "%", group: "Driver", data: doc.samples.map((s) => s.thr) },
      Brake: { unit: "%", group: "Driver", data: doc.samples.map((s) => s.brk) },
      Clutch: { unit: "%", group: "Driver", data: doc.samples.map((s) => s.clu) },
      SteeringWheelAngle: {
        unit: "rad",
        group: "Driver",
        data: doc.samples.map((s) => (s.str * Math.PI) / 180),
      },
      LatAccel: { unit: "m/s^2", group: "Forces", data: doc.samples.map((s) => s.gLat * 9.81) },
      LongAccel: { unit: "m/s^2", group: "Forces", data: doc.samples.map((s) => s.gLon * 9.81) },
      FuelLevel: { unit: "L", group: "Fuel", data: doc.samples.map((s) => s.fuel) },
      LapDelta: { unit: "s", group: "Timing", data: doc.samples.map((s) => s.delta) },
    },
  };
  return parsedFromV2(v2);
}

export function pwlapToParsed(doc: RecordingDoc): IbtParsed {
  if (doc.version === 2) return parsedFromV2(doc);
  return parsedFromV1(doc);
}

export function isPwlapPath(pathOrName?: string | null): boolean {
  if (!pathOrName) return false;
  return pathOrName.toLowerCase().endsWith(".pwlap");
}
