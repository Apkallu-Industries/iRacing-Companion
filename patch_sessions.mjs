import fs from 'fs';

let content = fs.readFileSync('src/routes/sessions.$id.tsx', 'utf8');

// Insert imports
content = content.replace(
  'import { BrakeBias } from "@/components/workbench/BrakeBias";\nimport { SlipAngle } from "@/components/workbench/SlipAngle";',
  'import { BrakeBias } from "@/components/workbench/BrakeBias";\nimport { SlipAngle } from "@/components/workbench/SlipAngle";\nimport { HistogramPanel } from "@/components/workbench/HistogramPanel";\nimport { XYScatterPanel } from "@/components/workbench/XYScatterPanel";'
);

// Insert into bottomTab state
content = content.replace(
  '| "apex" | "waterfall"\n  >("cinema");',
  '| "apex" | "waterfall" | "histogram" | "scatter"\n  >("cinema");'
);

// Replace button array
const oldButtons = '(["cinema", "readout", "laps", "gg", "optimal", "whatif", "apex", "waterfall", "brake", "slip", "replay3d", "piano", "spider", "setup", "setupdiff"] as const)';
const newButtons = '(["cinema", "readout", "laps", "gg", "histogram", "scatter", "optimal", "whatif", "apex", "waterfall", "brake", "slip", "replay3d", "piano", "spider", "setup", "setupdiff"] as const)';
content = content.replace(oldButtons, newButtons);

// Insert into switch labels
content = content.replace(
  ': t === "gg"\n                                ? "g-g"',
  ': t === "gg"\n                                ? "g-g"\n                                : t === "histogram"\n                                  ? "Hist"\n                                  : t === "scatter"\n                                    ? "XY"'
);

// Insert components
content = content.replace(
  '{bottomTab === "gg" && <GGDiagram parsed={parsed} />}',
  '{bottomTab === "gg" && <GGDiagram parsed={parsed} />}\n                    {bottomTab === "histogram" && <HistogramPanel />}\n                    {bottomTab === "scatter" && <XYScatterPanel />}'
);

fs.writeFileSync('src/routes/sessions.$id.tsx', content, 'utf8');
console.log("Patched sessions.$id.tsx");
