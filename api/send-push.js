// /api/send-push.js
// Called directly by the browser to immediately send a push (for quick actions like snooze)
// Also updates the schedule in Redis so the cron picks up the new nextReminderAt

import { Redis } from '@upstash/redis';
import webpush from 'web-push';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

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
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    return res.status(500).json({ error: 'VAPID keys not configured' });
  }

  const { subscription, title, body, uid, nextReminderAt } = req.body || {};

  if (!subscription?.endpoint) {
    return res.status(400).json({ error: 'Missing subscription' });
  }

  // If uid + nextReminderAt provided, update the schedule in Redis
  // so cron knows the new next reminder time
  if (uid && nextReminderAt) {
    try {
      const raw = await redis.get(`sub:${uid}`);
      if (raw) {
        const record = typeof raw === 'string' ? JSON.parse(raw) : raw;
        await redis.set(`sub:${uid}`, JSON.stringify({ ...record, nextReminderAt }));
      }
    } catch (e) {
      // Non-fatal — schedule update failed but we still send the push
      console.warn('[AquaFlow] Failed to update schedule in Redis:', e.message);
    }
  }

  const payload = JSON.stringify({
    title: title || '💧 Hydration Reminder',
    body: body || 'Time to drink water! Stay healthy and hydrated.',
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
  });

  try {
    await webpush.sendNotification(subscription, payload);
    return res.status(200).json({ success: true });
  } catch (err) {
    if (err.statusCode === 410 || err.statusCode === 404) {
      // Remove expired subscription
      if (uid) {
        await redis.del(`sub:${uid}`).catch(() => {});
        await redis.srem('aquaflow:users', uid).catch(() => {});
      }
      return res.status(410).json({ error: 'Subscription expired' });
    }
    return res.status(500).json({ error: err.message });
  }
}
