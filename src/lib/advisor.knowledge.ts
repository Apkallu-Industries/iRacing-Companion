/**
 * Distilled "Holy Bible" of car setup, sourced from:
 *   - "Road Racing Setup Flow Chart" (Tim McArthur)
 *   - "Oval Stock Car Setup Flow Chart" (Tim McArthur)
 *   - "Learn to setup your race car" eBook (Tim McArthur, 2017)
 *
 * Every CAR SETUP suggestion the advisor returns MUST be traceable to a rule
 * in this file. Driving-style coaching does NOT use this knowledge base.
 */

export const SETUP_BIBLE = `
=================  SETUP "HOLY BIBLE" — TIM McARTHUR  =================

GUIDING PRINCIPLES
- Stability over hot-lap pace. Spins cost more than a tenth ever saves.
- Tyres are the contact patch. Re-check temps/pressures after EVERY change.
- Camber sets inner-vs-outer tyre temp. Pressure fine-tunes the middle band.
- Softer = more mechanical grip + slower response. Stiffer = sharper but less forgiving.
- Springs preload grip to a corner. Stiffer spring = more instant grip there
  but tyre overloads sooner.
- Antiroll bars: SOFTER ARB on an end = MORE grip to that end. (Easiest tool
  to re-balance a car.)
- A tyre needs slip (~4-8°) to make peak grip. Zero slip = no grip.
- Every change is a compromise: gain somewhere, lose elsewhere. State it.

================  ROAD RACING — GENERAL UNDERSTEER  =================
Apply in priority order (top = biggest effect):
1.  - Front ARB  OR  + Rear ARB
2.  - Front Springs  OR  + Rear Springs
3.  - Front Weight  OR  + Rear Weight
4.  + Front Spoiler  OR  - Rear Spoiler   (high-speed corners only)
5.  - Front tyre pressures  OR  + Rear tyre pressures

Corner-specific (road, LH or RH):
- Entry: + outside-front pressure or + inside-rear pressure;
         + outside-front caster;
         - diff coast; - diff power;
         + front toe-out; + rear toe-out;
         - outside-front bump or + inside-rear rebound;
         - outside-front rebound or + inside-rear bump.
- ALWAYS: re-check tyre temps and camber after.

================  ROAD RACING — GENERAL OVERSTEER  =================
1.  + Front ARB  OR  - Rear ARB
2.  + Front Springs  OR  - Rear Springs
3.  + Front Weight  OR  - Rear Weight
4.  - Front Spoiler  OR  + Rear Spoiler   (high-speed corners only)
5.  + Front tyre pressures  OR  - Rear tyre pressures

Corner-specific:
- Entry: + outside-front pressure or + inside-rear pressure;
         - outside-front caster;
         + diff coast on entry; + diff power on exit;
         - front toe-out; - rear toe-out;
         + outside-front bump or - inside-rear rebound;
         + outside-front rebound or - inside-rear bump.
- ALWAYS: re-check tyre temps and camber after.

================  OVAL — UNDERSTEER (PUSH)  ================
1.  - Front ARB  OR  + Rear ARB
2.  + LF Spring  OR  + RR Spring
3.  + Front Spoiler  OR  - Rear Spoiler
4.  - Front Weight  OR  + Rear Weight
5.  + LF spring rubber  OR  + RR spring rubber
6.  + LF pressure  OR  + RR pressure
Entry: - Trackbar.    Apex: - Wedge.    Exit: + Trackbar.
Also: + LF caster; + front toe-out / + rear toe-out;
      - RF bump or + LR rebound; - RF rebound or + LR bump.

================  OVAL — OVERSTEER (LOOSE)  ================
1.  + Front ARB  OR  - Rear ARB
2.  + RF Spring  OR  + LR Spring
3.  - Front Spoiler  OR  + Rear Spoiler
4.  + Front Weight  OR  - Rear Weight
5.  + RF spring rubber  OR  + LR spring rubber
6.  + RF pressure  OR  + LR pressure
Entry: + Trackbar.    Apex: + Wedge.    Exit: - Trackbar.
Also: - LF caster; - front toe-out / - rear toe-out;
      + RF bump or - LR rebound; + RF rebound or - LR bump.

================  TYRE-TEMP RULES (eBook ch. TIRE PRESSURES)  ================
- Target: inner ≈ middle ≈ outer ACROSS THE CORNER (not after a straight).
- Outer slightly cooler than inner is acceptable; outer hotter than inner is NOT.
- Inner > outer by a lot → too much negative camber. Reduce camber.
- Outer > inner → not enough negative camber. Add camber.
- Middle too cool vs inner+outer → raise pressure. Middle too hot → drop pressure.
- 1 psi of pressure ≈ 15-25 lb/in of spring rate — re-balance after pressure moves.

================  FRONT-vs-REAR TEMP IMBALANCE  ================
- Fronts much hotter than rears → fronts overworked. Either:
    * shift brake bias rearward (small step, 0.5-1.0%),
    * soften front spring / stiffen rear spring,
    * or soften FRONT ARB (more front grip).
- Rears much hotter than fronts → rears overworked. Either:
    * shift brake bias forward,
    * stiffen front spring / soften rear spring,
    * or soften REAR ARB.

================  DAMPER RULES (eBook ch. DAMPERS)  ================
- Front compression: how fast weight loads the fronts under braking.
  Softer compression = faster front grip on turn-in (good for understeer-on-entry).
- Rear rebound: how fast rear unloads under braking.
  SOFTER rear rebound = rears stay planted on entry (helps loose-on-entry).
- Rear compression: how fast rear loads under throttle (traction on exit).
- Front rebound: how fast front unloads under throttle (helps front bite on exit).
- Fast bump/rebound = curb/bump behaviour only. Use softer fast-compression
  to soak curbs, stiffer fast-rebound to prevent bounce.

================  DIFF RULES (eBook ch. DIFFERENTIAL)  ================
- Loose diff (low %) = inside wheel free to spin; forgiving, but inside tyre
  can light up and kill exit drive. Good for long sweeping corners.
- Tight diff (high %) = wheels locked together; great straight-line traction
  out of hairpins, but snap-oversteer risk in long corners.
- Power = on-throttle; Coast = off-throttle.
- Preload high = sharper transition on/off throttle but twitchier.
  Preload low = smoother but vaguer mid-corner.

================  AERO RULES  ================
- More front wing = more front grip at high speed → can cause high-speed oversteer.
- More rear wing = more rear grip at high speed → can cause high-speed understeer.
- Only carry as much wing as the most important fast corner needs — every extra
  click costs straight-line speed.

================  PROCESS RULES (eBook INTRODUCTION)  ================
- Build a baseline you trust per car, then make small per-track tweaks.
- Change ONE thing at a time. Re-test for 3-5 clean laps before judging.
- After ANY change to springs/ARB/camber/caster/toe → re-check tyre temps
  and re-tune pressures. This is not optional.
- If two tools would fix the same problem, prefer the higher-impact one
  (top of the flowchart) for the first change, the lower-impact ones for
  fine-tuning.

================  RECOMMENDATION OUTPUT FORMAT  ================
For every setup tip you give, name:
  (a) the symptom you observed in the data (e.g. "FL+FR ~94°C vs RL+RR ~84°C"),
  (b) the rule from above you're applying (paraphrase, don't quote literally),
  (c) the concrete change in the driver's units (clicks, %, psi, bar).
Always finish with: "Re-check tyre temps after the change."
`.trim();
