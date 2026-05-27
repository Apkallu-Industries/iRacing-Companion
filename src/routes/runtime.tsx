/**
 * /runtime — Pit Wall Workstation Runtime Initialization Page
 *
 * This is the first page loaded when the Electron desktop app launches
 * in Workstation Mode. It renders the RuntimeStatusMatrix boot sequence,
 * then redirects to the main Live dashboard once services settle.
 *
 * In browser (non-Electron) context, this page immediately redirects to /live
 * since the boot sequence is only meaningful in the native desktop context.
 */

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
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

  // In browser context (not Electron), skip immediately to /live
  const isElectron =
    typeof window !== "undefined" &&
    window.navigator.userAgent.toLowerCase().includes("electron");

  useEffect(() => {
    if (!isElectron) {
      navigate({ to: "/live", replace: true });
    }
  }, [isElectron, navigate]);

  // Don't render the matrix in browser — redirect will fire immediately
  if (!isElectron) {
    return (
      <div
        className="flex h-screen w-screen items-center justify-center font-mono text-[10px] text-[#7A828C] select-none"
        style={{ backgroundColor: "#030508" }}
      >
        <span className="animate-pulse">REDIRECTING…</span>
      </div>
    );
  }

  const handleReady = () => {
    // Navigate to the live dashboard once the runtime is confirmed ready
    navigate({ to: "/live", replace: true });
  };

  return <RuntimeStatusMatrix onReady={handleReady} />;
}
