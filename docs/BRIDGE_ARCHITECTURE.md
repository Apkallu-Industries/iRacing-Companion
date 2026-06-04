# Bridge Architecture

The **`local-bridge`** is the single source of truth for all iRacing telemetry. Every consumer (Live Dashboard, Workbench, Desktop App) connects to it and reads through the same published interface.

---

## Data Flow

```
iRacing Shared Memory API (irsdk-node)
         ↓  60Hz poll
  local-bridge/server.js
  - flattenTelemetry() — flatten SDK variable objects
  - mapTelemetry()    — typed Telemetry packet + extras block
         ↓
  WebSocket broadcast @ ws://localhost:3001
         ↓         ↓         ↓
   ┌──────────┐ ┌────────┐ ┌──────────┐
   │ Browser  │ │ Phone  │ │ Desktop  │
   │ Live Tab │ │  PWA   │ │  Electron│
   └──────────┘ └────────┘ └──────────┘
         ↓
   useTelemetry() React hook
         ↓
   useLapAggregate() — per-lap metric accumulation (extras included)
         ↓
   AI engines (LiveCoach, Advisor, Offline Coach)
```

---

## Telemetry Packet (`Telemetry` interface)

Sent at **60Hz** over WebSocket as JSON. Defined in `src/lib/telemetry-types.ts`.

### Core fields

```typescript
interface Telemetry {
  // Connection
  connected: boolean;
  source: "live" | "simulated";
  session: string; // "PRACTICE — MONZA"
  track: string;
  car: string;
  carNumber: string;
  sdkVersion: string;
  latencyMs: number;
  safetyRating: number;

  // Driver inputs
  throttle: number; // 0–1
  brake: number; // 0–1
  clutch: number; // 0–1
  steeringDeg: number;

  // Engine & speed
  gear: number;
  speedKph: number;
  rpm: number;
  rpmMax: number;
  rpmShiftWarn: number;
  rpmShiftRedline: number;

  // Lap timing
  lastLap: string; // "1:23.456"
  bestLap: string;
  deltaSec: number; // delta to personal best
  sectors: { s1: string; s2: string; s3: string; bestSector: null };

  // Fuel
  fuelRemainingL: number;
  lapsEstimated: number;

  // Tyres (fl / fr / rl / rr)
  tires: Record<
    "fl" | "fr" | "rl" | "rr",
    {
      tempC: number;
      pressureBar: number;
      wearPct: number;
      estWearPct: number;
      brakeTempC: number;
      brakeLinePress: number;
      state: "hot" | "cold" | "ok";
    }
  >;

  // Physics
  gLat: number;
  gLon: number;

  // Setup & environment
  brakeBias: number;
  diffMap: number;
  drsAvailable: boolean;
  airTempC: number;
  trackTempC: number;
  liveAirTempC: number;
  liveTrackTempC: number;
  airDensity: number;
  airPressure: number;
  windVel: number;
  windDir: number;
  trackWetness: number;

  // Race
  sof: number;
  myCarIdx: number;
  competitors: Array<{
    pos: number;
    carIdx: number;
    lap: number;
    lastTime: number;
    fastestTime: number;
  }>;

  // High-fidelity extras (see below)
  extras: Record<string, number>;

  // Raw IRSDK flat object (all available channels)
  all: Record<string, number>;
}
```

### extras block

Every packet includes an `extras` object with high-value channels that the AI engines consume. Channels are `0` when the car or session does not export them.

| Key                                  | SDK Source           | Units | AI use                      |
| ------------------------------------ | -------------------- | ----- | --------------------------- |
| `YawRate`                            | `v.YawRate`          | rad/s | Oversteer / snap detection  |
| `Yaw`                                | `v.Yaw`              | rad   | Cumulative rotation         |
| `LFshockDefl` .. `RRshockDefl`       | `v.LFshockDefl`      | m     | Damper travel, bump/rebound |
| `BrakeLinePressureLF` .. `RR`        | `v.LFbrakeLinePress` | Pa    | Brake bias indicator        |
| `LFwheelSpeed` .. `RRwheelSpeed`     | `v.LFwheelSpeed`     | rad/s | Wheel lock detection        |
| `Pitch`, `Roll`                      | `v.Pitch`, `v.Roll`  | rad   | Car attitude                |
| `PitchRate`, `RollRate`              | `v.PitchRate`        | rad/s | Dynamic loads               |
| `LFtireForceLatN`, `RFtireForceLatN` | `v.LFtireForceLatN`  | N     | Grip level                  |
| `VelocityX/Y/Z`                      | `v.VelocityX`        | m/s   | Body velocity vector        |

---

## Connection Management

```typescript
// src/lib/useTelemetry.ts
const telemetry = useTelemetry();
// Always returns a Telemetry object — connected=false when bridge is offline
// Falls back to a simulated telemetry stream for UI development
```

- Auto-reconnects every **3 seconds** when bridge is unreachable
- First connect sends the latest packet immediately
- Clients show "Disconnected" state when `connected === false`

---

## Lap Aggregate (extras included)

`src/lib/live/useLapAggregate.ts` accumulates per-tick values across a lap and produces a `LapResult` at lap completion:

```typescript
interface LapResult {
  lapTimeS: number;
  s1S;
  s2S;
  s3S: number | null;
  fuelUsedL: number;
  isValid: boolean;
  maxBrakePct: number;
  maxThrottlePct: number;
  peakLatG: number;
  peakLonG: number;
  tireAvgC: number;
  bigGSpike: boolean;
  // extras accumulated during lap:
  extras: {
    peakYawRateRads: number; // rad/s — max absolute yaw rate in lap
    peakShockFL: number; // m — max absolute FL shock deflection
    maxBrakeLinePressTotal: number; // Pa — max total brake line pressure
  };
}
```

This `extras` object flows through to both the Live Coach and the Advisor AI payloads.

---

## AI Data Flow

All three AI engines receive `extras` data and workspace context:

```
LapResult.extras
    ↓
LiveCoach.tsx           → dispatchLiveCoach({ context: { extras } })
AdvisorButton.tsx       → dispatchAdvisorCall({ extrasSnapshot })
                                    ↓
                            llm.ts (builds workspace context string)
                                    ↓
                    buildLiveCoachUserMessage() / buildAdvisorUserMessage()
                                    ↓
                          Gemini 2.5 Pro / Local LLM
```

---

## Adding New Channels

1. **Add to `mapTelemetry()`** in `local-bridge/server.js` — either as a top-level field or inside `extras`
2. **Update `Telemetry` interface** in `src/lib/telemetry-types.ts`
3. **Accumulate in `useLapAggregate.ts`** if a per-lap peak/sum is needed
4. **Inject into AI prompts** in `advisor.prompts.ts` or `llm.ts` if the AI should see it

---

## File References

| File                              | Purpose                                                   |
| --------------------------------- | --------------------------------------------------------- |
| `local-bridge/server.js`          | Bridge — reads irsdk, maps Telemetry, broadcasts          |
| `src/lib/telemetry-types.ts`      | `Telemetry` TypeScript interface                          |
| `src/lib/useTelemetry.ts`         | React hook — WebSocket consumer                           |
| `src/lib/useTelemetryBuffer.ts`   | 30s rolling buffer at 60Hz                                |
| `src/lib/live/useLapAggregate.ts` | Per-lap accumulation (extras included)                    |
| `src/lib/advisor.prompts.ts`      | Advisor user message builder (extras + wsCtx)             |
| `src/lib/llm.ts`                  | AI dispatch — cloud/local, workspace + extras injection   |
| `src/lib/tts.client.ts`           | Client TTS with `setSinkId` output device routing         |
| `src/lib/store.ts`                | Zustand — ElevenLabs key, output device ID, mic device ID |
| `desktop/main.cjs`                | Electron — spawns bridge, tray, single-instance lock      |
| `desktop/scripts/copy-bridge.js`  | Syncs `local-bridge/` → `desktop/bridge/`                 |

---

## Replay Broadcast Command API

The bridge exposes a high-fidelity control interface for the active in-game iRacing replay system via the `POST /api/replay/command` REST endpoint. This API bridges the client workbench timeline to the simulator replay tape deck.

### Supported Commands

Exposed via `{ command: string, ...parameters }` JSON payloads:

#### 1. Seek Replay (`seek`)

Commands the simulator to seek to a specific session number and absolute session time.

- **Payload**: `{ command: "seek", sessionNum: number, sessionTimeMS: number }`
- **Underlying SDK API**: `triggerReplaySessionSearch(session, time)`

#### 2. Change Playback Speed (`speed`)

Controls the simulator's play, pause, fast forward, or rewind rate.

- **Payload**: `{ command: "speed", speed: number, slowMotion: boolean }`
- **Underlying SDK API**: `changeReplaySpeed(speed, slowMotion)`

#### 3. Shift Playback Position (`position`)

Jumps relative to absolute replay margins (0 = Begin, 1 = Current, 2 = End).

- **Payload**: `{ command: "position", position: number, frame: number }`
- **Underlying SDK API**: `changeReplayPosition(position, frame)`

#### 4. Search Tapes (`search`)

Controls iRacing search skips like previous/next lap, frame, or incident markers.

- **Payload**: `{ command: "search", searchCommand: number }` (e.g. ReplaySearchCommand values 0–9)
- **Underlying SDK API**: `searchReplay(command)`

#### 5. Change Replay State (`state`)

Triggers tape operations such as tape erasing or state switching.

- **Payload**: `{ command: "state", state: number }` (ReplayStateCommand values)
- **Underlying SDK API**: `changeReplayState(state)`

#### 6. Switch Active Focus and Camera View (`camera`)

Commands the spectator camera to switch drivers and angles in real-time.

- **Payload**: `{ command: "camera", position: number, group: number, camera: number }`
- **Underlying SDK API**: `changeCameraPosition(position, group, camera)`
