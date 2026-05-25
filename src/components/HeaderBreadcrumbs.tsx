import { Link, useLocation, useParams } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

type Crumb = { label: string; to?: string };

function crumbsForPath(pathname: string, params: Record<string, string>): Crumb[] {
  if (pathname === "/") return [];
  if (pathname === "/live") return [{ label: "Live", to: "/live" }];
  if (pathname === "/sessions") return [{ label: "Sessions", to: "/sessions" }];
  if (pathname.startsWith("/sessions/") && params.id) {
    return [{ label: "Sessions", to: "/sessions" }, { label: "Workbench" }];
  }
  if (pathname === "/fingerprint") return [{ label: "Fingerprint", to: "/fingerprint" }];
  if (pathname === "/auth") return [{ label: "Sign in" }];
  if (pathname === "/roadmap") return [{ label: "Roadmap", to: "/roadmap" }];
  if (pathname === "/admin") return [{ label: "Admin" }];
  if (pathname === "/how-it-works") return [{ label: "How it works", to: "/how-it-works" }];
  if (pathname.startsWith("/share/")) return [{ label: "Shared lap" }];
  if (pathname.startsWith("/lab/")) return [{ label: "Lab", to: "/lab/lapfile" }];
  return [{ label: pathname.replace(/^\//, "") || "Page" }];
}

export function HeaderBreadcrumbs() {
  const { pathname } = useLocation();
  const params = useParams({ strict: false }) as Record<string, string>;
  const crumbs = crumbsForPath(pathname, params);

  if (crumbs.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className="hidden sm:flex items-center gap-1 text-[11px] font-mono text-muted-foreground"
    >
      <Link to="/" className="hover:text-foreground transition-colors">
        Home
      </Link>
      {crumbs.map((c, i) => (
        <span key={`${c.label}-${i}`} className="flex items-center gap-1">
          <ChevronRight className="h-3 w-3 opacity-50" />
          {c.to && i < crumbs.length - 1 ? (
            <Link to={c.to} className="hover:text-foreground transition-colors">
              {c.label}
            </Link>
          ) : (
            <span className="text-foreground/90">{c.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
