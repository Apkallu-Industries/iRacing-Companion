import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, Gauge, LineChart, ArrowRight, Download, Terminal, Wifi, Cpu } from "lucide-react";

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
  return (
    <main className="min-h-screen bg-background text-foreground">
      <nav className="hairline-b flex h-12 items-center px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-sm bg-primary text-primary-foreground">
            <Activity className="h-3.5 w-3.5" />
          </div>
          <span className="font-mono text-xs tracking-wider">PIT WALL</span>
        </div>
        <div className="ml-auto flex items-center gap-4 text-xs">
          <Link to="/live" className="hover:text-primary">Live</Link>
          <Link to="/lab/lapfile" className="hover:text-primary">Lab</Link>
          <Link to="/sessions" className="hover:text-primary">Sessions</Link>
          <Link to="/how-it-works" className="hover:text-primary">How it works</Link>
          <Link to="/roadmap" className="hover:text-primary">Roadmap</Link>
          <Link
            to="/auth"
            className="rounded-sm bg-primary px-3 py-1 text-primary-foreground hover:opacity-90"
          >
            Sign in
          </Link>
        </div>
      </nav>

      <section className="mx-auto max-w-5xl px-6 py-24 text-center">
        <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          iRacing telemetry, end to end
        </p>
        <h1 className="text-5xl font-semibold tracking-tight md:text-6xl">
          Live data on track.<br />
          <span className="text-primary">Deep analysis off track.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground">
          Pit Wall streams real-time telemetry from a tiny local bridge while you drive, and
          opens your saved <span className="font-mono">.ibt</span> files in a MoTeC-style
          workbench with traces, track map, sector analysis and an AI coach.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <a
            href="/downloads/pit-wall-bridge.zip"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            <Download className="h-4 w-4" /> Download Bridge (Windows)
          </a>
          <Link
            to="/live"
            className="inline-flex items-center gap-2 rounded-md border border-border bg-panel px-5 py-2.5 text-sm font-medium hover:bg-accent"
          >
            <Gauge className="h-4 w-4" /> Open Live Dashboard
          </Link>
          <Link
            to="/lab/lapfile"
            className="inline-flex items-center gap-2 rounded-md border border-border bg-panel px-5 py-2.5 text-sm font-medium hover:bg-accent"
          >
            <LineChart className="h-4 w-4" /> Analyze a Lap File
          </Link>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          <a href="#install" className="underline hover:text-primary">Jump to install instructions</a>
        </p>
      </section>

      <section className="mx-auto max-w-5xl grid gap-4 px-6 pb-12 md:grid-cols-2">
        <article className="hairline rounded-md bg-panel p-6">
          <div className="mb-3 flex items-center gap-2">
            <Gauge className="h-4 w-4 text-primary" />
            <h2 className="font-semibold">Live Telemetry</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Run the local bridge on your sim PC and watch gear, RPM, lap delta, tire temps,
            fuel and G-force update in real time. Available in-browser and as a PWA.
          </p>
          <Link to="/live" className="mt-4 inline-flex items-center gap-1 text-sm text-primary">
            Open the dashboard <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </article>

        <article className="hairline rounded-md bg-panel p-6">
          <div className="mb-3 flex items-center gap-2">
            <LineChart className="h-4 w-4 text-primary" />
            <h2 className="font-semibold">Lap-File Workbench</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Upload <span className="font-mono">.ibt</span> files for stacked traces, GG diagram,
            track map, sector spider, optimal lap, brake bias and AI coaching insights.
          </p>
          <Link to="/lab/lapfile" className="mt-4 inline-flex items-center gap-1 text-sm text-primary">
            Open the workbench <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </article>
      </section>

      <section id="install" className="mx-auto max-w-5xl px-6 pb-24">
        <div className="mb-8 text-center">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            Getting started
          </p>
          <h2 className="text-3xl font-semibold tracking-tight">Install the Bridge in 3 steps</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground">
            The bridge is a tiny Node.js app that reads iRacing's Shared Memory API and broadcasts
            telemetry over WebSocket to your browser. It runs on the same Windows PC as iRacing.
          </p>
        </div>

        <div className="mb-8 grid gap-3 text-sm md:grid-cols-3">
          <div className="hairline rounded-md bg-panel p-4">
            <div className="mb-2 flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-muted-foreground">
              <Cpu className="h-3.5 w-3.5" /> Requirements
            </div>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Windows 10 / 11</li>
              <li>• iRacing installed</li>
              <li>• <a className="text-primary underline" href="https://nodejs.org/" target="_blank" rel="noreferrer">Node.js 20 LTS+</a></li>
            </ul>
          </div>
          <div className="hairline rounded-md bg-panel p-4">
            <div className="mb-2 flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-muted-foreground">
              <Wifi className="h-3.5 w-3.5" /> What it does
            </div>
            <p className="text-muted-foreground">
              Reads telemetry locally and serves it on <span className="font-mono">ws://&lt;your-pc&gt;:3001</span>.
              No cloud, no account, nothing leaves your network.
            </p>
          </div>
          <div className="hairline rounded-md bg-panel p-4">
            <div className="mb-2 flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-muted-foreground">
              <Terminal className="h-3.5 w-3.5" /> One command
            </div>
            <p className="text-muted-foreground">
              Unzip → <span className="font-mono">npm install</span> → <span className="font-mono">npm start</span>.
              That's it.
            </p>
          </div>
        </div>

        <ol className="space-y-4">
          <li className="hairline rounded-md bg-panel p-5">
            <div className="mb-2 flex items-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-mono text-primary-foreground">1</span>
              <h3 className="font-semibold">Download &amp; unzip</h3>
            </div>
            <p className="mb-3 text-sm text-muted-foreground">
              Grab the bridge package and extract it somewhere easy to find, e.g.
              <span className="font-mono"> C:\PitWall\bridge</span>.
            </p>
            <a
              href="/downloads/pit-wall-bridge.zip"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              <Download className="h-4 w-4" /> pit-wall-bridge.zip
            </a>
          </li>

          <li className="hairline rounded-md bg-panel p-5">
            <div className="mb-2 flex items-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-mono text-primary-foreground">2</span>
              <h3 className="font-semibold">Install dependencies &amp; start it</h3>
            </div>
            <p className="mb-3 text-sm text-muted-foreground">
              Open <span className="font-mono">PowerShell</span> in the unzipped folder
              (Shift + Right-click → "Open PowerShell window here") and run:
            </p>
            <pre className="overflow-x-auto rounded-md border border-border bg-background p-3 font-mono text-xs leading-relaxed">
              {`cd C:\\PitWall\\bridge
npm install
npm start`}
            </pre>
            <p className="mt-3 text-xs text-muted-foreground">
              First run only: when Windows Firewall prompts, allow Node.js on
              <strong> Private networks</strong> so other devices on your Wi-Fi can connect.
            </p>
          </li>

          <li className="hairline rounded-md bg-panel p-5">
            <div className="mb-2 flex items-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-mono text-primary-foreground">3</span>
              <h3 className="font-semibold">Open the dashboard</h3>
            </div>
            <p className="mb-3 text-sm text-muted-foreground">
              Launch iRacing and get in a car. Then open Pit Wall:
            </p>
            <ul className="mb-3 space-y-1 text-sm text-muted-foreground">
              <li>• On the sim PC: <span className="font-mono">http://localhost:3001</span></li>
              <li>• On phone / tablet / second screen: <span className="font-mono">http://&lt;your-pc-ip&gt;:3001</span> (the bridge prints the URLs on startup)</li>
              <li>• Or use the hosted dashboard here — it auto-connects to <span className="font-mono">ws://localhost:3001</span> when opened on the sim PC.</li>
            </ul>
            <Link
              to="/live"
              className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
            >
              <Gauge className="h-4 w-4" /> Open Live Dashboard <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </li>
        </ol>

        <div className="mt-8 hairline rounded-md bg-panel p-5">
          <h3 className="mb-2 font-semibold">Troubleshooting</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <strong className="text-foreground">Phone can't connect:</strong> Windows Firewall is
              blocking port 3001. Run this once in an Administrator PowerShell:
              <pre className="mt-1 overflow-x-auto rounded-md border border-border bg-background p-2 font-mono text-xs">
                {`New-NetFirewallRule -DisplayName "Pit Wall" -Direction Inbound -LocalPort 3001 -Protocol TCP -Action Allow`}
              </pre>
            </li>
            <li>
              <strong className="text-foreground">npm install fails with C++ errors:</strong> delete
              <span className="font-mono"> node_modules </span> and <span className="font-mono">package-lock.json</span>, then re-run <span className="font-mono">npm install</span>.
            </li>
            <li>
              <strong className="text-foreground">Dashboard says "Disconnected":</strong> make sure
              iRacing is running and you're on track (not in the menus), and that the bridge
              terminal shows <span className="font-mono">iRacing connected</span>.
            </li>
            <li>
              <strong className="text-foreground">macOS / Linux:</strong> iRacing's telemetry API is
              Windows-only — the bridge needs to run on the same Windows machine as iRacing.
            </li>
          </ul>
        </div>

        <div className="mt-8 grid gap-3 text-sm md:grid-cols-2">
          <Link to="/lab/lapfile" className="hairline rounded-md bg-panel p-5 hover:bg-accent">
            <h3 className="mb-1 font-semibold">No sim PC handy?</h3>
            <p className="text-muted-foreground">
              Upload a saved <span className="font-mono">.ibt</span> lap file to the Lab and
              analyze it without the bridge.
            </p>
          </Link>
          <Link to="/how-it-works" className="hairline rounded-md bg-panel p-5 hover:bg-accent">
            <h3 className="mb-1 font-semibold">How it works</h3>
            <p className="text-muted-foreground">
              Architecture, data flow, and what each panel of the workbench actually computes.
            </p>
          </Link>
        </div>
      </section>

    </main>
  );
}
