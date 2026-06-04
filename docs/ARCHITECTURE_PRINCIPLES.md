# Pit Wall Architecture Principles

### The Constitution of Motorsport Causal Intelligence

This document establishes the **Architectural Constitution** of Pit Wall. It explains the core system boundaries, reasoning philosophy, extension doctrines, and anti-entropy rules that govern the platform.

This constitution serves as a permanent architectural safeguard to ensure that every future code contribution—whether by human or AI—preserves the purity of the reasoning kernel.

---

## 1. The Epistemological Hierarchy

To maintain absolute engineering credibility, all intelligence inside the platform is structured under a strict causal truth hierarchy. Under no circumstances may a higher-level abstract recommendation bypass or contradict a verified physical lower-level truth.

```
┌──────────────────────────────────────────────────────────┐
│ LEVEL 4: PROBABILISTIC FORECASTING (Stochastic Horizon)   │
│ Projections of dynamic wear, fuel strategy, and weather  │
├──────────────────────────────────────────────────────────┤
│ LEVEL 3: BEHAVIORAL INTERPRETATION (Driver DNA Profile)  │
│ Longitudinal habits, preferences, and entry rotation     │
├──────────────────────────────────────────────────────────┤
│ LEVEL 2: STATISTICAL CORRELATION (Historical Context)    │
│ Multi-session track trends, temp deltas, similarity logs  │
├──────────────────────────────────────────────────────────┤
│ LEVEL 1: DETERMINISTIC PHYSICS (Hard Mechanical Boundary)│
│ Core physical sensor calculations, conservation laws    │
└──────────────────────────────────────────────────────────┘
```

1. **Deterministic Physics** is the ultimate boundary. No strategic heuristic or behavioral override may recommend actions that violate tire traction circle limits or raw mechanical ride boundaries.
2. **Behavioral Personalization** is an overlay on physics. We do not tune setups in a vacuum; we tune the mechanical platform to match the driver's cognitive style traits.

---

## 2. Telemetry Containment Doctrine

To prevent **Reasoning Divergence**, all raw telemetry sensor streams are strictly sandboxed inside the ingest bridge. No strategic recommendations or UI components may parse, interpret, or slice raw telemetry frames directly.

- **The Semantic Boundary**: UI panels, strategist dashboard readouts, and AI communication wrappers consume only typed ontological primitives (`TelemetryEvent`, `EngineeringEpisode`, `CausalityNode`, and `UnifiedRecommendation`).
- **Why it matters**: If a frontend widget or strategic prompt parses raw throttle line values directly, it creates parallel interpretations. The moment telemetry is parsed outside the kernel, ontology cohesion collapses.

---

## 3. "Modify Before Create" Extension Doctrine

The biggest threat to a large reasoning engine is **Internal Architectural Entropy** (duplicated logic, parallel truths, competing abstractions). We enforce a strict evolutionary extension policy:

```text
Existing Kernel System Already Models the Concept
    ↓  [YES]
Extend, Version, or compositionally layer the existing files
    ↓  [NO]
Create a new file ONLY when introducing a fundamentally new domain boundary
```

- **Anti-Duplication**: Alternate confidence calculation blocks, competing telemetry abstractions, shadow setup recommendations, or parallel lineage networks are prohibited.
- **Integrate & Compose**: If a new sensor channel or strategic co-factor is introduced, it must be mapped into `eventTaxonomy.ts` or integrated directly into the `closedLoopLearning` and `mechanicalReasoningEngine` contracts, rather than creating "helper files" that duplicate logic.

---

## 4. Replayability & Replay Fidelity

Replay fidelity is the simulation-grade validation layer of the architecture.

- Every recommendation lineage log must store the active `ontologyVersion` and `heuristicVersion`.
- When executing a **Reasoning Replay**, the engine is guaranteed to be completely stateless, reproducing identical narratives and recommendations when supplied with identical inputs. Floating logic states are forbidden.

---

## 5. Domain Boundaries & Responsibilities

The codebase maintains strict separation between its cognitive compartments:

| Compartment              | System Path                                                 | Core Responsibility                                                            |
| ------------------------ | ----------------------------------------------------------- | ------------------------------------------------------------------------------ |
| **Ontology Schemas**     | `/ontology/`                                                | Standardized schemas for events, episodes, causality, strategy, and tradeoffs. |
| **Semantic Interface**   | `src/lib/session-intelligence/eventTaxonomy.ts`             | The code-level typing compiler for structural motorsport primitives.           |
| **Causal Inference**     | `src/lib/session-intelligence/mechanicalReasoningEngine.ts` | The core intelligence layer translating telemetry to mechanical tradeoffs.     |
| **Experiential Memory**  | `src/lib/session-intelligence/closedLoopLearning.ts`        | The memory layer validating outcomes and preventing correlation contamination. |
| **Heuristic Reputation** | `src/lib/session-intelligence/heuristicRegistry.ts`         | Version registries and contextual similarity weighting matrices.               |
| **Confidence Synthesis** | `src/lib/session-intelligence/setupConfidence.ts`           | Historical matching and learning calibration gatekeeper.                       |

---

## 6. Canonical Projection Boundary

To prevent state divergence across execution targets (local bridge, remote strategically synchronized paddocks, docker sandboxes, or offline audits), we enforce a strict **Canonical Projection Boundary**:

- **The Rule**: ONLY canonical ontology projections (`AICommunicationPayload`) may participate in hashing, replay validation, deterministic comparison, or forensic replay.
- **Why it matters**: UI metadata, local transient runtime variables, WebSocket frame arrival delays, network jitter, and debug fields must be completely excluded from the hashing envelope. This ensures that only semantic and physical motor truth values participate in the hash, protecting the reasoning loop from being poisoned by irrelevant transport or display details.
