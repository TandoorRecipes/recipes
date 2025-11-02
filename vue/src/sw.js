// sw.js

// These JavaScript module imports need to be bundled:
import { Queue } from "workbox-background-sync";
import { ExpirationPlugin } from "workbox-expiration";
import { registerRoute, setCatchHandler } from "workbox-routing";
import {
  CacheFirst,
  NetworkFirst,
  NetworkOnly,
  StaleWhileRevalidate,
} from "workbox-strategies";

// ─────────────────────────────────────────────────────────────
// BASE / SCRIPT_NAME detection
// ─────────────────────────────────────────────────────────────

const regScope = new URL(self.registration.scope).pathname; // e.g. "/recipes/" or "/"
function normalizeBase(path) {
  return path.endsWith("/") ? path : path + "/";
}
let SCRIPT_NAME = normalizeBase(regScope);

const OFFLINE_CACHE_NAME = "offline-html";
let OFFLINE_PAGE_URL = SCRIPT_NAME + "offline/";

// ─────────────────────────────────────────────────────────────
// install: cache offline page for *this* scope
// ─────────────────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(OFFLINE_CACHE_NAME)
      .then((cache) =>
        cache.add(new Request(OFFLINE_PAGE_URL, { cache: "reload" })),
      ),
  );
  self.skipWaiting();
});

// workbox inject-mANIFEST placeholder (keep!)
self.__WB_MANIFEST;

// ─────────────────────────────────────────────────────────────
// fallback for failed navigations
// ─────────────────────────────────────────────────────────────
setCatchHandler(async ({ event }) => {
  if (event.request.destination === "document") {
    const cache = await caches.open(OFFLINE_CACHE_NAME);
    const match = await cache.match(OFFLINE_PAGE_URL);
    if (match) {
      return match;
    }
  }
  return Response.error();
});

// ─────────────────────────────────────────────────────────────
// routes
// ─────────────────────────────────────────────────────────────

// images
registerRoute(
  ({ request }) => request.destination === "image",
  new CacheFirst({
    cacheName: "images",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 20,
      }),
    ],
  }),
);

// scripts / styles
registerRoute(
  ({ request }) =>
    request.destination === "script" || request.destination === "style",
  new NetworkFirst({
    cacheName: "assets",
  }),
);

// django jsreverse
registerRoute(
  new RegExp("jsreverse"),
  new StaleWhileRevalidate({
    cacheName: "assets",
  }),
);

// django jsi18n
registerRoute(
  new RegExp("jsi18n"),
  new StaleWhileRevalidate({
    cacheName: "assets",
  }),
);

// recipe detail APIs
registerRoute(
  new RegExp("api/recipe/([0-9]+)"),
  new NetworkFirst({
    cacheName: "api-recipe",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
      }),
    ],
  }),
);

// general API
registerRoute(
  new RegExp("api/*"),
  new NetworkFirst({
    cacheName: "api",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
      }),
    ],
  }),
);

// HTML / navigations
registerRoute(
  ({ request }) => request.destination === "document",
  new NetworkFirst({
    cacheName: "html",
    plugins: [
      new ExpirationPlugin({
        maxAgeSeconds: 60 * 60 * 24 * 30,
        maxEntries: 50,
      }),
    ],
  }),
);

// ─────────────────────────────────────────────────────────────
// background sync queue (must exist BEFORE message handler)
// ─────────────────────────────────────────────────────────────
const queue = new Queue("shopping-sync-queue", {
  maxRetentionTime: 7 * 24 * 60, // minutes
});

registerRoute(
  new RegExp("api/shopping-list-entry/([0-9]+)"),
  new NetworkOnly({
    plugins: [
      {
        fetchDidFail: async ({ request }) => {
          await queue.pushRequest({ request });
        },
      },
    ],
  }),
  "PATCH",
);

// ─────────────────────────────────────────────────────────────
// message handler (ESLint-safe)
// ─────────────────────────────────────────────────────────────
self.addEventListener("message", (event) => {
  const data = event.data || {};

  // SET_SCRIPT_NAME lets the page tell the SW "use /recipes/"
  if (data.type === "SET_SCRIPT_NAME" && typeof data.value === "string") {
    SCRIPT_NAME = normalizeBase(data.value);
    OFFLINE_PAGE_URL = SCRIPT_NAME + "offline/";
    return;
  }

  // replay BGSYNC
  if (data.type === "BGSYNC_REPLAY_REQUESTS") {
    queue
      .replayRequests()
      .then(() => {
        if (event.ports && event.ports[0]) {
          event.ports[0].postMessage("REPLAY_SUCCESS SW");
        }
      })
      .catch(() => {
        if (event.ports && event.ports[0]) {
          event.ports[0].postMessage("REPLAY_FAILURE");
        }
      });
    return;
  }

  // count BGSYNC
  if (data.type === "BGSYNC_COUNT_QUEUE") {
    queue.getAll().then((requests) => {
      if (event.ports && event.ports[0]) {
        event.ports[0].postMessage(requests.length);
      }
    });
  }
});
