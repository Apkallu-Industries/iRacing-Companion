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

## 4. Versioning & Evolution Policy

The Motorsport Ontology Kernel adheres to **Strict Semantic Versioning (SemVer 2.0.0)**.

### 4.1 Version Schema (`MAJOR.MINOR.PATCH`)
* **PATCH**: Non-functional schema changes, typo corrections, or documentation updates (e.g., `1.0.0` -> `1.0.1`).
* **MINOR**: Backward-compatible schema additions (e.g., adding an optional property to a schema, introducing a new non-breaking event type to the `RaceEventType` catalog) (e.g., `1.0.0` -> `1.1.0`).
* **MAJOR**: Breaking schema changes, field removals, property renames, or structural adjustments that break existing data parsing logic or replay engines (e.g., `1.0.0` -> `2.0.0`).

### 4.2 Controlled Evolution (Change Review Board)
Any proposed change to the ontology kernel must go through a formal Change Review:
1. **Schema Check**: Proposed changes must be mapped inside `/ontology/<layer>/schema.json`.
2. **Translation Gateway**: If a field is renamed or removed in a `MAJOR` version, a backward-compatibility translation wrapper *must* be added to the ingest layer to translate historical telemetry storage into the current version.

### 4.3 Deprecation Policy
1. **Phase 1: Soft Deprecation** (Minor Version Release):
   * Add the `"deprecated": true` attribute to the JSON Schema.
   * Mark TypeScript interfaces with the `@deprecated` JSDoc annotation.
   * Emit descriptive warnings in development logs detailing the migration path.
2. **Phase 2: Hard Removal** (Next Major Version Release):
   * The field is removed from the active schema.
   * The translation gateway maps any historical data still using this field to the replacement field or falls back gracefully.

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
