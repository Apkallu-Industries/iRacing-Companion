import { useRouter, useLocation, useCanGoBack, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

/**
 * Floating Back button shown on every page except the landing page ("/").
 * Uses router history when available, otherwise falls back to the home page.
 */
export function BackButton() {
  const router = useRouter();
  const location = useLocation();
  const canGoBack = useCanGoBack();

  // Don't show on the landing page — nowhere to go back to.
  if (location.pathname === "/") return null;

  const baseClass =
    "fixed left-3 top-14 z-50 inline-flex items-center gap-1.5 rounded-md border border-border bg-panel/90 px-2.5 py-1.5 text-xs font-medium text-foreground shadow-sm backdrop-blur hover:bg-accent hover:text-accent-foreground";

  if (canGoBack) {
    return (
      <button
        type="button"
        aria-label="Go back"
        className={baseClass}
        onClick={() => router.history.back()}
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back
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
