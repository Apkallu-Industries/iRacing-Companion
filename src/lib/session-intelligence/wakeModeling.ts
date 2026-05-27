/**
 * wakeModeling.ts — Aerodynamic Wash and cooling wake analysis
 *
 * Detects underbody downforce wash loss, radiator cooling performance declines,
 * and ERS harvesting overrides when trailing closely in another vehicle's dirty air wake.
 */

export interface WakeDynamicsMetrics {
  inWake: boolean;
  aeroWashPct: number;              // Downforce splitter load loss percentage (0 - 100%)
  coolingLoadImpactPct: number;     // Oil/coolant temperature acceleration rate increase
  defensiveErsMapRecommendation: string;
}

/**
 * Calculates aerodynamic wash deltas under traffic conditions.
 * @param timeGapSec gap behind leading vehicle (seconds, trailing < 1.8s triggers wake)
 * @param speedMps current velocity (m/s)
 * @param steerVelocity steer rate velocity (rad/s)
 * @param yawRate current angular yaw velocity
 * @param coolantTempC oil or water temperature
 */
export function calculateWakeDynamics(
  timeGapSec: number,
  speedMps: number,
  steerVelocity: number,
  yawRate: number,
  coolantTempC: number
): WakeDynamicsMetrics {
  const speedKmH = speedMps * 3.6;

  // Trailing closely (< 1.8s) triggers active aero wake analysis
  const inWake = timeGapSec > 0 && timeGapSec < 1.8;

  if (!inWake) {
    return { inWake: false, aeroWashPct: 0, coolingLoadImpactPct: 0, defensiveErsMapRecommendation: "Standard straightaway ERS harvesting active." };
  }

  // 1. Calculate Aerodynamic Wash downforce loss
  // Splitter wash is highly sensitive to time gap and squared speed vectors
  // wash% = (coeff / gap) * (speed / baselineSpeed)^2
  const baseGap = Math.max(0.2, timeGapSec);
  const aeroFactor = speedKmH > 120 
    ? Math.min(48, (12.5 / baseGap) * Math.pow(speedKmH / 140, 2)) 
    : Math.min(20, 6.0 / baseGap);

  // If driver is making aggressive steering corrections inside the wake, scale wash percentage
  const steerCorrectionCorrection = steerVelocity > 1.2 ? 1.15 : 1.0;
  const finalAeroWash = Math.min(75, aeroFactor * steerCorrectionCorrection);

  // 2. Cooling degradation impact
  // Blocked clean airflow raises core fluid temperature acceleration by up to 35%
  const thermalImpact = inWake 
    ? Math.min(35, (18.0 / timeGapSec) * Math.max(1.0, coolantTempC / 95.0)) 
    : 0;

  // 3. Defensive ERS map recommendations
  let defensiveAdvice = "Standard race ERS sweeps.";
  if (finalAeroWash > 25) {
    defensiveAdvice = "Splitter wash compromises apex rotation. Switch ERS to Map 3 (Defensive Deploy) to guard exit lines.";
  } else if (thermalImpact > 20) {
    defensiveAdvice = "Radiator clean air flow blocked. Disengage draft tow, steer 0.5m out-of-line on straights to cool fluid cores.";
  }

  return {
    inWake: true,
    aeroWashPct: parseFloat(finalAeroWash.toFixed(1)),
    coolingLoadImpactPct: parseFloat(thermalImpact.toFixed(1)),
    defensiveErsMapRecommendation: defensiveAdvice,
  };
}
