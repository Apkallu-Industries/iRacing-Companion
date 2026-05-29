import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Circle, Square, Save, Trash2 } from "lucide-react";
import type { Telemetry } from "@/lib/telemetry-types";
import { useLiveRecorder } from "@/lib/liveRecorder";
import { useAuth } from "@/lib/auth";
import { useWorkbench } from "@/lib/store";

function fmtElapsed(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
}

/**
 * Recording controls for live sessions. Captures the live telemetry stream
 * into a .pwlap file (Pit Wall's own .ibt-equivalent) so a driver without a
 * real iRacing .ibt can still build a session library to compare against
 * later.
 */
export function RecordingControls({ t }: { t: Telemetry }) {
  const { state, sampleCount, elapsed, channelCount, save, start, stop, reset } =
    useLiveRecorder(t);
  const { user } = useAuth();
  const navigate = useNavigate();
  const setPendingLocalBlob = useWorkbench((s) => s.setPendingLocalBlob);
  const [pulse, setPulse] = useState(false);

  const onStart = () => {
    start();
    setPulse(true);
    setTimeout(() => setPulse(false), 600);
    toast.success("Recording live telemetry");
  };

  const onSave = async () => {
    try {
      const res = await save(user?.id ?? null);
      if (res.sessionId) {
        toast.success("Session saved");
        navigate({ to: "/sessions/$id", params: { id: res.sessionId } });
      } else {
        toast.message("Recording downloaded", {
          description: "Sign in to save it to your library.",
        });
        // Keep the blob in memory only for guest recordings so the session can open immediately.
        if (res.blob) setPendingLocalBlob(res.blob);
      }
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <div className="rounded-lg bg-panel-2 ring-1 ring-white/5 p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[10px] uppercase tracking-[0.2em] text-foreground font-medium">
          Session recording
        </h2>
        <div className="flex items-center gap-2">
          <span
            className={`size-2 rounded-full ${
              state === "recording" ? "bg-racing-red animate-pulse" : "bg-zinc-700"
            } ${pulse ? "scale-150 transition-transform" : ""}`}
          />
          <span className="text-[10px] font-mono uppercase text-foreground">
            {state === "recording"
              ? "REC"
              : state === "saving"
                ? "SAVING"
                : sampleCount > 0
                  ? "STOPPED"
                  : "READY"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 font-mono text-xs mb-4">
        <Stat label="ELAPSED" value={fmtElapsed(elapsed)} />
        <Stat label="SAMPLES" value={sampleCount.toLocaleString()} />
        <Stat label="CHANNELS" value={String(channelCount)} />
        <Stat label="SOURCE" value={t.source.toUpperCase()} />
      </div>

      <div className="flex flex-wrap gap-2">
        {state !== "recording" ? (
          <button
            onClick={onStart}
            disabled={state === "saving"}
            className="inline-flex items-center gap-1.5 rounded-md bg-racing-red/20 hover:bg-racing-red/30 text-racing-red px-3 py-1.5 text-xs font-mono uppercase tracking-wider disabled:opacity-40"
          >
            <Circle className="h-3.5 w-3.5 fill-current" />
            {sampleCount > 0 ? "New recording" : "Start recording"}
          </button>
        ) : (
          <button
            onClick={stop}
            className="inline-flex items-center gap-1.5 rounded-md bg-accent hover:bg-zinc-700 text-foreground px-3 py-1.5 text-xs font-mono uppercase tracking-wider"
          >
            <Square className="h-3.5 w-3.5 fill-current" />
            Stop
          </button>
        )}

        <button
          onClick={onSave}
          disabled={state !== "idle" || sampleCount === 0}
          className="inline-flex items-center gap-1.5 rounded-md bg-racing-green/20 hover:bg-racing-green/30 text-racing-green px-3 py-1.5 text-xs font-mono uppercase tracking-wider disabled:opacity-40"
        >
          <Save className="h-3.5 w-3.5" />
          {user ? "Save to library" : "Download .pwlap"}
        </button>

        {sampleCount > 0 && state === "idle" && (
          <button
            onClick={reset}
            className="inline-flex items-center gap-1.5 rounded-md ring-1 ring-border hover:bg-muted text-muted-foreground px-3 py-1.5 text-xs font-mono uppercase tracking-wider"
            title="Discard"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Discard
          </button>
        )}
      </div>

      {!user && sampleCount > 0 && (
        <p className="mt-3 text-[10px] text-muted-foreground">
          Signed-out recordings download as <code className="font-mono">.pwlap</code> files only.
          Sign in to save them to your library.
        </p>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-muted/60 rounded p-2">
      <p className="text-[9px] text-muted-foreground uppercase">{label}</p>
      <p className="text-sm tabular-nums">{value}</p>
    </div>
  );
}
