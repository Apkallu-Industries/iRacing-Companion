/* Supervisor Ingestion Controller
 * - Opens UDP and TCP listeners for real-time telemetry ingestion
 * - Routes packets to raw and normalized subscribers
 * - Applies basic validation, dedupe, and queue backpressure
 * - Integrates with the supervisor session lifecycle and core schema normalizer
 * - Computes derived physics channels and triggers semantic event detection rules
 */

const dgram = require("dgram");
const net = require("net");
const { normalizeCoreTelemetry } = require("./telemetry/normalizeTelemetry.cjs");
const { derivePhysicsChannels } = require("./telemetry/physicsDerivations.cjs");
const { evaluateEvents } = require("./telemetry/eventDetector.cjs");
const { resolveVehicleProfile } = require("./telemetry/vehicleProfiles.cjs");
const TemporalStateEstimator = require("./telemetry/temporalStateEstimator.cjs");

const DEFAULT_UDP_PORT = 4711;
const DEFAULT_TCP_PORT = 4712;
const MAX_QUEUE_LENGTH = 2048;
const DUPED_HISTORY_SIZE = 8192;

class TelemetryRingBuffer {
  constructor(maxSize = 1800) {
    this.buffer = [];
    this.maxSize = maxSize;
  }
  push(frame) {
    this.buffer.push(frame);
    if (this.buffer.length > this.maxSize) {
      this.buffer.shift();
    }
  }
  getSlice(seconds, frameRate = 60) {
    const count = Math.min(this.buffer.length, Math.round(seconds * frameRate));
    return this.buffer.slice(this.buffer.length - count);
  }
}

function isValidPacket(packet) {
  if (!packet || typeof packet !== "object" || Array.isArray(packet)) return false;
  if (packet.timestamp !== undefined && !Number.isFinite(packet.timestamp)) return false;
  if (packet.frameNumber !== undefined && !Number.isInteger(packet.frameNumber)) return false;
  if (packet.tick !== undefined && !Number.isInteger(packet.tick)) return false;
  if (packet.session !== undefined && typeof packet.session !== "string") return false;
  return true;
}

function packetSignature(packet) {
  const ts = packet.timestamp ?? 0;
  const frame = packet.frameNumber ?? packet.tick ?? 0;
  const car = packet.carNumber ?? packet.carIndex ?? "";
  const session = packet.session ?? "";
  return `${ts}:${frame}:${car}:${session}`;
}

function create(opts = {}) {
  const udpPort = opts.udpPort || DEFAULT_UDP_PORT;
  const tcpPort = opts.tcpPort || DEFAULT_TCP_PORT;
  const onPacket = typeof opts.onPacket === "function" ? opts.onPacket : () => {};
  const onRawPacketCallback = typeof opts.onRawPacket === "function" ? opts.onRawPacket : () => {};
  const onEventCallback = typeof opts.onEvent === "function" ? opts.onEvent : () => {};

  let udpSocket = null;
  let tcpServer = null;
  let running = false;
  let drainScheduled = false;
  const queue = [];
  const normalizedSubscribers = new Set();
  const rawSubscribers = new Set();
  const eventSubscribers = new Set();
  const recentSignatures = [];
  const seenSignatureSet = new Set();
  const sessions = new Map();
  let activeSessionId = null;
  let activeSessionMeta = null;

  // In-process sliding memory ring buffer window (Phase 3)
  const ringBuffer = new TelemetryRingBuffer(1800); // 30 seconds at 60Hz

  // Stateful temporal persistence & estimation observer (Phase 8)
  const stateEstimator = new TemporalStateEstimator();

  function scheduleDrain() {
    if (drainScheduled) return;
    drainScheduled = true;
    setImmediate(drainQueue);
  }

  function drainQueue() {
    drainScheduled = false;
    const batch = queue.splice(0, queue.length);
    for (const payload of batch) {
      emitDualTelemetry(payload.packet, payload.source);
    }
  }

  function dedupe(packet) {
    const sig = packetSignature(packet);
    if (seenSignatureSet.has(sig)) {
      return true;
    }
    recentSignatures.push(sig);
    seenSignatureSet.add(sig);
    if (recentSignatures.length > DUPED_HISTORY_SIZE) {
      const expired = recentSignatures.shift();
      if (expired) seenSignatureSet.delete(expired);
    }
    return false;
  }

  function emitDualTelemetry(rawPacket, source) {
    const prevFrame = ringBuffer.buffer[ringBuffer.buffer.length - 1] || null;
    const normalized = normalizeCoreTelemetry(rawPacket);

    // Resolve vehicle dynamic profile once per enqueued tick
    const profile = resolveVehicleProfile(rawPacket?.car ?? rawPacket?.Car ?? "default");

    // Phase 2: Calculate derived physics channels using bicycle model & gradients
    const derived = derivePhysicsChannels(normalized, prevFrame, rawPacket, profile);
    normalized.derived = derived;

    // Phase 8: Calculate state estimation (EWMA, fusion, health, Bayesian)
    const estimation = stateEstimator.update(normalized, rawPacket, profile);
    normalized.estimation = estimation;

    // Phase 3: Push normalized frame into active sliding temporal buffer
    ringBuffer.push(normalized);

    const context = { sessionId: activeSessionId, sessionMeta: activeSessionMeta, source };

    // 1. Generic onPacket callback (emits CoreTelemetryV1 + derived physics)
    try {
      onPacket({ packet: normalized, source, sessionId: activeSessionId, sessionMeta: activeSessionMeta });
    } catch (err) {
      console.warn("[ingestionController] onPacket callback error", err?.message || err);
    }

    // 2. Raw packet callback hook
    try {
      onRawPacketCallback({ packet: rawPacket, source, sessionId: activeSessionId, sessionMeta: activeSessionMeta });
    } catch (err) {
      console.warn("[ingestionController] onRawPacket callback error", err?.message || err);
    }

    // Phase 7: Evaluate temporal rules and trigger motorsport semantic events
    const triggeredEvents = evaluateEvents(normalized, ringBuffer, rawPacket, profile);
    for (const event of triggeredEvents) {
      // Trigger local supervisor callback
      try {
        onEventCallback({ event, sessionId: activeSessionId, sessionMeta: activeSessionMeta });
      } catch (err) {
        console.warn("[ingestionController] onEventCallback error", err?.message || err);
      }

      // Dispatch to in-process event subscribers
      for (const callback of Array.from(eventSubscribers)) {
        try {
          callback(event, context);
        } catch (err) {
          console.warn("[ingestionController] event subscriber error", err?.message || err);
        }
      }
    }

    // 3. Dispatch to standard normalized subscribers
    for (const callback of Array.from(normalizedSubscribers)) {
      try {
        callback(normalized, context);
      } catch (err) {
        console.warn("[ingestionController] normalized subscriber error", err?.message || err);
      }
    }

    // 4. Dispatch to standard raw subscribers
    for (const callback of Array.from(rawSubscribers)) {
      try {
        callback(rawPacket, context);
      } catch (err) {
        console.warn("[ingestionController] raw subscriber error", err?.message || err);
      }
    }
  }

  function enqueuePacket(packet, source) {
    if (!isValidPacket(packet)) return false;
    if (dedupe(packet)) return false;

    // Backpressure Guard: drop packets if queue size exceeds MAX_QUEUE_LENGTH threshold
    if (queue.length >= MAX_QUEUE_LENGTH) {
      console.warn(`[ingestionController] Backpressure active. Dropping telemetry packet from source: ${source}. Queue length: ${queue.length}`);
      return false;
    }

    queue.push({ packet, source });
    scheduleDrain();
    return true;
  }

  function parsePayload(raw) {
    if (!raw) return null;
    if (Buffer.isBuffer(raw)) {
      try {
        return JSON.parse(raw.toString("utf-8"));
      } catch {
        return null;
      }
    }
    if (typeof raw === "string") {
      try {
        return JSON.parse(raw);
      } catch {
        return null;
      }
    }
    if (typeof raw === "object") {
      return raw;
    }
    return null;
  }

  function handleUdpMessage(message, rinfo) {
    const packet = parsePayload(message);
    if (!packet) return;
    enqueuePacket(packet, "udp");
  }

  function handleTcpData(socket, chunk) {
    const packet = parsePayload(chunk);
    if (!packet) return;
    enqueuePacket(packet, "tcp");
  }

  function openTelemetryStream() {
    if (running) return;
    running = true;

    udpSocket = dgram.createSocket("udp4");
    udpSocket.on("message", handleUdpMessage);
    udpSocket.on("error", (err) => console.warn("[ingestionController] UDP error", err?.message || err));
    udpSocket.bind(udpPort, "127.0.0.1", () => {
      console.log(`[ingestionController] UDP listener bound to 127.0.0.1:${udpPort}`);
    });

    tcpServer = net.createServer((socket) => {
      socket.on("data", (chunk) => handleTcpData(socket, chunk));
      socket.on("error", (err) => console.warn("[ingestionController] TCP client error", err?.message || err));
    });
    tcpServer.on("error", (err) => console.warn("[ingestionController] TCP server error", err?.message || err));
    tcpServer.listen(tcpPort, "127.0.0.1", () => {
      console.log(`[ingestionController] TCP listener bound to 127.0.0.1:${tcpPort}`);
    });
  }

  function closeTelemetryStream() {
    running = false;
    if (udpSocket) {
      try { udpSocket.close(); } catch {}
      udpSocket = null;
    }
    if (tcpServer) {
      try { tcpServer.close(); } catch {}
      tcpServer = null;
    }
    queue.length = 0;
    ringBuffer.buffer.length = 0; // flush temporal buffer on stream close
    stateEstimator.reset(); // reset estimation observer
  }

  function onTelemetryPacket(callback) {
    normalizedSubscribers.add(callback);
    return () => normalizedSubscribers.delete(callback);
  }

  function onRawTelemetryPacket(callback) {
    rawSubscribers.add(callback);
    return () => rawSubscribers.delete(callback);
  }

  function onTelemetryEvent(callback) {
    eventSubscribers.add(callback);
    return () => eventSubscribers.delete(callback);
  }

  function startSession(sessionId, meta) {
    if (!sessionId) return null;
    let session = sessions.get(sessionId);
    if (!session) {
      session = { id: sessionId, meta: meta || {}, startedAt: Date.now(), endedAt: null, packetCount: 0 };
      sessions.set(sessionId, session);
    }
    activeSessionId = sessionId;
    activeSessionMeta = session.meta;
    return session;
  }

  function stopSession(sessionId) {
    const id = sessionId || activeSessionId;
    if (!id) return null;
    const session = sessions.get(id);
    if (!session) return null;
    session.endedAt = session.endedAt || Date.now();
    activeSessionId = activeSessionId === id ? null : activeSessionId;
    activeSessionMeta = activeSessionId ? sessions.get(activeSessionId)?.meta : null;
    stateEstimator.reset(); // reset estimation observer on session stop
    return session;
  }

  function emitTelemetryPacket(packet, source = "manual") {
    if (!packet || typeof packet !== "object") return false;
    return enqueuePacket(packet, source);
  }

  function getActiveSession() {
    return activeSessionId ? sessions.get(activeSessionId) || null : null;
  }

  function getSessionHistory() {
    return Array.from(sessions.values());
  }

  return {
    openTelemetryStream,
    closeTelemetryStream,
    onTelemetryPacket,
    onRawTelemetryPacket,
    onTelemetryEvent,
    emitTelemetryPacket,
    startSession,
    stopSession,
    getActiveSession,
    getSessionHistory,
    isRunning: () => running,
  };
}

module.exports = { create };
