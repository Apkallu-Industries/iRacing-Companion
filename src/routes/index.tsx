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

type Sess = Tables<"telemetry_sessions">;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pit Wall — Motorsport Engineering & Lap Analysis" },
      {
        name: "description",
        content:
          "Motorsport engineering command center. Stream live iRacing telemetry at 60Hz and analyze laps with professional stacked traces and AI strategies.",
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

  return (
    <main className="min-h-screen bg-[#05070A] text-[#E2E4E8] font-mono selection:bg-[#3B82F6]/30 selection:text-white overflow-x-hidden relative flex flex-col justify-between">
      
      {/* ── METADATA CARBON BACKGROUND GRID ── */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#11161D_1px,transparent_1px),linear-gradient(to_bottom,#11161D_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-[0.15] pointer-events-none z-0" />

      {/* ── TOP NAV / WORKSTATION HEADER ── */}
      <nav className="border-b border-[#1C2430] bg-[#0B0F14]/90 backdrop-blur sticky top-0 z-50 px-6 py-2.5 flex items-center justify-between z-10 select-none">
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
              <span className={`h-1.5 w-1.5 rounded-full bg-[#00D17F] shadow-[0_0_8px_#00D17F] ${pulse ? 'animate-ping' : ''}`} />
              <span className="text-[8px] font-mono text-[#00D17F] font-black tracking-widest">
                OPERATIONAL
              </span>
            </span>
          </div>
        </div>
      </nav>

      {/* ── HERO BANNER SECTION ── */}
      <section className="w-full max-w-none px-4 md:px-12 lg:px-16 pt-6 relative z-10 select-none">
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
              Enter the <span className="text-[#3B82F6]">Pit Wall</span>
            </h1>
            <p className="text-[10px] text-[#7A828C] leading-relaxed uppercase max-w-lg">
              Stream high-fidelity 60Hz live iRacing telemetry, evaluate AI strategy timelines, analyze driver consistency fingerprints, and configure dampers directly from the pit wall workstation.
            </p>
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
          <div className="flex-1 w-full max-w-[650px] relative rounded-sm border border-[#1C2430] overflow-hidden bg-[#05070A] group shadow-2xl">
            {/* Glow border gradient effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#3B82F6]/20 via-transparent to-[#00D17F]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <img
              src="/hero.png"
              alt="Pit Wall Telemetry Dashboard"
              className="w-full h-auto object-cover transform group-hover:scale-[1.02] transition-transform duration-500"
            />
          </div>
        </div>
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
                <span className={`text-[8px] font-bold tracking-widest px-2 py-0.5 border ${bridgeConnected ? 'border-[#00D17F]/30 bg-[#00D17F]/10 text-[#00D17F]' : 'border-[#7A828C]/30 bg-[#05070A] text-[#7A828C]'}`}>
                  {bridgeConnected ? 'ACTIVE' : 'SIM READY'}
                </span>
              </div>
              <div className="mt-3">
                <h3 className="text-xs font-bold text-white tracking-widest uppercase mb-1">
                  LIVE TELEMETRY COMMAND
                </h3>
                <p className="text-[10px] text-[#7A828C] leading-snug uppercase">
                  Launch the 60Hz real-time telemetry center. Displays sector splits, ERS deployment, tyres, and rolling graphs.
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
                  Endurance Strategy Operations Center. Coordinate driver stints, compute Le Mans fuel plans, and analyze live team streams.
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
                  Analyze saved iRacing .ibt files. Stacked synchronized traces, G-G diagram, sector overlays, and math channels.
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
                  Motorsport-grade engineering console. Specific spring, damper, and tire pressure adjustments in race-team tone.
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
                  Learn to seed driver fingerprints, parse local .olap/.blap logs, and configure local bridge port settings.
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
                  Complete manual explaining telemetry structures, math channel expressions, and sector delta algorithms.
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
                  Pit Wall development timeline. Check shipped milestones, active beta-testing status, and upcoming Monetization phases.
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
                  Configure local MongoDB directories, local LLM endpoints, and hardware ID license keys.
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
              <span className="text-[#00D17F] hover:underline font-bold">
                LAUNCH COCKPIT HUD →
              </span>
            </Link>

            {/* Tile 7: ENGINEER ACCOUNT GATEWAY */}
            <Link
              to="/auth"
              className="border border-[#1C2430] bg-[#0B0F14] hover:bg-[#11161D] p-4 text-[10px] uppercase tracking-widest flex items-center justify-between border-dashed cursor-pointer"
            >
              <span className="flex items-center gap-2 text-white font-bold">
                <LogIn className="h-4 w-4 text-[#3B82F6]" />
                {user ? 'Active Account Profile Linked' : 'ENGINEER LOGIN GATEWAY'}
              </span>
              <span className="text-[#3B82F6] hover:underline">
                {user ? 'View profile →' : 'Sign in to save records →'}
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
                      {s.track ?? 'Spa-Francorchamps'}
                    </span>
                    <span className="text-[8px] border border-[#1C2430] px-1.5 py-0.5 text-[#7A828C]">
                      {s.tick_rate ?? '60'} Hz
                    </span>
                  </div>
                  <span className="text-[9px] text-[#7A828C] truncate uppercase font-bold">
                    Car: {s.car ?? 'AMG GT3'}
                  </span>
                  <div className="flex justify-between text-[9px] text-[#7A828C] border-t border-[#1C2430]/40 pt-1.5 font-bold">
                    <span>BEST LAP:</span>
                    <span className="text-[#00D17F] font-bold tracking-wider">{fmtLapTime(s.best_lap_s)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── ONBOARDING TUTORIAL DETAIL AREA (HTML Onboarding Anchor) ── */}
      <section id="onboarding-tutorial" className="w-full max-w-none px-4 md:px-12 lg:px-16 py-6 z-10 scroll-mt-14">
        <div className="border border-[#1C2430] bg-[#0B0F14] p-5">
          <div className="mb-4 text-left border-b border-[#1C2430] pb-3">
            <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#FFB800] font-semibold">
              GETTING STARTED
            </span>
            <h2 className="text-base font-bold tracking-tight text-white uppercase mt-1">
              Establishing local telemetry bridge connection
            </h2>
            <p className="mt-1 text-xs text-[#7A828C] leading-relaxed max-w-4xl">
              The Pit Wall desktop workstation pulls rolling telemetry directly from iRacing's Shared Memory API. 
              This is achieved by running the local bridge WebSocket broker on the same Windows machine where the simulation is hosted.
            </p>
          </div>

          <div className="grid gap-4 text-xs md:grid-cols-3 mb-5">
            <div className="border border-[#1C2430] bg-[#11161D] p-4 flex flex-col gap-1.5">
              <div className="flex items-center gap-2 font-mono uppercase tracking-wider text-[#3B82F6] font-bold">
                <ShieldCheck className="h-4 w-4" /> 1. OS Requirements
              </div>
              <ul className="space-y-1 text-[#7A828C] text-[10px] leading-relaxed">
                <li>• Windows 10 or 11 (Host machine)</li>
                <li>• iRacing active simulation running</li>
                <li>• Node.js 24 LTS or bun runtime installed</li>
              </ul>
            </div>
            <div className="border border-[#1C2430] bg-[#11161D] p-4 flex flex-col gap-1.5">
              <div className="flex items-center gap-2 font-mono uppercase tracking-wider text-[#FFB800] font-bold">
                <Wifi className="h-4 w-4" /> 2. Port Allocation
              </div>
              <p className="text-[#7A828C] text-[10px] leading-relaxed">
                By default, the bridge opens a localhost listener on WebSocket port <span className="text-white font-bold">3001</span>.
                Make sure no other programs are currently running on port 3001.
              </p>
            </div>
            <div className="border border-[#1C2430] bg-[#11161D] p-4 flex flex-col gap-1.5">
              <div className="flex items-center gap-2 font-mono uppercase tracking-wider text-[#8B5CF6] font-bold">
                <Cpu className="h-4 w-4" /> 3. Local first
              </div>
              <p className="text-[#7A828C] text-[10px] leading-relaxed">
                All telemetry data is streamed locally. No external server packages are sent, keeping your strategy completely private and secure.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="border border-[#1C2430] bg-[#11161D] p-4 text-left flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="font-bold text-white text-xs uppercase">Step A: Install Pit Wall Desktop</h3>
                <p className="text-[10px] text-[#7A828C] mt-0.5 leading-relaxed">
                  The local bridge is bundled inside the Pit Wall Desktop installer. Download and run the installer — the bridge starts automatically when you launch the app.
                  Place the app in <span className="font-mono text-white">C:\Program Files\Pit Wall</span> or your preferred location.
                </p>
              </div>
              <Link
                to="/roadmap"
                className="inline-flex items-center justify-center gap-2 border border-[#3B82F6]/40 bg-[#3B82F6]/10 hover:bg-[#3B82F6]/20 px-4 py-2 text-[10px] uppercase font-bold text-[#3B82F6] transition-colors flex-shrink-0"
              >
                Get Desktop App →
              </Link>
            </div>

            <div className="border border-[#1C2430] bg-[#11161D] p-4 text-left">
              <h3 className="font-bold text-white text-xs uppercase mb-1">Step B: Launch and connect</h3>
              <p className="text-[10px] text-[#7A828C] mb-2 leading-relaxed">
                Launch Pit Wall Desktop. The bridge starts automatically in the background on port <span className="font-mono text-white">3001</span>.
                Start iRacing and join a session — the Live Telemetry dashboard will connect instantly.
              </p>
              <pre className="overflow-x-auto rounded border border-[#1C2430] bg-[#05070A] p-3.5 font-mono text-[10px] leading-relaxed text-[#00D17F] w-full">
                {`# Bridge starts automatically — no commands needed.\n# Verify connection at:\nws://127.0.0.1:3001`}
              </pre>
            </div>
          </div>
        </div>
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
            <span>
              © 2026 PIT WALL WORKSTATION
            </span>
            <div className="h-5 w-7 border border-[#1C2430] bg-[#05070A] flex items-center justify-center text-[#7A828C] font-black italic text-[10px]">
              PW
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
