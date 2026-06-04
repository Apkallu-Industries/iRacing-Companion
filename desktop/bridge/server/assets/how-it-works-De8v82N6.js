import { jsxs, jsx } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import {
  Activity,
  Upload,
  FileCode,
  Cpu,
  Workflow,
  LineChart,
  Layers,
  MapPin,
  GitCompare,
  Gauge,
  Lock,
} from "lucide-react";
function HowItWorksPage() {
  return /* @__PURE__ */ jsxs("div", {
    className: "min-h-screen bg-background text-foreground",
    children: [
      /* @__PURE__ */ jsx("header", {
        className: "hairline-b",
        children: /* @__PURE__ */ jsxs("div", {
          className:
            "w-full max-w-none px-4 md:px-12 lg:px-16 flex items-center justify-between py-4 relative",
          children: [
            /* @__PURE__ */ jsxs(Link, {
              to: "/",
              className: "flex items-center gap-2",
              children: [
                /* @__PURE__ */ jsx("div", {
                  className:
                    "flex h-7 w-7 items-center justify-center rounded-sm bg-primary text-primary-foreground",
                  children: /* @__PURE__ */ jsx(Activity, { className: "h-4 w-4" }),
                }),
                /* @__PURE__ */ jsx("span", {
                  className: "font-mono text-sm tracking-wider",
                  children: "PIT WALL",
                }),
              ],
            }),
            /* @__PURE__ */ jsxs("nav", {
              className:
                "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex items-center gap-4 text-sm",
              children: [
                /* @__PURE__ */ jsx(Link, {
                  to: "/",
                  className: "rounded-sm px-3 py-1.5 hover:bg-accent transition-colors",
                  children: "Home",
                }),
                /* @__PURE__ */ jsx(Link, {
                  to: "/live",
                  className: "rounded-sm px-3 py-1.5 hover:bg-accent transition-colors",
                  children: "Live",
                }),
                /* @__PURE__ */ jsx(Link, {
                  to: "/sessions",
                  className: "rounded-sm px-3 py-1.5 hover:bg-accent transition-colors",
                  children: "Sessions",
                }),
              ],
            }),
            /* @__PURE__ */ jsx(Link, {
              to: "/auth",
              className:
                "rounded-sm bg-primary px-3 py-1.5 font-medium text-primary-foreground hover:opacity-90 transition-opacity",
              children: "Get started",
            }),
          ],
        }),
      }),
      /* @__PURE__ */ jsxs("section", {
        className: "relative overflow-hidden hairline-b",
        children: [
          /* @__PURE__ */ jsx("div", {
            className: "absolute inset-0 -z-10 opacity-[0.04]",
            style: {
              backgroundImage:
                "linear-gradient(var(--grid-major) 1px, transparent 1px), linear-gradient(90deg, var(--grid-major) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            },
          }),
          /* @__PURE__ */ jsxs("div", {
            className: "w-full max-w-none px-4 md:px-12 lg:px-16 py-20",
            children: [
              /* @__PURE__ */ jsx("p", {
                className: "font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground",
                children: "How it works",
              }),
              /* @__PURE__ */ jsxs("h1", {
                className: "mt-4 text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl",
                children: [
                  "From ",
                  /* @__PURE__ */ jsx("span", {
                    className: "text-primary",
                    children: "binary tick stream",
                  }),
                  /* @__PURE__ */ jsx("br", {}),
                  "to a workbench, in seconds.",
                ],
              }),
              /* @__PURE__ */ jsxs("p", {
                className: "mt-6 max-w-2xl text-lg text-muted-foreground",
                children: [
                  "Pit Wall reads iRacing's native ",
                  /* @__PURE__ */ jsx("code", {
                    className: "font-mono text-foreground",
                    children: ".ibt",
                  }),
                  " ",
                  "telemetry format directly in your browser. No plugins, no installs, no upload pipeline waiting on a server. The same data your sim writes to disk — parsed locally, indexed, and rendered as a MoTeC-style analysis workspace.",
                ],
              }),
            ],
          }),
        ],
      }),
      /* @__PURE__ */ jsxs("section", {
        className: "w-full max-w-none px-4 md:px-12 lg:px-16 py-20",
        children: [
          /* @__PURE__ */ jsx("h2", {
            className: "font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground",
            children: "The pipeline",
          }),
          /* @__PURE__ */ jsx("h3", {
            className: "mt-2 text-3xl font-semibold tracking-tight",
            children: "Five stages, one Web Worker",
          }),
          /* @__PURE__ */ jsx("ol", {
            className: "mt-12 grid gap-px overflow-hidden rounded-sm bg-border md:grid-cols-5",
            children: [
              {
                n: "01",
                icon: Upload,
                h: "Upload",
                p: "Drop the .ibt into your account. The file is stored privately, scoped to your user via row-level security.",
              },
              {
                n: "02",
                icon: FileCode,
                h: "Decode header",
                p: "Read the IRSDK header, variable headers and embedded session YAML. Detect tick rate, duration, car and track.",
              },
              {
                n: "03",
                icon: Cpu,
                h: "Stream samples",
                p: "A Web Worker walks every tick record, decoding 250+ channels into Float32Arrays without freezing the UI.",
              },
              {
                n: "04",
                icon: Workflow,
                h: "Reconstruct",
                p: "Detect lap boundaries from the Lap channel and integrate VelocityX/Y + Yaw to rebuild the track outline.",
              },
              {
                n: "05",
                icon: LineChart,
                h: "Render",
                p: "uPlot draws synchronized stacked traces with a sub-frame cursor shared across charts, map and gauges.",
              },
            ].map((s) =>
              /* @__PURE__ */ jsxs(
                "div",
                {
                  className: "bg-panel p-6",
                  children: [
                    /* @__PURE__ */ jsxs("div", {
                      className: "flex items-center justify-between",
                      children: [
                        /* @__PURE__ */ jsx("span", {
                          className: "font-mono text-xs text-muted-foreground",
                          children: s.n,
                        }),
                        /* @__PURE__ */ jsx(s.icon, { className: "h-4 w-4 text-primary" }),
                      ],
                    }),
                    /* @__PURE__ */ jsx("h4", {
                      className: "mt-6 text-base font-medium",
                      children: s.h,
                    }),
                    /* @__PURE__ */ jsx("p", {
                      className: "mt-2 text-sm text-muted-foreground",
                      children: s.p,
                    }),
                  ],
                },
                s.n,
              ),
            ),
          }),
        ],
      }),
      /* @__PURE__ */ jsx("section", {
        className: "hairline-t bg-rail",
        children: /* @__PURE__ */ jsxs("div", {
          className:
            "w-full max-w-none px-4 md:px-12 lg:px-16 py-20 md:grid md:grid-cols-2 md:gap-16",
          children: [
            /* @__PURE__ */ jsxs("div", {
              children: [
                /* @__PURE__ */ jsx("h2", {
                  className: "font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground",
                  children: "The .ibt format",
                }),
                /* @__PURE__ */ jsx("h3", {
                  className: "mt-2 text-3xl font-semibold tracking-tight",
                  children: "A binary log of every tick.",
                }),
                /* @__PURE__ */ jsx("p", {
                  className: "mt-6 text-muted-foreground",
                  children:
                    "An iRacing telemetry file is a fixed-layout binary stream: a 48-byte IRSDK header, a table of variable definitions, the session-info YAML, then a tightly packed array of tick records — one per simulator frame at 60 Hz (or 360 Hz for high-rate sessions).",
                }),
                /* @__PURE__ */ jsxs("p", {
                  className: "mt-4 text-muted-foreground",
                  children: [
                    "Each variable header tells us its type (",
                    /* @__PURE__ */ jsx("code", { className: "font-mono", children: "Float" }),
                    ",",
                    " ",
                    /* @__PURE__ */ jsx("code", { className: "font-mono", children: "Double" }),
                    ", ",
                    /* @__PURE__ */ jsx("code", { className: "font-mono", children: "Int" }),
                    ",",
                    " ",
                    /* @__PURE__ */ jsx("code", { className: "font-mono", children: "Bitfield" }),
                    ", ",
                    /* @__PURE__ */ jsx("code", { className: "font-mono", children: "Bool" }),
                    "), its byte offset within a tick record, and its array count. Pit Wall materializes each variable into a typed array so any channel can be plotted instantly without a re-parse.",
                  ],
                }),
              ],
            }),
            /* @__PURE__ */ jsx("pre", {
              className:
                "mt-8 overflow-x-auto rounded-sm border border-border bg-panel p-5 font-mono text-[11px] leading-relaxed text-muted-foreground md:mt-0",
              children: `┌─────────────────────────────────────────────┐
│ IRSDK Header        48 B   ver, tickRate,…  │
├─────────────────────────────────────────────┤
│ VarBuf Header       16 B   bufOffset, ticks │
├─────────────────────────────────────────────┤
│ Variable Headers    144 B × N               │
│   ├ type   (Float | Int | Bitfield | …)     │
│   ├ offset (within a tick record)           │
│   ├ count  (array length, e.g. 4 tires)     │
│   ├ name   "Speed", "Throttle", …           │
│   ├ desc   human-readable description       │
│   └ unit   "m/s", "rad", "%"                │
├─────────────────────────────────────────────┤
│ Session Info YAML   variable length          │
│   driver · car · track · weather · setup    │
├─────────────────────────────────────────────┤
│ Tick Record × T                             │
│   [ Speed | Throttle | Brake | RPM | … ]    │
│   [ Speed | Throttle | Brake | RPM | … ]    │
│   …                                          │
└─────────────────────────────────────────────┘`,
            }),
          ],
        }),
      }),
      /* @__PURE__ */ jsxs("section", {
        className: "w-full max-w-none px-4 md:px-12 lg:px-16 py-20",
        children: [
          /* @__PURE__ */ jsx("h2", {
            className: "font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground",
            children: "The workbench",
          }),
          /* @__PURE__ */ jsx("h3", {
            className: "mt-2 text-3xl font-semibold tracking-tight",
            children: "Four panes, one synchronized cursor.",
          }),
          /* @__PURE__ */ jsx("div", {
            className: "mt-12 grid gap-px overflow-hidden rounded-sm bg-border md:grid-cols-2",
            children: [
              {
                icon: Layers,
                h: "Channel browser",
                p: "All 250+ variables grouped by Driver Inputs, Vehicle, Engine, Tires, Suspension, Session, Environment. Click to plot, search to filter.",
              },
              {
                icon: LineChart,
                h: "Stacked traces",
                p: "Each selected channel gets its own uPlot panel with shared X-axis, header readout (min / max / avg / unit) and a sub-frame cursor.",
              },
              {
                icon: MapPin,
                h: "Track map",
                p: "XY outline reconstructed from VelocityX/Y rotated by Yaw, integrated tick-by-tick. A live dot follows the cursor as you scrub.",
              },
              {
                icon: GitCompare,
                h: "Lap compare",
                p: "Pick a reference lap and a compare lap from the detected lap list. Compare lap is overlaid on every trace as a dashed line.",
              },
            ].map((f) =>
              /* @__PURE__ */ jsxs(
                "div",
                {
                  className: "bg-panel p-6",
                  children: [
                    /* @__PURE__ */ jsx(f.icon, { className: "h-5 w-5 text-primary" }),
                    /* @__PURE__ */ jsx("h4", {
                      className: "mt-4 text-base font-medium",
                      children: f.h,
                    }),
                    /* @__PURE__ */ jsx("p", {
                      className: "mt-2 text-sm text-muted-foreground",
                      children: f.p,
                    }),
                  ],
                },
                f.h,
              ),
            ),
          }),
        ],
      }),
      /* @__PURE__ */ jsx("section", {
        className: "hairline-t bg-rail",
        children: /* @__PURE__ */ jsxs("div", {
          className:
            "w-full max-w-none px-4 md:px-12 lg:px-16 grid gap-px overflow-hidden rounded-sm bg-border py-20 md:grid-cols-3",
          children: [
            /* @__PURE__ */ jsxs("div", {
              className: "bg-panel p-6",
              children: [
                /* @__PURE__ */ jsx(Cpu, { className: "h-5 w-5 text-primary" }),
                /* @__PURE__ */ jsx("h4", {
                  className: "mt-4 text-base font-medium",
                  children: "Off the main thread",
                }),
                /* @__PURE__ */ jsx("p", {
                  className: "mt-2 text-sm text-muted-foreground",
                  children:
                    "Parsing runs in a dedicated Web Worker. Typed-array buffers are transferred (not copied) back to the UI, so a 100 MB session never blocks input or animation.",
                }),
              ],
            }),
            /* @__PURE__ */ jsxs("div", {
              className: "bg-panel p-6",
              children: [
                /* @__PURE__ */ jsx(Gauge, { className: "h-5 w-5 text-primary" }),
                /* @__PURE__ */ jsx("h4", {
                  className: "mt-4 text-base font-medium",
                  children: "Built for 360 Hz",
                }),
                /* @__PURE__ */ jsx("p", {
                  className: "mt-2 text-sm text-muted-foreground",
                  children:
                    "uPlot is a non-React canvas renderer that handles hundreds of thousands of points per channel with a smooth, single-pixel cursor — exactly what MoTeC users expect.",
                }),
              ],
            }),
            /* @__PURE__ */ jsxs("div", {
              className: "bg-panel p-6",
              children: [
                /* @__PURE__ */ jsx(Lock, { className: "h-5 w-5 text-primary" }),
                /* @__PURE__ */ jsx("h4", {
                  className: "mt-4 text-base font-medium",
                  children: "Yours alone",
                }),
                /* @__PURE__ */ jsx("p", {
                  className: "mt-2 text-sm text-muted-foreground",
                  children:
                    "Files are stored in a private bucket scoped by row-level security. Only your authenticated account can list, read or delete them.",
                }),
              ],
            }),
          ],
        }),
      }),
      /* @__PURE__ */ jsxs("section", {
        className: "w-full max-w-none px-4 md:px-12 lg:px-16 py-20",
        children: [
          /* @__PURE__ */ jsx("h2", {
            className: "font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground",
            children: "FAQ",
          }),
          /* @__PURE__ */ jsx("h3", {
            className: "mt-2 text-3xl font-semibold tracking-tight",
            children: "Common questions",
          }),
          /* @__PURE__ */ jsx("dl", {
            className: "mt-10 space-y-8",
            children: [
              {
                q: "Where do .ibt files come from?",
                a: "iRacing writes one to your Documents/iRacing/telemetry folder whenever you press Alt+L on track. Pit Wall reads that file as-is — no conversion needed.",
              },
              {
                q: "Which IRSDK version is supported?",
                a: "Version 2 (the current iRacing format). Both 60 Hz and 360 Hz logs are handled; tick rate is read from the file header.",
              },
              {
                q: "Are my files uploaded anywhere?",
                a: "Files are stored in your private account bucket so you can revisit sessions across devices. Parsing itself happens entirely in your browser.",
              },
              {
                q: "How accurate is the reconstructed track map?",
                a: "The map integrates VelocityX/Y rotated into the world frame by Yaw. It's accurate enough to see racing lines and braking points; it's not a survey-grade GPS trace.",
              },
              {
                q: "Can I compare two laps?",
                a: "Yes. Pick a reference lap and a compare lap from the lap list. Every selected trace shows the compare lap as a dashed overlay aligned to lap-relative time.",
              },
            ].map((f) =>
              /* @__PURE__ */ jsxs(
                "div",
                {
                  className: "hairline-b pb-6",
                  children: [
                    /* @__PURE__ */ jsx("dt", {
                      className: "text-base font-medium",
                      children: f.q,
                    }),
                    /* @__PURE__ */ jsx("dd", {
                      className: "mt-2 text-sm text-muted-foreground",
                      children: f.a,
                    }),
                  ],
                },
                f.q,
              ),
            ),
          }),
        ],
      }),
      /* @__PURE__ */ jsx("section", {
        className: "hairline-t",
        children: /* @__PURE__ */ jsxs("div", {
          className:
            "w-full max-w-none px-4 md:px-12 lg:px-16 flex flex-col items-start gap-6 py-20 md:flex-row md:items-center md:justify-between",
          children: [
            /* @__PURE__ */ jsxs("div", {
              children: [
                /* @__PURE__ */ jsx("h3", {
                  className: "text-3xl font-semibold tracking-tight",
                  children: "Ready to read every channel?",
                }),
                /* @__PURE__ */ jsx("p", {
                  className: "mt-2 text-muted-foreground",
                  children: "Create an account and drop in your first .ibt.",
                }),
              ],
            }),
            /* @__PURE__ */ jsxs("div", {
              className: "flex items-center gap-3",
              children: [
                /* @__PURE__ */ jsx(Link, {
                  to: "/auth",
                  className:
                    "rounded-sm bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:opacity-90",
                  children: "Open the workbench →",
                }),
                /* @__PURE__ */ jsx(Link, {
                  to: "/",
                  className:
                    "rounded-sm border border-border-strong px-5 py-3 text-sm hover:bg-accent",
                  children: "Back to home",
                }),
              ],
            }),
          ],
        }),
      }),
      /* @__PURE__ */ jsx("footer", {
        className: "hairline-t",
        children: /* @__PURE__ */ jsx("div", {
          className:
            "w-full max-w-none px-4 md:px-12 lg:px-16 py-6 font-mono text-xs text-muted-foreground",
          children: "PIT WALL · iRacing IBT v2 · 60 / 360 Hz",
        }),
      }),
    ],
  });
}
export { HowItWorksPage as component };
