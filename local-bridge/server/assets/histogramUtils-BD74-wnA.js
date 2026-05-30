import { b as createServerFn, e as createSsrRpc } from "../server.js";
import { r as requireSupabaseAuth } from "./auth-middleware-Cz-8T2yV.js";
import { jsxs, jsx } from "react/jsx-runtime";
import { useEffect } from "react";
import { u as useTelemetryRuntimeStore } from "./registry-CA38QAmy.js";
import { Shield, Activity, Zap, AlertTriangle } from "lucide-react";
const fetchTrackCarHistory = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((data) => data).handler(createSsrRpc("ceb1da2412339a010c86cf3ecf77c3f4a412f494e3df16514997aba5cd89ec0c"));
const recordTelemetrySessionMeta = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((data) => data).handler(createSsrRpc("8807bcd1e24885bea42a273b01c13bf580f36251214035049bde39937b793996"));
const fetchLocalTelemetryFile = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((data) => data).handler(createSsrRpc("a1b0f3efc363c9d2100e82f3978763c576b3995969d90cf9b2d2dbf0d4e1fa81"));
function TelemetryEventTimeline() {
  const { events, activeEvent, triggerEvent, addEvent } = useTelemetryRuntimeStore();
  useEffect(() => {
    if (events.length === 0) {
      addEvent({
        timestampSec: 12.5,
        label: "REAR LOCKUP DETECTED",
        category: "thermal",
        severity: "critical",
        description: "Rear axle slip exceeding 18% under heavy threshold braking at Turn 8 entry. Shift bias forward.",
        associatedChannels: ["Brake", "LFbrakeLinePress", "LRbrakeTemp"],
        cornerNumber: 8
      });
      addEvent({
        timestampSec: 28.4,
        label: "ERS DEPLOYMENT SATURATION",
        category: "hybrid",
        severity: "warning",
        description: "MGU-K deploy saturated at 120kW for 5.2s. Potential state-of-charge exhaustion at back straight.",
        associatedChannels: ["EnergyStorePct", "MgukDeploykW"],
        cornerNumber: 11
      });
      addEvent({
        timestampSec: 42.1,
        label: "THROTTLE INSTABILITY AT CORNER EXIT",
        category: "inputs",
        severity: "info",
        description: "Rapid throttle micro-pumping detected at Turn 3 exit. Steer smoothness rating dropped to 72%.",
        associatedChannels: ["Throttle", "SteeringWheelAngle"],
        cornerNumber: 3
      });
      addEvent({
        timestampSec: 68.9,
        label: "CHASSIS REB COMPRESSION GROUNDING",
        category: "dynamics",
        severity: "warning",
        description: "Nose pitch rotation exceeding -1.8 deg. Splitter grounding threat detected under heavy heave load.",
        associatedChannels: ["LongAccel", "LatAccel", "pitch"],
        cornerNumber: 5
      });
    }
  }, [events.length, addEvent]);
  const getCategoryIcon = (category) => {
    switch (category) {
      case "thermal":
        return /* @__PURE__ */ jsx(AlertTriangle, { className: "h-3.5 w-3.5 text-[#FF4D4D]" });
      case "hybrid":
        return /* @__PURE__ */ jsx(Zap, { className: "h-3.5 w-3.5 text-[#8B5CF6]" });
      case "inputs":
        return /* @__PURE__ */ jsx(Activity, { className: "h-3.5 w-3.5 text-[#00D17F]" });
      case "dynamics":
        return /* @__PURE__ */ jsx(Shield, { className: "h-3.5 w-3.5 text-[#3B82F6]" });
    }
  };
  const getClassificationBadge = (event) => {
    let text = "DIAGNOSTIC";
    let color = "text-[#7A828C] border-[#7A828C]/30 bg-[#7A828C]/10";
    if (event.category === "thermal") {
      text = "STABILITY";
      color = "text-[#FF4D4D] border-[#FF4D4D]/30 bg-[#FF4D4D]/10";
    } else if (event.category === "hybrid") {
      text = "HYBRID CORE";
      color = "text-[#8B5CF6] border-[#8B5CF6]/30 bg-[#8B5CF6]/10";
    } else if (event.category === "inputs") {
      text = "PERFORMANCE";
      color = "text-[#00D17F] border-[#00D17F]/30 bg-[#00D17F]/10";
    } else if (event.category === "dynamics") {
      text = "AERO PLATFORM";
      color = "text-[#3B82F6] border-[#3B82F6]/30 bg-[#3B82F6]/10";
    }
    return /* @__PURE__ */ jsx("span", { className: `text-[7px] font-black tracking-widest px-1 py-0.5 border rounded-xs uppercase ${color}`, children: text });
  };
  const getSeverityStyles = (severity) => {
    switch (severity) {
      case "critical":
        return "border-l-2 border-l-[#FF4D4D] bg-[#FF4D4D]/5";
      case "warning":
        return "border-l-2 border-l-[#FFB800] bg-[#FFB800]/5";
      case "info":
        return "border-l-2 border-l-[#3B82F6] bg-[#3B82F6]/5";
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "h-full flex flex-col font-mono text-xs bg-[#0B0F14] text-white border-t border-[#1C2430]", children: [
    /* @__PURE__ */ jsxs("div", { className: "px-3 py-1.5 border-b border-[#1C2430] bg-[#11161D] flex items-center justify-between shrink-0 select-none", children: [
      /* @__PURE__ */ jsx("span", { className: "font-bold text-[9px] uppercase tracking-[0.25em] text-[#7A828C]", children: "TACTICAL EVENT TIMELINE" }),
      /* @__PURE__ */ jsx("span", { className: "text-[7.5px] text-[#00D17F] font-black tracking-widest bg-[#00D17F]/10 px-1.5 py-0.5 border border-[#00D17F]/30 rounded", children: "ANOMALY SCANNERS LIVE" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-y-auto p-1.5 space-y-1.5 bg-[#05070A]", children: events.map((event) => {
      const isActive = activeEvent?.id === event.id;
      return /* @__PURE__ */ jsxs(
        "div",
        {
          onClick: () => triggerEvent(event),
          className: `p-2 rounded-xs border transition-all duration-200 cursor-pointer ${getSeverityStyles(event.severity)} ${isActive ? "border-[#FFB800] shadow-[0_0_10px_rgba(255,184,0,0.15)] scale-[1.005]" : "border-[#1C2430] bg-[#0B0F14]/60 hover:border-[#263241] hover:bg-[#0B0F14]"}`,
          children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2 mb-1", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
                getCategoryIcon(event.category),
                /* @__PURE__ */ jsx("span", { className: "font-black text-[9px] uppercase tracking-wider text-white", children: event.label })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
                event.metadata?.confidence !== void 0 && /* @__PURE__ */ jsxs("span", { className: "text-[7.5px] text-[#00D17F] font-black border border-[#00D17F]/30 bg-[#00D17F]/10 px-1 py-0.5 rounded-xs tabular-nums", title: "Scanner Signal Certainty Score", children: [
                  (event.metadata.confidence * 100).toFixed(0),
                  "% CERT"
                ] }),
                getClassificationBadge(event),
                /* @__PURE__ */ jsxs("span", { className: "text-[8px] text-[#7A828C] font-bold tabular-nums", children: [
                  "t = ",
                  event.timestampSec.toFixed(2),
                  "s ",
                  event.cornerNumber ? `· T${event.cornerNumber}` : ""
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-[8.5px] leading-relaxed text-[#7A828C] select-text", children: event.description }),
            /* @__PURE__ */ jsxs("div", { className: "mt-1.5 pt-1 border-t border-[#1C2430]/40 flex items-center justify-between", children: [
              /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-1", children: event.associatedChannels.map((ch) => /* @__PURE__ */ jsx(
                "span",
                {
                  className: "text-[7.5px] px-1 py-0.5 bg-[#05070A] border border-[#1C2430] text-[#3B82F6] rounded-xs font-bold",
                  children: ch
                },
                ch
              )) }),
              /* @__PURE__ */ jsx("span", { className: `text-[7px] font-black uppercase tracking-widest px-1 py-0.5 border rounded-xs ${event.severity === "critical" ? "text-[#FF4D4D] border-[#FF4D4D]/20 bg-[#FF4D4D]/5" : event.severity === "warning" ? "text-[#FFB800] border-[#FFB800]/20 bg-[#FFB800]/5" : "text-[#3B82F6] border-[#3B82F6]/20 bg-[#3B82F6]/5"}`, children: event.severity })
            ] })
          ]
        },
        event.id
      );
    }) })
  ] });
}
const IDENT_RE = /^[A-Za-z_][A-Za-z0-9_.]*$/;
const FUNC_NAMES = /* @__PURE__ */ new Set([
  "min",
  "max",
  "abs",
  "clamp",
  "sin",
  "cos",
  "tan",
  "asin",
  "acos",
  "atan",
  "sqrt",
  "log",
  "log10",
  "exp",
  "floor",
  "ceil",
  "round",
  "choose"
]);
const MAX_AST_NODES = 128;
function compileMathExpression(input) {
  try {
    const tokens = tokenize(input);
    if (tokens.length === 0) return { ok: false, error: "Expression is empty." };
    const parser = new Parser(tokens);
    const ast = parser.parseExpression();
    parser.expectEnd();
    const identifiers = [...collectIdentifiers(ast)];
    const nodes = countNodes(ast);
    if (nodes > MAX_AST_NODES) {
      return { ok: false, error: `Expression too complex (max ${MAX_AST_NODES} nodes).` };
    }
    return { ok: true, compiled: { ast, identifiers } };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed to compile expression." };
  }
}
function evaluateCompiledMathExpression(compiled, context) {
  let opCount = 0;
  try {
    const value = evalNode(compiled.ast, context, () => {
      opCount += 1;
      if (opCount > 512) throw new Error("Expression exceeded operation budget.");
    });
    if (!Number.isFinite(value))
      return { ok: false, error: "Expression evaluated to a non-finite value." };
    return { ok: true, value };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Evaluation failed." };
  }
}
function tokenize(input) {
  const s = input.trim();
  const out = [];
  let i = 0;
  while (i < s.length) {
    const ch = s[i];
    if (/\s/.test(ch)) {
      i += 1;
      continue;
    }
    if (ch === "(") {
      out.push({ type: "lparen" });
      i += 1;
      continue;
    }
    if (ch === ")") {
      out.push({ type: "rparen" });
      i += 1;
      continue;
    }
    if (ch === ",") {
      out.push({ type: "comma" });
      i += 1;
      continue;
    }
    if (s.slice(i, i + 2) === "&&") {
      out.push({ type: "op", value: "&&" });
      i += 2;
      continue;
    }
    if (s.slice(i, i + 2) === "||") {
      out.push({ type: "op", value: "||" });
      i += 2;
      continue;
    }
    if (s.slice(i, i + 2) === "<=") {
      out.push({ type: "op", value: "<=" });
      i += 2;
      continue;
    }
    if (s.slice(i, i + 2) === ">=") {
      out.push({ type: "op", value: ">=" });
      i += 2;
      continue;
    }
    if (s.slice(i, i + 2) === "==") {
      out.push({ type: "op", value: "==" });
      i += 2;
      continue;
    }
    if (s.slice(i, i + 2) === "!=") {
      out.push({ type: "op", value: "!=" });
      i += 2;
      continue;
    }
    if (ch === "+" || ch === "-" || ch === "*" || ch === "/" || ch === "<" || ch === ">") {
      out.push({ type: "op", value: ch });
      i += 1;
      continue;
    }
    if (/\d/.test(ch) || ch === "." && /\d/.test(s[i + 1] ?? "")) {
      let j = i + 1;
      while (j < s.length && /[\d.]/.test(s[j])) j += 1;
      const raw = s.slice(i, j);
      const n = Number(raw);
      if (!Number.isFinite(n)) throw new Error(`Invalid number "${raw}".`);
      out.push({ type: "number", value: n });
      i = j;
      continue;
    }
    if (/[A-Za-z_]/.test(ch)) {
      let j = i + 1;
      while (j < s.length && /[A-Za-z0-9_.]/.test(s[j])) j += 1;
      const ident = s.slice(i, j);
      if (!IDENT_RE.test(ident)) throw new Error(`Invalid identifier "${ident}".`);
      out.push({ type: "ident", value: ident });
      i = j;
      continue;
    }
    throw new Error(`Unsupported character "${ch}".`);
  }
  return out;
}
class Parser {
  constructor(tokens) {
    this.tokens = tokens;
  }
  tokens;
  i = 0;
  parseExpression() {
    return this.parseLogicalOr();
  }
  parseLogicalOr() {
    let node = this.parseLogicalAnd();
    while (this.matchOp("||")) {
      const op = this.prev();
      const right = this.parseLogicalAnd();
      node = { kind: "binary", op: op.value, left: node, right };
    }
    return node;
  }
  parseLogicalAnd() {
    let node = this.parseComparison();
    while (this.matchOp("&&")) {
      const op = this.prev();
      const right = this.parseComparison();
      node = { kind: "binary", op: op.value, left: node, right };
    }
    return node;
  }
  parseComparison() {
    let node = this.parseAdditive();
    while (this.matchOp("==") || this.matchOp("!=") || this.matchOp("<") || this.matchOp(">") || this.matchOp("<=") || this.matchOp(">=")) {
      const op = this.prev();
      const right = this.parseAdditive();
      node = { kind: "binary", op: op.value, left: node, right };
    }
    return node;
  }
  parseAdditive() {
    let node = this.parseTerm();
    while (this.matchOp("+") || this.matchOp("-")) {
      const op = this.prev();
      const right = this.parseTerm();
      node = { kind: "binary", op: op.value, left: node, right };
    }
    return node;
  }
  parseTerm() {
    let node = this.parseFactor();
    while (this.matchOp("*") || this.matchOp("/")) {
      const op = this.prev();
      const right = this.parseFactor();
      node = { kind: "binary", op: op.value, left: node, right };
    }
    return node;
  }
  parseFactor() {
    if (this.matchOp("-")) {
      return { kind: "unary", op: "-", expr: this.parseFactor() };
    }
    return this.parsePrimary();
  }
  parsePrimary() {
    if (this.match("number")) {
      return { kind: "number", value: this.prev().value };
    }
    if (this.match("ident")) {
      const ident = this.prev().value;
      if (this.match("lparen")) {
        const fn = ident.toLowerCase();
        if (!FUNC_NAMES.has(fn)) throw new Error(`Unknown function "${ident}".`);
        const args = [];
        if (!this.check("rparen")) {
          do {
            args.push(this.parseExpression());
          } while (this.match("comma"));
        }
        this.consume("rparen", 'Expected ")" after function arguments.');
        assertArgCount(fn, args.length);
        return { kind: "call", name: fn, args };
      }
      return { kind: "ident", name: ident };
    }
    if (this.match("lparen")) {
      const expr = this.parseExpression();
      this.consume("rparen", 'Expected ")" after expression.');
      return expr;
    }
    throw new Error("Expected a value.");
  }
  expectEnd() {
    if (!this.isAtEnd()) throw new Error("Unexpected trailing tokens.");
  }
  match(type) {
    if (this.check(type)) {
      this.i += 1;
      return true;
    }
    return false;
  }
  matchOp(op) {
    if (this.check("op") && this.peek().value === op) {
      this.i += 1;
      return true;
    }
    return false;
  }
  consume(type, msg) {
    if (this.match(type)) return;
    throw new Error(msg);
  }
  check(type) {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }
  peek() {
    return this.tokens[this.i];
  }
  prev() {
    return this.tokens[this.i - 1];
  }
  isAtEnd() {
    return this.i >= this.tokens.length;
  }
}
function assertArgCount(fn, count) {
  const singleArgFns = /* @__PURE__ */ new Set([
    "abs",
    "sin",
    "cos",
    "tan",
    "asin",
    "acos",
    "atan",
    "sqrt",
    "log",
    "log10",
    "exp",
    "floor",
    "ceil",
    "round"
  ]);
  if (singleArgFns.has(fn) && count !== 1) {
    throw new Error(`${fn}() expects exactly 1 argument.`);
  }
  if ((fn === "min" || fn === "max") && count < 2) {
    throw new Error(`${fn}() expects at least 2 arguments.`);
  }
  if ((fn === "clamp" || fn === "choose") && count !== 3) {
    throw new Error(`${fn}() expects exactly 3 arguments.`);
  }
}
function evalNode(node, context, tick) {
  tick();
  switch (node.kind) {
    case "number":
      return node.value;
    case "ident": {
      const v = context[node.name];
      if (!Number.isFinite(v)) throw new Error(`Unknown or non-numeric identifier "${node.name}".`);
      return v;
    }
    case "unary":
      return -evalNode(node.expr, context, tick);
    case "binary": {
      const l = evalNode(node.left, context, tick);
      const r = evalNode(node.right, context, tick);
      if (node.op === "+") return l + r;
      if (node.op === "-") return l - r;
      if (node.op === "*") return l * r;
      if (node.op === "/") {
        if (Math.abs(r) < 1e-12) throw new Error("Division by zero.");
        return l / r;
      }
      if (node.op === "<") return l < r ? 1 : 0;
      if (node.op === ">") return l > r ? 1 : 0;
      if (node.op === "<=") return l <= r ? 1 : 0;
      if (node.op === ">=") return l >= r ? 1 : 0;
      if (node.op === "==") return Math.abs(l - r) < 1e-9 ? 1 : 0;
      if (node.op === "!=") return Math.abs(l - r) >= 1e-9 ? 1 : 0;
      if (node.op === "&&") return l > 0 && r > 0 ? 1 : 0;
      if (node.op === "||") return l > 0 || r > 0 ? 1 : 0;
      throw new Error(`Unhandled binary operator "${node.op}".`);
    }
    case "call": {
      const args = node.args.map((a) => evalNode(a, context, tick));
      switch (node.name) {
        case "abs":
          return Math.abs(args[0]);
        case "min":
          return Math.min(...args);
        case "max":
          return Math.max(...args);
        case "clamp": {
          const x = args[0];
          const lo = Math.min(args[1], args[2]);
          const hi = Math.max(args[1], args[2]);
          return Math.max(lo, Math.min(hi, x));
        }
        case "sin":
          return Math.sin(args[0]);
        case "cos":
          return Math.cos(args[0]);
        case "tan":
          return Math.tan(args[0]);
        case "asin":
          return Math.asin(args[0]);
        case "acos":
          return Math.acos(args[0]);
        case "atan":
          return Math.atan(args[0]);
        case "sqrt": {
          if (args[0] < 0) throw new Error("Square root of a negative number.");
          return Math.sqrt(args[0]);
        }
        case "log": {
          if (args[0] <= 0) throw new Error("Logarithm of a non-positive number.");
          return Math.log(args[0]);
        }
        case "log10": {
          if (args[0] <= 0) throw new Error("Logarithm of a non-positive number.");
          return Math.log10(args[0]);
        }
        case "exp":
          return Math.exp(args[0]);
        case "floor":
          return Math.floor(args[0]);
        case "ceil":
          return Math.ceil(args[0]);
        case "round":
          return Math.round(args[0]);
        case "choose":
          return args[0] > 0 ? args[1] : args[2];
        default:
          throw new Error(`Unhandled function "${node.name}".`);
      }
    }
  }
}
function collectIdentifiers(node, out = /* @__PURE__ */ new Set()) {
  if (node.kind === "ident") out.add(node.name);
  if (node.kind === "unary") collectIdentifiers(node.expr, out);
  if (node.kind === "binary") {
    collectIdentifiers(node.left, out);
    collectIdentifiers(node.right, out);
  }
  if (node.kind === "call") node.args.forEach((a) => collectIdentifiers(a, out));
  return out;
}
function countNodes(node) {
  if (node.kind === "number" || node.kind === "ident") return 1;
  if (node.kind === "unary") return 1 + countNodes(node.expr);
  if (node.kind === "binary") return 1 + countNodes(node.left) + countNodes(node.right);
  return 1 + node.args.reduce((sum, n) => sum + countNodes(n), 0);
}
function evaluateMathExpressionForIbt(compiled, parsed) {
  const globalConstants = {
    "const.PI": Math.PI,
    "const.E": Math.E,
    "const.kph_to_mph": 0.621371192,
    "const.kph_to_mps": 0.277777778,
    "const.mps_to_kph": 3.6,
    "const.mps_to_mph": 2.23693629,
    "const.bar_to_psi": 14.50377377,
    "const.bar_to_kpa": 100,
    "const.kpa_to_psi": 0.145037738,
    "const.psi_to_bar": 0.068947573,
    "const.c_to_f_gain": 1.8,
    "const.c_to_f_offset": 32,
    "const.g_to_mps2": 9.80665,
    "const.mps2_to_g": 0.101971621,
    "const.nm_to_lbfft": 0.737562149,
    "const.kg_to_lb": 2.204622622,
    "const.rpm_to_rads": 0.104719755,
    "const.rads_to_rpm": 9.549296586,
    "const.rpm_to_degs": 6,
    "const.litre_to_gal": 0.219969248,
    "const.litre_to_usgal": 0.264172052,
    "const.rad_to_deg": 57.295779513,
    "const.deg_to_rad": 0.0174532925
  };
  const channelIdentifiers = compiled.identifiers.filter((id) => !id.startsWith("const."));
  for (const id of channelIdentifiers) {
    if (!(id in parsed.channels)) {
      return null;
    }
  }
  const sessionTime = parsed.channels["SessionTime"];
  if (!sessionTime) return null;
  const numTicks = sessionTime.data.length;
  const out = new Float32Array(numTicks);
  const arrays = {};
  for (const id of channelIdentifiers) {
    arrays[id] = parsed.channels[id].data;
  }
  const ctx = { ...globalConstants };
  for (let i = 0; i < numTicks; i++) {
    for (const id of channelIdentifiers) {
      ctx[id] = arrays[id][i];
    }
    try {
      let opCount = 0;
      const value = evalNode(compiled.ast, ctx, () => {
        opCount += 1;
        if (opCount > 512) throw new Error();
      });
      out[i] = Number.isFinite(value) ? value : NaN;
    } catch {
      out[i] = NaN;
    }
  }
  return out;
}
const fmt = {
  int: (v) => Math.round(v).toString(),
  k: (v) => Math.round(v).toLocaleString(),
  f1: (v) => v.toFixed(1),
  f2: (v) => v.toFixed(2),
  pct01: (v) => Math.round(v * 100).toString(),
  gear: (g) => g === 0 ? "N" : g === -1 ? "R" : String(g),
  bool: (v) => v ? "ON" : "OFF"
};
const STATIC_CHANNELS = [
  // Drive
  {
    key: "speedKph",
    label: "SPEED",
    unit: "km/h",
    color: "#22d3ee",
    group: "Drive",
    read: (t) => fmt.int(t.speedKph)
  },
  {
    key: "rpm",
    label: "RPM",
    unit: "rpm",
    color: "#e5e5e5",
    group: "Drive",
    read: (t) => fmt.k(t.rpm)
  },
  {
    key: "rpmMax",
    label: "RPM MAX",
    unit: "rpm",
    color: "#737373",
    group: "Drive",
    read: (t) => fmt.k(t.rpmMax)
  },
  {
    key: "rpmShiftWarn",
    label: "SHIFT WARN",
    unit: "rpm",
    color: "#fbbf24",
    group: "Drive",
    read: (t) => fmt.k(t.rpmShiftWarn)
  },
  {
    key: "rpmShiftRedline",
    label: "REDLINE",
    unit: "rpm",
    color: "#f43f5e",
    group: "Drive",
    read: (t) => fmt.k(t.rpmShiftRedline)
  },
  {
    key: "gear",
    label: "GEAR",
    unit: "",
    color: "#fbbf24",
    group: "Drive",
    read: (t) => fmt.gear(t.gear)
  },
  // Inputs
  {
    key: "throttle",
    label: "THROTTLE",
    unit: "%",
    color: "#22c55e",
    group: "Inputs",
    read: (t) => fmt.pct01(t.throttle)
  },
  {
    key: "brake",
    label: "BRAKE",
    unit: "%",
    color: "#ef4444",
    group: "Inputs",
    read: (t) => fmt.pct01(t.brake)
  },
  {
    key: "clutch",
    label: "CLUTCH",
    unit: "%",
    color: "#60a5fa",
    group: "Inputs",
    read: (t) => fmt.pct01(t.clutch)
  },
  {
    key: "steeringDeg",
    label: "STEER",
    unit: "°",
    color: "#facc15",
    group: "Inputs",
    read: (t) => fmt.int(t.steeringDeg)
  },
  // Forces
  {
    key: "gLat",
    label: "G LAT",
    unit: "G",
    color: "#f97316",
    group: "Forces",
    read: (t) => fmt.f2(t.gLat)
  },
  {
    key: "gLon",
    label: "G LON",
    unit: "G",
    color: "#38bdf8",
    group: "Forces",
    read: (t) => fmt.f2(t.gLon)
  },
  // Tyres
  {
    key: "tires.fl.tempC",
    label: "FL TEMP",
    unit: "°C",
    color: "#fb923c",
    group: "Tyres",
    read: (t) => fmt.int(t.tires.fl.tempC)
  },
  {
    key: "tires.fr.tempC",
    label: "FR TEMP",
    unit: "°C",
    color: "#fb923c",
    group: "Tyres",
    read: (t) => fmt.int(t.tires.fr.tempC)
  },
  {
    key: "tires.rl.tempC",
    label: "RL TEMP",
    unit: "°C",
    color: "#fb923c",
    group: "Tyres",
    read: (t) => fmt.int(t.tires.rl.tempC)
  },
  {
    key: "tires.rr.tempC",
    label: "RR TEMP",
    unit: "°C",
    color: "#fb923c",
    group: "Tyres",
    read: (t) => fmt.int(t.tires.rr.tempC)
  },
  {
    key: "tires.fl.pressureBar",
    label: "FL PRESS",
    unit: "bar",
    color: "#a78bfa",
    group: "Tyres",
    read: (t) => fmt.f2(t.tires.fl.pressureBar)
  },
  {
    key: "tires.fr.pressureBar",
    label: "FR PRESS",
    unit: "bar",
    color: "#a78bfa",
    group: "Tyres",
    read: (t) => fmt.f2(t.tires.fr.pressureBar)
  },
  {
    key: "tires.rl.pressureBar",
    label: "RL PRESS",
    unit: "bar",
    color: "#a78bfa",
    group: "Tyres",
    read: (t) => fmt.f2(t.tires.rl.pressureBar)
  },
  {
    key: "tires.rr.pressureBar",
    label: "RR PRESS",
    unit: "bar",
    color: "#a78bfa",
    group: "Tyres",
    read: (t) => fmt.f2(t.tires.rr.pressureBar)
  },
  {
    key: "tires.fl.wearPct",
    label: "FL WEAR",
    unit: "%",
    color: "#10b981",
    group: "Tyres",
    read: (t) => fmt.int(t.tires.fl.wearPct)
  },
  {
    key: "tires.fr.wearPct",
    label: "FR WEAR",
    unit: "%",
    color: "#10b981",
    group: "Tyres",
    read: (t) => fmt.int(t.tires.fr.wearPct)
  },
  {
    key: "tires.rl.wearPct",
    label: "RL WEAR",
    unit: "%",
    color: "#10b981",
    group: "Tyres",
    read: (t) => fmt.int(t.tires.rl.wearPct)
  },
  {
    key: "tires.rr.wearPct",
    label: "RR WEAR",
    unit: "%",
    color: "#10b981",
    group: "Tyres",
    read: (t) => fmt.int(t.tires.rr.wearPct)
  },
  {
    key: "tires.fl.estWearPct",
    label: "FL EST. WEAR",
    unit: "%",
    color: "#34d399",
    group: "Tyres",
    read: (t) => fmt.f1(t.tires.fl.estWearPct)
  },
  {
    key: "tires.fr.estWearPct",
    label: "FR EST. WEAR",
    unit: "%",
    color: "#34d399",
    group: "Tyres",
    read: (t) => fmt.f1(t.tires.fr.estWearPct)
  },
  {
    key: "tires.rl.estWearPct",
    label: "RL EST. WEAR",
    unit: "%",
    color: "#34d399",
    group: "Tyres",
    read: (t) => fmt.f1(t.tires.rl.estWearPct)
  },
  {
    key: "tires.rr.estWearPct",
    label: "RR EST. WEAR",
    unit: "%",
    color: "#34d399",
    group: "Tyres",
    read: (t) => fmt.f1(t.tires.rr.estWearPct)
  },
  // Brakes
  {
    key: "tires.fl.brakeTempC",
    label: "FL BRAKE",
    unit: "C",
    color: "#f43f5e",
    group: "Tyres",
    read: (t) => fmt.int(t.tires.fl.brakeTempC)
  },
  {
    key: "tires.fr.brakeTempC",
    label: "FR BRAKE",
    unit: "C",
    color: "#f43f5e",
    group: "Tyres",
    read: (t) => fmt.int(t.tires.fr.brakeTempC)
  },
  {
    key: "tires.rl.brakeTempC",
    label: "RL BRAKE",
    unit: "C",
    color: "#f43f5e",
    group: "Tyres",
    read: (t) => fmt.int(t.tires.rl.brakeTempC)
  },
  {
    key: "tires.rr.brakeTempC",
    label: "RR BRAKE",
    unit: "C",
    color: "#f43f5e",
    group: "Tyres",
    read: (t) => fmt.int(t.tires.rr.brakeTempC)
  },
  {
    key: "tires.fl.brakeLinePress",
    label: "FL B.PRES",
    unit: "bar",
    color: "#fca5a5",
    group: "Tyres",
    read: (t) => fmt.f1(t.tires.fl.brakeLinePress)
  },
  {
    key: "tires.fr.brakeLinePress",
    label: "FR B.PRES",
    unit: "bar",
    color: "#fca5a5",
    group: "Tyres",
    read: (t) => fmt.f1(t.tires.fr.brakeLinePress)
  },
  {
    key: "tires.rl.brakeLinePress",
    label: "RL B.PRES",
    unit: "bar",
    color: "#fca5a5",
    group: "Tyres",
    read: (t) => fmt.f1(t.tires.rl.brakeLinePress)
  },
  {
    key: "tires.rr.brakeLinePress",
    label: "RR B.PRES",
    unit: "bar",
    color: "#fca5a5",
    group: "Tyres",
    read: (t) => fmt.f1(t.tires.rr.brakeLinePress)
  },
  // Session
  {
    key: "lastLap",
    label: "LAST LAP",
    unit: "",
    color: "#e5e5e5",
    group: "Session",
    read: (t) => t.lastLap
  },
  {
    key: "bestLap",
    label: "BEST LAP",
    unit: "",
    color: "#34d399",
    group: "Session",
    read: (t) => t.bestLap
  },
  {
    key: "deltaSec",
    label: "DELTA",
    unit: "s",
    color: "#facc15",
    group: "Session",
    read: (t) => `${t.deltaSec >= 0 ? "+" : ""}${t.deltaSec.toFixed(3)}`
  },
  {
    key: "sectors.s1",
    label: "S1",
    unit: "",
    color: "#a3a3a3",
    group: "Session",
    read: (t) => t.sectors.s1 ?? "--.---"
  },
  {
    key: "sectors.s2",
    label: "S2",
    unit: "",
    color: "#a3a3a3",
    group: "Session",
    read: (t) => t.sectors.s2 ?? "--.---"
  },
  {
    key: "sectors.s3",
    label: "S3",
    unit: "",
    color: "#a3a3a3",
    group: "Session",
    read: (t) => t.sectors.s3 ?? "--.---"
  },
  {
    key: "session",
    label: "SESSION",
    unit: "",
    color: "#737373",
    group: "Session",
    read: (t) => t.session
  },
  {
    key: "track",
    label: "TRACK",
    unit: "",
    color: "#737373",
    group: "Session",
    read: (t) => t.track
  },
  { key: "car", label: "CAR", unit: "", color: "#737373", group: "Session", read: (t) => t.car },
  {
    key: "carNumber",
    label: "CAR #",
    unit: "",
    color: "#737373",
    group: "Session",
    read: (t) => `#${t.carNumber}`
  },
  {
    key: "sdkVersion",
    label: "SDK",
    unit: "",
    color: "#737373",
    group: "Session",
    read: (t) => t.sdkVersion
  },
  {
    key: "latencyMs",
    label: "LATENCY",
    unit: "ms",
    color: "#a3a3a3",
    group: "Session",
    read: (t) => fmt.int(t.latencyMs)
  },
  {
    key: "safetyRating",
    label: "SR",
    unit: "",
    color: "#a3a3a3",
    group: "Session",
    read: (t) => fmt.f2(t.safetyRating)
  },
  {
    key: "sof",
    label: "SOF",
    unit: "",
    color: "#a3a3a3",
    group: "Session",
    read: (t) => t.sof.toLocaleString()
  },
  // Setup / strategy
  {
    key: "fuelRemainingL",
    label: "FUEL",
    unit: "L",
    color: "#fb923c",
    group: "Setup",
    read: (t) => fmt.f1(t.fuelRemainingL)
  },
  {
    key: "lapsEstimated",
    label: "LAPS EST",
    unit: "",
    color: "#a3a3a3",
    group: "Setup",
    read: (t) => fmt.f1(t.lapsEstimated)
  },
  {
    key: "brakeBias",
    label: "BBIAS",
    unit: "%",
    color: "#a3a3a3",
    group: "Setup",
    read: (t) => fmt.f1(t.brakeBias)
  },
  {
    key: "diffMap",
    label: "DIFF",
    unit: "",
    color: "#a3a3a3",
    group: "Setup",
    read: (t) => `M${t.diffMap}`
  },
  {
    key: "drsAvailable",
    label: "DRS",
    unit: "",
    color: "#22d3ee",
    group: "Setup",
    read: (t) => fmt.bool(t.drsAvailable)
  },
  // Env
  {
    key: "airTempC",
    label: "AIR",
    unit: "°C",
    color: "#7dd3fc",
    group: "Env",
    read: (t) => fmt.int(t.airTempC)
  },
  {
    key: "trackTempC",
    label: "TRACK",
    unit: "°C",
    color: "#fb923c",
    group: "Env",
    read: (t) => fmt.int(t.trackTempC)
  }
];
function buildRegistry(t) {
  const extras = Object.keys(t.extras ?? {}).map((k) => ({
    key: `extras.${k}`,
    label: k.toUpperCase(),
    unit: "",
    color: "#c084fc",
    group: "Extras",
    read: (tt) => {
      const v = tt.extras?.[k];
      if (typeof v !== "number") return "—";
      return Math.abs(v) >= 100 ? Math.round(v).toString() : v.toFixed(2);
    }
  }));
  return [...STATIC_CHANNELS, ...extras];
}
const STORAGE_KEY = "pitwall.channels.v2";
const DEFAULT_KEYS = [
  "speedKph",
  "rpm",
  "gear",
  "throttle",
  "brake",
  "clutch",
  "steeringDeg",
  "gLat",
  "gLon",
  "fuelRemainingL",
  "lapsEstimated",
  "brakeBias",
  "tires.fl.tempC",
  "tires.fr.tempC",
  "tires.rl.tempC",
  "tires.rr.tempC",
  "tires.fl.brakeTempC",
  "tires.fr.brakeTempC",
  "tires.rl.brakeTempC",
  "tires.rr.brakeTempC",
  "tires.fl.brakeLinePress",
  "tires.fr.brakeLinePress",
  "tires.rl.brakeLinePress",
  "tires.rr.brakeLinePress",
  "tires.fl.wearPct",
  "tires.fr.wearPct",
  "tires.rl.wearPct",
  "tires.rr.wearPct",
  "tires.fl.estWearPct",
  "tires.fr.estWearPct",
  "tires.rl.estWearPct",
  "tires.rr.estWearPct"
];
function loadChannelPrefs() {
  if (typeof window === "undefined")
    return { visible: DEFAULT_KEYS, modeByKey: {}, mathExpressions: [] };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { visible: DEFAULT_KEYS, modeByKey: {}, mathExpressions: [] };
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.visible) || parsed.visible.length === 0) {
      return { visible: DEFAULT_KEYS, modeByKey: {}, mathExpressions: [] };
    }
    return {
      visible: parsed.visible,
      modeByKey: parsed.modeByKey ?? {},
      mathExpressions: parsed.mathExpressions ?? []
    };
  } catch {
    return { visible: DEFAULT_KEYS, modeByKey: {}, mathExpressions: [] };
  }
}
function saveChannelPrefs(prefs) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
  }
}
const DEFAULT_CHANNEL_KEYS = DEFAULT_KEYS;
function MiniTrace({ values, color }) {
  const w = 100;
  const h = 20;
  if (values.length < 2) {
    return /* @__PURE__ */ jsx("svg", { viewBox: `0 0 ${w} ${h}`, preserveAspectRatio: "none", className: "w-full h-5 block opacity-20", children: /* @__PURE__ */ jsx(
      "line",
      {
        x1: "0",
        y1: h / 2,
        x2: w,
        y2: h / 2,
        stroke: color,
        strokeWidth: "1",
        strokeDasharray: "2,3"
      }
    ) });
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(1e-6, max - min);
  const points = values.map((v, i) => {
    const x = i / (values.length - 1) * (w - 1);
    const y = h - 1 - (v - min) / span * (h - 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  const lastX = ((values.length - 1) / (values.length - 1) * (w - 1)).toFixed(1);
  const fillPoints = `0,${h} ${points} ${lastX},${h}`;
  const gradId = `mg_${color.replace(/[^a-z0-9]/gi, "")}`;
  return /* @__PURE__ */ jsxs("svg", { viewBox: `0 0 ${w} ${h}`, preserveAspectRatio: "none", className: "w-full h-5 block", children: [
    /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("linearGradient", { id: gradId, x1: "0", y1: "0", x2: "0", y2: "1", children: [
      /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: color, stopOpacity: "0.25" }),
      /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: color, stopOpacity: "0.02" })
    ] }) }),
    /* @__PURE__ */ jsx("polygon", { points: fillPoints, fill: `url(#${gradId})` }),
    /* @__PURE__ */ jsx(
      "polyline",
      {
        points,
        fill: "none",
        stroke: color,
        strokeWidth: "1.25",
        strokeLinecap: "round",
        strokeLinejoin: "round"
      }
    ),
    values.length > 0 && /* @__PURE__ */ jsx(
      "circle",
      {
        cx: ((values.length - 1) / (values.length - 1) * (w - 1)).toFixed(1),
        cy: (h - 1 - (values[values.length - 1] - min) / span * (h - 2)).toFixed(1),
        r: "2",
        fill: color
      }
    )
  ] });
}
function computeHistogram(values, binCount) {
  const filtered = values.filter((v) => Number.isFinite(v));
  if (filtered.length === 0) {
    return {
      bins: [],
      stats: {
        mean: 0,
        median: 0,
        stdDev: 0,
        min: 0,
        max: 0,
        count: 0,
        q1: 0,
        q3: 0
      }
    };
  }
  const sorted = [...filtered].sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const range = max - min || 1;
  const binWidth = range / binCount;
  const bins = Array.from({ length: binCount }, (_, i) => {
    const binMin = min + i * binWidth;
    const binMax = i === binCount - 1 ? max + 1e-4 : min + (i + 1) * binWidth;
    return {
      min: binMin,
      max: binMax,
      count: 0,
      label: `${binMin.toFixed(1)}-${binMax.toFixed(1)}`,
      percentage: 0
    };
  });
  for (const v of filtered) {
    let binIdx = Math.floor((v - min) / binWidth);
    if (binIdx >= binCount) binIdx = binCount - 1;
    bins[binIdx].count++;
  }
  const totalCount = filtered.length;
  for (const bin of bins) {
    bin.percentage = bin.count / totalCount * 100;
  }
  const mean = filtered.reduce((a, b) => a + b, 0) / filtered.length;
  const variance = filtered.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / filtered.length;
  const stdDev = Math.sqrt(variance);
  const median = sorted[Math.floor(sorted.length / 2)];
  const q1 = sorted[Math.floor(sorted.length * 0.25)];
  const q3 = sorted[Math.floor(sorted.length * 0.75)];
  return {
    bins,
    stats: {
      mean,
      median,
      stdDev,
      min,
      max,
      count: filtered.length,
      q1,
      q3
    }
  };
}
export {
  DEFAULT_CHANNEL_KEYS as D,
  MiniTrace as M,
  STATIC_CHANNELS as S,
  TelemetryEventTimeline as T,
  computeHistogram as a,
  buildRegistry as b,
  compileMathExpression as c,
  evaluateMathExpressionForIbt as d,
  evaluateCompiledMathExpression as e,
  fetchLocalTelemetryFile as f,
  fetchTrackCarHistory as g,
  loadChannelPrefs as l,
  recordTelemetrySessionMeta as r,
  saveChannelPrefs as s
};
