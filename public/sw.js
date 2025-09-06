self.addEventListener('push', (event) => {
  try {
    const data = event.data?.json() || {};
    const title = data.title || 'Notificação';
    const body = data.body || '';
    const options = {
      body,
      data: data.data || {},
      icon: '/icon-192.png',
      badge: '/icon-192.png'
    };
    event.waitUntil(self.registration.showNotification(title, options));
  } catch {
    // ignore
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification?.data?.url;
  if (url) {
    event.waitUntil(clients.openWindow(url));
  }
});
