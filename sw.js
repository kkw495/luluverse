// Luluverse Service Worker - v1
// 策略：cache-first + 后台更新，离线可访问已访问过的页面与资源
const CACHE = "luluverse-v1";
const PRECACHE = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./storage.js",
  "./sync.js",
  "./manifest.json",
  "./icon.svg",
  "./countdown.js",
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then((c) =>
      // 单个失败不影响整体
      Promise.all(
        PRECACHE.map((url) =>
          c.add(url).catch((e) => console.warn("[SW] skip", url, e))
        )
      )
    )
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  // 仅处理同源请求；对 Supabase / DeepSeek 等第三方 API 不走缓存
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(req).then((cached) => {
      const networkFetch = fetch(req)
        .then((resp) => {
          if (resp && resp.status === 200 && resp.type === "basic") {
            const clone = resp.clone();
            caches.open(CACHE).then((c) => c.put(req, clone));
          }
          return resp;
        })
        .catch(() => cached);
      return cached || networkFetch;
    })
  );
});