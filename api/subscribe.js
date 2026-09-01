// Vercel Serverless Function: /api/subscribe.js
// Stores a browser push subscription for Web Push delivery
// 
// This uses an in-memory store for simplicity (restarts on cold start).
// For production persistence, replace with a KV store (Vercel KV / Upstash Redis).

import webpush from 'web-push';

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_EMAIL = process.env.VAPID_EMAIL || 'mailto:admin@aquaflow.app';

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

// Simple in-memory store — persists for the lifetime of this serverless function instance
// Replace with Vercel KV / Upstash for true persistence across cold starts
const subscriptions = new Map();

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // POST /api/subscribe — Save or update a push subscription
  if (req.method === 'POST') {
    const { subscription, userId } = req.body || {};

    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ error: 'Missing subscription endpoint' });
    }

    const key = userId || subscription.endpoint;
    subscriptions.set(key, { subscription, userId, savedAt: Date.now() });

    console.log(`[AquaFlow Push] Subscription saved for ${key}`);
    return res.status(201).json({ success: true, message: 'Push subscription saved.' });
  }

  // DELETE /api/subscribe — Remove a push subscription
  if (req.method === 'DELETE') {
    const { userId, endpoint } = req.body || {};
    const key = userId || endpoint;
    if (key) subscriptions.delete(key);
    return res.status(200).json({ success: true });
  }

  // GET /api/subscribe — Health check / subscription count
  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'ok',
      subscriptionCount: subscriptions.size,
      vapidConfigured: !!(VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY),
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
