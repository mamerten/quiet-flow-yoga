// Service worker for offline support.
//
// SHELL_CACHE is a cache-busting *shell* version, independent of the app's
// own semver (js/app.js APP_VERSION) — bump it whenever any cached file
// changes, regardless of whether the user-facing version number moves.
const SHELL_CACHE = 'quiet-flow-shell-v4';

// Code + markup. These are served network-first (see below) so a deploy
// always reaches the user on their next load; the cache is a pure offline
// fallback. An earlier cache-first version of this file could leave a
// device running old JS against new HTML, which silently hid new UI.
const CODE_FILES = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css',
  './js/figures.js',
  './js/poses.js',
  './js/workout.js',
  './js/speech.js',
  './js/music.js',
  './js/voice.js',
  './js/app.js',
];

// Static assets that effectively never change in place — safe (and much
// faster) to serve cache-first.
const ASSET_FILES = [
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-512-maskable.png',
  './icons/apple-touch-icon.png',
  './icons/favicon.svg',
];

const SHELL_FILES = CODE_FILES.concat(ASSET_FILES);

function isCodeRequest(request) {
  if (request.mode === 'navigate') return true;
  const path = new URL(request.url).pathname;
  return /\.(html|js|css|json)$/i.test(path) || path.endsWith('/');
}

// Bundled narration voices (see tools/generate-voice.py). Their clips are
// precached so a practice can run start-to-finish with no connection —
// otherwise only already-played clips would be available offline.
const VOICE_PACK_DIRS = ['audio/lessac', 'audio/amy'];

function precacheVoiceAudio(cache) {
  return Promise.all(VOICE_PACK_DIRS.map((dir) =>
    fetch(dir + '/manifest.json', { cache: 'reload' })
      .then((r) => (r.ok ? r.json() : null))
      .then((manifest) => {
        if (!manifest || !manifest.clips) return null;
        return cache.put(dir + '/manifest.json', new Response(
          JSON.stringify(manifest), { headers: { 'Content-Type': 'application/json' } }
        )).then(() => Promise.all(
          Object.values(manifest.clips).map((file) =>
            // Best-effort per clip: one missing file must not fail install.
            cache.add(dir + '/' + file).catch(() => null)
          )
        ));
      })
      .catch(() => null)
  ));
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      // cache: 'reload' bypasses the HTTP cache, so installing a new shell
      // can't pick up a stale copy from the browser/CDN cache.
      .then((cache) => cache.addAll(
        SHELL_FILES.map((url) => new Request(url, { cache: 'reload' }))
      ).then(() => precacheVoiceAudio(cache)))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(
        names.filter((name) => name !== SHELL_CACHE).map((name) => caches.delete(name))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET' || !request.url.startsWith(self.location.origin)) return;

  // Code/markup: network-first, falling back to cache when offline. This is
  // what guarantees a deploy actually shows up rather than being masked by
  // a previously cached copy.
  if (isCodeRequest(request)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(SHELL_CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => caches.match(request).then((cached) => {
          if (cached) return cached;
          if (request.mode === 'navigate') return caches.match('./index.html');
          return undefined;
        }))
    );
    return;
  }

  // Everything else (icons, audio): cache-first for speed.
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(SHELL_CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => undefined);
    })
  );
});
