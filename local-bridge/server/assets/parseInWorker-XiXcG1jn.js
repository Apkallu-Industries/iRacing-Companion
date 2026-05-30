function parseIbtInWorker(buffer, onProgress) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL("./parser.worker.ts", import.meta.url), { type: "module" });
    worker.onmessage = (ev) => {
      const m = ev.data;
      if (m.kind === "progress") onProgress?.(m.phase, m.pct, m.message);
      else if (m.kind === "done") {
        resolve(m.parsed);
        worker.terminate();
      } else if (m.kind === "error") {
        reject(new Error(m.message));
        worker.terminate();
      }
    };
    worker.onerror = (e) => {
      reject(new Error(e.message || "Worker error"));
      worker.terminate();
    };
    worker.postMessage({ buffer }, [buffer]);
  });
}
export {
  parseIbtInWorker as p
};
