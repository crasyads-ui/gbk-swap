const GBK_SW_VERSION="2026-09-15-stable-v1";

self.addEventListener("install",event=>{
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate",event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.map(key=>caches.delete(key))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener("fetch",event=>{
  const req=event.request;
  if(req.method!=="GET") return;

  const url=new URL(req.url);

  // Never interfere with wallet/provider/API requests.
  if(url.origin!==self.location.origin){
    return;
  }

  // Network-first for the app shell. This prevents ERR_FAILED caused
  // by an empty service-worker cache after a refresh.
  if(url.pathname==="/" || url.pathname==="/index.html"){
    event.respondWith(
      fetch(req,{cache:"no-store"})
        .then(response=>{
          if(response.ok){
            const copy=response.clone();
            caches.open(GBK_SW_VERSION).then(cache=>cache.put(req,copy)).catch(()=>{});
          }
          return response;
        })
        .catch(()=>caches.match(req).then(cached=>{
          if(cached) return cached;
          return caches.match("/index.html").then(fallback=>{
            if(fallback) return fallback;
            return new Response(
              "<!doctype html><title>GBK Swap</title><h1>GBK Swap is temporarily unavailable</h1><p>Please refresh in a moment.</p>",
              {status:503,headers:{"Content-Type":"text/html;charset=UTF-8"}}
            );
          });
        }))
    );
    return;
  }

  // Cache only successful same-origin GET responses as a fallback.
  event.respondWith(
    fetch(req)
      .then(response=>{
        if(response.ok){
          const copy=response.clone();
          caches.open(GBK_SW_VERSION).then(cache=>cache.put(req,copy)).catch(()=>{});
        }
        return response;
      })
      .catch(()=>caches.match(req))
  );
});