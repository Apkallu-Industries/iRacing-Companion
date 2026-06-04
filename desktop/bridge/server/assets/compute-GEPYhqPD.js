import { p as parseLapfile } from "./parser-BLM9cHGX.js";
const TRACKS = [
  // Nürburgring
  { match: /nurburgring.*nordschleife/, m: 20832, label: "Nordschleife" },
  { match: /nurburgring.*combinedshortb/, m: 25378, label: "Nordschleife + GP Sprint" },
  { match: /nurburgring.*combined/, m: 25378, label: "Nordschleife + GP" },
  { match: /nurburgring.*gp/, m: 5148, label: "GP" },
  { match: /nurburgring/, m: 5148 },
  // Spa
  { match: /spa.*2024.*combined/, m: 7004, label: "Spa 2024" },
  { match: /spa.*2024.*up/, m: 7004, label: "Spa 2024" },
  { match: /spa.*classic/, m: 14100, label: "Spa Classic" },
  { match: /spa/, m: 7004 },
  // Le Mans
  { match: /lemans.*full/, m: 13626, label: "Circuit de la Sarthe" },
  { match: /lemans.*bugatti/, m: 4185, label: "Bugatti" },
  { match: /lemans/, m: 13626 },
  // Monza
  { match: /monza.*combinedchicanes/, m: 5793, label: "GP" },
  { match: /monza.*gp/, m: 5793 },
  { match: /monza.*oval/, m: 4250, label: "Oval" },
  { match: /monza/, m: 5793 },
  // Silverstone
  { match: /silverstone.*international/, m: 2972 },
  { match: /silverstone.*national/, m: 2620 },
  { match: /silverstone.*gp/, m: 5891 },
  { match: /silverstone/, m: 5891 },
  // Common road courses
  { match: /roadamerica/, m: 6515 },
  { match: /roadatlanta.*full/, m: 4088 },
  { match: /roadatlanta/, m: 4088 },
  { match: /watkinsglen.*boot/, m: 5552 },
  { match: /watkinsglen/, m: 3401 },
  { match: /sebring.*international/, m: 6020 },
  { match: /sebring/, m: 6020 },
  { match: /suzuka.*east/, m: 2243 },
  { match: /suzuka.*west/, m: 3466 },
  { match: /suzuka/, m: 5807 },
  { match: /imola/, m: 4909 },
  { match: /barcelona.*motogp/, m: 4657 },
  { match: /barcelona/, m: 4657 },
  { match: /interlagos/, m: 4309 },
  { match: /zandvoort/, m: 4259 },
  { match: /redbullring/, m: 4318 },
  { match: /hungaroring/, m: 4381 },
  { match: /paulricard/, m: 5842 },
  { match: /mosport|cantirep|canadiantire/, m: 3957 },
  { match: /lagunaseca/, m: 3602 },
  { match: /sonoma/, m: 4054 },
  { match: /lime ?rock|limerock/, m: 2459 },
  { match: /vir/, m: 5263 },
  { match: /mid ?ohio|midohio/, m: 3636 },
  { match: /summit ?point|summitpoint/, m: 3300 },
  { match: /cota/, m: 5513 },
  { match: /sandown/, m: 3104 },
  { match: /bathurst|mountpanorama/, m: 6213 },
  { match: /phillipisland/, m: 4445 },
  { match: /donington/, m: 4023 },
  { match: /brandshatch.*indy/, m: 1929 },
  { match: /brandshatch/, m: 3908 },
  { match: /oulton/, m: 4322 },
  { match: /snetterton/, m: 4778 },
  { match: /knockhill/, m: 2092 },
  { match: /thruxton/, m: 3792 },
  { match: /croft/, m: 3417 },
  { match: /motegi/, m: 4801 },
  { match: /tsukuba/, m: 2045 },
  { match: /fuji/, m: 4563 },
  { match: /okayama/, m: 3703 },
  { match: /algarve|portimao/, m: 4684 },
  { match: /jerez/, m: 4428 },
  { match: /motorland|aragon/, m: 5345 },
  { match: /sachsenring/, m: 3671 },
  { match: /lausitzring/, m: 4255 },
  { match: /hockenheim/, m: 4574 },
  { match: /nurburg.*muller/, m: 5148 },
  { match: /jacksonville/, m: 1207 },
  { match: /charlotte.*roval/, m: 3947 },
  { match: /charlotte/, m: 2414 },
  // oval
  { match: /daytona.*road/, m: 5729 },
  { match: /daytona/, m: 4023 },
  // oval
  { match: /talladega/, m: 4281 },
  { match: /indianapolis.*road|indianapolis.*gp/, m: 4143 },
  { match: /indianapolis/, m: 4023 },
  { match: /atlanta.*motor/, m: 2414 },
  { match: /texas.*motor/, m: 2414 },
  { match: /las ?vegas|lasvegas/, m: 2414 },
  { match: /kansas|kansasspeedway/, m: 2414 },
  { match: /michigan.*speedway/, m: 3219 },
  { match: /pocono/, m: 4023 },
  { match: /bristol/, m: 858 },
  { match: /martinsville/, m: 845 },
  { match: /richmond/, m: 1207 },
  { match: /dover/, m: 1609 },
  { match: /phoenix.*raceway/, m: 1609 },
  { match: /new ?hampshire|newhampshire/, m: 1721 },
  { match: /homestead/, m: 2414 },
  { match: /chicago.*street/, m: 3540 },
];
function knownTrackLength(folder, trackName) {
  const key = `${folder} ${trackName ?? ""}`.toLowerCase().replace(/\\/g, "/");
  for (const t of TRACKS) {
    if (t.match.test(key)) return { m: t.m, label: t.label };
  }
  return null;
}
const MIN_LAP_S = 5;
const MIN_SECTOR_S = 1;
const MAX_LAP_S = 60 * 30;
function filterLapsNearBest(bestLaps) {
  if (bestLaps.length <= 2) return bestLaps;
  const bestEver = Math.min(...bestLaps);
  const threshold = Math.max(bestEver * 1.3, bestEver + 20);
  const nearBest = bestLaps.filter((s) => s <= threshold);
  return nearBest.length > 0 ? nearBest : bestLaps;
}
function isValidLap(s) {
  return Number.isFinite(s) && s >= MIN_LAP_S && s <= MAX_LAP_S;
}
function isValidSector(s) {
  return Number.isFinite(s) && s >= MIN_SECTOR_S && s <= MAX_LAP_S;
}
function median(xs) {
  if (xs.length === 0) return NaN;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
function stdev(xs) {
  if (xs.length < 2) return 0;
  const m = xs.reduce((a, b) => a + b, 0) / xs.length;
  const v = xs.reduce((a, b) => a + (b - m) * (b - m), 0) / (xs.length - 1);
  return Math.sqrt(v);
}
function selectLapfiles(files) {
  const out = [];
  let scanned = 0;
  for (const f of Array.from(files)) {
    scanned++;
    const path = f.webkitRelativePath || f.name;
    const lower = f.name.toLowerCase();
    const m = lower.match(/\.(olap|blap|plap|bplap|olapta|blapta|plapta|bplapta)$/);
    if (!m) continue;
    const ext = m[1];
    const baseName = f.name.slice(0, -1 - ext.length);
    const segs = path.split("/").filter(Boolean);
    const trackFolder = segs.length >= 2 ? segs[segs.length - 2] : "(root)";
    out.push({ file: f, trackFolder, baseName, ext });
  }
  return { selected: out, totalScanned: scanned };
}
function parseRaw(raw) {
  return parseLapfile(raw.buffer);
}
function buildFingerprint(parsed) {
  const groups = /* @__PURE__ */ new Map();
  for (const r of parsed) {
    const track = r.parsed.header.trackName || r.trackFolder;
    const car = r.parsed.header.carShortName || "(unknown car)";
    const key = `${track}|${car}`;
    const g = groups.get(key) ?? { track, car, folder: r.trackFolder, files: [] };
    g.files.push(r.parsed);
    groups.set(key, g);
  }
  const pairs = [];
  for (const g of groups.values()) {
    const rawBestLaps = g.files.map((f) => f.summary.bestLapS).filter(isValidLap);
    if (rawBestLaps.length === 0) continue;
    const plausibleBestLaps = filterLapsNearBest(rawBestLaps);
    const bestLaps = plausibleBestLaps.length ? plausibleBestLaps : rawBestLaps;
    const bestEver = Math.min(...bestLaps);
    const bestEverFile = g.files.find((f) => f.summary.bestLapS === bestEver);
    const validSectorFiles = g.files.filter(
      (f) =>
        isValidLap(f.summary.bestLapS) &&
        f.summary.bestLapS <= Math.max(bestEver * 1.3, bestEver + 20) &&
        f.summary.sectorTimesS.length > 0 &&
        f.summary.sectorTimesS.every(isValidSector),
    );
    const numSec = Math.max(0, ...validSectorFiles.map((f) => f.summary.sectorTimesS.length));
    const bestPerSector = [];
    let sectorsComplete = numSec > 0;
    for (let s = 0; s < numSec; s++) {
      const vals = validSectorFiles.map((f) => f.summary.sectorTimesS[s]).filter(isValidSector);
      if (vals.length) bestPerSector.push(Math.min(...vals));
      else sectorsComplete = false;
    }
    const optimalSum = bestPerSector.reduce((a, b) => a + b, 0);
    const optimalEver =
      sectorsComplete &&
      optimalSum > 0 &&
      optimalSum <= bestEver + 1e-3 &&
      optimalSum >= bestEver * 0.5
        ? bestPerSector.reduce((a, b) => a + b, 0)
        : null;
    const bestSectors = bestEverFile.summary.sectorTimesS;
    const allSectorsValid = bestSectors.length > 0 && bestSectors.every(isValidSector);
    const sectorSum = bestSectors.reduce((a, b) => a + b, 0);
    const sectorsCloseToLap = allSectorsValid && Math.abs(sectorSum - bestEver) / bestEver < 0.05;
    const sectorBalancePct = sectorsCloseToLap ? bestSectors.map((s) => (s / bestEver) * 100) : [];
    const dated = g.files
      .map((f) => ({
        d: f.header.buildDates[0] ?? null,
        b: f.summary.bestLapS,
      }))
      .filter((x) => x.d && isValidLap(x.b))
      .sort((a, b) => (a.d < b.d ? -1 : 1));
    let trend = null;
    if (dated.length >= 4) {
      const half = Math.floor(dated.length / 2);
      const early = Math.min(...dated.slice(0, half).map((x) => x.b));
      const late = Math.min(...dated.slice(half).map((x) => x.b));
      const delta = early - late;
      if (Math.abs(delta) < 0.05) trend = "flat";
      else trend = delta > 0 ? "improving" : "regressing";
    }
    pairs.push({
      track: g.track,
      car: g.car,
      fileCount: bestLaps.length,
      bestEverS: +bestEver.toFixed(3),
      optimalEverS: optimalEver != null ? +optimalEver.toFixed(3) : null,
      medianBestS: +median(bestLaps).toFixed(3),
      bestStdevS: +stdev(bestLaps).toFixed(3),
      bestLapSectors: allSectorsValid ? bestSectors.map((s) => +s.toFixed(3)) : [],
      bestPerSector: bestPerSector.map((s) => +s.toFixed(3)),
      sectorBalancePct: sectorBalancePct.map((s) => +s.toFixed(2)),
      ...(() => {
        const known = knownTrackLength(g.folder, g.track);
        return known
          ? { trackLengthM: known.m, trackLengthKnown: true }
          : {
              trackLengthM: +bestEverFile.summary.trackLengthM.toFixed(1),
              trackLengthKnown: false,
            };
      })(),
      latestBuildDate: dated.length ? dated[dated.length - 1].d : null,
      earliestBuildDate: dated.length ? dated[0].d : null,
      trend,
      custIds: Array.from(new Set(g.files.map((f) => f.header.custId))),
    });
  }
  pairs.sort((a, b) => a.track.localeCompare(b.track) || a.car.localeCompare(b.car));
  const tracks = new Set(pairs.map((p) => p.track));
  const multiFile = pairs.filter((p) => p.fileCount >= 2 && p.medianBestS > 0);
  const selfImpRatios = multiFile.map((p) => p.bestEverS / p.medianBestS);
  const stdevs = multiFile.map((p) => p.bestStdevS);
  const trends = pairs.map((p) => p.trend).filter(Boolean);
  const trajectoryScore = trends.length
    ? +(
        ((trends.filter((t) => t === "improving").length -
          trends.filter((t) => t === "regressing").length) /
          trends.length) *
        100
      ).toFixed(1)
    : null;
  return {
    generatedAt: /* @__PURE__ */ new Date().toISOString(),
    totalFiles: parsed.length,
    totalTracks: tracks.size,
    totalCars: new Set(pairs.map((p) => p.car)).size,
    pairs,
    indices: {
      selfImprovementIndex: selfImpRatios.length ? +median(selfImpRatios).toFixed(4) : null,
      consistencyIndexS: stdevs.length ? +median(stdevs).toFixed(3) : null,
      versatility: tracks.size,
      trajectoryScore,
    },
    emptyTracks: [],
  };
}
const STORAGE_KEY = "apextrace.fingerprint.v1";
function saveFingerprint(fp) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fp));
  } catch {}
}
function loadFingerprint() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function clearFingerprint() {
  localStorage.removeItem(STORAGE_KEY);
}
export {
  selectLapfiles as a,
  buildFingerprint as b,
  clearFingerprint as c,
  loadFingerprint as l,
  parseRaw as p,
  saveFingerprint as s,
};
