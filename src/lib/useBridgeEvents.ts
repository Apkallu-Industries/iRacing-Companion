import { useEffect } from "react";
import { getBridgeClient } from "./bridgeDataClient";
import { useTelemetryRuntimeStore } from "./telemetryRuntimeStore";

/**
 * Hook: subscribe to bridge runtime events (prediction warnings, stint updates)
 * and inject them into the Telemetry Event Timeline store.
 */
export function useBridgeEvents() {
  useEffect(() => {
    const client = getBridgeClient();

    const unsub = client.on((event) => {
      try {
        if (event.type !== "event" || !event.data) return;
        const payload = event.data as any;
        const name = payload.event;
        const body = payload.payload || {};

        if (name === "PREDICTION_WARNING") {
          const ev = {
            timestampSec: Date.now() / 1000,
            label: body.primaryTriggerFactor || "PREDICTION_WARNING",
            category: "dynamics" as const,
            severity: body.isRiskHigh ? "critical" : (body.instabilityProbability > 0.5 ? "warning" : "info"),
            description: body.recommendedCorrection || "",
            associatedChannels: [],
            metadata: { confidence: body.instabilityProbability || 0 },
          } as const;

          useTelemetryRuntimeStore.getState().addEvent(ev as any);
        } else if (name === "STINT_UPDATED") {
          const ev = {
            timestampSec: Date.now() / 1000,
            label: "STRATEGY_UPDATE",
            category: "inputs" as const,
            severity: "info",
            description: body.nodeId ? `${body.nodeId}: ${body.conditionMet || ""}` : "Strategy node updated",
            associatedChannels: [],
            metadata: { probability: body.probabilityWeightPct || body.probabilityWeightPct || 0 },
          } as const;
          useTelemetryRuntimeStore.getState().addEvent(ev as any);
        }
      } catch (e) {
        console.warn("[useBridgeEvents] failed to process runtime event:", e);
      }
    });

    return () => unsub();
  }, []);
}

export default useBridgeEvents;
