function readCString(view, offset, maxLen) {
  const bytes = [];
  for (let i = 0; i < maxLen; i++) {
    const b = view.getUint8(offset + i);
    if (b === 0) break;
    bytes.push(b);
  }
  return String.fromCharCode(...bytes);
}
function readLiveryRecords(view, start, count, stride = 32) {
  const out = [];
  for (let i = 0; i < count; i++) {
    out.push(readCString(view, start + i * stride, stride));
  }
  return out.filter((s) => s.length > 0);
}
const MAGICS = ["OLAP", "BLAP", "OLTA", "BLTA", "PLAP", "BPLAP", "PLTA", "BPLTA"];
function isLikelyLapTime(value) {
  return Number.isFinite(value) && value >= 5 && value <= 60 * 30;
}
function lapBoundaryIndex(distance, trackLengthM) {
  let lastFiniteIndex = -1;
  const target = Math.max(1, trackLengthM);
  for (let i = 0; i < distance.length; i++) {
    const d = distance[i];
    if (!Number.isFinite(d)) continue;
    lastFiniteIndex = i;
    if (d >= target * 0.98) return i;
  }
  return lastFiniteIndex >= 0 ? lastFiniteIndex : distance.length - 1;
}
function estimateBestLapSFromChannels(channels, trackLengthM) {
  if (!Number.isFinite(trackLengthM) || trackLengthM <= 0) return null;
  const distance = channels.find((c) => c.label === "distance");
  if (!distance) return null;
  const bestLapChannel =
    channels.find((c) => c.label === "best.t.seg6") ??
    channels.find((c) => c.label === "opt.t.seg6");
  if (!bestLapChannel) return null;
  let index = lapBoundaryIndex(distance.values, trackLengthM);
  while (index >= 0) {
    const candidate = bestLapChannel.values[index];
    if (Number.isFinite(candidate) && candidate > 0) return candidate;
    index--;
  }
  return null;
}
function chooseBestLapS(headerBestLapS, channelBestLapS) {
  if (!isLikelyLapTime(headerBestLapS) && channelBestLapS != null) {
    return channelBestLapS;
  }
  if (channelBestLapS != null) {
    const diff = channelBestLapS - headerBestLapS;
    if (diff < -0.25 && channelBestLapS / Math.max(1, headerBestLapS) > 0.5) {
      return channelBestLapS;
    }
  }
  return headerBestLapS;
}
function decodeMagic(view) {
  const m = String.fromCharCode(
    view.getUint8(0),
    view.getUint8(1),
    view.getUint8(2),
    view.getUint8(3),
  );
  if (!MAGICS.includes(m)) {
    throw new Error(`Not a lapfile: bad magic "${m}"`);
  }
  return m;
}
function statsOf(values) {
  let mn = Infinity,
    mx = -Infinity,
    sum = 0,
    n = 0;
  for (let i = 0; i < values.length; i++) {
    const v = values[i];
    if (!Number.isFinite(v)) continue;
    if (v < mn) mn = v;
    if (v > mx) mx = v;
    sum += v;
    n++;
  }
  if (n === 0) return { min: 0, max: 0, mean: 0 };
  return { min: mn, max: mx, mean: sum / n };
}
function guessChannel(values) {
  const { min, max, mean } = statsOf(values);
  const span = max - min;
  if (min >= -0.05 && max <= 1.05 && span > 0.1) {
    return { label: "pedal", unit: "0..1" };
  }
  if (min >= -1.5 && max <= 9.5 && span > 1 && Number.isInteger(Math.round(mean))) {
    return { label: "gear", unit: "n" };
  }
  if (max > 1500 && max < 25e3 && min >= 0) {
    return { label: "rpm", unit: "rpm" };
  }
  if (min >= 0 && max < 200 && span > 5) {
    return { label: "speed", unit: "m/s" };
  }
  if (min >= -10 && max <= 10 && span > 0.1) {
    return { label: "steering", unit: "rad" };
  }
  return { label: "unknown", unit: "?" };
}
function decodeChannelTable(view, raw) {
  const tableStart = 1456;
  const bestLapS = view.getFloat32(tableStart + 4, true);
  const sectorCount = view.getUint32(tableStart + 8, true);
  const trackLengthM = view.getFloat32(tableStart + 20, true);
  const numBins = view.getUint32(tableStart + 24, true);
  const sectorTimesS = [];
  for (let i = 1; i <= Math.min(sectorCount, 6); i++) {
    const off = tableStart + i * 28;
    if (off + 28 > raw.byteLength) break;
    sectorTimesS.push(view.getFloat32(off + 4, true));
  }
  let numChannels = 0;
  for (let i = 0; i < 32; i++) {
    const off = tableStart + i * 28;
    if (off + 28 > raw.byteLength) break;
    const tl = view.getFloat32(off + 20, true);
    if (Math.abs(tl - trackLengthM) / Math.max(1, trackLengthM) > 0.02) break;
    numChannels++;
  }
  const bodyOffset = tableStart + numChannels * 28;
  return { bestLapS, trackLengthM, sectorTimesS, numBins, numChannels, bodyOffset };
}
function readChannels(view, bodyOffset, numBins, numChannels, raw) {
  const channels = [];
  if (numBins <= 0 || numChannels <= 0) return channels;
  const channelByteLen = numBins * 4;
  const totalChannels = Math.floor((raw.byteLength - bodyOffset) / channelByteLen);
  const PAIRED_LABELS = [
    "distance",
    // 0
    "best.t.seg1",
    // 1
    "best.t.seg2",
    // 2
    "best.t.seg3",
    // 3
    "best.t.seg4",
    // 4
    "best.t.seg5",
    // 5
    "best.t.seg6",
    // 6
    "opt.t.seg6.dup",
    // 7  (mirror of best/opt seg6 — confirmed)
    "opt.t.seg1",
    // 8
    "opt.t.seg2",
    // 9
    "opt.t.seg3",
    // 10
    "opt.t.seg4",
    // 11
    "opt.t.seg5",
    // 12
    "opt.t.seg6",
    // 13
  ];
  const PAIRED_UNITS = ["m", "s", "s", "s", "s", "s", "s", "s", "s", "s", "s", "s", "s", "s"];
  for (let c = 0; c < totalChannels; c++) {
    const off = bodyOffset + c * channelByteLen;
    if (off + channelByteLen > raw.byteLength) break;
    const values = new Float32Array(numBins);
    let finiteCount = 0;
    for (let i = 0; i < numBins; i++) {
      values[i] = view.getFloat32(off + i * 4, true);
      if (Number.isFinite(values[i]) && Math.abs(values[i]) < 1e30) finiteCount++;
    }
    if (finiteCount < numBins * 0.5) continue;
    for (let i = 0; i < numBins; i++) {
      if (!Number.isFinite(values[i]) || Math.abs(values[i]) > 1e30) values[i] = NaN;
    }
    const s = statsOf(values);
    if (s.min === 0 && s.max === 0) continue;
    const label =
      c < PAIRED_LABELS.length ? PAIRED_LABELS[c] : guessChannel(values).label + `#${c + 1}`;
    const unit = c < PAIRED_UNITS.length ? PAIRED_UNITS[c] : guessChannel(values).unit;
    channels.push({
      label,
      unit,
      values,
      min: s.min,
      max: s.max,
      mean: s.mean,
      byteOffset: off,
    });
  }
  return channels;
}
function parseLapfile(buffer) {
  const raw = new Uint8Array(buffer);
  if (raw.byteLength < 1536) {
    throw new Error(`File too small (${raw.byteLength} bytes) — not a v3 lapfile`);
  }
  const view = new DataView(buffer);
  const magic = decodeMagic(view);
  const version = view.getUint32(4, true);
  if (version !== 3) {
    throw new Error(`Unsupported lapfile version ${version} (parser expects v3)`);
  }
  const flags = view.getUint32(8, true);
  const custId = view.getUint32(12, true);
  const driverName = readCString(view, 16, 64);
  const shortName = readCString(view, 80, 48);
  const initials = readCString(view, 128, 8);
  const season = view.getUint32(136, true);
  const weekOrSeries = view.getUint32(140, true);
  const carShortName = readCString(view, 144, 64);
  const trackName = readCString(view, 1342, 64);
  const liveryCount = view.getUint32(208, true);
  const liveryRecords =
    liveryCount > 0 && liveryCount < 16 ? readLiveryRecords(view, 212, liveryCount) : [];
  const ghostName = readCString(view, 652, 64);
  const ghostDriverName = ghostName && ghostName !== driverName ? ghostName : void 0;
  const buildDates = [
    readCString(view, 1406, 16),
    readCString(view, 1422, 16),
    readCString(view, 1438, 16),
  ].filter((s) => /^\d{4}\.\d{2}\.\d{2}/.test(s));
  const tableInfo = decodeChannelTable(view, raw);
  const channels = readChannels(
    view,
    tableInfo.bodyOffset,
    tableInfo.numBins,
    tableInfo.numChannels,
    raw,
  );
  const estimatedBestLapS = estimateBestLapSFromChannels(channels, tableInfo.trackLengthM);
  const normalizedBestLapS = chooseBestLapS(tableInfo.bestLapS, estimatedBestLapS);
  const header = {
    magic,
    version,
    flags,
    custId,
    driverName,
    shortName,
    initials,
    season,
    weekOrSeries,
    carShortName,
    trackName,
    liveryRecords,
    ghostDriverName,
    buildDates,
  };
  const summary = {
    bestLapS: normalizedBestLapS,
    trackLengthM: tableInfo.trackLengthM,
    sectorTimesS: tableInfo.sectorTimesS,
    numBins: tableInfo.numBins,
    numChannels: tableInfo.numChannels,
  };
  return { header, summary, channels, bodyByteLength: raw.byteLength - tableInfo.bodyOffset, raw };
}
function lapfileToJSON(parsed) {
  return {
    header: parsed.header,
    summary: parsed.summary,
    channels: parsed.channels.map((c) => ({
      label: c.label,
      unit: c.unit,
      min: c.min,
      max: c.max,
      mean: c.mean,
      byteOffset: c.byteOffset,
      values: Array.from(c.values).map((v) => (Number.isFinite(v) ? Number(v.toFixed(4)) : null)),
    })),
  };
}
function formatLapTime(s) {
  if (!Number.isFinite(s) || s <= 0) return "—";
  const m = Math.floor(s / 60);
  const rem = s - m * 60;
  return `${m}:${rem.toFixed(3).padStart(6, "0")}`;
}
function liveryColors(parsed) {
  const recs = parsed.header.liveryRecords;
  const license = recs[0] ?? "";
  const helmet = (recs[1] ?? "").split(",").slice(1).filter(Boolean);
  const suit = (recs[2] ?? "").split(",").slice(1).filter(Boolean);
  return { license, helmet, suit };
}
export { liveryColors as a, formatLapTime as f, lapfileToJSON as l, parseLapfile as p };
