````md
# PIT WALL — COMPLETE UI/UX OVERHAUL DIRECTIVE
## Objective
Transform Pit Wall from a “web dashboard” aesthetic into a professional motorsport engineering platform comparable to:

- MoTeC i2
- Cosworth Pi Toolbox
- Bosch Motorsport systems
- ATLAS telemetry
- WEC / IMSA / GT3 race engineering workstations
- GTP Hybrid race command systems

The software already has industry-leading engineering capabilities. The current UI visually undersells the product. The goal is to create a telemetry-first desktop operating environment that feels professional, high-performance, dense, tactical, and engineering-grade.

This is NOT a consumer SaaS dashboard redesign.
This IS a motorsport engineering workstation redesign.

---

# CORE DESIGN PHILOSOPHY

## The app should feel:
- expensive
- operationally critical
- low-latency
- engineering-first
- motorsport-grade
- desktop-native
- telemetry-dense
- race-team focused

## The app should NOT feel:
- mobile-first
- startup SaaS
- social app
- dribbble concept
- glassmorphism UI
- “friendly”
- oversized
- generic Tailwind

---

# PRIMARY VISUAL REFERENCES

Design direction:
- MoTeC i2 Pro
- Pi Toolbox
- Bosch Motorsport displays
- WEC / IMSA pit wall systems
- Hypercar/GTP hybrid telemetry systems
- Bloomberg Terminal
- Unreal Engine editor
- VSCode panel architecture

---

# GLOBAL UI REQUIREMENTS

## Layout Philosophy
Replace “dashboard card layout” with:
- pane-based workstation architecture
- dockable windows
- split panels
- synchronized telemetry views
- persistent workspaces
- detachable analysis panes
- desktop-native interaction patterns

The UI should resemble professional software, NOT a webpage.

---

# DESIGN TOKENS

## Backgrounds
- ultra-dark matte backgrounds
- layered dark panels
- subtle tonal separation
- minimal gradients

Example:
- #05070A
- #0B0F14
- #11161D
- #161C24

## Borders
- thin separators
- subtle panel outlines
- minimal shadows

Example:
- #1C2430
- #263241

## Accent Colors
Use color FUNCTIONALLY.

### Telemetry Blue
- #3B82F6

### Delta Green
- #00D17F

### Warning Red
- #FF4D4D

### Hybrid Purple
- #8B5CF6

### Warning Amber
- #FFB800

DO NOT use random gradients or decorative color usage.

---

# TYPOGRAPHY SYSTEM

## Typography should feel:
- technical
- calibrated
- dense
- mechanical

## Fonts
Preferred:
- Inter Tight
- IBM Plex Sans
- Eurostile
- Geist Mono
- JetBrains Mono

## Rules
- uppercase engineering labels
- compact spacing
- tabular numerics
- tight line-height
- small telemetry labels

Example:
```css
font-variant-numeric: tabular-nums;
letter-spacing: 0.08em;
text-transform: uppercase;
````

# COMPONENT RULES

## DO NOT USE

* large border radii
* oversized cards
* soft glassmorphism
* giant shadows
* excessive padding
* oversized icons
* bubbly UI
* mobile spacing

## USE

* hard-edge panels
* compact spacing
* telemetry density
* engineering tables
* thin separators
* precise alignment
* compact labels

Preferred radius:

* 0px–4px

---

# APPLICATION STRUCTURE

# APP ENTRY EXPERIENCE

When Electron launches, show a dedicated desktop landing interface.

## Required Sections

* LIVE TELEMETRY
* ANALYSIS WORKBENCH
* AI ENGINEER
* TUTORIAL
* DOCUMENTATION / README
* SETTINGS
* LOGIN

## Landing Page Feel

* cinematic GTP/GT3 visual language
* dark motorsport atmosphere
* subtle telemetry animation
* live system status
* recent sessions
* race engineering feel

NOT a marketing website.

---

# LIVE TELEMETRY MODE

## Goal

Create a professional race command center.

## Layout

* left engineering navigation rail
* central telemetry cluster
* large trace/graph region
* right AI/strategy rail
* bottom timing/session rail

## Features

* live 60Hz feel
* active telemetry movement
* fuel calculations
* ERS deployment
* brake temperatures
* sector timing
* delta tracking
* tyre state
* hybrid deployment visualization

## Style

Inspired by:

* GTP Hybrid systems
* IMSA pit wall displays
* endurance racing engineering software

---

# ANALYSIS WORKBENCH

## Goal

Become “MoTeC inside Electron.”

## Core UX

* synchronized stacked traces
* resizable panes
* channel browser
* cursor synchronization
* track map
* G-G diagram
* sector overlays
* lap compare
* detachable windows
* workspace presets
* saved layouts

## Chart Philosophy

Charts are the PRIMARY product.
Charts should occupy 60–70% of screen space.

## Telemetry Feel

* ultra-sharp traces
* engineering overlays
* synchronized cursors
* lap markers
* sector highlights
* data-dense visualization

---

# AI ENGINEER EXPERIENCE

## DO NOT make it look like ChatGPT.

Avoid:

* chat bubbles
* messaging UI
* assistant aesthetics

## Instead:

Create a race engineer analysis terminal.

Example style:

AI ENGINEER ANALYSIS

TURN 4 ENTRY
Rear instability detected under trail braking.

RECOMMENDATION

* Reduce rear rebound 1 click
* Smooth brake release
* Earlier throttle rotation

STYLE:

* technical
* concise
* engineering-focused
* race-team tone

---

# WINDOWING SYSTEM

Implement a professional desktop pane architecture.

## Requirements

* resizable panels
* draggable sections
* persistent layouts
* saved workspaces
* detachable telemetry windows
* multi-monitor friendly

## Recommended Libraries

* react-resizable-panels
* flexlayout-react
* golden-layout

This is CRITICAL to making the app feel like professional software.

---

# INTERACTION DESIGN

## The application should be keyboard-first.

### Required

* command palette
* hotkeys
* fast navigation
* quick channel search
* workspace switching

### Example

* Ctrl+1 → Live
* Ctrl+2 → Analysis
* Ctrl+3 → AI Engineer
* Ctrl+4 → Strategy
* Ctrl+, → Settings

---

# ELECTRON UX

## Desktop-native requirements

* frameless window
* custom titlebar
* native-feeling transitions
* low-latency interaction
* smooth resize behavior
* persistent window state

The app should feel like:

* VSCode
* Unreal Editor
* professional simulation tooling

NOT a browser app inside Electron.

---

# PERFORMANCE REQUIREMENTS

The UI must feel:

* extremely responsive
* low-latency
* high refresh rate
* operationally critical

Avoid:

* excessive animation
* slow transitions
* layout thrashing
* heavy blur effects

Prefer:

* GPU-friendly rendering
* efficient canvas rendering
* lightweight transitions

---

# RESPONSIVE PRIORITY

DESKTOP FIRST.

This application is primarily:

* race engineering software
* telemetry tooling
* workstation software

Mobile support is secondary.

DO NOT optimize layout philosophy around mobile-first paradigms.

---

# FINAL GOAL

The final product should visually communicate:

“This is industry-grade motorsport telemetry and analysis software.”

NOT:

“This is a racing-themed startup dashboard.”

The UI should feel capable of being used by:

* GT3 teams
* IMSA engineers
* endurance racing strategists
* esports telemetry analysts
* professional sim racers

Pit Wall should feel like a complete motorsport operating platform.

```
```
