// These JavaScript module imports need to be bundled:
import {precacheAndRoute} from 'workbox-precaching';
import {registerRoute, setCatchHandler} from 'workbox-routing';
import {CacheFirst, NetworkFirst, StaleWhileRevalidate} from 'workbox-strategies';


const CACHE_NAME = 'offline-html';
// This assumes /offline.html is a URL for your self-contained
// (no external images or styles) offline page.
const FALLBACK_HTML_URL = '/offline/';
// Populate the cache with the offline HTML page when the
// service worker is installed.
self.addEventListener('install', async (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.add(new Request(FALLBACK_HTML_URL, {cache: "reload"})))
  );
});

// default handler if everything else fails
setCatchHandler(({event}) => {
  // The FALLBACK_URL entries must be added to the cache ahead of time, either
  // via runtime or precaching. If they are precached, then call
  // `matchPrecache(FALLBACK_URL)` (from the `workbox-precaching` package)
  // to get the response from the correct cache.
  //
  // Use event, request, and url to figure out how to respond.
  // One approach would be to use request.destination, see
  // https://medium.com/dev-channel/service-worker-caching-strategies-based-on-request-types-57411dd7652c
  switch (event.request.destination) {
    case 'document':
      // If using precached URLs:
      // return matchPrecache(FALLBACK_HTML_URL);
        console.log('Triggered fallback HTML')
      return caches.match(FALLBACK_HTML_URL);

    default:
      // If we don't have a fallback, just return an error response.
         console.log('Triggered response ERROR')
      return Response.error();
  }
});

precacheAndRoute(self.__WB_MANIFEST);

registerRoute(
    ({request}) => request.destination === 'image',
    new CacheFirst({cacheName: 'images'}),
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
        cacheName: 'api'
    })
)

registerRoute(
    ({request}) => request.destination === 'document',
    new NetworkFirst({
        cacheName: 'html'
    })
)

