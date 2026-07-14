// Black Cat Snake - PWA Service Worker
const CACHE_NAME = 'cat-snake-v3';
const ASSETS = [
    './',
    './index.html',
    './style.css',
    './game.js',
    './audio.js',
    './manifest.json',
    './build/appx/Square150x150Logo.png'
];

// Install Event
self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(ASSETS);
        })
    );
    self.skipWaiting();
});

// Activate Event
self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.map(key => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch Event (Offline Fallback Support)
self.addEventListener('fetch', e => {
    e.respondWith(
        caches.match(e.request).then(cachedResponse => {
            return cachedResponse || fetch(e.request).catch(() => {
                // If offline and not in cache, fallback
                if (e.request.mode === 'navigate') {
                    return caches.match('./index.html');
                }
            });
        })
    );
});
