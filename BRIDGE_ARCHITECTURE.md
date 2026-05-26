# Bridge Architecture — Single Source of Truth

## Overview
The **`local-bridge`** (in `/local-bridge/`) is the canonical and single source of truth for all iRacing telemetry data. All UI sections (Live Dashboard, Lab Workbench, Desktop App, Web App) connect to this bridge and consume data through its published interfaces.

## Bridge Data Sources & Interfaces

### 1. Live Telemetry Stream (WebSocket)
**Endpoint:** `ws://localhost:3001` or `ws://<your-pc-ip>:3001`

**Data Model:** `Telemetry` object sent at 30 Hz (configurable via bridge performance settings)

```typescript
interface Telemetry {
  // Connection & Session
  connected: boolean;
  source: "live" | "simulated";
  session: string;           // e.g. "PRACTICE — MONZA"
  track: string;
  car: string;
  
  // Driving Inputs
  throttle: 0-1;
  brake: 0-1;
  clutch: 0-1;
  steeringDeg: number;
  
  // Engine & Speed
  gear: number;
  speedKph: number;
  rpm: number;
  rpmMax: number;
  rpmShiftWarn: number;
  
  // Lap Timing
  lastLap: string;           // "M:SS.sss"
  bestLap: string;
  deltaSec: number;
  sectors: {
    s1: string;
    s2: string;
    s3: string;
  };
  
  // Tires (FL, FR, RL, RR)
  tires: {
    [corner]: {
      tempC: number;
      pressureBar: number;
      wearPct: number;
      estWearPct: number;
      brakeTempC: number;
      brakeLinePress: number;
      state: "hot" | "cold" | "ok";
    };
  };
  
  // Fuel & Load
  fuelRemainingL: number;
  lapsEstimated: number;
  
  // Physics
  gLat: number;              // G-forces
  gLon: number;
  
  // Setup & Environment
  brakeBias: number;
  diffMap: number;
  drsAvailable: boolean;
  airTempC: number;
  trackTempC: number;
  safetyRating: number;
  
  // Competitors
  competitors: Array<{
    pos: number;
    carIdx: number;
    lap: number;
    lastTime: number;
    fastestTime: number;
  }>;
  
  // Raw Data (for advanced use)
  all: Record<string, number>;  // flattened iRacing IRSDK
}
```

**Connection Management:**
- Auto-reconnect every 3 seconds if bridge is offline
- Falls back to simulated telemetry when bridge unavailable (for dashboard UI testing)
- Clients should send FPS metrics periodically: `{ type: "perf", fps: 60 }`

### 2. Static Assets (HTTP)
**Endpoint:** `http://localhost:3001/`

Serves the local bridge dashboard UI (optional; the web app can be hosted remotely).

### 3. Desktop Lap Recording API (HTTP) — *In Development*
**Endpoints:**
- `GET /api/laps?limit=500` — list cached offline laps
- `POST /api/laps/mark-synced` — mark laps as synced to cloud

**Response Format:**
```json
{
  "laps": [
    {
      "ts": 1234567890,
      "car": "Ferrari 488 GT3",
      "track": "Monza",
      "lapTimeS": 123.456,
      "fuel": 45.2,
      "sof": 2500
    }
  ]
}
```

### 4. MongoDB Local Recording — *In Development*
The bridge optionally records full telemetry to a local MongoDB instance:
- **Collections:** `telemetry_sessions`, `telemetry_samples`, `laps`
- Used for offline lap analysis when internet/cloud sync is unavailable
- Users configure MongoDB URI in System Settings

## Data Flow

```
iRacing Shared Memory API
        ↓
   local-bridge/server.js
   - Reads IRSDK telemetry @ 30 Hz
   - Flattens & maps to Telemetry object
   - Optional: Records to MongoDB
        ↓
    ┌─────────────────────────────────┐
    │   WebSocket @ ws://localhost:3001│
    └─────────────────────────────────┘
         ↓         ↓         ↓
    ┌──────┐  ┌──────┐  ┌──────┐
    │ Live │  │ Lab  │  │Desktop│
    │ Dash │  │Bench │  │ App  │
    └──────┘  └──────┘  └──────┘
```

## Consumer Implementation

### Using the Bridge (Frontend)

**1. Live Telemetry Hook (React)**
```typescript
import { useTelemetry } from "@/lib/useTelemetry";

export function MyComponent() {
  const telemetry = useTelemetry();  // Always returns Telemetry
  
  if (!telemetry.connected) {
    return <div>Bridge offline — simulated mode</div>;
  }
  
  return (
    <div>
      Speed: {telemetry.speedKph} kph
      Tire Temps: {telemetry.tires.fl.tempC}°C
    </div>
  );
}
```

**2. Accessing via Global Store**
```typescript
import { useWorkbench } from "@/lib/store";

export function AICoach() {
  const { liveContext } = useWorkbench();
  // liveContext = { track, car, connected }
}
```

**3. Buffered Historical Data**
```typescript
import { useTelemetryBuffer } from "@/lib/useTelemetryBuffer";

export function Chart() {
  const samples = useTelemetryBuffer(telemetry, 30_000, 30);
  // samples = array of Telemetry objects sampled over last 30s @ 30Hz
}
```

## Architecture Principles

✅ **Single Source of Truth:** All data originates from `local-bridge`  
✅ **Stateless Bridge:** Bridge does not depend on client state  
✅ **Passive Consumers:** UI components only read, never write back to bridge  
✅ **Graceful Degradation:** Fallback to simulation when bridge offline  
✅ **Local-First:** Everything works offline; cloud sync is optional  

## Adding New Data Points

1. **Add to iRading IRSDK telemetry** → captured by bridge
2. **Map in `local-bridge/server.js`** → `mapTelemetry()` function
3. **Update `Telemetry` type** → [src/lib/telemetry-types.ts](src/lib/telemetry-types.ts)
4. **Use in components** → `useTelemetry()` hook automatically includes it

Example:
```javascript
// In local-bridge/server.js, mapTelemetry()
return {
  ...existingFields,
  myNewMetric: calculateMetric(v),
};
```

## Files & References

- **Bridge (Source of Truth):** [local-bridge/server.js](local-bridge/server.js)
- **Telemetry Mapping:** [local-bridge/server.js#mapTelemetry](local-bridge/server.js)
- **Consumer Hook:** [src/lib/useTelemetry.ts](src/lib/useTelemetry.ts)
- **Type Definition:** [src/lib/telemetry-types.ts](src/lib/telemetry-types.ts)
- **Global Store:** [src/lib/store.ts](src/lib/store.ts)
- **Desktop Integration:** [desktop/main.cjs](desktop/main.cjs) → uses `../local-bridge`
