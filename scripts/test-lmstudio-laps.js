/**
 * scripts/test-lmstudio-laps.js
 *
 * Runs a 5-lap test to verify that the local LM Studio instance is responding.
 * Sequentially generates 5 telemetry lap states based on Watkins Glen golden replay data
 * and queries the LM Studio endpoint for real-time race engineer recommendations.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LMSTUDIO_HOSTS = ["http://127.0.0.1:1234", "http://localhost:1234"];

async function probeLMStudio() {
  console.log("Probing LM Studio endpoints...");
  for (const host of LMSTUDIO_HOSTS) {
    // Try api/v1/models first (LM Studio v0.4+)
    try {
      const res = await fetch(`${host}/api/v1/models`, {
        signal: AbortSignal.timeout(1500)
      });
      if (res.ok) {
        const data = await res.json();
        const model = data?.data?.[0]?.id || "local-model";
        console.log(`[OK] Detected LM Studio v0.4+ at ${host}. Active model: ${model}`);
        return {
          host,
          endpoint: `${host}/api/v1/chat/completions`,
          model,
          isApiV1: true
        };
      }
    } catch (e) {
      // ignore and try next
    }

    // Try v1/models
    try {
      const res = await fetch(`${host}/v1/models`, {
        signal: AbortSignal.timeout(1500)
      });
      if (res.ok) {
        const data = await res.json();
        const model = data?.data?.[0]?.id || "local-model";
        console.log(`[OK] Detected LM Studio v1 at ${host}. Active model: ${model}`);
        return {
          host,
          endpoint: `${host}/v1/chat/completions`,
          model,
          isApiV1: false
        };
      }
    } catch (e) {
      // ignore and try next
    }
  }

  throw new Error("Could not connect to LM Studio on port 1234. Make sure LM Studio is running and the Local Server is started.");
}

async function run5LapTest() {
  const goldenPath = path.join(__dirname, "..", "validation", "golden-replays", "gt3_watkins_golden.json");
  let goldenData = {};
  
  try {
    const raw = fs.readFileSync(goldenPath, "utf-8");
    goldenData = JSON.parse(raw);
    console.log(`Loaded golden telemetry context for ${goldenData.activeContext?.car || "car"} at ${goldenData.activeContext?.track || "track"}.`);
  } catch (e) {
    console.warn("Could not load Watkins Glen golden data, using fallback telemetry parameters.", e.message);
  }

  // Setup configuration
  let config;
  try {
    config = await probeLMStudio();
  } catch (err) {
    console.error(`\n❌ ERROR: ${err.message}\n`);
    process.exit(1);
  }

  const systemPrompt = `You are a professional race engineer on the pit wall analyzing telemetry.
Provide a concise, 1-2 sentence driving and setup recommendation based on the current lap's telemetry.`;

  // Generate 5 distinct lap scenarios
  const laps = [
    {
      lapNumber: 1,
      telemetry: {
        lapTime: "1:47.850",
        lfTemp: 82.5,
        rfTemp: 81.0,
        lrTemp: 80.5,
        rrTemp: 79.5,
        criticalFinding: "Tyres stabilized with zero severe thermal drifts.",
        mismatchPct: 2.1
      },
      prompt: "Lap 1 complete. Tyres are at starting temperature. Stability is good, lap time is 1:47.850. Any advice?"
    },
    {
      lapNumber: 2,
      telemetry: {
        lapTime: "1:46.900",
        lfTemp: 86.2,
        rfTemp: 84.5,
        lrTemp: 83.1,
        rrTemp: 82.0,
        criticalFinding: "Front-left brake lockup on T8 entry under downforce rake.",
        mismatchPct: 3.5
      },
      prompt: "Lap 2 complete. Front-left lockup observed at Turn 8 entry. Lap time improved to 1:46.900. What's the cause and adjustment?"
    },
    {
      lapNumber: 3,
      telemetry: {
        lapTime: "1:47.320",
        lfTemp: 91.0,
        rfTemp: 88.3,
        lrTemp: 86.8,
        rrTemp: 85.5,
        criticalFinding: "Understeer transient in mid-sector 2 due to front tyre temperature spike.",
        mismatchPct: 4.8
      },
      prompt: "Lap 3 complete. Lap time fell to 1:47.320 due to mid-corner understeer. Front tires are getting hot (91C). Driver instructions?"
    },
    {
      lapNumber: 4,
      telemetry: {
        lapTime: "1:46.510",
        lfTemp: 94.8,
        rfTemp: 92.1,
        lrTemp: 90.2,
        rrTemp: 89.9,
        criticalFinding: "Rear driven exit wheel speed mismatched by 12% (rear traction collapse).",
        mismatchPct: 12.0
      },
      prompt: "Lap 4 complete. Personal best 1:46.510 but rear driven exit wheel speed mismatched by 12% under throttle re-application. Help?"
    },
    {
      lapNumber: 5,
      telemetry: {
        lapTime: "1:47.990",
        lfTemp: 98.1,
        rfTemp: 95.5,
        lrTemp: 94.0,
        rrTemp: 93.8,
        criticalFinding: "FR tyre carcass exceeds 95C. Splitter grounding and diffuser vacuum seal collapse.",
        mismatchPct: 15.5
      },
      prompt: "Lap 5 complete. Pace dropped to 1:47.990. Underbody diffuser flow seal stall grounding detected under aero load. How do we resolve?"
    }
  ];

  console.log("\n==================================================");
  console.log("🏁 STARTING 5-LAP LM STUDIO RESPONSIVENESS TEST 🏁");
  console.log("==================================================\n");

  const results = [];
  let totalStart = Date.now();

  for (const lap of laps) {
    console.log(`[LAP ${lap.lapNumber}/5] Sending telemetry update...`);
    console.log(`Prompt: "${lap.prompt}"`);

    const payload = {
      model: config.model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Context: ${JSON.stringify(goldenData.activeContext || {})}. Lap Telemetry: ${JSON.stringify(lap.telemetry)}. User Query: ${lap.prompt}` }
      ],
      temperature: 0.2,
      max_tokens: 128
    };

    const start = Date.now();
    let success = false;
    let reply = "";
    let errorMsg = "";

    try {
      const res = await fetch(config.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(30000)
      });

      const latency = Date.now() - start;

      if (!res.ok) {
        throw new Error(`HTTP Error ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      reply = data?.choices?.[0]?.message?.content?.trim() || "";
      success = true;
      
      console.log(`[LAP ${lap.lapNumber}/5] Response received in ${latency}ms.`);
      console.log(`Engineer Reply: "${reply}"\n`);
      
      results.push({
        lap: lap.lapNumber,
        success: true,
        latency,
        reply: reply.slice(0, 100) + (reply.length > 100 ? "..." : "")
      });
    } catch (e) {
      const latency = Date.now() - start;
      errorMsg = e.message;
      console.error(`[LAP ${lap.lapNumber}/5] Failed after ${latency}ms: ${errorMsg}\n`);
      results.push({
        lap: lap.lapNumber,
        success: false,
        latency,
        reply: `Error: ${errorMsg}`
      });
    }
  }

  const totalDuration = Date.now() - totalStart;

  console.log("==================================================");
  console.log("📊 TEST RESULT SUMMARY 📊");
  console.log("==================================================");
  console.table(results);
  
  const successfulLaps = results.filter(r => r.success).length;
  console.log(`\nStatus: ${successfulLaps === 5 ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`Successful Laps: ${successfulLaps} / 5`);
  console.log(`Total Time: ${(totalDuration / 1000).toFixed(2)}s`);
  console.log(`Average Latency: ${(results.reduce((acc, r) => acc + r.latency, 0) / 5).toFixed(0)}ms`);
  console.log("==================================================\n");

  if (successfulLaps !== 5) {
    process.exit(1);
  }
}

run5LapTest();
