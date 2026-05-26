import type { IbtParsed } from "../ibt/types";
export type MathContext = Record<string, number>;

type Token =
  | { type: "number"; value: number }
  | { type: "ident"; value: string }
  | { type: "op"; value: "+" | "-" | "*" | "/" | "<" | ">" | "<=" | ">=" | "==" | "!=" | "&&" | "||" }
  | { type: "lparen" }
  | { type: "rparen" }
  | { type: "comma" };

type Node =
  | { kind: "number"; value: number }
  | { kind: "ident"; name: string }
  | { kind: "unary"; op: "-"; expr: Node }
  | { kind: "binary"; op: "+" | "-" | "*" | "/" | "<" | ">" | "<=" | ">=" | "==" | "!=" | "&&" | "||"; left: Node; right: Node }
  | {
      kind: "call";
      name:
        | "min"
        | "max"
        | "abs"
        | "clamp"
        | "sin"
        | "cos"
        | "tan"
        | "asin"
        | "acos"
        | "atan"
        | "sqrt"
        | "log"
        | "log10"
        | "exp"
        | "floor"
        | "ceil"
        | "round"
        | "choose";
      args: Node[];
    };

const IDENT_RE = /^[A-Za-z_][A-Za-z0-9_.]*$/;
const FUNC_NAMES = new Set([
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
  "choose",
]);
const MAX_AST_NODES = 128;

export type CompiledMathExpression = {
  ast: Node;
  identifiers: string[];
};

export type CompileResult =
  | { ok: true; compiled: CompiledMathExpression }
  | { ok: false; error: string };

export type EvalResult = { ok: true; value: number } | { ok: false; error: string };

export function compileMathExpression(input: string): CompileResult {
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

export function evaluateCompiledMathExpression(
  compiled: CompiledMathExpression,
  context: MathContext,
): EvalResult {
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

function tokenize(input: string): Token[] {
  const s = input.trim();
  const out: Token[] = [];
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
      out.push({ type: "op", value: "&&" as any });
      i += 2;
      continue;
    }
    if (s.slice(i, i + 2) === "||") {
      out.push({ type: "op", value: "||" as any });
      i += 2;
      continue;
    }
    if (s.slice(i, i + 2) === "<=") {
      out.push({ type: "op", value: "<=" as any });
      i += 2;
      continue;
    }
    if (s.slice(i, i + 2) === ">=") {
      out.push({ type: "op", value: ">=" as any });
      i += 2;
      continue;
    }
    if (s.slice(i, i + 2) === "==") {
      out.push({ type: "op", value: "==" as any });
      i += 2;
      continue;
    }
    if (s.slice(i, i + 2) === "!=") {
      out.push({ type: "op", value: "!=" as any });
      i += 2;
      continue;
    }
    if (ch === "+" || ch === "-" || ch === "*" || ch === "/" || ch === "<" || ch === ">") {
      out.push({ type: "op", value: ch as any });
      i += 1;
      continue;
    }
    if (/\d/.test(ch) || (ch === "." && /\d/.test(s[i + 1] ?? ""))) {
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
  private i = 0;
  constructor(private readonly tokens: Token[]) {}

  parseExpression(): Node {
    return this.parseLogicalOr();
  }

  private parseLogicalOr(): Node {
    let node = this.parseLogicalAnd();
    while (this.matchOp("||")) {
      const op = this.prev() as Extract<Token, { type: "op" }>;
      const right = this.parseLogicalAnd();
      node = { kind: "binary", op: op.value, left: node, right };
    }
    return node;
  }

  private parseLogicalAnd(): Node {
    let node = this.parseComparison();
    while (this.matchOp("&&")) {
      const op = this.prev() as Extract<Token, { type: "op" }>;
      const right = this.parseComparison();
      node = { kind: "binary", op: op.value, left: node, right };
    }
    return node;
  }

  private parseComparison(): Node {
    let node = this.parseAdditive();
    while (
      this.matchOp("==") ||
      this.matchOp("!=") ||
      this.matchOp("<") ||
      this.matchOp(">") ||
      this.matchOp("<=") ||
      this.matchOp(">=")
    ) {
      const op = this.prev() as Extract<Token, { type: "op" }>;
      const right = this.parseAdditive();
      node = { kind: "binary", op: op.value, left: node, right };
    }
    return node;
  }

  private parseAdditive(): Node {
    let node = this.parseTerm();
    while (this.matchOp("+") || this.matchOp("-")) {
      const op = this.prev() as Extract<Token, { type: "op" }>;
      const right = this.parseTerm();
      node = { kind: "binary", op: op.value, left: node, right };
    }
    return node;
  }

  private parseTerm(): Node {
    let node = this.parseFactor();
    while (this.matchOp("*") || this.matchOp("/")) {
      const op = this.prev() as Extract<Token, { type: "op" }>;
      const right = this.parseFactor();
      node = { kind: "binary", op: op.value, left: node, right };
    }
    return node;
  }

  private parseFactor(): Node {
    if (this.matchOp("-")) {
      return { kind: "unary", op: "-", expr: this.parseFactor() };
    }
    return this.parsePrimary();
  }

  private parsePrimary(): Node {
    if (this.match("number")) {
      return { kind: "number", value: (this.prev() as Extract<Token, { type: "number" }>).value };
    }
    if (this.match("ident")) {
      const ident = (this.prev() as Extract<Token, { type: "ident" }>).value;
      if (this.match("lparen")) {
        const fn = ident.toLowerCase();
        if (!FUNC_NAMES.has(fn)) throw new Error(`Unknown function "${ident}".`);
        const args: Node[] = [];
        if (!this.check("rparen")) {
          do {
            args.push(this.parseExpression());
          } while (this.match("comma"));
        }
        this.consume("rparen", 'Expected ")" after function arguments.');
        assertArgCount(fn, args.length);
        return { kind: "call", name: fn as any, args };
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

  private match(type: Token["type"]): boolean {
    if (this.check(type)) {
      this.i += 1;
      return true;
    }
    return false;
  }
  private matchOp(op: string): boolean {
    if (this.check("op") && (this.peek() as Extract<Token, { type: "op" }>).value === op) {
      this.i += 1;
      return true;
    }
    return false;
  }
  private consume(type: Token["type"], msg: string) {
    if (this.match(type)) return;
    throw new Error(msg);
  }
  private check(type: Token["type"]): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }
  private peek(): Token {
    return this.tokens[this.i];
  }
  private prev(): Token {
    return this.tokens[this.i - 1];
  }
  private isAtEnd(): boolean {
    return this.i >= this.tokens.length;
  }
}

function assertArgCount(fn: string, count: number) {
  const singleArgFns = new Set([
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
    "round",
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

function evalNode(node: Node, context: MathContext, tick: () => void): number {
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
          throw new Error(`Unhandled function "${(node as any).name}".`);
      }
    }
  }
}

function collectIdentifiers(node: Node, out = new Set<string>()): Set<string> {
  if (node.kind === "ident") out.add(node.name);
  if (node.kind === "unary") collectIdentifiers(node.expr, out);
  if (node.kind === "binary") {
    collectIdentifiers(node.left, out);
    collectIdentifiers(node.right, out);
  }
  if (node.kind === "call") node.args.forEach((a) => collectIdentifiers(a, out));
  return out;
}

function countNodes(node: Node): number {
  if (node.kind === "number" || node.kind === "ident") return 1;
  if (node.kind === "unary") return 1 + countNodes(node.expr);
  if (node.kind === "binary") return 1 + countNodes(node.left) + countNodes(node.right);
  return 1 + node.args.reduce((sum, n) => sum + countNodes(n), 0);
}

export function evaluateMathExpressionForIbt(
  compiled: CompiledMathExpression,
  parsed: IbtParsed,
): Float32Array | null {
  const globalConstants: Record<string, number> = {
    "const.PI": Math.PI,
    "const.E": Math.E,
    "const.kph_to_mph": 0.621371192,
    "const.kph_to_mps": 0.277777778,
    "const.mps_to_kph": 3.6,
    "const.mps_to_mph": 2.23693629,
    "const.bar_to_psi": 14.50377377,
    "const.bar_to_kpa": 100.0,
    "const.kpa_to_psi": 0.145037738,
    "const.psi_to_bar": 0.068947573,
    "const.c_to_f_gain": 1.8,
    "const.c_to_f_offset": 32.0,
    "const.g_to_mps2": 9.80665,
    "const.mps2_to_g": 0.101971621,
    "const.nm_to_lbfft": 0.737562149,
    "const.kg_to_lb": 2.204622622,
    "const.rpm_to_rads": 0.104719755,
    "const.rads_to_rpm": 9.549296586,
    "const.rpm_to_degs": 6.0,
    "const.litre_to_gal": 0.219969248,
    "const.litre_to_usgal": 0.264172052,
    "const.rad_to_deg": 57.295779513,
    "const.deg_to_rad": 0.0174532925,
  };

  const channelIdentifiers = compiled.identifiers.filter(id => !id.startsWith("const."));

  for (const id of channelIdentifiers) {
    if (!(id in parsed.channels)) {
      return null;
    }
  }

  const sessionTime = parsed.channels["SessionTime"];
  if (!sessionTime) return null;

  const numTicks = sessionTime.data.length;
  const out = new Float32Array(numTicks);
  const arrays: Record<string, Float32Array | Float64Array> = {};
  for (const id of channelIdentifiers) {
    arrays[id] = parsed.channels[id].data;
  }

  const ctx: MathContext = { ...globalConstants };
  for (let i = 0; i < numTicks; i++) {
    for (const id of channelIdentifiers) {
      ctx[id] = arrays[id][i];
    }
    // We can evaluate manually to avoid overhead or just use the helper:
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
