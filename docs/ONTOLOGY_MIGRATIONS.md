# Ontology Migrations & Forensic Replay Specification

### The Blueprint for Deterministic Time-Traveling Motorsport Cognition

This document defines the formal engineering specification for **Stage 10 (Deterministic Ontology Migrations)** and **Stage 11 (Forensic Engineering Replay)**.

By implementing versioned migration pipelines and sandboxed execution replays, we guarantee absolute, bit-perfect historical reasoning reproducibility and prevent old telemetry records from becoming unreadable archaeology.

---

## 1. The Semantic Migration Stack

Historical telemetry is useless without historical semantic compatibility. Because iRacing models, tire compounds, and ontology structures evolve, the system enforces a strict pipeline to transform historical session data into canonical semantic forms:

```
┌────────────────────────────────────────┐
│      Raw Historical Telemetry          │
└───────────────────┬────────────────────┘
                    │ (Identify Ingest Version, e.g. v1.0.0)
                    ▼
┌────────────────────────────────────────┐
│     Ingest Inbound Gateway Wrapper     │
└───────────────────┬────────────────────┘
                    │ (Load version-specific parsing rules)
                    ▼
┌────────────────────────────────────────┐
│      Ontology Migration Chain          │
│ (Determinisitc TypeScript Migrators)   │
│ - mig_v1_0_0_to_v1_1_0.ts              │
│ - mig_v1_1_0_to_v2_0_0.ts              │
└───────────────────┬────────────────────┘
                    │ (Resolve mapping renames, defaults, & scales)
                    ▼
┌────────────────────────────────────────┐
│   Canonical Current Semantic Payload   │
└───────────────────┬────────────────────┘
                    │ (Validated by tradeoffs & events Schemas)
                    ▼
┌────────────────────────────────────────┐
│       Core Reasoning Engine            │
└────────────────────────────────────────┘
```

---

## 2. Deterministic Migration Pipeline (`/ontology/migrations/`)

Every change to the ontology schema that modifies, renames, or deprecates a field must be accompanied by a deterministic TypeScript migration script under `/ontology/migrations/`.

### 2.1 Migration Script Contract

All migration scripts must implement the standard `OntologyMigrator` contract:

```typescript
export interface OntologyMigrationContext {
  sourceVersion: string;
  targetVersion: string;
}

export interface OntologyMigrator {
  context: OntologyMigrationContext;

  /**
   * Translates an inbound historical payload to the next version in the chain.
   */
  up(historicalPayload: any): any;

  /**
   * Optional down-migrator to roll back structural changes.
   */
  down(payload: any): any;
}
```

### 2.2 Standard Migration Execution

When a historical session is loaded, the ingest compiler:

1. Reads `ontologyVersion` stored in the session record.
2. If `ontologyVersion` is less than the active kernel version, it fetches the ordered list of required migrators from `/ontology/migrations/`.
3. Sequentially executes the `up()` method of each migrator in the chain, outputting the canonical schema payload.

---

## 3. Forensic Engineering Replay Protocol (Stage 11)

Forensic Replay is the ultimate auditability layer: proving exactly **WHY** the system made a setup or strategic suggestion under a specific historical context.

To achieve this, the replay engine is entirely **stateless** and is executed inside a sandboxed container.

```typescript
export interface ForensicReplayRequest {
  sessionId: string;
  recommendationId: string;

  // The exact immutable parameters logged at the moment of intervention:
  historicalState: {
    rawTelemetryTickBuffer: any[];
    driverBehaviorTraits: any;
    sessionEvolutionState: any;
    appliedEngineeringPersonality: string;

    // The exact version pointers to fetch from the registries:
    ontologyVersion: string;
    heuristicId: string;
    heuristicVersion: string;
  };
}

export interface ForensicReplayReport {
  isMatchVerified: boolean;
  expectedNarrative: string;
  replayedNarrative: string;
  expectedRecommendation: string;
  replayedRecommendation: string;
  reproducedLineageId: string;
}
```

### 3.1 Replay Execution Flow

1. **Container Initialization**: The forensic replay compiler instantiates a clean, sandboxed reasoning context.
2. **Heuristics Package Ingestion**: The compiler queries the `HeuristicReputationRegistry` for the exact `heuristicId` and `heuristicVersion` declared in the audit log. It injects the historical confidence ratings and dynamic weights.
3. **Telemetry Playback**: The compiled parser plays back the raw telemetry tick buffer through the historical `TelemetryEvent` and `EngineeringEpisode` rulesets.
4. **Causal Validation**: The re-constructed events flow through the `MechanicalStateInference` and `SetupTradeoffEvaluation` pipelines.
5. **Fidelity Audit**: The resulting recommendation and narrative descriptions are compared bit-by-bit against the historically logged outputs. A matches verification report is returned.
