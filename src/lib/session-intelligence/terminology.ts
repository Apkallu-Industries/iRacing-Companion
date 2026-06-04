/**
 * Motorsport Terminology and Vehicle Dynamics Translation Dictionary
 * Injecting highly calibrated operational trackside jargon to bypass consumer concepts.
 */
export const MOTORSPORT_TERM_MAP: Record<string, string> = {
  "Brake Lockup": "Local axle friction lock under threshold compression",
  "Front Axle Lockup": "Front axle longitudinal friction coefficient saturation",
  "Rear Lockup": "Transient rear axle friction lock under trail brake release",
  "CRITICAL BRAKE LOCKUP": "Axle friction lock under heavy threshold deceleration",
  "DRIVEN AXLE WHEELSPIN": "Driven rear wheel footprint lateral-to-longitudinal slip saturation",
  "Throttle exit hesitation":
    "Corner-exit throttle profile hesitation under lateral traction limit",
  "THROTTLE INSTABILITY AT CORNER EXIT":
    "Corner-exit throttle profile hesitation under driven footprint slip",
  "Splitter grounding": "Chassis pitch compression splitter bottoming",
  "Diffuser Vacuum Stall": "Transient aero rake diffuser flow seal stall",
  "CHASSIS ROTATIONAL COMPRESSION": "Chassis pitch compression splitter bottoming",
  "CHASSIS REB COMPRESSION GROUNDING":
    "Chassis pitch compression splitter bottoming under heave downforce",
  "ERS DEPLOYMENT SATURATION": "MGU-K discharge torque saturation under straightaway full throttle",
  Understeer: "Lateral tyre footprint coefficient sliding saturation",
  Oversteer: "Transient rear axle lateral instability under lateral slip growth",
};

export const DETAILED_EXPLANATIONS: Record<string, string> = {
  splitter_grounding:
    "Dynamic packer bottoming under downforce heave pitch collapses underbody splitter ride heights past critical vacuum boundary limits.",
  diffuser_seal_collapse:
    "Total transient aerodynamic stall of the underbody low-pressure seal under front splitter bottoming, causing sudden rear downforce degradation.",
  rear_traction_loss:
    "Driven footprint contact patch longitudinal adhesion collapsed past slip threshold under Exit Throttle, causing lateral speed differential.",
  abrupt_brake_release:
    "Deceleration load transfer rate variance collapsed abruptly on corner entry, causing transient offloading of the rear axle carcass.",
  axle_lockup:
    "Severe local tyre sliding friction lock under excessive line pressure threshold during corner steering lock application.",
  fr_carcass_overheat:
    "Front-right core carcass thermal growth saturated, inducing friction sliding and understeer balance drift outside operating envelope.",
};

/**
 * Resolves a generic description to a hyper-calibrated, professional vehicle dynamics phrasing.
 */
export function translateToMotorsportLingo(term: string): string {
  return MOTORSPORT_TERM_MAP[term] || term;
}

/**
 * Resolves detailed mechanical cause-and-effect descriptions.
 */
export function translateExplanation(nodeId: string, fallback: string): string {
  return DETAILED_EXPLANATIONS[nodeId] || fallback;
}
