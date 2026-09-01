// /api/subscribe.js
// Saves a user's push subscription + reminder schedule to Upstash Redis
// This persists across all serverless function cold starts

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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // POST — save/update a subscription with schedule info
  if (req.method === 'POST') {
    const {
      subscription,
      userId,
      intervalMinutes = 45,
      wakeTime = '07:00',
      sleepTime = '22:30',
      nextReminderAt, // unix ms timestamp
    } = req.body || {};

    if (!subscription?.endpoint) {
      return res.status(400).json({ error: 'Missing subscription' });
    }

    // Create a stable user ID from the endpoint if none provided
    const uid = userId || Buffer.from(subscription.endpoint).toString('base64').slice(-20);

    const record = {
      subscription,
      uid,
      intervalMinutes,
      wakeTime,
      sleepTime,
      nextReminderAt: nextReminderAt || Date.now() + intervalMinutes * 60 * 1000,
      updatedAt: Date.now(),
      active: true,
    };

    // Store the record and keep the uid in a global set
    await redis.set(`sub:${uid}`, JSON.stringify(record));
    await redis.sadd('aquaflow:users', uid);

    console.log(`[AquaFlow] Subscription saved: ${uid}, next reminder in ${intervalMinutes}m`);
    return res.status(201).json({ success: true, uid });
  }

  // DELETE — remove subscription
  if (req.method === 'DELETE') {
    const { userId } = req.body || {};
    if (userId) {
      await redis.del(`sub:${userId}`);
      await redis.srem('aquaflow:users', userId);
    }
    return res.status(200).json({ success: true });
  }

  // GET — health check
  if (req.method === 'GET') {
    const count = await redis.scard('aquaflow:users');
    return res.status(200).json({
      status: 'ok',
      activeUsers: count,
      vapidConfigured: !!(VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY),
      redisConnected: true,
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
