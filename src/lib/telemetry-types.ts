export interface Telemetry {
  connected: boolean;
  source: "live" | "simulated";
  session: string;
  track: string;
  car: string;
  carNumber: string;
  sdkVersion: string;
  latencyMs: number;
  safetyRating: number;
  gear: number;
  speedKph: number;
  rpm: number;
  rpmMax: number;
  rpmShiftWarn: number;
  rpmShiftRedline: number;
  throttle: number; // 0..1
  brake: number; // 0..1
  clutch: number; // 0..1
  steeringDeg: number;
  lastLap: string;
  bestLap: string;
  deltaSec: number;
  sectors: {
    s1: string | null;
    s2: string | null;
    s3: string | null;
    bestSector: 1 | 2 | 3 | null;
  };
  fuelRemainingL: number;
  fuelUsePerHour: number;     // kg/hr ≈ L/hr (iRacing FuelUsePerHour channel)
  lapLastLapTimeSec: number;  // last lap time in raw seconds (for arithmetic)
  lapsEstimated: number;
  tires: {
    fl: {
      tempC: number;
      pressureBar: number;
      wearPct: number;
      estWearPct: number;
      brakeTempC: number;
      brakeLinePress: number;
      state: "cold" | "ok" | "hot";
    };
    fr: {
      tempC: number;
      pressureBar: number;
      wearPct: number;
      estWearPct: number;
      brakeTempC: number;
      brakeLinePress: number;
      state: "cold" | "ok" | "hot";
    };
    rl: {
      tempC: number;
      pressureBar: number;
      wearPct: number;
      estWearPct: number;
      brakeTempC: number;
      brakeLinePress: number;
      state: "cold" | "ok" | "hot";
    };
    rr: {
      tempC: number;
      pressureBar: number;
      wearPct: number;
      estWearPct: number;
      brakeTempC: number;
      brakeLinePress: number;
      state: "cold" | "ok" | "hot";
    };
  };
  gLat: number;
  gLon: number;
  drsAvailable: boolean;
  brakeBias: number;
  diffMap: number;
  airTempC: number;
  trackTempC: number;
  liveAirTempC: number;
  liveTrackTempC: number;
  airDensity: number;
  airPressure: number;
  windVel: number;
  windDir: number;
  trackWetness: number;
  sof: number;
  myCarIdx?: number;
  competitors?: Array<{
    pos: number;
    carIdx: number;
    lap: number;
    lastTime: number;
    fastestTime: number;
  }>;
  /**
   * Passthrough for any additional numeric channels the bridge wants to
   * expose (LapDistPct, Yaw, VelocityX/Y, suspension travel, etc.). The
   * recorder captures every key here into the .pwlap file under the same
   * name, so adding a channel in the bridge is enough — no code change
   * needed in the workbench.
   */
  extras?: Record<string, number>;
}

export const DEFAULT_TELEMETRY: Telemetry = {
  connected: false,
  source: "simulated",
  session: "PRACTICE — SPA-FRANCORCHAMPS",
  track: "Spa-Francorchamps",
  car: "DALLARA P217",
  carNumber: "44",
  sdkVersion: "irsdk v1.0",
  latencyMs: 24,
  safetyRating: 4.82,
  gear: 4,
  speedKph: 184,
  rpm: 8420,
  rpmMax: 11000,
  rpmShiftWarn: 8800,
  rpmShiftRedline: 9800,
  throttle: 0.85,
  brake: 0.12,
  clutch: 0,
  steeringDeg: 12,
  lastLap: "2:18.421",
  bestLap: "2:17.004",
  deltaSec: 0.145,
  sectors: { s1: "41.420", s2: "1:02.115", s3: null, bestSector: 1 },
  fuelRemainingL: 42.1,
  fuelUsePerHour: 0,
  lapLastLapTimeSec: 137.004,  // 2:17.004 in seconds
  lapsEstimated: 14.2,
  tires: {
    fl: {
      tempC: 82,
      pressureBar: 1.84,
      wearPct: 98,
      estWearPct: 98,
      brakeTempC: 320,
      brakeLinePress: 0,
      state: "ok",
    },
    fr: {
      tempC: 94,
      pressureBar: 1.92,
      wearPct: 94,
      estWearPct: 94,
      brakeTempC: 350,
      brakeLinePress: 0,
      state: "hot",
    },
    rl: {
      tempC: 84,
      pressureBar: 1.88,
      wearPct: 97,
      estWearPct: 97,
      brakeTempC: 310,
      brakeLinePress: 0,
      state: "ok",
    },
    rr: {
      tempC: 88,
      pressureBar: 1.9,
      wearPct: 96,
      estWearPct: 96,
      brakeTempC: 315,
      brakeLinePress: 0,
      state: "ok",
    },
  },
  gLat: 1.8,
  gLon: -0.4,
  drsAvailable: true,
  brakeBias: 54.5,
  diffMap: 3,
  airTempC: 22.5,
  trackTempC: 38.2,
  liveAirTempC: 22.8,
  liveTrackTempC: 39.5,
  airDensity: 1.2,
  airPressure: 101325,
  windVel: 5.2,
  windDir: 1.5,
  trackWetness: 0,
  sof: 2150,
};
