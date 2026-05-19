import { useEffect, useRef, useCallback, useState } from "react";
import type { Telemetry } from "@/lib/telemetry-types";

export interface LapAggregate {
    startedAt: number;
    maxBrakePct: number;
    maxThrottlePct: number;
    peakLatG: number;
    peakLonG: number;
    tireSum: number;
    tireSamples: number;
    fuelAtStartL: number;
    bigGSpike: boolean;
    tireAvgC: number;
}

export interface LapResult extends LapAggregate {
    lapTimeS: number;
    s1S: number | null;
    s2S: number | null;
    s3S: number | null;
    fuelUsedL: number;
    isValid: boolean;
}

function freshAggregate(now: number, fuelL: number): LapAggregate {
    return {
        startedAt: now,
        maxBrakePct: 0,
        maxThrottlePct: 0,
        peakLatG: 0,
        peakLonG: 0,
        tireSum: 0,
        tireSamples: 0,
        fuelAtStartL: fuelL,
        bigGSpike: false,
        tireAvgC: 0,
    };
}

/** Parse "M:SS.mmm" or "SS.mmm" into seconds. Returns null on bad input. */
function parseLapStr(s: string | null | undefined): number | null {
    if (!s || s === "--.---" || s === "--:--.---") return null;
    const m = /^(?:(\d+):)?(\d+(?:\.\d+)?)$/.exec(s.trim());
    if (!m) return null;
    const mins = m[1] ? parseInt(m[1], 10) : 0;
    const secs = parseFloat(m[2]);
    if (!isFinite(secs)) return null;
    return mins * 60 + secs;
}

export function useLapAggregate(t: Telemetry, onLapComplete?: (lap: LapResult) => void) {
    // Tick-by-tick aggregation
    const aggRef = useRef<LapAggregate>(freshAggregate(performance.now(), t.fuelRemainingL));
    const lastLapStrRef = useRef<string>(t.lastLap);
    const [lastLapResult, setLastLapResult] = useState<LapResult | null>(null);

    useEffect(() => {
        const agg = aggRef.current;
        agg.maxBrakePct = Math.max(agg.maxBrakePct, t.brake * 100);
        agg.maxThrottlePct = Math.max(agg.maxThrottlePct, t.throttle * 100);
        agg.peakLatG = Math.max(agg.peakLatG, Math.abs(t.gLat));
        agg.peakLonG = Math.max(agg.peakLonG, Math.abs(t.gLon));
        const tAvg = (t.tires.fl.tempC + t.tires.fr.tempC + t.tires.rl.tempC + t.tires.rr.tempC) / 4;
        agg.tireSum += tAvg;
        agg.tireSamples += 1;
        if (Math.abs(t.gLat) > 2.5 || Math.abs(t.gLon) > 2.5) agg.bigGSpike = true;
        agg.tireAvgC = agg.tireSamples > 0 ? agg.tireSum / agg.tireSamples : 0;
    }, [t.brake, t.throttle, t.gLat, t.gLon, t.tires]);

    const handleLapComplete = useCallback(
        (lapTimeS: number) => {
            const agg = aggRef.current;
            const s1S = parseLapStr(t.sectors.s1);
            const s2NetS = parseLapStr(t.sectors.s2);
            const s2S = s1S != null && s2NetS != null && s2NetS > s1S ? +(s2NetS - s1S).toFixed(3) : null;
            const s3S = s2NetS != null && s2NetS < lapTimeS ? +(lapTimeS - s2NetS).toFixed(3) : null;

            const fuelUsed = Math.max(0, agg.fuelAtStartL - t.fuelRemainingL);
            const isValid = !agg.bigGSpike && lapTimeS > 20 && lapTimeS < 600;

            const result: LapResult = {
                ...agg,
                lapTimeS,
                s1S,
                s2S,
                s3S,
                fuelUsedL: fuelUsed,
                isValid,
            };

            setLastLapResult(result);
            if (onLapComplete) {
                onLapComplete(result);
            }

            // Reset aggregate immediately for the next lap
            aggRef.current = freshAggregate(performance.now(), t.fuelRemainingL);
        },
        [t.sectors.s1, t.sectors.s2, t.fuelRemainingL, onLapComplete],
    );

    useEffect(() => {
        if (t.lastLap === lastLapStrRef.current) return;
        const prev = lastLapStrRef.current;
        lastLapStrRef.current = t.lastLap;
        if (prev === t.lastLap) return;
        const lapTimeS = parseLapStr(t.lastLap);
        if (lapTimeS == null) return;
        handleLapComplete(lapTimeS);
    }, [t.lastLap, handleLapComplete]);

    return {
        currentAgg: aggRef.current,
        lastLapResult,
    };
}
