/**
 * Local offline lap cache for Pit Wall Desktop.
 *
 * Append-only JSON-lines log of completed laps, written to the user's
 * profile dir so it survives reinstalls and is independent of any
 * cloud database. Pure Node — no native deps, no sqlite compile.
 *
 *   File: <userData>/.pitwall/laps.jsonl
 *
 * Each line:
 *   { ts, car, track, lap, lapTimeS, bestS, fuel, sof, source }
 *
 * The bridge calls recordLap() whenever lap number increments and the
 * previous lap time is valid (>0).
 */

const fs = require("fs");
const path = require("path");
const os = require("os");

const DIR = path.join(os.homedir(), ".pitwall");
const FILE = path.join(DIR, "laps.jsonl");

function ensureDir() {
  try {
    fs.mkdirSync(DIR, { recursive: true });
  } catch {}
}

function recordLap(entry) {
  try {
    ensureDir();
    const line = JSON.stringify({ ts: Date.now(), ...entry }) + "\n";
    fs.appendFileSync(FILE, line, "utf8");
  } catch (e) {
    console.warn("[bridge] lap cache write failed:", e.message);
  }
}

function readLaps(limit = 500) {
  try {
    if (!fs.existsSync(FILE)) return [];
    const lines = fs.readFileSync(FILE, "utf8").trim().split("\n");
    const slice = lines.slice(-limit);
    return slice
      .map((l) => {
        try {
          return JSON.parse(l);
        } catch {
          return null;
        }
      })
      .filter(Boolean);
  } catch {
    return [];
  }
}

function markSynced(timestamps) {
  try {
    if (!fs.existsSync(FILE)) return 0;
    const set = new Set(timestamps);
    const lines = fs.readFileSync(FILE, "utf8").trim().split("\n");
    let changed = 0;
    const out = lines.map((l) => {
      try {
        const o = JSON.parse(l);
        if (set.has(o.ts) && !o.synced) {
          o.synced = true;
          changed++;
        }
        return JSON.stringify(o);
      } catch {
        return l;
      }
    });
    if (changed > 0) fs.writeFileSync(FILE, out.join("\n") + "\n", "utf8");
    return changed;
  } catch {
    return 0;
  }
}

module.exports = { recordLap, readLaps, markSynced, FILE };
