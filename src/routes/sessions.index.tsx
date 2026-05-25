import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { AppHeader } from "@/components/AppHeader";
import { Upload, Trash2, Clock, Flag, Car, MapPin, Fingerprint } from "lucide-react";
import { uploadAndIndexIbt } from "@/lib/uploadIbt";
import { ImportPwlapButton } from "@/components/workbench/ImportPwlapButton";
import { hasAnyFingerprint } from "@/lib/fingerprint.functions";
import { toast } from "sonner";

type Sess = Tables<"telemetry_sessions">;

export const Route = createFileRoute("/sessions/")({
  head: () => ({
    meta: [
      { title: "Sessions — Pit Wall" },
      { name: "description", content: "Your uploaded iRacing telemetry sessions." },
    ],
  }),
  component: SessionsPage,
});

function fmtDuration(s?: number | null) {
  if (!s) return "—";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
}
function fmtLap(s?: number | null) {
  if (!s || s <= 0) return "—";
  const m = Math.floor(s / 60);
  const sec = (s - m * 60).toFixed(3);
  return `${m}:${sec.padStart(6, "0")}`;
}
function fmtSize(b?: number | null) {
  if (!b) return "—";
  const mb = b / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
}

function SessionsPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Sess[]>([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<{ phase: string; pct: number; msg?: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [fpCount, setFpCount] = useState<number | null>(null);
  const [sessionsLoaded, setSessionsLoaded] = useState(false);
  const redirected = useRef(false);

  useEffect(() => {
    if (!user) {
      setFpCount(null);
      return;
    }
    (async () => {
      try {
        const r = (await hasAnyFingerprint()) as { count: number };
        setFpCount(r.count);
      } catch {
        setFpCount(0);
      }
    })();
  }, [user]);

  const refresh = async () => {
    if (!user) {
      setSessions([]);
      setSessionsLoaded(true);
      return;
    }
    const { data, error } = await supabase
      .from("telemetry_sessions")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setSessions(data ?? []);
    setSessionsLoaded(true);
  };

  useEffect(() => {
    setSessionsLoaded(false);
    if (user) refresh();
    else {
      setSessions([]);
      setSessionsLoaded(true);
    }
  }, [user]);

  // Default to /live for signed-in users with no saved sessions yet.
  // Don't redirect if they explicitly came back via ?stay=1.
  useEffect(() => {
    if (redirected.current) return;
    if (!user || !sessionsLoaded || busy) return;
    if (sessions.length > 0) return;
    const stay = typeof window !== "undefined"
      && new URLSearchParams(window.location.search).get("stay") === "1";
    if (stay) return;
    redirected.current = true;
    navigate({ to: "/live" });
  }, [user, sessionsLoaded, sessions.length, busy, navigate]);

  const handleFile = async (file: File) => {
    if (file.name.toLowerCase().endsWith(".pwlap")) {
      // Let ImportPwlapButton handle it conceptually, but we can do it here if we want.
      toast.error("Please use the Import .pwlap button for .pwlap files");
      return;
    }
    if (!file.name.toLowerCase().endsWith(".ibt")) {
      toast.error("Please choose an .ibt file");
      return;
    }
    if (!user) {
      toast.message("Open the Lab to analyze this file as a guest, or sign in to save it to your library.");
      navigate({ to: "/lab/lapfile" });
      return;
    }
    setBusy(true);
    setProgress({ phase: "read", pct: 0 });
    try {
      const res = await uploadAndIndexIbt(file, user.id, (phase, pct, msg) => setProgress({ phase, pct, msg }));
      toast.success("Telemetry indexed");
      navigate({ to: "/sessions/$id", params: { id: res.sessionId } });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
      setProgress(null);
    }
  };

  const handleDelete = async (s: Sess) => {
    if (!confirm(`Delete "${s.name}"?`)) return;
    await supabase.storage.from("telemetry").remove([s.storage_path]);
    const { error } = await supabase.from("telemetry_sessions").delete().eq("id", s.id);
    if (error) toast.error(error.message);
    else refresh();
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader>
        <span className="font-mono uppercase tracking-wider">Sessions</span>
        <Link to="/live" className="ml-3 text-muted-foreground hover:text-foreground">
          Live
        </Link>
        <Link to="/lab/lapfile" className="ml-3 text-muted-foreground hover:text-foreground">
          Lapfile Lab
        </Link>
        <Link to="/fingerprint" className="ml-3 text-muted-foreground hover:text-foreground">
          Fingerprint
        </Link>
        <Link to="/how-it-works" className="ml-3 text-muted-foreground hover:text-foreground">
          How it works
        </Link>
      </AppHeader>

      <main className="mx-auto max-w-7xl p-6">
        {/* Guest banner */}
        {!loading && !user && (
          <div className="hairline mb-6 flex flex-col gap-3 rounded-md bg-racing-orange/10 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="font-mono text-sm">You're browsing as a guest</div>
              <p className="mt-1 text-[12px] text-muted-foreground">
                Drop an <code className="font-mono text-[11px]">.ibt</code> file to analyze it locally in the Lab,
                or open the live dashboard — nothing is saved.
                Sign in to keep your sessions, fingerprint and personal bests across devices.
              </p>
            </div>
            <div className="flex gap-2">
              <ImportPwlapButton />
              <Link
                to="/live"
                className="rounded-sm border border-border bg-rail px-3 py-2 font-mono text-[11px] uppercase tracking-wider hover:bg-accent"
              >
                Live →
              </Link>
              <Link
                to="/auth"
                className="rounded-sm bg-primary px-3 py-2 font-mono text-[11px] uppercase tracking-wider text-primary-foreground hover:opacity-90"
              >
                Sign in
              </Link>
            </div>
          </div>
        )}

        {/* Onboarding: build fingerprint */}
        {fpCount === 0 && (
          <div className="hairline mb-6 flex flex-col gap-3 rounded-md bg-primary/10 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <Fingerprint className="mt-0.5 h-5 w-5 text-primary" />
              <div>
                <div className="font-mono text-sm">Build your driver fingerprint</div>
                <p className="mt-1 text-[12px] text-muted-foreground">
                  Point us at your <code className="rounded-sm bg-rail px-1 font-mono text-[11px]">Documents/iRacing/lapfiles</code> folder.
                  We'll parse every <code className="font-mono text-[11px]">.olap</code> / <code className="font-mono text-[11px]">.plap</code> in your browser,
                  store your PB per track + car, and use it to coach you live + compare every .ibt you upload from then on.
                </p>
              </div>
            </div>
            <Link
              to="/fingerprint"
              className="self-start whitespace-nowrap rounded-sm border border-border bg-primary/20 px-3 py-2 font-mono text-[11px] uppercase tracking-wider text-foreground hover:bg-primary/30 sm:self-auto"
            >
              Set it up →
            </Link>
          </div>
        )}

        {/* Upload zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            const f = e.dataTransfer.files?.[0];
            if (f) handleFile(f);
          }}
          onClick={() => fileRef.current?.click()}
          className={`hairline mb-6 flex cursor-pointer flex-col items-center justify-center rounded-sm bg-panel py-12 transition-colors ${drag ? "border-primary bg-accent" : "hover:bg-panel-2"}`}
        >
          <Upload className="h-8 w-8 text-primary" />
          <p className="mt-3 text-sm">
            {busy ? (
              <span className="font-mono">
                {progress?.phase} · {progress?.pct}% {progress?.msg ? `· ${progress.msg}` : ""}
              </span>
            ) : (
              <>Drop an <span className="font-mono text-primary">.ibt</span> or <span className="font-mono text-primary">.pwlap</span> file or click to browse</>
            )}
          </p>
          {busy && progress && (
            <div className="mt-3 h-1 w-72 overflow-hidden rounded-full bg-rail">
              <div className="h-full bg-primary transition-all" style={{ width: `${progress.pct}%` }} />
            </div>
          )}
          {busy && progress && progress.pct >= 90 && (
            <p className="mt-2 max-w-sm text-center font-mono text-[10px] uppercase tracking-wider text-muted-foreground/80">
              Large .ibt files can sit at ~95% for a while while uploading and
              indexing. This is normal — don't close this tab.
            </p>
          )}
          <input
            ref={fileRef}
            type="file"
            accept=".ibt,.pwlap"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
              e.target.value = "";
            }}
          />
        </div>

        {/* Sessions grid */}
        {sessions.length === 0 ? (
          user ? (
            <div className="hairline rounded-sm bg-panel p-8">
              <div className="text-center">
                <h2 className="font-mono text-sm uppercase tracking-wider">No .ibt yet — that's fine</h2>
                <p className="mx-auto mt-2 max-w-xl text-[12px] text-muted-foreground">
                  You don't need an <code className="font-mono text-[11px]">.ibt</code> file to use Pit Wall.
                  Jump on the live dashboard while you drive, try the Lab with a sample lap,
                  or seed your driver fingerprint from your iRacing <code className="font-mono text-[11px]">lapfiles</code> folder.
                  Saved sessions will appear here once you upload an <code className="font-mono text-[11px]">.ibt</code>.
                </p>
              </div>
              <div className="mx-auto mt-6 grid max-w-3xl gap-3 sm:grid-cols-3">
                <Link
                  to="/live"
                  className="hairline rounded-sm bg-rail p-4 text-center hover:border-primary"
                >
                  <div className="font-mono text-sm">Live dashboard →</div>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Real-time telemetry + AI coach. No file needed.
                  </p>
                </Link>
                <Link
                  to="/lab/lapfile"
                  className="hairline rounded-sm bg-rail p-4 text-center hover:border-primary"
                >
                  <div className="font-mono text-sm">Lapfile Lab →</div>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Drop a <code className="font-mono text-[10px]">.olap</code> / <code className="font-mono text-[10px]">.plap</code> to inspect.
                  </p>
                </Link>
                <Link
                  to="/fingerprint"
                  className="hairline rounded-sm bg-rail p-4 text-center hover:border-primary"
                >
                  <div className="font-mono text-sm">Build fingerprint →</div>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Sync your PBs from your lapfiles folder.
                  </p>
                </Link>
              </div>
            </div>
          ) : (
            <div className="hairline rounded-sm bg-panel p-12 text-center text-sm text-muted-foreground">
              Saved sessions appear here once you sign in. Guests can still analyze files in the Lab.
            </div>
          )
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {sessions.map((s) => (
              <div key={s.id} className="hairline group relative rounded-sm bg-panel p-4 hover:border-primary">
                <Link to="/sessions/$id" params={{ id: s.id }} className="block">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-medium">{s.track ?? "Unknown track"}</h3>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">{s.car ?? "—"}</p>
                    </div>
                    {s.name?.toLowerCase().endsWith(".pwlap") ? (
                      <div className="rounded-sm bg-racing-red/20 px-2 py-0.5 font-mono text-[10px] uppercase text-racing-red">
                        Live rec
                      </div>
                    ) : (
                      <div className="rounded-sm bg-rail px-2 py-0.5 font-mono text-[10px] uppercase text-muted-foreground">
                        {s.tick_rate ?? "?"} Hz
                      </div>
                    )}
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2 font-mono text-xs">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock className="h-3 w-3" /> {fmtDuration(s.duration_s)}
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Flag className="h-3 w-3" /> {s.lap_count ?? 0} laps
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Car className="h-3 w-3" /> {s.num_vars ?? 0} vars
                    </div>
                    <div className="flex items-center gap-1.5 text-primary">
                      <MapPin className="h-3 w-3" /> {fmtLap(s.best_lap_s)}
                    </div>
                  </div>
                  <div className="mt-3 truncate text-[11px] text-muted-foreground">{s.name} · {fmtSize(s.file_size)}</div>
                </Link>
                <button
                  onClick={() => handleDelete(s)}
                  className="absolute right-2 top-2 rounded-sm p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive hover:text-destructive-foreground group-hover:opacity-100"
                  title="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}