import type { IbtParsed } from "@/lib/ibt/types";
import type { TelemetryEvent } from "@/lib/telemetryRuntimeStore";
import { compileAndRunDSL, DECLARATIVE_RULES } from "./dsl";

// Expose same physical scanners interface but powered by dynamic DSL rules
export const lockupScanner = {
  name: "Brake Lockup DSL Module",
  scan(parsed: IbtParsed, startTick: number, endTick: number) {
    const rules = DECLARATIVE_RULES.filter((r) => r.category === "thermal");
    return compileAndRunDSL(parsed, rules);
  },
};

export const wheelspinScanner = {
  name: "Traction Wheelspin DSL Module",
  scan(parsed: IbtParsed, startTick: number, endTick: number) {
    const rules = DECLARATIVE_RULES.filter((r) => r.category === "inputs");
    return compileAndRunDSL(parsed, rules);
  },
};

export const aeroScanner = {
  name: "Chassis Aero DSL Module",
  scan(parsed: IbtParsed, startTick: number, endTick: number) {
    const rules = DECLARATIVE_RULES.filter((r) => r.category === "dynamics");
    return compileAndRunDSL(parsed, rules);
  },
};

export const ersScanner = {
  name: "ERS Energy DSL Module",
  scan(parsed: IbtParsed, startTick: number, endTick: number) {
    const rules = DECLARATIVE_RULES.filter((r) => r.category === "hybrid");
    return compileAndRunDSL(parsed, rules);
  },
};

export const scanners = [lockupScanner, wheelspinScanner, aeroScanner, ersScanner];

export function scanTelemetrySession(parsed: IbtParsed): Omit<TelemetryEvent, "id">[] {
  // Execute through our modular Declarative DSL Compiler
  return compileAndRunDSL(parsed);
}
