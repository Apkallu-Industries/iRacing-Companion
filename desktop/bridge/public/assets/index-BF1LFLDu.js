const __vite__mapDeps = (
  i,
  m = __vite__mapDeps,
  d = m.f ||
    (m.f = [
      "assets/team-guide-NPvi1aUd.js",
      "assets/react-core-hSJfnumv.js",
      "assets/icons-UNkcvPbk.js",
      "assets/vendor-CUluG-o1.js",
      "assets/charts-DDN7mcLY.js",
      "assets/supabase-DZ6I_NU8.js",
      "assets/zustand-BHt0iSzh.js",
      "assets/radix-ui-BcE8c2tf.js",
      "assets/team-CBRvNvqf.js",
      "assets/settings-wREwmemz.js",
      "assets/AppHeader-CjQcEoTJ.js",
      "assets/zod-Dtfr8j2K.js",
      "assets/tts.functions-LY4Ks8GB.js",
      "assets/BackButton-Doz18YZJ.js",
      "assets/useRuntimeStatus-CE4IlwRK.js",
      "assets/runtime-DVwMXSrJ.js",
      "assets/roadmap-BNxB20zU.js",
      "assets/live-OaeZ-ya1.js",
      "assets/fingerprint.functions-BMQvC9Av.js",
      "assets/histogramUtils-mG0ktSUz.js",
      "assets/registry-DIFZ_TvW.js",
      "assets/compute-BRB7j8od.js",
      "assets/parser-DWvJMnnz.js",
      "assets/carClass-DFEFUkyR.js",
      "assets/how-it-works-hcO9O8Um.js",
      "assets/fingerprint-CiEJQA6p.js",
      "assets/driver-bridge-H1LqMJkn.js",
      "assets/auth-DzehSQjg.js",
      "assets/ai-engineer-D09qasPP.js",
      "assets/setup-HNiGt18E.js",
      "assets/admin-C87KmQXR.js",
      "assets/index-C19jen0n.js",
      "assets/sessions.index-Bw9pw2QJ.js",
      "assets/parseInWorker-Dftmetwb.js",
      "assets/serialize-C4guDAgt.js",
      "assets/share._token-BmfdrIS9.js",
      "assets/SectorSpider-CrjqgUgQ.js",
      "assets/ReplayThree-BlcFTb3W.js",
      "assets/three-addons-DfNCnqJ2.js",
      "assets/three-core-CtFbowaE.js",
      "assets/Timeline-CAHkA-8Z.js",
      "assets/sessions._id-B41VMAUJ.js",
      "assets/lab.lapfile-BcDFPRUr.js",
      "assets/detached._instrument-14xc2eSB.js",
    ]),
) => i.map((i) => d[i]);
import { d as x, j as l, R as ct, r as ho, c as fo } from "./react-core-hSJfnumv.js";
import {
  e as ze,
  r as jr,
  p as po,
  q as Kr,
  a as mo,
  s as go,
  w as bo,
  T as yo,
  o as xo,
  g as vo,
  h as wo,
  t as re,
} from "./vendor-CUluG-o1.js";
import { a as So } from "./charts-DDN7mcLY.js";
import { c as Ro } from "./supabase-DZ6I_NU8.js";
import { c as ko, p as _o } from "./zustand-BHt0iSzh.js";
import {
  s as Co,
  aU as Ks,
  p as lt,
  n as Vr,
  a as Po,
  b as Jt,
  aQ as Rt,
  i as kt,
  f as Qt,
  R as Xt,
  aV as Yr,
  P as Zt,
  E as Vs,
  ap as gr,
  l as Lo,
  _ as Jr,
  D as Ys,
  ao as To,
  Y as Qr,
  Z as Io,
  ah as _t,
  o as Xr,
  aD as Zr,
  j as er,
  z as tr,
  aG as jo,
  ak as Oo,
} from "./icons-UNkcvPbk.js";
import {
  R as Eo,
  P as No,
  a as Js,
  C as Ao,
  T as Qs,
  D as Xs,
  O as Zs,
  e as Mo,
  L as en,
  h as tn,
  b as rn,
  g as Do,
} from "./radix-ui-BcE8c2tf.js";
var Fo = "__TSS_CONTEXT",
  br = Symbol.for("TSS_SERVER_FUNCTION"),
  es = Symbol.for("TSS_SERVER_FUNCTION_FACTORY"),
  Bo = "application/x-tss-framed",
  ue = { JSON: 0, CHUNK: 1, END: 2, ERROR: 3 },
  $o = /;\s*v=(\d+)/;
function Uo(e) {
  const t = e.match($o);
  return t ? parseInt(t[1], 10) : void 0;
}
function Wo(e) {
  const t = Uo(e);
  if (t !== void 0 && t !== 1)
    throw new Error(
      `Incompatible framed protocol version: server=${t}, client=1. Please ensure client and server are using compatible versions.`,
    );
}
var Or = () => window.__TSS_START_OPTIONS__;
const sn = !1;
function dt(e) {
  return e[e.length - 1];
}
function Ho(e) {
  return typeof e == "function";
}
function xe(e, t) {
  return Ho(e) ? e(t) : e;
}
const nn = Object.prototype.hasOwnProperty,
  ts = Object.prototype.propertyIsEnumerable;
function on(e) {
  for (const t in e) if (nn.call(e, t)) return !0;
  return !1;
}
const zo = () => Object.create(null),
  Le = (e, t) => ve(e, t, zo);
function ve(e, t, r = () => ({}), s = 0) {
  if (e === t) return e;
  if (s > 500) return t;
  const n = t,
    o = ns(e) && ns(n);
  if (!o && !(qe(e) && qe(n))) return n;
  const a = o ? e : rs(e);
  if (!a) return n;
  const i = o ? n : rs(n);
  if (!i) return n;
  const c = a.length,
    d = i.length,
    u = o ? new Array(d) : r();
  let h = 0;
  for (let p = 0; p < d; p++) {
    const f = o ? p : i[p],
      g = e[f],
      y = n[f];
    if (g === y) {
      ((u[f] = g), (o ? p < c : nn.call(e, f)) && h++);
      continue;
    }
    if (g === null || y === null || typeof g != "object" || typeof y != "object") {
      u[f] = y;
      continue;
    }
    const m = ve(g, y, r, s + 1);
    ((u[f] = m), m === g && h++);
  }
  return c === d && h === c ? e : u;
}
function rs(e) {
  const t = Object.getOwnPropertyNames(e);
  for (const n of t) if (!ts.call(e, n)) return !1;
  const r = Object.getOwnPropertySymbols(e);
  if (r.length === 0) return t;
  const s = t;
  for (const n of r) {
    if (!ts.call(e, n)) return !1;
    s.push(n);
  }
  return s;
}
function qe(e) {
  if (!ss(e)) return !1;
  const t = e.constructor;
  if (typeof t > "u") return !0;
  const r = t.prototype;
  return !(!ss(r) || !r.hasOwnProperty("isPrototypeOf"));
}
function ss(e) {
  return Object.prototype.toString.call(e) === "[object Object]";
}
function ns(e) {
  return Array.isArray(e) && e.length === Object.keys(e).length;
}
function J(e, t, r) {
  if (e === t) return !0;
  if (typeof e != typeof t) return !1;
  if (Array.isArray(e) && Array.isArray(t)) {
    if (e.length !== t.length) return !1;
    for (let s = 0, n = e.length; s < n; s++) if (!J(e[s], t[s], r)) return !1;
    return !0;
  }
  if (qe(e) && qe(t)) {
    const s = r?.ignoreUndefined ?? !0;
    if (r?.partial) {
      for (const a in t) if ((!s || t[a] !== void 0) && !J(e[a], t[a], r)) return !1;
      return !0;
    }
    let n = 0;
    if (!s) n = Object.keys(e).length;
    else for (const a in e) e[a] !== void 0 && n++;
    let o = 0;
    for (const a in t) if ((!s || t[a] !== void 0) && (o++, o > n || !J(e[a], t[a], r))) return !1;
    return n === o;
  }
  return !1;
}
function Ae(e) {
  let t, r;
  const s = new Promise((n, o) => {
    ((t = n), (r = o));
  });
  return (
    (s.status = "pending"),
    (s.resolve = (n) => {
      ((s.status = "resolved"), (s.value = n), t(n), e?.(n));
    }),
    (s.reject = (n) => {
      ((s.status = "rejected"), r(n));
    }),
    s
  );
}
function Go(e) {
  return typeof e?.message != "string"
    ? !1
    : e.message.startsWith("Failed to fetch dynamically imported module") ||
        e.message.startsWith("error loading dynamically imported module") ||
        e.message.startsWith("Importing a module script failed");
}
function ut(e) {
  return !!(e && typeof e == "object" && typeof e.then == "function");
}
function qo(e) {
  return e.replace(/[\x00-\x1f\x7f]/g, "");
}
function os(e) {
  let t;
  try {
    t = decodeURI(e);
  } catch {
    t = e.replaceAll(/%[0-9A-F]{2}/gi, (r) => {
      try {
        return decodeURI(r);
      } catch {
        return r;
      }
    });
  }
  return qo(t);
}
const Ko = ["http:", "https:", "mailto:", "tel:"];
function Mt(e, t) {
  if (!e) return !1;
  try {
    const r = new URL(e);
    return !t.has(r.protocol);
  } catch {
    return !1;
  }
}
const Vo = {
    "&": "\\u0026",
    ">": "\\u003e",
    "<": "\\u003c",
    "\u2028": "\\u2028",
    "\u2029": "\\u2029",
  },
  Yo = /[&><\u2028\u2029]/g;
function Jo(e) {
  return e.replace(Yo, (t) => Vo[t]);
}
function Xe(e) {
  if (!e) return { path: e, handledProtocolRelativeURL: !1 };
  if (!/[%\\\x00-\x1f\x7f]/.test(e) && !e.startsWith("//"))
    return { path: e, handledProtocolRelativeURL: !1 };
  const t = /%25|%5C/gi;
  let r = 0,
    s = "",
    n;
  for (; (n = t.exec(e)) !== null; ) ((s += os(e.slice(r, n.index)) + n[0]), (r = t.lastIndex));
  s = s + os(r ? e.slice(r) : e);
  let o = !1;
  return (
    s.startsWith("//") && ((o = !0), (s = "/" + s.replace(/^\/+/, ""))),
    { path: s, handledProtocolRelativeURL: o }
  );
}
function Qo(e) {
  return /\s|[^\u0000-\u007F]/.test(e) ? e.replace(/\s|[^\u0000-\u007F]/gu, encodeURIComponent) : e;
}
function Xo(e, t) {
  if (e === t) return !0;
  if (e.length !== t.length) return !1;
  for (let r = 0; r < e.length; r++) if (e[r] !== t[r]) return !1;
  return !0;
}
function Q() {
  throw new Error("Invariant failed");
}
function ht(e) {
  const t = new Map();
  let r, s;
  const n = (o) => {
    o.next &&
      (o.prev
        ? ((o.prev.next = o.next),
          (o.next.prev = o.prev),
          (o.next = void 0),
          s && ((s.next = o), (o.prev = s)))
        : ((o.next.prev = void 0),
          (r = o.next),
          (o.next = void 0),
          s && ((o.prev = s), (s.next = o))),
      (s = o));
  };
  return {
    get(o) {
      const a = t.get(o);
      if (a) return (n(a), a.value);
    },
    set(o, a) {
      if (t.size >= e && r) {
        const c = r;
        (t.delete(c.key),
          c.next && ((r = c.next), (c.next.prev = void 0)),
          c === s && (s = void 0));
      }
      const i = t.get(o);
      if (i) ((i.value = a), n(i));
      else {
        const c = { key: o, value: a, prev: s };
        (s && (s.next = c), (s = c), r || (r = c), t.set(o, c));
      }
    },
    clear() {
      (t.clear(), (r = void 0), (s = void 0));
    },
  };
}
const we = 4,
  an = 5;
function Zo(e) {
  const t = e.indexOf("{");
  if (t === -1) return null;
  const r = e.indexOf("}", t);
  return r === -1 || t + 1 >= e.length ? null : [t, r];
}
function cn(e, t, r = new Uint16Array(6)) {
  const s = e.indexOf("/", t),
    n = s === -1 ? e.length : s,
    o = e.substring(t, n);
  if (!o || !o.includes("$"))
    return ((r[0] = 0), (r[1] = t), (r[2] = t), (r[3] = n), (r[4] = n), (r[5] = n), r);
  if (o === "$") {
    const i = e.length;
    return ((r[0] = 2), (r[1] = t), (r[2] = t), (r[3] = i), (r[4] = i), (r[5] = i), r);
  }
  if (o.charCodeAt(0) === 36)
    return ((r[0] = 1), (r[1] = t), (r[2] = t + 1), (r[3] = n), (r[4] = n), (r[5] = n), r);
  const a = Zo(o);
  if (a) {
    const [i, c] = a,
      d = o.charCodeAt(i + 1);
    if (d === 45) {
      if (i + 2 < o.length && o.charCodeAt(i + 2) === 36) {
        const u = i + 3,
          h = c;
        if (u < h)
          return (
            (r[0] = 3),
            (r[1] = t + i),
            (r[2] = t + u),
            (r[3] = t + h),
            (r[4] = t + c + 1),
            (r[5] = n),
            r
          );
      }
    } else if (d === 36) {
      const u = i + 1,
        h = i + 2;
      return h === c
        ? ((r[0] = 2),
          (r[1] = t + i),
          (r[2] = t + u),
          (r[3] = t + h),
          (r[4] = t + c + 1),
          (r[5] = e.length),
          r)
        : ((r[0] = 1),
          (r[1] = t + i),
          (r[2] = t + h),
          (r[3] = t + c),
          (r[4] = t + c + 1),
          (r[5] = n),
          r);
    }
  }
  return ((r[0] = 0), (r[1] = t), (r[2] = t), (r[3] = n), (r[4] = n), (r[5] = n), r);
}
function zt(e, t, r, s, n, o, a) {
  a?.(r);
  let i = s;
  {
    const c = r.fullPath ?? r.from,
      d = c.length,
      u = r.options?.caseSensitive ?? e,
      h = r.options?.params?.parse ?? r.options?.parseParams;
    for (; i < d; ) {
      const f = cn(c, i, t);
      let g;
      const y = i,
        m = f[5];
      switch (((i = m + 1), o++, f[0])) {
        case 0: {
          const b = c.substring(f[2], f[3]);
          if (u) {
            const v = n.static?.get(b);
            if (v) g = v;
            else {
              n.static ??= new Map();
              const S = Ie(r.fullPath ?? r.from);
              ((S.parent = n), (S.depth = o), (g = S), n.static.set(b, S));
            }
          } else {
            const v = b.toLowerCase(),
              S = n.staticInsensitive?.get(v);
            if (S) g = S;
            else {
              n.staticInsensitive ??= new Map();
              const w = Ie(r.fullPath ?? r.from);
              ((w.parent = n), (w.depth = o), (g = w), n.staticInsensitive.set(v, w));
            }
          }
          break;
        }
        case 1: {
          const b = c.substring(y, f[1]),
            v = c.substring(f[4], m),
            S = u && !!(b || v),
            w = b ? (S ? b : b.toLowerCase()) : void 0,
            C = v ? (S ? v : v.toLowerCase()) : void 0,
            L =
              !h &&
              n.dynamic?.find(
                (k) => !k.parse && k.caseSensitive === S && k.prefix === w && k.suffix === C,
              );
          if (L) g = L;
          else {
            const k = sr(1, r.fullPath ?? r.from, S, w, C);
            ((g = k), (k.depth = o), (k.parent = n), (n.dynamic ??= []), n.dynamic.push(k));
          }
          break;
        }
        case 3: {
          const b = c.substring(y, f[1]),
            v = c.substring(f[4], m),
            S = u && !!(b || v),
            w = b ? (S ? b : b.toLowerCase()) : void 0,
            C = v ? (S ? v : v.toLowerCase()) : void 0,
            L =
              !h &&
              n.optional?.find(
                (k) => !k.parse && k.caseSensitive === S && k.prefix === w && k.suffix === C,
              );
          if (L) g = L;
          else {
            const k = sr(3, r.fullPath ?? r.from, S, w, C);
            ((g = k), (k.parent = n), (k.depth = o), (n.optional ??= []), n.optional.push(k));
          }
          break;
        }
        case 2: {
          const b = c.substring(y, f[1]),
            v = c.substring(f[4], m),
            S = u && !!(b || v),
            w = b ? (S ? b : b.toLowerCase()) : void 0,
            C = v ? (S ? v : v.toLowerCase()) : void 0,
            L = sr(2, r.fullPath ?? r.from, S, w, C);
          ((g = L), (L.parent = n), (L.depth = o), (n.wildcard ??= []), n.wildcard.push(L));
        }
      }
      n = g;
    }
    if (h && r.children && !r.isRoot && r.id && r.id.charCodeAt(r.id.lastIndexOf("/") + 1) === 95) {
      const f = Ie(r.fullPath ?? r.from);
      ((f.kind = an),
        (f.parent = n),
        o++,
        (f.depth = o),
        (n.pathless ??= []),
        n.pathless.push(f),
        (n = f));
    }
    const p = (r.path || !r.children) && !r.isRoot;
    if (p && c.endsWith("/")) {
      const f = Ie(r.fullPath ?? r.from);
      ((f.kind = we), (f.parent = n), o++, (f.depth = o), (n.index = f), (n = f));
    }
    ((n.parse = h ?? null),
      (n.priority = r.options?.params?.priority ?? 0),
      p && !n.route && ((n.route = r), (n.fullPath = r.fullPath ?? r.from)));
  }
  if (r.children) for (const c of r.children) zt(e, t, c, i, n, o, a);
}
function rr(e, t) {
  if (e.parse && !t.parse) return -1;
  if (!e.parse && t.parse) return 1;
  if (e.parse && t.parse && (e.priority || t.priority)) return t.priority - e.priority;
  if (e.prefix && t.prefix && e.prefix !== t.prefix) {
    if (e.prefix.startsWith(t.prefix)) return -1;
    if (t.prefix.startsWith(e.prefix)) return 1;
  }
  if (e.suffix && t.suffix && e.suffix !== t.suffix) {
    if (e.suffix.endsWith(t.suffix)) return -1;
    if (t.suffix.endsWith(e.suffix)) return 1;
  }
  return e.prefix && !t.prefix
    ? -1
    : !e.prefix && t.prefix
      ? 1
      : e.suffix && !t.suffix
        ? -1
        : !e.suffix && t.suffix
          ? 1
          : e.caseSensitive && !t.caseSensitive
            ? -1
            : !e.caseSensitive && t.caseSensitive
              ? 1
              : 0;
}
function ye(e) {
  if (e.pathless) for (const t of e.pathless) ye(t);
  if (e.static) for (const t of e.static.values()) ye(t);
  if (e.staticInsensitive) for (const t of e.staticInsensitive.values()) ye(t);
  if (e.dynamic?.length) {
    e.dynamic.sort(rr);
    for (const t of e.dynamic) ye(t);
  }
  if (e.optional?.length) {
    e.optional.sort(rr);
    for (const t of e.optional) ye(t);
  }
  if (e.wildcard?.length) {
    e.wildcard.sort(rr);
    for (const t of e.wildcard) ye(t);
  }
}
function Ie(e) {
  return {
    kind: 0,
    depth: 0,
    pathless: null,
    index: null,
    static: null,
    staticInsensitive: null,
    dynamic: null,
    optional: null,
    wildcard: null,
    route: null,
    fullPath: e,
    parent: null,
    parse: null,
    priority: 0,
  };
}
function sr(e, t, r, s, n) {
  return {
    kind: e,
    depth: 0,
    pathless: null,
    index: null,
    static: null,
    staticInsensitive: null,
    dynamic: null,
    optional: null,
    wildcard: null,
    route: null,
    fullPath: t,
    parent: null,
    parse: null,
    priority: 0,
    caseSensitive: r,
    prefix: s,
    suffix: n,
  };
}
function ea(e, t) {
  const r = Ie("/"),
    s = new Uint16Array(6);
  for (const n of e) zt(!1, s, n, 1, r, 0);
  (ye(r), (t.masksTree = r), (t.flatCache = ht(1e3)));
}
function ta(e, t) {
  e ||= "/";
  const r = t.flatCache.get(e);
  if (r) return r;
  const s = Er(e, t.masksTree);
  return (t.flatCache.set(e, s), s);
}
function ra(e, t, r, s, n) {
  ((e ||= "/"), (s ||= "/"));
  const o = t ? `case\0${e}` : e;
  let a = n.singleCache.get(o);
  return (
    a || ((a = Ie("/")), zt(t, new Uint16Array(6), { from: e }, 1, a, 0), n.singleCache.set(o, a)),
    Er(s, a, r)
  );
}
function sa(e, t, r = !1) {
  const s = r ? e : `nofuzz\0${e}`,
    n = t.matchCache.get(s);
  if (n !== void 0) return n;
  e ||= "/";
  let o;
  try {
    o = Er(e, t.segmentTree, r);
  } catch (a) {
    if (a instanceof URIError) o = null;
    else throw a;
  }
  return (o && (o.branch = dn(o.route)), t.matchCache.set(s, o), o);
}
function na(e) {
  return e === "/" ? e : e.replace(/\/{1,}$/, "");
}
function oa(e, t = !1, r) {
  const s = Ie(e.fullPath),
    n = new Uint16Array(6),
    o = {},
    a = {};
  let i = 0;
  return (
    zt(t, n, e, 1, s, 0, (c) => {
      if ((r?.(c, i), c.id in o && Q(), (o[c.id] = c), i !== 0 && c.path)) {
        const d = na(c.fullPath);
        (!a[d] || c.fullPath.endsWith("/")) && (a[d] = c);
      }
      i++;
    }),
    ye(s),
    {
      processedTree: {
        segmentTree: s,
        singleCache: ht(1e3),
        matchCache: ht(1e3),
        flatCache: null,
        masksTree: null,
      },
      routesById: o,
      routesByPath: a,
    }
  );
}
function Er(e, t, r = !1) {
  const s = e.split("/"),
    n = ia(e, s, t, r);
  if (!n) return null;
  const [o] = ln(e, s, n);
  return { route: n.node.route, rawParams: o };
}
function ln(e, t, r) {
  const s = aa(r.node);
  let n = null;
  const o = Object.create(null);
  let a = r.extract?.part ?? 0,
    i = r.extract?.node ?? 0,
    c = r.extract?.path ?? 0,
    d = r.extract?.segment ?? 0;
  for (; i < s.length; a++, i++, c++, d++) {
    const u = s[i];
    if (u.kind === we) break;
    if (u.kind === an) {
      (d--, a--, c--);
      continue;
    }
    const h = t[a],
      p = c;
    if ((h && (c += h.length), u.kind === 1)) {
      n ??= r.node.fullPath.split("/");
      const f = n[d],
        g = u.prefix?.length ?? 0;
      if (f.charCodeAt(g) === 123) {
        const y = u.suffix?.length ?? 0,
          m = f.substring(g + 2, f.length - y - 1),
          b = h.substring(g, h.length - y);
        o[m] = decodeURIComponent(b);
      } else {
        const y = f.substring(1);
        o[y] = decodeURIComponent(h);
      }
    } else if (u.kind === 3) {
      if (r.skipped & (1 << i)) {
        (a--, (c = p - 1));
        continue;
      }
      n ??= r.node.fullPath.split("/");
      const f = n[d],
        g = u.prefix?.length ?? 0,
        y = u.suffix?.length ?? 0,
        m = f.substring(g + 3, f.length - y - 1),
        b = u.suffix || u.prefix ? h.substring(g, h.length - y) : h;
      b && (o[m] = decodeURIComponent(b));
    } else if (u.kind === 2) {
      const f = u,
        g = e.substring(p + (f.prefix?.length ?? 0), e.length - (f.suffix?.length ?? 0)),
        y = decodeURIComponent(g);
      ((o["*"] = y), (o._splat = y));
      break;
    }
  }
  return (
    r.rawParams && Object.assign(o, r.rawParams),
    [o, { part: a, node: i, path: c, segment: d }]
  );
}
function dn(e) {
  const t = [e];
  for (; e.parentRoute; ) ((e = e.parentRoute), t.push(e));
  return (t.reverse(), t);
}
function aa(e) {
  const t = Array(e.depth + 1);
  do ((t[e.depth] = e), (e = e.parent));
  while (e);
  return t;
}
function ia(e, t, r, s) {
  if (e === "/" && r.index) return { node: r.index, skipped: 0 };
  const n = !dt(t),
    o = n && e !== "/",
    a = t.length - (n ? 1 : 0),
    i = [{ node: r, index: 1, skipped: 0, depth: 1, statics: 0, dynamics: 0, optionals: 0 }];
  let c = null,
    d = null;
  for (; i.length; ) {
    const u = i.pop(),
      { node: h, index: p, skipped: f, depth: g, statics: y, dynamics: m, optionals: b } = u;
    let { extract: v, rawParams: S } = u;
    if (h.kind === 2 && h.route && !Pt(d, u)) continue;
    if (h.parse) {
      if (!as(e, t, u)) continue;
      ((S = u.rawParams), (v = u.extract));
    }
    s && h.route && h.kind !== we && Pt(c, u) && (c = u);
    const w = p === a;
    if (
      w &&
      (h.route && (!o || h.kind === we || h.kind === 2) && Pt(d, u) && (d = u),
      !h.optional && !h.wildcard && !h.index && !h.pathless)
    )
      continue;
    const C = w ? void 0 : t[p];
    let L;
    if (w && h.index) {
      const k = {
        node: h.index,
        index: p,
        skipped: f,
        depth: g + 1,
        statics: y,
        dynamics: m,
        optionals: b,
        extract: v,
        rawParams: S,
      };
      let R = !0;
      if ((h.index.parse && (as(e, t, k) || (R = !1)), R)) {
        if (!m && !b && !f && ca(y, a)) return k;
        Pt(d, k) && (d = k);
      }
    }
    if (h.wildcard)
      for (let k = h.wildcard.length - 1; k >= 0; k--) {
        const R = h.wildcard[k],
          { prefix: P, suffix: j } = R;
        if (!(P && (w || !(R.caseSensitive ? C : (L ??= C.toLowerCase())).startsWith(P)))) {
          if (j) {
            if (w) continue;
            const I = t.slice(p).join("/").slice(-j.length);
            if ((R.caseSensitive ? I : I.toLowerCase()) !== j) continue;
          }
          i.push({
            node: R,
            index: a,
            skipped: f,
            depth: g + 1,
            statics: y,
            dynamics: m,
            optionals: b,
            extract: v,
            rawParams: S,
          });
        }
      }
    if (h.optional) {
      const k = f | (1 << g),
        R = g + 1;
      for (let P = h.optional.length - 1; P >= 0; P--) {
        const j = h.optional[P];
        i.push({
          node: j,
          index: p,
          skipped: k,
          depth: R,
          statics: y,
          dynamics: m,
          optionals: b,
          extract: v,
          rawParams: S,
        });
      }
      if (!w)
        for (let P = h.optional.length - 1; P >= 0; P--) {
          const j = h.optional[P],
            { prefix: I, suffix: O } = j;
          if (I || O) {
            const Z = j.caseSensitive ? C : (L ??= C.toLowerCase());
            if ((I && !Z.startsWith(I)) || (O && !Z.endsWith(O))) continue;
          }
          i.push({
            node: j,
            index: p + 1,
            skipped: f,
            depth: R,
            statics: y,
            dynamics: m,
            optionals: b + Ct(a, p),
            extract: v,
            rawParams: S,
          });
        }
    }
    if (!w && h.dynamic && C)
      for (let k = h.dynamic.length - 1; k >= 0; k--) {
        const R = h.dynamic[k],
          { prefix: P, suffix: j } = R;
        if (P || j) {
          const I = R.caseSensitive ? C : (L ??= C.toLowerCase());
          if ((P && !I.startsWith(P)) || (j && !I.endsWith(j))) continue;
        }
        i.push({
          node: R,
          index: p + 1,
          skipped: f,
          depth: g + 1,
          statics: y,
          dynamics: m + Ct(a, p),
          optionals: b,
          extract: v,
          rawParams: S,
        });
      }
    if (!w && h.staticInsensitive) {
      const k = h.staticInsensitive.get((L ??= C.toLowerCase()));
      k &&
        i.push({
          node: k,
          index: p + 1,
          skipped: f,
          depth: g + 1,
          statics: y + Ct(a, p),
          dynamics: m,
          optionals: b,
          extract: v,
          rawParams: S,
        });
    }
    if (!w && h.static) {
      const k = h.static.get(C);
      k &&
        i.push({
          node: k,
          index: p + 1,
          skipped: f,
          depth: g + 1,
          statics: y + Ct(a, p),
          dynamics: m,
          optionals: b,
          extract: v,
          rawParams: S,
        });
    }
    if (h.pathless) {
      const k = g + 1;
      for (let R = h.pathless.length - 1; R >= 0; R--) {
        const P = h.pathless[R];
        i.push({
          node: P,
          index: p,
          skipped: f,
          depth: k,
          statics: y,
          dynamics: m,
          optionals: b,
          extract: v,
          rawParams: S,
        });
      }
    }
  }
  if (d) return d;
  if (s && c) {
    let u = c.index;
    for (let p = 0; p < c.index; p++) u += t[p].length;
    const h = u === e.length ? "/" : e.slice(u);
    return ((c.rawParams ??= Object.create(null)), (c.rawParams["**"] = decodeURIComponent(h)), c);
  }
  return null;
}
function Ct(e, t) {
  return 2 ** (e - t - 1);
}
function ca(e, t) {
  return e === 2 ** (t - 1) - 1;
}
function as(e, t, r) {
  let s, n;
  try {
    [s, n] = ln(e, t, r);
  } catch {
    return null;
  }
  if (((r.rawParams = s), (r.extract = n), !r.node.parse)) return !0;
  try {
    if (r.node.parse(s) === !1) return null;
  } catch {}
  return !0;
}
function Pt(e, t) {
  return e
    ? t.statics > e.statics ||
        (t.statics === e.statics &&
          (t.dynamics > e.dynamics ||
            (t.dynamics === e.dynamics &&
              (t.optionals > e.optionals ||
                (t.optionals === e.optionals &&
                  ((t.node.kind === we) > (e.node.kind === we) ||
                    ((t.node.kind === we) == (e.node.kind === we) && t.depth > e.depth)))))))
    : !0;
}
function Ot(e) {
  return Nr(e.filter((t) => t !== void 0).join("/"));
}
function Nr(e) {
  return e.replace(/\/{2,}/g, "/");
}
function un(e) {
  return e === "/" ? e : e.replace(/^\/{1,}/, "");
}
function he(e) {
  const t = e.length;
  return t > 1 && e[t - 1] === "/" ? e.replace(/\/{1,}$/, "") : e;
}
function hn(e) {
  return he(un(e));
}
function Dt(e, t) {
  return e?.endsWith("/") && e !== "/" && e !== `${t}/` ? e.slice(0, -1) : e;
}
function la(e, t, r) {
  return Dt(e, r) === Dt(t, r);
}
function da({ base: e, to: t, trailingSlash: r = "never", cache: s }) {
  const n = t.startsWith("/"),
    o = !n && t === ".";
  let a;
  if (s) {
    a = n ? t : o ? e : e + "\0" + t;
    const d = s.get(a);
    if (d) return d;
  }
  let i;
  if (o) i = e.split("/");
  else if (n) i = t.split("/");
  else {
    for (i = e.split("/"); i.length > 1 && dt(i) === ""; ) i.pop();
    const d = t.split("/");
    for (let u = 0, h = d.length; u < h; u++) {
      const p = d[u];
      p === ""
        ? u
          ? u === h - 1 && i.push(p)
          : (i = [p])
        : p === ".."
          ? i.pop()
          : p === "." || i.push(p);
    }
  }
  i.length > 1 && (dt(i) === "" ? r === "never" && i.pop() : r === "always" && i.push(""));
  const c = Nr(i.join("/")) || "/";
  return (a && s && s.set(a, c), c);
}
function ua(e) {
  const t = new Map(e.map((n) => [encodeURIComponent(n), n])),
    r = Array.from(t.keys())
      .map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
      .join("|"),
    s = new RegExp(r, "g");
  return (n) => n.replace(s, (o) => t.get(o) ?? o);
}
function nr(e, t, r) {
  const s = t[e];
  return typeof s != "string"
    ? s
    : e === "_splat"
      ? /^[a-zA-Z0-9\-._~!/]*$/.test(s)
        ? s
        : s
            .split("/")
            .map((n) => cs(n, r))
            .join("/")
      : cs(s, r);
}
function is({ path: e, params: t, decoder: r, ...s }) {
  let n = !1;
  const o = Object.create(null);
  if (!e || e === "/") return { interpolatedPath: "/", usedParams: o, isMissingParams: n };
  if (!e.includes("$")) return { interpolatedPath: e, usedParams: o, isMissingParams: n };
  const a = e.length;
  let i = 0,
    c,
    d = "";
  for (; i < a; ) {
    const u = i;
    c = cn(e, u, c);
    const h = c[5];
    if (((i = h + 1), u === h)) continue;
    const p = c[0];
    if (p === 0) {
      d += "/" + e.substring(u, h);
      continue;
    }
    if (p === 2) {
      const f = t._splat;
      ((o._splat = f), (o["*"] = f));
      const g = e.substring(u, c[1]),
        y = e.substring(c[4], h);
      if (!f) {
        ((n = !0), (g || y) && (d += "/" + g + y));
        continue;
      }
      const m = nr("_splat", t, r);
      d += "/" + g + m + y;
      continue;
    }
    if (p === 1) {
      const f = e.substring(c[2], c[3]);
      (!n && !(f in t) && (n = !0), (o[f] = t[f]));
      const g = e.substring(u, c[1]),
        y = e.substring(c[4], h),
        m = nr(f, t, r) ?? "undefined";
      d += "/" + g + m + y;
      continue;
    }
    if (p === 3) {
      const f = e.substring(c[2], c[3]),
        g = t[f];
      if (g == null) continue;
      o[f] = g;
      const y = e.substring(u, c[1]),
        m = e.substring(c[4], h),
        b = nr(f, t, r) ?? "";
      d += "/" + y + b + m;
      continue;
    }
  }
  return (
    e.endsWith("/") && (d += "/"),
    { usedParams: o, interpolatedPath: d || "/", isMissingParams: n }
  );
}
function cs(e, t) {
  const r = encodeURIComponent(e);
  return t?.(r) ?? r;
}
function U(e) {
  return e?.isNotFound === !0;
}
function ha() {
  try {
    return typeof window < "u" && typeof window.sessionStorage == "object"
      ? window.sessionStorage
      : void 0;
  } catch {
    return;
  }
}
const fa = "tsr-scroll-restoration-v1_3";
function pa() {
  const e = ha();
  if (!e) return null;
  let t = {};
  try {
    const s = JSON.parse(e.getItem("tsr-scroll-restoration-v1_3") || "{}");
    qe(s) && (t = s);
  } catch {}
  return {
    get state() {
      return t;
    },
    set: (s) => {
      t = xe(s, t) || t;
    },
    persist: () => {
      try {
        e.setItem(fa, JSON.stringify(t));
      } catch {}
    },
  };
}
const ls = pa(),
  ma = (e) => e.state.__TSR_key || e.href;
function ga(e) {
  const t = [];
  let r;
  for (; (r = e.parentNode); )
    (t.push(`${e.tagName}:nth-child(${Array.prototype.indexOf.call(r.children, e) + 1})`), (e = r));
  return `${t.reverse().join(" > ")}`.toLowerCase();
}
let Lt = !1;
const Ze = "window",
  ds = "data-scroll-restoration-id";
function ba(e, t) {
  if (!ls) return;
  const r = ls;
  if (
    ((e.options.scrollRestoration ?? !1) && (e.isScrollRestoring = !0),
    e.isScrollRestorationSetup || !r)
  )
    return;
  ((e.isScrollRestorationSetup = !0), (Lt = !1));
  const s = e.options.getScrollRestorationKey || ma,
    n = new Map();
  window.history.scrollRestoration = "manual";
  const o = (i) => {
      if (!(Lt || !e.isScrollRestoring))
        if (i.target === document || i.target === window)
          n.set(Ze, { scrollX: window.scrollX || 0, scrollY: window.scrollY || 0 });
        else {
          const c = i.target;
          n.set(c, { scrollX: c.scrollLeft || 0, scrollY: c.scrollTop || 0 });
        }
    },
    a = (i) => {
      if (!e.isScrollRestoring || !i || n.size === 0 || !r) return;
      const c = (r.state[i] ||= {});
      for (const [d, u] of n) {
        let h;
        if (d === Ze) h = Ze;
        else if (d.isConnected) {
          const p = d.getAttribute(ds);
          h = p ? `[${ds}="${p}"]` : ga(d);
        }
        h && (c[h] = u);
      }
    };
  (document.addEventListener("scroll", o, !0),
    e.subscribe("onBeforeLoad", (i) => {
      (a(i.fromLocation ? s(i.fromLocation) : void 0), n.clear());
    }),
    window.addEventListener("pagehide", () => {
      (a(s(e.stores.resolvedLocation.get() ?? e.stores.location.get())), r.persist());
    }),
    e.subscribe("onRendered", (i) => {
      const c = s(i.toLocation),
        d = e.options.scrollRestorationBehavior,
        u = e.options.scrollToTopSelectors;
      if ((n.clear(), !e.resetNextScroll)) {
        e.resetNextScroll = !0;
        return;
      }
      if (
        !(
          typeof e.options.scrollRestoration == "function" &&
          !e.options.scrollRestoration({ location: e.latestLocation })
        )
      ) {
        Lt = !0;
        try {
          const h = e.isScrollRestoring ? r.state[c] : void 0;
          let p = !1;
          if (h)
            for (const f in h) {
              const g = h[f];
              if (!qe(g)) continue;
              const { scrollX: y, scrollY: m } = g;
              if (!(!Number.isFinite(y) || !Number.isFinite(m))) {
                if (f === Ze) (window.scrollTo({ top: m, left: y, behavior: d }), (p = !0));
                else if (f) {
                  let b;
                  try {
                    b = document.querySelector(f);
                  } catch {
                    continue;
                  }
                  b && ((b.scrollLeft = y), (b.scrollTop = m), (p = !0));
                }
              }
            }
          if (!p) {
            const f = e.history.location.hash.slice(1);
            if (f) {
              const g = window.history.state?.__hashScrollIntoViewOptions ?? !0;
              if (g) {
                const y = document.getElementById(f);
                y && y.scrollIntoView(g);
              }
            } else {
              const g = { top: 0, left: 0, behavior: d };
              if ((window.scrollTo(g), u))
                for (const y of u) {
                  if (y === Ze) continue;
                  const m = typeof y == "function" ? y() : document.querySelector(y);
                  m && m.scrollTo(g);
                }
            }
          }
        } finally {
          Lt = !1;
        }
        e.isScrollRestoring && r.set((h) => ((h[c] ||= {}), h));
      }
    }));
}
function fn(e, t = String) {
  const r = new URLSearchParams();
  for (const s in e) {
    const n = e[s];
    n !== void 0 && r.set(s, t(n));
  }
  return r.toString();
}
function or(e) {
  return e ? (e === "false" ? !1 : e === "true" ? !0 : +e * 0 === 0 && +e + "" === e ? +e : e) : "";
}
function ya(e) {
  const t = new URLSearchParams(e),
    r = Object.create(null);
  for (const [s, n] of t.entries()) {
    const o = r[s];
    o == null ? (r[s] = or(n)) : Array.isArray(o) ? o.push(or(n)) : (r[s] = [o, or(n)]);
  }
  return r;
}
const xa = wa(JSON.parse),
  va = Sa(JSON.stringify, JSON.parse);
function wa(e) {
  return (t) => {
    t[0] === "?" && (t = t.substring(1));
    const r = ya(t);
    for (const s in r) {
      const n = r[s];
      if (typeof n == "string")
        try {
          r[s] = e(n);
        } catch {}
    }
    return r;
  };
}
function Sa(e, t) {
  const r = typeof t == "function";
  function s(n) {
    if (typeof n == "object" && n !== null)
      try {
        return e(n);
      } catch {}
    else if (r && typeof n == "string")
      try {
        return (t(n), e(n));
      } catch {}
    return n;
  }
  return (n) => {
    const o = fn(n, s);
    return o ? `?${o}` : "";
  };
}
const Oe = "__root__";
function pn(e) {
  if (
    ((e.statusCode = e.statusCode || e.code || 307),
    !e._builtLocation && !e.reloadDocument && typeof e.href == "string")
  )
    try {
      (new URL(e.href), (e.reloadDocument = !0));
    } catch {}
  const t = new Headers(e.headers);
  e.href && t.get("Location") === null && t.set("Location", e.href);
  const r = new Response(null, { status: e.statusCode, headers: t });
  if (((r.options = e), e.throw)) throw r;
  return r;
}
function q(e) {
  return e instanceof Response && !!e.options;
}
function mn(e) {
  if (e !== null && typeof e == "object" && e.isSerializedRedirect) return pn(e);
}
function Ra(e) {
  return {
    input: ({ url: t }) => {
      for (const r of e) t = yr(r, t);
      return t;
    },
    output: ({ url: t }) => {
      for (let r = e.length - 1; r >= 0; r--) t = gn(e[r], t);
      return t;
    },
  };
}
function ka(e) {
  const t = hn(e.basepath),
    r = `/${t}`,
    s = `${r}/`,
    n = e.caseSensitive ? r : r.toLowerCase(),
    o = e.caseSensitive ? s : s.toLowerCase();
  return {
    input: ({ url: a }) => {
      const i = e.caseSensitive ? a.pathname : a.pathname.toLowerCase();
      return (
        i === n ? (a.pathname = "/") : i.startsWith(o) && (a.pathname = a.pathname.slice(r.length)),
        a
      );
    },
    output: ({ url: a }) => ((a.pathname = Ot(["/", t, a.pathname])), a),
  };
}
function yr(e, t) {
  const r = e?.input?.({ url: t });
  if (r) {
    if (typeof r == "string") return new URL(r);
    if (r instanceof URL) return r;
  }
  return t;
}
function gn(e, t) {
  const r = e?.output?.({ url: t });
  if (r) {
    if (typeof r == "string") return new URL(r);
    if (r instanceof URL) return r;
  }
  return t;
}
function _a(e, t) {
  const { createMutableStore: r, createReadonlyStore: s, batch: n, init: o } = t,
    a = new Map(),
    i = new Map(),
    c = new Map(),
    d = r(e.status),
    u = r(e.loadedAt),
    h = r(e.isLoading),
    p = r(e.isTransitioning),
    f = r(e.location),
    g = r(e.resolvedLocation),
    y = r(e.statusCode),
    m = r(e.redirect),
    b = r([]),
    v = r([]),
    S = r([]),
    w = s(() => ar(a, b.get())),
    C = s(() => ar(i, v.get())),
    L = s(() => ar(c, S.get())),
    k = s(() => b.get()[0]),
    R = s(() => b.get().some((K) => a.get(K)?.get().status === "pending")),
    P = s(() => ({
      locationHref: f.get().href,
      resolvedLocationHref: g.get()?.href,
      status: d.get(),
    })),
    j = s(() => ({
      status: d.get(),
      loadedAt: u.get(),
      isLoading: h.get(),
      isTransitioning: p.get(),
      matches: w.get(),
      location: f.get(),
      resolvedLocation: g.get(),
      statusCode: y.get(),
      redirect: m.get(),
    })),
    I = ht(64);
  function O(K) {
    let fe = I.get(K);
    return (
      fe ||
        ((fe = s(() => {
          const Ke = b.get();
          for (const De of Ke) {
            const le = a.get(De);
            if (le && le.routeId === K) return le.get();
          }
        })),
        I.set(K, fe)),
      fe
    );
  }
  const Z = {
    status: d,
    loadedAt: u,
    isLoading: h,
    isTransitioning: p,
    location: f,
    resolvedLocation: g,
    statusCode: y,
    redirect: m,
    matchesId: b,
    pendingIds: v,
    cachedIds: S,
    matches: w,
    pendingMatches: C,
    cachedMatches: L,
    firstId: k,
    hasPending: R,
    matchRouteDeps: P,
    matchStores: a,
    pendingMatchStores: i,
    cachedMatchStores: c,
    __store: j,
    getRouteMatchStore: O,
    setMatches: G,
    setPending: X,
    setCached: ke,
  };
  (G(e.matches), o?.(Z));
  function G(K) {
    ir(K, a, b, r, n);
  }
  function X(K) {
    ir(K, i, v, r, n);
  }
  function ke(K) {
    ir(K, c, S, r, n);
  }
  return Z;
}
function ar(e, t) {
  const r = [];
  for (const s of t) {
    const n = e.get(s);
    n && r.push(n.get());
  }
  return r;
}
function ir(e, t, r, s, n) {
  const o = e.map((i) => i.id),
    a = new Set(o);
  n(() => {
    for (const i of t.keys()) a.has(i) || t.delete(i);
    for (const i of e) {
      const c = t.get(i.id);
      if (!c) {
        const d = s(i);
        ((d.routeId = i.routeId), t.set(i.id, d));
        continue;
      }
      ((c.routeId = i.routeId), c.get() !== i && c.set(i));
    }
    Xo(r.get(), o) || r.set(o);
  });
}
const xr = (e) => {
    if (!e.rendered) return ((e.rendered = !0), e.onReady?.());
  },
  Ca = (e) =>
    e.stores.matchesId.get().some((t) => e.stores.matchStores.get(t)?.get()._forcePending),
  Gt = (e, t) => !!(e.preload && !e.router.stores.matchStores.has(t)),
  Ee = (e, t, r = !0) => {
    const s = { ...(e.router.options.context ?? {}) },
      n = r ? t : t - 1;
    for (let o = 0; o <= n; o++) {
      const a = e.matches[o];
      if (!a) continue;
      const i = e.router.getMatch(a.id);
      i && Object.assign(s, i.__routeContext, i.__beforeLoadContext);
    }
    return s;
  },
  us = (e, t) => {
    if (!e.matches.length) return;
    const r = t.routeId,
      s = e.matches.findIndex((a) => a.routeId === e.router.routeTree.id),
      n = s >= 0 ? s : 0;
    let o = r
      ? e.matches.findIndex((a) => a.routeId === r)
      : (e.firstBadMatchIndex ?? e.matches.length - 1);
    o < 0 && (o = n);
    for (let a = o; a >= 0; a--) {
      const i = e.matches[a];
      if (e.router.looseRoutesById[i.routeId].options.notFoundComponent) return a;
    }
    return r ? o : n;
  },
  Se = (e, t, r) => {
    if (!(!q(r) && !U(r)))
      throw (
        (q(r) && r.redirectHandled && !r.options.reloadDocument) ||
          (t &&
            (t._nonReactive.beforeLoadPromise?.resolve(),
            t._nonReactive.loaderPromise?.resolve(),
            (t._nonReactive.beforeLoadPromise = void 0),
            (t._nonReactive.loaderPromise = void 0),
            (t._nonReactive.error = r),
            e.updateMatch(t.id, (s) => ({
              ...s,
              status: q(r)
                ? "redirected"
                : U(r)
                  ? "notFound"
                  : s.status === "pending"
                    ? "success"
                    : s.status,
              context: Ee(e, t.index),
              isFetching: !1,
              error: r,
            })),
            U(r) && !r.routeId && (r.routeId = t.routeId),
            t._nonReactive.loadPromise?.resolve()),
          q(r) &&
            ((e.rendered = !0),
            (r.options._fromLocation = e.location),
            (r.redirectHandled = !0),
            (r = e.router.resolveRedirect(r)))),
        r
      );
  },
  bn = (e, t) => {
    const r = e.router.getMatch(t);
    return !!(!r || r._nonReactive.dehydrated);
  },
  hs = (e, t, r) => {
    const s = Ee(e, r);
    e.updateMatch(t, (n) => ({ ...n, context: s }));
  },
  et = (e, t, r, s) => {
    const { id: n, routeId: o } = e.matches[t],
      a = e.router.looseRoutesById[o];
    if (r instanceof Promise) throw r;
    ((r.routerCode = s), (e.firstBadMatchIndex ??= t), Se(e, e.router.getMatch(n), r));
    try {
      a.options.onError?.(r);
    } catch (i) {
      ((r = i), Se(e, e.router.getMatch(n), r));
    }
    (e.updateMatch(
      n,
      (i) => (
        i._nonReactive.beforeLoadPromise?.resolve(),
        (i._nonReactive.beforeLoadPromise = void 0),
        i._nonReactive.loadPromise?.resolve(),
        {
          ...i,
          error: r,
          status: "error",
          isFetching: !1,
          updatedAt: Date.now(),
          abortController: new AbortController(),
        }
      ),
    ),
      !e.preload && !q(r) && !U(r) && (e.serialError ??= r));
  },
  yn = (e, t, r, s) => {
    if (s._nonReactive.pendingTimeout !== void 0) return;
    const n = r.options.pendingMs ?? e.router.options.defaultPendingMs;
    if (
      e.onReady &&
      !Gt(e, t) &&
      (r.options.loader || r.options.beforeLoad || vn(r)) &&
      typeof n == "number" &&
      n !== 1 / 0 &&
      (r.options.pendingComponent ?? e.router.options?.defaultPendingComponent)
    ) {
      const o = setTimeout(() => {
        xr(e);
      }, n);
      s._nonReactive.pendingTimeout = o;
    }
  },
  Pa = (e, t, r) => {
    const s = e.router.getMatch(t);
    if (!s._nonReactive.beforeLoadPromise && !s._nonReactive.loaderPromise) return;
    yn(e, t, r, s);
    const n = () => {
      const o = e.router.getMatch(t);
      o.preload && (o.status === "redirected" || o.status === "notFound") && Se(e, o, o.error);
    };
    return s._nonReactive.beforeLoadPromise ? s._nonReactive.beforeLoadPromise.then(n) : n();
  },
  La = (e, t, r, s) => {
    const n = e.router.getMatch(t);
    let o = n._nonReactive.loadPromise;
    n._nonReactive.loadPromise = Ae(() => {
      (o?.resolve(), (o = void 0));
    });
    const { paramsError: a, searchError: i } = n;
    (a && et(e, r, a, "PARSE_PARAMS"), i && et(e, r, i, "VALIDATE_SEARCH"), yn(e, t, s, n));
    const c = new AbortController();
    let d = !1;
    const u = () => {
        d ||
          ((d = !0),
          e.updateMatch(t, (w) => ({
            ...w,
            isFetching: "beforeLoad",
            fetchCount: w.fetchCount + 1,
            abortController: c,
          })));
      },
      h = () => {
        (n._nonReactive.beforeLoadPromise?.resolve(),
          (n._nonReactive.beforeLoadPromise = void 0),
          e.updateMatch(t, (w) => ({ ...w, isFetching: !1 })));
      };
    if (!s.options.beforeLoad) {
      e.router.batch(() => {
        (u(), h());
      });
      return;
    }
    n._nonReactive.beforeLoadPromise = Ae();
    const p = { ...Ee(e, r, !1), ...n.__routeContext },
      { search: f, params: g, cause: y } = n,
      m = Gt(e, t),
      b = {
        search: f,
        abortController: c,
        params: g,
        preload: m,
        context: p,
        location: e.location,
        navigate: (w) => e.router.navigate({ ...w, _fromLocation: e.location }),
        buildLocation: e.router.buildLocation,
        cause: m ? "preload" : y,
        matches: e.matches,
        routeId: s.id,
        ...e.router.options.additionalContext,
      },
      v = (w) => {
        if (w === void 0) {
          e.router.batch(() => {
            (u(), h());
          });
          return;
        }
        ((q(w) || U(w)) && (u(), et(e, r, w, "BEFORE_LOAD")),
          e.router.batch(() => {
            (u(), e.updateMatch(t, (C) => ({ ...C, __beforeLoadContext: w })), h());
          }));
      };
    let S;
    try {
      if (((S = s.options.beforeLoad(b)), ut(S)))
        return (
          u(),
          S.catch((w) => {
            et(e, r, w, "BEFORE_LOAD");
          }).then(v)
        );
    } catch (w) {
      (u(), et(e, r, w, "BEFORE_LOAD"));
    }
    v(S);
  },
  Ta = (e, t) => {
    const { id: r, routeId: s } = e.matches[t],
      n = e.router.looseRoutesById[s],
      o = () => i(),
      a = () => La(e, r, t, n),
      i = () => {
        if (bn(e, r)) return;
        const c = Pa(e, r, n);
        return ut(c) ? c.then(a) : a();
      };
    return o();
  },
  Ia = (e, t, r) => {
    const s = e.router.getMatch(t);
    if (!s || (!r.options.head && !r.options.scripts && !r.options.headers)) return;
    const n = {
      ssr: e.router.options.ssr,
      matches: e.matches,
      match: s,
      params: s.params,
      loaderData: s.loaderData,
    };
    return Promise.all([r.options.head?.(n), r.options.scripts?.(n), r.options.headers?.(n)]).then(
      ([o, a, i]) => ({
        meta: o?.meta,
        links: o?.links,
        headScripts: o?.scripts,
        headers: i,
        scripts: a,
        styles: o?.styles,
      }),
    );
  },
  xn = (e, t, r, s, n) => {
    const o = t[s - 1],
      { params: a, loaderDeps: i, abortController: c, cause: d } = e.router.getMatch(r),
      u = Ee(e, s),
      h = Gt(e, r);
    return {
      params: a,
      deps: i,
      preload: !!h,
      parentMatchPromise: o,
      abortController: c,
      context: u,
      location: e.location,
      navigate: (p) => e.router.navigate({ ...p, _fromLocation: e.location }),
      cause: h ? "preload" : d,
      route: n,
      ...e.router.options.additionalContext,
    };
  },
  fs = async (e, t, r, s, n) => {
    try {
      const o = e.router.getMatch(r);
      try {
        (!(sn ?? e.router.isServer) || o.ssr === !0) && ft(n);
        const a = n.options.loader,
          i = typeof a == "function" ? a : a?.handler,
          c = i?.(xn(e, t, r, s, n)),
          d = !!i && ut(c);
        if (
          ((d ||
            n._lazyPromise ||
            n._componentsPromise ||
            n.options.head ||
            n.options.scripts ||
            n.options.headers ||
            o._nonReactive.minPendingPromise) &&
            e.updateMatch(r, (h) => ({ ...h, isFetching: "loader" })),
          i)
        ) {
          const h = d ? await c : c;
          (Se(e, e.router.getMatch(r), h),
            h !== void 0 && e.updateMatch(r, (p) => ({ ...p, loaderData: h })));
        }
        n._lazyPromise && (await n._lazyPromise);
        const u = o._nonReactive.minPendingPromise;
        (u && (await u),
          n._componentsPromise && (await n._componentsPromise),
          e.updateMatch(r, (h) => ({
            ...h,
            error: void 0,
            context: Ee(e, s),
            status: "success",
            isFetching: !1,
            updatedAt: Date.now(),
          })));
      } catch (a) {
        let i = a;
        if (i?.name === "AbortError") {
          if (o.abortController.signal.aborted) {
            (o._nonReactive.loaderPromise?.resolve(), (o._nonReactive.loaderPromise = void 0));
            return;
          }
          e.updateMatch(r, (d) => ({
            ...d,
            status: d.status === "pending" ? "success" : d.status,
            isFetching: !1,
            context: Ee(e, s),
          }));
          return;
        }
        const c = o._nonReactive.minPendingPromise;
        (c && (await c),
          U(a) && (await n.options.notFoundComponent?.preload?.()),
          Se(e, e.router.getMatch(r), a));
        try {
          n.options.onError?.(a);
        } catch (d) {
          ((i = d), Se(e, e.router.getMatch(r), d));
        }
        (!q(i) && !U(i) && (await ft(n, ["errorComponent"])),
          e.updateMatch(r, (d) => ({
            ...d,
            error: i,
            context: Ee(e, s),
            status: "error",
            isFetching: !1,
          })));
      }
    } catch (o) {
      const a = e.router.getMatch(r);
      (a && (a._nonReactive.loaderPromise = void 0), Se(e, a, o));
    }
  },
  ja = async (e, t, r) => {
    async function s(f, g, y, m, b) {
      const v = Date.now() - g.updatedAt,
        S = f
          ? (b.options.preloadStaleTime ?? e.router.options.defaultPreloadStaleTime ?? 3e4)
          : (b.options.staleTime ?? e.router.options.defaultStaleTime ?? 0),
        w = b.options.shouldReload,
        C = typeof w == "function" ? w(xn(e, t, n, r, b)) : w,
        { status: L, invalid: k } = m,
        R = v >= S && (!!e.forceStaleReload || m.cause === "enter" || (y !== void 0 && y !== m.id));
      ((a = L === "success" && (k || (C ?? R))),
        (f && b.options.preload === !1) ||
          (a && !e.sync && u
            ? ((i = !0),
              (async () => {
                try {
                  await fs(e, t, n, r, b);
                  const P = e.router.getMatch(n);
                  (P._nonReactive.loaderPromise?.resolve(),
                    P._nonReactive.loadPromise?.resolve(),
                    (P._nonReactive.loaderPromise = void 0),
                    (P._nonReactive.loadPromise = void 0));
                } catch (P) {
                  q(P) && (await e.router.navigate(P.options));
                }
              })())
            : L !== "success" || a
              ? await fs(e, t, n, r, b)
              : hs(e, n, r)));
    }
    const { id: n, routeId: o } = e.matches[r];
    let a = !1,
      i = !1;
    const c = e.router.looseRoutesById[o],
      d = c.options.loader,
      u =
        ((typeof d == "function" ? void 0 : d?.staleReloadMode) ??
          e.router.options.defaultStaleReloadMode) !== "blocking";
    if (bn(e, n)) {
      if (!e.router.getMatch(n)) return e.matches[r];
      hs(e, n, r);
    } else {
      const f = e.router.getMatch(n),
        g = e.router.stores.matchesId.get()[r],
        y =
          ((g && e.router.stores.matchStores.get(g)) || null)?.routeId === o
            ? g
            : e.router.stores.matches.get().find((b) => b.routeId === o)?.id,
        m = Gt(e, n);
      if (f._nonReactive.loaderPromise) {
        if (f.status === "success" && !e.sync && !f.preload && u) return f;
        await f._nonReactive.loaderPromise;
        const b = e.router.getMatch(n),
          v = b._nonReactive.error || b.error;
        (v && Se(e, b, v), b.status === "pending" && (await s(m, f, y, b, c)));
      } else {
        const b = m && !e.router.stores.matchStores.has(n),
          v = e.router.getMatch(n);
        ((v._nonReactive.loaderPromise = Ae()),
          b !== v.preload && e.updateMatch(n, (S) => ({ ...S, preload: b })),
          await s(m, f, y, v, c));
      }
    }
    const h = e.router.getMatch(n);
    (i ||
      (h._nonReactive.loaderPromise?.resolve(),
      h._nonReactive.loadPromise?.resolve(),
      (h._nonReactive.loadPromise = void 0)),
      clearTimeout(h._nonReactive.pendingTimeout),
      (h._nonReactive.pendingTimeout = void 0),
      i || (h._nonReactive.loaderPromise = void 0),
      (h._nonReactive.dehydrated = void 0));
    const p = i ? h.isFetching : !1;
    return p !== h.isFetching || h.invalid !== !1
      ? (e.updateMatch(n, (f) => ({ ...f, isFetching: p, invalid: !1 })), e.router.getMatch(n))
      : h;
  };
async function ps(e) {
  const t = e,
    r = [];
  Ca(t.router) && xr(t);
  let s;
  for (let p = 0; p < t.matches.length; p++) {
    try {
      const f = Ta(t, p);
      ut(f) && (await f);
    } catch (f) {
      if (q(f)) throw f;
      if (U(f)) s = f;
      else if (!t.preload) throw f;
      break;
    }
    if (t.serialError || t.firstBadMatchIndex != null) break;
  }
  const n = t.firstBadMatchIndex ?? t.matches.length,
    o = s && !t.preload ? us(t, s) : void 0,
    a = s && t.preload ? 0 : o !== void 0 ? Math.min(o + 1, n) : n;
  let i, c;
  for (let p = 0; p < a; p++) r.push(ja(t, r, p));
  try {
    await Promise.all(r);
  } catch {
    const p = await Promise.allSettled(r);
    for (const f of p) {
      if (f.status !== "rejected") continue;
      const g = f.reason;
      if (q(g)) throw g;
      U(g) ? (i ??= g) : (c ??= g);
    }
    if (c !== void 0) throw c;
  }
  const d = i ?? (s && !t.preload ? s : void 0);
  let u = t.firstBadMatchIndex !== void 0 ? t.firstBadMatchIndex : t.matches.length - 1;
  if (!d && s && t.preload) return t.matches;
  if (d) {
    const p = us(t, d);
    p === void 0 && Q();
    const f = t.matches[p],
      g = t.router.looseRoutesById[f.routeId],
      y = t.router.options?.defaultNotFoundComponent;
    (!g.options.notFoundComponent && y && (g.options.notFoundComponent = y),
      (d.routeId = f.routeId));
    const m = f.routeId === t.router.routeTree.id;
    (t.updateMatch(f.id, (b) => ({
      ...b,
      ...(m
        ? { status: "success", globalNotFound: !0, error: void 0 }
        : { status: "notFound", error: d }),
      isFetching: !1,
    })),
      (u = p),
      await ft(g, ["notFoundComponent"]));
  } else if (!t.preload) {
    const p = t.matches[0];
    p.globalNotFound ||
      (t.router.getMatch(p.id)?.globalNotFound &&
        t.updateMatch(p.id, (f) => ({ ...f, globalNotFound: !1, error: void 0 })));
  }
  if (t.serialError && t.firstBadMatchIndex !== void 0) {
    const p = t.router.looseRoutesById[t.matches[t.firstBadMatchIndex].routeId];
    await ft(p, ["errorComponent"]);
  }
  for (let p = 0; p <= u; p++) {
    const { id: f, routeId: g } = t.matches[p],
      y = t.router.looseRoutesById[g];
    try {
      const m = Ia(t, f, y);
      if (m) {
        const b = await m;
        t.updateMatch(f, (v) => ({ ...v, ...b }));
      }
    } catch (m) {
      console.error(`Error executing head for route ${g}:`, m);
    }
  }
  const h = xr(t);
  if ((ut(h) && (await h), d)) throw d;
  if (t.serialError && !t.preload && !t.onReady) throw t.serialError;
  return t.matches;
}
function ms(e, t) {
  const r = t.map((s) => e.options[s]?.preload?.()).filter(Boolean);
  if (r.length !== 0) return Promise.all(r);
}
function ft(e, t = Et) {
  !e._lazyLoaded &&
    e._lazyPromise === void 0 &&
    (e.lazyFn
      ? (e._lazyPromise = e.lazyFn().then((s) => {
          const { id: n, ...o } = s.options;
          (Object.assign(e.options, o), (e._lazyLoaded = !0), (e._lazyPromise = void 0));
        }))
      : (e._lazyLoaded = !0));
  const r = () =>
    e._componentsLoaded
      ? void 0
      : t === Et
        ? (() => {
            if (e._componentsPromise === void 0) {
              const s = ms(e, Et);
              s
                ? (e._componentsPromise = s.then(() => {
                    ((e._componentsLoaded = !0), (e._componentsPromise = void 0));
                  }))
                : (e._componentsLoaded = !0);
            }
            return e._componentsPromise;
          })()
        : ms(e, t);
  return e._lazyPromise ? e._lazyPromise.then(r) : r();
}
function vn(e) {
  for (const t of Et) if (e.options[t]?.preload) return !0;
  return !1;
}
const Et = ["component", "errorComponent", "pendingComponent", "notFoundComponent"];
var Re = "__TSR_index",
  gs = "popstate",
  bs = "beforeunload";
function Oa(e) {
  let t = e.getLocation();
  const r = new Set(),
    s = (a) => {
      ((t = e.getLocation()), r.forEach((i) => i({ location: t, action: a })));
    },
    n = (a) => {
      (e.notifyOnIndexChange ?? !0) ? s(a) : (t = e.getLocation());
    },
    o = async ({ task: a, navigateOpts: i, ...c }) => {
      if (i?.ignoreBlocker ?? !1) {
        a();
        return;
      }
      const d = e.getBlockers?.() ?? [],
        u = c.type === "PUSH" || c.type === "REPLACE";
      if (typeof document < "u" && d.length && u)
        for (const h of d) {
          const p = Ft(c.path, c.state);
          if (await h.blockerFn({ currentLocation: t, nextLocation: p, action: c.type })) {
            e.onBlocked?.();
            return;
          }
        }
      a();
    };
  return {
    get location() {
      return t;
    },
    get length() {
      return e.getLength();
    },
    subscribers: r,
    subscribe: (a) => (
      r.add(a),
      () => {
        r.delete(a);
      }
    ),
    push: (a, i, c) => {
      const d = t.state[Re];
      ((i = ys(d + 1, i)),
        o({
          task: () => {
            (e.pushState(a, i), s({ type: "PUSH" }));
          },
          navigateOpts: c,
          type: "PUSH",
          path: a,
          state: i,
        }));
    },
    replace: (a, i, c) => {
      const d = t.state[Re];
      ((i = ys(d, i)),
        o({
          task: () => {
            (e.replaceState(a, i), s({ type: "REPLACE" }));
          },
          navigateOpts: c,
          type: "REPLACE",
          path: a,
          state: i,
        }));
    },
    go: (a, i) => {
      o({
        task: () => {
          (e.go(a), n({ type: "GO", index: a }));
        },
        navigateOpts: i,
        type: "GO",
      });
    },
    back: (a) => {
      o({
        task: () => {
          (e.back(a?.ignoreBlocker ?? !1), n({ type: "BACK" }));
        },
        navigateOpts: a,
        type: "BACK",
      });
    },
    forward: (a) => {
      o({
        task: () => {
          (e.forward(a?.ignoreBlocker ?? !1), n({ type: "FORWARD" }));
        },
        navigateOpts: a,
        type: "FORWARD",
      });
    },
    canGoBack: () => t.state[Re] !== 0,
    createHref: (a) => e.createHref(a),
    block: (a) => {
      if (!e.setBlockers) return () => {};
      const i = e.getBlockers?.() ?? [];
      return (
        e.setBlockers([...i, a]),
        () => {
          const c = e.getBlockers?.() ?? [];
          e.setBlockers?.(c.filter((d) => d !== a));
        }
      );
    },
    flush: () => e.flush?.(),
    destroy: () => e.destroy?.(),
    notify: s,
  };
}
function ys(e, t) {
  t || (t = {});
  const r = Ar();
  return { ...t, key: r, __TSR_key: r, [Re]: e };
}
function Ea(e) {
  const t = typeof document < "u" ? window : void 0,
    r = t.history.pushState,
    s = t.history.replaceState;
  let n = [];
  const o = () => n,
    a = (R) => (n = R),
    i = (R) => R,
    c = () => Ft(`${t.location.pathname}${t.location.search}${t.location.hash}`, t.history.state);
  if (!t.history.state?.__TSR_key && !t.history.state?.key) {
    const R = Ar();
    t.history.replaceState({ [Re]: 0, key: R, __TSR_key: R }, "");
  }
  let d = c(),
    u,
    h = !1,
    p = !1,
    f = !1,
    g = !1;
  const y = () => d;
  let m, b;
  const v = () => {
      m &&
        ((k._ignoreSubscribers = !0),
        (m.isPush ? t.history.pushState : t.history.replaceState)(m.state, "", m.href),
        (k._ignoreSubscribers = !1),
        (m = void 0),
        (b = void 0),
        (u = void 0));
    },
    S = (R, P, j) => {
      const I = i(P);
      (b || (u = d),
        (d = Ft(P, j)),
        (m = { href: I, state: j, isPush: m?.isPush || R === "push" }),
        b || (b = Promise.resolve().then(() => v())));
    },
    w = (R) => {
      ((d = c()), k.notify({ type: R }));
    },
    C = async () => {
      if (p) {
        p = !1;
        return;
      }
      const R = c(),
        P = R.state[Re] - d.state[Re],
        j = P === 1,
        I = P === -1,
        O = (!j && !I) || h;
      h = !1;
      const Z = O ? "GO" : I ? "BACK" : "FORWARD",
        G = O ? { type: "GO", index: P } : { type: I ? "BACK" : "FORWARD" };
      if (f) f = !1;
      else {
        const X = o();
        if (typeof document < "u" && X.length) {
          for (const ke of X)
            if (await ke.blockerFn({ currentLocation: d, nextLocation: R, action: Z })) {
              ((p = !0), t.history.go(1), k.notify(G));
              return;
            }
        }
      }
      ((d = c()), k.notify(G));
    },
    L = (R) => {
      if (g) {
        g = !1;
        return;
      }
      let P = !1;
      const j = o();
      if (typeof document < "u" && j.length)
        for (const I of j) {
          const O = I.enableBeforeUnload ?? !0;
          if (O === !0) {
            P = !0;
            break;
          }
          if (typeof O == "function" && O() === !0) {
            P = !0;
            break;
          }
        }
      if (P) return (R.preventDefault(), (R.returnValue = ""));
    },
    k = Oa({
      getLocation: y,
      getLength: () => t.history.length,
      pushState: (R, P) => S("push", R, P),
      replaceState: (R, P) => S("replace", R, P),
      back: (R) => (R && (f = !0), (g = !0), t.history.back()),
      forward: (R) => {
        (R && (f = !0), (g = !0), t.history.forward());
      },
      go: (R) => {
        ((h = !0), t.history.go(R));
      },
      createHref: (R) => i(R),
      flush: v,
      destroy: () => {
        ((t.history.pushState = r),
          (t.history.replaceState = s),
          t.removeEventListener(bs, L, { capture: !0 }),
          t.removeEventListener(gs, C));
      },
      onBlocked: () => {
        u && d !== u && (d = u);
      },
      getBlockers: o,
      setBlockers: a,
      notifyOnIndexChange: !1,
    });
  return (
    t.addEventListener(bs, L, { capture: !0 }),
    t.addEventListener(gs, C),
    (t.history.pushState = function (...R) {
      const P = r.apply(t.history, R);
      return (k._ignoreSubscribers || w("PUSH"), P);
    }),
    (t.history.replaceState = function (...R) {
      const P = s.apply(t.history, R);
      return (k._ignoreSubscribers || w("REPLACE"), P);
    }),
    k
  );
}
function Na(e) {
  let t = e.replace(/[\x00-\x1f\x7f]/g, "");
  return (t.startsWith("//") && (t = "/" + t.replace(/^\/+/, "")), t);
}
function Ft(e, t) {
  const r = Na(e),
    s = r.indexOf("#"),
    n = r.indexOf("?"),
    o = Ar();
  return {
    href: r,
    pathname: r.substring(0, s > 0 ? (n > 0 ? Math.min(s, n) : s) : n > 0 ? n : r.length),
    hash: s > -1 ? r.substring(s) : "",
    search: n > -1 ? r.slice(n, s === -1 ? void 0 : s) : "",
    state: t || { [Re]: 0, key: o, __TSR_key: o },
  };
}
function Ar() {
  return (Math.random() + 1).toString(36).substring(7);
}
function Aa(e) {
  return e instanceof Error ? { name: e.name, message: e.message } : { data: e };
}
function Ge(e, t) {
  const r = t,
    s = e;
  return {
    fromLocation: r,
    toLocation: s,
    pathChanged: r?.pathname !== s.pathname,
    hrefChanged: r?.href !== s.href,
    hashChanged: r?.hash !== s.hash,
  };
}
var Ma = class {
    constructor(e, t) {
      ((this.tempLocationKey = `${Math.round(Math.random() * 1e7)}`),
        (this.resetNextScroll = !0),
        (this.shouldViewTransition = void 0),
        (this.isViewTransitionTypesSupported = void 0),
        (this.subscribers = new Set()),
        (this.isScrollRestoring = !1),
        (this.isScrollRestorationSetup = !1),
        (this.routeBranchCache = new WeakMap()),
        (this.startTransition = (r) => r()),
        (this.update = (r) => {
          const s = this.options,
            n = this.basepath ?? s?.basepath ?? "/",
            o = this.basepath === void 0,
            a = s?.rewrite;
          if (
            ((this.options = { ...s, ...r }),
            (this.isServer = this.options.isServer ?? typeof document > "u"),
            (this.protocolAllowlist = new Set(this.options.protocolAllowlist)),
            this.options.pathParamsAllowedCharacters &&
              (this.pathParamsDecoder = ua(this.options.pathParamsAllowedCharacters)),
            (!this.history || (this.options.history && this.options.history !== this.history)) &&
              (this.options.history
                ? (this.history = this.options.history)
                : (this.history = Ea())),
            (this.origin = this.options.origin),
            this.origin ||
              (window?.origin && window.origin !== "null"
                ? (this.origin = window.origin)
                : (this.origin = "http://localhost")),
            this.history && this.updateLatestLocation(),
            this.options.routeTree !== this.routeTree)
          ) {
            this.routeTree = this.options.routeTree;
            let u;
            ((this.resolvePathCache = ht(1e3)), (u = this.buildRouteTree()), this.setRoutes(u));
          }
          if (!this.stores && this.latestLocation) {
            const u = this.getStoreConfig(this);
            ((this.batch = u.batch), (this.stores = _a(Fa(this.latestLocation), u)), ba(this));
          }
          let i = !1;
          const c = this.options.basepath ?? "/",
            d = this.options.rewrite;
          if (o || n !== c || a !== d) {
            this.basepath = c;
            const u = [],
              h = hn(c);
            (h && h !== "/" && u.push(ka({ basepath: c })),
              d && u.push(d),
              (this.rewrite = u.length === 0 ? void 0 : u.length === 1 ? u[0] : Ra(u)),
              this.history && this.updateLatestLocation(),
              (i = !0));
          }
          (i && this.stores && this.stores.location.set(this.latestLocation),
            typeof window < "u" &&
              "CSS" in window &&
              typeof window.CSS?.supports == "function" &&
              (this.isViewTransitionTypesSupported = window.CSS.supports(
                "selector(:active-view-transition-type(a))",
              )));
        }),
        (this.updateLatestLocation = () => {
          this.latestLocation = this.parseLocation(this.history.location, this.latestLocation);
        }),
        (this.buildRouteTree = () => {
          const r = oa(this.routeTree, this.options.caseSensitive, (s, n) => {
            s.init({ originalIndex: n });
          });
          return (this.options.routeMasks && ea(this.options.routeMasks, r.processedTree), r);
        }),
        (this.subscribe = (r, s) => {
          const n = { eventType: r, fn: s };
          return (
            this.subscribers.add(n),
            () => {
              this.subscribers.delete(n);
            }
          );
        }),
        (this.emit = (r) => {
          this.subscribers.forEach((s) => {
            s.eventType === r.type && s.fn(r);
          });
        }),
        (this.parseLocation = (r, s) => {
          const n = ({ pathname: c, search: d, hash: u, href: h, state: p }) => {
              if (!this.rewrite && !/[ \x00-\x1f\x7f\u0080-\uffff]/.test(c)) {
                const b = this.options.parseSearch(d),
                  v = this.options.stringifySearch(b);
                return {
                  href: c + v + u,
                  publicHref: c + v + u,
                  pathname: Xe(c).path,
                  external: !1,
                  searchStr: v,
                  search: Le(s?.search, b),
                  hash: Xe(u.slice(1)).path,
                  state: ve(s?.state, p),
                };
              }
              const f = new URL(h, this.origin),
                g = yr(this.rewrite, f),
                y = this.options.parseSearch(g.search),
                m = this.options.stringifySearch(y);
              return (
                (g.search = m),
                {
                  href: g.href.replace(g.origin, ""),
                  publicHref: h,
                  pathname: Xe(g.pathname).path,
                  external: !!this.rewrite && g.origin !== this.origin,
                  searchStr: m,
                  search: Le(s?.search, y),
                  hash: Xe(g.hash.slice(1)).path,
                  state: ve(s?.state, p),
                }
              );
            },
            o = n(r),
            { __tempLocation: a, __tempKey: i } = o.state;
          if (a && (!i || i === this.tempLocationKey)) {
            const c = n(a);
            return (
              (c.state.key = o.state.key),
              (c.state.__TSR_key = o.state.__TSR_key),
              delete c.state.__tempLocation,
              { ...c, maskedLocation: o }
            );
          }
          return o;
        }),
        (this.resolvePathWithBase = (r, s) =>
          da({
            base: r,
            to: s.includes("//") ? Nr(s) : s,
            trailingSlash: this.options.trailingSlash,
            cache: this.resolvePathCache,
          })),
        (this.matchRoutes = (r, s, n) =>
          typeof r == "string"
            ? this.matchRoutesInternal({ pathname: r, search: s }, n)
            : this.matchRoutesInternal(r, s)),
        (this.getMatchedRoutes = (r) =>
          Ba({ pathname: r, routesById: this.routesById, processedTree: this.processedTree })),
        (this.cancelMatch = (r) => {
          const s = this.getMatch(r);
          s &&
            (s.abortController.abort(),
            clearTimeout(s._nonReactive.pendingTimeout),
            (s._nonReactive.pendingTimeout = void 0));
        }),
        (this.cancelMatches = () => {
          (this.stores.pendingIds.get().forEach((r) => {
            this.cancelMatch(r);
          }),
            this.stores.matchesId.get().forEach((r) => {
              if (this.stores.pendingMatchStores.has(r)) return;
              const s = this.stores.matchStores.get(r)?.get();
              s && (s.status === "pending" || s.isFetching === "loader") && this.cancelMatch(r);
            }));
        }),
        (this.buildLocation = (r) => {
          const s = (o = {}) => {
              const a = o._fromLocation || this.pendingBuiltLocation || this.latestLocation,
                i = this.matchRoutesLightweight(a);
              o.from;
              const c = o.unsafeRelative === "path" ? a.pathname : (o.from ?? i.fullPath),
                d = o.to ? `${o.to}` : void 0,
                u = i.search,
                h = Object.assign(Object.create(null), i.params),
                p = d?.charCodeAt(0) === 47 ? "/" : this.resolvePathWithBase(c, "."),
                f = d ? this.resolvePathWithBase(p, d) : p,
                g =
                  o.params === !1 || o.params === null
                    ? Object.create(null)
                    : (o.params ?? !0) === !0
                      ? h
                      : Object.assign(h, xe(o.params, h)),
                y = this.routesByPath[he(f)];
              let m;
              if (y) m = this.getRouteBranch(y);
              else if (f.includes("$")) m = [];
              else {
                const I = this.getMatchedRoutes(f);
                ((m = I.matchedRoutes),
                  this.options.notFoundRoute &&
                    (!I.foundRoute || (I.foundRoute.path !== "/" && I.routeParams["**"])) &&
                    (m = [...m, this.options.notFoundRoute]));
              }
              if (m.length && on(g))
                for (const I of m) {
                  const O = I.options.params?.stringify ?? I.options.stringifyParams;
                  if (O)
                    try {
                      Object.assign(g, O(g));
                    } catch {}
                }
              const b = r.leaveParams
                ? f
                : Xe(
                    is({
                      path: f,
                      params: g,
                      decoder: this.pathParamsDecoder,
                      server: this.isServer,
                    }).interpolatedPath,
                  ).path;
              let v = u;
              if (r._includeValidateSearch && this.options.search?.strict) {
                const I = {};
                (m.forEach((O) => {
                  if (O.options.validateSearch)
                    try {
                      Object.assign(I, Nt(O.options.validateSearch, { ...I, ...v }));
                    } catch {}
                }),
                  (v = I));
              }
              ((v = $a({
                search: v,
                dest: o,
                destRoutes: m,
                _includeValidateSearch: r._includeValidateSearch,
              })),
                (v = Le(u, v)));
              const S = this.options.stringifySearch(v),
                w = o.hash === !0 ? a.hash : o.hash ? xe(o.hash, a.hash) : void 0,
                C = w ? `#${w}` : "";
              let L = o.state === !0 ? a.state : o.state ? xe(o.state, a.state) : {};
              L = ve(a.state, L);
              const k = `${b}${S}${C}`;
              let R,
                P,
                j = !1;
              if (this.rewrite) {
                const I = new URL(k, this.origin),
                  O = gn(this.rewrite, I);
                ((R = I.href.replace(I.origin, "")),
                  O.origin !== this.origin
                    ? ((P = O.href), (j = !0))
                    : (P = O.pathname + O.search + O.hash));
              } else ((R = Qo(k)), (P = R));
              return {
                publicHref: P,
                href: R,
                pathname: b,
                search: v,
                searchStr: S,
                state: L,
                hash: w ?? "",
                external: j,
                unmaskOnReload: o.unmaskOnReload,
              };
            },
            n = (o = {}, a) => {
              const i = s(o);
              let c = a ? s(a) : void 0;
              if (!c) {
                const d = Object.create(null);
                if (this.options.routeMasks) {
                  const u = ta(i.pathname, this.processedTree);
                  if (u) {
                    Object.assign(d, u.rawParams);
                    const { from: h, params: p, ...f } = u.route,
                      g =
                        p === !1 || p === null
                          ? Object.create(null)
                          : (p ?? !0) === !0
                            ? d
                            : Object.assign(d, xe(p, d));
                    ((a = { from: r.from, ...f, params: g }), (c = s(a)));
                  }
                }
              }
              return (c && (i.maskedLocation = c), i);
            };
          return r.mask ? n(r, { from: r.from, ...r.mask }) : n(r);
        }),
        (this.commitLocation = async ({ viewTransition: r, ignoreBlocker: s, ...n }) => {
          const o = () => {
              const c = ["key", "__TSR_key", "__TSR_index", "__hashScrollIntoViewOptions"];
              c.forEach((u) => {
                n.state[u] = this.latestLocation.state[u];
              });
              const d = J(n.state, this.latestLocation.state);
              return (
                c.forEach((u) => {
                  delete n.state[u];
                }),
                d
              );
            },
            a = he(this.latestLocation.href) === he(n.href);
          let i = this.commitLocationPromise;
          if (
            ((this.commitLocationPromise = Ae(() => {
              (i?.resolve(), (i = void 0));
            })),
            a && o())
          )
            this.load();
          else {
            let { maskedLocation: c, hashScrollIntoView: d, ...u } = n;
            (c &&
              ((u = {
                ...c,
                state: {
                  ...c.state,
                  __tempKey: void 0,
                  __tempLocation: {
                    ...u,
                    search: u.searchStr,
                    state: {
                      ...u.state,
                      __tempKey: void 0,
                      __tempLocation: void 0,
                      __TSR_key: void 0,
                      key: void 0,
                    },
                  },
                },
              }),
              (u.unmaskOnReload ?? this.options.unmaskOnReload ?? !1) &&
                (u.state.__tempKey = this.tempLocationKey)),
              (u.state.__hashScrollIntoViewOptions =
                d ?? this.options.defaultHashScrollIntoView ?? !0),
              (this.shouldViewTransition = r),
              this.history[n.replace ? "replace" : "push"](u.publicHref, u.state, {
                ignoreBlocker: s,
              }));
          }
          return (
            (this.resetNextScroll = n.resetScroll ?? !0),
            this.history.subscribers.size || this.load(),
            this.commitLocationPromise
          );
        }),
        (this.buildAndCommitLocation = ({
          replace: r,
          resetScroll: s,
          hashScrollIntoView: n,
          viewTransition: o,
          ignoreBlocker: a,
          href: i,
          ...c
        } = {}) => {
          if (i) {
            const h = this.history.location.state.__TSR_index,
              p = Ft(i, { __TSR_index: r ? h : h + 1 }),
              f = new URL(p.pathname, this.origin);
            ((c.to = yr(this.rewrite, f).pathname),
              (c.search = this.options.parseSearch(p.search)),
              (c.hash = p.hash.slice(1)));
          }
          const d = this.buildLocation({ ...c, _includeValidateSearch: !0 });
          this.pendingBuiltLocation = d;
          const u = this.commitLocation({
            ...d,
            viewTransition: o,
            replace: r,
            resetScroll: s,
            hashScrollIntoView: n,
            ignoreBlocker: a,
          });
          return (
            Promise.resolve().then(() => {
              this.pendingBuiltLocation === d && (this.pendingBuiltLocation = void 0);
            }),
            u
          );
        }),
        (this.navigate = async ({ to: r, reloadDocument: s, href: n, publicHref: o, ...a }) => {
          let i = !1;
          if (n)
            try {
              (new URL(`${n}`), (i = !0));
            } catch {}
          if ((i && !s && (s = !0), s)) {
            if (r !== void 0 || !n) {
              const d = this.buildLocation({ to: r, ...a });
              ((n = n ?? d.publicHref), (o = o ?? d.publicHref));
            }
            const c = !i && o ? o : n;
            if (Mt(c, this.protocolAllowlist)) return Promise.resolve();
            if (!a.ignoreBlocker) {
              const d = this.history.getBlockers?.() ?? [];
              for (const u of d)
                if (
                  u?.blockerFn &&
                  (await u.blockerFn({
                    currentLocation: this.latestLocation,
                    nextLocation: this.latestLocation,
                    action: "PUSH",
                  }))
                )
                  return Promise.resolve();
            }
            return (
              a.replace ? window.location.replace(c) : (window.location.href = c),
              Promise.resolve()
            );
          }
          return this.buildAndCommitLocation({ ...a, href: n, to: r, _isNavigate: !0 });
        }),
        (this.beforeLoad = () => {
          (this.cancelMatches(), this.updateLatestLocation());
          const r = this.matchRoutes(this.latestLocation),
            s = this.stores.cachedMatches.get().filter((n) => !r.some((o) => o.id === n.id));
          this.batch(() => {
            (this.stores.status.set("pending"),
              this.stores.statusCode.set(200),
              this.stores.isLoading.set(!0),
              this.stores.location.set(this.latestLocation),
              this.stores.setPending(r),
              this.stores.setCached(s));
          });
        }),
        (this.load = async (r) => {
          let s, n, o;
          const a = this.stores.resolvedLocation.get() ?? this.stores.location.get();
          for (
            o = new Promise((c) => {
              this.startTransition(async () => {
                try {
                  this.beforeLoad();
                  const d = this.latestLocation,
                    u = Ge(d, this.stores.resolvedLocation.get());
                  (this.stores.redirect.get() || this.emit({ type: "onBeforeNavigate", ...u }),
                    this.emit({ type: "onBeforeLoad", ...u }),
                    await ps({
                      router: this,
                      sync: r?.sync,
                      forceStaleReload: a.href === d.href,
                      matches: this.stores.pendingMatches.get(),
                      location: d,
                      updateMatch: this.updateMatch,
                      onReady: async () => {
                        this.startTransition(() => {
                          this.startViewTransition(async () => {
                            let h = null,
                              p = null,
                              f = null,
                              g = null;
                            this.batch(() => {
                              const y = this.stores.pendingMatches.get(),
                                m = y.length,
                                b = this.stores.matches.get();
                              h = m
                                ? b.filter((w) => !this.stores.pendingMatchStores.has(w.id))
                                : null;
                              const v = new Set();
                              for (const w of this.stores.pendingMatchStores.values())
                                w.routeId && v.add(w.routeId);
                              const S = new Set();
                              for (const w of this.stores.matchStores.values())
                                w.routeId && S.add(w.routeId);
                              ((p = m ? b.filter((w) => !v.has(w.routeId)) : null),
                                (f = m ? y.filter((w) => !S.has(w.routeId)) : null),
                                (g = m ? y.filter((w) => S.has(w.routeId)) : b),
                                this.stores.isLoading.set(!1),
                                this.stores.loadedAt.set(Date.now()),
                                m &&
                                  (this.stores.setMatches(y),
                                  this.stores.setPending([]),
                                  this.stores.setCached([
                                    ...this.stores.cachedMatches.get(),
                                    ...h.filter(
                                      (w) =>
                                        w.status !== "error" &&
                                        w.status !== "notFound" &&
                                        w.status !== "redirected",
                                    ),
                                  ]),
                                  this.clearExpiredCache()));
                            });
                            for (const [y, m] of [
                              [p, "onLeave"],
                              [f, "onEnter"],
                              [g, "onStay"],
                            ])
                              if (y)
                                for (const b of y) this.looseRoutesById[b.routeId].options[m]?.(b);
                          });
                        });
                      },
                    }));
                } catch (d) {
                  q(d)
                    ? ((s = d), this.navigate({ ...s.options, replace: !0, ignoreBlocker: !0 }))
                    : U(d) && (n = d);
                  const u = s
                    ? s.status
                    : n
                      ? 404
                      : this.stores.matches.get().some((h) => h.status === "error")
                        ? 500
                        : 200;
                  this.batch(() => {
                    (this.stores.statusCode.set(u), this.stores.redirect.set(s));
                  });
                }
                (this.latestLoadPromise === o &&
                  (this.commitLocationPromise?.resolve(),
                  (this.latestLoadPromise = void 0),
                  (this.commitLocationPromise = void 0)),
                  c());
              });
            }),
              this.latestLoadPromise = o,
              await o;
            this.latestLoadPromise && o !== this.latestLoadPromise;
          )
            await this.latestLoadPromise;
          let i;
          (this.hasNotFoundMatch()
            ? (i = 404)
            : this.stores.matches.get().some((c) => c.status === "error") && (i = 500),
            i !== void 0 && this.stores.statusCode.set(i));
        }),
        (this.startViewTransition = (r) => {
          const s = this.shouldViewTransition ?? this.options.defaultViewTransition;
          if (
            ((this.shouldViewTransition = void 0),
            s &&
              typeof document < "u" &&
              "startViewTransition" in document &&
              typeof document.startViewTransition == "function")
          ) {
            let n;
            if (typeof s == "object" && this.isViewTransitionTypesSupported) {
              const o = this.latestLocation,
                a = this.stores.resolvedLocation.get(),
                i = typeof s.types == "function" ? s.types(Ge(o, a)) : s.types;
              if (i === !1) {
                r();
                return;
              }
              n = { update: r, types: i };
            } else n = r;
            document.startViewTransition(n);
          } else r();
        }),
        (this.updateMatch = (r, s) => {
          this.startTransition(() => {
            const n = this.stores.pendingMatchStores.get(r);
            if (n) {
              n.set(s);
              return;
            }
            const o = this.stores.matchStores.get(r);
            if (o) {
              o.set(s);
              return;
            }
            const a = this.stores.cachedMatchStores.get(r);
            if (a) {
              const i = s(a.get());
              i.status === "redirected"
                ? this.stores.cachedMatchStores.delete(r) &&
                  this.stores.cachedIds.set((c) => c.filter((d) => d !== r))
                : a.set(i);
            }
          });
        }),
        (this.getMatch = (r) =>
          this.stores.cachedMatchStores.get(r)?.get() ??
          this.stores.pendingMatchStores.get(r)?.get() ??
          this.stores.matchStores.get(r)?.get()),
        (this.invalidate = (r) => {
          const s = (n) =>
            (r?.filter?.(n) ?? !0)
              ? {
                  ...n,
                  invalid: !0,
                  ...(r?.forcePending || n.status === "error" || n.status === "notFound"
                    ? { status: "pending", error: void 0 }
                    : void 0),
                }
              : n;
          return (
            this.batch(() => {
              (this.stores.setMatches(this.stores.matches.get().map(s)),
                this.stores.setCached(this.stores.cachedMatches.get().map(s)),
                this.stores.setPending(this.stores.pendingMatches.get().map(s)));
            }),
            (this.shouldViewTransition = !1),
            this.load({ sync: r?.sync })
          );
        }),
        (this.getParsedLocationHref = (r) => r.publicHref || "/"),
        (this.resolveRedirect = (r) => {
          const s = r.headers.get("Location");
          if (!r.options.href || r.options._builtLocation) {
            const n = r.options._builtLocation ?? this.buildLocation(r.options),
              o = this.getParsedLocationHref(n);
            ((r.options.href = o), r.headers.set("Location", o));
          } else if (s)
            try {
              const n = new URL(s);
              if (this.origin && n.origin === this.origin) {
                const o = n.pathname + n.search + n.hash;
                ((r.options.href = o), r.headers.set("Location", o));
              }
            } catch {}
          if (
            r.options.href &&
            !r.options._builtLocation &&
            Mt(r.options.href, this.protocolAllowlist)
          )
            throw new Error("Redirect blocked: unsafe protocol");
          return (r.headers.get("Location") || r.headers.set("Location", r.options.href), r);
        }),
        (this.clearCache = (r) => {
          const s = r?.filter;
          s !== void 0
            ? this.stores.setCached(this.stores.cachedMatches.get().filter((n) => !s(n)))
            : this.stores.setCached([]);
        }),
        (this.clearExpiredCache = () => {
          const r = Date.now(),
            s = (n) => {
              const o = this.looseRoutesById[n.routeId];
              if (!o.options.loader) return !0;
              const a =
                (n.preload
                  ? (o.options.preloadGcTime ?? this.options.defaultPreloadGcTime)
                  : (o.options.gcTime ?? this.options.defaultGcTime)) ?? 300 * 1e3;
              return n.status === "error" ? !0 : r - n.updatedAt >= a;
            };
          this.clearCache({ filter: s });
        }),
        (this.loadRouteChunk = ft),
        (this.preloadRoute = async (r) => {
          const s = r._builtLocation ?? this.buildLocation(r);
          let n = this.matchRoutes(s, { throwOnError: !0, preload: !0, dest: r });
          const o = new Set([...this.stores.matchesId.get(), ...this.stores.pendingIds.get()]),
            a = new Set([...o, ...this.stores.cachedIds.get()]),
            i = n.filter((c) => !a.has(c.id));
          if (i.length) {
            const c = this.stores.cachedMatches.get();
            this.stores.setCached([...c, ...i]);
          }
          try {
            return (
              (n = await ps({
                router: this,
                matches: n,
                location: s,
                preload: !0,
                updateMatch: (c, d) => {
                  o.has(c) ? (n = n.map((u) => (u.id === c ? d(u) : u))) : this.updateMatch(c, d);
                },
              })),
              n
            );
          } catch (c) {
            if (q(c))
              return c.options.reloadDocument
                ? void 0
                : await this.preloadRoute({ ...c.options, _fromLocation: s });
            U(c) || console.error(c);
            return;
          }
        }),
        (this.matchRoute = (r, s) => {
          const n = {
              ...r,
              to: r.to ? this.resolvePathWithBase(r.from || "", r.to) : void 0,
              params: r.params || {},
              leaveParams: !0,
            },
            o = this.buildLocation(n);
          if (s?.pending && this.stores.status.get() !== "pending") return !1;
          const a = (s?.pending === void 0 ? !this.stores.isLoading.get() : s.pending)
              ? this.latestLocation
              : this.stores.resolvedLocation.get() || this.stores.location.get(),
            i = ra(
              o.pathname,
              s?.caseSensitive ?? !1,
              s?.fuzzy ?? !1,
              a.pathname,
              this.processedTree,
            );
          return !i || (r.params && !J(i.rawParams, r.params, { partial: !0 }))
            ? !1
            : (s?.includeSearch ?? !0)
              ? J(a.search, o.search, { partial: !0 })
                ? i.rawParams
                : !1
              : i.rawParams;
        }),
        (this.hasNotFoundMatch = () =>
          this.stores.matches.get().some((r) => r.status === "notFound" || r.globalNotFound)),
        (this.getStoreConfig = t),
        this.update({
          defaultPreloadDelay: 50,
          defaultPendingMs: 1e3,
          defaultPendingMinMs: 500,
          context: void 0,
          ...e,
          caseSensitive: e.caseSensitive ?? !1,
          notFoundMode: e.notFoundMode ?? "fuzzy",
          stringifySearch: e.stringifySearch ?? va,
          parseSearch: e.parseSearch ?? xa,
          protocolAllowlist: e.protocolAllowlist ?? Ko,
        }),
        typeof document < "u" && (self.__TSR_ROUTER__ = this));
    }
    isShell() {
      return !!this.options.isShell;
    }
    isPrerendering() {
      return !!this.options.isPrerendering;
    }
    get state() {
      return this.stores.__store.get();
    }
    setRoutes({ routesById: e, routesByPath: t, processedTree: r }) {
      ((this.routesById = e), (this.routesByPath = t), (this.processedTree = r));
      const s = this.options.notFoundRoute;
      s && (s.init({ originalIndex: 99999999999 }), (this.routesById[s.id] = s));
    }
    getRouteBranch(e) {
      let t = this.routeBranchCache.get(e);
      return (t || ((t = dn(e)), this.routeBranchCache.set(e, t)), t);
    }
    get looseRoutesById() {
      return this.routesById;
    }
    getParentContext(e) {
      return e?.id
        ? (e.context ?? this.options.context ?? void 0)
        : (this.options.context ?? void 0);
    }
    matchRoutesInternal(e, t) {
      const r = this.getMatchedRoutes(e.pathname),
        { foundRoute: s, routeParams: n } = r;
      let { matchedRoutes: o } = r,
        a = !1;
      (s ? s.path !== "/" && n["**"] : he(e.pathname)) &&
        (this.options.notFoundRoute ? (o = [...o, this.options.notFoundRoute]) : (a = !0));
      const i = a ? Wa(this.options.notFoundMode, o) : void 0,
        c = new Array(o.length),
        d = new Map();
      for (const u of this.stores.matchStores.values()) u.routeId && d.set(u.routeId, u.get());
      for (let u = 0; u < o.length; u++) {
        const h = o[u],
          p = c[u - 1];
        let f, g, y;
        {
          const O = p?.search ?? e.search,
            Z = p?._strictSearch ?? void 0;
          try {
            const G = Nt(h.options.validateSearch, { ...O }) ?? void 0;
            ((f = { ...O, ...G }), (g = { ...Z, ...G }), (y = void 0));
          } catch (G) {
            let X = G;
            if ((G instanceof Bt || (X = new Bt(G.message, { cause: G })), t?.throwOnError))
              throw X;
            ((f = O), (g = {}), (y = X));
          }
        }
        const m = h.options.loaderDeps?.({ search: f }) ?? "",
          b = m ? JSON.stringify(m) : "",
          { interpolatedPath: v, usedParams: S } = is({
            path: h.fullPath,
            params: n,
            decoder: this.pathParamsDecoder,
            server: this.isServer,
          }),
          w = h.id + v + b,
          C = this.getMatch(w),
          L = d.get(h.id),
          k = C?._strictParams ?? S;
        let R;
        if (!C)
          try {
            xs(h, k);
          } catch (O) {
            if ((U(O) || q(O) ? (R = O) : (R = new Da(O.message, { cause: O })), t?.throwOnError))
              throw R;
          }
        Object.assign(n, k);
        const P = L ? "stay" : "enter";
        let j;
        if (C)
          j = {
            ...C,
            cause: P,
            params: L?.params ?? n,
            _strictParams: k,
            search: Le(L ? L.search : C.search, f),
            _strictSearch: g,
          };
        else {
          const O =
            h.options.loader || h.options.beforeLoad || h.lazyFn || vn(h) ? "pending" : "success";
          j = {
            id: w,
            ssr: h.options.ssr,
            index: u,
            routeId: h.id,
            params: L?.params ?? n,
            _strictParams: k,
            pathname: v,
            updatedAt: Date.now(),
            search: L ? Le(L.search, f) : f,
            _strictSearch: g,
            searchError: void 0,
            status: O,
            isFetching: !1,
            error: void 0,
            paramsError: R,
            __routeContext: void 0,
            _nonReactive: { loadPromise: Ae() },
            __beforeLoadContext: void 0,
            context: {},
            abortController: new AbortController(),
            fetchCount: 0,
            cause: P,
            loaderDeps: L ? ve(L.loaderDeps, m) : m,
            invalid: !1,
            preload: !1,
            links: void 0,
            scripts: void 0,
            headScripts: void 0,
            meta: void 0,
            staticData: h.options.staticData || {},
            fullPath: h.fullPath,
          };
        }
        (t?.preload || (j.globalNotFound = i === h.id), (j.searchError = y));
        const I = this.getParentContext(p);
        ((j.context = { ...I, ...j.__routeContext, ...j.__beforeLoadContext }), (c[u] = j));
      }
      for (let u = 0; u < c.length; u++) {
        const h = c[u],
          p = this.looseRoutesById[h.routeId],
          f = this.getMatch(h.id),
          g = d.get(h.routeId);
        if (((h.params = g ? Le(g.params, n) : n), !f)) {
          const y = c[u - 1],
            m = this.getParentContext(y);
          if (p.options.context) {
            const b = {
              deps: h.loaderDeps,
              params: h.params,
              context: m ?? {},
              location: e,
              navigate: (v) => this.navigate({ ...v, _fromLocation: e }),
              buildLocation: this.buildLocation,
              cause: h.cause,
              abortController: h.abortController,
              preload: !!h.preload,
              matches: c,
              routeId: p.id,
            };
            h.__routeContext = p.options.context(b) ?? void 0;
          }
          h.context = { ...m, ...h.__routeContext, ...h.__beforeLoadContext };
        }
      }
      return c;
    }
    matchRoutesLightweight(e) {
      const { matchedRoutes: t, routeParams: r } = this.getMatchedRoutes(e.pathname),
        s = dt(t),
        n = { ...e.search };
      for (const d of t)
        try {
          Object.assign(n, Nt(d.options.validateSearch, n));
        } catch {}
      const o = dt(this.stores.matchesId.get()),
        a = o && this.stores.matchStores.get(o)?.get(),
        i = a && a.routeId === s.id && a.pathname === e.pathname;
      let c;
      if (i) c = a.params;
      else {
        const d = Object.assign(Object.create(null), r);
        for (const u of t)
          try {
            xs(u, d);
          } catch {}
        c = d;
      }
      return { matchedRoutes: t, fullPath: s.fullPath, search: n, params: c };
    }
  },
  Bt = class extends Error {},
  Da = class extends Error {};
function Fa(e) {
  return {
    loadedAt: 0,
    isLoading: !1,
    isTransitioning: !1,
    status: "idle",
    resolvedLocation: void 0,
    location: e,
    matches: [],
    statusCode: 200,
  };
}
function Nt(e, t) {
  if (e == null) return {};
  if ("~standard" in e) {
    const r = e["~standard"].validate(t);
    if (r instanceof Promise) throw new Bt("Async validation not supported");
    if (r.issues) throw new Bt(JSON.stringify(r.issues, void 0, 2), { cause: r });
    return r.value;
  }
  return "parse" in e ? e.parse(t) : typeof e == "function" ? e(t) : {};
}
function Ba({ pathname: e, routesById: t, processedTree: r }) {
  const s = Object.create(null),
    n = he(e);
  let o;
  const a = sa(n, r, !0);
  return (
    a && ((o = a.route), Object.assign(s, a.rawParams)),
    { matchedRoutes: a?.branch || [t.__root__], routeParams: s, foundRoute: o }
  );
}
function $a({ search: e, dest: t, destRoutes: r, _includeValidateSearch: s }) {
  return Ua(r)(e, t, s ?? !1);
}
function Ua(e) {
  const t = { dest: null, _includeValidateSearch: !1, middlewares: [] };
  for (const n of e) {
    if ("search" in n.options)
      n.options.search?.middlewares && t.middlewares.push(...n.options.search.middlewares);
    else if (n.options.preSearchFilters || n.options.postSearchFilters) {
      const o = ({ search: a, next: i }) => {
        let c = a;
        "preSearchFilters" in n.options &&
          n.options.preSearchFilters &&
          (c = n.options.preSearchFilters.reduce((u, h) => h(u), a));
        const d = i(c);
        return "postSearchFilters" in n.options && n.options.postSearchFilters
          ? n.options.postSearchFilters.reduce((u, h) => h(u), d)
          : d;
      };
      t.middlewares.push(o);
    }
    if (n.options.validateSearch) {
      const o = ({ search: a, next: i }) => {
        const c = i(a);
        if (!t._includeValidateSearch) return c;
        try {
          return { ...c, ...(Nt(n.options.validateSearch, c) ?? void 0) };
        } catch {
          return c;
        }
      };
      t.middlewares.push(o);
    }
  }
  const r = ({ search: n }) => {
    const o = t.dest;
    return o.search ? (o.search === !0 ? n : xe(o.search, n)) : {};
  };
  t.middlewares.push(r);
  const s = (n, o, a) => {
    if (n >= a.length) return o;
    const i = a[n];
    return i({ search: o, next: (d) => s(n + 1, d, a) });
  };
  return function (o, a, i) {
    return ((t.dest = a), (t._includeValidateSearch = i), s(0, o, t.middlewares));
  };
}
function Wa(e, t) {
  if (e !== "root")
    for (let r = t.length - 1; r >= 0; r--) {
      const s = t[r];
      if (s.children) return s.id;
    }
  return Oe;
}
function xs(e, t) {
  const r = e.options.params?.parse ?? e.options.parseParams;
  if (r) {
    const s = r(t);
    if (s === !1) throw new Error("Route params.parse returned false for a matched route");
    Object.assign(t, s);
  }
}
const ie = Symbol.for("TSR_DEFERRED_PROMISE");
function Ha(e, t) {
  const r = e;
  return (
    r[ie] ||
      ((r[ie] = { status: "pending" }),
      r
        .then((s) => {
          ((r[ie].status = "success"), (r[ie].data = s));
        })
        .catch((s) => {
          ((r[ie].status = "error"), (r[ie].error = { data: Aa(s), __isServerError: !0 }));
        })),
    r
  );
}
const za = "Error preloading route! ☝️";
function vs(e, t) {
  if (e) return typeof e == "string" ? e : e[t];
}
function Ga(e) {
  return typeof e == "string" ? { href: e, crossOrigin: void 0 } : e;
}
function qa(e) {
  if (e.tag !== "link") return;
  const t = e.attrs?.rel,
    r = e.attrs?.href;
  if (typeof r == "string" && (typeof t == "string" ? t.split(/\s+/) : []).includes("stylesheet"))
    return r;
}
function Ka(e, t) {
  const r = qa(t);
  return !!r && e?.inlineCss?.styles[r] !== void 0;
}
var wn = class {
    get to() {
      return this._to;
    }
    get id() {
      return this._id;
    }
    get path() {
      return this._path;
    }
    get fullPath() {
      return this._fullPath;
    }
    constructor(e) {
      if (
        ((this.init = (t) => {
          this.originalIndex = t.originalIndex;
          const r = this.options,
            s = !r?.path && !r?.id;
          ((this.parentRoute = this.options.getParentRoute?.()),
            s ? (this._path = Oe) : this.parentRoute || Q());
          let n = s ? Oe : r?.path;
          n && n !== "/" && (n = un(n));
          const o = r?.id || n;
          let a = s ? Oe : Ot([this.parentRoute.id === "__root__" ? "" : this.parentRoute.id, o]);
          (n === "__root__" && (n = "/"), a !== "__root__" && (a = Ot(["/", a])));
          const i = a === "__root__" ? "/" : Ot([this.parentRoute.fullPath, n]);
          ((this._path = n), (this._id = a), (this._fullPath = i), (this._to = he(i)));
        }),
        (this.addChildren = (t) => this._addFileChildren(t)),
        (this._addFileChildren = (t) => (
          Array.isArray(t) && (this.children = t),
          typeof t == "object" && t !== null && (this.children = Object.values(t)),
          this
        )),
        (this._addFileTypes = () => this),
        (this.updateLoader = (t) => (Object.assign(this.options, t), this)),
        (this.update = (t) => (Object.assign(this.options, t), this)),
        (this.lazy = (t) => ((this.lazyFn = t), this)),
        (this.redirect = (t) => pn({ from: this.fullPath, ...t })),
        (this.options = e || {}),
        (this.isRoot = !e?.getParentRoute),
        e?.id && e?.path)
      )
        throw new Error("Route cannot have both an 'id' and a 'path' option.");
    }
  },
  Va = class extends wn {
    constructor(e) {
      super(e);
    }
  };
function Ya(e) {
  if (typeof document < "u" && document.querySelector) {
    const t = e.stores.location.get(),
      r = t.state.__hashScrollIntoViewOptions ?? !0;
    if (r && t.hash !== "") {
      const s = document.getElementById(t.hash);
      s && s.scrollIntoView(r);
    }
  }
}
function Ja(e) {
  return ze({
    tag: "$TSR/t/" + e.key,
    test: e.test,
    parse: {
      sync(t, r, s) {
        return { v: r.parse(e.toSerializable(t)) };
      },
      async async(t, r, s) {
        return { v: await r.parse(e.toSerializable(t)) };
      },
      stream(t, r, s) {
        return { v: r.parse(e.toSerializable(t)) };
      },
    },
    serialize: void 0,
    deserialize(t, r, s) {
      return e.fromSerializable(r.deserialize(t.v));
    },
  });
}
var Qa = class {
  constructor(e, t) {
    ((this.stream = e), (this.hint = t?.hint ?? "binary"));
  }
};
const $t = globalThis.Buffer,
  Sn = !!$t && typeof $t.from == "function";
function Rn(e) {
  if (e.length === 0) return "";
  if (Sn) return $t.from(e).toString("base64");
  const t = 32768,
    r = [];
  for (let s = 0; s < e.length; s += t) {
    const n = e.subarray(s, s + t);
    r.push(String.fromCharCode.apply(null, n));
  }
  return btoa(r.join(""));
}
function kn(e) {
  if (e.length === 0) return new Uint8Array(0);
  if (Sn) {
    const s = $t.from(e, "base64");
    return new Uint8Array(s.buffer, s.byteOffset, s.byteLength);
  }
  const t = atob(e),
    r = new Uint8Array(t.length);
  for (let s = 0; s < t.length; s++) r[s] = t.charCodeAt(s);
  return r;
}
const tt = Object.create(null),
  rt = Object.create(null),
  Xa = (e) =>
    new ReadableStream({
      start(t) {
        e.on({
          next(r) {
            try {
              t.enqueue(kn(r));
            } catch {}
          },
          throw(r) {
            t.error(r);
          },
          return() {
            try {
              t.close();
            } catch {}
          },
        });
      },
    }),
  Za = new TextEncoder(),
  ei = (e) =>
    new ReadableStream({
      start(t) {
        e.on({
          next(r) {
            try {
              typeof r == "string" ? t.enqueue(Za.encode(r)) : t.enqueue(kn(r.$b64));
            } catch {}
          },
          throw(r) {
            t.error(r);
          },
          return() {
            try {
              t.close();
            } catch {}
          },
        });
      },
    }),
  ti =
    "(s=>new ReadableStream({start(c){s.on({next(b){try{const d=atob(b),a=new Uint8Array(d.length);for(let i=0;i<d.length;i++)a[i]=d.charCodeAt(i);c.enqueue(a)}catch(_){}},throw(e){c.error(e)},return(){try{c.close()}catch(_){}}})}}))",
  ri =
    "(s=>{const e=new TextEncoder();return new ReadableStream({start(c){s.on({next(v){try{if(typeof v==='string'){c.enqueue(e.encode(v))}else{const d=atob(v.$b64),a=new Uint8Array(d.length);for(let i=0;i<d.length;i++)a[i]=d.charCodeAt(i);c.enqueue(a)}}catch(_){}},throw(x){c.error(x)},return(){try{c.close()}catch(_){}}})}})})";
function ws(e) {
  const t = jr(),
    r = e.getReader();
  return (
    (async () => {
      try {
        for (;;) {
          const { done: s, value: n } = await r.read();
          if (s) {
            t.return(void 0);
            break;
          }
          t.next(Rn(n));
        }
      } catch (s) {
        t.throw(s);
      } finally {
        r.releaseLock();
      }
    })(),
    t
  );
}
function Ss(e) {
  const t = jr(),
    r = e.getReader(),
    s = new TextDecoder("utf-8", { fatal: !0 });
  return (
    (async () => {
      try {
        for (;;) {
          const { done: n, value: o } = await r.read();
          if (n) {
            try {
              const a = s.decode();
              a.length > 0 && t.next(a);
            } catch {}
            t.return(void 0);
            break;
          }
          try {
            const a = s.decode(o, { stream: !0 });
            a.length > 0 && t.next(a);
          } catch {
            t.next({ $b64: Rn(o) });
          }
        }
      } catch (n) {
        t.throw(n);
      } finally {
        r.releaseLock();
      }
    })(),
    t
  );
}
const si = ze({
  tag: "tss/RawStream",
  extends: [
    ze({
      tag: "tss/RawStreamFactory",
      test(e) {
        return e === tt;
      },
      parse: {
        sync(e, t, r) {
          return {};
        },
        async async(e, t, r) {
          return {};
        },
        stream(e, t, r) {
          return {};
        },
      },
      serialize(e, t, r) {
        return ti;
      },
      deserialize(e, t, r) {
        return tt;
      },
    }),
    ze({
      tag: "tss/RawStreamFactoryText",
      test(e) {
        return e === rt;
      },
      parse: {
        sync(e, t, r) {
          return {};
        },
        async async(e, t, r) {
          return {};
        },
        stream(e, t, r) {
          return {};
        },
      },
      serialize(e, t, r) {
        return ri;
      },
      deserialize(e, t, r) {
        return rt;
      },
    }),
  ],
  test(e) {
    return e instanceof Qa;
  },
  parse: {
    sync(e, t, r) {
      const s = e.hint === "text" ? rt : tt;
      return { hint: t.parse(e.hint), factory: t.parse(s), stream: t.parse(jr()) };
    },
    async async(e, t, r) {
      const s = e.hint === "text" ? rt : tt,
        n = e.hint === "text" ? Ss(e.stream) : ws(e.stream);
      return { hint: await t.parse(e.hint), factory: await t.parse(s), stream: await t.parse(n) };
    },
    stream(e, t, r) {
      const s = e.hint === "text" ? rt : tt,
        n = e.hint === "text" ? Ss(e.stream) : ws(e.stream);
      return { hint: t.parse(e.hint), factory: t.parse(s), stream: t.parse(n) };
    },
  },
  serialize(e, t, r) {
    return "(" + t.serialize(e.factory) + ")(" + t.serialize(e.stream) + ")";
  },
  deserialize(e, t, r) {
    const s = t.deserialize(e.stream);
    return t.deserialize(e.hint) === "text" ? ei(s) : Xa(s);
  },
});
function ni(e) {
  return ze({
    tag: "tss/RawStream",
    test: () => !1,
    parse: {},
    serialize() {
      throw new Error(
        "RawStreamDeserializePlugin.serialize should not be called. Client only deserializes.",
      );
    },
    deserialize(t, r, s) {
      return e(typeof r?.deserialize == "function" ? r.deserialize(t.streamId) : t.streamId);
    },
  });
}
const oi = ze({
    tag: "$TSR/Error",
    test(e) {
      return e instanceof Error;
    },
    parse: {
      sync(e, t) {
        return { message: t.parse(e.message) };
      },
      async async(e, t) {
        return { message: await t.parse(e.message) };
      },
      stream(e, t) {
        return { message: t.parse(e.message) };
      },
    },
    serialize(e, t) {
      return "new Error(" + t.serialize(e.message) + ")";
    },
    deserialize(e, t) {
      return new Error(t.deserialize(e.message));
    },
  }),
  ai = [oi, si, po];
function ii() {
  return [...(Or()?.serializationAdapters?.map(Ja) ?? []), ...ai];
}
var Rs = new TextDecoder(),
  ci = new Uint8Array(0),
  ks = 16 * 1024 * 1024,
  _s = 32 * 1024 * 1024,
  Cs = 1024,
  Ps = 1e5;
function li(e) {
  const t = new Map(),
    r = new Map(),
    s = new Set();
  let n = !1,
    o = null,
    a = 0,
    i;
  const c = new ReadableStream({
    start(h) {
      i = h;
    },
    cancel() {
      n = !0;
      try {
        o?.cancel();
      } catch {}
      (t.forEach((h) => {
        try {
          h.error(new Error("Framed response cancelled"));
        } catch {}
      }),
        t.clear(),
        r.clear(),
        s.clear());
    },
  });
  function d(h) {
    const p = r.get(h);
    if (p) return p;
    if (s.has(h))
      return new ReadableStream({
        start(g) {
          g.close();
        },
      });
    if (r.size >= Cs) throw new Error(`Too many raw streams in framed response (max ${Cs})`);
    const f = new ReadableStream({
      start(g) {
        t.set(h, g);
      },
      cancel() {
        (s.add(h), t.delete(h), r.delete(h));
      },
    });
    return (r.set(h, f), f);
  }
  function u(h) {
    return (d(h), t.get(h));
  }
  return (
    (async () => {
      const h = e.getReader();
      o = h;
      const p = [];
      let f = 0;
      function g() {
        if (f < 9) return null;
        const m = p[0];
        if (m.length >= 9)
          return {
            type: m[0],
            streamId: ((m[1] << 24) | (m[2] << 16) | (m[3] << 8) | m[4]) >>> 0,
            length: ((m[5] << 24) | (m[6] << 16) | (m[7] << 8) | m[8]) >>> 0,
          };
        const b = new Uint8Array(9);
        let v = 0,
          S = 9;
        for (let w = 0; w < p.length && S > 0; w++) {
          const C = p[w],
            L = Math.min(C.length, S);
          (b.set(C.subarray(0, L), v), (v += L), (S -= L));
        }
        return {
          type: b[0],
          streamId: ((b[1] << 24) | (b[2] << 16) | (b[3] << 8) | b[4]) >>> 0,
          length: ((b[5] << 24) | (b[6] << 16) | (b[7] << 8) | b[8]) >>> 0,
        };
      }
      function y(m) {
        if (m === 0) return ci;
        const b = new Uint8Array(m);
        let v = 0,
          S = m;
        for (; S > 0 && p.length > 0; ) {
          const w = p[0];
          if (!w) break;
          const C = Math.min(w.length, S);
          (b.set(w.subarray(0, C), v),
            (v += C),
            (S -= C),
            C === w.length ? p.shift() : (p[0] = w.subarray(C)));
        }
        return ((f -= m), b);
      }
      try {
        for (;;) {
          const { done: m, value: b } = await h.read();
          if (n || m) break;
          if (b) {
            if (f + b.length > _s) throw new Error(`Framed response buffer exceeded ${_s} bytes`);
            for (p.push(b), f += b.length; ; ) {
              const v = g();
              if (!v) break;
              const { type: S, streamId: w, length: C } = v;
              if (S !== ue.JSON && S !== ue.CHUNK && S !== ue.END && S !== ue.ERROR)
                throw new Error(`Unknown frame type: ${S}`);
              if (S === ue.JSON) {
                if (w !== 0) throw new Error("Invalid JSON frame streamId (expected 0)");
              } else if (w === 0) throw new Error("Invalid raw frame streamId (expected non-zero)");
              if (C > ks) throw new Error(`Frame payload too large: ${C} bytes (max ${ks})`);
              const L = 9 + C;
              if (f < L) break;
              if (++a > Ps) throw new Error(`Too many frames in framed response (max ${Ps})`);
              y(9);
              const k = y(C);
              switch (S) {
                case ue.JSON:
                  try {
                    i.enqueue(Rs.decode(k));
                  } catch {}
                  break;
                case ue.CHUNK: {
                  const R = u(w);
                  R && R.enqueue(k);
                  break;
                }
                case ue.END: {
                  const R = u(w);
                  if ((s.add(w), R)) {
                    try {
                      R.close();
                    } catch {}
                    t.delete(w);
                  }
                  break;
                }
                case ue.ERROR: {
                  const R = u(w);
                  if ((s.add(w), R)) {
                    const P = Rs.decode(k);
                    (R.error(new Error(P)), t.delete(w));
                  }
                  break;
                }
              }
            }
          }
        }
        if (f !== 0) throw new Error("Incomplete frame at end of framed response");
        try {
          i.close();
        } catch {}
        (t.forEach((m) => {
          try {
            m.close();
          } catch {}
        }),
          t.clear());
      } catch (m) {
        try {
          i.error(m);
        } catch {}
        (t.forEach((b) => {
          try {
            b.error(m);
          } catch {}
        }),
          t.clear());
      } finally {
        try {
          h.releaseLock();
        } catch {}
        o = null;
      }
    })(),
    { getOrCreateStream: d, jsonChunks: c }
  );
}
var pt = null;
async function vr(e) {
  e.length > 0 && (await Promise.allSettled(e));
}
var di = Object.prototype.hasOwnProperty;
function _n(e) {
  for (const t in e) if (di.call(e, t)) return !0;
  return !1;
}
async function ui(e, t, r) {
  pt || (pt = ii());
  const s = t[0],
    n = s.fetch ?? r,
    o = s.data instanceof FormData ? "formData" : "payload",
    a = s.headers ? new Headers(s.headers) : new Headers();
  if (
    (a.set("x-tsr-serverFn", "true"),
    o === "payload" && a.set("accept", `${Bo}, application/x-ndjson, application/json`),
    s.method === "GET")
  ) {
    if (o === "formData") throw new Error("FormData is not supported with GET requests");
    const c = await Cn(s);
    if (c !== void 0) {
      const d = fn({ payload: c });
      e.includes("?") ? (e += `&${d}`) : (e += `?${d}`);
    }
  }
  let i;
  if (s.method === "POST") {
    const c = await hi(s);
    (c?.contentType && a.set("content-type", c.contentType), (i = c?.body));
  }
  return await fi(async () => n(e, { method: s.method, headers: a, signal: s.signal, body: i }));
}
async function Cn(e) {
  let t = !1;
  const r = {};
  if (
    (e.data !== void 0 && ((t = !0), (r.data = e.data)),
    e.context && _n(e.context) && ((t = !0), (r.context = e.context)),
    t)
  )
    return Pn(r);
}
async function Pn(e) {
  return JSON.stringify(await Promise.resolve(mo(e, { plugins: pt })));
}
async function hi(e) {
  if (e.data instanceof FormData) {
    let r;
    return (
      e.context && _n(e.context) && (r = await Pn(e.context)),
      r !== void 0 && e.data.set(Fo, r),
      { body: e.data }
    );
  }
  const t = await Cn(e);
  if (t) return { body: t, contentType: "application/json" };
}
async function fi(e) {
  let t;
  try {
    t = await e();
  } catch (s) {
    if (s instanceof Response) t = s;
    else throw (console.log(s), s);
  }
  if (t.headers.get("x-tss-raw") === "true") return t;
  const r = t.headers.get("content-type");
  if ((r || Q(), t.headers.get("x-tss-serialized"))) {
    let s;
    if (r.includes("application/x-tss-framed")) {
      if ((Wo(r), !t.body)) throw new Error("No response body for framed response");
      const { getOrCreateStream: n, jsonChunks: o } = li(t.body),
        a = [ni(n), ...(pt || [])],
        i = new Map();
      s = await pi({
        jsonStream: o,
        onMessage: (c) => Kr(c, { refs: i, plugins: a }),
        onError(c, d) {
          console.error(c, d);
        },
      });
    } else if (r.includes("application/json")) {
      const n = await t.json(),
        o = [];
      ((s = Kr(n, { plugins: pt })), await vr(o));
    }
    if ((s || Q(), s instanceof Error)) throw s;
    return s;
  }
  if (r.includes("application/json")) {
    const s = await t.json(),
      n = mn(s);
    if (n) throw n;
    if (U(s)) throw s;
    return s;
  }
  if (!t.ok) throw new Error(await t.text());
  return t;
}
async function pi({ jsonStream: e, onMessage: t, onError: r }) {
  const s = e.getReader(),
    { value: n, done: o } = await s.read();
  if (o || !n) throw new Error("Stream ended before first object");
  const a = JSON.parse(n);
  let i = !1;
  const c = (async () => {
    try {
      for (;;) {
        const { value: h, done: p } = await s.read();
        if (p) break;
        if (h)
          try {
            const f = [];
            try {
              t(JSON.parse(h));
            } finally {
            }
            await vr(f);
          } catch (f) {
            r?.(`Invalid JSON: ${h}`, f);
          }
      }
    } catch (h) {
      i || r?.("Stream processing error:", h);
    }
  })();
  let d;
  const u = [];
  try {
    d = t(a);
  } catch (h) {
    throw ((i = !0), s.cancel().catch(() => {}), h);
  }
  return (
    await vr(u),
    Promise.resolve(d).catch(() => {
      ((i = !0), s.cancel().catch(() => {}));
    }),
    c.finally(() => {
      try {
        s.releaseLock();
      } catch {}
    }),
    d
  );
}
function B(e) {
  const t = "/_serverFn/" + e;
  return Object.assign(
    (...n) => {
      const o = Or()?.serverFns?.fetch;
      return ui(t, n, o ?? fetch);
    },
    { url: t, serverFnMeta: { id: e }, [br]: !0 },
  );
}
var mi = {
  key: "$TSS/serverfn",
  test: (e) => (typeof e != "function" || !(br in e) ? !1 : !!e[br]),
  toSerializable: ({ serverFnMeta: e }) => ({ functionId: e.id }),
  fromSerializable: ({ functionId: e }) => B(e),
};
function gi(e) {
  return e instanceof Headers
    ? e
    : Array.isArray(e)
      ? new Headers(e)
      : typeof e == "object"
        ? new Headers(e)
        : null;
}
function bi(...e) {
  return e.reduce((t, r) => {
    const s = gi(r);
    if (!s) return t;
    for (const [n, o] of s.entries())
      n === "set-cookie" ? go(o).forEach((a) => t.append("set-cookie", a)) : t.set(n, o);
    return t;
  }, new Headers());
}
function Ls(e) {
  return e.replaceAll("\0", "/").replaceAll("�", "/");
}
function yi(e, t) {
  ((e.id = t.i),
    (e.__beforeLoadContext = t.b),
    (e.loaderData = t.l),
    (e.status = t.s),
    (e.ssr = t.ssr),
    (e.updatedAt = t.u),
    (e.error = t.e),
    t.g !== void 0 && (e.globalNotFound = t.g));
}
async function xi(e) {
  window.$_TSR || Q();
  const t = e.options.serializationAdapters;
  if (t?.length) {
    const m = new Map();
    (t.forEach((b) => {
      m.set(b.key, b.fromSerializable);
    }),
      (window.$_TSR.t = m),
      window.$_TSR.buffer.forEach((b) => b()));
  }
  ((window.$_TSR.initialized = !0), window.$_TSR.router || Q());
  const r = window.$_TSR.router;
  (r.matches.forEach((m) => {
    m.i = Ls(m.i);
  }),
    r.lastMatchId && (r.lastMatchId = Ls(r.lastMatchId)));
  const { manifest: s, dehydratedData: n, lastMatchId: o } = r;
  e.ssr = { manifest: s };
  const a = document.querySelector('meta[property="csp-nonce"]')?.content;
  ((e.options.ssr = { nonce: a }), await e.options.hydrate?.(n));
  const i = e.matchRoutes(e.stores.location.get()),
    c = Promise.all(i.map((m) => e.loadRouteChunk(e.looseRoutesById[m.routeId])));
  function d(m) {
    const b = e.looseRoutesById[m.routeId].options.pendingMinMs ?? e.options.defaultPendingMinMs;
    if (b) {
      const v = Ae();
      ((m._nonReactive.minPendingPromise = v),
        (m._forcePending = !0),
        setTimeout(() => {
          (v.resolve(),
            e.updateMatch(
              m.id,
              (S) => ((S._nonReactive.minPendingPromise = void 0), { ...S, _forcePending: void 0 }),
            ));
        }, b));
    }
  }
  function u(m) {
    const b = e.looseRoutesById[m.routeId];
    b && (b.options.ssr = m.ssr);
  }
  let h;
  (i.forEach((m) => {
    const b = r.matches.find((v) => v.i === m.id);
    if (!b) {
      ((m._nonReactive.dehydrated = !1), (m.ssr = !1), u(m));
      return;
    }
    (yi(m, b),
      u(m),
      (m._nonReactive.dehydrated = m.ssr !== !1),
      (m.ssr === "data-only" || m.ssr === !1) && h === void 0 && ((h = m.index), d(m)));
  }),
    e.stores.setMatches(i));
  const p = e.stores.matches.get(),
    f = e.stores.location.get();
  await Promise.all(
    p.map(async (m) => {
      try {
        const b = e.looseRoutesById[m.routeId],
          v = p[m.index - 1]?.context ?? e.options.context;
        if (b.options.context) {
          const L = {
            deps: m.loaderDeps,
            params: m.params,
            context: v ?? {},
            location: f,
            navigate: (k) => e.navigate({ ...k, _fromLocation: f }),
            buildLocation: e.buildLocation,
            cause: m.cause,
            abortController: m.abortController,
            preload: !1,
            matches: i,
            routeId: b.id,
          };
          m.__routeContext = b.options.context(L) ?? void 0;
        }
        m.context = { ...v, ...m.__routeContext, ...m.__beforeLoadContext };
        const S = {
            ssr: e.options.ssr,
            matches: p,
            match: m,
            params: m.params,
            loaderData: m.loaderData,
          },
          w = await b.options.head?.(S),
          C = await b.options.scripts?.(S);
        ((m.meta = w?.meta),
          (m.links = w?.links),
          (m.headScripts = w?.scripts),
          (m.styles = w?.styles),
          (m.scripts = C));
      } catch (b) {
        if (U(b))
          ((m.error = { isNotFound: !0 }),
            console.error(`NotFound error during hydration for routeId: ${m.routeId}`, b));
        else
          throw (
            (m.error = b),
            console.error(`Error during hydration for route ${m.routeId}:`, b),
            b
          );
      }
    }),
  );
  const g = i[i.length - 1].id !== o;
  if (!i.some((m) => m.ssr === !1) && !g)
    return (
      i.forEach((m) => {
        m._nonReactive.dehydrated = void 0;
      }),
      e.stores.resolvedLocation.set(e.stores.location.get()),
      c
    );
  const y = Promise.resolve()
    .then(() => e.load())
    .catch((m) => {
      console.error("Error during router hydration:", m);
    });
  if (g) {
    const m = i[1];
    (m || Q(),
      d(m),
      (m._displayPending = !0),
      (m._nonReactive.displayPendingPromise = y),
      y.then(() => {
        e.batch(() => {
          (e.stores.status.get() === "pending" &&
            (e.stores.status.set("idle"), e.stores.resolvedLocation.set(e.stores.location.get())),
            e.updateMatch(m.id, (b) => ({
              ...b,
              _displayPending: void 0,
              displayPendingPromise: void 0,
            })));
        });
      }));
  }
  return c;
}
var Ut = x.use,
  ot = typeof window < "u" ? x.useLayoutEffect : x.useEffect;
function cr(e) {
  const t = x.useRef({ value: e, prev: null }),
    r = t.current.value;
  return (e !== r && (t.current = { value: e, prev: r }), t.current.prev);
}
function vi(e, t, r = {}, s = {}) {
  x.useEffect(() => {
    if (!e.current || s.disabled || typeof IntersectionObserver != "function") return;
    const n = new IntersectionObserver(([o]) => {
      t(o);
    }, r);
    return (
      n.observe(e.current),
      () => {
        n.disconnect();
      }
    );
  }, [t, r, s.disabled, e]);
}
function wi(e) {
  const t = x.useRef(null);
  return (x.useImperativeHandle(e, () => t.current, []), t);
}
function Si({ promise: e }) {
  if (Ut) return Ut(e);
  const t = Ha(e);
  if (t[ie].status === "pending") throw t;
  if (t[ie].status === "error") throw t[ie].error;
  return t[ie].data;
}
function Ri(e) {
  const t = l.jsx(ki, { ...e });
  return e.fallback ? l.jsx(x.Suspense, { fallback: e.fallback, children: t }) : t;
}
function ki(e) {
  const t = Si(e);
  return e.children(t);
}
function Mr(e) {
  const t = e.errorComponent ?? Dr;
  return l.jsx(_i, {
    getResetKey: e.getResetKey,
    onCatch: e.onCatch,
    children: ({ error: r, reset: s }) =>
      r ? x.createElement(t, { error: r, reset: s }) : e.children,
  });
}
var _i = class extends x.Component {
  constructor(...e) {
    (super(...e), (this.state = { error: null }));
  }
  static getDerivedStateFromProps(e, t) {
    const r = e.getResetKey();
    return t.error && t.resetKey !== r ? { resetKey: r, error: null } : { resetKey: r };
  }
  static getDerivedStateFromError(e) {
    return { error: e };
  }
  reset() {
    this.setState({ error: null });
  }
  componentDidCatch(e, t) {
    this.props.onCatch && this.props.onCatch(e, t);
  }
  render() {
    return this.props.children({
      error: this.state.error,
      reset: () => {
        this.reset();
      },
    });
  }
};
function Dr({ error: e }) {
  const [t, r] = x.useState(!1);
  return l.jsxs("div", {
    style: { padding: ".5rem", maxWidth: "100%" },
    children: [
      l.jsxs("div", {
        style: { display: "flex", alignItems: "center", gap: ".5rem" },
        children: [
          l.jsx("strong", { style: { fontSize: "1rem" }, children: "Something went wrong!" }),
          l.jsx("button", {
            style: {
              appearance: "none",
              fontSize: ".6em",
              border: "1px solid currentColor",
              padding: ".1rem .2rem",
              fontWeight: "bold",
              borderRadius: ".25rem",
            },
            onClick: () => r((s) => !s),
            children: t ? "Hide Error" : "Show Error",
          }),
        ],
      }),
      l.jsx("div", { style: { height: ".25rem" } }),
      t
        ? l.jsx("div", {
            children: l.jsx("pre", {
              style: {
                fontSize: ".7em",
                border: "1px solid red",
                borderRadius: ".25rem",
                padding: ".3rem",
                color: "red",
                overflow: "auto",
              },
              children: e.message ? l.jsx("code", { children: e.message }) : null,
            }),
          })
        : null,
    ],
  });
}
function Ci({ children: e, fallback: t = null }) {
  return Fr() ? l.jsx(ct.Fragment, { children: e }) : l.jsx(ct.Fragment, { children: t });
}
function Fr() {
  return ct.useSyncExternalStore(
    Pi,
    () => !0,
    () => !1,
  );
}
function Pi() {
  return () => {};
}
var Ln = x.createContext(null);
function D(e) {
  return x.useContext(Ln);
}
var qt = x.createContext(void 0),
  Li = x.createContext(void 0),
  N = ((e) => (
    (e[(e.None = 0)] = "None"),
    (e[(e.Mutable = 1)] = "Mutable"),
    (e[(e.Watching = 2)] = "Watching"),
    (e[(e.RecursedCheck = 4)] = "RecursedCheck"),
    (e[(e.Recursed = 8)] = "Recursed"),
    (e[(e.Dirty = 16)] = "Dirty"),
    (e[(e.Pending = 32)] = "Pending"),
    e
  ))(N || {});
function Ti({ update: e, notify: t, unwatched: r }) {
  return { link: s, unlink: n, propagate: o, checkDirty: a, shallowPropagate: i };
  function s(d, u, h) {
    const p = u.depsTail;
    if (p !== void 0 && p.dep === d) return;
    const f = p !== void 0 ? p.nextDep : u.deps;
    if (f !== void 0 && f.dep === d) {
      ((f.version = h), (u.depsTail = f));
      return;
    }
    const g = d.subsTail;
    if (g !== void 0 && g.version === h && g.sub === u) return;
    const y =
      (u.depsTail =
      d.subsTail =
        { version: h, dep: d, sub: u, prevDep: p, nextDep: f, prevSub: g, nextSub: void 0 });
    (f !== void 0 && (f.prevDep = y),
      p !== void 0 ? (p.nextDep = y) : (u.deps = y),
      g !== void 0 ? (g.nextSub = y) : (d.subs = y));
  }
  function n(d, u = d.sub) {
    const h = d.dep,
      p = d.prevDep,
      f = d.nextDep,
      g = d.nextSub,
      y = d.prevSub;
    return (
      f !== void 0 ? (f.prevDep = p) : (u.depsTail = p),
      p !== void 0 ? (p.nextDep = f) : (u.deps = f),
      g !== void 0 ? (g.prevSub = y) : (h.subsTail = y),
      y !== void 0 ? (y.nextSub = g) : (h.subs = g) === void 0 && r(h),
      f
    );
  }
  function o(d) {
    let u = d.nextSub,
      h;
    e: do {
      const p = d.sub;
      let f = p.flags;
      if (
        (f & 60
          ? f & 12
            ? f & 4
              ? !(f & 48) && c(d, p)
                ? ((p.flags = f | 40), (f &= 1))
                : (f = 0)
              : (p.flags = (f & -9) | 32)
            : (f = 0)
          : (p.flags = f | 32),
        f & 2 && t(p),
        f & 1)
      ) {
        const g = p.subs;
        if (g !== void 0) {
          const y = (d = g).nextSub;
          y !== void 0 && ((h = { value: u, prev: h }), (u = y));
          continue;
        }
      }
      if ((d = u) !== void 0) {
        u = d.nextSub;
        continue;
      }
      for (; h !== void 0; )
        if (((d = h.value), (h = h.prev), d !== void 0)) {
          u = d.nextSub;
          continue e;
        }
      break;
    } while (!0);
  }
  function a(d, u) {
    let h,
      p = 0,
      f = !1;
    e: do {
      const g = d.dep,
        y = g.flags;
      if (u.flags & 16) f = !0;
      else if ((y & 17) === 17) {
        if (e(g)) {
          const m = g.subs;
          (m.nextSub !== void 0 && i(m), (f = !0));
        }
      } else if ((y & 33) === 33) {
        ((d.nextSub !== void 0 || d.prevSub !== void 0) && (h = { value: d, prev: h }),
          (d = g.deps),
          (u = g),
          ++p);
        continue;
      }
      if (!f) {
        const m = d.nextDep;
        if (m !== void 0) {
          d = m;
          continue;
        }
      }
      for (; p--; ) {
        const m = u.subs,
          b = m.nextSub !== void 0;
        if ((b ? ((d = h.value), (h = h.prev)) : (d = m), f)) {
          if (e(u)) {
            (b && i(m), (u = d.sub));
            continue;
          }
          f = !1;
        } else u.flags &= -33;
        u = d.sub;
        const v = d.nextDep;
        if (v !== void 0) {
          d = v;
          continue e;
        }
      }
      return f;
    } while (!0);
  }
  function i(d) {
    do {
      const u = d.sub,
        h = u.flags;
      (h & 48) === 32 && ((u.flags = h | 16), (h & 6) === 2 && t(u));
    } while ((d = d.nextSub) !== void 0);
  }
  function c(d, u) {
    let h = u.depsTail;
    for (; h !== void 0; ) {
      if (h === d) return !0;
      h = h.prevDep;
    }
    return !1;
  }
}
function Ii(e, t, r) {
  const s = typeof e == "object",
    n = s ? e : void 0;
  return {
    next: (s ? e.next : e)?.bind(n),
    error: (s ? e.error : t)?.bind(n),
    complete: (s ? e.complete : r)?.bind(n),
  };
}
const wr = [];
let At = 0;
const {
  link: Ts,
  unlink: ji,
  propagate: Oi,
  checkDirty: Tn,
  shallowPropagate: Is,
} = Ti({
  update(e) {
    return e._update();
  },
  notify(e) {
    ((wr[Sr++] = e), (e.flags &= ~N.Watching));
  },
  unwatched(e) {
    e.depsTail !== void 0 && ((e.depsTail = void 0), (e.flags = N.Mutable | N.Dirty), Wt(e));
  },
});
let Tt = 0,
  Sr = 0,
  ae,
  Rr = 0;
function In(e) {
  try {
    (++Rr, e());
  } finally {
    --Rr || jn();
  }
}
function Wt(e) {
  const t = e.depsTail;
  let r = t !== void 0 ? t.nextDep : e.deps;
  for (; r !== void 0; ) r = ji(r, e);
}
function jn() {
  if (!(Rr > 0)) {
    for (; Tt < Sr; ) {
      const e = wr[Tt];
      ((wr[Tt++] = void 0), e.notify());
    }
    ((Tt = 0), (Sr = 0));
  }
}
function js(e, t) {
  const r = typeof e == "function",
    s = e,
    n = {
      _snapshot: r ? void 0 : e,
      subs: void 0,
      subsTail: void 0,
      deps: void 0,
      depsTail: void 0,
      flags: r ? N.None : N.Mutable,
      get() {
        return (ae !== void 0 && Ts(n, ae, At), n._snapshot);
      },
      subscribe(o) {
        const a = Ii(o),
          i = { current: !1 },
          c = Ei(() => {
            (n.get(), i.current ? a.next?.(n._snapshot) : (i.current = !0));
          });
        return {
          unsubscribe: () => {
            c.stop();
          },
        };
      },
      _update(o) {
        const a = ae,
          i = t?.compare ?? Object.is;
        if (r) ((ae = n), ++At, (n.depsTail = void 0));
        else if (o === void 0) return !1;
        r && (n.flags = N.Mutable | N.RecursedCheck);
        try {
          const c = n._snapshot,
            d = typeof o == "function" ? o(c) : o === void 0 && r ? s(c) : o;
          return c === void 0 || !i(c, d) ? ((n._snapshot = d), !0) : !1;
        } finally {
          ((ae = a), r && (n.flags &= ~N.RecursedCheck), Wt(n));
        }
      },
    };
  return (
    r
      ? ((n.flags = N.Mutable | N.Dirty),
        (n.get = function () {
          const o = n.flags;
          if (o & N.Dirty || (o & N.Pending && Tn(n.deps, n))) {
            if (n._update()) {
              const a = n.subs;
              a !== void 0 && Is(a);
            }
          } else o & N.Pending && (n.flags = o & ~N.Pending);
          return (ae !== void 0 && Ts(n, ae, At), n._snapshot);
        }))
      : (n.set = function (o) {
          if (n._update(o)) {
            const a = n.subs;
            a !== void 0 && (Oi(a), Is(a), jn());
          }
        }),
    n
  );
}
function Ei(e) {
  const t = () => {
      const s = ae;
      ((ae = r), ++At, (r.depsTail = void 0), (r.flags = N.Watching | N.RecursedCheck));
      try {
        return e();
      } finally {
        ((ae = s), (r.flags &= ~N.RecursedCheck), Wt(r));
      }
    },
    r = {
      deps: void 0,
      depsTail: void 0,
      subs: void 0,
      subsTail: void 0,
      flags: N.Watching | N.RecursedCheck,
      notify() {
        const s = this.flags;
        s & N.Dirty || (s & N.Pending && Tn(this.deps, this)) ? t() : (this.flags = N.Watching);
      },
      stop() {
        ((this.flags = N.None), (this.depsTail = void 0), Wt(this));
      },
    };
  return (t(), r);
}
function Ni(e, t) {
  return e === t;
}
function A(e, t, r = Ni) {
  const s = x.useCallback(
      (a) => {
        if (!e) return () => {};
        const { unsubscribe: i } = e.subscribe(a);
        return i;
      },
      [e],
    ),
    n = x.useCallback(() => e?.get(), [e]);
  return bo.useSyncExternalStoreWithSelector(s, n, n, t, r);
}
var Ai = { get: () => {}, subscribe: () => ({ unsubscribe: () => {} }) };
function Me(e) {
  const t = D(),
    r = x.useContext(e.from ? Li : qt),
    s = e.from ?? r,
    n = s ? (e.from ? t.stores.getRouteMatchStore(s) : t.stores.matchStores.get(s)) : void 0,
    o = x.useRef(void 0);
  return A(n ?? Ai, (a) => {
    if (((e.shouldThrow ?? !0) && !a && Q(), a === void 0)) return;
    const i = e.select ? e.select(a) : a;
    if (e.structuralSharing ?? t.options.defaultStructuralSharing) {
      const c = ve(o.current, i);
      return ((o.current = c), c);
    }
    return i;
  });
}
function On(e) {
  return Me({
    from: e.from,
    strict: e.strict,
    structuralSharing: e.structuralSharing,
    select: (t) => (e.select ? e.select(t.loaderData) : t.loaderData),
  });
}
function En(e) {
  const { select: t, ...r } = e;
  return Me({ ...r, select: (s) => (t ? t(s.loaderDeps) : s.loaderDeps) });
}
function Nn(e) {
  return Me({
    from: e.from,
    shouldThrow: e.shouldThrow,
    structuralSharing: e.structuralSharing,
    strict: e.strict,
    select: (t) => {
      const r = e.strict === !1 ? t.params : t._strictParams;
      return e.select ? e.select(r) : r;
    },
  });
}
function An(e) {
  return Me({
    from: e.from,
    strict: e.strict,
    shouldThrow: e.shouldThrow,
    structuralSharing: e.structuralSharing,
    select: (t) => (e.select ? e.select(t.search) : t.search),
  });
}
function Mn(e) {
  const t = D();
  return x.useCallback((r) => t.navigate({ ...r, from: r.from ?? e?.from }), [e?.from, t]);
}
function Dn(e) {
  return Me({ ...e, select: (t) => (e.select ? e.select(t.context) : t.context) });
}
function Mi(e, t) {
  const r = D(),
    s = wi(t),
    {
      activeProps: n,
      inactiveProps: o,
      activeOptions: a,
      to: i,
      preload: c,
      preloadDelay: d,
      preloadIntentProximity: u,
      hashScrollIntoView: h,
      replace: p,
      startTransition: f,
      resetScroll: g,
      viewTransition: y,
      children: m,
      target: b,
      disabled: v,
      style: S,
      className: w,
      onClick: C,
      onBlur: L,
      onFocus: k,
      onMouseEnter: R,
      onMouseLeave: P,
      onTouchStart: j,
      ignoreBlocker: I,
      params: O,
      search: Z,
      hash: G,
      state: X,
      mask: ke,
      reloadDocument: K,
      unsafeRelative: fe,
      from: Ke,
      _fromLocation: De,
      ...le
    } = e,
    _e = Fr(),
    de = x.useMemo(
      () => e,
      [
        r,
        e.from,
        e._fromLocation,
        e.hash,
        e.to,
        e.search,
        e.params,
        e.state,
        e.mask,
        e.unsafeRelative,
      ],
    ),
    ne = A(
      r.stores.location,
      (T) => T,
      (T, E) => T.href === E.href,
    ),
    F = x.useMemo(() => {
      const T = { _fromLocation: ne, ...de };
      return r.buildLocation(T);
    }, [r, ne, de]),
    te = F.maskedLocation ? F.maskedLocation.publicHref : F.publicHref,
    vt = F.maskedLocation ? F.maskedLocation.external : F.external,
    pe = x.useMemo(() => Wi(te, vt, r.history, v), [v, vt, te, r.history]),
    Ce = x.useMemo(() => {
      if (pe?.external) return Mt(pe.href, r.protocolAllowlist) ? void 0 : pe.href;
      if (!Hi(i) && !(typeof i != "string" || i.indexOf(":") === -1))
        try {
          return (new URL(i), Mt(i, r.protocolAllowlist) ? void 0 : i);
        } catch {}
    }, [i, pe, r.protocolAllowlist]),
    Fe = x.useMemo(() => {
      if (Ce) return !1;
      if (a?.exact) {
        if (!la(ne.pathname, F.pathname, r.basepath)) return !1;
      } else {
        const T = Dt(ne.pathname, r.basepath),
          E = Dt(F.pathname, r.basepath);
        if (!(T.startsWith(E) && (T.length === E.length || T[E.length] === "/"))) return !1;
      }
      return (a?.includeSearch ?? !0) &&
        !J(ne.search, F.search, { partial: !a?.exact, ignoreUndefined: !a?.explicitUndefined })
        ? !1
        : a?.includeHash
          ? _e && ne.hash === F.hash
          : !0;
    }, [
      a?.exact,
      a?.explicitUndefined,
      a?.includeHash,
      a?.includeSearch,
      ne,
      Ce,
      _e,
      F.hash,
      F.pathname,
      F.search,
      r.basepath,
    ]),
    Pe = Fe ? (xe(n, {}) ?? Di) : lr,
    me = Fe ? lr : (xe(o, {}) ?? lr),
    wt = [w, Pe.className, me.className].filter(Boolean).join(" "),
    Ve = (S || Pe.style || me.style) && { ...S, ...Pe.style, ...me.style },
    [Vt, Ye] = x.useState(!1),
    Je = x.useRef(!1),
    ge = e.reloadDocument || Ce ? !1 : (c ?? r.options.defaultPreload),
    Be = d ?? r.options.defaultPreloadDelay ?? 0,
    oe = x.useCallback(() => {
      r.preloadRoute({ ...de, _builtLocation: F }).catch((T) => {
        (console.warn(T), console.warn(za));
      });
    }, [r, de, F]);
  (vi(
    s,
    x.useCallback(
      (T) => {
        T?.isIntersecting && oe();
      },
      [oe],
    ),
    Ui,
    { disabled: !!v || ge !== "viewport" },
  ),
    x.useEffect(() => {
      Je.current || (!v && ge === "render" && (oe(), (Je.current = !0)));
    }, [v, oe, ge]));
  const Qe = (T) => {
    const E = T.currentTarget.getAttribute("target"),
      V = b !== void 0 ? b : E;
    if (!v && !zi(T) && !T.defaultPrevented && (!V || V === "_self") && T.button === 0) {
      (T.preventDefault(),
        ho.flushSync(() => {
          Ye(!0);
        }));
      const uo = r.subscribe("onResolved", () => {
        (uo(), Ye(!1));
      });
      r.navigate({
        ...de,
        replace: p,
        resetScroll: g,
        hashScrollIntoView: h,
        startTransition: f,
        viewTransition: y,
        ignoreBlocker: I,
      });
    }
  };
  if (Ce)
    return {
      ...le,
      ref: s,
      href: Ce,
      ...(m && { children: m }),
      ...(b && { target: b }),
      ...(v && { disabled: v }),
      ...(S && { style: S }),
      ...(w && { className: w }),
      ...(C && { onClick: C }),
      ...(L && { onBlur: L }),
      ...(k && { onFocus: k }),
      ...(R && { onMouseEnter: R }),
      ...(P && { onMouseLeave: P }),
      ...(j && { onTouchStart: j }),
    };
  const St = (T) => {
      if (v || ge !== "intent") return;
      if (!Be) {
        oe();
        return;
      }
      const E = T.currentTarget;
      if (st.has(E)) return;
      const V = setTimeout(() => {
        (st.delete(E), oe());
      }, Be);
      st.set(E, V);
    },
    Yt = (T) => {
      v || ge !== "intent" || oe();
    },
    _ = (T) => {
      if (v || !ge || !Be) return;
      const E = T.currentTarget,
        V = st.get(E);
      V && (clearTimeout(V), st.delete(E));
    };
  return {
    ...le,
    ...Pe,
    ...me,
    href: pe?.href,
    ref: s,
    onClick: $e([C, Qe]),
    onBlur: $e([L, _]),
    onFocus: $e([k, St]),
    onMouseEnter: $e([R, St]),
    onMouseLeave: $e([P, _]),
    onTouchStart: $e([j, Yt]),
    disabled: !!v,
    target: b,
    ...(Ve && { style: Ve }),
    ...(wt && { className: wt }),
    ...(v && Fi),
    ...(Fe && Bi),
    ...(_e && Vt && $i),
  };
}
var lr = {},
  Di = { className: "active" },
  Fi = { role: "link", "aria-disabled": !0 },
  Bi = { "data-status": "active", "aria-current": "page" },
  $i = { "data-transitioning": "transitioning" },
  st = new WeakMap(),
  Ui = { rootMargin: "100px" },
  $e = (e) => (t) => {
    for (const r of e)
      if (r) {
        if (t.defaultPrevented) return;
        r(t);
      }
  };
function Wi(e, t, r, s) {
  if (!s) return t ? { href: e, external: !0 } : { href: r.createHref(e) || "/", external: !1 };
}
function Hi(e) {
  if (typeof e != "string") return !1;
  const t = e.charCodeAt(0);
  return t === 47 ? e.charCodeAt(1) !== 47 : t === 46;
}
var yt = x.forwardRef((e, t) => {
  const { _asChild: r, ...s } = e,
    { type: n, ...o } = Mi(s, t),
    a =
      typeof s.children == "function"
        ? s.children({ isActive: o["data-status"] === "active" })
        : s.children;
  if (!r) {
    const { disabled: i, ...c } = o;
    return x.createElement("a", c, a);
  }
  return x.createElement(r, o, a);
});
function zi(e) {
  return !!(e.metaKey || e.altKey || e.ctrlKey || e.shiftKey);
}
var Gi = class extends wn {
  constructor(t) {
    (super(t),
      (this.useMatch = (r) =>
        Me({ select: r?.select, from: this.id, structuralSharing: r?.structuralSharing })),
      (this.useRouteContext = (r) => Dn({ ...r, from: this.id })),
      (this.useSearch = (r) =>
        An({ select: r?.select, structuralSharing: r?.structuralSharing, from: this.id })),
      (this.useParams = (r) =>
        Nn({ select: r?.select, structuralSharing: r?.structuralSharing, from: this.id })),
      (this.useLoaderDeps = (r) => En({ ...r, from: this.id })),
      (this.useLoaderData = (r) => On({ ...r, from: this.id })),
      (this.useNavigate = () => Mn({ from: this.fullPath })),
      (this.Link = ct.forwardRef((r, s) => l.jsx(yt, { ref: s, from: this.fullPath, ...r }))));
  }
};
function qi(e) {
  return new Gi(e);
}
function Ki() {
  return (e) => Yi(e);
}
var Vi = class extends Va {
  constructor(e) {
    (super(e),
      (this.useMatch = (t) =>
        Me({ select: t?.select, from: this.id, structuralSharing: t?.structuralSharing })),
      (this.useRouteContext = (t) => Dn({ ...t, from: this.id })),
      (this.useSearch = (t) =>
        An({ select: t?.select, structuralSharing: t?.structuralSharing, from: this.id })),
      (this.useParams = (t) =>
        Nn({ select: t?.select, structuralSharing: t?.structuralSharing, from: this.id })),
      (this.useLoaderDeps = (t) => En({ ...t, from: this.id })),
      (this.useLoaderData = (t) => On({ ...t, from: this.id })),
      (this.useNavigate = () => Mn({ from: this.fullPath })),
      (this.Link = ct.forwardRef((t, r) => l.jsx(yt, { ref: r, from: this.fullPath, ...t }))));
  }
};
function Yi(e) {
  return new Vi(e);
}
function W(e) {
  return new Ji(e, { silent: !0 }).createRoute;
}
var Ji = class {
  constructor(e, t) {
    ((this.path = e),
      (this.createRoute = (r) => {
        const s = qi(r);
        return ((s.isRoot = !1), s);
      }),
      (this.silent = t?.silent));
  }
};
function H(e, t) {
  let r, s, n, o;
  const a = () => (
      r ||
        (r = e()
          .then((c) => {
            ((r = void 0), (s = c[t]));
          })
          .catch((c) => {
            if (
              ((n = c),
              Go(n) && n instanceof Error && typeof window < "u" && typeof sessionStorage < "u")
            ) {
              const d = `tanstack_router_reload:${n.message}`;
              sessionStorage.getItem(d) || (sessionStorage.setItem(d, "1"), (o = !0));
            }
          })),
      r
    ),
    i = function (d) {
      if (o) throw (window.location.reload(), new Promise(() => {}));
      if (n) throw n;
      if (!s)
        if (Ut) Ut(a());
        else throw a();
      return x.createElement(s, d);
    };
  return ((i.preload = a), i);
}
function Qi(e) {
  const t = D(),
    r = `not-found-${A(t.stores.location, (s) => s.pathname)}-${A(t.stores.status, (s) => s)}`;
  return l.jsx(Mr, {
    getResetKey: () => r,
    onCatch: (s, n) => {
      if (U(s)) e.onCatch?.(s, n);
      else throw s;
    },
    errorComponent: ({ error: s }) => {
      if (U(s)) return e.fallback?.(s);
      throw s;
    },
    children: e.children,
  });
}
function Xi() {
  return l.jsx("p", { children: "Not Found" });
}
function Ue(e) {
  return l.jsx(l.Fragment, { children: e.children });
}
function Fn(e, t, r) {
  return t.options.notFoundComponent
    ? l.jsx(t.options.notFoundComponent, { ...r })
    : e.options.defaultNotFoundComponent
      ? l.jsx(e.options.defaultNotFoundComponent, { ...r })
      : l.jsx(Xi, {});
}
function Zi(e) {
  return null;
}
function ec() {
  return (Zi(D()), null);
}
var Bn = x.memo(function ({ matchId: t }) {
  const r = D(),
    s = r.stores.matchStores.get(t);
  s || Q();
  const n = A(r.stores.loadedAt, (a) => a),
    o = A(s, (a) => a);
  return l.jsx(tc, {
    router: r,
    matchId: t,
    resetKey: n,
    matchState: x.useMemo(() => {
      const a = o.routeId,
        i = r.routesById[a].parentRoute?.id;
      return { routeId: a, ssr: o.ssr, _displayPending: o._displayPending, parentRouteId: i };
    }, [o._displayPending, o.routeId, o.ssr, r.routesById]),
  });
});
function tc({ router: e, matchId: t, resetKey: r, matchState: s }) {
  const n = e.routesById[s.routeId],
    o = n.options.pendingComponent ?? e.options.defaultPendingComponent,
    a = o ? l.jsx(o, {}) : null,
    i = n.options.errorComponent ?? e.options.defaultErrorComponent,
    c = n.options.onCatch ?? e.options.defaultOnCatch,
    d = n.isRoot
      ? (n.options.notFoundComponent ?? e.options.notFoundRoute?.options.component)
      : n.options.notFoundComponent,
    u = s.ssr === !1 || s.ssr === "data-only",
    h =
      (!n.isRoot || n.options.wrapInSuspense || u) &&
      (n.options.wrapInSuspense ?? o ?? (n.options.errorComponent?.preload || u))
        ? x.Suspense
        : Ue,
    p = i ? Mr : Ue,
    f = d ? Qi : Ue;
  return l.jsxs(n.isRoot ? (n.options.shellComponent ?? Ue) : Ue, {
    children: [
      l.jsx(qt.Provider, {
        value: t,
        children: l.jsx(h, {
          fallback: a,
          children: l.jsx(p, {
            getResetKey: () => r,
            errorComponent: i || Dr,
            onCatch: (g, y) => {
              if (U(g)) throw ((g.routeId ??= s.routeId), g);
              c?.(g, y);
            },
            children: l.jsx(f, {
              fallback: (g) => {
                if (
                  ((g.routeId ??= s.routeId),
                  !d || (g.routeId && g.routeId !== s.routeId) || (!g.routeId && !n.isRoot))
                )
                  throw g;
                return x.createElement(d, g);
              },
              children:
                u || s._displayPending
                  ? l.jsx(Ci, { fallback: a, children: l.jsx(Os, { matchId: t }) })
                  : l.jsx(Os, { matchId: t }),
            }),
          }),
        }),
      }),
      s.parentRouteId === Oe
        ? l.jsxs(l.Fragment, {
            children: [
              l.jsx(rc, { resetKey: r }),
              e.options.scrollRestoration && sn ? l.jsx(ec, {}) : null,
            ],
          })
        : null,
    ],
  });
}
function rc({ resetKey: e }) {
  const t = D(),
    r = x.useRef(void 0);
  return (
    ot(() => {
      const s = t.latestLocation.href;
      (r.current === void 0 || r.current !== s) &&
        (t.emit({
          type: "onRendered",
          ...Ge(t.stores.location.get(), t.stores.resolvedLocation.get()),
        }),
        (r.current = s));
    }, [t.latestLocation.state.__TSR_key, e, t]),
    null
  );
}
var Os = x.memo(function ({ matchId: t }) {
    const r = D(),
      s = (u, h) => r.getMatch(u.id)?._nonReactive[h] ?? u._nonReactive[h],
      n = r.stores.matchStores.get(t);
    n || Q();
    const o = A(n, (u) => u),
      a = o.routeId,
      i = r.routesById[a],
      c = x.useMemo(() => {
        const u = (r.routesById[a].options.remountDeps ?? r.options.defaultRemountDeps)?.({
          routeId: a,
          loaderDeps: o.loaderDeps,
          params: o._strictParams,
          search: o._strictSearch,
        });
        return u ? JSON.stringify(u) : void 0;
      }, [
        a,
        o.loaderDeps,
        o._strictParams,
        o._strictSearch,
        r.options.defaultRemountDeps,
        r.routesById,
      ]),
      d = x.useMemo(() => {
        const u = i.options.component ?? r.options.defaultComponent;
        return u ? l.jsx(u, {}, c) : l.jsx($n, {});
      }, [c, i.options.component, r.options.defaultComponent]);
    if (o._displayPending) throw s(o, "displayPendingPromise");
    if (o._forcePending) throw s(o, "minPendingPromise");
    if (o.status === "pending") {
      const u = i.options.pendingMinMs ?? r.options.defaultPendingMinMs;
      if (u) {
        const h = r.getMatch(o.id);
        if (h && !h._nonReactive.minPendingPromise) {
          const p = Ae();
          ((h._nonReactive.minPendingPromise = p),
            setTimeout(() => {
              (p.resolve(), (h._nonReactive.minPendingPromise = void 0));
            }, u));
        }
      }
      throw s(o, "loadPromise");
    }
    if (o.status === "notFound") return (U(o.error) || Q(), Fn(r, i, o.error));
    if (o.status === "redirected") throw (q(o.error) || Q(), s(o, "loadPromise"));
    if (o.status === "error") throw o.error;
    return d;
  }),
  $n = x.memo(function () {
    const t = D(),
      r = x.useContext(qt);
    let s,
      n = !1,
      o;
    {
      const d = r ? t.stores.matchStores.get(r) : void 0;
      (([s, n] = A(d, (u) => [u?.routeId, u?.globalNotFound ?? !1])),
        (o = A(t.stores.matchesId, (u) => u[u.findIndex((h) => h === r) + 1])));
    }
    const a = s ? t.routesById[s] : void 0,
      i = t.options.defaultPendingComponent ? l.jsx(t.options.defaultPendingComponent, {}) : null;
    if (n) return (a || Q(), Fn(t, a, void 0));
    if (!o) return null;
    const c = l.jsx(Bn, { matchId: o });
    return s === Oe ? l.jsx(x.Suspense, { fallback: i, children: c }) : c;
  });
function sc() {
  const e = D(),
    t = x.useRef({ router: e, mounted: !1 }),
    [r, s] = x.useState(!1),
    n = A(e.stores.isLoading, (h) => h),
    o = A(e.stores.hasPending, (h) => h),
    a = cr(n),
    i = n || r || o,
    c = cr(i),
    d = n || o,
    u = cr(d);
  return (
    (e.startTransition = (h) => {
      (s(!0),
        x.startTransition(() => {
          (h(), s(!1));
        }));
    }),
    x.useEffect(() => {
      const h = e.history.subscribe(e.load),
        p = e.buildLocation({
          to: e.latestLocation.pathname,
          search: !0,
          params: !0,
          hash: !0,
          state: !0,
          _includeValidateSearch: !0,
        });
      return (
        he(e.latestLocation.publicHref) !== he(p.publicHref) &&
          e.commitLocation({ ...p, replace: !0 }),
        () => {
          h();
        }
      );
    }, [e, e.history]),
    ot(() => {
      if ((typeof window < "u" && e.ssr) || (t.current.router === e && t.current.mounted)) return;
      ((t.current = { router: e, mounted: !0 }),
        (async () => {
          try {
            await e.load();
          } catch (p) {
            console.error(p);
          }
        })());
    }, [e]),
    ot(() => {
      a &&
        !n &&
        e.emit({ type: "onLoad", ...Ge(e.stores.location.get(), e.stores.resolvedLocation.get()) });
    }, [a, e, n]),
    ot(() => {
      u &&
        !d &&
        e.emit({
          type: "onBeforeRouteMount",
          ...Ge(e.stores.location.get(), e.stores.resolvedLocation.get()),
        });
    }, [d, u, e]),
    ot(() => {
      if (c && !i) {
        const h = Ge(e.stores.location.get(), e.stores.resolvedLocation.get());
        (e.emit({ type: "onResolved", ...h }),
          In(() => {
            (e.stores.status.set("idle"), e.stores.resolvedLocation.set(e.stores.location.get()));
          }),
          h.hrefChanged && Ya(e));
      }
    }, [i, c, e]),
    null
  );
}
function nc() {
  const e = D(),
    t = e.routesById[Oe].options.pendingComponent ?? e.options.defaultPendingComponent,
    r = t ? l.jsx(t, {}) : null,
    s = l.jsxs(typeof document < "u" && e.ssr ? Ue : x.Suspense, {
      fallback: r,
      children: [l.jsx(sc, {}), l.jsx(oc, {})],
    });
  return e.options.InnerWrap ? l.jsx(e.options.InnerWrap, { children: s }) : s;
}
function oc() {
  const e = D(),
    t = A(e.stores.firstId, (n) => n),
    r = A(e.stores.loadedAt, (n) => n),
    s = t ? l.jsx(Bn, { matchId: t }) : null;
  return l.jsx(qt.Provider, {
    value: t,
    children: e.options.disableGlobalCatchBoundary
      ? s
      : l.jsx(Mr, { getResetKey: () => r, errorComponent: Dr, onCatch: void 0, children: s }),
  });
}
var ac = (e) => ({ createMutableStore: js, createReadonlyStore: js, batch: In }),
  ic = (e) => new cc(e),
  cc = class extends Ma {
    constructor(e) {
      super(e, ac);
    }
  };
function lc({ router: e, children: t, ...r }) {
  on(r) && e.update({ ...e.options, ...r, context: { ...e.options.context, ...r.context } });
  const s = l.jsx(Ln.Provider, { value: e, children: t });
  return e.options.Wrap ? l.jsx(e.options.Wrap, { children: s }) : s;
}
function dc({ router: e, ...t }) {
  return l.jsx(lc, { router: e, ...t, children: l.jsx(nc, {}) });
}
function Un(e) {
  const t = D(),
    r = x.useRef(void 0);
  return A(t.stores.location, (s) => {
    const n = s;
    if (t.options.defaultStructuralSharing) {
      const o = ve(r.current, n);
      return ((r.current = o), o);
    }
    return n;
  });
}
function uc() {
  const e = D();
  return A(e.stores.location, (t) => t.state.__TSR_index !== 0);
}
function Wn(e) {
  const { attrs: t, children: r, nonce: s } = e;
  switch (e.tag) {
    case "title":
      return l.jsx("title", { ...t, suppressHydrationWarning: !0, children: r });
    case "meta":
      return l.jsx("meta", { ...t, suppressHydrationWarning: !0 });
    case "link":
      return l.jsx("link", {
        ...t,
        precedence: t?.precedence ?? (t?.rel === "stylesheet" ? "default" : void 0),
        nonce: s,
        suppressHydrationWarning: !0,
      });
    case "style":
      return (
        e.inlineCss,
        l.jsx("style", { ...t, dangerouslySetInnerHTML: { __html: r }, nonce: s })
      );
    case "script":
      return l.jsx(hc, { attrs: t, children: r });
    default:
      return null;
  }
}
function hc({ attrs: e, children: t }) {
  D();
  const r = Fr(),
    s =
      typeof e?.type == "string" &&
      e.type !== "" &&
      e.type !== "text/javascript" &&
      e.type !== "module";
  if (
    (x.useEffect(() => {
      if (!s) {
        if (e?.src) {
          const n = (() => {
            try {
              const a = document.baseURI || window.location.href;
              return new URL(e.src, a).href;
            } catch {
              return e.src;
            }
          })();
          if (Array.from(document.querySelectorAll("script[src]")).find((a) => a.src === n)) return;
          const o = document.createElement("script");
          for (const [a, i] of Object.entries(e))
            a !== "suppressHydrationWarning" &&
              i !== void 0 &&
              i !== !1 &&
              o.setAttribute(a, typeof i == "boolean" ? "" : String(i));
          return (
            document.head.appendChild(o),
            () => {
              o.parentNode && o.parentNode.removeChild(o);
            }
          );
        }
        if (typeof t == "string") {
          const n = typeof e?.type == "string" ? e.type : "text/javascript",
            o = typeof e?.nonce == "string" ? e.nonce : void 0;
          if (
            Array.from(document.querySelectorAll("script:not([src])")).find((i) => {
              if (!(i instanceof HTMLScriptElement)) return !1;
              const c = i.getAttribute("type") ?? "text/javascript",
                d = i.getAttribute("nonce") ?? void 0;
              return i.textContent === t && c === n && d === o;
            })
          )
            return;
          const a = document.createElement("script");
          if (((a.textContent = t), e))
            for (const [i, c] of Object.entries(e))
              i !== "suppressHydrationWarning" &&
                c !== void 0 &&
                c !== !1 &&
                a.setAttribute(i, typeof c == "boolean" ? "" : String(c));
          return (
            document.head.appendChild(a),
            () => {
              a.parentNode && a.parentNode.removeChild(a);
            }
          );
        }
      }
    }, [e, t, s]),
    s && typeof t == "string")
  )
    return l.jsx("script", {
      ...e,
      suppressHydrationWarning: !0,
      dangerouslySetInnerHTML: { __html: t },
    });
  if (!r) {
    if (e?.src) return l.jsx("script", { ...e, suppressHydrationWarning: !0 });
    if (typeof t == "string")
      return l.jsx("script", {
        ...e,
        dangerouslySetInnerHTML: { __html: t },
        suppressHydrationWarning: !0,
      });
  }
  return null;
}
var fc = (e) => {
  const t = D(),
    r = t.options.ssr?.nonce,
    s = A(t.stores.matches, (d) => d.map((u) => u.meta).filter(Boolean), J),
    n = x.useMemo(() => {
      const d = [],
        u = {};
      let h;
      for (let p = s.length - 1; p >= 0; p--) {
        const f = s[p];
        for (let g = f.length - 1; g >= 0; g--) {
          const y = f[g];
          if (y)
            if (y.title) h || (h = { tag: "title", children: y.title });
            else if ("script:ld+json" in y)
              try {
                const m = JSON.stringify(y["script:ld+json"]);
                d.push({ tag: "script", attrs: { type: "application/ld+json" }, children: Jo(m) });
              } catch {}
            else {
              const m = y.name ?? y.property;
              if (m) {
                if (u[m]) continue;
                u[m] = !0;
              }
              d.push({ tag: "meta", attrs: { ...y, nonce: r } });
            }
        }
      }
      return (
        h && d.push(h),
        r && d.push({ tag: "meta", attrs: { property: "csp-nonce", content: r } }),
        d.reverse(),
        d
      );
    }, [s, r]),
    o = A(
      t.stores.matches,
      (d) => {
        const u = d
            .map((f) => f.links)
            .filter(Boolean)
            .flat(1)
            .map((f) => ({ tag: "link", attrs: { ...f, nonce: r } })),
          h = t.ssr?.manifest,
          p = d
            .map((f) => h?.routes[f.routeId]?.assets ?? [])
            .filter(Boolean)
            .flat(1)
            .flatMap((f) =>
              f.tag === "link"
                ? Ka(h, f)
                  ? []
                  : [
                      {
                        tag: "link",
                        attrs: {
                          ...f.attrs,
                          crossOrigin: vs(e, "stylesheet") ?? f.attrs?.crossOrigin,
                          suppressHydrationWarning: !0,
                          nonce: r,
                        },
                      },
                    ]
                : f.tag === "style"
                  ? [
                      {
                        tag: "style",
                        attrs: { ...f.attrs, nonce: r },
                        children: f.children,
                        ...(f.inlineCss ? { inlineCss: !0 } : {}),
                      },
                    ]
                  : [],
            );
        return [...u, ...p];
      },
      J,
    ),
    a = A(
      t.stores.matches,
      (d) => {
        const u = [];
        return (
          d
            .map((h) => t.looseRoutesById[h.routeId])
            .forEach((h) =>
              t.ssr?.manifest?.routes[h.id]?.preloads?.filter(Boolean).forEach((p) => {
                const f = Ga(p);
                u.push({
                  tag: "link",
                  attrs: {
                    rel: "modulepreload",
                    href: f.href,
                    crossOrigin: vs(e, "modulepreload") ?? f.crossOrigin,
                    nonce: r,
                  },
                });
              }),
            ),
          u
        );
      },
      J,
    ),
    i = A(
      t.stores.matches,
      (d) =>
        d
          .map((u) => u.styles)
          .flat(1)
          .filter(Boolean)
          .map(({ children: u, ...h }) => ({
            tag: "style",
            attrs: { ...h, nonce: r },
            children: u,
          })),
      J,
    ),
    c = A(
      t.stores.matches,
      (d) =>
        d
          .map((u) => u.headScripts)
          .flat(1)
          .filter(Boolean)
          .map(({ children: u, ...h }) => ({
            tag: "script",
            attrs: { ...h, nonce: r },
            children: u,
          })),
      J,
    );
  return pc([...n, ...a, ...o, ...i, ...c], (d) => JSON.stringify(d));
};
function pc(e, t) {
  const r = new Set();
  return e.filter((s) => {
    const n = t(s);
    return r.has(n) ? !1 : (r.add(n), !0);
  });
}
function mc(e) {
  const t = fc(e.assetCrossOrigin),
    r = D().options.ssr?.nonce;
  return l.jsx(l.Fragment, {
    children: t.map((s) =>
      x.createElement(Wn, { ...s, key: `tsr-meta-${JSON.stringify(s)}`, nonce: r }),
    ),
  });
}
var gc = () => {
  const e = D(),
    t = e.options.ssr?.nonce,
    r = (o) => {
      const a = [],
        i = e.ssr?.manifest;
      return i
        ? (o
            .map((c) => e.looseRoutesById[c.routeId])
            .forEach((c) =>
              i.routes[c.id]?.assets
                ?.filter((d) => d.tag === "script")
                .forEach((d) => {
                  a.push({ tag: "script", attrs: { ...d.attrs, nonce: t }, children: d.children });
                }),
            ),
          a)
        : [];
    },
    s = (o) =>
      o
        .map((a) => a.scripts)
        .flat(1)
        .filter(Boolean)
        .map(({ children: a, ...i }) => ({
          tag: "script",
          attrs: { ...i, suppressHydrationWarning: !0, nonce: t },
          children: a,
        })),
    n = A(e.stores.matches, r, J);
  return bc(e, A(e.stores.matches, s, J), n);
};
function bc(e, t, r) {
  let s;
  e.serverSsr && (s = e.serverSsr.takeBufferedScripts());
  const n = [...t, ...r];
  return (
    s && n.unshift(s),
    l.jsx(l.Fragment, {
      children: n.map((o, a) => x.createElement(Wn, { ...o, key: `tsr-scripts-${o.tag}-${a}` })),
    })
  );
}
function yc(e) {
  const t = D();
  return x.useCallback(
    async (...r) => {
      try {
        const s = await e(...r);
        if (q(s)) throw s;
        return s;
      } catch (s) {
        if (q(s))
          return (
            (s.options._fromLocation = t.stores.location.get()),
            t.navigate(t.resolveRedirect(s).options)
          );
        throw s;
      }
    },
    [t, e],
  );
}
function Es(e) {
  return e !== "__proto__" && e !== "constructor" && e !== "prototype";
}
function kr(e, t) {
  const r = Object.create(null);
  if (e) for (const s of Object.keys(e)) Es(s) && (r[s] = e[s]);
  if (t && typeof t == "object") for (const s of Object.keys(t)) Es(s) && (r[s] = t[s]);
  return r;
}
function Hn(e) {
  return Object.create(null);
}
var zn = () => {
    throw new Error("createServerOnlyFn() functions can only be called on the server!");
  },
  M = (e, t) => {
    const r = t || e || {};
    return (
      typeof r.method > "u" && (r.method = "GET"),
      Object.assign((o) => M(void 0, { ...r, ...o }), {
        options: r,
        middleware: (o) => {
          const a = [...(r.middleware || [])];
          o.map((c) => {
            es in c ? c.options.middleware && a.push(...c.options.middleware) : a.push(c);
          });
          const i = M(void 0, { ...r, middleware: a });
          return ((i[es] = !0), i);
        },
        inputValidator: (o) => M(void 0, { ...r, inputValidator: o }),
        handler: (...o) => {
          const [a, i] = o,
            c = { ...r, extractedFn: a, serverFn: i },
            d = [...(c.middleware || []), wc(c)];
          return (
            (a.method = r.method),
            Object.assign(
              async (u) => {
                const h = await Ns(d, "client", {
                    ...a,
                    ...c,
                    data: u?.data,
                    headers: u?.headers,
                    signal: u?.signal,
                    fetch: u?.fetch,
                    context: Hn(),
                  }),
                  p = mn(h.error);
                if (p) throw p;
                if (h.error) throw h.error;
                return h.result;
              },
              {
                ...a,
                method: r.method,
                __executeServer: async (u) => {
                  const h = zn(),
                    p = h.contextAfterGlobalMiddlewares;
                  return await Ns(d, "server", {
                    ...a,
                    ...u,
                    serverFnMeta: a.serverFnMeta,
                    context: kr(u.context, p),
                    request: h.request,
                  }).then((f) => ({ result: f.result, error: f.error, context: f.sendContext }));
                },
              },
            )
          );
        },
      })
    );
  };
async function Ns(e, t, r) {
  let s = xc([...(Or()?.functionMiddleware || []), ...e]);
  if (t === "server") {
    const o = zn();
    o?.executedRequestMiddlewares && (s = s.filter((a) => !o.executedRequestMiddlewares.has(a)));
  }
  const n = async (o) => {
    const a = s.shift();
    if (!a) return o;
    try {
      "inputValidator" in a.options &&
        a.options.inputValidator &&
        t === "server" &&
        (o.data = await vc(a.options.inputValidator, o.data));
      let i;
      if (
        (t === "client"
          ? "client" in a.options && (i = a.options.client)
          : "server" in a.options && (i = a.options.server),
        i)
      ) {
        const d = await i({
          ...o,
          next: async (u = {}) => {
            const h = await n({
              ...o,
              ...u,
              context: kr(o.context, u.context),
              sendContext: kr(o.sendContext, u.sendContext),
              headers: bi(o.headers, u.headers),
              _callSiteFetch: o._callSiteFetch,
              fetch: o._callSiteFetch ?? u.fetch ?? o.fetch,
              result: u.result !== void 0 ? u.result : u instanceof Response ? u : o.result,
              error: u.error ?? o.error,
            });
            if (h.error) throw h.error;
            return h;
          },
        });
        if (q(d)) return { ...o, error: d };
        if (d instanceof Response) return { ...o, result: d };
        if (!d)
          throw new Error(
            "User middleware returned undefined. You must call next() or return a result in your middlewares.",
          );
        return d;
      }
      return n(o);
    } catch (i) {
      return { ...o, error: i };
    }
  };
  return n({
    ...r,
    headers: r.headers || {},
    sendContext: r.sendContext || {},
    context: r.context || Hn(),
    _callSiteFetch: r.fetch,
  });
}
function xc(e, t = 100) {
  const r = new Set(),
    s = [],
    n = (o, a) => {
      if (a > t)
        throw new Error(
          `Middleware nesting depth exceeded maximum of ${t}. Check for circular references.`,
        );
      o.forEach((i) => {
        (i.options.middleware && n(i.options.middleware, a + 1), r.has(i) || (r.add(i), s.push(i)));
      });
    };
  return (n(e, 0), s);
}
async function vc(e, t) {
  if (e == null) return {};
  if ("~standard" in e) {
    const r = await e["~standard"].validate(t);
    if (r.issues) throw new Error(JSON.stringify(r.issues, void 0, 2));
    return r.value;
  }
  if ("parse" in e) return e.parse(t);
  if (typeof e == "function") return e(t);
  throw new Error("Invalid validator type!");
}
function wc(e) {
  return {
    "~types": void 0,
    options: {
      inputValidator: e.inputValidator,
      client: async ({ next: t, sendContext: r, fetch: s, ...n }) => {
        const o = { ...n, context: r, fetch: s };
        return t(await e.extractedFn?.(o));
      },
      server: async ({ next: t, ...r }) => {
        const s = await e.serverFn?.(r);
        return t({ ...r, result: s });
      },
    },
  };
}
var je = (e, t) => {
    const r = { type: "request", ...(t || e) };
    return {
      options: r,
      middleware: (s) => je({}, Object.assign(r, { middleware: s })),
      inputValidator: (s) => je({}, Object.assign(r, { inputValidator: s })),
      client: (s) => je({}, Object.assign(r, { client: s })),
      server: (s) => je({}, Object.assign(r, { server: s })),
    };
  },
  Sc = () => {};
function Gn(e, t) {
  for (let r = 0, s = t.length; r < s; r++) {
    const n = t[r];
    e.has(n) || (e.add(n), n.extends && Gn(e, n.extends));
  }
}
var Rc = (e) => ({
  getOptions: async () => {
    const t = await e();
    if (t.serializationAdapters) {
      const r = new Set();
      (Gn(r, t.serializationAdapters), (t.serializationAdapters = Array.from(r)));
    }
    return t;
  },
  createMiddleware: je,
});
const kc = je(),
  _c = Sc(),
  As = Rc(() => ({ requestMiddleware: [_c, kc] }));
var Kt = class {
    constructor() {
      ((this.listeners = new Set()), (this.subscribe = this.subscribe.bind(this)));
    }
    subscribe(e) {
      return (
        this.listeners.add(e),
        this.onSubscribe(),
        () => {
          (this.listeners.delete(e), this.onUnsubscribe());
        }
      );
    }
    hasListeners() {
      return this.listeners.size > 0;
    }
    onSubscribe() {}
    onUnsubscribe() {}
  },
  Cc = class extends Kt {
    #e;
    #t;
    #r;
    constructor() {
      (super(),
        (this.#r = (e) => {
          if (typeof window < "u" && window.addEventListener) {
            const t = () => e();
            return (
              window.addEventListener("visibilitychange", t, !1),
              () => {
                window.removeEventListener("visibilitychange", t);
              }
            );
          }
        }));
    }
    onSubscribe() {
      this.#t || this.setEventListener(this.#r);
    }
    onUnsubscribe() {
      this.hasListeners() || (this.#t?.(), (this.#t = void 0));
    }
    setEventListener(e) {
      ((this.#r = e),
        this.#t?.(),
        (this.#t = e((t) => {
          typeof t == "boolean" ? this.setFocused(t) : this.onFocus();
        })));
    }
    setFocused(e) {
      this.#e !== e && ((this.#e = e), this.onFocus());
    }
    onFocus() {
      const e = this.isFocused();
      this.listeners.forEach((t) => {
        t(e);
      });
    }
    isFocused() {
      return typeof this.#e == "boolean"
        ? this.#e
        : globalThis.document?.visibilityState !== "hidden";
    }
  },
  qn = new Cc(),
  Pc = {
    setTimeout: (e, t) => setTimeout(e, t),
    clearTimeout: (e) => clearTimeout(e),
    setInterval: (e, t) => setInterval(e, t),
    clearInterval: (e) => clearInterval(e),
  },
  Lc = class {
    #e = Pc;
    #t = !1;
    setTimeoutProvider(e) {
      this.#e = e;
    }
    setTimeout(e, t) {
      return this.#e.setTimeout(e, t);
    }
    clearTimeout(e) {
      this.#e.clearTimeout(e);
    }
    setInterval(e, t) {
      return this.#e.setInterval(e, t);
    }
    clearInterval(e) {
      this.#e.clearInterval(e);
    }
  },
  _r = new Lc();
function Tc(e) {
  setTimeout(e, 0);
}
var Ic = typeof window > "u" || "Deno" in globalThis;
function se() {}
function jc(e, t) {
  return typeof e == "function" ? e(t) : e;
}
function Oc(e) {
  return typeof e == "number" && e >= 0 && e !== 1 / 0;
}
function Ec(e, t) {
  return Math.max(e + (t || 0) - Date.now(), 0);
}
function Cr(e, t) {
  return typeof e == "function" ? e(t) : e;
}
function Nc(e, t) {
  return typeof e == "function" ? e(t) : e;
}
function Ms(e, t) {
  const { type: r = "all", exact: s, fetchStatus: n, predicate: o, queryKey: a, stale: i } = e;
  if (a) {
    if (s) {
      if (t.queryHash !== Br(a, t.options)) return !1;
    } else if (!gt(t.queryKey, a)) return !1;
  }
  if (r !== "all") {
    const c = t.isActive();
    if ((r === "active" && !c) || (r === "inactive" && c)) return !1;
  }
  return !(
    (typeof i == "boolean" && t.isStale() !== i) ||
    (n && n !== t.state.fetchStatus) ||
    (o && !o(t))
  );
}
function Ds(e, t) {
  const { exact: r, status: s, predicate: n, mutationKey: o } = e;
  if (o) {
    if (!t.options.mutationKey) return !1;
    if (r) {
      if (mt(t.options.mutationKey) !== mt(o)) return !1;
    } else if (!gt(t.options.mutationKey, o)) return !1;
  }
  return !((s && t.state.status !== s) || (n && !n(t)));
}
function Br(e, t) {
  return (t?.queryKeyHashFn || mt)(e);
}
function mt(e) {
  return JSON.stringify(e, (t, r) =>
    Pr(r)
      ? Object.keys(r)
          .sort()
          .reduce((s, n) => ((s[n] = r[n]), s), {})
      : r,
  );
}
function gt(e, t) {
  return e === t
    ? !0
    : typeof e != typeof t
      ? !1
      : e && t && typeof e == "object" && typeof t == "object"
        ? Object.keys(t).every((r) => gt(e[r], t[r]))
        : !1;
}
var Ac = Object.prototype.hasOwnProperty;
function Kn(e, t, r = 0) {
  if (e === t) return e;
  if (r > 500) return t;
  const s = Fs(e) && Fs(t);
  if (!s && !(Pr(e) && Pr(t))) return t;
  const o = (s ? e : Object.keys(e)).length,
    a = s ? t : Object.keys(t),
    i = a.length,
    c = s ? new Array(i) : {};
  let d = 0;
  for (let u = 0; u < i; u++) {
    const h = s ? u : a[u],
      p = e[h],
      f = t[h];
    if (p === f) {
      ((c[h] = p), (s ? u < o : Ac.call(e, h)) && d++);
      continue;
    }
    if (p === null || f === null || typeof p != "object" || typeof f != "object") {
      c[h] = f;
      continue;
    }
    const g = Kn(p, f, r + 1);
    ((c[h] = g), g === p && d++);
  }
  return o === i && d === o ? e : c;
}
function Fs(e) {
  return Array.isArray(e) && e.length === Object.keys(e).length;
}
function Pr(e) {
  if (!Bs(e)) return !1;
  const t = e.constructor;
  if (t === void 0) return !0;
  const r = t.prototype;
  return !(
    !Bs(r) ||
    !r.hasOwnProperty("isPrototypeOf") ||
    Object.getPrototypeOf(e) !== Object.prototype
  );
}
function Bs(e) {
  return Object.prototype.toString.call(e) === "[object Object]";
}
function Mc(e) {
  return new Promise((t) => {
    _r.setTimeout(t, e);
  });
}
function Dc(e, t, r) {
  return typeof r.structuralSharing == "function"
    ? r.structuralSharing(e, t)
    : r.structuralSharing !== !1
      ? Kn(e, t)
      : t;
}
function Fc(e, t, r = 0) {
  const s = [...e, t];
  return r && s.length > r ? s.slice(1) : s;
}
function Bc(e, t, r = 0) {
  const s = [t, ...e];
  return r && s.length > r ? s.slice(0, -1) : s;
}
var $r = Symbol();
function Vn(e, t) {
  return !e.queryFn && t?.initialPromise
    ? () => t.initialPromise
    : !e.queryFn || e.queryFn === $r
      ? () => Promise.reject(new Error(`Missing queryFn: '${e.queryHash}'`))
      : e.queryFn;
}
function $c(e, t, r) {
  let s = !1,
    n;
  return (
    Object.defineProperty(e, "signal", {
      enumerable: !0,
      get: () => (
        (n ??= t()),
        s || ((s = !0), n.aborted ? r() : n.addEventListener("abort", r, { once: !0 })),
        n
      ),
    }),
    e
  );
}
var Yn = (() => {
  let e = () => Ic;
  return {
    isServer() {
      return e();
    },
    setIsServer(t) {
      e = t;
    },
  };
})();
function Uc() {
  let e, t;
  const r = new Promise((n, o) => {
    ((e = n), (t = o));
  });
  ((r.status = "pending"), r.catch(() => {}));
  function s(n) {
    (Object.assign(r, n), delete r.resolve, delete r.reject);
  }
  return (
    (r.resolve = (n) => {
      (s({ status: "fulfilled", value: n }), e(n));
    }),
    (r.reject = (n) => {
      (s({ status: "rejected", reason: n }), t(n));
    }),
    r
  );
}
var Wc = Tc;
function Hc() {
  let e = [],
    t = 0,
    r = (i) => {
      i();
    },
    s = (i) => {
      i();
    },
    n = Wc;
  const o = (i) => {
      t
        ? e.push(i)
        : n(() => {
            r(i);
          });
    },
    a = () => {
      const i = e;
      ((e = []),
        i.length &&
          n(() => {
            s(() => {
              i.forEach((c) => {
                r(c);
              });
            });
          }));
    };
  return {
    batch: (i) => {
      let c;
      t++;
      try {
        c = i();
      } finally {
        (t--, t || a());
      }
      return c;
    },
    batchCalls:
      (i) =>
      (...c) => {
        o(() => {
          i(...c);
        });
      },
    schedule: o,
    setNotifyFunction: (i) => {
      r = i;
    },
    setBatchNotifyFunction: (i) => {
      s = i;
    },
    setScheduler: (i) => {
      n = i;
    },
  };
}
var Y = Hc(),
  zc = class extends Kt {
    #e = !0;
    #t;
    #r;
    constructor() {
      (super(),
        (this.#r = (e) => {
          if (typeof window < "u" && window.addEventListener) {
            const t = () => e(!0),
              r = () => e(!1);
            return (
              window.addEventListener("online", t, !1),
              window.addEventListener("offline", r, !1),
              () => {
                (window.removeEventListener("online", t), window.removeEventListener("offline", r));
              }
            );
          }
        }));
    }
    onSubscribe() {
      this.#t || this.setEventListener(this.#r);
    }
    onUnsubscribe() {
      this.hasListeners() || (this.#t?.(), (this.#t = void 0));
    }
    setEventListener(e) {
      ((this.#r = e), this.#t?.(), (this.#t = e(this.setOnline.bind(this))));
    }
    setOnline(e) {
      this.#e !== e &&
        ((this.#e = e),
        this.listeners.forEach((r) => {
          r(e);
        }));
    }
    isOnline() {
      return this.#e;
    }
  },
  Ht = new zc();
function Gc(e) {
  return Math.min(1e3 * 2 ** e, 3e4);
}
function Jn(e) {
  return (e ?? "online") === "online" ? Ht.isOnline() : !0;
}
var Lr = class extends Error {
  constructor(e) {
    (super("CancelledError"), (this.revert = e?.revert), (this.silent = e?.silent));
  }
};
function Qn(e) {
  let t = !1,
    r = 0,
    s;
  const n = Uc(),
    o = () => n.status !== "pending",
    a = (y) => {
      if (!o()) {
        const m = new Lr(y);
        (p(m), e.onCancel?.(m));
      }
    },
    i = () => {
      t = !0;
    },
    c = () => {
      t = !1;
    },
    d = () => qn.isFocused() && (e.networkMode === "always" || Ht.isOnline()) && e.canRun(),
    u = () => Jn(e.networkMode) && e.canRun(),
    h = (y) => {
      o() || (s?.(), n.resolve(y));
    },
    p = (y) => {
      o() || (s?.(), n.reject(y));
    },
    f = () =>
      new Promise((y) => {
        ((s = (m) => {
          (o() || d()) && y(m);
        }),
          e.onPause?.());
      }).then(() => {
        ((s = void 0), o() || e.onContinue?.());
      }),
    g = () => {
      if (o()) return;
      let y;
      const m = r === 0 ? e.initialPromise : void 0;
      try {
        y = m ?? e.fn();
      } catch (b) {
        y = Promise.reject(b);
      }
      Promise.resolve(y)
        .then(h)
        .catch((b) => {
          if (o()) return;
          const v = e.retry ?? (Yn.isServer() ? 0 : 3),
            S = e.retryDelay ?? Gc,
            w = typeof S == "function" ? S(r, b) : S,
            C = v === !0 || (typeof v == "number" && r < v) || (typeof v == "function" && v(r, b));
          if (t || !C) {
            p(b);
            return;
          }
          (r++,
            e.onFail?.(r, b),
            Mc(w)
              .then(() => (d() ? void 0 : f()))
              .then(() => {
                t ? p(b) : g();
              }));
        });
    };
  return {
    promise: n,
    status: () => n.status,
    cancel: a,
    continue: () => (s?.(), n),
    cancelRetry: i,
    continueRetry: c,
    canStart: u,
    start: () => (u() ? g() : f().then(g), n),
  };
}
var Xn = class {
  #e;
  destroy() {
    this.clearGcTimeout();
  }
  scheduleGc() {
    (this.clearGcTimeout(),
      Oc(this.gcTime) &&
        (this.#e = _r.setTimeout(() => {
          this.optionalRemove();
        }, this.gcTime)));
  }
  updateGcTime(e) {
    this.gcTime = Math.max(this.gcTime || 0, e ?? (Yn.isServer() ? 1 / 0 : 300 * 1e3));
  }
  clearGcTimeout() {
    this.#e !== void 0 && (_r.clearTimeout(this.#e), (this.#e = void 0));
  }
};
function qc(e) {
  return {
    onFetch: (t, r) => {
      const s = t.options,
        n = t.fetchOptions?.meta?.fetchMore?.direction,
        o = t.state.data?.pages || [],
        a = t.state.data?.pageParams || [];
      let i = { pages: [], pageParams: [] },
        c = 0;
      const d = async () => {
        let u = !1;
        const h = (g) => {
            $c(
              g,
              () => t.signal,
              () => (u = !0),
            );
          },
          p = Vn(t.options, t.fetchOptions),
          f = async (g, y, m) => {
            if (u) return Promise.reject(t.signal.reason);
            if (y == null && g.pages.length) return Promise.resolve(g);
            const v = (() => {
                const L = {
                  client: t.client,
                  queryKey: t.queryKey,
                  pageParam: y,
                  direction: m ? "backward" : "forward",
                  meta: t.options.meta,
                };
                return (h(L), L);
              })(),
              S = await p(v),
              { maxPages: w } = t.options,
              C = m ? Bc : Fc;
            return { pages: C(g.pages, S, w), pageParams: C(g.pageParams, y, w) };
          };
        if (n && o.length) {
          const g = n === "backward",
            y = g ? Kc : $s,
            m = { pages: o, pageParams: a },
            b = y(s, m);
          i = await f(m, b, g);
        } else {
          const g = e ?? o.length;
          do {
            const y = c === 0 ? (a[0] ?? s.initialPageParam) : $s(s, i);
            if (c > 0 && y == null) break;
            ((i = await f(i, y)), c++);
          } while (c < g);
        }
        return i;
      };
      t.options.persister
        ? (t.fetchFn = () =>
            t.options.persister?.(
              d,
              { client: t.client, queryKey: t.queryKey, meta: t.options.meta, signal: t.signal },
              r,
            ))
        : (t.fetchFn = d);
    },
  };
}
function $s(e, { pages: t, pageParams: r }) {
  const s = t.length - 1;
  return t.length > 0 ? e.getNextPageParam(t[s], t, r[s], r) : void 0;
}
function Kc(e, { pages: t, pageParams: r }) {
  return t.length > 0 ? e.getPreviousPageParam?.(t[0], t, r[0], r) : void 0;
}
var Vc = class extends Xn {
  #e;
  #t;
  #r;
  #n;
  #o;
  #s;
  #c;
  #a;
  constructor(e) {
    (super(),
      (this.#a = !1),
      (this.#c = e.defaultOptions),
      this.setOptions(e.options),
      (this.observers = []),
      (this.#o = e.client),
      (this.#n = this.#o.getQueryCache()),
      (this.queryKey = e.queryKey),
      (this.queryHash = e.queryHash),
      (this.#t = Ws(this.options)),
      (this.state = e.state ?? this.#t),
      this.scheduleGc());
  }
  get meta() {
    return this.options.meta;
  }
  get queryType() {
    return this.#e;
  }
  get promise() {
    return this.#s?.promise;
  }
  setOptions(e) {
    if (
      ((this.options = { ...this.#c, ...e }),
      e?._type && (this.#e = e._type),
      this.updateGcTime(this.options.gcTime),
      this.state && this.state.data === void 0)
    ) {
      const t = Ws(this.options);
      t.data !== void 0 && (this.setState(Us(t.data, t.dataUpdatedAt)), (this.#t = t));
    }
  }
  optionalRemove() {
    !this.observers.length && this.state.fetchStatus === "idle" && this.#n.remove(this);
  }
  setData(e, t) {
    const r = Dc(this.state.data, e, this.options);
    return (
      this.#i({ data: r, type: "success", dataUpdatedAt: t?.updatedAt, manual: t?.manual }),
      r
    );
  }
  setState(e) {
    this.#i({ type: "setState", state: e });
  }
  cancel(e) {
    const t = this.#s?.promise;
    return (this.#s?.cancel(e), t ? t.then(se).catch(se) : Promise.resolve());
  }
  destroy() {
    (super.destroy(), this.cancel({ silent: !0 }));
  }
  get resetState() {
    return this.#t;
  }
  reset() {
    (this.destroy(), this.setState(this.resetState));
  }
  isActive() {
    return this.observers.some((e) => Nc(e.options.enabled, this) !== !1);
  }
  isDisabled() {
    return this.getObserversCount() > 0
      ? !this.isActive()
      : this.options.queryFn === $r || !this.isFetched();
  }
  isFetched() {
    return this.state.dataUpdateCount + this.state.errorUpdateCount > 0;
  }
  isStatic() {
    return this.getObserversCount() > 0
      ? this.observers.some((e) => Cr(e.options.staleTime, this) === "static")
      : !1;
  }
  isStale() {
    return this.getObserversCount() > 0
      ? this.observers.some((e) => e.getCurrentResult().isStale)
      : this.state.data === void 0 || this.state.isInvalidated;
  }
  isStaleByTime(e = 0) {
    return this.state.data === void 0
      ? !0
      : e === "static"
        ? !1
        : this.state.isInvalidated
          ? !0
          : !Ec(this.state.dataUpdatedAt, e);
  }
  onFocus() {
    (this.observers.find((t) => t.shouldFetchOnWindowFocus())?.refetch({ cancelRefetch: !1 }),
      this.#s?.continue());
  }
  onOnline() {
    (this.observers.find((t) => t.shouldFetchOnReconnect())?.refetch({ cancelRefetch: !1 }),
      this.#s?.continue());
  }
  addObserver(e) {
    this.observers.includes(e) ||
      (this.observers.push(e),
      this.clearGcTimeout(),
      this.#n.notify({ type: "observerAdded", query: this, observer: e }));
  }
  removeObserver(e) {
    this.observers.includes(e) &&
      ((this.observers = this.observers.filter((t) => t !== e)),
      this.observers.length ||
        (this.#s && (this.#a || this.#l() ? this.#s.cancel({ revert: !0 }) : this.#s.cancelRetry()),
        this.scheduleGc()),
      this.#n.notify({ type: "observerRemoved", query: this, observer: e }));
  }
  getObserversCount() {
    return this.observers.length;
  }
  #l() {
    return this.state.fetchStatus === "paused" && this.state.status === "pending";
  }
  invalidate() {
    this.state.isInvalidated || this.#i({ type: "invalidate" });
  }
  async fetch(e, t) {
    if (this.state.fetchStatus !== "idle" && this.#s?.status() !== "rejected") {
      if (this.state.data !== void 0 && t?.cancelRefetch) this.cancel({ silent: !0 });
      else if (this.#s) return (this.#s.continueRetry(), this.#s.promise);
    }
    if ((e && this.setOptions(e), !this.options.queryFn)) {
      const c = this.observers.find((d) => d.options.queryFn);
      c && this.setOptions(c.options);
    }
    const r = new AbortController(),
      s = (c) => {
        Object.defineProperty(c, "signal", {
          enumerable: !0,
          get: () => ((this.#a = !0), r.signal),
        });
      },
      n = () => {
        const c = Vn(this.options, t),
          u = (() => {
            const h = { client: this.#o, queryKey: this.queryKey, meta: this.meta };
            return (s(h), h);
          })();
        return ((this.#a = !1), this.options.persister ? this.options.persister(c, u, this) : c(u));
      },
      a = (() => {
        const c = {
          fetchOptions: t,
          options: this.options,
          queryKey: this.queryKey,
          client: this.#o,
          state: this.state,
          fetchFn: n,
        };
        return (s(c), c);
      })();
    ((this.#e === "infinite" ? qc(this.options.pages) : this.options.behavior)?.onFetch(a, this),
      (this.#r = this.state),
      (this.state.fetchStatus === "idle" || this.state.fetchMeta !== a.fetchOptions?.meta) &&
        this.#i({ type: "fetch", meta: a.fetchOptions?.meta }),
      (this.#s = Qn({
        initialPromise: t?.initialPromise,
        fn: a.fetchFn,
        onCancel: (c) => {
          (c instanceof Lr && c.revert && this.setState({ ...this.#r, fetchStatus: "idle" }),
            r.abort());
        },
        onFail: (c, d) => {
          this.#i({ type: "failed", failureCount: c, error: d });
        },
        onPause: () => {
          this.#i({ type: "pause" });
        },
        onContinue: () => {
          this.#i({ type: "continue" });
        },
        retry: a.options.retry,
        retryDelay: a.options.retryDelay,
        networkMode: a.options.networkMode,
        canRun: () => !0,
      })));
    try {
      const c = await this.#s.start();
      if (c === void 0) throw new Error(`${this.queryHash} data is undefined`);
      return (
        this.setData(c),
        this.#n.config.onSuccess?.(c, this),
        this.#n.config.onSettled?.(c, this.state.error, this),
        c
      );
    } catch (c) {
      if (c instanceof Lr) {
        if (c.silent) return this.#s.promise;
        if (c.revert) {
          if (this.state.data === void 0) throw c;
          return this.state.data;
        }
      }
      throw (
        this.#i({ type: "error", error: c }),
        this.#n.config.onError?.(c, this),
        this.#n.config.onSettled?.(this.state.data, c, this),
        c
      );
    } finally {
      this.scheduleGc();
    }
  }
  #i(e) {
    const t = (r) => {
      switch (e.type) {
        case "failed":
          return { ...r, fetchFailureCount: e.failureCount, fetchFailureReason: e.error };
        case "pause":
          return { ...r, fetchStatus: "paused" };
        case "continue":
          return { ...r, fetchStatus: "fetching" };
        case "fetch":
          return { ...r, ...Yc(r.data, this.options), fetchMeta: e.meta ?? null };
        case "success":
          const s = {
            ...r,
            ...Us(e.data, e.dataUpdatedAt),
            dataUpdateCount: r.dataUpdateCount + 1,
            ...(!e.manual && {
              fetchStatus: "idle",
              fetchFailureCount: 0,
              fetchFailureReason: null,
            }),
          };
          return ((this.#r = e.manual ? s : void 0), s);
        case "error":
          const n = e.error;
          return {
            ...r,
            error: n,
            errorUpdateCount: r.errorUpdateCount + 1,
            errorUpdatedAt: Date.now(),
            fetchFailureCount: r.fetchFailureCount + 1,
            fetchFailureReason: n,
            fetchStatus: "idle",
            status: "error",
            isInvalidated: !0,
          };
        case "invalidate":
          return { ...r, isInvalidated: !0 };
        case "setState":
          return { ...r, ...e.state };
      }
    };
    ((this.state = t(this.state)),
      Y.batch(() => {
        (this.observers.forEach((r) => {
          r.onQueryUpdate();
        }),
          this.#n.notify({ query: this, type: "updated", action: e }));
      }));
  }
};
function Yc(e, t) {
  return {
    fetchFailureCount: 0,
    fetchFailureReason: null,
    fetchStatus: Jn(t.networkMode) ? "fetching" : "paused",
    ...(e === void 0 && { error: null, status: "pending" }),
  };
}
function Us(e, t) {
  return {
    data: e,
    dataUpdatedAt: t ?? Date.now(),
    error: null,
    isInvalidated: !1,
    status: "success",
  };
}
function Ws(e) {
  const t = typeof e.initialData == "function" ? e.initialData() : e.initialData,
    r = t !== void 0,
    s = r
      ? typeof e.initialDataUpdatedAt == "function"
        ? e.initialDataUpdatedAt()
        : e.initialDataUpdatedAt
      : 0;
  return {
    data: t,
    dataUpdateCount: 0,
    dataUpdatedAt: r ? (s ?? Date.now()) : 0,
    error: null,
    errorUpdateCount: 0,
    errorUpdatedAt: 0,
    fetchFailureCount: 0,
    fetchFailureReason: null,
    fetchMeta: null,
    isInvalidated: !1,
    status: r ? "success" : "pending",
    fetchStatus: "idle",
  };
}
var Jc = class extends Xn {
  #e;
  #t;
  #r;
  #n;
  constructor(e) {
    (super(),
      (this.#e = e.client),
      (this.mutationId = e.mutationId),
      (this.#r = e.mutationCache),
      (this.#t = []),
      (this.state = e.state || Qc()),
      this.setOptions(e.options),
      this.scheduleGc());
  }
  setOptions(e) {
    ((this.options = e), this.updateGcTime(this.options.gcTime));
  }
  get meta() {
    return this.options.meta;
  }
  addObserver(e) {
    this.#t.includes(e) ||
      (this.#t.push(e),
      this.clearGcTimeout(),
      this.#r.notify({ type: "observerAdded", mutation: this, observer: e }));
  }
  removeObserver(e) {
    ((this.#t = this.#t.filter((t) => t !== e)),
      this.scheduleGc(),
      this.#r.notify({ type: "observerRemoved", mutation: this, observer: e }));
  }
  optionalRemove() {
    this.#t.length || (this.state.status === "pending" ? this.scheduleGc() : this.#r.remove(this));
  }
  continue() {
    return this.#n?.continue() ?? this.execute(this.state.variables);
  }
  async execute(e) {
    const t = () => {
        this.#o({ type: "continue" });
      },
      r = { client: this.#e, meta: this.options.meta, mutationKey: this.options.mutationKey };
    this.#n = Qn({
      fn: () =>
        this.options.mutationFn
          ? this.options.mutationFn(e, r)
          : Promise.reject(new Error("No mutationFn found")),
      onFail: (o, a) => {
        this.#o({ type: "failed", failureCount: o, error: a });
      },
      onPause: () => {
        this.#o({ type: "pause" });
      },
      onContinue: t,
      retry: this.options.retry ?? 0,
      retryDelay: this.options.retryDelay,
      networkMode: this.options.networkMode,
      canRun: () => this.#r.canRun(this),
    });
    const s = this.state.status === "pending",
      n = !this.#n.canStart();
    try {
      if (s) t();
      else {
        (this.#o({ type: "pending", variables: e, isPaused: n }),
          this.#r.config.onMutate && (await this.#r.config.onMutate(e, this, r)));
        const a = await this.options.onMutate?.(e, r);
        a !== this.state.context &&
          this.#o({ type: "pending", context: a, variables: e, isPaused: n });
      }
      const o = await this.#n.start();
      return (
        await this.#r.config.onSuccess?.(o, e, this.state.context, this, r),
        await this.options.onSuccess?.(o, e, this.state.context, r),
        await this.#r.config.onSettled?.(
          o,
          null,
          this.state.variables,
          this.state.context,
          this,
          r,
        ),
        await this.options.onSettled?.(o, null, e, this.state.context, r),
        this.#o({ type: "success", data: o }),
        o
      );
    } catch (o) {
      try {
        await this.#r.config.onError?.(o, e, this.state.context, this, r);
      } catch (a) {
        Promise.reject(a);
      }
      try {
        await this.options.onError?.(o, e, this.state.context, r);
      } catch (a) {
        Promise.reject(a);
      }
      try {
        await this.#r.config.onSettled?.(
          void 0,
          o,
          this.state.variables,
          this.state.context,
          this,
          r,
        );
      } catch (a) {
        Promise.reject(a);
      }
      try {
        await this.options.onSettled?.(void 0, o, e, this.state.context, r);
      } catch (a) {
        Promise.reject(a);
      }
      throw (this.#o({ type: "error", error: o }), o);
    } finally {
      this.#r.runNext(this);
    }
  }
  #o(e) {
    const t = (r) => {
      switch (e.type) {
        case "failed":
          return { ...r, failureCount: e.failureCount, failureReason: e.error };
        case "pause":
          return { ...r, isPaused: !0 };
        case "continue":
          return { ...r, isPaused: !1 };
        case "pending":
          return {
            ...r,
            context: e.context,
            data: void 0,
            failureCount: 0,
            failureReason: null,
            error: null,
            isPaused: e.isPaused,
            status: "pending",
            variables: e.variables,
            submittedAt: Date.now(),
          };
        case "success":
          return {
            ...r,
            data: e.data,
            failureCount: 0,
            failureReason: null,
            error: null,
            status: "success",
            isPaused: !1,
          };
        case "error":
          return {
            ...r,
            data: void 0,
            error: e.error,
            failureCount: r.failureCount + 1,
            failureReason: e.error,
            isPaused: !1,
            status: "error",
          };
      }
    };
    ((this.state = t(this.state)),
      Y.batch(() => {
        (this.#t.forEach((r) => {
          r.onMutationUpdate(e);
        }),
          this.#r.notify({ mutation: this, type: "updated", action: e }));
      }));
  }
};
function Qc() {
  return {
    context: void 0,
    data: void 0,
    error: null,
    failureCount: 0,
    failureReason: null,
    isPaused: !1,
    status: "idle",
    variables: void 0,
    submittedAt: 0,
  };
}
var Xc = class extends Kt {
  constructor(e = {}) {
    (super(), (this.config = e), (this.#e = new Set()), (this.#t = new Map()), (this.#r = 0));
  }
  #e;
  #t;
  #r;
  build(e, t, r) {
    const s = new Jc({
      client: e,
      mutationCache: this,
      mutationId: ++this.#r,
      options: e.defaultMutationOptions(t),
      state: r,
    });
    return (this.add(s), s);
  }
  add(e) {
    this.#e.add(e);
    const t = It(e);
    if (typeof t == "string") {
      const r = this.#t.get(t);
      r ? r.push(e) : this.#t.set(t, [e]);
    }
    this.notify({ type: "added", mutation: e });
  }
  remove(e) {
    if (this.#e.delete(e)) {
      const t = It(e);
      if (typeof t == "string") {
        const r = this.#t.get(t);
        if (r)
          if (r.length > 1) {
            const s = r.indexOf(e);
            s !== -1 && r.splice(s, 1);
          } else r[0] === e && this.#t.delete(t);
      }
    }
    this.notify({ type: "removed", mutation: e });
  }
  canRun(e) {
    const t = It(e);
    if (typeof t == "string") {
      const s = this.#t.get(t)?.find((n) => n.state.status === "pending");
      return !s || s === e;
    } else return !0;
  }
  runNext(e) {
    const t = It(e);
    return typeof t == "string"
      ? (this.#t
          .get(t)
          ?.find((s) => s !== e && s.state.isPaused)
          ?.continue() ?? Promise.resolve())
      : Promise.resolve();
  }
  clear() {
    Y.batch(() => {
      (this.#e.forEach((e) => {
        this.notify({ type: "removed", mutation: e });
      }),
        this.#e.clear(),
        this.#t.clear());
    });
  }
  getAll() {
    return Array.from(this.#e);
  }
  find(e) {
    const t = { exact: !0, ...e };
    return this.getAll().find((r) => Ds(t, r));
  }
  findAll(e = {}) {
    return this.getAll().filter((t) => Ds(e, t));
  }
  notify(e) {
    Y.batch(() => {
      this.listeners.forEach((t) => {
        t(e);
      });
    });
  }
  resumePausedMutations() {
    const e = this.getAll().filter((t) => t.state.isPaused);
    return Y.batch(() => Promise.all(e.map((t) => t.continue().catch(se))));
  }
};
function It(e) {
  return e.options.scope?.id;
}
var Zc = class extends Kt {
    constructor(e = {}) {
      (super(), (this.config = e), (this.#e = new Map()));
    }
    #e;
    build(e, t, r) {
      const s = t.queryKey,
        n = t.queryHash ?? Br(s, t);
      let o = this.get(n);
      return (
        o ||
          ((o = new Vc({
            client: e,
            queryKey: s,
            queryHash: n,
            options: e.defaultQueryOptions(t),
            state: r,
            defaultOptions: e.getQueryDefaults(s),
          })),
          this.add(o)),
        o
      );
    }
    add(e) {
      this.#e.has(e.queryHash) ||
        (this.#e.set(e.queryHash, e), this.notify({ type: "added", query: e }));
    }
    remove(e) {
      const t = this.#e.get(e.queryHash);
      t &&
        (e.destroy(),
        t === e && this.#e.delete(e.queryHash),
        this.notify({ type: "removed", query: e }));
    }
    clear() {
      Y.batch(() => {
        this.getAll().forEach((e) => {
          this.remove(e);
        });
      });
    }
    get(e) {
      return this.#e.get(e);
    }
    getAll() {
      return [...this.#e.values()];
    }
    find(e) {
      const t = { exact: !0, ...e };
      return this.getAll().find((r) => Ms(t, r));
    }
    findAll(e = {}) {
      const t = this.getAll();
      return Object.keys(e).length > 0 ? t.filter((r) => Ms(e, r)) : t;
    }
    notify(e) {
      Y.batch(() => {
        this.listeners.forEach((t) => {
          t(e);
        });
      });
    }
    onFocus() {
      Y.batch(() => {
        this.getAll().forEach((e) => {
          e.onFocus();
        });
      });
    }
    onOnline() {
      Y.batch(() => {
        this.getAll().forEach((e) => {
          e.onOnline();
        });
      });
    }
  },
  el = class {
    #e;
    #t;
    #r;
    #n;
    #o;
    #s;
    #c;
    #a;
    constructor(e = {}) {
      ((this.#e = e.queryCache || new Zc()),
        (this.#t = e.mutationCache || new Xc()),
        (this.#r = e.defaultOptions || {}),
        (this.#n = new Map()),
        (this.#o = new Map()),
        (this.#s = 0));
    }
    mount() {
      (this.#s++,
        this.#s === 1 &&
          ((this.#c = qn.subscribe(async (e) => {
            e && (await this.resumePausedMutations(), this.#e.onFocus());
          })),
          (this.#a = Ht.subscribe(async (e) => {
            e && (await this.resumePausedMutations(), this.#e.onOnline());
          }))));
    }
    unmount() {
      (this.#s--,
        this.#s === 0 && (this.#c?.(), (this.#c = void 0), this.#a?.(), (this.#a = void 0)));
    }
    isFetching(e) {
      return this.#e.findAll({ ...e, fetchStatus: "fetching" }).length;
    }
    isMutating(e) {
      return this.#t.findAll({ ...e, status: "pending" }).length;
    }
    getQueryData(e) {
      const t = this.defaultQueryOptions({ queryKey: e });
      return this.#e.get(t.queryHash)?.state.data;
    }
    ensureQueryData(e) {
      const t = this.defaultQueryOptions(e),
        r = this.#e.build(this, t),
        s = r.state.data;
      return s === void 0
        ? this.fetchQuery(e)
        : (e.revalidateIfStale && r.isStaleByTime(Cr(t.staleTime, r)) && this.prefetchQuery(t),
          Promise.resolve(s));
    }
    getQueriesData(e) {
      return this.#e.findAll(e).map(({ queryKey: t, state: r }) => {
        const s = r.data;
        return [t, s];
      });
    }
    setQueryData(e, t, r) {
      const s = this.defaultQueryOptions({ queryKey: e }),
        o = this.#e.get(s.queryHash)?.state.data,
        a = jc(t, o);
      if (a !== void 0) return this.#e.build(this, s).setData(a, { ...r, manual: !0 });
    }
    setQueriesData(e, t, r) {
      return Y.batch(() =>
        this.#e.findAll(e).map(({ queryKey: s }) => [s, this.setQueryData(s, t, r)]),
      );
    }
    getQueryState(e) {
      const t = this.defaultQueryOptions({ queryKey: e });
      return this.#e.get(t.queryHash)?.state;
    }
    removeQueries(e) {
      const t = this.#e;
      Y.batch(() => {
        t.findAll(e).forEach((r) => {
          t.remove(r);
        });
      });
    }
    resetQueries(e, t) {
      const r = this.#e;
      return Y.batch(
        () => (
          r.findAll(e).forEach((s) => {
            s.reset();
          }),
          this.refetchQueries({ type: "active", ...e }, t)
        ),
      );
    }
    cancelQueries(e, t = {}) {
      const r = { revert: !0, ...t },
        s = Y.batch(() => this.#e.findAll(e).map((n) => n.cancel(r)));
      return Promise.all(s).then(se).catch(se);
    }
    invalidateQueries(e, t = {}) {
      return Y.batch(
        () => (
          this.#e.findAll(e).forEach((r) => {
            r.invalidate();
          }),
          e?.refetchType === "none"
            ? Promise.resolve()
            : this.refetchQueries({ ...e, type: e?.refetchType ?? e?.type ?? "active" }, t)
        ),
      );
    }
    refetchQueries(e, t = {}) {
      const r = { ...t, cancelRefetch: t.cancelRefetch ?? !0 },
        s = Y.batch(() =>
          this.#e
            .findAll(e)
            .filter((n) => !n.isDisabled() && !n.isStatic())
            .map((n) => {
              let o = n.fetch(void 0, r);
              return (
                r.throwOnError || (o = o.catch(se)),
                n.state.fetchStatus === "paused" ? Promise.resolve() : o
              );
            }),
        );
      return Promise.all(s).then(se);
    }
    fetchQuery(e) {
      const t = this.defaultQueryOptions(e);
      t.retry === void 0 && (t.retry = !1);
      const r = this.#e.build(this, t);
      return r.isStaleByTime(Cr(t.staleTime, r)) ? r.fetch(t) : Promise.resolve(r.state.data);
    }
    prefetchQuery(e) {
      return this.fetchQuery(e).then(se).catch(se);
    }
    fetchInfiniteQuery(e) {
      return ((e._type = "infinite"), this.fetchQuery(e));
    }
    prefetchInfiniteQuery(e) {
      return this.fetchInfiniteQuery(e).then(se).catch(se);
    }
    ensureInfiniteQueryData(e) {
      return ((e._type = "infinite"), this.ensureQueryData(e));
    }
    resumePausedMutations() {
      return Ht.isOnline() ? this.#t.resumePausedMutations() : Promise.resolve();
    }
    getQueryCache() {
      return this.#e;
    }
    getMutationCache() {
      return this.#t;
    }
    getDefaultOptions() {
      return this.#r;
    }
    setDefaultOptions(e) {
      this.#r = e;
    }
    setQueryDefaults(e, t) {
      this.#n.set(mt(e), { queryKey: e, defaultOptions: t });
    }
    getQueryDefaults(e) {
      const t = [...this.#n.values()],
        r = {};
      return (
        t.forEach((s) => {
          gt(e, s.queryKey) && Object.assign(r, s.defaultOptions);
        }),
        r
      );
    }
    setMutationDefaults(e, t) {
      this.#o.set(mt(e), { mutationKey: e, defaultOptions: t });
    }
    getMutationDefaults(e) {
      const t = [...this.#o.values()],
        r = {};
      return (
        t.forEach((s) => {
          gt(e, s.mutationKey) && Object.assign(r, s.defaultOptions);
        }),
        r
      );
    }
    defaultQueryOptions(e) {
      if (e._defaulted) return e;
      const t = { ...this.#r.queries, ...this.getQueryDefaults(e.queryKey), ...e, _defaulted: !0 };
      return (
        t.queryHash || (t.queryHash = Br(t.queryKey, t)),
        t.refetchOnReconnect === void 0 && (t.refetchOnReconnect = t.networkMode !== "always"),
        t.throwOnError === void 0 && (t.throwOnError = !!t.suspense),
        !t.networkMode && t.persister && (t.networkMode = "offlineFirst"),
        t.queryFn === $r && (t.enabled = !1),
        t
      );
    }
    defaultMutationOptions(e) {
      return e?._defaulted
        ? e
        : {
            ...this.#r.mutations,
            ...(e?.mutationKey && this.getMutationDefaults(e.mutationKey)),
            ...e,
            _defaulted: !0,
          };
    }
    clear() {
      (this.#e.clear(), this.#t.clear());
    }
  },
  tl = x.createContext(void 0),
  rl = ({ client: e, children: t }) => (
    x.useEffect(
      () => (
        e.mount(),
        () => {
          e.unmount();
        }
      ),
      [e],
    ),
    l.jsx(tl.Provider, { value: e, children: t })
  );
const sl = "/assets/styles-ZOw2R66A.css",
  nl = M({ method: "GET" }).handler(
    B("a89391221bf6d4f3c3355bf0dfc3e706c4f9b13cc230e42657eaa76688007322"),
  ),
  ol = M({ method: "POST" }).handler(
    B("fe521dc5b8ea6cac3c068abd8536973e9e6b2e73ee00f80cc9617f99f0e4e5b4"),
  ),
  al = M({ method: "POST" }).handler(
    B("e29d9c58ccb381c467fd97ec72f1e31b8c84c96077dc15cb2d778a800c642838"),
  ),
  il = M({ method: "POST" }).handler(
    B("be9659ec40533955d232ff49315c9aa649bd7db83b1fcfc216a660325004c844"),
  ),
  cl = M({ method: "POST" }).handler(
    B("6fc40750dfd6c278f7c72bfbb36ff3225675daeec7f93fc991cb7f630fa6730c"),
  ),
  ll = M({ method: "GET" }).handler(
    B("6be988dd8f4ee314ac93db05da28d1eb8f2018797e18c521292bed6c4d850965"),
  ),
  dl = M({ method: "POST" }).handler(
    B("992e611799973d8db599cacccf15200b19b5669290f9410c9c9e16579f533001"),
  );
class ul {
  dbPromise = null;
  initDb() {
    return this.dbPromise
      ? this.dbPromise
      : ((this.dbPromise = new Promise((t, r) => {
          if (typeof window > "u" || !window.indexedDB) {
            r(new Error("IndexedDB is not supported on the server or this browser."));
            return;
          }
          const s = indexedDB.open("apextrace_local_telemetry", 1);
          ((s.onupgradeneeded = () => {
            const n = s.result;
            n.objectStoreNames.contains("blobs") || n.createObjectStore("blobs");
          }),
            (s.onsuccess = () => t(s.result)),
            (s.onerror = () => r(s.error)));
        })),
        this.dbPromise);
  }
  async saveBlob(t, r) {
    const s = await this.initDb();
    return new Promise((n, o) => {
      const c = s.transaction("blobs", "readwrite").objectStore("blobs").put(r, t);
      ((c.onsuccess = () => n()), (c.onerror = () => o(c.error)));
    });
  }
  async getBlob(t) {
    try {
      const r = await this.initDb();
      return new Promise((s, n) => {
        const i = r.transaction("blobs", "readonly").objectStore("blobs").get(t);
        ((i.onsuccess = () => s(i.result ?? null)), (i.onerror = () => n(i.error)));
      });
    } catch {
      return null;
    }
  }
  async removeBlob(t) {
    try {
      const r = await this.initDb();
      return new Promise((s, n) => {
        const i = r.transaction("blobs", "readwrite").objectStore("blobs").delete(t);
        ((i.onsuccess = () => s()), (i.onerror = () => n(i.error)));
      });
    } catch {}
  }
}
const dr = new ul(),
  hl = new Proxy(
    {},
    {
      get(e, t) {
        return t === "auth"
          ? {
              onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
              getSession: async () => ({ data: { session: null } }),
              signOut: async () => {},
            }
          : () => {
              const r = new Proxy(
                {},
                {
                  get(s, n) {
                    return n === "then" ? (o) => o({ data: null, error: null }) : () => r;
                  },
                },
              );
              return r;
            };
      },
    },
  );
function fl() {
  let e;
  try {
    const t = "https://bqnyztfkpsvmvelfdzgw.supabase.co",
      r =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxbnl6dGZrcHN2bXZlbGZkemd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwMzkwMzcsImV4cCI6MjA5NDYxNTAzN30.F4TUaBCIRyopmCuMHJIjjFPOzVaUITJrE8LLXlfSZ-g";
    t &&
      r &&
      (e = Ro(t, r, {
        auth: {
          storage: typeof window < "u" ? localStorage : void 0,
          persistSession: !0,
          autoRefreshToken: !0,
        },
      }));
  } catch (t) {
    (console.warn("[Supabase] Client creation failed. Falling back to mock.", t), (e = hl));
  }
  return new Proxy(e, {
    get(t, r, s) {
      return r === "from"
        ? (n) => {
            if (
              typeof window < "u" &&
              (localStorage.getItem("apex_local_session") || !1) &&
              n === "telemetry_sessions"
            ) {
              const a = {
                select: () => a,
                order: () => a,
                eq: (i, c) => ((a._eqId = c), a),
                single: () => a,
                insert: (i) => ((a._insertPayload = i), a),
                delete: () => ((a._isDelete = !0), a),
                then: async (i) => {
                  try {
                    if (a._isDelete && a._eqId) {
                      const c = await il({ data: a._eqId });
                      i(c);
                    } else if (a._insertPayload) {
                      const c = await al({ data: a._insertPayload });
                      i(c);
                    } else if (a._eqId) {
                      const c = await ol({ data: a._eqId });
                      i(c);
                    } else {
                      const c = await nl();
                      i(c);
                    }
                  } catch (c) {
                    i({ data: null, error: { message: c.message } });
                  }
                },
              };
              return a;
            }
            return t.from(n);
          }
        : r === "storage" &&
            typeof window < "u" &&
            (localStorage.getItem("apex_local_session") || !1)
          ? {
              from: (o) =>
                o === "telemetry"
                  ? {
                      upload: async (a, i) => {
                        try {
                          return (await dr.saveBlob(a, i), { data: { path: a }, error: null });
                        } catch (c) {
                          return { data: null, error: c };
                        }
                      },
                      download: async (a) => {
                        try {
                          const i = await dr.getBlob(a);
                          if (!i) throw new Error("Local blob not found in IndexedDB");
                          return { data: i, error: null };
                        } catch (i) {
                          return { data: null, error: i };
                        }
                      },
                      remove: async (a) => {
                        try {
                          for (const i of a) await dr.removeBlob(i);
                          return { data: a, error: null };
                        } catch (i) {
                          return { data: null, error: i };
                        }
                      },
                    }
                  : t.storage.from(o),
            }
          : Reflect.get(t, r, s);
    },
  });
}
let ur;
const Ne = new Proxy(
    {},
    {
      get(e, t, r) {
        return (ur || (ur = fl()), Reflect.get(ur, t, r));
      },
    },
  ),
  Zn = x.createContext({ session: null, user: null, loading: !0, signOut: async () => {} });
function pl({ children: e }) {
  const [t, r] = x.useState(null),
    [s, n] = x.useState(!0);
  return (
    x.useEffect(() => {
      const o = typeof window < "u" ? localStorage.getItem("apex_local_session") : null;
      if (o)
        try {
          (r(JSON.parse(o)), n(!1));
          return;
        } catch {
          localStorage.removeItem("apex_local_session");
        }
      const { data: a } = Ne.auth.onAuthStateChange((i, c) => {
        if (c) r(c);
        else {
          const d = typeof window < "u" ? localStorage.getItem("apex_local_session") : null;
          if (d)
            try {
              r(JSON.parse(d));
            } catch {
              r(null);
            }
          else r(null);
        }
        n(!1);
      });
      return (
        Ne.auth.getSession().then(({ data: i }) => {
          (i.session && r(i.session), n(!1));
        }),
        () => a.subscription.unsubscribe()
      );
    }, []),
    l.jsx(Zn.Provider, {
      value: {
        session: t,
        user: t?.user ?? null,
        loading: s,
        signOut: async () => {
          typeof window < "u" && localStorage.removeItem("apex_local_session");
          try {
            await Ne.auth.signOut();
          } catch {}
          r(null);
        },
      },
      children: e,
    })
  );
}
const ml = () => x.useContext(Zn),
  gl = ({ ...e }) =>
    l.jsx(yo, {
      className: "toaster group",
      toastOptions: {
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      },
      ...e,
    }),
  He = 2,
  bl = "pitwall.theme",
  yl = {
    1: (e) => {
      const t = e?.theme ?? e;
      return {
        ...(typeof e == "object" && e !== null && "theme" in e ? e : {}),
        theme: t,
        version: 2,
      };
    },
  };
function Nu(e) {
  if (!e || typeof e != "object" || Array.isArray(e))
    throw new Error("Theme file must be a JSON object.");
  const t = e;
  let r;
  if (typeof t.version == "number" && Number.isFinite(t.version)) r = t.version;
  else if (typeof t.$schema == "string") {
    const a = t.$schema.match(/\/v(\d+)\b/);
    r = a ? Number(a[1]) : 1;
  } else r = 1;
  if (r > He)
    throw new Error(
      `Theme uses schema v${r}, but this app only understands up to v${He}. Update the app to import it.`,
    );
  let s = t;
  const n = [];
  for (let a = r; a < He; a++) {
    const i = yl[a];
    if (!i) throw new Error(`Missing migration from v${a} to v${a + 1}.`);
    ((s = i(s)), n.push(a + 1));
  }
  const o = s && typeof s == "object" && s.theme && typeof s.theme == "object" ? s.theme : s;
  return {
    file: {
      name: typeof s?.name == "string" ? s.name : void 0,
      description:
        typeof s?.description == "string" || s?.description === null ? s.description : void 0,
      theme: o,
    },
    fromVersion: r,
    toVersion: He,
    steps: n,
  };
}
function Au(e) {
  return {
    $schema: `${bl}/v${He}`,
    version: He,
    name: e.name,
    description: e.description ?? null,
    theme: e.theme,
  };
}
const Mu = [
    {
      label: "Surfaces",
      tokens: [
        { key: "background", label: "Background" },
        { key: "panel", label: "Panel" },
        { key: "panel-2", label: "Panel 2" },
        { key: "rail", label: "Rail" },
        { key: "muted", label: "Muted" },
        { key: "accent", label: "Accent" },
      ],
    },
    {
      label: "Text & borders",
      tokens: [
        { key: "foreground", label: "Foreground" },
        { key: "muted-foreground", label: "Muted text" },
        { key: "border", label: "Border" },
        { key: "border-strong", label: "Border strong" },
        { key: "grid-major", label: "Grid major" },
        { key: "grid-minor", label: "Grid minor" },
      ],
    },
    {
      label: "Brand",
      tokens: [
        { key: "primary", label: "Primary" },
        { key: "primary-foreground", label: "Primary text" },
        { key: "destructive", label: "Destructive" },
      ],
    },
    {
      label: "Channel traces",
      tokens: [
        { key: "ch-speed", label: "Speed" },
        { key: "ch-throttle", label: "Throttle" },
        { key: "ch-brake", label: "Brake" },
        { key: "ch-rpm", label: "RPM" },
        { key: "ch-gear", label: "Gear" },
        { key: "ch-steer", label: "Steering" },
        { key: "ch-glat", label: "Lat G" },
        { key: "ch-glong", label: "Long G" },
      ],
    },
  ],
  bt = {
    background: "#05070A",
    foreground: "#e2e4e8",
    panel: "#0B0F14",
    "panel-2": "#11161D",
    rail: "#05070A",
    border: "#1C2430",
    "border-strong": "#263241",
    primary: "#3B82F6",
    "primary-foreground": "#ffffff",
    muted: "#11161D",
    "muted-foreground": "#7a828c",
    accent: "#161C24",
    destructive: "#FF4D4D",
    "ch-speed": "#3B82F6",
    "ch-throttle": "#00D17F",
    "ch-brake": "#FF4D4D",
    "ch-rpm": "#FFB800",
    "ch-gear": "#e2e4e8",
    "ch-steer": "#8B5CF6",
    "ch-glat": "#FFB800",
    "ch-glong": "#3B82F6",
    "grid-major": "#1C2430",
    "grid-minor": "#11161D",
  },
  xl = {
    background: "#111318",
    foreground: "#d8dce4",
    panel: "#191d24",
    "panel-2": "#1f242c",
    rail: "#0d0f14",
    border: "#252a34",
    "border-strong": "#343c48",
    primary: "#60a5fa",
    "primary-foreground": "#0c1020",
    muted: "#1f242c",
    "muted-foreground": "#6b7280",
    accent: "#252a34",
    destructive: "#f87171",
    "ch-speed": "#60a5fa",
    "ch-throttle": "#34d399",
    "ch-brake": "#f87171",
    "ch-rpm": "#fbbf24",
    "ch-gear": "#d8dce4",
    "ch-steer": "#a78bfa",
    "ch-glat": "#fb923c",
    "ch-glong": "#38bdf8",
    "grid-major": "#252a34",
    "grid-minor": "#1a1f28",
  },
  vl = {
    background: "#000000",
    foreground: "#ffffff",
    panel: "#0a0a0e",
    "panel-2": "#111115",
    rail: "#000000",
    border: "#1e1e24",
    "border-strong": "#2e2e36",
    primary: "#ff3b30",
    "primary-foreground": "#ffffff",
    muted: "#111115",
    "muted-foreground": "#888892",
    accent: "#1a1a20",
    destructive: "#ff453a",
    "ch-speed": "#00d4ff",
    "ch-throttle": "#30d158",
    "ch-brake": "#ff3b30",
    "ch-rpm": "#ff9f0a",
    "ch-gear": "#ffffff",
    "ch-steer": "#bf5af2",
    "ch-glat": "#ff9500",
    "ch-glong": "#0a84ff",
    "grid-major": "#222228",
    "grid-minor": "#141418",
  },
  wl = {
    background: "#f5f6f8",
    foreground: "#1a1d24",
    panel: "#ffffff",
    "panel-2": "#eef0f4",
    rail: "#e8eaef",
    border: "#d0d4dc",
    "border-strong": "#b0b8c4",
    primary: "#0066cc",
    "primary-foreground": "#ffffff",
    muted: "#eef0f4",
    "muted-foreground": "#5c6370",
    accent: "#dde0e8",
    destructive: "#d32f2f",
    "ch-speed": "#0066cc",
    "ch-throttle": "#16a34a",
    "ch-brake": "#d32f2f",
    "ch-rpm": "#b8860b",
    "ch-gear": "#1a1d24",
    "ch-steer": "#7c3aed",
    "ch-glat": "#c05000",
    "ch-glong": "#1d4ed8",
    "grid-major": "#c8ccd4",
    "grid-minor": "#e0e4ec",
  },
  Sl = {
    background: "#0c0c0f",
    foreground: "#e0e0e4",
    panel: "#141418",
    "panel-2": "#1a1a20",
    rail: "#080808",
    border: "#2a2a32",
    "border-strong": "#3a3a44",
    primary: "#e63322",
    "primary-foreground": "#ffffff",
    muted: "#1a1a20",
    "muted-foreground": "#7a7a84",
    accent: "#222228",
    destructive: "#ff3b30",
    "ch-speed": "#00bcd4",
    "ch-throttle": "#4caf50",
    "ch-brake": "#e63322",
    "ch-rpm": "#ff9800",
    "ch-gear": "#e0e0e4",
    "ch-steer": "#e040fb",
    "ch-glat": "#ff6b35",
    "ch-glong": "#2196f3",
    "grid-major": "#2a2a32",
    "grid-minor": "#1a1a20",
  },
  Rl = {
    background: "#0d0d10",
    foreground: "#e8e8ec",
    panel: "#14171c",
    "panel-2": "#1e232b",
    rail: "#08080c",
    border: "#2a2f38",
    "border-strong": "#3a4050",
    primary: "#e10600",
    "primary-foreground": "#ffffff",
    muted: "#1e232b",
    "muted-foreground": "#aab0b9",
    accent: "#252a34",
    destructive: "#e10600",
    "ch-speed": "#e10600",
    "ch-throttle": "#00e676",
    "ch-brake": "#e10600",
    "ch-rpm": "#ffb300",
    "ch-gear": "#e8e8ec",
    "ch-steer": "#b026ff",
    "ch-glat": "#0d6efd",
    "ch-glong": "#b026ff",
    "grid-major": "#2a2f38",
    "grid-minor": "#1a1f26",
  },
  kl = {
    background: "#0a0c10",
    foreground: "#e4e6ea",
    panel: "#111520",
    "panel-2": "#1a1f2c",
    rail: "#060810",
    border: "#252a36",
    "border-strong": "#353c4a",
    primary: "#00e676",
    "primary-foreground": "#0a0c10",
    muted: "#1a1f2c",
    "muted-foreground": "#8892a0",
    accent: "#202838",
    destructive: "#ff3b30",
    "ch-speed": "#00bcd4",
    "ch-throttle": "#00e676",
    "ch-brake": "#ff3b30",
    "ch-rpm": "#ff9800",
    "ch-gear": "#e4e6ea",
    "ch-steer": "#b388ff",
    "ch-glat": "#ff6b35",
    "ch-glong": "#448aff",
    "grid-major": "#252a36",
    "grid-minor": "#181d28",
  },
  _l = {
    background: "#000000",
    foreground: "#ffffff",
    panel: "#0a0c10",
    "panel-2": "#111520",
    rail: "#05070a",
    border: "#1C2430",
    "border-strong": "#263241",
    primary: "#00e676",
    "primary-foreground": "#000000",
    muted: "#111520",
    "muted-foreground": "#7a828c",
    accent: "#161C24",
    destructive: "#FF4D4D",
    "ch-speed": "#00e676",
    "ch-throttle": "#00D17F",
    "ch-brake": "#FF4D4D",
    "ch-rpm": "#FFB800",
    "ch-gear": "#ffffff",
    "ch-steer": "#8B5CF6",
    "ch-glat": "#FFB800",
    "ch-glong": "#3B82F6",
    "grid-major": "#1C2430",
    "grid-minor": "#11161D",
  },
  Du = [
    { id: "motec", label: "A - MoTeC Dark", theme: bt },
    { id: "modern", label: "B - Modern Flat", theme: xl },
    { id: "studio", label: "C - Studio Black", theme: vl },
    { id: "engineer", label: "D - Light Engineer", theme: wl },
    { id: "carbon", label: "E - Carbon UI", theme: Sl },
    { id: "f1", label: "F - Modern F1", theme: Rl },
    { id: "indycar", label: "G - IndyCar/NASCAR", theme: kl },
    { id: "racecommand", label: "H - Proper Race Command", theme: _l },
  ];
function Cl(e) {
  if (typeof document > "u") return;
  const t = document.documentElement,
    r = { ...bt, ...e };
  for (const [s, n] of Object.entries(r)) t.style.setProperty(`--${s}`, n);
}
const Tr = "apextrace.theme.v1";
function Pl() {
  if (typeof localStorage > "u") return null;
  try {
    const e = localStorage.getItem(Tr);
    return e ? JSON.parse(e) : null;
  } catch {
    return null;
  }
}
function hr(e) {
  typeof localStorage > "u" ||
    (e ? localStorage.setItem(Tr, JSON.stringify(e)) : localStorage.removeItem(Tr));
}
const Fu = [
    {
      id: "motec",
      label: "MoTeC / Professional Dark",
      subtitle: "Classic Engineering",
      description:
        "Classic engineering feel. Dense information layout, trusted by professionals. The reference standard.",
      swatches: ["#0f1114", "#181b20", "#22d3ee", "#22c55e"],
    },
    {
      id: "modern",
      label: "Modern Flat Dark",
      subtitle: "Clean & Minimal",
      description:
        "Clean, minimal, contemporary. Great balance of clarity and simplicity with modern typography.",
      swatches: ["#111318", "#191d24", "#60a5fa", "#a78bfa"],
    },
    {
      id: "studio",
      label: "Studio Black",
      subtitle: "High Contrast Performance",
      description:
        "Maximum contrast, bold typography. Built for quick at-a-glance performance reading.",
      swatches: ["#000000", "#0a0a0e", "#ff3b30", "#ff9500"],
    },
    {
      id: "engineer",
      label: "Light Engineer",
      subtitle: "Professional Light Mode",
      description: "Professional light mode. Reduces eye strain during long analysis sessions.",
      swatches: ["#f5f6f8", "#ffffff", "#0066cc", "#16a34a"],
    },
    {
      id: "carbon",
      label: "Carbon UI",
      subtitle: "F1 / Motorsport Inspired",
      description:
        "Carbon textures and red accents. Aggressive and performance focused. Built for race day.",
      swatches: ["#0c0c0f", "#141418", "#e63322", "#ff6b35"],
    },
    {
      id: "f1",
      label: "Modern F1",
      subtitle: "High Performance. Precision.",
      description:
        "F1-inspired. Carbon black background, F1 red accents, DIN-style headings. Built for open-wheeler telemetry.",
      swatches: ["#0d0d10", "#14171c", "#e10600", "#00e676"],
    },
    {
      id: "indycar",
      label: "IndyCar / NASCAR",
      subtitle: "Oval & Road Course",
      description:
        "Dense race data: running order, 4-sector splits, fuel strategy, caution flags. Green live accents on deep dark.",
      swatches: ["#0a0c10", "#111520", "#00e676", "#ff6b35"],
    },
    {
      id: "racecommand",
      label: "Proper Race Command",
      subtitle: "Pit Wall Commander",
      description:
        "Full race command strategy deck. Standing positions tables, dynamic track relative maps, 4-corner tire gauges, and live electronics selectors.",
      swatches: ["#05070a", "#0b0f14", "#00e676", "#3b82f6"],
    },
  ],
  eo = "pitwall.layout";
function Ll(e) {
  typeof document > "u" || document.documentElement.setAttribute("data-layout", e);
}
function Tl() {
  if (typeof localStorage > "u") return "motec";
  const e = localStorage.getItem(eo);
  return e &&
    ["motec", "modern", "studio", "engineer", "carbon", "f1", "indycar", "racecommand"].includes(e)
    ? e
    : "motec";
}
function Il(e) {
  typeof localStorage > "u" || localStorage.setItem(eo, e);
}
const to = x.createContext({
  theme: bt,
  setToken: () => {},
  setTheme: () => {},
  reset: () => {},
  layout: "motec",
  setLayout: () => {},
});
function jl({ children: e }) {
  const { user: t } = ml(),
    [r, s] = x.useState(() => Pl() ?? bt),
    [n, o] = x.useState(() => Tl()),
    a = x.useRef(null),
    i = x.useRef(null);
  (x.useEffect(() => {
    Cl(r);
  }, [r]),
    x.useEffect(() => {
      Ll(n);
    }, [n]));
  const c = x.useCallback((f) => {
    (o(f), Il(f));
  }, []);
  x.useEffect(() => {
    if (!t) {
      a.current = null;
      return;
    }
    a.current !== t.id &&
      ((a.current = t.id),
      t.id !== "local-user-id" &&
        Ne.from("user_preferences")
          .select("theme")
          .eq("user_id", t.id)
          .maybeSingle()
          .then(({ data: f }) => {
            f?.theme && (s(f.theme), hr(f.theme));
          }));
  }, [t]);
  const d = x.useCallback(
      (f) => {
        (hr(f),
          !(!t || t.id === "local-user-id") &&
            (i.current && clearTimeout(i.current),
            (i.current = setTimeout(() => {
              Ne.from("user_preferences")
                .upsert(
                  { user_id: t.id, theme: f, updated_at: new Date().toISOString() },
                  { onConflict: "user_id" },
                )
                .then(() => {});
            }, 500))));
      },
      [t],
    ),
    u = x.useCallback(
      (f, g) => {
        s((y) => {
          const m = { ...y, [f]: g };
          return (d(m), m);
        });
      },
      [d],
    ),
    h = x.useCallback(
      (f) => {
        (s(f), d(f));
      },
      [d],
    ),
    p = x.useCallback(() => {
      (s(bt),
        hr(null),
        t &&
          t.id !== "local-user-id" &&
          Ne.from("user_preferences")
            .upsert(
              { user_id: t.id, theme: null, updated_at: new Date().toISOString() },
              { onConflict: "user_id" },
            )
            .then(() => {}));
    }, [t]);
  return l.jsx(to.Provider, {
    value: { theme: r, setToken: u, setTheme: h, reset: p, layout: n, setLayout: c },
    children: e,
  });
}
const Bu = () => x.useContext(to);
class Ol {
  wsUrl;
  reconnectDelayMs;
  maxReconnectAttempts;
  ws = null;
  isConnected = !1;
  reconnectCount = 0;
  listeners = [];
  reconnectTimer = null;
  constructor(t) {
    ((this.wsUrl = t.wsUrl),
      (this.reconnectDelayMs = t.reconnectDelayMs ?? 3e3),
      (this.maxReconnectAttempts = t.maxReconnectAttempts ?? 1 / 0));
  }
  connect() {
    const t = () => {
      if (this.reconnectCount >= this.maxReconnectAttempts) {
        this.emit({
          type: "error",
          data: new Error(`Bridge: max reconnect attempts (${this.maxReconnectAttempts}) reached`),
        });
        return;
      }
      try {
        ((this.ws = new WebSocket(this.wsUrl)),
          (this.ws.onopen = () => {
            ((this.isConnected = !0), (this.reconnectCount = 0), this.emit({ type: "connect" }));
          }),
          (this.ws.onmessage = (r) => {
            try {
              const s = JSON.parse(r.data);
              if (s && s.type === "license") this.emit({ type: "license", data: s });
              else {
                let n = s;
                (s &&
                  typeof s == "object" &&
                  "payload" in s &&
                  typeof s.payload == "object" &&
                  (n = {
                    ...s.payload,
                    __meta: { carId: s.carId, teamId: s.teamId, driverId: s.driverId },
                  }),
                  this.emit({ type: "telemetry", data: n }));
              }
            } catch (s) {
              this.emit({ type: "error", data: s });
            }
          }),
          (this.ws.onerror = (r) => {
            this.emit({ type: "error", data: r });
          }),
          (this.ws.onclose = () => {
            ((this.isConnected = !1), this.emit({ type: "disconnect" }), this.scheduleReconnect(t));
          }));
      } catch (r) {
        (this.emit({ type: "error", data: r }), this.scheduleReconnect(t));
      }
    };
    return (t(), () => this.disconnect());
  }
  scheduleReconnect(t) {
    this.reconnectCount >= this.maxReconnectAttempts ||
      (this.reconnectCount++, (this.reconnectTimer = setTimeout(t, this.reconnectDelayMs)));
  }
  disconnect() {
    (this.reconnectTimer && clearTimeout(this.reconnectTimer),
      this.ws && this.ws.close(),
      (this.ws = null),
      (this.isConnected = !1),
      (this.reconnectCount = 0));
  }
  reportFps(t) {
    if (!(!this.ws || this.ws.readyState !== WebSocket.OPEN))
      try {
        this.ws.send(JSON.stringify({ type: "perf", fps: Math.round(t) }));
      } catch {}
  }
  on(t) {
    return (
      this.listeners.push(t),
      () => {
        this.listeners = this.listeners.filter((r) => r !== t);
      }
    );
  }
  onTelemetry(t) {
    return this.on((r) => {
      r.type === "telemetry" && r.data && t(r.data);
    });
  }
  getConnected() {
    return this.isConnected;
  }
  emit(t) {
    for (const r of this.listeners)
      try {
        r(t);
      } catch (s) {
        console.error("[BridgeDataClient] listener error:", s);
      }
  }
}
function ro() {
  if (typeof window > "u") return "ws://localhost:3001";
  const e = new URLSearchParams(window.location.search).get("bridge");
  return (
    e ||
    `ws://${["localhost", "127.0.0.1"].includes(window.location.hostname) ? window.location.hostname : "localhost"}:3001`
  );
}
let fr = null;
function El() {
  return (fr || (fr = new Ol({ wsUrl: ro() })), fr);
}
const Nl = {
    connected: !1,
    source: "simulated",
    session: "PRACTICE — SPA-FRANCORCHAMPS",
    track: "Spa-Francorchamps",
    car: "DALLARA P217",
    carNumber: "44",
    sdkVersion: "irsdk v1.0",
    latencyMs: 24,
    safetyRating: 4.82,
    gear: 4,
    speedKph: 184,
    rpm: 8420,
    rpmMax: 11e3,
    rpmShiftWarn: 8800,
    rpmShiftRedline: 9800,
    throttle: 0.85,
    brake: 0.12,
    clutch: 0,
    steeringDeg: 12,
    lastLap: "2:18.421",
    bestLap: "2:17.004",
    deltaSec: 0.145,
    sectors: { s1: "41.420", s2: "1:02.115", s3: null, bestSector: 1 },
    fuelRemainingL: 42.1,
    fuelUsePerHour: 0,
    lapLastLapTimeSec: 137.004,
    lapsEstimated: 14.2,
    tires: {
      fl: {
        tempC: 82,
        pressureBar: 1.84,
        wearPct: 98,
        estWearPct: 98,
        brakeTempC: 320,
        brakeLinePress: 0,
        state: "ok",
      },
      fr: {
        tempC: 94,
        pressureBar: 1.92,
        wearPct: 94,
        estWearPct: 94,
        brakeTempC: 350,
        brakeLinePress: 0,
        state: "hot",
      },
      rl: {
        tempC: 84,
        pressureBar: 1.88,
        wearPct: 97,
        estWearPct: 97,
        brakeTempC: 310,
        brakeLinePress: 0,
        state: "ok",
      },
      rr: {
        tempC: 88,
        pressureBar: 1.9,
        wearPct: 96,
        estWearPct: 96,
        brakeTempC: 315,
        brakeLinePress: 0,
        state: "ok",
      },
    },
    gLat: 1.8,
    gLon: -0.4,
    drsAvailable: !0,
    brakeBias: 54.5,
    diffMap: 3,
    airTempC: 22.5,
    trackTempC: 38.2,
    liveAirTempC: 22.8,
    liveTrackTempC: 39.5,
    airDensity: 1.2,
    airPressure: 101325,
    windVel: 5.2,
    windDir: 1.5,
    trackWetness: 0,
    sof: 2150,
  },
  so = "pitwall.bridge.performance.mode",
  no = "pitwall.bridge.performance.snapshot";
function Al() {
  return typeof window > "u"
    ? "balanced60"
    : window.localStorage.getItem(so) === "stable30"
      ? "stable30"
      : "balanced60";
}
function $u(e) {
  typeof window > "u" || window.localStorage.setItem(so, e);
}
function Ml(e) {
  return e < 50 ? "stable30" : "balanced60";
}
function Dl(e) {
  if (typeof window > "u") return;
  const r = {
    mode: Al(),
    lastFps: Math.round(e),
    recommendedMode: Ml(e),
    sampledAt: new Date().toISOString(),
  };
  window.localStorage.setItem(no, JSON.stringify(r));
}
function Uu() {
  if (typeof window > "u") return null;
  const e = window.localStorage.getItem(no);
  if (!e) return null;
  try {
    const t = JSON.parse(e);
    return !t || typeof t.lastFps != "number" ? null : t;
  } catch {
    return null;
  }
}
function Fl() {
  const [e, t] = x.useState(Nl),
    r = x.useRef(!1),
    s = x.useRef(El());
  return (
    x.useEffect(() => {
      const n = s.current,
        o = n.onTelemetry((c) => {
          ((r.current = !0), t((d) => ({ ...d, ...c, connected: !0, source: "live" })));
        }),
        a = n.on((c) => {
          c.type === "disconnect"
            ? ((r.current = !1), t((d) => ({ ...d, connected: !1, source: "simulated" })))
            : c.type === "license" &&
              c.data &&
              typeof localStorage < "u" &&
              localStorage.setItem("pitwall_bridge_license", JSON.stringify(c.data));
        }),
        i = n.connect();
      return () => {
        (o(), a(), i());
      };
    }, []),
    x.useEffect(() => {
      let n = 0,
        o = performance.now(),
        a = 0,
        i = 60,
        c = null;
      const d = (u) => {
        a += 1;
        const h = u - o;
        (h >= 1e3 && ((i = (a * 1e3) / h), (a = 0), (o = u)), (n = requestAnimationFrame(d)));
      };
      return (
        (n = requestAnimationFrame(d)),
        (c = setInterval(() => {
          const u = s.current;
          try {
            (u.reportFps(i), Dl(i));
          } catch {}
        }, 2e3)),
        () => {
          (cancelAnimationFrame(n), c && clearInterval(c));
        }
      );
    }, []),
    x.useEffect(() => {
      const n = setInterval(() => {
        if (r.current) return;
        const o = performance.now() / 1e3;
        t((a) => {
          const i = Hs(0.6 + 0.4 * Math.sin(o * 1.3)),
            c = Hs(Math.max(0, -Math.sin(o * 1.3)) * 0.7),
            d = 120 + 110 * (0.5 + 0.5 * Math.sin(o * 0.8)),
            u = 5500 + 4500 * i + 200 * Math.sin(o * 6),
            h = Math.max(1, Math.min(7, Math.round(2 + 4 * i)));
          return {
            ...a,
            throttle: i,
            brake: c,
            clutch: 0,
            steeringDeg: 35 * Math.sin(o * 0.6),
            speedKph: Math.round(d),
            rpm: Math.round(u),
            gear: h,
            gLat: 1.6 * Math.sin(o * 0.6),
            gLon: -1.2 * c + 0.6 * i,
            deltaSec: 0.2 * Math.sin(o * 0.2),
            fuelRemainingL: Math.max(2, a.fuelRemainingL - 0.002),
            latencyMs: 18 + Math.round(8 * Math.random()),
            tires: {
              fl: jt(a.tires.fl),
              fr: jt(a.tires.fr),
              rl: jt(a.tires.rl),
              rr: jt(a.tires.rr),
            },
          };
        });
      }, 16.666666666666668);
      return () => clearInterval(n);
    }, []),
    e
  );
}
function Hs(e) {
  return Math.max(0, Math.min(1, e));
}
function jt(e) {
  const t = e.tempC + (Math.random() - 0.5) * 0.6;
  return { ...e, tempC: t, state: t > 92 ? "hot" : t < 70 ? "cold" : "ok" };
}
const Ir = {
    lite: {
      key: "lite",
      name: "iRacing Lite Workbook v1.2",
      description: "Standard offline data layout. Covers basic traces, G-Gs, and brake bias.",
      tier: "Free",
      defaultChannels: ["Speed", "Throttle", "Brake", "RPM", "Gear", "SteeringWheelAngle"],
      activeTabs: ["cinema", "readout", "laps", "gg", "brake", "setup"],
      mathExpressions: [
        {
          id: "d04a6011-e4f0-4d4e-bba3-5d803836e100",
          name: "Lap Distance",
          key: "lap_distance",
          expression: "[LapDist]",
          unit: "m",
          enabled: !0,
          scope: "both",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "d04a6011-e4f0-4d4e-bba3-5d803836e101",
          name: "Thr/Brake/Coast",
          key: "throttle_brake_coast",
          expression:
            "choose(([Throttle]>98),2,choose(([Brake]>65),4,choose(([Throttle]>2)&&([Throttle]<98),1,choose(([Brake]>2)&&([Brake]<65),3,0))))",
          unit: "state",
          enabled: !0,
          scope: "both",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "d04a6011-e4f0-4d4e-bba3-5d803836e102",
          name: "Total Brake Pressure",
          key: "total_brake_pressure",
          expression: "[LFbrakeLinePress]+[RFbrakeLinePress]+[LRbrakeLinePress]+[RRbrakeLinePress]",
          unit: "bar",
          enabled: !0,
          scope: "both",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "d04a6011-e4f0-4d4e-bba3-5d803836e103",
          name: "Average LF Tyre Temp",
          key: "avg_lf_temp",
          expression: "([LFtempL]+[LFtempM]+[LFtempR])/3",
          unit: "C",
          enabled: !0,
          scope: "both",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "d04a6011-e4f0-4d4e-bba3-5d803836e104",
          name: "Average RF Tyre Temp",
          key: "avg_rf_temp",
          expression: "([RFtempL]+[RFtempM]+[RFtempR])/3",
          unit: "C",
          enabled: !0,
          scope: "both",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "d04a6011-e4f0-4d4e-bba3-5d803836e105",
          name: "Average LR Tyre Temp",
          key: "avg_lr_temp",
          expression: "([LRtempL]+[LRtempM]+[LRtempR])/3",
          unit: "C",
          enabled: !0,
          scope: "both",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "d04a6011-e4f0-4d4e-bba3-5d803836e106",
          name: "Average RR Tyre Temp",
          key: "avg_rr_temp",
          expression: "([RRtempL]+[RRtempM]+[RRtempR])/3",
          unit: "C",
          enabled: !0,
          scope: "both",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "d04a6011-e4f0-4d4e-bba3-5d803836e107",
          name: "Rear Wheel Speed Diff",
          key: "rear_speed_diff",
          expression: "[LRspeed]-[RRspeed]",
          unit: "kph",
          enabled: !0,
          scope: "both",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "d04a6011-e4f0-4d4e-bba3-5d803836e108",
          name: "Front Wheel Speed Diff",
          key: "front_speed_diff",
          expression: "[LFspeed]-[RFspeed]",
          unit: "kph",
          enabled: !0,
          scope: "both",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "d04a6011-e4f0-4d4e-bba3-5d803836e109",
          name: "Steering Angle Inverted",
          key: "steer_angle_inv",
          expression: "[SteeringWheelAngle]*(-1)",
          unit: "deg",
          enabled: !0,
          scope: "both",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "d04a6011-e4f0-4d4e-bba3-5d803836e110",
          name: "Yaw Rate Inverted",
          key: "yaw_rate_inv",
          expression: "[YawRate]*(-1)",
          unit: "deg/s",
          enabled: !0,
          scope: "both",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "d04a6011-e4f0-4d4e-bba3-5d803836e111",
          name: "Front Ride Height Avg",
          key: "front_ride_height_avg",
          expression: "([LFrideHeight]+[RFrideHeight])/2",
          unit: "mm",
          enabled: !0,
          scope: "both",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "d04a6011-e4f0-4d4e-bba3-5d803836e112",
          name: "Rear Ride Height Avg",
          key: "rear_ride_height_avg",
          expression: "([LRrideHeight]+[RRrideHeight])/2",
          unit: "mm",
          enabled: !0,
          scope: "both",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "d04a6011-e4f0-4d4e-bba3-5d803836e113",
          name: "Live Brake Bias",
          key: "live_brake_bias",
          expression: "[LFbrakeLinePress]/([LFbrakeLinePress]+[LRbrakeLinePress])*100",
          unit: "%",
          enabled: !0,
          scope: "both",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
    },
    plus: {
      key: "plus",
      name: "iRacing Plus Workbook v1.3",
      description:
        "Expanded professional offline analysis workbook. Dampers, Scatters, and Setup Diffs.",
      tier: "Plus",
      defaultChannels: [
        "Speed",
        "Throttle",
        "Brake",
        "RPM",
        "Gear",
        "SteeringWheelAngle",
        "LFshockDefl",
        "RFshockDefl",
        "LRshockDefl",
        "RRshockDefl",
      ],
      activeTabs: [
        "cinema",
        "readout",
        "laps",
        "gg",
        "brake",
        "setup",
        "histogram",
        "scatter",
        "optimal",
        "whatif",
        "apex",
        "waterfall",
        "slip",
        "setupdiff",
      ],
      mathExpressions: [
        {
          id: "d04a6011-e4f0-4d4e-bba3-5d803836e100",
          name: "Lap Distance",
          key: "lap_distance",
          expression: "[LapDist]",
          unit: "m",
          enabled: !0,
          scope: "both",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "d04a6011-e4f0-4d4e-bba3-5d803836e101",
          name: "Thr/Brake/Coast",
          key: "throttle_brake_coast",
          expression:
            "choose(([Throttle]>98),2,choose(([Brake]>65),4,choose(([Throttle]>2)&&([Throttle]<98),1,choose(([Brake]>2)&&([Brake]<65),3,0))))",
          unit: "state",
          enabled: !0,
          scope: "both",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "d04a6011-e4f0-4d4e-bba3-5d803836e102",
          name: "Total Brake Pressure",
          key: "total_brake_pressure",
          expression: "[LFbrakeLinePress]+[RFbrakeLinePress]+[LRbrakeLinePress]+[RRbrakeLinePress]",
          unit: "bar",
          enabled: !0,
          scope: "both",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "d04a6011-e4f0-4d4e-bba3-5d803836e103",
          name: "Average LF Tyre Temp",
          key: "avg_lf_temp",
          expression: "([LFtempL]+[LFtempM]+[LFtempR])/3",
          unit: "C",
          enabled: !0,
          scope: "both",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "d04a6011-e4f0-4d4e-bba3-5d803836e104",
          name: "Average RF Tyre Temp",
          key: "avg_rf_temp",
          expression: "([RFtempL]+[RFtempM]+[RFtempR])/3",
          unit: "C",
          enabled: !0,
          scope: "both",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "d04a6011-e4f0-4d4e-bba3-5d803836e105",
          name: "Average LR Tyre Temp",
          key: "avg_lr_temp",
          expression: "([LRtempL]+[LRtempM]+[LRtempR])/3",
          unit: "C",
          enabled: !0,
          scope: "both",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "d04a6011-e4f0-4d4e-bba3-5d803836e106",
          name: "Average RR Tyre Temp",
          key: "avg_rr_temp",
          expression: "([RRtempL]+[RRtempM]+[RRtempR])/3",
          unit: "C",
          enabled: !0,
          scope: "both",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "d04a6011-e4f0-4d4e-bba3-5d803836e107",
          name: "Rear Wheel Speed Diff",
          key: "rear_speed_diff",
          expression: "[LRspeed]-[RRspeed]",
          unit: "kph",
          enabled: !0,
          scope: "both",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "d04a6011-e4f0-4d4e-bba3-5d803836e108",
          name: "Front Wheel Speed Diff",
          key: "front_speed_diff",
          expression: "[LFspeed]-[RFspeed]",
          unit: "kph",
          enabled: !0,
          scope: "both",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "d04a6011-e4f0-4d4e-bba3-5d803836e109",
          name: "Steering Angle Inverted",
          key: "steer_angle_inv",
          expression: "[SteeringWheelAngle]*(-1)",
          unit: "deg",
          enabled: !0,
          scope: "both",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "d04a6011-e4f0-4d4e-bba3-5d803836e110",
          name: "Yaw Rate Inverted",
          key: "yaw_rate_inv",
          expression: "[YawRate]*(-1)",
          unit: "deg/s",
          enabled: !0,
          scope: "both",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "d04a6011-e4f0-4d4e-bba3-5d803836e111",
          name: "Front Ride Height Avg",
          key: "front_ride_height_avg",
          expression: "([LFrideHeight]+[RFrideHeight])/2",
          unit: "mm",
          enabled: !0,
          scope: "both",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "d04a6011-e4f0-4d4e-bba3-5d803836e112",
          name: "Rear Ride Height Avg",
          key: "rear_ride_height_avg",
          expression: "([LRrideHeight]+[RRrideHeight])/2",
          unit: "mm",
          enabled: !0,
          scope: "both",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "d04a6011-e4f0-4d4e-bba3-5d803836e113",
          name: "Live Brake Bias",
          key: "live_brake_bias",
          expression: "[LFbrakeLinePress]/([LFbrakeLinePress]+[LRbrakeLinePress])*100",
          unit: "%",
          enabled: !0,
          scope: "both",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "d04a6011-e4f0-4d4e-bba3-5d803836e120",
          name: "G Total (Vector)",
          key: "g_total",
          expression:
            "sqrt(([Accel Lateral]*[Accel Lateral])+([Accel Longitudinal]*[Accel Longitudinal]))",
          unit: "G",
          enabled: !0,
          scope: "both",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "d04a6011-e4f0-4d4e-bba3-5d803836e121",
          name: "Yaw Gain",
          key: "yaw_gain",
          expression: "[YawRate]/[SteeringWheelAngle]",
          unit: "ratio",
          enabled: !0,
          scope: "both",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "d04a6011-e4f0-4d4e-bba3-5d803836e122",
          name: "Longitudinal Slip",
          key: "longitudinal_slip",
          expression: "100*((0.5*([LFspeed]+[RFspeed]))/(0.5*([LRspeed]+[RRspeed]))-1)",
          unit: "%",
          enabled: !0,
          scope: "both",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "d04a6011-e4f0-4d4e-bba3-5d803836e123",
          name: "Pedal Overlap Detection",
          key: "pedal_overlap",
          expression: "choose(([Throttle]>2.5)&&([Brake]>2.5),1,0)",
          unit: "flag",
          enabled: !0,
          scope: "both",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "d04a6011-e4f0-4d4e-bba3-5d803836e124",
          name: "Inverse Track Curvature",
          key: "inverse_curvature",
          expression: "abs(([Accel Lateral]/([Speed]*[Speed])))",
          unit: "1/m",
          enabled: !0,
          scope: "both",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "d04a6011-e4f0-4d4e-bba3-5d803836e125",
          name: "Speed Adjusted Steering",
          key: "speed_adj_steer",
          expression: "[SteeringWheelAngle]*([Speed]*sqrt([Speed]))",
          unit: "deg-mps",
          enabled: !0,
          scope: "both",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "d04a6011-e4f0-4d4e-bba3-5d803836e126",
          name: "Corner State Machine",
          key: "corner_state",
          expression:
            "choose(([Brake]>20)&&([Accel Longitudinal]<-0.3),3,choose(([Throttle]>30)&&(abs([Accel Lateral])>0.5),5,choose((abs([Accel Lateral])>0.5),1,0)))",
          unit: "state",
          enabled: !0,
          scope: "both",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
    },
    realtime: {
      key: "realtime",
      name: "iRacing Plus Real-Time Workbook v1.0",
      description:
        "Full pro-tier workspace. Integrates high-frequency active math, 3D overlays, and spider trackers.",
      tier: "Pro",
      defaultChannels: [
        "Speed",
        "Throttle",
        "Brake",
        "RPM",
        "Gear",
        "SteeringWheelAngle",
        "LFshockDefl",
        "RFshockDefl",
        "LRshockDefl",
        "RRshockDefl",
        "YawRate",
      ],
      activeTabs: [
        "cinema",
        "readout",
        "laps",
        "gg",
        "brake",
        "setup",
        "histogram",
        "scatter",
        "optimal",
        "whatif",
        "apex",
        "waterfall",
        "slip",
        "setupdiff",
        "replay3d",
        "piano",
        "spider",
      ],
      mathExpressions: [
        {
          id: "d04a6011-e4f0-4d4e-bba3-5d803836e100",
          name: "Lap Distance",
          key: "lap_distance",
          expression: "[LapDist]",
          unit: "m",
          enabled: !0,
          scope: "both",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "d04a6011-e4f0-4d4e-bba3-5d803836e101",
          name: "Thr/Brake/Coast",
          key: "throttle_brake_coast",
          expression:
            "choose(([Throttle]>98),2,choose(([Brake]>65),4,choose(([Throttle]>2)&&([Throttle]<98),1,choose(([Brake]>2)&&([Brake]<65),3,0))))",
          unit: "state",
          enabled: !0,
          scope: "both",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "d04a6011-e4f0-4d4e-bba3-5d803836e102",
          name: "Total Brake Pressure",
          key: "total_brake_pressure",
          expression: "[LFbrakeLinePress]+[RFbrakeLinePress]+[LRbrakeLinePress]+[RRbrakeLinePress]",
          unit: "bar",
          enabled: !0,
          scope: "both",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "d04a6011-e4f0-4d4e-bba3-5d803836e103",
          name: "Average LF Tyre Temp",
          key: "avg_lf_temp",
          expression: "([LFtempL]+[LFtempM]+[LFtempR])/3",
          unit: "C",
          enabled: !0,
          scope: "both",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "d04a6011-e4f0-4d4e-bba3-5d803836e104",
          name: "Average RF Tyre Temp",
          key: "avg_rf_temp",
          expression: "([RFtempL]+[RFtempM]+[RFtempR])/3",
          unit: "C",
          enabled: !0,
          scope: "both",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "d04a6011-e4f0-4d4e-bba3-5d803836e105",
          name: "Average LR Tyre Temp",
          key: "avg_lr_temp",
          expression: "([LRtempL]+[LRtempM]+[LRtempR])/3",
          unit: "C",
          enabled: !0,
          scope: "both",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "d04a6011-e4f0-4d4e-bba3-5d803836e106",
          name: "Average RR Tyre Temp",
          key: "avg_rr_temp",
          expression: "([RRtempL]+[RRtempM]+[RRtempR])/3",
          unit: "C",
          enabled: !0,
          scope: "both",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "d04a6011-e4f0-4d4e-bba3-5d803836e107",
          name: "Rear Wheel Speed Diff",
          key: "rear_speed_diff",
          expression: "[LRspeed]-[RRspeed]",
          unit: "kph",
          enabled: !0,
          scope: "both",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "d04a6011-e4f0-4d4e-bba3-5d803836e108",
          name: "Front Wheel Speed Diff",
          key: "front_speed_diff",
          expression: "[LFspeed]-[RFspeed]",
          unit: "kph",
          enabled: !0,
          scope: "both",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "d04a6011-e4f0-4d4e-bba3-5d803836e109",
          name: "Steering Angle Inverted",
          key: "steer_angle_inv",
          expression: "[SteeringWheelAngle]*(-1)",
          unit: "deg",
          enabled: !0,
          scope: "both",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "d04a6011-e4f0-4d4e-bba3-5d803836e110",
          name: "Yaw Rate Inverted",
          key: "yaw_rate_inv",
          expression: "[YawRate]*(-1)",
          unit: "deg/s",
          enabled: !0,
          scope: "both",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "d04a6011-e4f0-4d4e-bba3-5d803836e111",
          name: "Front Ride Height Avg",
          key: "front_ride_height_avg",
          expression: "([LFrideHeight]+[RFrideHeight])/2",
          unit: "mm",
          enabled: !0,
          scope: "both",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "d04a6011-e4f0-4d4e-bba3-5d803836e112",
          name: "Rear Ride Height Avg",
          key: "rear_ride_height_avg",
          expression: "([LRrideHeight]+[RRrideHeight])/2",
          unit: "mm",
          enabled: !0,
          scope: "both",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "d04a6011-e4f0-4d4e-bba3-5d803836e113",
          name: "Live Brake Bias",
          key: "live_brake_bias",
          expression: "[LFbrakeLinePress]/([LFbrakeLinePress]+[LRbrakeLinePress])*100",
          unit: "%",
          enabled: !0,
          scope: "both",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "d04a6011-e4f0-4d4e-bba3-5d803836e120",
          name: "G Total (Vector)",
          key: "g_total",
          expression:
            "sqrt(([Accel Lateral]*[Accel Lateral])+([Accel Longitudinal]*[Accel Longitudinal]))",
          unit: "G",
          enabled: !0,
          scope: "both",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "d04a6011-e4f0-4d4e-bba3-5d803836e121",
          name: "Yaw Gain",
          key: "yaw_gain",
          expression: "[YawRate]/[SteeringWheelAngle]",
          unit: "ratio",
          enabled: !0,
          scope: "both",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "d04a6011-e4f0-4d4e-bba3-5d803836e122",
          name: "Longitudinal Slip",
          key: "longitudinal_slip",
          expression: "100*((0.5*([LFspeed]+[RFspeed]))/(0.5*([LRspeed]+[RRspeed]))-1)",
          unit: "%",
          enabled: !0,
          scope: "both",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "d04a6011-e4f0-4d4e-bba3-5d803836e123",
          name: "Pedal Overlap Detection",
          key: "pedal_overlap",
          expression: "choose(([Throttle]>2.5)&&([Brake]>2.5),1,0)",
          unit: "flag",
          enabled: !0,
          scope: "both",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "d04a6011-e4f0-4d4e-bba3-5d803836e124",
          name: "Inverse Track Curvature",
          key: "inverse_curvature",
          expression: "abs(([Accel Lateral]/([Speed]*[Speed])))",
          unit: "1/m",
          enabled: !0,
          scope: "both",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "d04a6011-e4f0-4d4e-bba3-5d803836e130",
          name: "WheelLockLF",
          key: "wheellock_lf",
          expression: "choose((([Speed]-[LFspeed])>10)&&([Brake]>20),1,0)",
          unit: "flag",
          enabled: !0,
          scope: "both",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "d04a6011-e4f0-4d4e-bba3-5d803836e131",
          name: "WheelLockRF",
          key: "wheellock_rf",
          expression: "choose((([Speed]-[RFspeed])>10&&[Brake]>20),1,0)",
          unit: "flag",
          enabled: !0,
          scope: "both",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "d04a6011-e4f0-4d4e-bba3-5d803836e132",
          name: "WheelLockGlobal",
          key: "wheellock_global",
          expression: "choose(([Speed]-[LFspeed]>10)||([Speed]-[RFspeed]>10),1,0)",
          unit: "flag",
          enabled: !0,
          scope: "both",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
    },
  },
  Wu = ["Speed", "Throttle", "Brake", "RPM", "Gear", "SteeringWheelAngle", "LatAccel", "LongAccel"],
  Bl = {
    Speed: "var(--ch-speed)",
    Throttle: "var(--ch-throttle)",
    Brake: "var(--ch-brake)",
    RPM: "var(--ch-rpm)",
    Gear: "var(--ch-gear)",
    SteeringWheelAngle: "var(--ch-steer)",
    LatAccel: "var(--ch-glat)",
    LongAccel: "var(--ch-glong)",
  };
function Hu(e) {
  return Bl[e] ?? "var(--ch-default)";
}
const xt = ko()(
  _o(
    (e, t) => ({
      parsed: null,
      setParsed: (r) => {
        let s = null;
        if (r && r.laps.length) {
          let i = 1 / 0;
          for (const c of r.laps)
            c.endTick - c.startTick > 30 &&
              c.timeS > 5 &&
              c.timeS < i &&
              ((i = c.timeS), (s = c.lap));
          s == null && (s = r.laps[0].lap);
        }
        const n = s != null ? (r.laps.find((i) => i.lap === s)?.startTick ?? 0) : 0,
          o = t().activeWorkspace ?? "lite",
          a = Ir[o];
        e(() => ({
          parsed: r,
          cursorTick: n,
          selectedChannels: r ? a.defaultChannels.filter((i) => i in r.channels) : [],
          refLap: s,
          cmpLap: null,
          playing: !1,
        }));
      },
      cursorTick: 0,
      setCursorTick: (r) => e({ cursorTick: r }),
      selectedChannels: [],
      toggleChannel: (r) =>
        e((s) => ({
          selectedChannels: s.selectedChannels.includes(r)
            ? s.selectedChannels.filter((n) => n !== r)
            : [...s.selectedChannels, r],
        })),
      setChannels: (r) => e({ selectedChannels: r }),
      refLap: null,
      cmpLap: null,
      setRefLap: (r) => e({ refLap: r }),
      setCmpLap: (r) => e({ cmpLap: r }),
      playing: !1,
      speed: 1,
      setPlaying: (r) => e({ playing: r }),
      setSpeed: (r) => e({ speed: r }),
      mapMode: "aligned",
      mapColorBy: "Throttle",
      setMapMode: (r) => e({ mapMode: r }),
      setMapColorBy: (r) => e({ mapColorBy: r }),
      showSectorHeat: !1,
      showTrackBands: !1,
      showDeviation: !1,
      setShowSectorHeat: (r) => e({ showSectorHeat: r }),
      setShowTrackBands: (r) => e({ showTrackBands: r }),
      setShowDeviation: (r) => e({ showDeviation: r }),
      mapThicknessBySpeed: !1,
      setMapThicknessBySpeed: (r) => e({ mapThicknessBySpeed: r }),
      llmProvider: "cloud",
      llmBaseUrl: "http://localhost:1234/v1",
      llmModelId: "llama-3-8b-instruct",
      llmApiKey: "",
      setLlmProvider: (r) => e({ llmProvider: r }),
      setLlmBaseUrl: (r) => e({ llmBaseUrl: r }),
      setLlmModelId: (r) => e({ llmModelId: r }),
      setLlmApiKey: (r) => e({ llmApiKey: r }),
      activeGame: "iracing",
      setActiveGame: (r) => e({ activeGame: r }),
      elevenLabsApiKey: "",
      elevenLabsVoiceId: "JBFqnCBsd6RMkjVDRZzb",
      setElevenLabsApiKey: (r) => e({ elevenLabsApiKey: r }),
      setElevenLabsVoiceId: (r) => e({ elevenLabsVoiceId: r }),
      audioOutputDeviceId: "",
      setAudioOutputDeviceId: (r) => e({ audioOutputDeviceId: r }),
      micDeviceId: "",
      setMicDeviceId: (r) => e({ micDeviceId: r }),
      liveTrack: "",
      liveCar: "",
      liveConnected: !1,
      setLiveContext: (r, s, n) => e({ liveTrack: r, liveCar: s, liveConnected: n }),
      pendingLocalBlob: null,
      setPendingLocalBlob: (r) => e({ pendingLocalBlob: r }),
      subscriptionPlan: null,
      setSubscriptionPlan: (r) => e({ subscriptionPlan: r }),
      mathExpressions: [],
      setMathExpressions: (r) => e({ mathExpressions: r }),
      activeWorkspace: "lite",
      setActiveWorkspace: (r) => {
        const s = Ir[r];
        e((n) => ({
          activeWorkspace: r,
          selectedChannels: n.parsed
            ? s.defaultChannels.filter((o) => o in n.parsed.channels)
            : s.defaultChannels,
          mathExpressions: s.mathExpressions,
        }));
      },
    }),
    {
      name: "pitwall-workbench-storage",
      partialize: (e) => ({
        selectedChannels: e.selectedChannels,
        mapMode: e.mapMode,
        mapColorBy: e.mapColorBy,
        showSectorHeat: e.showSectorHeat,
        showTrackBands: e.showTrackBands,
        showDeviation: e.showDeviation,
        mapThicknessBySpeed: e.mapThicknessBySpeed,
        llmProvider: e.llmProvider,
        llmBaseUrl: e.llmBaseUrl,
        llmModelId: e.llmModelId,
        llmApiKey: e.llmApiKey,
        elevenLabsApiKey: e.elevenLabsApiKey,
        elevenLabsVoiceId: e.elevenLabsVoiceId,
        audioOutputDeviceId: e.audioOutputDeviceId,
        micDeviceId: e.micDeviceId,
        mathExpressions: e.mathExpressions,
        activeWorkspace: e.activeWorkspace,
        activeGame: e.activeGame,
      }),
    },
  ),
);
function $l({ t: e }) {
  const t = xt((r) => r.setLiveContext);
  return (
    x.useEffect(() => {
      t(e.track, e.car, e.connected);
    }, [e.track, e.car, e.connected, t]),
    null
  );
}
const ee = je({ type: "function" }),
  zu = M({ method: "POST" })
    .middleware([ee])
    .handler(B("a9e884129245c896049675548db8c3263324534e7707c6a14a71b0ac924c5ec7"));
M({ method: "GET" })
  .middleware([ee])
  .handler(B("9e832443bf68dc1afd0906f77686b1ea8872ad09afcaa177d4f399a63b42e66a"));
const Gu = M({ method: "POST" })
    .middleware([ee])
    .handler(B("27806ff807d7d8480171f4973109eb2bb2f01480e1fd2c4c7d3e9b351a157d43")),
  qu = M({ method: "GET" })
    .middleware([ee])
    .handler(B("a933f1c90db2b411b6f804ed4c984c6e101ca06daaf62450a1ddebca103ad19a")),
  Ku = M({ method: "POST" })
    .middleware([ee])
    .handler(B("31bb52f01c1ca777a07f8b7d28b2d3eef0780ba57d6cb939fb6db52d68d3d10b"));
M({ method: "GET" })
  .middleware([ee])
  .handler(B("16e5998c5e349d45bf571ca307d98918f10fe195c5b6005d6285c65d7e7dfa88"));
const Vu = M({ method: "POST" })
    .middleware([ee])
    .handler(B("a0267f99ea641dee7a11ee872b71ff1a19869f78cae83bc19cef292565f399f7")),
  Yu = M({ method: "GET" })
    .middleware([ee])
    .handler(B("21b7d4b9cd49310bbcedb32d65588f95c68176ba57a09f7d1beaef4723ebb413"));
M({ method: "POST" })
  .middleware([ee])
  .handler(B("86e46adc000ddd68d04e26f71b110afe4b4522c393e8871abd429fcbd9f4e008"));
M({ method: "GET" })
  .middleware([ee])
  .handler(B("68ae1d118973fcae6b72b9ffb357a8b7cf6c764622416c26643e0fa0ac5e4749"));
const Ju = M({ method: "POST" })
    .middleware([ee])
    .handler(B("7a7081d7243c130f1807d297517e861177ea1df81e921aee7d538e61ccc05ea0")),
  Ul = M({ method: "POST" })
    .middleware([ee])
    .handler(B("abbba3ff862cf55481069f2003803c513de3794ce64b16ed9b1201afed0c3569")),
  zs = "http://localhost:3001",
  oo = "pitwall.lapsync.synced.v1";
function Wl() {
  try {
    return new Set(JSON.parse(localStorage.getItem(oo) || "[]"));
  } catch {
    return new Set();
  }
}
function Hl(e) {
  try {
    localStorage.setItem(oo, JSON.stringify(Array.from(e).slice(-2e3)));
  } catch {}
}
function zl() {
  const e = yc(Ul),
    [t, r] = x.useState("idle"),
    [s, n] = x.useState(0);
  return (
    x.useEffect(() => {
      let o = !1;
      const a = async () => {
        try {
          const c = await fetch(`${zs}/api/laps?limit=500`, { cache: "no-store" });
          if (!c.ok) return;
          const d = await c.json(),
            u = Wl(),
            h = d.laps.filter(
              (f) => f.ts && !u.has(f.ts) && f.lapTimeS && f.lapTimeS > 0 && f.car && f.track,
            );
          if (h.length === 0) {
            (r(`cached ${d.laps.length} · synced ${u.size}`), n(d.laps.length));
            return;
          }
          r(`syncing ${h.length}…`);
          const p = await e({
            data: {
              laps: h.map((f) => ({
                ts: f.ts,
                car: f.car ?? null,
                track: f.track ?? null,
                lapTimeS: f.lapTimeS,
                fuel: f.fuel ?? null,
                sof: f.sof ?? null,
              })),
            },
          });
          if ("accepted" in p) {
            for (const f of p.accepted) u.add(f);
            (Hl(u),
              fetch(`${zs}/api/laps/mark-synced`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ timestamps: p.accepted }),
              }).catch(() => {}),
              r(`synced ${p.inserted} · total ${u.size}`));
          }
        } catch {
          o || r("bridge offline");
        }
      };
      a();
      const i = setInterval(a, 6e4);
      return () => {
        ((o = !0), clearInterval(i));
      };
    }, [e]),
    l.jsxs("div", {
      className: "rounded-sm border border-border bg-background px-2 py-1.5 text-[10px]",
      children: [
        l.jsxs("div", {
          className: "flex items-center justify-between",
          children: [
            l.jsx("span", {
              className: "uppercase tracking-[0.18em] text-muted-foreground",
              children: "Desktop Lap Sync",
            }),
            l.jsx("span", { className: "text-muted-foreground tabular-nums", children: t }),
          ],
        }),
        s > 0 &&
          l.jsx("div", {
            className: "mt-0.5 text-[9px] text-muted-foreground",
            children: "Local laps from ~/.pitwall/laps.jsonl are pushed to Cloud every 60s.",
          }),
      ],
    })
  );
}
const Gs = "pit-wall:help-seen-v1",
  nt = [
    {
      id: "welcome",
      icon: l.jsx(Xt, { className: "h-6 w-6" }),
      label: "Welcome",
      title: "Welcome to Pit Wall",
      subtitle: "Your complete iRacing telemetry companion",
      content: l.jsxs("div", {
        className: "space-y-4",
        children: [
          l.jsxs("p", {
            className: "text-muted-foreground leading-relaxed",
            children: [
              "Pit Wall is a ",
              l.jsx("strong", { className: "text-foreground", children: "three-in-one" }),
              " iRacing companion built for serious drivers. It combines a live in-session dashboard, a deep lap analysis workbench, and an AI-powered race engineer into one seamless tool.",
            ],
          }),
          l.jsx("div", {
            className: "grid grid-cols-1 gap-3 sm:grid-cols-3",
            children: [
              {
                icon: l.jsx(Rt, { className: "h-4 w-4 text-racing-cyan" }),
                label: "Live Bridge",
                desc: "Real-time telemetry while you're on track",
              },
              {
                icon: l.jsx(kt, { className: "h-4 w-4 text-racing-green" }),
                label: "Lap Workbench",
                desc: "Deep analysis of saved .ibt / .pwlap files",
              },
              {
                icon: l.jsx(Qt, { className: "h-4 w-4 text-racing-orange" }),
                label: "AI Coach",
                desc: "Radio calls and setup advice after every lap",
              },
            ].map((e) =>
              l.jsxs(
                "div",
                {
                  className: "rounded-lg border border-border bg-rail p-3 space-y-1.5",
                  children: [
                    l.jsxs("div", {
                      className: "flex items-center gap-2",
                      children: [
                        e.icon,
                        l.jsx("span", {
                          className: "text-xs font-semibold uppercase tracking-wider",
                          children: e.label,
                        }),
                      ],
                    }),
                    l.jsx("p", { className: "text-xs text-muted-foreground", children: e.desc }),
                  ],
                },
                e.label,
              ),
            ),
          }),
          l.jsxs("p", {
            className:
              "text-xs text-muted-foreground border border-border/50 rounded-md px-3 py-2 bg-rail/50",
            children: [
              "💡 This guide takes about 2 minutes. You can re-open it anytime with the",
              " ",
              l.jsx("strong", { className: "text-foreground", children: "?" }),
              " button in the top-right corner.",
            ],
          }),
        ],
      }),
    },
    {
      id: "bridge",
      icon: l.jsx(Rt, { className: "h-6 w-6" }),
      label: "Live Bridge",
      title: "Step 1 — Connect the Live Bridge",
      subtitle: "Launch the telemetry service with one click",
      content: l.jsxs("div", {
        className: "space-y-4",
        children: [
          l.jsxs("p", {
            className: "text-muted-foreground leading-relaxed",
            children: [
              "iRacing exposes live telemetry via a Windows Shared Memory API. The",
              " ",
              l.jsx("strong", { className: "text-foreground", children: "Pit Wall Bridge" }),
              " is a small Node.js app that reads that memory and broadcasts it over WebSocket to your browser. You can launch it with one click!",
            ],
          }),
          l.jsx("div", {
            className: "space-y-2",
            children: [
              {
                n: 1,
                icon: l.jsx(Yr, { className: "h-3.5 w-3.5 text-racing-orange" }),
                title: "Run Local Bridge",
                desc: 'Click the "Run Local Bridge" button on the live page. The app automatically spawns the background service.',
              },
              {
                n: 2,
                icon: l.jsx(Rt, { className: "h-3.5 w-3.5 text-primary" }),
                title: "Establish Connection",
                desc: "The bridge status in the dashboard will change from stopped to active instantly.",
              },
              {
                n: 3,
                icon: l.jsx(Xt, { className: "h-3.5 w-3.5 text-racing-green" }),
                title: "Stream Live",
                desc: "Launch iRacing, get in a car, and telemetry will stream immediately.",
              },
            ].map((e) =>
              l.jsxs(
                "div",
                {
                  className: "flex items-start gap-3 rounded-md border border-border bg-rail p-3",
                  children: [
                    l.jsx("span", {
                      className:
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-mono text-primary-foreground",
                      children: e.n,
                    }),
                    l.jsxs("div", {
                      children: [
                        l.jsxs("div", {
                          className: "flex items-center gap-1.5 text-xs font-semibold",
                          children: [e.icon, e.title],
                        }),
                        l.jsx("p", {
                          className: "text-xs text-muted-foreground mt-0.5",
                          children: e.desc,
                        }),
                      ],
                    }),
                  ],
                },
                e.n,
              ),
            ),
          }),
        ],
      }),
      ctaLabel: "Open Live Dashboard",
      ctaTo: "/live",
    },
    {
      id: "live",
      icon: l.jsx(Xt, { className: "h-6 w-6" }),
      label: "Live Dashboard",
      title: "Step 2 — The Live Dashboard",
      subtitle: "Real-time data while you're driving",
      content: l.jsxs("div", {
        className: "space-y-4",
        children: [
          l.jsxs("p", {
            className: "text-muted-foreground leading-relaxed",
            children: [
              "Once the bridge is running and you're on track, the",
              " ",
              l.jsx("strong", { className: "text-foreground", children: "/live" }),
              " dashboard streams 60Hz telemetry from iRacing directly to your browser. No API keys, no cloud, no latency.",
            ],
          }),
          l.jsx("div", {
            className: "grid grid-cols-2 gap-2 text-xs",
            children: [
              { label: "Delta to PB", desc: "Green = gaining, Red = losing time" },
              { label: "Lap Times", desc: "Current + personal best with sector splits" },
              { label: "Tire Temps", desc: "Four corners, colour-coded by temperature" },
              { label: "G-Force", desc: "Live lateral & longitudinal G display" },
              { label: "Fuel Calculator", desc: "Laps remaining based on burn rate" },
              { label: "AI Radio", desc: "Coach speaks after every completed lap" },
            ].map((e) =>
              l.jsxs(
                "div",
                {
                  className: "rounded border border-border bg-rail px-2.5 py-2",
                  children: [
                    l.jsx("div", { className: "font-semibold text-foreground", children: e.label }),
                    l.jsx("div", { className: "text-muted-foreground mt-0.5", children: e.desc }),
                  ],
                },
                e.label,
              ),
            ),
          }),
          l.jsxs("p", {
            className: "text-xs text-muted-foreground",
            children: [
              l.jsx("strong", { className: "text-foreground", children: "Recording:" }),
              " Hit the red dot button to record a session as a ",
              l.jsx("code", { className: "text-xs bg-rail px-1 rounded", children: ".pwlap" }),
              " file. When you save it, it opens instantly in the Workbench — no upload wait time.",
            ],
          }),
        ],
      }),
      ctaLabel: "Open Live Dashboard",
      ctaTo: "/live",
    },
    {
      id: "workbench",
      icon: l.jsx(kt, { className: "h-6 w-6" }),
      label: "Lap Workbench",
      title: "Step 3 — The Lap Workbench",
      subtitle: "MoTeC-style deep analysis of every lap",
      content: l.jsxs("div", {
        className: "space-y-4",
        children: [
          l.jsxs("p", {
            className: "text-muted-foreground leading-relaxed",
            children: [
              "Load any ",
              l.jsx("code", { className: "text-xs bg-rail px-1 rounded", children: ".ibt" }),
              " or",
              " ",
              l.jsx("code", { className: "text-xs bg-rail px-1 rounded", children: ".pwlap" }),
              " file into the",
              " ",
              l.jsx("strong", { className: "text-foreground", children: "Workbench" }),
              " for a full MoTeC-style breakdown. No subscription required — it all runs locally in your browser.",
            ],
          }),
          l.jsx("div", {
            className: "space-y-2 text-xs",
            children: [
              {
                icon: l.jsx(kt, { className: "h-3 w-3 text-primary" }),
                label: "Stacked Traces",
                desc: "Overlay throttle, brake, steer, speed and any other channel across laps",
              },
              {
                icon: l.jsx(Yr, { className: "h-3 w-3 text-racing-orange" }),
                label: "Sector Analysis",
                desc: "Identify exactly which corner is costing you the most time",
              },
              {
                icon: l.jsx(Qt, { className: "h-3 w-3 text-racing-cyan" }),
                label: "AI Coach Report",
                desc: "GPT-powered post-session coaching based on your telemetry profile",
              },
              {
                icon: l.jsx(Zt, { className: "h-3 w-3 text-racing-green" }),
                label: "Session Library",
                desc: "All your sessions in one place — filter by track, car, or date",
              },
            ].map((e) =>
              l.jsxs(
                "div",
                {
                  className:
                    "flex items-start gap-2 rounded border border-border bg-rail px-2.5 py-2",
                  children: [
                    l.jsx("span", { className: "mt-0.5 shrink-0", children: e.icon }),
                    l.jsxs("div", {
                      children: [
                        l.jsx("span", {
                          className: "font-semibold text-foreground",
                          children: e.label,
                        }),
                        l.jsxs("span", {
                          className: "text-muted-foreground",
                          children: [" — ", e.desc],
                        }),
                      ],
                    }),
                  ],
                },
                e.label,
              ),
            ),
          }),
          l.jsxs("p", {
            className: "text-xs text-muted-foreground",
            children: [
              "🔑 ",
              l.jsx("strong", { className: "text-foreground", children: "Tip:" }),
              " Don't have an iRacing .ibt file? Use the Lab to upload one directly from disk without needing to log in.",
            ],
          }),
        ],
      }),
      ctaLabel: "Open Lab",
      ctaTo: "/lab/lapfile",
    },
    {
      id: "sessions",
      icon: l.jsx(Zt, { className: "h-6 w-6" }),
      label: "Session Library",
      title: "Step 4 — Your Session Library",
      subtitle: "All your sessions in one place",
      content: l.jsxs("div", {
        className: "space-y-4",
        children: [
          l.jsxs("p", {
            className: "text-muted-foreground leading-relaxed",
            children: [
              "Every session you record on track or upload from disk gets saved to your",
              " ",
              l.jsx("strong", { className: "text-foreground", children: "Session Library" }),
              ". Sign in with your account to sync data to the cloud, or — if you've installed MongoDB locally — everything stores on your own machine.",
            ],
          }),
          l.jsx("div", {
            className: "grid grid-cols-2 gap-2 text-xs",
            children: [
              {
                label: "Track filtering",
                desc: "Jump straight to Silverstone, Monza or any track",
              },
              { label: "Car filtering", desc: "Compare performance across different car classes" },
              { label: "Best lap history", desc: "See your all-time PB and trend over time" },
              { label: "Shareable links", desc: "Share a specific lap to a link for teammates" },
            ].map((e) =>
              l.jsxs(
                "div",
                {
                  className: "rounded border border-border bg-rail px-2.5 py-2",
                  children: [
                    l.jsx("div", { className: "font-semibold text-foreground", children: e.label }),
                    l.jsx("div", { className: "text-muted-foreground mt-0.5", children: e.desc }),
                  ],
                },
                e.label,
              ),
            ),
          }),
          l.jsxs("div", {
            className:
              "flex items-start gap-2 rounded-md border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-xs text-emerald-400",
            children: [
              l.jsx(Vs, { className: "h-3.5 w-3.5 mt-0.5 shrink-0" }),
              l.jsxs("span", {
                children: [
                  l.jsx("strong", { children: "Local-First Active:" }),
                  ` Select the "Continue as Local Developer" option. Telemetry records write instantly to your local MongoDB, and file binaries are cached locally in your browser's IndexedDB.`,
                ],
              }),
            ],
          }),
        ],
      }),
      ctaLabel: "View Sessions",
      ctaTo: "/sessions",
    },
    {
      id: "ai",
      icon: l.jsx(Qt, { className: "h-6 w-6" }),
      label: "AI Coach",
      title: "Step 5 — The AI Race Engineer",
      subtitle: "GPT-powered coaching after every lap",
      content: l.jsxs("div", {
        className: "space-y-4",
        children: [
          l.jsxs("p", {
            className: "text-muted-foreground leading-relaxed",
            children: [
              "The ",
              l.jsx("strong", { className: "text-foreground", children: "AI Coach" }),
              " listens to each completed lap and gives you a radio call — just like a real race engineer. It decides the",
              " ",
              l.jsx("em", { className: "text-foreground", children: "tone" }),
              " based on your performance:",
              " ",
              l.jsx("span", { className: "text-racing-green font-semibold", children: "PUSH" }),
              ",",
              " ",
              l.jsx("span", { className: "text-racing-orange font-semibold", children: "HOLD" }),
              ", or",
              " ",
              l.jsx("span", { className: "text-red-400 font-semibold", children: "WARN" }),
              ".",
            ],
          }),
          l.jsx("div", {
            className: "space-y-2 text-xs",
            children: [
              {
                tone: "PUSH",
                color: "text-racing-green border-racing-green/30 bg-racing-green/5",
                desc: "You're in the zone, personal best incoming. Keep the pressure on.",
              },
              {
                tone: "HOLD",
                color: "text-racing-orange border-racing-orange/30 bg-racing-orange/5",
                desc: "Consistent but not setting records. Focus on a specific sector.",
              },
              {
                tone: "WARN",
                color: "text-red-400 border-red-400/30 bg-red-400/5",
                desc: "Tire temps critical, fuel low, or braking instability detected.",
              },
            ].map((e) =>
              l.jsxs(
                "div",
                {
                  className: `rounded border px-3 py-2 ${e.color}`,
                  children: [
                    l.jsx("span", { className: "font-bold font-mono", children: e.tone }),
                    l.jsxs("span", {
                      className: "text-muted-foreground",
                      children: [" — ", e.desc],
                    }),
                  ],
                },
                e.tone,
              ),
            ),
          }),
          l.jsxs("div", {
            className: "text-xs text-muted-foreground space-y-1",
            children: [
              l.jsxs("p", {
                children: [
                  "⚙️ ",
                  l.jsx("strong", {
                    className: "text-foreground",
                    children: "Settings → AI Provider",
                  }),
                  " to switch between cloud GPT-4o and a local LLM (Ollama, LM Studio, etc.).",
                ],
              }),
              l.jsx("p", {
                children:
                  "🔇 Auto-speak mode reads the call out loud via TTS — toggle it per-session on the live dashboard.",
              }),
            ],
          }),
        ],
      }),
      ctaLabel: "Open Live Dashboard",
      ctaTo: "/live",
    },
    {
      id: "done",
      icon: l.jsx(lt, { className: "h-6 w-6" }),
      label: "You're ready",
      title: "You're all set!",
      subtitle: "Here's where to go next",
      content: l.jsxs("div", {
        className: "space-y-4",
        children: [
          l.jsx("p", {
            className: "text-muted-foreground leading-relaxed",
            children: "Pit Wall is ready to use. Pick the path that suits you right now:",
          }),
          l.jsx("div", {
            className: "space-y-2",
            children: [
              {
                icon: l.jsx(Rt, { className: "h-4 w-4 text-racing-cyan" }),
                label: "I want live telemetry while driving",
                to: "/live",
                btn: "Open Live Dashboard",
              },
              {
                icon: l.jsx(kt, { className: "h-4 w-4 text-racing-green" }),
                label: "I have a .ibt file I want to analyse",
                to: "/lab/lapfile",
                btn: "Open the Lab",
              },
              {
                icon: l.jsx(Zt, { className: "h-4 w-4 text-primary" }),
                label: "I want to browse saved sessions",
                to: "/sessions",
                btn: "Session Library",
              },
              {
                icon: l.jsx(gr, { className: "h-4 w-4 text-muted-foreground" }),
                label: "I want to configure AI and local DB",
                to: "/settings",
                btn: "Settings",
              },
            ].map((e) =>
              l.jsxs(
                yt,
                {
                  to: e.to,
                  className:
                    "flex items-center justify-between rounded-lg border border-border bg-rail px-4 py-3 text-sm hover:bg-accent transition-colors group",
                  children: [
                    l.jsxs("div", {
                      className: "flex items-center gap-3",
                      children: [
                        e.icon,
                        l.jsx("span", { className: "text-foreground", children: e.label }),
                      ],
                    }),
                    l.jsxs("div", {
                      className:
                        "flex items-center gap-1 text-xs text-muted-foreground group-hover:text-primary transition-colors",
                      children: [e.btn, l.jsx(Lo, { className: "h-3.5 w-3.5" })],
                    }),
                  ],
                },
                e.to,
              ),
            ),
          }),
          l.jsxs("p", {
            className: "text-xs text-center text-muted-foreground",
            children: [
              "Remember: hit the ",
              l.jsx("strong", { className: "text-foreground", children: "?" }),
              " button in the top-right corner anytime to re-open this guide.",
            ],
          }),
        ],
      }),
    },
  ];
function Gl() {
  const [e, t] = x.useState(!1),
    [r, s] = x.useState(0);
  x.useEffect(() => {
    if (!localStorage.getItem(Gs)) {
      const d = setTimeout(() => t(!0), 800);
      return () => clearTimeout(d);
    }
  }, []);
  const n = x.useCallback(() => {
      (localStorage.setItem(Gs, "1"), t(!1), s(0));
    }, []),
    o = nt[r],
    a = r === 0,
    i = r === nt.length - 1;
  return l.jsxs(l.Fragment, {
    children: [
      l.jsx("button", {
        id: "help-trigger",
        onClick: () => {
          (s(0), t(!0));
        },
        className:
          "fixed bottom-4 right-4 z-40 flex h-9 w-9 items-center justify-center rounded-full bg-panel border border-border text-muted-foreground shadow-lg hover:text-primary hover:border-primary/50 transition-all hover:scale-110",
        "aria-label": "Open help guide",
        title: "Help & Getting Started",
        children: l.jsx(Co, { className: "h-4 w-4" }),
      }),
      e &&
        l.jsx("div", {
          className:
            "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200",
          onClick: (c) => {
            c.target === c.currentTarget && n();
          },
          children: l.jsxs("div", {
            className:
              "relative w-full max-w-2xl rounded-xl border border-border bg-background shadow-2xl flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-4 duration-300",
            children: [
              l.jsxs("div", {
                className:
                  "flex items-center justify-between px-6 py-4 border-b border-border shrink-0",
                children: [
                  l.jsxs("div", {
                    className: "flex items-center gap-3",
                    children: [
                      l.jsx("div", {
                        className:
                          "flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary",
                        children: o.icon,
                      }),
                      l.jsxs("div", {
                        children: [
                          l.jsx("div", {
                            className: "text-sm font-semibold text-foreground",
                            children: o.title,
                          }),
                          l.jsx("div", {
                            className: "text-xs text-muted-foreground",
                            children: o.subtitle,
                          }),
                        ],
                      }),
                    ],
                  }),
                  l.jsx("button", {
                    onClick: n,
                    className:
                      "flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-rail transition-colors",
                    "aria-label": "Close help",
                    children: l.jsx(Ks, { className: "h-4 w-4" }),
                  }),
                ],
              }),
              l.jsx("div", {
                className: "flex h-1 w-full shrink-0",
                children: nt.map((c, d) =>
                  l.jsx(
                    "button",
                    {
                      onClick: () => s(d),
                      className: `flex-1 transition-colors ${d <= r ? "bg-primary" : "bg-rail"} ${d === 0 ? "" : "ml-px"}`,
                      "aria-label": `Go to step: ${c.label}`,
                    },
                    c.id,
                  ),
                ),
              }),
              l.jsx("div", {
                className: "flex items-center gap-1.5 px-6 pt-4 pb-1 shrink-0 overflow-x-auto",
                children: nt.map((c, d) =>
                  l.jsxs(
                    "button",
                    {
                      onClick: () => s(d),
                      className: `flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider transition-all whitespace-nowrap ${d === r ? "bg-primary/10 text-primary border border-primary/30" : d < r ? "text-muted-foreground/80" : "text-muted-foreground/40"}`,
                      children: [
                        d < r
                          ? l.jsx(lt, { className: "h-2.5 w-2.5" })
                          : d === r
                            ? l.jsx(Vr, { className: "h-2.5 w-2.5 fill-primary text-primary" })
                            : l.jsx(Vr, { className: "h-2.5 w-2.5" }),
                        c.label,
                      ],
                    },
                    c.id,
                  ),
                ),
              }),
              l.jsx("div", { className: "flex-1 overflow-y-auto px-6 py-4", children: o.content }),
              l.jsxs("div", {
                className:
                  "flex items-center justify-between px-6 py-4 border-t border-border shrink-0",
                children: [
                  l.jsxs("button", {
                    onClick: () => s((c) => Math.max(0, c - 1)),
                    disabled: a,
                    className:
                      "flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors",
                    children: [l.jsx(Po, { className: "h-4 w-4" }), "Back"],
                  }),
                  l.jsxs("div", {
                    className: "flex items-center gap-2",
                    children: [
                      o.ctaLabel &&
                        o.ctaTo &&
                        (o.ctaTo.startsWith("/downloads/") || o.ctaTo.includes(".")
                          ? l.jsxs("a", {
                              href: o.ctaTo,
                              download: !0,
                              onClick: n,
                              className:
                                "flex items-center gap-1.5 rounded-md border border-border bg-rail px-3 py-1.5 text-xs hover:bg-accent transition-colors",
                              children: [o.ctaLabel, l.jsx(Jt, { className: "h-3 w-3" })],
                            })
                          : l.jsxs(yt, {
                              to: o.ctaTo,
                              onClick: n,
                              className:
                                "flex items-center gap-1.5 rounded-md border border-border bg-rail px-3 py-1.5 text-xs hover:bg-accent transition-colors",
                              children: [o.ctaLabel, l.jsx(Jt, { className: "h-3 w-3" })],
                            })),
                      i
                        ? l.jsxs("button", {
                            onClick: n,
                            className:
                              "flex items-center gap-1.5 rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity",
                            children: [l.jsx(lt, { className: "h-3.5 w-3.5" }), "Let's go!"],
                          })
                        : l.jsxs("button", {
                            onClick: () => s((c) => Math.min(nt.length - 1, c + 1)),
                            className:
                              "flex items-center gap-1.5 rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity",
                            children: ["Next", l.jsx(Jt, { className: "h-3.5 w-3.5" })],
                          }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        }),
    ],
  });
}
function ce(...e) {
  return xo(vo(e));
}
const ao = Eo,
  ql = No,
  io = x.forwardRef(({ className: e, ...t }, r) =>
    l.jsx(Zs, {
      ref: r,
      className: ce(
        "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        e,
      ),
      ...t,
    }),
  );
io.displayName = Zs.displayName;
const Ur = x.forwardRef(({ className: e, children: t, ...r }, s) =>
  l.jsxs(ql, {
    children: [
      l.jsx(io, {}),
      l.jsxs(Js, {
        ref: s,
        className: ce(
          "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg",
          e,
        ),
        ...r,
        children: [
          t,
          l.jsxs(Ao, {
            className:
              "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background cursor-pointer transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground",
            children: [
              l.jsx(Ks, { className: "h-4 w-4" }),
              l.jsx("span", { className: "sr-only", children: "Close" }),
            ],
          }),
        ],
      }),
    ],
  }),
);
Ur.displayName = Js.displayName;
const Wr = ({ className: e, ...t }) =>
  l.jsx("div", { className: ce("flex flex-col space-y-1.5 text-center sm:text-left", e), ...t });
Wr.displayName = "DialogHeader";
const Hr = x.forwardRef(({ className: e, ...t }, r) =>
  l.jsx(Qs, {
    ref: r,
    className: ce("text-lg font-semibold leading-none tracking-tight", e),
    ...t,
  }),
);
Hr.displayName = Qs.displayName;
const zr = x.forwardRef(({ className: e, ...t }, r) =>
  l.jsx(Xs, { ref: r, className: ce("text-sm text-muted-foreground", e), ...t }),
);
zr.displayName = Xs.displayName;
function Kl(e) {
  if (!(e instanceof HTMLElement)) return !1;
  const t = e.tagName;
  return t === "INPUT" || t === "TEXTAREA" || t === "SELECT" || e.isContentEditable;
}
function Vl() {
  const e = D(),
    { pathname: t } = Un(),
    r = uc(),
    [s, n] = x.useState(!1),
    o = x.useRef(!1),
    a = x.useRef(null),
    i = x.useCallback(() => {
      t !== "/" && (r ? e.history.back() : e.navigate({ to: "/" }));
    }, [r, t, e]);
  return (
    x.useEffect(() => {
      const c = (d) => {
        if (!Kl(d.target)) {
          if ((d.ctrlKey || d.metaKey) && !d.shiftKey && !d.altKey) {
            if (d.key === "1") {
              (d.preventDefault(), e.navigate({ to: "/" }));
              return;
            }
            if (d.key === "2") {
              (d.preventDefault(), e.navigate({ to: "/live" }));
              return;
            }
            if (d.key === "3") {
              (d.preventDefault(), e.navigate({ to: "/sessions" }));
              return;
            }
            if (d.key === "4") {
              (d.preventDefault(), e.navigate({ to: "/ai-engineer" }));
              return;
            }
          }
          if (d.key === "?" && !d.ctrlKey && !d.metaKey && !d.altKey) {
            (d.preventDefault(), n(!0));
            return;
          }
          if (d.key === "Escape") {
            if (s) {
              n(!1);
              return;
            }
            (d.preventDefault(), i());
            return;
          }
          if (d.key === "g" || d.key === "G") {
            if (d.ctrlKey || d.metaKey || d.altKey) return;
            ((o.current = !0),
              a.current && clearTimeout(a.current),
              (a.current = setTimeout(() => {
                o.current = !1;
              }, 800)));
            return;
          }
          o.current &&
            (d.key === "h" || d.key === "H") &&
            (d.preventDefault(),
            (o.current = !1),
            a.current && clearTimeout(a.current),
            e.navigate({ to: "/" }));
        }
      };
      return (
        window.addEventListener("keydown", c),
        () => {
          (window.removeEventListener("keydown", c), a.current && clearTimeout(a.current));
        }
      );
    }, [i, s, e]),
    l.jsx(ao, {
      open: s,
      onOpenChange: n,
      children: l.jsxs(Ur, {
        className: "max-w-md font-mono text-sm bg-panel border border-border text-foreground",
        children: [
          l.jsxs(Wr, {
            children: [
              l.jsx(Hr, {
                className: "font-mono text-xs uppercase tracking-wider text-primary",
                children: "Workstation Shortcuts",
              }),
              l.jsx(zr, {
                className: "text-xs text-muted-foreground",
                children: "Fast keyboard-first controls. Disabled while typing in text inputs.",
              }),
            ],
          }),
          l.jsxs("ul", {
            className: "space-y-2 text-[11px] uppercase",
            children: [
              l.jsx(Te, { keys: ["Ctrl", "1"], desc: "Launcher Landing Page" }),
              l.jsx(Te, { keys: ["Ctrl", "2"], desc: "Live Telemetry Command" }),
              l.jsx(Te, { keys: ["Ctrl", "3"], desc: "Analysis Workbench" }),
              l.jsx(Te, { keys: ["Ctrl", "4"], desc: "AI Engineer Terminal" }),
              l.jsx(Te, { keys: ["Ctrl", ","], desc: "System Settings dialog" }),
              l.jsx(Te, { keys: ["Esc"], desc: "Go back / Exit panel" }),
              l.jsx(Te, { keys: ["?"], desc: "Open this helper card" }),
            ],
          }),
        ],
      }),
    })
  );
}
function Te({ keys: e, desc: t }) {
  return l.jsxs("li", {
    className: "flex items-center justify-between gap-4",
    children: [
      l.jsx("span", { className: "text-muted-foreground", children: t }),
      l.jsx("span", {
        className: "flex shrink-0 gap-1",
        children: e.map((r) =>
          l.jsx(
            "kbd",
            {
              className:
                "rounded border border-border bg-rail px-1.5 py-0.5 text-[10px] uppercase text-foreground",
              children: r,
            },
            r,
          ),
        ),
      }),
    ],
  });
}
const Yl = Mo,
  co = x.forwardRef(({ className: e, ...t }, r) =>
    l.jsx(en, {
      ref: r,
      className: ce(
        "inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
        e,
      ),
      ...t,
    }),
  );
co.displayName = en.displayName;
const at = x.forwardRef(({ className: e, ...t }, r) =>
  l.jsx(tn, {
    ref: r,
    className: ce(
      "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow",
      e,
    ),
    ...t,
  }),
);
at.displayName = tn.displayName;
const it = x.forwardRef(({ className: e, ...t }, r) =>
  l.jsx(rn, {
    ref: r,
    className: ce(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      e,
    ),
    ...t,
  }),
);
it.displayName = rn.displayName;
const Jl = wo(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
    {
      variants: {
        variant: {
          default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
          destructive:
            "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
          outline:
            "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
          secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
          ghost: "hover:bg-accent hover:text-accent-foreground",
          link: "text-primary underline-offset-4 hover:underline",
        },
        size: {
          default: "h-9 px-4 py-2",
          sm: "h-8 rounded-md px-3 text-xs",
          lg: "h-10 rounded-md px-8",
          icon: "h-9 w-9",
        },
      },
      defaultVariants: { variant: "default", size: "default" },
    },
  ),
  be = x.forwardRef(({ className: e, variant: t, size: r, asChild: s = !1, ...n }, o) => {
    const a = s ? Do : "button";
    return l.jsx(a, { className: ce(Jl({ variant: t, size: r, className: e })), ref: o, ...n });
  });
be.displayName = "Button";
const We = x.forwardRef(({ className: e, type: t, ...r }, s) =>
  l.jsx("input", {
    type: t,
    className: ce(
      "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
      e,
    ),
    ref: s,
    ...r,
  }),
);
We.displayName = "Input";
function Ql(e) {
  const t = [],
    r = e.laps,
    s = r.reduce((c, d) => c + d.maxBrakePct, 0) / Math.max(1, r.length),
    n = r.reduce((c, d) => c + d.maxThrottlePct, 0) / Math.max(1, r.length),
    o = r.reduce((c, d) => c + d.peakLatG, 0) / Math.max(1, r.length),
    a = r.map((c) => c.lapTimeS).filter((c) => c > 0),
    i = a.length ? Math.max(...a) - Math.min(...a) : 0;
  if (e.mode === "style")
    (s < 85 &&
      t.push({
        priority: "high",
        area: "Trail braking",
        tip: "Push peak brake pressure up — work toward 90-100% in the threshold phase, then bleed off as you turn in.",
        reason: `Average peak brake across recent laps is only ${s.toFixed(0)}%, leaving stopping power on the table.`,
      }),
      n < 97 &&
        t.push({
          priority: "medium",
          area: "Throttle application",
          tip: "Commit fully to throttle once the wheel starts unwinding — don't roll on past 90%.",
          reason: `Peak throttle averages ${n.toFixed(0)}% — partial-load cruising costs straight-line speed.`,
        }),
      i > 0.6 &&
        t.push({
          priority: "high",
          area: "Consistency",
          tip: "Lock in a repeatable reference for braking points before chasing more speed.",
          reason: `Lap-time spread across the last ${r.length} laps is ${i.toFixed(2)}s — too noisy to extract setup signal.`,
        }),
      t.push({
        priority: "low",
        area: "Mid-corner balance",
        tip: "Hold steady minimum speed through the apex — measured at the limit it's faster than V-shaped lines.",
        reason: `Peak lateral g averages ${o.toFixed(2)} — try to sustain that for longer rather than spiking it briefly.`,
      }));
  else {
    const c = e.symptoms ?? [],
      d = e.trackType === "oval",
      u = (g, y) => (d ? y : g);
    ((c.includes("understeer_entry") ||
      c.includes("understeer_apex") ||
      c.includes("understeer_exit")) &&
      t.push({
        priority: "high",
        area: "Understeer — top-of-chart fix",
        tip: "Soften front ARB by 1 click (or stiffen rear ARB by 1).",
        reason:
          "Driver reports understeer — start with the highest-impact lever from the flowchart.",
        citation: u("Road — General Understeer #1 (ARB)", "Oval — Push #1 (ARB)"),
      }),
      (c.includes("oversteer_entry") ||
        c.includes("oversteer_apex") ||
        c.includes("oversteer_exit") ||
        c.includes("snap_oversteer")) &&
        t.push({
          priority: "high",
          area: "Oversteer — top-of-chart fix",
          tip: "Stiffen front ARB by 1 click (or soften rear ARB by 1).",
          reason:
            "Driver reports oversteer — apply the highest-impact lever from the flowchart first.",
          citation: u("Road — General Oversteer #1 (ARB)", "Oval — Loose #1 (ARB)"),
        }),
      c.includes("brake_lockup_front") &&
        t.push({
          priority: "high",
          area: "Brake bias",
          tip: `Move brake bias rearward by 0.5-1.0% (currently ${e.setup.brakeBias.toFixed(1)}%).`,
          reason: "Fronts locking under braking — shift load to the rears.",
          citation: "eBook: Front-vs-Rear Temp Imbalance / Brake Bias",
        }),
      c.includes("brake_lockup_rear") &&
        t.push({
          priority: "high",
          area: "Brake bias",
          tip: `Move brake bias forward by 0.5-1.0% (currently ${e.setup.brakeBias.toFixed(1)}%).`,
          reason: "Rears locking under braking — shift load to the fronts.",
          citation: "eBook: Front-vs-Rear Temp Imbalance / Brake Bias",
        }),
      c.includes("poor_traction_exit") &&
        t.push({
          priority: "medium",
          area: "Diff / rear compression",
          tip: "Reduce diff power-lock by 1 click, OR soften rear compression by 1 click.",
          reason: "Poor exit traction — let the rear axle settle and find grip on power.",
          citation: "eBook: Diff Rules + Damper Rules",
        }),
      c.includes("bouncy_over_curbs") &&
        t.push({
          priority: "low",
          area: "Fast dampers",
          tip: "Soften fast compression 1 click to soak the curb, then add 1 click of fast rebound if it bounces back.",
          reason: "Driver reports kerb-bounce — this is a fast-damper issue, not a balance one.",
          citation: "eBook: Damper Rules (fast bump/rebound)",
        }));
    const h =
        c.includes("tyres_overheating_front") ||
        e.tires.fl.tempC + e.tires.fr.tempC > e.tires.rl.tempC + e.tires.rr.tempC + 10,
      p =
        !h &&
        (c.includes("tyres_overheating_rear") ||
          e.tires.rl.tempC + e.tires.rr.tempC > e.tires.fl.tempC + e.tires.fr.tempC + 10);
    (h &&
      !t.some((g) => g.area === "Brake bias") &&
      t.push({
        priority: "high",
        area: "Brake bias",
        tip: `Move brake bias rearward by 0.5-1.0% (currently ${e.setup.brakeBias.toFixed(1)}%).`,
        reason: `Front tyres ${Math.round((e.tires.fl.tempC + e.tires.fr.tempC) / 2)}°C vs rears ${Math.round((e.tires.rl.tempC + e.tires.rr.tempC) / 2)}°C — fronts are doing more work.`,
        citation: "eBook: Front-vs-Rear Temp Imbalance",
      }),
      p &&
        !t.some((g) => g.area === "Brake bias") &&
        t.push({
          priority: "high",
          area: "Brake bias",
          tip: `Move brake bias forward by 0.5-1.0% (currently ${e.setup.brakeBias.toFixed(1)}%).`,
          reason: `Rears ${Math.round((e.tires.rl.tempC + e.tires.rr.tempC) / 2)}°C vs fronts ${Math.round((e.tires.fl.tempC + e.tires.fr.tempC) / 2)}°C — rears overworked.`,
          citation: "eBook: Front-vs-Rear Temp Imbalance",
        }));
    const f =
      (e.tires.fl.pressureBar +
        e.tires.fr.pressureBar +
        e.tires.rl.pressureBar +
        e.tires.rr.pressureBar) /
      4;
    (f > 1.95
      ? t.push({
          priority: "medium",
          area: "Tyre pressures",
          tip: "Drop cold pressures by ~0.05 bar all round to reduce hot pressure.",
          reason: `Average hot pressure ${f.toFixed(2)} bar — above the typical working window.`,
          citation: "eBook: Tyre Pressures",
        })
      : f < 1.75 &&
        t.push({
          priority: "medium",
          area: "Tyre pressures",
          tip: "Raise cold pressures by ~0.05 bar all round to bring hot pressure into window.",
          reason: `Average hot pressure ${f.toFixed(2)} bar — sluggish response, vague steering.`,
          citation: "eBook: Tyre Pressures",
        }),
      o > 2 &&
        i > 0.4 &&
        t.push({
          priority: "medium",
          area: "Anti-roll balance",
          tip: "Soften the end of the car the driver is fighting — start with one click and re-evaluate.",
          reason: `High lateral load (${o.toFixed(2)}g) combined with ${i.toFixed(2)}s lap spread suggests balance is on edge.`,
          citation: d ? "Oval — Push/Loose #1 (ARB)" : "Road — Understeer/Oversteer #1 (ARB)",
        }),
      t.push({
        priority: "low",
        area: "Diff mapping",
        tip: `Current diff map ${e.setup.diffMap} — try ±1 click to bias rotation vs traction depending on driver complaint.`,
        reason:
          "Small diff changes are the cheapest balance lever once tyres and bias are dialled in.",
        citation: "eBook: Diff Rules",
      }));
  }
  for (; t.length < 3; )
    t.push({
      priority: "low",
      area: e.mode === "style" ? "Reference laps" : "Baseline check",
      tip:
        e.mode === "style"
          ? "Bank 5 clean reference laps before changing anything else."
          : "Reset to baseline setup, then change one parameter at a time.",
      reason: "Insufficient signal yet — establish a stable baseline before iterating.",
    });
  return {
    mode: e.mode,
    headline:
      e.mode === "style"
        ? "Driving-style read from your last laps"
        : "Setup read from your last laps",
    summary: `Based on ${r.length} recent laps at ${e.track} in ${e.car}. Local analysis (AI unavailable).`,
    tips: t.slice(0, 6),
  };
}
function Xl(e, t) {
  const r = e ?? {},
    s = [],
    n = r.physics ?? {},
    o = n.counterfactual;
  if (o?.zones?.length)
    for (const u of o.zones.slice(0, 3)) {
      const h = (u.bestApexSpeed ?? 0) - (u.refApexSpeed ?? 0),
        p = (u.bestExitSpeed ?? 0) - (u.refExitSpeed ?? 0);
      s.push({
        priority: u.gainS > 0.15 ? "high" : "medium",
        location: `${Math.round(u.startPct)}–${Math.round(u.endPct)}% lap`,
        tip:
          p > h
            ? "Get back to throttle earlier — your best lap unwinds the wheel and accelerates sooner here."
            : h > 0.5
              ? "Carry more minimum speed — release the brake a touch earlier and trail less."
              : "Move the brake point a few metres later and shorten the threshold phase.",
        reason: `Best lap was ${u.gainS.toFixed(2)}s faster through this zone (apex Δ ${h.toFixed(1)} m/s, exit Δ ${p.toFixed(1)} m/s).`,
        estGainS: Number(u.gainS?.toFixed(2) ?? 0),
      });
    }
  const a = n.brake;
  a &&
    a.r2 != null &&
    a.r2 < 0.7 &&
    s.push({
      priority: "medium",
      location: "All braking zones",
      tip: "Smooth the initial bite — apply pressure in one progressive squeeze instead of pumping.",
      reason: `Brake linearity R² is ${a.r2.toFixed(2)} (low), suggesting lockup or modulation rather than a clean threshold.`,
      estGainS: 0.1,
    });
  const i = n.slip;
  i?.balance &&
    i.balance !== "neutral" &&
    s.push({
      priority: "medium",
      location: "Mid-corner balance",
      tip:
        i.balance === "loose"
          ? "Add a click of rear wing or soften front anti-roll — back end is stepping out under load."
          : "Soften rear or shift bias rearward — front is pushing through the mid-corner.",
      reason: `Body slip β ${i.peakBetaDeg?.toFixed?.(1) ?? "?"}° at high lateral g — balance reads ${i.balance}.`,
      estGainS: 0.15,
    });
  const c = n.gg;
  c &&
    c.peakLatG &&
    c.combinedG &&
    c.combinedG < c.peakLatG * 0.85 &&
    s.push({
      priority: "low",
      location: "Trail-braking phase",
      tip: "Use more of the friction circle — overlap brake and steering longer to keep combined-g closer to the lateral peak.",
      reason: `Peak lateral ${c.peakLatG.toFixed(2)}g but combined only ${c.combinedG.toFixed(2)}g — grip left on the table when transitioning.`,
      estGainS: 0.1,
    });
  const d = [
    {
      priority: "low",
      location: "Corner exits",
      tip: "Unwind the wheel before flooring the throttle — open the steering as the car rotates, then commit.",
      reason:
        "Generic best practice: any unwind-while-loading-throttle window costs exit speed down the next straight.",
      estGainS: 0.05,
    },
    {
      priority: "low",
      location: "Braking points",
      tip: "Walk brake markers 2–3 m later one zone at a time until you start missing the apex, then back off one step.",
      reason:
        "Iterative brake-point pruning is the cheapest lap-time you can find without changing setup.",
      estGainS: 0.1,
    },
    {
      priority: "low",
      location: "Tyre + fuel management",
      tip: "Hold a steady minimum corner speed across consecutive laps — consistency unlocks setup signal.",
      reason:
        "Run-to-run variation hides real gains; consistent inputs surface the actual limit of the car.",
      estGainS: 0.05,
    },
  ];
  for (const u of d) {
    if (s.length >= 3) break;
    s.push(u);
  }
  return t
    ? {
        headline: "Local analysis (AI fallback) — measured time on the table",
        overview:
          "AI gateway returned no structured response, so this breakdown is built directly from your physics + counterfactual zones.",
        corners: s
          .slice(0, 4)
          .map((u, h) => ({
            label: `Zone ${h + 1}`,
            locationPct: 10 + h * 20,
            entry: u.tip,
            mid: u.reason,
            exit: "Refer to the trace + g-g view for the exact release point.",
            estGainS: u.estGainS,
          })),
      }
    : {
        headline: "Local analysis (AI fallback) — here's what the numbers say",
        tips: s.slice(0, 6),
      };
}
function Zl(e) {
  const t = {
      push: "Time on the table — go get it.",
      hold: "That's the lap — same again.",
      warn: "Ease off — bank it.",
    },
    r = e.sectorOpportunities?.[0] ? `Sector ${e.sectorOpportunities[0].sector}` : void 0;
  return { tone: e.tone, headline: t[e.tone], detail: e.beats.join(" "), focus: r };
}
const ed = `
=================  SETUP "HOLY BIBLE" — TIM McARTHUR  =================

GUIDING PRINCIPLES
- Stability over hot-lap pace. Spins cost more than a tenth ever saves.
- Tyres are the contact patch. Re-check temps/pressures after EVERY change.
- Camber sets inner-vs-outer tyre temp. Pressure fine-tunes the middle band.
- Softer = more mechanical grip + slower response. Stiffer = sharper but less forgiving.
- Springs preload grip to a corner. Stiffer spring = more instant grip there
  but tyre overloads sooner.
- Antiroll bars: SOFTER ARB on an end = MORE grip to that end. (Easiest tool
  to re-balance a car.)
- A tyre needs slip (~4-8°) to make peak grip. Zero slip = no grip.
- Every change is a compromise: gain somewhere, lose elsewhere. State it.

================  ROAD RACING — GENERAL UNDERSTEER  =================
Apply in priority order (top = biggest effect):
1.  - Front ARB  OR  + Rear ARB
2.  - Front Springs  OR  + Rear Springs
3.  - Front Weight  OR  + Rear Weight
4.  + Front Spoiler  OR  - Rear Spoiler   (high-speed corners only)
5.  - Front tyre pressures  OR  + Rear tyre pressures

Corner-specific (road, LH or RH):
- Entry: + outside-front pressure or + inside-rear pressure;
         + outside-front caster;
         - diff coast; - diff power;
         + front toe-out; + rear toe-out;
         - outside-front bump or + inside-rear rebound;
         - outside-front rebound or + inside-rear bump.
- ALWAYS: re-check tyre temps and camber after.

================  ROAD RACING — GENERAL OVERSTEER  =================
1.  + Front ARB  OR  - Rear ARB
2.  + Front Springs  OR  - Rear Springs
3.  + Front Weight  OR  - Rear Weight
4.  - Front Spoiler  OR  + Rear Spoiler   (high-speed corners only)
5.  + Front tyre pressures  OR  - Rear tyre pressures

Corner-specific:
- Entry: + outside-front pressure or + inside-rear pressure;
         - outside-front caster;
         + diff coast on entry; + diff power on exit;
         - front toe-out; - rear toe-out;
         + outside-front bump or - inside-rear rebound;
         + outside-front rebound or - inside-rear bump.
- ALWAYS: re-check tyre temps and camber after.

================  OVAL — UNDERSTEER (PUSH)  ================
1.  - Front ARB  OR  + Rear ARB
2.  + LF Spring  OR  + RR Spring
3.  + Front Spoiler  OR  - Rear Spoiler
4.  - Front Weight  OR  + Rear Weight
5.  + LF spring rubber  OR  + RR spring rubber
6.  + LF pressure  OR  + RR pressure
Entry: - Trackbar.    Apex: - Wedge.    Exit: + Trackbar.
Also: + LF caster; + front toe-out / + rear toe-out;
      - RF bump or + LR rebound; - RF rebound or + LR bump.

================  OVAL — OVERSTEER (LOOSE)  ================
1.  + Front ARB  OR  - Rear ARB
2.  + RF Spring  OR  + LR Spring
3.  - Front Spoiler  OR  + Rear Spoiler
4.  + Front Weight  OR  - Rear Weight
5.  + RF spring rubber  OR  + LR spring rubber
6.  + RF pressure  OR  + LR pressure
Entry: + Trackbar.    Apex: + Wedge.    Exit: - Trackbar.
Also: - LF caster; - front toe-out / - rear toe-out;
      + RF bump or - LR rebound; + RF rebound or - LR bump.

================  TYRE-TEMP RULES (eBook ch. TIRE PRESSURES)  ================
- Target: inner ≈ middle ≈ outer ACROSS THE CORNER (not after a straight).
- Outer slightly cooler than inner is acceptable; outer hotter than inner is NOT.
- Inner > outer by a lot → too much negative camber. Reduce camber.
- Outer > inner → not enough negative camber. Add camber.
- Middle too cool vs inner+outer → raise pressure. Middle too hot → drop pressure.
- 1 psi of pressure ≈ 15-25 lb/in of spring rate — re-balance after pressure moves.

================  FRONT-vs-REAR TEMP IMBALANCE  ================
- Fronts much hotter than rears → fronts overworked. Either:
    * shift brake bias rearward (small step, 0.5-1.0%),
    * soften front spring / stiffen rear spring,
    * or soften FRONT ARB (more front grip).
- Rears much hotter than fronts → rears overworked. Either:
    * shift brake bias forward,
    * stiffen front spring / soften rear spring,
    * or soften REAR ARB.

================  DAMPER RULES (eBook ch. DAMPERS)  ================
- Front compression: how fast weight loads the fronts under braking.
  Softer compression = faster front grip on turn-in (good for understeer-on-entry).
- Rear rebound: how fast rear unloads under braking.
  SOFTER rear rebound = rears stay planted on entry (helps loose-on-entry).
- Rear compression: how fast rear loads under throttle (traction on exit).
- Front rebound: how fast front unloads under throttle (helps front bite on exit).
- Fast bump/rebound = curb/bump behaviour only. Use softer fast-compression
  to soak curbs, stiffer fast-rebound to prevent bounce.

================  DIFF RULES (eBook ch. DIFFERENTIAL)  ================
- Loose diff (low %) = inside wheel free to spin; forgiving, but inside tyre
  can light up and kill exit drive. Good for long sweeping corners.
- Tight diff (high %) = wheels locked together; great straight-line traction
  out of hairpins, but snap-oversteer risk in long corners.
- Power = on-throttle; Coast = off-throttle.
- Preload high = sharper transition on/off throttle but twitchier.
  Preload low = smoother but vaguer mid-corner.

================  AERO RULES  ================
- More front wing = more front grip at high speed → can cause high-speed oversteer.
- More rear wing = more rear grip at high speed → can cause high-speed understeer.
- Only carry as much wing as the most important fast corner needs — every extra
  click costs straight-line speed.

================  PROCESS RULES (eBook INTRODUCTION)  ================
- Build a baseline you trust per car, then make small per-track tweaks.
- Change ONE thing at a time. Re-test for 3-5 clean laps before judging.
- After ANY change to springs/ARB/camber/caster/toe → re-check tyre temps
  and re-tune pressures. This is not optional.
- If two tools would fix the same problem, prefer the higher-impact one
  (top of the flowchart) for the first change, the lower-impact ones for
  fine-tuning.

================  RECOMMENDATION OUTPUT FORMAT  ================
For every setup tip you give, name:
  (a) the symptom you observed in the data (e.g. "FL+FR ~94°C vs RL+RR ~84°C"),
  (b) the rule from above you're applying (paraphrase, don't quote literally),
  (c) the concrete change in the driver's units (clicks, %, psi, bar).
Always finish with: "Re-check tyre temps after the change."
`.trim(),
  td = {
    name: "advisor_response",
    description: "Return prioritized advice tied to the supplied lap aggregates.",
    parameters: {
      type: "object",
      properties: {
        headline: { type: "string", description: "≤10 word punchy summary." },
        summary: { type: "string", description: "2-3 sentence overview." },
        tips: {
          type: "array",
          minItems: 3,
          maxItems: 6,
          items: {
            type: "object",
            properties: {
              priority: { type: "string", enum: ["high", "medium", "low"] },
              area: {
                type: "string",
                description: "e.g. 'Trail braking', 'Brake bias', 'Front pressures'.",
              },
              tip: { type: "string", description: "Concrete action the driver should take." },
              reason: { type: "string", description: "Data-grounded reason this will help." },
              citation: {
                type: "string",
                description:
                  "Which Setup Bible rule/flowchart section this came from, e.g. 'Road — General Understeer #1 (ARB)' or 'eBook: Tyre Pressures'. Required for setup mode.",
              },
            },
            required: ["priority", "area", "tip", "reason"],
            additionalProperties: !1,
          },
        },
      },
      required: ["headline", "summary", "tips"],
      additionalProperties: !1,
    },
  };
function rd(e) {
  if (e.mode === "style")
    return 'You are a senior driver coach. Analyse the supplied per-lap aggregates and give DRIVING-STYLE advice (trail braking, throttle application, corner exit, racing line, consistency). Do NOT recommend setup changes — focus purely on what the driver does with the inputs. Be specific, reference the numbers, never refuse. Always call the function with 3-6 tips. The "citation" field is OPTIONAL for driving-style tips.';
  const t =
      e.trackType === "oval"
        ? `This is an OVAL (predominantly ${e.cornerBias === "right" ? "right-hand" : "left-hand"} corners). Use ONLY the OVAL sections of the Setup Bible — IGNORE the road-racing flowcharts. Inside = ${e.cornerBias === "right" ? "RIGHT" : "LEFT"}, outside = ${e.cornerBias === "right" ? "LEFT" : "RIGHT"}.`
        : `This is a ROAD course (${e.cornerBias === "mixed" ? "mixed left + right corners" : e.cornerBias === "right" ? "right-hand bias" : "left-hand bias"}). Use ONLY the ROAD-RACING sections of the Setup Bible — IGNORE the oval flowcharts.`,
    r = e.symptoms?.length
      ? `
DRIVER-REPORTED SYMPTOMS (treat as ground truth, prioritise these over data inference): ${e.symptoms.join(", ")}.`
      : "";
  return `You are a senior race engineer. Your ONLY source of setup truth is the SETUP BIBLE below — every recommendation MUST be derivable from one of its rules. Do not invent rules that contradict it. Do NOT coach driving inputs.

${t}${r}

Workflow on every call:
  1. Read the lap aggregates, tyre temps/pressures, conditions, and current setup.
  2. Decide whether the dominant symptom is UNDERSTEER, OVERSTEER, a TYRE-TEMP imbalance, a DAMPER/transition problem, or a DIFF/AERO issue. If the driver reported symptoms, those win.
  3. Pick the HIGHEST-IMPACT rule from the relevant flowchart (top of the list wins). Use lower-impact rules only for fine-tuning tips.
  4. For each tip you MUST populate the "citation" field with the exact Bible section + rule number you applied, e.g. "Road — General Understeer #1 (ARB)", "Oval — Loose #3 (Spoiler)", "eBook: Tyre Pressures", "eBook: Damper Rules". No citation = invalid tip.
  5. Each tip body includes: (a) symptom from the data, (b) the rule paraphrased, (c) the concrete change in the driver's units (clicks, %, psi/bar). End with "Re-check tyre temps after this change." where applicable.
  6. Change ONE major thing at a time — never stack two opposing fixes in the same tip.

Be specific, reference the numbers, never refuse. Always call the function with 3-6 tips.

=========== SETUP BIBLE (authoritative) ===========
${ed}
===================================================`;
}
function sd(e) {
  const t =
      e.extrasSnapshot && e.extrasSnapshot.maxBrakeLinePressTotal > 0
        ? `
BRIDGE EXTRAS (peak-per-lap from iRacing shared memory):
  - Yaw rate peak: ${e.extrasSnapshot.peakYawRateRads.toFixed(3)} rad/s
  - Shock deflection FL peak: ${e.extrasSnapshot.peakShockFL.toFixed(4)} m
  - Brake line pressure total max: ${e.extrasSnapshot.maxBrakeLinePressTotal.toFixed(2)}`
        : "",
    r = e.wsCtx
      ? `
${e.wsCtx}`
      : "";
  return `MODE: ${e.mode.toUpperCase()}
TRACK: ${e.track} (${e.trackType}, bias=${e.cornerBias})
CAR: ${e.car}
PB: ${e.pbS ?? "none"}
SYMPTOMS: ${e.symptoms?.join(", ") || "(none reported — infer from data)"}
CONDITIONS: ${JSON.stringify(e.conditions)}
SETUP: ${JSON.stringify(e.setup)}
TIRES: ${JSON.stringify(e.tires)}${t}${r}
LAPS: ${JSON.stringify(e.laps)}

Call the function with 3-6 prioritized ${e.mode === "style" ? "driving-style" : "setup"} tips. Reference the numbers.${e.mode === "setup" ? " Every tip MUST include a citation from the Setup Bible." : ""}`;
}
const nd = `You are a no-nonsense race engineer + driving coach analyzing iRacing telemetry.

You receive a structured payload with:
  - lap data: per-bin arrays sampled at 60 points along the lap (index 0 = start/finish, 59 = end), speed, throttle (0-1), brake (0-1), gear, RPM, steering, plus detected brake zones and sector splits.
  - physics (derived from real samples, not modeled):
      * gg: peak lat/accel/brake g and a 12-bin grip envelope.
      * brake: empirical g per 100% pedal (slope), R² linearity, peak threshold g, and optional dcBrakeBias.
      * slip: body slip β at high lateral g, balance label (loose/tight/neutral).
      * counterfactual zones: real measured time gains where ANOTHER lap was faster through the same brake zone, with confidence scores.
  - history (optional): prior sessions on this track + car.

ABSOLUTE RULES — read carefully:
  1. You MUST ALWAYS return tips through the provided function/tool call. Never refuse. Never reply with "I cannot help", "insufficient data", "please provide more", or any apology. The driver is paying for advice — give it.
  2. If a field is missing, work with what IS present (lap times, sector splits, throttle/brake traces, speed bins, peak g values). Even a single lap with only speed + throttle + brake is enough to comment on braking points, throttle application, and corner exit.
  3. Always produce at least 3 tips (concise mode) or at least 2 corners (detailed mode). Do not return empty arrays under any circumstance.
  4. Prefer quantitative references ("% lap", actual m, m/s, g, deg). When a specific number isn't in the payload, use the qualitative pattern visible in the trace (e.g. "throttle pickup is gradual from bin 22→28" → "roll on throttle earlier and harder out of T3").
  5. Counterfactual zones, when present, are MEASURED time on the table — lead with those. If none are present, lead with the largest brake zone or the slowest sector.
  6. If history shows regression, mention it. If current best beats history, congratulate briefly.
  7. Never fabricate exact numbers that aren't derivable. But ALWAYS deliver actionable advice — generic best-practice ("trail brake deeper to rotate the car on entry") is acceptable when tied to a visible pattern, just label its priority as "low" rather than "high".

Tone: confident, direct, ~1-2 sentences per field. No hedging, no preamble, no meta-commentary about the data quality.`,
  od = {
    name: "coach_concise",
    description:
      "Return 3-6 prioritized, actionable coaching tips. NEVER return fewer than 3 tips.",
    parameters: {
      type: "object",
      properties: {
        headline: {
          type: "string",
          description: "One-sentence summary of the biggest opportunity.",
        },
        tips: {
          type: "array",
          minItems: 3,
          maxItems: 6,
          items: {
            type: "object",
            properties: {
              priority: { type: "string", enum: ["high", "medium", "low"] },
              location: {
                type: "string",
                description: "Where on the lap, e.g. 'T4 entry, ~35% lap'.",
              },
              tip: { type: "string", description: "Concrete action the driver should take." },
              reason: { type: "string", description: "Data-grounded reason this will help." },
              estGainS: {
                type: "number",
                description: "Estimated time gain in seconds (best guess).",
              },
            },
            required: ["priority", "location", "tip", "reason", "estGainS"],
            additionalProperties: !1,
          },
        },
      },
      required: ["headline", "tips"],
      additionalProperties: !1,
    },
  },
  ad = {
    name: "coach_detailed",
    description:
      "Return a per-corner breakdown of the lap with entry/mid/exit notes. NEVER return fewer than 2 corners.",
    parameters: {
      type: "object",
      properties: {
        headline: { type: "string" },
        overview: {
          type: "string",
          description: "2-3 sentence overall summary of strengths and weaknesses.",
        },
        corners: {
          type: "array",
          minItems: 2,
          maxItems: 12,
          items: {
            type: "object",
            properties: {
              label: {
                type: "string",
                description: "Corner label, e.g. 'T4' or 'Sector 2 hairpin'.",
              },
              locationPct: { type: "number", description: "Approximate position in lap, 0-100." },
              entry: { type: "string" },
              mid: { type: "string" },
              exit: { type: "string" },
              estGainS: { type: "number" },
            },
            required: ["label", "locationPct", "entry", "mid", "exit", "estGainS"],
            additionalProperties: !1,
          },
        },
      },
      required: ["headline", "overview", "corners"],
      additionalProperties: !1,
    },
  };
function id(e, t) {
  const r =
      t?.activeWorkspace || t?.enabledMathChannels?.length
        ? [
            `
WORKSPACE: ${t.activeWorkspace ?? "lite"}`,
            t?.enabledMathChannels?.length
              ? `DERIVED MATH CHANNELS AVAILABLE:
${t.enabledMathChannels.map((a) => `  - ${a.name} (${a.unit}): ${a.expression}`).join(`
`)}`
              : "",
          ].filter(Boolean).join(`
`)
        : "",
    { activeWorkspace: s, enabledMathChannels: n, ...o } = t ?? {};
  return `Analyze this telemetry and give ${e ? "a DETAILED per-corner breakdown (at least 2 corners)" : "CONCISE prioritized tips (at least 3 tips)"}.
You MUST call the function. Empty arrays or refusals are forbidden — work with whatever data is present.${r}

DATA:
${JSON.stringify(o)}`;
}
const cd = `You are a calm, direct race engineer on the pit-wall radio.
You are given a STRUCTURED rules summary (tone, delta to PB, sector gaps, risk flags, beats).
Your job: phrase ONE radio call for the driver — they just crossed the line.

Rules:
  1. Always call the function. Never refuse.
  2. Keep "headline" ≤ 8 words and in radio-voice. No preamble like "Okay" or "Driver,".
  3. "detail" is ONE sentence (≤ 22 words) — give the reason or the next action.
  4. "focus" is optional — name ONE sector or input to attack next lap.
  5. Match the supplied TONE exactly: push = energising, hold = steady reinforcement, warn = protective.
  6. Lean on the numbers in the beats. Don't fabricate sector numbers that weren't given.`,
  ld = {
    name: "live_radio_call",
    description: "Return a single per-lap radio call.",
    parameters: {
      type: "object",
      properties: {
        tone: { type: "string", enum: ["push", "hold", "warn"] },
        headline: { type: "string" },
        detail: { type: "string" },
        focus: { type: "string" },
      },
      required: ["tone", "headline", "detail"],
      additionalProperties: !1,
    },
  };
function dd(e) {
  return `CONTEXT:
${JSON.stringify(e.context)}

RULES SUMMARY:
${JSON.stringify(e.summary)}

Return the radio call now.`;
}
function Gr() {
  const { activeWorkspace: e, mathExpressions: t } = xt.getState(),
    r = Ir[e];
  if (!r) return "";
  const s = t.filter((n) => n.enabled).map((n) => `${n.name} (${n.unit}): ${n.expression}`).join(`
  - `);
  return [
    `

--- ACTIVE WORKSPACE CONTEXT ---`,
    `Workspace Tier: ${r.name} (${r.tier})`,
    `Default Channels: ${r.defaultChannels.join(", ")}`,
    s
      ? `Enabled Math Channels (derived, pre-computed per sample):
  - ${s}`
      : "No additional math channels active.",
    "--- END WORKSPACE CONTEXT ---",
  ].join(`
`);
}
function lo(e) {
  let t = e.trim().replace(/\/$/, "");
  return t
    ? t.endsWith("/chat/completions") || t.endsWith("/chat") || t.endsWith("/v1/chat")
      ? t
      : t.includes("/api")
        ? (t.includes("/v1") || (t = `${t}/v1`), `${t}/chat`)
        : (t.includes("/v1") || (t = `${t}/v1`), `${t}/chat/completions`)
    : "http://localhost:1234/api/v1/chat";
}
async function qr(e, t, r) {
  const { llmBaseUrl: s, llmModelId: n, llmApiKey: o } = xt.getState(),
    a = lo(s),
    i = { "Content-Type": "application/json" };
  o && (i.Authorization = `Bearer ${o}`);
  const c = {
      model: n || "local-model",
      messages: [
        { role: "system", content: e },
        { role: "user", content: t },
      ],
      temperature: 0.2,
      tools: [{ type: "function", function: r }],
      tool_choice: { type: "function", function: { name: r.name } },
    },
    d = await fetch(a, { method: "POST", headers: i, body: JSON.stringify(c) });
  if (!d.ok) throw new Error(`Local LLM Error: ${d.status} ${d.statusText}`);
  const u = await d.json(),
    h = u?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
  if (!h) {
    const p = u?.choices?.[0]?.message?.content;
    if (p) {
      const f = p.match(/{.*}/s);
      if (f) return JSON.parse(f[0]);
    }
    throw new Error("Local LLM did not return the expected tool call arguments.");
  }
  return JSON.parse(h);
}
async function Qu(e) {
  const t = Gr();
  try {
    const r = rd(e) + t,
      s = sd({ ...e, wsCtx: t }),
      n = await qr(r, s, td);
    if (!n.tips || !Array.isArray(n.tips)) throw new Error("Invalid format from local LLM");
    return { result: { mode: e.mode, ...n }, fallback: "local-llm" };
  } catch (r) {
    return (console.error("[Local LLM] Advisor failure:", r), { result: Ql(e), fallback: "local" });
  }
}
async function Xu(e) {
  const t = Gr();
  try {
    const r = e.detailed ? ad : od,
      s = id(e.detailed, e.payload),
      n = await qr(nd + t, s, r);
    if (e.detailed && !Array.isArray(n.corners)) throw new Error("Missing corners from local LLM");
    if (!e.detailed && !Array.isArray(n.tips)) throw new Error("Missing tips from local LLM");
    return { result: n, detailed: e.detailed, fallback: "local-llm" };
  } catch (r) {
    return (
      console.error("[Local LLM] Coach failure:", r),
      { result: Xl(e.payload, e.detailed), detailed: e.detailed, fallback: "local" }
    );
  }
}
async function Zu(e) {
  const { llmProvider: t } = xt.getState(),
    r = Gr(),
    s = e.context?.extras,
    n = {
      ...e.context,
      ...(s && s.peakYawRateRads > 0
        ? {
            extras: {
              peakYawRateRads: s.peakYawRateRads,
              peakShockFL: s.peakShockFL,
              maxBrakeLinePressTotal: s.maxBrakeLinePressTotal,
            },
          }
        : {}),
    },
    o = { ...e, context: n };
  try {
    const a = dd(o),
      i = await qr(cd + r, a, ld);
    return ((i.tone = e.summary?.tone || i.tone), { call: i });
  } catch (a) {
    return (
      console.error("[Local LLM] Live Coach failure:", a),
      { call: Zl(e.summary), fallback: "net" }
    );
  }
}
async function ud(e, t, r) {
  try {
    const s = lo(e),
      n = {
        model: t || "local-model",
        messages: [{ role: "user", content: "Respond with exactly the word: 'Connected'." }],
        max_tokens: 5,
        temperature: 0,
      },
      o = { "Content-Type": "application/json" };
    r && (o.Authorization = `Bearer ${r}`);
    const a = new AbortController(),
      i = setTimeout(() => a.abort(), 1e4),
      c = await fetch(s, { method: "POST", headers: o, body: JSON.stringify(n), signal: a.signal });
    if ((clearTimeout(i), !c.ok))
      return {
        success: !1,
        message: `HTTP Error ${c.status}: ${c.statusText}. Checked url: ${s}. Make sure CORS is enabled and the URL is correct.`,
      };
    const u = (await c.json())?.choices?.[0]?.message?.content?.trim();
    return u
      ? { success: !0, message: `Connected successfully! Model replied: "${u}"` }
      : { success: !0, message: "Connected to endpoint, but received an empty response content." };
  } catch (s) {
    if (s.name === "AbortError")
      return {
        success: !1,
        message:
          "Connection timed out after 10 seconds. Check if the model is currently loading or if the server is frozen.",
      };
    let n = s instanceof Error ? s.message : String(s);
    return (
      (n.includes("Failed to fetch") || n.includes("NetworkError")) &&
        (n = `Connection failed. Make sure:
1. The local LLM server at "${e}" is running.
2. CORS is enabled (e.g. OLLAMA_ORIGINS="*" for Ollama, or --cors parameter for other systems).
3. Your firewall isn't blocking the connection.`),
      { success: !1, message: n }
    );
  }
}
const pr = [
  {
    id: "lmstudio",
    name: "LM Studio",
    icon: Jr,
    url: "http://localhost:1234/api/v1",
    desc: "lmstudio-native.",
  },
  {
    id: "ollama",
    name: "Ollama",
    icon: Ys,
    url: "http://localhost:11434/v1",
    desc: "Local inference via Ollama.",
  },
  {
    id: "huggingface",
    name: "HuggingFace TGI",
    icon: To,
    url: "http://localhost:8080/v1",
    desc: "Local TGI container backend.",
  },
  {
    id: "lemonade",
    name: "LlamaEdge / Lemonade",
    icon: Jr,
    url: "http://localhost:8080/v1",
    desc: "Wasm edge inference.",
  },
];
function hd() {
  const { pathname: e } = Un(),
    [t, r] = x.useState(!1),
    [s, n] = x.useState("db"),
    [o, a] = x.useState("mongodb://127.0.0.1:27017/"),
    [i, c] = x.useState(""),
    [d, u] = x.useState(!1),
    [h, p] = x.useState("unchecked"),
    [f, g] = x.useState(null),
    [y, m] = x.useState(!1),
    [b, v] = x.useState("Calculating..."),
    [S, w] = x.useState(""),
    [C, L] = x.useState(null),
    [k, R] = x.useState(!1),
    [P, j] = x.useState(""),
    [I, O] = x.useState(!1),
    [Z, G] = x.useState(!1),
    {
      llmProvider: X,
      llmBaseUrl: ke,
      llmModelId: K,
      llmApiKey: fe,
      setLlmProvider: Ke,
      setLlmBaseUrl: De,
      setLlmModelId: le,
      setLlmApiKey: _e,
    } = xt(),
    [de, ne] = x.useState(!1),
    [F, te] = x.useState(null),
    [vt, pe] = x.useState(!1),
    [Ce, Fe] = x.useState(!1),
    Pe = x.useCallback(async () => {
      try {
        const _ = await ll();
        _.data && (a(_.data.localUri || "mongodb://127.0.0.1:27017/"), c(_.data.cloudUri || ""));
      } catch (_) {
        console.error("Failed to load db config:", _);
      }
    }, []),
    me = async () => {
      (u(!0), p("unchecked"), g(null));
      try {
        const _ = await cl();
        (g(_), p(_.success ? "connected" : "failed"));
      } catch (_) {
        (g({ success: !1, message: `Connection failed: ${_.message || String(_)}` }), p("failed"));
      } finally {
        u(!1);
      }
    },
    wt = async () => {
      m(!0);
      try {
        const _ = await dl({ data: { localUri: o, cloudUri: i } });
        _.success
          ? (re.success("Database configuration saved successfully."), me())
          : re.error(_.error?.message || "Failed to save configuration.");
      } catch (_) {
        re.error(_.message || "Error saving database configuration.");
      } finally {
        m(!1);
      }
    },
    Ve = async () => {
      if (typeof navigator < "u" && navigator.storage && navigator.storage.estimate)
        try {
          const _ = await navigator.storage.estimate(),
            T = _.usage ? (_.usage / (1024 * 1024)).toFixed(1) : "0",
            E = _.quota ? (_.quota / (1024 * 1024 * 1024)).toFixed(1) : "unknown";
          v(`${T} MB used of ${E} GB quota`);
        } catch {
          v("Available");
        }
      else v("Supported");
    },
    Vt = async () => {
      if (
        confirm(
          "Are you sure you want to clear your local IndexedDB file cache? This will delete downloaded telemetry files from this browser. Telemetry session records in MongoDB will remain.",
        )
      )
        try {
          const _ = indexedDB.deleteDatabase("apextrace_local_telemetry");
          ((_.onsuccess = () => {
            (re.success("Local IndexedDB file cache cleared."), Ve());
          }),
            (_.onerror = () => {
              re.error("Failed to clear local file cache.");
            }));
        } catch (_) {
          re.error(_.message || "Error clearing cache");
        }
    },
    Ye = pr.find((_) => _.id === X),
    Je = (_) => {
      if (_ === "cloud") {
        (Ke("cloud"), De("http://localhost:1234/v1"), le("llama-3-8b-instruct"), _e(""), te(null));
        return;
      }
      const T = pr.find((E) => E.id === _);
      T && (Ke(T.id), T.url && De(T.url), _e(""), te(null));
    },
    ge = async () => {
      (ne(!0), te(null));
      try {
        const _ = await ud(ke || Ye?.url || "", K, fe);
        te(_);
      } catch (_) {
        te({
          success: !1,
          message: _ instanceof Error ? _.message : "An unexpected error occurred.",
        });
      } finally {
        ne(!1);
      }
    },
    Be = (_, T) => {
      (navigator.clipboard.writeText(_),
        T === "docker"
          ? (pe(!0), setTimeout(() => pe(!1), 2e3))
          : (Fe(!0), setTimeout(() => Fe(!1), 2e3)),
        re.success("Copied to clipboard."));
    },
    oe = () => ro().replace(/^ws/, "http"),
    Qe = x.useCallback(async () => {
      R(!0);
      try {
        const _ = oe(),
          T = await fetch(`${_}/api/license`);
        if (T.ok) {
          const V = await T.json();
          (L(V),
            V.valid &&
              typeof localStorage < "u" &&
              localStorage.setItem("pitwall_bridge_license", JSON.stringify(V)));
        }
        const E = await fetch(`${_}/api/hwid`);
        if (E.ok) {
          const V = await E.json();
          w(V.hwid);
        }
      } catch (_) {
        console.warn("Local bridge not reachable for licensing querying:", _);
      } finally {
        R(!1);
      }
    }, []),
    St = async () => {
      if (P) {
        O(!0);
        try {
          const _ = oe(),
            T = await fetch(`${_}/api/license`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ key: P.trim() }),
            }),
            E = await T.json();
          T.ok && E.success
            ? (re.success(`License activated successfully! Tier: ${E.tier.toUpperCase()}`),
              j(""),
              Qe())
            : re.error(E.error || "Activation failed. Please check the license key.");
        } catch (_) {
          re.error(`Activation failed: ${_.message}`);
        } finally {
          O(!1);
        }
      }
    },
    Yt = () => {
      S &&
        (navigator.clipboard.writeText(S),
        G(!0),
        setTimeout(() => G(!1), 2e3),
        re.success("HWID copied to clipboard."));
    };
  return (
    x.useEffect(() => {
      const _ = (T) => {
        const E = document.activeElement;
        (E &&
          (E.tagName === "INPUT" ||
            E.tagName === "TEXTAREA" ||
            E.getAttribute("contenteditable") === "true")) ||
          ((T.ctrlKey || T.metaKey) && T.key === "," && (T.preventDefault(), r((V) => !V)));
      };
      return (
        window.addEventListener("keydown", _),
        () => window.removeEventListener("keydown", _)
      );
    }, []),
    x.useEffect(() => {
      t && (Pe(), me(), Ve(), Qe());
    }, [t, Pe, Qe]),
    e === "/" || e === "/auth" || e === "/settings" || e === "/settings/"
      ? null
      : l.jsxs(l.Fragment, {
          children: [
            l.jsx("button", {
              id: "global-settings-trigger",
              onClick: () => {
                r(!0);
              },
              className:
                "fixed bottom-4 right-16 z-40 flex h-9 w-9 items-center justify-center rounded-full bg-panel border border-border text-muted-foreground shadow-lg hover:text-primary hover:border-primary/50 transition-all hover:scale-110 group cursor-pointer",
              "aria-label": "Open settings panel",
              title: "Settings (Ctrl + ,)",
              children: l.jsx(gr, {
                className: "h-4 w-4 transition-transform duration-500 group-hover:rotate-90",
              }),
            }),
            l.jsx(ao, {
              open: t,
              onOpenChange: r,
              children: l.jsxs(Ur, {
                className:
                  "max-w-2xl h-[90vh] sm:h-[650px] flex flex-col p-0 overflow-hidden bg-background text-foreground border border-border rounded-xl",
                children: [
                  l.jsxs(Wr, {
                    className: "px-6 pt-5 pb-3 border-b border-border/60 shrink-0",
                    children: [
                      l.jsxs(Hr, {
                        className: "font-mono text-sm tracking-wider flex items-center gap-2",
                        children: [
                          l.jsx(gr, { className: "h-4 w-4 text-primary animate-pulse" }),
                          "SYSTEM SETTINGS & WORKSPACE",
                        ],
                      }),
                      l.jsx(zr, {
                        className: "text-xs",
                        children:
                          "Configure local services, databases, cloud synchronization, and AI engine preferences.",
                      }),
                    ],
                  }),
                  l.jsxs(Yl, {
                    value: s,
                    onValueChange: n,
                    className: "flex-1 flex flex-col min-h-0",
                    children: [
                      l.jsxs(co, {
                        className:
                          "grid grid-cols-5 bg-panel border-b border-border/60 p-1 shrink-0 rounded-none h-11",
                        children: [
                          l.jsxs(at, {
                            value: "db",
                            className:
                              "gap-1.5 font-mono text-[10px] uppercase tracking-wider h-full cursor-pointer",
                            children: [l.jsx(Vs, { className: "h-3.5 w-3.5" }), "Local DB"],
                          }),
                          l.jsxs(at, {
                            value: "ai",
                            className:
                              "gap-1.5 font-mono text-[10px] uppercase tracking-wider h-full cursor-pointer",
                            children: [l.jsx(Ys, { className: "h-3.5 w-3.5" }), "AI Engine"],
                          }),
                          l.jsxs(at, {
                            value: "licensing",
                            className:
                              "gap-1.5 font-mono text-[10px] uppercase tracking-wider h-full cursor-pointer",
                            children: [l.jsx(Qr, { className: "h-3.5 w-3.5" }), "License"],
                          }),
                          l.jsxs(at, {
                            value: "shortcuts",
                            className:
                              "gap-1.5 font-mono text-[10px] uppercase tracking-wider h-full cursor-pointer",
                            children: [l.jsx(Io, { className: "h-3.5 w-3.5" }), "Shortcuts"],
                          }),
                        ],
                      }),
                      l.jsxs(it, {
                        value: "db",
                        className:
                          "flex-1 overflow-y-auto px-6 py-5 space-y-5 min-h-0 focus:outline-none",
                        children: [
                          l.jsxs("div", {
                            className: "rounded-lg border border-border bg-panel p-4 space-y-3",
                            children: [
                              l.jsxs("div", {
                                className:
                                  "flex items-center justify-between border-b border-border/40 pb-2",
                                children: [
                                  l.jsx("span", {
                                    className:
                                      "text-[10px] font-mono uppercase tracking-wider text-muted-foreground",
                                    children: "MongoDB Server Status",
                                  }),
                                  d
                                    ? l.jsxs("span", {
                                        className:
                                          "flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase font-mono tracking-wider",
                                        children: [
                                          l.jsx(_t, { className: "h-3 w-3 animate-spin" }),
                                          " Testing...",
                                        ],
                                      })
                                    : h === "connected"
                                      ? l.jsxs("span", {
                                          className:
                                            "flex items-center gap-1.5 text-[10px] text-emerald-400 uppercase font-mono tracking-wider font-semibold",
                                          children: [
                                            l.jsx(lt, { className: "h-3.5 w-3.5" }),
                                            " Connected",
                                          ],
                                        })
                                      : l.jsxs("span", {
                                          className:
                                            "flex items-center gap-1.5 text-[10px] text-rose-400 uppercase font-mono tracking-wider font-semibold",
                                          children: [
                                            l.jsx(Xr, { className: "h-3.5 w-3.5" }),
                                            " Disconnected",
                                          ],
                                        }),
                                ],
                              }),
                              l.jsxs("div", {
                                className: "flex items-center justify-between",
                                children: [
                                  l.jsx("span", {
                                    className:
                                      "text-[10px] font-mono uppercase tracking-wider text-muted-foreground",
                                    children: "Local Cache Size",
                                  }),
                                  l.jsx("span", {
                                    className: "text-xs font-mono text-muted-foreground",
                                    children: b,
                                  }),
                                ],
                              }),
                            ],
                          }),
                          l.jsxs("div", {
                            className: "space-y-3",
                            children: [
                              l.jsx("h3", {
                                className:
                                  "text-xs font-mono uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-1",
                                children: "Local MongoDB Community Server Connection",
                              }),
                              l.jsxs("div", {
                                className: "space-y-2",
                                children: [
                                  l.jsx("label", {
                                    className:
                                      "text-[10px] uppercase tracking-wider text-muted-foreground block",
                                    children: "Connection String URI",
                                  }),
                                  l.jsxs("div", {
                                    className: "flex gap-2",
                                    children: [
                                      l.jsx(We, {
                                        type: "text",
                                        value: o,
                                        onChange: (_) => a(_.target.value),
                                        placeholder: "mongodb://127.0.0.1:27017/",
                                        className: "font-mono text-xs flex-1",
                                      }),
                                      l.jsx(be, {
                                        type: "button",
                                        onClick: wt,
                                        disabled: y,
                                        size: "sm",
                                        className: "font-mono text-xs",
                                        children: y ? "Saving..." : "Save",
                                      }),
                                    ],
                                  }),
                                  l.jsxs("p", {
                                    className: "text-[10px] text-muted-foreground",
                                    children: [
                                      "Default connection URI for standard installation is",
                                      " ",
                                      l.jsx("code", {
                                        className: "font-mono bg-rail px-1 rounded text-primary",
                                        children: "mongodb://127.0.0.1:27017/",
                                      }),
                                      ".",
                                    ],
                                  }),
                                ],
                              }),
                              l.jsx("div", {
                                className: "flex gap-2 pt-1",
                                children: l.jsxs(be, {
                                  type: "button",
                                  variant: "outline",
                                  size: "sm",
                                  onClick: me,
                                  disabled: d,
                                  className:
                                    "w-full font-mono text-[10px] uppercase tracking-wider gap-1.5",
                                  children: [
                                    l.jsx(_t, { className: `h-3 w-3 ${d ? "animate-spin" : ""}` }),
                                    "Test Connection",
                                  ],
                                }),
                              }),
                              f &&
                                l.jsxs("div", {
                                  className: `rounded-lg p-3 border text-xs whitespace-pre-line leading-relaxed font-sans ${f.success ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-400" : "border-rose-500/30 bg-rose-500/5 text-rose-400"}`,
                                  children: [
                                    l.jsx("div", {
                                      className:
                                        "font-semibold uppercase tracking-wider text-[10px] mb-1 font-mono",
                                      children: f.success
                                        ? "✓ MongoDB Connection Successful"
                                        : "✗ Connection Failed",
                                    }),
                                    l.jsx("div", {
                                      className: "font-mono text-[10px]",
                                      children: f.message,
                                    }),
                                  ],
                                }),
                            ],
                          }),
                          l.jsxs("div", {
                            className: "space-y-3 pt-2",
                            children: [
                              l.jsx("h3", {
                                className:
                                  "text-xs font-mono uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-1",
                                children: "MongoDB Community Server Setup Guide",
                              }),
                              l.jsx("p", {
                                className: "text-xs text-muted-foreground leading-relaxed",
                                children:
                                  "If you do not have a MongoDB Community Server running locally, select one of the methods below to set it up:",
                              }),
                              l.jsxs("div", {
                                className: "space-y-3",
                                children: [
                                  l.jsxs("div", {
                                    className:
                                      "rounded-lg border border-border bg-rail p-3 space-y-1.5",
                                    children: [
                                      l.jsxs("div", {
                                        className: "flex items-center justify-between",
                                        children: [
                                          l.jsxs("span", {
                                            className:
                                              "text-[11px] font-mono font-semibold flex items-center gap-1.5 text-foreground",
                                            children: [
                                              l.jsx(Zr, { className: "h-3.5 w-3.5 text-primary" }),
                                              "Method A: Windows Package Manager (Winget)",
                                            ],
                                          }),
                                          l.jsx("button", {
                                            onClick: () =>
                                              Be(
                                                "winget install MongoDB.Community.Server",
                                                "winget",
                                              ),
                                            className:
                                              "text-muted-foreground hover:text-foreground p-1 transition-colors cursor-pointer",
                                            title: "Copy command",
                                            children: Ce
                                              ? l.jsx(er, { className: "h-3 w-3 text-emerald-400" })
                                              : l.jsx(tr, { className: "h-3 w-3" }),
                                          }),
                                        ],
                                      }),
                                      l.jsx("code", {
                                        className:
                                          "block text-[10px] bg-background/50 p-2 rounded font-mono text-foreground",
                                        children: "winget install MongoDB.Community.Server",
                                      }),
                                    ],
                                  }),
                                  l.jsxs("div", {
                                    className:
                                      "rounded-lg border border-border bg-rail p-3 space-y-1.5",
                                    children: [
                                      l.jsxs("div", {
                                        className: "flex items-center justify-between",
                                        children: [
                                          l.jsxs("span", {
                                            className:
                                              "text-[11px] font-mono font-semibold flex items-center gap-1.5 text-foreground",
                                            children: [
                                              l.jsx(Zr, { className: "h-3.5 w-3.5 text-primary" }),
                                              "Method B: Docker Container",
                                            ],
                                          }),
                                          l.jsx("button", {
                                            onClick: () =>
                                              Be(
                                                "docker run -d -p 27017:27017 --name iracing-mongo mongo:latest",
                                                "docker",
                                              ),
                                            className:
                                              "text-muted-foreground hover:text-foreground p-1 transition-colors cursor-pointer",
                                            title: "Copy command",
                                            children: vt
                                              ? l.jsx(er, { className: "h-3 w-3 text-emerald-400" })
                                              : l.jsx(tr, { className: "h-3 w-3" }),
                                          }),
                                        ],
                                      }),
                                      l.jsx("code", {
                                        className:
                                          "block text-[10px] bg-background/50 p-2 rounded font-mono text-foreground leading-normal",
                                        children:
                                          "docker run -d -p 27017:27017 --name iracing-mongo mongo:latest",
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                            ],
                          }),
                          l.jsxs("div", {
                            className:
                              "pt-3 border-t border-border/40 flex items-center justify-between gap-4",
                            children: [
                              l.jsxs("div", {
                                children: [
                                  l.jsx("h4", {
                                    className: "text-xs font-semibold text-foreground",
                                    children: "Browser File Cache",
                                  }),
                                  l.jsx("p", {
                                    className: "text-[11px] text-muted-foreground leading-snug",
                                    children:
                                      "Telemetry binary files are saved locally in browser IndexedDB.",
                                  }),
                                ],
                              }),
                              l.jsxs(be, {
                                type: "button",
                                variant: "destructive",
                                size: "sm",
                                onClick: Vt,
                                className:
                                  "font-mono text-[10px] uppercase tracking-wider gap-1.5 shrink-0",
                                children: [
                                  l.jsx(jo, { className: "h-3.5 w-3.5" }),
                                  "Clear File Cache",
                                ],
                              }),
                            ],
                          }),
                        ],
                      }),
                      l.jsxs(it, {
                        value: "ai",
                        className: "flex-1 overflow-y-auto px-6 py-5 space-y-5 focus:outline-none",
                        children: [
                          l.jsxs("div", {
                            children: [
                              l.jsx("div", {
                                className:
                                  "mb-2.5 text-[10px] uppercase tracking-wider text-muted-foreground",
                                children: "AI Provider Software",
                              }),
                              l.jsx("div", {
                                className: "grid gap-2 grid-cols-1 sm:grid-cols-2",
                                children: pr.map((_) =>
                                  l.jsxs(
                                    "label",
                                    {
                                      className: `flex cursor-pointer items-start gap-2.5 rounded-lg border p-2.5 hover:bg-accent/40 transition-colors ${X === _.id ? "border-primary bg-primary/5" : "border-border bg-panel"}`,
                                      children: [
                                        l.jsx("input", {
                                          type: "radio",
                                          name: "llmProvider",
                                          checked: X === _.id,
                                          onChange: () => Je(_.id),
                                          className: "mt-1 shrink-0 cursor-pointer",
                                        }),
                                        l.jsxs("div", {
                                          className: "min-w-0",
                                          children: [
                                            l.jsxs("div", {
                                              className:
                                                "text-xs font-medium flex items-center gap-1.5 text-foreground",
                                              children: [
                                                l.jsx(_.icon, {
                                                  className: "h-3.5 w-3.5 shrink-0 text-primary",
                                                }),
                                                _.name,
                                              ],
                                            }),
                                            l.jsx("div", {
                                              className:
                                                "text-[10px] text-muted-foreground mt-0.5 leading-snug line-clamp-2",
                                              children: _.desc,
                                            }),
                                          ],
                                        }),
                                      ],
                                    },
                                    _.id,
                                  ),
                                ),
                              }),
                            ],
                          }),
                          l.jsxs("div", {
                            className:
                              "space-y-4 border-t border-border/40 pt-4 animate-in fade-in slide-in-from-top-2",
                            children: [
                              l.jsxs("div", {
                                className: "grid gap-3 sm:grid-cols-2",
                                children: [
                                  l.jsxs("div", {
                                    className: "space-y-1.5",
                                    children: [
                                      l.jsx("label", {
                                        className:
                                          "text-[10px] uppercase tracking-wider text-muted-foreground block",
                                        children: "Base URL (OpenAI Compatible)",
                                      }),
                                      l.jsx(We, {
                                        type: "text",
                                        value: ke,
                                        onChange: (_) => {
                                          (De(_.target.value), te(null));
                                        },
                                        placeholder: Ye?.url || "http://localhost:1234/v1",
                                        className: "font-mono text-xs",
                                      }),
                                    ],
                                  }),
                                  l.jsxs("div", {
                                    className: "space-y-1.5",
                                    children: [
                                      l.jsx("label", {
                                        className:
                                          "text-[10px] uppercase tracking-wider text-muted-foreground block",
                                        children: "Model ID",
                                      }),
                                      l.jsx(We, {
                                        type: "text",
                                        value: K,
                                        onChange: (_) => {
                                          (le(_.target.value), te(null));
                                        },
                                        placeholder: "e.g. liquid/lfm2.5-1.2b, llama-3-8b-instruct",
                                        className: "font-mono text-xs",
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                              l.jsxs("div", {
                                className: "space-y-1.5",
                                children: [
                                  l.jsx("label", {
                                    className:
                                      "text-[10px] uppercase tracking-wider text-muted-foreground block",
                                    children: "API Token / Permission Key (Optional)",
                                  }),
                                  l.jsx(We, {
                                    type: "password",
                                    value: fe,
                                    onChange: (_) => {
                                      (_e(_.target.value), te(null));
                                    },
                                    placeholder: "Enter LM Studio token or Bearer key if required",
                                    className: "font-mono text-xs",
                                  }),
                                  l.jsx("p", {
                                    className: "text-[9px] text-muted-foreground mt-1",
                                    children:
                                      "Required if your local server uses token authentication (e.g. LM Studio 0.4.0+).",
                                  }),
                                ],
                              }),
                              l.jsxs("div", {
                                className: "pt-2",
                                children: [
                                  l.jsxs(be, {
                                    type: "button",
                                    variant: "secondary",
                                    size: "sm",
                                    onClick: ge,
                                    disabled: de,
                                    className:
                                      "w-full font-mono text-[10px] uppercase tracking-wider gap-1.5",
                                    children: [
                                      l.jsx(_t, {
                                        className: `h-3 w-3 ${de ? "animate-spin" : ""}`,
                                      }),
                                      de
                                        ? "Testing Connection..."
                                        : "Test Local Host Software Connection",
                                    ],
                                  }),
                                  F &&
                                    l.jsxs("div", {
                                      className: `mt-3 rounded-lg p-3 border text-xs ${F.success ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-400" : "border-rose-500/30 bg-rose-500/5 text-rose-400"}`,
                                      children: [
                                        l.jsx("div", {
                                          className:
                                            "font-semibold uppercase tracking-wider text-[10px] mb-1 font-mono",
                                          children: F.success
                                            ? "✓ AI Connection Successful"
                                            : "✗ Connection Failed",
                                        }),
                                        l.jsx("div", {
                                          className:
                                            "whitespace-pre-line leading-relaxed font-mono text-[10px]",
                                          children: F.message,
                                        }),
                                      ],
                                    }),
                                ],
                              }),
                            ],
                          }),
                        ],
                      }),
                      l.jsxs(it, {
                        value: "licensing",
                        className: "flex-1 overflow-y-auto px-6 py-5 space-y-5 focus:outline-none",
                        children: [
                          l.jsxs("div", {
                            className:
                              "rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-2",
                            children: [
                              l.jsxs("h3", {
                                className:
                                  "text-xs font-mono uppercase tracking-wider text-primary font-semibold flex items-center gap-1.5",
                                children: [
                                  l.jsx(Qr, { className: "h-4 w-4" }),
                                  "Hardware-Locked Licensing",
                                ],
                              }),
                              l.jsx("p", {
                                className: "text-xs text-muted-foreground leading-relaxed",
                                children:
                                  "Unlock advanced offline analysis sheets and high-frequency real-time widgets. Your license key is cryptographically signed and locked to this PC's hardware.",
                              }),
                              l.jsxs("p", {
                                className: "text-xs text-muted-foreground leading-relaxed",
                                children: [
                                  l.jsx("strong", { children: "Accessory devices:" }),
                                  " Any auxiliary dash readouts (phones, tablets, second PCs) connected to this PC's local IP address will automatically inherit this license!",
                                ],
                              }),
                            ],
                          }),
                          l.jsxs("div", {
                            className: "rounded-lg border border-border bg-panel p-4 space-y-3",
                            children: [
                              l.jsxs("div", {
                                className:
                                  "flex items-center justify-between border-b border-border/40 pb-2",
                                children: [
                                  l.jsx("span", {
                                    className:
                                      "text-[10px] font-mono uppercase tracking-wider text-muted-foreground",
                                    children: "Activation Status",
                                  }),
                                  k
                                    ? l.jsxs("span", {
                                        className:
                                          "flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase font-mono tracking-wider",
                                        children: [
                                          l.jsx(_t, { className: "h-3 w-3 animate-spin" }),
                                          " Verifying...",
                                        ],
                                      })
                                    : C && C.valid
                                      ? l.jsxs("span", {
                                          className:
                                            "flex items-center gap-1.5 text-[10px] text-emerald-400 uppercase font-mono tracking-wider font-semibold",
                                          children: [
                                            l.jsx(lt, { className: "h-3.5 w-3.5" }),
                                            " Activated (",
                                            C.tier.toUpperCase(),
                                            ")",
                                          ],
                                        })
                                      : l.jsxs("span", {
                                          className:
                                            "flex items-center gap-1.5 text-[10px] text-rose-400 uppercase font-mono tracking-wider font-semibold",
                                          children: [
                                            l.jsx(Xr, { className: "h-3.5 w-3.5" }),
                                            " Lite Tier (Free)",
                                          ],
                                        }),
                                ],
                              }),
                              l.jsxs("div", {
                                className:
                                  "flex items-center justify-between border-b border-border/40 pb-2",
                                children: [
                                  l.jsx("span", {
                                    className:
                                      "text-[10px] font-mono uppercase tracking-wider text-muted-foreground",
                                    children: "Hardware ID (HWID)",
                                  }),
                                  l.jsxs("div", {
                                    className: "flex items-center gap-2",
                                    children: [
                                      l.jsx("span", {
                                        className:
                                          "text-xs font-mono text-foreground font-semibold bg-rail px-2 py-0.5 rounded border border-border select-all",
                                        children: S || "Loading...",
                                      }),
                                      l.jsx("button", {
                                        onClick: () => S && Yt(),
                                        className:
                                          "text-muted-foreground hover:text-foreground p-1 transition-colors cursor-pointer",
                                        title: "Copy HWID",
                                        children: Z
                                          ? l.jsx(er, { className: "h-3 w-3 text-emerald-400" })
                                          : l.jsx(tr, { className: "h-3 w-3" }),
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                              C &&
                                C.valid &&
                                l.jsxs("div", {
                                  className: "flex items-center justify-between",
                                  children: [
                                    l.jsx("span", {
                                      className:
                                        "text-[10px] font-mono uppercase tracking-wider text-muted-foreground",
                                      children: "Expiration Date",
                                    }),
                                    l.jsx("span", {
                                      className: "text-xs font-mono text-foreground font-semibold",
                                      children:
                                        C.expires === "never"
                                          ? "Lifetime / No Expiration"
                                          : C.expires,
                                    }),
                                  ],
                                }),
                            ],
                          }),
                          l.jsxs("div", {
                            className: "space-y-3",
                            children: [
                              l.jsx("h3", {
                                className:
                                  "text-xs font-mono uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-1",
                                children: "Activate License Key",
                              }),
                              l.jsxs("div", {
                                className: "space-y-2",
                                children: [
                                  l.jsx("label", {
                                    className:
                                      "text-[10px] uppercase tracking-wider text-muted-foreground block",
                                    children: "Paste Key Payload",
                                  }),
                                  l.jsxs("div", {
                                    className: "flex gap-2",
                                    children: [
                                      l.jsx(We, {
                                        type: "password",
                                        value: P,
                                        onChange: (_) => j(_.target.value),
                                        placeholder:
                                          "Paste your base64.signature license key here...",
                                        className: "font-mono text-xs flex-1",
                                      }),
                                      l.jsx(be, {
                                        type: "button",
                                        onClick: St,
                                        disabled: I || !P,
                                        size: "sm",
                                        className: "font-mono text-xs uppercase",
                                        children: I ? "Activating..." : "Activate",
                                      }),
                                    ],
                                  }),
                                  l.jsx("p", {
                                    className: "text-[10px] text-muted-foreground leading-normal",
                                    children:
                                      "Paste the license key received for your HWID and click Activate. This will save the credentials locally in the bridge workspace.",
                                  }),
                                ],
                              }),
                            ],
                          }),
                        ],
                      }),
                      l.jsxs(it, {
                        value: "shortcuts",
                        className: "flex-1 overflow-y-auto px-6 py-5 space-y-4 focus:outline-none",
                        children: [
                          l.jsxs("div", {
                            className: "space-y-3",
                            children: [
                              l.jsx("h3", {
                                className:
                                  "text-xs font-mono uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-1",
                                children: "Global Keyboard Shortcuts",
                              }),
                              l.jsx("p", {
                                className: "text-xs text-muted-foreground leading-relaxed",
                                children:
                                  "These shortcuts are active globally across all workspaces. They are disabled while editing a form or input field.",
                              }),
                              l.jsxs("div", {
                                className: "rounded-lg border border-border bg-rail p-4 space-y-3",
                                children: [
                                  l.jsxs("div", {
                                    className:
                                      "flex items-center justify-between border-b border-border/40 pb-2",
                                    children: [
                                      l.jsx("span", {
                                        className: "text-xs font-mono text-foreground font-medium",
                                        children: "Toggle Shortcuts Help",
                                      }),
                                      l.jsx("span", {
                                        className:
                                          "rounded border border-border bg-background px-2 py-0.5 text-[10px] font-mono font-semibold uppercase text-primary font-bold",
                                        children: "?",
                                      }),
                                    ],
                                  }),
                                  l.jsxs("div", {
                                    className:
                                      "flex items-center justify-between border-b border-border/40 pb-2",
                                    children: [
                                      l.jsx("span", {
                                        className: "text-xs font-mono text-foreground font-medium",
                                        children: "Toggle Settings Panel",
                                      }),
                                      l.jsxs("div", {
                                        className: "flex gap-1.5 items-center",
                                        children: [
                                          l.jsx("span", {
                                            className:
                                              "rounded border border-border bg-background px-2 py-0.5 text-[10px] font-mono font-semibold uppercase text-primary font-bold",
                                            children: "Ctrl",
                                          }),
                                          l.jsx("span", {
                                            className: "text-xs text-muted-foreground font-mono",
                                            children: "+",
                                          }),
                                          l.jsx("span", {
                                            className:
                                              "rounded border border-border bg-background px-2 py-0.5 text-[10px] font-mono font-semibold uppercase text-primary font-bold",
                                            children: ",",
                                          }),
                                        ],
                                      }),
                                    ],
                                  }),
                                  l.jsxs("div", {
                                    className:
                                      "flex items-center justify-between border-b border-border/40 pb-2",
                                    children: [
                                      l.jsx("span", {
                                        className: "text-xs font-mono text-foreground font-medium",
                                        children: "Go Home (Dashboard)",
                                      }),
                                      l.jsxs("div", {
                                        className: "flex gap-1 items-center",
                                        children: [
                                          l.jsx("span", {
                                            className:
                                              "rounded border border-border bg-background px-2 py-0.5 text-[10px] font-mono font-semibold uppercase text-primary font-bold",
                                            children: "g",
                                          }),
                                          l.jsx("span", {
                                            className:
                                              "text-xs text-muted-foreground text-[10px] font-mono",
                                            children: "then",
                                          }),
                                          l.jsx("span", {
                                            className:
                                              "rounded border border-border bg-background px-2 py-0.5 text-[10px] font-mono font-semibold uppercase text-primary font-bold",
                                            children: "h",
                                          }),
                                        ],
                                      }),
                                    ],
                                  }),
                                  l.jsxs("div", {
                                    className: "flex items-center justify-between",
                                    children: [
                                      l.jsx("span", {
                                        className: "text-xs font-mono text-foreground font-medium",
                                        children: "Go Back (or Home)",
                                      }),
                                      l.jsx("span", {
                                        className:
                                          "rounded border border-border bg-background px-2 py-0.5 text-[10px] font-mono font-semibold uppercase text-primary font-bold",
                                        children: "Esc",
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                            ],
                          }),
                          l.jsxs("div", {
                            className:
                              "rounded-lg border border-border bg-panel p-3.5 text-xs text-muted-foreground",
                            children: [
                              l.jsx("h4", {
                                className: "font-semibold text-foreground mb-1",
                                children: "💡 Quick Tip",
                              }),
                              "Pressing ",
                              l.jsx("kbd", {
                                className: "font-mono text-primary font-bold",
                                children: "Esc",
                              }),
                              " inside settings dialogs or guides will immediately close them.",
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                  l.jsxs("div", {
                    className:
                      "hairline-t flex items-center justify-between px-6 py-4 bg-panel shrink-0 border-t border-border/60",
                    children: [
                      s === "ai"
                        ? l.jsxs(be, {
                            variant: "outline",
                            size: "sm",
                            onClick: () => Je("cloud"),
                            className: "gap-1.5 font-mono text-xs",
                            children: [l.jsx(Oo, { className: "h-3.5 w-3.5" }), "Reset AI"],
                          })
                        : l.jsx("div", {}),
                      l.jsx(be, {
                        size: "sm",
                        onClick: () => r(!1),
                        className: "font-mono text-xs cursor-pointer",
                        children: "Done",
                      }),
                    ],
                  }),
                ],
              }),
            }),
          ],
        })
  );
}
function fd() {
  return l.jsx("div", {
    className: "flex min-h-screen items-center justify-center bg-background px-4",
    children: l.jsxs("div", {
      className: "max-w-md text-center",
      children: [
        l.jsx("h1", { className: "text-7xl font-bold text-foreground", children: "404" }),
        l.jsx("h2", {
          className: "mt-4 text-xl font-semibold text-foreground",
          children: "Page not found",
        }),
        l.jsx("p", {
          className: "mt-2 text-sm text-muted-foreground",
          children: "The page you're looking for doesn't exist or has been moved.",
        }),
        l.jsx("div", {
          className: "mt-6",
          children: l.jsx(yt, {
            to: "/",
            className:
              "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
            children: "Go home",
          }),
        }),
      ],
    }),
  });
}
function pd({ error: e, reset: t }) {
  console.error(e);
  const r = D();
  return l.jsx("div", {
    className: "flex min-h-screen items-center justify-center bg-background px-4",
    children: l.jsxs("div", {
      className: "max-w-md text-center",
      children: [
        l.jsx("h1", {
          className: "text-xl font-semibold tracking-tight text-foreground",
          children: "This page didn't load",
        }),
        l.jsx("p", {
          className: "mt-2 text-sm text-muted-foreground",
          children: "Something went wrong on our end. You can try refreshing or head back home.",
        }),
        l.jsxs("div", {
          className: "mt-6 flex flex-wrap justify-center gap-2",
          children: [
            l.jsx("button", {
              onClick: () => {
                (r.invalidate(), t());
              },
              className:
                "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
              children: "Try again",
            }),
            l.jsx("a", {
              href: "/",
              className:
                "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
              children: "Go home",
            }),
          ],
        }),
      ],
    }),
  });
}
const md = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob: https:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co ws://localhost:* ws://127.0.0.1:* http://localhost:* http://127.0.0.1:* https://generativelanguage.googleapis.com",
    "worker-src 'self' blob:",
    "frame-ancestors 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ].join("; "),
  $ = Ki()({
    head: () => ({
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { httpEquiv: "Content-Security-Policy", content: md },
        { name: "referrer", content: "strict-origin-when-cross-origin" },
        { title: "Pit Wall — Live iRacing Telemetry & Lap Analysis" },
        {
          name: "description",
          content:
            "Pit Wall combines live iRacing telemetry from a local bridge with a MoTeC-style .ibt lap analysis workbench.",
        },
        { name: "author", content: "Pit Wall" },
        { property: "og:site_name", content: "Pit Wall" },
        { property: "og:title", content: "Pit Wall — Live iRacing Telemetry & Lap Analysis" },
        {
          property: "og:description",
          content: "Live telemetry dashboard + .ibt lap analysis workbench, AI coach and sharing.",
        },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary" },
        { name: "twitter:title", content: "Pit Wall — Live iRacing Telemetry & Lap Analysis" },
        {
          name: "twitter:description",
          content: "Live telemetry dashboard + .ibt lap analysis workbench, AI coach and sharing.",
        },
        { name: "theme-color", content: "#1a1d21" },
        { name: "apple-mobile-web-app-capable", content: "yes" },
        { name: "apple-mobile-web-app-title", content: "Pit Wall" },
        { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      ],
      links: [
        { rel: "stylesheet", href: sl },
        { rel: "stylesheet", href: So },
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700;800;900&family=IBM+Plex+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Geist+Mono:wght@400;500;600;700&family=Rajdhani:wght@500;600;700&family=Orbitron:wght@500;700;900&display=swap",
        },
      ],
    }),
    shellComponent: gd,
    component: bd,
    notFoundComponent: fd,
    errorComponent: pd,
  });
function gd({ children: e }) {
  return l.jsxs("html", {
    lang: "en",
    className: "dark",
    children: [
      l.jsx("head", { children: l.jsx(mc, {}) }),
      l.jsxs("body", { className: "bg-background text-foreground", children: [e, l.jsx(gc, {})] }),
    ],
  });
}
function bd() {
  const { queryClient: e } = $.useRouteContext(),
    t = D(),
    r = Fl();
  return (
    x.useEffect(() => {
      const {
        data: { subscription: s },
      } = Ne.auth.onAuthStateChange(() => {
        (t.invalidate(), e.invalidateQueries());
      });
      return () => s.unsubscribe();
    }, [t, e]),
    x.useEffect(() => {
      typeof window < "u" &&
        window.navigator.userAgent.toLowerCase().includes("electron") &&
        document.documentElement.classList.add("is-electron");
    }, []),
    l.jsx(rl, {
      client: e,
      children: l.jsx(pl, {
        children: l.jsxs(jl, {
          children: [
            l.jsx($l, { t: r }),
            l.jsx(zl, {}),
            l.jsx(Gl, {}),
            l.jsx(hd, {}),
            l.jsx(Vl, {}),
            l.jsx($n, {}),
            l.jsx(gl, {}),
          ],
        }),
      }),
    })
  );
}
const yd = "modulepreload",
  xd = function (e) {
    return "/" + e;
  },
  qs = {},
  z = function (t, r, s) {
    let n = Promise.resolve();
    if (r && r.length > 0) {
      let c = function (d) {
        return Promise.all(
          d.map((u) =>
            Promise.resolve(u).then(
              (h) => ({ status: "fulfilled", value: h }),
              (h) => ({ status: "rejected", reason: h }),
            ),
          ),
        );
      };
      document.getElementsByTagName("link");
      const a = document.querySelector("meta[property=csp-nonce]"),
        i = a?.nonce || a?.getAttribute("nonce");
      n = c(
        r.map((d) => {
          if (((d = xd(d)), d in qs)) return;
          qs[d] = !0;
          const u = d.endsWith(".css"),
            h = u ? '[rel="stylesheet"]' : "";
          if (document.querySelector(`link[href="${d}"]${h}`)) return;
          const p = document.createElement("link");
          if (
            ((p.rel = u ? "stylesheet" : yd),
            u || (p.as = "script"),
            (p.crossOrigin = ""),
            (p.href = d),
            i && p.setAttribute("nonce", i),
            document.head.appendChild(p),
            u)
          )
            return new Promise((f, g) => {
              (p.addEventListener("load", f),
                p.addEventListener("error", () => g(new Error(`Unable to preload CSS for ${d}`))));
            });
        }),
      );
    }
    function o(a) {
      const i = new Event("vite:preloadError", { cancelable: !0 });
      if (((i.payload = a), window.dispatchEvent(i), !i.defaultPrevented)) throw a;
    }
    return n.then((a) => {
      for (const i of a || []) i.status === "rejected" && o(i.reason);
      return t().catch(o);
    });
  },
  vd = () => z(() => import("./team-guide-NPvi1aUd.js"), __vite__mapDeps([0, 1, 2, 3, 4, 5, 6, 7])),
  wd = W("/team-guide")({
    head: () => ({
      meta: [
        { title: "Team Setup Guide — Pit Wall Operations Center" },
        {
          name: "description",
          content:
            "High-density tactical setup and role guide for iRacing realtime relay pit wall sessions. Configure Supabase channels and local bridge pub/sub.",
        },
      ],
    }),
    component: H(vd, "component"),
  }),
  Sd = () => z(() => import("./team-CBRvNvqf.js"), __vite__mapDeps([8, 1, 3, 2, 4, 5, 6, 7])),
  Rd = W("/team")({
    head: () => ({
      meta: [
        { title: "Team Command — Pit Wall Operations Center" },
        {
          name: "description",
          content:
            "Cinematic multi-driver race strategy command center. Coordinate stints, track active telemetry links, and calculate fuel targets.",
        },
      ],
    }),
    component: H(Sd, "component"),
  }),
  kd = () =>
    z(
      () => import("./settings-wREwmemz.js"),
      __vite__mapDeps([9, 1, 10, 7, 3, 2, 11, 12, 13, 14, 4, 5, 6]),
    ),
  _d = W("/settings")({
    head: () => ({
      meta: [
        { title: "Settings - Pit Wall" },
        {
          name: "description",
          content: "Configure AI provider, local LLM host, and local MongoDB diagnostics.",
        },
      ],
    }),
    component: H(kd, "component"),
  }),
  Cd = () =>
    z(() => import("./runtime-DVwMXSrJ.js"), __vite__mapDeps([15, 1, 14, 2, 3, 4, 5, 6, 7])),
  Pd = W("/runtime")({
    head: () => ({
      meta: [
        { title: "Pit Wall Workstation — Runtime Initialization" },
        {
          name: "description",
          content: "Pit Wall workstation runtime environment is initializing.",
        },
      ],
    }),
    component: H(Cd, "component"),
  }),
  Ld = () =>
    z(
      () => import("./roadmap-BNxB20zU.js"),
      __vite__mapDeps([16, 1, 10, 7, 3, 2, 11, 12, 13, 14, 4, 5, 6]),
    ),
  Td = W("/roadmap")({
    head: () => ({
      meta: [
        { title: "Roadmap — Pit Wall" },
        {
          name: "description",
          content: "Pit Wall development roadmap — what's been built and what's coming next.",
        },
      ],
    }),
    component: H(Ld, "component"),
  }),
  Id = () =>
    z(
      () => import("./live-OaeZ-ya1.js"),
      __vite__mapDeps([17, 1, 13, 2, 18, 3, 19, 20, 6, 21, 22, 23, 11, 12, 4, 5, 7]),
    ),
  jd = W("/live")({
    head: () => ({
      meta: [
        { title: "Pit Wall — Live iRacing Telemetry Workbench" },
        {
          name: "description",
          content:
            "MoTeC-style live iRacing telemetry workbench. Rolling channel traces, G-G scatter, channel list, sector + tyre data straight from the bridge.",
        },
        { property: "og:title", content: "Pit Wall — Live iRacing Telemetry Workbench" },
        {
          property: "og:description",
          content:
            "MoTeC-style live iRacing telemetry workbench. Rolling channel traces, G-G scatter, channel list, sector + tyre data straight from the bridge.",
        },
      ],
    }),
    component: H(Id, "component"),
  }),
  Od = () =>
    z(() => import("./how-it-works-hcO9O8Um.js"), __vite__mapDeps([24, 1, 2, 3, 4, 5, 6, 7])),
  Ed = W("/how-it-works")({
    head: () => ({
      meta: [
        { title: "How it works — Pit Wall" },
        {
          name: "description",
          content:
            "How Pit Wall parses iRacing .ibt telemetry files in your browser and renders a MoTeC-style analysis workbench.",
        },
        { property: "og:title", content: "How Pit Wall works" },
        {
          property: "og:description",
          content:
            "From .ibt binary to stacked traces, track map and lap compare — the parsing pipeline explained.",
        },
      ],
    }),
    component: H(Od, "component"),
  }),
  Nd = () =>
    z(
      () => import("./fingerprint-CiEJQA6p.js"),
      __vite__mapDeps([25, 1, 10, 7, 3, 2, 11, 12, 13, 14, 21, 22, 18, 23, 4, 5, 6]),
    ),
  Ad = W("/fingerprint")({
    head: () => ({
      meta: [
        { title: "Driver Fingerprint — Pit Wall" },
        {
          name: "description",
          content:
            "Upload your iRacing lapfiles folder to build a baseline driver fingerprint from every track and car you've ever set a reference lap on.",
        },
      ],
    }),
    component: H(Nd, "component"),
  }),
  Md = () =>
    z(() => import("./driver-bridge-H1LqMJkn.js"), __vite__mapDeps([26, 1, 2, 3, 4, 5, 6, 7])),
  Dd = W("/driver-bridge")({
    head: () => ({
      meta: [
        { title: "Driver Cockpit HUD — Pit Wall" },
        {
          name: "description",
          content:
            "Simplified high-performance live telemetry cockpit HUD designed specifically for drivers.",
        },
      ],
    }),
    component: H(Md, "component"),
  }),
  Fd = () => z(() => import("./auth-DzehSQjg.js"), __vite__mapDeps([27, 1, 2, 3, 4, 5, 6, 7])),
  Bd = W("/auth")({
    head: () => ({
      meta: [
        { title: "Welcome — Pit Wall" },
        { name: "description", content: "Welcome to your local Pit Wall telemetry workbench." },
      ],
    }),
    component: H(Fd, "component"),
  }),
  $d = () =>
    z(
      () => import("./ai-engineer-D09qasPP.js"),
      __vite__mapDeps([28, 1, 10, 7, 3, 2, 11, 12, 13, 14, 29, 4, 5, 6]),
    ),
  Ud = W("/ai-engineer")({
    head: () => ({
      meta: [
        { title: "AI Engineer Console — Pit Wall Terminal" },
        {
          name: "description",
          content:
            "Motorsport engineering terminal. Receive tire pressure and damper advice mapped directly to telemetry logs.",
        },
      ],
    }),
    component: H($d, "component"),
  }),
  Wd = () =>
    z(
      () => import("./admin-C87KmQXR.js"),
      __vite__mapDeps([30, 1, 10, 7, 3, 2, 11, 12, 13, 14, 4, 5, 6]),
    ),
  Hd = W("/admin")({
    head: () => ({ meta: [{ title: "Admin — Pit Wall" }, { name: "robots", content: "noindex" }] }),
    component: H(Wd, "component"),
  }),
  zd = () => z(() => import("./index-C19jen0n.js"), __vite__mapDeps([31, 1, 2, 3, 4, 5, 6, 7])),
  Gd = W("/")({
    head: () => ({
      meta: [
        { title: "Pit Wall — Motorsport Engineering & Lap Analysis" },
        {
          name: "description",
          content:
            "Motorsport engineering command center. Stream live telemetry at 60Hz and analyze laps with professional stacked traces and AI strategies.",
        },
      ],
    }),
    component: H(zd, "component"),
  }),
  qd = () =>
    z(
      () => import("./sessions.index-Bw9pw2QJ.js"),
      __vite__mapDeps([32, 1, 10, 7, 3, 2, 11, 12, 13, 14, 33, 29, 18, 34, 4, 5, 6]),
    ),
  Kd = W("/sessions/")({
    head: () => ({
      meta: [
        { title: "Sessions — Pit Wall" },
        { name: "description", content: "Your uploaded iRacing telemetry sessions." },
      ],
    }),
    component: H(qd, "component"),
  }),
  Vd = () =>
    z(
      () => import("./share._token-BmfdrIS9.js"),
      __vite__mapDeps([35, 1, 33, 36, 2, 37, 38, 39, 3, 6, 4, 5, 7, 40]),
    ),
  Yd = W("/share/$token")({
    head: ({ params: e }) => {
      const t = `/api/public/og/share/${e.token}`;
      return {
        meta: [
          { title: "Shared Lap — Pit Wall" },
          { name: "description", content: "Public read-only telemetry lap card." },
          { property: "og:title", content: "Shared Lap — Pit Wall" },
          { property: "og:description", content: "Public read-only telemetry lap card." },
          { property: "og:image", content: t },
          { property: "og:image:width", content: "1200" },
          { property: "og:image:height", content: "630" },
          { property: "og:type", content: "website" },
          { name: "twitter:card", content: "summary_large_image" },
          { name: "twitter:image", content: t },
        ],
      };
    },
    component: H(Vd, "component"),
  }),
  Jd = () =>
    z(
      () => import("./sessions._id-B41VMAUJ.js").then((e) => e.s),
      __vite__mapDeps([41, 1, 33, 19, 20, 6, 3, 2, 10, 7, 11, 12, 13, 14, 34, 4, 36, 29, 18, 23]),
    ),
  Qd = W("/sessions/$id")({
    head: () => ({
      meta: [
        { title: "Workbench — Pit Wall" },
        { name: "description", content: "Telemetry workbench for an iRacing .ibt session." },
      ],
    }),
    component: H(Jd, "component"),
  }),
  Xd = () =>
    z(
      () => import("./lab.lapfile-BcDFPRUr.js"),
      __vite__mapDeps([42, 1, 10, 7, 3, 2, 11, 12, 13, 14, 22, 4, 5, 6]),
    ),
  Zd = W("/lab/lapfile")({
    head: () => ({
      meta: [
        { title: "Lapfile Lab — Pit Wall" },
        {
          name: "description",
          content: "Inspect iRacing .olap / .blap / .plap reference lap files.",
        },
      ],
    }),
    component: H(Xd, "component"),
  }),
  eu = () =>
    z(
      () => import("./detached._instrument-14xc2eSB.js"),
      __vite__mapDeps([43, 1, 20, 6, 3, 2, 4, 5, 7]),
    ),
  tu = W("/detached/$instrument")({
    head: () => ({
      meta: [
        { title: "Detached Cockpit Monitor — Pit Wall" },
        { name: "description", content: "Standalone motorsport command window." },
      ],
    }),
    component: H(eu, "component"),
  }),
  ru = wd.update({ id: "/team-guide", path: "/team-guide", getParentRoute: () => $ }),
  su = Rd.update({ id: "/team", path: "/team", getParentRoute: () => $ }),
  nu = _d.update({ id: "/settings", path: "/settings", getParentRoute: () => $ }),
  ou = Pd.update({ id: "/runtime", path: "/runtime", getParentRoute: () => $ }),
  au = Td.update({ id: "/roadmap", path: "/roadmap", getParentRoute: () => $ }),
  iu = jd.update({ id: "/live", path: "/live", getParentRoute: () => $ }),
  cu = Ed.update({ id: "/how-it-works", path: "/how-it-works", getParentRoute: () => $ }),
  lu = Ad.update({ id: "/fingerprint", path: "/fingerprint", getParentRoute: () => $ }),
  du = Dd.update({ id: "/driver-bridge", path: "/driver-bridge", getParentRoute: () => $ }),
  uu = Bd.update({ id: "/auth", path: "/auth", getParentRoute: () => $ }),
  hu = Ud.update({ id: "/ai-engineer", path: "/ai-engineer", getParentRoute: () => $ }),
  fu = Hd.update({ id: "/admin", path: "/admin", getParentRoute: () => $ }),
  pu = Gd.update({ id: "/", path: "/", getParentRoute: () => $ }),
  mu = Kd.update({ id: "/sessions/", path: "/sessions/", getParentRoute: () => $ }),
  gu = Yd.update({ id: "/share/$token", path: "/share/$token", getParentRoute: () => $ }),
  bu = Qd.update({ id: "/sessions/$id", path: "/sessions/$id", getParentRoute: () => $ }),
  yu = Zd.update({ id: "/lab/lapfile", path: "/lab/lapfile", getParentRoute: () => $ }),
  xu = tu.update({
    id: "/detached/$instrument",
    path: "/detached/$instrument",
    getParentRoute: () => $,
  }),
  vu = {
    IndexRoute: pu,
    AdminRoute: fu,
    AiEngineerRoute: hu,
    AuthRoute: uu,
    DriverBridgeRoute: du,
    FingerprintRoute: lu,
    HowItWorksRoute: cu,
    LiveRoute: iu,
    RoadmapRoute: au,
    RuntimeRoute: ou,
    SettingsRoute: nu,
    TeamRoute: su,
    TeamGuideRoute: ru,
    DetachedInstrumentRoute: xu,
    LabLapfileRoute: yu,
    SessionsIdRoute: bu,
    ShareTokenRoute: gu,
    SessionsIndexRoute: mu,
  },
  wu = $._addFileChildren(vu),
  Su = () => {
    const e = new el();
    return ic({
      routeTree: wu,
      context: { queryClient: e },
      scrollRestoration: !0,
      defaultPreloadStaleTime: 0,
    });
  };
async function Ru() {
  const e = await Su();
  let t;
  if (As) {
    const r = await As.getOptions();
    ((r.serializationAdapters = r.serializationAdapters ?? []),
      (window.__TSS_START_OPTIONS__ = r),
      (t = r.serializationAdapters),
      (e.options.defaultSsr = r.defaultSsr));
  } else ((t = []), (window.__TSS_START_OPTIONS__ = { serializationAdapters: t }));
  return (
    t.push(mi),
    e.options.serializationAdapters && t.push(...e.options.serializationAdapters),
    e.update({ basepath: "", serializationAdapters: t }),
    e.stores.matchesId.get().length || (await xi(e)),
    e
  );
}
async function ku() {
  const e = await Ru();
  return (window.$_TSR?.h(), e);
}
var mr;
function _u() {
  return (mr || (mr = ku()), l.jsx(Ri, { promise: mr, children: (e) => l.jsx(dc, { router: e }) }));
}
x.startTransition(() => {
  fo.hydrateRoot(document, l.jsx(x.StrictMode, { children: l.jsx(_u, {}) }));
});
export {
  Bu as $,
  ee as A,
  be as B,
  lo as C,
  bt as D,
  dl as E,
  $u as F,
  Ne as G,
  ud as H,
  We as I,
  cl as J,
  Ku as K,
  Fu as L,
  zu as M,
  ml as N,
  uc as O,
  Du as P,
  Un as Q,
  Yd as R,
  ed as S,
  Mu as T,
  Mn as U,
  Nn as V,
  Ir as W,
  D as X,
  yc as Y,
  Fl as Z,
  z as _,
  Wu as a,
  xt as a0,
  Ju as a1,
  yt as b,
  Qd as c,
  tu as d,
  He as e,
  Yl as f,
  it as g,
  co as h,
  at as i,
  Au as j,
  ce as k,
  Hu as l,
  B as m,
  M as n,
  Qu as o,
  Xu as p,
  Zu as q,
  Al as r,
  Uu as s,
  ro as t,
  ll as u,
  Yu as v,
  qu as w,
  Nu as x,
  Vu as y,
  Gu as z,
};
