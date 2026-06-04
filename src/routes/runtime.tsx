/**
 * /runtime — Pit Wall Workstation Runtime Initialization Page
 *
 * This is the first page loaded when the Electron desktop app launches
 * in Workstation Mode. It renders the RuntimeStatusMatrix boot sequence,
 * then redirects to the Landing Page once services settle — letting the
 * user select which workspace they want to open.
 *
 * In browser (non-Electron) context, this page immediately redirects to /
 * since the boot sequence is only meaningful in the native desktop context.
 */

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { RuntimeStatusMatrix } from "@/components/runtime/RuntimeStatusMatrix";

export const Route = createFileRoute("/runtime")({
  head: () => ({
    meta: [
      { title: "Pit Wall Workstation — Runtime Initialization" },
      {
        name: "description",
        content: "Pit Wall workstation runtime environment is initializing.",
      },
    ],
  }),
  component: RuntimePage,
});

function RuntimePage() {
  const navigate = useNavigate();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // In browser context (not Electron), skip immediately to /live
  const isElectron =
    typeof window !== "undefined" && window.navigator.userAgent.toLowerCase().includes("electron");

  useEffect(() => {
    if (isMounted && !isElectron) {
      navigate({ to: "/", replace: true });
    }
  }, [isMounted, isElectron, navigate]);

  // On the server or during initial client render before mount,
  // we render a consistent simple loading shell to prevent hydration mismatch.
  if (!isMounted) {
    return (
      <div
        className="flex h-full w-full items-center justify-center font-mono text-[10px] text-[#7A828C] select-none"
        style={{ backgroundColor: "#030508" }}
      >
        <span className="animate-pulse">INITIALIZING…</span>
      </div>
    );
  }

  if (!isElectron) {
    return (
      <div
        className="flex h-full w-full items-center justify-center font-mono text-[10px] text-[#7A828C] select-none"
        style={{ backgroundColor: "#030508" }}
      >
        <span className="animate-pulse">REDIRECTING…</span>
      </div>
    );
  }

  const handleReady = () => {
    // Navigate to the Landing Page once the runtime is confirmed ready,
    // allowing the user to select their workspace (Live Dash, Team Wall, etc.)
    navigate({ to: "/", replace: true });
  };

  return <RuntimeStatusMatrix onReady={handleReady} />;
}
