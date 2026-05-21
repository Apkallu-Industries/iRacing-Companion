# Pit Wall Installation & Getting Started Guide

## Overview

**Pit Wall** is a two-part iRacing companion:

1. **Bridge** (Windows PC running iRacing): Captures live telemetry at 30Hz
2. **Web App** (any device on network): Real-time dashboard + offline lap analysis

This guide covers installation for both components.

---

## System Requirements

### For the Bridge (Windows PC)

- **Windows 10/11** (same PC running iRacing)
- **Node.js 20+** ([download](https://nodejs.org))
- **iRacing** (any version supported by IRSDK)
- **MongoDB** connection string (local or MongoDB Atlas)
- **Network**: PC must be on same LAN or accessible remotely

### For the Web App

- **Modern browser** (Chrome, Firefox, Safari, Edge from 2023+)
- **Internet** (cloud-hosted version) or **local network access** (self-hosted)
- **Account**: Email + password or Google OAuth

### Optional

- **Compression library**: Pako or Zstandard (for `.pwlap` file export)
- **Ed25519 signing**: Modern browsers support native SubtleCrypto

---

## Part 1: Bridge Setup (Windows PC)

### Step 1: Install Node.js

1. Download **Node.js LTS** (v20+) from <https://nodejs.org>
2. Run the installer, accept defaults
3. Verify installation:

   ```bash
   node --version
   npm --version
   ```

### Step 2: Download Bridge

Option A: **From GitHub Release** (recommended)

```bash
# Download pit-wall-bridge-vX.X.X.zip from releases
unzip pit-wall-bridge-vX.X.X.zip
cd pit-wall-bridge
```

Option B: **From Source**

```bash
git clone https://github.com/your-org/pit-wall.git
cd pit-wall/desktop/bridge
```

### Step 3: Install Dependencies

```bash
npm install
```

This installs:

- `irsdk-node` - iRacing telemetry
- `ws` - WebSocket server
- `mongodb` - telemetry storage

### Step 4: Configure Environment

Create a `.env` file in the `bridge` directory:

```bash
# MongoDB connection (required for telemetry capture)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/iracing_companion

# Optional: user identifier for telemetry data
USER_ID=your-name-or-id

# Optional: disable telemetry (if no MongoDB)
# DISABLE_TELEMETRY=true
```

**Getting a MongoDB Connection String:**

***Option A: MongoDB Atlas (Recommended - Free Tier)***

1. Go to <https://www.mongodb.com/cloud/atlas>
2. Sign up for free account
3. Create a cluster (M0 free tier)
4. Get connection string: `mongodb+srv://user:pass@cluster.mongodb.net/iracing_companion`
5. Replace `user` and `pass` with your credentials

***Option B: Local MongoDB***

1. Install MongoDB Community Edition from <https://www.mongodb.com/try/download/community>
2. Start MongoDB server
3. Use connection string: `MONGODB_URI=mongodb://localhost:27017/iracing_companion`

Requires local MongoDB installation.

### Step 5: Start the Bridge

```bash
npm start
```

Expected output:

[bridge] dashboard:  <http://localhost:3001>
[bridge] websocket:  ws://localhost:3001
[bridge] network:    <http://192.168.1.XXX:3001>
[bridge] irsdk-node unavailable — running in no-op mode.

```text

**Waiting for iRacing:**

```

[bridge] iRacing disconnected

```text

When you start iRacing:

```

[bridge] iRacing connected
[recorder] Connected to MongoDB
[recorder] Started session: 507f1f77bcf764cba04d0057

```text

### Step 6: Verify Bridge is Running

1. Open browser on ANY device on your network
2. Go to: `http://192.168.1.XXX:3001` (replace XXX with your PC's IP)
3. You should see **Pit Wall** dashboard
4. Start a lap in iRacing
5. Dashboard should show: speed, gear, throttle, brake, tires

---

## Part 2: Web App Setup

### Cloud Version (Easiest)

Simply visit: **<https://iracing-companion.lovable.app>**

1. Sign up with email or Google
2. See "Bridge Not Connected" message
3. Install bridge on your Windows PC (Part 1 above)
4. Once bridge is running, web app auto-connects

### Self-Hosted Version (Advanced)

Requires: Git, Node.js, Vite, Supabase account.

```bash
# Clone repository
git clone https://github.com/your-org/pit-wall.git
cd pit-wall

# Install dependencies
npm install

# Setup environment (copy from Lovable or Supabase)
cp .env.example .env
# Edit .env with your Supabase credentials

# Start dev server
npm run dev

# Open http://localhost:5173
```

---

## Part 3: Connecting Bridge to Web App

### On Your Windows PC (Running Bridge)

1. Bridge starts at `http://localhost:3001`
2. Opens a **local PWA dashboard** automatically
3. iRacing data streams via WebSocket

### From Any Device on Your Network

1. Get your PC's IP address:

   ```bash
   ipconfig  # Windows
   ```

   Look for "IPv4 Address": `192.168.1.XXX`

2. Open in browser on phone/tablet/other PC:

   ```url
   http://192.168.1.XXX:3001
   ```

3. Bookmark it (works as PWA - install to homescreen)

### From Cloud Web App

1. Go to <https://iracing-companion.lovable.app>
2. Sign in
3. Go to `/live` page
4. If bridge is running on your PC, it auto-connects
5. If not, see setup instructions

---

## Troubleshooting

### Bridge Won't Start

**Error: `irsdk-node unavailable`**

- Normal if iRacing not running or IRSDK not accessible
- Bridge still works for serving the dashboard
- Start iRacing to capture telemetry

**Error: `MongoDB connection failed`**

- Check `MONGODB_URI` in `.env`
- Verify MongoDB cluster is running
- Whitelist your PC's IP in MongoDB Atlas:
  - Atlas → Network Access → Add IP Address

**Error: `Port 3001 already in use`**

```bash
# Kill process on port 3001
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

### Bridge Won't Connect to iRacing

**Checklist:**

- [ ] iRacing is running
- [ ] iRacing Settings → Options → telemetry enabled
- [ ] Windows firewall allows Node.js
- [ ] Try restarting both iRacing and bridge

### Web App Shows "Bridge Not Connected"

**On local network:**

- [ ] Bridge is running (`npm start`)
- [ ] You're on same WiFi/LAN
- [ ] Firewall allows port 3001
- [ ] Try refreshing page
- [ ] Check browser console (F12) for WebSocket errors

**From cloud app:**

- [ ] Bridge must be accessible remotely (requires port forwarding or VPN)
- [ ] Or use local PWA at `http://192.168.1.XXX:3001` instead

### MongoDB Data Not Saving

**Check bridge logs:**

```bash
# Look for [recorder] messages
```

**If telemetry recording is disabled:**

- Verify `MONGODB_URI` is set and valid
- Check MongoDB cluster is running
- Verify database exists: `use iracing_companion`

---

## Key Features by Component

### Bridge

| Feature | Status | Config |
|---------|--------|--------|

| Live telemetry (30Hz) | ✅ Always | Auto |
| MongoDB capture | ✅ Always | `MONGODB_URI` |
| Offline lap cache | ✅ Always | Auto (`~/.pitwall/laps.jsonl`) |
| Local PWA dashboard | ✅ Always | `http://localhost:3001` |
| Network dashboard | ✅ Always | `http://192.168.x.x:3001` |

### Web App

| Feature | Requires Bridge | Requires Account |
|---------|-----------------|------------------|

| Live telemetry | ✅ Yes | ✅ Yes (cloud) |
| Session history | ✅ Yes | ✅ Yes |
| Lap analysis (.ibt) | ❌ No | ✅ Yes |
| Setup comparison | ❌ No | ✅ Yes |
| Export/Import (.pwlap) | ❌ No | ✅ Yes |
| Community sharing | ❌ No | ✅ Yes |

---

## Next Steps

### 1. First Run

1. Start bridge on Windows PC
2. Open `http://localhost:3001` or `http://192.168.1.XXX:3001`
3. Load iRacing, start a lap
4. Watch telemetry stream in real-time

### 2. Configure Dashboard

1. Click channels to add/remove from display
2. Resize panels with drag handles
3. Layout is saved per user

### 3. Capture Offline Data

1. Complete a lap in iRacing
2. iRacing saves `.ibt` file to `Documents/iRacing/telemetry`
3. Upload `.ibt` in web app
4. Analyze lap in workbench

### 4. Export/Share Laps

1. Open lap in workbench
2. Click "Export" → ".PWLAP"
3. Choose: metadata / setup / full telemetry
4. Optionally encrypt + sign
5. Share encrypted file with team

---

## Advanced Configuration

### Custom MongoDB Schema

To use existing MongoDB database:

```javascript
// Bridge will create collections:
// - telemetry_sessions
// - telemetry_samples (per-second aggregates)
// - laps (lap metadata)
```

Indexes are auto-created on first run.

### Port Forwarding (Remote Bridge)

To access bridge from outside your network:

1. **Router port forwarding**: Forward external port to `192.168.1.XXX:3001`
2. **ngrok tunnel** (easier):

   ```bash
   ngrok http 3001
   # Get public URL: https://abc123.ngrok.io
   ```

3. **VPN**: Connect to home network via VPN, access `192.168.1.XXX:3001`

### Disable Telemetry Recording

If you don't want MongoDB:

```bash
# In .env
DISABLE_TELEMETRY=true

# Or don't set MONGODB_URI
```

Bridge still works for live dashboard and local caching.

---

## Performance & Optimization

### Bridge CPU Usage

- Typical: **5-15%** (iRacing polling + WebSocket)
- Peak: **20%** (MongoDB write spikes every 1s)

### Network Bandwidth

- Live dashboard: **~50 KB/s** (30Hz telemetry)
- Local network: No issues
- Remote: May need compression (set in settings)

### MongoDB Cost

- **Free tier (MongoDB Atlas)**: 512MB storage, ~100M ops/month
- **Usage**: ~50 MB/month for 1 hour/day driving
- Plenty for personal use

---

## Support & Documentation

- **GitHub Issues**: Report bugs at <https://github.com/your-org/pit-wall/issues>
- **Discussions**: Ask questions at <https://github.com/your-org/pit-wall/discussions>
- **Documentation**: Full API docs at <https://pit-wall.dev/docs>
- **Community**: Discord server at <https://discord.gg/pit-wall>

---

## License & Credits

**Pit Wall** © 2026 Pit Wall Team

Built with:

- iRSIM SDK (iRacing telemetry)
- TanStack (React framework)
- Supabase (backend)
- MongoDB (telemetry storage)

iRacing is a trademark of iRacing.com Motorsport Simulations. Pit Wall is an independent companion tool.
