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
    "mr-3 inline-flex items-center gap-1.5 rounded-md border border-border bg-rail/60 px-2 py-1 text-xs font-mono uppercase tracking-wider text-zinc-400 hover:bg-accent hover:text-zinc-100 transition-colors";

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
