import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Activity,
  CheckCircle2,
  Circle,
  LogOut,
  Mail,
  Chrome,
  Apple,
  KeyRound,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/lib/auth";

const SteamIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 .002C5.385.002 0 5.387 0 12.002c0 5.253 3.385 9.712 8.1 11.298l-.053-.223c-.156-.632-.234-1.29-.234-1.97 0-.317.02-.63.056-.938l2.95 1.503c.092.176.222.327.382.433.456.303 1.077.228 1.442-.17.34-.37.315-.929-.057-1.267a1.002 1.002 0 0 0-.585-.198 1.026 1.026 0 0 0-.256.033l-2.92-1.393c.061-.318.175-.615.342-.876.357-.557.94-.925 1.62-.962l2.915 2.126c.11.196.28.35.485.441.493.22 1.073.048 1.345-.395.272-.44.2-.997-.17-1.294a1.008 1.008 0 0 0-.616-.234 1.01 1.01 0 0 0-.276.039l-2.95-1.502c.046-.226.136-.432.261-.611.385-.547 1.002-.888 1.706-.888 1.152 0 2.083.931 2.083 2.083s-.931 2.083-2.083 2.083a2.072 2.072 0 0 1-1.32-.472l-3.322 1.662c.287.652.797 1.18 1.455 1.487l3.327-1.662a3.076 3.076 0 0 0 1.96.72c1.71 0 3.097-1.387 3.097-3.096s-1.387-3.097-3.097-3.097c-1.4 0-2.583.928-2.975 2.19l-3.327-1.663c.277-.655.787-1.184 1.445-1.49l3.328 1.663c.522-.294.887-.852.887-1.499 0-1.71-1.387-3.097-3.097-3.097-1.71 0-3.097 1.387-3.097 3.097 0 .546.142 1.058.391 1.504l-3.355 1.677c-.502-.693-1.282-1.168-2.185-1.246V3.882c0-2.14 1.74-3.88 3.88-3.88h7.76c2.14 0 3.88 1.74 3.88 3.88v7.76c0 2.14-1.74 3.88-3.88 3.88zm3.082 17.585c-.822 0-1.49-.668-1.49-1.49 0-.822.668-1.49 1.49-1.49.822 0 1.49.668 1.49 1.49 0 .822-.668 1.49-1.49 1.49z"/>
  </svg>
);
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Pit Wall" },
      { name: "description", content: "Sign in to your Pit Wall telemetry workbench." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { user, session, loading, signOut } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/sessions` },
        });
        if (error) throw error;
        toast.success("Account created. You're signed in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const oauth = async (provider: "google" | "apple" | "steam") => {
    setBusy(true);
    try {
      const result = await lovable.auth.signInWithOAuth(provider, {
        redirect_uri: `${window.location.origin}/sessions`,
      });
      if (result.error) throw new Error(result.error.message ?? "Sign-in failed");
      if (result.redirected) return;
    } catch (err) {
      toast.error((err as Error).message);
      setBusy(false);
    }
  };

  const loginAsLocal = () => {
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

  // Derive provider info from the Supabase user object
  const provider = (user?.app_metadata?.provider as string | undefined) ?? "email";
  const allProviders = (user?.app_metadata?.providers as string[] | undefined) ?? [provider];
  const identities = user?.identities ?? [];
  const lastSignInAt = user?.last_sign_in_at;

  const providerLabel = (p: string) =>
    p === "google" ? "Google" : p === "apple" ? "Apple" : p === "steam" ? "Steam" : p === "email" ? "Email + password" : p;
  const providerIcon = (p: string) => {
    if (p === "google") return Chrome;
    if (p === "apple") return Apple;
    if (p === "email") return Mail;
    if (p === "steam") return SteamIcon as any;
    return KeyRound;
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm">
        <Link to="/" className="mb-8 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-primary text-primary-foreground">
            <Activity className="h-4 w-4" />
          </div>
          <span className="font-mono text-sm tracking-wider">APEXTRACE</span>
        </Link>

        {/* Auth status panel */}
        <div className="hairline mb-4 rounded-sm bg-panel p-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              Status
            </span>
            <span
              className={`flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider ${
                loading ? "text-muted-foreground" : user ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {loading ? (
                <>
                  <Circle className="h-3 w-3 animate-pulse" />
                  Checking…
                </>
              ) : user ? (
                <>
                  <CheckCircle2 className="h-3 w-3" />
                  Signed in
                </>
              ) : (
                <>
                  <Circle className="h-3 w-3" />
                  Signed out
                </>
              )}
            </span>
          </div>

          {user ? (
            <div className="mt-3 space-y-2 text-xs">
              <Row label="Account" value={user.email ?? user.id} />
              <Row
                label="Provider"
                value={
                  <span className="flex flex-wrap items-center gap-1.5">
                    {allProviders.map((p) => {
                      const Icon = providerIcon(p);
                      return (
                        <span
                          key={p}
                          className="inline-flex items-center gap-1 rounded-sm border border-border bg-rail px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider"
                        >
                          <Icon className="h-3 w-3" />
                          {providerLabel(p)}
                        </span>
                      );
                    })}
                  </span>
                }
              />
              {identities.length > 1 && (
                <Row label="Linked" value={`${identities.length} identities`} />
              )}
              {lastSignInAt && (
                <Row label="Last sign-in" value={new Date(lastSignInAt).toLocaleString()} />
              )}
              {session?.expires_at && (
                <Row
                  label="Session ends"
                  value={new Date(session.expires_at * 1000).toLocaleString()}
                />
              )}
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => navigate({ to: "/sessions" })}
                  className="flex-1 rounded-sm bg-primary py-1.5 text-[11px] font-medium text-primary-foreground hover:opacity-90"
                >
                  Open workbench →
                </button>
                <button
                  onClick={async () => {
                    await signOut();
                    toast.success("Signed out");
                  }}
                  className="flex items-center gap-1 rounded-sm border border-border-strong px-2 py-1.5 text-[11px] hover:bg-accent"
                >
                  <LogOut className="h-3 w-3" />
                  Sign out
                </button>
              </div>
            </div>
          ) : (
            <p className="mt-2 text-xs text-muted-foreground">
              You're not signed in. Use the form below to access your telemetry library.
            </p>
          )}
        </div>

        <div className="hairline rounded-sm bg-panel p-6">
          <h1 className="text-xl font-semibold">
            {mode === "signin" ? "Sign in" : "Create account"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "signin" ? "Open your telemetry library." : "Start uploading .ibt files."}
          </p>

          <div className="mt-6 space-y-2">
            <button
              type="button"
              onClick={loginAsLocal}
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-sm border border-emerald-500/30 bg-emerald-500/5 py-2.5 text-sm text-emerald-400 hover:bg-emerald-500/10 disabled:opacity-50 font-medium transition-colors"
            >
              <Activity className="h-4 w-4" /> Continue as Local Developer (No Cloud)
            </button>
            <button
              type="button"
              onClick={() => oauth("steam")}
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-sm border border-[#171a21]/50 bg-[#1b2838] py-2.5 text-sm text-[#c7d5e0] hover:bg-[#2a475e] hover:text-white disabled:opacity-50 font-medium transition-all cursor-pointer"
            >
              <SteamIcon className="h-4 w-4 fill-current shrink-0" /> Continue with Steam
            </button>
            <button
              type="button"
              onClick={() => oauth("google")}
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-sm border border-border-strong bg-rail py-2 text-sm hover:bg-accent disabled:opacity-50 cursor-pointer"
            >
              <Chrome className="h-4 w-4" /> Continue with Google
            </button>
            <button
              type="button"
              onClick={() => oauth("apple")}
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-sm border border-border-strong bg-rail py-2 text-sm hover:bg-accent disabled:opacity-50 cursor-pointer"
            >
              <Apple className="h-4 w-4" /> Continue with Apple
            </button>
          </div>

          <div className="my-4 flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            or email
            <span className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={submit} className="space-y-3">
            <label className="block">
              <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                Email
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-sm border border-border bg-rail px-3 py-2 text-sm outline-none focus:border-primary"
                autoComplete="email"
              />
            </label>
            <label className="block">
              <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                Password
              </span>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-sm border border-border bg-rail px-3 py-2 text-sm outline-none focus:border-primary"
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
              />
            </label>
            <button
              type="submit"
              disabled={busy}
              className="mt-2 w-full rounded-sm bg-primary py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              {busy ? "…" : mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          <button
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="mt-4 w-full text-center text-xs text-muted-foreground hover:text-foreground"
          >
            {mode === "signin" ? "No account? Create one" : "Have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span className="text-right text-foreground">{value}</span>
    </div>
  );
}
