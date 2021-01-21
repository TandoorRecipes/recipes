// These JavaScript module imports need to be bundled:
import {precacheAndRoute} from 'workbox-precaching';
import {registerRoute, setCatchHandler} from 'workbox-routing';
import {CacheFirst, NetworkFirst, StaleWhileRevalidate} from 'workbox-strategies';
import {ExpirationPlugin} from 'workbox-expiration';


const OFFLINE_CACHE_NAME = 'offline-html';
const OFFLINE_PAGE_URL = '/offline/';

self.addEventListener('install', async (event) => {
    event.waitUntil(
        caches.open(OFFLINE_CACHE_NAME).then((cache) => cache.add(new Request(OFFLINE_PAGE_URL, {cache: "reload"})))
    );
});

// default handler if everything else fails
setCatchHandler(({event}) => {
    switch (event.request.destination) {
        case 'document':
            console.log('Triggered fallback HTML')
            return caches.match(OFFLINE_PAGE_URL);

        default:
            console.log('Triggered response ERROR')
            return Response.error();
    }
});

precacheAndRoute(self.__WB_MANIFEST);

registerRoute(
    ({request}) => request.destination === 'image',
    new CacheFirst({
        cacheName: 'images',
        plugins: [
            new ExpirationPlugin({
                maxEntries: 20,
            }),
        ],
    }),
);

registerRoute(
    ({request}) => request.destination === 'script' || request.destination === 'style',
    new StaleWhileRevalidate({
        cacheName: 'assets'
    })
)

registerRoute(
    new RegExp('jsi18n/'),
    new StaleWhileRevalidate({
        cacheName: 'assets'
    })
)

registerRoute(
    new RegExp('api/*'),
    new NetworkFirst({
        cacheName: 'api',
        plugins: [
            new ExpirationPlugin({
                maxEntries: 50
            }),
        ],
    })
)

registerRoute(
    new RegExp('api/recipe/([0-9]+)'),
    new NetworkFirst({
        cacheName: 'api-recipe',
        plugins: [
            new ExpirationPlugin({
                maxEntries: 50,
            }),
        ],
    })
)

const matchHtml = ({url, request, event}) => {
    if (request.destination === 'document') {
        if (RegExp('view/recipe/*').test(url)) {
            return true
        }
        if (RegExp('search/*').test(url)) {
            return true
        }
        if (RegExp('plan/*').test(url)) {
            return true
        }
    }
    return false;
};

registerRoute(
    matchHtml,
    new NetworkFirst({
        cacheName: 'html',
        plugins: [
            new ExpirationPlugin({
                maxAgeSeconds: 60 * 60 * 24 * 30,
            }),
        ],
    })
)

