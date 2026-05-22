import { useState } from "react";
import { Mic, RotateCcw } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWorkbench } from "@/lib/store";

const DEFAULT_VOICE_ID = "JBFqnCBsd6RMkjVDRZzb";

export function VoiceSettings() {
  const {
    elevenLabsApiKey,
    elevenLabsVoiceId,
    setElevenLabsApiKey,
    setElevenLabsVoiceId,
  } = useWorkbench();
  const [open, setOpen] = useState(false);

  const resetDefaults = () => {
    setElevenLabsApiKey("");
    setElevenLabsVoiceId(DEFAULT_VOICE_ID);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          className="flex items-center gap-1.5 rounded-sm px-2 py-1 hover:bg-accent hover:text-foreground"
          title="Configure voice synthesis"
        >
          <Mic className="h-3.5 w-3.5" />
          Voice
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[380px] sm:w-[440px] flex flex-col p-0">
        <SheetHeader className="px-4 pt-4">
          <SheetTitle className="font-mono text-sm tracking-wider">VOICE CONFIGURATION</SheetTitle>
          <SheetDescription className="text-xs">
            Configure ElevenLabs credentials for AI coach read-aloud.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 block">
              ElevenLabs API Key
            </label>
            <Input
              type="password"
              value={elevenLabsApiKey}
              onChange={(e) => setElevenLabsApiKey(e.target.value)}
              placeholder="sk_..."
              className="font-mono text-xs"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 block">
              Voice ID
            </label>
            <Input
              type="text"
              value={elevenLabsVoiceId}
              onChange={(e) => setElevenLabsVoiceId(e.target.value)}
              placeholder={DEFAULT_VOICE_ID}
              className="font-mono text-xs"
            />
            <p className="mt-1 text-[10px] text-muted-foreground">
              Use a valid ElevenLabs voice ID from your account (typically 20 alphanumeric characters).
            </p>
          </div>
        </div>

        <div className="hairline-t flex items-center justify-between gap-2 px-4 py-3">
          <Button variant="outline" size="sm" onClick={resetDefaults} className="gap-1.5">
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Defaults
          </Button>
          <Button size="sm" onClick={() => setOpen(false)}>
            Done
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
