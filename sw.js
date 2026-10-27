// Guarda la app en el móvil para que abra al instante y sin conexión.
const CACHE = "mi-hucha-v12";
const CORE = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE))); self.skipWaiting(); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  // La propia app: primero red (para recibir actualizaciones), si no hay, la copia guardada
  if (url.origin === location.origin) {
    e.respondWith(fetch(e.request).then(r => { const cp = r.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); return r; })
      .catch(() => caches.match(e.request).then(r => r || caches.match("./index.html"))));
    return;
  }
  // Fuentes y librerías (PDF/Excel): copia guardada primero
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(res => {
    const cp = res.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); return res;
  })));
});
