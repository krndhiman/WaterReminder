import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Sparkles,
  Droplet,
  Zap,
  Clock,
  Sun,
  Users,
  Cloud,
  BarChart3,
  ShieldCheck,
  Mic,
} from 'lucide-react';

interface AboutAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutAppModal: React.FC<AboutAppModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const features = [
    {
      icon: <Droplet className="w-4 h-4 text-[#0a84ff]" />,
      title: '1. Apple Activity Ring & Silky Water Cylinder',
      badge: 'Visualizer',
      description:
        'Features calm, silky liquid simulation with quiet dual-harmonic fluid physics, surface tension, and laser-etched volume indicators (1,000ml to 4,000ml).',
    },
    {
      icon: <Zap className="w-4 h-4 text-[#ff9f0a]" />,
      title: '2. 1-Tap Quick Sips, Custom Volumes & Hotkeys',
      badge: 'Fast Logging',
      description:
        'Log standard drink containers in 1 tap (250ml glass, 150ml tea/coffee, 350ml mug, 500ml bottle, 750ml flask, 300ml electrolyte). On desktop, press keys 1 through 6 for instant zero-click logging.',
    },
    {
      icon: <Mic className="w-4 h-4 text-[#30b0c7]" />,
      title: '3. Hands-Free Voice Logger (Key "V")',
      badge: 'Speech Sync',
      description:
        'Tap the mic icon or press "V" to log water using natural speech. Say "Drank 400 ml water", "1 cup of chai", or "500ml electrolytes"—the engine parses quantities automatically.',
    },
    {
      icon: <Clock className="w-4 h-4 text-[#5e5ce6]" />,
      title: '4. Smart Rolling Reminder Engine',
      badge: 'Pacing',
      description:
        'Unlike legacy apps that ring on rigid clocks and spam you minutes after you just drank, AquaFlow resets the countdown every time you take a sip. Includes a silent sleep gate (e.g., 10:30 PM to 8:00 AM) and automatically pauses reminders once you hit 100% of your daily goal.',
    },
    {
      icon: <Sun className="w-4 h-4 text-[#ff9f0a]" />,
      title: '5. Live City Weather & Heat Fluid Boost',
      badge: 'Weather',
      description:
        'Syncs with real-time temperature and humidity to calculate biological fluid loss through sweat, adding compensatory milliliters to keep you hydrated on hot sunny days.',
    },
    {
      icon: <Users className="w-4 h-4 text-[#30d158]" />,
      title: '6. AquaSquads & Friend Challenges',
      badge: 'Multi-Squad',
      description:
        'Create and join multiple squads simultaneously (Gym Squad, Office Team, Family). Supports unlimited members per squad with live standings and a communal water reservoir tank. Share 1-tap WhatsApp invite links or 6-character room codes.',
    },
    {
      icon: <Cloud className="w-4 h-4 text-[#0a84ff]" />,
      title: '7. Zero-Loss Cloud Sync & 6-Char Secret Key',
      badge: 'Backup',
      description:
        'Never lose your data when switching phones or factory resetting. Every profile gets a private 6-character Secret Sync Key. Enter it on any new phone to restore all streaks, history, and squads in 1 second with zero server cost.',
    },
    {
      icon: <BarChart3 className="w-4 h-4 text-[#bf5af2]" />,
      title: '8. Progress Trends & Data Freedom',
      badge: 'Analytics',
      description:
        'Visual multi-day progress bar chart engineered with responsive column scaling to prevent mobile screen leaks. Track current streak flames, daily averages, all-time liters, and export your entire history to free CSV spreadsheets or JSON anytime.',
    },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Apple Glass Modal Container */}
        <motion.div
          initial={{ scale: 0.96, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0, y: 15 }}
          className="relative w-full max-w-2xl h-[90vh] sm:h-[85vh] rounded-3xl apple-glass-modal p-5 sm:p-6 z-10 overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.08] shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#1c1c1e] border border-white/[0.08] flex items-center justify-center text-lg">
                💧
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold text-white">
                    About AquaFlow
                  </h2>
                  <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-[#0a84ff]/15 text-[#0a84ff]">
                    v2.5
                  </span>
                </div>
                <p className="text-xs text-neutral-400">
                  Feature Guide & Architecture Overview
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

          {/* Scrollable Feature Breakdown */}
          <div className="flex-1 overflow-y-auto pr-1 py-4 space-y-3">
            {/* Philosophy Banner */}
            <div className="p-4 rounded-2xl apple-card space-y-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#0a84ff] block">
                Design Philosophy
              </span>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                AquaFlow is designed to be the <strong>undisputed standard in daily hydration</strong>—built with zero ads, zero subscription paywalls, zero alert fatigue, and total respect for your data privacy.
              </p>
            </div>

            {/* Feature Cards Grid */}
            <div className="space-y-2.5">
              {features.map((f, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl apple-card space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-xl bg-black/40 border border-white/[0.06] shrink-0">
                        {f.icon}
                      </div>
                      <h3 className="text-xs sm:text-sm font-semibold text-white">
                        {f.title}
                      </h3>
                    </div>
                    <span className="text-[10px] font-medium px-2 py-0.2 rounded-full bg-neutral-800 text-neutral-400">
                      {f.badge}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 leading-relaxed pl-1">
                    {f.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Free Forever & Privacy Guarantee */}
            <div className="p-4 rounded-2xl apple-card space-y-1.5">
              <div className="flex items-center gap-2 text-[#30d158] font-semibold text-xs">
                <ShieldCheck className="w-4 h-4" />
                <span>100% Free Forever & Privacy Guarantee</span>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                AquaFlow is engineered with an offline-first architecture using local cryptographic keys and keyless open APIs. There are no expensive backend servers to maintain, guaranteeing it will <strong>always remain 100% free for both the developer and all users</strong>.
              </p>
            </div>
          </div>

          {/* Footer Close Button */}
          <div className="pt-3 border-t border-white/[0.08] shrink-0">
            <button
              onClick={onClose}
              className="w-full py-3 rounded-2xl apple-btn-primary text-xs font-semibold transition cursor-pointer"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
