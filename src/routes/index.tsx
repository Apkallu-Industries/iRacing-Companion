/* eslint-disable react-refresh/only-export-components */
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  Gauge,
  LineChart,
  Terminal as TerminalIcon,
  Wifi,
  Cpu,
  Settings as SettingsIcon,
  Sparkles,
  Database,
  GraduationCap,
  BookOpen,
  LogIn,
  Sliders,
  ChevronRight,
  ShieldCheck,
  Clock,
  Car,
  MapPin,
  RefreshCw,
  Users,
  Rocket,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useWorkbench } from "@/lib/store";

type Sess = Tables<"telemetry_sessions">;

type PitWallRuntime = {
  getRuntimeManifest?: () => Promise<RuntimeManifest>;
  ensureMongoDB?: () => Promise<void>;
  restartBridge?: () => Promise<void>;
  refreshAiMode?: () => Promise<void>;
};

type RuntimeManifest = {
  // Basic system info
  appVersion?: string;
  hostname?: string;
  platform?: string;
  arch?: string;
  cpuModel?: string;
  cpuCores?: number;
  gpuModel?: string;

  // Memory and GPU
  totalRamGb?: number | string;
  freeRamGb?: number | string;
  vramGb?: number | string;

  // Daemon/status
  mongoStatus?: "active" | string;
  bridgeStatus?: string | boolean | string;
  aiMode?: string;

  // Uptime
  uptimeSec?: number;
};

declare global {
  interface Window {
    pitWallRuntime?: PitWallRuntime;
  }
}

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pit Wall — Motorsport Engineering & Lap Analysis" },
      {
        name: "description",
        content:
          "Motorsport engineering command center. Stream live telemetry at 60Hz and analyze laps with professional stacked traces and AI strategies.",
      },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  const { user } = useAuth();
  const [pulse, setPulse] = useState(true);
  const [bridgeConnected, setBridgeConnected] = useState(false);
  const [recentSessions, setRecentSessions] = useState<Sess[]>([]);

  const activeGame = useWorkbench((state) => state.activeGame);
  const setActiveGame = useWorkbench((state) => state.setActiveGame);

  const handleGameSelect = async (game: "iracing" | "assettocorsa") => {
    setActiveGame(game);
    try {
      await fetch("http://localhost:3001/api/game/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ game }),
      });
      console.log(`[Landing] Synergized bridge config for ${game}`);
    } catch (err) {
      console.warn("[Landing] Local bridge not reachable for game configuration update:", err);
    }
  };

  const isElectron =
    typeof window !== "undefined" &&
    (window.pitWallRuntime !== undefined ||
      window.navigator.userAgent.toLowerCase().includes("electron"));

  const [manifest, setManifest] = useState<RuntimeManifest | null>(null);

  // Poll manifest in Electron mode
  useEffect(() => {
    if (!isElectron) return;
    const fetchManifest = async () => {
      try {
        if (window.pitWallRuntime?.getRuntimeManifest) {
          const m = await window.pitWallRuntime.getRuntimeManifest();
          setManifest(m);
        }
      } catch (err) {
        console.warn("Failed to fetch manifest", err);
      }
    };
    fetchManifest();
    const interval = setInterval(fetchManifest, 3000);
    return () => clearInterval(interval);
  }, [isElectron]);

  // Poll local bridge status
  useEffect(() => {
    const checkBridge = async () => {
      try {
        const res = await fetch("http://localhost:3001/api/license").catch(() => null);
        setBridgeConnected(res ? res.ok : false);
      } catch {
        setBridgeConnected(false);
      }
    };
    checkBridge();
    const interval = setInterval(checkBridge, 5000);
    return () => clearInterval(interval);
  }, []);

  // Fetch recent sessions
  useEffect(() => {
    if (!user) return;
    const fetchRecent = async () => {
      const { data, error } = await supabase
        .from("telemetry_sessions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(3);
      if (!error && data) {
        setRecentSessions(data);
      }
    };
    fetchRecent();
  }, [user]);

  // Pulsing system status
  useEffect(() => {
    const interval = setInterval(() => {
      setPulse((prev) => !prev);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const openSettings = () => {
    document.getElementById("global-settings-trigger")?.click();
  };

  const fmtLapTime = (s?: number | null) => {
    if (!s || s <= 0) return "--:--.---";
    const m = Math.floor(s / 60);
    const sec = (s - m * 60).toFixed(3);
    return `${m}:${sec.padStart(6, "0")}`;
  };

  // Determine LLM Recommendation based on detected RAM and VRAM
  const systemRam = manifest?.totalRamGb ? parseFloat(String(manifest.totalRamGb)) : 16;
  const systemVram = manifest?.vramGb ? parseFloat(String(manifest.vramGb)) : 0;

  let recommendedLlmName = "Cloud API Mode (OpenAI/Anthropic)";
  let recommendedLlmUrl = "#";
  let recommendedLlmLinkText = "Configure Cloud API →";
  let recommendedLlmDesc =
    "Local models smaller than 7B parameters lack native tool-use & strategic reasoning capabilities. Cloud Mode is recommended to prevent telemetry pipeline failures.";

  if (systemRam >= 64 && systemVram >= 16) {
    recommendedLlmName = "Qwen-2.5-72B-Instruct (Q4_K_M)";
    recommendedLlmUrl = "https://huggingface.co/lmstudio-community/Qwen2.5-72B-Instruct-GGUF";
    recommendedLlmLinkText = "Download GGUF →";
    recommendedLlmDesc =
      "Elite-tier offline strategy & tool use. Runs fully offline with 72B parameter reasoning using 48GB System RAM and 16GB VRAM.";
  } else if (systemRam >= 32 && systemVram >= 12) {
    recommendedLlmName = "Qwen-2.5-14B-Instruct (Q4_K_M)";
    recommendedLlmUrl = "https://huggingface.co/lmstudio-community/Qwen2.5-14B-Instruct-GGUF";
    recommendedLlmLinkText = "Download GGUF →";
    recommendedLlmDesc =
      "Perfect balance of speed and outstanding native tool-calling strategy. Fits comfortably inside 12GB VRAM.";
  } else if (systemRam >= 16 && systemVram >= 6) {
    recommendedLlmName = "Qwen-2.5-7B-Instruct (Q4_K_M)";
    recommendedLlmUrl = "https://huggingface.co/lmstudio-community/Qwen2.5-7B-Instruct-GGUF";
    recommendedLlmLinkText = "Download GGUF →";
    recommendedLlmDesc =
      "Extremely reliable tool-use and telemetry formatting for standard consumer rigs with >= 6GB VRAM.";
  }

  return (
    <main className="min-h-screen bg-[#05070A] text-[#E2E4E8] font-mono selection:bg-[#3B82F6]/30 selection:text-white overflow-x-hidden relative flex flex-col justify-between">
      {/* ── METADATA CARBON BACKGROUND GRID ── */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#11161D_1px,transparent_1px),linear-gradient(to_bottom,#11161D_1px,transparent_1px)] bg-size-[3rem_3rem] opacity-[0.15] pointer-events-none z-0" />

      {/* ── TOP NAV / WORKSTATION HEADER ── */}
      <nav className="border-b border-[#1C2430] bg-[#0B0F14]/90 backdrop-blur sticky top-0 px-6 py-2.5 flex items-center justify-between z-10 select-none">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-sans font-black italic tracking-tighter text-lg text-white">
              PIT WALL
            </span>
            <span className="text-[9px] font-mono tracking-widest text-[#7A828C] bg-[#11161D] px-2 py-0.5 border border-[#1C2430]">
              v2.10.4-LOCKED
            </span>
          </div>
          <span className="text-[8px] font-mono tracking-[0.25em] text-[#7A828C] font-bold uppercase mt-0.5">
            MOTORSPORT TELEMETRY SYSTEM
          </span>
        </div>

        {/* System Status and Local Bridge Hook Info */}
        <div className="flex items-center gap-6">
          {/* WebSocket Status Indicator */}
          <div className="hidden md:flex items-center gap-3 border border-[#1C2430] bg-[#11161D] px-3.5 py-1">
            <span className="text-[8px] font-mono tracking-widest text-[#7A828C] font-bold uppercase">
              BRIDGE PORT
            </span>
            <span className="text-[9px] font-mono text-[#3B82F6] font-bold tracking-wider">
              ws://127.0.0.1:3001
            </span>
          </div>

          <div className="border border-[#00D17F]/20 bg-[#00D17F]/5 px-3.5 py-1 flex items-center gap-2">
            <span className="text-[8px] font-mono tracking-widest text-[#7A828C] uppercase font-bold">
              SYS STATUS
            </span>
            <span className="flex items-center gap-1.5">
              <span
                className={`h-1.5 w-1.5 rounded-full bg-[#00D17F] shadow-[0_0_8px_#00D17F] ${pulse ? "animate-ping" : ""}`}
              />
              <span className="text-[8px] font-mono text-[#00D17F] font-black tracking-widest">
                OPERATIONAL
              </span>
            </span>
          </div>
        </div>
      </nav>

      {/* ── HERO BANNER SECTION (Desktop Workstation Hub vs Web Marketing) ── */}
      <section className="w-full max-w-none px-4 md:px-12 lg:px-16 pt-6 relative z-10 select-none">
        {isElectron ? (
          <div className="border border-[#1C2430] bg-[#0B0F14] overflow-hidden rounded-sm flex flex-col lg:flex-row items-stretch gap-6 p-6 md:p-8 relative">
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#3B82F6] opacity-[0.06] rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#00D17F] opacity-[0.04] rounded-full blur-[100px] pointer-events-none" />

            {/* Left Hero Content */}
            <div className="flex-1 flex flex-col items-start justify-between gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-mono tracking-widest text-[#3B82F6] bg-[#3B82F6]/10 border border-[#3B82F6]/20 px-2 py-0.5 font-bold uppercase">
                    Workstation Active
                  </span>
                  <span className="text-[9px] font-mono tracking-widest text-[#7A828C] bg-[#11161D] px-2 py-0.5 border border-[#1C2430]">
                    Desktop Suite v{manifest?.appVersion ?? "1.2.3-alpha"}
                  </span>
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight text-white uppercase font-sans mt-1">
                  Pit Wall{" "}
                  <span
                    className={activeGame === "assettocorsa" ? "text-[#00D17F]" : "text-[#3B82F6]"}
                  >
                    Workstation
                  </span>
                </h1>
                <p className="text-[10px] text-[#7A828C] leading-relaxed uppercase max-w-lg mt-1">
                  {activeGame === "assettocorsa" ? (
                    <>
                      Race engineering command center. Streaming deterministic 60Hz live{" "}
                      <span className="text-[#00D17F]">Assetto Corsa</span> shared memory telemetry,
                      processing observer loops, and running latent Bayesian chassis degradation
                      estimators.
                    </>
                  ) : (
                    <>
                      Race engineering command center. Streaming deterministic 60Hz live{" "}
                      <span className="text-[#3B82F6]">iRacing</span> telemetry, processing observer
                      loops, and running latent Bayesian chassis degradation estimators.
                    </>
                  )}
                </p>

                {/* Sleek Motors-themed Glassmorphic Game Selector */}
                <div className="mt-3 border border-[#1C2430] bg-[#05070A]/80 p-1 flex items-center gap-1.5 rounded relative z-10 w-full max-w-85 shadow-inner select-none backdrop-blur-md">
                  <button
                    type="button"
                    onClick={() => handleGameSelect("iracing")}
                    className={`flex-1 py-1.5 px-3 text-[10px] font-bold uppercase tracking-wider text-center transition-all duration-300 rounded-sm flex items-center justify-center gap-2 ${
                      activeGame === "iracing"
                        ? "bg-[#3B82F6] text-white shadow-[0_0_15px_rgba(59,130,246,0.35)] scale-[1.02]"
                        : "text-[#7A828C] hover:text-white hover:bg-[#11161D] bg-transparent"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${activeGame === "iracing" ? "bg-white animate-pulse" : "bg-[#7A828C]"}`}
                    />
                    iRacing Simulator
                  </button>
                  <button
                    type="button"
                    onClick={() => handleGameSelect("assettocorsa")}
                    className={`flex-1 py-1.5 px-3 text-[10px] font-bold uppercase tracking-wider text-center transition-all duration-300 rounded-sm flex items-center justify-center gap-2 ${
                      activeGame === "assettocorsa"
                        ? "bg-[#00D17F] text-zinc-950 shadow-[0_0_15px_rgba(0,209,127,0.35)] scale-[1.02] font-black"
                        : "text-[#7A828C] hover:text-white hover:bg-[#11161D] bg-transparent"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${activeGame === "assettocorsa" ? "bg-zinc-950 animate-pulse" : "bg-[#7A828C]"}`}
                    />
                    Assetto Corsa
                  </button>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  to="/live"
                  className="inline-flex items-center justify-center gap-2 rounded-sm bg-[#00D17F] hover:bg-[#00B86F] px-6 py-3 font-mono text-xs uppercase font-bold text-zinc-950 transition-all shadow-[0_0_20px_rgba(0,209,127,0.25)] hover:scale-105 cursor-pointer"
                >
                  <Gauge className="h-4 w-4" />
                  Launch Live Dashboard
                </Link>
                <Link
                  to="/sessions"
                  className="inline-flex items-center justify-center gap-2 rounded-sm border border-[#1C2430] bg-[#11161D] hover:bg-[#161C24] px-5 py-3 font-mono text-xs uppercase font-bold text-white transition-all cursor-pointer"
                >
                  <LineChart className="h-4 w-4 text-[#3B82F6]" />
                  Open Analysis Workbench
                </Link>
              </div>
            </div>

            {/* Middle: Workstation Hero Image */}
            <div className="hidden lg:block lg:w-65 xl:w-[320px] relative rounded-sm border border-[#1C2430] overflow-hidden bg-[#05070A] group shadow-xl shrink-0">
              <div className="absolute inset-0 bg-linear-to-tr from-[#3B82F6]/10 via-transparent to-[#00D17F]/10 opacity-30 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <img
                src="/images/hero.png"
                alt="Pit Wall Workstation"
                className="w-full h-full object-cover transform group-hover:scale-[1.02] transition-transform duration-500"
              />
            </div>

            {/* Right: Hardware Diagnostics & Services */}
            <div className="flex-1 border border-[#1C2430] bg-[#05070A]/85 backdrop-blur-sm p-5 flex flex-col justify-between rounded-sm relative overflow-hidden group">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#11161D_1px,transparent_1px),linear-gradient(to_bottom,#11161D_1px,transparent_1px)] bg-size-[1.5rem_1.5rem] opacity-20 pointer-events-none" />

              <div className="relative z-10 flex items-center justify-between border-b border-[#1C2430] pb-2.5 mb-4">
                <span className="text-[9px] font-mono tracking-widest text-[#7A828C] font-bold uppercase flex items-center gap-1.5">
                  <Cpu className="h-3.5 w-3.5 text-[#3B82F6]" />
                  LOCAL HARDWARE & DAEMON STATUS
                </span>
                <span className="text-[9px] font-mono text-[#00D17F] font-bold tracking-wider animate-pulse flex items-center gap-1">
                  <span className="h-1 w-1 bg-[#00D17F] rounded-full" />
                  MONITORING
                </span>
              </div>

              <div className="relative z-10 grid grid-cols-2 gap-4 text-[10px] uppercase font-bold tracking-wide">
                <div className="flex flex-col gap-1 border-r border-[#1C2430]/40 pr-2">
                  <span className="text-[#7A828C] text-[8px] font-mono tracking-wider">
                    HOST CLIENT
                  </span>
                  <span className="text-white truncate font-sans text-xs italic tracking-tight font-extrabold">
                    {manifest?.hostname ?? "WORKSTATION-PC"}
                  </span>
                  <span className="text-[#7A828C] text-[8px]">
                    OS: {manifest?.platform ?? "win32"} · {manifest?.arch ?? "x64"}
                  </span>
                </div>

                <div className="flex flex-col gap-1 pl-2">
                  <span className="text-[#7A828C] text-[8px] font-mono tracking-wider">
                    CPU CORES
                  </span>
                  <span className="text-white truncate text-xs font-mono">
                    {manifest?.cpuModel
                      ? manifest.cpuModel.replace(/\(R\)|\(TM\)/g, "").trim()
                      : "Detecting..."}
                  </span>
                  <span className="text-[#7A828C] text-[8px]">
                    LOGICAL CORES: {manifest?.cpuCores ?? 8}
                  </span>
                </div>

                <div className="flex flex-col gap-1 border-r border-[#1C2430]/40 pr-2 pt-2 border-t">
                  <span className="text-[#7A828C] text-[8px] font-mono tracking-wider">
                    RAM ALLOCATION
                  </span>
                  <div className="flex items-center justify-between text-white text-xs font-mono">
                    <span>
                      {manifest && manifest.totalRamGb != null && manifest.freeRamGb != null
                        ? `${(Number(manifest.totalRamGb) - Number(manifest.freeRamGb)).toFixed(1)} GB`
                        : "0.0 GB"}
                    </span>
                    <span className="text-[#7A828C]">/ {manifest?.totalRamGb ?? "16.0"} GB</span>
                  </div>
                  <div className="w-full bg-[#11161D] h-1 rounded-full overflow-hidden mt-0.5">
                    <div
                      className="bg-[#3B82F6] h-full transition-all duration-500"
                      style={{
                        width:
                          manifest && manifest.totalRamGb != null && manifest.freeRamGb != null
                            ? `${((Number(manifest.totalRamGb) - Number(manifest.freeRamGb)) / Number(manifest.totalRamGb)) * 100}%`
                            : "30%",
                      }}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1 pl-2 pt-2 border-t border-[#1C2430]/40">
                  <span className="text-[#7A828C] text-[8px] font-mono tracking-wider">
                    PCIe GPU & VRAM
                  </span>
                  <span className="text-white truncate font-sans text-xs italic tracking-tight font-extrabold">
                    {manifest?.gpuModel ?? "Detecting GPU..."}
                  </span>
                  <div className="flex items-center justify-between text-white text-[9px] font-mono">
                    <span className="text-[#7A828C]">VRAM:</span>
                    <span className="font-bold text-[#00D17F]">
                      {manifest?.vramGb
                        ? `${parseFloat(String(manifest.vramGb)).toFixed(1)} GB`
                        : "0.0 GB"}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1 border-r border-[#1C2430]/40 pr-2 pt-2 border-t">
                  <span className="text-[#7A828C] text-[8px] font-mono tracking-wider">
                    SUPERVISOR DAEMONS
                  </span>
                  <div className="flex flex-col gap-1 text-[9px] font-mono mt-0.5">
                    <div className="flex items-center justify-between">
                      <span className="text-white">MONGO DATABASE:</span>
                      <span
                        className={
                          manifest?.mongoStatus === "active" ? "text-[#00D17F]" : "text-[#FF4D4D]"
                        }
                      >
                        {manifest?.mongoStatus === "active" ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white">CO-PILOT AI:</span>
                      <span className="text-[#3B82F6]">
                        {manifest?.aiMode ? String(manifest.aiMode).toUpperCase() : "CLOUD"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1 pl-2 pt-2 border-t border-[#1C2430]/40">
                  <span className="text-[#7A828C] text-[8px] font-mono tracking-wider">
                    RECOMMENDED LOCAL LLM
                  </span>
                  <span className="text-[#3B82F6] truncate text-xs font-mono font-bold">
                    {recommendedLlmName}
                  </span>
                  {recommendedLlmUrl === "#" ? (
                    <button
                      onClick={openSettings}
                      className="text-[#00D17F] hover:underline text-[8px] tracking-wider uppercase font-bold mt-0.5 text-left bg-transparent border-none p-0 cursor-pointer"
                    >
                      {recommendedLlmLinkText}
                    </button>
                  ) : (
                    <a
                      href={recommendedLlmUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#00D17F] hover:underline text-[8px] tracking-wider uppercase font-bold mt-0.5"
                    >
                      {recommendedLlmLinkText}
                    </a>
                  )}
                </div>
              </div>

              {/* LLM Recommendation Footnote */}
              <div className="relative z-10 border-t border-[#1C2430]/40 pt-2 mt-3 text-[8.5px] font-mono text-[#7A828C] uppercase leading-relaxed flex flex-col gap-1.5">
                <div>
                  <span className="text-[#FFB800] font-bold">Safe Model Guideline:</span>{" "}
                  {recommendedLlmDesc}
                </div>
                <div className="text-[8px] text-[#7A828C]/80 normal-case border-t border-[#1C2430]/25 pt-1.5 mt-0.5 font-sans leading-relaxed">
                  <span className="text-[#3B82F6] font-bold font-mono uppercase">
                    Advanced Users:
                  </span>{" "}
                  Advanced LLM users may find a better model. Just remember to update the model name
                  you have currently loaded in LM Studio inside the LM Studio settings to match.
                </div>
              </div>

              <div className="relative z-10 flex items-center justify-between border-t border-[#1C2430]/40 pt-3 mt-4 text-[9px] font-mono">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <span className="text-[#7A828C]">BRIDGE:</span>
                    <span
                      className={
                        manifest?.bridgeStatus === "running"
                          ? "text-[#00D17F]"
                          : manifest?.bridgeStatus === "crashed"
                            ? "text-[#FF4D4D]"
                            : "text-[#FFB800]"
                      }
                    >
                      {manifest?.bridgeStatus
                        ? String(manifest.bridgeStatus).toUpperCase()
                        : "CONNECTING"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[#7A828C]">UPTIME:</span>
                    <span className="text-white">
                      {manifest?.uptimeSec
                        ? `${Math.floor(manifest.uptimeSec / 3600)}h ${Math.floor((manifest.uptimeSec % 3600) / 60)}m`
                        : "0h 0m"}
                    </span>
                  </div>
                </div>
                <span className="text-[#7A828C] tracking-widest">PORT 3001 ACTIVE</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="border border-[#1C2430] bg-[#0B0F14] overflow-hidden rounded-sm flex flex-col md:flex-row items-center gap-6 p-6 md:p-8 relative">
            {/* Glassmorphic lighting background */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#3B82F6] opacity-[0.06] rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#00D17F] opacity-[0.04] rounded-full blur-[100px] pointer-events-none" />

            {/* Left Hero Content */}
            <div className="flex-1 flex flex-col items-start gap-4">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono tracking-widest text-[#00D17F] bg-[#00D17F]/10 border border-[#00D17F]/20 px-2 py-0.5 font-bold uppercase">
                  Now Live
                </span>
                <span className="text-[9px] font-mono tracking-widest text-[#7A828C] bg-[#11161D] px-2 py-0.5 border border-[#1C2430]">
                  Desktop Suite v1.2.0
                </span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white uppercase font-sans">
                Enter the{" "}
                <span
                  className={activeGame === "assettocorsa" ? "text-[#00D17F]" : "text-[#3B82F6]"}
                >
                  Pit Wall
                </span>
              </h1>
              <p className="text-[10px] text-[#7A828C] leading-relaxed uppercase max-w-lg">
                {activeGame === "assettocorsa" ? (
                  <>
                    Stream high-fidelity 60Hz live{" "}
                    <span className="text-[#00D17F]">Assetto Corsa</span> telemetry, evaluate AI
                    strategy timelines, analyze driver consistency fingerprints, and configure
                    dampers directly from the pit wall workstation.
                  </>
                ) : (
                  <>
                    Stream high-fidelity 60Hz live <span className="text-[#3B82F6]">iRacing</span>{" "}
                    telemetry, evaluate AI strategy timelines, analyze driver consistency
                    fingerprints, and configure dampers directly from the pit wall workstation.
                  </>
                )}
              </p>

              {/* Sleek Motors-themed Glassmorphic Game Selector */}
              <div className="mt-1 mb-2 border border-[#1C2430] bg-[#05070A]/80 p-1 flex items-center gap-1.5 rounded relative z-10 w-full max-w-85 shadow-inner select-none backdrop-blur-md">
                <button
                  type="button"
                  onClick={() => handleGameSelect("iracing")}
                  className={`flex-1 py-1.5 px-3 text-[10px] font-bold uppercase tracking-wider text-center transition-all duration-300 rounded-sm flex items-center justify-center gap-2 ${
                    activeGame === "iracing"
                      ? "bg-[#3B82F6] text-white shadow-[0_0_15px_rgba(59,130,246,0.35)] scale-[1.02]"
                      : "text-[#7A828C] hover:text-white hover:bg-[#11161D] bg-transparent"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${activeGame === "iracing" ? "bg-white animate-pulse" : "bg-[#7A828C]"}`}
                  />
                  iRacing Simulator
                </button>
                <button
                  type="button"
                  onClick={() => handleGameSelect("assettocorsa")}
                  className={`flex-1 py-1.5 px-3 text-[10px] font-bold uppercase tracking-wider text-center transition-all duration-300 rounded-sm flex items-center justify-center gap-2 ${
                    activeGame === "assettocorsa"
                      ? "bg-[#00D17F] text-zinc-950 shadow-[0_0_15px_rgba(0,209,127,0.35)] scale-[1.02] font-black"
                      : "text-[#7A828C] hover:text-white hover:bg-[#11161D] bg-transparent"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${activeGame === "assettocorsa" ? "bg-zinc-950 animate-pulse" : "bg-[#7A828C]"}`}
                  />
                  Assetto Corsa
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-3">
                <Link
                  to="/live"
                  className="inline-flex items-center justify-center gap-2 rounded-sm bg-[#00D17F] hover:bg-[#00B86F] px-6 py-3 font-mono text-xs uppercase font-bold text-zinc-950 transition-all shadow-[0_0_20px_rgba(0,209,127,0.25)] hover:scale-105 cursor-pointer"
                >
                  <Gauge className="h-4 w-4" />
                  Enter Pit Wall
                </Link>
                <Link
                  to="/roadmap"
                  className="inline-flex items-center justify-center gap-2 rounded-sm border border-[#1C2430] bg-[#11161D] hover:bg-[#161C24] px-5 py-3 font-mono text-xs uppercase font-bold text-white transition-all cursor-pointer"
                >
                  <Rocket className="h-4 w-4" />
                  Get Desktop Installer
                </Link>
              </div>
            </div>

            {/* Right Hero Image */}
            <div className="flex-1 w-full max-w-162.5 relative rounded-sm border border-[#1C2430] overflow-hidden bg-[#05070A] group shadow-2xl">
              {/* Glow border gradient effect */}
              <div className="absolute inset-0 bg-linear-to-tr from-[#3B82F6]/20 via-transparent to-[#00D17F]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <img
                src="/images/hero.png"
                alt="Pit Wall Telemetry Dashboard"
                className="w-full h-auto object-cover transform group-hover:scale-[1.02] transition-transform duration-500"
              />
            </div>
          </div>
        )}
      </section>

      {/* ── MAIN WORKSPACE CONTAINER ── */}
      <section className="flex-1 w-full max-w-none px-4 md:px-12 lg:px-16 py-6 relative z-10">
        <div className="flex flex-col gap-4 w-full">
          {/* Main Grid Header */}
          <div className="border border-[#1C2430] bg-[#0B0F14] px-4 py-2 text-[10px] tracking-widest text-[#7A828C] uppercase font-black flex items-center gap-2">
            <Sliders className="h-3.5 w-3.5 text-[#3B82F6]" />
            Telemetry Workstation Console Panels
          </div>

          {/* 8 Section Workstation Grid Tiles (Using full horizontal canvas) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 flex-1">
            {/* Tile 1: LIVE TELEMETRY COMMAND */}
            <Link
              to="/live"
              className="border border-[#1C2430] bg-[#11161D] hover:bg-[#161C24] hover:border-[#3B82F6]/50 p-4 transition-all duration-200 group flex flex-col justify-between cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="p-1.5 rounded border border-[#1C2430] bg-[#0B0F14] text-[#3B82F6]">
                  <Gauge className="h-5 w-5" />
                </span>
                <span
                  className={`text-[8px] font-bold tracking-widest px-2 py-0.5 border ${bridgeConnected ? "border-[#00D17F]/30 bg-[#00D17F]/10 text-[#00D17F]" : "border-[#7A828C]/30 bg-[#05070A] text-[#7A828C]"}`}
                >
                  {bridgeConnected ? "ACTIVE" : "SIM READY"}
                </span>
              </div>
              <div className="mt-3">
                <h3 className="text-xs font-bold text-white tracking-widest uppercase mb-1">
                  LIVE TELEMETRY COMMAND
                </h3>
                <p className="text-[10px] text-[#7A828C] leading-snug uppercase">
                  Launch the 60Hz real-time telemetry center. Displays sector splits, ERS
                  deployment, tyres, and rolling graphs.
                </p>
              </div>
              <span className="text-[9px] font-bold text-[#3B82F6] group-hover:translate-x-1 transition-transform inline-flex items-center gap-1 mt-2">
                RUN LIVE CONSOLE <ChevronRight className="h-3 w-3" />
              </span>
            </Link>

            {/* Tile 2: TEAM STRATEGY COMMAND */}
            <Link
              to="/team"
              className="border border-[#1C2430] bg-[#11161D] hover:bg-[#161C24] hover:border-[#3B82F6]/50 p-4 transition-all duration-200 group flex flex-col justify-between cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="p-1.5 rounded border border-[#1C2430] bg-[#0B0F14] text-[#3B82F6]">
                  <Users className="h-5 w-5" />
                </span>
                <span className="text-[8px] font-bold tracking-widest px-2 py-0.5 border border-[#3B82F6]/30 bg-[#3B82F6]/10 text-[#3B82F6]">
                  MULTI-DRIVER
                </span>
              </div>
              <div className="mt-3">
                <h3 className="text-xs font-bold text-white tracking-widest uppercase mb-1">
                  TEAM STRATEGY COMMAND
                </h3>
                <p className="text-[10px] text-[#7A828C] leading-snug uppercase">
                  Endurance Strategy Operations Center. Coordinate driver stints, compute Le Mans
                  fuel plans, and analyze live team streams.
                </p>
              </div>
              <span className="text-[9px] font-bold text-[#3B82F6] group-hover:translate-x-1 transition-transform inline-flex items-center gap-1 mt-2">
                PLAN TEAM STRATEGY <ChevronRight className="h-3 w-3" />
              </span>
            </Link>

            {/* Tile 3: ANALYSIS WORKBENCH */}
            <Link
              to="/sessions"
              className="border border-[#1C2430] bg-[#11161D] hover:bg-[#161C24] hover:border-[#3B82F6]/50 p-4 transition-all duration-200 group flex flex-col justify-between cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="p-1.5 rounded border border-[#1C2430] bg-[#0B0F14] text-[#3B82F6]">
                  <LineChart className="h-5 w-5" />
                </span>
                <span className="text-[8px] font-bold tracking-widest px-2 py-0.5 border border-[#1C2430] bg-[#05070A] text-[#7A828C]">
                  .IBT PARSER
                </span>
              </div>
              <div className="mt-3">
                <h3 className="text-xs font-bold text-white tracking-widest uppercase mb-1">
                  ANALYSIS WORKBENCH
                </h3>
                <p className="text-[10px] text-[#7A828C] leading-snug uppercase">
                  Analyze saved iRacing .ibt files. Stacked synchronized traces, G-G diagram, sector
                  overlays, and math channels.
                </p>
              </div>
              <span className="text-[9px] font-bold text-[#3B82F6] group-hover:translate-x-1 transition-transform inline-flex items-center gap-1 mt-2">
                OPEN WORKBENCH <ChevronRight className="h-3 w-3" />
              </span>
            </Link>

            {/* Tile 4: AI ENGINEER TERMINAL */}
            <Link
              to="/ai-engineer"
              className="border border-[#1C2430] bg-[#11161D] hover:bg-[#161C24] hover:border-[#8B5CF6]/50 p-4 transition-all duration-200 group flex flex-col justify-between cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="p-1.5 rounded border border-[#1C2430] bg-[#0B0F14] text-[#8B5CF6]">
                  <TerminalIcon className="h-5 w-5" />
                </span>
                <span className="text-[8px] font-bold tracking-widest px-2 py-0.5 border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 text-[#8B5CF6]">
                  Tactical AI
                </span>
              </div>
              <div className="mt-3">
                <h3 className="text-xs font-bold text-white tracking-widest uppercase mb-1">
                  AI ENGINEER TERMINAL
                </h3>
                <p className="text-[10px] text-[#7A828C] leading-snug uppercase">
                  Motorsport-grade engineering console. Specific spring, damper, and tire pressure
                  adjustments in race-team tone.
                </p>
              </div>
              <span className="text-[9px] font-bold text-[#8B5CF6] group-hover:translate-x-1 transition-transform inline-flex items-center gap-1 mt-2">
                BOOT TERMINAL <ChevronRight className="h-3 w-3" />
              </span>
            </Link>

            {/* Tile 5: INTERACTIVE TUTORIAL */}
            <a
              href="#onboarding-tutorial"
              className="border border-[#1C2430] bg-[#11161D] hover:bg-[#161C24] p-4 transition-all duration-200 group flex flex-col justify-between cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="p-1.5 rounded border border-[#1C2430] bg-[#0B0F14] text-[#FFB800]">
                  <GraduationCap className="h-5 w-5" />
                </span>
                <span className="text-[8px] font-bold tracking-widest px-2 py-0.5 border border-[#1C2430] bg-[#05070A] text-[#7A828C]">
                  GUIDE
                </span>
              </div>
              <div className="mt-3">
                <h3 className="text-xs font-bold text-white tracking-widest uppercase mb-1">
                  INTERACTIVE TUTORIAL
                </h3>
                <p className="text-[10px] text-[#7A828C] leading-snug uppercase">
                  Learn to seed driver fingerprints, parse local .olap/.blap logs, and configure
                  local bridge port settings.
                </p>
              </div>
              <span className="text-[9px] font-bold text-[#FFB800] inline-flex items-center gap-1 mt-2">
                VIEW ONBOARDING GUIDE <ChevronRight className="h-3 w-3" />
              </span>
            </a>

            {/* Tile 6: TECHNICAL MANUAL */}
            <Link
              to="/how-it-works"
              className="border border-[#1C2430] bg-[#11161D] hover:bg-[#161C24] p-4 transition-all duration-200 group flex flex-col justify-between cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="p-1.5 rounded border border-[#1C2430] bg-[#0B0F14] text-[#E2E4E8]">
                  <BookOpen className="h-5 w-5" />
                </span>
                <span className="text-[8px] font-bold tracking-widest px-2 py-0.5 border border-[#1C2430] bg-[#05070A] text-[#7A828C]">
                  DOCS
                </span>
              </div>
              <div className="mt-3">
                <h3 className="text-xs font-bold text-white tracking-widest uppercase mb-1">
                  TECHNICAL DOCUMENTATION
                </h3>
                <p className="text-[10px] text-[#7A828C] leading-snug uppercase">
                  Complete manual explaining telemetry structures, math channel expressions, and
                  sector delta algorithms.
                </p>
              </div>
              <span className="text-[9px] font-bold text-white inline-flex items-center gap-1 mt-2">
                READ MANUAL <ChevronRight className="h-3 w-3" />
              </span>
            </Link>

            {/* Tile 7: DEVELOPMENT ROADMAP */}
            <Link
              to="/roadmap"
              className="border border-[#1C2430] bg-[#11161D] hover:bg-[#161C24] p-4 transition-all duration-200 group flex flex-col justify-between cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="p-1.5 rounded border border-[#1C2430] bg-[#0B0F14] text-[#FF4D4D]">
                  <Rocket className="h-5 w-5" />
                </span>
                <span className="text-[8px] font-bold tracking-widest px-2 py-0.5 border border-[#1C2430] bg-[#05070A] text-[#7A828C]">
                  TIMELINE
                </span>
              </div>
              <div className="mt-3">
                <h3 className="text-xs font-bold text-white tracking-widest uppercase mb-1">
                  DEVELOPMENT ROADMAP
                </h3>
                <p className="text-[10px] text-[#7A828C] leading-snug uppercase">
                  Pit Wall development timeline. Check shipped milestones, active beta-testing
                  status, and upcoming Monetization phases.
                </p>
              </div>
              <span className="text-[9px] font-bold text-[#FF4D4D] inline-flex items-center gap-1 mt-2">
                VIEW ROADMAP <ChevronRight className="h-3 w-3" />
              </span>
            </Link>

            {/* Tile 8: SYSTEM SETTINGS */}
            <button
              onClick={openSettings}
              className="border border-[#1C2430] bg-[#11161D] hover:bg-[#161C24] p-4 transition-all duration-200 group flex flex-col justify-between text-left cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="p-1.5 rounded border border-[#1C2430] bg-[#0B0F14] text-[#3B82F6]">
                  <SettingsIcon className="h-5 w-5" />
                </span>
                <span className="text-[8px] font-bold tracking-widest px-2 py-0.5 border border-[#1C2430] bg-[#05070A] text-[#7A828C]">
                  Ctrl + ,
                </span>
              </div>
              <div className="mt-3">
                <h3 className="text-xs font-bold text-white tracking-widest uppercase mb-1">
                  SYSTEM SETTINGS
                </h3>
                <p className="text-[10px] text-[#7A828C] leading-snug uppercase">
                  Configure local MongoDB directories, local LLM endpoints, and hardware ID license
                  keys.
                </p>
              </div>
              <span className="text-[9px] font-bold text-[#3B82F6] inline-flex items-center gap-1 mt-2">
                OPEN PREFERENCES <ChevronRight className="h-3 w-3" />
              </span>
            </button>
          </div>

          {/* Gateway links spaced out horizontally */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            {/* Tile 6.5: DRIVER COCKPIT HUD GATEWAY */}
            <Link
              to="/driver-bridge"
              className="border border-[#1C2430] bg-[#00D17F]/5 hover:bg-[#00D17F]/10 hover:border-[#00D17F]/50 p-4 text-[10px] uppercase tracking-widest flex items-center justify-between border-dashed cursor-pointer"
            >
              <span className="flex items-center gap-2 text-white font-bold">
                <Gauge className="h-4 w-4 text-[#00D17F]" />
                DRIVER COCKPIT HUD GATEWAY
              </span>
              <span className="text-[#00D17F] hover:underline font-bold">LAUNCH COCKPIT HUD →</span>
            </Link>

            {/* Tile 7: ENGINEER ACCOUNT GATEWAY */}
            <Link
              to="/auth"
              className="border border-[#1C2430] bg-[#0B0F14] hover:bg-[#11161D] p-4 text-[10px] uppercase tracking-widest flex items-center justify-between border-dashed cursor-pointer"
            >
              <span className="flex items-center gap-2 text-white font-bold">
                <LogIn className="h-4 w-4 text-[#3B82F6]" />
                {user ? "Active Account Profile Linked" : "ENGINEER LOGIN GATEWAY"}
              </span>
              <span className="text-[#3B82F6] hover:underline">
                {user ? "View profile →" : "Sign in to save records →"}
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── SECTION: RECENT SESSIONS GRID (Workstation Log style) ── */}
      {user && recentSessions.length > 0 && (
        <section className="w-full max-w-none px-4 md:px-12 lg:px-16 py-2 z-10 select-none">
          <div className="border border-[#1C2430] bg-[#0B0F14] p-4">
            <h3 className="text-[9px] font-mono uppercase tracking-widest text-[#7A828C] border-b border-[#1C2430] pb-2 mb-3">
              RECENTLY PARSED TELEMETRY LOGS (.IBT RECONSTRUCTION)
            </h3>
            <div className="grid gap-3 md:grid-cols-3">
              {recentSessions.map((s) => (
                <Link
                  key={s.id}
                  to="/sessions/$id"
                  params={{ id: s.id }}
                  className="border border-[#1C2430] bg-[#11161D] hover:bg-[#161C24] p-3 flex flex-col justify-between gap-2 hover:border-[#3B82F6]/50 cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-1">
                    <span className="text-[10px] font-bold text-white uppercase tracking-wider truncate max-w-[70%]">
                      {s.track ?? "Spa-Francorchamps"}
                    </span>
                    <span className="text-[8px] border border-[#1C2430] px-1.5 py-0.5 text-[#7A828C]">
                      {s.tick_rate ?? "60"} Hz
                    </span>
                  </div>
                  <span className="text-[9px] text-[#7A828C] truncate uppercase font-bold">
                    Car: {s.car ?? "AMG GT3"}
                  </span>
                  <div className="flex justify-between text-[9px] text-[#7A828C] border-t border-[#1C2430]/40 pt-1.5 font-bold">
                    <span>BEST LAP:</span>
                    <span className="text-[#00D17F] font-bold tracking-wider">
                      {fmtLapTime(s.best_lap_s)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── ONBOARDING TUTORIAL DETAIL AREA (HTML Onboarding Anchor) ── */}
      <section
        id="onboarding-tutorial"
        className="w-full max-w-none px-4 md:px-12 lg:px-16 py-6 z-10 scroll-mt-14"
      >
        {isElectron ? (
          <div className="border border-[#1C2430] bg-[#0B0F14] p-5">
            <div className="mb-4 text-left border-b border-[#1C2430] pb-3">
              <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#00D17F] font-semibold">
                INFRASTRUCTURE CONSOLE
              </span>
              <h2 className="text-base font-bold tracking-tight text-white uppercase mt-1">
                Local Telemetry supervisor daemon operations
              </h2>
              <p className="mt-1 text-xs text-[#7A828C] leading-relaxed max-w-4xl">
                The workstation local supervisor runs continuous process monitors and local RPC
                loops to communicate directly with your local iRacing WebSocket bridge and MongoDB
                telemetry store.
              </p>
            </div>

            <div className="grid gap-4 text-xs md:grid-cols-3 mb-5">
              {/* Database daemon control */}
              <div className="border border-[#1C2430] bg-[#11161D] p-4 flex flex-col justify-between gap-3">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2 font-mono uppercase tracking-wider text-[#00D17F] font-bold">
                    <Database className="h-4 w-4" /> Telemetry Database
                  </div>
                  <p className="text-[#7A828C] text-[10px] leading-relaxed">
                    MongoDB stores indexed lap files, telemetry frames, and driver consistency
                    fingerprints locally.
                  </p>
                </div>
                <div className="flex items-center justify-between border-t border-[#1C2430]/40 pt-3">
                  <span className="text-[9px] text-[#7A828C] font-mono">
                    STATUS: {manifest?.mongoStatus === "active" ? "ACTIVE" : "OFFLINE"}
                  </span>
                  <button
                    onClick={async () => {
                      if (window.pitWallRuntime?.ensureMongoDB) {
                        await window.pitWallRuntime.ensureMongoDB();
                      }
                    }}
                    disabled={manifest?.mongoStatus === "active"}
                    className="border border-[#00D17F]/40 bg-[#00D17F]/10 hover:bg-[#00D17F]/20 text-[#00D17F] px-3 py-1 text-[9px] uppercase font-bold disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
                  >
                    Start Daemon
                  </button>
                </div>
              </div>

              {/* WebSocket Telemetry Bridge control */}
              <div className="border border-[#1C2430] bg-[#11161D] p-4 flex flex-col justify-between gap-3">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2 font-mono uppercase tracking-wider text-[#3B82F6] font-bold">
                    <Wifi className="h-4 w-4" /> WebSocket Bridge
                  </div>
                  <p className="text-[#7A828C] text-[10px] leading-relaxed">
                    iRacing memory broker. Captures live game frames at 60Hz and exposes them on
                    localhost ws port 3001.
                  </p>
                </div>
                <div className="flex items-center justify-between border-t border-[#1C2430]/40 pt-3">
                  <span className="text-[9px] text-[#7A828C] font-mono">
                    STATUS:{" "}
                    {manifest?.bridgeStatus
                      ? String(manifest.bridgeStatus).toUpperCase()
                      : "STARTING"}
                  </span>
                  <button
                    onClick={async () => {
                      if (window.pitWallRuntime?.restartBridge) {
                        await window.pitWallRuntime.restartBridge();
                      }
                    }}
                    className="border border-[#3B82F6]/40 bg-[#3B82F6]/10 hover:bg-[#3B82F6]/20 text-[#3B82F6] px-3 py-1 text-[9px] uppercase font-bold transition-colors cursor-pointer"
                  >
                    Restart Bridge
                  </button>
                </div>
              </div>

              {/* Co-Pilot AI settings */}
              <div className="border border-[#1C2430] bg-[#11161D] p-4 flex flex-col justify-between gap-3">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2 font-mono uppercase tracking-wider text-[#8B5CF6] font-bold">
                    <Sparkles className="h-4 w-4" /> Co-Pilot AI Strategy
                  </div>
                  <p className="text-[#7A828C] text-[10px] leading-relaxed">
                    Local LLM router. Probes local inference servers (Ollama, LM Studio) or falls
                    back to cloud APIs.
                  </p>
                </div>
                <div className="flex items-center justify-between border-t border-[#1C2430]/40 pt-3">
                  <span className="text-[9px] text-[#7A828C] font-mono">
                    MODE: {manifest?.aiMode ? String(manifest.aiMode).toUpperCase() : "CLOUD"}
                  </span>
                  <button
                    onClick={async () => {
                      if (window.pitWallRuntime?.refreshAiMode) {
                        await window.pitWallRuntime.refreshAiMode();
                      }
                    }}
                    className="border border-[#8B5CF6]/40 bg-[#8B5CF6]/10 hover:bg-[#8B5CF6]/20 text-[#8B5CF6] px-3 py-1 text-[9px] uppercase font-bold transition-colors cursor-pointer"
                  >
                    Re-Probe AI
                  </button>
                </div>
              </div>
            </div>

            {/* Local Server API status */}
            <div className="border border-[#1C2430] bg-[#11161D] p-4 text-left">
              <h3 className="font-bold text-white text-xs uppercase mb-1">
                Supervisor Daemon API endpoints
              </h3>
              <p className="text-[10px] text-[#7A828C] mb-2 leading-relaxed">
                The background supervisor hosts a local HTTP + SSE telemetry server at port{" "}
                <span className="font-mono text-white">17777</span>. Users can fetch telemetry
                programmatically or subscribe to the Server-Sent Events stream.
              </p>
              <pre className="overflow-x-auto rounded border border-[#1C2430] bg-[#05070A] p-3.5 font-mono text-[10px] leading-relaxed text-[#00D17F] w-full">
                {`# Status Endpoint:\nGET http://127.0.0.1:17777/supervisor/status\n\n# SSE Live Telemetry Stream:\nGET http://127.0.0.1:17777/telemetry/live`}
              </pre>
            </div>
          </div>
        ) : (
          <div className="border border-[#1C2430] bg-[#0B0F14] p-5">
            <div className="mb-4 text-left border-b border-[#1C2430] pb-3">
              <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#FFB800] font-semibold">
                GETTING STARTED
              </span>
              <h2 className="text-base font-bold tracking-tight text-white uppercase mt-1">
                {activeGame === "assettocorsa"
                  ? "Establishing Assetto Corsa shared memory telemetry"
                  : "Establishing local iRacing telemetry bridge connection"}
              </h2>
              <p className="mt-1 text-xs text-[#7A828C] leading-relaxed max-w-4xl">
                {activeGame === "assettocorsa"
                  ? "The Pit Wall workstation reads rolling telemetry from original Assetto Corsa shared memory blocks. This is achieved by running the local bridge on the same Windows machine where the simulation is hosted."
                  : "The Pit Wall desktop workstation pulls rolling telemetry directly from iRacing's Shared Memory API. This is achieved by running the local bridge WebSocket broker on the same Windows machine where the simulation is hosted."}
              </p>
            </div>

            {activeGame === "assettocorsa" ? (
              <div className="grid gap-4 text-xs md:grid-cols-3 mb-5">
                <div className="border border-[#1C2430] bg-[#11161D] p-4 flex flex-col gap-1.5">
                  <div className="flex items-center gap-2 font-mono uppercase tracking-wider text-[#00D17F] font-bold">
                    <ShieldCheck className="h-4 w-4" /> 1. OS Requirements
                  </div>
                  <ul className="space-y-1 text-[#7A828C] text-[10px] leading-relaxed">
                    <li>• Windows 10 or 11 (Host machine)</li>
                    <li>• Assetto Corsa (Original) simulator installed</li>
                    <li>• Pre-installed .NET Framework 4.x (for ac-reader compilation)</li>
                  </ul>
                </div>
                <div className="border border-[#1C2430] bg-[#11161D] p-4 flex flex-col gap-1.5">
                  <div className="flex items-center gap-2 font-mono uppercase tracking-wider text-[#FFB800] font-bold">
                    <Wifi className="h-4 w-4" /> 2. Shared Memory Broker
                  </div>
                  <p className="text-[#7A828C] text-[10px] leading-relaxed">
                    The bridge compiles and spawns a native{" "}
                    <span className="text-white font-bold">ac-reader.exe</span> to map original AC
                    shared memory blocks to unified WebSocket streams.
                  </p>
                </div>
                <div className="border border-[#1C2430] bg-[#11161D] p-4 flex flex-col gap-1.5">
                  <div className="flex items-center gap-2 font-mono uppercase tracking-wider text-[#8B5CF6] font-bold">
                    <Cpu className="h-4 w-4" /> 3. Seamless Normalization
                  </div>
                  <p className="text-[#7A828C] text-[10px] leading-relaxed">
                    All telemetry speeds, gear indexes, tire temperatures, and shock deflections are
                    normalized to match the existing DDRE contracts perfectly.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 text-xs md:grid-cols-3 mb-5">
                <div className="border border-[#1C2430] bg-[#11161D] p-4 flex flex-col gap-1.5">
                  <div className="flex items-center gap-2 font-mono uppercase tracking-wider text-[#3B82F6] font-bold">
                    <ShieldCheck className="h-4 w-4" /> 1. OS Requirements
                  </div>
                  <ul className="space-y-1 text-[#7A828C] text-[10px] leading-relaxed">
                    <li>• Windows 10 or 11 (Host machine)</li>
                    <li>• iRacing active simulation running</li>
                    <li>• Node.js 20 LTS or bun runtime installed</li>
                  </ul>
                </div>
                <div className="border border-[#1C2430] bg-[#11161D] p-4 flex flex-col gap-1.5">
                  <div className="flex items-center gap-2 font-mono uppercase tracking-wider text-[#FFB800] font-bold">
                    <Wifi className="h-4 w-4" /> 2. Port Allocation
                  </div>
                  <p className="text-[#7A828C] text-[10px] leading-relaxed">
                    By default, the bridge opens a localhost listener on WebSocket port{" "}
                    <span className="text-white font-bold">3001</span>. Make sure no other programs
                    are currently running on port 3001.
                  </p>
                </div>
                <div className="border border-[#1C2430] bg-[#11161D] p-4 flex flex-col gap-1.5">
                  <div className="flex items-center gap-2 font-mono uppercase tracking-wider text-[#8B5CF6] font-bold">
                    <Cpu className="h-4 w-4" /> 3. Local first
                  </div>
                  <p className="text-[#7A828C] text-[10px] leading-relaxed">
                    All telemetry data is streamed locally. No external server packages are sent,
                    keeping your strategy completely private and secure.
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <div className="border border-[#1C2430] bg-[#11161D] p-4 text-left flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="font-bold text-white text-xs uppercase">
                    Step A: Install Pit Wall Desktop
                  </h3>
                  <p className="text-[10px] text-[#7A828C] mt-0.5 leading-relaxed">
                    The local bridge is bundled inside the Pit Wall Desktop installer. Download and
                    run the installer — the bridge starts automatically when you launch the app.
                    Place the app in{" "}
                    <span className="font-mono text-white">C:\Program Files\Pit Wall</span> or your
                    preferred location.
                  </p>
                </div>
                <Link
                  to="/roadmap"
                  className="inline-flex items-center justify-center gap-2 border border-[#3B82F6]/40 bg-[#3B82F6]/10 hover:bg-[#3B82F6]/20 px-4 py-2 text-[10px] uppercase font-bold text-[#3B82F6] transition-colors shrink-0"
                >
                  Get Desktop App →
                </Link>
              </div>

              {activeGame === "assettocorsa" ? (
                <div className="border border-[#1C2430] bg-[#11161D] p-4 text-left">
                  <h3 className="font-bold text-white text-xs uppercase mb-1">
                    Step B: Launch and stream
                  </h3>
                  <p className="text-[10px] text-[#7A828C] mb-2 leading-relaxed">
                    Toggle active game to Assetto Corsa. The bridge will dynamically compile{" "}
                    <span className="font-mono text-white">ac-reader.cs</span> and listen for
                    Assetto Corsa memory frames. Start AC and drive!
                  </p>
                  <pre className="overflow-x-auto rounded border border-[#1C2430] bg-[#05070A] p-3.5 font-mono text-[10px] leading-relaxed text-[#00D17F] w-full">
                    {`# C# shared memory reader compiles automatically using built-in csc.exe.\n# Stream mapped telemetry at 60Hz:\nws://127.0.0.1:3001`}
                  </pre>
                </div>
              ) : (
                <div className="border border-[#1C2430] bg-[#11161D] p-4 text-left">
                  <h3 className="font-bold text-white text-xs uppercase mb-1">
                    Step B: Launch and connect
                  </h3>
                  <p className="text-[10px] text-[#7A828C] mb-2 leading-relaxed">
                    Launch Pit Wall Desktop. The bridge starts automatically in the background on
                    port <span className="font-mono text-white">3001</span>. Start iRacing and join
                    a session — the Live Telemetry dashboard will connect instantly.
                  </p>
                  <pre className="overflow-x-auto rounded border border-[#1C2430] bg-[#05070A] p-3.5 font-mono text-[10px] leading-relaxed text-[#00D17F] w-full">
                    {`# Bridge starts automatically — no commands needed.\n# Verify connection at:\nws://127.0.0.1:3001`}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* ── WORKSTATION FOOTER ── */}
      <footer className="border-t border-[#1C2430] bg-[#0B0F14]/50 py-4 px-6 text-[#7A828C] text-[9px] font-mono tracking-wider z-10 select-none">
        <div className="w-full max-w-none px-4 md:px-12 lg:px-16 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col items-center md:items-start">
            <span className="font-sans font-black italic tracking-tighter text-white text-sm">
              PIT WALL COMMAND
            </span>
            <span className="text-[7px] tracking-[0.2em] uppercase font-bold text-[#7A828C]">
              ENDURANCE TELEMETRY & STRATEGY
            </span>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-x-4 text-[#7A828C] font-bold">
            <span>ENGINEERING GRADE</span>
            <span>·</span>
            <span>LOCAL MEMORY ONLY</span>
            <span>·</span>
            <span>FAST TELEMETRY TRACING</span>
            <span>·</span>
            <span>AI STRATEGIST ACTIVE</span>
          </div>

          <div className="flex items-center gap-3">
            <span>© 2026 PIT WALL WORKSTATION</span>
            <div className="h-5 w-7 border border-[#1C2430] bg-[#05070A] flex items-center justify-center text-[#7A828C] font-black italic text-[10px]">
              PW
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
