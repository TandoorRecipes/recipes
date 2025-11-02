import { Queue } from "workbox-background-sync";
import { ExpirationPlugin } from "workbox-expiration";
import { registerRoute, setCatchHandler } from "workbox-routing";
import {
  CacheFirst,
  NetworkFirst,
  NetworkOnly,
  StaleWhileRevalidate,
} from "workbox-strategies";

// ---- BASE / SCRIPT_NAME DETECTION ----

const REG_SCOPE = new URL(self.registration.scope).pathname;
function normalizeBase(path) {
  return path.endsWith("/") ? path : path + "/";
}
let SCRIPT_NAME = normalizeBase(REG_SCOPE);

self.addEventListener("message", (event) => {
  if (event.data?.type === "BGSYNC_REPLAY_REQUESTS") {
    queue
      .replayRequests()
      .then(() => event.ports?.[0]?.postMessage("REPLAY_SUCCESS SW"))
      .catch(() => event.ports?.[0]?.postMessage("REPLAY_FAILURE"));
    return;
  }
  if (event.data?.type === "BGSYNC_COUNT_QUEUE") {
    queue.getAll().then((r) => {
      event.ports?.[0]?.postMessage(r.length);
    });
    return;
  }
  if (
    event.data?.type === "SET_SCRIPT_NAME" &&
    typeof event.data.value === "string"
  ) {
    SCRIPT_NAME = normalizeBase(event.data.value);
  }
});

const OFFLINE_CACHE_NAME = "offline-html";
const OFFLINE_PAGE_URL = SCRIPT_NAME + "offline/";

// ---- INSTALL: cache offline page for this scope ----
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

// Workbox inject manifest placeholder (leave it here)
self.__WB_MANIFEST;

// ---- FALLBACK for failed navigations ----
setCatchHandler(async ({ event }) => {
  switch (event.request.destination) {
    case "document":
      const cache = await caches.open(OFFLINE_CACHE_NAME);
      const match = await cache.match(OFFLINE_PAGE_URL);
      if (match) {
        return match;
      }
      // last resort: generic error
      return Response.error();
    default:
      return Response.error();
  }
});

// ---- ROUTES ----

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

// django js reverse
registerRoute(
  new RegExp("jsreverse"),
  new StaleWhileRevalidate({ cacheName: "assets" }),
);

// django i18n
registerRoute(
  new RegExp("jsi18n"),
  new StaleWhileRevalidate({ cacheName: "assets" }),
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

// ---- Background sync queue ----
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
