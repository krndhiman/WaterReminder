import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Bell,
  Clock,
  Volume2,
  VolumeX,
  Check,
  AlertCircle,
  Smartphone,
  Sparkles,
} from 'lucide-react';
import { useWater } from '../context/WaterContext';
import { requestNotificationPermission, getNotificationPermission, sendBrowserNotification } from '../utils/notifications';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLockScreenGuide?: () => void;
}

export const ScheduleModal: React.FC<ScheduleModalProps> = ({
  isOpen,
  onClose,
  onOpenLockScreenGuide,
}) => {
  const { schedule, updateSchedule, triggerManualReminderTest } = useWater();

  const [interval, setInterval] = useState<number>(schedule.intervalMinutes || 45);
  const [wakeTime, setWakeTime] = useState<string>(schedule.wakeTime || '08:00');
  const [sleepTime, setSleepTime] = useState<string>(schedule.sleepTime || '22:30');
  const [defaultSnooze, setDefaultSnooze] = useState<number>(schedule.defaultSnoozeMinutes || 15);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(schedule.soundEnabled);
  const [browserNotifs, setBrowserNotifs] = useState<boolean>(schedule.browserNotifications);
  const [notifPermission, setNotifPermission] = useState<string>(getNotificationPermission());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleRequestNotifs = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    const res = await requestNotificationPermission();
    setNotifPermission(res.status);
    if (res.granted) {
      setBrowserNotifs(true);
      setSuccessMessage('Notifications enabled! A test notification has been sent.');
      await sendBrowserNotification('💧 AquaFlow System Alert Active', {
        body: `You will now receive reminders every ${interval} minutes.`,
        requireInteraction: true,
      });
    } else {
      setBrowserNotifs(false);
      setErrorMessage(
        res.errorMessage ||
          'Notifications are blocked in site settings. Click the icon (🔒 or ⚙️) near the website URL address to allow notifications.'
      );
    }
  };

  const handleSave = () => {
    updateSchedule({
      intervalMinutes: interval,
      wakeTime,
      sleepTime,
      defaultSnoozeMinutes: defaultSnooze,
      soundEnabled,
      browserNotifications: browserNotifs,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.96, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0, y: 15 }}
          className="relative w-full max-w-lg rounded-3xl apple-glass-modal p-5 sm:p-6 z-10 overflow-hidden max-h-[90vh] flex flex-col space-y-4"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.08] shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#1c1c1e] border border-white/[0.08] flex items-center justify-center text-lg">
                <Bell className="w-5 h-5 text-[#0a84ff]" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Reminder Schedule
                </h3>
                <p className="text-xs text-neutral-400">
                  Intervals, active hours, and push alerts
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-neutral-400 hover:text-white bg-white/[0.08] transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Scrollable Form Content */}
          <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
            {/* Interval Options */}
            <div className="p-4 rounded-2xl apple-card space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">
                  Reminder Frequency
                </span>
                <span className="text-xs font-mono font-bold text-[#0a84ff]">
                  Every {interval} mins
                </span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                {[20, 30, 45, 60, 90, 120].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setInterval(mins)}
                    className={`py-2 px-1 rounded-xl text-xs font-semibold transition cursor-pointer text-center ${
                      interval === mins
                        ? 'bg-[#0a84ff] text-white shadow-sm'
                        : 'bg-black/30 text-neutral-400 hover:text-white border border-white/[0.06]'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>

            {/* Active Wake & Sleep Hours */}
            <div className="p-4 rounded-2xl apple-card space-y-2.5">
              <div>
                <span className="text-xs font-semibold text-white block">
                  Active Hours (Silent Sleep Gate)
                </span>
                <span className="text-[11px] text-neutral-400">
                  Reminders are silenced automatically during your sleep hours
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[10px] uppercase font-semibold text-neutral-400 block mb-1">
                    Wake Up Time
                  </label>
                  <input
                    type="time"
                    value={wakeTime}
                    onChange={(e) => setWakeTime(e.target.value)}
                    className="w-full bg-black/40 border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#0a84ff]"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-semibold text-neutral-400 block mb-1">
                    Bed Time
                  </label>
                  <input
                    type="time"
                    value={sleepTime}
                    onChange={(e) => setSleepTime(e.target.value)}
                    className="w-full bg-black/40 border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#0a84ff]"
                  />
                </div>
              </div>
            </div>

            {/* System Push Notification Control */}
            <div className="p-4 rounded-2xl apple-card space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-[#0a84ff]/10 text-[#0a84ff]">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white flex items-center gap-2">
                      <span>Lock Screen & OS Push Alerts</span>
                      <span
                        className={`text-[9px] font-semibold px-2 py-0.2 rounded-full ${
                          notifPermission === 'granted'
                            ? 'bg-[#30d158]/15 text-[#30d158]'
                            : 'bg-neutral-800 text-neutral-400'
                        }`}
                      >
                        {notifPermission === 'granted' ? 'Enabled' : 'Needs Permission'}
                      </span>
                    </h4>
                    <p className="text-[11px] text-neutral-400">
                      Banners with quick +300ml & +500ml actions
                    </p>
                  </div>
                </div>

                {notifPermission === 'granted' ? (
                  <button
                    type="button"
                    onClick={() => setBrowserNotifs(!browserNotifs)}
                    className={`w-12 h-6 rounded-full transition relative cursor-pointer ${
                      browserNotifs ? 'bg-[#0a84ff]' : 'bg-neutral-800'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${
                        browserNotifs ? 'left-7' : 'left-1'
                      }`}
                    />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleRequestNotifs}
                    className="px-3 py-1.5 apple-btn-primary text-xs font-semibold transition cursor-pointer"
                  >
                    Enable
                  </button>
                )}
              </div>

              {errorMessage && (
                <div className="p-2.5 rounded-xl bg-rose-950/50 border border-rose-500/30 text-[11px] text-rose-200 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-2.5 rounded-xl bg-[#30d158]/10 border border-[#30d158]/30 text-[11px] text-[#30d158] flex items-start gap-2">
                  <Check className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{successMessage}</span>
                </div>
              )}

              {onOpenLockScreenGuide && (
                <button
                  type="button"
                  onClick={onOpenLockScreenGuide}
                  className="text-[11px] text-[#0a84ff] hover:underline flex items-center gap-1 font-medium pt-1 cursor-pointer"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Phone not receiving alerts when locked? View setup guide</span>
                </button>
              )}
            </div>

            {/* Sound Toggle */}
            <div className="p-4 rounded-2xl apple-card flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-neutral-800 text-neutral-300">
                  {soundEnabled ? <Volume2 className="w-4 h-4 text-[#0a84ff]" /> : <VolumeX className="w-4 h-4 text-neutral-500" />}
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Chime Sound Effects</h4>
                  <p className="text-[11px] text-neutral-400">
                    Play audio chimes when hydration reminder triggers
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`w-12 h-6 rounded-full transition relative cursor-pointer ${
                  soundEnabled ? 'bg-[#0a84ff]' : 'bg-neutral-800'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${
                    soundEnabled ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-white/[0.08] flex items-center justify-end gap-2.5 shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl apple-btn-secondary text-xs font-semibold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2.5 rounded-xl apple-btn-primary text-xs font-semibold transition cursor-pointer shadow"
            >
              Save Schedule
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
