import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter, useLocation, useCanGoBack } from "@tanstack/react-router";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

function isTypingTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable;
}

export function KeyboardShortcuts() {
  const router = useRouter();
  const { pathname } = useLocation();
  const canGoBack = useCanGoBack();
  const [open, setOpen] = useState(false);
  const pendingG = useRef(false);
  const gTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goBackOrHome = useCallback(() => {
    if (pathname === "/") return;
    if (canGoBack) router.history.back();
    else router.navigate({ to: "/" });
  }, [canGoBack, pathname, router]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;

      // Workstation Keyboard-First Navigation Shortcuts: Ctrl+1 through Ctrl+4
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey) {
        if (e.key === "1") {
          e.preventDefault();
          router.navigate({ to: "/" });
          return;
        }
        if (e.key === "2") {
          e.preventDefault();
          router.navigate({ to: "/live" });
          return;
        }
        if (e.key === "3") {
          e.preventDefault();
          router.navigate({ to: "/sessions" });
          return;
        }
        if (e.key === "4") {
          e.preventDefault();
          router.navigate({ to: "/ai-engineer" });
          return;
        }
      }

      if (e.key === "?" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        setOpen(true);
        return;
      }

      if (e.key === "Escape") {
        if (open) {
          setOpen(false);
          return;
        }
        e.preventDefault();
        goBackOrHome();
        return;
      }

      if (e.key === "g" || e.key === "G") {
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        pendingG.current = true;
        if (gTimer.current) clearTimeout(gTimer.current);
        gTimer.current = setTimeout(() => {
          pendingG.current = false;
        }, 800);
        return;
      }

      if (pendingG.current && (e.key === "h" || e.key === "H")) {
        e.preventDefault();
        pendingG.current = false;
        if (gTimer.current) clearTimeout(gTimer.current);
        router.navigate({ to: "/" });
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      if (gTimer.current) clearTimeout(gTimer.current);
    };
  }, [goBackOrHome, open, router]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md font-mono text-sm bg-panel border border-border text-foreground">
        <DialogHeader>
          <DialogTitle className="font-mono text-xs uppercase tracking-wider text-primary">Workstation Shortcuts</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Fast keyboard-first controls. Disabled while typing in text inputs.
          </DialogDescription>
        </DialogHeader>
        <ul className="space-y-2 text-[11px] uppercase">
          <Shortcut keys={["Ctrl", "1"]} desc="Launcher Landing Page" />
          <Shortcut keys={["Ctrl", "2"]} desc="Live Telemetry Command" />
          <Shortcut keys={["Ctrl", "3"]} desc="Analysis Workbench" />
          <Shortcut keys={["Ctrl", "4"]} desc="AI Engineer Terminal" />
          <Shortcut keys={["Ctrl", ","]} desc="System Settings dialog" />
          <Shortcut keys={["Esc"]} desc="Go back / Exit panel" />
          <Shortcut keys={["?"]} desc="Open this helper card" />
        </ul>
      </DialogContent>
    </Dialog>
  );
}

function Shortcut({ keys, desc }: { keys: string[]; desc: string }) {
  return (
    <li className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{desc}</span>
      <span className="flex shrink-0 gap-1">
        {keys.map((k) => (
          <kbd
            key={k}
            className="rounded border border-border bg-rail px-1.5 py-0.5 text-[10px] uppercase text-foreground"
          >
            {k}
          </kbd>
        ))}
      </span>
    </li>
  );
}
