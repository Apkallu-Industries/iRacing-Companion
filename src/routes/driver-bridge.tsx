import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useTelemetry } from "@/lib/useTelemetry";
import {
  Gauge,
  Activity,
  User,
  Hash,
  Sliders,
  ShieldCheck,
  Wifi,
  WifiOff,
  Compass,
  Zap,
  RotateCcw,
  BookOpen,
} from "lucide-react";

export const Route = createFileRoute("/driver-bridge")({
  head: () => ({
    meta: [
      { title: "Driver Cockpit HUD — Pit Wall" },
      {
        name: "description",
        content: "Simplified high-performance live telemetry cockpit HUD designed specifically for drivers.",
      },
    ],
  }),
  component: DriverBridgePage,
});

function DriverBridgePage() {
  const t = useTelemetry(); // Shared bridge client hook (60Hz)
  const [driverName, setDriverName] = useState("");
  const [iracingId, setIracingId] = useState("");
  const [teamCode, setTeamCode] = useState("");
  
  const [isConfigured, setIsConfigured] = useState(false);
  const [bridgeConnected, setBridgeConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Check URL query parameters for pre-population
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const team = params.get("team") || params.get("teamCode");
      if (team) setTeamCode(team.toUpperCase());
      const name = params.get("driverName");
      if (name) setDriverName(name);
      const id = params.get("iracingId");
      if (id) setIracingId(id);
    }
  }, []);

  // Poll local bridge status and fetch driver profile config
  useEffect(() => {
    const checkBridge = async () => {
      try {
        const res = await fetch("http://localhost:3001/api/driver/config").catch(() => null);
        if (res && res.ok) {
          setBridgeConnected(true);
          const config = await res.json();
          if (config.driverName && !isConfigured) {
            setDriverName(config.driverName);
            setIracingId(config.iracingId || "");
            setTeamCode(config.teamCode || "");
            setIsConfigured(true);
          }
        } else {
          setBridgeConnected(false);
        }
      } catch {
        setBridgeConnected(false);
      } finally {
        setLoading(false);
      }
    };
    
    checkBridge();
    const interval = setInterval(checkBridge, 3000);
    return () => clearInterval(interval);
  }, [isConfigured]);

  const handleSyncSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!driverName.trim()) {
      setErrorMsg("Driver Name is required.");
      return;
    }
    if (!iracingId.trim()) {
      setErrorMsg("iRacing ID is required.");
      return;
    }
    
    setSyncing(true);
    setErrorMsg(null);

    try {
      const res = await fetch("http://localhost:3001/api/driver/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          driverName: driverName.trim(),
          iracingId: iracingId.trim(),
          teamCode: teamCode.trim().toUpperCase(),
        }),
      }).catch(() => null);

      if (res && res.ok) {
        setIsConfigured(true);
      } else {
        setErrorMsg("Failed to synchronize with local bridge. Is the local bridge server running?");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setSyncing(false);
    }
  };

  const handleResetConfig = async () => {
    setIsConfigured(false);
  };

  // 10-Segment Dynamic LED Shift Light calculation
  const getShiftLights = () => {
    const lights = [];
    const rpm = t.rpm || 0;
    const rpmMax = t.rpmMax || 11000;
    const rpmWarn = t.rpmShiftWarn || 8800;
    const rpmBlink = t.rpmShiftRedline || 9800;

    const range = rpmBlink - (rpmWarn * 0.8);
    const step = range / 10;

    for (let i = 0; i < 10; i++) {
      const threshold = (rpmWarn * 0.8) + (i * step);
      const active = rpm >= threshold;
      let colorClass = "bg-zinc-800/80";

      if (active) {
        if (rpm >= rpmBlink) {
          colorClass = "bg-blue-500 shadow-[0_0_12px_#3b82f6] animate-pulse";
        } else if (i >= 8) {
          colorClass = "bg-red-500 shadow-[0_0_10px_#ef4444]";
        } else if (i >= 5) {
          colorClass = "bg-amber-500 shadow-[0_0_8px_#f59e0b]";
        } else {
          colorClass = "bg-emerald-500 shadow-[0_0_8px_#10b981]";
        }
      }
      lights.push(
        <div key={i} className={`h-3 rounded-full flex-1 transition-all duration-75 ${colorClass}`} />
      );
    }
    return lights;
  };

  // HSL Thermal Mapping for tires (from deep blue 210deg for cold, to bright red 0deg for hot)
  const getTireTempColor = (tempC: number) => {
    // Optimal range: 75°C - 90°C
    if (tempC < 60) return "text-cyan-400";
    if (tempC > 95) return "text-red-400";
    return "text-emerald-400";
  };

  const getTireWearColor = (wearPct: number) => {
    if (wearPct > 80) return "bg-emerald-500 shadow-[0_0_6px_#10b981]";
    if (wearPct > 45) return "bg-amber-500 shadow-[0_0_6px_#f59e0b]";
    return "bg-red-500 shadow-[0_0_6px_#ef4444]";
  };

  if (loading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-[#05070A] text-foreground font-mono">
        <Activity className="h-8 w-8 text-primary animate-spin mb-3" />
        <span className="text-xs uppercase tracking-widest text-muted-foreground animate-pulse">Initializing cockpit telemetry...</span>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#05070A] text-[#E2E4E8] font-mono overflow-x-hidden relative flex flex-col justify-between selection:bg-primary/30">
      {/* Background carbon matrix grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#11161D_1px,transparent_1px),linear-gradient(to_bottom,#11161D_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-[0.12] pointer-events-none z-0" />

      {/* Navigation Header */}
      <nav className="border-b border-[#1C2430] bg-[#0B0F14]/90 backdrop-blur sticky top-0 z-50 px-6 py-3.5 flex items-center justify-between z-10 select-none">
        <Link to="/" className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-sans font-black italic tracking-tighter text-lg text-white">
              PIT WALL
            </span>
            <span className="text-[8px] font-mono tracking-widest text-[#7A828C] bg-[#11161D] px-1.5 py-0.5 border border-[#1C2430]">
              DRIVER HUD
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-3 border border-[#1C2430] bg-[#11161D] px-3 py-1 text-[10px]">
            <span className="text-[#7A828C] font-bold">LOCAL BRIDGE</span>
            <span className={`flex items-center gap-1.5 font-bold ${bridgeConnected ? 'text-emerald-400' : 'text-amber-400'}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${bridgeConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              {bridgeConnected ? 'ONLINE (ws:3001)' : 'OFFLINE'}
            </span>
          </div>
          <Link to="/" className="text-xs text-[#7A828C] hover:text-white uppercase tracking-wider font-bold transition-all border border-[#1C2430] bg-[#11161D] px-3.5 py-1">
            Back
          </Link>
        </div>
      </nav>

      {/* Main Workspace */}
      <div className="flex-1 w-full max-w-[1300px] mx-auto px-4 py-8 flex flex-col justify-center items-center z-10 relative">
        
        {!isConfigured ? (
          /* STATE A: WIZARD CONFIGURATION FORM */
          <div className="w-full max-w-xl bg-[#0B0F14]/80 border border-[#1C2430] rounded-3xl p-8 shadow-2xl backdrop-blur-md relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />

            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#1C2430]">
              <div className="p-2.5 bg-primary/10 border border-primary/20 text-primary rounded-2xl">
                <Gauge className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-sm font-bold uppercase tracking-widest text-white">
                  Driver Cockpit Setup
                </h2>
                <p className="text-[10px] text-muted-foreground uppercase mt-0.5">
                  Synchronize your active identity and team code
                </p>
              </div>
            </div>

            {errorMsg && (
              <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-sans rounded-xl leading-relaxed">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSyncSubmit} className="space-y-5 font-sans">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">
                  Full Driver Name
                </label>
                <div className="relative flex items-center">
                  <User className="absolute left-3.5 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    required
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    className="w-full bg-background border border-[#1C2430] hover:border-[#7A828C]/40 focus:border-primary/80 focus:ring-1 focus:ring-primary/30 rounded-xl pl-11 pr-4 py-3 text-xs font-mono text-white transition-all outline-none"
                    placeholder="e.g. Danny M"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">
                    iRacing Customer ID
                  </label>
                  <div className="relative flex items-center">
                    <Hash className="absolute left-3.5 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      required
                      value={iracingId}
                      onChange={(e) => setIracingId(e.target.value)}
                      className="w-full bg-background border border-[#1C2430] hover:border-[#7A828C]/40 focus:border-primary/80 focus:ring-1 focus:ring-primary/30 rounded-xl pl-11 pr-4 py-3 text-xs font-mono text-white transition-all outline-none"
                      placeholder="Find on Account page"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">
                    Team Code (Optional)
                  </label>
                  <div className="relative flex items-center">
                    <Sliders className="absolute left-3.5 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={teamCode}
                      onChange={(e) => setTeamCode(e.target.value.toUpperCase())}
                      className="w-full bg-background border border-[#1C2430] hover:border-[#7A828C]/40 focus:border-primary/80 focus:ring-1 focus:ring-primary/30 rounded-xl pl-11 pr-4 py-3 text-xs font-mono text-white transition-all outline-none uppercase"
                      placeholder="e.g. LE-MANS-2026"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={syncing}
                className="w-full py-3.5 bg-primary text-primary-foreground font-mono font-bold uppercase tracking-wider text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 cursor-pointer mt-3"
              >
                <Zap className="w-4 h-4" />
                {syncing ? "Synchronizing details..." : "Sync & Enter Cockpit"}
              </button>
            </form>

            {/* Instruction Expandable Panel */}
            <div className="mt-8 pt-6 border-t border-[#1C2430] text-xs">
              <h4 className="text-white uppercase font-bold mb-3 flex items-center gap-2">
                <Wifi className="w-4 h-4 text-primary" />
                How to connect your Local Bridge
              </h4>
              <p className="text-muted-foreground text-[11px] leading-relaxed mb-4">
                Drivers must run the telemetry bridge locally to grab and stream their live iRacing data. 
                Download the bridge zip file, extract it, and execute in your command prompt:
              </p>
              <pre className="overflow-x-auto rounded border border-[#1C2430] bg-[#05070A] p-3.5 font-mono text-[10px] leading-relaxed text-emerald-400 w-full mb-3 select-all">
                {`cd C:\\PitWall\\bridge\nnpm install\nnpm start`}
              </pre>
              <div className="flex items-center gap-2 p-3 bg-primary/5 border border-primary/10 text-muted-foreground rounded-xl leading-normal text-[11px] font-sans">
                <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                <span>The bridge remains completely local on your PC. No credentials or external accounts are requested.</span>
              </div>
            </div>

          </div>
        ) : (
          /* STATE B: SIMPLIFIED HIGH-PERFORMANCE COCKPIT HUD */
          <div className="w-full space-y-6">
            
            {/* Shift Light LED Bar */}
            <div className="flex items-center gap-1.5 w-full bg-[#0B0F14] border border-[#1C2430] rounded-2xl p-2.5 shadow-xl shrink-0">
              {getShiftLights()}
            </div>

            {/* Header Identity Row */}
            <div className="flex flex-col md:flex-row gap-4 items-stretch justify-between text-xs w-full">
              <div className="flex-1 bg-[#0B0F14] border border-[#1C2430] rounded-2xl p-4 flex items-center justify-between shadow-lg">
                <div>
                  <span className="text-[#7A828C] block uppercase text-[9px] tracking-widest">Active Driver Profile</span>
                  <span className="text-sm font-bold text-white uppercase">{driverName}</span>
                </div>
                <div className="text-right">
                  <span className="text-[#7A828C] block uppercase text-[9px] tracking-widest">iRacing ID</span>
                  <span className="text-sm font-bold text-primary font-mono">{iracingId}</span>
                </div>
              </div>

              {teamCode && (
                <div className="flex-1 bg-[#0B0F14] border border-[#1c2430] rounded-2xl p-4 flex items-center justify-between shadow-lg">
                  <div>
                    <span className="text-[#7A828C] block uppercase text-[9px] tracking-widest">Paddock Sync Team</span>
                    <span className="text-sm font-bold text-white font-mono uppercase">{teamCode}</span>
                  </div>
                  <span className="text-[8px] bg-primary/10 border border-primary/20 text-primary px-2 py-0.5 rounded-full uppercase font-bold tracking-widest font-mono">
                    CONNECTED
                  </span>
                </div>
              )}

              <div className="flex-1 bg-[#0B0F14] border border-[#1c2430] rounded-2xl p-4 flex items-center justify-between shadow-lg">
                <div>
                  <span className="text-[#7A828C] block uppercase text-[9px] tracking-widest">Current Session</span>
                  <span className="text-sm font-bold text-white uppercase truncate max-w-[200px] block">
                    {t.session !== "SESSION — TRACK" ? t.session : "WAITTING FOR SIM..."}
                  </span>
                </div>
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 shadow ${t.connected ? "bg-emerald-400 shadow-emerald-400" : "bg-amber-400 shadow-amber-400"}`} />
              </div>
            </div>

            {/* Core Driver HUD Panels */}
            <div className="grid lg:grid-cols-12 gap-6 items-stretch w-full">
              
              {/* Left Column: Big Gear, Speed & Input traces (Cols 1-7) */}
              <div className="lg:col-span-7 flex flex-col gap-6 justify-between items-stretch">
                
                {/* Huge Gear & Speed Readout */}
                <div className="border border-[#1C2430] bg-[#0B0F14] rounded-3xl p-8 flex-1 flex items-center justify-around shadow-2xl relative overflow-hidden min-h-[260px]">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-[90px] pointer-events-none" />

                  {/* Radial RPM arc representation */}
                  <div className="relative flex items-center justify-center h-48 w-48 bg-[#05070A]/60 border border-[#1C2430] rounded-full">
                    <span className="text-[132px] font-sans font-black italic tracking-tighter text-white select-none leading-none">
                      {t.gear === 0 ? "N" : t.gear === -1 ? "R" : t.gear}
                    </span>
                    <span className="absolute bottom-4 font-mono text-[9px] uppercase tracking-widest text-[#7A828C]">Gear</span>
                  </div>

                  <div className="flex flex-col justify-center gap-1.5 font-mono border-l border-[#1C2430] pl-10 flex-1">
                    <div>
                      <span className="text-[#7A828C] uppercase text-[9px] tracking-widest block">VELOCITY</span>
                      <div className="text-5xl font-sans font-black italic tracking-tighter text-white leading-none mt-1">
                        {Math.round(t.speedKph)} <span className="text-xs not-italic text-[#7A828C]">KPH</span>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <span className="text-[#7A828C] uppercase text-[9px] tracking-widest block">ENGINE SPEED</span>
                      <div className="text-xl font-bold text-white mt-1">
                        {Math.round(t.rpm)} <span className="text-[10px] font-normal text-[#7A828C]">RPM</span>
                      </div>
                      <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden mt-1.5">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${Math.min(100, (t.rpm / (t.rpmMax || 11000)) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Micro input bar traces */}
                <div className="border border-[#1C2430] bg-[#0B0F14] rounded-3xl p-6 shadow-xl">
                  <h3 className="text-[10px] text-white uppercase font-bold tracking-wider mb-4">Input Controls</h3>
                  <div className="space-y-3">
                    
                    {/* Throttle (Green) */}
                    <div className="grid grid-cols-12 gap-3 items-center">
                      <span className="col-span-2 text-[#7A828C] text-[10px] font-bold">THR</span>
                      <div className="col-span-8 h-4 bg-zinc-850 border border-[#1C2430] rounded-lg overflow-hidden relative">
                        <div
                          className="h-full bg-emerald-500 shadow-[0_0_8px_#10b981]"
                          style={{ width: `${(t.throttle || 0) * 100}%` }}
                        />
                      </div>
                      <span className="col-span-2 text-right text-xs font-bold text-white">{Math.round((t.throttle || 0) * 100)}%</span>
                    </div>

                    {/* Brake (Red) */}
                    <div className="grid grid-cols-12 gap-3 items-center">
                      <span className="col-span-2 text-[#7A828C] text-[10px] font-bold">BRK</span>
                      <div className="col-span-8 h-4 bg-zinc-850 border border-[#1C2430] rounded-lg overflow-hidden relative">
                        <div
                          className="h-full bg-red-500 shadow-[0_0_8px_#ef4444]"
                          style={{ width: `${(t.brake || 0) * 100}%` }}
                        />
                      </div>
                      <span className="col-span-2 text-right text-xs font-bold text-white">{Math.round((t.brake || 0) * 100)}%</span>
                    </div>

                    {/* Clutch (Blue/Grey) */}
                    <div className="grid grid-cols-12 gap-3 items-center">
                      <span className="col-span-2 text-[#7A828C] text-[10px] font-bold">CLU</span>
                      <div className="col-span-8 h-4 bg-zinc-850 border border-[#1C2430] rounded-lg overflow-hidden relative">
                        <div
                          className="h-full bg-sky-500 shadow-[0_0_8px_#0ea5e9]"
                          style={{ width: `${(t.clutch || 0) * 100}%` }}
                        />
                      </div>
                      <span className="col-span-2 text-right text-xs font-bold text-white">{Math.round((t.clutch || 0) * 100)}%</span>
                    </div>

                    {/* Steering degree indicator */}
                    <div className="grid grid-cols-12 gap-3 items-center">
                      <span className="col-span-2 text-[#7A828C] text-[10px] font-bold">STEER</span>
                      <div className="col-span-8 h-4 bg-zinc-850 border border-[#1C2430] rounded-lg overflow-hidden relative flex items-center justify-center">
                        <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-zinc-700" />
                        <div
                          className="absolute h-2 w-2 rounded-sm bg-cyan-400 shadow-[0_0_6px_#22d3ee]"
                          style={{ left: `calc(50% + ${Math.max(-50, Math.min(50, ((t.steeringDeg || 0) / 360) * 50))}% - 4px)` }}
                        />
                      </div>
                      <span className="col-span-2 text-right text-xs font-bold text-white">{Math.round(t.steeringDeg || 0)}°</span>
                    </div>

                  </div>
                </div>

              </div>

              {/* Right Column: Timing, Fuel, and Tires (Cols 8-12) */}
              <div className="lg:col-span-5 flex flex-col gap-6 justify-between items-stretch">
                
                {/* Timings and Delta */}
                <div className="border border-[#1C2430] bg-[#0B0F14] rounded-3xl p-6 shadow-xl space-y-4">
                  <div className="flex justify-between items-center border-b border-[#1C2430] pb-2">
                    <h3 className="text-[10px] text-white uppercase font-bold tracking-wider">Sector Times</h3>
                    <div className="flex items-center gap-3 text-[10px] font-bold">
                      <span className="text-[#7A828C]">S1: <span className="text-white">{t.sectors?.s1 || "--.---"}</span></span>
                      <span className="text-[#7A828C]">S2: <span className="text-white">{t.sectors?.s2 || "--.---"}</span></span>
                      <span className="text-[#7A828C]">S3: <span className="text-white">{t.sectors?.s3 || "--.---"}</span></span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[#7A828C] text-[9px] tracking-widest uppercase block">Last Lap</span>
                      <span className="text-lg font-bold text-white">{t.lastLap || "--:--.---"}</span>
                    </div>
                    <div>
                      <span className="text-[#7A828C] text-[9px] tracking-widest uppercase block">Best Lap</span>
                      <span className="text-lg font-bold text-emerald-400">{t.bestLap || "--:--.---"}</span>
                    </div>
                  </div>
                  
                  <div className={`p-4 rounded-2xl flex items-center justify-between border ${t.deltaSec >= 0 ? "bg-red-500/5 border-red-500/20 text-red-400" : "bg-emerald-500/5 border-emerald-500/20 text-emerald-400"}`}>
                    <span className="font-sans text-[10px] font-bold uppercase tracking-widest">Lap Delta</span>
                    <span className="text-2xl font-bold tracking-wider font-mono">
                      {t.deltaSec >= 0 ? "+" : ""}{t.deltaSec.toFixed(3)}s
                    </span>
                  </div>
                </div>

                {/* Tire Grid Quad */}
                <div className="border border-[#1C2430] bg-[#0B0F14] rounded-3xl p-6 shadow-xl">
                  <h3 className="text-[10px] text-white uppercase font-bold tracking-wider mb-4 border-b border-[#1C2430] pb-2">Tire Management</h3>
                  <div className="grid grid-cols-2 gap-4 font-mono text-[10px]">
                    {(["fl", "fr", "rl", "rr"] as const).map((corner) => {
                      const tire = t.tires?.[corner];
                      if (!tire) return null;
                      const label = corner.toUpperCase();
                      
                      return (
                        <div key={corner} className="bg-background border border-[#1C2430]/60 rounded-2xl p-3 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[#7A828C]">{label}</span>
                            <span className={`font-bold ${getTireTempColor(tire.tempC)}`}>{Math.round(tire.tempC)}°C</span>
                          </div>
                          <div className="text-[11px] font-bold text-white">{tire.pressureBar.toFixed(2)} bar</div>
                          <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden mt-1">
                            <div className={`h-full ${getTireWearColor(tire.estWearPct)}`} style={{ width: `${tire.estWearPct}%` }} />
                          </div>
                          <div className="text-[9px] text-[#7A828C] text-right font-bold">{Math.round(tire.estWearPct)}% wear</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Fuel & Stint Info */}
                <div className="border border-[#1C2430] bg-[#0B0F14] rounded-3xl p-6 shadow-xl grid grid-cols-2 gap-6">
                  <div>
                    <span className="text-[#7A828C] text-[9px] tracking-widest block uppercase mb-1">Fuel Remaining</span>
                    <span className="text-xl font-bold text-white font-mono">{t.fuelRemainingL.toFixed(1)} <span className="text-xs text-[#7A828C]">L</span></span>
                  </div>
                  <div>
                    <span className="text-[#7A828C] text-[9px] tracking-widest block uppercase mb-1">Estimated Laps</span>
                    <span className="text-xl font-bold text-primary font-mono">{t.lapsEstimated.toFixed(1)} <span className="text-xs text-[#7A828C]">Laps</span></span>
                  </div>
                </div>

              </div>

            </div>

            {/* Bottom Actions Row */}
            <div className="flex justify-center pt-2">
              <button
                onClick={handleResetConfig}
                className="px-4 py-2 border border-[#1C2430] bg-[#0B0F14] text-[#7A828C] hover:text-white uppercase tracking-wider text-[9px] font-bold rounded-xl transition-all hover:bg-zinc-800 cursor-pointer"
              >
                ↺ Modify Driver Profile
              </button>
            </div>

          </div>
        )}

      </div>

      {/* Footer */}
      <footer className="border-t border-[#1C2430] bg-[#0B0F14]/50 py-4 px-6 text-[#7A828C] text-[8px] font-mono tracking-wider z-10 select-none">
        <div className="mx-auto w-full max-w-[1300px] flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-sans font-black italic tracking-tighter text-white">PIT WALL DRIVER STATION</span>
          <span>© 2026 PIT WALL WORKSTATION · ACTIVE LOCAL WS PIPELINE</span>
        </div>
      </footer>
    </main>
  );
}
