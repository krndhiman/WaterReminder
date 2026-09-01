// /api/cron-push.js
// Called by cron-job.org every 5 minutes
// Scans all subscriptions, finds who is due for a reminder, sends push via FCM
// Works 100% server-side — no browser required

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

// Check if current time is within the user's active hours
function isWithinActiveHours(wakeTime, sleepTime) {
  const now = new Date();
  const [wakeH, wakeM] = (wakeTime || '07:00').split(':').map(Number);
  const [sleepH, sleepM] = (sleepTime || '22:30').split(':').map(Number);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const wakeMinutes = wakeH * 60 + wakeM;
  const sleepMinutes = sleepH * 60 + sleepM;
  return nowMinutes >= wakeMinutes && nowMinutes <= sleepMinutes;
}

export default async function handler(req, res) {
  // Security: only allow GET from cron-job.org or authorized callers
  // cron-job.org sends a User-Agent containing 'cron-job.org'
  // We also allow a secret header for direct testing
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers['x-cron-secret'];
  const userAgent = req.headers['user-agent'] || '';

  const isAuthorizedCron =
    (cronSecret && authHeader === cronSecret) ||
    userAgent.includes('cron-job.org') ||
    userAgent.includes('UptimeRobot');

  if (!isAuthorizedCron && process.env.NODE_ENV === 'production') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    return res.status(500).json({ error: 'VAPID keys not configured' });
  }

  const now = Date.now();
  const results = { sent: 0, skipped: 0, errors: 0, removed: 0 };

  try {
    // Get all user IDs
    const userIds = await redis.smembers('aquaflow:users');
    if (!userIds || userIds.length === 0) {
      return res.status(200).json({ message: 'No subscribers', results });
    }

    // Process each user
    for (const uid of userIds) {
      try {
        const raw = await redis.get(`sub:${uid}`);
        if (!raw) {
          await redis.srem('aquaflow:users', uid);
          results.removed++;
          continue;
        }

        const record = typeof raw === 'string' ? JSON.parse(raw) : raw;

        if (!record.active || !record.subscription?.endpoint) {
          results.skipped++;
          continue;
        }

        // Check if within active hours
        if (!isWithinActiveHours(record.wakeTime, record.sleepTime)) {
          results.skipped++;
          continue;
        }

        // Check if this user is due for a reminder (within a 6-minute window)
        const isDue = record.nextReminderAt && now >= record.nextReminderAt - 30000; // 30s early tolerance
        if (!isDue) {
          results.skipped++;
          continue;
        }

        // Send the push notification via FCM
        const payload = JSON.stringify({
          title: '💧 Hydration Reminder',
          body: 'Time to drink water! Stay healthy and hydrated. 🌊',
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
          await webpush.sendNotification(record.subscription, payload);
          results.sent++;

          // Schedule next reminder
          const nextReminderAt = now + record.intervalMinutes * 60 * 1000;
          const updatedRecord = { ...record, nextReminderAt, lastSentAt: now };
          await redis.set(`sub:${uid}`, JSON.stringify(updatedRecord));

          console.log(`[AquaFlow Cron] Sent push to ${uid}, next in ${record.intervalMinutes}m`);
        } catch (pushErr) {
          // 410/404 = subscription expired, remove it
          if (pushErr.statusCode === 410 || pushErr.statusCode === 404) {
            await redis.del(`sub:${uid}`);
            await redis.srem('aquaflow:users', uid);
            results.removed++;
            console.log(`[AquaFlow Cron] Removed expired subscription: ${uid}`);
          } else {
            results.errors++;
            console.error(`[AquaFlow Cron] Push failed for ${uid}:`, pushErr.message);
          }
        }
      } catch (userErr) {
        results.errors++;
        console.error(`[AquaFlow Cron] Error processing ${uid}:`, userErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      totalUsers: userIds.length,
      results,
    });
  } catch (err) {
    console.error('[AquaFlow Cron] Fatal error:', err);
    return res.status(500).json({ error: err.message });
  }
}
