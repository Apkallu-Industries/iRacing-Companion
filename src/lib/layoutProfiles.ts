/**
 * Unified UI Styles — combines layout density + color theme into
 * a single selectable style preset, matching the 5 design directions
 * from the UI-Styles.png reference.
 *
 * Each style sets BOTH:
 *   1. data-layout on <html> (CSS density: radius, padding, font scale)
 *   2. Color theme tokens (background, panels, accents, trace colors)
 *
 * The existing color theme editor still works — users can fine-tune
 * individual tokens after selecting a style.
 */

export type LayoutProfile = "motec" | "modern" | "studio" | "engineer" | "carbon" | "f1" | "indycar";

export interface LayoutProfileMeta {
  id: LayoutProfile;
  label: string;
  subtitle: string;
  description: string;
  /** Small preview swatch colors [background, panel, primary, accent] */
  swatches: [string, string, string, string];
}

export const LAYOUT_PROFILES: LayoutProfileMeta[] = [
  {
    id: "motec",
    label: "MoTeC / Professional Dark",
    subtitle: "Classic Engineering",
    description:
      "Classic engineering feel. Dense information layout, trusted by professionals. The reference standard.",
    swatches: ["#0f1114", "#181b20", "#22d3ee", "#22c55e"],
  },
  {
    id: "modern",
    label: "Modern Flat Dark",
    subtitle: "Clean & Minimal",
    description:
      "Clean, minimal, contemporary. Great balance of clarity and simplicity with modern typography.",
    swatches: ["#111318", "#191d24", "#60a5fa", "#a78bfa"],
  },
  {
    id: "studio",
    label: "Studio Black",
    subtitle: "High Contrast Performance",
    description:
      "Maximum contrast, bold typography. Built for quick at-a-glance performance reading.",
    swatches: ["#000000", "#0a0a0e", "#ff3b30", "#ff9500"],
  },
  {
    id: "engineer",
    label: "Light Engineer",
    subtitle: "Professional Light Mode",
    description:
      "Professional light mode. Reduces eye strain during long analysis sessions.",
    swatches: ["#f5f6f8", "#ffffff", "#0066cc", "#16a34a"],
  },
  {
    id: "carbon",
    label: "Carbon UI",
    subtitle: "F1 / Motorsport Inspired",
    description:
      "Carbon textures and red accents. Aggressive and performance focused. Built for race day.",
    swatches: ["#0c0c0f", "#141418", "#e63322", "#ff6b35"],
  },
    {
    id: "f1",
    label: "Modern F1",
    subtitle: "High Performance. Precision.",
    description:
      "F1-inspired. Carbon black background, F1 red accents, DIN-style headings. Built for open-wheeler telemetry.",
    swatches: ["#0d0d10", "#14171c", "#e10600", "#00e676"],
  },
  {
    id: "indycar",
    label: "IndyCar / NASCAR",
    subtitle: "Oval & Road Course",
    description:
      "Dense race data: running order, 4-sector splits, fuel strategy, caution flags. Green live accents on deep dark.",
    swatches: ["#0a0c10", "#111520", "#00e676", "#ff6b35"],
  },
];

const LS_KEY = "pitwall.layout";

/** Apply layout profile to <html> element so CSS responds */
export function applyLayout(profile: LayoutProfile): void {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-layout", profile);
}

/** Load saved layout from localStorage, default to motec */
export function loadSavedLayout(): LayoutProfile {
  if (typeof localStorage === "undefined") return "motec";
  const saved = localStorage.getItem(LS_KEY);
  if (saved && (["motec", "modern", "studio", "engineer", "carbon", "f1", "indycar"] as string[]).includes(saved)) {
    return saved as LayoutProfile;
  }
  return "motec";
}

/** Save layout preference */
export function saveLayout(profile: LayoutProfile): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(LS_KEY, profile);
}
