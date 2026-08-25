import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Zap,
  Check,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { useWater } from '../context/WaterContext';

interface ElectrolyteTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ElectrolyteTrackerModal: React.FC<ElectrolyteTrackerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { addWater, profile, weather } = useWater();
  const [loggedNotification, setLoggedNotification] = useState<string | null>(null);

  const env = profile.environmental;
  const isExtremeHeat = (weather && weather.temperature >= 35) || env.climate === 'dry_heat';
  const hasWorkout = env.workoutMinutes > 0;

  const handleLogElectrolyte = (amount: number, name: string) => {
    addWater(amount, 'electrolyte', name, 'zap');
    setLoggedNotification(`Logged ${amount}ml of ${name}!`);
    setTimeout(() => {
      setLoggedNotification(null);
      onClose();
    }, 900);
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
                <Zap className="w-5 h-5 text-[#30d158]" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Electrolytes & Minerals
                </h3>
                <p className="text-xs text-neutral-400">
                  Maintain cellular osmotic balance
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

          <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
            {/* Notification alert */}
            {loggedNotification && (
              <div className="p-3 rounded-xl bg-[#30d158]/15 border border-[#30d158]/30 text-xs text-[#30d158] flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>{loggedNotification}</span>
              </div>
            )}

            {/* Heat & Sweat Warning Banner */}
            {(isExtremeHeat || hasWorkout) && (
              <div className="p-4 rounded-2xl apple-card border border-[#ff9f0a]/30 bg-[#ff9f0a]/10 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#ff9f0a]">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Elevated Sweat & Salt Loss Detected</span>
                </div>
                <p className="text-[11px] text-neutral-300 leading-relaxed">
                  During high temperatures or intense workouts, sweat carries away <strong>~1,000–1,500mg sodium per liter</strong>. Pair water with electrolytes for optimal absorption.
                </p>
              </div>
            )}

            {/* Cellular Science Infobox */}
            <div className="p-3.5 rounded-2xl apple-card space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-white">
                <Info className="w-3.5 h-3.5 text-[#0a84ff]" />
                <span>Electrolyte Absorption Advantage</span>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Water follows electrolytes into cells via osmosis. Electrolyte drinks deliver <strong>+20% higher cellular retention</strong> (1.2x BHI) compared to plain water.
              </p>
            </div>

            {/* 1-Tap Electrolyte Restorations */}
            <div>
              <label className="text-[10px] uppercase font-semibold text-neutral-400 block mb-2">
                1-Tap Electrolyte Replenishers
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  {
                    name: 'Oral Rehydration Salts (ORS)',
                    ml: 500,
                    badge: 'WHO Formula',
                    desc: 'Optimal 2:1 glucose-to-sodium ratio for instant hydration',
                    icon: '⚡',
                  },
                  {
                    name: 'Fresh Coconut Water',
                    ml: 350,
                    badge: 'Potassium',
                    desc: 'Natural isotonic drink with magnesium and potassium',
                    icon: '🥥',
                  },
                  {
                    name: 'Lemon Salt Water',
                    ml: 350,
                    badge: 'Citrate Rich',
                    desc: 'Pink salt + lemon juice to replenish minerals and kidney citrate',
                    icon: '🍋',
                  },
                  {
                    name: 'Mineral Water + Salt',
                    ml: 300,
                    badge: 'Instant',
                    desc: 'Quick electrolyte restoration for active days',
                    icon: '🧂',
                  },
                ].map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => handleLogElectrolyte(item.ml, item.name)}
                    className="p-3.5 rounded-2xl apple-card hover:border-white/[0.2] transition cursor-pointer text-left flex flex-col justify-between group"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{item.icon}</span>
                        <div>
                          <h4 className="text-xs font-semibold text-white">
                            {item.name}
                          </h4>
                          <span className="text-[10px] text-[#0a84ff] font-mono">
                            {item.ml} ml (+{Math.round(item.ml * 1.2)}ml Net)
                          </span>
                        </div>
                      </div>

                      <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-black/40 text-neutral-400 border border-white/[0.08]">
                        {item.badge}
                      </span>
                    </div>

                    <p className="text-[10px] text-neutral-400 leading-normal">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-2 border-t border-white/[0.08] flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl apple-btn-secondary text-xs font-semibold transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
