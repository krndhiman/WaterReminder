import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Zap,
  ShieldAlert,
  Sparkles,
  Info,
  Check,
  Plus,
  Flame,
  AlertTriangle,
  HeartPulse,
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/85 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-lg rounded-3xl glass-surface-glow p-6 z-10 overflow-hidden border border-emerald-500/40 max-h-[92vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-300">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white font-heading">
                  Electrolyte & Sodium Balance
                </h3>
                <p className="text-xs text-slate-400">
                  Maintain the vital water-to-salt ratio and prevent blood dilution
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
            {/* Notification alert */}
            {loggedNotification && (
              <div className="p-3 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-xs text-emerald-200 flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>{loggedNotification}</span>
              </div>
            )}

            {/* Scientific Heat & Sweat Warning Banner */}
            {(isExtremeHeat || hasWorkout) && (
              <div className="p-4 rounded-2xl bg-amber-950/60 border border-amber-500/40 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Elevated Sweat & Salt Loss Detected</span>
                </div>
                <p className="text-[11px] text-amber-100/90 leading-relaxed">
                  During high heat (e.g. Kanpur 40°C heatwave) or workouts, sweat carries away <strong>~1,000–1,500mg of sodium per litre</strong>. Drinking plain water alone dilutes blood sodium, triggering muscle cramps, brain fog, and dizziness. Pair your water with electrolytes!
                </p>
              </div>
            )}

            {/* Cellular Science Infobox */}
            <div className="p-4 rounded-2xl glass-card-inner space-y-2 border border-slate-800">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <Info className="w-4 h-4 text-emerald-400" />
                <span>The Electrolyte Factor Explained</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Water follows sodium into your cells via osmosis. When you drink electrolyte-enhanced water, cellular absorption increases by <strong>+20%</strong> (1.2x BHI) and prevents frequent urination of plain water.
              </p>
            </div>

            {/* Quick 1-Tap Electrolyte Restorations */}
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2.5">
                1-Tap Electrolyte Replenishers
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  {
                    name: 'Oral Rehydration Salts (ORS)',
                    ml: 500,
                    badge: 'WHO Formula',
                    desc: 'Optimal 2:1 glucose-to-sodium ratio for instant cellular fluid uptake',
                    icon: '⚡',
                  },
                  {
                    name: 'Fresh Coconut Water',
                    ml: 350,
                    badge: 'Potassium Rich',
                    desc: 'Natural isotonic elixir packed with magnesium and potassium',
                    icon: '🥥',
                  },
                  {
                    name: 'Lemon Salt Water (Nimbu Pani)',
                    ml: 350,
                    badge: 'Traditional',
                    desc: 'Himalayan pink salt + lemon juice to replenish lost minerals',
                    icon: '🍋',
                  },
                  {
                    name: 'Mineral Water + Salt Pinch',
                    ml: 300,
                    badge: 'Instant Fix',
                    desc: 'Fastest home remedy to restore plasma osmolality',
                    icon: '🧂',
                  },
                ].map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => handleLogElectrolyte(item.ml, item.name)}
                    className="p-3.5 rounded-2xl glass-card-inner hover:border-emerald-400/60 transition cursor-pointer text-left flex flex-col justify-between group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{item.icon}</span>
                        <div>
                          <h4 className="text-xs font-bold text-white group-hover:text-emerald-300 transition">
                            {item.name}
                          </h4>
                          <span className="text-[10px] text-emerald-400 font-mono">
                            {item.ml} ml (+{Math.round(item.ml * 1.2)}ml Net)
                          </span>
                        </div>
                      </div>

                      <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {item.badge}
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-400 leading-normal">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-800">
            <button
              onClick={onClose}
              className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
