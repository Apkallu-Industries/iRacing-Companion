import { jsxs, jsx } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import {
  Database,
  Car,
  Users,
  ShieldAlert,
  HelpCircle,
  ChevronRight,
  FileCode,
  Check,
  Copy,
  Play,
  Terminal,
  Pause,
  ChevronUp,
  ChevronDown,
  CheckSquare,
  Square,
  Timer,
} from "lucide-react";
function TeamGuidePage() {
  const [activeTab, setActiveTab] = useState("owner");
  const [ownerChecklist, setOwnerChecklist] = useState({
    supabaseAccount: false,
    projectCreated: false,
    sqlSchemaRun: false,
    keysCopied: false,
    codeGenerated: false,
    envDistributed: false,
    bridgeRunning: false,
    rdyVerify: false,
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
    strategyPlanned: false,
  });
  const toggleOwnerCheck = (key) => {
    setOwnerChecklist((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };
  const toggleDriverCheck = (key) => {
    setDriverChecklist((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };
  const toggleCrewCheck = (key) => {
    setCrewChecklist((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };
  const [stopwatchTime, setStopwatchTime] = useState(0);
  const [stopwatchRunning, setStopwatchRunning] = useState(false);
  const [stopwatchInterval, setStopwatchInterval] = useState(null);
  const [stopwatchLaps, setStopwatchLaps] = useState([]);
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
    setStopwatchLaps((prev) => [formatStopwatchTime(stopwatchTime), ...prev]);
  };
  const formatStopwatchTime = (timeMs) => {
    const hours = Math.floor(timeMs / 36e5);
    const minutes = Math.floor((timeMs % 36e5) / 6e4);
    const seconds = Math.floor((timeMs % 6e4) / 1e3);
    const centiseconds = Math.floor((timeMs % 1e3) / 10);
    const pad = (num, size = 2) => num.toString().padStart(size, "0");
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}.${pad(centiseconds, 2)}`;
  };
  useEffect(() => {
    return () => {
      if (stopwatchInterval) clearInterval(stopwatchInterval);
    };
  }, [stopwatchInterval]);
  const [ownerSupabaseUrl, setOwnerSupabaseUrl] = useState("https://abcdefghijklm.supabase.co");
  const [ownerSupabaseKey, setOwnerSupabaseKey] = useState(
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJp...",
  );
  const [ownerTeamCode, setOwnerTeamCode] = useState("PITWALL-A1B2");
  const [driverName, setDriverName] = useState("Danny M");
  const [driverTeamCode, setDriverTeamCode] = useState("PITWALL-A1B2");
  const [driverSupabaseUrl, setDriverSupabaseUrl] = useState("https://abcdefghijklm.supabase.co");
  const [driverSupabaseKey, setDriverSupabaseKey] = useState(
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJp...",
  );
  const [sqlCopied, setSqlCopied] = useState(false);
  const [sqlSimulating, setSqlSimulating] = useState(false);
  const [sqlSimLogs, setSqlSimLogs] = useState([]);
  const [envCopied, setEnvCopied] = useState(false);
  const [driverEnvCopied, setDriverEnvCopied] = useState(false);
  const [bridgeRunning, setBridgeRunning] = useState(false);
  const [bridgeIntervalId, setBridgeIntervalId] = useState(null);
  const [bridgeLogs, setBridgeLogs] = useState([
    "SYS_BRIDGE STATUS: IDLE",
    "Enter parameters above and click [RUN TELEMETRY BRIDGE] to spin up pub/sub server simulator.",
  ]);
  const simulatedTickRef = useRef(0);
  const terminalBottomRef = useRef(null);
  const startBridgeSimulation = () => {
    if (bridgeRunning) {
      clearInterval(bridgeIntervalId);
      setBridgeRunning(false);
      setBridgeLogs((prev) => [
        ...prev,
        "[team-relay] ✗ Broadcast server stopped manually. Channel idle.",
      ]);
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
        setBridgeLogs((prev) => [...prev, logsList[step]]);
        step++;
      } else {
        const speed = Math.floor(220 + Math.random() * 45);
        const gear = speed > 240 ? 6 : 5;
        const rpm = Math.floor(6200 + Math.random() * 1100);
        const fuel = (42.1 - simulatedTickRef.current * 0.04).toFixed(2);
        const tickTime = (simulatedTickRef.current * 0.5).toFixed(1);
        setBridgeLogs((prev) => {
          const next = [
            ...prev,
            `[team-relay] [T+${tickTime}s] PUBLISHING -> SPEED: ${speed} km/h | GEAR: ${gear} | RPM: ${rpm} | FUEL: ${fuel}L | TYRES_OK: true`,
          ];
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
      terminalBottomRef.current.scrollIntoView({
        behavior: "smooth",
      });
    }
  }, [bridgeLogs, sqlSimLogs]);
  useEffect(() => {
    return () => {
      if (bridgeIntervalId) clearInterval(bridgeIntervalId);
    };
  }, [bridgeIntervalId]);
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
    setTimeout(() => setSqlCopied(false), 2e3);
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
      "pg_client: Commit complete. 0 warnings. Row migration success.",
    ];
    let step = 0;
    const interval = setInterval(() => {
      if (step < logs.length) {
        setSqlSimLogs((prev) => [...prev, logs[step]]);
        step++;
      } else {
        clearInterval(interval);
        setSqlSimulating(false);
      }
    }, 400);
  };
  const handleCopyEnv = (isOwner) => {
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
      setTimeout(() => setEnvCopied(false), 2e3);
    } else {
      setDriverEnvCopied(true);
      setTimeout(() => setDriverEnvCopied(false), 2e3);
    }
  };
  const [hoveredField, setHoveredField] = useState("fuel");
  const [selectedError, setSelectedError] = useState("err01");
  const getDiagnosticLogs = (errId) => {
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
  const [expandedFaq, setExpandedFaq] = useState(null);
  const toggleFaq = (index) => {
    setExpandedFaq((prev) => (prev === index ? null : index));
  };
  const faqs = [
    {
      q: "Can pit crew members edit the Race Timeline and Stint Calculator?",
      a: "Yes — all pit crew members with the Team Code have full access to the Team Command interface. They can update the timeline, adjust the fuel calculator, and add stint notes. These changes are stored locally in the browser storage. To persist shared edits across all team screens, designate one engineer as the primary strategist operator to prevent manual override conflicts.",
    },
    {
      q: "Can two pit crew members cause conflicts by editing the calculator at the same time?",
      a: "Currently, calculator changes are stored in the client browser's local state. Telemetry updates (fuel, tyre temperature/wear, speed, gear, RPM) are shared in real-time because they are published directly by the driver's local bridge to the Supabase channel. Therefore, there is zero backend conflict; they each see the same live telemetry but can run separate strategic simulations independently.",
    },
    {
      q: "Does a pit crew member's phone work as a team wall?",
      a: "Yes. Open the app in any mobile browser (Safari, Chrome, Firefox), navigate to the Team page, click '+ Join Team' inside the active HUD header, and input the Team Code. The high-density timing console layout dynamically compresses its panel columns to adapt to smaller screens.",
    },
    {
      q: "What happens to the team channel when the race ends?",
      a: "The team channel is ephemeral — it only exists while at least one driver's bridge is connected and broadcasting. When all bridges stop publishing, the channel goes idle. The database team code remains valid for 48 hours before the migration's auto-expiry triggers. You can always generate a fresh code for the next race.",
    },
    {
      q: "Can I have separate team codes for separate cars?",
      a: 'Yes. There is one team code per active team session. If your organisation is running multiple separate vehicles (e.g. an LMP2 car and a GT3 car) and you want separate timing walls, simply click "+ Join Team" -> "✦ Generate New Code" for each, keeping two isolated strategy desks.',
    },
    {
      q: "We have a co-driver sharing a car. Does anything change?",
      a: "No. When the co-driver takes over the driver's cockpit, they start their own bridge publish script. The team wall automatically detects the incoming stream and switches seamlessly to represent the active pilot and vehicle telemetry when they take the wheel.",
    },
  ];
  return /* @__PURE__ */ jsxs("div", {
    className:
      "w-full max-w-[100vw] min-h-screen bg-[#05070a] text-[#E2E4E8] flex flex-col font-mono relative select-none overflow-x-hidden p-0 rounded-none border-0",
    children: [
      /* @__PURE__ */ jsx("div", {
        className:
          "absolute inset-0 bg-[linear-gradient(to_right,#1C2430_1px,transparent_1px),linear-gradient(to_bottom,#1C2430_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-[0.03] pointer-events-none",
      }),
      /* @__PURE__ */ jsxs("header", {
        className:
          "h-10 border-b border-[#1c2430] bg-[#0b0f14] px-3 flex items-center justify-between relative z-10 shrink-0 select-none",
        children: [
          /* @__PURE__ */ jsxs("div", {
            className: "flex items-center gap-2",
            children: [
              /* @__PURE__ */ jsx("span", {
                className:
                  "text-white font-black italic tracking-widest text-[11px] bg-gradient-to-r from-red-600 to-red-800 px-1.5 py-0.5 border border-red-500/20 rounded-none font-orbitron",
                children: "PITWALL",
              }),
              /* @__PURE__ */ jsx("span", {
                className:
                  "text-[10px] uppercase tracking-[0.3em] text-[#7a828c] font-bold font-rajdhani hidden sm:inline",
                children: "SETUP MANUAL & OPERATIONS CONSOLE",
              }),
            ],
          }),
          /* @__PURE__ */ jsxs("div", {
            className: "flex items-center gap-6 text-[8.5px] font-rajdhani",
            children: [
              /* @__PURE__ */ jsxs("div", {
                className: "flex items-center gap-1.5",
                children: [
                  /* @__PURE__ */ jsx("span", {
                    className: "size-1.5 rounded-full bg-[#3B82F6] shadow-[0_0_6px_#3B82F6]",
                  }),
                  /* @__PURE__ */ jsx("span", {
                    className: "font-bold text-[#3B82F6] uppercase tracking-widest text-[9.5px]",
                    children: "SYS_DOC",
                  }),
                  /* @__PURE__ */ jsx("span", {
                    className:
                      "text-[#7a828c] uppercase font-bold hidden md:inline tracking-widest text-[9px]",
                    children: "iRSDK REALTIME RELAY SPEC v2",
                  }),
                ],
              }),
              /* @__PURE__ */ jsx("div", { className: "h-3 w-px bg-[#1c2430]" }),
              /* @__PURE__ */ jsxs("div", {
                className: "hidden lg:flex items-center gap-1.5 tracking-widest text-[9px]",
                children: [
                  /* @__PURE__ */ jsx("span", {
                    className: "text-[#7a828c] uppercase",
                    children: "SECURITY LEVEL:",
                  }),
                  /* @__PURE__ */ jsx("span", {
                    className: "font-black text-[#00D17F] font-mono",
                    children: "ANON_AUTH PUBLIC",
                  }),
                ],
              }),
            ],
          }),
          /* @__PURE__ */ jsxs("div", {
            className: "flex items-center gap-2 text-[9px] font-rajdhani",
            children: [
              /* @__PURE__ */ jsx(Link, {
                to: "/",
                className:
                  "text-[8.5px] font-black text-[#7a828c] hover:text-white uppercase tracking-widest border border-[#1c2430] bg-[#11161d] px-2 py-0.5 rounded-none flex items-center gap-1 transition-all cursor-pointer hover:bg-zinc-800",
                children: "← MENU",
              }),
              /* @__PURE__ */ jsx(Link, {
                to: "/team",
                className:
                  "text-[8.5px] font-black text-[#3B82F6] hover:bg-[#3B82F6]/10 uppercase tracking-widest border border-[#3B82F6]/25 bg-[#3B82F6]/5 px-2 py-0.5 rounded-none flex items-center gap-1 transition-all",
                children: "← BACK TO WALL",
              }),
            ],
          }),
        ],
      }),
      /* @__PURE__ */ jsxs("div", {
        className:
          "flex-1 grid gap-0 relative z-10 min-h-0 bg-[#05070a] border-b border-[#1c2430] rounded-none",
        style: {
          gridTemplateColumns: "18% 64% 18%",
        },
        children: [
          /* @__PURE__ */ jsxs("section", {
            className:
              "border-r border-[#1c2430] bg-[#0b0f14] flex flex-col justify-start select-none overflow-hidden h-full rounded-none",
            children: [
              /* @__PURE__ */ jsx("div", {
                className:
                  "px-2.5 py-1.5 bg-[#11161d] border-b border-[#1c2430] flex items-center justify-between select-none",
                children: /* @__PURE__ */ jsx("span", {
                  className:
                    "text-[9.5px] font-bold tracking-widest text-[#7a828c] uppercase font-rajdhani",
                  children: "1 SELECT ROLE CHANNEL",
                }),
              }),
              /* @__PURE__ */ jsx("div", {
                className: "p-1.5 space-y-1.5 flex-1 overflow-y-auto scrollbar-hide",
                children: [
                  {
                    id: "owner",
                    title: "🏆 TEAM OWNER GUIDE",
                    desc: "Database setup, codes, & pre-filled creds",
                    icon: Database,
                    color: "#FFB800",
                  },
                  {
                    id: "driver",
                    title: "🏎️ DRIVER GUIDE",
                    desc: "Place .env file & start bridge relay",
                    icon: Car,
                    color: "#FF4D4D",
                  },
                  {
                    id: "crew",
                    title: "🎧 PIT CREW GUIDE",
                    desc: "Join team channel & monitor strategy",
                    icon: Users,
                    color: "#3B82F6",
                  },
                  {
                    id: "trouble",
                    title: "🛠️ DIAGNOSTICS & FIXES",
                    desc: "Terminal logs & diagnostic remedies",
                    icon: ShieldAlert,
                    color: "#94A3B8",
                  },
                  {
                    id: "faq",
                    title: "❓ FAQS & DECK REF",
                    desc: "FAQ matrix & core file reference sheet",
                    icon: HelpCircle,
                    color: "#00D17F",
                  },
                ].map((tab) => {
                  const active = activeTab === tab.id;
                  return /* @__PURE__ */ jsxs(
                    "div",
                    {
                      onClick: () => setActiveTab(tab.id),
                      className: `p-2.5 rounded-none border transition-all text-left relative cursor-pointer group flex items-start gap-2.5 ${active ? "bg-[#3B82F6]/5 border-[#3B82F6]/55 shadow-[0_0_8px_rgba(59,130,246,0.1)]" : "bg-[#05070a]/60 border-[#1c2430] hover:border-[#7a828c]/40 hover:bg-[#11161d]"}`,
                      children: [
                        active &&
                          /* @__PURE__ */ jsx("div", {
                            className: "absolute left-0 top-0 bottom-0 w-[3px]",
                            style: {
                              backgroundColor: tab.color,
                            },
                          }),
                        /* @__PURE__ */ jsx("div", {
                          className:
                            "p-1.5 rounded-none bg-[#05070a] border border-[#1c2430] flex items-center justify-center shrink-0",
                          style: {
                            color: active ? tab.color : "#7a828c",
                          },
                          children: /* @__PURE__ */ jsx(tab.icon, { className: "w-4 h-4" }),
                        }),
                        /* @__PURE__ */ jsxs("div", {
                          className: "flex-1 min-w-0",
                          children: [
                            /* @__PURE__ */ jsx("span", {
                              className:
                                "text-[9.5px] font-black text-[#E2E4E8] uppercase tracking-wider block font-rajdhani",
                              children: tab.title,
                            }),
                            /* @__PURE__ */ jsx("span", {
                              className:
                                "text-[7.5px] font-bold text-[#7a828c] uppercase tracking-wider block mt-0.5 leading-normal",
                              children: tab.desc,
                            }),
                          ],
                        }),
                        /* @__PURE__ */ jsx(ChevronRight, {
                          className: `w-3.5 h-3.5 mt-1 shrink-0 transition-transform ${active ? "text-white translate-x-0.5" : "text-[#7a828c] opacity-0 group-hover:opacity-100"}`,
                        }),
                      ],
                    },
                    tab.id,
                  );
                }),
              }),
              /* @__PURE__ */ jsxs("div", {
                className:
                  "p-2.5 bg-[#05070a] border-t border-[#1c2430] shrink-0 rounded-none text-[7.5px] font-mono space-y-1",
                children: [
                  /* @__PURE__ */ jsx("span", {
                    className:
                      "text-[9px] font-bold tracking-[0.2em] text-[#7a828c] uppercase block mb-1 font-rajdhani",
                    children: "RELAY PARAMETERS",
                  }),
                  /* @__PURE__ */ jsxs("div", {
                    className: "flex justify-between border-b border-[#1c2430]/50 pb-0.5",
                    children: [
                      /* @__PURE__ */ jsx("span", {
                        className: "text-[#7a828c]",
                        children: "FREQUENCY:",
                      }),
                      /* @__PURE__ */ jsx("span", {
                        className: "text-white font-bold",
                        children: "2Hz (500MS TICKS)",
                      }),
                    ],
                  }),
                  /* @__PURE__ */ jsxs("div", {
                    className: "flex justify-between border-b border-[#1c2430]/50 pb-0.5",
                    children: [
                      /* @__PURE__ */ jsx("span", {
                        className: "text-[#7a828c]",
                        children: "DB RELAY:",
                      }),
                      /* @__PURE__ */ jsx("span", {
                        className: "text-[#00D17F] font-bold",
                        children: "SUPABASE POSTGRES",
                      }),
                    ],
                  }),
                  /* @__PURE__ */ jsxs("div", {
                    className: "flex justify-between border-b border-[#1c2430]/50 pb-0.5",
                    children: [
                      /* @__PURE__ */ jsx("span", {
                        className: "text-[#7a828c]",
                        children: "AUTHENTICATION:",
                      }),
                      /* @__PURE__ */ jsx("span", {
                        className: "text-white font-bold",
                        children: "JWT ROW-SECURITY",
                      }),
                    ],
                  }),
                  /* @__PURE__ */ jsxs("div", {
                    className: "flex justify-between border-b border-[#1c2430]/50 pb-0.5",
                    children: [
                      /* @__PURE__ */ jsx("span", {
                        className: "text-[#7a828c]",
                        children: "iRSDK BRIDGE:",
                      }),
                      /* @__PURE__ */ jsx("span", {
                        className: "text-[#FF4D4D] font-bold",
                        children: "NODE MEMORY MAP v2",
                      }),
                    ],
                  }),
                  /* @__PURE__ */ jsxs("div", {
                    className: "flex justify-between",
                    children: [
                      /* @__PURE__ */ jsx("span", {
                        className: "text-[#7a828c]",
                        children: "CHANNEL METRIC:",
                      }),
                      /* @__PURE__ */ jsx("span", {
                        className: "text-white font-bold font-mono",
                        children: "1.28 GB/M THREAD",
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          /* @__PURE__ */ jsxs("section", {
            className:
              "border-r border-[#1c2430] flex flex-col bg-[#05070a] overflow-hidden h-full rounded-none",
            children: [
              /* @__PURE__ */ jsxs("div", {
                className:
                  "px-2.5 py-1.5 bg-[#11161d] border-b border-[#1c2430] shrink-0 flex justify-between items-center select-none",
                children: [
                  /* @__PURE__ */ jsx("span", {
                    className:
                      "text-[9.5px] font-bold tracking-widest text-[#E2E4E8] uppercase font-rajdhani",
                    children: "2 SYSTEM CONSOLE: OPERATIONAL DIRECTIVES & MANUAL",
                  }),
                  /* @__PURE__ */ jsxs("div", {
                    className: "flex gap-2",
                    children: [
                      /* @__PURE__ */ jsx("span", {
                        className:
                          "text-[7.5px] px-1 bg-red-950/40 text-red-500 border border-red-500/20 font-bold uppercase",
                        children: "OFFICIAL PIT MANUAL",
                      }),
                      /* @__PURE__ */ jsx("span", {
                        className:
                          "text-[7.5px] px-1 bg-slate-900/60 text-[#3B82F6] border border-[#3B82F6]/20 font-bold uppercase",
                        children: "REF: TEAMS.MD",
                      }),
                    ],
                  }),
                ],
              }),
              /* @__PURE__ */ jsxs("div", {
                className:
                  "flex-1 overflow-y-auto p-4 space-y-5 scrollbar-hide text-left leading-relaxed",
                children: [
                  activeTab === "owner" &&
                    /* @__PURE__ */ jsxs("div", {
                      className: "space-y-4",
                      children: [
                        /* @__PURE__ */ jsxs("div", {
                          className:
                            "p-3 bg-[#FFB800]/5 border border-[#FFB800]/25 rounded-none flex items-start gap-3 relative",
                          children: [
                            /* @__PURE__ */ jsx("div", {
                              className: "absolute top-0 right-0 h-full w-1.5 bg-[#FFB800]",
                            }),
                            /* @__PURE__ */ jsx(Database, {
                              className: "w-5 h-5 text-[#FFB800] shrink-0 mt-0.5",
                            }),
                            /* @__PURE__ */ jsxs("div", {
                              children: [
                                /* @__PURE__ */ jsx("h4", {
                                  className:
                                    "text-[11px] font-black text-white uppercase tracking-wider font-rajdhani",
                                  children: "🏆 TEAM OWNER DIRECTIVE",
                                }),
                                /* @__PURE__ */ jsx("p", {
                                  className:
                                    "text-[8.5px] text-[#7a828c] mt-1 font-sans leading-normal",
                                  children:
                                    "As Team Owner, you are solely responsible for database deployment, schema migrations, anon pub/sub authorization, and distributing team parameters. Drivers and Pit Crew do not need accounts.",
                                }),
                              ],
                            }),
                          ],
                        }),
                        /* @__PURE__ */ jsxs("div", {
                          className: "space-y-4",
                          children: [
                            /* @__PURE__ */ jsxs("div", {
                              className:
                                "border border-[#1c2430] bg-[#0b0f14] p-3 rounded-none relative",
                              children: [
                                /* @__PURE__ */ jsx("div", {
                                  className:
                                    "absolute top-0 right-0 px-2 py-0.5 bg-[#1c2430] text-[8px] text-[#7a828c] uppercase font-bold font-mono",
                                  children: "STEP 01",
                                }),
                                /* @__PURE__ */ jsx("span", {
                                  className:
                                    "text-[10px] font-black text-[#FFB800] uppercase tracking-wider font-rajdhani",
                                  children: "1. Create a Free Supabase Account",
                                }),
                                /* @__PURE__ */ jsx("p", {
                                  className:
                                    "text-[8.5px] text-[#7a828c] mt-1 font-sans leading-normal",
                                  children:
                                    "Supabase acts as your high-frequency database relay — matching driver telemetry broadcasts to pit crew timing stand displays instantly.",
                                }),
                                /* @__PURE__ */ jsxs("ul", {
                                  className:
                                    "list-disc list-inside text-[8.5px] text-white mt-2 space-y-1 font-sans pl-1",
                                  children: [
                                    /* @__PURE__ */ jsxs("li", {
                                      children: [
                                        "Go to ",
                                        /* @__PURE__ */ jsx("a", {
                                          href: "https://supabase.com",
                                          target: "_blank",
                                          rel: "noopener noreferrer",
                                          className: "text-[#3B82F6] hover:underline font-mono",
                                          children: "https://supabase.com",
                                        }),
                                      ],
                                    }),
                                    /* @__PURE__ */ jsxs("li", {
                                      children: [
                                        "Click ",
                                        /* @__PURE__ */ jsx("strong", {
                                          className: "font-bold",
                                          children: '"Start your project"',
                                        }),
                                        " and register via GitHub (recommended) or email.",
                                      ],
                                    }),
                                  ],
                                }),
                                /* @__PURE__ */ jsxs("div", {
                                  className:
                                    "mt-2.5 p-2 bg-amber-950/20 border border-amber-500/20 text-[8px] text-[#FFB800] rounded-none",
                                  children: [
                                    /* @__PURE__ */ jsx("span", {
                                      className: "font-bold block uppercase font-rajdhani",
                                      children: "💡 Le Mans 24hr note:",
                                    }),
                                    "A full 24-hour race with 6 drivers transmits ~1 million message updates, which falls exactly within Supabase's free tier limit of 2 million free messages. If you want maximum reliability and peace of mind during endurance events, consider upgrading to the Pro Tier ($25/mo) before the green flag and canceling afterwards.",
                                  ],
                                }),
                              ],
                            }),
                            /* @__PURE__ */ jsxs("div", {
                              className:
                                "border border-[#1c2430] bg-[#0b0f14] p-3 rounded-none relative",
                              children: [
                                /* @__PURE__ */ jsx("div", {
                                  className:
                                    "absolute top-0 right-0 px-2 py-0.5 bg-[#1c2430] text-[8px] text-[#7a828c] uppercase font-bold font-mono",
                                  children: "STEP 02",
                                }),
                                /* @__PURE__ */ jsx("span", {
                                  className:
                                    "text-[10px] font-black text-[#FFB800] uppercase tracking-wider font-rajdhani",
                                  children: "2. Create a New Project",
                                }),
                                /* @__PURE__ */ jsx("p", {
                                  className:
                                    "text-[8.5px] text-[#7a828c] mt-1 font-sans leading-normal",
                                  children:
                                    "Initialize a clean hosting cluster to bind your team sessions database.",
                                }),
                                /* @__PURE__ */ jsxs("ul", {
                                  className:
                                    "list-disc list-inside text-[8.5px] text-white mt-2 space-y-1 font-sans pl-1",
                                  children: [
                                    /* @__PURE__ */ jsxs("li", {
                                      children: [
                                        "In your Supabase dashboard, click ",
                                        /* @__PURE__ */ jsx("strong", {
                                          className: "font-bold",
                                          children: '"New project"',
                                        }),
                                        ".",
                                      ],
                                    }),
                                    /* @__PURE__ */ jsxs("li", {
                                      children: [
                                        "Set project name to ",
                                        /* @__PURE__ */ jsx("code", {
                                          className: "text-white bg-black px-1 font-mono",
                                          children: "iRacing-Team",
                                        }),
                                        ".",
                                      ],
                                    }),
                                    /* @__PURE__ */ jsx("li", {
                                      children:
                                        "Create a secure database password, and select your closest host region (e.g. Ireland for EU, Virginia for NA).",
                                    }),
                                    /* @__PURE__ */ jsx("li", {
                                      children:
                                        "Wait 1-2 minutes for the database cluster to fully provision.",
                                    }),
                                  ],
                                }),
                              ],
                            }),
                            /* @__PURE__ */ jsxs("div", {
                              className:
                                "border border-[#1c2430] bg-[#0b0f14] p-3 rounded-none relative space-y-3",
                              children: [
                                /* @__PURE__ */ jsx("div", {
                                  className:
                                    "absolute top-0 right-0 px-2 py-0.5 bg-[#1c2430] text-[8px] text-[#7a828c] uppercase font-bold font-mono",
                                  children: "STEP 03",
                                }),
                                /* @__PURE__ */ jsxs("div", {
                                  children: [
                                    /* @__PURE__ */ jsx("span", {
                                      className:
                                        "text-[10px] font-black text-[#FFB800] uppercase tracking-wider font-rajdhani",
                                      children: "3. Set Up the Database (SQL Migration Ingestion)",
                                    }),
                                    /* @__PURE__ */ jsx("p", {
                                      className:
                                        "text-[8.5px] text-[#7a828c] mt-1 font-sans leading-normal",
                                      children:
                                        "Initialize the database table schema required for real-time team synchronization. No database knowledge is required; simply paste the file.",
                                    }),
                                  ],
                                }),
                                /* @__PURE__ */ jsxs("div", {
                                  className:
                                    "border border-[#1c2430] bg-[#05070a] rounded-none overflow-hidden",
                                  children: [
                                    /* @__PURE__ */ jsxs("div", {
                                      className:
                                        "bg-[#11161d] border-b border-[#1c2430] px-3 py-1 flex items-center justify-between",
                                      children: [
                                        /* @__PURE__ */ jsxs("span", {
                                          className:
                                            "text-[8px] font-bold text-[#7a828c] flex items-center gap-1",
                                          children: [
                                            /* @__PURE__ */ jsx(FileCode, {
                                              className: "w-3.5 h-3.5 text-[#FFB800]",
                                            }),
                                            "supabase/migrations/20260526_team_sessions.sql",
                                          ],
                                        }),
                                        /* @__PURE__ */ jsxs("div", {
                                          className: "flex gap-2",
                                          children: [
                                            /* @__PURE__ */ jsxs("button", {
                                              onClick: handleCopySql,
                                              className:
                                                "bg-[#11161d] hover:bg-[#1c2430] border border-[#1c2430] text-[#7a828c] hover:text-white text-[7.5px] px-2 py-0.5 rounded-none flex items-center gap-1 transition-all cursor-pointer font-bold",
                                              children: [
                                                sqlCopied
                                                  ? /* @__PURE__ */ jsx(Check, {
                                                      className: "w-3 h-3 text-[#00D17F]",
                                                    })
                                                  : /* @__PURE__ */ jsx(Copy, {
                                                      className: "w-3 h-3",
                                                    }),
                                                sqlCopied ? "COPIED" : "COPY SQL",
                                              ],
                                            }),
                                            /* @__PURE__ */ jsxs("button", {
                                              onClick: handleSimulateSql,
                                              className:
                                                "bg-[#FFB800]/10 hover:bg-[#FFB800]/20 border border-[#FFB800]/30 text-[#FFB800] text-[7.5px] px-2 py-0.5 rounded-none flex items-center gap-1 transition-all cursor-pointer font-bold",
                                              children: [
                                                /* @__PURE__ */ jsx(Play, { className: "w-3 h-3" }),
                                                sqlSimulating ? "RUNNING..." : "SIMULATE INGESTION",
                                              ],
                                            }),
                                          ],
                                        }),
                                      ],
                                    }),
                                    /* @__PURE__ */ jsx("pre", {
                                      className:
                                        "p-2.5 text-[8.5px] text-[#7a828c] max-h-48 overflow-y-auto leading-normal bg-black scrollbar-hide font-mono",
                                      children: `-- ============================================================
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

ALTER PUBLICATION supabase_realtime ADD TABLE public.team_sessions;`,
                                    }),
                                    sqlSimLogs.length > 0 &&
                                      /* @__PURE__ */ jsxs("div", {
                                        className:
                                          "bg-[#0b0f14] border-t border-[#1c2430] p-2 font-mono text-[8px] text-[#E2E4E8] space-y-0.5",
                                        children: [
                                          /* @__PURE__ */ jsx("span", {
                                            className:
                                              "text-[#FFB800] font-black uppercase tracking-wider block border-b border-[#1c2430] pb-0.5 mb-1 font-rajdhani",
                                            children: "DB TERMINAL STDOUT:",
                                          }),
                                          sqlSimLogs.map((log, idx) =>
                                            /* @__PURE__ */ jsxs(
                                              "div",
                                              {
                                                className: "flex gap-1.5",
                                                children: [
                                                  /* @__PURE__ */ jsx("span", {
                                                    className: "text-[#7a828c] shrink-0",
                                                    children: `[${idx + 1}]`,
                                                  }),
                                                  /* @__PURE__ */ jsx("span", {
                                                    className:
                                                      log.includes("SUCCESS") ||
                                                      log.includes("success")
                                                        ? "text-[#00D17F]"
                                                        : "",
                                                    children: log,
                                                  }),
                                                ],
                                              },
                                              idx,
                                            ),
                                          ),
                                        ],
                                      }),
                                  ],
                                }),
                              ],
                            }),
                            /* @__PURE__ */ jsxs("div", {
                              className:
                                "border border-[#1c2430] bg-[#0b0f14] p-3 rounded-none relative",
                              children: [
                                /* @__PURE__ */ jsx("div", {
                                  className:
                                    "absolute top-0 right-0 px-2 py-0.5 bg-[#1c2430] text-[8px] text-[#7a828c] uppercase font-bold font-mono",
                                  children: "STEP 04",
                                }),
                                /* @__PURE__ */ jsx("span", {
                                  className:
                                    "text-[10px] font-black text-[#FFB800] uppercase tracking-wider font-rajdhani",
                                  children: "4. Copy API Keys & Generate Team Code",
                                }),
                                /* @__PURE__ */ jsx("p", {
                                  className:
                                    "text-[8.5px] text-[#7a828c] mt-1 font-sans leading-normal",
                                  children:
                                    "Grab the credentials from your Supabase settings and combine them with an active Team Code inside the Paddock HUD.",
                                }),
                                /* @__PURE__ */ jsxs("ol", {
                                  className:
                                    "list-decimal list-inside text-[8.5px] text-white mt-2 space-y-1.5 font-sans pl-1",
                                  children: [
                                    /* @__PURE__ */ jsxs("li", {
                                      children: [
                                        "Go to your Supabase project dashboard → click ",
                                        /* @__PURE__ */ jsx("strong", {
                                          className: "font-bold",
                                          children: "Project Settings (cog icon)",
                                        }),
                                        " → select ",
                                        /* @__PURE__ */ jsx("strong", {
                                          className: "font-bold",
                                          children: "API",
                                        }),
                                        ".",
                                      ],
                                    }),
                                    /* @__PURE__ */ jsxs("li", {
                                      children: [
                                        "Copy the ",
                                        /* @__PURE__ */ jsx("strong", {
                                          className: "text-[#3B82F6]",
                                          children: "Project URL",
                                        }),
                                        " and the ",
                                        /* @__PURE__ */ jsx("strong", {
                                          className: "text-[#3B82F6]",
                                          children: "Anon Public Key",
                                        }),
                                        " (long token starting with ",
                                        /* @__PURE__ */ jsx("code", {
                                          className: "font-mono text-[8px] bg-black px-1",
                                          children: "eyJ",
                                        }),
                                        ").",
                                      ],
                                    }),
                                    /* @__PURE__ */ jsxs("li", {
                                      children: [
                                        `Open this app's **Team Page**, click **"+ Join Team"** at the top right of the HUD, and click **"✦ Generate New Code"** to create a token (e.g. `,
                                        /* @__PURE__ */ jsx("code", {
                                          className: "text-[#FFB800] font-mono",
                                          children: "PITWALL-A1B2",
                                        }),
                                        ").",
                                      ],
                                    }),
                                  ],
                                }),
                                /* @__PURE__ */ jsxs("div", {
                                  className:
                                    "mt-2 p-2 bg-red-950/20 border border-red-500/20 text-[8px] text-red-400 rounded-none leading-normal",
                                  children: [
                                    /* @__PURE__ */ jsx("span", {
                                      className: "font-bold block uppercase font-rajdhani",
                                      children: "⚠️ SECURITY CONSTRAINT:",
                                    }),
                                    "Only copy the public ",
                                    /* @__PURE__ */ jsx("code", {
                                      className: "font-mono bg-black px-1",
                                      children: "anon public",
                                    }),
                                    " key. Never distribute or reference your project's ",
                                    /* @__PURE__ */ jsx("code", {
                                      className: "font-mono bg-black px-1",
                                      children: "service_role",
                                    }),
                                    " key. The service role key bypasses Row Level Security and has full admin permissions, posing a database deletion risk if exposed.",
                                  ],
                                }),
                              ],
                            }),
                            /* @__PURE__ */ jsxs("div", {
                              className:
                                "border border-[#1c2430] bg-[#0b0f14] p-3 rounded-none relative space-y-3",
                              children: [
                                /* @__PURE__ */ jsx("div", {
                                  className:
                                    "absolute top-0 right-0 px-2 py-0.5 bg-[#1c2430] text-[8px] text-[#7a828c] uppercase font-bold font-mono",
                                  children: "STEP 05",
                                }),
                                /* @__PURE__ */ jsxs("div", {
                                  children: [
                                    /* @__PURE__ */ jsx("span", {
                                      className:
                                        "text-[10px] font-black text-[#FFB800] uppercase tracking-wider font-rajdhani",
                                      children: "5. Generate & Distribute the pre-filled .env File",
                                    }),
                                    /* @__PURE__ */ jsx("p", {
                                      className:
                                        "text-[8.5px] text-[#7a828c] mt-1 font-sans leading-normal",
                                      children:
                                        "Pre-compile the credentials below to automatically generate the config file drivers must place in their bridge directory.",
                                    }),
                                  ],
                                }),
                                /* @__PURE__ */ jsxs("div", {
                                  className:
                                    "grid grid-cols-3 gap-2.5 p-2.5 bg-[#05070a] border border-[#1c2430] text-[8.5px]",
                                  children: [
                                    /* @__PURE__ */ jsx("div", {
                                      className:
                                        "col-span-3 font-bold text-white uppercase tracking-wider font-rajdhani border-b border-[#1c2430]/60 pb-1",
                                      children: "ACTIVE COMPILER FIELDS",
                                    }),
                                    /* @__PURE__ */ jsxs("div", {
                                      className: "col-span-3 sm:col-span-1 flex flex-col gap-1",
                                      children: [
                                        /* @__PURE__ */ jsx("label", {
                                          className: "text-[#7a828c] uppercase font-bold",
                                          children: "SUPABASE URL",
                                        }),
                                        /* @__PURE__ */ jsx("input", {
                                          type: "text",
                                          value: ownerSupabaseUrl,
                                          onChange: (e) => setOwnerSupabaseUrl(e.target.value),
                                          className:
                                            "bg-black border border-[#1c2430] text-white p-1 text-[8.5px] rounded-none focus:outline-none focus:border-[#FFB800] font-mono w-full",
                                        }),
                                      ],
                                    }),
                                    /* @__PURE__ */ jsxs("div", {
                                      className: "col-span-3 sm:col-span-1 flex flex-col gap-1",
                                      children: [
                                        /* @__PURE__ */ jsx("label", {
                                          className: "text-[#7a828c] uppercase font-bold",
                                          children: "TEAM CODE",
                                        }),
                                        /* @__PURE__ */ jsx("input", {
                                          type: "text",
                                          value: ownerTeamCode,
                                          onChange: (e) => setOwnerTeamCode(e.target.value),
                                          className:
                                            "bg-black border border-[#1c2430] text-white p-1 text-[8.5px] rounded-none focus:outline-none focus:border-[#FFB800] font-mono w-full",
                                        }),
                                      ],
                                    }),
                                    /* @__PURE__ */ jsxs("div", {
                                      className: "col-span-3 sm:col-span-1 flex flex-col gap-1",
                                      children: [
                                        /* @__PURE__ */ jsx("label", {
                                          className: "text-[#7a828c] uppercase font-bold",
                                          children: "ANON PUBLIC KEY",
                                        }),
                                        /* @__PURE__ */ jsx("input", {
                                          type: "text",
                                          value: ownerSupabaseKey,
                                          onChange: (e) => setOwnerSupabaseKey(e.target.value),
                                          className:
                                            "bg-black border border-[#1c2430] text-white p-1 text-[8.5px] rounded-none focus:outline-none focus:border-[#FFB800] font-mono w-full",
                                        }),
                                      ],
                                    }),
                                  ],
                                }),
                                /* @__PURE__ */ jsxs("div", {
                                  className:
                                    "border border-[#1c2430] bg-[#05070a] rounded-none overflow-hidden",
                                  children: [
                                    /* @__PURE__ */ jsxs("div", {
                                      className:
                                        "bg-[#11161d] border-b border-[#1c2430] px-3 py-1 flex items-center justify-between",
                                      children: [
                                        /* @__PURE__ */ jsx("span", {
                                          className:
                                            "text-[8px] font-bold text-[#7a828c] uppercase font-mono",
                                          children:
                                            "COMPILED DRIVER FILE OUTPUT: local-bridge/.env",
                                        }),
                                        /* @__PURE__ */ jsxs("button", {
                                          onClick: () => handleCopyEnv(true),
                                          className:
                                            "bg-[#FFB800]/10 hover:bg-[#FFB800]/20 border border-[#FFB800]/30 text-[#FFB800] text-[7.5px] px-2 py-0.5 rounded-none flex items-center gap-1 transition-all cursor-pointer font-bold",
                                          children: [
                                            envCopied
                                              ? /* @__PURE__ */ jsx(Check, {
                                                  className: "w-3 h-3 text-[#00D17F]",
                                                })
                                              : /* @__PURE__ */ jsx(Copy, { className: "w-3 h-3" }),
                                            envCopied ? "COPIED .ENV FILE" : "COPY FILE CONTENT",
                                          ],
                                        }),
                                      ],
                                    }),
                                    /* @__PURE__ */ jsx("pre", {
                                      className:
                                        "p-2.5 text-[8.5px] text-[#7a828c] bg-black font-mono leading-normal",
                                      children: `SUPABASE_URL=${ownerSupabaseUrl}
SUPABASE_ANON_KEY=${ownerSupabaseKey}
TEAM_CODE=${ownerTeamCode}
DRIVER_NAME=`,
                                    }),
                                  ],
                                }),
                                /* @__PURE__ */ jsxs("div", {
                                  className: "text-[8.5px] text-[#7a828c] leading-normal font-sans",
                                  children: [
                                    "Save this generated block as a file named ",
                                    /* @__PURE__ */ jsx("code", {
                                      className:
                                        "text-[#FF4D4D] font-bold font-mono bg-black px-1 border border-[#1c2430]",
                                      children: ".env",
                                    }),
                                    " (make sure it doesn't end in `.env.txt`) and distribute it securely to your drivers. They will place it inside their ",
                                    /* @__PURE__ */ jsx("code", {
                                      className: "font-mono bg-black px-1 text-white",
                                      children: "local-bridge/",
                                    }),
                                    " folder.",
                                  ],
                                }),
                              ],
                            }),
                            /* @__PURE__ */ jsxs("div", {
                              className:
                                "border border-[#1c2430] bg-[#0b0f14] p-3 rounded-none relative",
                              children: [
                                /* @__PURE__ */ jsx("div", {
                                  className:
                                    "absolute top-0 right-0 px-2 py-0.5 bg-[#1c2430] text-[8px] text-[#7a828c] uppercase font-bold font-mono",
                                  children: "STEP 06",
                                }),
                                /* @__PURE__ */ jsx("span", {
                                  className:
                                    "text-[10px] font-black text-[#FFB800] uppercase tracking-wider font-rajdhani",
                                  children: "6. Send Pit Crew the Code & Confirm Feeds",
                                }),
                                /* @__PURE__ */ jsx("p", {
                                  className:
                                    "text-[8.5px] text-[#7a828c] mt-1 font-sans leading-normal",
                                  children:
                                    "Share the **Team Code** (e.g. `PITWALL-A1B2`) and your hosted **App URL** to all strategists and pit crew. They open a browser, paste the code, and their dashboards will connect to the active stream automatically.",
                                }),
                              ],
                            }),
                          ],
                        }),
                      ],
                    }),
                  activeTab === "driver" &&
                    /* @__PURE__ */ jsxs("div", {
                      className: "space-y-4",
                      children: [
                        /* @__PURE__ */ jsxs("div", {
                          className:
                            "p-3 bg-[#FF4D4D]/5 border border-[#FF4D4D]/25 rounded-none flex items-start gap-3 relative",
                          children: [
                            /* @__PURE__ */ jsx("div", {
                              className: "absolute top-0 right-0 h-full w-1.5 bg-[#FF4D4D]",
                            }),
                            /* @__PURE__ */ jsx(Car, {
                              className: "w-5 h-5 text-[#FF4D4D] shrink-0 mt-0.5",
                            }),
                            /* @__PURE__ */ jsxs("div", {
                              children: [
                                /* @__PURE__ */ jsx("h4", {
                                  className:
                                    "text-[11px] font-black text-white uppercase tracking-wider font-rajdhani",
                                  children: "🏎️ DRIVER COCKPIT OPERATION",
                                }),
                                /* @__PURE__ */ jsx("p", {
                                  className:
                                    "text-[8.5px] text-[#7a828c] mt-1 font-sans leading-normal",
                                  children:
                                    "As a team driver, you do not need a database account. Simply place the config file received from your owner, declare your name, and start the local bridge.",
                                }),
                              ],
                            }),
                          ],
                        }),
                        /* @__PURE__ */ jsxs("div", {
                          className:
                            "border border-[#1c2430] bg-[#0b0f14] p-3 rounded-none relative space-y-2",
                          children: [
                            /* @__PURE__ */ jsx("div", {
                              className:
                                "absolute top-0 right-0 px-2 py-0.5 bg-[#1c2430] text-[8px] text-[#7a828c] uppercase font-bold font-mono",
                              children: "STEP 01",
                            }),
                            /* @__PURE__ */ jsx("span", {
                              className:
                                "text-[10px] font-black text-[#FF4D4D] uppercase tracking-wider font-rajdhani",
                              children: "1. Place the .env Configuration File",
                            }),
                            /* @__PURE__ */ jsxs("p", {
                              className:
                                "text-[8.5px] text-[#7a828c] mt-1 font-sans leading-normal",
                              children: [
                                "Save the pre-filled ",
                                /* @__PURE__ */ jsx("code", {
                                  className:
                                    "text-white font-mono bg-black px-1 border border-[#1c2430]",
                                  children: ".env",
                                }),
                                " file received from your Team Owner directly inside your local bridge directory:",
                              ],
                            }),
                            /* @__PURE__ */ jsx("pre", {
                              className:
                                "p-2 bg-black border border-[#1c2430] text-[8.5px] leading-relaxed text-[#7a828c] font-mono",
                              children: `iRacing-Companion/
  ├── src/
  ├── local-bridge/
  │    ├── .env             <-- SAVE FILE DIRECTLY HERE
  │    ├── server.js
  │    ├── package.json
  │    └── package-lock.json
  └── TEAMS.md`,
                            }),
                            /* @__PURE__ */ jsxs("div", {
                              className:
                                "p-2 bg-slate-900/60 border border-[#1c2430] text-[8px] text-[#7a828c] rounded-none",
                              children: [
                                /* @__PURE__ */ jsx("span", {
                                  className: "font-bold text-white block uppercase font-rajdhani",
                                  children: "💡 Windows Explorer tip:",
                                }),
                                'If file name extensions or hidden files are invisible on your OS, click the **View** tab inside File Explorer, and ensure both **"File name extensions"** and **"Hidden items"** are checked so you can rename the file accurately to `.env` (not `.env.txt`).',
                              ],
                            }),
                          ],
                        }),
                        /* @__PURE__ */ jsxs("div", {
                          className:
                            "border border-[#1c2430] bg-[#0b0f14] p-3 rounded-none relative space-y-3",
                          children: [
                            /* @__PURE__ */ jsx("div", {
                              className:
                                "absolute top-0 right-0 px-2 py-0.5 bg-[#1c2430] text-[8px] text-[#7a828c] uppercase font-bold font-mono",
                              children: "STEP 02",
                            }),
                            /* @__PURE__ */ jsxs("div", {
                              children: [
                                /* @__PURE__ */ jsx("span", {
                                  className:
                                    "text-[10px] font-black text-[#FF4D4D] uppercase tracking-wider font-rajdhani",
                                  children: "2. Declare Your Pilot Name",
                                }),
                                /* @__PURE__ */ jsx("p", {
                                  className:
                                    "text-[8.5px] text-[#7a828c] mt-1 font-sans leading-normal",
                                  children:
                                    "Open your `.env` file in Notepad and declare your name. The timing stand reads this to identify your vehicle in the live telemetry grid.",
                                }),
                              ],
                            }),
                            /* @__PURE__ */ jsxs("div", {
                              className:
                                "grid grid-cols-2 gap-2.5 p-2 bg-[#05070a] border border-[#1c2430] text-[8.5px]",
                              children: [
                                /* @__PURE__ */ jsxs("div", {
                                  className: "flex flex-col gap-1",
                                  children: [
                                    /* @__PURE__ */ jsx("label", {
                                      className: "text-[#7a828c] uppercase font-bold",
                                      children: "YOUR DRIVER NAME",
                                    }),
                                    /* @__PURE__ */ jsx("input", {
                                      type: "text",
                                      value: driverName,
                                      onChange: (e) => setDriverName(e.target.value),
                                      className:
                                        "bg-black border border-[#1c2430] text-white p-1 text-[8.5px] rounded-none focus:outline-none focus:border-[#FF4D4D] font-mono w-full",
                                    }),
                                  ],
                                }),
                                /* @__PURE__ */ jsxs("div", {
                                  className: "flex flex-col gap-1",
                                  children: [
                                    /* @__PURE__ */ jsx("label", {
                                      className: "text-[#7a828c] uppercase font-bold",
                                      children: "TEAM CODE",
                                    }),
                                    /* @__PURE__ */ jsx("input", {
                                      type: "text",
                                      value: driverTeamCode,
                                      onChange: (e) => setDriverTeamCode(e.target.value),
                                      className:
                                        "bg-black border border-[#1c2430] text-[#7a828c] p-1 text-[8.5px] rounded-none focus:outline-none font-mono w-full cursor-not-allowed",
                                      disabled: true,
                                    }),
                                  ],
                                }),
                              ],
                            }),
                            /* @__PURE__ */ jsxs("div", {
                              className:
                                "border border-[#1c2430] bg-[#05070a] rounded-none overflow-hidden",
                              children: [
                                /* @__PURE__ */ jsxs("div", {
                                  className:
                                    "bg-[#11161d] border-b border-[#1c2430] px-3 py-1 flex items-center justify-between",
                                  children: [
                                    /* @__PURE__ */ jsx("span", {
                                      className:
                                        "text-[8px] font-bold text-[#7a828c] uppercase font-mono",
                                      children: "PREVIEW: local-bridge/.env (MODIFIED)",
                                    }),
                                    /* @__PURE__ */ jsxs("button", {
                                      onClick: () => handleCopyEnv(false),
                                      className:
                                        "bg-[#FF4D4D]/10 hover:bg-[#FF4D4D]/20 border border-[#FF4D4D]/30 text-[#FF4D4D] text-[7.5px] px-2 py-0.5 rounded-none flex items-center gap-1 transition-all cursor-pointer font-bold",
                                      children: [
                                        driverEnvCopied
                                          ? /* @__PURE__ */ jsx(Check, {
                                              className: "w-3 h-3 text-[#00D17F]",
                                            })
                                          : /* @__PURE__ */ jsx(Copy, { className: "w-3 h-3" }),
                                        driverEnvCopied ? "COPIED" : "COPY CONFIG",
                                      ],
                                    }),
                                  ],
                                }),
                                /* @__PURE__ */ jsx("pre", {
                                  className:
                                    "p-2.5 text-[8.5px] text-[#7a828c] bg-black font-mono leading-normal",
                                  children: `SUPABASE_URL=${driverSupabaseUrl}
SUPABASE_ANON_KEY=${driverSupabaseKey}
TEAM_CODE=${driverTeamCode}
DRIVER_NAME=${driverName}`,
                                }),
                              ],
                            }),
                          ],
                        }),
                        /* @__PURE__ */ jsxs("div", {
                          className:
                            "border border-[#1c2430] bg-[#0b0f14] p-3 rounded-none relative space-y-3",
                          children: [
                            /* @__PURE__ */ jsx("div", {
                              className:
                                "absolute top-0 right-0 px-2 py-0.5 bg-[#1c2430] text-[8px] text-[#7a828c] uppercase font-bold font-mono",
                              children: "STEP 03",
                            }),
                            /* @__PURE__ */ jsxs("div", {
                              children: [
                                /* @__PURE__ */ jsx("span", {
                                  className:
                                    "text-[10px] font-black text-[#FF4D4D] uppercase tracking-wider font-rajdhani",
                                  children: "3. Start the Publish Bridge (Transmitter Simulation)",
                                }),
                                /* @__PURE__ */ jsx("p", {
                                  className:
                                    "text-[8.5px] text-[#7a828c] mt-1 font-sans leading-normal",
                                  children:
                                    "Open a Command Prompt or Terminal inside your local-bridge folder, and execute `npm start`. You can run our interactive simulation console below to test your connection:",
                                }),
                              ],
                            }),
                            /* @__PURE__ */ jsxs("div", {
                              className:
                                "border border-[#1c2430] bg-black rounded-none overflow-hidden",
                              children: [
                                /* @__PURE__ */ jsxs("div", {
                                  className:
                                    "bg-[#11161d] border-b border-[#1c2430] px-3 py-1 flex items-center justify-between text-[#7a828c]",
                                  children: [
                                    /* @__PURE__ */ jsxs("div", {
                                      className:
                                        "flex items-center gap-1.5 text-[8px] font-bold uppercase",
                                      children: [
                                        /* @__PURE__ */ jsx(Terminal, {
                                          className: "w-3.5 h-3.5 text-[#FF4D4D]",
                                        }),
                                        "Node Server Console — local-bridge/server.js",
                                      ],
                                    }),
                                    /* @__PURE__ */ jsxs("button", {
                                      onClick: startBridgeSimulation,
                                      className: `text-[7.5px] px-2 py-0.5 rounded-none font-bold border transition-all cursor-pointer flex items-center gap-1 ${bridgeRunning ? "bg-red-950/40 text-[#FF4D4D] border-[#FF4D4D]/25" : "bg-[#00D17F]/10 text-[#00D17F] border-[#00D17F]/30"}`,
                                      children: [
                                        bridgeRunning
                                          ? /* @__PURE__ */ jsx(Pause, {
                                              className: "w-3 h-3 text-[#FF4D4D] animate-pulse",
                                            })
                                          : /* @__PURE__ */ jsx(Play, {
                                              className: "w-3 h-3 text-[#00D17F]",
                                            }),
                                        bridgeRunning
                                          ? "TERMINATE TRANSMITTER"
                                          : "RUN TELEMETRY BRIDGE",
                                      ],
                                    }),
                                  ],
                                }),
                                /* @__PURE__ */ jsxs("div", {
                                  className:
                                    "p-2.5 font-mono text-[8.5px] text-[#E2E4E8] h-40 overflow-y-auto space-y-0.5 leading-normal select-text",
                                  children: [
                                    bridgeLogs.map((log, idx) =>
                                      /* @__PURE__ */ jsxs(
                                        "div",
                                        {
                                          className: "flex items-start gap-1",
                                          children: [
                                            /* @__PURE__ */ jsx("span", {
                                              className: "text-[#7a828c] shrink-0 select-none",
                                              children: `>`,
                                            }),
                                            /* @__PURE__ */ jsx("span", {
                                              className:
                                                log.includes("Connected") ||
                                                log.includes("PUBLISHING") ||
                                                log.includes("✓")
                                                  ? "text-[#00D17F]"
                                                  : log.includes("✗") ||
                                                      log.includes("failed") ||
                                                      log.includes("fatal")
                                                    ? "text-[#FF4D4D]"
                                                    : "text-[#7a828c]",
                                              children: log,
                                            }),
                                          ],
                                        },
                                        idx,
                                      ),
                                    ),
                                    /* @__PURE__ */ jsx("div", { ref: terminalBottomRef }),
                                  ],
                                }),
                              ],
                            }),
                            /* @__PURE__ */ jsxs("div", {
                              className: "text-[8.5px] text-[#7a828c] leading-normal font-sans",
                              children: [
                                "Once the server console displays the ",
                                /* @__PURE__ */ jsx("code", {
                                  className: "font-mono bg-black px-1 text-[#00D17F]",
                                  children: "✓ Connected to channel",
                                }),
                                " tick, you are live. Sit in the cockpit and drive; once on track, your telemetry feeds the pit wall.",
                              ],
                            }),
                          ],
                        }),
                      ],
                    }),
                  activeTab === "crew" &&
                    /* @__PURE__ */ jsxs("div", {
                      className: "space-y-4",
                      children: [
                        /* @__PURE__ */ jsxs("div", {
                          className:
                            "p-3 bg-[#3B82F6]/5 border border-[#3B82F6]/25 rounded-none flex items-start gap-3 relative",
                          children: [
                            /* @__PURE__ */ jsx("div", {
                              className: "absolute top-0 right-0 h-full w-1.5 bg-[#3B82F6]",
                            }),
                            /* @__PURE__ */ jsx(Users, {
                              className: "w-5 h-5 text-[#3B82F6] shrink-0 mt-0.5",
                            }),
                            /* @__PURE__ */ jsxs("div", {
                              children: [
                                /* @__PURE__ */ jsx("h4", {
                                  className:
                                    "text-[11px] font-black text-white uppercase tracking-wider font-rajdhani",
                                  children: "🎧 PIT CREW & ENGINEER INTERFACE",
                                }),
                                /* @__PURE__ */ jsx("p", {
                                  className:
                                    "text-[8.5px] text-[#7a828c] mt-1 font-sans leading-normal",
                                  children:
                                    "No software installations, local servers, or config settings are required. Simply launch your web browser on any device and enter the Team Code.",
                                }),
                              ],
                            }),
                          ],
                        }),
                        /* @__PURE__ */ jsxs("div", {
                          className:
                            "border border-[#1c2430] bg-[#0b0f14] p-3 rounded-none relative",
                          children: [
                            /* @__PURE__ */ jsx("div", {
                              className:
                                "absolute top-0 right-0 px-2 py-0.5 bg-[#1c2430] text-[8px] text-[#7a828c] uppercase font-bold font-mono",
                              children: "STEP 01 - 03",
                            }),
                            /* @__PURE__ */ jsx("span", {
                              className:
                                "text-[10px] font-black text-[#3B82F6] uppercase tracking-wider font-rajdhani",
                              children: "1. Connect Browser & Input Team Code",
                            }),
                            /* @__PURE__ */ jsx("p", {
                              className:
                                "text-[8.5px] text-[#7a828c] mt-1 font-sans leading-normal",
                              children:
                                "Open your web browser, load the App URL, and navigate to the **Team Strategy Command**.",
                            }),
                            /* @__PURE__ */ jsxs("ol", {
                              className:
                                "list-decimal list-inside text-[8.5px] text-white mt-2 space-y-1.5 font-sans pl-1",
                              children: [
                                /* @__PURE__ */ jsx("li", {
                                  children:
                                    'Within the timing desk header in the third column, click **"+ JOIN TEAM"** (or **"🔗 Team"** if a channel was cached).',
                                }),
                                /* @__PURE__ */ jsxs("li", {
                                  children: [
                                    "Paste your alphanumeric code (e.g. ",
                                    /* @__PURE__ */ jsx("code", {
                                      className: "font-mono bg-black px-1 text-[#FFB800]",
                                      children: "PITWALL-A1B2",
                                    }),
                                    ') and click **"Join"**.',
                                  ],
                                }),
                                /* @__PURE__ */ jsx("li", {
                                  children:
                                    "Teammate cards and active telemetry slots populate within 2-3 seconds. The code is saved locally in your browser cache for fast future startup.",
                                }),
                              ],
                            }),
                          ],
                        }),
                        /* @__PURE__ */ jsxs("div", {
                          className:
                            "border border-[#1c2430] bg-[#0b0f14] p-3 rounded-none relative space-y-3",
                          children: [
                            /* @__PURE__ */ jsx("div", {
                              className:
                                "absolute top-0 right-0 px-2 py-0.5 bg-[#1c2430] text-[8px] text-[#7a828c] uppercase font-bold font-mono",
                              children: "HOVER INSPECTOR",
                            }),
                            /* @__PURE__ */ jsxs("div", {
                              children: [
                                /* @__PURE__ */ jsx("span", {
                                  className:
                                    "text-[10px] font-black text-[#3B82F6] uppercase tracking-wider font-rajdhani",
                                  children: "Interactive Telemetry Metric Inspector",
                                }),
                                /* @__PURE__ */ jsx("p", {
                                  className:
                                    "text-[8.5px] text-[#7a828c] mt-1 font-sans leading-normal",
                                  children:
                                    "Hover over any parameter inside the timing telemetry card mockup below to retrieve high-density strategical details.",
                                }),
                              ],
                            }),
                            /* @__PURE__ */ jsxs("div", {
                              className: "grid grid-cols-1 md:grid-cols-2 gap-4",
                              children: [
                                /* @__PURE__ */ jsxs("div", {
                                  className:
                                    "border border-[#1c2430] bg-[#05070a] rounded-none overflow-hidden select-none",
                                  children: [
                                    /* @__PURE__ */ jsxs("div", {
                                      className:
                                        "bg-[#11161d] border-b border-[#1c2430] px-3 py-1 flex items-center justify-between",
                                      children: [
                                        /* @__PURE__ */ jsx("span", {
                                          className:
                                            "text-[8.5px] font-bold text-white uppercase font-rajdhani",
                                          children: "VEHICLE TACKER: #83 FERRARI 499P",
                                        }),
                                        /* @__PURE__ */ jsx("span", {
                                          className:
                                            "text-[7.5px] px-1 bg-[#00D17F]/10 text-[#00D17F] border border-[#00D17F]/20 font-bold uppercase animate-pulse",
                                          children: "LIVE",
                                        }),
                                      ],
                                    }),
                                    /* @__PURE__ */ jsxs("div", {
                                      className: "p-3 space-y-3 text-[9px] font-mono",
                                      children: [
                                        /* @__PURE__ */ jsxs("div", {
                                          className:
                                            "flex justify-between border-b border-[#1c2430]/60 pb-1.5",
                                          children: [
                                            /* @__PURE__ */ jsx("span", {
                                              className: "text-[#7a828c]",
                                              children: "ACTIVE PILOT:",
                                            }),
                                            /* @__PURE__ */ jsx("span", {
                                              className: "text-white font-bold uppercase",
                                              children: driverName || "Danny M",
                                            }),
                                          ],
                                        }),
                                        /* @__PURE__ */ jsxs("div", {
                                          className: "grid grid-cols-2 gap-2",
                                          children: [
                                            /* @__PURE__ */ jsxs("div", {
                                              onMouseEnter: () => setHoveredField("fuel"),
                                              className: `p-2 border transition-all cursor-pointer ${hoveredField === "fuel" ? "bg-[#3B82F6]/5 border-[#3B82F6]" : "bg-[#0b0f14] border-[#1c2430]"}`,
                                              children: [
                                                /* @__PURE__ */ jsx("span", {
                                                  className:
                                                    "text-[7px] text-[#7a828c] uppercase font-bold block",
                                                  children: "FUEL REMAINING",
                                                }),
                                                /* @__PURE__ */ jsx("span", {
                                                  className:
                                                    "text-white font-bold block mt-0.5 text-xs",
                                                  children: "42.12 L",
                                                }),
                                                /* @__PURE__ */ jsx("span", {
                                                  className:
                                                    "text-[#3B82F6] font-bold block text-[7.5px] mt-0.5 uppercase tracking-wider",
                                                  children: "~13.4 LAPS STINT",
                                                }),
                                              ],
                                            }),
                                            /* @__PURE__ */ jsxs("div", {
                                              onMouseEnter: () => setHoveredField("gearSpeed"),
                                              className: `p-2 border transition-all cursor-pointer ${hoveredField === "gearSpeed" ? "bg-[#3B82F6]/5 border-[#3B82F6]" : "bg-[#0b0f14] border-[#1c2430]"}`,
                                              children: [
                                                /* @__PURE__ */ jsx("span", {
                                                  className:
                                                    "text-[7px] text-[#7a828c] uppercase font-bold block",
                                                  children: "POWERTRAIN DATA",
                                                }),
                                                /* @__PURE__ */ jsx("span", {
                                                  className:
                                                    "text-white font-bold block mt-0.5 text-xs",
                                                  children: "GEAR 6",
                                                }),
                                                /* @__PURE__ */ jsx("span", {
                                                  className:
                                                    "text-[#FF4D4D] font-bold block text-[7.5px] mt-0.5 uppercase tracking-wider",
                                                  children: "6,840 RPM | 258 KM/H",
                                                }),
                                              ],
                                            }),
                                          ],
                                        }),
                                        /* @__PURE__ */ jsxs("div", {
                                          onMouseEnter: () => setHoveredField("tyreTemps"),
                                          className: `p-2 border transition-all cursor-pointer ${hoveredField === "tyreTemps" ? "bg-[#3B82F6]/5 border-[#3B82F6]" : "bg-[#0b0f14] border-[#1c2430]"}`,
                                          children: [
                                            /* @__PURE__ */ jsxs("div", {
                                              className: "flex justify-between items-center mb-1",
                                              children: [
                                                /* @__PURE__ */ jsx("span", {
                                                  className:
                                                    "text-[7px] text-[#7a828c] uppercase font-bold",
                                                  children: "TYRE CORE TEMPS (FL / FR / RL / RR)",
                                                }),
                                                /* @__PURE__ */ jsx("span", {
                                                  className: "size-1.5 rounded-full bg-[#00D17F]",
                                                }),
                                              ],
                                            }),
                                            /* @__PURE__ */ jsxs("div", {
                                              className:
                                                "grid grid-cols-4 gap-1 text-[8.5px] text-center font-bold",
                                              children: [
                                                /* @__PURE__ */ jsx("div", {
                                                  className:
                                                    "bg-black/60 border border-[#1c2430] p-0.5 text-[#00D17F]",
                                                  children: "88°C",
                                                }),
                                                /* @__PURE__ */ jsx("div", {
                                                  className:
                                                    "bg-black/60 border border-[#1c2430] p-0.5 text-[#00D17F]",
                                                  children: "92°C",
                                                }),
                                                /* @__PURE__ */ jsx("div", {
                                                  className:
                                                    "bg-black/60 border border-[#1c2430] p-0.5 text-[#00D17F]",
                                                  children: "84°C",
                                                }),
                                                /* @__PURE__ */ jsx("div", {
                                                  className:
                                                    "bg-black/60 border border-[#1c2430] p-0.5 text-[#00D17F]",
                                                  children: "86°C",
                                                }),
                                              ],
                                            }),
                                          ],
                                        }),
                                        /* @__PURE__ */ jsxs("div", {
                                          onMouseEnter: () => setHoveredField("tyreWear"),
                                          className: `p-2 border transition-all cursor-pointer ${hoveredField === "tyreWear" ? "bg-[#3B82F6]/5 border-[#3B82F6]" : "bg-[#0b0f14] border-[#1c2430]"}`,
                                          children: [
                                            /* @__PURE__ */ jsxs("div", {
                                              className: "flex justify-between items-center mb-1",
                                              children: [
                                                /* @__PURE__ */ jsx("span", {
                                                  className:
                                                    "text-[7px] text-[#7a828c] uppercase font-bold",
                                                  children: "TYRE CARCASS WEAR remaining",
                                                }),
                                                /* @__PURE__ */ jsx("span", {
                                                  className:
                                                    "text-[7.5px] font-bold text-[#00D17F]",
                                                  children: "OPTIMAL",
                                                }),
                                              ],
                                            }),
                                            /* @__PURE__ */ jsxs("div", {
                                              className:
                                                "grid grid-cols-4 gap-1 text-[8.5px] text-center font-bold",
                                              children: [
                                                /* @__PURE__ */ jsx("div", {
                                                  className:
                                                    "bg-black/60 border border-[#1c2430] p-0.5 text-white",
                                                  children: "91%",
                                                }),
                                                /* @__PURE__ */ jsx("div", {
                                                  className:
                                                    "bg-black/60 border border-[#1c2430] p-0.5 text-white",
                                                  children: "88%",
                                                }),
                                                /* @__PURE__ */ jsx("div", {
                                                  className:
                                                    "bg-black/60 border border-[#1c2430] p-0.5 text-white",
                                                  children: "94%",
                                                }),
                                                /* @__PURE__ */ jsx("div", {
                                                  className:
                                                    "bg-black/60 border border-[#1c2430] p-0.5 text-white",
                                                  children: "92%",
                                                }),
                                              ],
                                            }),
                                          ],
                                        }),
                                      ],
                                    }),
                                  ],
                                }),
                                /* @__PURE__ */ jsxs("div", {
                                  className:
                                    "border border-[#1c2430] bg-[#05070a] p-3 flex flex-col justify-between rounded-none text-[8.5px]",
                                  children: [
                                    /* @__PURE__ */ jsxs("div", {
                                      children: [
                                        /* @__PURE__ */ jsxs("span", {
                                          className:
                                            "text-[9px] font-black text-[#3B82F6] uppercase tracking-wider block font-rajdhani border-b border-[#1c2430]/60 pb-1 mb-2",
                                          children: [
                                            hoveredField === "fuel" && "⛽ FUEL EXPECTANCY METRICS",
                                            hoveredField === "gearSpeed" &&
                                              "⚙️ POWERTRAIN ANALYSIS",
                                            hoveredField === "tyreTemps" &&
                                              "🔥 TYRE THERMAL ENVELOPE",
                                            hoveredField === "tyreWear" &&
                                              "📊 Compound Degradation limits",
                                          ],
                                        }),
                                        /* @__PURE__ */ jsxs("div", {
                                          className: "font-sans leading-relaxed text-[#7a828c]",
                                          children: [
                                            hoveredField === "fuel" &&
                                              /* @__PURE__ */ jsxs("p", {
                                                children: [
                                                  "Displays the exact fuel capacity remaining inside the tank in Litres. The companion software continuously recalculates fuel consumption deltas on every completed lap. Strategists should click the ",
                                                  /* @__PURE__ */ jsx("strong", {
                                                    className: "text-white",
                                                    children: '"↺ Sync"',
                                                  }),
                                                  " button inside the fuel strategy panel to import these numbers directly into the endurance stint planner.",
                                                ],
                                              }),
                                            hoveredField === "gearSpeed" &&
                                              /* @__PURE__ */ jsx("p", {
                                                children:
                                                  "Feeds real-time engine telemetry. Displays selected gear, active engine RPM, and speed in kilometers per hour. Engineers monitor this to ensure drivers are meeting specific fuel targets (e.g. lift-and-coast or early shifting vectors to stretch stint ranges) and checking RPM thresholds to avoid drivetrain component failure.",
                                              }),
                                            hoveredField === "tyreTemps" &&
                                              /* @__PURE__ */ jsxs("p", {
                                                children: [
                                                  "Represents real-time tread core temperatures. Color bands signal state: ",
                                                  /* @__PURE__ */ jsx("strong", {
                                                    className: "text-[#00D17F]",
                                                    children: "GREEN",
                                                  }),
                                                  " represents optimal performance (75°C - 100°C); ",
                                                  /* @__PURE__ */ jsx("strong", {
                                                    className: "text-[#FFB800]",
                                                    children: "AMBER",
                                                  }),
                                                  " warns of under-heating or glazing; ",
                                                  /* @__PURE__ */ jsx("strong", {
                                                    className: "text-[#FF4D4D]",
                                                    children: "RED",
                                                  }),
                                                  " alerts you to severe sliding, causing blistering and instant traction loss.",
                                                ],
                                              }),
                                            hoveredField === "tyreWear" &&
                                              /* @__PURE__ */ jsx("p", {
                                                children:
                                                  "Exposes the remaining rubber compound wear as a percentage. Use this to predict tyre degradation curves. Strategist alert: when wear falls below 65%, plan a double-stint tyre swap to prevent punctures.",
                                              }),
                                          ],
                                        }),
                                      ],
                                    }),
                                    /* @__PURE__ */ jsxs("div", {
                                      className:
                                        "mt-3 pt-2 border-t border-[#1c2430]/60 flex items-center justify-between text-[7px] text-[#7a828c]",
                                      children: [
                                        /* @__PURE__ */ jsx("span", {
                                          children: "DATA QUALITY: iRSDK RAW FEED",
                                        }),
                                        /* @__PURE__ */ jsx("span", {
                                          children: "UPDATE RATIO: 2HZ",
                                        }),
                                      ],
                                    }),
                                  ],
                                }),
                              ],
                            }),
                          ],
                        }),
                      ],
                    }),
                  activeTab === "trouble" &&
                    /* @__PURE__ */ jsxs("div", {
                      className: "space-y-4",
                      children: [
                        /* @__PURE__ */ jsxs("div", {
                          className:
                            "p-3 bg-[#94A3B8]/5 border border-[#94A3B8]/25 rounded-none flex items-start gap-3 relative",
                          children: [
                            /* @__PURE__ */ jsx("div", {
                              className: "absolute top-0 right-0 h-full w-1.5 bg-[#94A3B8]",
                            }),
                            /* @__PURE__ */ jsx(ShieldAlert, {
                              className: "w-5 h-5 text-[#94A3B8] shrink-0 mt-0.5",
                            }),
                            /* @__PURE__ */ jsxs("div", {
                              children: [
                                /* @__PURE__ */ jsx("h4", {
                                  className:
                                    "text-[11px] font-black text-white uppercase tracking-wider font-rajdhani",
                                  children: "🛠️ SYSTEM DIAGNOSTIC PANEL",
                                }),
                                /* @__PURE__ */ jsx("p", {
                                  className:
                                    "text-[8.5px] text-[#7a828c] mt-1 font-sans leading-normal",
                                  children:
                                    "Review standard network relays, key decryption bugs, and connection timeouts below. Select an error code to display log readouts and technical remedies.",
                                }),
                              ],
                            }),
                          ],
                        }),
                        /* @__PURE__ */ jsxs("div", {
                          className: "space-y-3",
                          children: [
                            /* @__PURE__ */ jsxs("div", {
                              className: "flex flex-col gap-1 w-full max-w-sm text-[8.5px]",
                              children: [
                                /* @__PURE__ */ jsx("label", {
                                  className: "text-[#7a828c] uppercase font-bold",
                                  children: "SELECT ACTIVE SYSTEM ERROR / WARNING",
                                }),
                                /* @__PURE__ */ jsxs("select", {
                                  value: selectedError,
                                  onChange: (e) => setSelectedError(e.target.value),
                                  className:
                                    "bg-[#0b0f14] border border-[#1c2430] text-white p-1 text-[8.5px] rounded-none focus:outline-none focus:border-[#94A3B8] font-mono cursor-pointer",
                                  children: [
                                    /* @__PURE__ */ jsx("option", {
                                      value: "err01",
                                      children: 'ERR_01: Driver Terminal shows "TEAM_CODE not set"',
                                    }),
                                    /* @__PURE__ */ jsx("option", {
                                      value: "err02",
                                      children:
                                        'ERR_02: Driver Terminal shows "SUPABASE ANON_KEY missing"',
                                    }),
                                    /* @__PURE__ */ jsx("option", {
                                      value: "err03",
                                      children:
                                        'ERR_03: Driver Terminal shows "✗ Channel error" / Web Handshake',
                                    }),
                                    /* @__PURE__ */ jsx("option", {
                                      value: "err04",
                                      children:
                                        "ERR_04: Owner / Crew dashboard shows Supabase Project paused",
                                    }),
                                    /* @__PURE__ */ jsx("option", {
                                      value: "info05",
                                      children:
                                        "INFO_05: Pit Crew sees a driver card show OFFLINE / Grey status",
                                    }),
                                    /* @__PURE__ */ jsx("option", {
                                      value: "info06",
                                      children:
                                        "INFO_06: Local strategy stint adjustments are missing on co-engineer views",
                                    }),
                                  ],
                                }),
                              ],
                            }),
                            /* @__PURE__ */ jsxs("div", {
                              className:
                                "border border-[#1c2430] bg-black rounded-none overflow-hidden font-mono",
                              children: [
                                /* @__PURE__ */ jsxs("div", {
                                  className:
                                    "bg-[#11161d] border-b border-[#1c2430] px-3 py-1 flex items-center justify-between text-[8px] font-bold text-[#7a828c] uppercase",
                                  children: [
                                    /* @__PURE__ */ jsx("span", {
                                      children: "Diagnostic STDOUT Logger",
                                    }),
                                    /* @__PURE__ */ jsx("span", {
                                      className: "text-red-400",
                                      children: "STATUS: INTERRUPT",
                                    }),
                                  ],
                                }),
                                /* @__PURE__ */ jsx("pre", {
                                  className:
                                    "p-2.5 text-[8.5px] text-[#FF4D4D] leading-normal font-mono max-h-36 overflow-y-auto",
                                  children: getDiagnosticLogs(selectedError),
                                }),
                              ],
                            }),
                            /* @__PURE__ */ jsxs("div", {
                              className:
                                "border border-[#1c2430] bg-[#0b0f14] p-3 rounded-none space-y-2",
                              children: [
                                /* @__PURE__ */ jsx("span", {
                                  className:
                                    "text-[9px] font-black text-[#94A3B8] uppercase tracking-wider block font-rajdhani",
                                  children: "PROPOSED SYSTEM RESOLUTION:",
                                }),
                                /* @__PURE__ */ jsxs("div", {
                                  className: "text-[8.5px] text-[#7a828c] font-sans leading-normal",
                                  children: [
                                    selectedError === "err01" &&
                                      /* @__PURE__ */ jsxs("ul", {
                                        className:
                                          "list-disc list-inside space-y-1 pl-1 text-white",
                                        children: [
                                          /* @__PURE__ */ jsxs("li", {
                                            children: [
                                              "Open your `.env` config file inside the ",
                                              /* @__PURE__ */ jsx("code", {
                                                className: "font-mono bg-black px-1 text-[#FF4D4D]",
                                                children: "local-bridge/",
                                              }),
                                              " folder.",
                                            ],
                                          }),
                                          /* @__PURE__ */ jsxs("li", {
                                            children: [
                                              "Verify that the line ",
                                              /* @__PURE__ */ jsx("code", {
                                                className: "font-mono bg-black px-1",
                                                children: "TEAM_CODE=...",
                                              }),
                                              " exists and is filled with your owner's exact generated code.",
                                            ],
                                          }),
                                          /* @__PURE__ */ jsxs("li", {
                                            children: [
                                              "Ensure the file is named exactly ",
                                              /* @__PURE__ */ jsx("strong", {
                                                className: "text-white",
                                                children: ".env",
                                              }),
                                              " and is not a template (like `.env.example`).",
                                            ],
                                          }),
                                        ],
                                      }),
                                    selectedError === "err02" &&
                                      /* @__PURE__ */ jsxs("ul", {
                                        className:
                                          "list-disc list-inside space-y-1 pl-1 text-white",
                                        children: [
                                          /* @__PURE__ */ jsxs("li", {
                                            children: [
                                              "Check your `.env` configuration file inside the ",
                                              /* @__PURE__ */ jsx("code", {
                                                className: "font-mono bg-black px-1 text-[#FF4D4D]",
                                                children: "local-bridge/",
                                              }),
                                              " folder.",
                                            ],
                                          }),
                                          /* @__PURE__ */ jsxs("li", {
                                            children: [
                                              "Confirm both ",
                                              /* @__PURE__ */ jsx("code", {
                                                className: "font-mono bg-black px-1",
                                                children: "SUPABASE_URL=...",
                                              }),
                                              " and ",
                                              /* @__PURE__ */ jsx("code", {
                                                className: "font-mono bg-black px-1",
                                                children: "SUPABASE_ANON_KEY=...",
                                              }),
                                              " lines are populated with your project keys.",
                                            ],
                                          }),
                                          /* @__PURE__ */ jsx("li", {
                                            children:
                                              "If they are empty, request your Team Owner to re-send the pre-filled config template.",
                                          }),
                                        ],
                                      }),
                                    selectedError === "err03" &&
                                      /* @__PURE__ */ jsxs("ul", {
                                        className:
                                          "list-disc list-inside space-y-1 pl-1 text-white",
                                        children: [
                                          /* @__PURE__ */ jsx("li", {
                                            children:
                                              "Verify that your PC has an active internet connection.",
                                          }),
                                          /* @__PURE__ */ jsx("li", {
                                            children:
                                              "Check with your Team Owner that the Supabase Anon key has not been regenerated or rotated in settings.",
                                          }),
                                          /* @__PURE__ */ jsx("li", {
                                            children:
                                              "Confirm that the Supabase Postgres instance is not blocked by a regional corporate VPN or severe firewall configurations.",
                                          }),
                                        ],
                                      }),
                                    selectedError === "err04" &&
                                      /* @__PURE__ */ jsxs("ul", {
                                        className:
                                          "list-disc list-inside space-y-1 pl-1 text-white",
                                        children: [
                                          /* @__PURE__ */ jsx("li", {
                                            children:
                                              "Free-tier Supabase projects are automatically paused after 7 days of API inactivity.",
                                          }),
                                          /* @__PURE__ */ jsxs("li", {
                                            children: [
                                              "Log in directly at ",
                                              /* @__PURE__ */ jsx("a", {
                                                href: "https://supabase.com/dashboard",
                                                target: "_blank",
                                                rel: "noopener noreferrer",
                                                className:
                                                  "text-[#3B82F6] hover:underline font-mono",
                                                children: "https://supabase.com/dashboard",
                                              }),
                                              ".",
                                            ],
                                          }),
                                          /* @__PURE__ */ jsxs("li", {
                                            children: [
                                              "Select your project block and click the green ",
                                              /* @__PURE__ */ jsx("strong", {
                                                className: "text-[#00D17F]",
                                                children: '"Restore project"',
                                              }),
                                              " button. The restore completes in 1-2 minutes.",
                                            ],
                                          }),
                                        ],
                                      }),
                                    selectedError === "info05" &&
                                      /* @__PURE__ */ jsxs("ul", {
                                        className:
                                          "list-disc list-inside space-y-1 pl-1 text-white",
                                        children: [
                                          /* @__PURE__ */ jsx("li", {
                                            children:
                                              "This represents a telemetry publishing dropout. The driver's local bridge node script may have been stopped, closed, or experienced an internet hiccup.",
                                          }),
                                          /* @__PURE__ */ jsxs("li", {
                                            children: [
                                              "The driver needs to open their Command Prompt, navigate to the ",
                                              /* @__PURE__ */ jsx("code", {
                                                className: "font-mono bg-black px-1",
                                                children: "local-bridge/",
                                              }),
                                              " folder, and run ",
                                              /* @__PURE__ */ jsx("strong", {
                                                className: "text-white",
                                                children: "npm start",
                                              }),
                                              " to restore the feed.",
                                            ],
                                          }),
                                          /* @__PURE__ */ jsx("li", {
                                            children:
                                              "The status card will re-connect and switch from grey back to pulsing green automatically.",
                                          }),
                                        ],
                                      }),
                                    selectedError === "info06" &&
                                      /* @__PURE__ */ jsxs("ul", {
                                        className:
                                          "list-disc list-inside space-y-1 pl-1 text-white",
                                        children: [
                                          /* @__PURE__ */ jsx("li", {
                                            children:
                                              "Stint calculators, endurance checklists, and lap deltas are currently kept within each operator's browser session.",
                                          }),
                                          /* @__PURE__ */ jsx("li", {
                                            children:
                                              "This avoids telemetry write-conflicts in high-frequency multi-crew environments.",
                                          }),
                                          /* @__PURE__ */ jsx("li", {
                                            children:
                                              "To coordinate strategy changes seamlessly, designate one engineer as the primary strategist operator to run the math deck.",
                                          }),
                                        ],
                                      }),
                                  ],
                                }),
                              ],
                            }),
                          ],
                        }),
                      ],
                    }),
                  activeTab === "faq" &&
                    /* @__PURE__ */ jsxs("div", {
                      className: "space-y-4",
                      children: [
                        /* @__PURE__ */ jsxs("div", {
                          className:
                            "p-3 bg-[#00D17F]/5 border border-[#00D17F]/25 rounded-none flex items-start gap-3 relative",
                          children: [
                            /* @__PURE__ */ jsx("div", {
                              className: "absolute top-0 right-0 h-full w-1.5 bg-[#00D17F]",
                            }),
                            /* @__PURE__ */ jsx(HelpCircle, {
                              className: "w-5 h-5 text-[#00D17F] shrink-0 mt-0.5",
                            }),
                            /* @__PURE__ */ jsxs("div", {
                              children: [
                                /* @__PURE__ */ jsx("h4", {
                                  className:
                                    "text-[11px] font-black text-white uppercase tracking-wider font-rajdhani",
                                  children: "❓ DECK DEFIANCE: FREQUENTLY ASKED QUESTIONS",
                                }),
                                /* @__PURE__ */ jsx("p", {
                                  className:
                                    "text-[8.5px] text-[#7a828c] mt-1 font-sans leading-normal",
                                  children:
                                    "Expose strategy intricacies, timing limits, co-driver telemetry handovers, and full file reference sheets below.",
                                }),
                              ],
                            }),
                          ],
                        }),
                        /* @__PURE__ */ jsx("div", {
                          className: "space-y-2 select-none",
                          children: faqs.map((faq, idx) => {
                            const expanded = expandedFaq === idx;
                            return /* @__PURE__ */ jsxs(
                              "div",
                              {
                                className:
                                  "border border-[#1c2430] bg-[#0b0f14] rounded-none overflow-hidden",
                                children: [
                                  /* @__PURE__ */ jsxs("div", {
                                    onClick: () => toggleFaq(idx),
                                    className:
                                      "px-3 py-2 flex items-center justify-between cursor-pointer hover:bg-[#11161d] transition-colors",
                                    children: [
                                      /* @__PURE__ */ jsxs("span", {
                                        className:
                                          "text-[9px] font-bold text-white uppercase font-rajdhani tracking-wider leading-normal",
                                        children: ["Q: ", faq.q],
                                      }),
                                      expanded
                                        ? /* @__PURE__ */ jsx(ChevronUp, {
                                            className: "w-3.5 h-3.5 text-[#00D17F] shrink-0 ml-2",
                                          })
                                        : /* @__PURE__ */ jsx(ChevronDown, {
                                            className: "w-3.5 h-3.5 text-[#7a828c] shrink-0 ml-2",
                                          }),
                                    ],
                                  }),
                                  expanded &&
                                    /* @__PURE__ */ jsx("div", {
                                      className:
                                        "px-3 pb-3 border-t border-[#1c2430]/60 pt-2 font-sans text-[8.5px] text-[#7a828c] leading-relaxed",
                                      children: faq.a,
                                    }),
                                ],
                              },
                              idx,
                            );
                          }),
                        }),
                        /* @__PURE__ */ jsxs("div", {
                          className:
                            "border border-[#1c2430] bg-[#0b0f14] p-3 rounded-none space-y-2.5",
                          children: [
                            /* @__PURE__ */ jsx("span", {
                              className:
                                "text-[9.5px] font-black text-[#00D17F] uppercase tracking-wider block font-rajdhani",
                              children: "📂 CORE DIRECTORY FILE REFERENCE",
                            }),
                            /* @__PURE__ */ jsxs("div", {
                              className:
                                "border border-[#1c2430] rounded-none overflow-hidden text-[8.5px] font-mono",
                              children: [
                                /* @__PURE__ */ jsxs("div", {
                                  className:
                                    "grid grid-cols-12 bg-[#11161d] border-b border-[#1c2430] px-2.5 py-1 text-[#7a828c] font-bold font-rajdhani text-[9px] uppercase tracking-wider",
                                  children: [
                                    /* @__PURE__ */ jsx("div", {
                                      className: "col-span-5 border-r border-[#1c2430]/60",
                                      children: "TARGET FILE PATH",
                                    }),
                                    /* @__PURE__ */ jsx("div", {
                                      className: "col-span-3 border-r border-[#1c2430]/60 pl-2",
                                      children: "FILE CLASSIFICATION",
                                    }),
                                    /* @__PURE__ */ jsx("div", {
                                      className: "col-span-4 pl-2",
                                      children: "TACTICAL FUNCTION",
                                    }),
                                  ],
                                }),
                                [
                                  {
                                    path: "local-bridge/.env.example",
                                    type: "Template Config",
                                    func: "Reference config setup file.",
                                  },
                                  {
                                    path: "local-bridge/.env",
                                    type: "Private Config",
                                    func: "Private keys store. Never commit to Git.",
                                  },
                                  {
                                    path: "local-bridge/teamRelay.js",
                                    type: "Publishing Script",
                                    func: "Telemetry publisher engine module.",
                                  },
                                  {
                                    path: "local-bridge/server.js",
                                    type: "Bridge Host",
                                    func: "High-frequency bridge server file.",
                                  },
                                  {
                                    path: "supabase/migrations/20260526_team_sessions.sql",
                                    type: "Postgres Migration",
                                    func: "Ingests required SQL relay tables.",
                                  },
                                ].map((row, idx) =>
                                  /* @__PURE__ */ jsxs(
                                    "div",
                                    {
                                      className: `grid grid-cols-12 px-2.5 py-1.5 border-b border-[#1c2430]/40 last:border-0 ${idx % 2 === 0 ? "bg-[#05070a]/40" : "bg-[#0b0f14]"}`,
                                      children: [
                                        /* @__PURE__ */ jsx("div", {
                                          className:
                                            "col-span-5 font-bold text-white border-r border-[#1c2430]/30 overflow-hidden text-ellipsis whitespace-nowrap pr-2",
                                          children: row.path,
                                        }),
                                        /* @__PURE__ */ jsx("div", {
                                          className:
                                            "col-span-3 text-[#FFB800] font-bold border-r border-[#1c2430]/30 pl-2",
                                          children: row.type,
                                        }),
                                        /* @__PURE__ */ jsx("div", {
                                          className:
                                            "col-span-4 text-[#7a828c] pl-2 leading-relaxed",
                                          children: row.func,
                                        }),
                                      ],
                                    },
                                    idx,
                                  ),
                                ),
                              ],
                            }),
                          ],
                        }),
                      ],
                    }),
                ],
              }),
            ],
          }),
          /* @__PURE__ */ jsxs("section", {
            className:
              "col-span-1 bg-[#0b0f14] flex flex-col justify-start select-none overflow-hidden h-full rounded-none",
            children: [
              /* @__PURE__ */ jsx("div", {
                className:
                  "px-2.5 py-1.5 bg-[#11161d] border-b border-[#1c2430] flex items-center justify-between shrink-0 select-none",
                children: /* @__PURE__ */ jsx("span", {
                  className:
                    "text-[9.5px] font-bold tracking-widest text-[#7a828c] uppercase font-rajdhani",
                  children: "3 INTERACTIVE CHECKLIST",
                }),
              }),
              /* @__PURE__ */ jsxs("div", {
                className: "p-3 space-y-4 flex-1 overflow-y-auto scrollbar-hide",
                children: [
                  /* @__PURE__ */ jsxs("div", {
                    className: `space-y-2 p-1.5 border transition-all ${activeTab === "owner" ? "bg-[#FFB800]/5 border-[#FFB800]/25" : "border-transparent"}`,
                    children: [
                      /* @__PURE__ */ jsx("span", {
                        className:
                          "text-[8.5px] font-black text-[#FFB800] uppercase tracking-widest border-b border-[#FFB800]/20 pb-1 block font-rajdhani",
                        children: "🏆 OWNER READY CHECKLIST",
                      }),
                      /* @__PURE__ */ jsx("div", {
                        className: "space-y-1 font-mono text-[8px] text-[#E2E4E8]",
                        children: [
                          {
                            id: "supabaseAccount",
                            label: "Create Supabase account",
                          },
                          {
                            id: "projectCreated",
                            label: "Initialize active project",
                          },
                          {
                            id: "sqlSchemaRun",
                            label: "Run SQL migrations schema",
                          },
                          {
                            id: "keysCopied",
                            label: "Copy anon public API keys",
                          },
                          {
                            id: "codeGenerated",
                            label: "Generate PITWALL code",
                          },
                          {
                            id: "envDistributed",
                            label: "Send pre-filled .env",
                          },
                          {
                            id: "bridgeRunning",
                            label: "Start owner local bridge",
                          },
                          {
                            id: "rdyVerify",
                            label: "Verify active team HUD",
                          },
                        ].map((item) =>
                          /* @__PURE__ */ jsxs(
                            "div",
                            {
                              onClick: () => toggleOwnerCheck(item.id),
                              className:
                                "flex items-center gap-1.5 cursor-pointer hover:bg-[#11161d] p-0.5 border border-transparent hover:border-[#1c2430] transition-colors",
                              children: [
                                ownerChecklist[item.id]
                                  ? /* @__PURE__ */ jsx(CheckSquare, {
                                      className: "w-3 h-3 text-[#00D17F] shrink-0",
                                    })
                                  : /* @__PURE__ */ jsx(Square, {
                                      className: "w-3 h-3 text-[#7a828c] shrink-0",
                                    }),
                                /* @__PURE__ */ jsx("span", {
                                  className: ownerChecklist[item.id]
                                    ? "line-through text-[#7a828c] font-bold"
                                    : "",
                                  children: item.label,
                                }),
                              ],
                            },
                            item.id,
                          ),
                        ),
                      }),
                    ],
                  }),
                  /* @__PURE__ */ jsxs("div", {
                    className: `space-y-2 p-1.5 border transition-all ${activeTab === "driver" ? "bg-[#FF4D4D]/5 border-[#FF4D4D]/25" : "border-transparent"}`,
                    children: [
                      /* @__PURE__ */ jsx("span", {
                        className:
                          "text-[8.5px] font-black text-[#FF4D4D] uppercase tracking-widest border-b border-[#FF4D4D]/20 pb-1 block font-rajdhani",
                        children: "🏎️ DRIVER ACTIVE FOR RELAY",
                      }),
                      /* @__PURE__ */ jsx("div", {
                        className: "space-y-1 font-mono text-[8px] text-[#E2E4E8]",
                        children: [
                          {
                            id: "envPlaced",
                            label: "Place .env in local-bridge/",
                          },
                          {
                            id: "nameConfigured",
                            label: "Configure DRIVER_NAME",
                          },
                          {
                            id: "bridgeRunning",
                            label: "Run bridge via npm start",
                          },
                          {
                            id: "liveBadgeVerified",
                            label: "Verify Live console badge",
                          },
                        ].map((item) =>
                          /* @__PURE__ */ jsxs(
                            "div",
                            {
                              onClick: () => toggleDriverCheck(item.id),
                              className:
                                "flex items-center gap-1.5 cursor-pointer hover:bg-[#11161d] p-0.5 border border-transparent hover:border-[#1c2430] transition-colors",
                              children: [
                                driverChecklist[item.id]
                                  ? /* @__PURE__ */ jsx(CheckSquare, {
                                      className: "w-3 h-3 text-[#00D17F] shrink-0",
                                    })
                                  : /* @__PURE__ */ jsx(Square, {
                                      className: "w-3 h-3 text-[#7a828c] shrink-0",
                                    }),
                                /* @__PURE__ */ jsx("span", {
                                  className: driverChecklist[item.id]
                                    ? "line-through text-[#7a828c] font-bold"
                                    : "",
                                  children: item.label,
                                }),
                              ],
                            },
                            item.id,
                          ),
                        ),
                      }),
                    ],
                  }),
                  /* @__PURE__ */ jsxs("div", {
                    className: `space-y-2 p-1.5 border transition-all ${activeTab === "crew" ? "bg-[#3B82F6]/5 border-[#3B82F6]/25" : "border-transparent"}`,
                    children: [
                      /* @__PURE__ */ jsx("span", {
                        className:
                          "text-[8.5px] font-black text-[#3B82F6] uppercase tracking-widest border-b border-[#3B82F6]/20 pb-1 block font-rajdhani",
                        children: "🎧 CREW CO-STRATEGY SYNC",
                      }),
                      /* @__PURE__ */ jsx("div", {
                        className: "space-y-1 font-mono text-[8px] text-[#E2E4E8]",
                        children: [
                          {
                            id: "urlOpened",
                            label: "Open browser team page",
                          },
                          {
                            id: "teamCodePasted",
                            label: "Paste team code in HUD",
                          },
                          {
                            id: "joinedSuccessfully",
                            label: "Confirm teammate live feeds",
                          },
                          {
                            id: "strategyPlanned",
                            label: "Configure stint timelines",
                          },
                        ].map((item) =>
                          /* @__PURE__ */ jsxs(
                            "div",
                            {
                              onClick: () => toggleCrewCheck(item.id),
                              className:
                                "flex items-center gap-1.5 cursor-pointer hover:bg-[#11161d] p-0.5 border border-transparent hover:border-[#1c2430] transition-colors",
                              children: [
                                crewChecklist[item.id]
                                  ? /* @__PURE__ */ jsx(CheckSquare, {
                                      className: "w-3 h-3 text-[#00D17F] shrink-0",
                                    })
                                  : /* @__PURE__ */ jsx(Square, {
                                      className: "w-3 h-3 text-[#7a828c] shrink-0",
                                    }),
                                /* @__PURE__ */ jsx("span", {
                                  className: crewChecklist[item.id]
                                    ? "line-through text-[#7a828c] font-bold"
                                    : "",
                                  children: item.label,
                                }),
                              ],
                            },
                            item.id,
                          ),
                        ),
                      }),
                    ],
                  }),
                ],
              }),
              /* @__PURE__ */ jsxs("div", {
                className: "p-2.5 bg-[#05070a] border-t border-[#1c2430] shrink-0 rounded-none",
                children: [
                  /* @__PURE__ */ jsxs("span", {
                    className:
                      "text-[8.5px] font-black text-[#3B82F6] uppercase tracking-[0.2em] block mb-2 font-rajdhani flex items-center gap-1",
                    children: [
                      /* @__PURE__ */ jsx(Timer, { className: "w-3.5 h-3.5 text-[#3B82F6]" }),
                      "TACTICAL PIT CHRONOGRAPH",
                    ],
                  }),
                  /* @__PURE__ */ jsx("div", {
                    className:
                      "text-center bg-[#0b0f14] border border-[#1c2430] p-2 text-white font-mono text-sm font-black tracking-widest font-orbitron select-text",
                    children: formatStopwatchTime(stopwatchTime),
                  }),
                  /* @__PURE__ */ jsxs("div", {
                    className: "grid grid-cols-3 gap-1 mt-2",
                    children: [
                      /* @__PURE__ */ jsx("button", {
                        type: "button",
                        onClick: handleStartStop,
                        className: `py-1 text-[7.5px] uppercase tracking-widest font-bold rounded-none cursor-pointer transition-all border ${stopwatchRunning ? "bg-red-950/20 text-[#FF4D4D] border-red-500/25 hover:bg-red-950/40" : "bg-[#00D17F]/10 text-[#00D17F] border-[#00D17F]/30 hover:bg-[#00D17F]/20"}`,
                        children: stopwatchRunning ? "PAUSE" : "START",
                      }),
                      /* @__PURE__ */ jsx("button", {
                        type: "button",
                        onClick: handleLap,
                        disabled: !stopwatchRunning,
                        className:
                          "py-1 bg-[#11161d] hover:bg-[#1c2430] border border-[#1c2430] text-[#7a828c] hover:text-white text-[7.5px] uppercase tracking-widest font-bold rounded-none cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed",
                        children: "LAP",
                      }),
                      /* @__PURE__ */ jsx("button", {
                        type: "button",
                        onClick: handleReset,
                        className:
                          "py-1 bg-[#11161d] hover:bg-[#1c2430] border border-[#1c2430] text-[#7a828c] hover:text-white text-[7.5px] uppercase tracking-widest font-bold rounded-none cursor-pointer transition-all",
                        children: "RESET",
                      }),
                    ],
                  }),
                  stopwatchLaps.length > 0 &&
                    /* @__PURE__ */ jsxs("div", {
                      className:
                        "mt-2 border border-[#1c2430] bg-[#0b0f14] p-1.5 max-h-24 overflow-y-auto font-mono text-[7.5px] scrollbar-hide text-left space-y-0.5",
                      children: [
                        /* @__PURE__ */ jsx("span", {
                          className:
                            "text-[7px] text-[#7a828c] uppercase font-bold block border-b border-[#1c2430] pb-0.5 mb-1 font-rajdhani",
                          children: "RECORDED PIT DELTA LAPS",
                        }),
                        stopwatchLaps.map((lap, idx) =>
                          /* @__PURE__ */ jsxs(
                            "div",
                            {
                              className:
                                "flex justify-between border-b border-[#1c2430]/30 py-0.5 last:border-0",
                              children: [
                                /* @__PURE__ */ jsxs("span", {
                                  className: "text-[#7a828c]",
                                  children: ["LAP ", stopwatchLaps.length - idx],
                                }),
                                /* @__PURE__ */ jsx("span", {
                                  className: "text-white font-bold",
                                  children: lap,
                                }),
                              ],
                            },
                            idx,
                          ),
                        ),
                      ],
                    }),
                ],
              }),
            ],
          }),
        ],
      }),
      /* @__PURE__ */ jsxs("footer", {
        className:
          "h-6 border-t border-[#1c2430] bg-[#0b0f14] px-3 flex items-center justify-between font-mono text-[7px] text-[#7a828c] relative z-10 shrink-0 select-none uppercase",
        children: [
          /* @__PURE__ */ jsxs("div", {
            className: "flex items-center gap-1.5",
            children: [
              /* @__PURE__ */ jsx("span", {
                className: "size-1 bg-[#00D17F] rounded-full animate-pulse",
              }),
              /* @__PURE__ */ jsx("span", { children: "RELAY STATE: IDLE" }),
            ],
          }),
          /* @__PURE__ */ jsx("div", { children: "iRacing Team Relay Companion · 2026" }),
          /* @__PURE__ */ jsx("div", { children: "PIT WALL // SECURE CLIENT RELAY SYSTEM" }),
        ],
      }),
    ],
  });
}
export { TeamGuidePage as component };
