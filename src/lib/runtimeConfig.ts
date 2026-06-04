/**
 * runtimeConfig — runtime feature flags for developer toggles
 *
 * Use localStorage keys to control simulator/live-only behavior without rebuilds.
 * - pitwall:force_live = "1"  -> Force live-only mode (disable all automatic simulation fallbacks)
 * - pitwall:allow_simulator = "1" -> Allow simulator features (for dev/testing). Default: off
 */

export function isForceLiveMode(): boolean {
  try {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("pitwall:force_live") === "1";
  } catch {
    return false;
  }
}

export function allowSimulator(): boolean {
  try {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("pitwall:allow_simulator") === "1";
  } catch {
    return false;
  }
}

export function enableForceLiveMode() {
  try {
    window.localStorage.setItem("pitwall:force_live", "1");
  } catch {}
}

export function disableForceLiveMode() {
  try {
    window.localStorage.removeItem("pitwall:force_live");
  } catch {}
}

export default { isForceLiveMode, allowSimulator, enableForceLiveMode, disableForceLiveMode };
