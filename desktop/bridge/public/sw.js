// Network-first so a restarted bridge always serves fresh code. Cache
// only used as an offline fallback for the shell.
const CACHE = "pitwall-v4";
const SHELL = ["/", "/index.html", "/manifest.webmanifest", "/icon.svg"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL).catch(() => {})));
  self.skipWaiting();
});
self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.protocol === "ws:" || url.protocol === "wss:") return;
  e.respondWith((async () => {
    try {
      const fresh = await fetch(e.request, { cache: "no-store" });
      const cache = await caches.open(CACHE);
      cache.put(e.request, fresh.clone()).catch(() => {});
      return fresh;
    } catch {
      return (await caches.match(e.request)) || (await caches.match("/index.html"));
    }
  })());
});
