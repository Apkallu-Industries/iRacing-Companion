export function localCoachFallbackConcise(payload: unknown, detailed: boolean) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const p = (payload ?? {}) as any;
  const tips: Array<{
    priority: "high" | "medium" | "low";
    location: string;
    tip: string;
    reason: string;
    estGainS: number;
  }> = [];
  const phys = p.physics ?? {};
  const cf = phys.counterfactual;
  if (cf?.zones?.length) {
    for (const z of (cf.zones as Array<Record<string, number>>).slice(0, 3)) {
      const dApex = (z.bestApexSpeed ?? 0) - (z.refApexSpeed ?? 0);
      const dExit = (z.bestExitSpeed ?? 0) - (z.refExitSpeed ?? 0);
      tips.push({
        priority: z.gainS > 0.15 ? "high" : "medium",
        location: `${Math.round(z.startPct)}–${Math.round(z.endPct)}% lap`,
        tip:
          dExit > dApex
            ? "Get back to throttle earlier — your best lap unwinds the wheel and accelerates sooner here."
            : dApex > 0.5
              ? "Carry more minimum speed — release the brake a touch earlier and trail less."
              : "Move the brake point a few metres later and shorten the threshold phase.",
        reason: `Best lap was ${z.gainS.toFixed(2)}s faster through this zone (apex Δ ${dApex.toFixed(1)} m/s, exit Δ ${dExit.toFixed(1)} m/s).`,
        estGainS: Number(z.gainS?.toFixed(2) ?? 0),
      });
    }
  }
  const br = phys.brake;
  if (br && br.r2 != null && br.r2 < 0.7) {
    tips.push({
      priority: "medium",
      location: "All braking zones",
      tip: "Smooth the initial bite — apply pressure in one progressive squeeze instead of pumping.",
      reason: `Brake linearity R² is ${br.r2.toFixed(2)} (low), suggesting lockup or modulation rather than a clean threshold.`,
      estGainS: 0.1,
    });
  }
  const sl = phys.slip;
  if (sl?.balance && sl.balance !== "neutral") {
    tips.push({
      priority: "medium",
      location: "Mid-corner balance",
      tip:
        sl.balance === "loose"
          ? "Add a click of rear wing or soften front anti-roll — back end is stepping out under load."
          : "Soften rear or shift bias rearward — front is pushing through the mid-corner.",
      reason: `Body slip β ${sl.peakBetaDeg?.toFixed?.(1) ?? "?"}° at high lateral g — balance reads ${sl.balance}.`,
      estGainS: 0.15,
    });
  }
  const gg = phys.gg;
  if (gg && gg.peakLatG && gg.combinedG && gg.combinedG < gg.peakLatG * 0.85) {
    tips.push({
      priority: "low",
      location: "Trail-braking phase",
      tip: "Use more of the friction circle — overlap brake and steering longer to keep combined-g closer to the lateral peak.",
      reason: `Peak lateral ${gg.peakLatG.toFixed(2)}g but combined only ${gg.combinedG.toFixed(2)}g — grip left on the table when transitioning.`,
      estGainS: 0.1,
    });
  }
  // Always pad to at least 3 generic-but-useful tips.
  const filler: typeof tips = [
    {
      priority: "low",
      location: "Corner exits",
      tip: "Unwind the wheel before flooring the throttle — open the steering as the car rotates, then commit.",
      reason:
        "Generic best practice: any unwind-while-loading-throttle window costs exit speed down the next straight.",
      estGainS: 0.05,
    },
    {
      priority: "low",
      location: "Braking points",
      tip: "Walk brake markers 2–3 m later one zone at a time until you start missing the apex, then back off one step.",
      reason:
        "Iterative brake-point pruning is the cheapest lap-time you can find without changing setup.",
      estGainS: 0.1,
    },
    {
      priority: "low",
      location: "Tyre + fuel management",
      tip: "Hold a steady minimum corner speed across consecutive laps — consistency unlocks setup signal.",
      reason:
        "Run-to-run variation hides real gains; consistent inputs surface the actual limit of the car.",
      estGainS: 0.05,
    },
  ];
  for (const f of filler) {
    if (tips.length >= 3) break;
    tips.push(f);
  }
  if (detailed) {
    return {
      headline: "Local analysis (AI fallback) — measured time on the table",
      overview:
        "AI gateway returned no structured response, so this breakdown is built directly from your physics + counterfactual zones.",
      corners: tips.slice(0, 4).map((t, i) => ({
        label: `Zone ${i + 1}`,
        locationPct: 10 + i * 20,
        entry: t.tip,
        mid: t.reason,
        exit: "Refer to the trace + g-g view for the exact release point.",
        estGainS: t.estGainS,
      })),
    };
  }
  return {
    headline: "Local analysis (AI fallback) — here's what the numbers say",
    tips: tips.slice(0, 6),
  };
}

export function localLiveCoachFallback(summary: {
  tone: "push" | "hold" | "warn";
  beats: string[];
  sectorOpportunities?: Array<{ sector: number; deltaS: number }>;
}) {
  const headlineMap = {
    push: "Time on the table — go get it.",
    hold: "That's the lap — same again.",
    warn: "Ease off — bank it.",
  };
  const focus = summary.sectorOpportunities?.[0]
    ? `Sector ${summary.sectorOpportunities[0].sector}`
    : undefined;
  return {
    tone: summary.tone,
    headline: headlineMap[summary.tone],
    detail: summary.beats.join(" "),
    focus,
  };
}
