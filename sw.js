const CACHE_NAME = 'azimut-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/src/index.css',
  '/src/main.js',
  '/src/pages/Home.js',
  '/src/pages/Sport/SportHome.js',
  '/src/pages/Sport/Coaching/Dashboard.js',
  '/src/pages/Sport/Coaching/Onboarding.js',
  '/src/pages/Sport/Coaching/SessionView.js',
  '/src/pages/Sport/Routes/RouteGenerator.js',
  '/src/pages/Sport/Nutrition/NutritionPlan.js',
  '/src/pages/Sport/Nutrition/NutritionSetup.js',
  '/src/utils/trainingEngine.js',
  '/src/utils/routeGenerator.js',
  '/src/utils/nutritionEngine.js',
  '/src/data/nutritionProducts.js',
  'https://unpkg.com/lucide@latest',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      return cachedResponse || fetch(e.request);
    }).catch(() => {
      if (e.request.mode === 'navigate') {
        return caches.match('/index.html');
      }
    })
  );
});
