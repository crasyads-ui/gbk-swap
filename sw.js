const GBK_SW_VERSION = "2026-09-15-stable-v2";

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    self.clients.claim()
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Never intercept wallet, RPC, CDN, or other cross-origin requests.
  if (url.origin !== self.location.origin) return;

  // Network-only for the app. This prevents stale/empty cache responses
  // and avoids ERR_FAILED from caches.match() returning undefined.
  event.respondWith(
    fetch(request, { cache: "no-store" }).catch(() =>
      new Response(
        "<!doctype html><title>GBK Swap</title><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><h2>GBK Swap is temporarily unavailable</h2><p>Please try again in a moment.</p>",
        {
          status: 503,
          headers: { "Content-Type": "text/html; charset=UTF-8" }
        }
      )
    )
  );
});
