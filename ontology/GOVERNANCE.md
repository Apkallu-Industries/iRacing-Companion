# Motorsport Ontology Governance Protocol

This document serves as the formal governance specification for the **Motorsport Ontology Kernel**, the core operating system kernel for our motorsport intelligence infrastructure. 

Like the Linux kernel or aerospace aviation schemas, this ontology enforces strict semantic discipline, backward compatibility guarantees, and deterministic telemetry-to-narrative mapping.

---

## 1. Core Principles

1. **Semantic Separation**: The ontology is the absolute boundary between raw sensor telemetry (streams of high-frequency float/int vectors) and semantic motorsport intelligence (classified events, stateful handling episodes, causal relations, driver traits, and stint narratives).
2. **Deterministic Replayability**: Given identical raw telemetry, a specific ontology kernel version, a heuristics engine pack, and an engineering personality, the platform *must* reproduce identical events, causal nodes, and engineering recommendations.
3. **Mechanical Integrity**: Artificial Intelligence (LLM) layers are strictly decoupled interfaces. They consume only verified, structured ontological payloads and are prohibited from directly interpreting raw sensor values or bypassing the ontology.

---

## 2. Naming & Structural Conventions

To prevent architectural decay, all semantic models, schemas, and payloads must comply with the following strict naming constraints:

### 2.1 Casing Rules
* **Event Types & Causal Relations**: Must use `UPPER_SNAKE_CASE` (e.g., `ENTRY_OVER_ROTATION`, `AERO_BOTTOM_OUT`, `COLLAPSES_REAR_DOWNFORCE`).
* **Object Properties & Fields**: Must use `camelCase` (e.g., `lapNumber`, `triggerChannel`, `mitigationAdvised`).
* **Sensor Evidence Metrics**: Must exactly mirror iRacing SDK variable channels or standard `extras` (e.g., `LFbrakeLinePress`, `YawRate`).

### 2.2 ID Prefixes
All primary identifiers must be typed, descriptive, and use lowercase alphabetical prefixes followed by an underscore:
* `evt_` : Telemetry Events (e.g., `evt_8b9a2c3d`)
* `eps_` : Stateful Handling Episodes (e.g., `eps_4f8c2b1a`)
* `rec_` : Recommendation Lineage Logs (e.g., `rec_9d7e6f5c`)
* `drv_` : Driver DNA Longitudinal Profiles (e.g., `drv_hamilton_2026`)
* `ses_` : Session Narratives (e.g., `ses_monza_p1`)

---

## 3. Physics Truth Boundary

To prevent AI hallucination, setup overreach, and engineering credibility decay, every semantic recommendation and event priority must declare a structured `sourceType` containing one or more of the following classified validation tiers:

| Tier | Name | Description |
|---|---|---|
| **Tier 1** | `deterministic_physics` | Hard physical limits, conservation of energy, direct mechanical calculations, sensor thresholds (e.g., locking a wheel at >82% line pressure with >15% wheel speed variance, suspension grounding out). |
| **Tier 2** | `historical_correlation` | Statistical pattern matching across previous laps, sessions, or aggregated setups (e.g., tire degradation trends relative to ambient temps compared to historical baselines). |
| **Tier 3** | `behavioral_model` | Empirical driver style preferences, entry rotation tolerances, mental load classifications, and habit tracking (e.g., early throttle application preference, rapid steering rate inputs). |
| **Tier 4** | `probabilistic_projection` | Stochastic forecasts and projections of dynamic variables (e.g., remaining tire wear over a 30-lap stint, wet track evolution timelines, fuel reserve windows under yellow-flag conditions). |

---

## 5. The Unification Doctrine (Permanent Architecture)

Every setup recommendation must originate from live semantic telemetry evidence, causal reasoning, driver behavior context, and session evolution state. 

**Setup Intelligence** and **Live Race Intelligence** are not separate features; they are inseparable views into the same active session ontology graph.
- Never allow setup recommendations to exist without live semantic evidence.
- Never allow live telemetry insights to exist without mechanical interpretation.

---

## 6. Mechanical Consequence Graph (MCG) & Tradeoff Principles

No setup recommendation exists in isolation; every mechanical change is a compromise. The reasoning kernel enforces this compromise via the Mechanical Consequence Graph, which maps setup changes to expected gains and dynamic compromises.

Every arbitrated setup adjustment must simulate and log:
1. **Expected Gain**: Primary targeted dynamic improvement (e.g., front-axle bite, mid-corner curb compliance).
2. **Expected Compromise**: Cascading physical penalty (e.g., increased drag, high-speed aerodynamic balance shift, rear instability on turn-in).
3. **Corner Archetype Influence**: Where on the track the effect is most pronounced (e.g., slow-speed hairpins, high-speed sweepers, curb compression zones).
4. **Session Lifecycle Projection**: How the change interacts with stint evolution variables (fuel decay weight, track rubber buildup, carcass thermal wear).

---

## 7. Closed-Loop Learning & Heuristic Validation

To close the loop, the operating system kernel mandates empirical outcome validation for all recommendations. Closed-loop validation compares on-car telemetry before and after an applied mechanical adjustment to evaluate dynamic outcome reality.

### 7.1 Dynamic Stabilization Horizon Matrix
Setup adjustments require different evaluation timelines for tyres, aerodynamics, and mechanical spring compliance to settle into stable envelopes. The validation window must be calculated dynamically:

| Adjustment Category | Target Stabilization Horizon | Justification |
|---|---|---|
| **Differential Preload** | 2 laps | Instant lock-slip stabilization; minimal carcass thermal lag. |
| **Tyre Pressures** | 2–3 laps | Requires rolling tread friction cycles to stabilize tire carcass spring rates. |
| **Aero Rake / Wings** | 3–5 laps | Dynamic heave stabilization across high-speed compression and low-speed pitch sectors. |
| **Ride Heights / Packers** | 3–5 laps | Grounding occurrence statistics require sector-by-sector compression passes. |
| **Spring Rates / Dampers** | 4–6 laps | Requires multi-lap driver adaptation, spring settlement, and carcass equilibrium. |

### 7.2 Correlation Contamination Safeguards (Confidence Attribution)
To prevent the system from learning false engineering lessons, every validation outcome must isolate the isolated setup impact by attributing pace and stability changes across co-factors:
- **`setupContribution`**: The isolated mechanical effect of the change.
- **`environmentContribution`**: Pace variations originating from track rubbering, wind, or track temp drops.
- **`driverAdaptation`**: Pace variations originating from smoother steering and brake release gradients.
- **`stochasticVariance`**: Placebos, traffic margins, and random sector variances.

### 7.3 Epistemological Protection against Physics Mutation
The operating system kernel strictly prohibits automatic heuristic mutation. The engine must never silently rewrite or generate core physics formulas. Adaptive learning is strictly confined to:
* Calibrating recommendation confidence weights based on attribution feedback.
* Storing audited historical outcomes in the session lineage.
* Proposing major heuristic adjustments to human engineers for review.

---

## 8. Heuristic Version Lineage & Reputation Registry (Stage 8)

All mechanical setup rules are isolated into a versioned **Heuristic Reputation Registry**. This registry guarantees absolute historical reproducibility and tracks performance indicators.
- **Heuristic Lineage**: Every recommendation must log its active `heuristicId` and `heuristicVersion` inside `RecommendationLineage`.
- **Absolute Reproducibility**: Replay engines must load the identical historical heuristic version to guarantee identical narratives and setup outputs.
- **Reputation Tracking**: Every heuristic maintains a success rate, average gains, and active confidence weights derived from closed-loop validation history.

---

## 9. Contextual Similarity Weighting (Stage 9)

Closed-loop calibration must operate contextually. To prevent cross-environment calibration contamination, the calibration coefficient of any closed-loop evaluation is multiplied by a similarity multiplier before updating the registry.

Learning weight shifts scale based on matching stint profiles:
1. **Track Layout Similarity**: Match slow-speed chicanes, high-speed sweepers, or heavy braking zones.
2. **Thermal Similarity**: Match ambient and track temperature ranges, alongside carcass optimal friction envelopes.
3. **Vehicle Profile Similarity**: Match aeromechanical downforce compression (GT3 vs. GTP prototypes).

---

## 10. "Modify Before Create" Extension Doctrine (Anti-Entropy Rule)

The Motorsport Ontology Kernel strictly enforces a **Modify Before Create** extension policy. Parallel implementations, duplicated utilities, alternate schemas, or shadow reasoning channels are dangerous and represent architecture corruption vectors.
- **Subsystem Reuse**: If a subsystem already models a physical concept, developers *must* extend it rather than writing a duplicate file.
- **Schema Evolution**: Existing schemas and typescript interfaces must be versioned, expanded, or compositionally layered rather than creating shadow abstractions.
- **New File Restriction**: Creating new modules is only permitted when introducing a genuinely new, bounded domain boundary, a new persistence contract, or a completely isolated reasoning engine.

---

## 11. Single Source of Truth (SSOT) & Telemetry Containment

To preserve conceptual purity, no subsystem or frontend UI component may replicate or bypass active session-intelligence logic.
- **Abstractions**: Telemetry mapping, setup confidence, recommendations, heuristics, or environmental similarity evaluations are owned strictly by the reasoning kernel.
- **No Raw Telemetry Leakage**: Raw telemetry interpretative calculations are strictly sandboxed. Strategic dashboard widgets and LLM communication wrappers consume only unified semantic primitives (`TelemetryEvent`, `EngineeringEpisode`, `CausalityNode`, and `UnifiedRecommendation`).
- **epistemological Control**: Frontends are prohibited from creating parallel reasoning logic or interpreting raw sensor traces independently, avoiding reasoning divergence.
