// Service Worker inteligente para BlancAlergic-APP
// Ignora completamente las llamadas a Firebase para evitar conflictos

// Punto de inyección del manifest de Workbox
self.__WB_MANIFEST = [];

const CACHE_NAME = 'blancalergic-v2';
const STATIC_CACHE = 'blancalergic-static-v2';

// Assets estáticos que vamos a cachear
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Patrones de Firebase que deben ser ignorados completamente
const FIREBASE_PATTERNS = [
  'firestore.googleapis.com',
  'identitytoolkit.googleapis.com',
  'googleapis.com',
  'firebaseio.com',
  'firebase.googleapis.com'
];

// Función para verificar si una URL es de Firebase
function isFirebaseURL(url) {
  return FIREBASE_PATTERNS.some(pattern => url.includes(pattern));
}

// Instalación del Service Worker
self.addEventListener('install', event => {
  console.log('🔥 SW: Instalando Service Worker...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('🔥 SW: Cacheando assets estáticos');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activación del Service Worker
self.addEventListener('activate', event => {
  console.log('🔥 SW: Activando Service Worker...');
  event.waitUntil(
    Promise.all([
      // Limpiar cachés antiguos
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && cacheName !== CACHE_NAME) {
              console.log('🔥 SW: Eliminando cache antiguo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Tomar control inmediato
      self.clients.claim()
    ])
  );
});

// Estrategia de fetch principal
self.addEventListener('fetch', event => {
  const url = event.request.url;

  // 🔥 IGNORAR COMPLETAMENTE LAS LLAMADAS A FIREBASE
  if (isFirebaseURL(url)) {
    console.log('🔥 SW: Ignorando llamada a Firebase:', url);
    // No hacer nada - dejar que la solicitud vaya directamente a la red
    return;
  }

  // Para todo lo demás, aplicar estrategias de caché
  event.respondWith(handleRequest(event.request));
});

// Función principal para manejar las solicitudes
async function handleRequest(request) {
  const url = new URL(request.url);

  try {
    // Estrategia: Cache First para recursos estáticos
    if (isStaticResource(request)) {
      return await cacheFirst(request);
    }

    // Estrategia: Network First para everything else
    return await networkFirst(request);

  } catch (error) {
    console.error('🔥 SW: Error en handleRequest:', error);
    return new Response('Error de red', { status: 500 });
  }
}

// Verificar si es un recurso estático
function isStaticResource(request) {
  const staticTypes = ['script', 'style', 'image', 'font'];
  return staticTypes.includes(request.destination) ||
         request.url.includes('/assets/') ||
         request.url.includes('/icons/');
}

// Estrategia Cache First
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    console.log('🔥 SW: Sirviendo desde cache:', request.url);
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      console.log('🔥 SW: Cacheando nuevo recurso:', request.url);
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error('🔥 SW: Error en cacheFirst:', error);
    throw error;
  }
}

// Estrategia Network First
async function networkFirst(request) {
  try {
    console.log('🔥 SW: Intentando desde red:', request.url);
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('🔥 SW: Red falló, intentando cache:', request.url);
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    throw error;
  }
}

// Manejo de notificaciones push
self.addEventListener('push', event => {
  console.log('🔥 SW: Recibida notificación push');

  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/BlancAlergic-APP/icons/icon-192x192.png',
      badge: '/BlancAlergic-APP/icons/icon-192x192.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.primaryKey || 1
      },
      actions: [
        {
          action: 'explore',
          title: 'Ver detalles',
          icon: '/BlancAlergic-APP/icons/icon-192x192.png'
        },
        {
          action: 'close',
          title: 'Cerrar',
          icon: '/BlancAlergic-APP/icons/icon-192x192.png'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Manejo de clic en notificaciones
self.addEventListener('notificationclick', event => {
  console.log('🔥 SW: Clic en notificación');
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/BlancAlergic-APP/historial-medico')
    );
  } else {
    event.waitUntil(
      clients.openWindow('/BlancAlergic-APP/')
    );
  }
});

// Sincronización en segundo plano (para futuras features)
self.addEventListener('sync', event => {
  console.log('🔥 SW: Evento de sincronización:', event.tag);

  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  console.log('🔥 SW: Realizando sincronización en segundo plano');
  // Implementar lógica de sincronización aquí
}

// Mensajes desde la app
self.addEventListener('message', event => {
  console.log('🔥 SW: Mensaje recibido:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('🔥 SW: Service Worker inteligente cargado');