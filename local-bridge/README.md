# iRacing → Pit Wall Local Bridge

Run the bridge on your Windows iRacing PC and stream live telemetry to the app on port `3001`.

## Requirements

- Windows PC running iRacing
- Node.js 20+ installed

## Run

```powershell
cd C:\Dev\iRacing-Companion\local-bridge
npm install
npm start
```

Then open:

- `http://localhost:3001` on the same PC
- `http://<your-pc-ip>:3001` from another device on your network

## Performance rate controls

Optional environment variables:

- `TICK_HZ` (sampling rate from IRSDK, default `120`, max `360`)
- `UI_HZ` (WebSocket stream rate, default `60`)
- `RECORD_HZ` (recording rate, default `120`)
- `ADAPTIVE_UI` (`1` default): auto-fallback to `30Hz` for slow clients

Example:

```powershell
$env:TICK_HZ=240
$env:UI_HZ=60
$env:RECORD_HZ=240
$env:ADAPTIVE_UI=1
npm start
```

## Troubleshooting

- Phone cannot connect:
  - Allow Node.js through Windows Firewall on private networks.
- iRacing data not updating:
  - Bridge must run on the same Windows machine as iRacing (IRSDK is Windows shared-memory).
- Install/build errors:
  - Clear stale modules and reinstall:
  ```powershell
  Remove-Item -Recurse -Force node_modules, package-lock.json -ErrorAction SilentlyContinue
  npm install
  ```
