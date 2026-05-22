# iRacing → Pit Wall Bridge + Local Dashboard

One command. One URL. Live telemetry from iRacing on any device on your network,
installable as a PWA.

## Requirements

- **Windows PC** running iRacing
- Node.js 20 LTS or newer

## Run

```powershell
cd C:\Dev\iRacing-Companion\local-bridge
npm install
npm start
```

Then open **<http://localhost:3001>** on the same PC, or
**<http://:3001>** on a different PC.** from your phone, tablet, or second screen.
The terminal prints all the URLs when it starts.

That's it. No HTTPS, no mixed-content errors, no cloud account needed.

## Install as an app

Open the dashboard in Chrome/Edge → click the **Install** button (top right)
or use the browser menu → "Install Pit Wall". It launches like a native app,
full screen, no browser chrome.

## Troubleshooting

- **Phone can't connect** → Windows Firewall is blocking port 3001. Allow Node.js
  through "Private networks" the first time it prompts, or run
  `New-NetFirewallRule -DisplayName "Pit Wall" -Direction Inbound -LocalPort 3001 -Protocol TCP -Action Allow`
  in an Administrator PowerShell.
- **`npm install` fails with C++ / `AccessorSignature` errors** → stale
  `node_modules`. Delete and reinstall:

  ```powershell
  Remove-Item -Recurse -Force node_modules, package-lock.json -ErrorAction SilentlyContinue
  npm install

  ```text

***I'm on Linux/Android/iOS and can't connect** → you need to run Pit Wall as an**macOS/Linux** → the bridge runs but iRacing's Shared Memory API is***
  Windows-only, so there's nothing to read. Use a Windows PC.
