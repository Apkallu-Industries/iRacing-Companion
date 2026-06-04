import type { IbtParsed } from "@/lib/ibt/types";
import type { TelemetryEvent } from "@/lib/telemetryRuntimeStore";
import { calculateScannerCertainty } from "../session-intelligence/calibration";

export interface DSLRuleCondition {
  channel: string;
  operator: ">" | "<" | "==" | "!=" | "mismatch";
  value: number;
}

export interface DSLRule {
  name: string;
  classification: "STABILITY" | "PERFORMANCE" | "AERO PLATFORM" | "HYBRID CORE";
  category: "thermal" | "dynamics" | "hybrid" | "inputs";
  severity: "info" | "warning" | "critical";
  channels: string[];
  conditions: DSLRuleCondition[];
  durationSec: number;
  cornerNumber?: number;
  descriptionTemplate: string;
}

// Built-in Declarative Rules (representing compiled DSL scripts)
export const DECLARATIVE_RULES: DSLRule[] = [
  {
    name: "CRITICAL BRAKE LOCKUP",
    classification: "STABILITY",
    category: "thermal",
    severity: "critical",
    channels: ["Brake", "Speed", "SteeringWheelAngle"],
    conditions: [
      { channel: "Brake", operator: ">", value: 0.82 },
      { channel: "Speed", operator: ">", value: 13.8 }, // >50 km/h
      { channel: "SteeringWheelAngle", operator: ">", value: 0.7 }, // >40 degrees
    ],
    durationSec: 0.15,
    cornerNumber: 8,
    descriptionTemplate:
      "Front axle brake pressure exceeded 82% threshold target under heavy deceleration. Wheel speed lockup and front load transfer collapse entry traction footprint.",
  },
  {
    name: "DRIVEN AXLE WHEELSPIN",
    classification: "PERFORMANCE",
    category: "inputs",
    severity: "warning",
    channels: ["Throttle", "Speed", "LFspeed", "LRspeed"],
    conditions: [
      { channel: "Throttle", operator: ">", value: 0.7 },
      { channel: "Speed", operator: ">", value: 11.1 }, // >40 km/h
      { channel: "LFspeed", operator: "mismatch", value: 0.12 },
    ],
    durationSec: 0.15,
    cornerNumber: 3,
    descriptionTemplate:
      "Driven rear wheel speeds mismatched by more than 12% under heavy exit throttle re-application. Rear footprint slip threshold breached.",
  },
  {
    name: "CHASSIS ROTATIONAL COMPRESSION",
    classification: "AERO PLATFORM",
    category: "dynamics",
    severity: "warning",
    channels: ["pitch"],
    conditions: [{ channel: "pitch", operator: "<", value: -0.018 }],
    durationSec: 0.1,
    cornerNumber: 5,
    descriptionTemplate:
      "Dynamic ride height pitch collapses forward, triggering splitter bottoming under downforce heave. Diffuser seal compromised transiently.",
  },
  {
    name: "ERS DEPLOYMENT SATURATION",
    classification: "HYBRID CORE",
    category: "hybrid",
    severity: "info",
    channels: ["MgukDeploykW"],
    conditions: [{ channel: "MgukDeploykW", operator: ">", value: 115 }],
    durationSec: 3.5,
    cornerNumber: 11,
    descriptionTemplate:
      "MGU-K deploy torque remained saturated at peak output (>115 kW). State-of-charge energy reserves declining on straightaway.",
  },
];

function evaluateCondition(parsed: IbtParsed, cond: DSLRuleCondition, tick: number): boolean {
  const ch = parsed.channels[cond.channel];
  if (!ch) return false;
  const val = ch.data[tick];

  switch (cond.operator) {
    case ">":
      return val > cond.value;
    case "<":
      return val < cond.value;
    case "==":
      return val === cond.value;
    case "!=":
      return val !== cond.value;
    case "mismatch": {
      const lf = parsed.channels["LFspeed"]?.data[tick] ?? 0;
      const lr = parsed.channels["LRspeed"]?.data[tick] ?? 0;
      return Math.abs(lf - lr) > lf * cond.value;
    }
    default:
      return false;
  }
}

export function compileAndRunDSL(
  parsed: IbtParsed,
  rules: DSLRule[] = DECLARATIVE_RULES,
): Omit<TelemetryEvent, "id">[] {
  const events: Omit<TelemetryEvent, "id">[] = [];
  const sessionTime = parsed.channels["SessionTime"]?.data;
  if (!sessionTime) return events;

  // Scan only the best lap
  const validLaps = parsed.laps.filter((l) => l.endTick - l.startTick > 100 && l.timeS > 10);
  if (validLaps.length === 0) return events;
  const bestLap = [...validLaps].sort((a, b) => a.timeS - b.timeS)[0];
  const startTick = bestLap.startTick;
  const endTick = bestLap.endTick;

  rules.forEach((rule) => {
    let activeStart: number | null = null;
    const occurrences: { start: number; end: number }[] = [];

    // Step 1: Run scanner over the lap's ticks
    for (let t = startTick; t < endTick; t++) {
      const allMet = rule.conditions.every((cond) => evaluateCondition(parsed, cond, t));

      if (allMet) {
        if (activeStart === null) activeStart = t;
      } else {
        if (activeStart !== null) {
          const duration = sessionTime[t] - sessionTime[activeStart];
          if (duration > rule.durationSec) {
            occurrences.push({ start: activeStart, end: t });
          }
          activeStart = null;
        }
      }
    }
    if (activeStart !== null) {
      occurrences.push({ start: activeStart, end: endTick - 1 });
    }

    // Step 2: Temporal Clustering - Group occurrences closer than 4.5 seconds
    const clusters: (typeof occurrences)[] = [];
    occurrences.forEach((occ) => {
      if (clusters.length === 0) {
        clusters.push([occ]);
      } else {
        const lastCluster = clusters[clusters.length - 1];
        const lastOcc = lastCluster[lastCluster.length - 1];
        const gap = sessionTime[occ.start] - sessionTime[lastOcc.end];

        if (gap < 4.5) {
          lastCluster.push(occ);
        } else {
          clusters.push([occ]);
        }
      }
    });

    // Step 3: Format the clustered engineering findings
    clusters.forEach((cluster) => {
      const firstOcc = cluster[0];
      const count = cluster.length;
      const tSec = sessionTime[firstOcc.start];

      const label = count > 1 ? `REPEATED ${rule.name}` : rule.name;
      const textPrefix =
        count > 1
          ? `[${rule.classification} INSIGHT] Repeated events (${count} occurrences) flagged. `
          : `[${rule.classification} CRITICAL] `;

      const corner = tSec < 20 ? 8 : tSec < 45 ? 11 : tSec < 60 ? 3 : 5;

      const certainty = calculateScannerCertainty(
        parsed,
        rule.channels,
        firstOcc.start,
        cluster[cluster.length - 1].end,
      );

      events.push({
        timestampSec: Number(tSec.toFixed(2)),
        label,
        category: rule.category,
        severity: rule.severity,
        description: `${textPrefix}${rule.descriptionTemplate}`,
        associatedChannels: rule.channels,
        cornerNumber: corner,
        metadata: { confidence: certainty },
      });
    });
  });

  return events.sort((a, b) => a.timestampSec - b.timestampSec);
}
