/* Europe 2026 trip app — service worker
   Job #1: cache the app shell so the installed icon opens instantly with
   zero connectivity (this preserves the "works with no signal" promise
   even now that the app is hosted online instead of a local file).
   Job #2 (after you finish OneSignal setup): receive & show push
   notifications. See the TODO block at the bottom. */

const CACHE = "euro2026-shell-v1";
const SHELL = ["./", "./index.html", "./manifest.json",
  "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Cache-first: instant load offline; falls back to network for anything
// not pre-cached, and quietly updates the cache when online.
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then((cached) => {
      const fetchPromise = fetch(e.request)
        .then((res) => {
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(e.request, copy));
          }
          return res;
        })
        .catch(() => cached); // offline + not cached + not shell -> nothing to serve
      return cached || fetchPromise;
    })
  );
});

/* ============================================================
   TODO — OneSignal push notifications
   ============================================================
   1. Create a free account at onesignal.com -> "New App" -> Web Push.
   2. Choose "Custom Code Setup" (not the auto WordPress/Shopify flow).
   3. OneSignal's wizard gives you:
        a) a <head> snippet (with YOUR App ID + Safari Web ID) — paste
           that into index.html where it says
           <!-- ONESIGNAL_HEAD_SNIPPET_GOES_HERE -->
        b) two files: OneSignalSDKWorker.js and OneSignalSDKUpdaterWorker.js
           — download them from the wizard and drop them, UNCHANGED, at
           the root of your hosted site (same folder as this file).
           Do not rename them — OneSignal's SDK looks for those exact names.
   4. Merge push handling into THIS file by adding, at the very top,
      the importScripts line OneSignal's docs show for "Custom service
      worker push handler" (search: OneSignal custom service worker push
      handler), then leave the caching code above untouched below it.
      Their current doc page: https://documentation.onesignal.com/docs/en/web-push-custom-code-setup
      (grab the exact importScripts URL from there — it changes with SDK
      versions, so copy it fresh rather than reusing an old one.)
   ============================================================ */
