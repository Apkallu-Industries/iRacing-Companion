# iRacing → Pit Wall Desktop Bridge

`desktop/bridge` is the enhanced bridge variant with local lap cache and MongoDB recording support.

For most users, use `local-bridge` (download + one-click launcher path). Use this variant when you explicitly want local recorder features.

## Requirements

- Windows PC running iRacing
- Node.js 20+
- Optional: MongoDB for telemetry recording

## Run

```powershell
cd C:\Dev\iRacing-Companion\desktop\bridge
npm install
npm start
```

Bridge UI and WebSocket are exposed on:

- `http://localhost:3001`
- `ws://localhost:3001`

## Optional MongoDB recording

If `MONGODB_URI` is set, bridge records telemetry + lap metadata.

```powershell
$env:MONGODB_URI="mongodb://127.0.0.1:27017/"
npm start
```

## Performance rate controls

- `TICK_HZ` default `120` (sample loop, max `360`)
- `UI_HZ` default `60` (stream loop)
- `RECORD_HZ` default `120` (record loop)
- `ADAPTIVE_UI` default `1` (auto-fallback to 30Hz on slow clients)

## Notes

- Keep this bridge and `local-bridge` behavior aligned unless intentionally diverging.
- App UI “Run Local Bridge” currently launches `local-bridge`.
