import { Download, Terminal, Wifi } from "lucide-react";

/**
 * Install instructions for the local iRacing → WebSocket bridge.
 * Rendered on /live when the WebSocket can't reach localhost:3001 so a
 * brand-new user without an .ibt file or a running bridge still has a clear
 * next step.
 */
export function BridgeInstall() {
  return (
    <div className="rounded-lg bg-zinc-925 ring-1 ring-racing-orange/40 p-5">
      <div className="flex items-center gap-2 mb-3">
        <Wifi className="h-4 w-4 text-racing-orange" />
        <h2 className="text-[11px] uppercase tracking-[0.2em] text-racing-orange font-medium">
          Bridge offline — running on simulator
        </h2>
      </div>
      <p className="text-xs text-zinc-300 leading-relaxed">
        Pit Wall reads iRacing through a tiny local helper that exposes the
        SDK over <code className="font-mono text-[11px]">ws://localhost:3001</code>.
        Pick the desktop app for a single double-click install, or grab the
        bridge-only zip if you prefer to run it yourself.
      </p>

      {/* Primary option: bundled desktop app */}
      <div className="mt-4 rounded-md bg-zinc-900/70 ring-1 ring-racing-green/30 p-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-racing-green font-mono">
              Pit Wall Desktop
            </div>
            <div className="mt-0.5 text-[11px] text-zinc-400">
              Bundled bridge + native dashboard window · Windows x64 · ~110 MB
            </div>
          </div>
          <a
            href="/downloads/pit-wall-desktop-win-x64.zip"
            className="inline-flex items-center gap-1.5 rounded-md bg-racing-green/20 hover:bg-racing-green/30 text-racing-green px-3 py-1.5 text-xs font-mono uppercase tracking-wider whitespace-nowrap"
          >
            <Download className="h-3.5 w-3.5" />
            Download
          </a>
        </div>
        <ol className="mt-3 space-y-1 text-[11px] text-zinc-400">
          <li>1. Unzip anywhere.</li>
          <li>2. Run <code className="font-mono text-zinc-300">Pit Wall Desktop.exe</code> — bridge starts automatically.</li>
          <li>3. Jump in iRacing — live data flows the moment you load a session.</li>
        </ol>
      </div>

      {/* Secondary option: bridge-only zip */}
      <div className="mt-3 flex items-center justify-between gap-3 rounded-md bg-zinc-900/40 ring-1 ring-zinc-800 p-3">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-zinc-300 font-mono">
            Bridge only
          </div>
          <div className="mt-0.5 text-[11px] text-zinc-500">
            Node-only zip · ~13 KB · for advanced users who already have Node 20+
          </div>
        </div>
        <a
          href="/downloads/pit-wall-bridge.zip"
          className="inline-flex items-center gap-1.5 rounded-md ring-1 ring-zinc-800 hover:bg-zinc-900 text-zinc-300 px-3 py-1.5 text-xs font-mono uppercase tracking-wider whitespace-nowrap"
        >
          <Terminal className="h-3.5 w-3.5" />
          Get bridge
        </a>
      </div>

      <p className="mt-3 text-[10px] text-zinc-300/70">
        No bridge? No problem — the dashboard runs on simulated telemetry so
        you can still try out the AI coach and recording.
      </p>
    </div>
  );
}
