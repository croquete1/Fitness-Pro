// public/sw.js
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Nova notificação';
  const body = data.body || '';
  const options = { body, data: data.link ? { url: data.link } : undefined };
  event.waitUntil(self.registration.showNotification(title, options));
});
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification?.data?.url;
  if (url) event.waitUntil(clients.openWindow(url));
});
