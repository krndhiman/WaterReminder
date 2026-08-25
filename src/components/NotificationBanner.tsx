import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, BellRing, Check, AlertCircle, Sparkles, X, Volume2, ShieldCheck, Clock, Droplet, Plus } from 'lucide-react';
import { useWater } from '../context/WaterContext';
import {
  requestNotificationPermission,
  getNotificationPermission,
  sendBrowserNotification,
} from '../utils/notifications';

interface NotificationBannerProps {
  onOpenSchedule?: () => void;
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({ onOpenSchedule }) => {
  const { schedule, updateSchedule, triggerManualReminderTest, addWater } = useWater();
  const [permission, setPermission] = useState<string>(getNotificationPermission());
  const [testSent, setTestSent] = useState<boolean>(false);
  const [justLogged300, setJustLogged300] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    // Check real browser permission on mount
    const perm = getNotificationPermission();
    setPermission(perm);
    if (perm === 'granted' && !schedule.browserNotifications) {
      updateSchedule({ browserNotifications: true });
    }
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
        body: `System notifications are active! You will receive reminders every ${schedule.intervalMinutes} minutes.`,
        requireInteraction: true,
      });
      setTimeout(() => setTestSent(false), 4000);
    } else {
      setErrorMsg(
        result.errorMessage ||
          'Notifications are blocked. Click the icon (🔒 or ⚙️) next to the URL address to allow notifications for this site.'
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
      body: `Time to drink some fresh water! Next reminder in ${schedule.intervalMinutes} mins.`,
      requireInteraction: true,
    });
    setTimeout(() => setTestSent(false), 3000);
  };

  const handleQuickLog300 = () => {
    addWater(300, 'water', '300ml Water Glass', 'glass');
    setJustLogged300(true);
    setTimeout(() => setJustLogged300(false), 2000);
  };

  return (
    <div className="w-full max-w-xl mx-auto px-0.5">
      {/* Prominent Apple-Style Notification Card */}
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-3.5 sm:p-4 rounded-3xl apple-card border transition-all shadow-md ${
          permission === 'granted'
            ? 'bg-[#161618] border-white/[0.08]'
            : 'bg-[#0a84ff]/10 border-[#0a84ff]/30'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Status & Description */}
          <div className="flex items-start gap-3 min-w-0">
            <div
              className={`p-2.5 rounded-2xl shrink-0 ${
                permission === 'granted'
                  ? 'bg-[#30d158]/15 text-[#30d158]'
                  : 'bg-[#0a84ff] text-white shadow-md'
              }`}
            >
              {permission === 'granted' ? (
                <Bell className="w-4 h-4" />
              ) : (
                <BellRing className="w-4 h-4 animate-bounce" />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-xs sm:text-sm font-bold text-white">
                  {permission === 'granted'
                    ? 'System Reminders: Active'
                    : 'Enable System & Lock Screen Reminders'}
                </h4>
                <span
                  className={`text-[9px] font-bold px-2 py-0.2 rounded-full uppercase ${
                    permission === 'granted'
                      ? 'bg-[#30d158]/15 text-[#30d158] border border-[#30d158]/30'
                      : 'bg-[#0a84ff] text-white'
                  }`}
                >
                  {permission === 'granted' ? `Every ${schedule.intervalMinutes}m` : 'Action Needed'}
                </span>
              </div>

              <p className="text-[11px] text-neutral-400 mt-0.5">
                {permission === 'granted'
                  ? 'Reminders will pop up on your lock screen & desktop even when the app is in the background.'
                  : 'Receive lock-screen alerts & sound even when your phone is locked or browser is minimized.'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center flex-wrap">
            {/* Quick 300ml Water Preset Button */}
            <button
              onClick={handleQuickLog300}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                justLogged300
                  ? 'bg-[#30d158]/20 border-[#30d158] text-[#30d158]'
                  : 'bg-[#0a84ff]/15 border-[#0a84ff]/30 text-[#0a84ff] hover:bg-[#0a84ff] hover:text-white'
              }`}
              title="Quick Log 300 ml Water"
            >
              {justLogged300 ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Logged +300ml!</span>
                </>
              ) : (
                <>
                  <Droplet className="w-3.5 h-3.5 fill-current" />
                  <span>+300ml Water</span>
                </>
              )}
            </button>

            {permission !== 'granted' ? (
              <button
                onClick={handleEnableNotifications}
                className="px-3.5 py-1.5 rounded-xl apple-btn-primary text-xs font-semibold shadow-md transition cursor-pointer flex items-center gap-1.5"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Turn On Alerts</span>
              </button>
            ) : (
              <button
                onClick={handleTestNotification}
                className="px-3 py-1.5 rounded-xl bg-[#1c1c1e] hover:bg-[#2c2c2e] border border-white/[0.08] text-xs font-semibold text-[#0a84ff] hover:text-white transition cursor-pointer flex items-center gap-1"
              >
                {testSent ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#30d158]" />
                    <span className="text-[#30d158]">Test Sent!</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-[#0a84ff]" />
                    <span>Test Notification</span>
                  </>
                )}
              </button>
            )}

            {onOpenSchedule && (
              <button
                onClick={onOpenSchedule}
                className="p-1.5 rounded-xl bg-[#1c1c1e] hover:bg-[#2c2c2e] border border-white/[0.08] text-neutral-400 hover:text-white transition cursor-pointer text-xs"
                title="Change Reminder Schedule & Times"
              >
                <Clock className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Error message / blocked troubleshooting */}
        {errorMsg && (
          <div className="mt-3 p-3 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-[11px] text-rose-200 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}
      </motion.div>
    </div>
  );
};
