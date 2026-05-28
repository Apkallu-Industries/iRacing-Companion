import { createFileRoute, Link } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import {
  CheckCircle2,
  Circle,
  Clock,
  Rocket,
  Wifi,
  LineChart,
  Brain,
  Database,
  Settings,
  Share2,
  Fingerprint,
  Shield,
  Zap,
  Map,
  Layers,
  Bot,
  Users,
  Code2,
  MonitorSmartphone,
  CloudSync,
  Bell,
  BarChart3,
  Cpu,
  GitMerge,
  Star,
} from "lucide-react";

export const Route = createFileRoute("/roadmap")({
  head: () => ({
    meta: [
      { title: "Roadmap — Pit Wall" },
      {
        name: "description",
        content: "Pit Wall development roadmap — what's been built and what's coming next.",
      },
    ],
  }),
  component: RoadmapPage,
});

// ─── Data ────────────────────────────────────────────────────────────────────

interface RoadmapItem {
  id: string;
  label: string;
  desc: string;
  icon: React.ReactNode;
  done: boolean;
  beta?: boolean;
  phase?: string;
}

const phases: { label: string; slug: string; color: string; items: RoadmapItem[] }[] = [
  {
    label: "Phase 1 — Foundation",
    slug: "phase1",
    color: "text-racing-green",
    items: [
      {
        id: "live-bridge",
        label: "Live WebSocket Bridge",
        done: true,
        icon: <Wifi className="h-4 w-4" />,
        desc: "Local Node.js bridge reads iRacing Shared Memory API and streams 60 Hz telemetry to the browser over WebSocket.",
      },
      {
        id: "live-dashboard",
        label: "Live Telemetry Dashboard",
        done: true,
        icon: <LineChart className="h-4 w-4" />,
        desc: "Real-time display of gear, RPM, speed, lap delta, sector times, tire temps, G-force and fuel.",
      },
      {
        id: "ibt-workbench",
        label: ".ibt Lap Workbench",
        done: true,
        icon: <Layers className="h-4 w-4" />,
        desc: "MoTeC-style stacked trace viewer, channel browser, GG diagram and track map for uploaded .ibt files.",
      },
      {
        id: "session-library",
        label: "Session Library",
        done: true,
        icon: <Database className="h-4 w-4" />,
        desc: "Cloud-synced library of every uploaded .ibt file with track/car metadata, best lap and file size.",
      },
      {
        id: "auth",
        label: "Authentication (Supabase)",
        done: true,
        icon: <Shield className="h-4 w-4" />,
        desc: "Email/password sign-in with Supabase Auth, row-level security on all telemetry tables.",
      },
      {
        id: "pwlap",
        label: "Live Session Recording (.pwlap)",
        done: true,
        icon: <Cpu className="h-4 w-4" />,
        desc: "Record any live session directly in the browser as a .pwlap file and save it to the library or download it.",
      },
      {
        id: "fingerprint",
        label: "Driver Fingerprint",
        done: true,
        icon: <Fingerprint className="h-4 w-4" />,
        desc: "Parse your entire iRacing lapfiles folder locally in the browser to build a PB per track/car fingerprint.",
      },
      {
        id: "track-map",
        label: "Interactive Track Map",
        done: true,
        icon: <Map className="h-4 w-4" />,
        desc: "SVG track map rendered from telemetry X/Y position data with lap overlay and sector highlighting.",
      },
    ],
  },
  {
    label: "Phase 2 — AI & Analysis",
    slug: "phase2",
    color: "text-racing-cyan",
    items: [
      {
        id: "ai-coach",
        label: "AI Radio Coach (Live)",
        done: true,
        icon: <Brain className="h-4 w-4" />,
        desc: "GPT-powered radio call after every lap with PUSH / HOLD / WARN tone determined by telemetry rules engine.",
      },
      {
        id: "ai-advisor",
        label: "Setup Advisor Button",
        done: true,
        icon: <Bot className="h-4 w-4" />,
        desc: "On-demand AI analysis of car setup based on tire temps, brake bias and G-force telemetry from current session.",
      },
      {
        id: "llm-dispatch",
        label: "Multi-Provider LLM Client",
        done: true,
        icon: <Cpu className="h-4 w-4" />,
        desc: "Client-side dispatcher routing AI calls to OpenAI, Anthropic, or any local Ollama / LM Studio endpoint.",
      },
      {
        id: "lap-aggregate",
        label: "Unified Lap Aggregation Hook",
        done: true,
        icon: <GitMerge className="h-4 w-4" />,
        desc: "Shared useLapAggregate hook consumed by LiveCoach and AdvisorButton to avoid redundant 60 Hz processing.",
      },
      {
        id: "history-merge",
        label: "Live PB ↔ Workbench History Merge",
        done: true,
        icon: <BarChart3 className="h-4 w-4" />,
        desc: "Live lap records integrate into the Workbench AI coach context, giving it historical track/car PB data.",
      },
      {
        id: "sector-analysis",
        label: "Sector Analysis Panel",
        done: true,
        icon: <Zap className="h-4 w-4" />,
        desc: "Per-sector time comparison across laps with optimal lap computation and gap visualisation.",
      },
      {
        id: "sharing",
        label: "Shareable Lap Links",
        done: true,
        icon: <Share2 className="h-4 w-4" />,
        desc: "Generate a shareable token link to a specific lap comparison that expires after 7 days.",
      },
      {
        id: "tts",
        label: "Text-to-Speech Radio",
        done: true,
        icon: <Bell className="h-4 w-4" />,
        desc: "AI coach calls read aloud via ElevenLabs or browser TTS with auto-speak toggle.",
      },
    ],
  },
  {
    label: "Phase 3 — Infrastructure",
    slug: "phase3",
    color: "text-racing-orange",
    items: [
      {
        id: "mongo-local",
        label: "Local MongoDB Integration",
        done: true,
        icon: <Database className="h-4 w-4" />,
        desc: "Dual-write architecture: lap records and sessions write to local MongoDB first, then sync to Supabase cloud. Schema validated with bsonType validators.",
      },
      {
        id: "in-memory-save",
        label: "In-Memory Session Transfer (Gap 4)",
        done: true,
        icon: <Zap className="h-4 w-4" />,
        desc: "pendingLocalBlob in Zustand store passes recorded .pwlap directly to the Workbench without re-downloading from cloud.",
      },
      {
        id: "livebridgesync",
        label: "Live Bridge Global Sync",
        done: true,
        icon: <Wifi className="h-4 w-4" />,
        desc: "LiveBridgeSync mounts at root and pushes track/car/connection status to global Zustand store for access everywhere.",
      },
      {
        id: "desktopalpsync",
        label: "DesktopLap Sync",
        done: true,
        icon: <MonitorSmartphone className="h-4 w-4" />,
        desc: "Polls the local bridge for completed lap records and merges them into the global workbench state.",
      },
      {
        id: "help-system",
        label: "Onboarding Help System",
        done: true,
        icon: <Star className="h-4 w-4" />,
        desc: "Stepped guided tour modal auto-triggers for first-time visitors with persistent ? button on every page.",
      },
      {
        id: "roadmap",
        label: "Dev Roadmap (this page)",
        done: true,
        icon: <Rocket className="h-4 w-4" />,
        desc: "Public roadmap tracking completed milestones and upcoming features across all phases.",
      },
      {
        id: "admin",
        label: "Admin Panel & Beta Tester System",
        done: true,
        icon: <Users className="h-4 w-4" />,
        desc: "Admin panel to promote registered users to beta_tester or admin roles, enabling free access for testers during paid rollout.",
      },
    ],
  },
  {
    label: "Phase 5 — Coach Dave Vision",
    slug: "phase5",
    color: "text-purple-400",
    items: [
      {
        id: "coach-dave-voice",
        label: "Coach Dave — Full AI Voice Engineer",
        done: false,
        icon: <Brain className="h-4 w-4" />,
        desc: "A persistent AI 'race engineer' persona with memory of your full season, track history and car preferences — speaks after every lap, flags trends over weeks.",
        phase: "2027",
      },
      {
        id: "mongo-sync",
        label: "Cross-Device MongoDB Cloud Sync",
        done: false,
        icon: <CloudSync className="h-4 w-4" />,
        desc: "Optional sync service: your local MongoDB pushes delta records to a central aggregation cluster for backup and multi-device access.",
        phase: "2027",
      },
      {
        id: "corner-analytics",
        label: "Corner-by-Corner Analytics",
        done: true,
        icon: <Map className="h-4 w-4" />,
        desc: "Automatic corner identification from track map + telemetry with per-corner speed, brake point and entry consistency scoring.",
      },
      {
        id: "ai-race-strategy",
        label: "AI Race Strategy Engine",
        done: true,
        icon: <Bot className="h-4 w-4" />,
        desc: "Multi-stint fuel / tire strategy calculator powered by LLM given session conditions, pitting window, and opponent gaps.",
      },
      {
        id: "telemetry-compare",
        label: "Multi-Driver Telemetry Overlay",
        done: false,
        icon: <Layers className="h-4 w-4" />,
        desc: "Load two .ibt files from different drivers on the same track and overlay their traces with delta annotations.",
        phase: "2027",
      },
      {
        id: "setup-ml",
        label: "ML Setup Recommender",
        done: true,
        icon: <Cpu className="h-4 w-4" />,
        desc: "Train on community setups + outcomes and recommend car setup changes based on your telemetry and driving style.",
      },
      {
        id: "native-app",
        label: "Native Desktop App (Electron / Tauri)",
        done: true,
        icon: <MonitorSmartphone className="h-4 w-4" />,
        desc: "Pit Wall Desktop v1.2.0 ships the full suite — live bridge, workbench, AI coach — as a single Windows NSIS installer.",
      },
      {
        id: "mobile-companion",
        label: "Mobile Pit Wall (iOS / Android)",
        done: false,
        icon: <MonitorSmartphone className="h-4 w-4" />,
        desc: "Dedicated mobile app as a second screen: live delta, engineer radio, tire status, fuel — all on your phone or tablet.",
        phase: "Future",
      },
      {
        id: "iracing-oauth",
        label: "iRacing OAuth — Official Integration",
        done: false,
        icon: <Code2 className="h-4 w-4" />,
        desc: "Official iRacing Data API OAuth so sessions auto-import race results, iRating, safety rating and SR incidents.",
        phase: "Future",
      },
    ],
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

function RoadmapPage() {
  const doneCount = phases.flatMap((p) => p.items).filter((i) => i.done).length;
  const totalCount = phases.flatMap((p) => p.items).length;
  const pct = Math.round((doneCount / totalCount) * 100);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader>
        <span className="font-mono uppercase tracking-wider">Roadmap</span>
        <Link to="/sessions" className="ml-3 text-muted-foreground hover:text-foreground text-xs">
          Sessions
        </Link>
        <Link to="/live" className="ml-3 text-muted-foreground hover:text-foreground text-xs">
          Live
        </Link>
      </AppHeader>

      <main className="w-full max-w-none px-4 md:px-12 lg:px-16 py-12">
        {/* Hero */}
        <div className="mb-12 text-center">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            Development Progress
          </p>
          <h1 className="text-4xl font-bold tracking-tight">Pit Wall Roadmap</h1>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            From a live telemetry bridge to a full AI race engineer suite. Here's what we've shipped
            and where we're heading.
          </p>

          {/* Progress bar */}
          <div className="mt-8 mx-auto max-w-sm">
            <div className="flex justify-between text-xs text-muted-foreground mb-2">
              <span>{doneCount} shipped</span>
              <span className="font-mono font-bold text-primary">{pct}%</span>
              <span>{totalCount - doneCount} to go</span>
            </div>
            <div className="h-2 w-full rounded-full bg-rail overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-racing-green to-primary transition-all duration-1000"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Phases */}
        <div className="space-y-12">
          {phases.map((phase) => {
            const phaseDone = phase.items.filter((i) => i.done).length;
            const phaseTotal = phase.items.length;
            return (
              <section key={phase.slug}>
                <div className="mb-5 flex items-center gap-4">
                  <div>
                    <h2 className={`text-lg font-bold ${phase.color}`}>{phase.label}</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {phaseDone}/{phaseTotal} complete
                    </p>
                  </div>
                  <div className="ml-auto flex-1 max-w-32 h-1 rounded-full bg-rail overflow-hidden">
                    <div
                      className="h-full rounded-full bg-current opacity-60 transition-all"
                      style={{ width: `${(phaseDone / phaseTotal) * 100}%`, color: "currentColor" }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  {phase.items.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-start gap-4 rounded-lg border px-4 py-3.5 transition-colors ${
                        item.done
                          ? "border-racing-green/20 bg-racing-green/5"
                          : "border-border bg-panel"
                      }`}
                    >
                      {/* Status icon */}
                      <div
                        className={`mt-0.5 shrink-0 ${item.done ? "text-racing-green" : "text-muted-foreground/40"}`}
                      >
                        {item.done ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : (
                          <Circle className="h-5 w-5" />
                        )}
                      </div>

                      {/* Feature icon */}
                      <div
                        className={`mt-0.5 shrink-0 ${item.done ? "text-racing-green/70" : "text-muted-foreground/40"}`}
                      >
                        {item.icon}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-sm font-semibold ${item.done ? "text-foreground" : "text-muted-foreground"}`}
                          >
                            {item.label}
                          </span>
                          {item.done && (
                            <span className="rounded-full bg-racing-green/15 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-racing-green">
                              Shipped
                            </span>
                          )}
                          {item.beta && (
                            <span className="rounded-full bg-racing-orange/15 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-racing-orange">
                              Beta
                            </span>
                          )}
                          {!item.done && item.phase && (
                            <span className="flex items-center gap-1 rounded-full border border-border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                              <Clock className="h-2.5 w-2.5" /> {item.phase}
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {/* Footer CTA */}
        <div className="mt-16 rounded-xl border border-primary/20 bg-primary/5 px-6 py-8 text-center">
          <Rocket className="mx-auto h-8 w-8 text-primary mb-3" />
          <h2 className="font-bold text-lg">Want to shape what comes next?</h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
            Sign up and become a beta tester. You'll get early access to every new feature before it
            goes public — for free, forever, as long as you're helping us build.
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <Link
              to="/auth"
              className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Sign up for beta access
            </Link>
            <Link
              to="/live"
              className="rounded-md border border-border bg-panel px-5 py-2.5 text-sm font-medium hover:bg-accent"
            >
              Try it now →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
