import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Bell,
  Clock,
  Volume2,
  VolumeX,
  Moon,
  Sun,
  ShieldCheck,
  Check,
  Play,
  AlertCircle,
  Smartphone,
  Info,
  Vibrate,
} from 'lucide-react';
import { useWater } from '../context/WaterContext';
import { requestNotificationPermission, getNotificationPermission } from '../utils/notifications';
import { soundEffects } from '../utils/soundEffects';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScheduleModal: React.FC<ScheduleModalProps> = ({ isOpen, onClose }) => {
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
      setSuccessMessage('Notifications successfully enabled! Test alert sent.');
      triggerManualReminderTest();
    } else {
      setBrowserNotifs(false);
      setErrorMessage(
        res.errorMessage ||
          'Notifications are currently blocked. Click the icon (🔒 or ⚙️) next to the website URL address to allow notifications.'
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-lg rounded-3xl glass-panel-glow p-6 z-10 overflow-hidden max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-700/50">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white font-heading">Smart Reminder Schedule</h3>
                <p className="text-xs text-slate-400">Configure intervals, snooze, and active hours</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
            {/* Reminder Interval */}
            <div>
              <label className="text-xs font-bold text-cyan-300 uppercase tracking-wider block mb-2">
                Reminder Frequency: Every {interval} minutes
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {[20, 30, 45, 60, 90, 120].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setInterval(mins)}
                    className={`py-2 rounded-xl border text-xs font-bold transition cursor-pointer ${
                      interval === mins
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>

            {/* Default Snooze Duration Setting */}
            <div>
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-2">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                Default Snooze Time (when postponing):
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[10, 15, 20, 30].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setDefaultSnooze(mins)}
                    className={`py-2 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                      defaultSnooze === mins
                        ? 'bg-sky-500/20 border-sky-400 text-sky-200'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {mins} mins
                  </button>
                ))}
              </div>
            </div>

            {/* Active Awake Window */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                Active Hours (Quiet during sleep)
              </span>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Wake-up Time</label>
                  <input
                    type="time"
                    value={wakeTime}
                    onChange={(e) => setWakeTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Bedtime</label>
                  <input
                    type="time"
                    value={sleepTime}
                    onChange={(e) => setSleepTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>
            </div>

            {/* Notifications & Push Section */}
            <div className="space-y-2.5">
              {/* Browser Push Notifications */}
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-300">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>Lock Screen & Push Alerts</span>
                        <span
                          className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-md ${
                            notifPermission === 'granted'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                              : notifPermission === 'denied'
                              ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                              : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                          }`}
                        >
                          {notifPermission}
                        </span>
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Displays lock-screen banners with vibration & 1-tap buttons
                      </p>
                    </div>
                  </div>

                  {notifPermission === 'granted' ? (
                    <button
                      type="button"
                      onClick={() => setBrowserNotifs(!browserNotifs)}
                      className={`w-12 h-6 rounded-full transition relative cursor-pointer ${
                        browserNotifs ? 'bg-cyan-500' : 'bg-slate-800'
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
                      className="px-3.5 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs rounded-xl cursor-pointer transition shadow"
                    >
                      Enable Push
                    </button>
                  )}
                </div>

                {/* Status and Troubleshooting message */}
                {errorMessage && (
                  <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-[11px] text-rose-200 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {successMessage && (
                  <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-[11px] text-emerald-200 flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{successMessage}</span>
                  </div>
                )}
              </div>

              {/* Mobile Locked & Background Info Card */}
              <div className="p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 text-[11px] text-cyan-200/90 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-cyan-300">
                  <Smartphone className="w-4 h-4" />
                  <span>Mobile & Lock-Screen Hydration Tip</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  For background alerts when phone is <strong>locked</strong> or <strong>app is closed</strong>: Tap your mobile browser menu (<kbd className="bg-slate-800 px-1 rounded">⋮</kbd> or Share) and select <strong>"Add to Home screen" / Install App</strong>.
                </p>
              </div>

              {/* Sound Synthesizer */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-300">
                    <Volume2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Procedural Sound Effects</h4>
                    <p className="text-[11px] text-slate-400">
                      Water drops, pouring waves, and crystal chimes
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => soundEffects.playReminderChime()}
                    className="px-2.5 py-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg cursor-pointer transition"
                  >
                    Play Chime
                  </button>
                  <button
                    type="button"
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={`w-12 h-6 rounded-full transition relative cursor-pointer ${
                      soundEnabled ? 'bg-cyan-500' : 'bg-slate-800'
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
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-700/50 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                triggerManualReminderTest();
                onClose();
              }}
              className="flex items-center gap-1.5 text-xs text-cyan-400 hover:underline cursor-pointer"
            >
              <Play className="w-3.5 h-3.5" />
              Test Reminder Now
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition cursor-pointer"
            >
              <Check className="w-4 h-4" />
              Save Settings
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
