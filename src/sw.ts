// Service Worker simple para PWA
const CACHE_NAME = 'blancalergic-v1'
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.webmanifest'
]

// Instalación del service worker
self.addEventListener('install', (event: any) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  )
})

// Estrategia de caché
self.addEventListener('fetch', (event: any) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request)
      })
  )
})

// Activación y limpieza de cachés antiguas
self.addEventListener('activate', (event: any) => {
  event.waitUntil(
    caches.keys().then((cacheNames: any) => {
      return Promise.all(
        cacheNames.map((cacheName: string) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})