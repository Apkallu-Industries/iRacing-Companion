import { useState } from "react";
import { Cpu, Server, Laptop, RotateCcw } from "lucide-react";
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
    { id: "cloud", name: "Cloud (Lovable/Default)", icon: Server, url: "", desc: "Route requests securely through the Lovable AI Gateway." },
    { id: "lmstudio", name: "LM Studio", icon: Laptop, url: "http://localhost:1234/v1", desc: "OpenAI-compatible local inference." },
    { id: "ollama", name: "Ollama", icon: Cpu, url: "http://localhost:11434/v1", desc: "Local inference via Ollama." },
    { id: "huggingface", name: "HuggingFace TGI", icon: Server, url: "http://localhost:8080/v1", desc: "Local TGI container backend." },
    { id: "lemonade", name: "LlamaEdge / Lemonade", icon: Laptop, url: "http://localhost:8080/v1", desc: "Wasm edge inference." },
] as const;

export function LLMSettings() {
    const { llmProvider, llmBaseUrl, llmModelId, llmApiKey, setLlmProvider, setLlmBaseUrl, setLlmModelId, setLlmApiKey } = useWorkbench();
    const [open, setOpen] = useState(false);
    const [testing, setTesting] = useState(false);
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

    const activeProviderInfo = PROVIDERS.find(p => p.id === llmProvider);

    const applyDefaults = (providerId: typeof PROVIDERS[number]["id"]) => {
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
            const res = await testLLMConnection(llmBaseUrl || activeProviderInfo?.url || "", llmModelId, llmApiKey);
            setTestResult(res);
        } catch (e) {
            setTestResult({
                success: false,
                message: e instanceof Error ? e.message : "An unexpected error occurred."
            });
        } finally {
            setTesting(false);
        }
    };

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
            <SheetContent side="right" className="w-[380px] sm:w-[440px] flex flex-col p-0">
                <SheetHeader className="px-4 pt-4">
                    <SheetTitle className="font-mono text-sm tracking-wider">AI ENGINE CONFIGURATION</SheetTitle>
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
                                    className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 hover:bg-accent/40 ${llmProvider === p.id ? "border-primary bg-primary/5" : "border-border bg-panel-2"}`}
                                >
                                    <input
                                        type="radio"
                                        name="llmProvider"
                                        checked={llmProvider === p.id}
                                        onChange={() => applyDefaults(p.id)}
                                        className="mt-1"
                                    />
                                    <div>
                                        <div className="text-sm font-medium flex items-center gap-2">
                                            <p.icon className="h-4 w-4" />
                                            {p.name}
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-0.5">{p.desc}</div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {llmProvider !== "cloud" && (
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
                                    className="w-full font-mono text-[10px] uppercase tracking-wider gap-1.5"
                                >
                                    {testing ? "Testing Connection..." : "Test Connection"}
                                </Button>
                                {testResult && (
                                    <div className={`mt-3 rounded-md p-3 border text-xs ${testResult.success ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-400" : "border-rose-500/30 bg-rose-500/5 text-rose-400"}`}>
                                        <div className="font-semibold uppercase tracking-wider text-[10px] mb-1">
                                            {testResult.success ? "✓ Connection OK" : "✗ Connection Failed"}
                                        </div>
                                        <div className="whitespace-pre-line leading-relaxed font-sans">{testResult.message}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="hairline-t flex items-center justify-between gap-2 px-4 py-3">
                    <Button variant="outline" size="sm" onClick={() => applyDefaults("cloud")} className="gap-1.5">
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
