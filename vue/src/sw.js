// These JavaScript module imports need to be bundled:
import {precacheAndRoute} from 'workbox-precaching';
import {registerRoute} from 'workbox-routing';
import {CacheFirst, NetworkFirst, StaleWhileRevalidate} from 'workbox-strategies';

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