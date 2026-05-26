import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  Gauge,
  LineChart,
  ArrowRight,
  Download,
  Terminal,
  Wifi,
  Cpu,
  Settings,
  Sparkles,
  Database,
  GraduationCap,
  BookOpen,
  LogIn,
  ChevronDown,
  Circle,
  HelpCircle,
  ShieldCheck,
  Monitor,
} from "lucide-react";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pit Wall — Live iRacing Telemetry & Lap Analysis" },
      {
        name: "description",
        content:
          "Pit Wall pairs a live iRacing telemetry dashboard with a MoTeC-style .ibt lap analysis workbench. Stream live data from a local bridge, then dig into laps with traces, track map, sectors and an AI coach.",
      },
      { property: "og:title", content: "Pit Wall — Live iRacing Telemetry & Lap Analysis" },
      {
        property: "og:description",
        content:
          "Live dashboard + lap-file workbench for iRacing. Telemetry on track, analysis off track.",
      },
      {
        property: "og:image",
        content: "https://iracing-companion.lovable.app/pit-wall-team.png",
      },
      { property: "og:image:width", content: "1792" },
      { property: "og:image:height", content: "1024" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:image",
        content: "https://iracing-companion.lovable.app/pit-wall-team.png",
      },
    ],
    links: [{ rel: "canonical", href: "https://iracing-companion.lovable.app/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "Pit Wall",
          applicationCategory: "SportsApplication",
          operatingSystem: "Web",
          description:
            "Live iRacing telemetry dashboard plus MoTeC-style .ibt lap analysis workbench.",
          url: "https://iracing-companion.lovable.app/",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        }),
      },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  const [pulse, setPulse] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulse((prev) => !prev);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-[#030712] text-zinc-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200 overflow-x-hidden relative">
      {/* Background ambient glows */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[300px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[400px] bg-purple-500/5 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/3 w-[800px] h-[400px] bg-blue-500/5 rounded-full blur-[150px] pointer-events-none" />

      {/* ── NAVBAR ── */}
      <nav className="border-b border-zinc-900 bg-zinc-950/60 backdrop-blur-xl sticky top-0 z-50 px-6 py-3 flex items-center justify-between">
        <Link to="/" className="flex flex-col group">
          <div className="flex items-center gap-2">
            <span className="font-sans font-black italic tracking-tighter text-xl text-white group-hover:text-cyan-400 transition-colors">
              PIT WALL
            </span>
          </div>
          <span className="text-[9px] font-mono tracking-[0.25em] text-zinc-500 font-semibold uppercase mt-0.5">
            TELEMETRY & LAP ANALYSIS
          </span>
        </Link>

        {/* Navigation links */}
        <div className="hidden lg:flex items-center gap-8">
          <a href="#features" className="text-[11px] font-mono tracking-widest text-zinc-400 hover:text-white uppercase transition-colors">
            FEATURES
          </a>
          <Link to="/live" className="text-[11px] font-mono tracking-widest text-zinc-400 hover:text-white uppercase transition-colors">
            LIVE DASHBOARD
          </Link>
          <Link to="/lab/lapfile" className="text-[11px] font-mono tracking-widest text-zinc-400 hover:text-white uppercase transition-colors">
            ANALYSIS WORKBENCH
          </Link>
          <Link to="/how-it-works" className="text-[11px] font-mono tracking-widest text-zinc-400 hover:text-white uppercase transition-colors">
            AI COACH
          </Link>
          <Link to="/roadmap" className="text-[11px] font-mono tracking-widest text-zinc-400 hover:text-white uppercase transition-colors">
            ROADMAP
          </Link>
          <Link
            to="/settings"
            className="flex items-center gap-1.5 text-[11px] font-mono tracking-widest text-zinc-500 hover:text-white uppercase transition-colors"
          >
            <Settings className="h-3 w-3 animate-[spin_8s_linear_infinite]" />
            SETTINGS
          </Link>
        </div>

        {/* System status pill */}
        <div className="flex items-center gap-4">
          <div className="border border-emerald-500/20 bg-emerald-950/20 px-3.5 py-1 rounded-full flex items-center gap-2">
            <span className="text-[9px] font-mono tracking-widest text-zinc-400 uppercase font-semibold">
              SYSTEM STATUS
            </span>
            <span className="flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] ${pulse ? 'animate-ping' : ''}`} />
              <span className="text-[9px] font-mono text-emerald-400 font-bold tracking-widest">
                OPERATIONAL
              </span>
            </span>
          </div>

          <Link
            to="/auth"
            className="hidden sm:inline-flex items-center justify-center rounded-md border border-zinc-800 bg-zinc-950 px-4 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-900 hover:text-white transition-colors"
          >
            Sign In
          </Link>
        </div>
      </nav>

      {/* ── HERO SECTION ── */}
      <section className="mx-auto max-w-7xl px-6 pt-16 pb-20 grid lg:grid-cols-12 gap-12 items-center relative z-10">
        {/* Left Column (Content) */}
        <div className="lg:col-span-5 flex flex-col items-start text-left">
          {/* Micro-badge */}
          <div className="flex items-center gap-2 text-[10px] font-mono text-cyan-400 tracking-[0.25em] uppercase mb-4 font-semibold">
            <span className="inline-block p-1 bg-cyan-950/50 border border-cyan-800/30 rounded-md">
              <Activity className="h-3.5 w-3.5 text-cyan-400" />
            </span>
            FOR iRACING COMPETITORS
          </div>

          {/* Title and Headlines */}
          <h1 className="text-4xl md:text-5xl lg:text-[3.25rem] font-black tracking-tight leading-[1.05] text-white">
            Telemetry <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">on track.</span>
            <br />
            Analysis <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">off track.</span>
          </h1>

          <h2 className="text-lg md:text-xl font-bold text-zinc-300 mt-4 mb-5">
            One app. Complete control.
          </h2>

          <p className="text-sm md:text-base text-zinc-400 leading-relaxed mb-8">
            Pit Wall is the ultimate iRacing companion — live GTP Hybrid telemetry at 60Hz and MoTeC-style lap analysis in your browser or on the desktop.
          </p>

          {/* Highlights Grid (2x2) */}
          <div className="grid grid-cols-2 gap-3 w-full mb-8">
            <div className="border border-cyan-500/10 bg-cyan-950/5 hover:bg-cyan-950/10 hover:border-cyan-500/20 backdrop-blur-sm p-3.5 rounded-lg flex items-center gap-3 transition-all duration-300 group">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-cyan-950/30 border border-cyan-500/20 text-cyan-400 group-hover:scale-105 transition-transform">
                <Activity className="h-4 w-4" />
              </div>
              <div>
                <div className="text-[10px] font-mono font-bold text-cyan-400 tracking-wider">60Hz</div>
                <div className="text-xs font-semibold text-zinc-300">LIVE TELEMETRY</div>
              </div>
            </div>

            <div className="border border-blue-500/10 bg-blue-950/5 hover:bg-blue-950/10 hover:border-blue-500/20 backdrop-blur-sm p-3.5 rounded-lg flex items-center gap-3 transition-all duration-300 group">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-950/30 border border-blue-500/20 text-blue-400 group-hover:scale-105 transition-transform">
                <Database className="h-4 w-4" />
              </div>
              <div>
                <div className="text-[10px] font-mono font-bold text-blue-400 tracking-wider">250+</div>
                <div className="text-xs font-semibold text-zinc-300">CHANNELS</div>
              </div>
            </div>

            <div className="border border-indigo-500/10 bg-indigo-950/5 hover:bg-indigo-950/10 hover:border-indigo-500/20 backdrop-blur-sm p-3.5 rounded-lg flex items-center gap-3 transition-all duration-300 group">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-indigo-950/30 border border-indigo-500/20 text-indigo-400 group-hover:scale-105 transition-transform">
                <LineChart className="h-4 w-4" />
              </div>
              <div>
                <div className="text-[10px] font-mono font-bold text-indigo-400 tracking-wider">MoTeC</div>
                <div className="text-xs font-semibold text-zinc-300">STYLE ANALYSIS</div>
              </div>
            </div>

            <div className="border border-pink-500/10 bg-pink-950/5 hover:bg-pink-950/10 hover:border-pink-500/20 backdrop-blur-sm p-3.5 rounded-lg flex items-center gap-3 transition-all duration-300 group">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-pink-950/30 border border-pink-500/20 text-pink-400 group-hover:scale-105 transition-transform">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <div className="text-[10px] font-mono font-bold text-pink-400 tracking-wider">AI</div>
                <div className="text-xs font-semibold text-zinc-300">COACH & ADVISOR</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 w-full">
            <Link
              to="/auth"
              className="flex-1 min-w-[140px] text-center inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold text-sm py-3 px-5 transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] transform hover:-translate-y-0.5 active:translate-y-0"
            >
              LOGIN <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#install"
              className="flex-1 min-w-[140px] text-center inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950/60 hover:bg-zinc-900/60 text-zinc-300 font-semibold text-sm py-3 px-5 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              LEARN MORE <ChevronDown className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Right Column (High-Fidelity Dashboard Graphic) */}
        <div className="lg:col-span-7 relative group">
          {/* Card Border glow */}
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-cyan-500/20 to-purple-500/20 opacity-40 group-hover:opacity-60 blur-lg transition duration-1000 group-hover:duration-200" />
          
          <div className="relative overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-950 shadow-2xl flex flex-col md:grid md:grid-cols-12 min-h-[500px]">
            {/* Background image component (The Car and wet night track) */}
            <div className="md:col-span-7 relative h-64 md:h-full bg-black min-h-[260px] md:min-h-0">
              <img
                src="/pit-wall-team.png"
                alt="iRacing GTP Hybrid telemetry visual background"
                className="w-full h-full object-cover object-left scale-110 opacity-70 group-hover:scale-105 transition-all duration-[6s]"
              />
              {/* Vignette fade layout overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:via-zinc-950/20 md:to-zinc-950 z-10" />
              <div className="absolute bottom-4 left-4 z-20 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 border border-zinc-800/60 backdrop-blur-sm">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />
                <span className="font-mono text-[8px] uppercase tracking-wider text-zinc-400 font-bold">
                  GTP Hybrid telemetry stream
                </span>
              </div>
            </div>

            {/* Float HUD panel (The Live Telemetry / Map / AI Insight) */}
            <div className="md:col-span-5 border-t md:border-t-0 md:border-l border-zinc-900 bg-zinc-950/90 backdrop-blur-md p-5 flex flex-col justify-between gap-5 relative z-20">
              
              {/* Widget 1: Live Telemetry Details */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-bold flex items-center gap-1.5">
                    <span className="h-1 w-1 bg-cyan-400 rounded-full" />
                    LIVE TELEMETRY
                  </span>
                  <span className="text-[8px] font-mono text-cyan-400 bg-cyan-950/50 border border-cyan-500/20 px-1.5 py-0.5 rounded">
                    ACTIVE
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-left">
                  <div className="bg-zinc-900/30 p-2 rounded border border-zinc-900/60">
                    <span className="text-[8px] font-mono text-zinc-500 block uppercase">SPEED</span>
                    <span className="font-sans font-black text-white text-lg leading-tight">317</span>
                    <span className="text-[8px] font-mono text-zinc-400 ml-1 uppercase">km/h</span>
                  </div>
                  <div className="bg-zinc-900/30 p-2 rounded border border-zinc-900/60">
                    <span className="text-[8px] font-mono text-zinc-500 block uppercase">GEAR</span>
                    <span className="font-sans font-black text-cyan-400 text-lg leading-tight">7</span>
                  </div>
                  <div className="bg-zinc-900/30 p-2 rounded border border-zinc-900/60">
                    <span className="text-[8px] font-mono text-zinc-500 block uppercase">ERS DEPLOY</span>
                    <span className="font-sans font-extrabold text-white text-sm leading-tight">4.2</span>
                    <span className="text-[8px] font-mono text-zinc-500 uppercase ml-1">/ 4.0MJ</span>
                  </div>
                  <div className="bg-zinc-900/30 p-2 rounded border border-zinc-900/60">
                    <span className="text-[8px] font-mono text-zinc-500 block uppercase">FUEL REMAINING</span>
                    <span className="font-sans font-extrabold text-amber-500 text-sm leading-tight">32.4</span>
                    <span className="text-[8px] font-mono text-zinc-400 ml-1">L</span>
                  </div>
                </div>
              </div>

              {/* Widget 2: Telemetry Mini Plot */}
              <div className="flex flex-col gap-2 bg-zinc-900/20 border border-zinc-900 p-3 rounded-lg text-left">
                {/* SVG Mini telemetry graph */}
                <div className="h-16 w-full relative">
                  <svg className="w-full h-full" viewBox="0 0 200 60" preserveAspectRatio="none">
                    {/* Grid lines */}
                    <line x1="0" y1="15" x2="200" y2="15" stroke="#18181b" strokeWidth="1" strokeDasharray="3,3" />
                    <line x1="0" y1="30" x2="200" y2="30" stroke="#18181b" strokeWidth="1" strokeDasharray="3,3" />
                    <line x1="0" y1="45" x2="200" y2="45" stroke="#18181b" strokeWidth="1" strokeDasharray="3,3" />
                    
                    {/* Throttle (Green) */}
                    <path d="M 0,35 Q 30,10 60,8 T 120,40 T 160,5 T 200,8" fill="none" stroke="#22c55e" strokeWidth="1.5" />
                    {/* Brake (Red) */}
                    <path d="M 0,55 L 40,55 L 60,55 L 70,12 L 90,55 L 200,55" fill="none" stroke="#ef4444" strokeWidth="1.5" />
                    {/* Steering (Blue) */}
                    <path d="M 0,30 Q 50,45 100,30 T 200,30" fill="none" stroke="#3b82f6" strokeWidth="1" />
                    {/* ERS (Cyan) */}
                    <path d="M 0,40 C 40,25 70,55 120,35 S 170,10 200,42" fill="none" stroke="#06b6d4" strokeWidth="1" strokeDasharray="1,1" />
                  </svg>
                  
                  {/* Legends */}
                  <div className="absolute top-1 right-1 flex flex-wrap gap-1.5 text-[7px] font-mono uppercase font-bold text-zinc-500">
                    <span className="text-emerald-400">Throttle</span>
                    <span className="text-red-400">Brake</span>
                    <span className="text-blue-400">Steering</span>
                  </div>
                </div>
              </div>

              {/* Widget 3: Track Map & Sector Times */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between border-b border-zinc-900 pb-1">
                  <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest font-bold">
                    TRACK MAP
                  </span>
                  <span className="text-[8px] font-mono text-zinc-500 uppercase">Spa-Francorchamps</span>
                </div>
                
                <div className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-5 h-16 w-full flex items-center justify-center">
                    {/* Spa layout styled vector */}
                    <svg viewBox="0 0 100 100" className="w-16 h-16 overflow-visible">
                      <path
                        d="M 50,5 C 80,10 90,25 95,45 C 99,60 85,75 75,80 C 65,85 55,70 45,75 C 35,80 25,95 10,85 C -5,75 5,50 15,40 C 25,30 35,25 40,15 Z"
                        fill="none"
                        stroke="url(#trackGradient)"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <defs>
                        <linearGradient id="trackGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#ef4444" />
                          <stop offset="40%" stopColor="#eab308" />
                          <stop offset="70%" stopColor="#22c55e" />
                          <stop offset="100%" stopColor="#3b82f6" />
                        </linearGradient>
                      </defs>
                      <circle cx="50" cy="5" r="2.5" fill="#ffffff" className="animate-ping" />
                    </svg>
                  </div>
                  
                  <div className="col-span-7 flex flex-col justify-center text-left text-[9px] font-mono text-zinc-400 gap-0.5 border-l border-zinc-900 pl-3">
                    <div className="flex justify-between">
                      <span>S1</span>
                      <span className="text-white font-bold">24.567</span>
                    </div>
                    <div className="flex justify-between">
                      <span>S2</span>
                      <span className="text-white font-bold">33.112</span>
                    </div>
                    <div className="flex justify-between">
                      <span>S3</span>
                      <span className="text-white font-bold">25.777</span>
                    </div>
                    <div className="flex justify-between border-t border-zinc-900 mt-1 pt-1 text-cyan-400 font-bold text-[10px]">
                      <span>LAP</span>
                      <span>1:23.456</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Widget 4: AI Coach Advice */}
              <div className="border border-purple-500/10 bg-purple-950/10 p-3 rounded-lg text-left flex items-start gap-3">
                <div className="h-7 w-7 rounded-full bg-purple-600/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0 text-purple-400 font-black text-xs">
                  AI
                </div>
                <div className="flex flex-col gap-1.5 flex-1">
                  <div className="text-[9px] font-mono text-purple-400 uppercase tracking-widest font-bold">
                    AI COACH INSIGHT
                  </div>
                  <p className="text-[10px] text-zinc-300 leading-normal">
                    "Great exit out of Turn 6. You're losing <span className="text-purple-300 font-bold">0.385s</span> in Turn 4 entry — focus on brake pressure consistency."
                  </p>
                  <Link
                    to="/lab/lapfile"
                    className="text-[9px] font-mono font-bold text-cyan-400 uppercase flex items-center gap-0.5 hover:underline mt-1"
                  >
                    VIEW FULL ANALYSIS <ArrowRight className="h-2.5 w-2.5" />
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ── THREE CORE PRODUCT CARDS ── */}
      <section className="mx-auto max-w-7xl px-6 py-20 border-t border-zinc-900" id="features">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: TUTORIAL */}
          <div className="group relative border border-zinc-800/80 bg-zinc-950/40 hover:bg-zinc-950/60 rounded-xl p-6 overflow-hidden flex flex-col justify-between h-[250px] transition-all duration-300 hover:border-cyan-500/30">
            {/* Steering wheel visual back glow effect */}
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-all pointer-events-none" />
            
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-cyan-950/40 border border-cyan-800/30 text-cyan-400">
                  <GraduationCap className="h-5 w-5" />
                </span>
                <span className="font-mono text-xs text-cyan-400 uppercase tracking-widest font-bold">
                  TUTORIAL
                </span>
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                Learn Pit Wall in minutes
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Step-by-step interactive tutorial to get you up and running fast. Learn dashboard set-up, local telemetry connection, and file uploads.
              </p>
            </div>

            <a
              href="#install"
              className="font-mono text-[10px] font-bold text-cyan-400 uppercase tracking-widest inline-flex items-center gap-1 group-hover:text-cyan-300 transition-colors"
            >
              START TUTORIAL <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          {/* Card 2: READ ME */}
          <div className="group relative border border-zinc-800/80 bg-zinc-950/40 hover:bg-zinc-950/60 rounded-xl p-6 overflow-hidden flex flex-col justify-between h-[250px] transition-all duration-300 hover:border-purple-500/30">
            {/* Documentation back glow effect */}
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-all pointer-events-none" />
            
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-purple-950/40 border border-purple-800/30 text-purple-400">
                  <BookOpen className="h-5 w-5" />
                </span>
                <span className="font-mono text-xs text-purple-400 uppercase tracking-widest font-bold">
                  READ ME
                </span>
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
                Documentation &amp; Guides
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Complete user guide, feature overview, setup instructions, and explanations of what each telemetry trace actually represents.
              </p>
            </div>

            <Link
              to="/how-it-works"
              className="font-mono text-[10px] font-bold text-purple-400 uppercase tracking-widest inline-flex items-center gap-1 group-hover:text-purple-300 transition-colors"
            >
              VIEW DOCUMENTATION <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Card 3: LOGIN */}
          <div className="group relative border border-zinc-800/80 bg-zinc-950/40 hover:bg-zinc-950/60 rounded-xl p-6 overflow-hidden flex flex-col justify-between h-[250px] transition-all duration-300 hover:border-emerald-500/30">
            {/* User profile back glow effect */}
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all pointer-events-none" />
            
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-950/40 border border-emerald-800/30 text-emerald-400">
                  <LogIn className="h-5 w-5" />
                </span>
                <span className="font-mono text-xs text-emerald-400 uppercase tracking-widest font-bold">
                  LOGIN
                </span>
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                Access Your Account
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Sign in to access your telemetry history, track times across multiple sessions, and manage custom AI coach insights and personalized preferences.
              </p>
            </div>

            <Link
              to="/auth"
              className="font-mono text-[10px] font-bold text-emerald-400 uppercase tracking-widest inline-flex items-center gap-1 group-hover:text-emerald-300 transition-colors"
            >
              SIGN IN <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

        </div>
      </section>

      {/* ── QUICK START INSTALL SECTION ── */}
      <section id="install" className="mx-auto max-w-5xl px-6 pb-24 relative z-10">
        <div className="mb-12 text-center">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-semibold">
            GETTING STARTED
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-white">Install the Bridge in 3 steps</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-zinc-400 leading-relaxed">
            The bridge is a lightweight Node.js program that reads iRacing's Shared Memory API and
            serves telemetry over WebSocket to connected dashboards. It must run on the same
            Windows PC where iRacing is installed (the sim machine).
          </p>
        </div>

        <div className="mb-10 grid gap-4 text-xs md:grid-cols-3">
          <div className="border border-zinc-900 bg-zinc-950/40 p-5 rounded-lg flex flex-col gap-2.5">
            <div className="flex items-center gap-2 font-mono uppercase tracking-wider text-cyan-400 font-semibold">
              <Cpu className="h-4 w-4" /> Requirements
            </div>
            <ul className="space-y-1.5 text-zinc-400 leading-relaxed text-[11px] text-left">
              <li className="flex items-start gap-1.5">
                <span className="text-cyan-400">•</span>
                <span>Windows 10 or 11 (runs on sim PC)</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-cyan-400">•</span>
                <span>iRacing installed and active</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-cyan-400">•</span>
                <span>
                  <a className="text-cyan-400 underline hover:text-cyan-300" href="https://nodejs.org/" target="_blank" rel="noreferrer">Node.js 20 LTS+</a>
                </span>
              </li>
            </ul>
          </div>
          <div className="border border-zinc-900 bg-zinc-950/40 p-5 rounded-lg flex flex-col gap-2.5">
            <div className="flex items-center gap-2 font-mono uppercase tracking-wider text-blue-400 font-semibold">
              <Wifi className="h-4 w-4" /> What it does
            </div>
            <p className="text-zinc-400 leading-relaxed text-[11px] text-left">
              Streams telemetry from iRacing and serves it on <span className="font-mono text-zinc-300">ws://&lt;your-pc-ip&gt;:3001</span>.
              The bridge runs locally on the sim PC — by default nothing leaves your network.
            </p>
          </div>
          <div className="border border-zinc-900 bg-zinc-950/40 p-5 rounded-lg flex flex-col gap-2.5">
            <div className="flex items-center gap-2 font-mono uppercase tracking-wider text-purple-400 font-semibold">
              <Terminal className="h-4 w-4" /> Quick start
            </div>
            <p className="text-zinc-400 leading-relaxed text-[11px] text-left">
              Unzip the bridge package, run <span className="font-mono text-zinc-300">npm install</span>, then
              <span className="font-mono text-zinc-300"> npm start</span> from the bridge folder. The bridge will
              print the exact URLs it is serving.
            </p>
          </div>
        </div>

        <ol className="space-y-4">
          <li className="border border-zinc-900 bg-zinc-950/30 p-6 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4 text-left">
            <div className="flex items-start gap-4">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-950 border border-cyan-500/30 font-mono text-xs text-cyan-400 font-bold flex-shrink-0 mt-0.5">
                1
              </span>
              <div>
                <h3 className="font-bold text-white text-base">Download &amp; unzip</h3>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed max-w-xl">
                  Download the latest bridge package and extract it somewhere easy to find, for
                  example <span className="font-mono text-zinc-300">C:\PitWall\bridge</span>.
                </p>
              </div>
            </div>
            <a
              href="/downloads/pit-wall-bridge.zip"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-900 border border-zinc-800 px-4 py-2.5 text-xs font-semibold text-zinc-200 hover:bg-zinc-800 hover:text-white transition-colors flex-shrink-0"
            >
              <Download className="h-3.5 w-3.5" /> pit-wall-bridge.zip
            </a>
          </li>

          <li className="border border-zinc-900 bg-zinc-950/30 p-6 rounded-lg text-left">
            <div className="flex items-start gap-4">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-950 border border-blue-500/30 font-mono text-xs text-blue-400 font-bold flex-shrink-0 mt-0.5">
                2
              </span>
              <div className="flex-1 w-full overflow-hidden">
                <h3 className="font-bold text-white text-base">Install dependencies &amp; start it</h3>
                <p className="text-xs text-zinc-400 mt-1 mb-3 leading-relaxed">
                  Open PowerShell in the unzipped folder (Shift + Right-click → "Open PowerShell
                  window here") and run:
                </p>
                <pre className="overflow-x-auto rounded-md border border-zinc-900 bg-black/60 p-4 font-mono text-[11px] leading-relaxed text-cyan-300 w-full">
                  {`cd C:\\PitWall\\bridge\nnpm install\nnpm start`}
                </pre>
                <p className="mt-3 text-[11px] text-zinc-500 leading-normal">
                  If Windows Firewall blocks the bridge or you don't see a prompt, run an Administrator
                  PowerShell once and add the firewall rule:
                </p>
                <pre className="mt-1.5 overflow-x-auto rounded-md border border-zinc-900 bg-black/60 p-3 font-mono text-[10px] text-zinc-400 w-full">
                  {`New-NetFirewallRule -DisplayName "Pit Wall" -Direction Inbound -LocalPort 3001 -Protocol TCP -Action Allow`}
                </pre>
              </div>
            </div>
          </li>

          <li className="border border-zinc-900 bg-zinc-950/30 p-6 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4 text-left">
            <div className="flex items-start gap-4">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-950 border border-purple-500/30 font-mono text-xs text-purple-400 font-bold flex-shrink-0 mt-0.5">
                3
              </span>
              <div>
                <h3 className="font-bold text-white text-base">Open the dashboard</h3>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed max-w-xl">
                  Launch iRacing, get in a car, and open the dashboard. On your sim machine, load <span className="font-mono text-zinc-300">http://localhost:3001</span>. On a mobile device, use <span className="font-mono text-zinc-300">http://&lt;your-pc-ip&gt;:3001</span>.
                </p>
              </div>
            </div>
            <Link
              to="/live"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white px-4 py-2.5 text-xs font-semibold shadow-[0_0_15px_rgba(59,130,246,0.25)] transition-all flex-shrink-0"
            >
              <Gauge className="h-3.5 w-3.5" /> OPEN DASHBOARD <ArrowRight className="h-3 w-3" />
            </Link>
          </li>
        </ol>

        <div className="mt-8 grid gap-4 text-left md:grid-cols-2">
          <Link to="/lab/lapfile" className="border border-zinc-900 bg-zinc-950/40 p-5 rounded-lg hover:border-zinc-800 transition-all flex flex-col gap-1.5">
            <h3 className="font-bold text-white text-sm">No sim PC handy?</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Upload a saved <span className="font-mono text-zinc-300">.ibt</span> lap file directly to the Workbench and explore charts, maps, and AI feedback without running the bridge.
            </p>
          </Link>
          <Link to="/how-it-works" className="border border-zinc-900 bg-zinc-950/40 p-5 rounded-lg hover:border-zinc-800 transition-all flex flex-col gap-1.5">
            <h3 className="font-bold text-white text-sm">How it works</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Read up on our telemetry engine architecture, websocket stream flow, math computations, and sector algorithms.
            </p>
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-zinc-900 bg-zinc-950/50 py-12 px-6 text-zinc-500 text-[11px] font-mono tracking-wider relative z-10">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          
          {/* Logo column */}
          <div className="flex flex-col items-center md:items-start gap-1">
            <span className="font-sans font-black italic tracking-tighter text-white text-base">
              PIT WALL
            </span>
            <span className="text-[8px] tracking-[0.2em] uppercase font-bold text-zinc-600">
              GTP HYBRID ANALYTICS
            </span>
          </div>

          {/* Links details layout columns */}
          <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-y-2 gap-x-6 text-zinc-400 font-semibold">
            <span className="hover:text-white transition-colors">Built for competitors.</span>
            <span className="text-zinc-600 hidden sm:inline">|</span>
            <span className="hover:text-white transition-colors">iRacing Official Data API</span>
            <span className="text-zinc-600 hidden sm:inline">|</span>
            <span className="hover:text-white transition-colors">Local First - Your Control</span>
            <span className="text-zinc-600 hidden sm:inline">|</span>
            <span className="hover:text-white transition-colors">Secure &amp; Encrypted</span>
            <span className="text-zinc-600 hidden sm:inline">|</span>
            <span className="hover:text-white transition-colors">Web, Desktop, Mobile</span>
          </div>

          {/* Stylized PW mark */}
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-zinc-600 font-bold">
              © 2026 Pit Wall
            </span>
            <div className="h-6 w-8 rounded border border-zinc-800 bg-zinc-900/50 flex items-center justify-center text-zinc-400 font-black italic text-xs">
              PW
            </div>
          </div>

        </div>
      </footer>
    </main>
  );
}
