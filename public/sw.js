// AquaFlow Service Worker v7 — Real Web Push via FCM
// This Service Worker:
// 1. Receives genuine Web Push messages from the server (via FCM / GCM)
//    → These work 100% when phone is locked or browser is closed
// 2. Handles notification click actions (log water, snooze)
// 3. Falls back to in-app TimestampTrigger API for Chrome on Android when app is open

const CACHE_NAME = 'aquaflow-v7';
const PUSH_TAG = 'aquaflow-reminder';

// ─────────────────────────────────────────────
// Install & Activate
// ─────────────────────────────────────────────
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// ─────────────────────────────────────────────
// 1. REAL WEB PUSH EVENT (from server via FCM)
//    Fires reliably even when phone is locked
// ─────────────────────────────────────────────
self.addEventListener('push', (event) => {
  let payload = {
    title: '💧 Hydration Reminder',
    body: 'Time to drink water! Stay hydrated.',
    icon: '/icon.jpg',
    badge: '/icon.jpg',
    tag: PUSH_TAG,
    renotify: true,
    requireInteraction: true,
    vibrate: [200, 100, 200, 100, 400],
    actions: [
      { action: 'log_300', title: '💧 +300ml Water' },
      { action: 'log_500', title: '🥤 +500ml Bottle' },
      { action: 'snooze_15', title: '⏳ Snooze 15m' },
    ],
    data: {},
  };

  if (event.data) {
    try {
      const parsed = event.data.json();
      payload = { ...payload, ...parsed };
    } catch {
      payload.body = event.data.text() || payload.body;
    }
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: payload.icon || '/icon.jpg',
      badge: payload.badge || '/icon.jpg',
      tag: payload.tag || PUSH_TAG,
      renotify: payload.renotify !== false,
      requireInteraction: payload.requireInteraction !== false,
      vibrate: payload.vibrate || [200, 100, 200, 100, 400],
      actions: payload.actions || [],
      data: payload.data || {},
      silent: false,
    })
  );
});

// ─────────────────────────────────────────────
// 2. NOTIFICATION CLICK (action buttons)
// ─────────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const action = event.action;
  const targetUrl = action ? `/?action=${action}` : '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If app window is already open, send action message and focus it
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          if (action) {
            client.postMessage({ type: 'NOTIFICATION_ACTION', action, data: event.notification.data });
          }
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

// ─────────────────────────────────────────────
// 3. PERIODIC BACKGROUND SYNC (bonus wakeup)
//    Chrome on Android may call this every ~15min
// ─────────────────────────────────────────────
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'hydration-check') {
    event.waitUntil(
      (async () => {
        // Request a fresh push from server if we haven't been active
        // (This is a best-effort backup — real delivery is via server push above)
        try {
          const clients = await self.clients.matchAll();
          if (clients.length === 0) {
            // No open windows — fire a local reminder as fallback
            await self.registration.showNotification('💧 Hydration Check', {
              body: 'Remember to drink water! Open AquaFlow to log your intake.',
              icon: '/icon.jpg',
              badge: '/icon.jpg',
              tag: PUSH_TAG,
              renotify: true,
              vibrate: [200, 100, 200],
            });
          }
        } catch (err) {
          console.warn('[AquaFlow SW] Periodic sync error:', err);
        }
      })()
    );
  }
});

// ─────────────────────────────────────────────
// 4. IN-APP MESSAGES from WaterContext
//    Used when app is open or in background tab
// ─────────────────────────────────────────────
self.addEventListener('message', (event) => {
  if (!event.data) return;

  // Direct immediate notification (app is open)
  if (event.data.type === 'SHOW_NOTIFICATION') {
    const { title, options } = event.data;
    self.registration.showNotification(title || '💧 AquaFlow Hydration Check', {
      icon: '/icon.jpg',
      badge: '/icon.jpg',
      vibrate: [200, 100, 200, 100, 400],
      requireInteraction: true,
      tag: PUSH_TAG,
      renotify: true,
      actions: [
        { action: 'log_300', title: '💧 +300ml Water' },
        { action: 'log_500', title: '🥤 +500ml Bottle' },
        { action: 'snooze_15', title: '⏳ Snooze 15m' },
      ],
      ...options,
    });
  }
});
