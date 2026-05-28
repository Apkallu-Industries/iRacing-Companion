# Pit Wall — iRacing Bridge

The bridge reads iRacing's Shared Memory API and streams telemetry to the Pit Wall dashboard at **60Hz** over WebSocket.

Run it on the same Windows PC as iRacing. Then open the Pit Wall dashboard on any device on your network.

---

## Requirements

- **Windows PC** running iRacing
- Node.js 24 LTS or newer

---

## Quick start

```powershell
cd local-bridge
npm install
npm start
```

The terminal prints all the URLs when it starts:

```
[bridge] dashboard:  http://localhost:3001
[bridge] websocket:  ws://localhost:3001
[bridge] network:    http://192.168.x.x:3001
```

Open **http://localhost:3001** on the sim PC, or  
**http://\<your-pc-ip\>:3001** from your phone, tablet, or second screen.

---

## Install as a PWA

Open the dashboard in Chrome or Edge → click **Install** (address bar) or browser menu → **Install Pit Wall**.  
Launches like a native app — full screen, no browser chrome.

---

## What it sends

Every 60Hz tick, the bridge sends a `Telemetry` JSON packet over WebSocket containing:

- Gear, speed, RPM, shift lights
- Throttle, brake, clutch, steering
- Lap timing: last lap, best lap, delta, sector splits
- Tyre temps, pressures, wear, brake temps
- Fuel remaining, estimated laps
- G-forces (lateral + longitudinal)
- Brake bias, diff map
- Air/track temperature, wind, wetness
- Competitors list (position, gaps)
- **Extras block**: yaw rate, shock deflection, brake line pressures, wheel speeds, pitch/roll, tyre forces, velocity XYZ

---

## Troubleshooting

**Phone/tablet can't connect**  
Windows Firewall is blocking port 3001. Run once in an Administrator PowerShell:
```powershell
New-NetFirewallRule -DisplayName "Pit Wall" -Direction Inbound -LocalPort 3001 -Protocol TCP -Action Allow
```

**`npm install` fails with C++ errors**  
Delete stale modules and reinstall:
```powershell
Remove-Item -Recurse -Force node_modules, package-lock.json -ErrorAction SilentlyContinue
npm install
```

**Dashboard shows "Disconnected"**  
- Make sure iRacing is running and you are **on track** (not in the menus)
- The bridge terminal should show `[bridge] iRacing connected`
- If it shows `irsdk-node unavailable`, try reinstalling: `npm install irsdk-node`

**macOS / Linux**  
The bridge process will start but iRacing's Shared Memory API is Windows-only — there is nothing to read. Run the bridge on your Windows sim PC.

---

## Architecture

See [`BRIDGE_ARCHITECTURE.md`](../BRIDGE_ARCHITECTURE.md) for the full data flow, Telemetry interface definition, and guide for adding new channels.
