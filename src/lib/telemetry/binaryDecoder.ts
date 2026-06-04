/**
 * binaryDecoder.ts — Low-Latency Client-Side Binary Telemetry Decoder
 *
 * Unpacks array-buffered socket payloads into structured telemetry frames
 * without triggering garbage collector cycles.
 */

export interface DecodedTelemetryFrame {
  connected: boolean;
  source: string;
  tick: number;
  timestamp: number;
  speedKph: number;
  rpm: number;
  gear: number;
  throttle: number;
  brake: number;
  steeringDeg: number;
  fuelRemainingL: number;
  lapLastLapTimeSec: number;
  liveAirTempC: number;
  liveTrackTempC: number;
  gLat: number;
  gLon: number;
  yawRate: number;
}

// Strict protocol offsets matching binaryEncoder.js
export const BINARY_OFFSETS = {
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
  yawRate: 14,
};

/**
 * Unpacks an ArrayBuffer payload into a structured telemetry object.
 * Reuses existing target objects if passed to minimize allocations.
 * @param buffer received array buffer or ArrayBufferView
 * @param out target object to populate (optional)
 * @returns parsed telemetry frame
 */
export function decodeTelemetry(
  buffer: ArrayBuffer,
  out?: Partial<DecodedTelemetryFrame>,
): DecodedTelemetryFrame {
  const view = new Float32Array(buffer);

  const frame = (out || {}) as DecodedTelemetryFrame;
  frame.connected = true;
  frame.source = "live_binary";

  frame.tick = view[BINARY_OFFSETS.tick];
  frame.timestamp = view[BINARY_OFFSETS.timestamp];
  frame.speedKph = view[BINARY_OFFSETS.speedKph];
  frame.rpm = view[BINARY_OFFSETS.rpm];
  frame.gear = view[BINARY_OFFSETS.gear];
  frame.throttle = view[BINARY_OFFSETS.throttle];
  frame.brake = view[BINARY_OFFSETS.brake];
  frame.steeringDeg = view[BINARY_OFFSETS.steeringDeg];
  frame.fuelRemainingL = view[BINARY_OFFSETS.fuelRemainingL];
  frame.lapLastLapTimeSec = view[BINARY_OFFSETS.lapLastLapTimeSec];
  frame.liveAirTempC = view[BINARY_OFFSETS.liveAirTempC];
  frame.liveTrackTempC = view[BINARY_OFFSETS.liveTrackTempC];
  frame.gLat = view[BINARY_OFFSETS.gLat];
  frame.gLon = view[BINARY_OFFSETS.gLon];
  frame.yawRate = view[BINARY_OFFSETS.yawRate];

  return frame;
}
