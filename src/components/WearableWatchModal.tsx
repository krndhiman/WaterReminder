import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Watch, Droplet, Zap, Coffee, Sparkles, Check } from 'lucide-react';
import { useWater } from '../context/WaterContext';

interface WearableWatchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WearableWatchModal: React.FC<WearableWatchModalProps> = ({ isOpen, onClose }) => {
  const { todayRecord, addWater } = useWater();
  const percentage = Math.min(100, Math.round(((todayRecord.netTotal || todayRecord.total) / todayRecord.goal) * 100));

  const handleQuickWatchTap = (amount: number, type: any = 'water', name: string) => {
    addWater(amount, type, name);
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
          className="relative w-full max-w-sm rounded-3xl glass-surface-glow p-6 z-10 overflow-hidden border border-cyan-500/40 text-center space-y-4"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2 text-left">
              <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300">
                <Watch className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white font-heading">
                  Smartwatch Mini-HUD
                </h3>
                <p className="text-xs text-slate-400">Direct-tap wearable complication</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Smartwatch Bezel Display */}
          <div className="relative w-56 h-56 mx-auto rounded-full bg-black border-4 border-slate-700 shadow-[0_0_40px_rgba(6,182,212,0.3)] p-4 flex flex-col items-center justify-between">
            {/* Top Watch Complication Ring */}
            <div className="text-[10px] font-mono text-cyan-300 font-bold tracking-wider pt-1">
              AQUAFLOW · OLED
            </div>

            {/* Central Dial & Percentage */}
            <div className="flex flex-col items-center justify-center my-auto">
              <span className="text-3xl font-black font-heading text-white tracking-tight">
                {percentage}%
              </span>
              <span className="text-[10px] font-mono text-cyan-400">
                {todayRecord.netTotal || todayRecord.total} / {todayRecord.goal} ml
              </span>
            </div>

            {/* Direct Complication Taps */}
            <div className="grid grid-cols-3 gap-1.5 w-full pb-1">
              <button
                onClick={() => handleQuickWatchTap(250, 'water', 'Watch Tap: Glass')}
                className="py-1.5 bg-cyan-950 hover:bg-cyan-800 border border-cyan-500/40 rounded-xl text-[10px] font-bold text-cyan-200 transition cursor-pointer"
              >
                +250ml
              </button>
              <button
                onClick={() => handleQuickWatchTap(500, 'electrolyte', 'Watch Tap: ORS')}
                className="py-1.5 bg-emerald-950 hover:bg-emerald-800 border border-emerald-500/40 rounded-xl text-[10px] font-bold text-emerald-200 transition cursor-pointer"
              >
                +500ml
              </button>
              <button
                onClick={() => handleQuickWatchTap(200, 'coffee', 'Watch Tap: Coffee')}
                className="py-1.5 bg-amber-950 hover:bg-amber-800 border border-amber-500/40 rounded-xl text-[10px] font-bold text-amber-200 transition cursor-pointer"
              >
                ☕ 200ml
              </button>
            </div>
          </div>

          <p className="text-[11px] text-slate-400">
            Works standalone with zero battery drain. Designed for Apple Watch Series, Ultra & Wear OS tiles.
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
