# Recommendation Lineage & Strategy Outcomes

This directory defines the **Recommendation Lineage** and **Strategy Outcomes** layers, which guarantee that all advice given to the pit wall or driver is auditable, explainable, and physically grounded.

By logging every setup recommendation with its full citation lineage and sensor evidence, we construct an elite, industrial-grade validation layer.

---

## 1. Recommendation Structure Guide

Every recommendation must present an auditable lineage answering: *"Why did the system recommend this change?"*

### 1.1 `sensorEvidence`
The literal sensor values recorded on-car that breached operational thresholds (e.g., `BrakeLinePressureLF` exceeding a target max, or `LFshockDefl` bottoming count).

### 1.2 `citationSource`
Every recommendation must link back to a verified motorsport engineering heuristic flow chart or vehicle guide. Standardized sources include:
* *Carroll Smith's "Tune to Win" Heuristics*: Standard mechanical suspension advice.
* *Tim McArthur ARB Flowcharts*: Anti-roll bar balance rules.
* *iRacing LMP3/GT3 Factory Manuals*: Specific mechanical damping settings.

### 1.3 `driverTraitsInfluence`
Ensures setup advice is personalized. A driver with `rearAxleStabilityTolerance: "cautious"` will receive softer rear anti-roll bar or dampening recommendations compared to an `aggressive` driver who tolerates dynamic entry over-steer.

### 1.4 `physicsTruthBoundary`
Classifies the mechanical reliability rating of the advice, giving engineering credibility and protecting against hallucinated suggestions.
