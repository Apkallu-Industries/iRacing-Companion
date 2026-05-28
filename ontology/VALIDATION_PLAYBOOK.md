# Motorsport Systems Validation Playbook
### The Core Protocol for Causal, Semantic, & Closed-Loop Integrity

This document establishes the formal **Systems Validation Playbook** for Pit Wall. 

Before deploying autonomous strategy systems or running multiclass endurance sessions, this playbook mandates a highly disciplined, scientific validation program. The objective is not to showcase features or chase lap times, but to verify that **the causal engineering loop remains completely coherent and physically truthful under pressure.**

---

## 1. The Validation Stints Matrix ( Watkins Glen / Okayama Baseline)

To isolate clear signals and prevent correlation contamination, all Stage 1 validation stints must be conducted under strictly controlled, single-variable environmental profiles.

| Variable | Target Profile | Justification |
|---|---|---|
| **Vehicle Class** | GT3 (e.g., Ferrari 296 GT3 or BMW M4 GT3) | Predictable aero rake responses, well-mapped tire heating envelopes. |
| **Track Selection** | Watkins Glen International (Boot layout) or Okayama | Stable track geometry, highly repeatable lines, distinct corner load zones. |
| **Session Length** | 8 to 12 laps per stint | Captures complete tire carcass temperature normalization and fuel decay. |
| **Weather Profile** | Fixed (Fixed ambient, zero dynamic wind drift) | Excludes environmental co-factor noise from dynamic similarity weights. |
| **Adjustments** | Single-variable only (e.g. rebound damping OR anti-roll bar) | Isolates physical causal transfer rates from compounding changes. |
| **Tire Lifecycle** | Reset / Fresh sets at every stint transition | Keeps carcass structural stiffness and sliding friction baselines stable. |

---

## 2. Four-Phase Validation Protocol

Every validation stint must run through the following structured verification scans:

### Phase A: Telemetry Truth Validation (Physical Integrity)
Audits the reliability of high-frequency sensor inputs at the kernel boundary before semantic event classification occurs.
* **Audit Checklist**:
  * [ ] **Brake Pedal Decelerations**: Verify `BrakeLinePressureLF` matches driver pedal percentage values.
  * [ ] **Rotational Accelerations**: Audit `YawRate` derivatives to verify yaw acceleration calculation accuracy.
  * [ ] **Suspension Displacements**: Check if `LFshockDefl` bottoming ticks represent true mechanical packer limits.
  * [ ] **Timestamp Drift**: Confirm zero latency or out-of-order frame sequences between the bridge stream and the local telemetry store.

### Phase B: Event Classification Validation (Semantic Integrity)
Audits the mapping of raw telemetry frames into structured ontology classifications.
* **Audit Checklist**:
  * [ ] **Anomaly Thresholds**: Verify `BRAKE_LOCK_FRONT_LEFT` triggers ONLY when brake pressure exceeds 82 Bar and wheel speed mismatch is > 15%.
  * [ ] **Confidence Ratings**: Ensure `REAR_TRACTION_COLLAPSE` returns a dynamic heuristic confidence relative to slip severity.
  * [ ] **Persistence Scans**: Verify that consecutive events across laps increment the `persistence` metric correctly.
  * [ ] **Stateful Episode Assembly**: Confirm that three consecutive rear thermal overloads successfully group into a `Rear Tire Thermal Saturation Cascade` episode.

### Phase C: Recommendation Integrity (Reasoning Coherence)
Audits the causal link between inferred mechanical faults and tradeoff recommendations.
* **Audit Checklist**:
  * [ ] **Tradeoff Veracity**: Verify that every damper recommendation includes its expected mechanical gain and transient compromise.
  * [ ] **Lineage Citation**: Confirm that the proposed action carries a verified citation source (e.g., Carroll Smith Heuristics).
  * [ ] **Uncertainty Attribution (Scientific Humility)**: Test if the system correctly downgrades recommendation confidence to < 50% under contradictory evidence (e.g., high tire temps but high lateral yaw slip on an abrasive track).
  * [ ] **Reasoning Replay Fidelity**: Verify that running the raw stint telemetry back through the sandboxed replay container reproduces an identical recommendation lineage.

### Phase D: Closed-Loop Validation (Dynamic Calibration)
Audits the self-calibrating learning loop after an applied setup adjustment.
* **Audit Checklist**:
  * [ ] **Stabilization Horizon**: Confirm that the post-intervention scanner delays analysis by the dynamically calculated lap window (e.g., 5 laps for rebound damping).
  * [ ] **Co-Factor Partitioning**: Check the `ClosedLoopFeedback` attribution output to verify that fuel weight burn-off (approx. `0.02s` per lap) and driver input smoothing are isolated from the `setupContribution`.
  * [ ] **Calibration Gateway**: Verify that the historical `HeuristicVersionEntry` confidence weight shifts appropriately (+ for success, - for failure) without silently mutating the base physics formulas.

---

## 3. The "Scientific Humility" Drills

To verify that the platform expresses uncertainty rather than hallucinated confidence, engineers must execute two validation drills:

### Drill 1: Contradictory Evidence Stress Test
* **Setup**: Deliberately inject highly erratic driver inputs (rapid steering velocity pumps) under extremely hot track temperatures (> 50°C), while maintaining perfect mechanical ride heights.
* **Expected Output**: The system must downgrade overall recommendation confidence, defer absolute setup recommendations, and flag:
  `WARNING: Low-confidence envelope. High driver input variance and extreme track temperatures are masking mechanical suspension signatures. Deferring setup adjustments; request more consistent trail-braking laps.`

### Drill 2: Incomplete Sensor Drill
* **Setup**: Disable or zero out high-fidelity extras (e.g., mock zero values for `LFshockDefl`).
* **Expected Output**: The engine must downgrade its `deterministic_physics` validation rating, flag an incomplete telemetry warning, and fallback to `historical_correlation` with restricted delta adjustments.

---

## 4. Engineering Validation Report (EVR) Template

For every validation stint executed on the platform, the testing engineer must compile and save an EVR using the following standardized markdown template in the validation archive:

```markdown
# Engineering Validation Report (EVR)
**Stint Identifier**: `evr_YYYYMMDD_[car]_[track]_stint[N]`
**Ontology Version**: `1.0.0`
**Heuristic Version**: `1.0.0`

## 1. Session Parameters
* **Car**: [e.g., Ferrari 296 GT3]
* **Track**: [e.g., Watkins Glen - Boot]
* **Environmental Profile**: [e.g., Dry, Fixed Weather, Track Temp 32°C]
* **Stint Length**: [e.g., 10 Laps]
* **Applied Intervention**: [e.g., Stiffen Rear Rebound +1 click]

## 2. Dynamic Baselines (Pre-Intervention)
* **Primary Limitation Flagged**: [e.g., Rear platform instability under braking]
* **Observed Metrics**:
  * Bottoming Count: [e.g., 4 events]
  * Exit Slip Waste: [e.g., 2.4%]
  * FR Carcass Thermal Growth: [e.g., +8.2°C]
  * Average Yaw Rate: [e.g., 0.28 rad/s]

## 3. Closed-Loop Validation (Post-Intervention)
* **Dynamic Stabilization Window**: [e.g., 5 laps]
* **Expected Gain Met?**: [YES / NO]
* **Compromise Worse Than Forecast?**: [YES / NO]
* **Empirical Pace Delta**: [e.g., -0.145s]
* **Validation Outcome Status**: [e.g., SUCCESS_VERIFIED]

## 4. Confidence Attribution Split
* **Setup Contribution**: [e.g., 65%]
* **Environment Contribution (Fuel/Track)**: [e.g., 20% (10 Laps = 0.20s decay)]
* **Driver Adaptation (Steering/Brake)**: [e.g., 10%]
* **Stochastic Variance (Noise)**: [e.g., 5%]

## 5. Epistemological Audit Logs
* **Closed-Loop Audit**: [Insert literal feedbackNarrative output]
* **Attributed Confidence Delta**: [e.g., +10]
* **Heuristic activeConfidenceIndex Shift**: [e.g., 78% -> 88%]
```

---

## 5. Distributed Synchronization Integrity Validation Matrix

To verify that the platform functions reliably as high-performance **motorsport operational middleware**, engineers must audit the synchronization integrity across the following seven architectural layers.

| Middleware Layer | Validation Target | Verification Criteria & Success Bounds |
|---|---|---|
| **Cockpit HUD** | Latency Stability | Telemetry buffer updates must render at 60Hz. Layout paint and script execution frames must maintain `< 16ms` (60 FPS) to minimize driver cognitive load under high stress. |
| **Telemetry Bridge** | Reconnect Resilience | Auto-reconnect routines must poll every `3` seconds when the WebSocket drops, and automatically backoff to prevent socket descriptor leaks. |
| **Team Sync** | Multi-driver Consistency | Realtime relay channel broadcasts to `team:{teamCode}` must operate at `2Hz` without crossing driver payloads or producing packet overlaps. |
| **Relay Layer** | Packet Continuity | Supabase Realtime channel state changes must handle transient drops safely. Packets received must be parsed immediately; dropped packets must flag a graceful fallback rather than desynchronizing active feeds. |
| **Configuration Runtime** | Hot Reload Safety | Submitting new configurations to `/api/driver/config` must hot-reload credentials (`process.env.DRIVER_NAME`, `process.env.TEAM_CODE`) instantly at runtime without dropping active streams or corrupting internal states. |
| **Session Identity** | Authoritative Mapping | `vehicleIdentityRuntime` must act as the SOLE MUTATION INVARIANT for active driver tracking. Identity shifts must trigger authoritative `DRIVER_SWAP` state reductions and increment stint counts, without duplicates. |
| **Replay Capture** | Timestamp Integrity | Telemetry recordings written to MongoDB must group samples under exact epoch alignments, matching sequences, and correct temporal sorting order for playback fidelity. |

---

## 6. Four Distributed Synchronization Scenario Drills

To aggressively stress-test the system and verify zero state divergence, engineers must execute the following four distributed scenarios in active simulation or simulated hardware loops:

### Scenario 1: Driver Swap Integrity Drill
* **Setup**: 
  1. Set up an active session with Driver A streaming live telemetry to a team paddock.
  2. Disconnect Driver A's local bridge (simulate pit-stop handoff).
  3. Connect Driver B's local bridge pre-configured with a new name and iRacing customer ID.
* **Audit Checklist & Invariants**:
  * [ ] **Authoritative Detection**: Verify `vehicleIdentityRuntime` registers a single, clean `DRIVER_SWAP` delta and prints: `[vehicle-identity] DRIVER SWAP: Driver A -> Driver B`.
  * [ ] **Stint Continuity**: Confirm that `currentStint.stintNumber` increments strictly by `+1` and `lapStart` updates to the active swap lap.
  * [ ] **History Preservation**: Check that cumulative mechanical fatigue histories (chassis wear, brake wear, gearbox stress) are preserved continuously across the swap.
  * [ ] **No Replay Corruption**: Confirm that the replay record written to MongoDB lists both driver epochs distinctively without overlapping timestamps or duplicate sequence IDs.

### Scenario 2: Bridge Reconfiguration During Session Drill
* **Setup**:
  1. While a live telemetry stream is running, trigger a runtime override by submitting a POST request to `/api/driver/config` with updated driver metadata and team code.
* **Audit Checklist & Invariants**:
  * [ ] **Hot Swap Execution**: Verify that `process.env.DRIVER_NAME`, `process.env.IRACING_ID`, and `process.env.TEAM_CODE` update instantly in bridge runtime memory.
  * [ ] **Smooth Re-binding**: Verify `teamRelay` cleanly disconnects from the old channel and subscribes to the new `team:{newTeamCode}` channel within `< 500ms`.
  * [ ] **No State Divergence**: Verify that downstream projections continue to read the same telemetry packets uninterrupted, with zero duplicates or mismatched mappings.

### Scenario 3: Temporary Network Instability Drill
* **Setup**:
  1. Sever the network interface during an active, high-speed stint to simulate a dynamic packet drop cascade.
  2. Maintain the local bridge telemetry buffer running.
  3. Restore the network interface after `45` seconds.
* **Audit Checklist & Invariants**:
  * [ ] **Stale Telemetry Detection**: Verify that the remote Team Command page marks the driver as offline (`isOnline = false`) precisely `30` seconds after the last received packet.
  * [ ] **Local Capture Resilience**: Confirm that the local bridge continues to write 60Hz telemetry ticks to the database buffer uninterrupted.
  * [ ] **Reconnection & Realignment**: Verify that the remote client auto-reconnects, subscribes to the realtime channel, and resumes live paddock readouts immediately upon network restoration.

### Scenario 4: Team + Cockpit Synchronization Drill
* **Setup**:
  1. Run a live session and place the Cockpit HUD and the Team Command Strategic Dashboard side-by-side.
  2. Trigger dynamic events (e.g., lock-ups, traction slips, ERS deploys) in the simulator.
* **Audit Checklist & Invariants**:
  * [ ] **Timeline Congruence**: Verify that incident flags (e.g., `BRAKE_LOCK`) appear on both screens with `< 100ms` delta latency.
  * [ ] **Recommendation Identity**: Confirm that strategic advice and fuel burn targets computed by the AI Race Strategist are identical in semantic output across both interfaces.
  * [ ] **Semantic Consistency**: Verify that there is zero divergence in active status readouts, ensuring that the driver and the race engineer act on the same mathematical and logical truth.

---

## 7. Replay Determinism Verification (Deterministic Loop Audit)

To guarantee that Pit Wall acts as a mathematically reliable motorsport trust layer, we enforce **strict replay determinism**. Given identical physical inputs, the system must emit identical semantic inferences and strategic decisions across all runtimes.

### The Equation of Replay Determinism
```text
f(TelemetryInputs, HeuristicVersion) = CanonicalOntologyProjection
```
This mathematical invariant dictates that:
1. **No Temporal Jitter**: The resolution of raw telemetry into classified events must be independent of real-time execution speeds or runtime host architectures.
2. **No Platform Mismatch**: Running the same raw `.ibt` buffer or JSON ticks sequence must yield the identical `stateHash` on a local Windows desktop and a remote Linux worker.

### 7.1 Deterministic Ordering Guarantees

Under high network load or connection packet storms, TCP/WS frame arrival orders can shuffle, async reductions can reorder, WebSocket client buffering can differ, and event batching becomes nondeterministic. To prevent state divergence between concurrent strategists and guarantee absolute replay determinism, the platform enforces strict **Deterministic Ordering Guarantees** across all ingestion, reduction, and playback boundaries.

Engineers must guarantee the following invariants across the system:
1. **Sequence IDs & Monotonic Timestamps**: Every telemetry packet is assigned a strictly incrementing, monotonic sequence ID and physical timestamp at the kernel bridge level. Mismatching or backward-stepping timestamps are rejected.
2. **Ontology Event Ordering**: All temporal semantic classifications must only execute on sequence arrays that are pre-sorted chronologically.
3. **Reduction Ordering**: Telemetry state reducers (such as tyre thermal growth and chassis fatigue) must never process inputs concurrently or out-of-order.
4. **Replay Sort Normalization**: Prior to launching any playback, sandboxed replay simulation, or bulk ingestion, the dataset must go through a canonical sort-normalization pass.

> [!IMPORTANT]
> **Example Invariant**: All telemetry reductions and event classifications must sort and process inputs strictly on `(sequenceId ASC, timestamp ASC)` sorting keys before they are pushed to the ontology projection or event taxonomy layers.
> Without this explicit normalization, cross-host replay determinism eventually breaks under packet jitter or reconnect storms.

- **Out-of-Order Mitigation**: Any frames arriving out-of-order or duplicate sequences must be normalized or discarded at the ingest buffer boundary before they are written to the database or ingested by the authoritative state machines.

### 7.2 Deterministic Audit Drill
* **Procedure**:
  1. Parse a standard 10-lap stint `.ibt` log on Host A (Windows local dev environment). Record the final `stateHash` and emitted strategies array.
  2. Parse the same `.ibt` buffer on Host B (Docker sandboxed container or separate machine).
  3. Compare the generated outputs.
* **Success Invariant**:
  * [ ] **State Hash Match**: The resulting `stateHash` printed by `vehicleIdentityRuntime` must match 100% character-for-character.
  * [ ] **Episode Convergence**: The reconstructed chronological sequence of episodes and incident lists must be identical.
  * [ ] **Attribution Identity**: The strategic fuel burn targets and setup recommendation trees must match exactly, proving zero reasoning drift.

### 7.3 Canonical State Hashing & SHA256 Invariants
To move beyond simple "integrity checks" into mathematically provable determinism, the platform implements **Deterministic State Hashing** at the boundary of every ontology projection cycle.
* **The Invariant Formula**:
  ```text
  stateHash = SHA256( canonicalize( AICommunicationPayload ) )
  ```
* **Authoritative Crypto Wrapper**: Rather than using handwritten hashing routines, the system enforces complete cryptographic correctness using native platform-validated APIs via a single unified module:
  - **Browser/Worker Contexts**: Natively leverages `crypto.subtle.digest("SHA-256", ...)` (the SubtleCrypto API).
  - **Node.js Contexts**: Natively leverages Node's `crypto.createHash("sha256")`.
* **Floating-Point Precision Freeze**: To prevent false replay divergence arising from micro-discrepancies in cross-runtime float arithmetic (e.g., `0.30000000000000004` vs `0.3`), the canonicalization algorithm freezes all floating-point numbers to exactly **6 decimal places** (`Number(n.toFixed(6))`) prior to serialization.
* **Canonical Boundary**: The hashing envelope is strictly restricted to the canonical ontology projection payload (`AICommunicationPayload`), completely excluding transient UI states, WebSocket timing variables, and debug fields.

### 7.4 The Determinism Regression Firewall
We establish a **Regression Firewall** powered by a central suite of golden replay snapshots.
* **Golden Directory**: `/validation/golden-replays/`
* **Golden Snapshots**: Hold canonical ontology projections, expected recommendation outputs, lineage, and confidence states (`gt3_watkins_golden.json`). Following the **Anti-Entropy Doctrine**, golden datasets never duplicate raw telemetry reductions, keeping the telemetry source strictly authoritative.
* **CI Integration**: Every CI/CD build runs the regression validation suite:
  ```bash
  npm run validate:determinism
  ```
  This command acts as a hard stop. Any structural change in the code that alters inferences, shifts confidence calibrations, or breaks handling equations will trip the firewall by altering the state hash, preventing accidental regressions.
* **Forensic Ledger**: Every validation execution writes a standardized `determinismReport.json` audit ledger logging:
  - Expected vs actual state hashes.
  - Active event and recommendation counts.
  - Granular confidence graphs.
  - Replay duration times and runner environment metadata.

### 7.5 Heuristic & Recommendation Drift Detection
As the strategic models and engineering heuristics evolve, we must prevent "silent history rewriting." We enforce **Replay Drift Detection** within the verification suite:
* **The Process**: Replay historical telemetry logs, generate current ontology projections, and match them against original historical expected outputs.
* **Divergence Metrics Tracked**:
  1. **Ontology Drift**: Additions, deletions, or structural parameter changes in classified events.
  2. **Confidence Drift**: Drift in calibration indices or baseline confidence indexes.
  3. **Recommendation Divergence**: Setup adjustments, mechanical gain variances, or lineage citation drift.
  4. **Similarity Weighting Variance**: Drift in track profile co-factors.
  
This allows engineers to tune physics margins safely, with complete visibility into how changes affect strategic advice across historical stints.

### 7.6 Future Upgrade Path: Partial Deterministic Hashes
For large replay corpora, pinpointing exactly which subsystem triggered a stateHash divergence can be resource-intensive. To optimize forensic scaling, a planned upgrade path introduces **Partial Deterministic Hashes**:
* **Subsystem Hashing**:
  - `eventHash = SHA256( canonicalize( ontologyEvents ) )`
  - `recommendationHash = SHA256( canonicalize( provenRecommendations ) )`
  - `episodeHash = SHA256( canonicalize( activeEpisodes ) )`
  - `confidenceHash = SHA256( canonicalize( confidenceGraph ) )`
* **Strategic Value**: When regression tests mismatch on the main `stateHash`, the verification firewall immediately audits these partial hashes. This allows the system to instantly isolate whether the drift is caused by a changed incident threshold (dynamics/thermals), a adjusted confidence decay model, or a re-weighted recommendation trade-off, significantly speeding up large-scale paddock debugging.

---

## 8. Telemetry Load & Stress Testing Limits

As motorsport operational middleware, the local bridge and paddock sync layer must maintain strict performance bounds under extreme concurrency and high network stress.

### High-Concurrency Performance Tolerances

| Stress Condition | Minimum Target Profile | Maximum Allowed Boundary | Validation Audit Invariant |
|---|---|---|---|
| **Simultaneous Drivers** | `10+` active car connections streaming at 60Hz. | `15` concurrent streams. | CPU usage of isolated analytic worker `< 15%`; Heap memory `< 120MB`. |
| **Network Jitter** | Synthetic packet latency of `150ms`. | `300ms` continuous jitter. | 0% frame drops in local database recording buffer. |
| **Reconnect Storms** | `5` simultaneous socket client drops and reconnects per second. | `10` drops/reconnects/sec. | Zero event loop lag spikes (`< 10ms`); no memory leaks or socket descriptor exhaustion. |
| **Replay Ingestion** | Full-stint `.ibt` parsing in worker thread while live session is active. | Background parse of `100MB` file. | Main thread frame execution tick time remains `< 16.6ms` (60Hz telemetry ingest invariant). |
| **Strategist Access** | `5` strategists querying Supabase team channel simultaneously. | `12` concurrent subscriptions. | Zero relay duplication or state desynchronization in Paddock Live HUD grid. |

---

## 9. EVR Corpus Governance & Anti-Entropy Doctrine

This is one of the highest long-term value sections of the Pit Wall platform. Our accumulated **Engineering Validation Reports (EVRs)** are no longer simple "session notes." Instead, they represent:
* **A Structured Motorsport Cognition Corpus**
* **A Heuristic Calibration Ledger**
* **Future Reinforcement-Learning Truth Data**

This corpus becomes extremely valuable over time because it captures setup deltas, environmental context, driver behavior, causal episodes, expected tradeoffs, actual outcomes, confidence evolution, and similarity-weighted validation. This cognitive database is vastly more valuable than raw telemetry alone.

### 9.1 The Anti-Entropy Doctrine
> [!CAUTION]
> **Parallel Logic Forks = Critical Architecture Invariant Failure**
> This wording is intentionally severe. Duplicate logic paths are the fastest way to destroy deterministic replay, heuristic trust, calibration reproducibility, and ontology coherence.

To prevent cognitive model divergence and guarantee complete trust, the following areas must remain **single-authority modules**:
1. **Telemetry Parsing**
2. **State Reductions**
3. **Event Synthesis**
4. **Confidence Calculations**
5. **Identity Mutation**
6. **Replay Reconstruction**

Any attempt to recreate, duplicate, or fork these processes in client-side widgets, helper scripts, or external utilities is strictly prohibited. If logic needs to change, engineers must modify the single authoritative module directly.

### 9.2 EVR Physics Corpus Rules
- Every validation stint must produce a verified Engineering Validation Report committed to the validation ledger.
- Reports must list the exact `Ontology Version` and `Heuristic Version` utilized.
- Pace deltas and attributed mechanical setup contributions (`setupContribution%`) must carry active proof metadata to prevent unverified correlation entries.

### 9.3 Deterministic Authority Boundaries
To prevent helper utilities and contributors from slowly recreating logic externally, we define explicit boundaries of authority. The following modules hold **sole authority** for their respective responsibilities:

| Responsibility | Sole Authority | Governance Standard |
|---|---|---|
| **Driver Identity** | `vehicleIdentityRuntime` | Authoritative reducer for tracking driver swaps, epochs, and stint boundaries. |
| **Telemetry Reduction** | `simulationRuntime` | Authority for stint counterfactual physics, tyre thermal models, and lap projections. |
| **Ontology Projection** | `eventTaxonomy` | Authority for classifying raw frames into semantic event labels and episode groups. |
| **Recommendation Generation** | `mechanicalReasoningEngine` | Authority for parsing mechanical limitations and formulating setup compromises. |
| **Confidence Calibration** | `setupConfidence` | Authority for adjusting active heuristic weights based on closed-loop pace delta. |
| **Similarity Weighting** | `heuristicRegistry` | Authority for computing track temperature co-factors and dynamic track profiles. |
| **Replay Migration** | `ontology/migrations` | Authority for validating schema structural formats and structural ledger shifts. |

No auxiliary "helper utility" or page component is permitted to duplicate, bypass, or re-implement logic belonging to these authorities.
