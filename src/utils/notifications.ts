// Bulletproof Multi-Platform Notification Engine for AquaFlow
// Supports: Windows Notification Center, macOS Notification Center, Android Lock Screen, Chrome, Edge, Safari & PWA

let swRegistration: ServiceWorkerRegistration | null = null;
let titleInterval: number | null = null;
let originalDocumentTitle = typeof document !== 'undefined' ? document.title : 'AquaFlow - Smart Hydration';

// Register and maintain Service Worker
export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
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

// Request Notification Permission from User
export const requestNotificationPermission = async (): Promise<{
  granted: boolean;
  status: NotificationPermission | 'unsupported';
  errorMessage?: string;
}> => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return {
      granted: false,
      status: 'unsupported',
      errorMessage: 'Notifications are not supported by this browser.',
    };
  }

  if (Notification.permission === 'granted') {
    return { granted: true, status: 'granted' };
  }

  if (Notification.permission === 'denied') {
    return {
      granted: false,
      status: 'denied',
      errorMessage:
        'Notifications are blocked in your browser site settings. Click the tune/padlock icon near the website URL address to allow notifications.',
    };
  }

  try {
    const permission = await Notification.requestPermission();
    return {
      granted: permission === 'granted',
      status: permission,
      errorMessage:
        permission === 'denied'
          ? 'Notifications were denied. Please allow notifications in site settings.'
          : undefined,
    };
  } catch (err: any) {
    return {
      granted: false,
      status: 'denied',
      errorMessage: err?.message || 'Failed to request notification permission.',
    };
  }
};

export const getNotificationPermission = (): NotificationPermission | 'unsupported' => {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
  return Notification.permission;
};

// Flash browser tab title to alert user when tab is inactive
export const startTitleFlashing = (alertText = '💧 Time to Drink Water! - AquaFlow') => {
  if (typeof document === 'undefined') return;
  if (titleInterval) clearInterval(titleInterval);

  let isOriginal = false;
  titleInterval = window.setInterval(() => {
    document.title = isOriginal ? originalDocumentTitle : alertText;
    isOriginal = !isOriginal;
  }, 1200);

  // Stop flashing when user focuses window
  const stopFlashing = () => {
    if (titleInterval) {
      clearInterval(titleInterval);
      titleInterval = null;
      document.title = originalDocumentTitle;
    }
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
    if (typeof document !== 'undefined') {
      document.title = originalDocumentTitle;
    }
  }
};

// Dispatch high-priority OS/browser notification
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
  // Mobile vibration feedback
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate([200, 100, 200, 100, 400]);
    } catch {
      // Ignore vibration error
    }
  }

  // Flash title if document is hidden
  if (typeof document !== 'undefined' && document.hidden) {
    startTitleFlashing(`(1) 💧 ${title}`);
  }

  if (typeof window === 'undefined' || !('Notification' in window) || Notification.permission !== 'granted') {
    return false;
  }

  try {
    // 1. Try Service Worker Notification (required for Android Lock Screen, iOS PWA, and background persistence)
    if ('serviceWorker' in navigator) {
      const reg = swRegistration || (await navigator.serviceWorker.ready);
      if (reg && 'showNotification' in reg) {
        await reg.showNotification(title, {
          icon: options?.icon || '/favicon.svg',
          badge: '/favicon.svg',
          body: options?.body || 'Time to stay hydrated! Drink a fresh glass of water.',
          tag: options?.tag || 'aquaflow-reminder',
          renotify: true,
          requireInteraction: options?.requireInteraction ?? true,
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

    // 2. Fallback to standard desktop Notification constructor
    const notif = new Notification(title, {
      icon: options?.icon || '/favicon.svg',
      body: options?.body || 'Time to stay hydrated! Drink a fresh glass of water.',
      tag: options?.tag || 'aquaflow-reminder',
      requireInteraction: options?.requireInteraction ?? true,
      ...options,
    });

    notif.onclick = () => {
      window.focus();
      notif.close();
      stopTitleFlashing();
    };

    return true;
  } catch (e) {
    console.warn('Failed to display browser notification:', e);
    // Final attempt without icon or options that might cause platform parsing errors
    try {
      new Notification(title, {
        body: options?.body || 'Time to stay hydrated!',
      });
      return true;
    } catch (fallbackErr) {
      console.error('All notification methods failed:', fallbackErr);
      return false;
    }
  }
};

// Schedule a background notification in Service Worker
export const scheduleBackgroundNotification = async (
  delayMs: number,
  title: string,
  body: string
) => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

  try {
    const reg = swRegistration || (await navigator.serviceWorker.ready);
    if (reg && reg.active) {
      reg.active.postMessage({
        type: 'SCHEDULE_REMINDER',
        delayMs,
        title,
        body,
      });
    }
  } catch (e) {
    console.warn('Could not post SCHEDULE_REMINDER to service worker', e);
  }
};

// Cancel any pending background notification in Service Worker
export const cancelBackgroundNotification = async () => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

  try {
    const reg = swRegistration || (await navigator.serviceWorker.ready);
    if (reg && reg.active) {
      reg.active.postMessage({
        type: 'CANCEL_REMINDER',
      });
    }
  } catch (e) {
    console.warn('Could not post CANCEL_REMINDER to service worker', e);
  }
};
