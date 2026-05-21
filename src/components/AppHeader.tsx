import { Link, useNavigate } from "@tanstack/react-router";
import { Activity, LogOut, Radio } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { ThemeEditor } from "@/components/ThemeEditor";
import { useBridgeStatus } from "@/lib/useBridgeStatus";

const NAV: Array<{ to: string; label: string; exact?: boolean }> = [
  { to: "/sessions", label: "Sessions" },
  { to: "/live", label: "Live" },
  { to: "/lab/lapfile", label: "Lab" },
  { to: "/fingerprint", label: "Fingerprint" },
];

export function AppHeader({ children }: { children?: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { connected } = useBridgeStatus();

  return (
    <header className="hairline-b flex h-12 items-center bg-panel px-4">
      <Link to="/sessions" className="flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-sm bg-primary text-primary-foreground">
          <Activity className="h-3.5 w-3.5" />
        </div>
        <span className="font-mono text-xs tracking-wider">APEXTRACE</span>
      </Link>

      <nav className="ml-4 flex items-center gap-1 text-xs">
        {NAV.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            activeProps={{ className: "bg-accent text-foreground" }}
            inactiveProps={{ className: "text-muted-foreground hover:text-foreground hover:bg-accent/50" }}
            activeOptions={{ exact: item.exact ?? false }}
            className="rounded-sm px-2 py-1 font-mono uppercase tracking-wider transition-colors"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="mx-3 h-4 w-px bg-border" />

      <div className="flex flex-1 items-center gap-3 text-xs text-muted-foreground">{children}</div>

      <div className="ml-auto flex items-center gap-3 text-xs text-muted-foreground">
        <Link
          to="/live"
          title={connected ? "Local iRacing bridge is connected" : "Local iRacing bridge offline — click to set up"}
          className={`flex items-center gap-1.5 rounded-sm px-2 py-1 font-mono uppercase tracking-wider transition-colors ${
            connected
              ? "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25"
              : "hover:bg-accent hover:text-foreground"
          }`}
        >
          <span className={`relative flex h-1.5 w-1.5`}>
            {connected && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            )}
            <span
              className={`relative inline-flex h-1.5 w-1.5 rounded-full ${
                connected ? "bg-emerald-400" : "bg-zinc-600"
              }`}
            />
          </span>
          <Radio className="h-3 w-3" />
          <span>{connected ? "Bridge live" : "Bridge off"}</span>
        </Link>
        {user ? (
          <>
            <span className="hidden font-mono md:inline">{user.email}</span>
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
