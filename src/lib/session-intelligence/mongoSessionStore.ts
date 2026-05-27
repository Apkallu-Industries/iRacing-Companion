/**
 * mongoSessionStore — Pit Wall Historical Intelligence Client
 *
 * React-side client for querying historical session and event data from
 * MongoDB via the bridge's HTTP API endpoints.
 *
 * This is the query layer that enables cross-session intelligence:
 *   "Show every Turn 8 instability event at Spa in the BMW M4 GT3"
 *
 * All queries go through the local bridge (port 3001), which proxies
 * MongoDB queries. This keeps MongoDB access server-side (Node.js) and
 * avoids exposing the MongoDB driver to the browser context.
 */

import { useState, useEffect, useCallback } from "react";

const BRIDGE_BASE = "http://localhost:3001";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface StoredSession {
  _id: string;
  bridge_id: string;
  user_id: string;
  start_time: string;
  end_time: string | null;
  track: string;
  car: string;
  driver: string;
  sample_count: number;
  lap_count: number;
}

export interface StoredLap {
  _id: string;
  session_id: string;
  lap_number: number;
  duration_s: number;
  fuel_remaining_l: number;
  track_temp_c: number;
  air_temp_c: number;
  recorded_at: string;
}

export interface StoredEvent {
  _id: string;
  session_id: string;
  timestamp: string;
  track: string;
  car: string;
  category: string;
  severity: "critical" | "warning" | "info";
  label: string;
  description: string;
  cornerNumber?: number;
}

export interface MongoStatus {
  connected: boolean;
  uri: string | null;
  sessionId: string | null;
  sampleCount: number;
}

export interface EventQueryParams {
  track?: string;
  car?: string;
  category?: string;
  severity?: "critical" | "warning" | "info";
  corner?: number;
}

// ─── Core fetch utilities ─────────────────────────────────────────────────────

async function bridgeGet<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${BRIDGE_BASE}${path}`, {
      signal: AbortSignal.timeout(5000),
      cache: "no-store",
    });
    if (!res.ok) return null;
    return await res.json() as T;
  } catch {
    return null;
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Fetch MongoDB recording status from the bridge.
 */
export async function fetchMongoStatus(): Promise<MongoStatus> {
  const result = await bridgeGet<MongoStatus>("/api/mongo/status");
  return result ?? { connected: false, uri: null, sessionId: null, sampleCount: 0 };
}

/**
 * Fetch recent sessions (most recent 20).
 */
export async function fetchSessions(): Promise<StoredSession[]> {
  const result = await bridgeGet<{ sessions: StoredSession[] }>("/api/sessions");
  return result?.sessions ?? [];
}

/**
 * Fetch laps for a specific session.
 */
export async function fetchLaps(sessionId: string): Promise<StoredLap[]> {
  const result = await bridgeGet<{ laps: StoredLap[] }>(
    `/api/sessions/laps?sessionId=${encodeURIComponent(sessionId)}`
  );
  return result?.laps ?? [];
}

/**
 * Query scanner events across all sessions with filters.
 * This is the cross-session intelligence query.
 */
export async function fetchEvents(params: EventQueryParams = {}): Promise<StoredEvent[]> {
  const qs = new URLSearchParams();
  if (params.track)    qs.set("track",    params.track);
  if (params.car)      qs.set("car",      params.car);
  if (params.category) qs.set("category", params.category);
  if (params.severity) qs.set("severity", params.severity);
  if (params.corner !== undefined) qs.set("corner", String(params.corner));

  const result = await bridgeGet<{ events: StoredEvent[] }>(
    `/api/events${qs.toString() ? `?${qs}` : ""}`
  );
  return result?.events ?? [];
}

// ─── React hooks ─────────────────────────────────────────────────────────────

/**
 * Hook: live MongoDB recording status, polling at 2Hz.
 */
export function useMongoStatus(): MongoStatus & { loading: boolean } {
  const [status, setStatus] = useState<MongoStatus>({
    connected: false,
    uri: null,
    sessionId: null,
    sampleCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const poll = async () => {
      const s = await fetchMongoStatus();
      if (mounted) {
        setStatus(s);
        setLoading(false);
      }
    };

    poll();
    const interval = setInterval(poll, 2000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return { ...status, loading };
}

/**
 * Hook: query historical sessions on mount.
 */
export function useSessions(): {
  sessions: StoredSession[];
  loading: boolean;
  refresh: () => void;
} {
  const [sessions, setSessions] = useState<StoredSession[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const data = await fetchSessions();
    setSessions(data);
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return { sessions, loading, refresh };
}

/**
 * Hook: query events with filters — triggers re-fetch when params change.
 */
export function useEventQuery(params: EventQueryParams): {
  events: StoredEvent[];
  loading: boolean;
  error: string | null;
  query: (p: EventQueryParams) => void;
} {
  const [events, setEvents] = useState<StoredEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeParams, setActiveParams] = useState<EventQueryParams>(params);

  const query = useCallback((p: EventQueryParams) => {
    setActiveParams(p);
  }, []);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    fetchEvents(activeParams).then((data) => {
      if (!mounted) return;
      setEvents(data);
      setLoading(false);
    }).catch((e: Error) => {
      if (!mounted) return;
      setError(e.message);
      setLoading(false);
    });

    return () => { mounted = false; };
  }, [activeParams]);

  return { events, loading, error, query };
}

// ─── Helper formatters ────────────────────────────────────────────────────────

export function formatSessionLabel(session: StoredSession): string {
  const date = new Date(session.start_time);
  const d = date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
  return `${d} · ${session.track} · ${session.car}`;
}

export function formatLapTime(sec: number): string {
  if (!sec || sec <= 0) return "--:--.---";
  const m = Math.floor(sec / 60);
  const s = (sec - m * 60).toFixed(3).padStart(6, "0");
  return `${m}:${s}`;
}
