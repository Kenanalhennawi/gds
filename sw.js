/* GDS Decoder – Service Worker cache for static assets */
const CACHE_NAME = 'gds-decoder-v1';
const ASSETS = [
    '/',
    '/index.html',
    '/style.css',
    '/src/main.js',
    '/src/excessBaggage.js',
    '/src/excessBaggageUI.js',
    '/src/rateAgent.js',
    '/src/rateAgentData.js',
    '/src/parser.js',
    '/src/analyzer.js',
    '/src/ui.js',
    '/src/translator.js',
    '/src/airportSearch.js',
    '/src/systemDetector.js',
    '/src/data.json'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
        ).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;
    event.respondWith(
        caches.match(event.request).then((cached) =>
            cached ? Promise.resolve(cached) : fetch(event.request).then((res) => {
                const clone = res.clone();
                if (res.ok && event.request.url.startsWith(self.location.origin))
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                return res;
            })
        )
    );
});
