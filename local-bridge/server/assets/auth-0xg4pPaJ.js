import { jsx, jsxs } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { Activity } from "lucide-react";
import { useState } from "react";
function AuthPage() {
  const [busy, setBusy] = useState(false);
  const loginAsLocal = () => {
    setBusy(true);
    const mockSession = {
      access_token: "mock-local-token",
      expires_at: Math.floor(Date.now() / 1e3) + 31536e3,
      user: {
        id: "local-user-id",
        email: "local-developer@apex.trace",
        app_metadata: {
          provider: "local",
          providers: ["local"]
        },
        user_metadata: {},
        aud: "authenticated",
        role: "authenticated",
        created_at: (/* @__PURE__ */ new Date()).toISOString()
      }
    };
    localStorage.setItem("apex_local_session", JSON.stringify(mockSession));
    window.location.href = "/sessions";
  };
  return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-6", children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-sm", children: [
    /* @__PURE__ */ jsxs(Link, { to: "/", className: "mb-8 flex items-center justify-center gap-2", children: [
      /* @__PURE__ */ jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-sm bg-primary text-primary-foreground", children: /* @__PURE__ */ jsx(Activity, { className: "h-6 w-6" }) }),
      /* @__PURE__ */ jsx("span", { className: "font-mono text-xl tracking-wider", children: "PIT WALL" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "hairline rounded-sm bg-panel p-6 text-center shadow-lg", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-xl font-semibold mb-2", children: "Desktop Environment" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mb-6", children: "Running in local-only mode. No cloud authentication required." }),
      /* @__PURE__ */ jsxs("button", { type: "button", onClick: loginAsLocal, disabled: busy, className: "flex w-full items-center justify-center gap-2 rounded-sm bg-primary py-3 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer", children: [
        /* @__PURE__ */ jsx(Activity, { className: "h-4 w-4" }),
        busy ? "Starting..." : "Enter Application"
      ] })
    ] })
  ] }) });
}
export {
  AuthPage as component
};
