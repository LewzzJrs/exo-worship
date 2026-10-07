// Service worker Exo Worship Library:
// halaman yang pernah dibuka (dan lagu di setlist) tetap bisa dibaca tanpa sinyal.

const VERSION = "v1";
const PAGES_CACHE = `exo-pages-${VERSION}`;
const ASSETS_CACHE = `exo-assets-${VERSION}`;

const OFFLINE_HTML = `<!doctype html>
<html lang="id">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Offline | Exo Worship Library</title>
<body style="margin:0;min-height:100vh;display:grid;place-items:center;padding:24px;text-align:center;font-family:system-ui,sans-serif;background:#e6e6e4;color:#111">
  <div>
    <h1 style="font-size:20px">Kamu sedang offline</h1>
    <p style="color:#555">Halaman ini belum pernah dibuka di HP ini. Coba lagi saat ada sinyal.</p>
    <p><a href="/" style="color:#111">Ke Beranda</a></p>
  </div>
</body>
</html>`;

self.addEventListener("install", () => self.skipWaiting());

// hapus cache versi lama
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key !== PAGES_CACHE && key !== ASSETS_CACHE)
          .map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

// halaman admin, API, dan halaman masuk tidak disimpan
function isCacheablePage(url) {
  return (
    !url.pathname.startsWith("/admin") &&
    !url.pathname.startsWith("/api") &&
    url.pathname !== "/masuk"
  );
}

async function savePage(cache, request, response) {
  // hasil redirect ke halaman masuk tidak ikut disimpan
  if (response.ok && !response.redirected) await cache.put(request, response);
}

// halaman: ambil dari internet dulu, kalau gagal pakai simpanan
async function networkFirstPage(request) {
  const cache = await caches.open(PAGES_CACHE);
  try {
    const response = await fetch(request);
    await savePage(cache, request, response.clone());
    return response;
  } catch {
    return (
      (await cache.match(request, { ignoreVary: true })) ||
      (await cache.match(request, { ignoreVary: true, ignoreSearch: true })) ||
      new Response(OFFLINE_HTML, { headers: { "Content-Type": "text/html; charset=utf-8" } })
    );
  }
}

// file JS, CSS, font, dan gambar namanya tidak berubah, jadi pakai simpanan dulu
async function cacheFirstAsset(request) {
  const cache = await caches.open(ASSETS_CACHE);
  const cached = await cache.match(request, { ignoreVary: true });
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) await cache.put(request, response.clone());
  return response;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    if (isCacheablePage(url)) event.respondWith(networkFirstPage(request));
    return;
  }

  if (url.pathname.startsWith("/_next/static/") || /\.(?:png|svg|ico|woff2?)$/.test(url.pathname)) {
    event.respondWith(cacheFirstAsset(request));
  }
});

// simpan beberapa halaman sekaligus, misalnya semua lagu di sebuah setlist
self.addEventListener("message", (event) => {
  if (event.data?.type !== "CACHE_PAGES") return;
  const port = event.ports[0];

  event.waitUntil(
    (async () => {
      const cache = await caches.open(PAGES_CACHE);
      let saved = 0;
      for (const path of event.data.urls) {
        try {
          const response = await fetch(path, { credentials: "same-origin" });
          if (response.ok && !response.redirected) {
            await cache.put(path, response);
            saved++;
          }
        } catch {
          // sedang offline, lewati
        }
      }
      port?.postMessage({ saved, total: event.data.urls.length });
    })(),
  );
});
