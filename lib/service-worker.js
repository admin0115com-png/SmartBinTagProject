self.addEventListener('push', (event) => {
  const payload = event.data?.json() || {};
  const options = {
    title: payload.title || "🔔 Collection Reminder",
    body: payload.body || "Your scheduled collection is due now",
    icon: '/icons/alarm.png',
    sound: 'loud-alarm.mp3',
    silent: false,
    requireInteraction: true,
    priority: 'high'
  };

  event.waitUntil(
    Promise.all([
      self.registration.showNotification(options.title, options),
      new Audio('/sounds/loud-alarm.mp3').play().catch(err => console.log("Audio ready:", err))
    ])
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow('/'));
});