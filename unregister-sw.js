// Script para limpiar el Service Worker anterior
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      console.log('Unregistering service worker:', registration.scope);
      registration.unregister();
    }
  });

  // Limpiar cachés
  if ('caches' in window) {
    caches.keys().then(function(cacheNames) {
      cacheNames.forEach(function(cacheName) {
        caches.delete(cacheName);
      });
    });
  }

  console.log('Service Workers y cachés limpiados');
}