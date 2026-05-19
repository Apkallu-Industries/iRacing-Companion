import { Link, useNavigate } from "@tanstack/react-router";
import { Activity, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { ThemeEditor } from "@/components/ThemeEditor";
import { LLMSettings } from "@/components/LLMSettings";
import { LocalDbSettings } from "@/components/LocalDbSettings";
import { BackButton } from "@/components/BackButton";
import { HeaderBreadcrumbs } from "@/components/HeaderBreadcrumbs";

export function AppHeader({ children }: { children?: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  return (
    <header className="hairline-b flex h-12 items-center bg-panel px-4">
      <BackButton />
      <Link to="/sessions" className="flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-sm bg-primary text-primary-foreground">
          <Activity className="h-3.5 w-3.5" />
        </div>
        <span className="font-mono text-xs tracking-wider">PIT WALL</span>
      </Link>
      <div className="mx-4 h-4 w-px bg-border" />
      <HeaderBreadcrumbs />
      <div className="mx-3 h-4 w-px bg-border hidden sm:block" />
      <div className="flex flex-1 items-center gap-3 text-xs text-muted-foreground">{children}</div>
      <div className="ml-auto flex items-center gap-3 text-xs text-muted-foreground">
        {user ? (
          <>
            <span className="font-mono">{user.email}</span>
            <LLMSettings />
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