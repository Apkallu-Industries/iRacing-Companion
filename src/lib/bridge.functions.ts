import { createServerFn } from "@tanstack/react-start";
import { spawn } from "child_process";
import path from "path";
import net from "net";
import { z } from "zod";

// Keep track of active bridge process on the server
let activeBridgePid: number | null = null;

function checkPort(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = net.createConnection({ port, host: "127.0.0.1" });
    socket.setTimeout(300);

    socket.on("connect", () => {
      socket.end();
      resolve(true);
    });

    socket.on("error", () => {
      socket.destroy();
      resolve(false);
    });

    socket.on("timeout", () => {
      socket.destroy();
      resolve(false);
    });
  });
}

export const getBridgeStatus = createServerFn({ method: "GET" }).handler(async () => {
  const isPortOpen = await checkPort(3001);
  return {
    running: isPortOpen,
    pid: isPortOpen ? activeBridgePid : null,
  };
});

export const startBridge = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({ mode: z.enum(["stable30", "balanced60"]).optional() })
      .optional()
      .parse(input),
  )
  .handler(async ({ data }) => {
    try {
      const isAlreadyRunning = await checkPort(3001);
      if (isAlreadyRunning) {
        return { success: true, message: "Bridge is already running on port 3001." };
      }

      const bridgeDir = path.resolve(process.cwd(), "local-bridge");
      console.log(`[Bridge Server] Starting bridge in ${bridgeDir}...`);

      const fs = await import("fs");
      const logPath = path.resolve(bridgeDir, "bridge.log");
      const logStream = fs.openSync(logPath, "a");

      const child = spawn("node", ["server.js"], {
        cwd: bridgeDir,
        env: {
          ...process.env,
          TICK_HZ: data?.mode === "stable30" ? "120" : "240",
          UI_HZ: data?.mode === "stable30" ? "30" : "60",
          RECORD_HZ: data?.mode === "stable30" ? "60" : "120",
          ADAPTIVE_UI: "1",
        },
        detached: true,
        stdio: ["ignore", logStream, logStream],
      });

      child.unref();
      activeBridgePid = child.pid || null;

      // Wait a moment for it to bind to port 3001
      await new Promise((resolve) => setTimeout(resolve, 800));

      const started = await checkPort(3001);
      if (started) {
        return { success: true, message: "Bridge started successfully." };
      } else {
        throw new Error(
          "Bridge process spawned but port 3001 is not responding. Please make sure node packages are installed in 'local-bridge'.",
        );
      }
    } catch (e: any) {
      console.error("[Bridge Server] Start failed:", e);
      return { success: false, error: e.message || String(e) };
    }
  });

export const stopBridge = createServerFn({ method: "POST" }).handler(async () => {
  try {
    if (activeBridgePid) {
      process.kill(activeBridgePid);
      activeBridgePid = null;
      return { success: true, message: "Bridge process terminated." };
    }
    return { success: false, message: "No active bridge process tracked on the server." };
  } catch (e: any) {
    return { success: false, error: e.message || String(e) };
  }
});
