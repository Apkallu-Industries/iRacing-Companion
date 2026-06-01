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

let reconnectTimer = null;
let reconnectDelay = 2000;

function getTeamCode() { return process.env.TEAM_CODE?.trim() || ""; }
function getDriverName() { return process.env.DRIVER_NAME?.trim() || ""; }
function getSupabaseUrl() { return process.env.SUPABASE_URL?.trim() || ""; }
function getSupabaseAnonKey() { return process.env.SUPABASE_ANON_KEY?.trim() || ""; }

function scheduleReconnect() {
  if (reconnectTimer) return;
  
  isReady = false;
  const maxDelay = 30000;
  console.log(`[team-relay] [${new Date().toISOString()}] Scheduling reconnect in ${reconnectDelay}ms...`);
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    reconnectDelay = Math.min(reconnectDelay * 2, maxDelay);
    init();
  }, reconnectDelay);
}

/** Initialise Supabase client and subscribe to the team channel. */
function init() {
  const teamCode = getTeamCode();
  const supabaseUrl = getSupabaseUrl();
  const supabaseAnonKey = getSupabaseAnonKey();

  if (!teamCode) {
    console.log("[team-relay] TEAM_CODE not set — team relay disabled.");
    return;
  }
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("[team-relay] SUPABASE_URL or SUPABASE_ANON_KEY missing — team relay disabled.");
    return;
  }

  // Safe re-initialisation: disconnect existing channel/client first
  if (channel || supabase) {
    if (channel && supabase) {
      supabase.removeChannel(channel).catch(() => {});
    }
    channel = null;
    supabase = null;
    isReady = false;
  }

  let createClient;
  try {
    ({ createClient } = require("@supabase/supabase-js"));
  } catch {
    console.warn("[team-relay] @supabase/supabase-js not installed — run: npm install");
    return;
  }

  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      realtime: { params: { eventsPerSecond: 2 } },
    });

    const channelName = `team:${teamCode}`;
    channel = supabase.channel(channelName, { config: { broadcast: { self: false } } });

    channel
      .on("broadcast", { event: "ping" }, () => {
        // Keep-alive from wall browser — no action needed
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          isReady = true;
          reconnectDelay = 2000;
          if (reconnectTimer) {
            clearTimeout(reconnectTimer);
            reconnectTimer = null;
          }
          lastError = null;
          console.log(`[team-relay] [${new Date().toISOString()}] ✓ Connected to channel "${channelName}" — publishing at 2Hz`);
        } else if (status === "CHANNEL_ERROR") {
          isReady = false;
          lastError = "Channel error — check SUPABASE_URL and SUPABASE_ANON_KEY";
          console.error("[team-relay] ✗ Channel error:", lastError);
          scheduleReconnect();
        } else if (status === "TIMED_OUT") {
          isReady = false;
          lastError = "Channel timed out";
          console.warn("[team-relay] Channel timed out — will retry");
          scheduleReconnect();
        } else {
          isReady = false;
          console.warn(`[team-relay] Channel subscription status: ${status}`);
          scheduleReconnect();
        }
      });
  } catch (err) {
    lastError = err.message;
    console.error("[team-relay] Init failed:", err.message);
    scheduleReconnect();
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
  try {
    if (!isReady || !channel) return;
    if (!t) return;

    const digest = vehicleIdentityRuntime.getOperationalDigest();
    if (!digest) return;

    const payload = {
      teamCode: getTeamCode(),
      carNumber: t.carNumber || "0",
      carName: t.car || "Unknown Car",
      timestamp: Date.now(),
      publishCount: ++publishCount,
      carOperationalState: {
        ...digest,
        activeDriver: getDriverName() || digest.activeDriver
      }
    };

    channel
      .send({ type: "broadcast", event: "telemetry", payload })
      .catch((err) => {
        console.warn(`[team-relay] [${new Date().toISOString()}] Publish send promise catch:`, err.message);
      });
  } catch (err) {
    console.error(`[team-relay] [${new Date().toISOString()}] publish() caught exception:`, err.message);
  }
}

/** Graceful disconnect on bridge shutdown. */
function disconnect() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  if (channel && supabase) {
    supabase.removeChannel(channel).catch(() => {});
    console.log("[team-relay] Disconnected from team channel.");
  }
  channel = null;
  supabase = null;
  isReady = false;
}

/** Status info for the bridge health endpoint. */
function status() {
  const teamCode = getTeamCode();
  return {
    enabled: !!teamCode,
    teamCode: teamCode || null,
    connected: isReady,
    publishCount,
    lastError,
  };
}

module.exports = { init, publish, disconnect, status };
