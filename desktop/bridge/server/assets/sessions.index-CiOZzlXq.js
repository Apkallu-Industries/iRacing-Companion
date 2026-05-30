import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useNavigate, Link } from "@tanstack/react-router";
import { useRef, useState, useEffect } from "react";
import { C as supabase, J as useAuth } from "./router-BaRGcILm.js";
import { A as AppHeader } from "./AppHeader-D6w9EARN.js";
import { Upload, Fingerprint, Clock, Flag, Car, MapPin, Trash2 } from "lucide-react";
import { p as parseIbtInWorker } from "./parseInWorker-XiXcG1jn.js";
import { e as extractCarSetupYaml } from "./setup-CA-YNL5H.js";
import { g as getFingerprintForPair, u as updateSessionFingerprintDelta, h as hasAnyFingerprint } from "./fingerprint.functions-YOm-UIzx.js";
import { toast } from "sonner";
import { d as deserializePwlap } from "./serialize-BAIrJMZ9.js";
import "@tanstack/react-query";
import "./charts-IpNGhCyp.js";
import "@supabase/supabase-js";
import "./tanstack-Jo4b3tUQ.js";
import "seroval";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "@tanstack/react-router/ssr/server";
import "zustand";
import "zustand/middleware";
import "zod";
import "./auth-middleware-xZM3BZWQ.js";
import "./schema-BU1MXGgz.js";
import "@radix-ui/react-dialog";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-tabs";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "./client.server-Y-0AANJ4.js";
import "@radix-ui/react-scroll-area";
import "./tts.functions-C1mSSPGY.js";
import "./BackButton-D1X33uYM.js";
import "./useRuntimeStatus-RFAV9_LD.js";
async function uploadAndIndexIbt(file, userId, onProgress) {
  onProgress?.("read", 0, "Reading file");
  const buf = await file.arrayBuffer();
  const parseBuf = buf.slice(0);
  const parsed = await parseIbtInWorker(parseBuf, onProgress);
  onProgress?.("upload", 95, "Uploading file");
  const path = `${userId}/${crypto.randomUUID()}-${file.name}`;
  const { error: upErr } = await supabase.storage.from("telemetry").upload(path, new Blob([buf]), { contentType: "application/octet-stream", upsert: false });
  if (upErr) throw upErr;
  onProgress?.("save", 98, "Saving metadata");
  const setupYaml = parsed.meta.sessionInfoYaml ? extractCarSetupYaml(parsed.meta.sessionInfoYaml) : null;
  const { data, error } = await supabase.from("telemetry_sessions").insert({
    user_id: userId,
    name: file.name,
    track: parsed.meta.trackDisplayName ?? parsed.meta.trackName ?? null,
    car: parsed.meta.carName ?? null,
    driver: parsed.meta.driverName ?? null,
    duration_s: parsed.meta.durationS,
    lap_count: parsed.laps.length,
    tick_rate: parsed.meta.tickRate,
    num_vars: parsed.meta.numVars,
    file_size: file.size,
    best_lap_s: parsed.meta.bestLapS ?? null,
    storage_path: path,
    recorded_at: new Date(file.lastModified).toISOString(),
    setup_yaml: setupYaml
  }).select("id").single();
  if (error) throw error;
  const track = parsed.meta.trackDisplayName ?? parsed.meta.trackName ?? null;
  const car = parsed.meta.carName ?? null;
  if (track && car && parsed.meta.bestLapS) {
    try {
      const r = await getFingerprintForPair({ data: { track, car } });
      if (r.fp) {
        const bestLap = parsed.meta.bestLapS;
        const delta = {
          track,
          car,
          thisBestS: +bestLap.toFixed(3),
          pbS: r.fp.best_ever_s,
          optimalS: r.fp.optimal_ever_s,
          vsPbS: +(bestLap - r.fp.best_ever_s).toFixed(3),
          vsOptimalS: r.fp.optimal_ever_s != null ? +(bestLap - r.fp.optimal_ever_s).toFixed(3) : null,
          sectorBests: r.fp.best_per_sector ?? null,
          computedAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        await updateSessionFingerprintDelta({ data: { sessionId: data.id, delta } });
      }
    } catch {
    }
  }
  onProgress?.("done", 100);
  return { sessionId: data.id };
}
function ImportPwlapButton() {
  const fileRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const handleFile = async (file) => {
    if (!file.name.toLowerCase().endsWith(".pwlap")) {
      toast.error("Please choose a .pwlap file");
      return;
    }
    if (!user) {
      toast.error("You must be signed in to import .pwlap sessions.");
      return;
    }
    setBusy(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pwlapFile = await deserializePwlap(arrayBuffer);
      if (!pwlapFile.valid) throw new Error("Invalid .pwlap file");
      const storagePath = `${user.id}/${crypto.randomUUID()}_imported.pwlap`;
      const { error: uploadErr } = await supabase.storage.from("telemetry").upload(storagePath, file);
      if (uploadErr)
        throw new Error("Failed to upload .pwlap file to storage: " + uploadErr.message);
      const { data: newSession, error: createErr } = await supabase.from("telemetry_sessions").insert({
        user_id: user.id,
        name: `Imported: ${pwlapFile.content.metadata.track}/${pwlapFile.content.metadata.car}`,
        track: pwlapFile.content.metadata.track,
        car: pwlapFile.content.metadata.car,
        recorded_at: pwlapFile.content.metadata.recorded_at,
        lap_count: pwlapFile.content.metadata.lap_count,
        best_lap_s: pwlapFile.content.metadata.best_lap_s,
        duration_s: pwlapFile.content.metadata.duration_s,
        storage_path: storagePath,
        source: "pwlap_import",
        file_size: file.size
      }).select("id").single();
      if (createErr || !newSession) {
        throw new Error(
          "Failed to create session record: " + (createErr?.message || "Unknown error")
        );
      }
      toast.success("Successfully imported .pwlap session.");
      navigate({ to: "/sessions/$id", params: { id: newSession.id } });
    } catch (e) {
      toast.error(`Import failed: ${e.message}`);
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: () => fileRef.current?.click(),
        disabled: busy,
        className: "flex items-center gap-2 rounded-sm border border-border bg-rail px-4 py-2 font-mono text-sm uppercase tracking-wider text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-50",
        children: [
          /* @__PURE__ */ jsx(Upload, { className: "h-4 w-4" }),
          " ",
          busy ? "Importing..." : "Import .pwlap"
        ]
      }
    ),
    /* @__PURE__ */ jsx(
      "input",
      {
        ref: fileRef,
        type: "file",
        accept: ".pwlap",
        className: "hidden",
        onChange: (e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }
      }
    )
  ] });
}
function fmtDuration(s) {
  if (!s) return "—";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
}
function fmtLap(s) {
  if (!s || s <= 0) return "—";
  const m = Math.floor(s / 60);
  const sec = (s - m * 60).toFixed(3);
  return `${m}:${sec.padStart(6, "0")}`;
}
function fmtSize(b) {
  if (!b) return "—";
  const mb = b / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
}
function SessionsPage() {
  const {
    user,
    loading
  } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(null);
  const fileRef = useRef(null);
  const [drag, setDrag] = useState(false);
  const [fpCount, setFpCount] = useState(null);
  const [sessionsLoaded, setSessionsLoaded] = useState(false);
  const redirected = useRef(false);
  useEffect(() => {
    if (!user) {
      setFpCount(null);
      return;
    }
    (async () => {
      try {
        const r = await hasAnyFingerprint();
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
    const {
      data,
      error
    } = await supabase.from("telemetry_sessions").select("*").order("created_at", {
      ascending: false
    });
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
  useEffect(() => {
    if (redirected.current) return;
    if (!user || !sessionsLoaded || busy) return;
    if (sessions.length > 0) return;
    const stay = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("stay") === "1";
    if (stay) return;
    redirected.current = true;
    navigate({
      to: "/live"
    });
  }, [user, sessionsLoaded, sessions.length, busy, navigate]);
  const handleFile = async (file) => {
    if (file.name.toLowerCase().endsWith(".pwlap")) {
      toast.error("Please use the Import .pwlap button for .pwlap files");
      return;
    }
    if (!file.name.toLowerCase().endsWith(".ibt")) {
      toast.error("Please choose an .ibt file");
      return;
    }
    if (!user) {
      toast.message("Open the Lab to analyze this file as a guest, or sign in to save it to your library.");
      navigate({
        to: "/lab/lapfile"
      });
      return;
    }
    setBusy(true);
    setProgress({
      phase: "read",
      pct: 0
    });
    try {
      const res = await uploadAndIndexIbt(file, user.id, (phase, pct, msg) => setProgress({
        phase,
        pct,
        msg
      }));
      toast.success("Telemetry indexed");
      navigate({
        to: "/sessions/$id",
        params: {
          id: res.sessionId
        }
      });
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
      setProgress(null);
    }
  };
  const handleDelete = async (s) => {
    if (!confirm(`Delete "${s.name}"?`)) return;
    await supabase.storage.from("telemetry").remove([s.storage_path]);
    const {
      error
    } = await supabase.from("telemetry_sessions").delete().eq("id", s.id);
    if (error) toast.error(error.message);
    else refresh();
  };
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-background text-foreground", children: [
    /* @__PURE__ */ jsxs(AppHeader, { children: [
      /* @__PURE__ */ jsx("span", { className: "font-mono uppercase tracking-wider", children: "Sessions" }),
      /* @__PURE__ */ jsx(Link, { to: "/live", className: "ml-3 text-muted-foreground hover:text-foreground", children: "Live" }),
      /* @__PURE__ */ jsx(Link, { to: "/lab/lapfile", className: "ml-3 text-muted-foreground hover:text-foreground", children: "Lapfile Lab" }),
      /* @__PURE__ */ jsx(Link, { to: "/fingerprint", className: "ml-3 text-muted-foreground hover:text-foreground", children: "Fingerprint" }),
      /* @__PURE__ */ jsx(Link, { to: "/how-it-works", className: "ml-3 text-muted-foreground hover:text-foreground", children: "How it works" }),
      user && /* @__PURE__ */ jsx("div", { className: "ml-3", children: /* @__PURE__ */ jsx(ImportPwlapButton, {}) })
    ] }),
    /* @__PURE__ */ jsxs("main", { className: "w-full max-w-none px-4 md:px-12 lg:px-16 p-6", children: [
      !loading && !user && /* @__PURE__ */ jsxs("div", { className: "hairline mb-6 flex flex-col gap-3 rounded-md bg-racing-orange/10 p-4 sm:flex-row sm:items-center sm:justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("div", { className: "font-mono text-sm", children: "You're browsing as a guest" }),
          /* @__PURE__ */ jsxs("p", { className: "mt-1 text-[12px] text-muted-foreground", children: [
            "Drop an ",
            /* @__PURE__ */ jsx("code", { className: "font-mono text-[11px]", children: ".ibt" }),
            " file to analyze it locally in the Lab, or open the live dashboard — nothing is saved. Sign in to keep your sessions, fingerprint and personal bests across devices."
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx(ImportPwlapButton, {}),
          /* @__PURE__ */ jsx(Link, { to: "/live", className: "rounded-sm border border-border bg-rail px-3 py-2 font-mono text-[11px] uppercase tracking-wider hover:bg-accent", children: "Live →" }),
          /* @__PURE__ */ jsx(Link, { to: "/auth", className: "rounded-sm bg-primary px-3 py-2 font-mono text-[11px] uppercase tracking-wider text-primary-foreground hover:opacity-90", children: "Sign in" })
        ] })
      ] }),
      fpCount === 0 && /* @__PURE__ */ jsxs("div", { className: "hairline mb-6 flex flex-col gap-3 rounded-md bg-primary/10 p-4 sm:flex-row sm:items-center sm:justify-between", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
          /* @__PURE__ */ jsx(Fingerprint, { className: "mt-0.5 h-5 w-5 text-primary" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { className: "font-mono text-sm", children: "Build your driver fingerprint" }),
            /* @__PURE__ */ jsxs("p", { className: "mt-1 text-[12px] text-muted-foreground", children: [
              "Point us at your",
              " ",
              /* @__PURE__ */ jsx("code", { className: "rounded-sm bg-rail px-1 font-mono text-[11px]", children: "Documents/iRacing/lapfiles" }),
              " ",
              "folder. We'll parse every ",
              /* @__PURE__ */ jsx("code", { className: "font-mono text-[11px]", children: ".olap" }),
              " /",
              " ",
              /* @__PURE__ */ jsx("code", { className: "font-mono text-[11px]", children: ".plap" }),
              " in your browser, store your PB per track + car, and use it to coach you live + compare every .ibt you upload from then on."
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx(Link, { to: "/fingerprint", className: "self-start whitespace-nowrap rounded-sm border border-border bg-primary/20 px-3 py-2 font-mono text-[11px] uppercase tracking-wider text-foreground hover:bg-primary/30 sm:self-auto", children: "Set it up →" })
      ] }),
      /* @__PURE__ */ jsxs("div", { onDragOver: (e) => {
        e.preventDefault();
        setDrag(true);
      }, onDragLeave: () => setDrag(false), onDrop: (e) => {
        e.preventDefault();
        setDrag(false);
        const f = e.dataTransfer.files?.[0];
        if (f) handleFile(f);
      }, onClick: () => fileRef.current?.click(), className: `hairline mb-6 flex cursor-pointer flex-col items-center justify-center rounded-sm bg-panel py-12 transition-colors ${drag ? "border-primary bg-accent" : "hover:bg-panel-2"}`, children: [
        /* @__PURE__ */ jsx(Upload, { className: "h-8 w-8 text-primary" }),
        /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm", children: busy ? /* @__PURE__ */ jsxs("span", { className: "font-mono", children: [
          progress?.phase,
          " · ",
          progress?.pct,
          "% ",
          progress?.msg ? `· ${progress.msg}` : ""
        ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
          "Drop an ",
          /* @__PURE__ */ jsx("span", { className: "font-mono text-primary", children: ".ibt" }),
          " or",
          " ",
          /* @__PURE__ */ jsx("span", { className: "font-mono text-primary", children: ".pwlap" }),
          " file or click to browse"
        ] }) }),
        busy && progress && /* @__PURE__ */ jsx("div", { className: "mt-3 h-1 w-72 overflow-hidden rounded-full bg-rail", children: /* @__PURE__ */ jsx("div", { className: "h-full bg-primary transition-all", style: {
          width: `${progress.pct}%`
        } }) }),
        busy && progress && progress.pct >= 90 && /* @__PURE__ */ jsx("p", { className: "mt-2 max-w-sm text-center font-mono text-[10px] uppercase tracking-wider text-muted-foreground/80", children: "Large .ibt files can sit at ~95% for a while while uploading and indexing. This is normal — don't close this tab." }),
        /* @__PURE__ */ jsx("input", { ref: fileRef, type: "file", accept: ".ibt,.pwlap", className: "hidden", onChange: (e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        } })
      ] }),
      sessions.length === 0 ? user ? /* @__PURE__ */ jsxs("div", { className: "hairline rounded-sm bg-panel p-8", children: [
        /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsx("h2", { className: "font-mono text-sm uppercase tracking-wider", children: "No .ibt yet — that's fine" }),
          /* @__PURE__ */ jsxs("p", { className: "mx-auto mt-2 max-w-xl text-[12px] text-muted-foreground", children: [
            "You don't need an ",
            /* @__PURE__ */ jsx("code", { className: "font-mono text-[11px]", children: ".ibt" }),
            " file to use Pit Wall. Jump on the live dashboard while you drive, try the Lab with a sample lap, or seed your driver fingerprint from your iRacing",
            " ",
            /* @__PURE__ */ jsx("code", { className: "font-mono text-[11px]", children: "lapfiles" }),
            " folder. Saved sessions will appear here once you upload an",
            " ",
            /* @__PURE__ */ jsx("code", { className: "font-mono text-[11px]", children: ".ibt" }),
            "."
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mx-auto mt-6 grid max-w-3xl gap-3 sm:grid-cols-3", children: [
          /* @__PURE__ */ jsxs(Link, { to: "/live", className: "hairline rounded-sm bg-rail p-4 text-center hover:border-primary", children: [
            /* @__PURE__ */ jsx("div", { className: "font-mono text-sm", children: "Live dashboard →" }),
            /* @__PURE__ */ jsx("p", { className: "mt-1 text-[11px] text-muted-foreground", children: "Real-time telemetry + AI coach. No file needed." })
          ] }),
          /* @__PURE__ */ jsxs(Link, { to: "/lab/lapfile", className: "hairline rounded-sm bg-rail p-4 text-center hover:border-primary", children: [
            /* @__PURE__ */ jsx("div", { className: "font-mono text-sm", children: "Lapfile Lab →" }),
            /* @__PURE__ */ jsxs("p", { className: "mt-1 text-[11px] text-muted-foreground", children: [
              "Drop a ",
              /* @__PURE__ */ jsx("code", { className: "font-mono text-[10px]", children: ".olap" }),
              " /",
              " ",
              /* @__PURE__ */ jsx("code", { className: "font-mono text-[10px]", children: ".plap" }),
              " to inspect."
            ] })
          ] }),
          /* @__PURE__ */ jsxs(Link, { to: "/fingerprint", className: "hairline rounded-sm bg-rail p-4 text-center hover:border-primary", children: [
            /* @__PURE__ */ jsx("div", { className: "font-mono text-sm", children: "Build fingerprint →" }),
            /* @__PURE__ */ jsx("p", { className: "mt-1 text-[11px] text-muted-foreground", children: "Sync your PBs from your lapfiles folder." })
          ] })
        ] })
      ] }) : /* @__PURE__ */ jsx("div", { className: "hairline rounded-sm bg-panel p-12 text-center text-sm text-muted-foreground", children: "Saved sessions appear here once you sign in. Guests can still analyze files in the Lab." }) : /* @__PURE__ */ jsx("div", { className: "grid gap-3 md:grid-cols-2 lg:grid-cols-3", children: sessions.map((s) => /* @__PURE__ */ jsxs("div", { className: "hairline group relative rounded-sm bg-panel p-4 hover:border-primary", children: [
        /* @__PURE__ */ jsxs(Link, { to: "/sessions/$id", params: {
          id: s.id
        }, className: "block", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsx("h3", { className: "truncate text-sm font-medium", children: s.track ?? "Unknown track" }),
              /* @__PURE__ */ jsx("p", { className: "mt-0.5 truncate text-xs text-muted-foreground", children: s.car ?? "—" })
            ] }),
            s.name?.toLowerCase().endsWith(".pwlap") ? /* @__PURE__ */ jsx("div", { className: "rounded-sm bg-racing-red/20 px-2 py-0.5 font-mono text-[10px] uppercase text-racing-red", children: "Live rec" }) : /* @__PURE__ */ jsxs("div", { className: "rounded-sm bg-rail px-2 py-0.5 font-mono text-[10px] uppercase text-muted-foreground", children: [
              s.tick_rate ?? "?",
              " Hz"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-4 grid grid-cols-2 gap-2 font-mono text-xs", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 text-muted-foreground", children: [
              /* @__PURE__ */ jsx(Clock, { className: "h-3 w-3" }),
              " ",
              fmtDuration(s.duration_s)
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 text-muted-foreground", children: [
              /* @__PURE__ */ jsx(Flag, { className: "h-3 w-3" }),
              " ",
              s.lap_count ?? 0,
              " laps"
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 text-muted-foreground", children: [
              /* @__PURE__ */ jsx(Car, { className: "h-3 w-3" }),
              " ",
              s.num_vars ?? 0,
              " vars"
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 text-primary", children: [
              /* @__PURE__ */ jsx(MapPin, { className: "h-3 w-3" }),
              " ",
              fmtLap(s.best_lap_s)
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-3 truncate text-[11px] text-muted-foreground", children: [
            s.name,
            " · ",
            fmtSize(s.file_size)
          ] })
        ] }),
        /* @__PURE__ */ jsx("button", { onClick: () => handleDelete(s), className: "absolute right-2 top-2 rounded-sm p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive hover:text-destructive-foreground group-hover:opacity-100", title: "Delete", children: /* @__PURE__ */ jsx(Trash2, { className: "h-3.5 w-3.5" }) })
      ] }, s.id)) })
    ] })
  ] });
}
export {
  SessionsPage as component
};
