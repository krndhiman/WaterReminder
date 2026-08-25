import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellRing, Check, AlertCircle, Sparkles, X, Volume2 } from 'lucide-react';
import { useWater } from '../context/WaterContext';
import {
  requestNotificationPermission,
  getNotificationPermission,
  sendBrowserNotification,
} from '../utils/notifications';

export const NotificationBanner: React.FC = () => {
  const { schedule, updateSchedule, triggerManualReminderTest } = useWater();
  const [permission, setPermission] = useState<string>(getNotificationPermission());
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [testSent, setTestSent] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setPermission(getNotificationPermission());
  }, []);

  const handleEnableNotifications = async () => {
    setErrorMsg(null);
    const result = await requestNotificationPermission();
    setPermission(result.status);

    if (result.granted) {
      updateSchedule({ browserNotifications: true });
      setTestSent(true);
      // Trigger instant real OS test notification
      await sendBrowserNotification('💧 AquaFlow Reminders Active!', {
        body: 'System notifications are working! You will now receive reminders even when the app is in the background.',
      });
      setTimeout(() => setTestSent(false), 4000);
    } else {
      setErrorMsg(
        result.errorMessage ||
          'Notifications are blocked. Please click the icon (🔒) near the URL in your browser to allow notifications.'
      );
    }
  };

  const handleTestNotification = async () => {
    if (permission !== 'granted') {
      await handleEnableNotifications();
      return;
    }

    setTestSent(true);
    triggerManualReminderTest();
    await sendBrowserNotification('💧 AquaFlow Hydration Check!', {
      body: 'Time to drink some fresh water! Your system notifications are working perfectly.',
      requireInteraction: true,
    });
    setTimeout(() => setTestSent(false), 3000);
  };

  if (isDismissed) return null;

  return (
    <div className="w-full max-w-xl mx-auto px-0.5">
      {permission !== 'granted' ? (
        // Prompt Banner to Enable System Notifications
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3.5 rounded-3xl apple-card border border-[#0a84ff]/30 bg-[#0a84ff]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md"
        >
          <div className="flex items-start gap-3 min-w-0">
            <div className="p-2 rounded-xl bg-[#0a84ff] text-white shrink-0 shadow-sm mt-0.5 sm:mt-0">
              <BellRing className="w-4 h-4 animate-bounce" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>Enable System & Lock Screen Reminders</span>
                <span className="text-[9px] bg-[#0a84ff] text-white px-1.5 py-0.2 rounded font-semibold uppercase">
                  Important
                </span>
              </h4>
              <p className="text-[11px] text-neutral-300 mt-0.5">
                Receive notifications even when your phone is locked or browser is in the background.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <button
              onClick={handleEnableNotifications}
              className="px-3.5 py-1.5 rounded-xl apple-btn-primary text-xs font-semibold shadow transition cursor-pointer"
            >
              Turn On Alerts
            </button>
            <button
              onClick={() => setIsDismissed(true)}
              className="p-1.5 rounded-xl text-neutral-400 hover:text-white transition cursor-pointer"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {errorMsg && (
            <div className="w-full mt-2 p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-[11px] text-rose-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}
        </motion.div>
      ) : (
        // Confirmation Banner with Quick Test Trigger
        <div className="p-2.5 rounded-2xl apple-card bg-[#161618] border border-white/[0.06] flex items-center justify-between text-xs px-3">
          <div className="flex items-center gap-2 text-neutral-300">
            <div className="w-2 h-2 rounded-full bg-[#30d158] shadow-[0_0_8px_#30d158]" />
            <span className="text-[11px] font-medium text-neutral-300">
              System Notifications Active (Every {schedule.intervalMinutes}m)
            </span>
          </div>

          <button
            onClick={handleTestNotification}
            className="text-[11px] font-semibold text-[#0a84ff] hover:text-white transition cursor-pointer flex items-center gap-1"
          >
            {testSent ? (
              <>
                <Check className="w-3 h-3 text-[#30d158]" />
                <span className="text-[#30d158]">Test Sent!</span>
              </>
            ) : (
              <>
                <Bell className="w-3 h-3" />
                <span>Test Notification</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
