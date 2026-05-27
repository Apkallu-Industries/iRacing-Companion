/**
 * teamRelay.js — Supabase Realtime publisher for multi-driver team telemetry.
 *
 * Each driver's bridge publishes a 2Hz snapshot to the shared team channel.
 * The Team Command page subscribes and shows all cars simultaneously.
 *
 * Setup: add to local-bridge/.env:
 *   SUPABASE_URL=https://your-project.supabase.co
 *   SUPABASE_ANON_KEY=your-anon-key
 *   TEAM_CODE=LE-MANS-2026-A
 *   DRIVER_NAME=Danny M        (optional — falls back to iRacing username)
 *
 * If TEAM_CODE is not set, this module is a silent no-op.
 */

"use strict";

const vehicleIdentityRuntime = require("./vehicleIdentityRuntime");

let supabase = null;
let channel = null;
let isReady = false;
let lastError = null;
let publishCount = 0;

const TEAM_CODE = process.env.TEAM_CODE?.trim() || "";
const DRIVER_NAME = process.env.DRIVER_NAME?.trim() || "";
const SUPABASE_URL = process.env.SUPABASE_URL?.trim() || "";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY?.trim() || "";

/** Initialise Supabase client and subscribe to the team channel. */
function init() {
  if (!TEAM_CODE) {
    console.log("[team-relay] TEAM_CODE not set — team relay disabled.");
    return;
  }
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn("[team-relay] SUPABASE_URL or SUPABASE_ANON_KEY missing — team relay disabled.");
    return;
  }

  let createClient;
  try {
    ({ createClient } = require("@supabase/supabase-js"));
  } catch {
    console.warn("[team-relay] @supabase/supabase-js not installed — run: npm install");
    return;
  }

  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      realtime: { params: { eventsPerSecond: 2 } },
    });

    const channelName = `team:${TEAM_CODE}`;
    channel = supabase.channel(channelName, { config: { broadcast: { self: false } } });

    channel
      .on("broadcast", { event: "ping" }, () => {
        // Keep-alive from wall browser — no action needed
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          isReady = true;
          console.log(`[team-relay] ✓ Connected to channel "${channelName}" — publishing at 2Hz`);
        } else if (status === "CHANNEL_ERROR") {
          isReady = false;
          lastError = "Channel error — check SUPABASE_URL and SUPABASE_ANON_KEY";
          console.error("[team-relay] ✗ Channel error:", lastError);
        } else if (status === "TIMED_OUT") {
          isReady = false;
          console.warn("[team-relay] Channel timed out — will retry");
        }
      });
  } catch (err) {
    lastError = err.message;
    console.error("[team-relay] Init failed:", err.message);
  }
}

/**
 * Publish a telemetry snapshot to the team channel.
 * Called by server.js every 2 seconds with the latest mapTelemetry() output.
 *
 * @param {object} t — the full telemetry object from mapTelemetry()
 * @param {object} sessionData — raw session YAML info
 */
function publish(t, sessionData) {
  if (!isReady || !channel) return;

  const digest = vehicleIdentityRuntime.getOperationalDigest();
  if (!digest) return;

  const payload = {
    teamCode: TEAM_CODE,
    carNumber: t.carNumber || "0",
    carName: t.car || "Unknown Car",
    timestamp: Date.now(),
    publishCount: ++publishCount,
    carOperationalState: digest
  };

  channel
    .send({ type: "broadcast", event: "telemetry", payload })
    .catch((err) => {
      console.warn("[team-relay] Publish error:", err.message);
    });
}

/** Graceful disconnect on bridge shutdown. */
function disconnect() {
  if (channel && supabase) {
    supabase.removeChannel(channel).catch(() => {});
    console.log("[team-relay] Disconnected from team channel.");
  }
  isReady = false;
}

/** Status info for the bridge health endpoint. */
function status() {
  return {
    enabled: !!TEAM_CODE,
    teamCode: TEAM_CODE || null,
    connected: isReady,
    publishCount,
    lastError,
  };
}

module.exports = { init, publish, disconnect, status };
