import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Activity, LogOut, Settings, Users } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { ThemeEditor } from "@/components/ThemeEditor";
import { LLMSettings } from "@/components/LLMSettings";
import { LocalDbSettings } from "@/components/LocalDbSettings";
import { VoiceSettings } from "@/components/VoiceSettings";
import { BackButton } from "@/components/BackButton";
import { HeaderBreadcrumbs } from "@/components/HeaderBreadcrumbs";
import { useTelemetry } from "@/lib/useTelemetry";
import { RuntimeMonitor } from "@/components/runtime/RuntimeMonitor";

export function AppHeader({ children }: { children?: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const t = useTelemetry();
  const settingsActive = pathname === "/settings" || pathname.startsWith("/settings/");
  const teamActive = pathname === "/team";

  return (
    <header className="hairline-b flex h-12 items-center bg-panel px-4">
      <BackButton />
      <Link to="/sessions" className="flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-sm bg-primary text-primary-foreground">
          <Activity className="h-3.5 w-3.5" />
        </div>
        <span className="font-mono text-xs tracking-wider">APEXTRACE</span>
      </Link>
      <div className="mx-4 h-4 w-px bg-border" />
      <HeaderBreadcrumbs />
      <div className="mx-3 h-4 w-px bg-border hidden sm:block" />
      <div className="flex flex-1 items-center gap-3 text-xs text-muted-foreground">{children}</div>
      <div className="ml-auto flex items-center gap-4 text-xs text-muted-foreground">
        {/* Bridge status chip — visible on every page */}
        <Link
          to="/live"
          title={t.connected ? `Bridge live · ${t.track} · ${t.car}` : "Bridge offline — click to go to Live dashboard"}
          className="flex items-center gap-1.5 rounded-sm px-2 py-1 hover:bg-accent transition-all"
        >
          <span
            className={`size-1.5 rounded-full ${t.connected ? "bg-emerald-500 shadow-[0_0_6px_#22c55e] animate-pulse" : "bg-amber-500"}`}
          />
          <span className={`font-mono text-[10px] uppercase tracking-wider ${t.connected ? "text-emerald-400" : "text-amber-500"}`}>
            {t.connected ? `LIVE` : "SIM"}
          </span>
          {t.connected && (
            <span className="font-mono text-[10px] text-muted-foreground hidden lg:inline truncate max-w-36">
              {t.track}
            </span>
          )}
        </Link>
        {/* Runtime Monitor — Workstation service health indicator */}
        <RuntimeMonitor />
        <Link
          to="/team"
          className={`flex items-center gap-1.5 rounded-sm px-2 py-1 transition-all group ${
            teamActive
              ? "bg-primary/15 text-primary ring-1 ring-primary/40 font-semibold"
              : "hover:bg-accent hover:text-foreground text-muted-foreground"
          }`}
        >
          <Users className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary" />
          <span>Team</span>
        </Link>
        <Link
          to="/settings"
          className={`flex items-center gap-1.5 rounded-sm px-2 py-1 transition-all group ${
            settingsActive
              ? "bg-primary/15 text-primary ring-1 ring-primary/40 font-semibold"
              : "hover:bg-accent hover:text-foreground text-muted-foreground"
          }`}
        >
          <Settings
            className={`h-3.5 w-3.5 transition-transform duration-500 group-hover:rotate-90 ${settingsActive ? "text-primary" : "text-muted-foreground group-hover:text-primary"}`}
          />
          <span>Settings</span>
        </Link>
        {user ? (
          <>
            <span className="font-mono">{user.email}</span>
            <LLMSettings />
            <VoiceSettings />
            <LocalDbSettings />
            <ThemeEditor />
            <button
              className="flex items-center gap-1.5 rounded-sm px-2 py-1 hover:bg-accent hover:text-foreground"
              onClick={async () => {
                await signOut();
                navigate({ to: "/" });
              }}
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </button>
          </>
        ) : (
          <>
            <span className="font-mono uppercase tracking-wider text-racing-orange">Guest</span>
            <LLMSettings />
            <VoiceSettings />
            <LocalDbSettings />
            <ThemeEditor />
            <Link
              to="/auth"
              className="rounded-sm bg-primary px-2.5 py-1 font-medium text-primary-foreground hover:opacity-90"
            >
              Sign in
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
