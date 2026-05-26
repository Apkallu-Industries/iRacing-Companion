/**
 * LayoutStylePicker — inline style grid for the Settings page.
 *
 * Renders the 7 layout/theme presets as clickable cards directly on the page
 * (no extra button or sheet required). Selecting a card applies both the
 * layout profile AND the matching color theme immediately.
 */

import { useTheme } from "@/lib/themeContext";
import { LAYOUT_PROFILES } from "@/lib/layoutProfiles";
import { DARK_THEME, PRESETS } from "@/lib/theme";

export function LayoutStylePicker() {
  const { layout, setLayout, setTheme } = useTheme();

  return (
    <div className="grid grid-cols-1 gap-2">
      {LAYOUT_PROFILES.map((p) => {
        const active = layout === p.id;
        const matchingPreset = PRESETS.find((pr) => pr.id === p.id);

        return (
          <button
            key={p.id}
            type="button"
            onClick={() => {
              setLayout(p.id);
              if (matchingPreset) setTheme(matchingPreset.theme);
              else setTheme(DARK_THEME);
            }}
            className={`relative flex items-center gap-3 text-left rounded-sm border px-3 py-2.5 text-xs transition-all ${
              active
                ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                : "border-border bg-panel-2 hover:border-primary/50 hover:bg-accent/30"
            }`}
          >
            {/* 4-colour swatch */}
            <span className="flex h-9 w-9 flex-shrink-0 flex-wrap overflow-hidden rounded-sm border border-border shadow-sm">
              {p.swatches.map((c, i) => (
                <span
                  key={i}
                  className="block"
                  style={{ background: c, width: "50%", height: "50%" }}
                />
              ))}
            </span>

            <div className="flex-1 min-w-0">
              <div className="font-mono font-bold text-[11px] leading-tight truncate text-foreground">
                {p.label}
              </div>
              <div className="text-[9px] text-muted-foreground mt-0.5 leading-tight">
                {p.subtitle}
              </div>
              <div className="text-[9px] text-muted-foreground mt-1 leading-snug line-clamp-2 hidden sm:block">
                {p.description}
              </div>
            </div>

            {active && (
              <span className="text-[8px] font-bold text-primary uppercase tracking-widest flex-shrink-0 bg-primary/10 px-1.5 py-0.5 rounded-sm">
                Active
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
