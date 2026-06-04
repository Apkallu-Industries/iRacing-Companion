import { BrakeInstrument } from "./BrakeInstrument";
import { ERSInstrument } from "./ERSInstrument";
import { ChassisInstrument } from "./ChassisInstrument";
import { TireInstrument } from "./TireInstrument";
import { DriverInputsInstrument } from "./DriverInputsInstrument";

// Register all core instruments with keys
export const TELEMETRY_INSTRUMENTS = {
  brakes: BrakeInstrument,
  ers: ERSInstrument,
  chassis: ChassisInstrument,
  tires: TireInstrument,
  inputs: DriverInputsInstrument,
} as const;

export type InstrumentKey = keyof typeof TELEMETRY_INSTRUMENTS;

export interface PresetLayout {
  name: string;
  description: string;
  instruments: InstrumentKey[];
}

// 4 custom industry-grade motorsport presets
export const WORKSPACE_PRESETS: Record<string, PresetLayout> = {
  gt3: {
    name: "GT3 Race Engineer",
    description:
      "Focuses on brake balance targets, tire thermal wear growth, and critical strategic command modules.",
    instruments: ["brakes", "tires", "inputs"],
  },
  gtp: {
    name: "GTP Hybrid Command",
    description:
      "Focuses on ERS Purple battery cells, kinetic deployment mapping, and mechanical suspension stability.",
    instruments: ["ers", "brakes", "chassis"],
  },
  coach: {
    name: "Driver Coach Workstation",
    description:
      "Prioritizes pedal linear traces, micro-steer dial tracking, and lateral G-G circle slip limits.",
    instruments: ["inputs", "tires", "chassis"],
  },
  aero: {
    name: "Aero Platform Engineer",
    description:
      "Aero compression histograms, dynamic chassis pitching, and recovery harvest curves.",
    instruments: ["chassis", "tires", "ers"],
  },
};
