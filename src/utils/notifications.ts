// Browser & PWA Service Worker Notifications Utility for AquaFlow

let swRegistration: ServiceWorkerRegistration | null = null;

// Register Service Worker
export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js');
      swRegistration = reg;
      return reg;
    } catch (err) {
      console.warn('Service worker registration failed:', err);
      return null;
    }
  }
  return null;
};

// Initial registration attempt
if (typeof window !== 'undefined') {
  registerServiceWorker();
}

export const requestNotificationPermission = async (): Promise<{
  granted: boolean;
  status: NotificationPermission | 'unsupported';
  errorMessage?: string;
}> => {
  if (!('Notification' in window)) {
    return { granted: false, status: 'unsupported', errorMessage: 'Notifications are not supported in this browser.' };
  }

  if (Notification.permission === 'granted') {
    return { granted: true, status: 'granted' };
  }

  if (Notification.permission === 'denied') {
    return {
      granted: false,
      status: 'denied',
      errorMessage: 'Notifications are blocked in your browser settings. Click the tune/padlock icon near the address bar to allow notifications for this site.',
    };
  }

  try {
    const permission = await Notification.requestPermission();
    return {
      granted: permission === 'granted',
      status: permission,
      errorMessage: permission === 'denied' ? 'Permission was denied. Please allow notifications in site settings.' : undefined,
    };
  } catch (err: any) {
    return { granted: false, status: 'denied', errorMessage: err?.message || 'Failed to request notification permission.' };
  }
};

export const getNotificationPermission = (): NotificationPermission | 'unsupported' => {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
  return Notification.permission;
};

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
) => {
  // Mobile vibration feedback
  if ('vibrate' in navigator) {
    try {
      navigator.vibrate([200, 100, 200, 100, 400]);
    } catch {
      // Ignore vibration error
    }
  }

  if (typeof window === 'undefined' || !('Notification' in window) || Notification.permission !== 'granted') {
    return null;
  }

  try {
    // 1. Try via Service Worker (required on mobile Chrome / iOS PWA / lock screen persistence)
    if ('serviceWorker' in navigator) {
      const reg = swRegistration || (await navigator.serviceWorker.ready);
      if (reg && 'showNotification' in reg) {
        await reg.showNotification(title, {
          icon: options?.icon || '/favicon.svg',
          badge: '/favicon.svg',
          body: options?.body || 'Time to stay hydrated! Drink some water.',
          tag: options?.tag || 'water-reminder',
          requireInteraction: options?.requireInteraction ?? true,
          // Mobile lock screen action buttons
          actions: options?.actions || [
            { action: 'log_250', title: '🥛 +250ml' },
            { action: 'log_500', title: '🥤 +500ml' },
            { action: 'snooze_15', title: '⏳ Snooze 15m' },
          ],
          ...options,
        } as NotificationOptions);
        return true;
      }
    }

    // 2. Fallback to standard desktop Notification API
    const notif = new Notification(title, {
      icon: options?.icon || '/favicon.svg',
      badge: '/favicon.svg',
      body: options?.body || 'Time to stay hydrated! Drink some water.',
      tag: options?.tag || 'water-reminder',
      requireInteraction: options?.requireInteraction ?? true,
      ...options,
    });

    notif.onclick = () => {
      window.focus();
      notif.close();
    };

    return notif;
  } catch (e) {
    console.warn('Failed to display browser notification:', e);
    return null;
  }
};
