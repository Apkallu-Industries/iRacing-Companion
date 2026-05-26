import { useState, useEffect, useCallback, useRef } from "react";
import { Mic, RotateCcw, Volume2, Loader2, AlertCircle, CheckCircle2, Speaker, Radio } from "lucide-react";
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

// ─── Device helpers ──────────────────────────────────────────────────────────

interface MediaDeviceEntry {
  deviceId: string;
  label: string;
}

async function enumerateKind(kind: "audioinput" | "audiooutput"): Promise<MediaDeviceEntry[]> {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices
      .filter((d) => d.kind === kind)
      .map((d, i) => ({
        deviceId: d.deviceId,
        label: d.label || `${kind === "audioinput" ? "Microphone" : "Speaker"} ${i + 1}`,
      }));
  } catch {
    return [];
  }
}

/** Play audio blob through a specific output device (via setSinkId). */
async function playAudioOnDevice(base64: string, mime: string, deviceId: string): Promise<void> {
  const audio = new Audio(`data:${mime};base64,${base64}`);
  if (deviceId && typeof (audio as any).setSinkId === "function") {
    try {
      await (audio as any).setSinkId(deviceId);
    } catch {
      // setSinkId can fail silently if device gone; fallback to default
    }
  }
  await audio.play();
}

// ─── Device selector sub-component ───────────────────────────────────────────

function DeviceSelect({
  kind,
  value,
  onChange,
  label,
  hint,
  icon: Icon,
}: {
  kind: "audioinput" | "audiooutput";
  value: string;
  onChange: (id: string) => void;
  label: string;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  const [devices, setDevices] = useState<MediaDeviceEntry[]>([]);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const load = useCallback(async () => {
    // For microphone, we need to request permission first to get real labels
    if (kind === "audioinput") {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((t) => t.stop()); // immediately release
      } catch {
        setPermissionDenied(true);
        return;
      }
    }
    // For output devices, some browsers require permission too (Chrome needs getUserMedia first)
    const list = await enumerateKind(kind);
    setDevices(list);
  }, [kind]);

  useEffect(() => {
    load();
    // Refresh when a device is plugged/unplugged
    navigator.mediaDevices.addEventListener("devicechange", load);
    return () => navigator.mediaDevices.removeEventListener("devicechange", load);
  }, [load]);

  return (
    <div>
      <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1.5">
        <Icon className="h-3 w-3" />
        {label}
      </label>

      {permissionDenied ? (
        <div className="rounded border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-[10px] text-amber-400 font-mono flex items-center gap-1.5">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          Microphone permission denied. Allow access in browser settings.
        </div>
      ) : devices.length === 0 ? (
        <div className="h-8 rounded border border-border/60 bg-background/50 px-3 flex items-center text-[10px] text-muted-foreground font-mono animate-pulse">
          Scanning devices…
        </div>
      ) : (
        <select
          value={value || "default"}
          onChange={(e) => onChange(e.target.value === "default" ? "" : e.target.value)}
          className="w-full h-8 rounded border border-border/80 bg-background/50 px-2 text-[11px] font-mono text-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30 cursor-pointer"
        >
          <option value="default">System Default</option>
          {devices.map((d) => (
            <option key={d.deviceId} value={d.deviceId}>
              {d.label}
            </option>
          ))}
        </select>
      )}

      <p className="mt-1 text-[10px] text-muted-foreground">{hint}</p>
    </div>
  );
}

// ─── Mic level meter ─────────────────────────────────────────────────────────

function MicLevelMeter({ deviceId }: { deviceId: string }) {
  const [level, setLevel] = useState(0);
  const [active, setActive] = useState(false);
  const rafRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  const start = async () => {
    try {
      const constraints: MediaStreamConstraints = {
        audio: deviceId ? { deviceId: { exact: deviceId } } : true,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      const ctx = new AudioContext();
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      src.connect(analyser);
      analyserRef.current = analyser;
      setActive(true);

      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        setLevel(Math.min(100, (avg / 128) * 100));
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } catch {
      toast.error("Could not access microphone.");
    }
  };

  const stop = () => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    analyserRef.current = null;
    setActive(false);
    setLevel(0);
  };

  useEffect(() => () => stop(), []);

  const bars = 20;
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex gap-0.5 flex-1 h-5 items-end">
          {Array.from({ length: bars }).map((_, i) => {
            const threshold = (i / bars) * 100;
            const lit = level > threshold;
            const color =
              i < bars * 0.6
                ? "bg-emerald-500"
                : i < bars * 0.85
                  ? "bg-yellow-500"
                  : "bg-rose-500";
            return (
              <div
                key={i}
                className={`flex-1 rounded-sm transition-all duration-75 ${lit ? color : "bg-border/30"}`}
                style={{ height: `${30 + (i / bars) * 70}%` }}
              />
            );
          })}
        </div>
        <Button
          type="button"
          size="sm"
          variant={active ? "destructive" : "outline"}
          onClick={active ? stop : start}
          className="h-7 text-[10px] font-mono uppercase tracking-wider gap-1.5 cursor-pointer shrink-0"
        >
          <Mic className="h-3 w-3" />
          {active ? "Stop" : "Test Mic"}
        </Button>
      </div>
      {active && (
        <p className="text-[10px] text-emerald-400 font-mono animate-pulse flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Listening… speak to test your microphone level.
        </p>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function VoiceSettings({ inline }: { inline?: boolean }) {
  const {
    elevenLabsApiKey,
    elevenLabsVoiceId,
    setElevenLabsApiKey,
    setElevenLabsVoiceId,
    audioOutputDeviceId,
    setAudioOutputDeviceId,
    micDeviceId,
    setMicDeviceId,
  } = useWorkbench();
  const [open, setOpen] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testError, setTestError] = useState<string | null>(null);

  const resetDefaults = () => {
    setElevenLabsApiKey("");
    setElevenLabsVoiceId(DEFAULT_VOICE_ID);
    setAudioOutputDeviceId("");
    setMicDeviceId("");
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

      await playAudioOnDevice(resp.audioBase64, resp.mime ?? "audio/mpeg", audioOutputDeviceId);
      toast.success("Voice test played successfully!");
    } catch (e: any) {
      const msg = e.message || "Unknown error";
      setTestError(msg);
      toast.error(`Voice test failed: ${msg}`);
    } finally {
      setTesting(false);
    }
  };

  // ── Inline variant (used inside settings page) ────────────────────────────
  if (inline) {
    return (
      <div className="space-y-5">
        {/* ElevenLabs credentials */}
        <div className="space-y-4">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold border-b border-border/40 pb-1.5">
            ElevenLabs Credentials
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 block">
              API Key
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
              20-character voice ID from your ElevenLabs account.
            </p>
          </div>
        </div>

        {/* Output device */}
        <div className="space-y-4">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold border-b border-border/40 pb-1.5">
            Audio Output Device
          </div>

          <DeviceSelect
            kind="audiooutput"
            value={audioOutputDeviceId}
            onChange={setAudioOutputDeviceId}
            label="Playback Device"
            hint="Where ElevenLabs voice and race engineer audio will play."
            icon={Speaker}
          />

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleTestVoice}
              disabled={testing}
              className="flex-1 font-mono text-[10px] uppercase tracking-wider gap-1.5 h-8 cursor-pointer"
            >
              {testing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Volume2 className="h-3.5 w-3.5 text-primary" />}
              Test on Selected Device
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
                <span className="font-semibold uppercase tracking-wider text-[9px] block mb-0.5">Test Error:</span>
                {testError}
              </div>
            </div>
          )}
        </div>

        {/* Microphone */}
        <div className="space-y-4">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold border-b border-border/40 pb-1.5">
            Microphone Input
          </div>

          <DeviceSelect
            kind="audioinput"
            value={micDeviceId}
            onChange={setMicDeviceId}
            label="Microphone"
            hint="Used for voice-to-agent commands and push-to-talk queries."
            icon={Mic}
          />

          <MicLevelMeter deviceId={micDeviceId} />
        </div>
      </div>
    );
  }

  // ── Sheet variant (triggered from top-bar button) ─────────────────────────
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          className="flex items-center gap-1.5 rounded-sm px-2 py-1 hover:bg-accent hover:text-foreground"
          title="Configure voice & audio devices"
        >
          <Mic className="h-3.5 w-3.5" />
          Voice
        </button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-[400px] sm:w-[460px] flex flex-col p-0 bg-background text-foreground"
      >
        <SheetHeader className="px-5 pt-5 pb-3 border-b border-border/40">
          <SheetTitle className="font-mono text-sm tracking-wider flex items-center gap-2">
            <Radio className="h-4 w-4 text-primary" />
            VOICE &amp; AUDIO DEVICES
          </SheetTitle>
          <SheetDescription className="text-xs">
            Configure ElevenLabs credentials, playback device, and microphone.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">

          {/* ── ElevenLabs ── */}
          <section className="space-y-3">
            <h3 className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold flex items-center gap-1.5">
              <Volume2 className="h-3 w-3" /> ElevenLabs Credentials
            </h3>

            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 block">
                API Key
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
                20-character voice ID from your ElevenLabs account.
              </p>
            </div>
          </section>

          <div className="border-t border-border/40" />

          {/* ── Output Device ── */}
          <section className="space-y-3">
            <h3 className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold flex items-center gap-1.5">
              <Speaker className="h-3 w-3" /> Audio Output Device
            </h3>

            <DeviceSelect
              kind="audiooutput"
              value={audioOutputDeviceId}
              onChange={setAudioOutputDeviceId}
              label="Playback Device"
              hint="ElevenLabs voice and race engineer calls will play through this device."
              icon={Speaker}
            />

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleTestVoice}
              disabled={testing}
              className="w-full font-mono text-[10px] uppercase tracking-wider gap-1.5 h-8 cursor-pointer"
            >
              {testing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Volume2 className="h-3.5 w-3.5 text-primary animate-pulse" />}
              Test Voice on Selected Device
            </Button>

            {testError && (
              <div className="rounded border border-rose-500/30 bg-rose-500/5 p-2 text-[10px] text-rose-400 font-mono flex items-start gap-1.5 leading-normal">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <div>
                  <span className="font-semibold text-[9px] block">Test Error:</span> {testError}
                </div>
              </div>
            )}
          </section>

          <div className="border-t border-border/40" />

          {/* ── Microphone ── */}
          <section className="space-y-3">
            <h3 className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold flex items-center gap-1.5">
              <Mic className="h-3 w-3" /> Microphone Input
            </h3>

            <DeviceSelect
              kind="audioinput"
              value={micDeviceId}
              onChange={setMicDeviceId}
              label="Microphone"
              hint="Used for push-to-talk voice commands to the AI agent."
              icon={Mic}
            />

            <MicLevelMeter deviceId={micDeviceId} />

            <div className="rounded border border-border/40 bg-muted/20 px-3 py-2.5 text-[10px] text-muted-foreground font-mono leading-relaxed">
              <span className="text-foreground font-semibold block mb-0.5">Push-to-Talk</span>
              Hold <kbd className="rounded bg-border/60 px-1 py-0.5 text-[9px]">Space</kbd> on the
              Live dashboard to speak a query to the AI coach. The selected microphone will be used.
            </div>
          </section>
        </div>

        <div className="border-t border-border/40 flex items-center justify-between gap-2 px-5 py-3">
          <Button
            variant="outline"
            size="sm"
            onClick={resetDefaults}
            className="gap-1.5 cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset All
          </Button>
          <Button size="sm" onClick={() => setOpen(false)} className="cursor-pointer">
            Done
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
