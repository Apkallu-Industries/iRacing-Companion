class LocalTelemetryStore {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private initDb(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === "undefined" || !window.indexedDB) {
        reject(new Error("IndexedDB is not supported on the server or this browser."));
        return;
      }
      const request = indexedDB.open("apextrace_local_telemetry", 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains("blobs")) {
          db.createObjectStore("blobs");
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    return this.dbPromise;
  }

  async saveBlob(path: string, blob: Blob): Promise<void> {
    const db = await this.initDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("blobs", "readwrite");
      const store = tx.objectStore("blobs");
      const req = store.put(blob, path);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async getBlob(path: string): Promise<Blob | null> {
    try {
      const db = await this.initDb();
      return new Promise((resolve, reject) => {
        const tx = db.transaction("blobs", "readonly");
        const store = tx.objectStore("blobs");
        const req = store.get(path);
        req.onsuccess = () => resolve(req.result ?? null);
        req.onerror = () => reject(req.error);
      });
    } catch {
      return null;
    }
  }

  async removeBlob(path: string): Promise<void> {
    try {
      const db = await this.initDb();
      return new Promise((resolve, reject) => {
        const tx = db.transaction("blobs", "readwrite");
        const store = tx.objectStore("blobs");
        const req = store.delete(path);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {}
  }
}

export const localTelemetryStore = new LocalTelemetryStore();
