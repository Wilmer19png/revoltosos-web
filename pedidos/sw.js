// Revoltosos · avisos del gestor (solo admins). Recibe el push y abre el gestor al tocarlo.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('push', (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (err) { d = { title: 'Revoltosos', body: e.data ? e.data.text() : '' }; }
  e.waitUntil(self.registration.showNotification(d.title || 'Revoltosos', {
    body: d.body || '',
    icon: '/assets/img/logo.jpg',
    badge: '/assets/img/logo.jpg',
    tag: d.tag || undefined,
    renotify: !!d.tag,
    data: { url: d.url || '/pedidos/' }
  }));
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const url = new URL((e.notification.data && e.notification.data.url) || '/pedidos/', self.location.origin).href;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((lista) => {
    const abierta = lista.find((c) => c.url.indexOf('/pedidos/') >= 0);
    if (abierta) { abierta.navigate(url).catch(() => {}); return abierta.focus(); }
    return self.clients.openWindow(url);
  }));
});
