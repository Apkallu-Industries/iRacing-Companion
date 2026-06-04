# Driver DNA Longitudinal traits

This directory defines the **Driver DNA Longitudinal Traits** layer, which models the cognitive preferences and input signatures of individual drivers across stints and sessions.

Rather than treating driver style as a simple list of numbers, Driver DNA translates inputs into stable, semantic traits suitable for personalization and causality analysis.

---

## 1. Traits Mapping Guide

### 1.1 `cornerEntryRotationPreference`

- **Defines**: The driver's comfort level and demand for aggressive slip angle during high-speed direction changes.
- **Mapping Criteria**:
  - `high`: Average absolute `YawRate` exceeds `0.35 rad/s` under entry load.
  - `medium`: Average absolute `YawRate` sits between `0.18` and `0.35 rad/s`.
  - `low`: Average absolute `YawRate` is under `0.18 rad/s`.
- **Physics Truth Boundary**: `["deterministic_physics", "behavioral_model"]`

### 1.2 `rearAxleStabilityTolerance`

- **Defines**: The driver's reaction envelope to sudden oversteer or yaw velocity shifts.
- **Mapping Criteria**:
  - `aggressive`: Driver maintains steering angle or counter-steers fluidly without snapping throttle close under oversteer (steering smoothness < 70 and yaw rate > 0.30).
  - `neutral`: Standard correction rates.
  - `cautious`: Driver instantly backs out of throttle or over-corrects steering on minimal slip spikes (steering smoothness > 85).
- **Physics Truth Boundary**: `["behavioral_model"]`

### 1.3 `brakeReleaseStyle`

- **Defines**: The shape of the trail-brake release curve, which determines aerodynamic platform stability.
- **Mapping Criteria**:
  - `fast_decay`: Driver releases pedal abruptly at turn-in (decay gradient > 5.0, trail brake duration < 0.8s).
  - `linear`: Constant, linear release slope.
  - `smooth_trail`: Driver trails brake deep to the apex (trail brake duration > 1.3s).
- **Physics Truth Boundary**: `["deterministic_physics", "behavioral_model"]`

### 1.4 `throttleCommitmentConfidence`

- **Defines**: The style and timing of the exit acceleration transition.
- **Mapping Criteria**:
  - `early`: Driver commits to early, aggressive throttle before wheel straightens (exit gradient > 5.5).
  - `progressive`: Smooth, progressive ramp matched to traction circle.
  - `hesitant`: Driver pumps throttle or hesitates (exit gradient < 2.5).
- **Physics Truth Boundary**: `["behavioral_model"]`
