const CACHE_NAME = 'qr-code-cache-v1';
const CACHE_ASSETS = [
    '/',
    '/index.html',
    '/styles.css',
    '/script.js',
    './libs/qrcode.min.js',
    './libs/jsQR.js',
    './manifest.json',
    //'icon-192.png', // Ensure your icons are cached
    //'icon-512.png',
    './ss/iconsmall.png',
    './ss/iconlarge.png'
];

// Install the service worker and cache the assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Caching app shell');
                // Cache files one by one and log errors if any occur
                return Promise.all(
                    CACHE_ASSETS.map((asset) => {
                        return cache.add(asset).catch((err) => {
                            console.error('Failed to cache', asset, err);
                        });
                    })
                );
            })
    );
});


// Fetch event to serve cached assets
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                return response || fetch(event.request);
            })
    );
});

// Activate the service worker and clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
