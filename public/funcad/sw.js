/* FunCAD project page service worker.
 *
 * After the first visit it precaches the page shell and the Figure 7 viewer
 * files, so the 3D views are ready before the reader scrolls to them and
 * return visits come from the local cache. The page itself always tries the
 * network first, so a deploy shows up on the next load. Everything else is
 * served from the cache and refreshed in the background, so a changed file
 * appears one load later even without a new ?v= value. Videos bypass the
 * worker so the browser can stream them with range requests.
 *
 * Bump VERSION whenever the precache list or a ?v= value changes.
 */
const VERSION = "20261010-2";
const CACHE = `funcad-${VERSION}`;
const SHELL = [
  "./",
  "favicon.svg",
  "assets/hero/hero.jpg",
];
const VIEWERS = [
  "assets/failure-viewer/three-viewer.js?v=20261010-2",
  "assets/failures/bicycle-failure-detail-coarse.glb?v=20261010-2",
  "assets/failures/clock-failure-detail.glb?v=20261010-2",
  "assets/failures/bicycle-failure-detail.glb?v=20261010-2",
];
const SCOPE = new URL("./", self.location).pathname;

self.addEventListener("install", (event) => {
  // Respect Data Saver: keep only the shell then, and let the viewers load on demand.
  const files = self.navigator.connection?.saveData ? SHELL : [...SHELL, ...VIEWERS];
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(files)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith("funcad-") && key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET" || request.headers.has("range")) return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith(SCOPE)) return;
  if (/\.(mp4|webm)$/i.test(url.pathname)) return;
  event.respondWith(request.mode === "navigate" ? networkFirst(request) : staleWhileRevalidate(event, request));
});

async function networkFirst(request) {
  const cache = await caches.open(CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone()).catch(() => {});
    return response;
  } catch (error) {
    const cached = await cache.match(request, { ignoreSearch: true });
    if (cached) return cached;
    throw error;
  }
}

async function staleWhileRevalidate(event, request) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request);
  const refresh = fetch(request).then((response) => {
    if (response.ok) cache.put(request, response.clone()).catch(() => {});
    return response;
  });
  if (!cached) return refresh;
  event.waitUntil(refresh.catch(() => {}));
  return cached;
}
