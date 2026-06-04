# Telemetry Events Taxonomy & Catalog

This directory contains the formal definitions of **Telemetry Events** which classify high-frequency physical anomalies into discrete semantic events.

---

## 1. Catalog of Standardized Event Types

Every Telemetry Event must use one of the following standardized types:

### 1.1 `ENTRY_OVER_ROTATION`

- **Trigger Condition**: Dynamic Yaw Rate exceeds target slip trajectory during steering turn-in under deceleration.
- **Physics Truth Boundary**: `["deterministic_physics", "behavioral_model"]`
- **Common Channels**: `YawRate`, `Yaw`, `SteeringDeg`

### 1.2 `EXIT_UNDERSTEER`

- **Trigger Condition**: Front-axle lateral slip angle exceeds optimal tire grip peak on exit throttle.
- **Physics Truth Boundary**: `["deterministic_physics"]`
- **Common Channels**: `LFtireForceLatN`, `RFtireForceLatN`, `Throttle`

### 1.3 `AERO_BOTTOM_OUT`

- **Trigger Condition**: Front underbody/splitter ride height falls to <= 1.0mm under vertical downforce compression.
- **Physics Truth Boundary**: `["deterministic_physics"]`
- **Common Channels**: `LFshockDefl`, `RFshockDefl`, `VelocityZ`

### 1.4 `BRAKE_LOCK_FRONT_LEFT` / `BRAKE_LOCK_FRONT_RIGHT`

- **Trigger Condition**: Front brake line pressure > 82 Bar and corresponding wheel speed is > 15% slower than vehicle body speed under braking.
- **Physics Truth Boundary**: `["deterministic_physics"]`
- **Common Channels**: `LFwheelSpeed` (or `RFwheelSpeed`), `BrakeLinePressureLF` (or `RF`), `speedKph`

### 1.5 `REAR_TRACTION_COLLAPSE`

- **Trigger Condition**: Rear driven-axle wheel speed exceeds vehicle body velocity by > 12% under positive throttle gradient.
- **Physics Truth Boundary**: `["deterministic_physics"]`
- **Common Channels**: `LRwheelSpeed`, `RRwheelSpeed`, `speedKph`, `Throttle`

### 1.6 `DIRTY_AIR_PUSH`

- **Trigger Condition**: Leading car within 0.8 seconds and front downforce decays by > 5% at speeds > 180 KPH.
- **Physics Truth Boundary**: `["probabilistic_projection", "historical_correlation"]`
- **Common Channels**: `competitors`, `speedKph`, `LFtireForceLatN`

### 1.7 `THERMAL_REAR_OVERLOAD`

- **Trigger Condition**: Rear tire carcass core thermal growth exceeds optimal operating envelope by > 14°C over 3 consecutive laps.
- **Physics Truth Boundary**: `["deterministic_physics", "historical_correlation"]`
- **Common Channels**: `tires.rl.tempC`, `tires.rr.tempC`

### 1.8 `HIGH_SPEED_HEAVE_SPIKE`

- **Trigger Condition**: Sudden transient spike in vertical shock deflection rate exceeding 0.15 m/s at high speeds.
- **Physics Truth Boundary**: `["deterministic_physics"]`
- **Common Channels**: `LFshockDefl`, `RFshockDefl`, `speedKph`
