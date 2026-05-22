import { useRouter, useLocation, useCanGoBack } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

/**
 * Back button shown on every page except the landing page ("/").
 * Integrated into the header — uses router history when available.
 */
export function BackButton() {
  const router = useRouter();
  const location = useLocation();
  const canGoBack = useCanGoBack();

  // Don't show on the landing page — nowhere to go back to.
  if (location.pathname === "/") return null;

  const baseClass =
    "inline-flex items-center gap-1.5 rounded-sm px-2 py-1 text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors";

  if (canGoBack) {
    return (
      <button
        type="button"
        aria-label="Go back"
        className={baseClass}
        onClick={() => router.history.back()}
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        BACK
      </button>
    );
  }

  return (
    <Link to="/" aria-label="Go home" className={baseClass}>
      <ArrowLeft className="h-3.5 w-3.5" />
      Home
    </Link>
  );
}
