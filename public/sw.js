// Enhanced Service Worker for AquaFlow Background Notifications & PWA
const CACHE_NAME = 'aquaflow-v6';

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

// Fire the scheduled notification
const fireScheduledNotification = async () => {
  try {
    await self.registration.showNotification(scheduledTitle, {
      icon: '/icon.jpg',
      badge: '/icon.jpg',
      body: scheduledBody,
      vibrate: [200, 100, 200, 100, 400],
      requireInteraction: true,
      tag: 'aquaflow-reminder',
      renotify: true,
      silent: false,
      actions: [
        { action: 'log_300', title: '💧 +300ml Water' },
        { action: 'log_500', title: '🥤 +500ml Bottle' },
        { action: 'snooze_15', title: '⏳ Snooze 15m' },
      ],
    });
  } catch (err) {
    console.error('Error firing background notification:', err);
  }
};

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

// Periodic Background Sync handler (wakes up even when browser is closed)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'hydration-check') {
    event.waitUntil(
      (async () => {
        if (scheduledTime && Date.now() >= scheduledTime) {
          await fireScheduledNotification();
          scheduledTime = null;
        }
      })()
    );
  }
});

// Background Sync handler
self.addEventListener('sync', (event) => {
  if (event.tag === 'hydration-sync') {
    event.waitUntil(
      (async () => {
        if (scheduledTime && Date.now() >= scheduledTime) {
          await fireScheduledNotification();
          scheduledTime = null;
        }
      })()
    );
  }
});

// Web Push API handler
self.addEventListener('push', (event) => {
  let data = { title: '💧 Time to Hydrate!', body: 'Take a sip of water!' };
  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data.body = event.data.text();
    }
  }
  event.waitUntil(
    self.registration.showNotification(data.title || '💧 AquaFlow Reminder', {
      icon: '/icon.jpg',
      badge: '/icon.jpg',
      body: data.body,
      vibrate: [200, 100, 200, 100, 400],
      requireInteraction: true,
      tag: 'aquaflow-reminder',
      renotify: true,
      actions: [
        { action: 'log_300', title: '💧 +300ml Water' },
        { action: 'log_500', title: '🥤 +500ml Bottle' },
        { action: 'snooze_15', title: '⏳ Snooze 15m' },
      ],
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
    const { delayMs, title, body, targetTimestamp } = event.data;
    if (backgroundTimerId) {
      clearTimeout(backgroundTimerId);
      backgroundTimerId = null;
    }

    if (delayMs > 0) {
      scheduledTime = targetTimestamp || Date.now() + delayMs;
      scheduledTitle = title || '💧 Time to Hydrate!';
      scheduledBody = body || 'Stay hydrated and keep your momentum going!';

      // A. Schedule using Android Notification Triggers API (OS Alarm Manager) if supported
      try {
        const TriggerClass = (typeof TimestampTrigger !== 'undefined') ? TimestampTrigger : self.TimestampTrigger;
        if (TriggerClass && ('showTrigger' in Notification.prototype || 'TimestampTrigger' in self)) {
          self.registration.showNotification(scheduledTitle, {
            icon: '/icon.jpg',
            badge: '/icon.jpg',
            body: scheduledBody,
            showTrigger: new TriggerClass(scheduledTime),
            vibrate: [200, 100, 200, 100, 400],
            requireInteraction: true,
            tag: 'aquaflow-alarm',
            renotify: true,
            actions: [
              { action: 'log_300', title: '💧 +300ml Water' },
              { action: 'log_500', title: '🥤 +500ml Bottle' },
              { action: 'snooze_15', title: '⏳ Snooze 15m' },
            ],
          });
        }
      } catch (err) {
        console.warn('Native TimestampTrigger not available or failed:', err);
      }

      // B. Fallback Timer for open/standby sessions
      backgroundTimerId = setTimeout(() => {
        fireScheduledNotification();
        backgroundTimerId = null;
        scheduledTime = null;
      }, delayMs);
    }
  }

  // 3. Cancel scheduled reminder
  if (event.data.type === 'CANCEL_REMINDER') {
    if (backgroundTimerId) {
      clearTimeout(backgroundTimerId);
      backgroundTimerId = null;
    }
    scheduledTime = null;
  }
});
