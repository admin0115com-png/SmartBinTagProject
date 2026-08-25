// Smart Bin Tag (SBT) Service Worker for Background Collection Notifications
const CACHE_NAME = 'sbtapp-v3';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Handle Background Push Notifications (delivered when app is closed or device is locked)
self.addEventListener('push', (event) => {
  let data = {
    title: 'Smart Bin Tag Collection Alert',
    body: 'Your bin collection is scheduled now!',
    url: '/dashboard',
    tag: 'sbt-collection-alert'
  };

  try {
    if (event.data) {
      const parsed = event.data.json();
      data = {
        ...data,
        ...parsed,
        url: parsed.url || (parsed.serialNumber ? `/my-bins?serial=${parsed.serialNumber}` : '/dashboard')
      };
    }
  } catch (e) {
    if (event.data) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    vibrate: [300, 100, 300, 100, 300],
    tag: data.tag || 'sbt-collection-alert',
    renotify: true,
    requireInteraction: true,
    data: {
      url: data.url || '/dashboard',
      serialNumber: data.serialNumber,
      tagId: data.tagId
    },
    actions: [
      { action: 'open', title: 'Open App' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle Notification Clicks (Opening the app from phone/tablet home screen or lockscreen)
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const targetUrl = (event.notification.data && event.notification.data.url) ? event.notification.data.url : '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

// Listen for messages from client app to trigger native notifications
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, body, tag, url } = event.data;
    const options = {
      body,
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      vibrate: [300, 100, 300],
      tag: tag || 'sbt-alert-' + Date.now(),
      renotify: true,
      data: { url: url || '/' }
    };
    self.registration.showNotification(title, options);
  }
});
