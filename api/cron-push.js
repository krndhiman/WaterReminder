// Vercel Serverless Cron Function: /api/cron-push.js
// This is called by Vercel Cron on a schedule (see vercel.json crons config).
// It delivers push notifications to all registered subscriptions whose scheduled time has passed.
//
// NOTE: This file is a companion to the in-memory subscription store in subscribe.js.
// Because Vercel serverless functions are stateless, this currently logs what would be sent.
// For real persistent scheduling, use Vercel KV (Upstash Redis) to store subscriptions + scheduled times.

import webpush from 'web-push';

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_EMAIL = process.env.VAPID_EMAIL || 'mailto:admin@aquaflow.app';

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

export default async function handler(req, res) {
  // Only allow Vercel Cron invocations (or authenticated requests)
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // In a real persistent setup, you'd query your KV store for due subscriptions here.
  // This endpoint is here as a scaffold for when you connect Vercel KV / Upstash.
  console.log('[AquaFlow Cron] Cron push job ran at', new Date().toISOString());

  return res.status(200).json({
    success: true,
    message: 'Cron executed. Connect Vercel KV to deliver scheduled pushes.',
    timestamp: new Date().toISOString(),
  });
}
