import { createFileRoute, Link } from "@tanstack/react-router";
import { Settings, Cpu, Database, Mic, Palette } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { LLMSettings } from "@/components/LLMSettings";
import { LocalDbSettings } from "@/components/LocalDbSettings";
import { VoiceSettings } from "@/components/VoiceSettings";
import { ThemeEditor } from "@/components/ThemeEditor";
import { LayoutStylePicker } from "@/components/LayoutStylePicker";
import { BridgePerformanceSettings } from "@/components/BridgePerformanceSettings";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings - Pit Wall" },
      {
        name: "description",
        content: "Configure AI provider, local LLM host, and local MongoDB diagnostics.",
      },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader>
        <span className="font-mono uppercase tracking-wider">Settings</span>
        <Link to="/sessions" className="ml-3 text-muted-foreground hover:text-foreground">
          Sessions
        </Link>
        <Link to="/live" className="ml-3 text-muted-foreground hover:text-foreground">
          Live
        </Link>
      </AppHeader>

      <main className="w-full max-w-none px-4 md:px-12 lg:px-16 p-6">
        <div className="hairline rounded-sm bg-panel p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-primary text-primary-foreground">
              <Settings className="h-4 w-4" />
            </div>
            <div>
              <h1 className="font-mono text-sm uppercase tracking-wider">System Settings</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Manage your local AI provider and verify MongoDB connectivity for offline telemetry
                storage.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="hairline rounded-sm bg-rail p-4">
              <div className="mb-2 flex items-center gap-2 font-mono text-xs uppercase tracking-wider">
                <Cpu className="h-3.5 w-3.5" /> AI Provider
              </div>
              <p className="mb-3 text-xs text-muted-foreground">
                Choose cloud or local LLM backends and set your local host URL/model.
              </p>
              <LLMSettings inline />
            </div>

            <div className="hairline rounded-sm bg-rail p-4">
              <div className="mb-2 flex items-center gap-2 font-mono text-xs uppercase tracking-wider">
                <Mic className="h-3.5 w-3.5" /> Voice
              </div>
              <p className="mb-3 text-xs text-muted-foreground">
                Set ElevenLabs API key and preferred voice ID for spoken coach feedback.
              </p>
              <VoiceSettings inline />
            </div>

            <div className="hairline rounded-sm bg-rail p-4">
              <div className="mb-2 flex items-center gap-2 font-mono text-xs uppercase tracking-wider">
                <Database className="h-3.5 w-3.5" /> Local Database
              </div>
              <p className="mb-3 text-xs text-muted-foreground">
                Test MongoDB connection status and manage local browser file cache.
              </p>
              <LocalDbSettings />
            </div>

            <div className="hairline rounded-sm bg-rail p-4">
              <div className="mb-2 flex items-center gap-2 font-mono text-xs uppercase tracking-wider">
                <Palette className="h-3.5 w-3.5" /> Appearance
              </div>
              <p className="mb-3 text-xs text-muted-foreground">
                Pick a UI style — this changes the layout, color theme, and dashboard widgets.
                The F1 style unlocks the full F1 telemetry dashboard on the Live page.
              </p>
              <LayoutStylePicker />
              <div className="mt-3 pt-3 border-t border-border">
                <p className="mb-2 text-[10px] text-muted-foreground uppercase tracking-wider">Fine-tune individual color tokens</p>
                <ThemeEditor />
              </div>
            </div>

            <div className="hairline rounded-sm bg-rail p-4 sm:col-span-2">
              <div className="mb-2 flex items-center gap-2 font-mono text-xs uppercase tracking-wider">
                <Cpu className="h-3.5 w-3.5" /> Live Performance
              </div>
              <p className="mb-3 text-xs text-muted-foreground">
                Choose bridge streaming profile. Stable uses 30Hz UI updates; Balanced uses 60Hz
                with adaptive fallback.
              </p>
              <BridgePerformanceSettings />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
