import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, BellRing, Check, AlertCircle, Clock, Droplet } from 'lucide-react';
import { useWater } from '../context/WaterContext';
import {
  requestNotificationPermission,
  getNotificationPermission,
  sendBrowserNotification,
} from '../utils/notifications';

interface NotificationBannerProps {
  onOpenSchedule?: () => void;
  onOpenLockScreenGuide?: () => void;
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({
  onOpenSchedule,
  onOpenLockScreenGuide,
}) => {
  const { schedule, updateSchedule, addWater } = useWater();
  const [permission, setPermission] = useState<string>(getNotificationPermission());
  const [justLogged300, setJustLogged300] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
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
      // Send a real confirmation notification — this is the legitimate system notification
      await sendBrowserNotification('💧 AquaFlow Reminders Active!', {
        body: `You'll get water reminders every ${schedule.intervalMinutes} minutes. Stay hydrated!`,
        requireInteraction: true,
      });
    } else {
      setErrorMsg(
        result.errorMessage ||
          'Notifications blocked. Tap the lock (🔒) or info icon next to the address bar and allow notifications for this site.'
      );
    }
  };

  const handleQuickLog300 = () => {
    addWater(300, 'water', '300ml Water Glass', 'glass');
    setJustLogged300(true);
    setTimeout(() => setJustLogged300(false), 2000);
  };

  // When permission is already granted and notifications are on, render compact status bar
  if (permission === 'granted') {
    return (
      <div className="w-full max-w-xl mx-auto px-0.5">
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between gap-2 p-3 rounded-2xl bg-[#161618] border border-white/[0.06] shadow-sm"
        >
          {/* Status indicator — clickable to view Lock Screen background tips */}
          <button
            onClick={onOpenLockScreenGuide}
            className="flex items-center gap-2.5 min-w-0 text-left cursor-pointer group"
            title="Tap to see lock-screen & battery saver setup"
          >
            <div className="w-2 h-2 rounded-full bg-[#30d158] shadow-[0_0_6px_#30d158] shrink-0 group-hover:scale-125 transition" />
            <div className="min-w-0">
              <span className="text-[11px] font-semibold text-white group-hover:text-[#0a84ff] transition">
                Reminders Active
              </span>
              <span className="text-[10px] text-neutral-500 ml-1.5">
                Every {schedule.intervalMinutes}m
              </span>
            </div>
          </button>

          {/* Right: 300ml quick log + schedule icon */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleQuickLog300}
              className={`px-3 py-1.5 rounded-xl border text-[11px] font-semibold transition cursor-pointer flex items-center gap-1 ${
                justLogged300
                  ? 'bg-[#30d158]/15 border-[#30d158]/40 text-[#30d158]'
                  : 'bg-[#0a84ff]/10 border-[#0a84ff]/25 text-[#0a84ff] hover:bg-[#0a84ff] hover:text-white hover:border-[#0a84ff]'
              }`}
              title="Quick log 300ml water"
            >
              {justLogged300 ? (
                <>
                  <Check className="w-3 h-3" />
                  <span>+300ml ✓</span>
                </>
              ) : (
                <>
                  <Droplet className="w-3 h-3 fill-current" />
                  <span>+300ml</span>
                </>
              )}
            </button>

            {onOpenSchedule && (
              <button
                onClick={onOpenSchedule}
                className="p-1.5 rounded-xl bg-[#1c1c1e] hover:bg-[#2c2c2e] border border-white/[0.06] text-neutral-500 hover:text-white transition cursor-pointer"
                title="Adjust reminder schedule"
              >
                <Clock className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  // When permission not yet granted — show prominent CTA card
  return (
    <div className="w-full max-w-xl mx-auto px-0.5">
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-2xl bg-[#0a84ff]/10 border border-[#0a84ff]/30 shadow-md"
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-[#0a84ff] text-white shadow-md shrink-0">
            <BellRing className="w-4 h-4 animate-bounce" />
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-white leading-tight">
              Enable Water Reminders
            </h4>
            <p className="text-[11px] text-neutral-400 mt-0.5 leading-relaxed">
              Get lock-screen alerts so you never forget to drink water.
            </p>
          </div>

          <button
            onClick={handleEnableNotifications}
            className="px-3.5 py-2 rounded-xl apple-btn-primary text-xs font-semibold shadow transition cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Turn On</span>
          </button>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="mt-3 p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-[11px] text-rose-200 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}
      </motion.div>
    </div>
  );
};
