import { useState, useEffect, useCallback } from "react";
import { Link } from "@tanstack/react-router";
import {
    X,
    HelpCircle,
    Wifi,
    LineChart,
    Brain,
    FolderOpen,
    Settings,
    ArrowRight,
    ArrowLeft,
    CheckCircle2,
    Circle,
    Gauge,
    Download,
    Terminal,
    Database,
    Zap,
    ChevronRight,
} from "lucide-react";

const HELP_SEEN_KEY = "pit-wall:help-seen-v1";

// ─── Step Definitions ───────────────────────────────────────────────────────

interface HelpStep {
    id: string;
    icon: React.ReactNode;
    label: string;
    title: string;
    subtitle: string;
    content: React.ReactNode;
    ctaLabel?: string;
    ctaTo?: string;
}

const steps: HelpStep[] = [
    {
        id: "welcome",
        icon: <Gauge className="h-6 w-6" />,
        label: "Welcome",
        title: "Welcome to Pit Wall",
        subtitle: "Your complete iRacing telemetry companion",
        content: (
            <div className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                    Pit Wall is a <strong className="text-foreground">three-in-one</strong> iRacing companion built for serious drivers.
                    It combines a live in-session dashboard, a deep lap analysis workbench, and an AI-powered race engineer into one seamless tool.
                </p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {[
                        { icon: <Wifi className="h-4 w-4 text-racing-cyan" />, label: "Live Bridge", desc: "Real-time telemetry while you're on track" },
                        { icon: <LineChart className="h-4 w-4 text-racing-green" />, label: "Lap Workbench", desc: "Deep analysis of saved .ibt / .pwlap files" },
                        { icon: <Brain className="h-4 w-4 text-racing-orange" />, label: "AI Coach", desc: "Radio calls and setup advice after every lap" },
                    ].map((item) => (
                        <div key={item.label} className="rounded-lg border border-border bg-rail p-3 space-y-1.5">
                            <div className="flex items-center gap-2">
                                {item.icon}
                                <span className="text-xs font-semibold uppercase tracking-wider">{item.label}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                    ))}
                </div>
                <p className="text-xs text-muted-foreground border border-border/50 rounded-md px-3 py-2 bg-rail/50">
                    💡 This guide takes about 2 minutes. You can re-open it anytime with the <strong className="text-foreground">?</strong> button in the top-right corner.
                </p>
            </div>
        ),
    },
    {
        id: "bridge",
        icon: <Wifi className="h-6 w-6" />,
        label: "Live Bridge",
        title: "Step 1 — Connect the Live Bridge",
        subtitle: "Launch the telemetry service with one click",
        content: (
            <div className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                    iRacing exposes live telemetry via a Windows Shared Memory API. The <strong className="text-foreground">Pit Wall Bridge</strong> is a
                    small Node.js app that reads that memory and broadcasts it over WebSocket to your browser. You can launch it with one click!
                </p>
                <div className="space-y-2">
                    {[
                        { n: 1, icon: <Zap className="h-3.5 w-3.5 text-racing-orange" />, title: "Run Local Bridge", desc: 'Click the "Run Local Bridge" button on the live page. The app automatically spawns the background service.' },
                        { n: 2, icon: <Wifi className="h-3.5 w-3.5 text-primary" />, title: "Establish Connection", desc: 'The bridge status in the dashboard will change from stopped to active instantly.' },
                        { n: 3, icon: <Gauge className="h-3.5 w-3.5 text-racing-green" />, title: "Stream Live", desc: "Launch iRacing, get in a car, and telemetry will stream immediately." },
                    ].map((s) => (
                        <div key={s.n} className="flex items-start gap-3 rounded-md border border-border bg-rail p-3">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-mono text-primary-foreground">{s.n}</span>
                            <div>
                                <div className="flex items-center gap-1.5 text-xs font-semibold">{s.icon}{s.title}</div>
                                <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        ),
        ctaLabel: "Open Live Dashboard",
        ctaTo: "/live",
    },
    {
        id: "live",
        icon: <Gauge className="h-6 w-6" />,
        label: "Live Dashboard",
        title: "Step 2 — The Live Dashboard",
        subtitle: "Real-time data while you're driving",
        content: (
            <div className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                    Once the bridge is running and you're on track, the <strong className="text-foreground">/live</strong> dashboard streams
                    60Hz telemetry from iRacing directly to your browser. No API keys, no cloud, no latency.
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                        { label: "Delta to PB", desc: "Green = gaining, Red = losing time" },
                        { label: "Lap Times", desc: "Current + personal best with sector splits" },
                        { label: "Tire Temps", desc: "Four corners, colour-coded by temperature" },
                        { label: "G-Force", desc: "Live lateral & longitudinal G display" },
                        { label: "Fuel Calculator", desc: "Laps remaining based on burn rate" },
                        { label: "AI Radio", desc: "Coach speaks after every completed lap" },
                    ].map((f) => (
                        <div key={f.label} className="rounded border border-border bg-rail px-2.5 py-2">
                            <div className="font-semibold text-foreground">{f.label}</div>
                            <div className="text-muted-foreground mt-0.5">{f.desc}</div>
                        </div>
                    ))}
                </div>
                <p className="text-xs text-muted-foreground">
                    <strong className="text-foreground">Recording:</strong> Hit the red dot button to record a session as a <code className="text-xs bg-rail px-1 rounded">.pwlap</code> file.
                    When you save it, it opens instantly in the Workbench — no upload wait time.
                </p>
            </div>
        ),
        ctaLabel: "Open Live Dashboard",
        ctaTo: "/live",
    },
    {
        id: "workbench",
        icon: <LineChart className="h-6 w-6" />,
        label: "Lap Workbench",
        title: "Step 3 — The Lap Workbench",
        subtitle: "MoTeC-style deep analysis of every lap",
        content: (
            <div className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                    Load any <code className="text-xs bg-rail px-1 rounded">.ibt</code> or <code className="text-xs bg-rail px-1 rounded">.pwlap</code> file
                    into the <strong className="text-foreground">Workbench</strong> for a full MoTeC-style breakdown.
                    No subscription required — it all runs locally in your browser.
                </p>
                <div className="space-y-2 text-xs">
                    {[
                        { icon: <LineChart className="h-3 w-3 text-primary" />, label: "Stacked Traces", desc: "Overlay throttle, brake, steer, speed and any other channel across laps" },
                        { icon: <Zap className="h-3 w-3 text-racing-orange" />, label: "Sector Analysis", desc: "Identify exactly which corner is costing you the most time" },
                        { icon: <Brain className="h-3 w-3 text-racing-cyan" />, label: "AI Coach Report", desc: "GPT-powered post-session coaching based on your telemetry profile" },
                        { icon: <FolderOpen className="h-3 w-3 text-racing-green" />, label: "Session Library", desc: "All your sessions in one place — filter by track, car, or date" },
                    ].map((f) => (
                        <div key={f.label} className="flex items-start gap-2 rounded border border-border bg-rail px-2.5 py-2">
                            <span className="mt-0.5 shrink-0">{f.icon}</span>
                            <div>
                                <span className="font-semibold text-foreground">{f.label}</span>
                                <span className="text-muted-foreground"> — {f.desc}</span>
                            </div>
                        </div>
                    ))}
                </div>
                <p className="text-xs text-muted-foreground">
                    🔑 <strong className="text-foreground">Tip:</strong> Don't have an iRacing .ibt file? Use the Lab to upload one directly from disk without needing to log in.
                </p>
            </div>
        ),
        ctaLabel: "Open Lab",
        ctaTo: "/lab/lapfile",
    },
    {
        id: "sessions",
        icon: <FolderOpen className="h-6 w-6" />,
        label: "Session Library",
        title: "Step 4 — Your Session Library",
        subtitle: "All your sessions in one place",
        content: (
            <div className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                    Every session you record on track or upload from disk gets saved to your <strong className="text-foreground">Session Library</strong>.
                    Sign in with your account to sync data to the cloud, or — if you've installed MongoDB locally — everything stores on your own machine.
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                        { label: "Track filtering", desc: "Jump straight to Silverstone, Monza or any track" },
                        { label: "Car filtering", desc: "Compare performance across different car classes" },
                        { label: "Best lap history", desc: "See your all-time PB and trend over time" },
                        { label: "Shareable links", desc: "Share a specific lap to a link for teammates" },
                    ].map((f) => (
                        <div key={f.label} className="rounded border border-border bg-rail px-2.5 py-2">
                            <div className="font-semibold text-foreground">{f.label}</div>
                            <div className="text-muted-foreground mt-0.5">{f.desc}</div>
                        </div>
                    ))}
                </div>
                <div className="flex items-start gap-2 rounded-md border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-xs text-emerald-400">
                    <Database className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    <span>
                        <strong>Local-First Active:</strong> Select the "Continue as Local Developer" option. Telemetry records write instantly to your local MongoDB, and file binaries are cached locally in your browser's IndexedDB.
                    </span>
                </div>
            </div>
        ),
        ctaLabel: "View Sessions",
        ctaTo: "/sessions",
    },
    {
        id: "ai",
        icon: <Brain className="h-6 w-6" />,
        label: "AI Coach",
        title: "Step 5 — The AI Race Engineer",
        subtitle: "GPT-powered coaching after every lap",
        content: (
            <div className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                    The <strong className="text-foreground">AI Coach</strong> listens to each completed lap and gives you a radio call — just like a real race engineer.
                    It decides the <em className="text-foreground">tone</em> based on your performance: <span className="text-racing-green font-semibold">PUSH</span>,{" "}
                    <span className="text-racing-orange font-semibold">HOLD</span>, or <span className="text-red-400 font-semibold">WARN</span>.
                </p>
                <div className="space-y-2 text-xs">
                    {[
                        { tone: "PUSH", color: "text-racing-green border-racing-green/30 bg-racing-green/5", desc: "You're in the zone, personal best incoming. Keep the pressure on." },
                        { tone: "HOLD", color: "text-racing-orange border-racing-orange/30 bg-racing-orange/5", desc: "Consistent but not setting records. Focus on a specific sector." },
                        { tone: "WARN", color: "text-red-400 border-red-400/30 bg-red-400/5", desc: "Tire temps critical, fuel low, or braking instability detected." },
                    ].map((t) => (
                        <div key={t.tone} className={`rounded border px-3 py-2 ${t.color}`}>
                            <span className="font-bold font-mono">{t.tone}</span>
                            <span className="text-muted-foreground"> — {t.desc}</span>
                        </div>
                    ))}
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                    <p>⚙️ <strong className="text-foreground">Settings → AI Provider</strong> to switch between cloud GPT-4o and a local LLM (Ollama, LM Studio, etc.).</p>
                    <p>🔇 Auto-speak mode reads the call out loud via TTS — toggle it per-session on the live dashboard.</p>
                </div>
            </div>
        ),
        ctaLabel: "Open Live Dashboard",
        ctaTo: "/live",
    },
    {
        id: "done",
        icon: <CheckCircle2 className="h-6 w-6" />,
        label: "You're ready",
        title: "You're all set!",
        subtitle: "Here's where to go next",
        content: (
            <div className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                    Pit Wall is ready to use. Pick the path that suits you right now:
                </p>
                <div className="space-y-2">
                    {[
                        { icon: <Wifi className="h-4 w-4 text-racing-cyan" />, label: "I want live telemetry while driving", to: "/live", btn: "Open Live Dashboard" },
                        { icon: <LineChart className="h-4 w-4 text-racing-green" />, label: "I have a .ibt file I want to analyse", to: "/lab/lapfile", btn: "Open the Lab" },
                        { icon: <FolderOpen className="h-4 w-4 text-primary" />, label: "I want to browse saved sessions", to: "/sessions", btn: "Session Library" },
                        { icon: <Settings className="h-4 w-4 text-muted-foreground" />, label: "I want to configure AI and local DB", to: "/settings", btn: "Settings" },
                    ].map((item) => (
                        <Link
                            key={item.to}
                            to={item.to as any}
                            className="flex items-center justify-between rounded-lg border border-border bg-rail px-4 py-3 text-sm hover:bg-accent transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                {item.icon}
                                <span className="text-foreground">{item.label}</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground group-hover:text-primary transition-colors">
                                {item.btn}
                                <ChevronRight className="h-3.5 w-3.5" />
                            </div>
                        </Link>
                    ))}
                </div>
                <p className="text-xs text-center text-muted-foreground">
                    Remember: hit the <strong className="text-foreground">?</strong> button in the top-right corner anytime to re-open this guide.
                </p>
            </div>
        ),
    },
];

// ─── Main Component ──────────────────────────────────────────────────────────

export function HelpSystem() {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState(0);

    // Auto-show for first-time visitors
    useEffect(() => {
        const seen = localStorage.getItem(HELP_SEEN_KEY);
        if (!seen) {
            // Slight delay so the app has time to paint first
            const t = setTimeout(() => setOpen(true), 800);
            return () => clearTimeout(t);
        }
    }, []);

    const close = useCallback(() => {
        localStorage.setItem(HELP_SEEN_KEY, "1");
        setOpen(false);
        setStep(0);
    }, []);

    const current = steps[step];
    const isFirst = step === 0;
    const isLast = step === steps.length - 1;

    return (
        <>
            {/* Persistent trigger button */}
            <button
                id="help-trigger"
                onClick={() => { setStep(0); setOpen(true); }}
                className="fixed bottom-4 right-4 z-40 flex h-9 w-9 items-center justify-center rounded-full bg-panel border border-border text-muted-foreground shadow-lg hover:text-primary hover:border-primary/50 transition-all hover:scale-110"
                aria-label="Open help guide"
                title="Help & Getting Started"
            >
                <HelpCircle className="h-4 w-4" />
            </button>

            {/* Backdrop */}
            {open && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={(e) => { if (e.target === e.currentTarget) close(); }}
                >
                    {/* Dialog */}
                    <div className="relative w-full max-w-2xl rounded-xl border border-border bg-background shadow-2xl flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-4 duration-300">

                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                                    {current.icon}
                                </div>
                                <div>
                                    <div className="text-sm font-semibold text-foreground">{current.title}</div>
                                    <div className="text-xs text-muted-foreground">{current.subtitle}</div>
                                </div>
                            </div>
                            <button
                                onClick={close}
                                className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-rail transition-colors"
                                aria-label="Close help"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Step progress bar */}
                        <div className="flex h-1 w-full shrink-0">
                            {steps.map((s, i) => (
                                <button
                                    key={s.id}
                                    onClick={() => setStep(i)}
                                    className={`flex-1 transition-colors ${i <= step ? "bg-primary" : "bg-rail"} ${i === 0 ? "" : "ml-px"}`}
                                    aria-label={`Go to step: ${s.label}`}
                                />
                            ))}
                        </div>

                        {/* Step dots (named) */}
                        <div className="flex items-center gap-1.5 px-6 pt-4 pb-1 shrink-0 overflow-x-auto">
                            {steps.map((s, i) => (
                                <button
                                    key={s.id}
                                    onClick={() => setStep(i)}
                                    className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider transition-all whitespace-nowrap ${i === step
                                            ? "bg-primary/10 text-primary border border-primary/30"
                                            : i < step
                                                ? "text-muted-foreground/80"
                                                : "text-muted-foreground/40"
                                        }`}
                                >
                                    {i < step
                                        ? <CheckCircle2 className="h-2.5 w-2.5" />
                                        : i === step
                                            ? <Circle className="h-2.5 w-2.5 fill-primary text-primary" />
                                            : <Circle className="h-2.5 w-2.5" />
                                    }
                                    {s.label}
                                </button>
                            ))}
                        </div>

                        {/* Main content */}
                        <div className="flex-1 overflow-y-auto px-6 py-4">
                            {current.content}
                        </div>

                        {/* Footer nav */}
                        <div className="flex items-center justify-between px-6 py-4 border-t border-border shrink-0">
                            <button
                                onClick={() => setStep(s => Math.max(0, s - 1))}
                                disabled={isFirst}
                                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back
                            </button>

                            <div className="flex items-center gap-2">
                                {current.ctaLabel && current.ctaTo && (
                                    current.ctaTo.startsWith("/downloads/") || current.ctaTo.includes(".") ? (
                                        <a
                                            href={current.ctaTo}
                                            download
                                            onClick={close}
                                            className="flex items-center gap-1.5 rounded-md border border-border bg-rail px-3 py-1.5 text-xs hover:bg-accent transition-colors"
                                        >
                                            {current.ctaLabel}
                                            <ArrowRight className="h-3 w-3" />
                                        </a>
                                    ) : (
                                        <Link
                                            to={current.ctaTo as any}
                                            onClick={close}
                                            className="flex items-center gap-1.5 rounded-md border border-border bg-rail px-3 py-1.5 text-xs hover:bg-accent transition-colors"
                                        >
                                            {current.ctaLabel}
                                            <ArrowRight className="h-3 w-3" />
                                        </Link>
                                    )
                                )}

                                {isLast ? (
                                    <button
                                        onClick={close}
                                        className="flex items-center gap-1.5 rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
                                    >
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                        Let's go!
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setStep(s => Math.min(steps.length - 1, s + 1))}
                                        className="flex items-center gap-1.5 rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
                                    >
                                        Next
                                        <ArrowRight className="h-3.5 w-3.5" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
