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
  clearEvents: () => void;
  
  // Focus Mode Actions
  setFocusMode: (mode: FocusMode) => void;
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

  setCursorTick: (tick) => set({ cursorTick: tick }),
  setActiveLap: (lap) => set({ activeLap: lap }),
  setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),
  setPlaying: (playing) => set({ isPlaying: playing }),
  setActivePreset: (preset) => set({ activePreset: preset }),
  selectInstrument: (instrument) => set({ selectedInstrument: instrument }),
  
  addEvent: (event) => set((state) => ({
    events: [...state.events, { ...event, id: crypto.randomUUID() }]
  })),
  
  triggerEvent: (event) => {
    // Central Orchestration Trigger (Contextual Linking)
    set({ activeEvent: event, cursorTick: Math.round(event.timestampSec * 60) });
    
    // Automatically switch active workspace preset matching event category
    if (event.category === "inputs") {
      set({ activePreset: "coach", selectedInstrument: "inputs" });
    } else if (event.category === "thermal") {
      set({ activePreset: "gt3", selectedInstrument: "tires" });
    } else if (event.category === "hybrid") {
      set({ activePreset: "gtp", selectedInstrument: "ers" });
    } else if (event.category === "dynamics") {
      set({ activePreset: "aero", selectedInstrument: "chassis" });
    }
  },
  
  clearEvents: () => set({ events: [], activeEvent: null }),
  setFocusMode: (mode) => set({ focusMode: mode }),
}));
