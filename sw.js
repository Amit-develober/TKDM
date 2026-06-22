// ApexTaekwondo PWA Service Worker
const CACHE_NAME = "apextaekwondo-cache-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./index.css",
  "./manifest.json",
  "./js/app.js",
  "./js/auth.js",
  "./js/db.js",
  "./js/firebase-config.js",
  "./assets/logo.png",
  "https://unpkg.com/lucide@latest",
  "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700;800&display=swap"
];

// Installation Lifecycle hook
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log("Service Worker: Caching critical shell assets...");
        return cache.addAll(ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activation Lifecycle hook
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("Service Worker: Clearing legacy cache:", key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch events handling (Stale-While-Revalidate / Cache-First strategy)
self.addEventListener("fetch", (e) => {
  // Only cache standard GET requests (e.g. bypass Firestore REST/Websocket calls)
  if (e.request.method !== "GET") return;

  const url = e.request.url;

  // Bypass Firebase backend requests (Auth, Firestore, Analytics, etc.)
  // but ALLOW Google Fonts (fonts.googleapis.com / fonts.gstatic.com) to be cached
  const isFirebaseBackend =
    url.includes("firestore.googleapis.com") ||
    url.includes("identitytoolkit.googleapis.com") ||
    url.includes("securetoken.googleapis.com") ||
    url.includes("firebaseinstallations.googleapis.com") ||
    url.includes("firebase.googleapis.com") ||
    url.includes("firebasestorage.googleapis.com") ||
    url.includes("www.gstatic.com/firebasejs");

  if (isFirebaseBackend) {
    return;
  }

  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Cache hit: return cached version immediately, update cache in background
        fetch(e.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(e.request, responseToCache);
              });
            }
          })
          .catch(() => {
            // Silently ignore background revalidation errors (e.g., offline)
          });
        return cachedResponse;
      }

      // Cache miss: fetch from network and cache the response
      return fetch(e.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, responseToCache);
          });
        }
        return networkResponse;
      });
      // If network also fails on a cache miss, the browser gets a natural network error
    })
  );
});
