import { jsxs, jsx } from "react/jsx-runtime";
import { useRouter, useLocation, useCanGoBack, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
function BackButton() {
  const router = useRouter();
  const location = useLocation();
  const canGoBack = useCanGoBack();
  if (location.pathname === "/") return null;
  const baseClass = "inline-flex items-center gap-1.5 rounded-sm border border-border bg-rail px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground hover:bg-accent hover:text-foreground transition-all hover:scale-105 mr-1.5 shrink-0 cursor-pointer";
  if (canGoBack) {
    return /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        "aria-label": "Go back",
        className: baseClass,
        onClick: () => router.history.back(),
        children: [
          /* @__PURE__ */ jsx(ArrowLeft, { className: "h-3.5 w-3.5" }),
          "Back"
        ]
      }
    );
  }
  return /* @__PURE__ */ jsxs(Link, { to: "/", "aria-label": "Go home", className: baseClass, children: [
    /* @__PURE__ */ jsx(ArrowLeft, { className: "h-3.5 w-3.5" }),
    "Home"
  ] });
}
export {
  BackButton as B
};
