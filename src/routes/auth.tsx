import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Activity } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Welcome — Pit Wall" },
      { name: "description", content: "Welcome to your local Pit Wall telemetry workbench." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const [busy, setBusy] = useState(false);

  const loginAsLocal = () => {
    setBusy(true);
    const mockSession = {
      access_token: "mock-local-token",
      expires_at: Math.floor(Date.now() / 1000) + 31536000,
      user: {
        id: "local-user-id",
        email: "local-developer@apex.trace",
        app_metadata: { provider: "local", providers: ["local"] },
        user_metadata: {},
        aud: "authenticated",
        role: "authenticated",
        created_at: new Date().toISOString(),
      },
    };
    localStorage.setItem("apex_local_session", JSON.stringify(mockSession));
    window.location.href = "/sessions";
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-primary text-primary-foreground">
            <Activity className="h-6 w-6" />
          </div>
          <span className="font-mono text-xl tracking-wider">PIT WALL</span>
        </Link>
        <div className="hairline rounded-sm bg-panel p-6 text-center shadow-lg">
          <h1 className="text-xl font-semibold mb-2">Desktop Environment</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Running in local-only mode. No cloud authentication required.
          </p>
          <button
            type="button"
            onClick={loginAsLocal}
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-sm bg-primary py-3 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer"
          >
            <Activity className="h-4 w-4" />
            {busy ? "Starting..." : "Enter Application"}
          </button>
        </div>
      </div>
    </div>
  );
}
