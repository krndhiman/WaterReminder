import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Smartphone, ShieldCheck, Moon, BellRing, Sparkles, CheckCircle2 } from 'lucide-react';

interface LockScreenGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LockScreenGuideModal: React.FC<LockScreenGuideModalProps> = ({ isOpen, onClose }) => {
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
              <div className="w-10 h-10 rounded-2xl bg-[#0a84ff]/15 border border-[#0a84ff]/25 flex items-center justify-center text-lg">
                <BellRing className="w-5 h-5 text-[#0a84ff]" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Lock Screen & Background Alerts
                </h3>
                <p className="text-xs text-neutral-400">
                  Ensure notifications ring even when phone is locked
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

          {/* Content */}
          <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 text-xs">
            {/* Step 1: Install PWA */}
            <div className="p-4 rounded-2xl apple-card space-y-2">
              <div className="flex items-center gap-2 text-white font-semibold text-sm">
                <Smartphone className="w-4 h-4 text-[#0a84ff]" />
                <span>1. Install as App (Essential)</span>
              </div>
              <p className="text-neutral-400 leading-relaxed">
                When running inside browser tabs, phones freeze background timers when you lock the screen. Installing AquaFlow gives it native background wake rights:
              </p>
              <div className="p-2.5 rounded-xl bg-black/40 border border-white/[0.06] text-neutral-300 font-mono text-[11px] space-y-1">
                <div>• Tap the <strong>Install</strong> banner at the top of the screen (or Chrome 3 dots → <strong>Add to Home screen</strong> / <strong>Install app</strong>).</div>
              </div>
            </div>

            {/* Step 2: Battery Saver (Xiaomi / Samsung / OnePlus) */}
            <div className="p-4 rounded-2xl apple-card space-y-2">
              <div className="flex items-center gap-2 text-white font-semibold text-sm">
                <ShieldCheck className="w-4 h-4 text-[#ff9f0a]" />
                <span>2. Android Battery Optimization</span>
              </div>
              <p className="text-neutral-400 leading-relaxed">
                Aggressive phone battery savers (especially Xiaomi MIUI/HyperOS, Samsung, and OnePlus) kill background alarms after 3 minutes.
              </p>
              <div className="p-2.5 rounded-xl bg-black/40 border border-white/[0.06] text-neutral-300 font-mono text-[11px] space-y-1.5">
                <div>
                  <strong>On Xiaomi / Redmi / Poco (MIUI / HyperOS):</strong>
                  <br />
                  Long press AquaFlow icon → <strong>App info</strong> → <strong>Battery saver</strong> → Choose <strong>No restrictions</strong>.
                </div>
                <div className="pt-1 border-t border-white/[0.06]">
                  <strong>On Samsung / Other Android:</strong>
                  <br />
                  Settings → Apps → AquaFlow / Chrome → Battery → <strong>Unrestricted</strong>.
                </div>
              </div>
            </div>

            {/* Step 3: Lock Screen Permissions */}
            <div className="p-4 rounded-2xl apple-card space-y-2">
              <div className="flex items-center gap-2 text-white font-semibold text-sm">
                <Moon className="w-4 h-4 text-[#30d158]" />
                <span>3. Allow Lock Screen Display</span>
              </div>
              <div className="p-2.5 rounded-xl bg-black/40 border border-white/[0.06] text-neutral-300 font-mono text-[11px] space-y-1">
                <div>• Phone Settings → <strong>Notifications</strong> → <strong>Lock screen</strong> → Ensure <strong>Show all notifications & content</strong> is enabled.</div>
                <div>• In App Info → <strong>Notifications</strong> → Turn ON <strong>Show floating notifications</strong> and <strong>Lock screen notifications</strong>.</div>
              </div>
            </div>

            {/* Summary Badge */}
            <div className="p-3 rounded-2xl bg-[#30d158]/10 border border-[#30d158]/20 flex items-center gap-2.5 text-[#30d158]">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span className="text-[11px] leading-tight">
                Once installed with "No restrictions", reminders will ring reliably on schedule, even while your screen is locked.
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-2 flex justify-end border-t border-white/[0.08] shrink-0">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl apple-btn-primary text-xs font-semibold shadow cursor-pointer"
            >
              Got it
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
