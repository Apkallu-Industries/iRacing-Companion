import { useState } from "react";
import { Mic, RotateCcw, Volume2, Loader2, AlertCircle } from "lucide-react";
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
import { speakText } from "@/lib/tts.functions";
import { toast } from "sonner";

const DEFAULT_VOICE_ID = "JBFqnCBsd6RMkjVDRZzb";

export function VoiceSettings({ inline }: { inline?: boolean }) {
  const { elevenLabsApiKey, elevenLabsVoiceId, setElevenLabsApiKey, setElevenLabsVoiceId } =
    useWorkbench();
  const [open, setOpen] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testError, setTestError] = useState<string | null>(null);

  const resetDefaults = () => {
    setElevenLabsApiKey("");
    setElevenLabsVoiceId(DEFAULT_VOICE_ID);
    setTestError(null);
  };

  const handleTestVoice = async () => {
    if (!elevenLabsApiKey) {
      toast.error("Please enter an ElevenLabs API key first.");
      return;
    }
    setTesting(true);
    setTestError(null);
    try {
      const text = "ElevenLabs voice connection successful! Pit Wall audio engine is ready.";
      const resp = (await speakText({
        data: { text, apiKey: elevenLabsApiKey, voiceId: elevenLabsVoiceId },
      })) as { audioBase64?: string; mime?: string; error?: string };

      if (resp.error) {
        setTestError(resp.error);
        toast.error(`Voice test failed: ${resp.error}`);
        return;
      }

      if (!resp.audioBase64) {
        setTestError("No audio returned");
        toast.error("Voice test failed: No audio data returned.");
        return;
      }

      const audio = new Audio(`data:${resp.mime ?? "audio/mpeg"};base64,${resp.audioBase64}`);
      await audio.play();
      toast.success("Voice test played successfully!");
    } catch (e: any) {
      const msg = e.message || "Unknown error";
      setTestError(msg);
      toast.error(`Voice test failed: ${msg}`);
    } finally {
      setTesting(false);
    }
  };

  if (inline) {
    return (
      <div className="space-y-4">
        <div>
          <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 block">
            ElevenLabs API Key
          </label>
          <Input
            type="password"
            value={elevenLabsApiKey}
            onChange={(e) => setElevenLabsApiKey(e.target.value)}
            placeholder="sk_..."
            className="font-mono text-xs bg-background/50 border-border/80 focus:border-primary/50"
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
            className="font-mono text-xs bg-background/50 border-border/80 focus:border-primary/50"
          />
          <p className="mt-1 text-[10px] text-muted-foreground">
            Use a valid ElevenLabs voice ID from your account (20 characters).
          </p>
        </div>

        <div className="flex flex-col gap-2 pt-2 border-t border-border/40">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleTestVoice}
              disabled={testing}
              className="flex-1 font-mono text-[10px] uppercase tracking-wider gap-1.5 h-8 cursor-pointer"
            >
              {testing ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Volume2 className="h-3.5 w-3.5 text-primary animate-pulse" />
              )}
              Test Voice
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={resetDefaults}
              className="font-mono text-[10px] uppercase tracking-wider gap-1.5 h-8 hover:bg-accent/40 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </Button>
          </div>

          {testError && (
            <div className="rounded border border-rose-500/30 bg-rose-500/5 p-2.5 text-[10px] text-rose-400 font-mono flex items-start gap-1.5 leading-normal animate-in fade-in">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <div>
                <span className="font-semibold uppercase tracking-wider text-[9px] block mb-0.5">
                  Test Error:
                </span>
                {testError}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

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
      <SheetContent
        side="right"
        className="w-[380px] sm:w-[440px] flex flex-col p-0 bg-background text-foreground"
      >
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
              Use a valid ElevenLabs voice ID from your account (typically 20 alphanumeric
              characters).
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleTestVoice}
              disabled={testing}
              className="w-full font-mono text-[10px] uppercase tracking-wider gap-1.5 h-8 cursor-pointer"
            >
              {testing ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Volume2 className="h-3.5 w-3.5 text-primary animate-pulse" />
              )}
              Test Voice
            </Button>

            {testError && (
              <div className="rounded border border-rose-500/30 bg-rose-500/5 p-2 text-[10px] text-rose-400 font-mono flex items-start gap-1.5 leading-normal">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <div>
                  <span className="font-semibold text-[9px] block">Test Error:</span> {testError}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="hairline-t flex items-center justify-between gap-2 px-4 py-3">
          <Button
            variant="outline"
            size="sm"
            onClick={resetDefaults}
            className="gap-1.5 cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Defaults
          </Button>
          <Button size="sm" onClick={() => setOpen(false)} className="cursor-pointer">
            Done
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
