const fs = require("fs");

// Patch sessions.index.tsx
let si = fs.readFileSync("src/routes/sessions.index.tsx", "utf8");
si = si.replace(
  'import { uploadAndIndexIbt } from "@/lib/uploadIbt";',
  'import { uploadAndIndexIbt } from "@/lib/uploadIbt";\nimport { ImportPwlapButton } from "@/components/workbench/ImportPwlapButton";',
);
si = si.replace(
  /<div className="flex gap-2">\s*<Link\s*to="\/live"/,
  '<div className="flex gap-2">\n              <ImportPwlapButton />\n              <Link\n                to="/live"',
);
si = si.replace(
  /<Upload className="h-8 w-8 text-primary" \/>\s*<p className="mt-3 text-sm">\s*\{busy \? \(/,
  '<Upload className="h-8 w-8 text-primary" />\n          <p className="mt-3 text-sm">\n            {busy ? (',
);
si = si.replace(
  '<>Drop an <span className="font-mono text-primary">.ibt</span> file or click to browse</>',
  '<>Drop an <span className="font-mono text-primary">.ibt</span> or <span className="font-mono text-primary">.pwlap</span> file or click to browse</>',
);
si = si.replace('accept=".ibt"', 'accept=".ibt,.pwlap"');

si = si.replace(
  'if (!file.name.toLowerCase().endsWith(".ibt")) {',
  'if (file.name.toLowerCase().endsWith(".pwlap")) {\n      // Let ImportPwlapButton handle it conceptually, but we can do it here if we want.\n      toast.error("Please use the Import .pwlap button for .pwlap files");\n      return;\n    }\n    if (!file.name.toLowerCase().endsWith(".ibt")) {',
);

fs.writeFileSync("src/routes/sessions.index.tsx", si);

// Patch sessions.$id.tsx to add export button
let sid = fs.readFileSync("src/routes/sessions.$id.tsx", "utf8");
sid = sid.replace(
  'import { AppHeader } from "@/components/AppHeader";',
  'import { AppHeader } from "@/components/AppHeader";\nimport { ExportPwlapDialog } from "@/components/workbench/ExportPwlapDialog";\nimport { useState } from "react";',
);
sid = sid.replace(
  'const [sess, setSess] = useState<Tables<"telemetry_sessions"> | null>(null);',
  'const [sess, setSess] = useState<Tables<"telemetry_sessions"> | null>(null);\n  const [showExport, setShowExport] = useState(false);',
);
sid = sid.replace(
  "{/* Left: Info */}",
  "{showExport && sess && <ExportPwlapDialog sessionId={sess.id} onClose={() => setShowExport(false)} />}\n          {/* Left: Info */}",
);
sid = sid.replace(
  "</button>\n          </div>\n        </AppHeader>",
  '</button>\n            <button\n              onClick={() => setShowExport(true)}\n              className="flex h-6 items-center gap-1.5 rounded-sm border border-border bg-rail px-2 font-mono text-[10px] uppercase text-muted-foreground hover:bg-accent hover:text-foreground"\n              title="Export .pwlap"\n            >\n              <Download className="h-3 w-3" /> Export\n            </button>\n          </div>\n        </AppHeader>',
);
fs.writeFileSync("src/routes/sessions.$id.tsx", sid);
