// GBK Swap service worker — safe mode
// This file intentionally does NOT intercept page/network requests.
// It removes the previous fetch handler that could cause ERR_FAILED.

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
    } catch (e) {}
    try {
      await self.registration.unregister();
    } catch (e) {}
    try {
      const clients = await self.clients.matchAll({ type: "window" });
      clients.forEach((client) => client.postMessage({ type: "GBK_SW_REMOVED" }));
    } catch (e) {}
  })());
});
