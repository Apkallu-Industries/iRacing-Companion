/**
 * voiceOps.ts — Trackside Engineering Radio Voice Synthesis
 *
 * Compiles real-time warnings into short, dense, trackside-authentic radio brief callouts.
 * Exposes browser-native Text-to-Speech triggers.
 */

export interface RadioBriefCallout {
  briefText: string;
  attributableEngineer: string;
  hasSpeechTriggered: boolean;
}

/**
 * Generates and optionally plays a clinical trackside radio briefing.
 * @param eventType trigger classification
 * @param value numeric value associated with alert
 * @param triggerAudio if true, triggers browser speechSynthesis
 */
export function generateVoiceBrief(
  eventType: "THERMAL_RUNAWAY" | "TRAFFIC_CATCH" | "CROSSOVER_REACHED" | "FUEL_CRITICAL" | "STABILITY_BREAK",
  value: number | string,
  triggerAudio = false
): RadioBriefCallout {
  
  let briefText = "Standby. Checking telemetry.";
  const attributableEngineer = "Systems Engineer";

  switch (eventType) {
    case "THERMAL_RUNAWAY":
      briefText = `Rear thermal saturation projected within ${value} laps. Recommend migration plus one.`;
      break;
    case "TRAFFIC_CATCH":
      briefText = `Traffic convergence GT pack in ${value} seconds. Catch corner expected sector T-eight.`;
      break;
    case "CROSSOVER_REACHED":
      briefText = `Optimal compound crossover reached. Fresh rubber pace gains exceed pit penalty. Box this lap.`;
      break;
    case "FUEL_CRITICAL":
      briefText = `Fuel reserves critical. Estimated range zero point eight laps. Box this lap.`;
      break;
    case "STABILITY_BREAK":
      briefText = `Underbody diffuser vacuum seal grounding risk high in sector ${value}. Packer deflection exceeded.`;
      break;
  }

  // Native Speech Synthesis trigger
  // Enforces short, professional trackside timing
  if (triggerAudio && typeof window !== "undefined" && window.speechSynthesis) {
    // Cancel any active queues to prevent buffer overlap latency
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(briefText);
    
    // Configure voice properties to sound clinical, neutral, and slightly robotic
    utterance.rate = 1.05;  // fast, concise timing
    utterance.pitch = 0.92; // deep, operational authority
    utterance.volume = 0.90;

    // Use default system english voice
    window.speechSynthesis.speak(utterance);
  }

  return {
    briefText,
    attributableEngineer,
    hasSpeechTriggered: triggerAudio,
  };
}
