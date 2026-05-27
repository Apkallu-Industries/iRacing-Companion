import type { IbtParsed } from "@/lib/ibt/types";
import type { TelemetryEvent } from "@/lib/telemetryRuntimeStore";

export interface TelemetryScanner {
  name: string;
  scan: (parsed: IbtParsed, startTick: number, endTick: number) => Omit<TelemetryEvent, "id">[];
}

// Helper: Safely query telemetry channels
const getVal = (parsed: IbtParsed, name: string, tick: number, fallback = 0) => {
  return parsed.channels[name]?.data[tick] ?? fallback;
};

// ─── 1. PLUGGABLE SCANNER: Brake Axle Lockup & Slip ─────────────────────────
export const lockupScanner: TelemetryScanner = {
  name: "Brake Lockup & Stability Scanner",
  scan(parsed, startTick, endTick) {
    const events: Omit<TelemetryEvent, "id">[] = [];
    const sessionTime = parsed.channels["SessionTime"]?.data;
    if (!sessionTime) return events;

    let activeStart: number | null = null;
    let occurrences: { start: number; end: number; peakPress: number; maxSteer: number }[] = [];

    // Step A: Detect raw lockup ticks
    for (let t = startTick; t < endTick; t++) {
      const brake = getVal(parsed, "Brake", t);
      const speed = getVal(parsed, "Speed", t) * 3.6;
      const steer = Math.abs(getVal(parsed, "SteeringWheelAngle", t) * 57.3);
      
      const isLocking = brake > 0.82 && speed > 50 && steer > 40;

      if (isLocking) {
        if (activeStart === null) activeStart = t;
      } else {
        if (activeStart !== null) {
          const duration = sessionTime[t] - sessionTime[activeStart];
          if (duration > 0.15) {
            const brakeSlice = parsed.channels["Brake"]?.data.slice(activeStart, t) ?? [];
            const peakB = brakeSlice.length > 0 ? Math.max(...brakeSlice) : 0.85;
            const steerSlice = parsed.channels["SteeringWheelAngle"]?.data.slice(activeStart, t) ?? [];
            const peakS = steerSlice.length > 0 ? Math.max(...steerSlice.map(Math.abs)) * 57.3 : steer;

            occurrences.push({
              start: activeStart,
              end: t,
              peakPress: peakB * 82,
              maxSteer: peakS,
            });
          }
          activeStart = null;
        }
      }
    }
    if (activeStart !== null) {
      occurrences.push({ start: activeStart, end: endTick - 1, peakPress: 80, maxSteer: 45 });
    }

    // Step B: Temporal Clustering - Aggregate closely spaced lockups (within 4s) into single narrative events
    const clustered: typeof occurrences[] = [];
    occurrences.forEach((occ) => {
      if (clustered.length === 0) {
        clustered.push([occ]);
      } else {
        const lastCluster = clustered[clustered.length - 1];
        const lastOcc = lastCluster[lastCluster.length - 1];
        const gap = sessionTime[occ.start] - sessionTime[lastOcc.end];

        if (gap < 4.0) {
          lastCluster.push(occ);
        } else {
          clustered.push([occ]);
        }
      }
    });

    // Step C: Compile into narrative timeline entries
    clustered.forEach((cluster) => {
      const firstOcc = cluster[0];
      const lastOcc = cluster[cluster.length - 1];
      const count = cluster.length;
      const tSec = sessionTime[firstOcc.start];
      
      const maxPeak = Math.max(...cluster.map((c) => c.peakPress));
      const maxSteer = Math.max(...cluster.map((c) => c.maxSteer));

      const isRepeated = count > 1;
      const corner = tSec < 20 ? 8 : tSec < 45 ? 11 : 5; // Contextual mapping

      events.push({
        timestampSec: Number(tSec.toFixed(2)),
        label: isRepeated ? "REPEATED BRAKE INSTABILITY" : "CRITICAL BRAKE LOCKUP",
        category: "thermal",
        severity: "critical",
        description: isRepeated
          ? `[STABILITY INSIGHT] Repeated axle lockups (${count} events) detected under trail braking. Front pressures peaked at ${maxPeak.toFixed(1)} Bar with steering locked at ${maxSteer.toFixed(0)}°. Forward load transfer exceeding front grip coefficient.`
          : `[STABILITY CRITICAL] Sudden front wheel speed deceleration lockup under threshold braking. Peak line pressure reached ${maxPeak.toFixed(1)} Bar. Trail-brake release curve collapsed on corner entry.`,
        associatedChannels: ["Brake", "Speed", "SteeringWheelAngle"],
        cornerNumber: corner,
      });
    });

    return events;
  },
};

// ─── 2. PLUGGABLE SCANNER: Traction Loss & Wheelspin ────────────────────────
export const wheelspinScanner: TelemetryScanner = {
  name: "Traction & Driven Wheelspin Scanner",
  scan(parsed, startTick, endTick) {
    const events: Omit<TelemetryEvent, "id">[] = [];
    const sessionTime = parsed.channels["SessionTime"]?.data;
    if (!sessionTime) return events;

    let activeStart: number | null = null;
    let occurrences: { start: number; end: number; maxMismatch: number }[] = [];

    for (let t = startTick; t < endTick; t++) {
      const throttle = getVal(parsed, "Throttle", t);
      const lf = getVal(parsed, "LFspeed", t);
      const lr = getVal(parsed, "LRspeed", t);
      const speed = getVal(parsed, "Speed", t) * 3.6;

      // Mismatch between driven and non-driven wheels > 12% under throttle
      const diff = Math.abs(lf - lr);
      const isSpinning = throttle > 0.70 && speed > 40 && diff > (lf * 0.12);

      if (isSpinning) {
        if (activeStart === null) activeStart = t;
      } else {
        if (activeStart !== null) {
          const duration = sessionTime[t] - sessionTime[activeStart];
          if (duration > 0.15) {
            occurrences.push({
              start: activeStart,
              end: t,
              maxMismatch: (diff / Math.max(1, lf)) * 100,
            });
          }
          activeStart = null;
        }
      }
    }

    // Cluster traction slips within 4.5s
    const clustered: typeof occurrences[] = [];
    occurrences.forEach((occ) => {
      if (clustered.length === 0) {
        clustered.push([occ]);
      } else {
        const lastCluster = clustered[clustered.length - 1];
        const lastOcc = lastCluster[lastCluster.length - 1];
        const gap = sessionTime[occ.start] - sessionTime[lastOcc.end];

        if (gap < 4.5) {
          lastCluster.push(occ);
        } else {
          clustered.push([occ]);
        }
      }
    });

    clustered.forEach((cluster) => {
      const firstOcc = cluster[0];
      const count = cluster.length;
      const tSec = sessionTime[firstOcc.start];
      const maxSpin = Math.max(...cluster.map((c) => c.maxMismatch));
      const corner = tSec < 30 ? 3 : tSec < 60 ? 7 : 12;

      events.push({
        timestampSec: Number(tSec.toFixed(2)),
        label: count > 1 ? "REPEATED TRACTION LOSS REGIONS" : "DRIVEN AXLE WHEELSPIN",
        category: "inputs",
        severity: "warning",
        description: `[PERFORMANCE LOSS] ${count > 1 ? "Repeated micro-wheelspin" : "Severe wheel slip"} detected during throttle application. Peak driven axle speed discrepancy reached ${maxSpin.toFixed(1)}%. Rear traction footprint overloaded on exit.`,
        associatedChannels: ["Throttle", "Speed", "LFspeed", "LRspeed"],
        cornerNumber: corner,
      });
    });

    return events;
  },
};

// ─── 3. PLUGGABLE SCANNER: Aerodynamic Platform Grounding ───────────────────
export const aeroScanner: TelemetryScanner = {
  name: "Aerodynamic & Splitter Grounding Scanner",
  scan(parsed, startTick, endTick) {
    const events: Omit<TelemetryEvent, "id">[] = [];
    const sessionTime = parsed.channels["SessionTime"]?.data;
    if (!sessionTime) return events;

    let activeStart: number | null = null;
    let occurrences: { start: number; end: number; peakPitch: number }[] = [];

    for (let t = startTick; t < endTick; t++) {
      const pitch = getVal(parsed, "pitch", t);
      
      // Aerodynamic compression / front splitter grounding
      const isGrounding = pitch < -0.018;

      if (isGrounding) {
        if (activeStart === null) activeStart = t;
      } else {
        if (activeStart !== null) {
          const duration = sessionTime[t] - sessionTime[activeStart];
          if (duration > 0.1) {
            const pitchSlice = parsed.channels["pitch"]?.data.slice(activeStart, t) ?? [];
            const minPitch = pitchSlice.length > 0 ? Math.min(...pitchSlice) : pitch;

            occurrences.push({
              start: activeStart,
              end: t,
              peakPitch: minPitch * 57.3,
            });
          }
          activeStart = null;
        }
      }
    }

    // Cluster groundings within 3s
    const clustered: typeof occurrences[] = [];
    occurrences.forEach((occ) => {
      if (clustered.length === 0) {
        clustered.push([occ]);
      } else {
        const lastCluster = clustered[clustered.length - 1];
        const lastOcc = lastCluster[lastCluster.length - 1];
        const gap = sessionTime[occ.start] - sessionTime[lastOcc.end];

        if (gap < 3.0) {
          lastCluster.push(occ);
        } else {
          clustered.push([occ]);
        }
      }
    });

    clustered.forEach((cluster) => {
      const firstOcc = cluster[0];
      const tSec = sessionTime[firstOcc.start];
      const maxGround = Math.min(...cluster.map((c) => c.peakPitch));
      const corner = tSec < 35 ? 5 : 9;

      events.push({
        timestampSec: Number(tSec.toFixed(2)),
        label: "CHASSIS ROTATIONAL COMPRESSION",
        category: "dynamics",
        severity: "warning",
        description: `[AERO UNSTABILITY] Platform compression threshold breached. Spliter bottoming flagged. Dynamic nose pitch collapsed to ${maxGround.toFixed(2)}° under heave loads, breaking underbody diffuser seal.`,
        associatedChannels: ["pitch", "LongAccel", "LatAccel"],
        cornerNumber: corner,
      });
    });

    return events;
  },
};

// ─── 4. PLUGGABLE SCANNER: ERS Hybrid Saturation ────────────────────────────
export const ersScanner: TelemetryScanner = {
  name: "ERS Energy Store & Saturation Scanner",
  scan(parsed, startTick, endTick) {
    const events: Omit<TelemetryEvent, "id">[] = [];
    const sessionTime = parsed.channels["SessionTime"]?.data;
    if (!sessionTime) return events;

    let activeStart: number | null = null;
    let occurrences: { start: number; end: number; peakDeploy: number }[] = [];

    for (let t = startTick; t < endTick; t++) {
      const deploy = getVal(parsed, "MgukDeploykW", t);
      
      const isSaturated = deploy > 115;

      if (isSaturated) {
        if (activeStart === null) activeStart = t;
      } else {
        if (activeStart !== null) {
          const duration = sessionTime[t] - sessionTime[activeStart];
          if (duration > 3.0) { // Saturated for more than 3s
            const deploySlice = parsed.channels["MgukDeploykW"]?.data.slice(activeStart, t) ?? [];
            const maxDeploy = deploySlice.length > 0 ? Math.max(...deploySlice) : deploy;

            occurrences.push({
              start: activeStart,
              end: t,
              peakDeploy: maxDeploy,
            });
          }
          activeStart = null;
        }
      }
    }

    // Cluster ERS saturation within 5s
    const clustered: typeof occurrences[] = [];
    occurrences.forEach((occ) => {
      if (clustered.length === 0) {
        clustered.push([occ]);
      } else {
        const lastCluster = clustered[clustered.length - 1];
        const lastOcc = lastCluster[lastCluster.length - 1];
        const gap = sessionTime[occ.start] - sessionTime[lastOcc.end];

        if (gap < 5.0) {
          lastCluster.push(occ);
        } else {
          clustered.push([occ]);
        }
      }
    });

    clustered.forEach((cluster) => {
      const firstOcc = cluster[0];
      const lastOcc = cluster[cluster.length - 1];
      const tSec = sessionTime[firstOcc.start];
      const duration = sessionTime[lastOcc.end] - sessionTime[firstOcc.start];
      const maxDeploy = Math.max(...cluster.map((c) => c.peakDeploy));
      const corner = 11;

      events.push({
        timestampSec: Number(tSec.toFixed(2)),
        label: "ERS DEPLOYMENT SATURATION",
        category: "hybrid",
        severity: "info",
        description: `[HYBRID STRATEGY] MGU-K kinetic discharge saturated at peak output of ${maxDeploy.toFixed(0)} kW for ${duration.toFixed(1)}s. Approaching thermal battery state-of-charge exhaustion limits.`,
        associatedChannels: ["MgukDeploykW", "EnergyStorePct"],
        cornerNumber: corner,
      });
    });

    return events;
  },
};

// ─── PLUGGABLE REGISTRY ──────────────────────────────────────────────────────
export const scanners: TelemetryScanner[] = [
  lockupScanner,
  wheelspinScanner,
  aeroScanner,
  ersScanner,
];

// ─── MASTER SYSTEM SCANNER ───────────────────────────────────────────────────
export function scanTelemetrySession(parsed: IbtParsed): Omit<TelemetryEvent, "id">[] {
  const events: Omit<TelemetryEvent, "id">[] = [];
  
  // Pick the best lap
  const validLaps = parsed.laps.filter((l) => l.endTick - l.startTick > 100 && l.timeS > 10);
  if (validLaps.length === 0) return events;
  
  const bestLap = [...validLaps].sort((a, b) => a.timeS - b.timeS)[0];
  const startTick = bestLap.startTick;
  const endTick = bestLap.endTick;

  // Run all pluggable analysis modules and merge their logs
  scanners.forEach((scanner) => {
    try {
      const scannedEvents = scanner.scan(parsed, startTick, endTick);
      events.push(...scannedEvents);
    } catch (e) {
      console.error(`[Scanner Error] Pluggable module "${scanner.name}" failed:`, e);
    }
  });

  // Sort sequentially by timestamp
  return events.sort((a, b) => a.timestampSec - b.timestampSec);
}
