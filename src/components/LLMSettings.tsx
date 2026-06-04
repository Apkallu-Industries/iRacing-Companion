import { useState } from "react";
import { Cpu, Server, Laptop, RotateCcw, RefreshCw, Loader2 } from "lucide-react";
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
import { testLLMConnection } from "@/lib/llm";

const PROVIDERS = [
  {
    id: "lmstudio",
    name: "LM Studio",
    icon: Laptop,
    url: "http://localhost:1234/v1",
    desc: "lmstudio-native.",
  },
  {
    id: "ollama",
    name: "Ollama",
    icon: Cpu,
    url: "http://localhost:11434/v1",
    desc: "Local inference via Ollama.",
  },
  {
    id: "huggingface",
    name: "HuggingFace TGI",
    icon: Server,
    url: "http://localhost:8080/v1",
    desc: "Local TGI container backend.",
  },
  {
    id: "lemonade",
    name: "LlamaEdge / Lemonade",
    icon: Laptop,
    url: "http://localhost:8080/v1",
    desc: "Wasm edge inference.",
  },
] as const;

export function LLMSettings({ inline }: { inline?: boolean }) {
  const {
    llmProvider,
    llmBaseUrl,
    llmModelId,
    llmApiKey,
    setLlmProvider,
    setLlmBaseUrl,
    setLlmModelId,
    setLlmApiKey,
  } = useWorkbench();
  const [open, setOpen] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const activeProviderInfo = PROVIDERS.find((p) => p.id === llmProvider);

  const applyDefaults = (providerId: (typeof PROVIDERS)[number]["id"]) => {
    const p = PROVIDERS.find((x) => x.id === providerId);
    if (!p) return;
    setLlmProvider(p.id);
    if (p.url) setLlmBaseUrl(p.url);
    setLlmApiKey(""); // Reset token when swapping provider defaults
    setTestResult(null);
  };

  const runTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await testLLMConnection(
        llmBaseUrl || activeProviderInfo?.url || "",
        llmModelId,
        llmApiKey,
      );
      setTestResult(res);
    } catch (e) {
      setTestResult({
        success: false,
        message: e instanceof Error ? e.message : "An unexpected error occurred.",
      });
    } finally {
      setTesting(false);
    }
  };

  const inlineForm = (
    <div className="space-y-4">
      <div>
        <div className="mb-2 text-[10px] uppercase tracking-wider text-muted-foreground">
          AI Provider
        </div>
        <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
          {PROVIDERS.map((p) => (
            <label
              key={p.id}
              className={`flex cursor-pointer items-start gap-2.5 rounded-lg border p-2.5 hover:bg-accent/40 transition-colors ${
                llmProvider === p.id ? "border-primary bg-primary/5" : "border-border bg-panel"
              }`}
            >
              <input
                type="radio"
                name="inlineLlmProvider"
                checked={llmProvider === p.id}
                onChange={() => applyDefaults(p.id)}
                className="mt-1 shrink-0 cursor-pointer"
              />
              <div className="min-w-0">
                <div className="text-xs font-medium flex items-center gap-1.5 text-foreground">
                  <p.icon className="h-3.5 w-3.5 shrink-0 text-primary" />
                  {p.name}
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5 leading-snug line-clamp-2">
                  {p.desc}
                </div>
              </div>
            </label>
          ))}
        </div>

        <p className="text-[10px] text-muted-foreground leading-relaxed">
          To auto-launch LM Studio or Ollama when the desktop app starts, set
          `LMSTUDIO_LAUNCH_COMMAND` / `LMSTUDIO_PATH` or `OLLAMA_LAUNCH_COMMAND` / `OLLAMA_PATH` in
          the host environment. The supervisor only starts the process if the expected local port is
          not already active.
        </p>
      </div>

      <div className="space-y-4 border-t border-border/40 pt-4 animate-in fade-in slide-in-from-top-2">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground block">
              Base URL (OpenAI Compatible)
            </label>
            <Input
              type="text"
              value={llmBaseUrl}
              onChange={(e) => {
                setLlmBaseUrl(e.target.value);
                setTestResult(null);
              }}
              placeholder={activeProviderInfo?.url || "http://localhost:1234/v1"}
              className="font-mono text-xs bg-background/50 border-border/80 focus:border-primary/50"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground block">
              Model ID
            </label>
            <Input
              type="text"
              value={llmModelId}
              onChange={(e) => {
                setLlmModelId(e.target.value);
                setTestResult(null);
              }}
              placeholder="e.g. liquid/lfm2.5-1.2b"
              className="font-mono text-xs bg-background/50 border-border/80 focus:border-primary/50"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] uppercase tracking-wider text-muted-foreground block">
            API Token / Permission Key (Optional)
          </label>
          <Input
            type="password"
            value={llmApiKey}
            onChange={(e) => {
              setLlmApiKey(e.target.value);
              setTestResult(null);
            }}
            placeholder="Enter LM Studio token or Bearer key if required"
            className="font-mono text-xs bg-background/50 border-border/80 focus:border-primary/50"
          />
          <p className="text-[9px] text-muted-foreground mt-1">
            Required if your local server uses token authentication (e.g. LM Studio 0.4.0+).
          </p>
        </div>

        <div className="pt-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={runTest}
            disabled={testing}
            className="w-full font-mono text-[10px] uppercase tracking-wider gap-1.5 h-8 cursor-pointer"
          >
            {testing ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <RefreshCw className="h-3 w-3" />
            )}
            {testing ? "Testing Connection..." : "Test Local Host Software Connection"}
          </Button>
          {testResult && (
            <div
              className={`mt-3 rounded-lg p-3 border text-xs whitespace-pre-line leading-relaxed font-mono ${
                testResult.success
                  ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-400"
                  : "border-rose-500/30 bg-rose-500/5 text-rose-400"
              }`}
            >
              <div className="font-semibold uppercase tracking-wider text-[10px] mb-1 font-mono">
                {testResult.success ? "✓ AI Connection Successful" : "✗ Connection Failed"}
              </div>
              <div className="text-[10px]">{testResult.message}</div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/40">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => applyDefaults("lmstudio")}
          className="font-mono text-[10px] uppercase tracking-wider gap-1.5 h-8 cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset Defaults
        </Button>
      </div>
    </div>
  );

  if (inline) {
    return inlineForm;
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          className="flex items-center gap-1.5 rounded-sm px-2 py-1 hover:bg-accent hover:text-foreground"
          title="Configure AI Engine"
        >
          <Cpu className="h-3.5 w-3.5" />
          AI Engine
        </button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-95 sm:w-110 flex flex-col p-0 bg-background text-foreground border-l border-border/60"
      >
        <SheetHeader className="px-4 pt-4">
          <SheetTitle className="font-mono text-sm tracking-wider">
            AI ENGINE CONFIGURATION
          </SheetTitle>
          <SheetDescription className="text-xs">
            Choose where rendering and AI analysis compute takes place.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          <div>
            <div className="mb-2 text-[10px] uppercase tracking-wider text-muted-foreground">
              Provider
            </div>
            <div className="space-y-2">
              {PROVIDERS.map((p) => (
                <label
                  key={p.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 hover:bg-accent/40 ${
                    llmProvider === p.id
                      ? "border-primary bg-primary/5"
                      : "border-border bg-panel-2"
                  }`}
                >
                  <input
                    type="radio"
                    name="llmProvider"
                    checked={llmProvider === p.id}
                    onChange={() => applyDefaults(p.id)}
                    className="mt-1 cursor-pointer"
                  />
                  <div>
                    <div className="text-sm font-medium flex items-center gap-2 text-foreground">
                      <p.icon className="h-4 w-4" />
                      {p.name}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">{p.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 block">
                Base URL (OpenAI Compatible)
              </label>
              <Input
                type="text"
                value={llmBaseUrl}
                onChange={(e) => {
                  setLlmBaseUrl(e.target.value);
                  setTestResult(null);
                }}
                placeholder={activeProviderInfo?.url || "http://localhost:1234/v1"}
                className="font-mono text-xs"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 block">
                API Token / Permission Key (Optional)
              </label>
              <Input
                type="password"
                value={llmApiKey}
                onChange={(e) => {
                  setLlmApiKey(e.target.value);
                  setTestResult(null);
                }}
                placeholder="Enter LM Studio token or Bearer key if required"
                className="font-mono text-xs"
              />
              <p className="text-[9px] text-muted-foreground mt-1">
                Required if your local server uses token authentication (e.g. LM Studio 0.4.0+).
              </p>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 block">
                Model ID (e.g. liquid/lfm2.5-1.2b)
              </label>
              <Input
                type="text"
                value={llmModelId}
                onChange={(e) => {
                  setLlmModelId(e.target.value);
                  setTestResult(null);
                }}
                placeholder="e.g. liquid/lfm2.5-1.2b, llama-3-8b-instruct"
                className="font-mono text-xs"
              />
              <p className="text-[10px] text-muted-foreground mt-1.5">
                The model must support tool-calling schemas to function properly as an Advisor.
              </p>
            </div>

            <div className="pt-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={runTest}
                disabled={testing}
                className="w-full font-mono text-[10px] uppercase tracking-wider gap-1.5 h-8 cursor-pointer"
              >
                {testing ? "Testing Connection..." : "Test Connection"}
              </Button>
              {testResult && (
                <div
                  className={`mt-3 rounded-md p-3 border text-xs ${
                    testResult.success
                      ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-400"
                      : "border-rose-500/30 bg-rose-500/5 text-rose-400"
                  }`}
                >
                  <div className="font-semibold uppercase tracking-wider text-[10px] mb-1 font-mono">
                    {testResult.success ? "✓ Connection OK" : "✗ Connection Failed"}
                  </div>
                  <div className="whitespace-pre-line leading-relaxed font-sans">
                    {testResult.message}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="hairline-t flex items-center justify-between gap-2 px-4 py-3 bg-panel shrink-0 border-t border-border/60">
          <Button
            variant="outline"
            size="sm"
            onClick={() => applyDefaults("lmstudio")}
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
