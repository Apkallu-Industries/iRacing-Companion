# Team Command — Setup & Role Guide

---

## Who Should Read What

> Find your role below and **only read that section**. You do not need to read the full document.

| Role              | What you do                                                                      | Jump to                                 |
| ----------------- | -------------------------------------------------------------------------------- | --------------------------------------- |
| 🏆 **Team Owner** | Sets up the database, generates the Team Code, controls who has access           | [→ Team Owner Guide](#team-owner-guide) |
| 🏎️ **Driver**     | Receives a pre-filled config file from the Team Owner, starts the bridge, drives | [→ Driver Guide](#driver-guide)         |
| 🎧 **Pit Crew**   | Receives a Team Code from the Team Owner, opens the app in a browser             | [→ Pit Crew Guide](#pit-crew-guide)     |

---

## Team Owner Guide

> **You are here because:** You are responsible for setting up the team system. You control who joins, distribute the credentials to your drivers, and give your pit crew the Team Code. This section is the most technical — but it is fully explained step by step.

### What You Need to Do (Summary)

1. Create a free Supabase account (one-time setup, ~10 minutes)
2. Run a one-time database setup inside Supabase
3. Copy two keys from Supabase
4. Generate a Team Code inside the app
5. Send drivers a pre-filled `.env` file
6. Send pit crew the Team Code and app URL

---

### Step 1 — Create a Free Supabase Account

**Supabase is a free online relay service.** Think of it like a group radio channel — each driver's PC transmits their car's data to it, and your pit wall browser receives all of them simultaneously. You do not need to understand databases to use it.

1. Go to **[https://supabase.com](https://supabase.com)**
2. Click **"Start your project"**
3. Sign up with **GitHub** (fastest) or email address
4. Verify your email if prompted

✅ Free account. No credit card required.

> **💡 Le Mans 24hr note:** A 24hr race with 6 drivers sends roughly 1 million messages — right at the free tier limit (2M/month). If you want peace of mind, upgrade to **Pro ($25/month)** before race day and cancel after.

---

### Step 2 — Create a New Project

1. In your Supabase dashboard, click **"New project"**
2. Fill in:
   - **Name:** `iRacing-Team` (anything you like)
   - **Database Password:** Choose something strong and save it somewhere safe
   - **Region:** Closest to your location (e.g. `West EU (Ireland)` for Europe)
3. Click **"Create new project"**

> ⏳ Wait 1–2 minutes for the spinner to finish before moving on.

---

### Step 3 — Set Up the Database

This creates the table the app needs. You paste one file into Supabase — no database knowledge required.

1. In the left sidebar, click **"SQL Editor"** (the `>_` icon)
2. Click **"New query"** and delete any existing text
3. Open `supabase/migrations/20260526_team_sessions.sql` from your iRacing-Companion folder
4. Copy the **entire contents** of that file
5. Paste it into the Supabase SQL editor
6. Click the green **"Run"** button

You should see: **"Success. No rows returned."** ✅

If it says "already exists" — ignore it, it ran before. Move on.

---

### Step 4 — Get Your Two API Keys

These are the credentials you will share with your drivers. Pit crew do **not** need these.

1. In the left sidebar, click **"Project Settings"** (cog icon at the bottom)
2. Click **"API"**
3. Find and copy these two values:

**Project URL** — looks like:

```
https://abcdefghijklm.supabase.co
```

**Anon Public Key** — a very long string starting with `eyJ`:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJp...
```

> ⚠️ **Only copy the `anon public` key — never the `service_role` key.** The service role has full database admin access and must never be shared.

---

### Step 5 — Generate the Team Code

1. Open iRacing-Companion in your browser and go to the **Team** page
2. In the **Paddock Live HUD** section, click **"+ Join Team"** (top-right of the HUD)
3. Click **"✦ Generate New Code"**
4. A code like `PITWALL-A1B2` appears — click **"Copy"**

This is your **Team Code**. It links all drivers and pit crew to the same live data feed.

---

### Step 6 — Distribute Credentials to Your Team

You now have three pieces of information to share:

| Who gets what            | Items to send                                          |
| ------------------------ | ------------------------------------------------------ |
| **Each Driver**          | The pre-filled `.env` file (see below)                 |
| **Each Pit Crew member** | The Team Code only (e.g. `PITWALL-A1B2`) + the app URL |

#### Creating the Driver `.env` File

Open the file `local-bridge/.env.example` in Notepad and fill it in:

```
SUPABASE_URL=https://abcdefghijklm.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
TEAM_CODE=PITWALL-A1B2
DRIVER_NAME=
```

- Fill in your actual Supabase URL and key
- Fill in the Team Code
- Leave `DRIVER_NAME=` blank — each driver fills in their own name

**Save this file as `.env`** (not `.env.example`) and send it to each driver via Discord, WhatsApp, or email. They place it in their `local-bridge/` folder.

> **Security note:** This file contains your Supabase anon key. It is safe to share with your drivers — the anon key can only read/write to the team channel, not access any other data or settings. Do not post it publicly online.

---

### Step 7 — Confirm Everyone is Connected

Before the race, open the Team page and verify:

- Your own car card shows a green **LIVE** badge (your bridge is running)
- Each driver's card appears as they connect
- Pit crew members see all cards on their screens

#### Team Owner Race Day Checklist

- [ ] Supabase project created and SQL migration run ✓
- [ ] Team Code generated in the app
- [ ] Pre-filled `.env` file sent to all drivers
- [ ] Team Code sent to all pit crew members + app URL
- [ ] Your own bridge running: terminal shows `[team-relay] ✓ Connected`
- [ ] Team page shows all driver cards with LIVE badges
- [ ] All pit crew browsers show the same data

---

---

## Driver Guide

> **You are here because:** Your Team Owner has sent you a pre-filled .env file and the Team Code. You do not need to set up anything. Three steps and you are live.

---

### Step 1 — Place the .env File

Your Team Owner will send you a file called .env. Place it inside your local-bridge folder:

`iRacing-Companion\
  local-bridge\
    .env          <- put it here
    server.js
    ...`

> **Windows tip:** If .env files are invisible in File Explorer, click the **View** tab and tick **"Hidden items"** and **"File name extensions"**.

---

### Step 2 — Add Your Name

Open .env in Notepad and fill in the last line:

`DRIVER_NAME=Danny M`

Save and close.

---

### Step 3 — Start the Bridge

Open a terminal in the local-bridge folder and run:

`npm start`

You should see this within a few seconds:

`[team-relay] * Connected to channel "team:PITWALL-A1B2" -- publishing at 2Hz`

**That is it. You are live on the team wall.** Start iRacing as normal. Your car data appears automatically once you are on track.

#### Driver Checklist

- [ ] .env file from Team Owner placed in local-bridge\ folder
- [ ] DRIVER_NAME= filled in with your name
- [ ]
  pm start run in the local-bridge folder
- [ ] Terminal shows Connected message
- [ ] Your car card appears on team wall with green **LIVE** badge

---

---

## Pit Crew Guide

> **You are here because:** Your Team Owner has given you a Team Code and the app URL. You do not need to install anything, set up a database, or run any software. You just need a browser.

---

### What You Received from Your Team Owner

- A **Team Code** — e.g. `PITWALL-A1B2`
- A **URL** for the app — e.g. `https://iracing-companion.com` or a local address like `http://192.168.1.10:3001`

---

### Step 1 — Open the App

Open your browser (Chrome, Firefox, Edge, or Safari on any device) and go to the URL your Team Owner gave you.

You do not need to log in. You do not need to install any software.

---

### Step 2 — Go to the Team Page

Click **"Team"** in the navigation at the top or side of the app.

You will see the full Team Command interface, which includes:

- **Race Timeline** — all driver stints laid out on a timeline
- **Fuel & Stint Calculator** — fuel requirements per stint
- **Endurance Planner** — race-length fuel totals, pit stop count, fatigue tracker
- **Paddock Live HUD** — live telemetry for every car in the team
- **AI Race Strategist** — strategy briefings and recommendations

---

### Step 3 — Join the Team Channel

In the **Paddock Live HUD** section, click the button in the top-right:

- If no team code is active it will say **"+ Join Team"**
- If a code was previously saved it will say **"🔗 Team"**

Click it, then:

1. Paste your Team Code (e.g. `PITWALL-A1B2`) into the input box
2. Click **"Join"**

Within 2–3 seconds, the driver cards will start populating with live data. Each card shows a green **LIVE** badge when that driver is connected and transmitting.

> **The Team Code is saved in your browser automatically.** The next time you open the app on the same device, it will reconnect to the same team channel without you needing to re-enter the code.

---

### Step 4 — Use the Interface

You now have full access to the Team Command page. The live data updates automatically — you do not need to refresh anything.

#### Pit Crew Checklist

- [ ] Team Code received from Team Owner
- [ ] App URL received from Team Owner
- [ ] App open in browser
- [ ] Team page loaded
- [ ] Team Code pasted and "Join" clicked
- [ ] Driver cards visible with LIVE badges

---

### What You Can See

#### Paddock Live HUD

Each driver's car has a card showing:

| What it shows                      | What it means                                                              |
| ---------------------------------- | -------------------------------------------------------------------------- |
| Green **LIVE** / grey **+Xs ago**  | Whether that driver is actively connected                                  |
| Fuel: `42.1L ~13 laps`             | Current fuel in tank and how many laps it will last                        |
| Last lap time                      | The driver's previous completed lap                                        |
| Tyre temp bars (FL / FR / RL / RR) | Colour-coded: **green** = optimal, **amber** = warm, **red** = overheating |
| Tyre wear bars                     | **Green** = good grip remaining, **amber** = degrading, **red** = pit soon |

#### Race Timeline

Shows all driver stints as horizontal bars on a timeline. Click any stint to see:

- Driver name
- Planned start and end time
- Notes and fuel target

#### Fuel & Stint Calculator

Enter your car's fuel burn rate and the calculator will tell you:

- How many laps per stint
- How many pit stops you need
- Total fuel required for the race

Click **"↺ Sync"** to automatically fill in the burn rate from whichever driver is currently on track.

#### Endurance Planner

For 24hr races. Shows:

- Total pit stop count for the full race distance
- Fuel load required per stint and in total
- Driver fatigue tracking (FIA 4-hour limit warnings)
- Night/day phase indicator

#### AI Race Strategist

Type a question or click **"Request Briefing"** to get a full strategy analysis. The AI can see all drivers' current fuel levels, tyre states, and lap times, so its advice is based on your actual live race situation.

---

---

## Troubleshooting

### Driver: "I see `[team-relay] TEAM_CODE not set`"

The `.env` file is missing or the `TEAM_CODE=` line is empty.

✅ **Fix:** Check the `.env` file is in `local-bridge/` (not the root project folder), and that `TEAM_CODE=PITWALL-A1B2` has the correct code on that line.

---

### Driver: "I see `[team-relay] SUPABASE_URL or SUPABASE_ANON_KEY missing`"

One or both Supabase values are missing from your `.env` file.

✅ **Fix:** Ask your Team Owner to re-send the pre-filled `.env` file. Do not try to fill in the Supabase URL or key yourself — your Team Owner has the correct values.

---

### Driver: "I see `[team-relay] ✗ Channel error`"

The Supabase keys in your `.env` file are incorrect or the Supabase project is paused.

✅ **Fix:** Contact your Team Owner. They need to check if the Supabase project is active (log in at [supabase.com/dashboard](https://supabase.com/dashboard) and confirm the project shows green status). They should then re-send the `.env` file with fresh keys.

---

### Driver: "Terminal shows Connected but I don't see my card on the team wall"

The bridge is connected but the team wall browser is subscribed to a different code.

✅ **Fix:** On the Team page, click **"🔗 Team"** and confirm the displayed code matches what is in your `.env` file exactly. Team codes are case-sensitive.

---

### Pit Crew: "I joined but no driver cards appear"

No drivers are currently connected, or the team code is wrong.

✅ **Fix:**

1. Check the code is correct — ask your Team Owner
2. Make sure at least one driver has started their bridge and seen the `✓ Connected` message
3. Try clicking **"Leave"** then re-pasting the code and clicking **"Join"** again

---

### Pit Crew: "A driver's card shows grey / OFFLINE"

That driver's bridge has disconnected — they lost internet, restarted their PC, or their bridge crashed.

✅ **This is not an error on your side.** The card will return to green automatically when the driver restarts their bridge. The time shown (e.g. `+45s`) tells you how long ago they were last seen.

---

### Team Owner: "Supabase project shows as paused"

Supabase pauses free tier projects after 7 days of inactivity.

✅ **Fix:** Log in to [supabase.com/dashboard](https://supabase.com/dashboard), click your project, and click **"Restore project"**. It takes 1–2 minutes. To prevent this during a race week, simply open the Supabase dashboard once in the week before the race — that resets the inactivity timer.

---

## Frequently Asked Questions

**Q: Can pit crew members edit the Race Timeline and Stint Calculator?**
A: Yes — all pit crew members with the Team Code have full access to the Team Command interface. They can update the timeline, adjust the fuel calculator, and add notes. Changes are saved in their own browser. For shared edits to persist across all screens, this would require a future shared-session feature.

---

**Q: Can two pit crew members cause conflicts by editing the calculator at the same time?**
A: Currently each person's edits are local to their browser. There is no conflict — they each see their own version of the calculator. The live telemetry data (fuel, tyres, laps) is the same for everyone since it comes from the drivers' bridges. For Le Mans, we recommend designating one engineer as the primary calculator operator.

---

**Q: Does a pit crew member's phone work as a team wall?**
A: Yes. Open the app in any mobile browser, go to the Team page, and join with the Team Code. The layout adapts to smaller screens.

---

**Q: What happens to the team channel when the race ends?**
A: The team channel is ephemeral — it only exists while at least one driver's bridge is connected. When all bridges stop, the channel goes idle. The Team Code remains valid for 48 hours before it expires from the database. You can always generate a new code for the next race.

---

**Q: Can I have separate team codes for separate cars?**
A: There is only one team code per team session. All cars and all crew share the same code. If you have two completely separate teams, generate a different code for each.

---

**Q: We have a co-driver sharing a car. Does anything change?**
A: No. When the co-driver takes over, they start their own bridge. The team wall automatically shows whichever driver's data is most recent for that car number — the card switches seamlessly to the new driver when they cross the start line.

---

## File Reference (Team Owner Only)

| File                                             | What it is                                                   |
| ------------------------------------------------ | ------------------------------------------------------------ |
| `local-bridge/.env.example`                      | Template — fill this in and send it to each driver as `.env` |
| `local-bridge/.env`                              | Your personal config — never commit to GitHub                |
| `local-bridge/teamRelay.js`                      | The relay module — do not edit                               |
| `local-bridge/server.js`                         | The bridge server — do not edit                              |
| `supabase/migrations/20260526_team_sessions.sql` | The SQL you paste into Supabase once during setup            |
