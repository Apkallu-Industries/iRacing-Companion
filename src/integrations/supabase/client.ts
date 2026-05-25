import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";
import {
  getLocalSessions,
  getLocalSessionById,
  insertLocalSession,
  deleteLocalSession,
} from "../../lib/localDb.functions";
import { localTelemetryStore } from "../../lib/localTelemetryStore";

// Dummy client helper for offline/mock scenarios
const dummyClient = new Proxy({} as any, {
  get(target, prop) {
    if (prop === "auth") {
      return {
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        getSession: async () => ({ data: { session: null } }),
        signOut: async () => {},
      };
    }
    return () => {
      const chain = new Proxy({} as any, {
        get(t, p) {
          if (p === "then") {
            return (resolve: any) => resolve({ data: null, error: null });
          }
          return () => chain;
        },
      });
      return chain;
    };
  },
});

function getProxiedClient() {
  let realClient: any;
  try {
    const SUPABASE_URL =
      import.meta.env.VITE_SUPABASE_URL ||
      (typeof process !== "undefined" ? process.env.SUPABASE_URL : undefined);
    const SUPABASE_PUBLISHABLE_KEY =
      import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
      (typeof process !== "undefined" ? process.env.SUPABASE_PUBLISHABLE_KEY : undefined);

    if (SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY) {
      realClient = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
        auth: {
          storage: typeof window !== "undefined" ? localStorage : undefined,
          persistSession: true,
          autoRefreshToken: true,
        },
      });
    } else {
      console.warn("[Supabase] Credentials missing. Running in local-only mock mode.");
      realClient = dummyClient;
    }
  } catch (err) {
    console.warn("[Supabase] Client creation failed. Falling back to mock.", err);
    realClient = dummyClient;
  }

  // Return a proxy that intercepts 'from' and 'storage' if local developer session is active
  return new Proxy(realClient, {
    get(target, prop, receiver) {
      // 1. Intercept 'from'
      if (prop === "from") {
        return (tableName: string) => {
          const isLocal =
            typeof window !== "undefined" &&
            (localStorage.getItem("apex_local_session") || !import.meta.env.VITE_SUPABASE_URL);
          if (isLocal && tableName === "telemetry_sessions") {
            const builder = {
              select: () => builder,
              order: () => builder,
              eq: (field: string, val: any) => {
                (builder as any)._eqId = val;
                return builder;
              },
              single: () => builder,
              insert: (payload: any) => {
                (builder as any)._insertPayload = payload;
                return builder;
              },
              delete: () => {
                (builder as any)._isDelete = true;
                return builder;
              },
              then: async (resolve: any) => {
                try {
                  if ((builder as any)._isDelete && (builder as any)._eqId) {
                    const res = await deleteLocalSession({ data: (builder as any)._eqId });
                    resolve(res);
                  } else if ((builder as any)._insertPayload) {
                    const res = await insertLocalSession({ data: (builder as any)._insertPayload });
                    resolve(res);
                  } else if ((builder as any)._eqId) {
                    const res = await getLocalSessionById({ data: (builder as any)._eqId });
                    resolve(res);
                  } else {
                    const res = await getLocalSessions();
                    resolve(res);
                  }
                } catch (err: any) {
                  resolve({ data: null, error: { message: err.message } });
                }
              },
            };
            return builder;
          }
          return target.from(tableName);
        };
      }

      // 2. Intercept 'storage'
      if (prop === "storage") {
        const isLocal =
          typeof window !== "undefined" &&
          (localStorage.getItem("apex_local_session") || !import.meta.env.VITE_SUPABASE_URL);
        if (isLocal) {
          return {
            from: (bucketName: string) => {
              if (bucketName === "telemetry") {
                return {
                  upload: async (path: string, blob: Blob) => {
                    try {
                      await localTelemetryStore.saveBlob(path, blob);
                      return { data: { path }, error: null };
                    } catch (e: any) {
                      return { data: null, error: e };
                    }
                  },
                  download: async (path: string) => {
                    try {
                      const blob = await localTelemetryStore.getBlob(path);
                      if (!blob) throw new Error("Local blob not found in IndexedDB");
                      return { data: blob, error: null };
                    } catch (e: any) {
                      return { data: null, error: e };
                    }
                  },
                  remove: async (paths: string[]) => {
                    try {
                      for (const path of paths) {
                        await localTelemetryStore.removeBlob(path);
                      }
                      return { data: paths, error: null };
                    } catch (e: any) {
                      return { data: null, error: e };
                    }
                  },
                };
              }
              // Fallback to real storage client if bucket is different
              return target.storage.from(bucketName);
            },
          };
        }
      }

      return Reflect.get(target, prop, receiver);
    },
  });
}

let _supabase: ReturnType<typeof getProxiedClient> | undefined;

export const supabase = new Proxy({} as ReturnType<typeof getProxiedClient>, {
  get(_, prop, receiver) {
    if (!_supabase) _supabase = getProxiedClient();
    return Reflect.get(_supabase, prop, receiver);
  },
});
