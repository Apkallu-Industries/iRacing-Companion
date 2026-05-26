import { useState, useEffect, useCallback } from "react";
import { useLocation } from "@tanstack/react-router";
import {
  Settings,
  Database,
  Cloud,
  Cpu,
  Keyboard,
  RefreshCw,
  Trash2,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Server,
  Laptop,
  Terminal,
  Copy,
  Check,
  Key,
  Shield,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWorkbench } from "@/lib/store";
import { testLLMConnection } from "@/lib/llm";
import { testLocalDbConnection, getDbConfig, saveDbConfig } from "@/lib/localDb.functions";
import { getBridgeUrl } from "@/lib/bridgeDataClient";
import { toast } from "sonner";

const LLM_PROVIDERS = [
  {
    id: "cloud",
    name: "Cloud (Lovable/Default)",
    icon: Server,
    url: "",
    desc: "Route requests securely through the Lovable AI Gateway.",
  },
  {
    id: "lmstudio",
    name: "LM Studio",
    icon: Laptop,
    url: "http://localhost:1234/api/v1",
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

export function GlobalSettingsDialog() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("db");

  // Local MongoDB state
  const [localUri, setLocalUri] = useState("mongodb://127.0.0.1:27017/");
  const [cloudUri, setCloudUri] = useState("");
  const [dbTesting, setDbTesting] = useState(false);
  const [dbStatus, setDbStatus] = useState<"unchecked" | "connected" | "failed">("unchecked");
  const [dbTestResult, setDbTestResult] = useState<{ success: boolean; message: string } | null>(
    null,
  );
  const [savingDb, setSavingDb] = useState(false);
  const [idbUsage, setIdbUsage] = useState("Calculating...");

  // Licensing State
  const [hwid, setHwid] = useState("");
  const [licenseState, setLicenseState] = useState<{
    valid: boolean;
    hwid: string;
    tier: string;
    expires: string;
    error: string | null;
  } | null>(null);
  const [licenseChecking, setLicenseChecking] = useState(false);
  const [licenseKeyInput, setLicenseKeyInput] = useState("");
  const [activatingLicense, setActivatingLicense] = useState(false);
  const [copiedHwid, setCopiedHwid] = useState(false);

  // AI Engine state
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
  const [aiTesting, setAiTesting] = useState(false);
  const [aiTestResult, setAiTestResult] = useState<{ success: boolean; message: string } | null>(
    null,
  );

  // Copy clip helpers
  const [copiedDocker, setCopiedDocker] = useState(false);
  const [copiedWinget, setCopiedWinget] = useState(false);

  // Load database configuration
  const loadDbSettings = useCallback(async () => {
    try {
      const res = await getDbConfig();
      if (res.data) {
        setLocalUri(res.data.localUri || "mongodb://127.0.0.1:27017/");
        setCloudUri(res.data.cloudUri || "");
      }
    } catch (e: any) {
      console.error("Failed to load db config:", e);
    }
  }, []);

  const checkConnection = async () => {
    setDbTesting(true);
    setDbStatus("unchecked");
    setDbTestResult(null);
    try {
      const res = await testLocalDbConnection();
      setDbTestResult(res);
      setDbStatus(res.success ? "connected" : "failed");
    } catch (e: any) {
      setDbTestResult({
        success: false,
        message: `Connection failed: ${e.message || String(e)}`,
      });
      setDbStatus("failed");
    } finally {
      setDbTesting(false);
    }
  };

  const handleSaveDbConfig = async () => {
    setSavingDb(true);
    try {
      const res = await saveDbConfig({ data: { localUri, cloudUri } });
      if (res.success) {
        toast.success("Database configuration saved successfully.");
        // Test connection right after saving
        checkConnection();
      } else {
        toast.error(res.error?.message || "Failed to save configuration.");
      }
    } catch (err: any) {
      toast.error(err.message || "Error saving database configuration.");
    } finally {
      setSavingDb(false);
    }
  };

  const checkIndexedDbSize = async () => {
    if (typeof navigator !== "undefined" && navigator.storage && navigator.storage.estimate) {
      try {
        const estimate = await navigator.storage.estimate();
        const used = estimate.usage ? (estimate.usage / (1024 * 1024)).toFixed(1) : "0";
        const total = estimate.quota
          ? (estimate.quota / (1024 * 1024 * 1024)).toFixed(1)
          : "unknown";
        setIdbUsage(`${used} MB used of ${total} GB quota`);
      } catch {
        setIdbUsage("Available");
      }
    } else {
      setIdbUsage("Supported");
    }
  };

  const clearIndexedDb = async () => {
    if (
      !confirm(
        "Are you sure you want to clear your local IndexedDB file cache? This will delete downloaded telemetry files from this browser. Telemetry session records in MongoDB will remain.",
      )
    ) {
      return;
    }
    try {
      const req = indexedDB.deleteDatabase("apextrace_local_telemetry");
      req.onsuccess = () => {
        toast.success("Local IndexedDB file cache cleared.");
        checkIndexedDbSize();
      };
      req.onerror = () => {
        toast.error("Failed to clear local file cache.");
      };
    } catch (err: any) {
      toast.error(err.message || "Error clearing cache");
    }
  };

  // AI Connection Test
  const activeProviderInfo = LLM_PROVIDERS.find((p) => p.id === llmProvider);

  const applyAiDefaults = (providerId: (typeof LLM_PROVIDERS)[number]["id"]) => {
    const p = LLM_PROVIDERS.find((x) => x.id === providerId);
    if (!p) return;
    setLlmProvider(p.id);
    if (p.url) setLlmBaseUrl(p.url);
    setLlmApiKey(""); // Reset token when swapping
    setAiTestResult(null);
  };

  const runAiTest = async () => {
    setAiTesting(true);
    setAiTestResult(null);
    try {
      const res = await testLLMConnection(
        llmBaseUrl || activeProviderInfo?.url || "",
        llmModelId,
        llmApiKey,
      );
      setAiTestResult(res);
    } catch (e) {
      setAiTestResult({
        success: false,
        message: e instanceof Error ? e.message : "An unexpected error occurred.",
      });
    } finally {
      setAiTesting(false);
    }
  };

  const copyToClipboard = (text: string, type: "docker" | "winget") => {
    navigator.clipboard.writeText(text);
    if (type === "docker") {
      setCopiedDocker(true);
      setTimeout(() => setCopiedDocker(false), 2000);
    } else {
      setCopiedWinget(true);
      setTimeout(() => setCopiedWinget(false), 2000);
    }
    toast.success("Copied to clipboard.");
  };

  const getBridgeHttpUrl = () => {
    const wsUrl = getBridgeUrl();
    return wsUrl.replace(/^ws/, "http");
  };

  const fetchLicenseData = useCallback(async () => {
    setLicenseChecking(true);
    try {
      const httpUrl = getBridgeHttpUrl();
      const res = await fetch(`${httpUrl}/api/license`);
      if (res.ok) {
        const data = await res.json();
        setLicenseState(data);
        if (data.valid && typeof localStorage !== "undefined") {
          localStorage.setItem("pitwall_bridge_license", JSON.stringify(data));
        }
      }
      
      const hwidRes = await fetch(`${httpUrl}/api/hwid`);
      if (hwidRes.ok) {
        const hwidData = await hwidRes.json();
        setHwid(hwidData.hwid);
      }
    } catch (e) {
      console.warn("Local bridge not reachable for licensing querying:", e);
    } finally {
      setLicenseChecking(false);
    }
  }, []);

  const handleActivateLicense = async () => {
    if (!licenseKeyInput) return;
    setActivatingLicense(true);
    try {
      const httpUrl = getBridgeHttpUrl();
      const res = await fetch(`${httpUrl}/api/license`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: licenseKeyInput.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`License activated successfully! Tier: ${data.tier.toUpperCase()}`);
        setLicenseKeyInput("");
        fetchLicenseData();
      } else {
        toast.error(data.error || "Activation failed. Please check the license key.");
      }
    } catch (err: any) {
      toast.error(`Activation failed: ${err.message}`);
    } finally {
      setActivatingLicense(false);
    }
  };

  const copyHWIDToClipboard = () => {
    if (!hwid) return;
    navigator.clipboard.writeText(hwid);
    setCopiedHwid(true);
    setTimeout(() => setCopiedHwid(false), 2000);
    toast.success("HWID copied to clipboard.");
  };

  // Keyboard shortcut Ctrl+,
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Disable while typing in inputs
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.getAttribute("contenteditable") === "true")
      ) {
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === ",") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Fetch db config and license when dialog opens
  useEffect(() => {
    if (open) {
      loadDbSettings();
      checkConnection();
      checkIndexedDbSize();
      fetchLicenseData();
    }
  }, [open, loadDbSettings, fetchLicenseData]);

  // Hide settings cog on specific paths to keep UI clean and avoid redundancy
  if (
    pathname === "/" ||
    pathname === "/auth" ||
    pathname === "/settings" ||
    pathname === "/settings/"
  ) {
    return null;
  }

  return (
    <>
      {/* Floating Settings Button */}
      <button
        id="global-settings-trigger"
        onClick={() => {
          setOpen(true);
        }}
        className="fixed bottom-4 right-16 z-40 flex h-9 w-9 items-center justify-center rounded-full bg-panel border border-border text-muted-foreground shadow-lg hover:text-primary hover:border-primary/50 transition-all hover:scale-110 group cursor-pointer"
        aria-label="Open settings panel"
        title="Settings (Ctrl + ,)"
      >
        <Settings className="h-4 w-4 transition-transform duration-500 group-hover:rotate-90" />
      </button>

      {/* Settings Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl h-[90vh] sm:h-[650px] flex flex-col p-0 overflow-hidden bg-background text-foreground border border-border rounded-xl">
          <DialogHeader className="px-6 pt-5 pb-3 border-b border-border/60 shrink-0">
            <DialogTitle className="font-mono text-sm tracking-wider flex items-center gap-2">
              <Settings className="h-4 w-4 text-primary animate-pulse" />
              SYSTEM SETTINGS & WORKSPACE
            </DialogTitle>
            <DialogDescription className="text-xs">
              Configure local services, databases, cloud synchronization, and AI engine preferences.
            </DialogDescription>
          </DialogHeader>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex-1 flex flex-col min-h-0"
          >
            <TabsList className="grid grid-cols-5 bg-panel border-b border-border/60 p-1 shrink-0 rounded-none h-11">
              <TabsTrigger
                value="db"
                className="gap-1.5 font-mono text-[10px] uppercase tracking-wider h-full cursor-pointer"
              >
                <Database className="h-3.5 w-3.5" />
                Local DB
              </TabsTrigger>
              <TabsTrigger
                value="cloud"
                className="gap-1.5 font-mono text-[10px] uppercase tracking-wider h-full cursor-pointer"
              >
                <Cloud className="h-3.5 w-3.5" />
                Cloud Area
              </TabsTrigger>
              <TabsTrigger
                value="ai"
                className="gap-1.5 font-mono text-[10px] uppercase tracking-wider h-full cursor-pointer"
              >
                <Cpu className="h-3.5 w-3.5" />
                AI Engine
              </TabsTrigger>
              <TabsTrigger
                value="licensing"
                className="gap-1.5 font-mono text-[10px] uppercase tracking-wider h-full cursor-pointer"
              >
                <Key className="h-3.5 w-3.5" />
                License
              </TabsTrigger>
              <TabsTrigger
                value="shortcuts"
                className="gap-1.5 font-mono text-[10px] uppercase tracking-wider h-full cursor-pointer"
              >
                <Keyboard className="h-3.5 w-3.5" />
                Shortcuts
              </TabsTrigger>
            </TabsList>

            {/* TAB: Local DB */}
            <TabsContent
              value="db"
              className="flex-1 overflow-y-auto px-6 py-5 space-y-5 min-h-0 focus:outline-none"
            >
              {/* Database status and summary */}
              <div className="rounded-lg border border-border bg-panel p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-border/40 pb-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                    MongoDB Server Status
                  </span>
                  {dbTesting ? (
                    <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase font-mono tracking-wider">
                      <RefreshCw className="h-3 w-3 animate-spin" /> Testing...
                    </span>
                  ) : dbStatus === "connected" ? (
                    <span className="flex items-center gap-1.5 text-[10px] text-emerald-400 uppercase font-mono tracking-wider font-semibold">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Connected
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-[10px] text-rose-400 uppercase font-mono tracking-wider font-semibold">
                      <AlertCircle className="h-3.5 w-3.5" /> Disconnected
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                    Local Cache Size
                  </span>
                  <span className="text-xs font-mono text-muted-foreground">{idbUsage}</span>
                </div>
              </div>

              {/* Local Connection config */}
              <div className="space-y-3">
                <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-1">
                  Local MongoDB Community Server Connection
                </h3>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground block">
                    Connection String URI
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={localUri}
                      onChange={(e) => setLocalUri(e.target.value)}
                      placeholder="mongodb://127.0.0.1:27017/"
                      className="font-mono text-xs flex-1"
                    />
                    <Button
                      type="button"
                      onClick={handleSaveDbConfig}
                      disabled={savingDb}
                      size="sm"
                      className="font-mono text-xs"
                    >
                      {savingDb ? "Saving..." : "Save"}
                    </Button>
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    Default connection URI for standard installation is{" "}
                    <code className="font-mono bg-rail px-1 rounded text-primary">
                      mongodb://127.0.0.1:27017/
                    </code>
                    .
                  </p>
                </div>

                <div className="flex gap-2 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={checkConnection}
                    disabled={dbTesting}
                    className="w-full font-mono text-[10px] uppercase tracking-wider gap-1.5"
                  >
                    <RefreshCw className={`h-3 w-3 ${dbTesting ? "animate-spin" : ""}`} />
                    Test Connection
                  </Button>
                </div>

                {dbTestResult && (
                  <div
                    className={`rounded-lg p-3 border text-xs whitespace-pre-line leading-relaxed font-sans ${dbTestResult.success ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-400" : "border-rose-500/30 bg-rose-500/5 text-rose-400"}`}
                  >
                    <div className="font-semibold uppercase tracking-wider text-[10px] mb-1 font-mono">
                      {dbTestResult.success
                        ? "✓ MongoDB Connection Successful"
                        : "✗ Connection Failed"}
                    </div>
                    <div className="font-mono text-[10px]">{dbTestResult.message}</div>
                  </div>
                )}
              </div>

              {/* Install guide */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-1">
                  MongoDB Community Server Setup Guide
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  If you do not have a MongoDB Community Server running locally, select one of the
                  methods below to set it up:
                </p>
                <div className="space-y-3">
                  <div className="rounded-lg border border-border bg-rail p-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono font-semibold flex items-center gap-1.5 text-foreground">
                        <Terminal className="h-3.5 w-3.5 text-primary" />
                        Method A: Windows Package Manager (Winget)
                      </span>
                      <button
                        onClick={() =>
                          copyToClipboard("winget install MongoDB.Community.Server", "winget")
                        }
                        className="text-muted-foreground hover:text-foreground p-1 transition-colors cursor-pointer"
                        title="Copy command"
                      >
                        {copiedWinget ? (
                          <Check className="h-3 w-3 text-emerald-400" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                    <code className="block text-[10px] bg-background/50 p-2 rounded font-mono text-foreground">
                      winget install MongoDB.Community.Server
                    </code>
                  </div>

                  <div className="rounded-lg border border-border bg-rail p-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono font-semibold flex items-center gap-1.5 text-foreground">
                        <Terminal className="h-3.5 w-3.5 text-primary" />
                        Method B: Docker Container
                      </span>
                      <button
                        onClick={() =>
                          copyToClipboard(
                            "docker run -d -p 27017:27017 --name iracing-mongo mongo:latest",
                            "docker",
                          )
                        }
                        className="text-muted-foreground hover:text-foreground p-1 transition-colors cursor-pointer"
                        title="Copy command"
                      >
                        {copiedDocker ? (
                          <Check className="h-3 w-3 text-emerald-400" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                    <code className="block text-[10px] bg-background/50 p-2 rounded font-mono text-foreground leading-normal">
                      docker run -d -p 27017:27017 --name iracing-mongo mongo:latest
                    </code>
                  </div>
                </div>
              </div>

              {/* Clear cache */}
              <div className="pt-3 border-t border-border/40 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-semibold text-foreground">Browser File Cache</h4>
                  <p className="text-[11px] text-muted-foreground leading-snug">
                    Telemetry binary files are saved locally in browser IndexedDB.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={clearIndexedDb}
                  className="font-mono text-[10px] uppercase tracking-wider gap-1.5 shrink-0"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Clear File Cache
                </Button>
              </div>
            </TabsContent>

            {/* TAB: Cloud DB */}
            <TabsContent
              value="cloud"
              className="flex-1 overflow-y-auto px-6 py-5 space-y-4 focus:outline-none"
            >
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-2">
                <h3 className="text-xs font-mono uppercase tracking-wider text-primary font-semibold flex items-center gap-1.5">
                  <Cloud className="h-4 w-4" />
                  Cloud Sync Replicator
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  We are currently sorting our master Cloud database hosting layout. When fully
                  active, cloud databases will auto-sync with users' local telemetry records and
                  telemetry profiles.
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  For early developer testing, you can input a manual MongoDB Atlas or custom cloud
                  server URI below to replicate local records.
                </p>
              </div>

              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground block">
                    Cloud MongoDB Connection String (Manual Input)
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="password"
                      value={cloudUri}
                      onChange={(e) => setCloudUri(e.target.value)}
                      placeholder="mongodb+srv://username:password@cluster0.abcde.mongodb.net/iracing"
                      className="font-mono text-xs flex-1"
                    />
                    <Button
                      type="button"
                      onClick={handleSaveDbConfig}
                      disabled={savingDb}
                      size="sm"
                      className="font-mono text-xs"
                    >
                      {savingDb ? "Saving..." : "Save"}
                    </Button>
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    This setting will replicate local telemetry sessions to your specified cloud
                    Mongo instance. Keep empty if you only want local storage.
                  </p>
                </div>

                <div className="rounded-lg border border-border bg-panel p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-border/40 pb-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                      Cloud Sync Engine
                    </span>
                    <span className="text-[10px] text-amber-500 uppercase font-mono tracking-wider font-semibold">
                      Testing Mode
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                      Active Connection Target
                    </span>
                    <span className="text-xs font-mono text-muted-foreground truncate max-w-[300px]">
                      {cloudUri
                        ? cloudUri.startsWith("mongodb")
                          ? "Manual Connection String Configured"
                          : "Configured"
                        : "None (Local Only)"}
                    </span>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* TAB: AI Engine */}
            <TabsContent
              value="ai"
              className="flex-1 overflow-y-auto px-6 py-5 space-y-5 focus:outline-none"
            >
              <div>
                <div className="mb-2.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                  AI Provider Software
                </div>
                <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
                  {LLM_PROVIDERS.map((p) => (
                    <label
                      key={p.id}
                      className={`flex cursor-pointer items-start gap-2.5 rounded-lg border p-2.5 hover:bg-accent/40 transition-colors ${llmProvider === p.id ? "border-primary bg-primary/5" : "border-border bg-panel"}`}
                    >
                      <input
                        type="radio"
                        name="llmProvider"
                        checked={llmProvider === p.id}
                        onChange={() => applyAiDefaults(p.id)}
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
              </div>

              {llmProvider !== "cloud" && (
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
                          setAiTestResult(null);
                        }}
                        placeholder={activeProviderInfo?.url || "http://localhost:1234/v1"}
                        className="font-mono text-xs"
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
                          setAiTestResult(null);
                        }}
                        placeholder="e.g. liquid/lfm2.5-1.2b, llama-3-8b-instruct"
                        className="font-mono text-xs"
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
                        setAiTestResult(null);
                      }}
                      placeholder="Enter LM Studio token or Bearer key if required"
                      className="font-mono text-xs"
                    />
                    <p className="text-[9px] text-muted-foreground mt-1">
                      Required if your local server uses token authentication (e.g. LM Studio
                      0.4.0+).
                    </p>
                  </div>

                  <div className="pt-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={runAiTest}
                      disabled={aiTesting}
                      className="w-full font-mono text-[10px] uppercase tracking-wider gap-1.5"
                    >
                      <RefreshCw className={`h-3 w-3 ${aiTesting ? "animate-spin" : ""}`} />
                      {aiTesting ? "Testing Connection..." : "Test Local Host Software Connection"}
                    </Button>
                    {aiTestResult && (
                      <div
                        className={`mt-3 rounded-lg p-3 border text-xs ${aiTestResult.success ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-400" : "border-rose-500/30 bg-rose-500/5 text-rose-400"}`}
                      >
                        <div className="font-semibold uppercase tracking-wider text-[10px] mb-1 font-mono">
                          {aiTestResult.success
                            ? "✓ AI Connection Successful"
                            : "✗ Connection Failed"}
                        </div>
                        <div className="whitespace-pre-line leading-relaxed font-mono text-[10px]">
                          {aiTestResult.message}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* TAB: Licensing */}
            <TabsContent
              value="licensing"
              className="flex-1 overflow-y-auto px-6 py-5 space-y-5 focus:outline-none"
            >
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-2">
                <h3 className="text-xs font-mono uppercase tracking-wider text-primary font-semibold flex items-center gap-1.5">
                  <Key className="h-4 w-4" />
                  Hardware-Locked Licensing
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Unlock advanced offline analysis sheets and high-frequency real-time widgets. Your license key is cryptographically signed and locked to this PC's hardware.
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <strong>Accessory devices:</strong> Any auxiliary dash readouts (phones, tablets, second PCs) connected to this PC's local IP address will automatically inherit this license!
                </p>
              </div>

              {/* License Status */}
              <div className="rounded-lg border border-border bg-panel p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-border/40 pb-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                    Activation Status
                  </span>
                  {licenseChecking ? (
                    <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase font-mono tracking-wider">
                      <RefreshCw className="h-3 w-3 animate-spin" /> Verifying...
                    </span>
                  ) : licenseState && licenseState.valid ? (
                    <span className="flex items-center gap-1.5 text-[10px] text-emerald-400 uppercase font-mono tracking-wider font-semibold">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Activated ({licenseState.tier.toUpperCase()})
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-[10px] text-rose-400 uppercase font-mono tracking-wider font-semibold">
                      <AlertCircle className="h-3.5 w-3.5" /> Lite Tier (Free)
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between border-b border-border/40 pb-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                    Hardware ID (HWID)
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-foreground font-semibold bg-rail px-2 py-0.5 rounded border border-border select-all">
                      {hwid || "Loading..."}
                    </span>
                    <button
                      onClick={() => hwid && copyHWIDToClipboard()}
                      className="text-muted-foreground hover:text-foreground p-1 transition-colors cursor-pointer"
                      title="Copy HWID"
                    >
                      {copiedHwid ? (
                        <Check className="h-3 w-3 text-emerald-400" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </button>
                  </div>
                </div>

                {licenseState && licenseState.valid && (
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                      Expiration Date
                    </span>
                    <span className="text-xs font-mono text-foreground font-semibold">
                      {licenseState.expires === "never" ? "Lifetime / No Expiration" : licenseState.expires}
                    </span>
                  </div>
                )}
              </div>

              {/* Activate key input */}
              <div className="space-y-3">
                <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-1">
                  Activate License Key
                </h3>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground block">
                    Paste Key Payload
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="password"
                      value={licenseKeyInput}
                      onChange={(e) => setLicenseKeyInput(e.target.value)}
                      placeholder="Paste your base64.signature license key here..."
                      className="font-mono text-xs flex-1"
                    />
                    <Button
                      type="button"
                      onClick={handleActivateLicense}
                      disabled={activatingLicense || !licenseKeyInput}
                      size="sm"
                      className="font-mono text-xs uppercase"
                    >
                      {activatingLicense ? "Activating..." : "Activate"}
                    </Button>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-normal">
                    Paste the license key received for your HWID and click Activate. This will save the credentials locally in the bridge workspace.
                  </p>
                </div>
              </div>
            </TabsContent>

            {/* TAB: Shortcuts */}
            <TabsContent
              value="shortcuts"
              className="flex-1 overflow-y-auto px-6 py-5 space-y-4 focus:outline-none"
            >
              <div className="space-y-3">
                <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-1">
                  Global Keyboard Shortcuts
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  These shortcuts are active globally across all workspaces. They are disabled while
                  editing a form or input field.
                </p>

                <div className="rounded-lg border border-border bg-rail p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-border/40 pb-2">
                    <span className="text-xs font-mono text-foreground font-medium">
                      Toggle Shortcuts Help
                    </span>
                    <span className="rounded border border-border bg-background px-2 py-0.5 text-[10px] font-mono font-semibold uppercase text-primary font-bold">
                      ?
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-border/40 pb-2">
                    <span className="text-xs font-mono text-foreground font-medium">
                      Toggle Settings Panel
                    </span>
                    <div className="flex gap-1.5 items-center">
                      <span className="rounded border border-border bg-background px-2 py-0.5 text-[10px] font-mono font-semibold uppercase text-primary font-bold">
                        Ctrl
                      </span>
                      <span className="text-xs text-muted-foreground font-mono">+</span>
                      <span className="rounded border border-border bg-background px-2 py-0.5 text-[10px] font-mono font-semibold uppercase text-primary font-bold">
                        ,
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-b border-border/40 pb-2">
                    <span className="text-xs font-mono text-foreground font-medium">
                      Go Home (Dashboard)
                    </span>
                    <div className="flex gap-1 items-center">
                      <span className="rounded border border-border bg-background px-2 py-0.5 text-[10px] font-mono font-semibold uppercase text-primary font-bold">
                        g
                      </span>
                      <span className="text-xs text-muted-foreground text-[10px] font-mono">
                        then
                      </span>
                      <span className="rounded border border-border bg-background px-2 py-0.5 text-[10px] font-mono font-semibold uppercase text-primary font-bold">
                        h
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-foreground font-medium">
                      Go Back (or Home)
                    </span>
                    <span className="rounded border border-border bg-background px-2 py-0.5 text-[10px] font-mono font-semibold uppercase text-primary font-bold">
                      Esc
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-panel p-3.5 text-xs text-muted-foreground">
                <h4 className="font-semibold text-foreground mb-1">💡 Quick Tip</h4>
                Pressing <kbd className="font-mono text-primary font-bold">Esc</kbd> inside settings
                dialogs or guides will immediately close them.
              </div>
            </TabsContent>
          </Tabs>

          <div className="hairline-t flex items-center justify-between px-6 py-4 bg-panel shrink-0 border-t border-border/60">
            {activeTab === "ai" ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => applyAiDefaults("cloud")}
                className="gap-1.5 font-mono text-xs"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset AI
              </Button>
            ) : (
              <div />
            )}
            <Button
              size="sm"
              onClick={() => setOpen(false)}
              className="font-mono text-xs cursor-pointer"
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
