// Offline-first service worker. Bump VERSION when you want every phone to refetch everything.
const VERSION = 'brain-games1-art-400-v4';
const CORE = ['./', 'index.html', 'css/app.css', 'js/app.js', 'js/engine.js', 'js/kit.js', 'js/play.js', 'js/gfx.js', 'js/art.js', 'js/config.js', 'js/catalog.json', 'manifest.webmanifest', 'assets/art/manifest.json', 'icons/icon.svg', 'icons/icon-192.png', 'js/games/echo-grid.js','js/games/index.js','js/games/ink-interpreter.js','js/games/one-different.js','js/games/pack-attention.js','js/games/pack-flex.js','js/games/pack-learning.js','js/games/pack-memory.js','js/games/pack-speed.js','js/games/rapid-equation-check.js','js/games/two-back-orchard.js','js/games/window-watch.js'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(VERSION).then((c) => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
// Stale-while-revalidate: instant from cache, refreshed in the background for next launch.
self.addEventListener('fetch', (e) => {
  const r = e.request; if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  e.respondWith(caches.open(VERSION).then(async (c) => {
    const hit = await c.match(r, { ignoreSearch: true });
    const net = fetch(r).then((res) => { if (res.ok) c.put(r, res.clone()); return res; }).catch(() => hit);
    return hit || net;
  }));
});
