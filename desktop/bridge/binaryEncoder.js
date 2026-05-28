/**
 * binaryEncoder.js — Zero-Allocation Binary Telemetry Encoder
 *
 * Packs core telemetry variables into a fixed-layout Float32Array to deliver
 * high-frequency telemetry updates with zero serialization or GC pressure.
 */

// Strict protocol offsets matching binaryDecoder.ts
const OFFSETS = {
  tick: 0,
  timestamp: 1,
  speedKph: 2,
  rpm: 3,
  gear: 4,
  throttle: 5,
  brake: 6,
  steeringDeg: 7,
  fuelRemainingL: 8,
  lapLastLapTimeSec: 9,
  liveAirTempC: 10,
  liveTrackTempC: 11,
  gLat: 12,
  gLon: 13,
  yawRate: 14
};

const PACKET_CHANNELS = 15;
const FLOAT_BYTES = 4;
const PACKET_BYTES = PACKET_CHANNELS * FLOAT_BYTES; // 60 bytes

/**
 * Packs a standardized telemetry object into an ArrayBuffer
 * @param {object} t mapped telemetry frame
 * @returns {ArrayBuffer} packed binary buffer
 */
function encodeTelemetry(t) {
  const buffer = new ArrayBuffer(PACKET_BYTES);
  const view = new Float32Array(buffer);

  // Fallbacks map default values in case elements are missing
  view[OFFSETS.tick]              = parseFloat(t.tick || t.all?.Tick || 0);
  view[OFFSETS.timestamp]         = parseFloat(t.timestamp || Date.now());
  view[OFFSETS.speedKph]          = parseFloat(t.speedKph || 0);
  view[OFFSETS.rpm]               = parseFloat(t.rpm || 0);
  view[OFFSETS.gear]              = parseFloat(t.gear || 0);
  view[OFFSETS.throttle]          = parseFloat(t.throttle || 0);
  view[OFFSETS.brake]             = parseFloat(t.brake || 0);
  view[OFFSETS.steeringDeg]       = parseFloat(t.steeringDeg || 0);
  view[OFFSETS.fuelRemainingL]    = parseFloat(t.fuelRemainingL || 0);
  view[OFFSETS.lapLastLapTimeSec] = parseFloat(t.lapLastLapTimeSec || t.all?.LapLastLapTime || 0);
  view[OFFSETS.liveAirTempC]      = parseFloat(t.liveAirTempC || 0);
  view[OFFSETS.liveTrackTempC]     = parseFloat(t.liveTrackTempC || 0);
  view[OFFSETS.gLat]              = parseFloat(t.gLat || 0);
  view[OFFSETS.gLon]              = parseFloat(t.gLon || 0);
  view[OFFSETS.yawRate]           = parseFloat(t.extras?.YawRate || t.all?.YawRate || 0);

  return buffer;
}

module.exports = {
  encodeTelemetry,
  OFFSETS,
  PACKET_CHANNELS,
  PACKET_BYTES
};
