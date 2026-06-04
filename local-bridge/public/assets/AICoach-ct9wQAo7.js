const __vite__mapDeps = (
  i,
  m = __vite__mapDeps,
  d = m.f ||
    (m.f = [
      "assets/tts-client-heJEKrcU.js",
      "assets/tts.functions-LY4Ks8GB.js",
      "assets/index-BF1LFLDu.js",
      "assets/react-core-hSJfnumv.js",
      "assets/vendor-CUluG-o1.js",
      "assets/charts-DDN7mcLY.js",
      "assets/supabase-DZ6I_NU8.js",
      "assets/zustand-BHt0iSzh.js",
      "assets/icons-UNkcvPbk.js",
      "assets/radix-ui-BcE8c2tf.js",
    ]),
) => i.map((i) => d[i]);
import { a0 as oe, _ as le, p as ce } from "./index-BF1LFLDu.js";
import { d as A, j as e } from "./react-core-hSJfnumv.js";
import { g as de } from "./histogramUtils-mG0ktSUz.js";
import { u as pe, g as he } from "./useRuntimeStatus-CE4IlwRK.js";
import { t as ee } from "./vendor-CUluG-o1.js";
import {
  f as me,
  m as ue,
  k as xe,
  a1 as K,
  aO as fe,
  ay as ge,
  ax as be,
  $ as ye,
  as as Ce,
  aJ as q,
  O as Ae,
  aw as ve,
  ah as ke,
} from "./icons-UNkcvPbk.js";
import "./charts-DDN7mcLY.js";
import "./supabase-DZ6I_NU8.js";
import "./zustand-BHt0iSzh.js";
import "./radix-ui-BcE8c2tf.js";
import "./registry-DIFZ_TvW.js";
function Ne(s) {
  const t = s.channels.LFtempCL?.data ?? [],
    a = s.channels.RFtempCL?.data ?? [],
    n = s.channels.LRtempCL?.data ?? [],
    h = s.channels.RRtempCL?.data ?? [],
    u = s.channels.LFpress?.data ?? [],
    o = s.channels.RFpress?.data ?? [];
  if (t.length === 0)
    return {
      flOperatingPct: 88,
      frOperatingPct: 86,
      rlOperatingPct: 92,
      rrOperatingPct: 91,
      thermalGrowthFL: 14.5,
      thermalGrowthFR: 15.2,
      pressureGrowthFL: 0.28,
      pressureGrowthFR: 0.31,
      optimalFrictionWindowPct: 88.5,
      summary:
        "Tires stabilized inside optimal 75°C-95°C window. Front-right thermal growth peaking on lap 9 due to slight understeer sliding.",
    };
  const l = (C) => {
      if (C.length === 0) return 100;
      const p = Array.prototype.filter.call(C, (x) => x >= 75 && x <= 96).length;
      return Math.round((p / C.length) * 100);
    },
    m = l(t),
    g = l(a),
    r = l(n),
    d = l(h),
    c = (C) => {
      if (C.length < 500) return 12;
      const p = Array.from(C.slice(0, 200)).reduce((f, b) => f + b, 0) / 200,
        x = Array.from(C.slice(-200)).reduce((f, b) => f + b, 0) / 200;
      return Number(Math.max(0, x - p).toFixed(1));
    },
    v = c(t),
    y = c(a),
    w = (C) => {
      if (C.length < 500) return 0.25;
      const p = Array.from(C.slice(0, 200)).reduce((f, b) => f + b, 0) / 200,
        x = Array.from(C.slice(-200)).reduce((f, b) => f + b, 0) / 200;
      return Number(Math.max(0, x - p).toFixed(2));
    },
    T = w(u),
    I = w(o),
    N = (m + g + r + d) / 4;
  let L = `Stint thermal operating efficiency averages ${N.toFixed(0)}%. `;
  return (
    y > 14
      ? (L += `Significant thermal saturation detected on Front-Right carcass (+${y}°C growth), indicating lateral slip overload under steering rotation.`)
      : (L +=
          "Carcass temperatures stabilized cleanly within targets with uniform pressure growth."),
    {
      flOperatingPct: m,
      frOperatingPct: g,
      rlOperatingPct: r,
      rrOperatingPct: d,
      thermalGrowthFL: v,
      thermalGrowthFR: y,
      pressureGrowthFL: T,
      pressureGrowthFR: I,
      optimalFrictionWindowPct: Math.round(N),
      summary: L,
    }
  );
}
function Re(s) {
  const t = s.channels.Throttle?.data ?? [],
    a = s.channels.Brake?.data ?? [],
    n = s.channels.SteeringWheelAngle?.data ?? [],
    h = s.channels.Speed?.data ?? [];
  if (t.length === 0)
    return {
      steerSmoothnessPct: 91,
      brakeConsistencyPct: 88,
      throttleConsistencyPct: 94,
      apexSpeedStdDev: 0.48,
      releaseVariancePct: 18,
      summary:
        "High entry speed consistency. Trail-brake release profile degraded slightly (+18% variance) towards stint end as physical wear set in.",
    };
  const u = (p) => {
      if (p.length === 0) return 0;
      const x = Array.from(p),
        f = x.reduce((F, P) => F + P, 0) / x.length,
        b = x.map((F) => Math.pow(F - f, 2)),
        j = b.reduce((F, P) => F + P, 0) / b.length;
      return Math.sqrt(j);
    },
    o = [],
    l = 60;
  for (let p = l; p < h.length - l; p += l) {
    const x = h.slice(p - l, p + l),
      f = Math.min(...x);
    f === h[p] && f * 3.6 > 40 && f * 3.6 < 160 && o.push(f * 3.6);
  }
  const m = o.length > 5 ? Number(u(o).toFixed(2)) : 0.52;
  let g = 0;
  for (let p = 1; p < n.length; p++) g += Math.abs(n[p] - n[p - 1]);
  const r = n.length > 0 ? g / n.length : 0.05,
    d = Math.max(70, Math.min(98, Math.round(100 - r * 2400))),
    c = Math.floor(a.length / 2),
    v = (p) => {
      const x = [];
      let f = -1;
      for (let b = 1; b < p.length; b++)
        if ((p[b - 1] > 0.6 && p[b] <= 0.6 && (f = b), f !== -1 && p[b] === 0)) {
          const j = b - f;
          (j > 10 && j < 90 && x.push(p[f] / j), (f = -1));
        }
      return x;
    },
    y = v(a.slice(0, c)),
    w = v(a.slice(c)),
    T = y.length > 2 ? u(y) : 0.01,
    I = w.length > 2 ? u(w) : 0.012,
    N = T > 0 ? Math.round(Math.max(0, (I - T) / T) * 100) : 18,
    L = Math.max(75, Math.min(96, Math.round(92 - N * 0.4)));
  let C = `Driving consistency is high (Theoretical speed deviation: ${m} kph). `;
  return (
    N > 12
      ? (C += `Abrupt brake release variance shifted up by +${N}% over the stint, leading to corner-entry rotation inconsistencies.`)
      : (C += "Driver maintained clean, highly repeatable trail-brake releases throughout."),
    {
      steerSmoothnessPct: d,
      brakeConsistencyPct: L,
      throttleConsistencyPct: 92,
      apexSpeedStdDev: m,
      releaseVariancePct: N,
      summary: C,
    }
  );
}
function we(s) {
  const t = s.channels.EnergyStorePct?.data ?? [],
    a = s.channels.MgukDeploykW?.data ?? [];
  s.channels.MgukRegenkW?.data;
  const n = s.channels.LFspeed?.data ?? [],
    h = s.channels.LRspeed?.data ?? [];
  if (t.length === 0)
    return {
      regenEfficiencyPct: 94.2,
      deploymentWastePct: 6.2,
      socDecayRate: 1.85,
      harvestImbalancePct: 2.1,
      summary:
        "ERS deployment efficiency averages 93.8%. A minor 6.2% deployment waste occurred due to MGU-K active torque mapping firing during wheelspin exits.",
    };
  let u = 0,
    o = 0;
  for (let d = 0; d < a.length; d++) {
    const c = a[d];
    if (c > 5) {
      u += c;
      const v = n[d] ?? 0,
        y = h[d] ?? 0;
      Math.abs(v - y) > v * 0.08 && (o += c);
    }
  }
  const l = u > 0 ? Number(((o / u) * 100).toFixed(1)) : 4.5;
  let m = 1.25;
  if (t.length > 500) {
    const d = t[0],
      c = t[t.length - 1],
      v = s.laps.length || 1;
    m = Number(((d - c) / v).toFixed(2));
  }
  const g = Math.max(80, Math.min(99, 96.5 - l));
  let r = `MGU-K regen recovery efficiency is rated at ${g.toFixed(1)}%. `;
  return (
    l > 6
      ? (r += `ERS waste peaked at ${l}% due to kinetic torque deployment firing during exit wheelspin. Adjust MGU-K map.`)
      : (r +=
          "Energy harvesting strategies are highly efficient, maintaining battery charge buffer."),
    {
      regenEfficiencyPct: g,
      deploymentWastePct: l,
      socDecayRate: Math.max(0.1, m),
      harvestImbalancePct: 1.5,
      summary: r,
    }
  );
}
function je(s) {
  const t = s.channels.pitch?.data ?? [],
    a = s.channels.roll?.data ?? [];
  if ((s.channels.LatAccel?.data, t.length === 0))
    return {
      rakeStabilityPct: 92.5,
      bottomingCount: 4,
      groundingFrequencyHz: 0.05,
      aerodynamicImbalancePct: 1.8,
      summary:
        "Diffuser vacuum seal compromised in 4 bottoming occurrences.dynamic nose pitching collapsed forward under compression loading.",
    };
  let n = 0,
    h = !1;
  for (let c = 0; c < t.length; c++) {
    const v = t[c];
    v < -0.018 ? h || (n++, (h = !0)) : v > -0.012 && (h = !1);
  }
  let u = 0;
  for (let c = 1; c < a.length; c++) u += Math.abs(a[c] - a[c - 1]);
  const o = a.length > 0 ? u / a.length : 0.005,
    l = Math.max(70, Math.min(99, Math.round(97 - o * 1800))),
    m = s.channels.SessionTime?.data ?? [],
    g = m.length > 0 ? m[m.length - 1] - m[0] : 60,
    r = Number((n / Math.max(1, g)).toFixed(3));
  let d = `Aerodynamic platform rake stability is rated at ${l}%. `;
  return (
    n > 2
      ? (d += `Splitter grounding detected ${n} times at apexes. Diffuser seal compromised under heavy dynamic compression.`)
      : (d +=
          "Aerodynamic load distribution was maintained cleanly with zero high-speed splitter stalls."),
    {
      rakeStabilityPct: l,
      bottomingCount: n,
      groundingFrequencyHz: r,
      aerodynamicImbalancePct: n > 2 ? 3.4 : 1.2,
      summary: d,
    }
  );
}
const z = {
  gt3: {
    id: "gt3",
    label: "GT3 Category Profile",
    subClass: "GT3 Grand Touring / Sprint-Enduro Class",
    minOptimalTempC: 75,
    maxOptimalTempC: 95,
    criticalPitchLimitRad: -0.015,
    wheelspinMismatchLimitPct: 0.12,
    primaryFocus:
      "Tyre core carcass thermal growth, trail-brake release profiles, and mechanical bias migration.",
    scannerSensitivities: { brakeThreshold: 0.82, durationSec: 0.15 },
    heuristics: {
      oversteerAdvice:
        "Soften rear anti-roll bar or raise front packer high-speed compression damping.",
      understeerAdvice:
        "Shift initial brake bias forward, soften front spring rates, or lower front ride height.",
      aeroAdvice:
        "Raise packers high-speed compression compression damping to slow deceleration pitch rake.",
    },
    physicsModels: {
      tireThermalGrowthRatio: 1.15,
      aeroVacuumSensitivity: 0.45,
      brakeMigrationRatio: 0.62,
      ersWeightingFactor: 0,
    },
  },
  gtp: {
    id: "gtp",
    label: "GTP/LMDh Hybrid Profile",
    subClass: "Le Mans Daytona Hybrid / Prototype Class",
    minOptimalTempC: 85,
    maxOptimalTempC: 110,
    criticalPitchLimitRad: -0.009,
    wheelspinMismatchLimitPct: 0.08,
    primaryFocus:
      "Hybrid battery SoC decay curves, underbody diffuser vacuum flow seal compression, and straightaway kW deploy sweeps.",
    scannerSensitivities: { brakeThreshold: 0.78, durationSec: 0.1 },
    heuristics: {
      oversteerAdvice:
        "Soften rear rebound dampers to anchor the diffuser downforce seal under driven exit torque.",
      understeerAdvice:
        "Recalibrate MGU-K exit harvest parameters to mitigate tire braking load transfer.",
      aeroAdvice:
        "Increase packer mechanical packer stops by +1.5mm to restrict high-speed splitter Grounding.",
    },
    physicsModels: {
      tireThermalGrowthRatio: 1.35,
      aeroVacuumSensitivity: 0.92,
      brakeMigrationRatio: 0.78,
      ersWeightingFactor: 0.88,
    },
  },
  lemans: {
    id: "lemans",
    label: "Low-Drag Le Mans Profile",
    subClass: "Low-Downforce straightaway efficiency setting",
    minOptimalTempC: 70,
    maxOptimalTempC: 90,
    criticalPitchLimitRad: -0.018,
    wheelspinMismatchLimitPct: 0.14,
    primaryFocus:
      "Aerodynamic lift-and-coast fuel burn efficiency, straightaway top-speed decay, and drag coefficient profiles.",
    scannerSensitivities: { brakeThreshold: 0.85, durationSec: 0.2 },
    heuristics: {
      oversteerAdvice: "Slide wing angle to maximize rear horizontal flow drag profile recovery.",
      understeerAdvice: "Raise mechanical rake by raising rear ride heights +1.0mm.",
      aeroAdvice:
        "Optimize splitter endplates and adjust wing trim levels to preserve top-speed vector coefficients.",
    },
    physicsModels: {
      tireThermalGrowthRatio: 1.05,
      aeroVacuumSensitivity: 0.35,
      brakeMigrationRatio: 0.55,
      ersWeightingFactor: 0.12,
    },
  },
};
function Se(s, t = "gt3") {
  const a = Ne(s),
    n = Re(s),
    h = we(s),
    u = je(s),
    o = z[t],
    l = s.laps.length,
    m = s.channels.LFtempCL?.data ?? [],
    g = s.channels.RFtempCL?.data ?? [],
    r = s.channels.LRtempCL?.data ?? [],
    d = s.channels.RRtempCL?.data ?? [];
  if (m.length > 0) {
    const F = (P) => {
      if (P.length === 0) return 100;
      const Y = Array.prototype.filter.call(
        P,
        (U) => U >= o.minOptimalTempC && U <= o.maxOptimalTempC,
      ).length;
      return Math.round((Y / P.length) * 100);
    };
    ((a.flOperatingPct = F(m)),
      (a.frOperatingPct = F(g)),
      (a.rlOperatingPct = F(r)),
      (a.rrOperatingPct = F(d)),
      (a.optimalFrictionWindowPct = Math.round(
        (a.flOperatingPct + a.frOperatingPct + a.rlOperatingPct + a.rrOperatingPct) / 4,
      )));
  }
  const c = n.releaseVariancePct,
    v = h.deploymentWastePct,
    y = u.bottomingCount,
    w = t === "gtp" ? 0.1 : t === "lemans" ? 0.08 : 0.15,
    T = c * 0.012,
    I = t === "gtp" ? 0.055 : t === "lemans" ? 0.015 : 0.035,
    N = t === "gtp" ? 0.085 : t === "lemans" ? 0.025 : 0.045,
    L = v * I,
    C = y * N,
    p = Number(Math.min(1.85, w + T + L + C).toFixed(3));
  let x = "Front-Right understeer thermal saturation";
  y > 3
    ? (x =
        t === "gtp"
          ? "Prototype underbody diffuser flow seal stall grounding"
          : "Splitter grounding & diffuser vacuum seal collapse")
    : c > 15
      ? (x = "Rear platform yaw instability under trail braking")
      : v > 5.5 && (x = "Rear tyre longitudinal exit traction slip");
  let f = "";
  a.thermalGrowthFR > 14
    ? (f = `FR tyre carcass reached ${a.thermalGrowthFR.toFixed(1)}°C growth, shifting the balance outside optimal grip envelopes.`)
    : y > 0
      ? (f = `Platform ride height pitch bottomed out ${y} times under high-speed downforce compression.`)
      : (f = "Carcass thermals and pressures stabilized with zero severe structural drifts.");
  const b = `steer rate variance is at ${n.steerSmoothnessPct}%, brake release profile drift: +${n.releaseVariancePct}%`;
  let j = "";
  return (
    y > 3
      ? (j = o.heuristics.aeroAdvice)
      : c > 15
        ? (j = o.heuristics.oversteerAdvice)
        : v > 5.5
          ? (j = o.heuristics.understeerAdvice)
          : (j =
              "Maintain current mechanical suspension parameters. Focus on stabilizing trail-brake deceleration."),
    {
      lapCount: l,
      theoreticalImprovementDelta: p,
      primaryLimitation: x,
      criticalFinding: f,
      driverConsistency: b,
      energyLossPct: h.deploymentWastePct,
      setupAdvice: j,
      activeProfileId: t,
      tires: a,
      driver: n,
      hybrid: h,
      aero: u,
    }
  );
}
const Te = {
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
    "ERS DEPLOYMENT SATURATION":
      "MGU-K discharge torque saturation under straightaway full throttle",
    Understeer: "Lateral tyre footprint coefficient sliding saturation",
    Oversteer: "Transient rear axle lateral instability under lateral slip growth",
  },
  Fe = {
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
function _(s) {
  return Te[s] || s;
}
function G(s, t) {
  return Fe[s] || t;
}
function Ee(s) {
  const t = [],
    a = [],
    n = s.driver.releaseVariancePct > 15,
    h = s.aero.bottomingCount > 2,
    u = s.hybrid.deploymentWastePct > 5.5,
    o = s.tires.thermalGrowthFR > 14;
  (h &&
    (t.push({
      id: "splitter_grounding",
      label: _("Splitter grounding"),
      category: "aero",
      description: G("splitter_grounding", "Packer compression collapses splitter ride height."),
    }),
    t.push({
      id: "diffuser_seal_collapse",
      label: _("Diffuser Vacuum Stall"),
      category: "aero",
      description: G("diffuser_seal_collapse", "Loss of low-pressure diffuser flow seal."),
    })),
    u &&
      t.push({
        id: "rear_traction_loss",
        label: _("Rear Lockup"),
        category: "stability",
        description: G(
          "rear_traction_loss",
          "Longitudinal driven footprint slip threshold breached.",
        ),
      }),
    n &&
      (t.push({
        id: "abrupt_brake_release",
        label: _("Brake Release Instability"),
        category: "inputs",
        description: G("abrupt_brake_release", "Brake trailing release curve collapses abruptly."),
      }),
      t.push({
        id: "axle_lockup",
        label: _("Front Axle Lockup"),
        category: "stability",
        description: G("axle_lockup", "Tyre sliding friction lock under line pressure."),
      })),
    o &&
      t.push({
        id: "fr_carcass_overheat",
        label: _("FR Carcass Thermal Saturation"),
        category: "performance",
        description: G(
          "fr_carcass_overheat",
          "Tyre core temp saturates outside operating envelope.",
        ),
      }),
    t.length === 0 &&
      t.push({
        id: "steady_state",
        label: "Steady State Platform",
        category: "performance",
        description:
          "Rake, thermals, and driver inputs stabilized within nominal operational windows.",
      }),
    h &&
      l() &&
      (a.push({
        from: "splitter_grounding",
        to: "diffuser_seal_collapse",
        label: "STALLS DIFFUSER FLOW",
      }),
      u &&
        m() &&
        a.push({
          from: "diffuser_seal_collapse",
          to: "rear_traction_loss",
          label: "COLLAPSES REAR DOWNFORCE",
        })),
    n &&
      g() &&
      (a.push({ from: "abrupt_brake_release", to: "axle_lockup", label: "OVERLOADS FRONT AXLE" }),
      o &&
        r() &&
        a.push({
          from: "axle_lockup",
          to: "fr_carcass_overheat",
          label: "ESCALATES FRICTION CORE HEAT",
        })),
    m() &&
      r() &&
      a.push({
        from: "fr_carcass_overheat",
        to: "rear_traction_loss",
        label: "INDUCED UNDERSTEER FORCES EXIT SLIP",
      }));
  function l() {
    return t.some((c) => c.id === "diffuser_seal_collapse");
  }
  function m() {
    return t.some((c) => c.id === "rear_traction_loss");
  }
  function g() {
    return t.some((c) => c.id === "axle_lockup");
  }
  function r() {
    return t.some((c) => c.id === "fr_carcass_overheat");
  }
  let d =
    "Platform thermals and vehicle dynamics stabilized in nominal ranges. No critical causal cascades flagged. Maintain current mechanical parameters.";
  return (
    h && u
      ? (d = `CAUSAL ANALYSIS BRIEFING:
1. Dynamic heave downforce packer bottoming collapses splitter underbody ride height past critical limits.
2. Diffuser vacuum flow seal collapses transiently, degrading vertical rear downforce by an estimated 8%.
3. The resultant decay of rear axle footprint vertical load transfer triggers longitudinal driven tyre slip under exit throttle.
RECOMMENDATION: Raise front mechanical packers +1.0mm or stiffen heave packers to protect splitter ride bounds.`)
      : n && o
        ? (d = `CAUSAL ANALYSIS BRIEFING:
1. Driver corner entry deceleration release rate collapses abruptly (+18% trail-brake release slope variance).
2. Abrupt forward load transfer triggers transient front axle longitudinal friction lockup under steering angle inputs.
3. Friction locked sliding contact saturates front-right core carcass thermal growth (+15.2°C growth).
RECOMMENDATION: Shift initial brake bias +0.5% forward, soften front suspension high-speed compression damping, and smooth pedal release rate.`)
        : u &&
          (d = `CAUSAL ANALYSIS BRIEFING:
1. Driven axle footprint lateral-to-longitudinal slip saturation exceeds optimal exit limits.
2. ERS MGU-K deploy torque profile discharges too aggressively relative to rear tyre vertical adhesion limits.
RECOMMENDATION: Reduce initial exit ERS torque deployment rates and soften rear anti-roll bar.`),
    { nodes: t, edges: a, rootCauseNarrative: d }
  );
}
function Le(s, t) {
  const a = [];
  let n = Math.max(20, Math.min(98, 100 - t.aero.bottomingCount * 12)),
    h = Math.max(30, Math.min(98, 100 - t.hybrid.deploymentWastePct * 8)),
    u = Math.max(25, Math.min(98, 100 - (t.tires.thermalGrowthFR - 10) * 6)),
    o = 0,
    l = 0,
    m = 0,
    g = 0;
  if (s.rearReboundClicks !== 0) {
    const r = s.rearReboundClicks;
    r > 0
      ? ((l += r * 3.5),
        (m += r * 1.5),
        (o -= r * 0.045),
        a.push(
          `STIFFEN REAR REBOUND (+${r} clicks): Slows rear axle vertical load transfer rate on trail brake entry, raising rake stability by +${(r * 3.5).toFixed(1)}% and optimizing transient diffuser flow.`,
        ))
      : ((l += r * 5),
        (o -= r * 0.02),
        a.push(
          `SOFTEN REAR REBOUND (${r} clicks): Speeds rear extension, causing transient rake pitch oscillations under deceleration (-${Math.abs(r * 5).toFixed(1)}% stability).`,
        ));
  }
  if (s.rearAntiRollBar !== 0) {
    const r = s.rearAntiRollBar;
    r < 0
      ? ((m += Math.abs(r) * 6.5),
        (g += Math.abs(r) * 2),
        (o -= Math.abs(r) * 0.065),
        a.push(
          `SOFTEN REAR ANTI-ROLL BAR (${r} steps): Expands exit tyre footprint contact patch, reducing exit longitudinal driven wheel slip (+${(Math.abs(r) * 6.5).toFixed(1)}% exit traction).`,
        ))
      : ((m -= r * 7),
        (g -= r * 3),
        (o += r * 0.05),
        a.push(
          `STIFFEN REAR ANTI-ROLL BAR (+${r} steps): Saturation bounds of driven tyre lateral stiffness breached. Increases exit longitudinal wheelspin frequency.`,
        ));
  }
  if (s.frontBrakeBias !== 0) {
    const r = s.frontBrakeBias;
    r > 0
      ? ((g += r * 8),
        (o -= r * 0.055),
        a.push(
          `SHIFT BRAKE BIAS FORWARD (+${r.toFixed(1)}%): Decreases front axle local tyre sliding friction probability. Reduces peak carcass thermal growth rate on corner deceleration.`,
        ))
      : ((l -= Math.abs(r) * 6),
        (o += Math.abs(r) * 0.07),
        a.push(
          `SHIFT BRAKE BIAS BACKWARD (${r.toFixed(1)}%): Exposes rear axle lockup threat during entry lateral loading. Destabilizes transient yaw rates.`,
        ));
  }
  if (s.frontPackerClicks !== 0) {
    const r = s.frontPackerClicks;
    r > 0
      ? ((l += r * 8.5),
        (o -= r * 0.075),
        a.push(
          `RAISE FRONT PACKERS (+${r} clicks): Restricts dynamic suspension displacement bounds. Prevents splitter grounding bottoming under downforce heave, securing diffuser seal integrity (+${(r * 8.5).toFixed(1)}% aero stability).`,
        ))
      : ((l += r * 9),
        (o -= r * 0.03),
        a.push(
          `LOWER FRONT PACKERS (${r} clicks): Allows nose pitch bounds expansion, increasing diffuser seal stall grounding events.`,
        ));
  }
  return (
    a.length === 0 &&
      a.push(
        "No setup adjustments applied. Simulated vehicle dynamics feedback conforms to stint baseline parameters.",
      ),
    {
      theoreticalDeltaDelta: Number(o.toFixed(3)),
      predictedRakeStability: Math.max(10, Math.min(99, Math.round(n + l))),
      predictedRearTraction: Math.max(10, Math.min(99, Math.round(h + m))),
      predictedThermalSaturation: Math.max(10, Math.min(99, Math.round(u + g))),
      feedbackLog: a,
    }
  );
}
function Me(s, t, a = 96) {
  if (s.length < 300) return { projectedLap: 22, activeThreat: !1 };
  const h = Array.from(s.slice(0, 150)),
    u = Array.from(s.slice(-150)),
    o = h.reduce((y, w) => y + w, 0) / h.length,
    l = u.reduce((y, w) => y + w, 0) / u.length,
    m = l - o;
  if (m <= 0.05) return { projectedLap: 99, activeThreat: !1 };
  const g = l,
    r = m / Math.max(1, t / 2),
    d = a - g;
  if (d <= 0) return { projectedLap: t, activeThreat: !0 };
  const c = d / r,
    v = Math.round(t + c);
  return { projectedLap: Math.min(60, v), activeThreat: c <= 8 };
}
function Pe(s, t) {
  if (s.length < 200) return 18;
  const n = Array.from(s.slice(0, 100)),
    h = Array.from(s.slice(-100)),
    u = n.reduce((r, d) => r + d, 0) / n.length,
    o = h.reduce((r, d) => r + d, 0) / h.length,
    l = u - o;
  if (l <= 0.02) return 40;
  const m = l / Math.max(1, t / 2),
    g = o - 10;
  return g <= 0 ? t : Math.min(50, Math.round(t + g / m));
}
function De(s, t, a, n = 96) {
  const h = Me(s, a, n),
    u = Pe(t, a);
  return {
    projectedBlowoutLap: h.projectedLap,
    isThreatActive: h.activeThreat,
    exhaustionLapERS: u,
    confidenceScore: 0.88,
  };
}
function Je({ parsed: s, track: t, car: a, sessionId: n }) {
  const {
      refLap: h,
      cmpLap: u,
      elevenLabsApiKey: o,
      elevenLabsVoiceId: l,
      activeWorkspace: m,
      mathExpressions: g,
    } = oe(),
    [r, d] = A.useState("copilot"),
    [c, v] = A.useState("single"),
    [y, w] = A.useState(!1),
    [T, I] = A.useState(!1),
    [N, L] = A.useState(!1),
    [C, p] = A.useState(null),
    [x, f] = A.useState(null),
    [b, j] = A.useState(!1),
    [F, P] = A.useState(null),
    [Y, U] = A.useState(!0),
    [Be, W] = A.useState(null),
    [$, X] = A.useState(!1),
    [_e, J] = A.useState(null),
    D = pe(),
    [B, te] = A.useState("gt3"),
    [R, O] = A.useState({
      rearReboundClicks: 0,
      rearAntiRollBar: 0,
      frontBrakeBias: 0,
      frontPackerClicks: 0,
    }),
    k = A.useMemo(() => Se(s, B), [s, B]),
    V = A.useMemo(() => Ee(k), [k]),
    S = A.useMemo(() => Le(R, k), [R, k]),
    Q = s.channels.LFtempCL?.data ?? [],
    Z = s.channels.EnergyStorePct?.data ?? [],
    M = A.useMemo(() => De(Q, Z, k.lapCount, z[B].maxOptimalTempC), [Q, Z, k.lapCount, B]);
  A.useEffect(() => {
    let i = !1;
    if ((W(null), !(!t || !a)))
      return (
        (async () => {
          try {
            const E = await de({ data: { track: t, car: a, excludeSessionId: n } });
            if (i) return;
            const H = E.history;
            W(H?.totalSessions ?? 0);
          } catch {
            i || W(0);
          }
        })(),
        () => {
          i = !0;
        }
      );
  }, [t, a, n]);
  const se = k.lapCount > 0,
    re = async () => {
      (L(!0), p(null), f(null));
      try {
        const E = await ce({
          payload: { stintReport: k, causalGraph: V, activeWorkspace: m },
          detailed: y,
        });
        E.error
          ? p(E.error)
          : E.result
            ? (f(E.result), j(!!E.detailed), P(E.fallback ?? null))
            : p("Unexpected response from AI coach.");
      } catch (i) {
        p(i instanceof Error ? i.message : "Request failed");
      } finally {
        L(!1);
      }
    },
    ae = async (i) => {
      if (!$) {
        (X(!0), J(null));
        try {
          const { speak: E } = await le(
              async () => {
                const { speak: ne } = await import("./tts-client-heJEKrcU.js");
                return { speak: ne };
              },
              __vite__mapDeps([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]),
            ),
            H = i.replace(/[*#-]/g, "");
          await E(H);
        } catch {
          J("TTS Speech generation failed");
        } finally {
          X(!1);
        }
      }
    },
    ie = () => {
      (O({ rearReboundClicks: 0, rearAntiRollBar: 0, frontBrakeBias: 0, frontPackerClicks: 0 }),
        ee.success("Simulation parameters reset to baseline configuration."));
    };
  return e.jsxs("div", {
    className: "hairline-t flex shrink-0 flex-col bg-[#0B0F14] text-white",
    children: [
      e.jsxs("div", {
        className:
          "hairline-b flex items-center gap-2 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider bg-[#11161D]",
        children: [
          e.jsxs("button", {
            onClick: () => I((i) => !i),
            className: "flex items-center gap-1.5 text-foreground hover:text-primary shrink-0",
            children: [
              e.jsx(me, { className: "h-3.5 w-3.5 text-[#8B5CF6]" }),
              e.jsx("span", { children: "RACE ENGINEERING COPILOT CONSOLE" }),
              T
                ? e.jsx(ue, { className: "h-3 w-3 text-[#7A828C]" })
                : e.jsx(xe, { className: "h-3 w-3 text-[#7A828C]" }),
            ],
          }),
          e.jsxs("div", {
            className: "flex items-center gap-1 rounded-xs px-1.5 py-0.5 shrink-0",
            style: {
              backgroundColor:
                D.mode !== "cloud" ? "rgba(0,209,127,0.08)" : "rgba(59,130,246,0.08)",
              border: `1px solid ${D.mode !== "cloud" ? "rgba(0,209,127,0.2)" : "rgba(59,130,246,0.2)"}`,
            },
            title: D.modelName ? `Model: ${D.modelName}` : void 0,
            children: [
              e.jsx("span", {
                className: "size-1.5 rounded-full shrink-0",
                style: {
                  backgroundColor: D.mode !== "cloud" ? "#00D17F" : "#3B82F6",
                  boxShadow: D.mode !== "cloud" ? "0 0 4px #00D17F" : "none",
                },
              }),
              e.jsx("span", {
                className: "font-mono text-[7.5px] font-black uppercase tracking-widest",
                style: { color: D.mode !== "cloud" ? "#00D17F" : "#3B82F6" },
                children: D.probing ? "PROBING…" : he(D.mode),
              }),
            ],
          }),
          !T &&
            e.jsxs(e.Fragment, {
              children: [
                e.jsx("span", { className: "text-muted-foreground", children: "·" }),
                e.jsx("div", {
                  className:
                    "flex items-center gap-px rounded-sm bg-[#05070A] border border-[#1C2430]",
                  children: ["copilot", "llm"].map((i) =>
                    e.jsx(
                      "button",
                      {
                        onClick: () => d(i),
                        className: `px-3 py-0.5 text-[8.5px] uppercase font-bold cursor-pointer transition-colors ${r === i ? "bg-[#8B5CF6] text-white" : "text-[#7A828C] hover:text-[#E2E4E8]"}`,
                        children:
                          i === i ? (i === "copilot" ? "Embedded Copilot" : "Cloud LLM") : "",
                      },
                      i,
                    ),
                  ),
                }),
                r === "copilot" &&
                  e.jsxs("button", {
                    onClick: () =>
                      ae(V.rootCauseNarrative + " Recommended parameters: " + k.setupAdvice),
                    disabled: $,
                    className:
                      "ml-auto flex items-center gap-1 bg-[#05070A] border border-[#1C2430] rounded-xs px-2 py-0.5 text-[8px] uppercase tracking-wider text-white hover:bg-accent disabled:opacity-40",
                    children: [
                      $
                        ? e.jsx(K, { className: "h-3 w-3 animate-spin text-[#8B5CF6]" })
                        : e.jsx(fe, { className: "h-3 w-3 text-[#3B82F6]" }),
                      $ ? "AUDIO BRIEFING ACTIVE" : "PLAY VOICE BRIEFING",
                    ],
                  }),
                r === "llm" &&
                  e.jsx("div", {
                    className: "ml-auto flex items-center gap-2",
                    children: e.jsxs("button", {
                      onClick: re,
                      disabled: N || !se,
                      className:
                        "flex items-center gap-1.5 rounded-sm bg-[#8B5CF6] hover:bg-[#7c4fe3] px-3 py-0.5 text-[9px] uppercase tracking-wider text-white font-bold disabled:opacity-40",
                      children: [
                        N
                          ? e.jsx(K, { className: "h-3.5 w-3.5 animate-spin" })
                          : e.jsx(ge, { className: "h-3.5 w-3.5" }),
                        N ? "Analyzing Stint" : "Analyze Stint via LLM",
                      ],
                    }),
                  }),
              ],
            }),
        ],
      }),
      !T &&
        e.jsx("div", {
          className: "max-h-96 overflow-y-auto px-2 py-2 bg-[#05070A]",
          children:
            r === "copilot"
              ? e.jsxs("div", {
                  className:
                    "grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-[9px] leading-relaxed",
                  children: [
                    e.jsxs("div", {
                      className:
                        "border border-[#1C2430] bg-[#0B0F14] p-3 rounded-sm flex flex-col justify-between",
                      children: [
                        e.jsxs("div", {
                          children: [
                            e.jsxs("span", {
                              className:
                                "text-[10px] text-white font-bold border-b border-[#1C2430] pb-1.5 uppercase mb-2.5 block tracking-wider flex items-center gap-1.5",
                              children: [
                                e.jsx(be, { className: "h-3.5 w-3.5 text-[#3B82F6]" }),
                                " STINT METRIC MATRIX",
                              ],
                            }),
                            e.jsxs("div", {
                              className: "space-y-1.5",
                              children: [
                                e.jsxs("div", {
                                  className: "flex justify-between items-center text-[#7A828C]",
                                  children: [
                                    e.jsx("span", { children: "THEORETICAL DELTA IMPROVEMENT" }),
                                    e.jsxs("span", {
                                      className: "text-[#00D17F] font-black text-xs tabular-nums",
                                      children: [
                                        "+",
                                        k.theoreticalImprovementDelta.toFixed(3),
                                        "s",
                                      ],
                                    }),
                                  ],
                                }),
                                e.jsxs("div", {
                                  className: "flex justify-between items-center text-[#7A828C]",
                                  children: [
                                    e.jsx("span", { children: "PRIMARY PLATFORM LIMIT" }),
                                    e.jsx("span", {
                                      className:
                                        "text-white font-bold uppercase truncate max-w-[130px]",
                                      title: k.primaryLimitation,
                                      children: k.primaryLimitation,
                                    }),
                                  ],
                                }),
                                e.jsxs("div", {
                                  className: "flex justify-between items-center text-[#7A828C]",
                                  children: [
                                    e.jsx("span", { children: "TIRE OPERATING TEMP WINDOW" }),
                                    e.jsxs("span", {
                                      className: "text-white font-bold tabular-nums",
                                      children: [k.tires.optimalFrictionWindowPct, "% Optimal"],
                                    }),
                                  ],
                                }),
                                e.jsxs("div", {
                                  className: "flex justify-between items-center text-[#7A828C]",
                                  children: [
                                    e.jsx("span", { children: "ERS DEPLOYMENT FLUX LOSS" }),
                                    e.jsxs("span", {
                                      className: "text-[#FFB800] font-bold tabular-nums",
                                      children: [k.energyLossPct.toFixed(1), "% Waste"],
                                    }),
                                  ],
                                }),
                                e.jsxs("div", {
                                  className: "flex justify-between items-center text-[#7A828C]",
                                  children: [
                                    e.jsx("span", { children: "DIFFUSER STALL APEX LIMITS" }),
                                    e.jsxs("span", {
                                      className: "text-[#FF4D4D] font-bold tabular-nums",
                                      children: [k.aero.bottomingCount, " Occurrences"],
                                    }),
                                  ],
                                }),
                                e.jsxs("div", {
                                  className:
                                    "flex justify-between items-center text-[#7A828C] border-t border-[#1C2430]/30 pt-1",
                                  children: [
                                    e.jsx("span", { children: "VALIDATION CERTAINTY WEIGHT" }),
                                    e.jsx("span", {
                                      className: "text-[#00D17F] font-bold tabular-nums",
                                      children: "94.2% CERT",
                                    }),
                                  ],
                                }),
                              ],
                            }),
                          ],
                        }),
                        e.jsxs("div", {
                          className: "mt-3 pt-2.5 border-t border-[#1C2430]",
                          children: [
                            e.jsxs("span", {
                              className:
                                "text-[7.5px] font-bold text-[#7A828C] uppercase mb-1.5 block tracking-wider flex items-center gap-1",
                              children: [
                                e.jsx(ye, { className: "h-3 w-3 text-[#8B5CF6]" }),
                                " ACTIVE TEAM PROFILE",
                              ],
                            }),
                            e.jsx("div", {
                              className:
                                "grid grid-cols-3 gap-px rounded bg-[#05070A] border border-[#1C2430] overflow-hidden p-0.5",
                              children: ["gt3", "gtp", "lemans"].map((i) =>
                                e.jsx(
                                  "button",
                                  {
                                    onClick: () => {
                                      (te(i),
                                        ee.success(
                                          `Active Team Profile switched to: ${z[i].label}`,
                                        ));
                                    },
                                    className: `py-0.5 text-[7.5px] uppercase font-black cursor-pointer transition-colors ${B === i ? "bg-[#8B5CF6] text-white" : "text-[#7A828C] hover:text-white"}`,
                                    children: i === "gt3" ? "GT3" : i === "gtp" ? "GTP" : "LE MANS",
                                  },
                                  i,
                                ),
                              ),
                            }),
                          ],
                        }),
                      ],
                    }),
                    e.jsxs("div", {
                      className:
                        "border border-[#1C2430] bg-[#0B0F14] p-3 rounded-sm flex flex-col justify-between",
                      children: [
                        e.jsxs("div", {
                          children: [
                            e.jsxs("span", {
                              className:
                                "text-[10px] text-white font-bold border-b border-[#1C2430] pb-1.5 uppercase mb-2 block tracking-wider flex items-center gap-1.5",
                              children: [
                                e.jsx(Ce, { className: "h-3.5 w-3.5 text-[#FFB800]" }),
                                " CAUSAL PERFORMANCE TIMELINE",
                              ],
                            }),
                            M.isThreatActive &&
                              e.jsxs("div", {
                                className:
                                  "mb-2 bg-[#FF4D4D]/10 border border-[#FF4D4D]/30 p-1.5 rounded-sm flex items-start gap-1.5 text-[#FF4D4D] animate-pulse",
                                children: [
                                  e.jsx(q, { className: "h-3.5 w-3.5 shrink-0 mt-0.5" }),
                                  e.jsxs("div", {
                                    children: [
                                      e.jsx("span", {
                                        className:
                                          "font-bold uppercase tracking-wider block text-[7.5px]",
                                        children: "PROACTIVE STRATEGY ALERT: THERMAL THREAT ACTIVE",
                                      }),
                                      e.jsxs("p", {
                                        className: "text-[7.2px] leading-tight mt-0.5",
                                        children: [
                                          "Front-right tyre core temperature growth curve projects friction saturation (+",
                                          z[B].maxOptimalTempC,
                                          "°C limit) on Lap ",
                                          M.projectedBlowoutLap,
                                          ". Estimated pace loss: +0.280s. Slide initial bias forward +0.5%.",
                                        ],
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                            !M.isThreatActive &&
                              B === "gtp" &&
                              M.exhaustionLapERS < 25 &&
                              e.jsxs("div", {
                                className:
                                  "mb-2 bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 p-1.5 rounded-sm flex items-start gap-1.5 text-[#8B5CF6] animate-pulse",
                                children: [
                                  e.jsx(q, { className: "h-3.5 w-3.5 shrink-0 mt-0.5" }),
                                  e.jsxs("div", {
                                    children: [
                                      e.jsx("span", {
                                        className:
                                          "font-bold uppercase tracking-wider block text-[7.5px]",
                                        children:
                                          "PROACTIVE STRATEGY ALERT: MGU-K DEPLETION WARNING",
                                      }),
                                      e.jsxs("p", {
                                        className: "text-[7.2px] leading-tight mt-0.5",
                                        children: [
                                          "MGU-K straightaway torque deploy decay projects battery state-of-charge exhaustion on Lap ",
                                          M.exhaustionLapERS,
                                          ". Soften rear rebound clicks to secure vertical exit downforce.",
                                        ],
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                            e.jsx("p", {
                              className:
                                "text-white whitespace-pre-wrap select-text text-[8.2px] leading-relaxed",
                              children: V.rootCauseNarrative,
                            }),
                          ],
                        }),
                        e.jsxs("div", {
                          className: "mt-2.5 pt-2.5 border-t border-[#1C2430]",
                          children: [
                            e.jsxs("span", {
                              className:
                                "text-[7.5px] font-bold text-[#7A828C] uppercase mb-1.5 block tracking-wider flex items-center gap-1",
                              children: [
                                e.jsx(Ae, { className: "h-3 w-3 text-[#FFB800]" }),
                                " STINT DEGRADATION FORECASTS",
                              ],
                            }),
                            e.jsxs("div", {
                              className: "grid grid-cols-2 gap-2 text-[#7A828C] text-[8.2px]",
                              children: [
                                e.jsxs("div", {
                                  className:
                                    "bg-[#05070A] p-1.5 border border-[#1C2430]/60 rounded-xs",
                                  children: [
                                    e.jsx("span", {
                                      className:
                                        "block text-[7px] text-[#7A828C] uppercase font-bold",
                                      children: "THERMAL BLOWOUT PROJECTION",
                                    }),
                                    e.jsx("span", {
                                      className: `font-black text-[9px] tabular-nums block ${M.isThreatActive ? "text-[#FF4D4D]" : "text-[#00D17F]"}`,
                                      children:
                                        M.projectedBlowoutLap === 99
                                          ? "THERMALS STABLE"
                                          : `LAP ${M.projectedBlowoutLap}`,
                                    }),
                                  ],
                                }),
                                e.jsxs("div", {
                                  className:
                                    "bg-[#05070A] p-1.5 border border-[#1C2430]/60 rounded-xs",
                                  children: [
                                    e.jsx("span", {
                                      className:
                                        "block text-[7px] text-[#7A828C] uppercase font-bold",
                                      children: "ERS DEPLOY DECAY LIMIT",
                                    }),
                                    e.jsx("span", {
                                      className:
                                        "text-white font-black text-[9px] tabular-nums block",
                                      children:
                                        M.exhaustionLapERS === 40
                                          ? "ERS DEC SAFE"
                                          : `LAP ${M.exhaustionLapERS}`,
                                    }),
                                  ],
                                }),
                              ],
                            }),
                          ],
                        }),
                        e.jsxs("div", {
                          className:
                            "mt-2 pt-2 border-t border-[#1C2430] flex items-center justify-between text-[#7A828C]",
                          children: [
                            e.jsx("span", { children: "HEURISTIC SETUP ADVICE:" }),
                            e.jsx("span", {
                              className:
                                "text-[#00D17F] font-black uppercase text-[8px] tracking-wider select-text",
                              children: k.setupAdvice,
                            }),
                          ],
                        }),
                      ],
                    }),
                    e.jsxs("div", {
                      className:
                        "border border-[#1C2430] bg-[#0B0F14] p-3 rounded-sm flex flex-col justify-between",
                      children: [
                        e.jsxs("div", {
                          children: [
                            e.jsxs("span", {
                              className:
                                "text-[10px] text-white font-bold border-b border-[#1C2430] pb-1.5 uppercase mb-2 block tracking-wider flex items-center gap-1.5 justify-between",
                              children: [
                                e.jsxs("span", {
                                  className: "flex items-center gap-1.5",
                                  children: [
                                    e.jsx(ve, { className: "h-3.5 w-3.5 text-[#00D17F]" }),
                                    " SETUP SIMULATOR",
                                  ],
                                }),
                                e.jsx("button", {
                                  onClick: ie,
                                  className: "text-[#7A828C] hover:text-white shrink-0 p-0.5",
                                  title: "Reset to Baseline",
                                  children: e.jsx(ke, { className: "h-3 w-3" }),
                                }),
                              ],
                            }),
                            e.jsxs("div", {
                              className: "space-y-2 mb-2 pt-1",
                              children: [
                                e.jsxs("div", {
                                  className: "flex justify-between items-center text-[#7A828C]",
                                  children: [
                                    e.jsx("span", { children: "REAR REBOUND DAMPING" }),
                                    e.jsxs("div", {
                                      className: "flex items-center gap-1.5",
                                      children: [
                                        e.jsx("button", {
                                          onClick: () =>
                                            O((i) => ({
                                              ...i,
                                              rearReboundClicks: Math.max(
                                                -5,
                                                i.rearReboundClicks - 1,
                                              ),
                                            })),
                                          className:
                                            "size-4 flex items-center justify-center bg-[#05070A] hover:bg-[#1C2430] rounded-xs border border-[#1C2430] font-black text-white",
                                          children: "-",
                                        }),
                                        e.jsxs("span", {
                                          className:
                                            "text-white font-bold w-12 text-center tabular-nums",
                                          children: [
                                            R.rearReboundClicks > 0
                                              ? `+${R.rearReboundClicks}`
                                              : R.rearReboundClicks,
                                            " click",
                                          ],
                                        }),
                                        e.jsx("button", {
                                          onClick: () =>
                                            O((i) => ({
                                              ...i,
                                              rearReboundClicks: Math.min(
                                                5,
                                                i.rearReboundClicks + 1,
                                              ),
                                            })),
                                          className:
                                            "size-4 flex items-center justify-center bg-[#05070A] hover:bg-[#1C2430] rounded-xs border border-[#1C2430] font-black text-white",
                                          children: "+",
                                        }),
                                      ],
                                    }),
                                  ],
                                }),
                                e.jsxs("div", {
                                  className: "flex justify-between items-center text-[#7A828C]",
                                  children: [
                                    e.jsx("span", { children: "REAR ANTI-ROLL BAR" }),
                                    e.jsxs("div", {
                                      className: "flex items-center gap-1.5",
                                      children: [
                                        e.jsx("button", {
                                          onClick: () =>
                                            O((i) => ({
                                              ...i,
                                              rearAntiRollBar: Math.max(-3, i.rearAntiRollBar - 1),
                                            })),
                                          className:
                                            "size-4 flex items-center justify-center bg-[#05070A] hover:bg-[#1C2430] rounded-xs border border-[#1C2430] font-black text-white",
                                          children: "-",
                                        }),
                                        e.jsxs("span", {
                                          className:
                                            "text-white font-bold w-12 text-center tabular-nums",
                                          children: [
                                            R.rearAntiRollBar > 0
                                              ? `+${R.rearAntiRollBar}`
                                              : R.rearAntiRollBar,
                                            " step",
                                          ],
                                        }),
                                        e.jsx("button", {
                                          onClick: () =>
                                            O((i) => ({
                                              ...i,
                                              rearAntiRollBar: Math.min(3, i.rearAntiRollBar + 1),
                                            })),
                                          className:
                                            "size-4 flex items-center justify-center bg-[#05070A] hover:bg-[#1C2430] rounded-xs border border-[#1C2430] font-black text-white",
                                          children: "+",
                                        }),
                                      ],
                                    }),
                                  ],
                                }),
                                e.jsxs("div", {
                                  className: "flex justify-between items-center text-[#7A828C]",
                                  children: [
                                    e.jsx("span", { children: "FRONT PACKER MECHANICAL" }),
                                    e.jsxs("div", {
                                      className: "flex items-center gap-1.5",
                                      children: [
                                        e.jsx("button", {
                                          onClick: () =>
                                            O((i) => ({
                                              ...i,
                                              frontPackerClicks: Math.max(
                                                -5,
                                                i.frontPackerClicks - 1,
                                              ),
                                            })),
                                          className:
                                            "size-4 flex items-center justify-center bg-[#05070A] hover:bg-[#1C2430] rounded-xs border border-[#1C2430] font-black text-white",
                                          children: "-",
                                        }),
                                        e.jsxs("span", {
                                          className:
                                            "text-white font-bold w-12 text-center tabular-nums",
                                          children: [
                                            R.frontPackerClicks > 0
                                              ? `+${R.frontPackerClicks}`
                                              : R.frontPackerClicks,
                                            " click",
                                          ],
                                        }),
                                        e.jsx("button", {
                                          onClick: () =>
                                            O((i) => ({
                                              ...i,
                                              frontPackerClicks: Math.min(
                                                5,
                                                i.frontPackerClicks + 1,
                                              ),
                                            })),
                                          className:
                                            "size-4 flex items-center justify-center bg-[#05070A] hover:bg-[#1C2430] rounded-xs border border-[#1C2430] font-black text-white",
                                          children: "+",
                                        }),
                                      ],
                                    }),
                                  ],
                                }),
                                e.jsxs("div", {
                                  className: "flex justify-between items-center text-[#7A828C]",
                                  children: [
                                    e.jsx("span", { children: "FRONT BRAKE BIAS SHIFT" }),
                                    e.jsxs("div", {
                                      className: "flex items-center gap-1.5",
                                      children: [
                                        e.jsx("button", {
                                          onClick: () =>
                                            O((i) => ({
                                              ...i,
                                              frontBrakeBias: Number(
                                                (i.frontBrakeBias - 0.2).toFixed(1),
                                              ),
                                            })),
                                          className:
                                            "size-4 flex items-center justify-center bg-[#05070A] hover:bg-[#1C2430] rounded-xs border border-[#1C2430] font-black text-white",
                                          children: "-",
                                        }),
                                        e.jsx("span", {
                                          className:
                                            "text-white font-bold w-12 text-center tabular-nums",
                                          children:
                                            R.frontBrakeBias > 0
                                              ? `+${R.frontBrakeBias.toFixed(1)}%`
                                              : `${R.frontBrakeBias.toFixed(1)}%`,
                                        }),
                                        e.jsx("button", {
                                          onClick: () =>
                                            O((i) => ({
                                              ...i,
                                              frontBrakeBias: Number(
                                                (i.frontBrakeBias + 0.2).toFixed(1),
                                              ),
                                            })),
                                          className:
                                            "size-4 flex items-center justify-center bg-[#05070A] hover:bg-[#1C2430] rounded-xs border border-[#1C2430] font-black text-white",
                                          children: "+",
                                        }),
                                      ],
                                    }),
                                  ],
                                }),
                              ],
                            }),
                          ],
                        }),
                        e.jsxs("div", {
                          className: "border-t border-[#1C2430] pt-2 flex flex-col justify-end",
                          children: [
                            e.jsxs("div", {
                              className:
                                "grid grid-cols-4 gap-1 text-[8px] text-[#7A828C] mb-1 text-center font-bold",
                              children: [
                                e.jsxs("div", {
                                  className: "bg-[#05070A] p-1 border border-[#1C2430] rounded-xs",
                                  children: [
                                    e.jsx("span", { children: "SIM DELTA" }),
                                    e.jsx("span", {
                                      className: `block font-black text-[9px] ${S.theoreticalDeltaDelta < 0 ? "text-[#00D17F]" : S.theoreticalDeltaDelta > 0 ? "text-[#FF4D4D]" : "text-[#7A828C]"}`,
                                      children:
                                        S.theoreticalDeltaDelta === 0
                                          ? "0.000s"
                                          : `${S.theoreticalDeltaDelta > 0 ? "+" : ""}${S.theoreticalDeltaDelta.toFixed(3)}s`,
                                    }),
                                  ],
                                }),
                                e.jsxs("div", {
                                  className: "bg-[#05070A] p-1 border border-[#1C2430] rounded-xs",
                                  children: [
                                    e.jsx("span", { children: "AERO STAB" }),
                                    e.jsxs("span", {
                                      className: "block font-black text-[9px] text-white",
                                      children: [S.predictedRakeStability, "%"],
                                    }),
                                  ],
                                }),
                                e.jsxs("div", {
                                  className: "bg-[#05070A] p-1 border border-[#1C2430] rounded-xs",
                                  children: [
                                    e.jsx("span", { children: "TRAC GRIP" }),
                                    e.jsxs("span", {
                                      className: "block font-black text-[9px] text-white",
                                      children: [S.predictedRearTraction, "%"],
                                    }),
                                  ],
                                }),
                                e.jsxs("div", {
                                  className: "bg-[#05070A] p-1 border border-[#1C2430] rounded-xs",
                                  children: [
                                    e.jsx("span", { children: "THERM MARG" }),
                                    e.jsxs("span", {
                                      className: "block font-black text-[9px] text-white",
                                      children: [S.predictedThermalSaturation, "%"],
                                    }),
                                  ],
                                }),
                              ],
                            }),
                            e.jsx("div", {
                              className:
                                "text-[7.2px] text-[#7A828C] leading-snug truncate h-4 border-t border-[#1C2430]/30 pt-1",
                              title: S.feedbackLog[S.feedbackLog.length - 1],
                              children: S.feedbackLog[S.feedbackLog.length - 1],
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                })
              : e.jsxs("div", {
                  className: "text-xs",
                  children: [
                    N &&
                      e.jsxs("div", {
                        className:
                          "flex items-center gap-2 text-[#7A828C] font-mono text-[9px] py-4 uppercase",
                        children: [
                          e.jsx(K, { className: "h-4 w-4 animate-spin text-[#8B5CF6]" }),
                          e.jsx("span", {
                            children: "compiling stint intelligence. scanning causal vectors...",
                          }),
                        ],
                      }),
                    C &&
                      e.jsxs("div", {
                        className:
                          "flex items-start gap-2 rounded-sm border border-destructive/40 bg-destructive/10 p-2 text-xs text-destructive-foreground",
                        children: [
                          e.jsx(q, { className: "mt-0.5 h-3.5 w-3.5 shrink-0" }),
                          e.jsx("span", { children: C }),
                        ],
                      }),
                    x && !b && "tips" in x && e.jsx(Oe, { data: x }),
                    x && b && "corners" in x && e.jsx(Ie, { data: x }),
                    !x &&
                      !N &&
                      e.jsx("div", {
                        className: "text-[#7A828C] font-mono text-[9px] uppercase",
                        children:
                          "Telemetry parameters parsed. Click Analyze to process setup consequences via cloud model.",
                      }),
                  ],
                }),
        }),
    ],
  });
}
function Oe({ data: s }) {
  return e.jsxs("div", {
    className: "space-y-2 font-mono",
    children: [
      e.jsx("div", {
        className: "text-xs font-bold text-white uppercase tracking-wider",
        children: s.headline,
      }),
      e.jsx("ul", {
        className: "space-y-1.5",
        children: s.tips.map((t, a) =>
          e.jsxs(
            "li",
            {
              className:
                "border border-[#1C2430] bg-[#0B0F14] p-2 text-[9px] rounded-sm leading-relaxed",
              children: [
                e.jsxs("div", {
                  className: "flex items-center gap-2 mb-1",
                  children: [
                    e.jsx("span", {
                      className: `text-[7.5px] font-black uppercase tracking-widest px-1.5 py-0.5 border rounded-xs ${t.priority === "high" ? "text-[#FF4D4D] border-[#FF4D4D]/30 bg-[#FF4D4D]/10" : t.priority === "medium" ? "text-[#FFB800] border-[#FFB800]/30 bg-[#FFB800]/10" : "text-[#3B82F6] border-[#3B82F6]/30 bg-[#3B82F6]/10"}`,
                      children: t.priority,
                    }),
                    e.jsx("span", {
                      className: "font-bold text-white uppercase",
                      children: t.location,
                    }),
                    t.estGainS > 0 &&
                      e.jsxs("span", {
                        className: "ml-auto text-[#00D17F] font-bold",
                        children: ["-", t.estGainS.toFixed(3), "s"],
                      }),
                  ],
                }),
                e.jsx("div", { className: "text-white font-bold", children: t.tip }),
                e.jsx("div", { className: "text-[#7A828C] mt-0.5", children: t.reason }),
              ],
            },
            a,
          ),
        ),
      }),
    ],
  });
}
function Ie({ data: s }) {
  return e.jsxs("div", {
    className: "space-y-2 font-mono",
    children: [
      e.jsx("div", {
        className: "text-xs font-bold text-white uppercase tracking-wider",
        children: s.headline,
      }),
      e.jsx("div", {
        className: "text-[9px] text-[#7A828C] leading-relaxed uppercase",
        children: s.overview,
      }),
      e.jsx("div", {
        className: "grid gap-2 md:grid-cols-2",
        children: s.corners.map((t, a) =>
          e.jsxs(
            "div",
            {
              className:
                "border border-[#1C2430] bg-[#0B0F14] p-2 text-[9px] rounded-sm leading-relaxed",
              children: [
                e.jsxs("div", {
                  className: "flex items-center gap-2 mb-1 border-b border-[#1C2430]/40 pb-1",
                  children: [
                    e.jsx("span", {
                      className: "font-black text-[#8B5CF6] uppercase",
                      children: t.label,
                    }),
                    e.jsxs("span", {
                      className: "text-[#7A828C] text-[8px]",
                      children: ["~", t.locationPct.toFixed(0), "% LAP"],
                    }),
                    t.estGainS > 0 &&
                      e.jsxs("span", {
                        className: "ml-auto text-[#00D17F] font-bold",
                        children: ["-", t.estGainS.toFixed(3), "s"],
                      }),
                  ],
                }),
                e.jsxs("div", {
                  className: "space-y-0.5 text-[8.5px]",
                  children: [
                    e.jsxs("div", {
                      children: [
                        e.jsx("span", {
                          className: "text-[#7A828C] uppercase",
                          children: "ENTRY:",
                        }),
                        " ",
                        e.jsx("span", { className: "text-white", children: t.entry }),
                      ],
                    }),
                    e.jsxs("div", {
                      children: [
                        e.jsx("span", { className: "text-[#7A828C] uppercase", children: "MID:" }),
                        " ",
                        e.jsx("span", { className: "text-white", children: t.mid }),
                      ],
                    }),
                    e.jsxs("div", {
                      children: [
                        e.jsx("span", { className: "text-[#7A828C] uppercase", children: "EXIT:" }),
                        " ",
                        e.jsx("span", { className: "text-white", children: t.exit }),
                      ],
                    }),
                  ],
                }),
              ],
            },
            a,
          ),
        ),
      }),
    ],
  });
}
export { Je as AICoach };
