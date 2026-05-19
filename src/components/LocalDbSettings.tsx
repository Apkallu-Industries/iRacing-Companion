import { useState, useEffect } from "react";
import { Database, Server, RefreshCw, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { testLocalDbConnection } from "@/lib/localDb.functions";
import { toast } from "sonner";

export function LocalDbSettings() {
    const [open, setOpen] = useState(false);
    const [testing, setTesting] = useState(false);
    const [status, setStatus] = useState<"unchecked" | "connected" | "failed">("unchecked");
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
    const [idbUsage, setIdbUsage] = useState<string>("Calculating...");

    const checkConnection = async () => {
        setTesting(true);
        setStatus("unchecked");
        try {
            const res = await testLocalDbConnection();
            setTestResult(res);
            setStatus(res.success ? "connected" : "failed");
        } catch (e: any) {
            setTestResult({
                success: false,
                message: `Connection failed: ${e.message || String(e)}`
            });
            setStatus("failed");
        } finally {
            setTesting(false);
        }
    };

    const checkIndexedDbSize = async () => {
        if (typeof navigator !== "undefined" && navigator.storage && navigator.storage.estimate) {
            try {
                const estimate = await navigator.storage.estimate();
                const used = estimate.usage ? (estimate.usage / (1024 * 1024)).toFixed(1) : "0";
                const total = estimate.quota ? (estimate.quota / (1024 * 1024 * 1024)).toFixed(1) : "unknown";
                setIdbUsage(`${used} MB used of ${total} GB quota`);
            } catch {
                setIdbUsage("Available");
            }
        } else {
            setIdbUsage("Supported");
        }
    };

    const clearIndexedDb = async () => {
        if (!confirm("Are you sure you want to clear your local IndexedDB file cache? This will delete all downloaded telemetry files from this browser. Telemetry session records in MongoDB will remain.")) {
            return;
        }
        try {
            const req = indexedDB.deleteDatabase("apextrace_local_telemetry");
            req.onsuccess = () => {
                toast.success("Local IndexedDB file cache cleared successfully.");
                checkIndexedDbSize();
            };
            req.onerror = () => {
                toast.error("Failed to clear local file cache.");
            };
        } catch (err: any) {
            toast.error(err.message || "Error clearing cache");
        }
    };

    useEffect(() => {
        if (open) {
            checkConnection();
            checkIndexedDbSize();
        }
    }, [open]);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <button
                    className="flex items-center gap-1.5 rounded-sm px-2 py-1 hover:bg-accent hover:text-foreground"
                    title="Configure Local Storage & Database"
                >
                    <Database className="h-3.5 w-3.5" />
                    Database
                </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[380px] sm:w-[440px] flex flex-col p-0 bg-background text-foreground border-l border-border">
                <SheetHeader className="px-4 pt-4">
                    <SheetTitle className="font-mono text-sm tracking-wider flex items-center gap-2">
                        <Database className="h-4 w-4 text-primary" />
                        LOCAL STORAGE & DATABASE
                    </SheetTitle>
                    <SheetDescription className="text-xs">
                        Configure and test your offline MongoDB database and local browser file storage.
                    </SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
                    {/* Status Overview Card */}
                    <div className="hairline rounded-md bg-panel p-4 space-y-3">
                        <div className="flex items-center justify-between border-b border-border/40 pb-2">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">MongoDB Status</span>
                            {testing ? (
                                <span className="flex items-center gap-1 text-[10px] text-muted-foreground uppercase font-mono tracking-wider">
                                    <RefreshCw className="h-3 w-3 animate-spin" /> Testing...
                                </span>
                            ) : status === "connected" ? (
                                <span className="flex items-center gap-1 text-[10px] text-emerald-400 uppercase font-mono tracking-wider">
                                    <CheckCircle2 className="h-3.5 w-3.5" /> Connected
                                </span>
                            ) : (
                                <span className="flex items-center gap-1 text-[10px] text-rose-400 uppercase font-mono tracking-wider">
                                    <AlertCircle className="h-3.5 w-3.5" /> Disconnected
                                </span>
                            )}
                        </div>

                        <div className="flex items-center justify-between border-b border-border/40 pb-2">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">IndexedDB File Cache</span>
                            <span className="text-xs font-mono text-primary font-medium">Active</span>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Local Cache Size</span>
                            <span className="text-xs font-mono text-muted-foreground">{idbUsage}</span>
                        </div>
                    </div>

                    {/* Step-by-Step setup guide */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-1">
                            Setup Guide
                        </h3>

                        <div className="space-y-4 text-xs leading-relaxed text-muted-foreground">
                            <div className="space-y-1">
                                <div className="font-semibold text-foreground font-mono text-[11px]">Step 1: Install & Run MongoDB</div>
                                <p>
                                    ApexTrace requires a running MongoDB server on your local machine to keep your lap records and session metadata.
                                </p>
                                <div className="mt-2 rounded bg-rail p-2.5 font-mono text-[10px] text-foreground border border-border/60">
                                    <span className="text-muted-foreground"># Windows (via winget)</span>
                                    <br />
                                    winget install MongoDB.Community.Server
                                    <br />
                                    <br />
                                    <span className="text-muted-foreground"># Docker Container</span>
                                    <br />
                                    docker run -d -p 27017:27017 --name iracing-mongo mongo:latest
                                </div>
                            </div>

                            <div className="space-y-1">
                                <div className="font-semibold text-foreground font-mono text-[11px]">Step 2: Connection Stability</div>
                                <p>
                                    The application connects automatically to <code className="font-mono bg-rail px-1 rounded text-primary">mongodb://127.0.0.1:27017/</code>. Ensure this port is not blocked or occupied.
                                </p>
                            </div>

                            <div className="space-y-1">
                                <div className="font-semibold text-foreground font-mono text-[11px]">Step 3: Verification</div>
                                <p>
                                    Click "Test Connection" below. This will ping the local MongoDB instance and initialize required schemas and indexes.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Connection Tester */}
                    <div className="space-y-3 pt-2">
                        <Button
                            type="button"
                            onClick={checkConnection}
                            disabled={testing}
                            className="w-full font-mono text-[10px] uppercase tracking-wider gap-1.5"
                        >
                            <Server className="h-3.5 w-3.5" />
                            {testing ? "Testing Local DB..." : "Test Database Connection"}
                        </Button>

                        {testResult && (
                            <div className={`rounded-md p-3 border text-xs whitespace-pre-line leading-relaxed font-sans ${testResult.success ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-400" : "border-rose-500/30 bg-rose-500/5 text-rose-400"}`}>
                                <div className="font-semibold uppercase tracking-wider text-[10px] mb-1 font-mono">
                                    {testResult.success ? "✓ MongoDB connection OK" : "✗ MongoDB connection Failed"}
                                </div>
                                <div className="font-mono text-[11px]">{testResult.message}</div>
                            </div>
                        )}
                    </div>

                    {/* IndexedDB Cache operations */}
                    <div className="space-y-3 pt-4 border-t border-border/40">
                        <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                            Browser Cache Management
                        </h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Telemetry binary files (<code className="font-mono">.ibt</code> and <code className="font-mono">.pwlap</code>) are saved in your browser's local cache. You can empty this cache to free up disk space.
                        </p>
                        <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={clearIndexedDb}
                            className="w-full font-mono text-[10px] uppercase tracking-wider gap-1.5"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                            Clear Browser File Cache
                        </Button>
                    </div>
                </div>

                <div className="hairline-t flex items-center justify-end px-4 py-3 bg-panel-2">
                    <Button size="sm" onClick={() => setOpen(false)}>
                        Done
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}
