/**
 * Schema coverage audit.
 *
 * Compares a captured channel list (from the bridge or a .pwlap recording)
 * against the curated iRacing .ibt channel catalog and reports which
 * expected channels are missing. The check is case-insensitive and
 * normalizes exploded array channels (`CarIdxLap_3` → `CarIdxLap`) so a
 * captured `CarIdxLap_0` counts as covering the canonical `CarIdxLap`.
 */
import { CHANNEL_CATALOG, type CatalogEntry } from "./channelCatalog";

export interface CoverageReport {
  capturedCount: number;
  expectedCount: number;
  matchedCount: number;
  missingCount: number;
  coveragePct: number;
  /** Catalog entries that are NOT present in `captured`. */
  missing: CatalogEntry[];
  /** Catalog entries that ARE present in `captured`. */
  matched: CatalogEntry[];
  /** Captured channels that are not in the catalog (bonus channels). */
  extra: string[];
}

function baseName(name: string): string {
  const m = /^(.+?)_(\d+)$/.exec(name);
  return (m ? m[1] : name).toLowerCase();
}

export function auditCoverage(captured: Iterable<string>): CoverageReport {
  const capturedList = Array.from(captured);
  const capturedBases = new Set(capturedList.map(baseName));
  const catalogBases = new Set(CHANNEL_CATALOG.map((c) => c.name.toLowerCase()));

  const matched: CatalogEntry[] = [];
  const missing: CatalogEntry[] = [];
  for (const entry of CHANNEL_CATALOG) {
    if (capturedBases.has(entry.name.toLowerCase())) matched.push(entry);
    else missing.push(entry);
  }
  const extra = capturedList
    .filter((name) => !catalogBases.has(baseName(name)))
    .sort((a, b) => a.localeCompare(b));

  return {
    capturedCount: capturedList.length,
    expectedCount: CHANNEL_CATALOG.length,
    matchedCount: matched.length,
    missingCount: missing.length,
    coveragePct: CHANNEL_CATALOG.length === 0 ? 0 : (matched.length / CHANNEL_CATALOG.length) * 100,
    missing,
    matched,
    extra,
  };
}

/** Group missing channels by their catalog group for friendlier display. */
export function groupMissing(missing: CatalogEntry[]): Record<string, CatalogEntry[]> {
  const out: Record<string, CatalogEntry[]> = {};
  for (const e of missing) (out[e.group] ??= []).push(e);
  return out;
}
