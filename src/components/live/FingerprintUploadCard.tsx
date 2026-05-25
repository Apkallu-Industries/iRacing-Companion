import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Fingerprint, FolderUp } from "lucide-react";
import { toast } from "sonner";
import {
  selectLapfiles,
  parseRaw,
  buildFingerprint,
  saveFingerprint,
  loadFingerprint,
  type DriverFingerprint,
} from "@/lib/fingerprint/compute";
import { upsertFingerprint } from "@/lib/fingerprint.functions";
import { classifyCar } from "@/lib/fingerprint/carClass";
import { useAuth } from "@/lib/auth";

export function FingerprintUploadCard() {
  const { user } = useAuth();
  const [fp, setFp] = useState<DriverFingerprint | null>(null);
  useEffect(() => {
    setFp(loadFingerprint());
  }, []);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number; failed: number } | null>(
    null,
  );
  const inputRef = useRef<HTMLInputElement | null>(null);

  const ingest = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      setBusy(true);
      try {
        const { selected, totalScanned } = selectLapfiles(files);
        if (selected.length === 0) {
          toast.error(
            `Scanned ${totalScanned} files but found no .olap/.blap files. Pick your iRacing 'lapfiles' folder.`,
          );
          return;
        }
        setProgress({ done: 0, total: selected.length, failed: 0 });
        const parsedAll: { trackFolder: string; parsed: ReturnType<typeof parseRaw> }[] = [];
        let failed = 0;
        for (let i = 0; i < selected.length; i++) {
          const s = selected[i];
          try {
            const buf = await s.file.arrayBuffer();
            const parsed = parseRaw({
              path: s.file.name,
              trackFolder: s.trackFolder,
              baseName: s.baseName,
              ext: s.ext,
              buffer: buf,
            });
            parsedAll.push({ trackFolder: s.trackFolder, parsed });
          } catch {
            failed++;
          }
          if (i % 16 === 15) await new Promise((r) => setTimeout(r, 0));
          setProgress({ done: i + 1, total: selected.length, failed });
        }
        if (parsedAll.length === 0) {
          toast.error("Found lapfiles but none could be parsed.");
          return;
        }
        const next = buildFingerprint(parsedAll);
        setFp(next);
        saveFingerprint(next);
        toast.success(
          `Fingerprint built from ${parsedAll.length} files across ${next.totalTracks} tracks${failed ? ` (${failed} skipped)` : ""}.`,
        );
        if (user) {
          try {
            const pairs = next.pairs.map((p) => ({
              track: p.track,
              car: p.car,
              carClass: classifyCar(p.car),
              bestEverS: p.bestEverS,
              optimalEverS: p.optimalEverS,
              medianBestS: p.medianBestS,
              bestStdevS: p.bestStdevS,
              bestLapSectors: p.bestLapSectors,
              bestPerSector: p.bestPerSector,
              trackLengthM: p.trackLengthM,
              trackLengthKnown: p.trackLengthKnown,
              fileCount: p.fileCount,
              latestBuildDate: p.latestBuildDate,
              earliestBuildDate: p.earliestBuildDate,
              trend: p.trend,
            }));
            const r = (await upsertFingerprint({ data: { pairs } })) as {
              ok: boolean;
              count?: number;
              error?: string;
            };
            if (r.ok) toast.success(`Synced ${r.count ?? pairs.length} pairs to your account.`);
            else toast.error(`Sync failed: ${r.error}`);
          } catch (e) {
            toast.error(`Sync failed: ${e instanceof Error ? e.message : "unknown"}`);
          }
        } else {
          toast.message("Sign in to sync your fingerprint and unlock live coaching.");
        }
      } finally {
        setBusy(false);
        setProgress(null);
      }
    },
    [user],
  );

  return (
    <div className="bg-zinc-925 ring-1 ring-white/5 rounded-lg p-4">
      <div className="mb-3 flex items-center gap-2">
        <Fingerprint className="h-3.5 w-3.5 text-racing-cyan" />
        <h2 className="text-[10px] uppercase tracking-[0.2em] text-zinc-300 font-medium">
          Driver Fingerprint
        </h2>
        <Link
          to="/fingerprint"
          className="ml-auto text-[10px] font-mono text-racing-cyan hover:underline"
        >
          Full view →
        </Link>
      </div>

      <p className="text-[11px] text-zinc-400 mb-3">
        Upload your{" "}
        <code className="rounded-sm bg-zinc-900 px-1 font-mono text-[10px]">
          Documents/iRacing/lapfiles
        </code>{" "}
        folder to build a baseline from every reference lap. Parsed locally; only summaries sync.
      </p>

      <div className="flex items-center gap-2">
        <button
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="flex h-9 items-center gap-2 rounded-sm border border-zinc-800 bg-racing-cyan/15 px-3 font-mono text-[11px] uppercase tracking-wider text-zinc-100 hover:bg-racing-cyan/25 disabled:opacity-50"
        >
          <FolderUp className="h-3.5 w-3.5" />
          {fp ? "Rebuild from folder" : "Pick lapfiles folder"}
        </button>
        {fp && (
          <span className="font-mono text-[10px] text-zinc-400">
            {fp.totalTracks} tracks · {fp.totalCars} cars · {fp.pairs.length} pairs
          </span>
        )}
        <input
          ref={inputRef}
          type="file"
          multiple
          // @ts-expect-error – non-standard attrs for folder picking
          webkitdirectory=""
          directory=""
          className="hidden"
          onChange={(e) => void ingest(e.target.files)}
        />
      </div>

      {progress && (
        <div className="mt-3 font-mono text-[11px] text-zinc-400">
          Parsing {progress.done}/{progress.total}
          {progress.failed > 0 && ` · ${progress.failed} skipped`}
          <div className="mt-1 h-1 w-full overflow-hidden rounded-sm bg-zinc-900">
            <div
              className="h-full bg-racing-cyan transition-[width]"
              style={{ width: `${(progress.done / progress.total) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
