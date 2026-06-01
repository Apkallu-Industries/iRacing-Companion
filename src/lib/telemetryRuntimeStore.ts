import { create } from "zustand";

export interface TelemetryEvent {
  id: string;
  timestampSec: number;
  label: string;
  category: "dynamics" | "thermal" | "hybrid" | "inputs";
  severity: "info" | "warning" | "critical";
  description: string;
  associatedChannels: string[];
  cornerNumber?: number;
  metadata?: Record<string, number>;
}

export type FocusMode = "none" | "brakes" | "ers" | "chassis" | "tires" | "inputs";

interface TelemetryRuntimeState {
  // Playback / Replay States
  cursorTick: number;
  activeLap: number | null;
  playbackSpeed: number;
  isPlaying: boolean;
  
  // Workspace Composition
  activePreset: "gt3" | "gtp" | "coach" | "aero";
  selectedInstrument: "brakes" | "ers" | "chassis" | "tires" | "inputs" | null;
  
  // Event Timeline
  events: TelemetryEvent[];
  activeEvent: TelemetryEvent | null;
  
  // Calibrated Visual Filters
  focusMode: FocusMode;
  
  // Actions
  setCursorTick: (tick: number) => void;
  setActiveLap: (lap: number | null) => void;
  setPlaybackSpeed: (speed: number) => void;
  setPlaying: (playing: boolean) => void;
  setActivePreset: (preset: "gt3" | "gtp" | "coach" | "aero") => void;
  selectInstrument: (instrument: "brakes" | "ers" | "chassis" | "tires" | "inputs" | null) => void;
  
  // Event Timeline Actions
  addEvent: (event: Omit<TelemetryEvent, "id">) => void;
  triggerEvent: (event: TelemetryEvent) => void;
  deleteEvent: (id: string) => void;
  clearEvents: () => void;
  
  // Focus Mode Actions
  setFocusMode: (mode: FocusMode) => void;
  
  // Detached Replay Frame State (for child windows)
  detachedTelemetryFrame: any | null;
  setDetachedTelemetryFrame: (frame: any | null) => void;
}

export const useTelemetryRuntimeStore = create<TelemetryRuntimeState>((set, get) => ({
  cursorTick: 0,
  activeLap: null,
  playbackSpeed: 1,
  isPlaying: false,
  activePreset: "gt3",
  selectedInstrument: null,
  events: [],
  activeEvent: null,
  focusMode: "none",
  detachedTelemetryFrame: null,

  setCursorTick: (tick) => set({ cursorTick: tick }),
  setActiveLap: (lap) => set({ activeLap: lap }),
  setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),
  setPlaying: (playing) => set({ isPlaying: playing }),
  setActivePreset: (preset) => set({ activePreset: preset }),
  selectInstrument: (instrument) => set({ selectedInstrument: instrument }),
  
  addEvent: (event) => set((state) => ({
    events: [...state.events, { ...event, id: crypto.randomUUID() }]
  })),
  
  // Delete a single event by id
  deleteEvent: (id) => set((state) => ({
    events: state.events.filter((e) => e.id !== id),
    activeEvent: state.activeEvent?.id === id ? null : state.activeEvent,
  })),
  
  triggerEvent: (event) => {
    // Central Orchestration Trigger (Contextual Linking)
    set({ activeEvent: event, cursorTick: Math.round(event.timestampSec * 60) });
    
    // Automatically switch active workspace preset and focus mode matching event category
    if (event.category === "inputs") {
      set({ activePreset: "coach", selectedInstrument: "inputs", focusMode: "inputs" });
    } else if (event.category === "thermal") {
      set({ activePreset: "gt3", selectedInstrument: "tires", focusMode: "brakes" });
    } else if (event.category === "hybrid") {
      set({ activePreset: "gtp", selectedInstrument: "ers", focusMode: "ers" });
    } else if (event.category === "dynamics") {
      set({ activePreset: "aero", selectedInstrument: "chassis", focusMode: "chassis" });
    }
  },
  
  clearEvents: () => set({ events: [], activeEvent: null }),
  setFocusMode: (mode) => set({ focusMode: mode }),
  setDetachedTelemetryFrame: (frame) => set({ detachedTelemetryFrame: frame }),
}));

// Persist events to localStorage so user deletions survive restarts.
const STORAGE_KEY = "pitwall:runtime:events:v1";
function loadPersistedEvents(): TelemetryEvent[] {
  try {
    if (typeof window === "undefined") return [];
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as TelemetryEvent[];
  } catch {
    return [];
  }
}

function persistEvents(events: TelemetryEvent[]) {
  try {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch {}
}

// Hydrate store with persisted events on module load
if (typeof window !== "undefined") {
  const persisted = loadPersistedEvents();
  if (persisted.length > 0) {
    useTelemetryRuntimeStore.setState({ events: persisted });
  }

  // Subscribe to events changes and persist them
  let prevEvents = useTelemetryRuntimeStore.getState().events;
  useTelemetryRuntimeStore.subscribe((state) => {
    if (state.events !== prevEvents) {
      prevEvents = state.events;
      persistEvents(state.events);
    }
  });
}

// ─── Broadcast Sync Engine ───────────────────────────────────────────────────

const syncBC = typeof window !== "undefined" ? new BroadcastChannel("pitwall-runtime-sync") : null;
let isIncomingSync = false;

if (syncBC) {
  syncBC.onmessage = (event) => {
    const { type, payload } = event.data;
    if (type === "SYNC_STATE") {
      isIncomingSync = true;
      const state = useTelemetryRuntimeStore.getState();
      const updates: Partial<TelemetryRuntimeState> = {};

      if (payload.cursorTick !== undefined && payload.cursorTick !== state.cursorTick) {
        updates.cursorTick = payload.cursorTick;
      }
      if (payload.activeLap !== undefined && payload.activeLap !== state.activeLap) {
        updates.activeLap = payload.activeLap;
      }
      if (payload.activePreset !== undefined && payload.activePreset !== state.activePreset) {
        updates.activePreset = payload.activePreset;
      }
      if (payload.selectedInstrument !== undefined && payload.selectedInstrument !== state.selectedInstrument) {
        updates.selectedInstrument = payload.selectedInstrument;
      }
      if (payload.focusMode !== undefined && payload.focusMode !== state.focusMode) {
        updates.focusMode = payload.focusMode;
      }
      if (payload.isPlaying !== undefined && payload.isPlaying !== state.isPlaying) {
        updates.isPlaying = payload.isPlaying;
      }

      if (Object.keys(updates).length > 0) {
        useTelemetryRuntimeStore.setState(updates);
      }
      isIncomingSync = false;
    } else if (type === "REPLAY_FRAME") {
      useTelemetryRuntimeStore.setState({ detachedTelemetryFrame: payload });
    }
  };

  // Subscribe to local store changes to broadcast updates
  useTelemetryRuntimeStore.subscribe((state) => {
    if (isIncomingSync) return;
    
    syncBC.postMessage({
      type: "SYNC_STATE",
      payload: {
        cursorTick: state.cursorTick,
        activeLap: state.activeLap,
        activePreset: state.activePreset,
        selectedInstrument: state.selectedInstrument,
        focusMode: state.focusMode,
        isPlaying: state.isPlaying,
      },
    });
  });
}

// Global broadcast trigger function to sync active computed frames
export function broadcastTelemetryFrame(frame: any) {
  if (syncBC && !isIncomingSync) {
    syncBC.postMessage({
      type: "REPLAY_FRAME",
      payload: frame,
    });
  }
}
