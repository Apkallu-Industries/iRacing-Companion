import { j as o } from "./react-core-hSJfnumv.js";
import { X as n, Q as c, O as i, b as l } from "./index-BF1LFLDu.js";
import { a as e } from "./icons-UNkcvPbk.js";
function b() {
  const a = n(),
    t = c(),
    s = i();
  if (t.pathname === "/") return null;
  const r =
    "inline-flex items-center gap-1.5 rounded-sm border border-border bg-rail px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground hover:bg-accent hover:text-foreground transition-all hover:scale-105 mr-1.5 shrink-0 cursor-pointer";
  return s
    ? o.jsxs("button", {
        type: "button",
        "aria-label": "Go back",
        className: r,
        onClick: () => a.history.back(),
        children: [o.jsx(e, { className: "h-3.5 w-3.5" }), "Back"],
      })
    : o.jsxs(l, {
        to: "/",
        "aria-label": "Go home",
        className: r,
        children: [o.jsx(e, { className: "h-3.5 w-3.5" }), "Home"],
      });
}
export { b as B };
