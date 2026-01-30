const CACHE_NAME = 'gds-decoder-v1';
const BASE = (self.location.pathname.replace(/\/sw\.js$/i, '') || '/').replace(/\/?$/, '') + '/';
const ASSETS = [
    BASE,
    BASE + 'index.html',
    BASE + 'style.css',
    BASE + 'src/main.js',
    BASE + 'src/excessBaggage.js',
    BASE + 'src/excessBaggageUI.js',
    BASE + 'src/rateAgent.js',
    BASE + 'src/rateAgentData.js',
    BASE + 'src/parser.js',
    BASE + 'src/analyzer.js',
    BASE + 'src/ui.js',
    BASE + 'src/translator.js',
    BASE + 'src/airportSearch.js',
    BASE + 'src/systemDetector.js',
    BASE + 'src/data.json'
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
