const CACHE_NAME = 'ciderlabs-v1';
const PRECACHE_ASSETS = [
  '/',
  '/favicon.svg',
  '/manifest.webmanifest',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // GETリクエストのみ対象
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // 同一オリジンのみキャッシュ対象
  if (url.origin !== self.location.origin) return;

  // キャッシュの書き込み失敗でネットワーク応答を失わないようにする
  const updateCache = async (response) => {
    if (response.ok) {
      const clone = response.clone();
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, clone);
    }
  };
  const reportCacheError = (error) => {
    console.warn('Cache update failed', error);
  };

  // HTML ナビゲーションリクエスト: Network-First（最新のHTMLを優先取得、オフライン時はキャッシュ）
  if (request.mode === 'navigate') {
    const networkPromise = fetch(request);
    event.waitUntil(networkPromise.then(updateCache).catch(reportCacheError));
    event.respondWith(
      networkPromise.catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        return new Response('Offline', {
          status: 503,
          headers: { 'Content-Type': 'text/plain' },
        });
      }),
    );
    return;
  }

  // 静的アセット (画像、CSS、JS、フォント等): Stale-While-Revalidate
  const cachedPromise = caches.match(request);
  const fetchPromise = cachedPromise.then(() => fetch(request));
  event.waitUntil(fetchPromise.then(updateCache).catch(reportCacheError));
  event.respondWith(
    cachedPromise.then(
      (cachedResponse) =>
        cachedResponse || fetchPromise.catch(() => cachedResponse),
    ),
  );
});
