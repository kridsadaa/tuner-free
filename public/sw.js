/**
 * Tuner Free — Service Worker
 * ───────────────────────────
 * Minimal cache-first strategy for the app shell.
 * Assets are pre-cached on install; subsequent fetches are served
 * from cache with a network fallback for freshness.
 */

const CACHE_NAME = "tuner-free-v1";

/** Core app shell assets to pre-cache on SW install */
const PRECACHE_URLS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/favicon.svg",
  "/icons.svg",
];

// ── Install ────────────────────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()) // activate immediately
  );
});

// ── Activate ───────────────────────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)) // remove old caches
        )
      )
      .then(() => self.clients.claim()) // take control immediately
  );
});

// ── Fetch ──────────────────────────────────────────────────────────────────
// Strategy: Cache-first for same-origin; network-first for everything else.
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET requests from our own origin
  if (request.method !== "GET" || url.origin !== location.origin) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        // Serve from cache, then update cache in background (stale-while-revalidate)
        const networkFetch = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches
                .open(CACHE_NAME)
                .then((cache) => cache.put(request, networkResponse.clone()));
            }
            return networkResponse;
          })
          .catch(() => {/* offline – already serving from cache */});

        // Return cached copy immediately; background fetch updates it
        void networkFetch;
        return cached;
      }

      // Not in cache — fetch from network and cache for next time
      return fetch(request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200) {
            return networkResponse;
          }
          const responseClone = networkResponse.clone();
          caches
            .open(CACHE_NAME)
            .then((cache) => cache.put(request, responseClone));
          return networkResponse;
        })
        .catch(() => {
          // Fallback to index.html for navigation requests (SPA support)
          if (request.mode === "navigate") {
            return caches.match("/index.html");
          }
        });
    })
  );
});
