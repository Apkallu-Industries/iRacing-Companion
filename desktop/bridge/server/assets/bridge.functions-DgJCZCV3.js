import { d as createServerRpc, b as createServerFn } from "../server.js";
import { spawn } from "child_process";
import path from "path";
import net from "net";
import { z } from "zod";
import "react/jsx-runtime";
import "seroval";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "react";
import "@tanstack/react-router";
import "@tanstack/react-router/ssr/server";
let activeBridgePid = null;
function checkPort(port) {
  return new Promise((resolve) => {
    const socket = net.createConnection({
      port,
      host: "127.0.0.1",
    });
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
const getBridgeStatus_createServerFn_handler = createServerRpc(
  {
    id: "048bc3835eab8f97e7ee69a78abd12af09426185466e8d8438b6086be0a3206c",
    name: "getBridgeStatus",
    filename: "src/lib/bridge.functions.ts",
  },
  (opts) => getBridgeStatus.__executeServer(opts),
);
const getBridgeStatus = createServerFn({
  method: "GET",
}).handler(getBridgeStatus_createServerFn_handler, async () => {
  const isPortOpen = await checkPort(3001);
  return {
    running: isPortOpen,
    pid: isPortOpen ? activeBridgePid : null,
  };
});
const startBridge_createServerFn_handler = createServerRpc(
  {
    id: "44ccc16895fc9e7ce2624636ebfdb09af87f537ec0f50a6c81242686434b920a",
    name: "startBridge",
    filename: "src/lib/bridge.functions.ts",
  },
  (opts) => startBridge.__executeServer(opts),
);
const startBridge = createServerFn({
  method: "POST",
})
  .inputValidator((input) =>
    z
      .object({
        mode: z.enum(["stable30", "balanced60"]).optional(),
      })
      .optional()
      .parse(input),
  )
  .handler(startBridge_createServerFn_handler, async ({ data }) => {
    try {
      const isAlreadyRunning = await checkPort(3001);
      if (isAlreadyRunning) {
        return {
          success: true,
          message: "Bridge is already running on port 3001.",
        };
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
      await new Promise((resolve) => setTimeout(resolve, 800));
      const started = await checkPort(3001);
      if (started) {
        return {
          success: true,
          message: "Bridge started successfully.",
        };
      } else {
        throw new Error(
          "Bridge process spawned but port 3001 is not responding. Please make sure node packages are installed in 'local-bridge'.",
        );
      }
    } catch (e) {
      console.error("[Bridge Server] Start failed:", e);
      return {
        success: false,
        error: e.message || String(e),
      };
    }
  });
const stopBridge_createServerFn_handler = createServerRpc(
  {
    id: "35d21eb114150000c384e4af7abe715ee60bee975d2a6d5afbd52703f88c378a",
    name: "stopBridge",
    filename: "src/lib/bridge.functions.ts",
  },
  (opts) => stopBridge.__executeServer(opts),
);
const stopBridge = createServerFn({
  method: "POST",
}).handler(stopBridge_createServerFn_handler, async () => {
  try {
    if (activeBridgePid) {
      process.kill(activeBridgePid);
      activeBridgePid = null;
      return {
        success: true,
        message: "Bridge process terminated.",
      };
    }
    return {
      success: false,
      message: "No active bridge process tracked on the server.",
    };
  } catch (e) {
    return {
      success: false,
      error: e.message || String(e),
    };
  }
});
export {
  getBridgeStatus_createServerFn_handler,
  startBridge_createServerFn_handler,
  stopBridge_createServerFn_handler,
};
