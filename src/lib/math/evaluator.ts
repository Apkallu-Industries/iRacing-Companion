import type { IbtParsed } from "../ibt/types";
export type MathContext = Record<string, number>;

type Token =
  | { type: "number"; value: number }
  | { type: "ident"; value: string }
  | { type: "op"; value: "+" | "-" | "*" | "/" }
  | { type: "lparen" }
  | { type: "rparen" }
  | { type: "comma" };

type Node =
  | { kind: "number"; value: number }
  | { kind: "ident"; name: string }
  | { kind: "unary"; op: "-"; expr: Node }
  | { kind: "binary"; op: "+" | "-" | "*" | "/"; left: Node; right: Node }
  | { kind: "call"; name: "min" | "max" | "abs" | "clamp"; args: Node[] };

const IDENT_RE = /^[A-Za-z_][A-Za-z0-9_.]*$/;
const FUNC_NAMES = new Set(["min", "max", "abs", "clamp"]);
const MAX_AST_NODES = 128;

export type CompiledMathExpression = {
  ast: Node;
  identifiers: string[];
};

export type CompileResult =
  | { ok: true; compiled: CompiledMathExpression }
  | { ok: false; error: string };

export type EvalResult =
  | { ok: true; value: number }
  | { ok: false; error: string };

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
    if (!Number.isFinite(value)) return { ok: false, error: "Expression evaluated to a non-finite value." };
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
    if (ch === "(") { out.push({ type: "lparen" }); i += 1; continue; }
    if (ch === ")") { out.push({ type: "rparen" }); i += 1; continue; }
    if (ch === ",") { out.push({ type: "comma" }); i += 1; continue; }
    if (ch === "+" || ch === "-" || ch === "*" || ch === "/") {
      out.push({ type: "op", value: ch });
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
        return { kind: "call", name: fn as "min" | "max" | "abs" | "clamp", args };
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
  private matchOp(op: "+" | "-" | "*" | "/"): boolean {
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
  if (fn === "abs" && count !== 1) throw new Error("abs() expects exactly 1 argument.");
  if ((fn === "min" || fn === "max") && count !== 2) throw new Error(`${fn}() expects exactly 2 arguments.`);
  if (fn === "clamp" && count !== 3) throw new Error("clamp() expects exactly 3 arguments.");
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
      if (Math.abs(r) < 1e-12) throw new Error("Division by zero.");
      return l / r;
    }
    case "call": {
      const args = node.args.map((a) => evalNode(a, context, tick));
      if (node.name === "abs") return Math.abs(args[0]);
      if (node.name === "min") return Math.min(args[0], args[1]);
      if (node.name === "max") return Math.max(args[0], args[1]);
      const x = args[0];
      const lo = Math.min(args[1], args[2]);
      const hi = Math.max(args[1], args[2]);
      return Math.max(lo, Math.min(hi, x));
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

import type { IbtParsed } from "../ibt/types";

export function evaluateMathExpressionForIbt(
  compiled: CompiledMathExpression,
  parsed: IbtParsed
): Float32Array | null {
  for (const id of compiled.identifiers) {
    if (!(id in parsed.channels)) {
      return null;
    }
  }

  const sessionTime = parsed.channels["SessionTime"];
  if (!sessionTime) return null;

  const numTicks = sessionTime.data.length;
  const out = new Float32Array(numTicks);
  const arrays: Record<string, Float32Array | Float64Array> = {};
  for (const id of compiled.identifiers) {
    arrays[id] = parsed.channels[id].data;
  }

  const ctx: MathContext = {};
  for (let i = 0; i < numTicks; i++) {
    for (const id of compiled.identifiers) {
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

