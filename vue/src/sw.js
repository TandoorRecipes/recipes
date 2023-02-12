// These JavaScript module imports need to be bundled:
import {precacheAndRoute} from 'workbox-precaching';
import {registerRoute, setCatchHandler} from 'workbox-routing';
import {CacheFirst, NetworkFirst, NetworkOnly, StaleWhileRevalidate} from 'workbox-strategies';
import {ExpirationPlugin} from 'workbox-expiration';
import {BackgroundSyncPlugin, Queue} from "workbox-background-sync";


const OFFLINE_CACHE_NAME = 'offline-html';
let script_name = typeof window !== 'undefined' ? localStorage.getItem('SCRIPT_NAME') : '/'
var OFFLINE_PAGE_URL = script_name + 'offline/';

self.addEventListener('install', async (event) => {
    event.waitUntil(
        caches.open(OFFLINE_CACHE_NAME).then((cache) => cache.add(new Request(OFFLINE_PAGE_URL, {cache: "reload"})))
    );
});

// since the mode is inject manifest this needs to be present but because
// precacheAndRoute is cache first and i currently dont really know how to
// do versioning i will not use it
self.__WB_MANIFEST

// default handler if everything else fails
setCatchHandler(({event}) => {
    switch (event.request.destination) {
        case 'document':
            console.log('Triggered fallback HTML')
            return caches.open(OFFLINE_CACHE_NAME).then((cache) => cache.match(OFFLINE_PAGE_URL))
        default:
            console.log('Triggered response ERROR')
            return Response.error();
    }
});

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
    ({request}) => (request.destination === 'script' || request.destination === 'style'),
    new NetworkFirst({
        cacheName: 'assets'
    })
)

registerRoute(
    new RegExp('jsreverse'),
    new StaleWhileRevalidate({
        cacheName: 'assets'
    })
)

registerRoute(
    new RegExp('jsi18n'),
    new StaleWhileRevalidate({
        cacheName: 'assets'
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

const queue = new Queue('shopping-sync-queue', {
    maxRetentionTime: 7 * 24 * 60,
});

registerRoute(
    new RegExp('api/shopping-list-entry/([0-9]+)'),
    new NetworkOnly({
        plugins: [
            {
                fetchDidFail: async ({request}) => {
                    await queue.pushRequest({request});
                },
            }
        ],
    }),
    'PATCH'
)

addEventListener('message', (event) => {
    if (event.data.type === 'BGSYNC_REPLAY_REQUESTS') {
        queue.replayRequests().then((r) => {
            event.ports[0].postMessage('REPLAY_SUCCESS SW');
        }).catch((err) => {
            event.ports[0].postMessage('REPLAY_FAILURE');
        });
    }
    if (event.data.type === 'BGSYNC_COUNT_QUEUE') {
        queue.getAll().then((r) => {
            event.ports[0].postMessage(r.length);
        })
    }
});

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
    ({request}) => request.destination === 'document',
    new NetworkFirst({
        cacheName: 'html',
        plugins: [
            new ExpirationPlugin({
                maxAgeSeconds: 60 * 60 * 24 * 30,
                maxEntries: 50,
            }),
        ],
    })
)

