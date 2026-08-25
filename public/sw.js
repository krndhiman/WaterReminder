// Enhanced Service Worker for AquaFlow Background Notifications & PWA
const CACHE_NAME = 'aquaflow-v5';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

let backgroundTimerId = null;
let scheduledTime = null;
let scheduledTitle = '💧 Time to Hydrate! - AquaFlow';
let scheduledBody = 'Keep your streak alive and stay energized with a fresh glass of water!';

// Handle incoming background push or scheduled notification triggers
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const action = event.action;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Send action to open client
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          if (action) {
            client.postMessage({ type: 'NOTIFICATION_ACTION', action, data: event.notification.data });
          }
          return client.focus();
        }
      }
      // If no window is open, open a new one with deep link action
      const targetUrl = action ? `/?action=${action}` : '/';
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

// Handle messages from the app
self.addEventListener('message', (event) => {
  if (!event.data) return;

  // 1. Direct notification show request
  if (event.data.type === 'SHOW_NOTIFICATION') {
    const { title, options } = event.data;
    self.registration.showNotification(title || '💧 AquaFlow Hydration Check', {
      icon: '/icon.jpg',
      badge: '/icon.jpg',
      vibrate: [200, 100, 200, 100, 400],
      requireInteraction: true,
      tag: 'aquaflow-reminder',
      renotify: true,
      actions: [
        { action: 'log_300', title: '💧 +300ml Water' },
        { action: 'log_500', title: '🥤 +500ml Bottle' },
        { action: 'snooze_15', title: '⏳ Snooze 15m' },
      ],
      ...options,
    });
  }

  // 2. Schedule a future background notification
  if (event.data.type === 'SCHEDULE_REMINDER') {
    const { delayMs, title, body } = event.data;
    if (backgroundTimerId) {
      clearTimeout(backgroundTimerId);
    }

    if (delayMs > 0) {
      scheduledTime = Date.now() + delayMs;
      scheduledTitle = title || '💧 Time to Hydrate!';
      scheduledBody = body || 'Stay hydrated and keep your momentum going!';

      backgroundTimerId = setTimeout(() => {
        self.registration.showNotification(scheduledTitle, {
          icon: '/icon.jpg',
          badge: '/icon.jpg',
          body: scheduledBody,
          vibrate: [200, 100, 200, 100, 400],
          requireInteraction: true,
          tag: 'aquaflow-reminder',
          renotify: true,
          actions: [
            { action: 'log_300', title: '💧 +300ml Water' },
            { action: 'log_500', title: '🥤 +500ml Bottle' },
            { action: 'snooze_15', title: '⏳ Snooze 15m' },
          ],
        });
      }, delayMs);
    }
  }

  // 3. Cancel scheduled reminder
  if (event.data.type === 'CANCEL_REMINDER') {
    if (backgroundTimerId) {
      clearTimeout(backgroundTimerId);
      backgroundTimerId = null;
    }
  }
});
