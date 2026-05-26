export type ThemeTokenKey =
  | "background"
  | "foreground"
  | "panel"
  | "panel-2"
  | "rail"
  | "border"
  | "border-strong"
  | "primary"
  | "primary-foreground"
  | "muted"
  | "muted-foreground"
  | "accent"
  | "destructive"
  | "ch-speed"
  | "ch-throttle"
  | "ch-brake"
  | "ch-rpm"
  | "ch-gear"
  | "ch-steer"
  | "ch-glat"
  | "ch-glong"
  | "grid-major"
  | "grid-minor";

export type ThemeMap = Partial<Record<ThemeTokenKey, string>>;

// Bump when token keys are renamed/removed/added in a breaking way.
// Add a migrator below for each new version.
export const THEME_SCHEMA_VERSION = 2;
export const THEME_SCHEMA_ID = "apextrace.theme";

export interface ThemeFile {
  $schema: string; // "apextrace.theme/v{N}"
  version: number;
  name?: string;
  description?: string | null;
  theme: Required<ThemeMap>;
}

/**
 * Per-version migrations applied in order. Each takes the prior shape and
 * returns the next. Keys are the SOURCE version (i.e. migrations[1] turns
 * v1 into v2).
 */
const MIGRATIONS: Record<number, (input: any) => any> = {
  // v1 → v2: original release. v1 had no `version` field and identical token
  // keys to v2, so this is a structural pass-through. Future renames go here.
  1: (input) => {
    const tokens = (input?.theme ?? input) as Record<string, unknown>;
    return {
      ...(typeof input === "object" && input !== null && "theme" in input ? input : {}),
      theme: tokens,
      version: 2,
    };
  },
};

export interface MigrationResult {
  file: { name?: string; description?: string | null; theme: Record<string, unknown> };
  fromVersion: number;
  toVersion: number;
  steps: number[]; // versions migrated through
}

/**
 * Detect a theme file's schema version and migrate it forward to the current
 * version. Returns the migrated payload + which versions were applied so the
 * UI can tell the user what happened. Throws on totally unrecognizable input.
 */
export function migrateThemeFile(raw: unknown): MigrationResult {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new Error("Theme file must be a JSON object.");
  }
  const obj = raw as Record<string, any>;

  // Detect version: explicit `version`, or parse from `$schema` like
  // "apextrace.theme/v2", or fall back to v1 (the original unversioned shape).
  let from: number;
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
      `Theme uses schema v${from}, but this app only understands up to v${THEME_SCHEMA_VERSION}. Update the app to import it.`,
    );
  }

  let cur: any = obj;
  const steps: number[] = [];
  for (let v = from; v < THEME_SCHEMA_VERSION; v++) {
    const fn = MIGRATIONS[v];
    if (!fn) throw new Error(`Missing migration from v${v} to v${v + 1}.`);
    cur = fn(cur);
    steps.push(v + 1);
  }

  // Normalize: ensure `theme` map exists at the top level.
  const theme =
    cur && typeof cur === "object" && cur.theme && typeof cur.theme === "object" ? cur.theme : cur;

  return {
    file: {
      name: typeof cur?.name === "string" ? cur.name : undefined,
      description:
        typeof cur?.description === "string" || cur?.description === null
          ? cur.description
          : undefined,
      theme,
    },
    fromVersion: from,
    toVersion: THEME_SCHEMA_VERSION,
    steps,
  };
}

export function buildThemeFile(input: {
  name: string;
  description?: string | null;
  theme: Required<ThemeMap>;
}): ThemeFile {
  return {
    $schema: `${THEME_SCHEMA_ID}/v${THEME_SCHEMA_VERSION}`,
    version: THEME_SCHEMA_VERSION,
    name: input.name,
    description: input.description ?? null,
    theme: input.theme,
  };
}

export interface ThemeGroup {
  label: string;
  tokens: { key: ThemeTokenKey; label: string }[];
}

export const THEME_GROUPS: ThemeGroup[] = [
  {
    label: "Surfaces",
    tokens: [
      { key: "background", label: "Background" },
      { key: "panel", label: "Panel" },
      { key: "panel-2", label: "Panel 2" },
      { key: "rail", label: "Rail" },
      { key: "muted", label: "Muted" },
      { key: "accent", label: "Accent" },
    ],
  },
  {
    label: "Text & borders",
    tokens: [
      { key: "foreground", label: "Foreground" },
      { key: "muted-foreground", label: "Muted text" },
      { key: "border", label: "Border" },
      { key: "border-strong", label: "Border strong" },
      { key: "grid-major", label: "Grid major" },
      { key: "grid-minor", label: "Grid minor" },
    ],
  },
  {
    label: "Brand",
    tokens: [
      { key: "primary", label: "Primary" },
      { key: "primary-foreground", label: "Primary text" },
      { key: "destructive", label: "Destructive" },
    ],
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
      { key: "ch-glong", label: "Long G" },
    ],
  },
];

/* =============================================
   Style A - MoTeC / Professional Dark
   Classic engineering. Dense, dark, cyan accent.
   ============================================= */
export const DARK_THEME: Required<ThemeMap> = {
  background: "#0f1114",
  foreground: "#e2e4e8",
  panel: "#181b20",
  "panel-2": "#1e2228",
  rail: "#0b0d10",
  border: "#282d34",
  "border-strong": "#3a4048",
  primary: "#22d3ee",
  "primary-foreground": "#0c1014",
  muted: "#1e2228",
  "muted-foreground": "#7a828c",
  accent: "#282d34",
  destructive: "#ef4444",
  "ch-speed": "#22d3ee",
  "ch-throttle": "#22c55e",
  "ch-brake": "#ef4444",
  "ch-rpm": "#facc15",
  "ch-gear": "#e2e4e8",
  "ch-steer": "#d946ef",
  "ch-glat": "#fb923c",
  "ch-glong": "#60a5fa",
  "grid-major": "#282d34",
  "grid-minor": "#1e2228",
};

/* =============================================
   Style B - Modern Flat Dark
   Clean, minimal, contemporary. Blue/violet accents.
   ============================================= */
export const MODERN_FLAT_THEME: Required<ThemeMap> = {
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
  "grid-minor": "#1a1f28",
};

/* =============================================
   Style C - Studio Black
   Maximum contrast, bold. Red/orange primary.
   ============================================= */
export const STUDIO_BLACK_THEME: Required<ThemeMap> = {
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
  "grid-minor": "#141418",
};

/* =============================================
   Style D - Light Engineer
   Professional light mode. Low eye strain.
   ============================================= */
export const LIGHT_THEME: Required<ThemeMap> = {
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
  "grid-minor": "#e0e4ec",
};

/* =============================================
   Style E - Carbon UI
   F1/motorsport inspired. Carbon + red accents.
   ============================================= */
export const CARBON_THEME: Required<ThemeMap> = {
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
  "grid-minor": "#1a1a20",
};


/* =============================================
   Style F - Modern F1
   F1 Red on carbon black. DIN-style bold headings.
   High contrast, performance-inspired accents.
   ============================================= */
export const F1_THEME: Required<ThemeMap> = {
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
  "grid-minor": "#1a1f26",
};

/* =============================================
   Style G - IndyCar / NASCAR
   Dense oval/road data. Green live accents, deep dark.
   Running order, fuel strategy, caution flags.
   ============================================= */
export const INDYCAR_THEME: Required<ThemeMap> = {
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
  "grid-minor": "#181d28",
};
/** Backward compat aliases */
export const HIGH_CONTRAST_THEME = STUDIO_BLACK_THEME;
export const SOLAR_THEME = CARBON_THEME;

export const PRESETS: { id: string; label: string; theme: Required<ThemeMap> }[] = [
  { id: "motec",    label: "A - MoTeC Dark",      theme: DARK_THEME },
  { id: "modern",   label: "B - Modern Flat",      theme: MODERN_FLAT_THEME },
  { id: "studio",   label: "C - Studio Black",     theme: STUDIO_BLACK_THEME },
  { id: "engineer", label: "D - Light Engineer",   theme: LIGHT_THEME },
  { id: "carbon",   label: "E - Carbon UI",        theme: CARBON_THEME },
  { id: "f1",       label: "F - Modern F1",        theme: F1_THEME },
  { id: "indycar",  label: "G - IndyCar/NASCAR",   theme: INDYCAR_THEME },
];

export function applyTheme(theme: ThemeMap) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const merged = { ...DARK_THEME, ...theme };
  for (const [k, v] of Object.entries(merged)) {
    root.style.setProperty(`--${k}`, v);
  }
}

export function clearAppliedTheme() {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  for (const k of Object.keys(DARK_THEME)) {
    root.style.removeProperty(`--${k}`);
  }
}

const LS_KEY = "apextrace.theme.v1";

export function loadLocalTheme(): ThemeMap | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as ThemeMap) : null;
  } catch {
    return null;
  }
}

export function saveLocalTheme(theme: ThemeMap | null) {
  if (typeof localStorage === "undefined") return;
  if (!theme) localStorage.removeItem(LS_KEY);
  else localStorage.setItem(LS_KEY, JSON.stringify(theme));
}
