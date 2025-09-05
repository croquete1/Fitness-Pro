// public/sw.js
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data?.json() || {};
  } catch {
    data = { title: 'Fitness Pro', body: event.data?.text() };
  }
  const title = data.title || 'Fitness Pro';
  const options = {
    body: data.body || '',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: { url: data.url || '/dashboard' },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification?.data?.url || '/';
  event.waitUntil(clients.openWindow(url));
});
