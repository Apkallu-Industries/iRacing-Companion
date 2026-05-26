# Team Command — Multi-Driver Live Telemetry Guide

> **Who this guide is for:** Anyone setting up the Team Command page for a multi-driver race. You do not need any prior technical knowledge. Everything is explained from scratch, including what Supabase is, why you need it, and exactly how to set it up.

---

## Table of Contents

1. [What the Team Command Page Does](#1-what-the-team-command-page-does)
2. [Why You Need Supabase](#2-why-you-need-supabase)
3. [Step 1 — Create a Free Supabase Account](#step-1--create-a-free-supabase-account)
4. [Step 2 — Create a New Project](#step-2--create-a-new-project)
5. [Step 3 — Set Up the Database](#step-3--set-up-the-database)
6. [Step 4 — Get Your API Keys](#step-4--get-your-api-keys)
7. [Step 5 — Configure Each Driver's Bridge](#step-5--configure-each-drivers-bridge)
8. [Step 6 — Generate a Team Code in the App](#step-6--generate-a-team-code-in-the-app)
9. [Step 7 — Share the Code With Your Drivers](#step-7--share-the-code-with-your-drivers)
10. [Race Day Checklist](#race-day-checklist)
11. [What the Team Wall Shows](#what-the-team-wall-shows)
12. [Troubleshooting](#troubleshooting)
13. [Frequently Asked Questions](#frequently-asked-questions)

---

## 1. What the Team Command Page Does

The **Team Command** page (`/team`) is your pit-wall operations centre. It shows:

- A **Race Timeline** — Gantt chart of all driver stints, weather windows, and incidents
- A **Fuel & Stint Calculator** — exact fuel requirements per stint
- An **Endurance Planner** — 24hr fuel load, pit stop count, driver fatigue tracker
- A **Paddock Live HUD** — real-time telemetry cards for every car in your team

Without the multi-driver setup described in this guide, the Paddock HUD can only show **your own car** — the one running iRacing on the same PC as the bridge. Every other car card will be empty.

After following this guide, **every driver's car appears automatically** on the team wall, each updated twice per second with their live fuel level, tyre temperatures, last lap time, and tyre wear.

---

## 2. Why You Need Supabase

### The core problem

iRacing's data is locked to each PC. When Driver A is in Car #44, their PC can see Car #44's data — but not Car #10's. Driver B's PC can see Car #10's data, but not Car #44's. There is no direct way to connect two iRacing sessions on different computers.

### The solution: a central relay

We need a **central online service** that sits between all the drivers. Each driver's bridge sends its data up to this service, and the team wall pulls all of it down simultaneously.

```
Driver A (Car #44)  ──publishes──►  Central Relay  ◄──subscribes──  Team Wall Screen
Driver B (Car #10)  ──publishes──►  (Supabase)
Driver C (Car #44)  ──publishes──►  (co-driver)
```

### What is Supabase?

**Supabase is a free online database and messaging service.** Think of it like a group WhatsApp, but for your iRacing telemetry data. Each driver's PC sends its data to Supabase, and any browser subscribed to the same "channel" receives those updates instantly.

You do not need to write any code for Supabase — this guide walks through every click. The free tier is more than enough for a 24-hour race.

**Supabase free tier limits:**
- ✅ 200 concurrent connections (you'll have ~6 max)
- ✅ 2 million messages per month (a 24hr race at 6 drivers ≈ 1 million)
- ✅ No credit card required

> **💡 For Le Mans 24hr:** You are close to the free message limit. If you want peace of mind, upgrade to the **Pro plan at $25/month** before race day. You can cancel the day after.

---

## Step 1 — Create a Free Supabase Account

**Only one person on the team needs to do this** — usually the team manager or whoever runs the team wall screen.

1. Open your browser and go to **[https://supabase.com](https://supabase.com)**
2. Click the green **"Start your project"** button
3. Sign up with **GitHub** (recommended — it's the fastest) or with your email address
4. Verify your email if prompted

You now have a Supabase account. It's free and you do not need to enter payment details.

---

## Step 2 — Create a New Project

After logging in, you will see your **Supabase dashboard**.

1. Click **"New project"**
2. Fill in the form:
   - **Name:** `iRacing-Team` (or anything you like)
   - **Database Password:** Type a strong password and **save it somewhere** — you may need it later
   - **Region:** Pick the one closest to you geographically (e.g. `West EU (Ireland)` for Europe, `US East` for North America)
3. Click **"Create new project"**

> ⏳ Supabase takes about **1–2 minutes** to create the project. A progress spinner will show. Wait for it to finish before moving on.

When the spinner disappears and you see the project dashboard, you are ready for Step 3.

---

## Step 3 — Set Up the Database

This step creates a special table in your Supabase database that the app needs. You will paste a block of code into Supabase's built-in editor — no SQL knowledge is required.

1. In the left sidebar of your Supabase project, click **"SQL Editor"** (it looks like a `>_` terminal icon)
2. Click **"New query"** (or you may see a blank editor already)
3. **Delete any existing text** in the editor
4. Open the file `supabase/migrations/20260526_team_sessions.sql` from your iRacing-Companion project folder
5. **Copy the entire contents** of that file and **paste it** into the Supabase SQL editor
6. Click the green **"Run"** button (or press `Ctrl+Enter` / `Cmd+Enter`)

You should see a green message at the bottom saying **"Success. No rows returned."** That means it worked.

> **What did that just do?** It created a `team_sessions` table — a list where your app can store team codes. It also set up security rules so only your team can access your data.

If you see a red error message:
- Check that you copied the **entire** file contents including the first and last lines
- Try clicking "Run" again
- If the error says "already exists" — that's fine, it just means it ran before. Move on.

---

## Step 4 — Get Your API Keys

Your API keys are like passwords that let the bridge software talk to your Supabase project. You need two keys.

1. In the left sidebar, click **"Project Settings"** (the cog icon at the very bottom)
2. Click **"API"** in the Settings sub-menu
3. You will see a page with two important values:

**Key 1 — Project URL:**
```
https://abcdefghijklm.supabase.co
```
It starts with `https://` and ends with `.supabase.co`. Copy this entire URL.

**Key 2 — Project API Keys → `anon` `public` key:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJp...
```
It's a very long string of letters and numbers starting with `eyJ`. Copy this entire key.

> ⚠️ **Do not copy the `service_role` key.** Only copy the `anon public` key. The service role key has full database access and should never be shared or put in the bridge config.

Keep these two values somewhere safe — you'll need them in the next step.

---

## Step 5 — Configure Each Driver's Bridge

**Every driver on the team** (including the team manager's PC running the wall) needs to do this step. Each driver does it on their own computer.

### 5a — Create the `.env` file

1. Open the `local-bridge` folder inside your iRacing-Companion project
2. Find the file called **`.env.example`**
3. **Copy** that file and **rename the copy** to **`.env`** (just `.env` — no `.example` at the end)

> **Windows tip:** Windows may try to name it `.env.txt` and hide the `.txt` part. To fix this:
> - Open the `local-bridge` folder in File Explorer
> - Click the **View** tab at the top
> - Tick the box that says **"File name extensions"**
> - Now you can see and edit the full filename including `.txt`
> - Rename the file to `.env` (remove `.example` and `.txt`)

### 5b — Edit the `.env` file

Open **`.env`** in Notepad (right-click → Open with → Notepad).

You will see this:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
TEAM_CODE=
DRIVER_NAME=
```

Fill in the values:

| Setting | What to put here |
|---|---|
| `SUPABASE_URL` | Your Project URL from Step 4 (replace `https://your-project.supabase.co`) |
| `SUPABASE_ANON_KEY` | Your `anon public` key from Step 4 (replace `your-anon-key-here`) |
| `TEAM_CODE` | Leave **blank for now** — you'll fill this in after Step 6 |
| `DRIVER_NAME` | Your first name or callsign e.g. `Danny` or `DRIVER-A` |

**Example of a correctly filled `.env` file:**

```
SUPABASE_URL=https://abcdefghijklm.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG0iLCJyb2xlIjoiYW5vbiIsImlhdCI6MTc0ODI5MzIwMCwiZXhwIjoyMDYzODY5MjAwfQ.example
TEAM_CODE=PITWALL-A1B2
DRIVER_NAME=Danny M
```

Save the file.

> **Important:** The `.env` file is **never uploaded to GitHub** — it stays only on your PC. Your Supabase keys are safe.

---

## Step 6 — Generate a Team Code in the App

A **Team Code** is a short unique string (e.g. `PITWALL-A1B2`) that links all your drivers together. Think of it like a race room code in a multiplayer game. All drivers on your team use the same code.

**One person generates the code** (usually the team manager):

1. Start iRacing-Companion as normal (`npm run dev` in the main project folder)
2. Open your browser and go to the **Team** page (click "Team" in the navigation)
3. In the top-right of the **Paddock Live HUD** section, click **"+ Join Team"**
4. A small panel will appear — click **"✦ Generate New Code"**
5. A code like `PITWALL-A1B2` will appear in the panel
6. Click **"Copy"** next to the code

> The code is also saved automatically in your browser. You don't need to write it down.

---

## Step 7 — Share the Code With Your Drivers

Now share the code with everyone on your team:

1. Send the code via WhatsApp, Discord, or any other chat
2. Tell each driver: **"Open your `local-bridge/.env` file, find the line `TEAM_CODE=` and put the code after the equals sign"**

For example, if the code is `PITWALL-A1B2`, each driver's `.env` should have:
```
TEAM_CODE=PITWALL-A1B2
```

3. After saving the `.env` file, each driver needs to **restart their bridge**:
   - Close the bridge if it's running (press `Ctrl+C` in the terminal window)
   - Run it again: open a terminal in the `local-bridge` folder and type `npm start`

4. Watch the terminal output — within a few seconds you should see:

```
[team-relay] ✓ Connected to channel "team:PITWALL-A1B2" — publishing at 2Hz
```

That message means the bridge is successfully sending data to the team channel.

---

## Race Day Checklist

Go through this list **before** the race starts:

**Team Manager (one person):**
- [ ] Supabase account created and project set up ✓
- [ ] SQL migration run successfully ✓
- [ ] Both Supabase keys copied to your `.env` file ✓
- [ ] Team Code generated in the app and copied to your `.env`
- [ ] Team Code shared with all drivers
- [ ] Bridge restarted after editing `.env`
- [ ] Terminal shows `[team-relay] ✓ Connected` message
- [ ] Team wall browser open on `/team` page — all driver cards visible with green `LIVE` badge

**Each Driver (including team manager):**
- [ ] `local-bridge/.env` file exists (not `.env.example`)
- [ ] `SUPABASE_URL` filled in correctly
- [ ] `SUPABASE_ANON_KEY` filled in correctly
- [ ] `TEAM_CODE` filled in with the shared code
- [ ] `DRIVER_NAME` filled in with your name
- [ ] Bridge restarted after saving `.env`
- [ ] Terminal shows `[team-relay] ✓ Connected` message
- [ ] Your car card appears on the team wall browser with green `LIVE` badge

**30 minutes before race start:**
- [ ] Open iRacing, join the race session
- [ ] Confirm your car card on the team wall shows your actual lap data (not all zeros)
- [ ] All other team cars also showing data

---

## What the Team Wall Shows

Once everything is connected, the Paddock Live HUD on the `/team` page shows a card for each connected driver. Each card updates **twice per second** and displays:

| Data | Source |
|---|---|
| **Driver name & car number** | From your `DRIVER_NAME` in `.env` and iRacing session |
| **LIVE / OFFLINE badge** | Green = data received in last 30 seconds; Grey = no signal |
| **Fuel remaining** | Current litres in tank from iRacing |
| **Estimated laps remaining** | Calculated from fuel level and burn rate |
| **Last lap time** | Your previous completed lap |
| **Tyre temperatures** | FL / FR / RL / RR corner temperatures in °C |
| **Tyre wear bars** | Estimated wear — Green = good, Amber = watch it, Red = pit soon |
| **Offline timer** | If a driver disconnects, shows how many seconds ago they were last seen |

### What happens if a driver disconnects?

- Their card turns grey and shows e.g. `+45s` (45 seconds since last update)
- After 30 seconds of silence, they are marked **OFFLINE**
- When they reconnect (bridge restart or internet returns), the card immediately turns green again

### The team wall does NOT need to be on the same PC as iRacing

The team wall browser can be on:
- A separate laptop in the pit garage
- A TV connected to a tablet
- Your phone
- Any device with a web browser and internet access

---

## Troubleshooting

### "I see `[team-relay] TEAM_CODE not set`" in the terminal

Your `.env` file either does not exist, or the `TEAM_CODE=` line is empty.

✅ **Fix:** Open `local-bridge/.env` and make sure `TEAM_CODE=PITWALL-A1B2` (replace with your actual code). Save and restart the bridge.

---

### "I see `[team-relay] SUPABASE_URL or SUPABASE_ANON_KEY missing`"

One or both of the Supabase settings are missing or empty in your `.env` file.

✅ **Fix:** Re-open `local-bridge/.env`. Check that:
- `SUPABASE_URL=` has a value starting with `https://` and ending with `.supabase.co`
- `SUPABASE_ANON_KEY=` has a value — a very long string starting with `eyJ`

---

### "I see `[team-relay] ✗ Channel error`"

The keys in your `.env` file are wrong or the Supabase project doesn't exist.

✅ **Fix:**
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings → API**
4. Re-copy the **Project URL** and **anon public key**
5. Paste them fresh into `local-bridge/.env`
6. Restart the bridge

---

### "The terminal shows Connected but no driver cards appear on the team wall"

The bridge is connected to Supabase, but the team wall browser is not subscribed to the same code.

✅ **Fix:**
1. On the Team page, click **"🔗 Team"** in the Paddock HUD header
2. Check the code shown matches the `TEAM_CODE` in every driver's `.env`
3. If they don't match, click **"Leave"**, then paste the correct code and click **"Join"**

---

### "My car card shows but other drivers don't appear"

The other drivers are not connected yet.

✅ **Fix:**
1. Ask each other driver to check their terminal for the `[team-relay] ✓ Connected` message
2. If they don't see it, they need to redo Step 5 (edit `.env`) and restart their bridge
3. Check they have the exact same `TEAM_CODE` — it is **case-sensitive** (`PITWALL-A1B2` ≠ `pitwall-a1b2`)

---

### "I can't find the `.env` file in File Explorer"

Windows hides files starting with `.` by default.

✅ **Fix:**
1. Open the `local-bridge` folder in File Explorer
2. Click the **"View"** tab in the ribbon at the top
3. Tick **"Hidden items"**
4. You should now see `.env` (if it exists) or just `.env.example` (which you need to copy and rename)

---

### "The team wall shows data but the fuel / lap times are all zero"

iRacing hasn't started yet, or the driver is in the pits and not driving.

✅ **This is normal.** Data will populate as soon as the driver is out on track. The bridge reads directly from iRacing — if iRacing shows zeros, so will the bridge.

---

## Frequently Asked Questions

**Q: Do all drivers need their own Supabase account?**
A: No. Only **one person** creates the Supabase project (usually the team manager). All drivers share the same `SUPABASE_URL` and `SUPABASE_ANON_KEY`. Only the `DRIVER_NAME` and `TEAM_CODE` differ per driver (and `TEAM_CODE` is the same for everyone).

---

**Q: Is my iRacing data stored in Supabase permanently?**
A: No. Telemetry data is sent as **broadcast messages** — it is never written to any database table. It passes through Supabase's servers in real-time and is gone immediately. The only thing stored is the `team_sessions` table entry (your team code and race name), which expires automatically after 48 hours.

---

**Q: Can someone from another team see my telemetry?**
A: No. The team channel name includes your unique team code (e.g. `team:PITWALL-A1B2`). Nobody outside your team knows this code, and Supabase never exposes channel data publicly.

---

**Q: What if we want a new team code for a different race?**
A: Go to the Team page, click **"🔗 Team"** → **"Generate New Code"**. Share the new code with your drivers. They edit `TEAM_CODE=` in their `.env` and restart their bridge.

---

**Q: Does iRacing need to be running for the bridge to work?**
A: iRacing needs to be running for **live telemetry data** to appear. However, the bridge itself can start without iRacing and will wait for it to connect. You'll see `[bridge] iRacing disconnected` in the terminal until iRacing launches.

---

**Q: Can the team wall be on a phone?**
A: Yes. Open your browser on any device, go to `http://[YOUR-PC-IP]:3001` on your local network (your bridge serves a local copy of the app), or go to the full web version if deployed. The team wall just needs internet access to receive Supabase messages.

---

**Q: What does "2Hz" mean?**
A: It means the team wall receives an update from each driver **twice per second** (every 500ms). This is intentional — the full iRacing data runs at 60Hz on each driver's local PC (for their own dashboard), but sending 60 messages per second per driver to Supabase would consume the free tier in hours. 2Hz is more than enough to track fuel, tyres, and lap times across a race.

---

**Q: We have 3 co-drivers sharing 1 car. How does that work?**
A: Each driver runs the bridge on their own PC. If two drivers share Car #44, both will publish to the team channel with `carNumber: "44"`. The team wall will show the most recently received update for that car number — whichever driver is currently in the car and on track. This works automatically with no extra setup.

---

**Q: The SQL step says "Error: relation already exists". Is that a problem?**
A: No. It means the migration was already run previously. The table already exists and is working correctly. You can ignore this error and move on to Step 4.

---

## File Reference

| File | Purpose |
|---|---|
| `local-bridge/.env` | Your personal config — Supabase keys, team code, driver name |
| `local-bridge/.env.example` | Template — copy this to create `.env` |
| `local-bridge/teamRelay.js` | The relay module — do not edit |
| `local-bridge/server.js` | The bridge server — do not edit |
| `supabase/migrations/20260526_team_sessions.sql` | The SQL you paste into Supabase once |

---

## Architecture Overview (for the curious)

```
Your PC                         Internet                    Team Wall
┌─────────────────┐             ┌──────────────┐           ┌──────────────────┐
│ iRacing         │             │              │           │ Browser on any   │
│   ↓ (irsdk)     │             │   Supabase   │           │ device           │
│ local-bridge    │──publishes──► Realtime     │◄─────────── subscribes to   │
│ server.js       │  2Hz snap   │ channel:     │  2Hz each   team channel    │
│   ↓             │             │ team:CODE    │  driver     ↓               │
│ Local WS at     │             │              │           Team Command page  │
│ localhost:3001  │             └──────────────┘           /team — all cars  │
│ (60Hz, your     │                                        visible           │
│  own dashboard) │                                                           │
└─────────────────┘                                                           │
```

The local bridge does two things simultaneously:
1. **60Hz to your browser** via `ws://localhost:3001` — your own fast local dashboard
2. **2Hz to Supabase** via the internet — the team relay for other drivers to see you

These are completely independent. If the internet drops, your local dashboard keeps working at full speed.
