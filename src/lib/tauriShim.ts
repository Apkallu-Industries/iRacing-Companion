import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

if (typeof window !== "undefined") {
  // Check if we are running under the Tauri wrapper
  const isTauri = (window as any).__TAURI_INTERNALS__ !== undefined;
  
  if (isTauri) {
    // Add is-electron class for visual layout styles compatibility
    document.documentElement.classList.add("is-electron");

    (window as any).pitWallRuntime = {
      version: "1.2.23-tauri-alpha",
      
      // Identity & Machine Info
      getRuntimeManifest: () => invoke("get_runtime_manifest"),
      getMonitorLayout: () => invoke("get_monitor_layout"),
      
      // Instrument Windows
      openInstrumentWindow: (type: string, url: string) => 
        invoke("open_instrument_window", { type, url }),
      
      // Bridge Control
      getBridgeStatus: () => invoke("get_bridge_status"),
      restartBridge: () => invoke("restart_bridge"),
      ensureMongoDB: () => invoke("ensure_mongodb"),
      refreshAiMode: () => invoke("refresh_ai_mode"),
      
      // App Info
      getAppInfo: () => invoke("get_app_info"),
      
      // Event Listeners
      onBridgeStatus: (callback: (status: string) => void) => {
        const unlistenPromise = listen<string>("bridge-status-changed", (event) => 
          callback(event.payload)
        );
        return () => {
          unlistenPromise.then((unlisten) => unlisten());
        };
      },
      
      onSessionChanged: (callback: (sessionId: string | null) => void) => {
        const unlistenPromise = listen<string | null>("session-changed", (event) => 
          callback(event.payload)
        );
        return () => {
          unlistenPromise.then((unlisten) => unlisten());
        };
      },
      
      // Supervisor & Sessions
      getSupervisorStatus: () => invoke("supervisor_get_status"),
      getActiveSession: () => invoke("supervisor_get_active_session"),
      listSessions: () => invoke("supervisor_get_sessions"),
      startSession: (sessionId: string, meta: any) => 
        invoke("supervisor_start_session", { sessionId, meta }),
      stopSession: (sessionId: string) => 
        invoke("supervisor_stop_session", { sessionId }),
      
      onTelemetryLive: (callback: (packet: any) => void) => {
        const unlistenPromise = listen<any>("telemetry-live", (event) => 
          callback(event.payload)
        );
        return () => {
          unlistenPromise.then((unlisten) => unlisten());
        };
      },
      
      onTelemetryRaw: (callback: (packet: any) => void) => {
        const unlistenPromise = listen<any>("telemetry-raw", (event) => 
          callback(event.payload)
        );
        return () => {
          unlistenPromise.then((unlisten) => unlisten());
        };
      },
      
      onTelemetryEvent: (callback: (event: any) => void) => {
        const unlistenPromise = listen<any>("telemetry-event", (event) => 
          callback(event.payload)
        );
        return () => {
          unlistenPromise.then((unlisten) => unlisten());
        };
      },
      
      getTelemetrySchema: () => invoke("supervisor_get_telemetry_schema"),
    };
  }
}
