// These JavaScript module imports need to be bundled:
import {precacheAndRoute, cleanupOutdatedCaches} from 'workbox-precaching';
import {registerRoute, setCatchHandler} from 'workbox-routing';
import {CacheFirst, NetworkFirst, NetworkOnly, StaleWhileRevalidate} from 'workbox-strategies';
import {ExpirationPlugin} from 'workbox-expiration';
import {BackgroundSyncPlugin, Queue} from "workbox-background-sync";
import { clientsClaim } from 'workbox-core'



cleanupOutdatedCaches()

declare let self: ServiceWorkerGlobalScope
precacheAndRoute(self.__WB_MANIFEST)

self.skipWaiting()
clientsClaim()

const OFFLINE_CACHE_NAME = 'offline-html';
let script_name = typeof window !== 'undefined' ? localStorage.getItem('SCRIPT_NAME') : '/'
var OFFLINE_PAGE_URL = script_name + 'offline/';

const FILES_CACHE_NAME = 'import-file';

self.addEventListener('install', async (event) => {
    event.waitUntil(
        Promise.all([
            caches.open(OFFLINE_CACHE_NAME).then((cache) => cache.add(new Request(OFFLINE_PAGE_URL, {cache: "reload"}))),
            caches.open(FILES_CACHE_NAME)
        ])
    );
});

self.addEventListener("fetch", (event: FetchEvent) => {
    if (event.request.url.includes('/recipe/import') && event.request.method === "POST") {
        event.respondWith(
            (async () => {
                const formData: FormData = await event.request.formData();
                const file = formData.get('data') as File;
                if (!file) {
                    const params = new URLSearchParams();
                    formData.forEach((value, key) => params.append(key, value as string))
                    return Response.redirect('/recipe/import?' + params.toString(), 303);
                }

                return await importRecipe(file);
            })(),
        );
        return;
    }

    // Regular requests not related to recipe import
    event.respondWith(fetch(event.request));
    return;
});

async function importRecipe(file: File): Promise<Response> {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const blob = new Blob([arrayBuffer], { type: file.type });
        const fileUrl = `/import-file/${file.name}`;
        
        const response = new Response(blob, {
            headers: {
                'File-Name': file.name,
                'Content-Type': file.type,
                'Content-Length': arrayBuffer.byteLength.toString(),
            }
        });

        // Store the file in cache so that Vue app can access it later
        const cache = await caches.open(FILES_CACHE_NAME);
        await cache.put(fileUrl, response);

        // Redirect to app with reference
        return Response.redirect('/recipe/import?file=' + file.name, 303);
    } catch (error) {
        console.error('Error handling share target:', error);
        return new Response('Error processing import files', { status: 500 });
    }
}

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

