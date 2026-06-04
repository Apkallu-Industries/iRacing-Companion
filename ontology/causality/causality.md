# Engineering Causality Graph

This directory defines the **Engineering Causality Graph (ECG)** layer, which maps deterministic physical and behavioral links between vehicle states, aerodynamic envelopes, driver input habits, and tyre thermodynamics.

The ECG ensures that all physical observations can be traced back to their fundamental root causes rather than simple, loose correlations.

---

## 1. Causal Node Taxonomy

### 1.1 `splitter_grounding` (Splitter Grounding)

- **Type**: `aero_state`
- **Trigger Conditions**: Packer compression collapses splitter ride height to zero.
- **Causal Targets**: `diffuser_seal_collapse` (`STALLS_DIFFUSER_FLOW`, `strength: high`)
- **Physics Truth Boundary**: `["deterministic_physics"]`

### 1.2 `diffuser_seal_collapse` (Diffuser Vacuum Stall)

- **Type**: `aero_state`
- **Trigger Conditions**: Loss of low-pressure diffuser venturi airflow seal.
- **Causal Targets**: `rear_traction_loss` (`COLLAPSES_REAR_DOWNFORCE`, `strength: high`)
- **Physics Truth Boundary**: `["deterministic_physics"]`

### 1.3 `rear_traction_loss` (Rear Axle Traction Loss)

- **Type**: `chassis_behavior`
- **Trigger Conditions**: Driven rear footprint slip threshold breached.
- **Physics Truth Boundary**: `["deterministic_physics"]`

### 1.4 `abrupt_brake_release` (Abrupt Brake Release)

- **Type**: `driver_input`
- **Trigger Conditions**: Trail braking release curve decays abruptly (+18% gradient slope variance).
- **Causal Targets**: `axle_lockup` (`OVERLOADS_FRONT_AXLE`, `strength: high`)
- **Physics Truth Boundary**: `["deterministic_physics", "behavioral_model"]`

### 1.5 `axle_lockup` (Front Axle Lockup)

- **Type**: `chassis_behavior`
- **Trigger Conditions**: Tyre sliding friction lockup under line pressure.
- **Causal Targets**: `fr_carcass_overheat` (`ESCALATES_FRICTION_CORE_HEAT`, `strength: high`)
- **Physics Truth Boundary**: `["deterministic_physics"]`

### 1.6 `fr_carcass_overheat` (FR Carcass Thermal Saturation)

- **Type**: `thermal_state`
- **Trigger Conditions**: Tyre core temperature saturates outside optimal operating limits (+14°C growth).
- **Causal Targets**: `rear_traction_loss` (`INDUCED_UNDERSTEER_FORCES_EXIT_SLIP`, `strength: medium`)
- **Physics Truth Boundary**: `["deterministic_physics", "historical_correlation"]`
