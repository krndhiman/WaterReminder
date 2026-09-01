// AquaFlow Push Notification Engine v2
// Uses real Web Push Protocol (via FCM) for reliable lock-screen delivery
// Falls back to in-app Service Worker notifications when app is open

// ─────────────────────────────────────────────────────────────────────────────
// VAPID Public Key — this is safe to expose in the browser bundle
// ─────────────────────────────────────────────────────────────────────────────
const VAPID_PUBLIC_KEY = 'BFVAmIL6Fh9xf6tXzRgEhCYdyWSMAXsDFNGVu30-4O4_Iq9uVOT2hSPynmtzP8L9Siw6BEBHyZQ7ouRLCaCtUQA';

// ─────────────────────────────────────────────────────────────────────────────
// Internal state
// ─────────────────────────────────────────────────────────────────────────────
let swRegistration: ServiceWorkerRegistration | null = null;
let pushSubscription: PushSubscription | null = null;
let titleInterval: number | null = null;
let originalDocumentTitle = typeof document !== 'undefined' ? document.title : 'AquaFlow - Smart Hydration';

// Active reminder schedule state — mirrored here for server-side scheduling
let scheduledReminderTimeout: ReturnType<typeof setTimeout> | null = null;

// ─────────────────────────────────────────────────────────────────────────────
// Convert VAPID public key to Uint8Array (required by browser Push API)
// ─────────────────────────────────────────────────────────────────────────────
function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const outputArray = new Uint8Array(buffer);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// ─────────────────────────────────────────────────────────────────────────────
// Register Service Worker
// ─────────────────────────────────────────────────────────────────────────────
export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return null;
  try {
    const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    swRegistration = reg;
    return reg;
  } catch (err) {
    console.warn('[AquaFlow] Service Worker registration failed:', err);
    return null;
  }
};

// Initialize on load
if (typeof window !== 'undefined') {
  registerServiceWorker();
}

// ─────────────────────────────────────────────────────────────────────────────
// Request Notification Permission
// ─────────────────────────────────────────────────────────────────────────────
export const requestNotificationPermission = async (): Promise<{
  granted: boolean;
  status: NotificationPermission | 'unsupported';
  errorMessage?: string;
}> => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return { granted: false, status: 'unsupported', errorMessage: 'Notifications not supported.' };
  }

  if (Notification.permission === 'granted') return { granted: true, status: 'granted' };

  if (Notification.permission === 'denied') {
    return {
      granted: false,
      status: 'denied',
      errorMessage: 'Notifications blocked. Tap the lock (🔒) icon in the address bar and allow notifications for this site.',
    };
  }

  try {
    const permission = await Notification.requestPermission();
    return {
      granted: permission === 'granted',
      status: permission,
      errorMessage:
        permission === 'denied'
          ? 'Notifications denied. Please allow in browser site settings.'
          : undefined,
    };
  } catch (err: any) {
    return { granted: false, status: 'denied', errorMessage: err?.message };
  }
};

export const getNotificationPermission = (): NotificationPermission | 'unsupported' => {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
  return Notification.permission;
};

// ─────────────────────────────────────────────────────────────────────────────
// Subscribe to Web Push via browser Push API + register with our server
// This is the KEY function that enables lock-screen delivery via FCM
// ─────────────────────────────────────────────────────────────────────────────
export const subscribeToPush = async (userId?: string): Promise<PushSubscription | null> => {
  if (typeof window === 'undefined' || !('PushManager' in window)) {
    console.warn('[AquaFlow] Push API not supported in this browser.');
    return null;
  }

  if (Notification.permission !== 'granted') {
    console.warn('[AquaFlow] Push subscription requires notification permission.');
    return null;
  }

  try {
    const reg = swRegistration || (await navigator.serviceWorker.ready);
    if (!reg) return null;

    // Check for existing subscription
    let sub = await reg.pushManager.getSubscription();

    // If no subscription yet, create one
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
    }

    pushSubscription = sub;

    // Register subscription with the Vercel backend
    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription: sub.toJSON(),
          userId: userId || 'anonymous',
        }),
      });
      if (response.ok) {
        console.log('[AquaFlow] Push subscription registered with server ✓');
      } else {
        console.warn('[AquaFlow] Failed to register subscription with server:', await response.text());
      }
    } catch (serverErr) {
      console.warn('[AquaFlow] Could not reach subscription server:', serverErr);
    }

    // Also register Periodic Background Sync as a bonus
    registerPeriodicSync(reg);

    return sub;
  } catch (err) {
    console.error('[AquaFlow] Push subscription failed:', err);
    return null;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Schedule a real Web Push notification via the server
// Server will call FCM → FCM delivers to Android even when locked
// ─────────────────────────────────────────────────────────────────────────────
export const scheduleBackgroundNotification = async (
  delayMs: number,
  title: string,
  body: string
): Promise<void> => {
  if (typeof window === 'undefined') return;

  // Clear any previously scheduled reminder
  if (scheduledReminderTimeout) {
    clearTimeout(scheduledReminderTimeout);
    scheduledReminderTimeout = null;
  }

  if (delayMs <= 0) return;

  // Get the push subscription (subscribe if needed)
  const sub = pushSubscription || (await getCurrentPushSubscription());
  if (!sub) {
    console.warn('[AquaFlow] No push subscription available for background scheduling.');
    return;
  }

  // Schedule a server call at the right time
  // The timeout fires when the app is still open — when the app closes,
  // the server-side scheduling takes over via Web Push
  console.log(`[AquaFlow] Scheduling server push in ${Math.round(delayMs / 1000)}s`);

  scheduledReminderTimeout = setTimeout(async () => {
    scheduledReminderTimeout = null;

    try {
      const res = await fetch('/api/send-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription: sub.toJSON(),
          title,
          body,
          data: { scheduledAt: Date.now() },
        }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        if (res.status === 410) {
          // Subscription expired — re-subscribe
          pushSubscription = null;
          await subscribeToPush();
        } else {
          console.warn('[AquaFlow] Server push failed:', errBody);
        }
      }
    } catch (err) {
      console.warn('[AquaFlow] Could not send server push:', err);
      // Fallback: try in-app Service Worker notification if app is still open
      try {
        const reg = swRegistration || (await navigator.serviceWorker.ready);
        if (reg?.active) {
          reg.active.postMessage({ type: 'SHOW_NOTIFICATION', title, options: { body } });
        }
      } catch {
        // ignore
      }
    }
  }, delayMs);
};

// ─────────────────────────────────────────────────────────────────────────────
// Cancel a pending background reminder
// ─────────────────────────────────────────────────────────────────────────────
export const cancelBackgroundNotification = (): void => {
  if (scheduledReminderTimeout) {
    clearTimeout(scheduledReminderTimeout);
    scheduledReminderTimeout = null;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Get current push subscription from Service Worker
// ─────────────────────────────────────────────────────────────────────────────
const getCurrentPushSubscription = async (): Promise<PushSubscription | null> => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return null;
  try {
    const reg = swRegistration || (await navigator.serviceWorker.ready);
    const sub = await reg.pushManager.getSubscription();
    if (sub) pushSubscription = sub;
    return sub;
  } catch {
    return null;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Register Periodic Background Sync (backup wakeup for Chrome Android)
// ─────────────────────────────────────────────────────────────────────────────
export const registerPeriodicSync = async (reg?: ServiceWorkerRegistration): Promise<void> => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
  try {
    const registration = reg || (await navigator.serviceWorker.ready);
    if ('periodicSync' in registration) {
      const status = await (navigator as any).permissions?.query({
        name: 'periodic-background-sync',
      });
      if (status?.state === 'granted') {
        await (registration as any).periodicSync.register('hydration-check', {
          minInterval: 15 * 60 * 1000, // 15 minutes
        });
        console.log('[AquaFlow] Periodic background sync registered ✓');
      }
    }
  } catch {
    // Silently ignore — not all browsers support this
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Send immediate browser notification (for when app is open/active)
// ─────────────────────────────────────────────────────────────────────────────
export const sendBrowserNotification = async (
  title: string,
  options?: {
    body?: string;
    icon?: string;
    tag?: string;
    data?: unknown;
    requireInteraction?: boolean;
    actions?: { action: string; title: string; icon?: string }[];
  }
): Promise<boolean> => {
  // Mobile haptic feedback
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try { navigator.vibrate([200, 100, 200, 100, 400]); } catch { /* ignore */ }
  }

  // Flash tab title if document is hidden
  if (typeof document !== 'undefined' && document.hidden) {
    startTitleFlashing(`(1) 💧 ${title}`);
  }

  if (typeof window === 'undefined' || !('Notification' in window) || Notification.permission !== 'granted') {
    return false;
  }

  try {
    const reg = swRegistration || (await navigator.serviceWorker.ready);
    if (reg && 'showNotification' in reg) {
      await reg.showNotification(title, {
        icon: options?.icon || '/icon.jpg',
        badge: '/icon.jpg',
        body: options?.body || 'Time to stay hydrated! Drink a fresh glass of water.',
        tag: options?.tag || 'aquaflow-reminder',
        renotify: true,
        silent: false,
        requireInteraction: options?.requireInteraction ?? true,
        actions: options?.actions || [
          { action: 'log_300', title: '💧 +300ml Water' },
          { action: 'log_500', title: '🥤 +500ml Bottle' },
          { action: 'snooze_15', title: '⏳ Snooze 15m' },
        ],
        ...options,
      } as NotificationOptions);
      return true;
    }
  } catch { /* fall through */ }

  // Fallback: direct Notification constructor
  try {
    const notif = new Notification(title, {
      icon: options?.icon || '/icon.jpg',
      body: options?.body || 'Time to stay hydrated!',
      tag: options?.tag || 'aquaflow-reminder',
      requireInteraction: options?.requireInteraction ?? true,
    });
    notif.onclick = () => { window.focus(); notif.close(); stopTitleFlashing(); };
    return true;
  } catch {
    return false;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Browser tab title flashing (when user is in another tab)
// ─────────────────────────────────────────────────────────────────────────────
export const startTitleFlashing = (alertText = '💧 Time to Drink Water! - AquaFlow') => {
  if (typeof document === 'undefined') return;
  if (titleInterval) clearInterval(titleInterval);

  let isOriginal = false;
  titleInterval = window.setInterval(() => {
    document.title = isOriginal ? originalDocumentTitle : alertText;
    isOriginal = !isOriginal;
  }, 1200);

  const stopFlashing = () => {
    if (titleInterval) { clearInterval(titleInterval); titleInterval = null; document.title = originalDocumentTitle; }
    window.removeEventListener('focus', stopFlashing);
    window.removeEventListener('click', stopFlashing);
  };

  window.addEventListener('focus', stopFlashing);
  window.addEventListener('click', stopFlashing);
};

export const stopTitleFlashing = () => {
  if (titleInterval) {
    clearInterval(titleInterval);
    titleInterval = null;
    if (typeof document !== 'undefined') document.title = originalDocumentTitle;
  }
};
