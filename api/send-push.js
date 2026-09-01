// Vercel Serverless Function: /api/send-push.js
// Called by the browser (via sendScheduledPush) to enqueue a real Web Push message.
// The push goes through Google FCM → Android OS → Service Worker → Lock Screen.
//
// This stores scheduled pushes in memory and immediately dispatches them via web-push.
// For production: use Vercel Cron Jobs to check schedules on the server side.

import webpush from 'web-push';

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_EMAIL = process.env.VAPID_EMAIL || 'mailto:admin@aquaflow.app';

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    return res.status(500).json({ error: 'VAPID keys not configured on server.' });
  }

  const { subscription, title, body, data } = req.body || {};

  if (!subscription || !subscription.endpoint) {
    return res.status(400).json({ error: 'Missing subscription' });
  }

  const payload = JSON.stringify({
    title: title || '💧 Hydration Reminder',
    body: body || 'Time to drink water! Stay hydrated.',
    icon: '/icon.jpg',
    badge: '/icon.jpg',
    tag: 'aquaflow-reminder',
    renotify: true,
    requireInteraction: true,
    vibrate: [200, 100, 200, 100, 400],
    actions: [
      { action: 'log_300', title: '💧 +300ml Water' },
      { action: 'log_500', title: '🥤 +500ml Bottle' },
      { action: 'snooze_15', title: '⏳ Snooze 15m' },
    ],
    data: data || {},
  });

  try {
    await webpush.sendNotification(subscription, payload);
    console.log(`[AquaFlow Push] Notification sent to ${subscription.endpoint.slice(0, 60)}...`);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('[AquaFlow Push] Send failed:', err.statusCode, err.body);

    // 410 Gone = subscription is no longer valid
    if (err.statusCode === 410 || err.statusCode === 404) {
      return res.status(410).json({ error: 'Subscription expired. Please re-subscribe.' });
    }

    return res.status(500).json({
      error: 'Failed to send push notification',
      detail: err.message,
    });
  }
}
