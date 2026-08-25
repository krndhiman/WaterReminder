import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Watch } from 'lucide-react';
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
          className="relative w-full max-w-sm rounded-3xl apple-glass-modal p-5 sm:p-6 z-10 overflow-hidden text-center space-y-4"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.08]">
            <div className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-2xl bg-[#1c1c1e] border border-white/[0.08] flex items-center justify-center text-lg">
                <Watch className="w-5 h-5 text-[#0a84ff]" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Apple Watch Complication
                </h3>
                <p className="text-xs text-neutral-400">1-Tap wearable logging</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-neutral-400 hover:text-white bg-white/[0.08] transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Smartwatch Bezel Display */}
          <div className="relative w-52 h-52 mx-auto rounded-full bg-black border-2 border-white/[0.12] shadow-xl p-4 flex flex-col items-center justify-between">
            {/* Top Watch Label */}
            <div className="text-[10px] font-mono text-neutral-400 tracking-wider pt-1">
              AQUAFLOW · WATCH
            </div>

            {/* Central Dial & Percentage */}
            <div className="flex flex-col items-center justify-center my-auto">
              <span className="text-3xl font-bold text-white tracking-tight">
                {percentage}%
              </span>
              <span className="text-[11px] font-mono text-[#0a84ff]">
                {todayRecord.netTotal || todayRecord.total} / {todayRecord.goal} ml
              </span>
            </div>

            {/* Direct Complication Taps */}
            <div className="grid grid-cols-3 gap-1.5 w-full pb-1">
              <button
                onClick={() => handleQuickWatchTap(300, 'water', '300ml Water Glass')}
                className="py-1.5 bg-[#1c1c1e] hover:bg-[#2c2c2e] border border-white/[0.08] rounded-xl text-[10px] font-semibold text-white transition cursor-pointer"
              >
                +300ml
              </button>
              <button
                onClick={() => handleQuickWatchTap(500, 'electrolyte', '500ml Electrolytes')}
                className="py-1.5 bg-[#1c1c1e] hover:bg-[#2c2c2e] border border-white/[0.08] rounded-xl text-[10px] font-semibold text-[#30d158] transition cursor-pointer"
              >
                +500ml
              </button>
              <button
                onClick={() => handleQuickWatchTap(200, 'coffee', '200ml Coffee')}
                className="py-1.5 bg-[#1c1c1e] hover:bg-[#2c2c2e] border border-white/[0.08] rounded-xl text-[10px] font-semibold text-[#ff9f0a] transition cursor-pointer"
              >
                ☕ 200ml
              </button>
            </div>
          </div>

          <p className="text-[11px] text-neutral-400">
            Designed for Apple Watch Ultra, Series 10, and Wear OS complication tiles.
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
