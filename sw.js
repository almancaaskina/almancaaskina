const CACHE_NAME = "almanca-askina-v15-classic-refresh";
const APP_SHELL = [
  "./",
  "./index.html",
  "./style.css",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./logo-mark.svg",
  "./css/base.css",
  "./css/reading-grammar.css",
  "./css/tools-pwa.css",
  "./css/daily-reader.css",
  "./css/learning.css",
  "./css/personalization.css",
  "./css/final.css",
  "./css/revolution.css",
  "./css/content-expansion.css",
  "./css/retention.css",
  "./css/less-is-more.css",
  "./css/classic-refresh.css",
  "./js/core.js",
  "./js/reading-grammar.js",
  "./js/tools-pwa.js",
  "./js/daily-reader.js",
  "./js/learning.js",
  "./js/personalization.js",
  "./js/phrases.js",
  "./js/listening.js",
  "./js/sentence-builder.js",
  "./js/trust.js",
  "./js/final-init.js",
  "./js/revolution.js",
  "./js/content-expansion.js",
  "./js/retention.js",
  "./js/less-is-more.js",
  "./js/classic-refresh.js",
  "./data/a1-words.json",
  "./data/a2-words.json",
  "./data/stories-data.js",
  "./data/grammar-data.js",
  "./data/phrases-data.js",
  "./data/practical-words.json",
  "./data/topic-packs-data.js",
  "./data/word-families-data.js"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", event => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put("./index.html", copy));
          return response;
        })
        .catch(() => caches.match("./index.html", { ignoreSearch: true }))
    );
    return;
  }

  const networkFirst = /\.(?:js|css|json|webmanifest)$/i.test(url.pathname);
  if (networkFirst) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response?.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => caches.match(event.request, { ignoreSearch: true }))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then(cached => {
      const network = fetch(event.request).then(response => {
        if (response?.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        }
        return response;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
