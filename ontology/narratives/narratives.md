# Stint & Session Narratives

This directory defines the **Session Evolution Narratives** layer, which models macro-level stint evolution, tracking how changing fuel loads, track evolution, and tire wear interact with driver behaviors.

By synthesizing individual telemetry events and stateful episodes, the Narratives layer produces structured story arcs that explain _what_ happened during a stint and _why_ it unfolded the way it did.

---

## 1. Narrative Variables Guide

### 1.1 `trackEvolutionState`

- **Defines**: The state of the racing surface grip, affected by track temperatures, rubber deposits, and ambient factors.
- **Tiers**:
  - `green`: Fresh track, low grip, high slide wear.
  - `rubbered_in`: Optimal grip, rubber filled into asphalt pores.
  - `greasy_hot`: High track temperatures causing oil bleed and greasy slide slip.
  - `abrasive`: High tyre friction and rapid carcass wear.
- **Physics Truth Boundary**: `["deterministic_physics", "historical_correlation"]`

### 1.2 `fuelLoadDecayState`

- **Defines**: The fuel mass level, which dictates overall vehicle weight, longitudinal load transfer, and center of gravity balance.
- **Tiers**:
  - `heavy_start`: Max weight, low ride heights, high splitter grounding risk.
  - `stint_mid`: Nominal operating weight, stable aerodynamic rake.
  - `fuel_reserve`: Extremely light, increased rear ride height, high entry rotation.
- **Physics Truth Boundary**: `["deterministic_physics"]`

### 1.3 `driverConfidenceTrend`

- **Defines**: The trend of the driver's consistency and willingness to push vehicle stability margins.
- **Tiers**:
  - `improving`: Lap-time delta shrinking, inputs smoothing, trail braking deeper.
  - `stable`: Consistent inputs, stable lap times.
  - `decaying`: Inputs showing high variance, erratic brake release, early throttle lifts.
- **Physics Truth Boundary**: `["behavioral_model"]`
