# Mechanical Consequence Graph (MCG) Catalog

This directory defines the **Mechanical Consequence Graph (MCG)** which formalizes the exact physical compromises associated with setup adjustments.

---

## 1. Consequence Profiles

### 1.1 `Increase Rear Wing Angle`
* **Primary Objective**: Stabilize rear platform during high-speed entry and mid-corner phases.
* **Semantic Chain**:
  * `increase_rear_wing`
    * `→` `increases_rear_vertical_load` (`strength: high`)
    * `→` `improves_rear_stability` (`strength: high`)
    * `→` `increases_aerodynamic_drag` (`strength: high`)
    * `→` `reduces_straightline_topspeed` (`strength: medium`)
    * `→` `shifts_aero_balance_rearward` (`strength: high`)
    * `→` `induces_highspeed_understeer` (`strength: medium`)
* **Physics Truth Boundary**: `["deterministic_physics"]`

### 1.2 `Soften Front Compression Damping`
* **Primary Objective**: Improve front compliance over rough surfaces and curbs.
* **Semantic Chain**:
  * `soften_front_compression`
    * `→` `improves_curb_compliance` (`strength: high`)
    * `→` `smooths_initial_turnin_load_transfer` (`strength: medium`)
    * `→` `increases_dynamic_pitch_rate` (`strength: high`)
    * `→` `increases_splitter_grounding_risk` (`strength: high`)
    * `→` `slows_steering_transient_response` (`strength: medium`)
* **Physics Truth Boundary**: `["deterministic_physics", "historical_correlation"]`

### 1.3 `Stiffen Differential Lock (Power/Entry)`
* **Primary Objective**: Stabilize driven axle footprint under acceleration or deceleration.
* **Semantic Chain**:
  * `stiffen_differential_lock`
    * `→` `equalizes_wheel_speeds_driven_axle` (`strength: high`)
    * `→` `improves_traction_on_exit_throttle` (`strength: high`)
    * `→` `increases_snap_oversteer_risk` (`strength: high`)
    * `→` `reduces_yaw_rotation_long_midcorner` (`strength: medium`)
* **Physics Truth Boundary**: `["deterministic_physics"]`

### 1.4 `Increase Tyre Pressures`
* **Primary Objective**: Stabilize tyre tread footprint and increase carcass structural stiffness.
* **Semantic Chain**:
  * `increase_tyre_pressures`
    * `→` `increases_tyre_carcass_spring_rate` (`strength: high`)
    * `→` `improves_highspeed_stability_and_response` (`strength: medium`)
    * `→` `reduces_friction_sliding_footprint` (`strength: medium`)
    * `→` `reduces_tyre_deflection_heating` (`strength: high`)
    * `→` `reduces_peak_mechanical_grip` (`strength: medium`)
* **Physics Truth Boundary**: `["deterministic_physics", "historical_correlation"]`
