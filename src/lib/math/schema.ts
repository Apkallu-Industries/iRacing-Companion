import { z } from "zod";

export const MATH_V1_MAX_EXPRESSION_LEN = 256;
export const MATH_V1_MAX_IDENTIFIERS = 32;

const KEY_RE = /^[a-z][a-z0-9_]*$/;
const UNIT_RE = /^[A-Za-z0-9%/._+\- ]{0,16}$/;
const COLOR_RE = /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

export const MathScopeSchema = z.enum(["live", "workbench", "both"]);

export const MathExpressionSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1).max(80),
  key: z.string().trim().regex(KEY_RE, "Key must be snake_case and start with a letter."),
  expression: z.string().trim().min(1).max(MATH_V1_MAX_EXPRESSION_LEN),
  unit: z.string().trim().regex(UNIT_RE, "Unit contains unsupported characters.").optional(),
  precision: z.number().int().min(0).max(6).optional(),
  color: z.string().regex(COLOR_RE, "Color must be #RRGGBB or #RRGGBBAA.").optional(),
  enabled: z.boolean(),
  scope: MathScopeSchema,
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type MathExpression = z.infer<typeof MathExpressionSchema>;

const TOKEN_RE = /\s*([A-Za-z_][A-Za-z0-9_.]*|\d+(?:\.\d+)?|[()+\-*/,])\s*/g;
const IDENT_RE = /^[A-Za-z_][A-Za-z0-9_.]*$/;
const FUNC_NAMES = new Set(["min", "max", "abs", "clamp"]);

export type MathExpressionValidation = {
  ok: boolean;
  identifiers: string[];
  error?: string;
};

/**
 * Light syntax validator for Math v1 user expressions.
 * Safety policy:
 * - allow only known tokens/operators
 * - cap identifier count
 * - only whitelisted function names
 */
export function validateMathExpressionSyntax(input: string): MathExpressionValidation {
  const expression = input.trim();
  if (!expression) return { ok: false, identifiers: [], error: "Expression is empty." };
  if (expression.length > MATH_V1_MAX_EXPRESSION_LEN) {
    return { ok: false, identifiers: [], error: `Expression too long (max ${MATH_V1_MAX_EXPRESSION_LEN}).` };
  }

  const tokens: string[] = [];
  let m: RegExpExecArray | null;
  TOKEN_RE.lastIndex = 0;
  while ((m = TOKEN_RE.exec(expression)) !== null) {
    tokens.push(m[1]);
  }
  const joined = tokens.join("");
  const compact = expression.replace(/\s+/g, "");
  if (joined.length === 0 || joined !== compact) {
    return { ok: false, identifiers: [], error: "Expression contains unsupported characters." };
  }

  let depth = 0;
  let expectValue = true;
  const identifiers = new Set<string>();

  for (let i = 0; i < tokens.length; i += 1) {
    const t = tokens[i];
    const next = tokens[i + 1];
    if (t === "(") {
      depth += 1;
      continue;
    }
    if (t === ")") {
      depth -= 1;
      if (depth < 0) return { ok: false, identifiers: [], error: "Unbalanced parentheses." };
      expectValue = false;
      continue;
    }
    if (["+", "-", "*", "/", ","].includes(t)) {
      if (t === "," && depth === 0) return { ok: false, identifiers: [], error: "Unexpected comma." };
      expectValue = t !== ")";
      continue;
    }
    if (/^\d/.test(t)) {
      expectValue = false;
      continue;
    }
    if (IDENT_RE.test(t)) {
      if (next === "(") {
        const fn = t.toLowerCase();
        if (!FUNC_NAMES.has(fn)) {
          return { ok: false, identifiers: [], error: `Unknown function "${t}".` };
        }
      } else {
        identifiers.add(t);
        if (identifiers.size > MATH_V1_MAX_IDENTIFIERS) {
          return { ok: false, identifiers: [], error: `Too many identifiers (max ${MATH_V1_MAX_IDENTIFIERS}).` };
        }
      }
      expectValue = false;
      continue;
    }
    return { ok: false, identifiers: [], error: `Invalid token "${t}".` };
  }

  if (depth !== 0) return { ok: false, identifiers: [], error: "Unbalanced parentheses." };
  if (expectValue) return { ok: false, identifiers: [], error: "Expression cannot end with an operator." };
  return { ok: true, identifiers: [...identifiers] };
}
