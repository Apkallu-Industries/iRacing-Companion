function extractCarSetupYaml(yaml) {
  if (!yaml) return null;
  const i = yaml.indexOf("\nCarSetup:");
  if (i < 0) return null;
  const after = yaml.slice(i + 1);
  const lines = after.split("\n");
  const out = [lines[0]];
  for (let j = 1; j < lines.length; j++) {
    const ln = lines[j];
    if (ln.length && ln[0] !== " " && ln[0] !== "	") break;
    out.push(ln);
  }
  return out.join("\n");
}
function parseCarSetup(yaml) {
  const block = extractCarSetupYaml(yaml);
  if (!block) return null;
  const lines = block.split("\n").filter((l) => l.trim().length > 0);
  const root = {};
  const stack = [{ indent: -1, node: root }];
  let updateCount;
  for (const raw of lines) {
    const indent = raw.length - raw.trimStart().length;
    const trimmed = raw.trim();
    const colon = trimmed.indexOf(":");
    if (colon < 0) continue;
    const key = trimmed.slice(0, colon).trim();
    const value = trimmed.slice(colon + 1).trim();
    while (stack.length > 1 && stack[stack.length - 1].indent >= indent) stack.pop();
    const parent = stack[stack.length - 1].node;
    if (key === "CarSetup") continue;
    if (key === "UpdateCount") {
      const n = parseInt(value, 10);
      if (!Number.isNaN(n)) updateCount = n;
      continue;
    }
    if (value === "") {
      const child = {};
      parent[key] = child;
      stack.push({ indent, node: child });
    } else {
      parent[key] = value;
    }
  }
  const flat = {};
  const walk = (node, prefix) => {
    for (const [k, v] of Object.entries(node)) {
      const path = prefix ? `${prefix}.${k}` : k;
      if (typeof v === "string") flat[path] = v;
      else walk(v, path);
    }
  };
  walk(root, "");
  return { updateCount, tree: root, flat };
}
const NUM_RE = /^(-?\d+(?:\.\d+)?)(?:\s*([a-zA-Z%°"'/]+))?$/;
function asNumber(v) {
  const frac = v.match(/^(-?\d+)\/(\d+)\s*([a-zA-Z%°"'/]*)$/);
  if (frac) {
    return { value: parseInt(frac[1], 10) / parseInt(frac[2], 10), unit: frac[3] || "" };
  }
  const m = v.match(NUM_RE);
  if (!m) return null;
  return { value: parseFloat(m[1]), unit: m[2] || "" };
}
function diffSetups(a, b) {
  const out = [];
  const keys = /* @__PURE__ */ new Set([...Object.keys(a.flat), ...Object.keys(b.flat)]);
  for (const k of [...keys].sort()) {
    const av = a.flat[k] ?? null;
    const bv = b.flat[k] ?? null;
    if (av === bv) continue;
    const diff = { path: k, a: av, b: bv };
    if (av && bv) {
      const an = asNumber(av);
      const bn = asNumber(bv);
      if (an && bn && an.unit === bn.unit) {
        diff.numericDelta = { value: bn.value - an.value, unit: an.unit };
      }
    }
    out.push(diff);
  }
  return out;
}
export { diffSetups as d, extractCarSetupYaml as e, parseCarSetup as p };
