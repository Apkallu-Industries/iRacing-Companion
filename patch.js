const fs = require('fs');

// Patch StackedTraces.tsx
let st = fs.readFileSync('src/components/workbench/StackedTraces.tsx', 'utf8');
st = st.replace('import { useWorkbench, colorForChannel } from "@/lib/store";', 'import { useWorkbench, colorForChannel } from "@/lib/store";\nimport { evaluateMathExpressionForIbt } from "@/lib/math/evaluator";');
st = st.replace('const { selectedChannels, cursorTick, setCursorTick, refLap, cmpLap } = useWorkbench();', 'const { selectedChannels, cursorTick, setCursorTick, refLap, cmpLap, mathExpressions } = useWorkbench();');
st = st.replace(/selectedChannels\.forEach\(\(name\) => \{\s*const ch = parsed\.channels\[name\];\s*if \(\!ch\) return;\s*const ys = new Float64Array\(xs\.length\);\s*for \(let i = 0; i < xs\.length; i\+\+\) ys\[i\] = ch\.data\[from \+ i\];/, 
`selectedChannels.forEach((name) => {
      const ch = parsed.channels[name];
      let dataArray = null;
      let unit = "";
      let min = 0, max = 0, avg = 0;

      if (!ch) {
        const expr = mathExpressions.find(e => e.name === name);
        if (expr && expr.compiled) {
          const evaluated = evaluateMathExpressionForIbt(expr.compiled, parsed);
          if (evaluated) {
            dataArray = evaluated;
            let sum = 0, valid = 0;
            min = Infinity; max = -Infinity;
            for (let i = from; i <= to; i++) {
               const v = evaluated[i];
               if (Number.isFinite(v)) {
                 if (v < min) min = v;
                 if (v > max) max = v;
                 sum += v; valid++;
               }
            }
            avg = valid > 0 ? sum / valid : 0;
            if (min === Infinity) min = 0;
            if (max === -Infinity) max = 0;
          }
        }
      } else {
        dataArray = ch.data;
        unit = ch.unit;
        min = ch.min;
        max = ch.max;
        avg = ch.avg;
      }

      if (!dataArray) return;

      const ys = new Float64Array(xs.length);
      for (let i = 0; i < xs.length; i++) ys[i] = dataArray[from + i];`);
st = st.replace('ys2[i] = i < cmpLen ? ch.data[cmpLapObj.startTick + i] : NaN;', 'ys2[i] = i < cmpLen ? dataArray[cmpLapObj.startTick + i] : NaN;');
st = st.replace('statsSpan.textContent = `${ch.unit || ""} · min ${ch.min.toFixed(2)} · max ${ch.max.toFixed(2)} · avg ${ch.avg.toFixed(2)}`;', 'statsSpan.textContent = `${unit || ""} · min ${min.toFixed(2)} · max ${max.toFixed(2)} · avg ${avg.toFixed(2)}`;');
st = st.replace('}, [parsed, selectedChannels, refLap, cmpLap, setCursorTick]);', '}, [parsed, selectedChannels, refLap, cmpLap, setCursorTick, mathExpressions]);');
fs.writeFileSync('src/components/workbench/StackedTraces.tsx', st);

// Patch ChannelBrowser.tsx
let cb = fs.readFileSync('src/components/workbench/ChannelBrowser.tsx', 'utf8');
cb = cb.replace('import { MiniTrace } from "@/components/ui/MiniTrace";', 'import { MiniTrace } from "@/components/ui/MiniTrace";\nimport { evaluateCompiledMathExpression } from "@/lib/math/evaluator";');
cb = cb.replace('const { selectedChannels, toggleChannel, setChannels, cursorTick } = useWorkbench();', 'const { selectedChannels, toggleChannel, setChannels, cursorTick, mathExpressions } = useWorkbench();');
cb = cb.replace('const cat = catalogEntry(name);\n      const g = cat?.group ?? parsed.channels[name].group;\n      (groups[g] ??= []).push(name);\n    }', 'const cat = catalogEntry(name);\n      const g = cat?.group ?? parsed.channels[name].group;\n      (groups[g] ??= []).push(name);\n    }\n    for (const expr of mathExpressions) {\n      if (expr.enabled && matches(expr.name)) {\n        (groups["Extras"] ??= []).push(expr.name);\n      }\n    }');
cb = cb.replace('}, [parsed, q, essentialsOnly]);', '}, [parsed, q, essentialsOnly, mathExpressions]);');
cb = cb.replace('placeholder={`Search ${parsed.channelNames.length} channels…`}', 'placeholder={`Search ${parsed.channelNames.length + mathExpressions.length} channels…`}');
cb = cb.replace(/const ch = parsed\.channels\[name\];\n\s*const sel = selectedChannels\.includes\(name\);\n\s*const v = ch\.data\[cursorTick\] \?\? 0;/, `const ch = parsed.channels[name];
                    const sel = selectedChannels.includes(name);
                    let v = 0;
                    let unit = "";
                    let traceData = [];
                    const mathExpr = !ch ? mathExpressions.find(e => e.name === name) : null;
                    if (ch) {
                      v = ch.data[cursorTick] ?? 0;
                      unit = ch.unit;
                      traceData = ch.data.slice(Math.max(0, cursorTick - windowFrames), cursorTick + 1);
                    } else if (mathExpr && mathExpr.compiled) {
                      const ctx = {};
                      for (const id of mathExpr.compiled.identifiers) {
                        ctx[id] = parsed.channels[id]?.data[cursorTick] ?? 0;
                      }
                      const res = evaluateCompiledMathExpression(mathExpr.compiled, ctx);
                      v = res.ok ? res.value : NaN;
                    }`);
cb = cb.replace('title={cat?.desc ?? ch.desc ?? name}', 'title={cat?.desc ?? ch?.desc ?? name}');
cb = cb.replace('onClick={(e) => {\n                            e.stopPropagation();\n                            setTraceMode(m => ({ ...m, [name]: !m[name] }));\n                          }}', 'onClick={(e) => {\n                            e.stopPropagation();\n                            if (ch) setTraceMode(m => ({ ...m, [name]: !m[name] }));\n                          }}');
cb = cb.replace(/\{traceMode\[name\] \? \(\n\s*<span className="flex items-center gap-1\.5">\n\s*<MiniTrace \n\s*values=\{ch\.data\.slice\(Math\.max\(0, cursorTick - windowFrames\), cursorTick \+ 1\)\}/, `{traceMode[name] && ch ? (\n                              <span className="flex items-center gap-1.5">\n                                <MiniTrace \n                                  values={traceData}`);
cb = cb.replace(/\{ch\.unit \? <span className="text-\[9px\] text-zinc-600 ml-0\.5">\{ch\.unit\}<\/span> : ""\}/, '{unit ? <span className="text-[9px] text-zinc-600 ml-0.5">{unit}</span> : ""}');
fs.writeFileSync('src/components/workbench/ChannelBrowser.tsx', cb);
