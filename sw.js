/* A31 Board — Service Worker
   - Offline app-shell caching (network-first for the HTML, cache fallback)
   - Notification click / action handling (snooze, done, open)
   - Badge messages + skip-waiting support
*/
const CACHE = 'a31-board-v3';
const SHELL = ['./', './index.html', './manifest.json', './favicon.png', './apple-touch-icon.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL).catch(() => {})));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('message', (e) => {
  const d = e.data || {};
  if (d.type === 'skip-waiting') self.skipWaiting();
  if (d.type === 'badge') {
    // Best-effort; supported only in some browsers via the page, ignored here.
  }
});

/* Network-first for navigations so updates land quickly; cache-first for the rest. */
self.addEventListener('fetch', (e) => {
  const req = e.req || e.request;
  if (req.method !== 'GET') return;
  const isNav = req.mode === 'navigate' ||
    (req.headers.get('accept') || '').includes('text/html');
  if (isNav) {
    e.respondWith(
      fetch(req)
        .then((res) => { caches.open(CACHE).then((c) => c.put(req, res.clone())); return res; })
        .catch(() => caches.match(req).then((r) => r || caches.match('./index.html')))
    );
  } else {
    e.respondWith(
      caches.match(req).then((r) => r || fetch(req).then((res) => {
        if (res && res.status === 200 && res.type === 'basic') {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(req, clone));
        }
        return res;
      }).catch(() => r))
    );
  }
});

/* ---- Notification handling ---- */
function focusAndSend(payload) {
  return self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
    for (const client of list) {
      client.postMessage(payload);
      if ('focus' in client) return client.focus();
    }
    // No open window → open the app; the page picks up the action on load.
    if (self.clients.openWindow) {
      const url = payload.taskId ? ('./?task=' + payload.taskId) : './';
      return self.clients.openWindow(url);
    }
  });
}

self.addEventListener('notificationclick', (e) => {
  const taskId = (e.notification.data && e.notification.data.taskId) || null;
  const action = e.action || 'open';
  e.notification.close();
  e.waitUntil(focusAndSend({ type: 'notif-action', action, taskId }));
});
