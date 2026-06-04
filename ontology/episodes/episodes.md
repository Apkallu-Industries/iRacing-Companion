# Handling Episodes Catalog

This catalog documents the **Stateful Handling Episodes** which trace temporal and physical sequences of cascading telemetry events.

Unlike single telemetry events, episodes have a _lifecycle_—they represent states that progressive handling degradation falls into.

---

## 1. Episode Profiles

### 1.1 `Rear Tire Thermal Saturation Cascade`

- **Causal Precursors**: `[THERMAL_REAR_OVERLOAD, REAR_TRACTION_COLLAPSE]`
- **Dynamics Narrative**: Driven axle carcass temperatures exceed optimal thermal windows by > 14°C. The resultant loss of carcass friction threshold causes recurring traction collapse under acceleration, compounding the thermal buildup.
- **Stage Progression**:
  1. _Stage 1_: Core thermal drift exceeds nominal operating envelope (+10°C).
  2. _Stage 2_: Secondary slip spikes registered under exit throttle.
  3. _Stage 3_: Complete rear traction collapse and severe rotation decay on entry.
- **Physics Truth Boundary**: `["deterministic_physics", "historical_correlation"]`

### 1.2 `Underbody Diffuser Stall Grounding`

- **Causal Precursors**: `[AERO_BOTTOM_OUT, HIGH_SPEED_HEAVE_SPIKE]`
- **Dynamics Narrative**: Static and dynamic downforce combines at high speeds to fully compress rear heave packers, bottoming out the skid block. This stalls the venturi airflow seal, triggering a massive, sudden loss of rear vertical load.
- **Stage Progression**:
  1. _Stage 1_: High-speed aerodynamic rake compression.
  2. _Stage 2_: Physical skid grounding (Aero Bottom Out).
  3. _Stage 3_: Diffuser vacuum collapse causing entry snap-oversteer.
- **Physics Truth Boundary**: `["deterministic_physics"]`

### 1.3 `Brake Release Load Transfer Anomaly`

- **Causal Precursors**: `[BRAKE_LOCK_FRONT_LEFT, BRAKE_LOCK_FRONT_RIGHT, ENTRY_OVER_ROTATION]`
- **Dynamics Narrative**: The driver abruptly releases the brake pedal (+18% gradient variance) at the corner turn-in point, collapsing the forward load transfer too rapidly. The front tires regain snap vertical grip while the rear platform shifts, inducing high-speed entry snap-oversteer.
- **Stage Progression**:
  1. _Stage 1_: Unstable/aggressive brake pressure release on trail braking.
  2. _Stage 2_: Transient lockup of front axle.
  3. _Stage 3_: Rear axle slip envelope collapse.
- **Physics Truth Boundary**: `["deterministic_physics", "behavioral_model"]`
