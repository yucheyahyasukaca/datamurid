const CACHE_NAME = 'app-cache-v0.1.0';
const cachedFileExtensions = [
    // Development purpose
    '.tsx',
    '.ts',
    '.sass',
    // Production purpose
    '.js',
    '.css',
    '.png',
    '.jpg',
    '.jpeg',
    '.gif',
    '.svg',
    '.ico',
    '.json',
    '.woff2',
    '.woff',
    '.ttf',
    '.eot'
];

self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll([
                '/sw.js'
            ]);
        })
    );
});

self.addEventListener('fetch', function (event) {
    event.respondWith(
        caches.open(CACHE_NAME).then(cache => {
            return cache.match(event.request).then(response => {
                if (!response) {
                    return fetch(event.request).then(response => {
                        if (response.status === 200) {
                            const requestUrl = new URL(event.request.url);
                            if (cachedFileExtensions.some(ext => requestUrl.pathname.endsWith(ext))) {
                                cache.put(event.request, response.clone());
                            }
                        }
                        return response;
                    });
                }
                return response ?? fetch(event.request);
            });
        })
    );
});

self.addEventListener('activate', function (event) {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                // Delete all caches that are not the current CACHE_NAME
                keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
            );
        })
    );
});
