import { createFileRoute, Link } from "@tanstack/react-router";
import React, { useState, useEffect, useRef } from "react";
import {
  Users,
  Car as CarIcon,
  Plus,
  Trash2,
  Settings,
  Activity,
  Upload,
  Cpu,
  LineChart,
  Lock,
  ShieldAlert,
  BrainCircuit,
  RefreshCw,
  Sliders,
  Timer,
  BookOpen,
  Terminal as TerminalIcon,
  Database,
  Network,
  CheckSquare,
  Square,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Play,
  Pause,
  History,
  FileCode,
  Info,
  HelpCircle
} from "lucide-react";

export const Route = createFileRoute("/team-guide")({
  head: () => ({
    meta: [
      { title: "Team Setup Guide — Pit Wall Operations Center" },
      {
        name: "description",
        content:
          "High-density tactical setup and role guide for iRacing realtime relay pit wall sessions. Configure Supabase channels and local bridge pub/sub.",
      },
    ],
  }),
  component: TeamGuidePage,
});

type ActiveTab = "owner" | "driver" | "crew" | "trouble" | "faq";

function TeamGuidePage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("owner");

  // Dynamic interactive checklist states
  const [ownerChecklist, setOwnerChecklist] = useState({
    supabaseAccount: false,
    projectCreated: false,
    sqlSchemaRun: false,
    keysCopied: false,
    codeGenerated: false,
    envDistributed: false,
    bridgeRunning: false,
    rdyVerify: false
  });

  const [driverChecklist, setDriverChecklist] = useState({
    envPlaced: false,
    nameConfigured: false,
    bridgeRunning: false,
    liveBadgeVerified: false,
  });

  const [crewChecklist, setCrewChecklist] = useState({
    urlOpened: false,
    teamCodePasted: false,
    joinedSuccessfully: false,
    strategyPlanned: false
  });

  const toggleOwnerCheck = (key: keyof typeof ownerChecklist) => {
    setOwnerChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleDriverCheck = (key: keyof typeof driverChecklist) => {
    setDriverChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleCrewCheck = (key: keyof typeof crewChecklist) => {
    setCrewChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Stopwatch state
  const [stopwatchTime, setStopwatchTime] = useState(0);
  const [stopwatchRunning, setStopwatchRunning] = useState(false);
  const [stopwatchInterval, setStopwatchInterval] = useState<any>(null);
  const [stopwatchLaps, setStopwatchLaps] = useState<string[]>([]);

  const handleStartStop = () => {
    if (stopwatchRunning) {
      clearInterval(stopwatchInterval);
      setStopwatchRunning(false);
    } else {
      const startTime = Date.now() - stopwatchTime;
      const interval = setInterval(() => {
        setStopwatchTime(Date.now() - startTime);
      }, 10);
      setStopwatchInterval(interval);
      setStopwatchRunning(true);
    }
  };

  const handleReset = () => {
    clearInterval(stopwatchInterval);
    setStopwatchRunning(false);
    setStopwatchTime(0);
    setStopwatchLaps([]);
  };

  const handleLap = () => {
    setStopwatchLaps(prev => [formatStopwatchTime(stopwatchTime), ...prev]);
  };

  const formatStopwatchTime = (timeMs: number) => {
    const hours = Math.floor(timeMs / 3600000);
    const minutes = Math.floor((timeMs % 3600000) / 60000);
    const seconds = Math.floor((timeMs % 60000) / 1000);
    const centiseconds = Math.floor((timeMs % 1000) / 10);

    const pad = (num: number, size: number = 2) => num.toString().padStart(size, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}.${pad(centiseconds, 2)}`;
  };

  useEffect(() => {
    return () => {
      if (stopwatchInterval) clearInterval(stopwatchInterval);
    };
  }, [stopwatchInterval]);

  // SQL & Env compiler state variables
  const [ownerSupabaseUrl, setOwnerSupabaseUrl] = useState("https://abcdefghijklm.supabase.co");
  const [ownerSupabaseKey, setOwnerSupabaseKey] = useState("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJp...");
  const [ownerTeamCode, setOwnerTeamCode] = useState("PITWALL-A1B2");
  
  const [driverName, setDriverName] = useState("Danny M");
  const [driverTeamCode, setDriverTeamCode] = useState("PITWALL-A1B2");
  const [driverSupabaseUrl, setDriverSupabaseUrl] = useState("https://abcdefghijklm.supabase.co");
  const [driverSupabaseKey, setDriverSupabaseKey] = useState("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJp...");

  // Copy indicator states
  const [sqlCopied, setSqlCopied] = useState(false);
  const [sqlSimulating, setSqlSimulating] = useState(false);
  const [sqlSimLogs, setSqlSimLogs] = useState<string[]>([]);
  const [envCopied, setEnvCopied] = useState(false);
  const [driverEnvCopied, setDriverEnvCopied] = useState(false);

  // Simulated node bridge terminal logs
  const [bridgeRunning, setBridgeRunning] = useState(false);
  const [bridgeIntervalId, setBridgeIntervalId] = useState<any>(null);
  const [bridgeLogs, setBridgeLogs] = useState<string[]>([
    "SYS_BRIDGE STATUS: IDLE",
    "Enter parameters above and click [RUN TELEMETRY BRIDGE] to spin up pub/sub server simulator."
  ]);
  const simulatedTickRef = useRef(0);
  const terminalBottomRef = useRef<HTMLDivElement>(null);

  const startBridgeSimulation = () => {
    if (bridgeRunning) {
      clearInterval(bridgeIntervalId);
      setBridgeRunning(false);
      setBridgeLogs(prev => [...prev, "[team-relay] ✗ Broadcast server stopped manually. Channel idle."]);
      return;
    }

    setBridgeRunning(true);
    simulatedTickRef.current = 0;
    setBridgeLogs([
      `[team-relay] * Initializing iRacing API reader (driver identification: "${driverName || "ANON_DRIVER"}")...`,
      "[team-relay] * Locating local iRacing instance (memory maps)...",
    ]);

    const logsList = [
      "[team-relay] ✓ Memory mapped file successfully bound. Client SDK v2 active.",
      `[team-relay] * Establishing connection with Supabase Relay (channel: team:${driverTeamCode || "PITWALL-A1B2"})...`,
      "[team-relay] ✓ Handshake verified. Row Security status: AUTHORIZED ANON_PUBLIC",
      `[team-relay] * Connected to channel "team:${driverTeamCode || "PITWALL-A1B2"}" -- publishing at 2Hz`,
    ];

    let step = 0;
    const interval = setInterval(() => {
      if (step < logsList.length) {
        setBridgeLogs(prev => [...prev, logsList[step]]);
        step++;
      } else {
        const speed = Math.floor(220 + Math.random() * 45);
        const gear = speed > 240 ? 6 : 5;
        const rpm = Math.floor(6200 + Math.random() * 1100);
        const fuel = (42.1 - simulatedTickRef.current * 0.04).toFixed(2);
        const tickTime = (simulatedTickRef.current * 0.5).toFixed(1);

        setBridgeLogs(prev => {
          const next = [...prev, `[team-relay] [T+${tickTime}s] PUBLISHING -> SPEED: ${speed} km/h | GEAR: ${gear} | RPM: ${rpm} | FUEL: ${fuel}L | TYRES_OK: true`];
          // prevent memory bloat
          if (next.length > 60) next.shift();
          return next;
        });
        simulatedTickRef.current++;
      }
    }, 500);

    setBridgeIntervalId(interval);
  };

  useEffect(() => {
    if (terminalBottomRef.current) {
      terminalBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [bridgeLogs, sqlSimLogs]);

  useEffect(() => {
    return () => {
      if (bridgeIntervalId) clearInterval(bridgeIntervalId);
    };
  }, [bridgeIntervalId]);

  // SQL schema copy/sim helpers
  const handleCopySql = () => {
    const sqlText = `-- ============================================================
-- Migration: Multi-Driver Team Sessions
-- Creates team_sessions table for the Team Command relay system.
-- Apply via: Supabase Dashboard → SQL Editor → Run
-- ============================================================

CREATE TABLE IF NOT EXISTS public.team_sessions (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  team_code   text        UNIQUE NOT NULL,
  race_name   text        NOT NULL DEFAULT 'Race Session',
  created_by  uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  expires_at  timestamptz NOT NULL DEFAULT (now() + interval '48 hours')
);

CREATE INDEX IF NOT EXISTS team_sessions_code_idx ON public.team_sessions (team_code);

ALTER TABLE public.team_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "team_sessions_read_all"
  ON public.team_sessions
  FOR SELECT
  USING (true);

CREATE POLICY "team_sessions_owner_write"
  ON public.team_sessions
  FOR ALL
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "team_sessions_insert_anon"
  ON public.team_sessions
  FOR INSERT
  WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.team_sessions;`;

    navigator.clipboard.writeText(sqlText);
    setSqlCopied(true);
    setTimeout(() => setSqlCopied(false), 2000);
  };

  const handleSimulateSql = () => {
    if (sqlSimulating) return;
    setSqlSimulating(true);
    setSqlSimLogs([
      "pg_client: Connection string read. Target host: aws-0-eu-west-1.pooler.supabase.com",
      "pg_client: Establishing SSL connection...",
    ]);

    const logs = [
      "pg_client: Handshake complete. SSL_TLSv1.3 enabled. Session ID: 410A88F1",
      "pg_client: SQL Statement Parsed. 13 commands detected.",
      "pg_client: EXEC -> CREATE TABLE public.team_sessions (SUCCESS)",
      "pg_client: EXEC -> CREATE INDEX team_sessions_code_idx (SUCCESS)",
      "pg_client: EXEC -> ALTER TABLE public.team_sessions ENABLE ROW LEVEL SECURITY (SUCCESS)",
      "pg_client: EXEC -> CREATE POLICY team_sessions_read_all (SUCCESS)",
      "pg_client: EXEC -> CREATE POLICY team_sessions_owner_write (SUCCESS)",
      "pg_client: EXEC -> CREATE POLICY team_sessions_insert_anon (SUCCESS)",
      "pg_client: EXEC -> ALTER PUBLICATION supabase_realtime ADD TABLE team_sessions (SUCCESS)",
      "pg_client: Commit complete. 0 warnings. Row migration success."
    ];

    let step = 0;
    const interval = setInterval(() => {
      if (step < logs.length) {
        setSqlSimLogs(prev => [...prev, logs[step]]);
        step++;
      } else {
        clearInterval(interval);
        setSqlSimulating(false);
      }
    }, 400);
  };

  const handleCopyEnv = (isOwner: boolean) => {
    const url = isOwner ? ownerSupabaseUrl : driverSupabaseUrl;
    const key = isOwner ? ownerSupabaseKey : driverSupabaseKey;
    const code = isOwner ? ownerTeamCode : driverTeamCode;
    const name = isOwner ? "" : driverName;

    const envText = `SUPABASE_URL=${url}
SUPABASE_ANON_KEY=${key}
TEAM_CODE=${code}
DRIVER_NAME=${name}`;

    navigator.clipboard.writeText(envText);
    if (isOwner) {
      setEnvCopied(true);
      setTimeout(() => setEnvCopied(false), 2000);
    } else {
      setDriverEnvCopied(true);
      setTimeout(() => setDriverEnvCopied(false), 2000);
    }
  };

  // Teammate Telemetry Hover Inspector State
  const [hoveredField, setHoveredField] = useState<string>("fuel");

  // Diagnostic system errors state
  const [selectedError, setSelectedError] = useState<string>("err01");
  const getDiagnosticLogs = (errId: string) => {
    switch (errId) {
      case "err01":
        return `[team-relay] [CRITICAL] server.js initialization failed:
[team-relay] error_type: CONFIG_ERROR
[team-relay] detail: TEAM_CODE environment variable not set inside local-bridge/.env
[team-relay] exit_code: 1 (fatal)`;
      case "err02":
        return `[team-relay] [CRITICAL] Supabase client initialization failed:
[team-relay] error_type: CREDENTIAL_MISSING
[team-relay] detail: SUPABASE_URL or SUPABASE_ANON_KEY is null or empty string.
[team-relay] exit_code: 1 (fatal)`;
      case "err03":
        return `[team-relay] [WARNING] WebSocket stream handshake failed:
[team-relay] error_type: NET_CONNECT_TIMEOUT
[team-relay] detail: supabase.co channel subscription timed out.
[team-relay] status: Retrying handshake in 5000ms...
[team-relay] [WARNING] SSL certificate handshake check failed or anon key rejected.`;
      case "err04":
        return `[team-relay] [CRITICAL] Realtime relay feed rejected:
[team-relay] error_type: DATABASE_INACTIVE
[team-relay] detail: 403 Forbidden. Supabase project shows status 'PAUSED'.
[team-relay] remedy: Log in at supabase.com/dashboard and restore project to active.`;
      case "info05":
        return `[pit-wall] Teammate status delta:
[pit-wall] vehicle: #83 Ferrari 499P (Danny M)
[pit-wall] status: OFFLINE (last packet received +45.2s ago)
[pit-wall] note: Telemetry bridge server lost connection or shut down.`;
      case "info06":
        return `[pit-wall] Stint planner notification:
[pit-wall] operator: Local strategist edited fuel stint calculator parameters
[pit-wall] note: Stint data calculations are saved in local storage.
[pit-wall] note: To synchronize strategies globally, establish a shared team wall code first.`;
      default:
        return "";
    }
  };

  // Frequently Asked Questions state
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const toggleFaq = (index: number) => {
    setExpandedFaq(prev => (prev === index ? null : index));
  };

  const faqs = [
    {
      q: "Can pit crew members edit the Race Timeline and Stint Calculator?",
      a: "Yes — all pit crew members with the Team Code have full access to the Team Command interface. They can update the timeline, adjust the fuel calculator, and add stint notes. These changes are stored locally in the browser storage. To persist shared edits across all team screens, designate one engineer as the primary strategist operator to prevent manual override conflicts."
    },
    {
      q: "Can two pit crew members cause conflicts by editing the calculator at the same time?",
      a: "Currently, calculator changes are stored in the client browser's local state. Telemetry updates (fuel, tyre temperature/wear, speed, gear, RPM) are shared in real-time because they are published directly by the driver's local bridge to the Supabase channel. Therefore, there is zero backend conflict; they each see the same live telemetry but can run separate strategic simulations independently."
    },
    {
      q: "Does a pit crew member's phone work as a team wall?",
      a: "Yes. Open the app in any mobile browser (Safari, Chrome, Firefox), navigate to the Team page, click '+ Join Team' inside the active HUD header, and input the Team Code. The high-density timing console layout dynamically compresses its panel columns to adapt to smaller screens."
    },
    {
      q: "What happens to the team channel when the race ends?",
      a: "The team channel is ephemeral — it only exists while at least one driver's bridge is connected and broadcasting. When all bridges stop publishing, the channel goes idle. The database team code remains valid for 48 hours before the migration's auto-expiry triggers. You can always generate a fresh code for the next race."
    },
    {
      q: "Can I have separate team codes for separate cars?",
      a: "Yes. There is one team code per active team session. If your organisation is running multiple separate vehicles (e.g. an LMP2 car and a GT3 car) and you want separate timing walls, simply click \"+ Join Team\" -> \"✦ Generate New Code\" for each, keeping two isolated strategy desks."
    },
    {
      q: "We have a co-driver sharing a car. Does anything change?",
      a: "No. When the co-driver takes over the driver's cockpit, they start their own bridge publish script. The team wall automatically detects the incoming stream and switches seamlessly to represent the active pilot and vehicle telemetry when they take the wheel."
    }
  ];

  return (
    <div className="w-full max-w-[100vw] min-h-screen bg-[#05070a] text-[#E2E4E8] flex flex-col font-mono relative select-none overflow-x-hidden p-0 rounded-none border-0">
      {/* Grid scanlines backing */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1C2430_1px,transparent_1px),linear-gradient(to_bottom,#1C2430_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-[0.03] pointer-events-none" />

      {/* Operations Branding Header */}
      <header className="h-10 border-b border-[#1c2430] bg-[#0b0f14] px-3 flex items-center justify-between relative z-10 shrink-0 select-none">
        <div className="flex items-center gap-2">
          <span className="text-white font-black italic tracking-widest text-[11px] bg-gradient-to-r from-red-600 to-red-800 px-1.5 py-0.5 border border-red-500/20 rounded-none font-orbitron">PITWALL</span>
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#7a828c] font-bold font-rajdhani hidden sm:inline">SETUP MANUAL & OPERATIONS CONSOLE</span>
        </div>

        {/* Diagnostic coordinates */}
        <div className="flex items-center gap-6 text-[8.5px] font-rajdhani">
          <div className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-[#3B82F6] shadow-[0_0_6px_#3B82F6]" />
            <span className="font-bold text-[#3B82F6] uppercase tracking-widest text-[9.5px]">SYS_DOC</span>
            <span className="text-[#7a828c] uppercase font-bold hidden md:inline tracking-widest text-[9px]">iRSDK REALTIME RELAY SPEC v2</span>
          </div>

          <div className="h-3 w-px bg-[#1c2430]" />

          <div className="hidden lg:flex items-center gap-1.5 tracking-widest text-[9px]">
            <span className="text-[#7a828c] uppercase">SECURITY LEVEL:</span>
            <span className="font-black text-[#00D17F] font-mono">ANON_AUTH PUBLIC</span>
          </div>
        </div>

        {/* Global Navigation Link Back */}
        <div className="flex items-center gap-3 text-[9px] font-rajdhani">
          <Link 
            to="/team" 
            className="text-[8.5px] font-black text-[#3B82F6] hover:bg-[#3B82F6]/10 uppercase tracking-widest border border-[#3B82F6]/25 bg-[#3B82F6]/5 px-2 py-0.5 rounded-none flex items-center gap-1 transition-all"
          >
            ← BACK TO WALL
          </Link>
        </div>
      </header>

      {/* Main Grid Deck splits into Column 1 (Left), Column 2 (Center), and Column 3 (Right) - Zero Margins */}
      <div 
        className="flex-1 grid gap-0 relative z-10 min-h-0 bg-[#05070a] border-b border-[#1c2430] rounded-none"
        style={{ gridTemplateColumns: "18% 64% 18%" }}
      >
        
        {/* COLUMN 1: TACTICAL ROLE CHANNELS (Left) */}
        <section className="border-r border-[#1c2430] bg-[#0b0f14] flex flex-col justify-start select-none overflow-hidden h-full rounded-none">
          <div className="px-2.5 py-1.5 bg-[#11161d] border-b border-[#1c2430] flex items-center justify-between select-none">
            <span className="text-[9.5px] font-bold tracking-widest text-[#7a828c] uppercase font-rajdhani">
              1 SELECT ROLE CHANNEL
            </span>
          </div>

          {/* Interactive Role Options */}
          <div className="p-1.5 space-y-1.5 flex-1 overflow-y-auto scrollbar-hide">
            {[
              { id: "owner", title: "🏆 TEAM OWNER GUIDE", desc: "Database setup, codes, & pre-filled creds", icon: Database, color: "#FFB800" },
              { id: "driver", title: "🏎️ DRIVER GUIDE", desc: "Place .env file & start bridge relay", icon: CarIcon, color: "#FF4D4D" },
              { id: "crew", title: "🎧 PIT CREW GUIDE", desc: "Join team channel & monitor strategy", icon: Users, color: "#3B82F6" },
              { id: "trouble", title: "🛠️ DIAGNOSTICS & FIXES", desc: "Terminal logs & diagnostic remedies", icon: ShieldAlert, color: "#94A3B8" },
              { id: "faq", title: "❓ FAQS & DECK REF", desc: "FAQ matrix & core file reference sheet", icon: HelpCircle, color: "#00D17F" },
            ].map(tab => {
              const active = activeTab === tab.id;
              return (
                <div
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as ActiveTab)}
                  className={`p-2.5 rounded-none border transition-all text-left relative cursor-pointer group flex items-start gap-2.5 ${
                    active
                      ? "bg-[#3B82F6]/5 border-[#3B82F6]/55 shadow-[0_0_8px_rgba(59,130,246,0.1)]"
                      : "bg-[#05070a]/60 border-[#1c2430] hover:border-[#7a828c]/40 hover:bg-[#11161d]"
                  }`}
                >
                  {/* Status LED line indicator */}
                  {active && (
                    <div 
                      className="absolute left-0 top-0 bottom-0 w-[3px]"
                      style={{ backgroundColor: tab.color }}
                    />
                  )}
                  <div 
                    className="p-1.5 rounded-none bg-[#05070a] border border-[#1c2430] flex items-center justify-center shrink-0"
                    style={{ color: active ? tab.color : "#7a828c" }}
                  >
                    <tab.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[9.5px] font-black text-[#E2E4E8] uppercase tracking-wider block font-rajdhani">
                      {tab.title}
                    </span>
                    <span className="text-[7.5px] font-bold text-[#7a828c] uppercase tracking-wider block mt-0.5 leading-normal">
                      {tab.desc}
                    </span>
                  </div>
                  <ChevronRight 
                    className={`w-3.5 h-3.5 mt-1 shrink-0 transition-transform ${active ? "text-white translate-x-0.5" : "text-[#7a828c] opacity-0 group-hover:opacity-100"}`} 
                  />
                </div>
              );
            })}
          </div>

          {/* Technical Specs Footer */}
          <div className="p-2.5 bg-[#05070a] border-t border-[#1c2430] shrink-0 rounded-none text-[7.5px] font-mono space-y-1">
            <span className="text-[9px] font-bold tracking-[0.2em] text-[#7a828c] uppercase block mb-1 font-rajdhani">
              RELAY PARAMETERS
            </span>
            <div className="flex justify-between border-b border-[#1c2430]/50 pb-0.5">
              <span className="text-[#7a828c]">FREQUENCY:</span>
              <span className="text-white font-bold">2Hz (500MS TICKS)</span>
            </div>
            <div className="flex justify-between border-b border-[#1c2430]/50 pb-0.5">
              <span className="text-[#7a828c]">DB RELAY:</span>
              <span className="text-[#00D17F] font-bold">SUPABASE POSTGRES</span>
            </div>
            <div className="flex justify-between border-b border-[#1c2430]/50 pb-0.5">
              <span className="text-[#7a828c]">AUTHENTICATION:</span>
              <span className="text-white font-bold">JWT ROW-SECURITY</span>
            </div>
            <div className="flex justify-between border-b border-[#1c2430]/50 pb-0.5">
              <span className="text-[#7a828c]">iRSDK BRIDGE:</span>
              <span className="text-[#FF4D4D] font-bold">NODE MEMORY MAP v2</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#7a828c]">CHANNEL METRIC:</span>
              <span className="text-white font-bold font-mono">1.28 GB/M THREAD</span>
            </div>
          </div>
        </section>

        {/* COLUMN 2: OPERATIONAL SETUP MANUAL (Center) */}
        <section className="border-r border-[#1c2430] flex flex-col bg-[#05070a] overflow-hidden h-full rounded-none">
          <div className="px-2.5 py-1.5 bg-[#11161d] border-b border-[#1c2430] shrink-0 flex justify-between items-center select-none">
            <span className="text-[9.5px] font-bold tracking-widest text-[#E2E4E8] uppercase font-rajdhani">
              2 SYSTEM CONSOLE: OPERATIONAL DIRECTIVES & MANUAL
            </span>
            <div className="flex gap-2">
              <span className="text-[7.5px] px-1 bg-red-950/40 text-red-500 border border-red-500/20 font-bold uppercase">OFFICIAL PIT MANUAL</span>
              <span className="text-[7.5px] px-1 bg-slate-900/60 text-[#3B82F6] border border-[#3B82F6]/20 font-bold uppercase">REF: TEAMS.MD</span>
            </div>
          </div>

          {/* Setup Content Surface */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-hide text-left leading-relaxed">

            {/* TAB 1: TEAM OWNER GUIDE */}
            {activeTab === "owner" && (
              <div className="space-y-4">
                {/* Tactical Alert Banner */}
                <div className="p-3 bg-[#FFB800]/5 border border-[#FFB800]/25 rounded-none flex items-start gap-3 relative">
                  <div className="absolute top-0 right-0 h-full w-1.5 bg-[#FFB800]" />
                  <Database className="w-5 h-5 text-[#FFB800] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-[11px] font-black text-white uppercase tracking-wider font-rajdhani">🏆 TEAM OWNER DIRECTIVE</h4>
                    <p className="text-[8.5px] text-[#7a828c] mt-1 font-sans leading-normal">
                      As Team Owner, you are solely responsible for database deployment, schema migrations, anon pub/sub authorization, and distributing team parameters. Drivers and Pit Crew do not need accounts.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Step 1 */}
                  <div className="border border-[#1c2430] bg-[#0b0f14] p-3 rounded-none relative">
                    <div className="absolute top-0 right-0 px-2 py-0.5 bg-[#1c2430] text-[8px] text-[#7a828c] uppercase font-bold font-mono">STEP 01</div>
                    <span className="text-[10px] font-black text-[#FFB800] uppercase tracking-wider font-rajdhani">1. Create a Free Supabase Account</span>
                    <p className="text-[8.5px] text-[#7a828c] mt-1 font-sans leading-normal">
                      Supabase acts as your high-frequency database relay — matching driver telemetry broadcasts to pit crew timing stand displays instantly.
                    </p>
                    <ul className="list-disc list-inside text-[8.5px] text-white mt-2 space-y-1 font-sans pl-1">
                      <li>Go to <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-[#3B82F6] hover:underline font-mono">https://supabase.com</a></li>
                      <li>Click <strong className="font-bold">"Start your project"</strong> and register via GitHub (recommended) or email.</li>
                    </ul>
                    <div className="mt-2.5 p-2 bg-amber-950/20 border border-amber-500/20 text-[8px] text-[#FFB800] rounded-none">
                      <span className="font-bold block uppercase font-rajdhani">💡 Le Mans 24hr note:</span>
                      A full 24-hour race with 6 drivers transmits ~1 million message updates, which falls exactly within Supabase's free tier limit of 2 million free messages. If you want maximum reliability and peace of mind during endurance events, consider upgrading to the Pro Tier ($25/mo) before the green flag and canceling afterwards.
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="border border-[#1c2430] bg-[#0b0f14] p-3 rounded-none relative">
                    <div className="absolute top-0 right-0 px-2 py-0.5 bg-[#1c2430] text-[8px] text-[#7a828c] uppercase font-bold font-mono">STEP 02</div>
                    <span className="text-[10px] font-black text-[#FFB800] uppercase tracking-wider font-rajdhani">2. Create a New Project</span>
                    <p className="text-[8.5px] text-[#7a828c] mt-1 font-sans leading-normal">
                      Initialize a clean hosting cluster to bind your team sessions database.
                    </p>
                    <ul className="list-disc list-inside text-[8.5px] text-white mt-2 space-y-1 font-sans pl-1">
                      <li>In your Supabase dashboard, click <strong className="font-bold">"New project"</strong>.</li>
                      <li>Set project name to <code className="text-white bg-black px-1 font-mono">iRacing-Team</code>.</li>
                      <li>Create a secure database password, and select your closest host region (e.g. Ireland for EU, Virginia for NA).</li>
                      <li>Wait 1-2 minutes for the database cluster to fully provision.</li>
                    </ul>
                  </div>

                  {/* Step 3 & Ingestion Tool */}
                  <div className="border border-[#1c2430] bg-[#0b0f14] p-3 rounded-none relative space-y-3">
                    <div className="absolute top-0 right-0 px-2 py-0.5 bg-[#1c2430] text-[8px] text-[#7a828c] uppercase font-bold font-mono">STEP 03</div>
                    <div>
                      <span className="text-[10px] font-black text-[#FFB800] uppercase tracking-wider font-rajdhani">3. Set Up the Database (SQL Migration Ingestion)</span>
                      <p className="text-[8.5px] text-[#7a828c] mt-1 font-sans leading-normal">
                        Initialize the database table schema required for real-time team synchronization. No database knowledge is required; simply paste the file.
                      </p>
                    </div>

                    {/* SQL Syntax Code block with utility controls */}
                    <div className="border border-[#1c2430] bg-[#05070a] rounded-none overflow-hidden">
                      <div className="bg-[#11161d] border-b border-[#1c2430] px-3 py-1 flex items-center justify-between">
                        <span className="text-[8px] font-bold text-[#7a828c] flex items-center gap-1">
                          <FileCode className="w-3.5 h-3.5 text-[#FFB800]" />
                          supabase/migrations/20260526_team_sessions.sql
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={handleCopySql}
                            className="bg-[#11161d] hover:bg-[#1c2430] border border-[#1c2430] text-[#7a828c] hover:text-white text-[7.5px] px-2 py-0.5 rounded-none flex items-center gap-1 transition-all cursor-pointer font-bold"
                          >
                            {sqlCopied ? <Check className="w-3 h-3 text-[#00D17F]" /> : <Copy className="w-3 h-3" />}
                            {sqlCopied ? "COPIED" : "COPY SQL"}
                          </button>
                          <button
                            onClick={handleSimulateSql}
                            className="bg-[#FFB800]/10 hover:bg-[#FFB800]/20 border border-[#FFB800]/30 text-[#FFB800] text-[7.5px] px-2 py-0.5 rounded-none flex items-center gap-1 transition-all cursor-pointer font-bold"
                          >
                            <Play className="w-3 h-3" />
                            {sqlSimulating ? "RUNNING..." : "SIMULATE INGESTION"}
                          </button>
                        </div>
                      </div>

                      <pre className="p-2.5 text-[8.5px] text-[#7a828c] max-h-48 overflow-y-auto leading-normal bg-black scrollbar-hide font-mono">
{`-- ============================================================
-- Migration: Multi-Driver Team Sessions
-- ============================================================

CREATE TABLE IF NOT EXISTS public.team_sessions (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  team_code   text        UNIQUE NOT NULL,
  race_name   text        NOT NULL DEFAULT 'Race Session',
  created_by  uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  expires_at  timestamptz NOT NULL DEFAULT (now() + interval '48 hours')
);

CREATE INDEX IF NOT EXISTS team_sessions_code_idx ON public.team_sessions (team_code);
ALTER TABLE public.team_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "team_sessions_read_all" ON public.team_sessions FOR SELECT USING (true);
CREATE POLICY "team_sessions_owner_write" ON public.team_sessions FOR ALL USING (auth.uid() = created_by);
CREATE POLICY "team_sessions_insert_anon" ON public.team_sessions FOR INSERT WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.team_sessions;`}
                      </pre>

                      {/* simulated ingestion terminal logs */}
                      {sqlSimLogs.length > 0 && (
                        <div className="bg-[#0b0f14] border-t border-[#1c2430] p-2 font-mono text-[8px] text-[#E2E4E8] space-y-0.5">
                          <span className="text-[#FFB800] font-black uppercase tracking-wider block border-b border-[#1c2430] pb-0.5 mb-1 font-rajdhani">
                            DB TERMINAL STDOUT:
                          </span>
                          {sqlSimLogs.map((log, idx) => (
                            <div key={idx} className="flex gap-1.5">
                              <span className="text-[#7a828c] shrink-0">{`[${idx+1}]`}</span>
                              <span className={log.includes("SUCCESS") || log.includes("success") ? "text-[#00D17F]" : ""}>{log}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="border border-[#1c2430] bg-[#0b0f14] p-3 rounded-none relative">
                    <div className="absolute top-0 right-0 px-2 py-0.5 bg-[#1c2430] text-[8px] text-[#7a828c] uppercase font-bold font-mono">STEP 04</div>
                    <span className="text-[10px] font-black text-[#FFB800] uppercase tracking-wider font-rajdhani">4. Copy API Keys & Generate Team Code</span>
                    <p className="text-[8.5px] text-[#7a828c] mt-1 font-sans leading-normal">
                      Grab the credentials from your Supabase settings and combine them with an active Team Code inside the Paddock HUD.
                    </p>
                    <ol className="list-decimal list-inside text-[8.5px] text-white mt-2 space-y-1.5 font-sans pl-1">
                      <li>Go to your Supabase project dashboard → click <strong className="font-bold">Project Settings (cog icon)</strong> → select <strong className="font-bold">API</strong>.</li>
                      <li>Copy the <strong className="text-[#3B82F6]">Project URL</strong> and the <strong className="text-[#3B82F6]">Anon Public Key</strong> (long token starting with <code className="font-mono text-[8px] bg-black px-1">eyJ</code>).</li>
                      <li>Open this app's **Team Page**, click **"+ Join Team"** at the top right of the HUD, and click **"✦ Generate New Code"** to create a token (e.g. <code className="text-[#FFB800] font-mono">PITWALL-A1B2</code>).</li>
                    </ol>
                    <div className="mt-2 p-2 bg-red-950/20 border border-red-500/20 text-[8px] text-red-400 rounded-none leading-normal">
                      <span className="font-bold block uppercase font-rajdhani">⚠️ SECURITY CONSTRAINT:</span>
                      Only copy the public <code className="font-mono bg-black px-1">anon public</code> key. Never distribute or reference your project's <code className="font-mono bg-black px-1">service_role</code> key. The service role key bypasses Row Level Security and has full admin permissions, posing a database deletion risk if exposed.
                    </div>
                  </div>

                  {/* Step 5 - Dotenv Compiler Compiler */}
                  <div className="border border-[#1c2430] bg-[#0b0f14] p-3 rounded-none relative space-y-3">
                    <div className="absolute top-0 right-0 px-2 py-0.5 bg-[#1c2430] text-[8px] text-[#7a828c] uppercase font-bold font-mono">STEP 05</div>
                    <div>
                      <span className="text-[10px] font-black text-[#FFB800] uppercase tracking-wider font-rajdhani">5. Generate & Distribute the pre-filled .env File</span>
                      <p className="text-[8.5px] text-[#7a828c] mt-1 font-sans leading-normal">
                        Pre-compile the credentials below to automatically generate the config file drivers must place in their bridge directory.
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2.5 p-2.5 bg-[#05070a] border border-[#1c2430] text-[8.5px]">
                      <div className="col-span-3 font-bold text-white uppercase tracking-wider font-rajdhani border-b border-[#1c2430]/60 pb-1">
                        ACTIVE COMPILER FIELDS
                      </div>
                      <div className="col-span-3 sm:col-span-1 flex flex-col gap-1">
                        <label className="text-[#7a828c] uppercase font-bold">SUPABASE URL</label>
                        <input
                          type="text"
                          value={ownerSupabaseUrl}
                          onChange={(e) => setOwnerSupabaseUrl(e.target.value)}
                          className="bg-black border border-[#1c2430] text-white p-1 text-[8.5px] rounded-none focus:outline-none focus:border-[#FFB800] font-mono w-full"
                        />
                      </div>
                      <div className="col-span-3 sm:col-span-1 flex flex-col gap-1">
                        <label className="text-[#7a828c] uppercase font-bold">TEAM CODE</label>
                        <input
                          type="text"
                          value={ownerTeamCode}
                          onChange={(e) => setOwnerTeamCode(e.target.value)}
                          className="bg-black border border-[#1c2430] text-white p-1 text-[8.5px] rounded-none focus:outline-none focus:border-[#FFB800] font-mono w-full"
                        />
                      </div>
                      <div className="col-span-3 sm:col-span-1 flex flex-col gap-1">
                        <label className="text-[#7a828c] uppercase font-bold">ANON PUBLIC KEY</label>
                        <input
                          type="text"
                          value={ownerSupabaseKey}
                          onChange={(e) => setOwnerSupabaseKey(e.target.value)}
                          className="bg-black border border-[#1c2430] text-white p-1 text-[8.5px] rounded-none focus:outline-none focus:border-[#FFB800] font-mono w-full"
                        />
                      </div>
                    </div>

                    {/* Compiled output wrapper */}
                    <div className="border border-[#1c2430] bg-[#05070a] rounded-none overflow-hidden">
                      <div className="bg-[#11161d] border-b border-[#1c2430] px-3 py-1 flex items-center justify-between">
                        <span className="text-[8px] font-bold text-[#7a828c] uppercase font-mono">
                          COMPILED DRIVER FILE OUTPUT: local-bridge/.env
                        </span>
                        <button
                          onClick={() => handleCopyEnv(true)}
                          className="bg-[#FFB800]/10 hover:bg-[#FFB800]/20 border border-[#FFB800]/30 text-[#FFB800] text-[7.5px] px-2 py-0.5 rounded-none flex items-center gap-1 transition-all cursor-pointer font-bold"
                        >
                          {envCopied ? <Check className="w-3 h-3 text-[#00D17F]" /> : <Copy className="w-3 h-3" />}
                          {envCopied ? "COPIED .ENV FILE" : "COPY FILE CONTENT"}
                        </button>
                      </div>
                      <pre className="p-2.5 text-[8.5px] text-[#7a828c] bg-black font-mono leading-normal">
{`SUPABASE_URL=${ownerSupabaseUrl}
SUPABASE_ANON_KEY=${ownerSupabaseKey}
TEAM_CODE=${ownerTeamCode}
DRIVER_NAME=`}
                      </pre>
                    </div>

                    <div className="text-[8.5px] text-[#7a828c] leading-normal font-sans">
                      Save this generated block as a file named <code className="text-[#FF4D4D] font-bold font-mono bg-black px-1 border border-[#1c2430]">.env</code> (make sure it doesn't end in `.env.txt`) and distribute it securely to your drivers. They will place it inside their <code className="font-mono bg-black px-1 text-white">local-bridge/</code> folder.
                    </div>
                  </div>

                  {/* Step 6 & 7 */}
                  <div className="border border-[#1c2430] bg-[#0b0f14] p-3 rounded-none relative">
                    <div className="absolute top-0 right-0 px-2 py-0.5 bg-[#1c2430] text-[8px] text-[#7a828c] uppercase font-bold font-mono">STEP 06</div>
                    <span className="text-[10px] font-black text-[#FFB800] uppercase tracking-wider font-rajdhani">6. Send Pit Crew the Code & Confirm Feeds</span>
                    <p className="text-[8.5px] text-[#7a828c] mt-1 font-sans leading-normal">
                      Share the **Team Code** (e.g. `PITWALL-A1B2`) and your hosted **App URL** to all strategists and pit crew. They open a browser, paste the code, and their dashboards will connect to the active stream automatically.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: DRIVER GUIDE */}
            {activeTab === "driver" && (
              <div className="space-y-4">
                {/* Alert Panel */}
                <div className="p-3 bg-[#FF4D4D]/5 border border-[#FF4D4D]/25 rounded-none flex items-start gap-3 relative">
                  <div className="absolute top-0 right-0 h-full w-1.5 bg-[#FF4D4D]" />
                  <CarIcon className="w-5 h-5 text-[#FF4D4D] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-[11px] font-black text-white uppercase tracking-wider font-rajdhani">🏎️ DRIVER COCKPIT OPERATION</h4>
                    <p className="text-[8.5px] text-[#7a828c] mt-1 font-sans leading-normal">
                      As a team driver, you do not need a database account. Simply place the config file received from your owner, declare your name, and start the local bridge.
                    </p>
                  </div>
                </div>

                {/* Step 1 */}
                <div className="border border-[#1c2430] bg-[#0b0f14] p-3 rounded-none relative space-y-2">
                  <div className="absolute top-0 right-0 px-2 py-0.5 bg-[#1c2430] text-[8px] text-[#7a828c] uppercase font-bold font-mono">STEP 01</div>
                  <span className="text-[10px] font-black text-[#FF4D4D] uppercase tracking-wider font-rajdhani">1. Place the .env Configuration File</span>
                  <p className="text-[8.5px] text-[#7a828c] mt-1 font-sans leading-normal">
                    Save the pre-filled <code className="text-white font-mono bg-black px-1 border border-[#1c2430]">.env</code> file received from your Team Owner directly inside your local bridge directory:
                  </p>
                  
                  {/* Folder Structure ASCII Tree */}
                  <pre className="p-2 bg-black border border-[#1c2430] text-[8.5px] leading-relaxed text-[#7a828c] font-mono">
{`iRacing-Companion/
  ├── src/
  ├── local-bridge/
  │    ├── .env             <-- SAVE FILE DIRECTLY HERE
  │    ├── server.js
  │    ├── package.json
  │    └── package-lock.json
  └── TEAMS.md`}
                  </pre>
                  
                  <div className="p-2 bg-slate-900/60 border border-[#1c2430] text-[8px] text-[#7a828c] rounded-none">
                    <span className="font-bold text-white block uppercase font-rajdhani">💡 Windows Explorer tip:</span>
                    If file name extensions or hidden files are invisible on your OS, click the **View** tab inside File Explorer, and ensure both **"File name extensions"** and **"Hidden items"** are checked so you can rename the file accurately to `.env` (not `.env.txt`).
                  </div>
                </div>

                {/* Step 2 */}
                <div className="border border-[#1c2430] bg-[#0b0f14] p-3 rounded-none relative space-y-3">
                  <div className="absolute top-0 right-0 px-2 py-0.5 bg-[#1c2430] text-[8px] text-[#7a828c] uppercase font-bold font-mono">STEP 02</div>
                  <div>
                    <span className="text-[10px] font-black text-[#FF4D4D] uppercase tracking-wider font-rajdhani">2. Declare Your Pilot Name</span>
                    <p className="text-[8.5px] text-[#7a828c] mt-1 font-sans leading-normal">
                      Open your `.env` file in Notepad and declare your name. The timing stand reads this to identify your vehicle in the live telemetry grid.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 p-2 bg-[#05070a] border border-[#1c2430] text-[8.5px]">
                    <div className="flex flex-col gap-1">
                      <label className="text-[#7a828c] uppercase font-bold">YOUR DRIVER NAME</label>
                      <input
                        type="text"
                        value={driverName}
                        onChange={(e) => setDriverName(e.target.value)}
                        className="bg-black border border-[#1c2430] text-white p-1 text-[8.5px] rounded-none focus:outline-none focus:border-[#FF4D4D] font-mono w-full"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[#7a828c] uppercase font-bold">TEAM CODE</label>
                      <input
                        type="text"
                        value={driverTeamCode}
                        onChange={(e) => setDriverTeamCode(e.target.value)}
                        className="bg-black border border-[#1c2430] text-[#7a828c] p-1 text-[8.5px] rounded-none focus:outline-none font-mono w-full cursor-not-allowed"
                        disabled
                      />
                    </div>
                  </div>

                  {/* Compiled preview */}
                  <div className="border border-[#1c2430] bg-[#05070a] rounded-none overflow-hidden">
                    <div className="bg-[#11161d] border-b border-[#1c2430] px-3 py-1 flex items-center justify-between">
                      <span className="text-[8px] font-bold text-[#7a828c] uppercase font-mono">
                        PREVIEW: local-bridge/.env (MODIFIED)
                      </span>
                      <button
                        onClick={() => handleCopyEnv(false)}
                        className="bg-[#FF4D4D]/10 hover:bg-[#FF4D4D]/20 border border-[#FF4D4D]/30 text-[#FF4D4D] text-[7.5px] px-2 py-0.5 rounded-none flex items-center gap-1 transition-all cursor-pointer font-bold"
                      >
                        {driverEnvCopied ? <Check className="w-3 h-3 text-[#00D17F]" /> : <Copy className="w-3 h-3" />}
                        {driverEnvCopied ? "COPIED" : "COPY CONFIG"}
                      </button>
                    </div>
                    <pre className="p-2.5 text-[8.5px] text-[#7a828c] bg-black font-mono leading-normal">
{`SUPABASE_URL=${driverSupabaseUrl}
SUPABASE_ANON_KEY=${driverSupabaseKey}
TEAM_CODE=${driverTeamCode}
DRIVER_NAME=${driverName}`}
                    </pre>
                  </div>
                </div>

                {/* Step 3 & Simulated bridge terminal */}
                <div className="border border-[#1c2430] bg-[#0b0f14] p-3 rounded-none relative space-y-3">
                  <div className="absolute top-0 right-0 px-2 py-0.5 bg-[#1c2430] text-[8px] text-[#7a828c] uppercase font-bold font-mono">STEP 03</div>
                  <div>
                    <span className="text-[10px] font-black text-[#FF4D4D] uppercase tracking-wider font-rajdhani">3. Start the Publish Bridge (Transmitter Simulation)</span>
                    <p className="text-[8.5px] text-[#7a828c] mt-1 font-sans leading-normal">
                      Open a Command Prompt or Terminal inside your local-bridge folder, and execute `npm start`. You can run our interactive simulation console below to test your connection:
                    </p>
                  </div>

                  {/* Simulator terminal node */}
                  <div className="border border-[#1c2430] bg-black rounded-none overflow-hidden">
                    <div className="bg-[#11161d] border-b border-[#1c2430] px-3 py-1 flex items-center justify-between text-[#7a828c]">
                      <div className="flex items-center gap-1.5 text-[8px] font-bold uppercase">
                        <TerminalIcon className="w-3.5 h-3.5 text-[#FF4D4D]" />
                        Node Server Console — local-bridge/server.js
                      </div>
                      <button
                        onClick={startBridgeSimulation}
                        className={`text-[7.5px] px-2 py-0.5 rounded-none font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                          bridgeRunning
                            ? "bg-red-950/40 text-[#FF4D4D] border-[#FF4D4D]/25"
                            : "bg-[#00D17F]/10 text-[#00D17F] border-[#00D17F]/30"
                        }`}
                      >
                        {bridgeRunning ? <Pause className="w-3 h-3 text-[#FF4D4D] animate-pulse" /> : <Play className="w-3 h-3 text-[#00D17F]" />}
                        {bridgeRunning ? "TERMINATE TRANSMITTER" : "RUN TELEMETRY BRIDGE"}
                      </button>
                    </div>

                    <div className="p-2.5 font-mono text-[8.5px] text-[#E2E4E8] h-40 overflow-y-auto space-y-0.5 leading-normal select-text">
                      {bridgeLogs.map((log, idx) => (
                        <div key={idx} className="flex items-start gap-1">
                          <span className="text-[#7a828c] shrink-0 select-none">{`>`}</span>
                          <span className={
                            log.includes("Connected") || log.includes("PUBLISHING") || log.includes("✓") 
                              ? "text-[#00D17F]" 
                              : log.includes("✗") || log.includes("failed") || log.includes("fatal") 
                              ? "text-[#FF4D4D]" 
                              : "text-[#7a828c]"
                          }>
                            {log}
                          </span>
                        </div>
                      ))}
                      <div ref={terminalBottomRef} />
                    </div>
                  </div>
                  
                  <div className="text-[8.5px] text-[#7a828c] leading-normal font-sans">
                    Once the server console displays the <code className="font-mono bg-black px-1 text-[#00D17F]">✓ Connected to channel</code> tick, you are live. Sit in the cockpit and drive; once on track, your telemetry feeds the pit wall.
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: PIT CREW GUIDE */}
            {activeTab === "crew" && (
              <div className="space-y-4">
                {/* Alert Panel */}
                <div className="p-3 bg-[#3B82F6]/5 border border-[#3B82F6]/25 rounded-none flex items-start gap-3 relative">
                  <div className="absolute top-0 right-0 h-full w-1.5 bg-[#3B82F6]" />
                  <Users className="w-5 h-5 text-[#3B82F6] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-[11px] font-black text-white uppercase tracking-wider font-rajdhani">🎧 PIT CREW & ENGINEER INTERFACE</h4>
                    <p className="text-[8.5px] text-[#7a828c] mt-1 font-sans leading-normal">
                      No software installations, local servers, or config settings are required. Simply launch your web browser on any device and enter the Team Code.
                    </p>
                  </div>
                </div>

                {/* Steps */}
                <div className="border border-[#1c2430] bg-[#0b0f14] p-3 rounded-none relative">
                  <div className="absolute top-0 right-0 px-2 py-0.5 bg-[#1c2430] text-[8px] text-[#7a828c] uppercase font-bold font-mono">STEP 01 - 03</div>
                  <span className="text-[10px] font-black text-[#3B82F6] uppercase tracking-wider font-rajdhani">1. Connect Browser & Input Team Code</span>
                  <p className="text-[8.5px] text-[#7a828c] mt-1 font-sans leading-normal">
                    Open your web browser, load the App URL, and navigate to the **Team Strategy Command**.
                  </p>
                  <ol className="list-decimal list-inside text-[8.5px] text-white mt-2 space-y-1.5 font-sans pl-1">
                    <li>Within the timing desk header in the third column, click **"+ JOIN TEAM"** (or **"🔗 Team"** if a channel was cached).</li>
                    <li>Paste your alphanumeric code (e.g. <code className="font-mono bg-black px-1 text-[#FFB800]">PITWALL-A1B2</code>) and click **"Join"**.</li>
                    <li>Teammate cards and active telemetry slots populate within 2-3 seconds. The code is saved locally in your browser cache for fast future startup.</li>
                  </ol>
                </div>

                {/* Hover Inspector Tool */}
                <div className="border border-[#1c2430] bg-[#0b0f14] p-3 rounded-none relative space-y-3">
                  <div className="absolute top-0 right-0 px-2 py-0.5 bg-[#1c2430] text-[8px] text-[#7a828c] uppercase font-bold font-mono">HOVER INSPECTOR</div>
                  <div>
                    <span className="text-[10px] font-black text-[#3B82F6] uppercase tracking-wider font-rajdhani">Interactive Telemetry Metric Inspector</span>
                    <p className="text-[8.5px] text-[#7a828c] mt-1 font-sans leading-normal">
                      Hover over any parameter inside the timing telemetry card mockup below to retrieve high-density strategical details.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Mock Card */}
                    <div className="border border-[#1c2430] bg-[#05070a] rounded-none overflow-hidden select-none">
                      <div className="bg-[#11161d] border-b border-[#1c2430] px-3 py-1 flex items-center justify-between">
                        <span className="text-[8.5px] font-bold text-white uppercase font-rajdhani">VEHICLE TACKER: #83 FERRARI 499P</span>
                        <span className="text-[7.5px] px-1 bg-[#00D17F]/10 text-[#00D17F] border border-[#00D17F]/20 font-bold uppercase animate-pulse">LIVE</span>
                      </div>

                      <div className="p-3 space-y-3 text-[9px] font-mono">
                        {/* Driver & Status */}
                        <div className="flex justify-between border-b border-[#1c2430]/60 pb-1.5">
                          <span className="text-[#7a828c]">ACTIVE PILOT:</span>
                          <span className="text-white font-bold uppercase">{driverName || "Danny M"}</span>
                        </div>

                        {/* Telemetry sectors */}
                        <div className="grid grid-cols-2 gap-2">
                          {/* Fuel remaining block */}
                          <div 
                            onMouseEnter={() => setHoveredField("fuel")}
                            className={`p-2 border transition-all cursor-pointer ${
                              hoveredField === "fuel" ? "bg-[#3B82F6]/5 border-[#3B82F6]" : "bg-[#0b0f14] border-[#1c2430]"
                            }`}
                          >
                            <span className="text-[7px] text-[#7a828c] uppercase font-bold block">FUEL REMAINING</span>
                            <span className="text-white font-bold block mt-0.5 text-xs">42.12 L</span>
                            <span className="text-[#3B82F6] font-bold block text-[7.5px] mt-0.5 uppercase tracking-wider">~13.4 LAPS STINT</span>
                          </div>

                          {/* Gear/RPM block */}
                          <div 
                            onMouseEnter={() => setHoveredField("gearSpeed")}
                            className={`p-2 border transition-all cursor-pointer ${
                              hoveredField === "gearSpeed" ? "bg-[#3B82F6]/5 border-[#3B82F6]" : "bg-[#0b0f14] border-[#1c2430]"
                            }`}
                          >
                            <span className="text-[7px] text-[#7a828c] uppercase font-bold block">POWERTRAIN DATA</span>
                            <span className="text-white font-bold block mt-0.5 text-xs">GEAR 6</span>
                            <span className="text-[#FF4D4D] font-bold block text-[7.5px] mt-0.5 uppercase tracking-wider">6,840 RPM | 258 KM/H</span>
                          </div>
                        </div>

                        {/* Tyres Temp block */}
                        <div 
                          onMouseEnter={() => setHoveredField("tyreTemps")}
                          className={`p-2 border transition-all cursor-pointer ${
                            hoveredField === "tyreTemps" ? "bg-[#3B82F6]/5 border-[#3B82F6]" : "bg-[#0b0f14] border-[#1c2430]"
                          }`}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[7px] text-[#7a828c] uppercase font-bold">TYRE CORE TEMPS (FL / FR / RL / RR)</span>
                            <span className="size-1.5 rounded-full bg-[#00D17F]" />
                          </div>
                          <div className="grid grid-cols-4 gap-1 text-[8.5px] text-center font-bold">
                            <div className="bg-black/60 border border-[#1c2430] p-0.5 text-[#00D17F]">88°C</div>
                            <div className="bg-black/60 border border-[#1c2430] p-0.5 text-[#00D17F]">92°C</div>
                            <div className="bg-black/60 border border-[#1c2430] p-0.5 text-[#00D17F]">84°C</div>
                            <div className="bg-black/60 border border-[#1c2430] p-0.5 text-[#00D17F]">86°C</div>
                          </div>
                        </div>

                        {/* Tyres Wear block */}
                        <div 
                          onMouseEnter={() => setHoveredField("tyreWear")}
                          className={`p-2 border transition-all cursor-pointer ${
                            hoveredField === "tyreWear" ? "bg-[#3B82F6]/5 border-[#3B82F6]" : "bg-[#0b0f14] border-[#1c2430]"
                          }`}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[7px] text-[#7a828c] uppercase font-bold">TYRE CARCASS WEAR remaining</span>
                            <span className="text-[7.5px] font-bold text-[#00D17F]">OPTIMAL</span>
                          </div>
                          <div className="grid grid-cols-4 gap-1 text-[8.5px] text-center font-bold">
                            <div className="bg-black/60 border border-[#1c2430] p-0.5 text-white">91%</div>
                            <div className="bg-black/60 border border-[#1c2430] p-0.5 text-white">88%</div>
                            <div className="bg-black/60 border border-[#1c2430] p-0.5 text-white">94%</div>
                            <div className="bg-black/60 border border-[#1c2430] p-0.5 text-white">92%</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Inspector Display Panel */}
                    <div className="border border-[#1c2430] bg-[#05070a] p-3 flex flex-col justify-between rounded-none text-[8.5px]">
                      <div>
                        <span className="text-[9px] font-black text-[#3B82F6] uppercase tracking-wider block font-rajdhani border-b border-[#1c2430]/60 pb-1 mb-2">
                          {hoveredField === "fuel" && "⛽ FUEL EXPECTANCY METRICS"}
                          {hoveredField === "gearSpeed" && "⚙️ POWERTRAIN ANALYSIS"}
                          {hoveredField === "tyreTemps" && "🔥 TYRE THERMAL ENVELOPE"}
                          {hoveredField === "tyreWear" && "📊 Compound Degradation limits"}
                        </span>
                        
                        <div className="font-sans leading-relaxed text-[#7a828c]">
                          {hoveredField === "fuel" && (
                            <p>
                              Displays the exact fuel capacity remaining inside the tank in Litres. The companion software continuously recalculates fuel consumption deltas on every completed lap. Strategists should click the <strong className="text-white">"↺ Sync"</strong> button inside the fuel strategy panel to import these numbers directly into the endurance stint planner.
                            </p>
                          )}
                          {hoveredField === "gearSpeed" && (
                            <p>
                              Feeds real-time engine telemetry. Displays selected gear, active engine RPM, and speed in kilometers per hour. Engineers monitor this to ensure drivers are meeting specific fuel targets (e.g. lift-and-coast or early shifting vectors to stretch stint ranges) and checking RPM thresholds to avoid drivetrain component failure.
                            </p>
                          )}
                          {hoveredField === "tyreTemps" && (
                            <p>
                              Represents real-time tread core temperatures. Color bands signal state: <strong className="text-[#00D17F]">GREEN</strong> represents optimal performance (75°C - 100°C); <strong className="text-[#FFB800]">AMBER</strong> warns of under-heating or glazing; <strong className="text-[#FF4D4D]">RED</strong> alerts you to severe sliding, causing blistering and instant traction loss.
                            </p>
                          )}
                          {hoveredField === "tyreWear" && (
                            <p>
                              Exposes the remaining rubber compound wear as a percentage. Use this to predict tyre degradation curves. Strategist alert: when wear falls below 65%, plan a double-stint tyre swap to prevent punctures.
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="mt-3 pt-2 border-t border-[#1c2430]/60 flex items-center justify-between text-[7px] text-[#7a828c]">
                        <span>DATA QUALITY: iRSDK RAW FEED</span>
                        <span>UPDATE RATIO: 2HZ</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: DIAGNOSTICS & FIXES */}
            {activeTab === "trouble" && (
              <div className="space-y-4">
                {/* Alert Panel */}
                <div className="p-3 bg-[#94A3B8]/5 border border-[#94A3B8]/25 rounded-none flex items-start gap-3 relative">
                  <div className="absolute top-0 right-0 h-full w-1.5 bg-[#94A3B8]" />
                  <ShieldAlert className="w-5 h-5 text-[#94A3B8] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-[11px] font-black text-white uppercase tracking-wider font-rajdhani">🛠️ SYSTEM DIAGNOSTIC PANEL</h4>
                    <p className="text-[8.5px] text-[#7a828c] mt-1 font-sans leading-normal">
                      Review standard network relays, key decryption bugs, and connection timeouts below. Select an error code to display log readouts and technical remedies.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex flex-col gap-1 w-full max-w-sm text-[8.5px]">
                    <label className="text-[#7a828c] uppercase font-bold">SELECT ACTIVE SYSTEM ERROR / WARNING</label>
                    <select
                      value={selectedError}
                      onChange={(e) => setSelectedError(e.target.value)}
                      className="bg-[#0b0f14] border border-[#1c2430] text-white p-1 text-[8.5px] rounded-none focus:outline-none focus:border-[#94A3B8] font-mono cursor-pointer"
                    >
                      <option value="err01">ERR_01: Driver Terminal shows "TEAM_CODE not set"</option>
                      <option value="err02">ERR_02: Driver Terminal shows "SUPABASE ANON_KEY missing"</option>
                      <option value="err03">ERR_03: Driver Terminal shows "✗ Channel error" / Web Handshake</option>
                      <option value="err04">ERR_04: Owner / Crew dashboard shows Supabase Project paused</option>
                      <option value="info05">INFO_05: Pit Crew sees a driver card show OFFLINE / Grey status</option>
                      <option value="info06">INFO_06: Local strategy stint adjustments are missing on co-engineer views</option>
                    </select>
                  </div>

                  {/* Diagnostic logs stdout */}
                  <div className="border border-[#1c2430] bg-black rounded-none overflow-hidden font-mono">
                    <div className="bg-[#11161d] border-b border-[#1c2430] px-3 py-1 flex items-center justify-between text-[8px] font-bold text-[#7a828c] uppercase">
                      <span>Diagnostic STDOUT Logger</span>
                      <span className="text-red-400">STATUS: INTERRUPT</span>
                    </div>
                    <pre className="p-2.5 text-[8.5px] text-[#FF4D4D] leading-normal font-mono max-h-36 overflow-y-auto">
                      {getDiagnosticLogs(selectedError)}
                    </pre>
                  </div>

                  {/* Physical Remedy Panel */}
                  <div className="border border-[#1c2430] bg-[#0b0f14] p-3 rounded-none space-y-2">
                    <span className="text-[9px] font-black text-[#94A3B8] uppercase tracking-wider block font-rajdhani">
                      PROPOSED SYSTEM RESOLUTION:
                    </span>
                    <div className="text-[8.5px] text-[#7a828c] font-sans leading-normal">
                      {selectedError === "err01" && (
                        <ul className="list-disc list-inside space-y-1 pl-1 text-white">
                          <li>Open your `.env` config file inside the <code className="font-mono bg-black px-1 text-[#FF4D4D]">local-bridge/</code> folder.</li>
                          <li>Verify that the line <code className="font-mono bg-black px-1">TEAM_CODE=...</code> exists and is filled with your owner's exact generated code.</li>
                          <li>Ensure the file is named exactly <strong className="text-white">.env</strong> and is not a template (like `.env.example`).</li>
                        </ul>
                      )}
                      {selectedError === "err02" && (
                        <ul className="list-disc list-inside space-y-1 pl-1 text-white">
                          <li>Check your `.env` configuration file inside the <code className="font-mono bg-black px-1 text-[#FF4D4D]">local-bridge/</code> folder.</li>
                          <li>Confirm both <code className="font-mono bg-black px-1">SUPABASE_URL=...</code> and <code className="font-mono bg-black px-1">SUPABASE_ANON_KEY=...</code> lines are populated with your project keys.</li>
                          <li>If they are empty, request your Team Owner to re-send the pre-filled config template.</li>
                        </ul>
                      )}
                      {selectedError === "err03" && (
                        <ul className="list-disc list-inside space-y-1 pl-1 text-white">
                          <li>Verify that your PC has an active internet connection.</li>
                          <li>Check with your Team Owner that the Supabase Anon key has not been regenerated or rotated in settings.</li>
                          <li>Confirm that the Supabase Postgres instance is not blocked by a regional corporate VPN or severe firewall configurations.</li>
                        </ul>
                      )}
                      {selectedError === "err04" && (
                        <ul className="list-disc list-inside space-y-1 pl-1 text-white">
                          <li>Free-tier Supabase projects are automatically paused after 7 days of API inactivity.</li>
                          <li>Log in directly at <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-[#3B82F6] hover:underline font-mono">https://supabase.com/dashboard</a>.</li>
                          <li>Select your project block and click the green <strong className="text-[#00D17F]">"Restore project"</strong> button. The restore completes in 1-2 minutes.</li>
                        </ul>
                      )}
                      {selectedError === "info05" && (
                        <ul className="list-disc list-inside space-y-1 pl-1 text-white">
                          <li>This represents a telemetry publishing dropout. The driver's local bridge node script may have been stopped, closed, or experienced an internet hiccup.</li>
                          <li>The driver needs to open their Command Prompt, navigate to the <code className="font-mono bg-black px-1">local-bridge/</code> folder, and run <strong className="text-white">npm start</strong> to restore the feed.</li>
                          <li>The status card will re-connect and switch from grey back to pulsing green automatically.</li>
                        </ul>
                      )}
                      {selectedError === "info06" && (
                        <ul className="list-disc list-inside space-y-1 pl-1 text-white">
                          <li>Stint calculators, endurance checklists, and lap deltas are currently kept within each operator's browser session.</li>
                          <li>This avoids telemetry write-conflicts in high-frequency multi-crew environments.</li>
                          <li>To coordinate strategy changes seamlessly, designate one engineer as the primary strategist operator to run the math deck.</li>
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: FAQS & REFERENCES */}
            {activeTab === "faq" && (
              <div className="space-y-4">
                {/* Alert Panel */}
                <div className="p-3 bg-[#00D17F]/5 border border-[#00D17F]/25 rounded-none flex items-start gap-3 relative">
                  <div className="absolute top-0 right-0 h-full w-1.5 bg-[#00D17F]" />
                  <HelpCircle className="w-5 h-5 text-[#00D17F] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-[11px] font-black text-white uppercase tracking-wider font-rajdhani">❓ DECK DEFIANCE: FREQUENTLY ASKED QUESTIONS</h4>
                    <p className="text-[8.5px] text-[#7a828c] mt-1 font-sans leading-normal">
                      Expose strategy intricacies, timing limits, co-driver telemetry handovers, and full file reference sheets below.
                    </p>
                  </div>
                </div>

                {/* FAQ Deck Accordions */}
                <div className="space-y-2 select-none">
                  {faqs.map((faq, idx) => {
                    const expanded = expandedFaq === idx;
                    return (
                      <div 
                        key={idx}
                        className="border border-[#1c2430] bg-[#0b0f14] rounded-none overflow-hidden"
                      >
                        <div 
                          onClick={() => toggleFaq(idx)}
                          className="px-3 py-2 flex items-center justify-between cursor-pointer hover:bg-[#11161d] transition-colors"
                        >
                          <span className="text-[9px] font-bold text-white uppercase font-rajdhani tracking-wider leading-normal">
                            Q: {faq.q}
                          </span>
                          {expanded ? (
                            <ChevronUp className="w-3.5 h-3.5 text-[#00D17F] shrink-0 ml-2" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-[#7a828c] shrink-0 ml-2" />
                          )}
                        </div>
                        {expanded && (
                          <div className="px-3 pb-3 border-t border-[#1c2430]/60 pt-2 font-sans text-[8.5px] text-[#7a828c] leading-relaxed">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Core File Reference Grid Layout */}
                <div className="border border-[#1c2430] bg-[#0b0f14] p-3 rounded-none space-y-2.5">
                  <span className="text-[9.5px] font-black text-[#00D17F] uppercase tracking-wider block font-rajdhani">
                    📂 CORE DIRECTORY FILE REFERENCE
                  </span>
                  
                  <div className="border border-[#1c2430] rounded-none overflow-hidden text-[8.5px] font-mono">
                    {/* Grid Headings */}
                    <div className="grid grid-cols-12 bg-[#11161d] border-b border-[#1c2430] px-2.5 py-1 text-[#7a828c] font-bold font-rajdhani text-[9px] uppercase tracking-wider">
                      <div className="col-span-5 border-r border-[#1c2430]/60">TARGET FILE PATH</div>
                      <div className="col-span-3 border-r border-[#1c2430]/60 pl-2">FILE CLASSIFICATION</div>
                      <div className="col-span-4 pl-2">TACTICAL FUNCTION</div>
                    </div>

                    {/* Grid Rows */}
                    {[
                      { path: "local-bridge/.env.example", type: "Template Config", func: "Reference config setup file." },
                      { path: "local-bridge/.env", type: "Private Config", func: "Private keys store. Never commit to Git." },
                      { path: "local-bridge/teamRelay.js", type: "Publishing Script", func: "Telemetry publisher engine module." },
                      { path: "local-bridge/server.js", type: "Bridge Host", func: "High-frequency bridge server file." },
                      { path: "supabase/migrations/20260526_team_sessions.sql", type: "Postgres Migration", func: "Ingests required SQL relay tables." },
                    ].map((row, idx) => (
                      <div 
                        key={idx}
                        className={`grid grid-cols-12 px-2.5 py-1.5 border-b border-[#1c2430]/40 last:border-0 ${
                          idx % 2 === 0 ? "bg-[#05070a]/40" : "bg-[#0b0f14]"
                        }`}
                      >
                        <div className="col-span-5 font-bold text-white border-r border-[#1c2430]/30 overflow-hidden text-ellipsis whitespace-nowrap pr-2">
                          {row.path}
                        </div>
                        <div className="col-span-3 text-[#FFB800] font-bold border-r border-[#1c2430]/30 pl-2">
                          {row.type}
                        </div>
                        <div className="col-span-4 text-[#7a828c] pl-2 leading-relaxed">
                          {row.func}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>
        </section>

        {/* COLUMN 3: TACTICAL CHECKLIST DOSSIER (Right) */}
        <section className="col-span-1 bg-[#0b0f14] flex flex-col justify-start select-none overflow-hidden h-full rounded-none">
          <div className="px-2.5 py-1.5 bg-[#11161d] border-b border-[#1c2430] flex items-center justify-between shrink-0 select-none">
            <span className="text-[9.5px] font-bold tracking-widest text-[#7a828c] uppercase font-rajdhani">
              3 INTERACTIVE CHECKLIST
            </span>
          </div>

          {/* Checklist content */}
          <div className="p-3 space-y-4 flex-1 overflow-y-auto scrollbar-hide">
            
            {/* Owner checklist - Highlight if owner guide is active */}
            <div className={`space-y-2 p-1.5 border transition-all ${
              activeTab === "owner" ? "bg-[#FFB800]/5 border-[#FFB800]/25" : "border-transparent"
            }`}>
              <span className="text-[8.5px] font-black text-[#FFB800] uppercase tracking-widest border-b border-[#FFB800]/20 pb-1 block font-rajdhani">
                🏆 OWNER READY CHECKLIST
              </span>
              <div className="space-y-1 font-mono text-[8px] text-[#E2E4E8]">
                {[
                  { id: "supabaseAccount", label: "Create Supabase account" },
                  { id: "projectCreated", label: "Initialize active project" },
                  { id: "sqlSchemaRun", label: "Run SQL migrations schema" },
                  { id: "keysCopied", label: "Copy anon public API keys" },
                  { id: "codeGenerated", label: "Generate PITWALL code" },
                  { id: "envDistributed", label: "Send pre-filled .env" },
                  { id: "bridgeRunning", label: "Start owner local bridge" },
                  { id: "rdyVerify", label: "Verify active team HUD" }
                ].map(item => (
                  <div 
                    key={item.id} 
                    onClick={() => toggleOwnerCheck(item.id as any)}
                    className="flex items-center gap-1.5 cursor-pointer hover:bg-[#11161d] p-0.5 border border-transparent hover:border-[#1c2430] transition-colors"
                  >
                    {ownerChecklist[item.id as keyof typeof ownerChecklist] ? (
                      <CheckSquare className="w-3 h-3 text-[#00D17F] shrink-0" />
                    ) : (
                      <Square className="w-3 h-3 text-[#7a828c] shrink-0" />
                    )}
                    <span className={ownerChecklist[item.id as keyof typeof ownerChecklist] ? "line-through text-[#7a828c] font-bold" : ""}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Driver checklist - Highlight if driver guide is active */}
            <div className={`space-y-2 p-1.5 border transition-all ${
              activeTab === "driver" ? "bg-[#FF4D4D]/5 border-[#FF4D4D]/25" : "border-transparent"
            }`}>
              <span className="text-[8.5px] font-black text-[#FF4D4D] uppercase tracking-widest border-b border-[#FF4D4D]/20 pb-1 block font-rajdhani">
                🏎️ DRIVER ACTIVE FOR RELAY
              </span>
              <div className="space-y-1 font-mono text-[8px] text-[#E2E4E8]">
                {[
                  { id: "envPlaced", label: "Place .env in local-bridge/" },
                  { id: "nameConfigured", label: "Configure DRIVER_NAME" },
                  { id: "bridgeRunning", label: "Run bridge via npm start" },
                  { id: "liveBadgeVerified", label: "Verify Live console badge" },
                ].map(item => (
                  <div 
                    key={item.id} 
                    onClick={() => toggleDriverCheck(item.id as any)}
                    className="flex items-center gap-1.5 cursor-pointer hover:bg-[#11161d] p-0.5 border border-transparent hover:border-[#1c2430] transition-colors"
                  >
                    {driverChecklist[item.id as keyof typeof driverChecklist] ? (
                      <CheckSquare className="w-3 h-3 text-[#00D17F] shrink-0" />
                    ) : (
                      <Square className="w-3 h-3 text-[#7a828c] shrink-0" />
                    )}
                    <span className={driverChecklist[item.id as keyof typeof driverChecklist] ? "line-through text-[#7a828c] font-bold" : ""}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Crew checklist - Highlight if crew guide is active */}
            <div className={`space-y-2 p-1.5 border transition-all ${
              activeTab === "crew" ? "bg-[#3B82F6]/5 border-[#3B82F6]/25" : "border-transparent"
            }`}>
              <span className="text-[8.5px] font-black text-[#3B82F6] uppercase tracking-widest border-b border-[#3B82F6]/20 pb-1 block font-rajdhani">
                🎧 CREW CO-STRATEGY SYNC
              </span>
              <div className="space-y-1 font-mono text-[8px] text-[#E2E4E8]">
                {[
                  { id: "urlOpened", label: "Open browser team page" },
                  { id: "teamCodePasted", label: "Paste team code in HUD" },
                  { id: "joinedSuccessfully", label: "Confirm teammate live feeds" },
                  { id: "strategyPlanned", label: "Configure stint timelines" }
                ].map(item => (
                  <div 
                    key={item.id} 
                    onClick={() => toggleCrewCheck(item.id as any)}
                    className="flex items-center gap-1.5 cursor-pointer hover:bg-[#11161d] p-0.5 border border-transparent hover:border-[#1c2430] transition-colors"
                  >
                    {crewChecklist[item.id as keyof typeof crewChecklist] ? (
                      <CheckSquare className="w-3 h-3 text-[#00D17F] shrink-0" />
                    ) : (
                      <Square className="w-3 h-3 text-[#7a828c] shrink-0" />
                    )}
                    <span className={crewChecklist[item.id as keyof typeof crewChecklist] ? "line-through text-[#7a828c] font-bold" : ""}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Interactive Countdown Timer */}
          <div className="p-2.5 bg-[#05070a] border-t border-[#1c2430] shrink-0 rounded-none">
            <span className="text-[8.5px] font-black text-[#3B82F6] uppercase tracking-[0.2em] block mb-2 font-rajdhani flex items-center gap-1">
              <Timer className="w-3.5 h-3.5 text-[#3B82F6]" />
              TACTICAL PIT CHRONOGRAPH
            </span>
            <div className="text-center bg-[#0b0f14] border border-[#1c2430] p-2 text-white font-mono text-sm font-black tracking-widest font-orbitron select-text">
              {formatStopwatchTime(stopwatchTime)}
            </div>
            
            <div className="grid grid-cols-3 gap-1 mt-2">
              <button 
                type="button"
                onClick={handleStartStop}
                className={`py-1 text-[7.5px] uppercase tracking-widest font-bold rounded-none cursor-pointer transition-all border ${
                  stopwatchRunning
                    ? "bg-red-950/20 text-[#FF4D4D] border-red-500/25 hover:bg-red-950/40"
                    : "bg-[#00D17F]/10 text-[#00D17F] border-[#00D17F]/30 hover:bg-[#00D17F]/20"
                }`}
              >
                {stopwatchRunning ? "PAUSE" : "START"}
              </button>
              <button 
                type="button"
                onClick={handleLap}
                disabled={!stopwatchRunning}
                className="py-1 bg-[#11161d] hover:bg-[#1c2430] border border-[#1c2430] text-[#7a828c] hover:text-white text-[7.5px] uppercase tracking-widest font-bold rounded-none cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                LAP
              </button>
              <button 
                type="button"
                onClick={handleReset}
                className="py-1 bg-[#11161d] hover:bg-[#1c2430] border border-[#1c2430] text-[#7a828c] hover:text-white text-[7.5px] uppercase tracking-widest font-bold rounded-none cursor-pointer transition-all"
              >
                RESET
              </button>
            </div>

            {/* Lap list */}
            {stopwatchLaps.length > 0 && (
              <div className="mt-2 border border-[#1c2430] bg-[#0b0f14] p-1.5 max-h-24 overflow-y-auto font-mono text-[7.5px] scrollbar-hide text-left space-y-0.5">
                <span className="text-[7px] text-[#7a828c] uppercase font-bold block border-b border-[#1c2430] pb-0.5 mb-1 font-rajdhani">
                  RECORDED PIT DELTA LAPS
                </span>
                {stopwatchLaps.map((lap, idx) => (
                  <div key={idx} className="flex justify-between border-b border-[#1c2430]/30 py-0.5 last:border-0">
                    <span className="text-[#7a828c]">LAP {stopwatchLaps.length - idx}</span>
                    <span className="text-white font-bold">{lap}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

      </div>

      {/* Global Status Footer Bar */}
      <footer className="h-6 border-t border-[#1c2430] bg-[#0b0f14] px-3 flex items-center justify-between font-mono text-[7px] text-[#7a828c] relative z-10 shrink-0 select-none uppercase">
        <div className="flex items-center gap-1.5">
          <span className="size-1 bg-[#00D17F] rounded-full animate-pulse" />
          <span>RELAY STATE: IDLE</span>
        </div>
        <div>iRacing Team Relay Companion · 2026</div>
        <div>PIT WALL // SECURE CLIENT RELAY SYSTEM</div>
      </footer>
    </div>
  );
}
