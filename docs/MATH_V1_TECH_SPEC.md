# Math v1 Technical Spec

Last updated: 2026-05-22

## 1. Objective

Enable users to define reusable derived channels (live + workbench) without code changes.

Examples:

- `brake_throttle_overlap = max(0, brake_pct + throttle_pct - 1)`
- `aero_balance_proxy = rear_ride_height - front_ride_height`
- `entry_stability = abs(yaw_rate) / max(speed_kph, 1)`

## 2. Non-goals (v1)

- no scripting language
- no loops/functions defined by users
- no asynchronous or historical-window expressions

## 3. Data Model

```ts
type MathExpression = {
  id: string;
  name: string;              // display label
  key: string;               // stable channel key
  expression: string;        // infix expression entered by user
  unit?: string;
  precision?: number;        // display decimals
  color?: string;
  enabled: boolean;
  scope: "live" | "workbench" | "both";
  created_at: string;
  updated_at: string;
};
```

Storage:

- local cache for offline/local mode
- server persistence by user/workspace in cloud mode

## 4. Grammar (v1)

Allowed tokens:

- numbers: `12`, `3.14`, `-0.5`
- identifiers: channel keys and constants (`speedKph`, `gLat`, `const.brake_ref`)
- operators: `+ - * /`
- unary: `-x`, `abs(x)`
- functions: `min(a,b)`, `max(a,b)`, `clamp(x,lo,hi)`
- parentheses

Disallowed:

- property traversal beyond known keys
- arbitrary function names
- assignment
- string literals

## 5. Evaluation Engine

Requirements:

- parse to AST (shunting-yard or Pratt parser)
- evaluate against a flat numeric context map
- zero `eval`, zero `new Function` for user expressions
- fail closed on parse errors
- guard divide-by-zero and NaN propagation

Runtime behavior:

- expression errors do not crash render loop
- invalid expression surfaces a channel-level warning badge
- disabled expression is skipped entirely

## 6. Safety and Limits

- max expression length: 256 chars
- max identifier count: 32
- max AST nodes: 128
- evaluation timeout budget: per-frame cap via operation counter

## 7. UI/UX

Editor fields:

- Name
- Key (auto-slug, editable)
- Expression
- Unit
- Precision
- Scope

Validation UX:

- realtime parse feedback
- inline unknown-variable hints
- preview value against current telemetry

## 8. Integration Points

Live:

- inject derived channels into live channel registry after base channels

Workbench:

- include derived channels in selectable channel browser and traces

Persistence:

- attach to workspace model and community workspace publish/import

## 9. Test Plan

Unit tests:

- parser correctness
- evaluator correctness
- edge handling (`NaN`, divide-by-zero, unknown vars)

Integration tests:

- live channel appears and updates at stream rate
- workbench channel appears and plots
- save/load preserves expression metadata

Performance tests:

- 50 active expressions at 60Hz UI stream without frame instability on target beta hardware
