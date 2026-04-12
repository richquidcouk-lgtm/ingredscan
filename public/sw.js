const CACHE_NAME = 'ingredscan-v6'
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
]

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Never cache POST requests (photo submissions etc.)
  if (request.method !== 'GET') return

  // API responses: network-only. Supabase + localStorage handle caching.
  // Caching API JSON in the SW just causes stale-data bugs.
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(() =>
        new Response(JSON.stringify({ error: 'offline' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        })
      )
    )
    return
  }

  // Result pages: network-first, cache fallback for offline viewing.
  if (url.pathname.startsWith('/result/')) {
    event.respondWith(
      fetch(request)
        .then(async (response) => {
          if (response.ok) {
            const cache = await caches.open(CACHE_NAME)
            await cache.put(request, response.clone())
          }
          return response
        })
        .catch(async () => {
          const cached = await caches.match(request)
          return cached || new Response('Offline', { status: 503 })
        })
    )
    return
  }

  // Static assets (_next/static, images, fonts): cache-first for speed.
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.endsWith('.woff')
  ) {
    event.respondWith(
      caches.match(request).then((cached) =>
        cached ||
        fetch(request).then(async (response) => {
          const cache = await caches.open(CACHE_NAME)
          await cache.put(request, response.clone())
          return response
        })
      )
    )
    return
  }

  // Everything else: network-first, cache fallback.
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  )
})
