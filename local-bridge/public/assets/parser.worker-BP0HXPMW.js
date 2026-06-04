(function () {
  "use strict";
  const y = { Char: 0, Bool: 1, Int: 2, Bitfield: 3, Float: 4, Double: 5 },
    _ = 144;
  function T(a, e, n) {
    const i = new Uint8Array(a.buffer, a.byteOffset + e, n);
    let f = 0;
    for (; f < i.length && i[f] !== 0; ) f++;
    return new TextDecoder("utf-8", { fatal: !1 }).decode(i.subarray(0, f));
  }
  function z(a) {
    const e = a.toLowerCase();
    return /(throttle|brake|clutch|steer|handbrake|driver)/.test(e)
      ? "Driver Inputs"
      : /(speed|velocity|accel|yaw|pitch|roll|gear|rpm|enginerpm|track)/.test(e)
        ? "Vehicle"
        : /(fuel|engine|oil|water|coolant|mgu|battery|kers|drs|boost|manifold)/.test(e)
          ? "Engine"
          : /(tire|tyre|temp|press|carcass|tread|wear|cf|cm|cl|lf|rf|lr|rr)/.test(e) &&
              /(temp|press|wear|tread|cold|carcass)/.test(e)
            ? "Tires"
            : /(shock|spring|ride|damper|susp|arb|height|defl)/.test(e)
              ? "Suspension"
              : /(session|lap|race|incident|flag|pit|track|surface|sector)/.test(e)
                ? "Session"
                : /(weather|wind|air|track(temp|surface|wetness|usage)|humidity|skies|fog|precip)/.test(
                      e,
                    )
                  ? "Environment"
                  : /(cpu|fps|frame|gpu|mem|latency|ping)/.test(e)
                    ? "System"
                    : "Other";
  }
  function H(a, e, n) {
    switch (n) {
      case y.Char:
        return a.getUint8(e);
      case y.Bool:
        return a.getUint8(e);
      case y.Int:
        return a.getInt32(e, !0);
      case y.Bitfield:
        return a.getUint32(e, !0);
      case y.Float:
        return a.getFloat32(e, !0);
      case y.Double:
        return a.getFloat64(e, !0);
      default:
        return 0;
    }
  }
  function G(a) {
    const e = {},
      n = (o) => {
        const p = new RegExp(`^\\s*${o}:\\s*(.*?)\\s*$`, "m"),
          v = a.match(p);
        return v ? v[1].replace(/^"|"$/g, "") : void 0;
      };
    ((e.trackName = n("TrackName")), (e.trackDisplayName = n("TrackDisplayName")));
    const i = n("TrackLength");
    if (i) {
      const o = i.match(/([\d.]+)\s*km/);
      o && (e.trackLengthKm = parseFloat(o[1]));
    }
    const f = a.match(/DriverCarIdx:\s*(\d+)/),
      h = n("UserName");
    if ((h && (e.driverName = h), f)) {
      const o = parseInt(f[1], 10),
        p = a.split(/Drivers:\s*\n/)[1];
      if (p) {
        const v = new RegExp(`-\\s*CarIdx:\\s*${o}[\\s\\S]*?UserName:\\s*([^\\n]+)`),
          N = p.match(v);
        N && (e.driverName = N[1].trim());
        const x = new RegExp(`-\\s*CarIdx:\\s*${o}[\\s\\S]*?CarScreenName:\\s*([^\\n]+)`),
          w = p.match(x);
        w && (e.carName = w[1].trim());
      }
    }
    if (!e.carName) {
      const o = n("CarScreenName");
      o && (e.carName = o);
    }
    return e;
  }
  function K(a, e) {
    const n = new DataView(a);
    e?.("header", 0);
    const i = n.getInt32(0, !0),
      f = n.getInt32(8, !0),
      h = n.getInt32(16, !0),
      o = n.getInt32(20, !0),
      p = n.getInt32(24, !0),
      v = n.getInt32(28, !0),
      N = n.getInt32(32, !0),
      x = n.getInt32(36, !0);
    if ((i !== 2 && console.warn(`[ibt] unexpected version ${i}`), N < 1))
      throw new Error("Invalid .ibt: no data buffers");
    const w = n.getInt32(52, !0);
    e?.("vars", 5);
    const D = new Array(p);
    for (let t = 0; t < p; t++) {
      const r = v + t * _,
        s = n.getInt32(r, !0),
        l = n.getInt32(r + 4, !0),
        I = n.getInt32(r + 8, !0),
        m = T(n, r + 16, 32),
        u = T(n, r + 48, 64),
        S = T(n, r + 112, 32);
      D[t] = { name: m, type: s, offset: l, count: I, desc: u, unit: S };
    }
    e?.("yaml", 10);
    let $ = "";
    h > 0 && o > 0 && o + h <= a.byteLength && ($ = T(n, o, h));
    const Z = G($),
      q = a.byteLength - w,
      c = Math.max(0, Math.floor(q / x));
    e?.("samples", 15, `${p} channels × ${c} ticks`);
    const d = {},
      C = [];
    for (const t of D)
      if (t.name)
        if (t.count <= 1) C.push({ name: t.name, v: t, arrayIdx: 0 });
        else {
          const r = Math.min(t.count, 8);
          for (let s = 0; s < r; s++) C.push({ name: `${t.name}[${s}]`, v: t, arrayIdx: s });
        }
    for (const t of C)
      d[t.name] = {
        name: t.name,
        unit: t.v.unit,
        desc: t.v.desc,
        type: t.v.type,
        data: new Float32Array(c),
        min: 1 / 0,
        max: -1 / 0,
        avg: 0,
        group: z(t.name),
      };
    const J = (t) => (t === 5 ? 8 : t === 0 || t === 1 ? 1 : 4),
      Q = Math.max(1, Math.floor(c / 40));
    for (let t = 0; t < c; t++) {
      const r = w + t * x;
      for (const s of C) {
        const l = J(s.v.type),
          I = r + s.v.offset + s.arrayIdx * l,
          m = d[s.name],
          u = H(n, I, s.v.type);
        ((m.data[t] = u), u < m.min && (m.min = u), u > m.max && (m.max = u), (m.avg += u));
      }
      t % Q === 0 && e?.("samples", 15 + Math.floor((t / c) * 60), `${t}/${c}`);
    }
    for (const t of Object.values(d))
      ((t.avg = c > 0 ? t.avg / c : 0),
        isFinite(t.min) || (t.min = 0),
        isFinite(t.max) || (t.max = 0));
    e?.("laps", 80);
    const M = [],
      E = d.Lap,
      k = d.SessionTime;
    if (E && k && c > 0) {
      let t = E.data[0],
        r = 0;
      for (let s = 1; s < c; s++) {
        const l = E.data[s];
        l !== t &&
          (M.push({ lap: t, startTick: r, endTick: s - 1, timeS: k.data[s - 1] - k.data[r] }),
          (t = l),
          (r = s));
      }
      M.push({ lap: t, startTick: r, endTick: c - 1, timeS: k.data[c - 1] - k.data[r] });
    }
    let Y;
    for (const t of M)
      t.endTick - t.startTick < 30 ||
        (t.timeS > 5 && (Y === void 0 || t.timeS < Y) && (Y = t.timeS));
    e?.("track", 88);
    let L;
    const B = d.VelocityX,
      A = d.VelocityY,
      O = d.Yaw || d.YawNorth;
    if (B && A && O && c > 1) {
      const t = new Float32Array(c),
        r = new Float32Array(c);
      let s = 0,
        l = 0;
      const I = 1 / Math.max(1, f);
      let m = 0,
        u = 0,
        S = 0,
        F = 0;
      for (let g = 0; g < c; g++) {
        const V = O.data[g],
          X = B.data[g],
          R = A.data[g],
          U = Math.cos(V),
          j = Math.sin(V),
          P = X * U - R * j,
          tt = X * j + R * U;
        ((s += P * I),
          (l += tt * I),
          (t[g] = s),
          (r[g] = l),
          s < m ? (m = s) : s > u && (u = s),
          l < S ? (S = l) : l > F && (F = l));
      }
      L = { x: t, y: r, minX: m, maxX: u, minY: S, maxY: F };
    }
    const b = k?.data,
      W = b && b.length > 1 ? b[b.length - 1] - b[0] : c / Math.max(1, f);
    return (
      e?.("done", 100),
      {
        meta: {
          ver: i,
          tickRate: f,
          numVars: p,
          numTicks: c,
          durationS: W,
          bufLen: x,
          bestLapS: Y,
          ...Z,
          sessionInfoYaml: $,
        },
        channels: d,
        channelNames: Object.keys(d).sort((t, r) => t.localeCompare(r)),
        laps: M,
        trackXY: L,
      }
    );
  }
  self.onmessage = (a) => {
    const { buffer: e } = a.data;
    try {
      const n = K(e, (f, h, o) => {
          self.postMessage({ kind: "progress", phase: f, pct: h, message: o });
        }),
        i = [];
      for (const f of Object.values(n.channels)) i.push(f.data.buffer);
      (n.trackXY && (i.push(n.trackXY.x.buffer), i.push(n.trackXY.y.buffer)),
        self.postMessage({ kind: "done", parsed: n }, i));
    } catch (n) {
      self.postMessage({ kind: "error", message: n.message });
    }
  };
})();
