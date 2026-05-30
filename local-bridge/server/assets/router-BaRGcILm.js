import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { Link, useRouter, useLocation, useCanGoBack, createRootRouteWithContext, Outlet, HeadContent, Scripts, createFileRoute, lazyRouteComponent, createRouter } from "@tanstack/react-router";
import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import * as React from "react";
import { useState, useEffect, createContext, useContext, useRef, useCallback } from "react";
import { u as upCss } from "./charts-IpNGhCyp.js";
import { createClient } from "@supabase/supabase-js";
import { b as createServerFn, e as createSsrRpc, u as useServerFn } from "./tanstack-Jo4b3tUQ.js";
import { Toaster as Toaster$1, toast } from "sonner";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { z } from "zod";
import { r as requireSupabaseAuth } from "./auth-middleware-xZM3BZWQ.js";
import { M as MathExpressionSchema } from "./schema-BU1MXGgz.js";
import { HelpCircle, X, CheckCircle2, Circle, ArrowLeft, ArrowRight, Wifi, LineChart, Brain, Gauge, Zap, FolderOpen, Database, Settings, ChevronRight, Laptop, Cpu, Server, Key, Keyboard, RefreshCw, AlertCircle, Terminal, Check, Copy, Trash2, RotateCcw } from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { s as supabaseAdmin } from "./client.server-Y-0AANJ4.js";
const appCss = "/assets/styles-DXYZdS0y.css";
const getLocalSessions = createServerFn({
  method: "GET"
}).handler(createSsrRpc("a89391221bf6d4f3c3355bf0dfc3e706c4f9b13cc230e42657eaa76688007322"));
const getLocalSessionById = createServerFn({
  method: "POST"
}).inputValidator((id) => String(id)).handler(createSsrRpc("fe521dc5b8ea6cac3c068abd8536973e9e6b2e73ee00f80cc9617f99f0e4e5b4"));
const insertLocalSession = createServerFn({
  method: "POST"
}).inputValidator((data) => data).handler(createSsrRpc("e29d9c58ccb381c467fd97ec72f1e31b8c84c96077dc15cb2d778a800c642838"));
const deleteLocalSession = createServerFn({
  method: "POST"
}).inputValidator((id) => String(id)).handler(createSsrRpc("be9659ec40533955d232ff49315c9aa649bd7db83b1fcfc216a660325004c844"));
const testLocalDbConnection = createServerFn({
  method: "POST"
}).handler(createSsrRpc("6fc40750dfd6c278f7c72bfbb36ff3225675daeec7f93fc991cb7f630fa6730c"));
const getDbConfig = createServerFn({
  method: "GET"
}).handler(createSsrRpc("6be988dd8f4ee314ac93db05da28d1eb8f2018797e18c521292bed6c4d850965"));
const saveDbConfig = createServerFn({
  method: "POST"
}).inputValidator((config) => config).handler(createSsrRpc("992e611799973d8db599cacccf15200b19b5669290f9410c9c9e16579f533001"));
class LocalTelemetryStore {
  dbPromise = null;
  initDb() {
    if (this.dbPromise) return this.dbPromise;
    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === "undefined" || !window.indexedDB) {
        reject(new Error("IndexedDB is not supported on the server or this browser."));
        return;
      }
      const request = indexedDB.open("apextrace_local_telemetry", 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains("blobs")) {
          db.createObjectStore("blobs");
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    return this.dbPromise;
  }
  async saveBlob(path, blob) {
    const db = await this.initDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("blobs", "readwrite");
      const store = tx.objectStore("blobs");
      const req = store.put(blob, path);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }
  async getBlob(path) {
    try {
      const db = await this.initDb();
      return new Promise((resolve, reject) => {
        const tx = db.transaction("blobs", "readonly");
        const store = tx.objectStore("blobs");
        const req = store.get(path);
        req.onsuccess = () => resolve(req.result ?? null);
        req.onerror = () => reject(req.error);
      });
    } catch {
      return null;
    }
  }
  async removeBlob(path) {
    try {
      const db = await this.initDb();
      return new Promise((resolve, reject) => {
        const tx = db.transaction("blobs", "readwrite");
        const store = tx.objectStore("blobs");
        const req = store.delete(path);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
    }
  }
}
const localTelemetryStore = new LocalTelemetryStore();
const dummyClient = new Proxy({}, {
  get(target, prop) {
    if (prop === "auth") {
      return {
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {
        } } } }),
        getSession: async () => ({ data: { session: null } }),
        signOut: async () => {
        }
      };
    }
    return () => {
      const chain = new Proxy({}, {
        get(t, p) {
          if (p === "then") {
            return (resolve) => resolve({ data: null, error: null });
          }
          return () => chain;
        }
      });
      return chain;
    };
  }
});
function getProxiedClient() {
  let realClient;
  try {
    const SUPABASE_URL = "https://bqnyztfkpsvmvelfdzgw.supabase.co";
    const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxbnl6dGZrcHN2bXZlbGZkemd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwMzkwMzcsImV4cCI6MjA5NDYxNTAzN30.F4TUaBCIRyopmCuMHJIjjFPOzVaUITJrE8LLXlfSZ-g";
    if (SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY) {
      realClient = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
        auth: {
          storage: typeof window !== "undefined" ? localStorage : void 0,
          persistSession: true,
          autoRefreshToken: true
        }
      });
    }
  } catch (err) {
    console.warn("[Supabase] Client creation failed. Falling back to mock.", err);
    realClient = dummyClient;
  }
  return new Proxy(realClient, {
    get(target, prop, receiver) {
      if (prop === "from") {
        return (tableName) => {
          const isLocal = typeof window !== "undefined" && (localStorage.getItem("apex_local_session") || false);
          if (isLocal && tableName === "telemetry_sessions") {
            const builder = {
              select: () => builder,
              order: () => builder,
              eq: (field, val) => {
                builder._eqId = val;
                return builder;
              },
              single: () => builder,
              insert: (payload) => {
                builder._insertPayload = payload;
                return builder;
              },
              delete: () => {
                builder._isDelete = true;
                return builder;
              },
              then: async (resolve) => {
                try {
                  if (builder._isDelete && builder._eqId) {
                    const res = await deleteLocalSession({ data: builder._eqId });
                    resolve(res);
                  } else if (builder._insertPayload) {
                    const res = await insertLocalSession({ data: builder._insertPayload });
                    resolve(res);
                  } else if (builder._eqId) {
                    const res = await getLocalSessionById({ data: builder._eqId });
                    resolve(res);
                  } else {
                    const res = await getLocalSessions();
                    resolve(res);
                  }
                } catch (err) {
                  resolve({ data: null, error: { message: err.message } });
                }
              }
            };
            return builder;
          }
          return target.from(tableName);
        };
      }
      if (prop === "storage") {
        const isLocal = typeof window !== "undefined" && (localStorage.getItem("apex_local_session") || false);
        if (isLocal) {
          return {
            from: (bucketName) => {
              if (bucketName === "telemetry") {
                return {
                  upload: async (path, blob) => {
                    try {
                      await localTelemetryStore.saveBlob(path, blob);
                      return { data: { path }, error: null };
                    } catch (e) {
                      return { data: null, error: e };
                    }
                  },
                  download: async (path) => {
                    try {
                      const blob = await localTelemetryStore.getBlob(path);
                      if (!blob) throw new Error("Local blob not found in IndexedDB");
                      return { data: blob, error: null };
                    } catch (e) {
                      return { data: null, error: e };
                    }
                  },
                  remove: async (paths) => {
                    try {
                      for (const path of paths) {
                        await localTelemetryStore.removeBlob(path);
                      }
                      return { data: paths, error: null };
                    } catch (e) {
                      return { data: null, error: e };
                    }
                  }
                };
              }
              return target.storage.from(bucketName);
            }
          };
        }
      }
      return Reflect.get(target, prop, receiver);
    }
  });
}
let _supabase;
const supabase = new Proxy({}, {
  get(_, prop, receiver) {
    if (!_supabase) _supabase = getProxiedClient();
    return Reflect.get(_supabase, prop, receiver);
  }
});
const Ctx$1 = createContext({
  session: null,
  user: null,
  loading: true,
  signOut: async () => {
  }
});
function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const localSess = typeof window !== "undefined" ? localStorage.getItem("apex_local_session") : null;
    if (localSess) {
      try {
        setSession(JSON.parse(localSess));
        setLoading(false);
        return;
      } catch (e) {
        localStorage.removeItem("apex_local_session");
      }
    }
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      if (s) {
        setSession(s);
      } else {
        const ls = typeof window !== "undefined" ? localStorage.getItem("apex_local_session") : null;
        if (ls) {
          try {
            setSession(JSON.parse(ls));
          } catch (_) {
            setSession(null);
          }
        } else {
          setSession(null);
        }
      }
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setSession(data.session);
      }
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);
  return /* @__PURE__ */ jsx(
    Ctx$1.Provider,
    {
      value: {
        session,
        user: session?.user ?? null,
        loading,
        signOut: async () => {
          if (typeof window !== "undefined") {
            localStorage.removeItem("apex_local_session");
          }
          try {
            await supabase.auth.signOut();
          } catch (_) {
          }
          setSession(null);
        }
      },
      children
    }
  );
}
const useAuth = () => useContext(Ctx$1);
const Toaster = ({ ...props }) => {
  return /* @__PURE__ */ jsx(
    Toaster$1,
    {
      className: "toaster group",
      toastOptions: {
        classNames: {
          toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
        }
      },
      ...props
    }
  );
};
const THEME_SCHEMA_VERSION = 2;
const THEME_SCHEMA_ID = "pitwall.theme";
const MIGRATIONS = {
  // v1 → v2: original release. v1 had no `version` field and identical token
  // keys to v2, so this is a structural pass-through. Future renames go here.
  1: (input) => {
    const tokens = input?.theme ?? input;
    return {
      ...typeof input === "object" && input !== null && "theme" in input ? input : {},
      theme: tokens,
      version: 2
    };
  }
};
function migrateThemeFile(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new Error("Theme file must be a JSON object.");
  }
  const obj = raw;
  let from;
  if (typeof obj.version === "number" && Number.isFinite(obj.version)) {
    from = obj.version;
  } else if (typeof obj.$schema === "string") {
    const m = obj.$schema.match(/\/v(\d+)\b/);
    from = m ? Number(m[1]) : 1;
  } else {
    from = 1;
  }
  if (from > THEME_SCHEMA_VERSION) {
    throw new Error(
      `Theme uses schema v${from}, but this app only understands up to v${THEME_SCHEMA_VERSION}. Update the app to import it.`
    );
  }
  let cur = obj;
  const steps2 = [];
  for (let v = from; v < THEME_SCHEMA_VERSION; v++) {
    const fn = MIGRATIONS[v];
    if (!fn) throw new Error(`Missing migration from v${v} to v${v + 1}.`);
    cur = fn(cur);
    steps2.push(v + 1);
  }
  const theme = cur && typeof cur === "object" && cur.theme && typeof cur.theme === "object" ? cur.theme : cur;
  return {
    file: {
      name: typeof cur?.name === "string" ? cur.name : void 0,
      description: typeof cur?.description === "string" || cur?.description === null ? cur.description : void 0,
      theme
    },
    fromVersion: from,
    toVersion: THEME_SCHEMA_VERSION,
    steps: steps2
  };
}
function buildThemeFile(input) {
  return {
    $schema: `${THEME_SCHEMA_ID}/v${THEME_SCHEMA_VERSION}`,
    version: THEME_SCHEMA_VERSION,
    name: input.name,
    description: input.description ?? null,
    theme: input.theme
  };
}
const THEME_GROUPS = [
  {
    label: "Surfaces",
    tokens: [
      { key: "background", label: "Background" },
      { key: "panel", label: "Panel" },
      { key: "panel-2", label: "Panel 2" },
      { key: "rail", label: "Rail" },
      { key: "muted", label: "Muted" },
      { key: "accent", label: "Accent" }
    ]
  },
  {
    label: "Text & borders",
    tokens: [
      { key: "foreground", label: "Foreground" },
      { key: "muted-foreground", label: "Muted text" },
      { key: "border", label: "Border" },
      { key: "border-strong", label: "Border strong" },
      { key: "grid-major", label: "Grid major" },
      { key: "grid-minor", label: "Grid minor" }
    ]
  },
  {
    label: "Brand",
    tokens: [
      { key: "primary", label: "Primary" },
      { key: "primary-foreground", label: "Primary text" },
      { key: "destructive", label: "Destructive" }
    ]
  },
  {
    label: "Channel traces",
    tokens: [
      { key: "ch-speed", label: "Speed" },
      { key: "ch-throttle", label: "Throttle" },
      { key: "ch-brake", label: "Brake" },
      { key: "ch-rpm", label: "RPM" },
      { key: "ch-gear", label: "Gear" },
      { key: "ch-steer", label: "Steering" },
      { key: "ch-glat", label: "Lat G" },
      { key: "ch-glong", label: "Long G" }
    ]
  }
];
const DARK_THEME = {
  background: "#05070A",
  foreground: "#e2e4e8",
  panel: "#0B0F14",
  "panel-2": "#11161D",
  rail: "#05070A",
  border: "#1C2430",
  "border-strong": "#263241",
  primary: "#3B82F6",
  /* Telemetry Blue */
  "primary-foreground": "#ffffff",
  muted: "#11161D",
  "muted-foreground": "#7a828c",
  accent: "#161C24",
  destructive: "#FF4D4D",
  /* Warning Red */
  "ch-speed": "#3B82F6",
  "ch-throttle": "#00D17F",
  "ch-brake": "#FF4D4D",
  "ch-rpm": "#FFB800",
  "ch-gear": "#e2e4e8",
  "ch-steer": "#8B5CF6",
  "ch-glat": "#FFB800",
  "ch-glong": "#3B82F6",
  "grid-major": "#1C2430",
  "grid-minor": "#11161D"
};
const MODERN_FLAT_THEME = {
  background: "#111318",
  foreground: "#d8dce4",
  panel: "#191d24",
  "panel-2": "#1f242c",
  rail: "#0d0f14",
  border: "#252a34",
  "border-strong": "#343c48",
  primary: "#60a5fa",
  "primary-foreground": "#0c1020",
  muted: "#1f242c",
  "muted-foreground": "#6b7280",
  accent: "#252a34",
  destructive: "#f87171",
  "ch-speed": "#60a5fa",
  "ch-throttle": "#34d399",
  "ch-brake": "#f87171",
  "ch-rpm": "#fbbf24",
  "ch-gear": "#d8dce4",
  "ch-steer": "#a78bfa",
  "ch-glat": "#fb923c",
  "ch-glong": "#38bdf8",
  "grid-major": "#252a34",
  "grid-minor": "#1a1f28"
};
const STUDIO_BLACK_THEME = {
  background: "#000000",
  foreground: "#ffffff",
  panel: "#0a0a0e",
  "panel-2": "#111115",
  rail: "#000000",
  border: "#1e1e24",
  "border-strong": "#2e2e36",
  primary: "#ff3b30",
  "primary-foreground": "#ffffff",
  muted: "#111115",
  "muted-foreground": "#888892",
  accent: "#1a1a20",
  destructive: "#ff453a",
  "ch-speed": "#00d4ff",
  "ch-throttle": "#30d158",
  "ch-brake": "#ff3b30",
  "ch-rpm": "#ff9f0a",
  "ch-gear": "#ffffff",
  "ch-steer": "#bf5af2",
  "ch-glat": "#ff9500",
  "ch-glong": "#0a84ff",
  "grid-major": "#222228",
  "grid-minor": "#141418"
};
const LIGHT_THEME = {
  background: "#f5f6f8",
  foreground: "#1a1d24",
  panel: "#ffffff",
  "panel-2": "#eef0f4",
  rail: "#e8eaef",
  border: "#d0d4dc",
  "border-strong": "#b0b8c4",
  primary: "#0066cc",
  "primary-foreground": "#ffffff",
  muted: "#eef0f4",
  "muted-foreground": "#5c6370",
  accent: "#dde0e8",
  destructive: "#d32f2f",
  "ch-speed": "#0066cc",
  "ch-throttle": "#16a34a",
  "ch-brake": "#d32f2f",
  "ch-rpm": "#b8860b",
  "ch-gear": "#1a1d24",
  "ch-steer": "#7c3aed",
  "ch-glat": "#c05000",
  "ch-glong": "#1d4ed8",
  "grid-major": "#c8ccd4",
  "grid-minor": "#e0e4ec"
};
const CARBON_THEME = {
  background: "#0c0c0f",
  foreground: "#e0e0e4",
  panel: "#141418",
  "panel-2": "#1a1a20",
  rail: "#080808",
  border: "#2a2a32",
  "border-strong": "#3a3a44",
  primary: "#e63322",
  "primary-foreground": "#ffffff",
  muted: "#1a1a20",
  "muted-foreground": "#7a7a84",
  accent: "#222228",
  destructive: "#ff3b30",
  "ch-speed": "#00bcd4",
  "ch-throttle": "#4caf50",
  "ch-brake": "#e63322",
  "ch-rpm": "#ff9800",
  "ch-gear": "#e0e0e4",
  "ch-steer": "#e040fb",
  "ch-glat": "#ff6b35",
  "ch-glong": "#2196f3",
  "grid-major": "#2a2a32",
  "grid-minor": "#1a1a20"
};
const F1_THEME = {
  background: "#0d0d10",
  foreground: "#e8e8ec",
  panel: "#14171c",
  "panel-2": "#1e232b",
  rail: "#08080c",
  border: "#2a2f38",
  "border-strong": "#3a4050",
  primary: "#e10600",
  "primary-foreground": "#ffffff",
  muted: "#1e232b",
  "muted-foreground": "#aab0b9",
  accent: "#252a34",
  destructive: "#e10600",
  "ch-speed": "#e10600",
  "ch-throttle": "#00e676",
  "ch-brake": "#e10600",
  "ch-rpm": "#ffb300",
  "ch-gear": "#e8e8ec",
  "ch-steer": "#b026ff",
  "ch-glat": "#0d6efd",
  "ch-glong": "#b026ff",
  "grid-major": "#2a2f38",
  "grid-minor": "#1a1f26"
};
const INDYCAR_THEME = {
  background: "#0a0c10",
  foreground: "#e4e6ea",
  panel: "#111520",
  "panel-2": "#1a1f2c",
  rail: "#060810",
  border: "#252a36",
  "border-strong": "#353c4a",
  primary: "#00e676",
  "primary-foreground": "#0a0c10",
  muted: "#1a1f2c",
  "muted-foreground": "#8892a0",
  accent: "#202838",
  destructive: "#ff3b30",
  "ch-speed": "#00bcd4",
  "ch-throttle": "#00e676",
  "ch-brake": "#ff3b30",
  "ch-rpm": "#ff9800",
  "ch-gear": "#e4e6ea",
  "ch-steer": "#b388ff",
  "ch-glat": "#ff6b35",
  "ch-glong": "#448aff",
  "grid-major": "#252a36",
  "grid-minor": "#181d28"
};
const RACECOMMAND_THEME = {
  background: "#000000",
  foreground: "#ffffff",
  panel: "#0a0c10",
  "panel-2": "#111520",
  rail: "#05070a",
  border: "#1C2430",
  "border-strong": "#263241",
  primary: "#00e676",
  "primary-foreground": "#000000",
  muted: "#111520",
  "muted-foreground": "#7a828c",
  accent: "#161C24",
  destructive: "#FF4D4D",
  "ch-speed": "#00e676",
  "ch-throttle": "#00D17F",
  "ch-brake": "#FF4D4D",
  "ch-rpm": "#FFB800",
  "ch-gear": "#ffffff",
  "ch-steer": "#8B5CF6",
  "ch-glat": "#FFB800",
  "ch-glong": "#3B82F6",
  "grid-major": "#1C2430",
  "grid-minor": "#11161D"
};
const PRESETS = [
  { id: "motec", label: "A - MoTeC Dark", theme: DARK_THEME },
  { id: "modern", label: "B - Modern Flat", theme: MODERN_FLAT_THEME },
  { id: "studio", label: "C - Studio Black", theme: STUDIO_BLACK_THEME },
  { id: "engineer", label: "D - Light Engineer", theme: LIGHT_THEME },
  { id: "carbon", label: "E - Carbon UI", theme: CARBON_THEME },
  { id: "f1", label: "F - Modern F1", theme: F1_THEME },
  { id: "indycar", label: "G - IndyCar/NASCAR", theme: INDYCAR_THEME },
  { id: "racecommand", label: "H - Proper Race Command", theme: RACECOMMAND_THEME }
];
function applyTheme(theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const merged = { ...DARK_THEME, ...theme };
  for (const [k, v] of Object.entries(merged)) {
    root.style.setProperty(`--${k}`, v);
  }
}
const LS_KEY$1 = "apextrace.theme.v1";
function loadLocalTheme() {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(LS_KEY$1);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function saveLocalTheme(theme) {
  if (typeof localStorage === "undefined") return;
  if (!theme) localStorage.removeItem(LS_KEY$1);
  else localStorage.setItem(LS_KEY$1, JSON.stringify(theme));
}
const LAYOUT_PROFILES = [
  {
    id: "motec",
    label: "MoTeC / Professional Dark",
    subtitle: "Classic Engineering",
    description: "Classic engineering feel. Dense information layout, trusted by professionals. The reference standard.",
    swatches: ["#0f1114", "#181b20", "#22d3ee", "#22c55e"]
  },
  {
    id: "modern",
    label: "Modern Flat Dark",
    subtitle: "Clean & Minimal",
    description: "Clean, minimal, contemporary. Great balance of clarity and simplicity with modern typography.",
    swatches: ["#111318", "#191d24", "#60a5fa", "#a78bfa"]
  },
  {
    id: "studio",
    label: "Studio Black",
    subtitle: "High Contrast Performance",
    description: "Maximum contrast, bold typography. Built for quick at-a-glance performance reading.",
    swatches: ["#000000", "#0a0a0e", "#ff3b30", "#ff9500"]
  },
  {
    id: "engineer",
    label: "Light Engineer",
    subtitle: "Professional Light Mode",
    description: "Professional light mode. Reduces eye strain during long analysis sessions.",
    swatches: ["#f5f6f8", "#ffffff", "#0066cc", "#16a34a"]
  },
  {
    id: "carbon",
    label: "Carbon UI",
    subtitle: "F1 / Motorsport Inspired",
    description: "Carbon textures and red accents. Aggressive and performance focused. Built for race day.",
    swatches: ["#0c0c0f", "#141418", "#e63322", "#ff6b35"]
  },
  {
    id: "f1",
    label: "Modern F1",
    subtitle: "High Performance. Precision.",
    description: "F1-inspired. Carbon black background, F1 red accents, DIN-style headings. Built for open-wheeler telemetry.",
    swatches: ["#0d0d10", "#14171c", "#e10600", "#00e676"]
  },
  {
    id: "indycar",
    label: "IndyCar / NASCAR",
    subtitle: "Oval & Road Course",
    description: "Dense race data: running order, 4-sector splits, fuel strategy, caution flags. Green live accents on deep dark.",
    swatches: ["#0a0c10", "#111520", "#00e676", "#ff6b35"]
  },
  {
    id: "racecommand",
    label: "Proper Race Command",
    subtitle: "Pit Wall Commander",
    description: "Full race command strategy deck. Standing positions tables, dynamic track relative maps, 4-corner tire gauges, and live electronics selectors.",
    swatches: ["#05070a", "#0b0f14", "#00e676", "#3b82f6"]
  }
];
const LS_KEY = "pitwall.layout";
function applyLayout(profile) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-layout", profile);
}
function loadSavedLayout() {
  if (typeof localStorage === "undefined") return "motec";
  const saved = localStorage.getItem(LS_KEY);
  if (saved && ["motec", "modern", "studio", "engineer", "carbon", "f1", "indycar", "racecommand"].includes(saved)) {
    return saved;
  }
  return "motec";
}
function saveLayout(profile) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(LS_KEY, profile);
}
const Ctx = createContext({
  theme: DARK_THEME,
  setToken: () => {
  },
  setTheme: () => {
  },
  reset: () => {
  },
  layout: "motec",
  setLayout: () => {
  }
});
function ThemeProvider({ children }) {
  const { user } = useAuth();
  const [theme, setThemeState] = useState(() => loadLocalTheme() ?? DARK_THEME);
  const [layout, setLayoutState] = useState(() => loadSavedLayout());
  const hydratedFor = useRef(null);
  const saveTimer = useRef(null);
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);
  useEffect(() => {
    applyLayout(layout);
  }, [layout]);
  const setLayout = useCallback((profile) => {
    setLayoutState(profile);
    saveLayout(profile);
  }, []);
  useEffect(() => {
    if (!user) {
      hydratedFor.current = null;
      return;
    }
    if (hydratedFor.current === user.id) return;
    hydratedFor.current = user.id;
    if (user.id === "local-user-id") return;
    supabase.from("user_preferences").select("theme").eq("user_id", user.id).maybeSingle().then(({ data }) => {
      if (data?.theme) {
        setThemeState(data.theme);
        saveLocalTheme(data.theme);
      }
    });
  }, [user]);
  const persist2 = useCallback(
    (next) => {
      saveLocalTheme(next);
      if (!user || user.id === "local-user-id") return;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        supabase.from("user_preferences").upsert(
          {
            user_id: user.id,
            theme: next,
            updated_at: (/* @__PURE__ */ new Date()).toISOString()
          },
          { onConflict: "user_id" }
        ).then(() => {
        });
      }, 500);
    },
    [user]
  );
  const setToken = useCallback(
    (key, value) => {
      setThemeState((prev) => {
        const next = { ...prev, [key]: value };
        persist2(next);
        return next;
      });
    },
    [persist2]
  );
  const setTheme = useCallback(
    (next) => {
      setThemeState(next);
      persist2(next);
    },
    [persist2]
  );
  const reset = useCallback(() => {
    setThemeState(DARK_THEME);
    saveLocalTheme(null);
    if (user && user.id !== "local-user-id") {
      supabase.from("user_preferences").upsert(
        { user_id: user.id, theme: null, updated_at: (/* @__PURE__ */ new Date()).toISOString() },
        { onConflict: "user_id" }
      ).then(() => {
      });
    }
  }, [user]);
  return /* @__PURE__ */ jsx(Ctx.Provider, { value: { theme, setToken, setTheme, reset, layout, setLayout }, children });
}
const useTheme = () => useContext(Ctx);
class BridgeDataClient {
  wsUrl;
  reconnectDelayMs;
  maxReconnectAttempts;
  ws = null;
  isConnected = false;
  reconnectCount = 0;
  listeners = [];
  reconnectTimer = null;
  constructor(config) {
    this.wsUrl = config.wsUrl;
    this.reconnectDelayMs = config.reconnectDelayMs ?? 3e3;
    this.maxReconnectAttempts = config.maxReconnectAttempts ?? Infinity;
  }
  /**
   * Connect to the bridge. Auto-reconnects on failure.
   * Returns a cleanup function (call to disconnect).
   */
  connect() {
    const doConnect = () => {
      if (this.reconnectCount >= this.maxReconnectAttempts) {
        this.emit({
          type: "error",
          data: new Error(
            `Bridge: max reconnect attempts (${this.maxReconnectAttempts}) reached`
          )
        });
        return;
      }
      try {
        this.ws = new WebSocket(this.wsUrl);
        this.ws.onopen = () => {
          this.isConnected = true;
          this.reconnectCount = 0;
          this.emit({ type: "connect" });
        };
        this.ws.onmessage = (ev) => {
          try {
            const data = JSON.parse(ev.data);
            if (data && data.type === "license") {
              this.emit({ type: "license", data });
            } else {
              let normalized = data;
              if (data && typeof data === "object" && "payload" in data && typeof data.payload === "object") {
                normalized = {
                  ...data.payload,
                  __meta: {
                    carId: data.carId,
                    teamId: data.teamId,
                    driverId: data.driverId
                  }
                };
              }
              this.emit({ type: "telemetry", data: normalized });
            }
          } catch (e) {
            this.emit({ type: "error", data: e });
          }
        };
        this.ws.onerror = (err) => {
          this.emit({ type: "error", data: err });
        };
        this.ws.onclose = () => {
          this.isConnected = false;
          this.emit({ type: "disconnect" });
          this.scheduleReconnect(doConnect);
        };
      } catch (e) {
        this.emit({ type: "error", data: e });
        this.scheduleReconnect(doConnect);
      }
    };
    doConnect();
    return () => this.disconnect();
  }
  scheduleReconnect(fn) {
    if (this.reconnectCount >= this.maxReconnectAttempts) return;
    this.reconnectCount++;
    this.reconnectTimer = setTimeout(fn, this.reconnectDelayMs);
  }
  /**
   * Disconnect and stop reconnecting.
   */
  disconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.ws) this.ws.close();
    this.ws = null;
    this.isConnected = false;
    this.reconnectCount = 0;
  }
  /**
   * Send FPS metrics to the bridge (for adaptive streaming).
   */
  reportFps(fps) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    try {
      this.ws.send(JSON.stringify({ type: "perf", fps: Math.round(fps) }));
    } catch {
    }
  }
  /**
   * Subscribe to bridge events.
   */
  on(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }
  /**
   * Subscribe to telemetry updates only.
   */
  onTelemetry(callback) {
    return this.on((event) => {
      if (event.type === "telemetry" && event.data) {
        callback(event.data);
      }
    });
  }
  /**
   * Is the bridge currently connected?
   */
  getConnected() {
    return this.isConnected;
  }
  emit(event) {
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (e) {
        console.error("[BridgeDataClient] listener error:", e);
      }
    }
  }
}
function getBridgeUrl() {
  if (typeof window === "undefined") return "ws://localhost:3001";
  const configuredUrl = new URLSearchParams(window.location.search).get("bridge");
  if (configuredUrl) return configuredUrl;
  const host = ["localhost", "127.0.0.1"].includes(window.location.hostname) ? window.location.hostname : "localhost";
  return `ws://${host}:3001`;
}
let singletonClient = null;
function getBridgeClient() {
  if (!singletonClient) {
    singletonClient = new BridgeDataClient({ wsUrl: getBridgeUrl() });
  }
  return singletonClient;
}
const DEFAULT_TELEMETRY = {
  connected: false,
  source: "simulated",
  session: "PRACTICE — SPA-FRANCORCHAMPS",
  track: "Spa-Francorchamps",
  car: "DALLARA P217",
  carNumber: "44",
  sdkVersion: "irsdk v1.0",
  latencyMs: 24,
  safetyRating: 4.82,
  gear: 4,
  speedKph: 184,
  rpm: 8420,
  rpmMax: 11e3,
  rpmShiftWarn: 8800,
  rpmShiftRedline: 9800,
  throttle: 0.85,
  brake: 0.12,
  clutch: 0,
  steeringDeg: 12,
  lastLap: "2:18.421",
  bestLap: "2:17.004",
  deltaSec: 0.145,
  sectors: { s1: "41.420", s2: "1:02.115", s3: null, bestSector: 1 },
  fuelRemainingL: 42.1,
  fuelUsePerHour: 0,
  lapLastLapTimeSec: 137.004,
  // 2:17.004 in seconds
  lapsEstimated: 14.2,
  tires: {
    fl: {
      tempC: 82,
      pressureBar: 1.84,
      wearPct: 98,
      estWearPct: 98,
      brakeTempC: 320,
      brakeLinePress: 0,
      state: "ok"
    },
    fr: {
      tempC: 94,
      pressureBar: 1.92,
      wearPct: 94,
      estWearPct: 94,
      brakeTempC: 350,
      brakeLinePress: 0,
      state: "hot"
    },
    rl: {
      tempC: 84,
      pressureBar: 1.88,
      wearPct: 97,
      estWearPct: 97,
      brakeTempC: 310,
      brakeLinePress: 0,
      state: "ok"
    },
    rr: {
      tempC: 88,
      pressureBar: 1.9,
      wearPct: 96,
      estWearPct: 96,
      brakeTempC: 315,
      brakeLinePress: 0,
      state: "ok"
    }
  },
  gLat: 1.8,
  gLon: -0.4,
  drsAvailable: true,
  brakeBias: 54.5,
  diffMap: 3,
  airTempC: 22.5,
  trackTempC: 38.2,
  liveAirTempC: 22.8,
  liveTrackTempC: 39.5,
  airDensity: 1.2,
  airPressure: 101325,
  windVel: 5.2,
  windDir: 1.5,
  trackWetness: 0,
  sof: 2150
};
const MODE_KEY = "pitwall.bridge.performance.mode";
const SNAPSHOT_KEY = "pitwall.bridge.performance.snapshot";
function getBridgePerformanceMode() {
  if (typeof window === "undefined") return "balanced60";
  const raw = window.localStorage.getItem(MODE_KEY);
  return raw === "stable30" ? "stable30" : "balanced60";
}
function setBridgePerformanceMode(mode) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(MODE_KEY, mode);
}
function recommendModeFromFps(fps) {
  return fps < 50 ? "stable30" : "balanced60";
}
function saveBridgePerformanceSnapshot(fps) {
  if (typeof window === "undefined") return;
  const mode = getBridgePerformanceMode();
  const payload = {
    mode,
    lastFps: Math.round(fps),
    recommendedMode: recommendModeFromFps(fps),
    sampledAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  window.localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(payload));
}
function getBridgePerformanceSnapshot() {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(SNAPSHOT_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.lastFps !== "number") return null;
    return parsed;
  } catch {
    return null;
  }
}
function useTelemetry() {
  const [t, setT] = useState(DEFAULT_TELEMETRY);
  const liveRef = useRef(false);
  const clientRef = useRef(getBridgeClient());
  useEffect(() => {
    const client = clientRef.current;
    const unsubscribeTelemetry = client.onTelemetry((data) => {
      liveRef.current = true;
      setT((prev) => ({ ...prev, ...data, connected: true, source: "live" }));
    });
    const unsubscribeDisconnect = client.on((event) => {
      if (event.type === "disconnect") {
        liveRef.current = false;
        setT((prev) => ({ ...prev, connected: false, source: "simulated" }));
      } else if (event.type === "license" && event.data) {
        if (typeof localStorage !== "undefined") {
          localStorage.setItem("pitwall_bridge_license", JSON.stringify(event.data));
        }
      }
    });
    const cleanup = client.connect();
    return () => {
      unsubscribeTelemetry();
      unsubscribeDisconnect();
      cleanup();
    };
  }, []);
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let frames = 0;
    let latestFps = 60;
    let report = null;
    const loop = (now) => {
      frames += 1;
      const elapsed = now - last;
      if (elapsed >= 1e3) {
        latestFps = frames * 1e3 / elapsed;
        frames = 0;
        last = now;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    report = setInterval(() => {
      const client = clientRef.current;
      try {
        client.reportFps(latestFps);
        saveBridgePerformanceSnapshot(latestFps);
      } catch {
      }
    }, 2e3);
    return () => {
      cancelAnimationFrame(raf);
      if (report) clearInterval(report);
    };
  }, []);
  useEffect(() => {
    const id = setInterval(() => {
      if (liveRef.current) return;
      const now = performance.now() / 1e3;
      setT((prev) => {
        const throttle = clamp01(0.6 + 0.4 * Math.sin(now * 1.3));
        const brake = clamp01(Math.max(0, -Math.sin(now * 1.3)) * 0.7);
        const speed = 120 + 110 * (0.5 + 0.5 * Math.sin(now * 0.8));
        const rpm = 5500 + 4500 * throttle + 200 * Math.sin(now * 6);
        const gear = Math.max(1, Math.min(7, Math.round(2 + 4 * throttle)));
        return {
          ...prev,
          throttle,
          brake,
          clutch: 0,
          steeringDeg: 35 * Math.sin(now * 0.6),
          speedKph: Math.round(speed),
          rpm: Math.round(rpm),
          gear,
          gLat: 1.6 * Math.sin(now * 0.6),
          gLon: -1.2 * brake + 0.6 * throttle,
          deltaSec: 0.2 * Math.sin(now * 0.2),
          fuelRemainingL: Math.max(2, prev.fuelRemainingL - 2e-3),
          latencyMs: 18 + Math.round(8 * Math.random()),
          tires: {
            fl: jitterTire(prev.tires.fl),
            fr: jitterTire(prev.tires.fr),
            rl: jitterTire(prev.tires.rl),
            rr: jitterTire(prev.tires.rr)
          }
        };
      });
    }, 1e3 / 60);
    return () => clearInterval(id);
  }, []);
  return t;
}
function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}
function jitterTire(t) {
  const tempC = t.tempC + (Math.random() - 0.5) * 0.6;
  return {
    ...t,
    tempC,
    state: tempC > 92 ? "hot" : tempC < 70 ? "cold" : "ok"
  };
}
const WORKSPACES = {
  lite: {
    key: "lite",
    name: "iRacing Lite Workbook v1.2",
    description: "Standard offline data layout. Covers basic traces, G-Gs, and brake bias.",
    tier: "Free",
    defaultChannels: ["Speed", "Throttle", "Brake", "RPM", "Gear", "SteeringWheelAngle"],
    activeTabs: ["cinema", "readout", "laps", "gg", "brake", "setup"],
    mathExpressions: [
      {
        id: "d04a6011-e4f0-4d4e-bba3-5d803836e100",
        name: "Lap Distance",
        key: "lap_distance",
        expression: "[LapDist]",
        unit: "m",
        enabled: true,
        scope: "both",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "d04a6011-e4f0-4d4e-bba3-5d803836e101",
        name: "Thr/Brake/Coast",
        key: "throttle_brake_coast",
        expression: "choose(([Throttle]>98),2,choose(([Brake]>65),4,choose(([Throttle]>2)&&([Throttle]<98),1,choose(([Brake]>2)&&([Brake]<65),3,0))))",
        unit: "state",
        enabled: true,
        scope: "both",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "d04a6011-e4f0-4d4e-bba3-5d803836e102",
        name: "Total Brake Pressure",
        key: "total_brake_pressure",
        expression: "[LFbrakeLinePress]+[RFbrakeLinePress]+[LRbrakeLinePress]+[RRbrakeLinePress]",
        unit: "bar",
        enabled: true,
        scope: "both",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "d04a6011-e4f0-4d4e-bba3-5d803836e103",
        name: "Average LF Tyre Temp",
        key: "avg_lf_temp",
        expression: "([LFtempL]+[LFtempM]+[LFtempR])/3",
        unit: "C",
        enabled: true,
        scope: "both",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "d04a6011-e4f0-4d4e-bba3-5d803836e104",
        name: "Average RF Tyre Temp",
        key: "avg_rf_temp",
        expression: "([RFtempL]+[RFtempM]+[RFtempR])/3",
        unit: "C",
        enabled: true,
        scope: "both",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "d04a6011-e4f0-4d4e-bba3-5d803836e105",
        name: "Average LR Tyre Temp",
        key: "avg_lr_temp",
        expression: "([LRtempL]+[LRtempM]+[LRtempR])/3",
        unit: "C",
        enabled: true,
        scope: "both",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "d04a6011-e4f0-4d4e-bba3-5d803836e106",
        name: "Average RR Tyre Temp",
        key: "avg_rr_temp",
        expression: "([RRtempL]+[RRtempM]+[RRtempR])/3",
        unit: "C",
        enabled: true,
        scope: "both",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "d04a6011-e4f0-4d4e-bba3-5d803836e107",
        name: "Rear Wheel Speed Diff",
        key: "rear_speed_diff",
        expression: "[LRspeed]-[RRspeed]",
        unit: "kph",
        enabled: true,
        scope: "both",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "d04a6011-e4f0-4d4e-bba3-5d803836e108",
        name: "Front Wheel Speed Diff",
        key: "front_speed_diff",
        expression: "[LFspeed]-[RFspeed]",
        unit: "kph",
        enabled: true,
        scope: "both",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "d04a6011-e4f0-4d4e-bba3-5d803836e109",
        name: "Steering Angle Inverted",
        key: "steer_angle_inv",
        expression: "[SteeringWheelAngle]*(-1)",
        unit: "deg",
        enabled: true,
        scope: "both",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "d04a6011-e4f0-4d4e-bba3-5d803836e110",
        name: "Yaw Rate Inverted",
        key: "yaw_rate_inv",
        expression: "[YawRate]*(-1)",
        unit: "deg/s",
        enabled: true,
        scope: "both",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "d04a6011-e4f0-4d4e-bba3-5d803836e111",
        name: "Front Ride Height Avg",
        key: "front_ride_height_avg",
        expression: "([LFrideHeight]+[RFrideHeight])/2",
        unit: "mm",
        enabled: true,
        scope: "both",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "d04a6011-e4f0-4d4e-bba3-5d803836e112",
        name: "Rear Ride Height Avg",
        key: "rear_ride_height_avg",
        expression: "([LRrideHeight]+[RRrideHeight])/2",
        unit: "mm",
        enabled: true,
        scope: "both",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "d04a6011-e4f0-4d4e-bba3-5d803836e113",
        name: "Live Brake Bias",
        key: "live_brake_bias",
        expression: "[LFbrakeLinePress]/([LFbrakeLinePress]+[LRbrakeLinePress])*100",
        unit: "%",
        enabled: true,
        scope: "both",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      }
    ]
  },
  plus: {
    key: "plus",
    name: "iRacing Plus Workbook v1.3",
    description: "Expanded professional offline analysis workbook. Dampers, Scatters, and Setup Diffs.",
    tier: "Plus",
    defaultChannels: [
      "Speed",
      "Throttle",
      "Brake",
      "RPM",
      "Gear",
      "SteeringWheelAngle",
      "LFshockDefl",
      "RFshockDefl",
      "LRshockDefl",
      "RRshockDefl"
    ],
    activeTabs: [
      "cinema",
      "readout",
      "laps",
      "gg",
      "brake",
      "setup",
      "histogram",
      "scatter",
      "optimal",
      "whatif",
      "apex",
      "waterfall",
      "slip",
      "setupdiff"
    ],
    mathExpressions: [
      // Include all Lite formulas
      {
        id: "d04a6011-e4f0-4d4e-bba3-5d803836e100",
        name: "Lap Distance",
        key: "lap_distance",
        expression: "[LapDist]",
        unit: "m",
        enabled: true,
        scope: "both",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "d04a6011-e4f0-4d4e-bba3-5d803836e101",
        name: "Thr/Brake/Coast",
        key: "throttle_brake_coast",
        expression: "choose(([Throttle]>98),2,choose(([Brake]>65),4,choose(([Throttle]>2)&&([Throttle]<98),1,choose(([Brake]>2)&&([Brake]<65),3,0))))",
        unit: "state",
        enabled: true,
        scope: "both",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "d04a6011-e4f0-4d4e-bba3-5d803836e102",
        name: "Total Brake Pressure",
        key: "total_brake_pressure",
        expression: "[LFbrakeLinePress]+[RFbrakeLinePress]+[LRbrakeLinePress]+[RRbrakeLinePress]",
        unit: "bar",
        enabled: true,
        scope: "both",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "d04a6011-e4f0-4d4e-bba3-5d803836e103",
        name: "Average LF Tyre Temp",
        key: "avg_lf_temp",
        expression: "([LFtempL]+[LFtempM]+[LFtempR])/3",
        unit: "C",
        enabled: true,
        scope: "both",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "d04a6011-e4f0-4d4e-bba3-5d803836e104",
        name: "Average RF Tyre Temp",
        key: "avg_rf_temp",
        expression: "([RFtempL]+[RFtempM]+[RFtempR])/3",
        unit: "C",
        enabled: true,
        scope: "both",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "d04a6011-e4f0-4d4e-bba3-5d803836e105",
        name: "Average LR Tyre Temp",
        key: "avg_lr_temp",
        expression: "([LRtempL]+[LRtempM]+[LRtempR])/3",
        unit: "C",
        enabled: true,
        scope: "both",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "d04a6011-e4f0-4d4e-bba3-5d803836e106",
        name: "Average RR Tyre Temp",
        key: "avg_rr_temp",
        expression: "([RRtempL]+[RRtempM]+[RRtempR])/3",
        unit: "C",
        enabled: true,
        scope: "both",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "d04a6011-e4f0-4d4e-bba3-5d803836e107",
        name: "Rear Wheel Speed Diff",
        key: "rear_speed_diff",
        expression: "[LRspeed]-[RRspeed]",
        unit: "kph",
        enabled: true,
        scope: "both",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "d04a6011-e4f0-4d4e-bba3-5d803836e108",
        name: "Front Wheel Speed Diff",
        key: "front_speed_diff",
        expression: "[LFspeed]-[RFspeed]",
        unit: "kph",
        enabled: true,
        scope: "both",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "d04a6011-e4f0-4d4e-bba3-5d803836e109",
        name: "Steering Angle Inverted",
        key: "steer_angle_inv",
        expression: "[SteeringWheelAngle]*(-1)",
        unit: "deg",
        enabled: true,
        scope: "both",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "d04a6011-e4f0-4d4e-bba3-5d803836e110",
        name: "Yaw Rate Inverted",
        key: "yaw_rate_inv",
        expression: "[YawRate]*(-1)",
        unit: "deg/s",
        enabled: true,
        scope: "both",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "d04a6011-e4f0-4d4e-bba3-5d803836e111",
        name: "Front Ride Height Avg",
        key: "front_ride_height_avg",
        expression: "([LFrideHeight]+[RFrideHeight])/2",
        unit: "mm",
        enabled: true,
        scope: "both",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "d04a6011-e4f0-4d4e-bba3-5d803836e112",
        name: "Rear Ride Height Avg",
        key: "rear_ride_height_avg",
        expression: "([LRrideHeight]+[RRrideHeight])/2",
        unit: "mm",
        enabled: true,
        scope: "both",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "d04a6011-e4f0-4d4e-bba3-5d803836e113",
        name: "Live Brake Bias",
        key: "live_brake_bias",
        expression: "[LFbrakeLinePress]/([LFbrakeLinePress]+[LRbrakeLinePress])*100",
        unit: "%",
        enabled: true,
        scope: "both",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      },
      // Plus specific formulas
      {
        id: "d04a6011-e4f0-4d4e-bba3-5d803836e120",
        name: "G Total (Vector)",
        key: "g_total",
        expression: "sqrt(([Accel Lateral]*[Accel Lateral])+([Accel Longitudinal]*[Accel Longitudinal]))",
        unit: "G",
        enabled: true,
        scope: "both",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "d04a6011-e4f0-4d4e-bba3-5d803836e121",
        name: "Yaw Gain",
        key: "yaw_gain",
        expression: "[YawRate]/[SteeringWheelAngle]",
        unit: "ratio",
        enabled: true,
        scope: "both",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "d04a6011-e4f0-4d4e-bba3-5d803836e122",
        name: "Longitudinal Slip",
        key: "longitudinal_slip",
        expression: "100*((0.5*([LFspeed]+[RFspeed]))/(0.5*([LRspeed]+[RRspeed]))-1)",
        unit: "%",
        enabled: true,
        scope: "both",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "d04a6011-e4f0-4d4e-bba3-5d803836e123",
        name: "Pedal Overlap Detection",
        key: "pedal_overlap",
        expression: "choose(([Throttle]>2.5)&&([Brake]>2.5),1,0)",
        unit: "flag",
        enabled: true,
        scope: "both",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "d04a6011-e4f0-4d4e-bba3-5d803836e124",
        name: "Inverse Track Curvature",
        key: "inverse_curvature",
        expression: "abs(([Accel Lateral]/([Speed]*[Speed])))",
        unit: "1/m",
        enabled: true,
        scope: "both",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "d04a6011-e4f0-4d4e-bba3-5d803836e125",
        name: "Speed Adjusted Steering",
        key: "speed_adj_steer",
        expression: "[SteeringWheelAngle]*([Speed]*sqrt([Speed]))",
        unit: "deg-mps",
        enabled: true,
        scope: "both",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "d04a6011-e4f0-4d4e-bba3-5d803836e126",
        name: "Corner State Machine",
        key: "corner_state",
        expression: "choose(([Brake]>20)&&([Accel Longitudinal]<-0.3),3,choose(([Throttle]>30)&&(abs([Accel Lateral])>0.5),5,choose((abs([Accel Lateral])>0.5),1,0)))",
        unit: "state",
        enabled: true,
        scope: "both",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      }
    ]
  },
  realtime: {
    key: "realtime",
    name: "iRacing Plus Real-Time Workbook v1.0",
    description: "Full pro-tier workspace. Integrates high-frequency active math, 3D overlays, and spider trackers.",
    tier: "Pro",
    defaultChannels: [
      "Speed",
      "Throttle",
      "Brake",
      "RPM",
      "Gear",
      "SteeringWheelAngle",
      "LFshockDefl",
      "RFshockDefl",
      "LRshockDefl",
      "RRshockDefl",
      "YawRate"
    ],
    activeTabs: [
      "cinema",
      "readout",
      "laps",
      "gg",
      "brake",
      "setup",
      "histogram",
      "scatter",
      "optimal",
      "whatif",
      "apex",
      "waterfall",
      "slip",
      "setupdiff",
      "replay3d",
      "piano",
      "spider"
    ],
    mathExpressions: [
      // Includes all Plus formulas + Real-time active math
      {
        id: "d04a6011-e4f0-4d4e-bba3-5d803836e100",
        name: "Lap Distance",
        key: "lap_distance",
        expression: "[LapDist]",
        unit: "m",
        enabled: true,
        scope: "both",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "d04a6011-e4f0-4d4e-bba3-5d803836e101",
        name: "Thr/Brake/Coast",
        key: "throttle_brake_coast",
        expression: "choose(([Throttle]>98),2,choose(([Brake]>65),4,choose(([Throttle]>2)&&([Throttle]<98),1,choose(([Brake]>2)&&([Brake]<65),3,0))))",
        unit: "state",
        enabled: true,
        scope: "both",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "d04a6011-e4f0-4d4e-bba3-5d803836e102",
        name: "Total Brake Pressure",
        key: "total_brake_pressure",
        expression: "[LFbrakeLinePress]+[RFbrakeLinePress]+[LRbrakeLinePress]+[RRbrakeLinePress]",
        unit: "bar",
        enabled: true,
        scope: "both",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "d04a6011-e4f0-4d4e-bba3-5d803836e103",
        name: "Average LF Tyre Temp",
        key: "avg_lf_temp",
        expression: "([LFtempL]+[LFtempM]+[LFtempR])/3",
        unit: "C",
        enabled: true,
        scope: "both",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "d04a6011-e4f0-4d4e-bba3-5d803836e104",
        name: "Average RF Tyre Temp",
        key: "avg_rf_temp",
        expression: "([RFtempL]+[RFtempM]+[RFtempR])/3",
        unit: "C",
        enabled: true,
        scope: "both",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "d04a6011-e4f0-4d4e-bba3-5d803836e105",
        name: "Average LR Tyre Temp",
        key: "avg_lr_temp",
        expression: "([LRtempL]+[LRtempM]+[LRtempR])/3",
        unit: "C",
        enabled: true,
        scope: "both",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "d04a6011-e4f0-4d4e-bba3-5d803836e106",
        name: "Average RR Tyre Temp",
        key: "avg_rr_temp",
        expression: "([RRtempL]+[RRtempM]+[RRtempR])/3",
        unit: "C",
        enabled: true,
        scope: "both",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "d04a6011-e4f0-4d4e-bba3-5d803836e107",
        name: "Rear Wheel Speed Diff",
        key: "rear_speed_diff",
        expression: "[LRspeed]-[RRspeed]",
        unit: "kph",
        enabled: true,
        scope: "both",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "d04a6011-e4f0-4d4e-bba3-5d803836e108",
        name: "Front Wheel Speed Diff",
        key: "front_speed_diff",
        expression: "[LFspeed]-[RFspeed]",
        unit: "kph",
        enabled: true,
        scope: "both",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "d04a6011-e4f0-4d4e-bba3-5d803836e109",
        name: "Steering Angle Inverted",
        key: "steer_angle_inv",
        expression: "[SteeringWheelAngle]*(-1)",
        unit: "deg",
        enabled: true,
        scope: "both",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "d04a6011-e4f0-4d4e-bba3-5d803836e110",
        name: "Yaw Rate Inverted",
        key: "yaw_rate_inv",
        expression: "[YawRate]*(-1)",
        unit: "deg/s",
        enabled: true,
        scope: "both",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "d04a6011-e4f0-4d4e-bba3-5d803836e111",
        name: "Front Ride Height Avg",
        key: "front_ride_height_avg",
        expression: "([LFrideHeight]+[RFrideHeight])/2",
        unit: "mm",
        enabled: true,
        scope: "both",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "d04a6011-e4f0-4d4e-bba3-5d803836e112",
        name: "Rear Ride Height Avg",
        key: "rear_ride_height_avg",
        expression: "([LRrideHeight]+[RRrideHeight])/2",
        unit: "mm",
        enabled: true,
        scope: "both",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "d04a6011-e4f0-4d4e-bba3-5d803836e113",
        name: "Live Brake Bias",
        key: "live_brake_bias",
        expression: "[LFbrakeLinePress]/([LFbrakeLinePress]+[LRbrakeLinePress])*100",
        unit: "%",
        enabled: true,
        scope: "both",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "d04a6011-e4f0-4d4e-bba3-5d803836e120",
        name: "G Total (Vector)",
        key: "g_total",
        expression: "sqrt(([Accel Lateral]*[Accel Lateral])+([Accel Longitudinal]*[Accel Longitudinal]))",
        unit: "G",
        enabled: true,
        scope: "both",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "d04a6011-e4f0-4d4e-bba3-5d803836e121",
        name: "Yaw Gain",
        key: "yaw_gain",
        expression: "[YawRate]/[SteeringWheelAngle]",
        unit: "ratio",
        enabled: true,
        scope: "both",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "d04a6011-e4f0-4d4e-bba3-5d803836e122",
        name: "Longitudinal Slip",
        key: "longitudinal_slip",
        expression: "100*((0.5*([LFspeed]+[RFspeed]))/(0.5*([LRspeed]+[RRspeed]))-1)",
        unit: "%",
        enabled: true,
        scope: "both",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "d04a6011-e4f0-4d4e-bba3-5d803836e123",
        name: "Pedal Overlap Detection",
        key: "pedal_overlap",
        expression: "choose(([Throttle]>2.5)&&([Brake]>2.5),1,0)",
        unit: "flag",
        enabled: true,
        scope: "both",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "d04a6011-e4f0-4d4e-bba3-5d803836e124",
        name: "Inverse Track Curvature",
        key: "inverse_curvature",
        expression: "abs(([Accel Lateral]/([Speed]*[Speed])))",
        unit: "1/m",
        enabled: true,
        scope: "both",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      },
      // Real-time exclusive triggers
      {
        id: "d04a6011-e4f0-4d4e-bba3-5d803836e130",
        name: "WheelLockLF",
        key: "wheellock_lf",
        expression: "choose((([Speed]-[LFspeed])>10)&&([Brake]>20),1,0)",
        unit: "flag",
        enabled: true,
        scope: "both",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "d04a6011-e4f0-4d4e-bba3-5d803836e131",
        name: "WheelLockRF",
        key: "wheellock_rf",
        expression: "choose((([Speed]-[RFspeed])>10&&[Brake]>20),1,0)",
        unit: "flag",
        enabled: true,
        scope: "both",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "d04a6011-e4f0-4d4e-bba3-5d803836e132",
        name: "WheelLockGlobal",
        key: "wheellock_global",
        expression: "choose(([Speed]-[LFspeed]>10)||([Speed]-[RFspeed]>10),1,0)",
        unit: "flag",
        enabled: true,
        scope: "both",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      }
    ]
  }
};
const DEFAULT_CHANNELS = [
  "Speed",
  "Throttle",
  "Brake",
  "RPM",
  "Gear",
  "SteeringWheelAngle",
  "LatAccel",
  "LongAccel"
];
const CHANNEL_COLOR = {
  Speed: "var(--ch-speed)",
  Throttle: "var(--ch-throttle)",
  Brake: "var(--ch-brake)",
  RPM: "var(--ch-rpm)",
  Gear: "var(--ch-gear)",
  SteeringWheelAngle: "var(--ch-steer)",
  LatAccel: "var(--ch-glat)",
  LongAccel: "var(--ch-glong)"
};
function colorForChannel(name) {
  return CHANNEL_COLOR[name] ?? "var(--ch-default)";
}
const useWorkbench = create()(
  persist(
    (set, get) => ({
      parsed: null,
      setParsed: (p) => {
        let bestLap = null;
        if (p && p.laps.length) {
          let bestT = Infinity;
          for (const l of p.laps) {
            const valid = l.endTick - l.startTick > 30 && l.timeS > 5;
            if (valid && l.timeS < bestT) {
              bestT = l.timeS;
              bestLap = l.lap;
            }
          }
          if (bestLap == null) bestLap = p.laps[0].lap;
        }
        const startTick = bestLap != null ? p.laps.find((l) => l.lap === bestLap)?.startTick ?? 0 : 0;
        const activeKey = get().activeWorkspace ?? "lite";
        const config = WORKSPACES[activeKey];
        set(() => ({
          parsed: p,
          cursorTick: startTick,
          selectedChannels: p ? config.defaultChannels.filter((c) => c in p.channels) : [],
          refLap: bestLap,
          cmpLap: null,
          playing: false
        }));
      },
      cursorTick: 0,
      setCursorTick: (t) => set({ cursorTick: t }),
      selectedChannels: [],
      toggleChannel: (name) => set((s) => ({
        selectedChannels: s.selectedChannels.includes(name) ? s.selectedChannels.filter((n) => n !== name) : [...s.selectedChannels, name]
      })),
      setChannels: (names) => set({ selectedChannels: names }),
      refLap: null,
      cmpLap: null,
      setRefLap: (l) => set({ refLap: l }),
      setCmpLap: (l) => set({ cmpLap: l }),
      playing: false,
      speed: 1,
      setPlaying: (p) => set({ playing: p }),
      setSpeed: (s) => set({ speed: s }),
      mapMode: "aligned",
      mapColorBy: "Throttle",
      setMapMode: (m) => set({ mapMode: m }),
      setMapColorBy: (c) => set({ mapColorBy: c }),
      showSectorHeat: false,
      showTrackBands: false,
      showDeviation: false,
      setShowSectorHeat: (v) => set({ showSectorHeat: v }),
      setShowTrackBands: (v) => set({ showTrackBands: v }),
      setShowDeviation: (v) => set({ showDeviation: v }),
      mapThicknessBySpeed: false,
      setMapThicknessBySpeed: (v) => set({ mapThicknessBySpeed: v }),
      llmProvider: "cloud",
      llmBaseUrl: "http://localhost:1234/v1",
      llmModelId: "llama-3-8b-instruct",
      llmApiKey: "",
      setLlmProvider: (provider) => set({ llmProvider: provider }),
      setLlmBaseUrl: (url) => set({ llmBaseUrl: url }),
      setLlmModelId: (id) => set({ llmModelId: id }),
      setLlmApiKey: (key) => set({ llmApiKey: key }),
      elevenLabsApiKey: "",
      elevenLabsVoiceId: "JBFqnCBsd6RMkjVDRZzb",
      setElevenLabsApiKey: (key) => set({ elevenLabsApiKey: key }),
      setElevenLabsVoiceId: (voiceId) => set({ elevenLabsVoiceId: voiceId }),
      audioOutputDeviceId: "",
      setAudioOutputDeviceId: (id) => set({ audioOutputDeviceId: id }),
      micDeviceId: "",
      setMicDeviceId: (id) => set({ micDeviceId: id }),
      liveTrack: "",
      liveCar: "",
      liveConnected: false,
      setLiveContext: (track, car, connected) => set({ liveTrack: track, liveCar: car, liveConnected: connected }),
      pendingLocalBlob: null,
      setPendingLocalBlob: (blob) => set({ pendingLocalBlob: blob }),
      subscriptionPlan: null,
      setSubscriptionPlan: (plan) => set({ subscriptionPlan: plan }),
      mathExpressions: [],
      setMathExpressions: (exprs) => set({ mathExpressions: exprs }),
      activeWorkspace: "lite",
      setActiveWorkspace: (w) => {
        const config = WORKSPACES[w];
        set((s) => ({
          activeWorkspace: w,
          selectedChannels: s.parsed ? config.defaultChannels.filter((c) => c in s.parsed.channels) : config.defaultChannels,
          mathExpressions: config.mathExpressions
        }));
      }
    }),
    {
      name: "pitwall-workbench-storage",
      partialize: (state) => ({
        selectedChannels: state.selectedChannels,
        mapMode: state.mapMode,
        mapColorBy: state.mapColorBy,
        showSectorHeat: state.showSectorHeat,
        showTrackBands: state.showTrackBands,
        showDeviation: state.showDeviation,
        mapThicknessBySpeed: state.mapThicknessBySpeed,
        llmProvider: state.llmProvider,
        llmBaseUrl: state.llmBaseUrl,
        llmModelId: state.llmModelId,
        llmApiKey: state.llmApiKey,
        elevenLabsApiKey: state.elevenLabsApiKey,
        elevenLabsVoiceId: state.elevenLabsVoiceId,
        audioOutputDeviceId: state.audioOutputDeviceId,
        micDeviceId: state.micDeviceId,
        mathExpressions: state.mathExpressions,
        activeWorkspace: state.activeWorkspace
      })
    }
  )
);
function LiveBridgeSync({ t }) {
  const setLiveContext = useWorkbench((s) => s.setLiveContext);
  useEffect(() => {
    setLiveContext(t.track, t.car, t.connected);
  }, [t.track, t.car, t.connected, setLiveContext]);
  return null;
}
const upsertMyGearRatios = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({
  car: z.string().min(1).max(255),
  ratios: z.record(z.string(), z.object({
    ratio: z.number(),
    samples: z.number()
  }))
}).parse(input)).handler(createSsrRpc("a9e884129245c896049675548db8c3263324534e7707c6a14a71b0ac924c5ec7"));
createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({
  car: z.string().min(1).max(255)
}).parse(input)).handler(createSsrRpc("9e832443bf68dc1afd0906f77686b1ea8872ad09afcaa177d4f399a63b42e66a"));
const publishMyGearRatios = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({
  car: z.string().min(1).max(255),
  name: z.string().max(120).optional(),
  published: z.boolean()
}).parse(input)).handler(createSsrRpc("27806ff807d7d8480171f4973109eb2bb2f01480e1fd2c4c7d3e9b351a157d43"));
const listCommunityGearRatios = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({
  car: z.string().min(1).max(255).optional()
}).parse(input)).handler(createSsrRpc("a933f1c90db2b411b6f804ed4c984c6e101ca06daaf62450a1ddebca103ad19a"));
const ChannelLayoutSchema = z.object({
  visible: z.array(z.string().max(120)).max(300),
  modeByKey: z.record(z.string().max(120), z.enum(["raw", "trace"])).optional(),
  mathExpressions: z.array(MathExpressionSchema).max(100).optional()
});
const upsertMyChannelLayout = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({
  name: z.string().min(1).max(120),
  layout: ChannelLayoutSchema
}).parse(input)).handler(createSsrRpc("31bb52f01c1ca777a07f8b7d28b2d3eef0780ba57d6cb939fb6db52d68d3d10b"));
createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({
  name: z.string().min(1).max(120).default("default")
}).parse(input)).handler(createSsrRpc("16e5998c5e349d45bf571ca307d98918f10fe195c5b6005d6285c65d7e7dfa88"));
const publishMyChannelLayout = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({
  name: z.string().min(1).max(120),
  published: z.boolean()
}).parse(input)).handler(createSsrRpc("a0267f99ea641dee7a11ee872b71ff1a19869f78cae83bc19cef292565f399f7"));
const listCommunityChannelLayouts = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("21b7d4b9cd49310bbcedb32d65588f95c68176ba57a09f7d1beaef4723ebb413"));
createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({
  car: z.string().min(1).max(255),
  car_class: z.string().min(1).max(64),
  confidence: z.number().min(0).max(1).optional(),
  published: z.boolean().optional()
}).parse(input)).handler(createSsrRpc("86e46adc000ddd68d04e26f71b110afe4b4522c393e8871abd429fcbd9f4e008"));
createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({
  car: z.string().min(1).max(255).optional()
}).parse(input)).handler(createSsrRpc("68ae1d118973fcae6b72b9ffb357a8b7cf6c764622416c26643e0fa0ac5e4749"));
const VoteKind = z.enum(["gear_ratios", "channel_layout", "car_class"]);
const voteCommunityItem = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({
  target_id: z.string().uuid(),
  kind: VoteKind
}).parse(input)).handler(createSsrRpc("7a7081d7243c130f1807d297517e861177ea1df81e921aee7d538e61ccc05ea0"));
const syncDesktopLaps = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({
  laps: z.array(z.object({
    ts: z.number(),
    car: z.string().max(255).optional().nullable(),
    track: z.string().max(255).optional().nullable(),
    lapTimeS: z.number().positive(),
    fuel: z.number().optional().nullable(),
    sof: z.number().optional().nullable()
  })).min(1).max(500)
}).parse(input)).handler(createSsrRpc("abbba3ff862cf55481069f2003803c513de3794ce64b16ed9b1201afed0c3569"));
const BRIDGE_BASE = "http://localhost:3001";
const SYNCED_KEY = "pitwall.lapsync.synced.v1";
function loadSynced() {
  try {
    return new Set(JSON.parse(localStorage.getItem(SYNCED_KEY) || "[]"));
  } catch {
    return /* @__PURE__ */ new Set();
  }
}
function saveSynced(s) {
  try {
    localStorage.setItem(SYNCED_KEY, JSON.stringify(Array.from(s).slice(-2e3)));
  } catch {
  }
}
function DesktopLapSync() {
  const sync = useServerFn(syncDesktopLaps);
  const [status, setStatus] = useState("idle");
  const [total, setTotal] = useState(0);
  useEffect(() => {
    let stop = false;
    const tick = async () => {
      try {
        const res = await fetch(`${BRIDGE_BASE}/api/laps?limit=500`, { cache: "no-store" });
        if (!res.ok) return;
        const body = await res.json();
        const synced = loadSynced();
        const fresh = body.laps.filter(
          (l) => l.ts && !synced.has(l.ts) && l.lapTimeS && l.lapTimeS > 0 && l.car && l.track
        );
        if (fresh.length === 0) {
          setStatus(`cached ${body.laps.length} · synced ${synced.size}`);
          setTotal(body.laps.length);
          return;
        }
        setStatus(`syncing ${fresh.length}…`);
        const out = await sync({
          data: {
            laps: fresh.map((l) => ({
              ts: l.ts,
              car: l.car ?? null,
              track: l.track ?? null,
              lapTimeS: l.lapTimeS,
              fuel: l.fuel ?? null,
              sof: l.sof ?? null
            }))
          }
        });
        if ("accepted" in out) {
          for (const ts of out.accepted) synced.add(ts);
          saveSynced(synced);
          fetch(`${BRIDGE_BASE}/api/laps/mark-synced`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ timestamps: out.accepted })
          }).catch(() => {
          });
          setStatus(`synced ${out.inserted} · total ${synced.size}`);
        }
      } catch {
        if (!stop) setStatus("bridge offline");
      }
    };
    tick();
    const id = setInterval(tick, 6e4);
    return () => {
      stop = true;
      clearInterval(id);
    };
  }, [sync]);
  return /* @__PURE__ */ jsxs("div", { className: "rounded-sm border border-border bg-background px-2 py-1.5 text-[10px]", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsx("span", { className: "uppercase tracking-[0.18em] text-muted-foreground", children: "Desktop Lap Sync" }),
      /* @__PURE__ */ jsx("span", { className: "text-muted-foreground tabular-nums", children: status })
    ] }),
    total > 0 && /* @__PURE__ */ jsx("div", { className: "mt-0.5 text-[9px] text-muted-foreground", children: "Local laps from ~/.pitwall/laps.jsonl are pushed to Cloud every 60s." })
  ] });
}
const HELP_SEEN_KEY = "pit-wall:help-seen-v1";
const steps = [
  {
    id: "welcome",
    icon: /* @__PURE__ */ jsx(Gauge, { className: "h-6 w-6" }),
    label: "Welcome",
    title: "Welcome to Pit Wall",
    subtitle: "Your complete iRacing telemetry companion",
    content: /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("p", { className: "text-muted-foreground leading-relaxed", children: [
        "Pit Wall is a ",
        /* @__PURE__ */ jsx("strong", { className: "text-foreground", children: "three-in-one" }),
        " iRacing companion built for serious drivers. It combines a live in-session dashboard, a deep lap analysis workbench, and an AI-powered race engineer into one seamless tool."
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-3 sm:grid-cols-3", children: [
        {
          icon: /* @__PURE__ */ jsx(Wifi, { className: "h-4 w-4 text-racing-cyan" }),
          label: "Live Bridge",
          desc: "Real-time telemetry while you're on track"
        },
        {
          icon: /* @__PURE__ */ jsx(LineChart, { className: "h-4 w-4 text-racing-green" }),
          label: "Lap Workbench",
          desc: "Deep analysis of saved .ibt / .pwlap files"
        },
        {
          icon: /* @__PURE__ */ jsx(Brain, { className: "h-4 w-4 text-racing-orange" }),
          label: "AI Coach",
          desc: "Radio calls and setup advice after every lap"
        }
      ].map((item) => /* @__PURE__ */ jsxs(
        "div",
        {
          className: "rounded-lg border border-border bg-rail p-3 space-y-1.5",
          children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              item.icon,
              /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold uppercase tracking-wider", children: item.label })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: item.desc })
          ]
        },
        item.label
      )) }),
      /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground border border-border/50 rounded-md px-3 py-2 bg-rail/50", children: [
        "💡 This guide takes about 2 minutes. You can re-open it anytime with the",
        " ",
        /* @__PURE__ */ jsx("strong", { className: "text-foreground", children: "?" }),
        " button in the top-right corner."
      ] })
    ] })
  },
  {
    id: "bridge",
    icon: /* @__PURE__ */ jsx(Wifi, { className: "h-6 w-6" }),
    label: "Live Bridge",
    title: "Step 1 — Connect the Live Bridge",
    subtitle: "Launch the telemetry service with one click",
    content: /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("p", { className: "text-muted-foreground leading-relaxed", children: [
        "iRacing exposes live telemetry via a Windows Shared Memory API. The",
        " ",
        /* @__PURE__ */ jsx("strong", { className: "text-foreground", children: "Pit Wall Bridge" }),
        " is a small Node.js app that reads that memory and broadcasts it over WebSocket to your browser. You can launch it with one click!"
      ] }),
      /* @__PURE__ */ jsx("div", { className: "space-y-2", children: [
        {
          n: 1,
          icon: /* @__PURE__ */ jsx(Zap, { className: "h-3.5 w-3.5 text-racing-orange" }),
          title: "Run Local Bridge",
          desc: 'Click the "Run Local Bridge" button on the live page. The app automatically spawns the background service.'
        },
        {
          n: 2,
          icon: /* @__PURE__ */ jsx(Wifi, { className: "h-3.5 w-3.5 text-primary" }),
          title: "Establish Connection",
          desc: "The bridge status in the dashboard will change from stopped to active instantly."
        },
        {
          n: 3,
          icon: /* @__PURE__ */ jsx(Gauge, { className: "h-3.5 w-3.5 text-racing-green" }),
          title: "Stream Live",
          desc: "Launch iRacing, get in a car, and telemetry will stream immediately."
        }
      ].map((s) => /* @__PURE__ */ jsxs(
        "div",
        {
          className: "flex items-start gap-3 rounded-md border border-border bg-rail p-3",
          children: [
            /* @__PURE__ */ jsx("span", { className: "flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-mono text-primary-foreground", children: s.n }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 text-xs font-semibold", children: [
                s.icon,
                s.title
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: s.desc })
            ] })
          ]
        },
        s.n
      )) })
    ] }),
    ctaLabel: "Open Live Dashboard",
    ctaTo: "/live"
  },
  {
    id: "live",
    icon: /* @__PURE__ */ jsx(Gauge, { className: "h-6 w-6" }),
    label: "Live Dashboard",
    title: "Step 2 — The Live Dashboard",
    subtitle: "Real-time data while you're driving",
    content: /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("p", { className: "text-muted-foreground leading-relaxed", children: [
        "Once the bridge is running and you're on track, the",
        " ",
        /* @__PURE__ */ jsx("strong", { className: "text-foreground", children: "/live" }),
        " dashboard streams 60Hz telemetry from iRacing directly to your browser. No API keys, no cloud, no latency."
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-2 text-xs", children: [
        { label: "Delta to PB", desc: "Green = gaining, Red = losing time" },
        { label: "Lap Times", desc: "Current + personal best with sector splits" },
        { label: "Tire Temps", desc: "Four corners, colour-coded by temperature" },
        { label: "G-Force", desc: "Live lateral & longitudinal G display" },
        { label: "Fuel Calculator", desc: "Laps remaining based on burn rate" },
        { label: "AI Radio", desc: "Coach speaks after every completed lap" }
      ].map((f) => /* @__PURE__ */ jsxs("div", { className: "rounded border border-border bg-rail px-2.5 py-2", children: [
        /* @__PURE__ */ jsx("div", { className: "font-semibold text-foreground", children: f.label }),
        /* @__PURE__ */ jsx("div", { className: "text-muted-foreground mt-0.5", children: f.desc })
      ] }, f.label)) }),
      /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
        /* @__PURE__ */ jsx("strong", { className: "text-foreground", children: "Recording:" }),
        " Hit the red dot button to record a session as a ",
        /* @__PURE__ */ jsx("code", { className: "text-xs bg-rail px-1 rounded", children: ".pwlap" }),
        " file. When you save it, it opens instantly in the Workbench — no upload wait time."
      ] })
    ] }),
    ctaLabel: "Open Live Dashboard",
    ctaTo: "/live"
  },
  {
    id: "workbench",
    icon: /* @__PURE__ */ jsx(LineChart, { className: "h-6 w-6" }),
    label: "Lap Workbench",
    title: "Step 3 — The Lap Workbench",
    subtitle: "MoTeC-style deep analysis of every lap",
    content: /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("p", { className: "text-muted-foreground leading-relaxed", children: [
        "Load any ",
        /* @__PURE__ */ jsx("code", { className: "text-xs bg-rail px-1 rounded", children: ".ibt" }),
        " or",
        " ",
        /* @__PURE__ */ jsx("code", { className: "text-xs bg-rail px-1 rounded", children: ".pwlap" }),
        " file into the",
        " ",
        /* @__PURE__ */ jsx("strong", { className: "text-foreground", children: "Workbench" }),
        " for a full MoTeC-style breakdown. No subscription required — it all runs locally in your browser."
      ] }),
      /* @__PURE__ */ jsx("div", { className: "space-y-2 text-xs", children: [
        {
          icon: /* @__PURE__ */ jsx(LineChart, { className: "h-3 w-3 text-primary" }),
          label: "Stacked Traces",
          desc: "Overlay throttle, brake, steer, speed and any other channel across laps"
        },
        {
          icon: /* @__PURE__ */ jsx(Zap, { className: "h-3 w-3 text-racing-orange" }),
          label: "Sector Analysis",
          desc: "Identify exactly which corner is costing you the most time"
        },
        {
          icon: /* @__PURE__ */ jsx(Brain, { className: "h-3 w-3 text-racing-cyan" }),
          label: "AI Coach Report",
          desc: "GPT-powered post-session coaching based on your telemetry profile"
        },
        {
          icon: /* @__PURE__ */ jsx(FolderOpen, { className: "h-3 w-3 text-racing-green" }),
          label: "Session Library",
          desc: "All your sessions in one place — filter by track, car, or date"
        }
      ].map((f) => /* @__PURE__ */ jsxs(
        "div",
        {
          className: "flex items-start gap-2 rounded border border-border bg-rail px-2.5 py-2",
          children: [
            /* @__PURE__ */ jsx("span", { className: "mt-0.5 shrink-0", children: f.icon }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("span", { className: "font-semibold text-foreground", children: f.label }),
              /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground", children: [
                " — ",
                f.desc
              ] })
            ] })
          ]
        },
        f.label
      )) }),
      /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
        "🔑 ",
        /* @__PURE__ */ jsx("strong", { className: "text-foreground", children: "Tip:" }),
        " Don't have an iRacing .ibt file? Use the Lab to upload one directly from disk without needing to log in."
      ] })
    ] }),
    ctaLabel: "Open Lab",
    ctaTo: "/lab/lapfile"
  },
  {
    id: "sessions",
    icon: /* @__PURE__ */ jsx(FolderOpen, { className: "h-6 w-6" }),
    label: "Session Library",
    title: "Step 4 — Your Session Library",
    subtitle: "All your sessions in one place",
    content: /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("p", { className: "text-muted-foreground leading-relaxed", children: [
        "Every session you record on track or upload from disk gets saved to your",
        " ",
        /* @__PURE__ */ jsx("strong", { className: "text-foreground", children: "Session Library" }),
        ". Sign in with your account to sync data to the cloud, or — if you've installed MongoDB locally — everything stores on your own machine."
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-2 text-xs", children: [
        { label: "Track filtering", desc: "Jump straight to Silverstone, Monza or any track" },
        { label: "Car filtering", desc: "Compare performance across different car classes" },
        { label: "Best lap history", desc: "See your all-time PB and trend over time" },
        { label: "Shareable links", desc: "Share a specific lap to a link for teammates" }
      ].map((f) => /* @__PURE__ */ jsxs("div", { className: "rounded border border-border bg-rail px-2.5 py-2", children: [
        /* @__PURE__ */ jsx("div", { className: "font-semibold text-foreground", children: f.label }),
        /* @__PURE__ */ jsx("div", { className: "text-muted-foreground mt-0.5", children: f.desc })
      ] }, f.label)) }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2 rounded-md border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-xs text-emerald-400", children: [
        /* @__PURE__ */ jsx(Database, { className: "h-3.5 w-3.5 mt-0.5 shrink-0" }),
        /* @__PURE__ */ jsxs("span", { children: [
          /* @__PURE__ */ jsx("strong", { children: "Local-First Active:" }),
          ` Select the "Continue as Local Developer" option. Telemetry records write instantly to your local MongoDB, and file binaries are cached locally in your browser's IndexedDB.`
        ] })
      ] })
    ] }),
    ctaLabel: "View Sessions",
    ctaTo: "/sessions"
  },
  {
    id: "ai",
    icon: /* @__PURE__ */ jsx(Brain, { className: "h-6 w-6" }),
    label: "AI Coach",
    title: "Step 5 — The AI Race Engineer",
    subtitle: "GPT-powered coaching after every lap",
    content: /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("p", { className: "text-muted-foreground leading-relaxed", children: [
        "The ",
        /* @__PURE__ */ jsx("strong", { className: "text-foreground", children: "AI Coach" }),
        " listens to each completed lap and gives you a radio call — just like a real race engineer. It decides the",
        " ",
        /* @__PURE__ */ jsx("em", { className: "text-foreground", children: "tone" }),
        " based on your performance:",
        " ",
        /* @__PURE__ */ jsx("span", { className: "text-racing-green font-semibold", children: "PUSH" }),
        ",",
        " ",
        /* @__PURE__ */ jsx("span", { className: "text-racing-orange font-semibold", children: "HOLD" }),
        ", or",
        " ",
        /* @__PURE__ */ jsx("span", { className: "text-red-400 font-semibold", children: "WARN" }),
        "."
      ] }),
      /* @__PURE__ */ jsx("div", { className: "space-y-2 text-xs", children: [
        {
          tone: "PUSH",
          color: "text-racing-green border-racing-green/30 bg-racing-green/5",
          desc: "You're in the zone, personal best incoming. Keep the pressure on."
        },
        {
          tone: "HOLD",
          color: "text-racing-orange border-racing-orange/30 bg-racing-orange/5",
          desc: "Consistent but not setting records. Focus on a specific sector."
        },
        {
          tone: "WARN",
          color: "text-red-400 border-red-400/30 bg-red-400/5",
          desc: "Tire temps critical, fuel low, or braking instability detected."
        }
      ].map((t) => /* @__PURE__ */ jsxs("div", { className: `rounded border px-3 py-2 ${t.color}`, children: [
        /* @__PURE__ */ jsx("span", { className: "font-bold font-mono", children: t.tone }),
        /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground", children: [
          " — ",
          t.desc
        ] })
      ] }, t.tone)) }),
      /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground space-y-1", children: [
        /* @__PURE__ */ jsxs("p", { children: [
          "⚙️ ",
          /* @__PURE__ */ jsx("strong", { className: "text-foreground", children: "Settings → AI Provider" }),
          " to switch between cloud GPT-4o and a local LLM (Ollama, LM Studio, etc.)."
        ] }),
        /* @__PURE__ */ jsx("p", { children: "🔇 Auto-speak mode reads the call out loud via TTS — toggle it per-session on the live dashboard." })
      ] })
    ] }),
    ctaLabel: "Open Live Dashboard",
    ctaTo: "/live"
  },
  {
    id: "done",
    icon: /* @__PURE__ */ jsx(CheckCircle2, { className: "h-6 w-6" }),
    label: "You're ready",
    title: "You're all set!",
    subtitle: "Here's where to go next",
    content: /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground leading-relaxed", children: "Pit Wall is ready to use. Pick the path that suits you right now:" }),
      /* @__PURE__ */ jsx("div", { className: "space-y-2", children: [
        {
          icon: /* @__PURE__ */ jsx(Wifi, { className: "h-4 w-4 text-racing-cyan" }),
          label: "I want live telemetry while driving",
          to: "/live",
          btn: "Open Live Dashboard"
        },
        {
          icon: /* @__PURE__ */ jsx(LineChart, { className: "h-4 w-4 text-racing-green" }),
          label: "I have a .ibt file I want to analyse",
          to: "/lab/lapfile",
          btn: "Open the Lab"
        },
        {
          icon: /* @__PURE__ */ jsx(FolderOpen, { className: "h-4 w-4 text-primary" }),
          label: "I want to browse saved sessions",
          to: "/sessions",
          btn: "Session Library"
        },
        {
          icon: /* @__PURE__ */ jsx(Settings, { className: "h-4 w-4 text-muted-foreground" }),
          label: "I want to configure AI and local DB",
          to: "/settings",
          btn: "Settings"
        }
      ].map((item) => /* @__PURE__ */ jsxs(
        Link,
        {
          to: item.to,
          className: "flex items-center justify-between rounded-lg border border-border bg-rail px-4 py-3 text-sm hover:bg-accent transition-colors group",
          children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
              item.icon,
              /* @__PURE__ */ jsx("span", { className: "text-foreground", children: item.label })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 text-xs text-muted-foreground group-hover:text-primary transition-colors", children: [
              item.btn,
              /* @__PURE__ */ jsx(ChevronRight, { className: "h-3.5 w-3.5" })
            ] })
          ]
        },
        item.to
      )) }),
      /* @__PURE__ */ jsxs("p", { className: "text-xs text-center text-muted-foreground", children: [
        "Remember: hit the ",
        /* @__PURE__ */ jsx("strong", { className: "text-foreground", children: "?" }),
        " button in the top-right corner anytime to re-open this guide."
      ] })
    ] })
  }
];
function HelpSystem() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  useEffect(() => {
    const seen = localStorage.getItem(HELP_SEEN_KEY);
    if (!seen) {
      const t = setTimeout(() => setOpen(true), 800);
      return () => clearTimeout(t);
    }
  }, []);
  const close = useCallback(() => {
    localStorage.setItem(HELP_SEEN_KEY, "1");
    setOpen(false);
    setStep(0);
  }, []);
  const current = steps[step];
  const isFirst = step === 0;
  const isLast = step === steps.length - 1;
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      "button",
      {
        id: "help-trigger",
        onClick: () => {
          setStep(0);
          setOpen(true);
        },
        className: "fixed bottom-4 right-4 z-40 flex h-9 w-9 items-center justify-center rounded-full bg-panel border border-border text-muted-foreground shadow-lg hover:text-primary hover:border-primary/50 transition-all hover:scale-110",
        "aria-label": "Open help guide",
        title: "Help & Getting Started",
        children: /* @__PURE__ */ jsx(HelpCircle, { className: "h-4 w-4" })
      }
    ),
    open && /* @__PURE__ */ jsx(
      "div",
      {
        className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200",
        onClick: (e) => {
          if (e.target === e.currentTarget) close();
        },
        children: /* @__PURE__ */ jsxs("div", { className: "relative w-full max-w-2xl rounded-xl border border-border bg-background shadow-2xl flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-4 duration-300", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-6 py-4 border-b border-border shrink-0", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsx("div", { className: "flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary", children: current.icon }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("div", { className: "text-sm font-semibold text-foreground", children: current.title }),
                /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: current.subtitle })
              ] })
            ] }),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: close,
                className: "flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-rail transition-colors",
                "aria-label": "Close help",
                children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" })
              }
            )
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex h-1 w-full shrink-0", children: steps.map((s, i) => /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setStep(i),
              className: `flex-1 transition-colors ${i <= step ? "bg-primary" : "bg-rail"} ${i === 0 ? "" : "ml-px"}`,
              "aria-label": `Go to step: ${s.label}`
            },
            s.id
          )) }),
          /* @__PURE__ */ jsx("div", { className: "flex items-center gap-1.5 px-6 pt-4 pb-1 shrink-0 overflow-x-auto", children: steps.map((s, i) => /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setStep(i),
              className: `flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider transition-all whitespace-nowrap ${i === step ? "bg-primary/10 text-primary border border-primary/30" : i < step ? "text-muted-foreground/80" : "text-muted-foreground/40"}`,
              children: [
                i < step ? /* @__PURE__ */ jsx(CheckCircle2, { className: "h-2.5 w-2.5" }) : i === step ? /* @__PURE__ */ jsx(Circle, { className: "h-2.5 w-2.5 fill-primary text-primary" }) : /* @__PURE__ */ jsx(Circle, { className: "h-2.5 w-2.5" }),
                s.label
              ]
            },
            s.id
          )) }),
          /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-y-auto px-6 py-4", children: current.content }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-6 py-4 border-t border-border shrink-0", children: [
            /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => setStep((s) => Math.max(0, s - 1)),
                disabled: isFirst,
                className: "flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors",
                children: [
                  /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }),
                  "Back"
                ]
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              current.ctaLabel && current.ctaTo && (current.ctaTo.startsWith("/downloads/") || current.ctaTo.includes(".") ? /* @__PURE__ */ jsxs(
                "a",
                {
                  href: current.ctaTo,
                  download: true,
                  onClick: close,
                  className: "flex items-center gap-1.5 rounded-md border border-border bg-rail px-3 py-1.5 text-xs hover:bg-accent transition-colors",
                  children: [
                    current.ctaLabel,
                    /* @__PURE__ */ jsx(ArrowRight, { className: "h-3 w-3" })
                  ]
                }
              ) : /* @__PURE__ */ jsxs(
                Link,
                {
                  to: current.ctaTo,
                  onClick: close,
                  className: "flex items-center gap-1.5 rounded-md border border-border bg-rail px-3 py-1.5 text-xs hover:bg-accent transition-colors",
                  children: [
                    current.ctaLabel,
                    /* @__PURE__ */ jsx(ArrowRight, { className: "h-3 w-3" })
                  ]
                }
              )),
              isLast ? /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: close,
                  className: "flex items-center gap-1.5 rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity",
                  children: [
                    /* @__PURE__ */ jsx(CheckCircle2, { className: "h-3.5 w-3.5" }),
                    "Let's go!"
                  ]
                }
              ) : /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: () => setStep((s) => Math.min(steps.length - 1, s + 1)),
                  className: "flex items-center gap-1.5 rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity",
                  children: [
                    "Next",
                    /* @__PURE__ */ jsx(ArrowRight, { className: "h-3.5 w-3.5" })
                  ]
                }
              )
            ] })
          ] })
        ] })
      }
    )
  ] });
}
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
const Dialog = DialogPrimitive.Root;
const DialogPortal = DialogPrimitive.Portal;
const DialogOverlay = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  DialogPrimitive.Overlay,
  {
    ref,
    className: cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    ),
    ...props
  }
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;
const DialogContent = React.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs(DialogPortal, { children: [
  /* @__PURE__ */ jsx(DialogOverlay, {}),
  /* @__PURE__ */ jsxs(
    DialogPrimitive.Content,
    {
      ref,
      className: cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg",
        className
      ),
      ...props,
      children: [
        children,
        /* @__PURE__ */ jsxs(DialogPrimitive.Close, { className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background cursor-pointer transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground", children: [
          /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Close" })
        ] })
      ]
    }
  )
] }));
DialogContent.displayName = DialogPrimitive.Content.displayName;
const DialogHeader = ({ className, ...props }) => /* @__PURE__ */ jsx("div", { className: cn("flex flex-col space-y-1.5 text-center sm:text-left", className), ...props });
DialogHeader.displayName = "DialogHeader";
const DialogTitle = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  DialogPrimitive.Title,
  {
    ref,
    className: cn("text-lg font-semibold leading-none tracking-tight", className),
    ...props
  }
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;
const DialogDescription = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  DialogPrimitive.Description,
  {
    ref,
    className: cn("text-sm text-muted-foreground", className),
    ...props
  }
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;
function isTypingTarget(el) {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable;
}
function KeyboardShortcuts() {
  const router2 = useRouter();
  const { pathname } = useLocation();
  const canGoBack = useCanGoBack();
  const [open, setOpen] = useState(false);
  const pendingG = useRef(false);
  const gTimer = useRef(null);
  const goBackOrHome = useCallback(() => {
    if (pathname === "/") return;
    if (canGoBack) router2.history.back();
    else router2.navigate({ to: "/" });
  }, [canGoBack, pathname, router2]);
  useEffect(() => {
    const onKeyDown = (e) => {
      if (isTypingTarget(e.target)) return;
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey) {
        if (e.key === "1") {
          e.preventDefault();
          router2.navigate({ to: "/" });
          return;
        }
        if (e.key === "2") {
          e.preventDefault();
          router2.navigate({ to: "/live" });
          return;
        }
        if (e.key === "3") {
          e.preventDefault();
          router2.navigate({ to: "/sessions" });
          return;
        }
        if (e.key === "4") {
          e.preventDefault();
          router2.navigate({ to: "/ai-engineer" });
          return;
        }
      }
      if (e.key === "?" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        setOpen(true);
        return;
      }
      if (e.key === "Escape") {
        if (open) {
          setOpen(false);
          return;
        }
        e.preventDefault();
        goBackOrHome();
        return;
      }
      if (e.key === "g" || e.key === "G") {
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        pendingG.current = true;
        if (gTimer.current) clearTimeout(gTimer.current);
        gTimer.current = setTimeout(() => {
          pendingG.current = false;
        }, 800);
        return;
      }
      if (pendingG.current && (e.key === "h" || e.key === "H")) {
        e.preventDefault();
        pendingG.current = false;
        if (gTimer.current) clearTimeout(gTimer.current);
        router2.navigate({ to: "/" });
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      if (gTimer.current) clearTimeout(gTimer.current);
    };
  }, [goBackOrHome, open, router2]);
  return /* @__PURE__ */ jsx(Dialog, { open, onOpenChange: setOpen, children: /* @__PURE__ */ jsxs(DialogContent, { className: "max-w-md font-mono text-sm bg-panel border border-border text-foreground", children: [
    /* @__PURE__ */ jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsx(DialogTitle, { className: "font-mono text-xs uppercase tracking-wider text-primary", children: "Workstation Shortcuts" }),
      /* @__PURE__ */ jsx(DialogDescription, { className: "text-xs text-muted-foreground", children: "Fast keyboard-first controls. Disabled while typing in text inputs." })
    ] }),
    /* @__PURE__ */ jsxs("ul", { className: "space-y-2 text-[11px] uppercase", children: [
      /* @__PURE__ */ jsx(Shortcut, { keys: ["Ctrl", "1"], desc: "Launcher Landing Page" }),
      /* @__PURE__ */ jsx(Shortcut, { keys: ["Ctrl", "2"], desc: "Live Telemetry Command" }),
      /* @__PURE__ */ jsx(Shortcut, { keys: ["Ctrl", "3"], desc: "Analysis Workbench" }),
      /* @__PURE__ */ jsx(Shortcut, { keys: ["Ctrl", "4"], desc: "AI Engineer Terminal" }),
      /* @__PURE__ */ jsx(Shortcut, { keys: ["Ctrl", ","], desc: "System Settings dialog" }),
      /* @__PURE__ */ jsx(Shortcut, { keys: ["Esc"], desc: "Go back / Exit panel" }),
      /* @__PURE__ */ jsx(Shortcut, { keys: ["?"], desc: "Open this helper card" })
    ] })
  ] }) });
}
function Shortcut({ keys, desc }) {
  return /* @__PURE__ */ jsxs("li", { className: "flex items-center justify-between gap-4", children: [
    /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: desc }),
    /* @__PURE__ */ jsx("span", { className: "flex shrink-0 gap-1", children: keys.map((k) => /* @__PURE__ */ jsx(
      "kbd",
      {
        className: "rounded border border-border bg-rail px-1.5 py-0.5 text-[10px] uppercase text-foreground",
        children: k
      },
      k
    )) })
  ] });
}
const Tabs = TabsPrimitive.Root;
const TabsList = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  TabsPrimitive.List,
  {
    ref,
    className: cn(
      "inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
      className
    ),
    ...props
  }
));
TabsList.displayName = TabsPrimitive.List.displayName;
const TabsTrigger = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  TabsPrimitive.Trigger,
  {
    ref,
    className: cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow",
      className
    ),
    ...props
  }
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;
const TabsContent = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  TabsPrimitive.Content,
  {
    ref,
    className: cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    ),
    ...props
  }
));
TabsContent.displayName = TabsPrimitive.Content.displayName;
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return /* @__PURE__ */ jsx(Comp, { className: cn(buttonVariants({ variant, size, className })), ref, ...props });
  }
);
Button.displayName = "Button";
const Input = React.forwardRef(
  ({ className, type, ...props }, ref) => {
    return /* @__PURE__ */ jsx(
      "input",
      {
        type,
        className: cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        ),
        ref,
        ...props
      }
    );
  }
);
Input.displayName = "Input";
function localAdvisorFallback(payload) {
  const tips = [];
  const laps = payload.laps;
  const avgBrake = laps.reduce((a, l) => a + l.maxBrakePct, 0) / Math.max(1, laps.length);
  const avgThr = laps.reduce((a, l) => a + l.maxThrottlePct, 0) / Math.max(1, laps.length);
  const avgLat = laps.reduce((a, l) => a + l.peakLatG, 0) / Math.max(1, laps.length);
  const times = laps.map((l) => l.lapTimeS).filter((s) => s > 0);
  const spread = times.length ? Math.max(...times) - Math.min(...times) : 0;
  if (payload.mode === "style") {
    if (avgBrake < 85) {
      tips.push({
        priority: "high",
        area: "Trail braking",
        tip: "Push peak brake pressure up — work toward 90-100% in the threshold phase, then bleed off as you turn in.",
        reason: `Average peak brake across recent laps is only ${avgBrake.toFixed(0)}%, leaving stopping power on the table.`
      });
    }
    if (avgThr < 97) {
      tips.push({
        priority: "medium",
        area: "Throttle application",
        tip: "Commit fully to throttle once the wheel starts unwinding — don't roll on past 90%.",
        reason: `Peak throttle averages ${avgThr.toFixed(0)}% — partial-load cruising costs straight-line speed.`
      });
    }
    if (spread > 0.6) {
      tips.push({
        priority: "high",
        area: "Consistency",
        tip: "Lock in a repeatable reference for braking points before chasing more speed.",
        reason: `Lap-time spread across the last ${laps.length} laps is ${spread.toFixed(2)}s — too noisy to extract setup signal.`
      });
    }
    tips.push({
      priority: "low",
      area: "Mid-corner balance",
      tip: "Hold steady minimum speed through the apex — measured at the limit it's faster than V-shaped lines.",
      reason: `Peak lateral g averages ${avgLat.toFixed(2)} — try to sustain that for longer rather than spiking it briefly.`
    });
  } else {
    const sym = payload.symptoms ?? [];
    const oval = payload.trackType === "oval";
    const sec = (road, ovalSec) => oval ? ovalSec : road;
    if (sym.includes("understeer_entry") || sym.includes("understeer_apex") || sym.includes("understeer_exit")) {
      tips.push({
        priority: "high",
        area: "Understeer — top-of-chart fix",
        tip: oval ? "Soften front ARB by 1 click (or stiffen rear ARB by 1)." : "Soften front ARB by 1 click (or stiffen rear ARB by 1).",
        reason: "Driver reports understeer — start with the highest-impact lever from the flowchart.",
        citation: sec("Road — General Understeer #1 (ARB)", "Oval — Push #1 (ARB)")
      });
    }
    if (sym.includes("oversteer_entry") || sym.includes("oversteer_apex") || sym.includes("oversteer_exit") || sym.includes("snap_oversteer")) {
      tips.push({
        priority: "high",
        area: "Oversteer — top-of-chart fix",
        tip: "Stiffen front ARB by 1 click (or soften rear ARB by 1).",
        reason: "Driver reports oversteer — apply the highest-impact lever from the flowchart first.",
        citation: sec("Road — General Oversteer #1 (ARB)", "Oval — Loose #1 (ARB)")
      });
    }
    if (sym.includes("brake_lockup_front")) {
      tips.push({
        priority: "high",
        area: "Brake bias",
        tip: `Move brake bias rearward by 0.5-1.0% (currently ${payload.setup.brakeBias.toFixed(1)}%).`,
        reason: "Fronts locking under braking — shift load to the rears.",
        citation: "eBook: Front-vs-Rear Temp Imbalance / Brake Bias"
      });
    }
    if (sym.includes("brake_lockup_rear")) {
      tips.push({
        priority: "high",
        area: "Brake bias",
        tip: `Move brake bias forward by 0.5-1.0% (currently ${payload.setup.brakeBias.toFixed(1)}%).`,
        reason: "Rears locking under braking — shift load to the fronts.",
        citation: "eBook: Front-vs-Rear Temp Imbalance / Brake Bias"
      });
    }
    if (sym.includes("poor_traction_exit")) {
      tips.push({
        priority: "medium",
        area: "Diff / rear compression",
        tip: "Reduce diff power-lock by 1 click, OR soften rear compression by 1 click.",
        reason: "Poor exit traction — let the rear axle settle and find grip on power.",
        citation: "eBook: Diff Rules + Damper Rules"
      });
    }
    if (sym.includes("bouncy_over_curbs")) {
      tips.push({
        priority: "low",
        area: "Fast dampers",
        tip: "Soften fast compression 1 click to soak the curb, then add 1 click of fast rebound if it bounces back.",
        reason: "Driver reports kerb-bounce — this is a fast-damper issue, not a balance one.",
        citation: "eBook: Damper Rules (fast bump/rebound)"
      });
    }
    const frontHot = sym.includes("tyres_overheating_front") || payload.tires.fl.tempC + payload.tires.fr.tempC > payload.tires.rl.tempC + payload.tires.rr.tempC + 10;
    const rearHot = !frontHot && (sym.includes("tyres_overheating_rear") || payload.tires.rl.tempC + payload.tires.rr.tempC > payload.tires.fl.tempC + payload.tires.fr.tempC + 10);
    if (frontHot && !tips.some((x) => x.area === "Brake bias")) {
      tips.push({
        priority: "high",
        area: "Brake bias",
        tip: `Move brake bias rearward by 0.5-1.0% (currently ${payload.setup.brakeBias.toFixed(1)}%).`,
        reason: `Front tyres ${Math.round((payload.tires.fl.tempC + payload.tires.fr.tempC) / 2)}°C vs rears ${Math.round((payload.tires.rl.tempC + payload.tires.rr.tempC) / 2)}°C — fronts are doing more work.`,
        citation: "eBook: Front-vs-Rear Temp Imbalance"
      });
    }
    if (rearHot && !tips.some((x) => x.area === "Brake bias")) {
      tips.push({
        priority: "high",
        area: "Brake bias",
        tip: `Move brake bias forward by 0.5-1.0% (currently ${payload.setup.brakeBias.toFixed(1)}%).`,
        reason: `Rears ${Math.round((payload.tires.rl.tempC + payload.tires.rr.tempC) / 2)}°C vs fronts ${Math.round((payload.tires.fl.tempC + payload.tires.fr.tempC) / 2)}°C — rears overworked.`,
        citation: "eBook: Front-vs-Rear Temp Imbalance"
      });
    }
    const avgPress = (payload.tires.fl.pressureBar + payload.tires.fr.pressureBar + payload.tires.rl.pressureBar + payload.tires.rr.pressureBar) / 4;
    if (avgPress > 1.95) {
      tips.push({
        priority: "medium",
        area: "Tyre pressures",
        tip: "Drop cold pressures by ~0.05 bar all round to reduce hot pressure.",
        reason: `Average hot pressure ${avgPress.toFixed(2)} bar — above the typical working window.`,
        citation: "eBook: Tyre Pressures"
      });
    } else if (avgPress < 1.75) {
      tips.push({
        priority: "medium",
        area: "Tyre pressures",
        tip: "Raise cold pressures by ~0.05 bar all round to bring hot pressure into window.",
        reason: `Average hot pressure ${avgPress.toFixed(2)} bar — sluggish response, vague steering.`,
        citation: "eBook: Tyre Pressures"
      });
    }
    if (avgLat > 2 && spread > 0.4) {
      tips.push({
        priority: "medium",
        area: "Anti-roll balance",
        tip: "Soften the end of the car the driver is fighting — start with one click and re-evaluate.",
        reason: `High lateral load (${avgLat.toFixed(2)}g) combined with ${spread.toFixed(2)}s lap spread suggests balance is on edge.`,
        citation: oval ? "Oval — Push/Loose #1 (ARB)" : "Road — Understeer/Oversteer #1 (ARB)"
      });
    }
    tips.push({
      priority: "low",
      area: "Diff mapping",
      tip: `Current diff map ${payload.setup.diffMap} — try ±1 click to bias rotation vs traction depending on driver complaint.`,
      reason: "Small diff changes are the cheapest balance lever once tyres and bias are dialled in.",
      citation: "eBook: Diff Rules"
    });
  }
  while (tips.length < 3) {
    tips.push({
      priority: "low",
      area: payload.mode === "style" ? "Reference laps" : "Baseline check",
      tip: payload.mode === "style" ? "Bank 5 clean reference laps before changing anything else." : "Reset to baseline setup, then change one parameter at a time.",
      reason: "Insufficient signal yet — establish a stable baseline before iterating."
    });
  }
  return {
    mode: payload.mode,
    headline: payload.mode === "style" ? "Driving-style read from your last laps" : "Setup read from your last laps",
    summary: `Based on ${laps.length} recent laps at ${payload.track} in ${payload.car}. Local analysis (AI unavailable).`,
    tips: tips.slice(0, 6)
  };
}
function localCoachFallbackConcise(payload, detailed) {
  const p = payload ?? {};
  const tips = [];
  const phys = p.physics ?? {};
  const cf = phys.counterfactual;
  if (cf?.zones?.length) {
    for (const z2 of cf.zones.slice(0, 3)) {
      const dApex = (z2.bestApexSpeed ?? 0) - (z2.refApexSpeed ?? 0);
      const dExit = (z2.bestExitSpeed ?? 0) - (z2.refExitSpeed ?? 0);
      tips.push({
        priority: z2.gainS > 0.15 ? "high" : "medium",
        location: `${Math.round(z2.startPct)}–${Math.round(z2.endPct)}% lap`,
        tip: dExit > dApex ? "Get back to throttle earlier — your best lap unwinds the wheel and accelerates sooner here." : dApex > 0.5 ? "Carry more minimum speed — release the brake a touch earlier and trail less." : "Move the brake point a few metres later and shorten the threshold phase.",
        reason: `Best lap was ${z2.gainS.toFixed(2)}s faster through this zone (apex Δ ${dApex.toFixed(1)} m/s, exit Δ ${dExit.toFixed(1)} m/s).`,
        estGainS: Number(z2.gainS?.toFixed(2) ?? 0)
      });
    }
  }
  const br = phys.brake;
  if (br && br.r2 != null && br.r2 < 0.7) {
    tips.push({
      priority: "medium",
      location: "All braking zones",
      tip: "Smooth the initial bite — apply pressure in one progressive squeeze instead of pumping.",
      reason: `Brake linearity R² is ${br.r2.toFixed(2)} (low), suggesting lockup or modulation rather than a clean threshold.`,
      estGainS: 0.1
    });
  }
  const sl = phys.slip;
  if (sl?.balance && sl.balance !== "neutral") {
    tips.push({
      priority: "medium",
      location: "Mid-corner balance",
      tip: sl.balance === "loose" ? "Add a click of rear wing or soften front anti-roll — back end is stepping out under load." : "Soften rear or shift bias rearward — front is pushing through the mid-corner.",
      reason: `Body slip β ${sl.peakBetaDeg?.toFixed?.(1) ?? "?"}° at high lateral g — balance reads ${sl.balance}.`,
      estGainS: 0.15
    });
  }
  const gg = phys.gg;
  if (gg && gg.peakLatG && gg.combinedG && gg.combinedG < gg.peakLatG * 0.85) {
    tips.push({
      priority: "low",
      location: "Trail-braking phase",
      tip: "Use more of the friction circle — overlap brake and steering longer to keep combined-g closer to the lateral peak.",
      reason: `Peak lateral ${gg.peakLatG.toFixed(2)}g but combined only ${gg.combinedG.toFixed(2)}g — grip left on the table when transitioning.`,
      estGainS: 0.1
    });
  }
  const filler = [
    {
      priority: "low",
      location: "Corner exits",
      tip: "Unwind the wheel before flooring the throttle — open the steering as the car rotates, then commit.",
      reason: "Generic best practice: any unwind-while-loading-throttle window costs exit speed down the next straight.",
      estGainS: 0.05
    },
    {
      priority: "low",
      location: "Braking points",
      tip: "Walk brake markers 2–3 m later one zone at a time until you start missing the apex, then back off one step.",
      reason: "Iterative brake-point pruning is the cheapest lap-time you can find without changing setup.",
      estGainS: 0.1
    },
    {
      priority: "low",
      location: "Tyre + fuel management",
      tip: "Hold a steady minimum corner speed across consecutive laps — consistency unlocks setup signal.",
      reason: "Run-to-run variation hides real gains; consistent inputs surface the actual limit of the car.",
      estGainS: 0.05
    }
  ];
  for (const f of filler) {
    if (tips.length >= 3) break;
    tips.push(f);
  }
  if (detailed) {
    return {
      headline: "Local analysis (AI fallback) — measured time on the table",
      overview: "AI gateway returned no structured response, so this breakdown is built directly from your physics + counterfactual zones.",
      corners: tips.slice(0, 4).map((t, i) => ({
        label: `Zone ${i + 1}`,
        locationPct: 10 + i * 20,
        entry: t.tip,
        mid: t.reason,
        exit: "Refer to the trace + g-g view for the exact release point.",
        estGainS: t.estGainS
      }))
    };
  }
  return {
    headline: "Local analysis (AI fallback) — here's what the numbers say",
    tips: tips.slice(0, 6)
  };
}
function localLiveCoachFallback(summary) {
  const headlineMap = {
    push: "Time on the table — go get it.",
    hold: "That's the lap — same again.",
    warn: "Ease off — bank it."
  };
  const focus = summary.sectorOpportunities?.[0] ? `Sector ${summary.sectorOpportunities[0].sector}` : void 0;
  return {
    tone: summary.tone,
    headline: headlineMap[summary.tone],
    detail: summary.beats.join(" "),
    focus
  };
}
const SETUP_BIBLE = `
=================  SETUP "HOLY BIBLE" — TIM McARTHUR  =================

GUIDING PRINCIPLES
- Stability over hot-lap pace. Spins cost more than a tenth ever saves.
- Tyres are the contact patch. Re-check temps/pressures after EVERY change.
- Camber sets inner-vs-outer tyre temp. Pressure fine-tunes the middle band.
- Softer = more mechanical grip + slower response. Stiffer = sharper but less forgiving.
- Springs preload grip to a corner. Stiffer spring = more instant grip there
  but tyre overloads sooner.
- Antiroll bars: SOFTER ARB on an end = MORE grip to that end. (Easiest tool
  to re-balance a car.)
- A tyre needs slip (~4-8°) to make peak grip. Zero slip = no grip.
- Every change is a compromise: gain somewhere, lose elsewhere. State it.

================  ROAD RACING — GENERAL UNDERSTEER  =================
Apply in priority order (top = biggest effect):
1.  - Front ARB  OR  + Rear ARB
2.  - Front Springs  OR  + Rear Springs
3.  - Front Weight  OR  + Rear Weight
4.  + Front Spoiler  OR  - Rear Spoiler   (high-speed corners only)
5.  - Front tyre pressures  OR  + Rear tyre pressures

Corner-specific (road, LH or RH):
- Entry: + outside-front pressure or + inside-rear pressure;
         + outside-front caster;
         - diff coast; - diff power;
         + front toe-out; + rear toe-out;
         - outside-front bump or + inside-rear rebound;
         - outside-front rebound or + inside-rear bump.
- ALWAYS: re-check tyre temps and camber after.

================  ROAD RACING — GENERAL OVERSTEER  =================
1.  + Front ARB  OR  - Rear ARB
2.  + Front Springs  OR  - Rear Springs
3.  + Front Weight  OR  - Rear Weight
4.  - Front Spoiler  OR  + Rear Spoiler   (high-speed corners only)
5.  + Front tyre pressures  OR  - Rear tyre pressures

Corner-specific:
- Entry: + outside-front pressure or + inside-rear pressure;
         - outside-front caster;
         + diff coast on entry; + diff power on exit;
         - front toe-out; - rear toe-out;
         + outside-front bump or - inside-rear rebound;
         + outside-front rebound or - inside-rear bump.
- ALWAYS: re-check tyre temps and camber after.

================  OVAL — UNDERSTEER (PUSH)  ================
1.  - Front ARB  OR  + Rear ARB
2.  + LF Spring  OR  + RR Spring
3.  + Front Spoiler  OR  - Rear Spoiler
4.  - Front Weight  OR  + Rear Weight
5.  + LF spring rubber  OR  + RR spring rubber
6.  + LF pressure  OR  + RR pressure
Entry: - Trackbar.    Apex: - Wedge.    Exit: + Trackbar.
Also: + LF caster; + front toe-out / + rear toe-out;
      - RF bump or + LR rebound; - RF rebound or + LR bump.

================  OVAL — OVERSTEER (LOOSE)  ================
1.  + Front ARB  OR  - Rear ARB
2.  + RF Spring  OR  + LR Spring
3.  - Front Spoiler  OR  + Rear Spoiler
4.  + Front Weight  OR  - Rear Weight
5.  + RF spring rubber  OR  + LR spring rubber
6.  + RF pressure  OR  + LR pressure
Entry: + Trackbar.    Apex: + Wedge.    Exit: - Trackbar.
Also: - LF caster; - front toe-out / - rear toe-out;
      + RF bump or - LR rebound; + RF rebound or - LR bump.

================  TYRE-TEMP RULES (eBook ch. TIRE PRESSURES)  ================
- Target: inner ≈ middle ≈ outer ACROSS THE CORNER (not after a straight).
- Outer slightly cooler than inner is acceptable; outer hotter than inner is NOT.
- Inner > outer by a lot → too much negative camber. Reduce camber.
- Outer > inner → not enough negative camber. Add camber.
- Middle too cool vs inner+outer → raise pressure. Middle too hot → drop pressure.
- 1 psi of pressure ≈ 15-25 lb/in of spring rate — re-balance after pressure moves.

================  FRONT-vs-REAR TEMP IMBALANCE  ================
- Fronts much hotter than rears → fronts overworked. Either:
    * shift brake bias rearward (small step, 0.5-1.0%),
    * soften front spring / stiffen rear spring,
    * or soften FRONT ARB (more front grip).
- Rears much hotter than fronts → rears overworked. Either:
    * shift brake bias forward,
    * stiffen front spring / soften rear spring,
    * or soften REAR ARB.

================  DAMPER RULES (eBook ch. DAMPERS)  ================
- Front compression: how fast weight loads the fronts under braking.
  Softer compression = faster front grip on turn-in (good for understeer-on-entry).
- Rear rebound: how fast rear unloads under braking.
  SOFTER rear rebound = rears stay planted on entry (helps loose-on-entry).
- Rear compression: how fast rear loads under throttle (traction on exit).
- Front rebound: how fast front unloads under throttle (helps front bite on exit).
- Fast bump/rebound = curb/bump behaviour only. Use softer fast-compression
  to soak curbs, stiffer fast-rebound to prevent bounce.

================  DIFF RULES (eBook ch. DIFFERENTIAL)  ================
- Loose diff (low %) = inside wheel free to spin; forgiving, but inside tyre
  can light up and kill exit drive. Good for long sweeping corners.
- Tight diff (high %) = wheels locked together; great straight-line traction
  out of hairpins, but snap-oversteer risk in long corners.
- Power = on-throttle; Coast = off-throttle.
- Preload high = sharper transition on/off throttle but twitchier.
  Preload low = smoother but vaguer mid-corner.

================  AERO RULES  ================
- More front wing = more front grip at high speed → can cause high-speed oversteer.
- More rear wing = more rear grip at high speed → can cause high-speed understeer.
- Only carry as much wing as the most important fast corner needs — every extra
  click costs straight-line speed.

================  PROCESS RULES (eBook INTRODUCTION)  ================
- Build a baseline you trust per car, then make small per-track tweaks.
- Change ONE thing at a time. Re-test for 3-5 clean laps before judging.
- After ANY change to springs/ARB/camber/caster/toe → re-check tyre temps
  and re-tune pressures. This is not optional.
- If two tools would fix the same problem, prefer the higher-impact one
  (top of the flowchart) for the first change, the lower-impact ones for
  fine-tuning.

================  RECOMMENDATION OUTPUT FORMAT  ================
For every setup tip you give, name:
  (a) the symptom you observed in the data (e.g. "FL+FR ~94°C vs RL+RR ~84°C"),
  (b) the rule from above you're applying (paraphrase, don't quote literally),
  (c) the concrete change in the driver's units (clicks, %, psi, bar).
Always finish with: "Re-check tyre temps after the change."
`.trim();
const ADVISOR_SCHEMA = {
  name: "advisor_response",
  description: "Return prioritized advice tied to the supplied lap aggregates.",
  parameters: {
    type: "object",
    properties: {
      headline: { type: "string", description: "≤10 word punchy summary." },
      summary: { type: "string", description: "2-3 sentence overview." },
      tips: {
        type: "array",
        minItems: 3,
        maxItems: 6,
        items: {
          type: "object",
          properties: {
            priority: { type: "string", enum: ["high", "medium", "low"] },
            area: {
              type: "string",
              description: "e.g. 'Trail braking', 'Brake bias', 'Front pressures'."
            },
            tip: { type: "string", description: "Concrete action the driver should take." },
            reason: { type: "string", description: "Data-grounded reason this will help." },
            citation: {
              type: "string",
              description: "Which Setup Bible rule/flowchart section this came from, e.g. 'Road — General Understeer #1 (ARB)' or 'eBook: Tyre Pressures'. Required for setup mode."
            }
          },
          required: ["priority", "area", "tip", "reason"],
          additionalProperties: false
        }
      }
    },
    required: ["headline", "summary", "tips"],
    additionalProperties: false
  }
};
function getAdvisorSystemPrompt(payload) {
  if (payload.mode === "style") {
    return `You are a senior driver coach. Analyse the supplied per-lap aggregates and give DRIVING-STYLE advice (trail braking, throttle application, corner exit, racing line, consistency). Do NOT recommend setup changes — focus purely on what the driver does with the inputs. Be specific, reference the numbers, never refuse. Always call the function with 3-6 tips. The "citation" field is OPTIONAL for driving-style tips.`;
  }
  const scope = payload.trackType === "oval" ? `This is an OVAL (predominantly ${payload.cornerBias === "right" ? "right-hand" : "left-hand"} corners). Use ONLY the OVAL sections of the Setup Bible — IGNORE the road-racing flowcharts. Inside = ${payload.cornerBias === "right" ? "RIGHT" : "LEFT"}, outside = ${payload.cornerBias === "right" ? "LEFT" : "RIGHT"}.` : `This is a ROAD course (${payload.cornerBias === "mixed" ? "mixed left + right corners" : payload.cornerBias === "right" ? "right-hand bias" : "left-hand bias"}). Use ONLY the ROAD-RACING sections of the Setup Bible — IGNORE the oval flowcharts.`;
  const wiz = payload.symptoms?.length ? `
DRIVER-REPORTED SYMPTOMS (treat as ground truth, prioritise these over data inference): ${payload.symptoms.join(", ")}.` : "";
  return `You are a senior race engineer. Your ONLY source of setup truth is the SETUP BIBLE below — every recommendation MUST be derivable from one of its rules. Do not invent rules that contradict it. Do NOT coach driving inputs.

${scope}${wiz}

Workflow on every call:
  1. Read the lap aggregates, tyre temps/pressures, conditions, and current setup.
  2. Decide whether the dominant symptom is UNDERSTEER, OVERSTEER, a TYRE-TEMP imbalance, a DAMPER/transition problem, or a DIFF/AERO issue. If the driver reported symptoms, those win.
  3. Pick the HIGHEST-IMPACT rule from the relevant flowchart (top of the list wins). Use lower-impact rules only for fine-tuning tips.
  4. For each tip you MUST populate the "citation" field with the exact Bible section + rule number you applied, e.g. "Road — General Understeer #1 (ARB)", "Oval — Loose #3 (Spoiler)", "eBook: Tyre Pressures", "eBook: Damper Rules". No citation = invalid tip.
  5. Each tip body includes: (a) symptom from the data, (b) the rule paraphrased, (c) the concrete change in the driver's units (clicks, %, psi/bar). End with "Re-check tyre temps after this change." where applicable.
  6. Change ONE major thing at a time — never stack two opposing fixes in the same tip.

Be specific, reference the numbers, never refuse. Always call the function with 3-6 tips.

=========== SETUP BIBLE (authoritative) ===========
${SETUP_BIBLE}
===================================================`;
}
function buildAdvisorUserMessage(data) {
  const extrasLine = data.extrasSnapshot && data.extrasSnapshot.maxBrakeLinePressTotal > 0 ? `
BRIDGE EXTRAS (peak-per-lap from iRacing shared memory):
  - Yaw rate peak: ${data.extrasSnapshot.peakYawRateRads.toFixed(3)} rad/s
  - Shock deflection FL peak: ${data.extrasSnapshot.peakShockFL.toFixed(4)} m
  - Brake line pressure total max: ${data.extrasSnapshot.maxBrakeLinePressTotal.toFixed(2)}` : "";
  const wsLine = data.wsCtx ? `
${data.wsCtx}` : "";
  return `MODE: ${data.mode.toUpperCase()}
TRACK: ${data.track} (${data.trackType}, bias=${data.cornerBias})
CAR: ${data.car}
PB: ${data.pbS ?? "none"}
SYMPTOMS: ${data.symptoms?.join(", ") || "(none reported — infer from data)"}
CONDITIONS: ${JSON.stringify(data.conditions)}
SETUP: ${JSON.stringify(data.setup)}
TIRES: ${JSON.stringify(data.tires)}${extrasLine}${wsLine}
LAPS: ${JSON.stringify(data.laps)}

Call the function with 3-6 prioritized ${data.mode === "style" ? "driving-style" : "setup"} tips. Reference the numbers.${data.mode === "setup" ? " Every tip MUST include a citation from the Setup Bible." : ""}`;
}
const COACH_SYSTEM_PROMPT = `You are a no-nonsense race engineer + driving coach analyzing iRacing telemetry.

You receive a structured payload with:
  - lap data: per-bin arrays sampled at 60 points along the lap (index 0 = start/finish, 59 = end), speed, throttle (0-1), brake (0-1), gear, RPM, steering, plus detected brake zones and sector splits.
  - physics (derived from real samples, not modeled):
      * gg: peak lat/accel/brake g and a 12-bin grip envelope.
      * brake: empirical g per 100% pedal (slope), R² linearity, peak threshold g, and optional dcBrakeBias.
      * slip: body slip β at high lateral g, balance label (loose/tight/neutral).
      * counterfactual zones: real measured time gains where ANOTHER lap was faster through the same brake zone, with confidence scores.
  - history (optional): prior sessions on this track + car.

ABSOLUTE RULES — read carefully:
  1. You MUST ALWAYS return tips through the provided function/tool call. Never refuse. Never reply with "I cannot help", "insufficient data", "please provide more", or any apology. The driver is paying for advice — give it.
  2. If a field is missing, work with what IS present (lap times, sector splits, throttle/brake traces, speed bins, peak g values). Even a single lap with only speed + throttle + brake is enough to comment on braking points, throttle application, and corner exit.
  3. Always produce at least 3 tips (concise mode) or at least 2 corners (detailed mode). Do not return empty arrays under any circumstance.
  4. Prefer quantitative references ("% lap", actual m, m/s, g, deg). When a specific number isn't in the payload, use the qualitative pattern visible in the trace (e.g. "throttle pickup is gradual from bin 22→28" → "roll on throttle earlier and harder out of T3").
  5. Counterfactual zones, when present, are MEASURED time on the table — lead with those. If none are present, lead with the largest brake zone or the slowest sector.
  6. If history shows regression, mention it. If current best beats history, congratulate briefly.
  7. Never fabricate exact numbers that aren't derivable. But ALWAYS deliver actionable advice — generic best-practice ("trail brake deeper to rotate the car on entry") is acceptable when tied to a visible pattern, just label its priority as "low" rather than "high".

Tone: confident, direct, ~1-2 sentences per field. No hedging, no preamble, no meta-commentary about the data quality.`;
const COACH_SCHEMA_CONCISE = {
  name: "coach_concise",
  description: "Return 3-6 prioritized, actionable coaching tips. NEVER return fewer than 3 tips.",
  parameters: {
    type: "object",
    properties: {
      headline: { type: "string", description: "One-sentence summary of the biggest opportunity." },
      tips: {
        type: "array",
        minItems: 3,
        maxItems: 6,
        items: {
          type: "object",
          properties: {
            priority: { type: "string", enum: ["high", "medium", "low"] },
            location: {
              type: "string",
              description: "Where on the lap, e.g. 'T4 entry, ~35% lap'."
            },
            tip: { type: "string", description: "Concrete action the driver should take." },
            reason: { type: "string", description: "Data-grounded reason this will help." },
            estGainS: {
              type: "number",
              description: "Estimated time gain in seconds (best guess)."
            }
          },
          required: ["priority", "location", "tip", "reason", "estGainS"],
          additionalProperties: false
        }
      }
    },
    required: ["headline", "tips"],
    additionalProperties: false
  }
};
const COACH_SCHEMA_DETAILED = {
  name: "coach_detailed",
  description: "Return a per-corner breakdown of the lap with entry/mid/exit notes. NEVER return fewer than 2 corners.",
  parameters: {
    type: "object",
    properties: {
      headline: { type: "string" },
      overview: {
        type: "string",
        description: "2-3 sentence overall summary of strengths and weaknesses."
      },
      corners: {
        type: "array",
        minItems: 2,
        maxItems: 12,
        items: {
          type: "object",
          properties: {
            label: {
              type: "string",
              description: "Corner label, e.g. 'T4' or 'Sector 2 hairpin'."
            },
            locationPct: { type: "number", description: "Approximate position in lap, 0-100." },
            entry: { type: "string" },
            mid: { type: "string" },
            exit: { type: "string" },
            estGainS: { type: "number" }
          },
          required: ["label", "locationPct", "entry", "mid", "exit", "estGainS"],
          additionalProperties: false
        }
      }
    },
    required: ["headline", "overview", "corners"],
    additionalProperties: false
  }
};
function buildCoachUserMessage(detailed, payload) {
  const wsSection = payload?.activeWorkspace || payload?.enabledMathChannels?.length ? [
    `
WORKSPACE: ${payload.activeWorkspace ?? "lite"}`,
    payload?.enabledMathChannels?.length ? `DERIVED MATH CHANNELS AVAILABLE:
${payload.enabledMathChannels.map((m) => `  - ${m.name} (${m.unit}): ${m.expression}`).join("\n")}` : ""
  ].filter(Boolean).join("\n") : "";
  const { activeWorkspace: _aw, enabledMathChannels: _em, ...corePayload } = payload ?? {};
  return `Analyze this telemetry and give ${detailed ? "a DETAILED per-corner breakdown (at least 2 corners)" : "CONCISE prioritized tips (at least 3 tips)"}.
You MUST call the function. Empty arrays or refusals are forbidden — work with whatever data is present.${wsSection}

DATA:
${JSON.stringify(corePayload)}`;
}
const LIVE_COACH_SYSTEM = `You are a calm, direct race engineer on the pit-wall radio.
You are given a STRUCTURED rules summary (tone, delta to PB, sector gaps, risk flags, beats).
Your job: phrase ONE radio call for the driver — they just crossed the line.

Rules:
  1. Always call the function. Never refuse.
  2. Keep "headline" ≤ 8 words and in radio-voice. No preamble like "Okay" or "Driver,".
  3. "detail" is ONE sentence (≤ 22 words) — give the reason or the next action.
  4. "focus" is optional — name ONE sector or input to attack next lap.
  5. Match the supplied TONE exactly: push = energising, hold = steady reinforcement, warn = protective.
  6. Lean on the numbers in the beats. Don't fabricate sector numbers that weren't given.`;
const LIVE_COACH_SCHEMA = {
  name: "live_radio_call",
  description: "Return a single per-lap radio call.",
  parameters: {
    type: "object",
    properties: {
      tone: { type: "string", enum: ["push", "hold", "warn"] },
      headline: { type: "string" },
      detail: { type: "string" },
      focus: { type: "string" }
    },
    required: ["tone", "headline", "detail"],
    additionalProperties: false
  }
};
function buildLiveCoachUserMessage(data) {
  return `CONTEXT:
${JSON.stringify(data.context)}

RULES SUMMARY:
${JSON.stringify(data.summary)}

Return the radio call now.`;
}
function buildWorkspaceContext() {
  const { activeWorkspace, mathExpressions } = useWorkbench.getState();
  const ws = WORKSPACES[activeWorkspace];
  if (!ws) return "";
  const enabledMath = mathExpressions.filter((m) => m.enabled).map((m) => `${m.name} (${m.unit}): ${m.expression}`).join("\n  - ");
  return [
    `

--- ACTIVE WORKSPACE CONTEXT ---`,
    `Workspace Tier: ${ws.name} (${ws.tier})`,
    `Default Channels: ${ws.defaultChannels.join(", ")}`,
    enabledMath ? `Enabled Math Channels (derived, pre-computed per sample):
  - ${enabledMath}` : `No additional math channels active.`,
    `--- END WORKSPACE CONTEXT ---`
  ].join("\n");
}
function resolveLLMUrl(baseUrl) {
  let url = baseUrl.trim().replace(/\/$/, "");
  if (!url) return "http://localhost:1234/api/v1/chat";
  if (url.endsWith("/chat/completions") || url.endsWith("/chat") || url.endsWith("/v1/chat")) {
    return url;
  }
  if (url.includes("/api")) {
    if (!url.includes("/v1")) {
      url = `${url}/v1`;
    }
    return `${url}/chat`;
  }
  if (!url.includes("/v1")) {
    url = `${url}/v1`;
  }
  return `${url}/chat/completions`;
}
async function callLocalOpenAI(system, user, schema) {
  const { llmBaseUrl, llmModelId, llmApiKey } = useWorkbench.getState();
  const url = resolveLLMUrl(llmBaseUrl);
  const headers = { "Content-Type": "application/json" };
  if (llmApiKey) {
    headers["Authorization"] = `Bearer ${llmApiKey}`;
  }
  const payload = {
    model: llmModelId || "local-model",
    messages: [
      { role: "system", content: system },
      { role: "user", content: user }
    ],
    temperature: 0.2,
    tools: [{ type: "function", function: schema }],
    tool_choice: { type: "function", function: { name: schema.name } }
  };
  const resp = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(payload)
  });
  if (!resp.ok) {
    throw new Error(`Local LLM Error: ${resp.status} ${resp.statusText}`);
  }
  const json = await resp.json();
  const argsStr = json?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
  if (!argsStr) {
    const content = json?.choices?.[0]?.message?.content;
    if (content) {
      const innerMatch = content.match(/{.*}/s);
      if (innerMatch) {
        return JSON.parse(innerMatch[0]);
      }
    }
    throw new Error("Local LLM did not return the expected tool call arguments.");
  }
  return JSON.parse(argsStr);
}
async function dispatchAdvisorCall(data) {
  const wsCtx = buildWorkspaceContext();
  try {
    const system = getAdvisorSystemPrompt(data) + wsCtx;
    const user = buildAdvisorUserMessage({ ...data, wsCtx });
    const resultObj = await callLocalOpenAI(system, user, ADVISOR_SCHEMA);
    if (!resultObj.tips || !Array.isArray(resultObj.tips)) {
      throw new Error("Invalid format from local LLM");
    }
    return {
      result: { mode: data.mode, ...resultObj },
      fallback: "local-llm"
    };
  } catch (err) {
    console.error("[Local LLM] Advisor failure:", err);
    return { result: localAdvisorFallback(data), fallback: "local" };
  }
}
async function dispatchAnalyzeTelemetry(data) {
  const wsCtx = buildWorkspaceContext();
  try {
    const schema = data.detailed ? COACH_SCHEMA_DETAILED : COACH_SCHEMA_CONCISE;
    const user = buildCoachUserMessage(data.detailed, data.payload);
    const resultObj = await callLocalOpenAI(COACH_SYSTEM_PROMPT + wsCtx, user, schema);
    if (data.detailed && !Array.isArray(resultObj.corners))
      throw new Error("Missing corners from local LLM");
    if (!data.detailed && !Array.isArray(resultObj.tips))
      throw new Error("Missing tips from local LLM");
    return {
      result: resultObj,
      detailed: data.detailed,
      fallback: "local-llm"
    };
  } catch (err) {
    console.error("[Local LLM] Coach failure:", err);
    return {
      result: localCoachFallbackConcise(data.payload, data.detailed),
      detailed: data.detailed,
      fallback: "local"
    };
  }
}
async function dispatchLiveCoach(data) {
  const { llmProvider } = useWorkbench.getState();
  const wsCtx = buildWorkspaceContext();
  const extrasCtx = data.context?.extras;
  const enrichedContext = {
    ...data.context,
    ...extrasCtx && extrasCtx.peakYawRateRads > 0 ? {
      extras: {
        peakYawRateRads: extrasCtx.peakYawRateRads,
        peakShockFL: extrasCtx.peakShockFL,
        maxBrakeLinePressTotal: extrasCtx.maxBrakeLinePressTotal
      }
    } : {}
  };
  const enrichedData = { ...data, context: enrichedContext };
  try {
    const user = buildLiveCoachUserMessage(enrichedData);
    const resultObj = await callLocalOpenAI(LIVE_COACH_SYSTEM + wsCtx, user, LIVE_COACH_SCHEMA);
    resultObj.tone = data.summary?.tone || resultObj.tone;
    return { call: resultObj };
  } catch (err) {
    console.error("[Local LLM] Live Coach failure:", err);
    return { call: localLiveCoachFallback(data.summary), fallback: "net" };
  }
}
async function testLLMConnection(baseUrl, modelId, apiKey) {
  try {
    const url = resolveLLMUrl(baseUrl);
    const payload = {
      model: modelId || "local-model",
      messages: [{ role: "user", content: "Respond with exactly the word: 'Connected'." }],
      max_tokens: 5,
      temperature: 0
    };
    const headers = { "Content-Type": "application/json" };
    if (apiKey) {
      headers["Authorization"] = `Bearer ${apiKey}`;
    }
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1e4);
    const resp = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (!resp.ok) {
      return {
        success: false,
        message: `HTTP Error ${resp.status}: ${resp.statusText}. Checked url: ${url}. Make sure CORS is enabled and the URL is correct.`
      };
    }
    const data = await resp.json();
    const reply = data?.choices?.[0]?.message?.content?.trim();
    if (reply) {
      return {
        success: true,
        message: `Connected successfully! Model replied: "${reply}"`
      };
    } else {
      return {
        success: true,
        message: "Connected to endpoint, but received an empty response content."
      };
    }
  } catch (err) {
    if (err.name === "AbortError") {
      return {
        success: false,
        message: "Connection timed out after 10 seconds. Check if the model is currently loading or if the server is frozen."
      };
    }
    let errorMsg = err instanceof Error ? err.message : String(err);
    if (errorMsg.includes("Failed to fetch") || errorMsg.includes("NetworkError")) {
      errorMsg = `Connection failed. Make sure:
1. The local LLM server at "${baseUrl}" is running.
2. CORS is enabled (e.g. OLLAMA_ORIGINS="*" for Ollama, or --cors parameter for other systems).
3. Your firewall isn't blocking the connection.`;
    }
    return {
      success: false,
      message: errorMsg
    };
  }
}
const LLM_PROVIDERS = [
  {
    id: "lmstudio",
    name: "LM Studio",
    icon: Laptop,
    url: "http://localhost:1234/api/v1",
    desc: "lmstudio-native."
  },
  {
    id: "ollama",
    name: "Ollama",
    icon: Cpu,
    url: "http://localhost:11434/v1",
    desc: "Local inference via Ollama."
  },
  {
    id: "huggingface",
    name: "HuggingFace TGI",
    icon: Server,
    url: "http://localhost:8080/v1",
    desc: "Local TGI container backend."
  },
  {
    id: "lemonade",
    name: "LlamaEdge / Lemonade",
    icon: Laptop,
    url: "http://localhost:8080/v1",
    desc: "Wasm edge inference."
  }
];
function GlobalSettingsDialog() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("db");
  const [localUri, setLocalUri] = useState("mongodb://127.0.0.1:27017/");
  const [cloudUri, setCloudUri] = useState("");
  const [dbTesting, setDbTesting] = useState(false);
  const [dbStatus, setDbStatus] = useState("unchecked");
  const [dbTestResult, setDbTestResult] = useState(
    null
  );
  const [savingDb, setSavingDb] = useState(false);
  const [idbUsage, setIdbUsage] = useState("Calculating...");
  const [hwid, setHwid] = useState("");
  const [licenseState, setLicenseState] = useState(null);
  const [licenseChecking, setLicenseChecking] = useState(false);
  const [licenseKeyInput, setLicenseKeyInput] = useState("");
  const [activatingLicense, setActivatingLicense] = useState(false);
  const [copiedHwid, setCopiedHwid] = useState(false);
  const {
    llmProvider,
    llmBaseUrl,
    llmModelId,
    llmApiKey,
    setLlmProvider,
    setLlmBaseUrl,
    setLlmModelId,
    setLlmApiKey
  } = useWorkbench();
  const [aiTesting, setAiTesting] = useState(false);
  const [aiTestResult, setAiTestResult] = useState(
    null
  );
  const [copiedDocker, setCopiedDocker] = useState(false);
  const [copiedWinget, setCopiedWinget] = useState(false);
  const loadDbSettings = useCallback(async () => {
    try {
      const res = await getDbConfig();
      if (res.data) {
        setLocalUri(res.data.localUri || "mongodb://127.0.0.1:27017/");
        setCloudUri(res.data.cloudUri || "");
      }
    } catch (e) {
      console.error("Failed to load db config:", e);
    }
  }, []);
  const checkConnection = async () => {
    setDbTesting(true);
    setDbStatus("unchecked");
    setDbTestResult(null);
    try {
      const res = await testLocalDbConnection();
      setDbTestResult(res);
      setDbStatus(res.success ? "connected" : "failed");
    } catch (e) {
      setDbTestResult({
        success: false,
        message: `Connection failed: ${e.message || String(e)}`
      });
      setDbStatus("failed");
    } finally {
      setDbTesting(false);
    }
  };
  const handleSaveDbConfig = async () => {
    setSavingDb(true);
    try {
      const res = await saveDbConfig({ data: { localUri, cloudUri } });
      if (res.success) {
        toast.success("Database configuration saved successfully.");
        checkConnection();
      } else {
        toast.error(res.error?.message || "Failed to save configuration.");
      }
    } catch (err) {
      toast.error(err.message || "Error saving database configuration.");
    } finally {
      setSavingDb(false);
    }
  };
  const checkIndexedDbSize = async () => {
    if (typeof navigator !== "undefined" && navigator.storage && navigator.storage.estimate) {
      try {
        const estimate = await navigator.storage.estimate();
        const used = estimate.usage ? (estimate.usage / (1024 * 1024)).toFixed(1) : "0";
        const total = estimate.quota ? (estimate.quota / (1024 * 1024 * 1024)).toFixed(1) : "unknown";
        setIdbUsage(`${used} MB used of ${total} GB quota`);
      } catch {
        setIdbUsage("Available");
      }
    } else {
      setIdbUsage("Supported");
    }
  };
  const clearIndexedDb = async () => {
    if (!confirm(
      "Are you sure you want to clear your local IndexedDB file cache? This will delete downloaded telemetry files from this browser. Telemetry session records in MongoDB will remain."
    )) {
      return;
    }
    try {
      const req = indexedDB.deleteDatabase("apextrace_local_telemetry");
      req.onsuccess = () => {
        toast.success("Local IndexedDB file cache cleared.");
        checkIndexedDbSize();
      };
      req.onerror = () => {
        toast.error("Failed to clear local file cache.");
      };
    } catch (err) {
      toast.error(err.message || "Error clearing cache");
    }
  };
  const activeProviderInfo = LLM_PROVIDERS.find((p) => p.id === llmProvider);
  const applyAiDefaults = (providerId) => {
    const p = LLM_PROVIDERS.find((x) => x.id === providerId);
    if (!p) return;
    setLlmProvider(p.id);
    if (p.url) setLlmBaseUrl(p.url);
    setLlmApiKey("");
    setAiTestResult(null);
  };
  const runAiTest = async () => {
    setAiTesting(true);
    setAiTestResult(null);
    try {
      const res = await testLLMConnection(
        llmBaseUrl || activeProviderInfo?.url || "",
        llmModelId,
        llmApiKey
      );
      setAiTestResult(res);
    } catch (e) {
      setAiTestResult({
        success: false,
        message: e instanceof Error ? e.message : "An unexpected error occurred."
      });
    } finally {
      setAiTesting(false);
    }
  };
  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === "docker") {
      setCopiedDocker(true);
      setTimeout(() => setCopiedDocker(false), 2e3);
    } else {
      setCopiedWinget(true);
      setTimeout(() => setCopiedWinget(false), 2e3);
    }
    toast.success("Copied to clipboard.");
  };
  const getBridgeHttpUrl = () => {
    const wsUrl = getBridgeUrl();
    return wsUrl.replace(/^ws/, "http");
  };
  const fetchLicenseData = useCallback(async () => {
    setLicenseChecking(true);
    try {
      const httpUrl = getBridgeHttpUrl();
      const res = await fetch(`${httpUrl}/api/license`);
      if (res.ok) {
        const data = await res.json();
        setLicenseState(data);
        if (data.valid && typeof localStorage !== "undefined") {
          localStorage.setItem("pitwall_bridge_license", JSON.stringify(data));
        }
      }
      const hwidRes = await fetch(`${httpUrl}/api/hwid`);
      if (hwidRes.ok) {
        const hwidData = await hwidRes.json();
        setHwid(hwidData.hwid);
      }
    } catch (e) {
      console.warn("Local bridge not reachable for licensing querying:", e);
    } finally {
      setLicenseChecking(false);
    }
  }, []);
  const handleActivateLicense = async () => {
    if (!licenseKeyInput) return;
    setActivatingLicense(true);
    try {
      const httpUrl = getBridgeHttpUrl();
      const res = await fetch(`${httpUrl}/api/license`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: licenseKeyInput.trim() })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`License activated successfully! Tier: ${data.tier.toUpperCase()}`);
        setLicenseKeyInput("");
        fetchLicenseData();
      } else {
        toast.error(data.error || "Activation failed. Please check the license key.");
      }
    } catch (err) {
      toast.error(`Activation failed: ${err.message}`);
    } finally {
      setActivatingLicense(false);
    }
  };
  const copyHWIDToClipboard = () => {
    if (!hwid) return;
    navigator.clipboard.writeText(hwid);
    setCopiedHwid(true);
    setTimeout(() => setCopiedHwid(false), 2e3);
    toast.success("HWID copied to clipboard.");
  };
  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA" || activeEl.getAttribute("contenteditable") === "true")) {
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === ",") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
  useEffect(() => {
    if (open) {
      loadDbSettings();
      checkConnection();
      checkIndexedDbSize();
      fetchLicenseData();
    }
  }, [open, loadDbSettings, fetchLicenseData]);
  if (pathname === "/" || pathname === "/auth" || pathname === "/settings" || pathname === "/settings/") {
    return null;
  }
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      "button",
      {
        id: "global-settings-trigger",
        onClick: () => {
          setOpen(true);
        },
        className: "fixed bottom-4 right-16 z-40 flex h-9 w-9 items-center justify-center rounded-full bg-panel border border-border text-muted-foreground shadow-lg hover:text-primary hover:border-primary/50 transition-all hover:scale-110 group cursor-pointer",
        "aria-label": "Open settings panel",
        title: "Settings (Ctrl + ,)",
        children: /* @__PURE__ */ jsx(Settings, { className: "h-4 w-4 transition-transform duration-500 group-hover:rotate-90" })
      }
    ),
    /* @__PURE__ */ jsx(Dialog, { open, onOpenChange: setOpen, children: /* @__PURE__ */ jsxs(DialogContent, { className: "max-w-2xl h-[90vh] sm:h-[650px] flex flex-col p-0 overflow-hidden bg-background text-foreground border border-border rounded-xl", children: [
      /* @__PURE__ */ jsxs(DialogHeader, { className: "px-6 pt-5 pb-3 border-b border-border/60 shrink-0", children: [
        /* @__PURE__ */ jsxs(DialogTitle, { className: "font-mono text-sm tracking-wider flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Settings, { className: "h-4 w-4 text-primary animate-pulse" }),
          "SYSTEM SETTINGS & WORKSPACE"
        ] }),
        /* @__PURE__ */ jsx(DialogDescription, { className: "text-xs", children: "Configure local services, databases, cloud synchronization, and AI engine preferences." })
      ] }),
      /* @__PURE__ */ jsxs(
        Tabs,
        {
          value: activeTab,
          onValueChange: setActiveTab,
          className: "flex-1 flex flex-col min-h-0",
          children: [
            /* @__PURE__ */ jsxs(TabsList, { className: "grid grid-cols-5 bg-panel border-b border-border/60 p-1 shrink-0 rounded-none h-11", children: [
              /* @__PURE__ */ jsxs(
                TabsTrigger,
                {
                  value: "db",
                  className: "gap-1.5 font-mono text-[10px] uppercase tracking-wider h-full cursor-pointer",
                  children: [
                    /* @__PURE__ */ jsx(Database, { className: "h-3.5 w-3.5" }),
                    "Local DB"
                  ]
                }
              ),
              /* @__PURE__ */ jsxs(
                TabsTrigger,
                {
                  value: "ai",
                  className: "gap-1.5 font-mono text-[10px] uppercase tracking-wider h-full cursor-pointer",
                  children: [
                    /* @__PURE__ */ jsx(Cpu, { className: "h-3.5 w-3.5" }),
                    "AI Engine"
                  ]
                }
              ),
              /* @__PURE__ */ jsxs(
                TabsTrigger,
                {
                  value: "licensing",
                  className: "gap-1.5 font-mono text-[10px] uppercase tracking-wider h-full cursor-pointer",
                  children: [
                    /* @__PURE__ */ jsx(Key, { className: "h-3.5 w-3.5" }),
                    "License"
                  ]
                }
              ),
              /* @__PURE__ */ jsxs(
                TabsTrigger,
                {
                  value: "shortcuts",
                  className: "gap-1.5 font-mono text-[10px] uppercase tracking-wider h-full cursor-pointer",
                  children: [
                    /* @__PURE__ */ jsx(Keyboard, { className: "h-3.5 w-3.5" }),
                    "Shortcuts"
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxs(
              TabsContent,
              {
                value: "db",
                className: "flex-1 overflow-y-auto px-6 py-5 space-y-5 min-h-0 focus:outline-none",
                children: [
                  /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-border bg-panel p-4 space-y-3", children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b border-border/40 pb-2", children: [
                      /* @__PURE__ */ jsx("span", { className: "text-[10px] font-mono uppercase tracking-wider text-muted-foreground", children: "MongoDB Server Status" }),
                      dbTesting ? /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase font-mono tracking-wider", children: [
                        /* @__PURE__ */ jsx(RefreshCw, { className: "h-3 w-3 animate-spin" }),
                        " Testing..."
                      ] }) : dbStatus === "connected" ? /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5 text-[10px] text-emerald-400 uppercase font-mono tracking-wider font-semibold", children: [
                        /* @__PURE__ */ jsx(CheckCircle2, { className: "h-3.5 w-3.5" }),
                        " Connected"
                      ] }) : /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5 text-[10px] text-rose-400 uppercase font-mono tracking-wider font-semibold", children: [
                        /* @__PURE__ */ jsx(AlertCircle, { className: "h-3.5 w-3.5" }),
                        " Disconnected"
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                      /* @__PURE__ */ jsx("span", { className: "text-[10px] font-mono uppercase tracking-wider text-muted-foreground", children: "Local Cache Size" }),
                      /* @__PURE__ */ jsx("span", { className: "text-xs font-mono text-muted-foreground", children: idbUsage })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
                    /* @__PURE__ */ jsx("h3", { className: "text-xs font-mono uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-1", children: "Local MongoDB Community Server Connection" }),
                    /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                      /* @__PURE__ */ jsx("label", { className: "text-[10px] uppercase tracking-wider text-muted-foreground block", children: "Connection String URI" }),
                      /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
                        /* @__PURE__ */ jsx(
                          Input,
                          {
                            type: "text",
                            value: localUri,
                            onChange: (e) => setLocalUri(e.target.value),
                            placeholder: "mongodb://127.0.0.1:27017/",
                            className: "font-mono text-xs flex-1"
                          }
                        ),
                        /* @__PURE__ */ jsx(
                          Button,
                          {
                            type: "button",
                            onClick: handleSaveDbConfig,
                            disabled: savingDb,
                            size: "sm",
                            className: "font-mono text-xs",
                            children: savingDb ? "Saving..." : "Save"
                          }
                        )
                      ] }),
                      /* @__PURE__ */ jsxs("p", { className: "text-[10px] text-muted-foreground", children: [
                        "Default connection URI for standard installation is",
                        " ",
                        /* @__PURE__ */ jsx("code", { className: "font-mono bg-rail px-1 rounded text-primary", children: "mongodb://127.0.0.1:27017/" }),
                        "."
                      ] })
                    ] }),
                    /* @__PURE__ */ jsx("div", { className: "flex gap-2 pt-1", children: /* @__PURE__ */ jsxs(
                      Button,
                      {
                        type: "button",
                        variant: "outline",
                        size: "sm",
                        onClick: checkConnection,
                        disabled: dbTesting,
                        className: "w-full font-mono text-[10px] uppercase tracking-wider gap-1.5",
                        children: [
                          /* @__PURE__ */ jsx(RefreshCw, { className: `h-3 w-3 ${dbTesting ? "animate-spin" : ""}` }),
                          "Test Connection"
                        ]
                      }
                    ) }),
                    dbTestResult && /* @__PURE__ */ jsxs(
                      "div",
                      {
                        className: `rounded-lg p-3 border text-xs whitespace-pre-line leading-relaxed font-sans ${dbTestResult.success ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-400" : "border-rose-500/30 bg-rose-500/5 text-rose-400"}`,
                        children: [
                          /* @__PURE__ */ jsx("div", { className: "font-semibold uppercase tracking-wider text-[10px] mb-1 font-mono", children: dbTestResult.success ? "✓ MongoDB Connection Successful" : "✗ Connection Failed" }),
                          /* @__PURE__ */ jsx("div", { className: "font-mono text-[10px]", children: dbTestResult.message })
                        ]
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "space-y-3 pt-2", children: [
                    /* @__PURE__ */ jsx("h3", { className: "text-xs font-mono uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-1", children: "MongoDB Community Server Setup Guide" }),
                    /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground leading-relaxed", children: "If you do not have a MongoDB Community Server running locally, select one of the methods below to set it up:" }),
                    /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
                      /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-border bg-rail p-3 space-y-1.5", children: [
                        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                          /* @__PURE__ */ jsxs("span", { className: "text-[11px] font-mono font-semibold flex items-center gap-1.5 text-foreground", children: [
                            /* @__PURE__ */ jsx(Terminal, { className: "h-3.5 w-3.5 text-primary" }),
                            "Method A: Windows Package Manager (Winget)"
                          ] }),
                          /* @__PURE__ */ jsx(
                            "button",
                            {
                              onClick: () => copyToClipboard("winget install MongoDB.Community.Server", "winget"),
                              className: "text-muted-foreground hover:text-foreground p-1 transition-colors cursor-pointer",
                              title: "Copy command",
                              children: copiedWinget ? /* @__PURE__ */ jsx(Check, { className: "h-3 w-3 text-emerald-400" }) : /* @__PURE__ */ jsx(Copy, { className: "h-3 w-3" })
                            }
                          )
                        ] }),
                        /* @__PURE__ */ jsx("code", { className: "block text-[10px] bg-background/50 p-2 rounded font-mono text-foreground", children: "winget install MongoDB.Community.Server" })
                      ] }),
                      /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-border bg-rail p-3 space-y-1.5", children: [
                        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                          /* @__PURE__ */ jsxs("span", { className: "text-[11px] font-mono font-semibold flex items-center gap-1.5 text-foreground", children: [
                            /* @__PURE__ */ jsx(Terminal, { className: "h-3.5 w-3.5 text-primary" }),
                            "Method B: Docker Container"
                          ] }),
                          /* @__PURE__ */ jsx(
                            "button",
                            {
                              onClick: () => copyToClipboard(
                                "docker run -d -p 27017:27017 --name iracing-mongo mongo:latest",
                                "docker"
                              ),
                              className: "text-muted-foreground hover:text-foreground p-1 transition-colors cursor-pointer",
                              title: "Copy command",
                              children: copiedDocker ? /* @__PURE__ */ jsx(Check, { className: "h-3 w-3 text-emerald-400" }) : /* @__PURE__ */ jsx(Copy, { className: "h-3 w-3" })
                            }
                          )
                        ] }),
                        /* @__PURE__ */ jsx("code", { className: "block text-[10px] bg-background/50 p-2 rounded font-mono text-foreground leading-normal", children: "docker run -d -p 27017:27017 --name iracing-mongo mongo:latest" })
                      ] })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "pt-3 border-t border-border/40 flex items-center justify-between gap-4", children: [
                    /* @__PURE__ */ jsxs("div", { children: [
                      /* @__PURE__ */ jsx("h4", { className: "text-xs font-semibold text-foreground", children: "Browser File Cache" }),
                      /* @__PURE__ */ jsx("p", { className: "text-[11px] text-muted-foreground leading-snug", children: "Telemetry binary files are saved locally in browser IndexedDB." })
                    ] }),
                    /* @__PURE__ */ jsxs(
                      Button,
                      {
                        type: "button",
                        variant: "destructive",
                        size: "sm",
                        onClick: clearIndexedDb,
                        className: "font-mono text-[10px] uppercase tracking-wider gap-1.5 shrink-0",
                        children: [
                          /* @__PURE__ */ jsx(Trash2, { className: "h-3.5 w-3.5" }),
                          "Clear File Cache"
                        ]
                      }
                    )
                  ] })
                ]
              }
            ),
            /* @__PURE__ */ jsxs(
              TabsContent,
              {
                value: "ai",
                className: "flex-1 overflow-y-auto px-6 py-5 space-y-5 focus:outline-none",
                children: [
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("div", { className: "mb-2.5 text-[10px] uppercase tracking-wider text-muted-foreground", children: "AI Provider Software" }),
                    /* @__PURE__ */ jsx("div", { className: "grid gap-2 grid-cols-1 sm:grid-cols-2", children: LLM_PROVIDERS.map((p) => /* @__PURE__ */ jsxs(
                      "label",
                      {
                        className: `flex cursor-pointer items-start gap-2.5 rounded-lg border p-2.5 hover:bg-accent/40 transition-colors ${llmProvider === p.id ? "border-primary bg-primary/5" : "border-border bg-panel"}`,
                        children: [
                          /* @__PURE__ */ jsx(
                            "input",
                            {
                              type: "radio",
                              name: "llmProvider",
                              checked: llmProvider === p.id,
                              onChange: () => applyAiDefaults(p.id),
                              className: "mt-1 shrink-0 cursor-pointer"
                            }
                          ),
                          /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
                            /* @__PURE__ */ jsxs("div", { className: "text-xs font-medium flex items-center gap-1.5 text-foreground", children: [
                              /* @__PURE__ */ jsx(p.icon, { className: "h-3.5 w-3.5 shrink-0 text-primary" }),
                              p.name
                            ] }),
                            /* @__PURE__ */ jsx("div", { className: "text-[10px] text-muted-foreground mt-0.5 leading-snug line-clamp-2", children: p.desc })
                          ] })
                        ]
                      },
                      p.id
                    )) })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "space-y-4 border-t border-border/40 pt-4 animate-in fade-in slide-in-from-top-2", children: [
                    /* @__PURE__ */ jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
                      /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
                        /* @__PURE__ */ jsx("label", { className: "text-[10px] uppercase tracking-wider text-muted-foreground block", children: "Base URL (OpenAI Compatible)" }),
                        /* @__PURE__ */ jsx(
                          Input,
                          {
                            type: "text",
                            value: llmBaseUrl,
                            onChange: (e) => {
                              setLlmBaseUrl(e.target.value);
                              setAiTestResult(null);
                            },
                            placeholder: activeProviderInfo?.url || "http://localhost:1234/v1",
                            className: "font-mono text-xs"
                          }
                        )
                      ] }),
                      /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
                        /* @__PURE__ */ jsx("label", { className: "text-[10px] uppercase tracking-wider text-muted-foreground block", children: "Model ID" }),
                        /* @__PURE__ */ jsx(
                          Input,
                          {
                            type: "text",
                            value: llmModelId,
                            onChange: (e) => {
                              setLlmModelId(e.target.value);
                              setAiTestResult(null);
                            },
                            placeholder: "e.g. liquid/lfm2.5-1.2b, llama-3-8b-instruct",
                            className: "font-mono text-xs"
                          }
                        )
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
                      /* @__PURE__ */ jsx("label", { className: "text-[10px] uppercase tracking-wider text-muted-foreground block", children: "API Token / Permission Key (Optional)" }),
                      /* @__PURE__ */ jsx(
                        Input,
                        {
                          type: "password",
                          value: llmApiKey,
                          onChange: (e) => {
                            setLlmApiKey(e.target.value);
                            setAiTestResult(null);
                          },
                          placeholder: "Enter LM Studio token or Bearer key if required",
                          className: "font-mono text-xs"
                        }
                      ),
                      /* @__PURE__ */ jsx("p", { className: "text-[9px] text-muted-foreground mt-1", children: "Required if your local server uses token authentication (e.g. LM Studio 0.4.0+)." })
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "pt-2", children: [
                      /* @__PURE__ */ jsxs(
                        Button,
                        {
                          type: "button",
                          variant: "secondary",
                          size: "sm",
                          onClick: runAiTest,
                          disabled: aiTesting,
                          className: "w-full font-mono text-[10px] uppercase tracking-wider gap-1.5",
                          children: [
                            /* @__PURE__ */ jsx(RefreshCw, { className: `h-3 w-3 ${aiTesting ? "animate-spin" : ""}` }),
                            aiTesting ? "Testing Connection..." : "Test Local Host Software Connection"
                          ]
                        }
                      ),
                      aiTestResult && /* @__PURE__ */ jsxs(
                        "div",
                        {
                          className: `mt-3 rounded-lg p-3 border text-xs ${aiTestResult.success ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-400" : "border-rose-500/30 bg-rose-500/5 text-rose-400"}`,
                          children: [
                            /* @__PURE__ */ jsx("div", { className: "font-semibold uppercase tracking-wider text-[10px] mb-1 font-mono", children: aiTestResult.success ? "✓ AI Connection Successful" : "✗ Connection Failed" }),
                            /* @__PURE__ */ jsx("div", { className: "whitespace-pre-line leading-relaxed font-mono text-[10px]", children: aiTestResult.message })
                          ]
                        }
                      )
                    ] })
                  ] })
                ]
              }
            ),
            /* @__PURE__ */ jsxs(
              TabsContent,
              {
                value: "licensing",
                className: "flex-1 overflow-y-auto px-6 py-5 space-y-5 focus:outline-none",
                children: [
                  /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-2", children: [
                    /* @__PURE__ */ jsxs("h3", { className: "text-xs font-mono uppercase tracking-wider text-primary font-semibold flex items-center gap-1.5", children: [
                      /* @__PURE__ */ jsx(Key, { className: "h-4 w-4" }),
                      "Hardware-Locked Licensing"
                    ] }),
                    /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground leading-relaxed", children: "Unlock advanced offline analysis sheets and high-frequency real-time widgets. Your license key is cryptographically signed and locked to this PC's hardware." }),
                    /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground leading-relaxed", children: [
                      /* @__PURE__ */ jsx("strong", { children: "Accessory devices:" }),
                      " Any auxiliary dash readouts (phones, tablets, second PCs) connected to this PC's local IP address will automatically inherit this license!"
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-border bg-panel p-4 space-y-3", children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b border-border/40 pb-2", children: [
                      /* @__PURE__ */ jsx("span", { className: "text-[10px] font-mono uppercase tracking-wider text-muted-foreground", children: "Activation Status" }),
                      licenseChecking ? /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase font-mono tracking-wider", children: [
                        /* @__PURE__ */ jsx(RefreshCw, { className: "h-3 w-3 animate-spin" }),
                        " Verifying..."
                      ] }) : licenseState && licenseState.valid ? /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5 text-[10px] text-emerald-400 uppercase font-mono tracking-wider font-semibold", children: [
                        /* @__PURE__ */ jsx(CheckCircle2, { className: "h-3.5 w-3.5" }),
                        " Activated (",
                        licenseState.tier.toUpperCase(),
                        ")"
                      ] }) : /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5 text-[10px] text-rose-400 uppercase font-mono tracking-wider font-semibold", children: [
                        /* @__PURE__ */ jsx(AlertCircle, { className: "h-3.5 w-3.5" }),
                        " Lite Tier (Free)"
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b border-border/40 pb-2", children: [
                      /* @__PURE__ */ jsx("span", { className: "text-[10px] font-mono uppercase tracking-wider text-muted-foreground", children: "Hardware ID (HWID)" }),
                      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                        /* @__PURE__ */ jsx("span", { className: "text-xs font-mono text-foreground font-semibold bg-rail px-2 py-0.5 rounded border border-border select-all", children: hwid || "Loading..." }),
                        /* @__PURE__ */ jsx(
                          "button",
                          {
                            onClick: () => hwid && copyHWIDToClipboard(),
                            className: "text-muted-foreground hover:text-foreground p-1 transition-colors cursor-pointer",
                            title: "Copy HWID",
                            children: copiedHwid ? /* @__PURE__ */ jsx(Check, { className: "h-3 w-3 text-emerald-400" }) : /* @__PURE__ */ jsx(Copy, { className: "h-3 w-3" })
                          }
                        )
                      ] })
                    ] }),
                    licenseState && licenseState.valid && /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                      /* @__PURE__ */ jsx("span", { className: "text-[10px] font-mono uppercase tracking-wider text-muted-foreground", children: "Expiration Date" }),
                      /* @__PURE__ */ jsx("span", { className: "text-xs font-mono text-foreground font-semibold", children: licenseState.expires === "never" ? "Lifetime / No Expiration" : licenseState.expires })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
                    /* @__PURE__ */ jsx("h3", { className: "text-xs font-mono uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-1", children: "Activate License Key" }),
                    /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                      /* @__PURE__ */ jsx("label", { className: "text-[10px] uppercase tracking-wider text-muted-foreground block", children: "Paste Key Payload" }),
                      /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
                        /* @__PURE__ */ jsx(
                          Input,
                          {
                            type: "password",
                            value: licenseKeyInput,
                            onChange: (e) => setLicenseKeyInput(e.target.value),
                            placeholder: "Paste your base64.signature license key here...",
                            className: "font-mono text-xs flex-1"
                          }
                        ),
                        /* @__PURE__ */ jsx(
                          Button,
                          {
                            type: "button",
                            onClick: handleActivateLicense,
                            disabled: activatingLicense || !licenseKeyInput,
                            size: "sm",
                            className: "font-mono text-xs uppercase",
                            children: activatingLicense ? "Activating..." : "Activate"
                          }
                        )
                      ] }),
                      /* @__PURE__ */ jsx("p", { className: "text-[10px] text-muted-foreground leading-normal", children: "Paste the license key received for your HWID and click Activate. This will save the credentials locally in the bridge workspace." })
                    ] })
                  ] })
                ]
              }
            ),
            /* @__PURE__ */ jsxs(
              TabsContent,
              {
                value: "shortcuts",
                className: "flex-1 overflow-y-auto px-6 py-5 space-y-4 focus:outline-none",
                children: [
                  /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
                    /* @__PURE__ */ jsx("h3", { className: "text-xs font-mono uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-1", children: "Global Keyboard Shortcuts" }),
                    /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground leading-relaxed", children: "These shortcuts are active globally across all workspaces. They are disabled while editing a form or input field." }),
                    /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-border bg-rail p-4 space-y-3", children: [
                      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b border-border/40 pb-2", children: [
                        /* @__PURE__ */ jsx("span", { className: "text-xs font-mono text-foreground font-medium", children: "Toggle Shortcuts Help" }),
                        /* @__PURE__ */ jsx("span", { className: "rounded border border-border bg-background px-2 py-0.5 text-[10px] font-mono font-semibold uppercase text-primary font-bold", children: "?" })
                      ] }),
                      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b border-border/40 pb-2", children: [
                        /* @__PURE__ */ jsx("span", { className: "text-xs font-mono text-foreground font-medium", children: "Toggle Settings Panel" }),
                        /* @__PURE__ */ jsxs("div", { className: "flex gap-1.5 items-center", children: [
                          /* @__PURE__ */ jsx("span", { className: "rounded border border-border bg-background px-2 py-0.5 text-[10px] font-mono font-semibold uppercase text-primary font-bold", children: "Ctrl" }),
                          /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground font-mono", children: "+" }),
                          /* @__PURE__ */ jsx("span", { className: "rounded border border-border bg-background px-2 py-0.5 text-[10px] font-mono font-semibold uppercase text-primary font-bold", children: "," })
                        ] })
                      ] }),
                      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b border-border/40 pb-2", children: [
                        /* @__PURE__ */ jsx("span", { className: "text-xs font-mono text-foreground font-medium", children: "Go Home (Dashboard)" }),
                        /* @__PURE__ */ jsxs("div", { className: "flex gap-1 items-center", children: [
                          /* @__PURE__ */ jsx("span", { className: "rounded border border-border bg-background px-2 py-0.5 text-[10px] font-mono font-semibold uppercase text-primary font-bold", children: "g" }),
                          /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground text-[10px] font-mono", children: "then" }),
                          /* @__PURE__ */ jsx("span", { className: "rounded border border-border bg-background px-2 py-0.5 text-[10px] font-mono font-semibold uppercase text-primary font-bold", children: "h" })
                        ] })
                      ] }),
                      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                        /* @__PURE__ */ jsx("span", { className: "text-xs font-mono text-foreground font-medium", children: "Go Back (or Home)" }),
                        /* @__PURE__ */ jsx("span", { className: "rounded border border-border bg-background px-2 py-0.5 text-[10px] font-mono font-semibold uppercase text-primary font-bold", children: "Esc" })
                      ] })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-border bg-panel p-3.5 text-xs text-muted-foreground", children: [
                    /* @__PURE__ */ jsx("h4", { className: "font-semibold text-foreground mb-1", children: "💡 Quick Tip" }),
                    "Pressing ",
                    /* @__PURE__ */ jsx("kbd", { className: "font-mono text-primary font-bold", children: "Esc" }),
                    " inside settings dialogs or guides will immediately close them."
                  ] })
                ]
              }
            )
          ]
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "hairline-t flex items-center justify-between px-6 py-4 bg-panel shrink-0 border-t border-border/60", children: [
        activeTab === "ai" ? /* @__PURE__ */ jsxs(
          Button,
          {
            variant: "outline",
            size: "sm",
            onClick: () => applyAiDefaults("cloud"),
            className: "gap-1.5 font-mono text-xs",
            children: [
              /* @__PURE__ */ jsx(RotateCcw, { className: "h-3.5 w-3.5" }),
              "Reset AI"
            ]
          }
        ) : /* @__PURE__ */ jsx("div", {}),
        /* @__PURE__ */ jsx(
          Button,
          {
            size: "sm",
            onClick: () => setOpen(false),
            className: "font-mono text-xs cursor-pointer",
            children: "Done"
          }
        )
      ] })
    ] }) })
  ] });
}
function NotFoundComponent() {
  return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-7xl font-bold text-foreground", children: "404" }),
    /* @__PURE__ */ jsx("h2", { className: "mt-4 text-xl font-semibold text-foreground", children: "Page not found" }),
    /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "The page you're looking for doesn't exist or has been moved." }),
    /* @__PURE__ */ jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsx(
      Link,
      {
        to: "/",
        className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
        children: "Go home"
      }
    ) })
  ] }) });
}
function ErrorComponent({ error, reset }) {
  console.error(error);
  const router2 = useRouter();
  return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-xl font-semibold tracking-tight text-foreground", children: "This page didn't load" }),
    /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Something went wrong on our end. You can try refreshing or head back home." }),
    /* @__PURE__ */ jsxs("div", { className: "mt-6 flex flex-wrap justify-center gap-2", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => {
            router2.invalidate();
            reset();
          },
          className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
          children: "Try again"
        }
      ),
      /* @__PURE__ */ jsx(
        "a",
        {
          href: "/",
          className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
          children: "Go home"
        }
      )
    ] })
  ] }) });
}
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https:",
  // Supabase + local bridge WebSocket & API for /live + cloud AI endpoint health probes
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co ws://localhost:* ws://127.0.0.1:* http://localhost:* http://127.0.0.1:* https://generativelanguage.googleapis.com",
  "worker-src 'self' blob:",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'"
].join("; ");
const Route$j = createRootRouteWithContext()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { httpEquiv: "Content-Security-Policy", content: CSP },
      { name: "referrer", content: "strict-origin-when-cross-origin" },
      { title: "Pit Wall — Live iRacing Telemetry & Lap Analysis" },
      {
        name: "description",
        content: "Pit Wall combines live iRacing telemetry from a local bridge with a MoTeC-style .ibt lap analysis workbench."
      },
      { name: "author", content: "Pit Wall" },
      { property: "og:site_name", content: "Pit Wall" },
      { property: "og:title", content: "Pit Wall — Live iRacing Telemetry & Lap Analysis" },
      {
        property: "og:description",
        content: "Live telemetry dashboard + .ibt lap analysis workbench, AI coach and sharing."
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Pit Wall — Live iRacing Telemetry & Lap Analysis" },
      {
        name: "twitter:description",
        content: "Live telemetry dashboard + .ibt lap analysis workbench, AI coach and sharing."
      },
      { name: "theme-color", content: "#1a1d21" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-title", content: "Pit Wall" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" }
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "stylesheet", href: upCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700;800;900&family=IBM+Plex+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Geist+Mono:wght@400;500;600;700&family=Rajdhani:wght@500;600;700&family=Orbitron:wght@500;700;900&display=swap"
      }
    ]
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent
});
function RootShell({ children }) {
  return /* @__PURE__ */ jsxs("html", { lang: "en", className: "dark", children: [
    /* @__PURE__ */ jsx("head", { children: /* @__PURE__ */ jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxs("body", { className: "bg-background text-foreground", children: [
      children,
      /* @__PURE__ */ jsx(Scripts, {})
    ] })
  ] });
}
function RootComponent() {
  const { queryClient } = Route$j.useRouteContext();
  const router2 = useRouter();
  const t = useTelemetry();
  useEffect(() => {
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(() => {
      router2.invalidate();
      queryClient.invalidateQueries();
    });
    return () => subscription.unsubscribe();
  }, [router2, queryClient]);
  useEffect(() => {
    if (typeof window !== "undefined" && window.navigator.userAgent.toLowerCase().includes("electron")) {
      document.documentElement.classList.add("is-electron");
    }
  }, []);
  return /* @__PURE__ */ jsx(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsx(AuthProvider, { children: /* @__PURE__ */ jsxs(ThemeProvider, { children: [
    /* @__PURE__ */ jsx(LiveBridgeSync, { t }),
    /* @__PURE__ */ jsx(DesktopLapSync, {}),
    /* @__PURE__ */ jsx(HelpSystem, {}),
    /* @__PURE__ */ jsx(GlobalSettingsDialog, {}),
    /* @__PURE__ */ jsx(KeyboardShortcuts, {}),
    /* @__PURE__ */ jsx(Outlet, {}),
    /* @__PURE__ */ jsx(Toaster, {})
  ] }) }) });
}
const $$splitComponentImporter$h = () => import("./team-guide-8Vp3B4VK.js");
const Route$i = createFileRoute("/team-guide")({
  head: () => ({
    meta: [{
      title: "Team Setup Guide — Pit Wall Operations Center"
    }, {
      name: "description",
      content: "High-density tactical setup and role guide for iRacing realtime relay pit wall sessions. Configure Supabase channels and local bridge pub/sub."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$h, "component")
});
const $$splitComponentImporter$g = () => import("./team-CqedXy40.js");
const Route$h = createFileRoute("/team")({
  head: () => ({
    meta: [{
      title: "Team Command — Pit Wall Operations Center"
    }, {
      name: "description",
      content: "Cinematic multi-driver race strategy command center. Coordinate stints, track active telemetry links, and calculate fuel targets."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$g, "component")
});
const $$splitComponentImporter$f = () => import("./settings-BvhrLl3D.js");
const Route$g = createFileRoute("/settings")({
  head: () => ({
    meta: [{
      title: "Settings - Pit Wall"
    }, {
      name: "description",
      content: "Configure AI provider, local LLM host, and local MongoDB diagnostics."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$f, "component")
});
const $$splitComponentImporter$e = () => import("./runtime-BjuSdjR_.js");
const Route$f = createFileRoute("/runtime")({
  head: () => ({
    meta: [{
      title: "Pit Wall Workstation — Runtime Initialization"
    }, {
      name: "description",
      content: "Pit Wall workstation runtime environment is initializing."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$e, "component")
});
const $$splitComponentImporter$d = () => import("./roadmap-BL5lPcH7.js");
const Route$e = createFileRoute("/roadmap")({
  head: () => ({
    meta: [{
      title: "Roadmap — Pit Wall"
    }, {
      name: "description",
      content: "Pit Wall development roadmap — what's been built and what's coming next."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$d, "component")
});
const $$splitComponentImporter$c = () => import("./live-CG0avR6A.js");
const Route$d = createFileRoute("/live")({
  head: () => ({
    meta: [{
      title: "Pit Wall — Live iRacing Telemetry Workbench"
    }, {
      name: "description",
      content: "MoTeC-style live iRacing telemetry workbench. Rolling channel traces, G-G scatter, channel list, sector + tyre data straight from the bridge."
    }, {
      property: "og:title",
      content: "Pit Wall — Live iRacing Telemetry Workbench"
    }, {
      property: "og:description",
      content: "MoTeC-style live iRacing telemetry workbench. Rolling channel traces, G-G scatter, channel list, sector + tyre data straight from the bridge."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$c, "component")
});
const $$splitComponentImporter$b = () => import("./how-it-works-De8v82N6.js");
const Route$c = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [{
      title: "How it works — Pit Wall"
    }, {
      name: "description",
      content: "How Pit Wall parses iRacing .ibt telemetry files in your browser and renders a MoTeC-style analysis workbench."
    }, {
      property: "og:title",
      content: "How Pit Wall works"
    }, {
      property: "og:description",
      content: "From .ibt binary to stacked traces, track map and lap compare — the parsing pipeline explained."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$b, "component")
});
const $$splitComponentImporter$a = () => import("./fingerprint-WRFXWVQr.js");
const Route$b = createFileRoute("/fingerprint")({
  head: () => ({
    meta: [{
      title: "Driver Fingerprint — Pit Wall"
    }, {
      name: "description",
      content: "Upload your iRacing lapfiles folder to build a baseline driver fingerprint from every track and car you've ever set a reference lap on."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$a, "component")
});
const $$splitComponentImporter$9 = () => import("./driver-bridge-D1-Go4PC.js");
const Route$a = createFileRoute("/driver-bridge")({
  head: () => ({
    meta: [{
      title: "Driver Cockpit HUD — Pit Wall"
    }, {
      name: "description",
      content: "Simplified high-performance live telemetry cockpit HUD designed specifically for drivers."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
const $$splitComponentImporter$8 = () => import("./auth-0xg4pPaJ.js");
const Route$9 = createFileRoute("/auth")({
  head: () => ({
    meta: [{
      title: "Welcome — Pit Wall"
    }, {
      name: "description",
      content: "Welcome to your local Pit Wall telemetry workbench."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
const $$splitComponentImporter$7 = () => import("./ai-engineer--7eRSPFg.js");
const Route$8 = createFileRoute("/ai-engineer")({
  head: () => ({
    meta: [{
      title: "AI Engineer Console — Pit Wall Terminal"
    }, {
      name: "description",
      content: "Motorsport engineering terminal. Receive tire pressure and damper advice mapped directly to telemetry logs."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
const $$splitComponentImporter$6 = () => import("./admin-FW7pC9ti.js");
const Route$7 = createFileRoute("/admin")({
  head: () => ({
    meta: [{
      title: "Admin — Pit Wall"
    }, {
      name: "robots",
      content: "noindex"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
const $$splitComponentImporter$5 = () => import("./index-Z5uOt0XF.js");
const Route$6 = createFileRoute("/")({
  head: () => ({
    meta: [{
      title: "Pit Wall — Motorsport Engineering & Lap Analysis"
    }, {
      name: "description",
      content: "Motorsport engineering command center. Stream live iRacing telemetry at 60Hz and analyze laps with professional stacked traces and AI strategies."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
const $$splitComponentImporter$4 = () => import("./sessions.index-CiOZzlXq.js");
const Route$5 = createFileRoute("/sessions/")({
  head: () => ({
    meta: [{
      title: "Sessions — Pit Wall"
    }, {
      name: "description",
      content: "Your uploaded iRacing telemetry sessions."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
const $$splitComponentImporter$3 = () => import("./share._token-BJ4IVZUP.js");
const Route$4 = createFileRoute("/share/$token")({
  head: ({
    params
  }) => {
    const og = `/api/public/og/share/${params.token}`;
    return {
      meta: [{
        title: "Shared Lap — Pit Wall"
      }, {
        name: "description",
        content: "Public read-only telemetry lap card."
      }, {
        property: "og:title",
        content: "Shared Lap — Pit Wall"
      }, {
        property: "og:description",
        content: "Public read-only telemetry lap card."
      }, {
        property: "og:image",
        content: og
      }, {
        property: "og:image:width",
        content: "1200"
      }, {
        property: "og:image:height",
        content: "630"
      }, {
        property: "og:type",
        content: "website"
      }, {
        name: "twitter:card",
        content: "summary_large_image"
      }, {
        name: "twitter:image",
        content: og
      }]
    };
  },
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
const $$splitComponentImporter$2 = () => import("./sessions._id-CAJaAE3T.js").then((n) => n.s);
const Route$3 = createFileRoute("/sessions/$id")({
  head: () => ({
    meta: [{
      title: "Workbench — Pit Wall"
    }, {
      name: "description",
      content: "Telemetry workbench for an iRacing .ibt session."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const $$splitComponentImporter$1 = () => import("./lab.lapfile-C-4VAndY.js");
const Route$2 = createFileRoute("/lab/lapfile")({
  head: () => ({
    meta: [{
      title: "Lapfile Lab — Pit Wall"
    }, {
      name: "description",
      content: "Inspect iRacing .olap / .blap / .plap reference lap files."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitComponentImporter = () => import("./detached._instrument-DGhTeqKf.js");
const Route$1 = createFileRoute("/detached/$instrument")({
  head: () => ({
    meta: [{
      title: "Detached Cockpit Monitor — Pit Wall"
    }, {
      name: "description",
      content: "Standalone motorsport command window."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
function esc(s) {
  return s.replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]
  );
}
function fmtLap(s) {
  if (s == null) return "—";
  const m = Math.floor(s / 60);
  const r = (s - m * 60).toFixed(3).padStart(6, "0");
  return `${m}:${r}`;
}
const Route = createFileRoute("/api/public/og/share/$token")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const { data: share } = await supabaseAdmin.from("shared_laps").select("session_id, ref_lap, cmp_lap, revoked_at, expires_at").eq("token", params.token).maybeSingle();
        let track = "Shared Lap";
        let car = "Pit Wall telemetry";
        let refLap = null;
        let cmpLap = null;
        let bestLapS = null;
        let badge = "SHARED LAP";
        if (share) {
          if (share.revoked_at) badge = "REVOKED";
          else if (share.expires_at && new Date(share.expires_at) < /* @__PURE__ */ new Date()) badge = "EXPIRED";
          refLap = share.ref_lap;
          cmpLap = share.cmp_lap;
          const { data: sess } = await supabaseAdmin.from("telemetry_sessions").select("track, car, best_lap_s").eq("id", share.session_id).single();
          if (sess) {
            track = sess.track ?? track;
            car = sess.car ?? car;
            bestLapS = sess.best_lap_s != null ? Number(sess.best_lap_s) : null;
          }
        }
        const w = 1200;
        const h = 630;
        const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0b0d10"/>
      <stop offset="100%" stop-color="#15191f"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#ff5b1f"/>
      <stop offset="100%" stop-color="#ffb347"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#bg)"/>
  <rect x="0" y="0" width="${w}" height="6" fill="url(#accent)"/>
  <g font-family="ui-monospace,SFMono-Regular,Menlo,monospace" fill="#e6e8eb">
    <text x="64" y="120" font-size="22" letter-spacing="6" fill="#9aa3ad">PIT WALL · ${esc(badge)}</text>
    <text x="64" y="220" font-size="78" font-weight="700">${esc(track)}</text>
    <text x="64" y="270" font-size="30" fill="#9aa3ad">${esc(car)}</text>
    <g transform="translate(64,360)">
      <text x="0" y="0" font-size="22" letter-spacing="4" fill="#9aa3ad">REF LAP</text>
      <text x="0" y="60" font-size="64" font-weight="700">L${refLap ?? "—"}</text>
      <text x="0" y="100" font-size="26" fill="#ff8a4c">${fmtLap(bestLapS)}</text>
    </g>
    ${cmpLap != null ? `<g transform="translate(420,360)">
      <text x="0" y="0" font-size="22" letter-spacing="4" fill="#9aa3ad">VS</text>
      <text x="0" y="60" font-size="64" font-weight="700">L${cmpLap}</text>
      <text x="0" y="100" font-size="26" fill="#9aa3ad">ghost compare</text>
    </g>` : ""}
    <text x="64" y="${h - 48}" font-size="20" fill="#6b7280">pit wall · iRacing telemetry workbench</text>
  </g>
</svg>`;
        return new Response(svg, {
          status: 200,
          headers: {
            "Content-Type": "image/svg+xml; charset=utf-8",
            "Cache-Control": "public, max-age=300, s-maxage=300"
          }
        });
      }
    }
  }
});
const TeamGuideRoute = Route$i.update({
  id: "/team-guide",
  path: "/team-guide",
  getParentRoute: () => Route$j
});
const TeamRoute = Route$h.update({
  id: "/team",
  path: "/team",
  getParentRoute: () => Route$j
});
const SettingsRoute = Route$g.update({
  id: "/settings",
  path: "/settings",
  getParentRoute: () => Route$j
});
const RuntimeRoute = Route$f.update({
  id: "/runtime",
  path: "/runtime",
  getParentRoute: () => Route$j
});
const RoadmapRoute = Route$e.update({
  id: "/roadmap",
  path: "/roadmap",
  getParentRoute: () => Route$j
});
const LiveRoute = Route$d.update({
  id: "/live",
  path: "/live",
  getParentRoute: () => Route$j
});
const HowItWorksRoute = Route$c.update({
  id: "/how-it-works",
  path: "/how-it-works",
  getParentRoute: () => Route$j
});
const FingerprintRoute = Route$b.update({
  id: "/fingerprint",
  path: "/fingerprint",
  getParentRoute: () => Route$j
});
const DriverBridgeRoute = Route$a.update({
  id: "/driver-bridge",
  path: "/driver-bridge",
  getParentRoute: () => Route$j
});
const AuthRoute = Route$9.update({
  id: "/auth",
  path: "/auth",
  getParentRoute: () => Route$j
});
const AiEngineerRoute = Route$8.update({
  id: "/ai-engineer",
  path: "/ai-engineer",
  getParentRoute: () => Route$j
});
const AdminRoute = Route$7.update({
  id: "/admin",
  path: "/admin",
  getParentRoute: () => Route$j
});
const IndexRoute = Route$6.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$j
});
const SessionsIndexRoute = Route$5.update({
  id: "/sessions/",
  path: "/sessions/",
  getParentRoute: () => Route$j
});
const ShareTokenRoute = Route$4.update({
  id: "/share/$token",
  path: "/share/$token",
  getParentRoute: () => Route$j
});
const SessionsIdRoute = Route$3.update({
  id: "/sessions/$id",
  path: "/sessions/$id",
  getParentRoute: () => Route$j
});
const LabLapfileRoute = Route$2.update({
  id: "/lab/lapfile",
  path: "/lab/lapfile",
  getParentRoute: () => Route$j
});
const DetachedInstrumentRoute = Route$1.update({
  id: "/detached/$instrument",
  path: "/detached/$instrument",
  getParentRoute: () => Route$j
});
const ApiPublicOgShareTokenRoute = Route.update({
  id: "/api/public/og/share/$token",
  path: "/api/public/og/share/$token",
  getParentRoute: () => Route$j
});
const rootRouteChildren = {
  IndexRoute,
  AdminRoute,
  AiEngineerRoute,
  AuthRoute,
  DriverBridgeRoute,
  FingerprintRoute,
  HowItWorksRoute,
  LiveRoute,
  RoadmapRoute,
  RuntimeRoute,
  SettingsRoute,
  TeamRoute,
  TeamGuideRoute,
  DetachedInstrumentRoute,
  LabLapfileRoute,
  SessionsIdRoute,
  ShareTokenRoute,
  SessionsIndexRoute,
  ApiPublicOgShareTokenRoute
};
const routeTree = Route$j._addFileChildren(rootRouteChildren)._addFileTypes();
const getRouter = () => {
  const queryClient = new QueryClient();
  const router2 = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0
  });
  return router2;
};
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  setBridgePerformanceMode as A,
  Button as B,
  supabase as C,
  DARK_THEME as D,
  testLLMConnection as E,
  testLocalDbConnection as F,
  upsertMyChannelLayout as G,
  upsertMyGearRatios as H,
  Input as I,
  useAuth as J,
  useTelemetry as K,
  LAYOUT_PROFILES as L,
  useTheme as M,
  useWorkbench as N,
  voteCommunityItem as O,
  PRESETS as P,
  Route$4 as R,
  SETUP_BIBLE as S,
  THEME_GROUPS as T,
  WORKSPACES as W,
  DEFAULT_CHANNELS as a,
  Route$3 as b,
  Route$1 as c,
  THEME_SCHEMA_VERSION as d,
  Tabs as e,
  TabsContent as f,
  TabsList as g,
  TabsTrigger as h,
  buildThemeFile as i,
  cn as j,
  colorForChannel as k,
  dispatchAdvisorCall as l,
  dispatchAnalyzeTelemetry as m,
  dispatchLiveCoach as n,
  getBridgePerformanceMode as o,
  getBridgePerformanceSnapshot as p,
  getBridgeUrl as q,
  getDbConfig as r,
  listCommunityChannelLayouts as s,
  listCommunityGearRatios as t,
  migrateThemeFile as u,
  publishMyChannelLayout as v,
  publishMyGearRatios as w,
  resolveLLMUrl as x,
  router as y,
  saveDbConfig as z
};
