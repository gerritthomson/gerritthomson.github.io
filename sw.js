const CACHE_NAME = "setlist-v1";
const CORE_FILES = [
  "/performer.html",
  "/manifest.json",
  "/icon.svg"
];
const PDF_JS_URLS = [
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_FILES))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = event.request.url;

  // Cache PDF.js on first access so it works offline later
  if (PDF_JS_URLS.some((u) => url.startsWith(u))) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(url, clone));
          return response;
        })
        .catch(() => caches.match(url))
    );
    return;
  }

  // For everything else: cache-first
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (response.status === 0) return response; // opaque (CORS)
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(url, clone));
        return response;
      });
    })
  );
});
