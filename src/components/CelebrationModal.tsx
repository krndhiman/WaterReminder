import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Trophy, Sparkles, X, Flame } from 'lucide-react';
import { useWater } from '../context/WaterContext';

export const CelebrationModal: React.FC = () => {
  const { isCelebrationOpen, closeCelebration, todayRecord, streakInfo } = useWater();

  useEffect(() => {
    if (isCelebrationOpen) {
      const end = Date.now() + 2.5 * 1000;
      const colors = ['#0a84ff', '#30d158', '#ff9f0a', '#ffffff'];

      const frame = () => {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.7 },
          colors,
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.7 },
          colors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [isCelebrationOpen]);

  if (!isCelebrationOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeCelebration}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md rounded-3xl apple-glass-modal p-6 sm:p-7 z-10 text-center overflow-hidden space-y-4"
        >
          {/* Close button */}
          <button
            onClick={closeCelebration}
            className="absolute top-4 right-4 p-1.5 rounded-full text-neutral-400 hover:text-white bg-white/[0.08] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Trophy Icon */}
          <div className="relative inline-block mt-2">
            <motion.div
              animate={{ rotate: [0, -6, 6, 0], scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="p-4 rounded-3xl bg-[#30d158]/15 border border-[#30d158]/30 text-[#30d158] shadow-lg"
            >
              <Trophy className="w-10 h-10" />
            </motion.div>
          </div>

          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Daily Goal Completed! 🎉
            </h3>
            <p className="text-xs text-neutral-300 mt-1">
              You achieved your full <strong className="text-white font-semibold">{todayRecord.goal} ml</strong> hydration target!
            </p>
          </div>

          {/* Streak & Stats Box */}
          <div className="p-4 rounded-2xl apple-card flex items-center justify-around">
            <div className="text-center">
              <span className="text-[10px] uppercase font-semibold text-neutral-400 block">Total Intake</span>
              <span className="text-lg font-bold text-white font-mono">
                {todayRecord.total} ml
              </span>
            </div>

            <div className="w-px h-8 bg-white/[0.08]" />

            <div className="text-center">
              <span className="text-[10px] uppercase font-semibold text-neutral-400 block flex items-center justify-center gap-1">
                <Flame className="w-3 h-3 text-[#ff9f0a] fill-[#ff9f0a]" /> Streak
              </span>
              <span className="text-lg font-bold text-[#ff9f0a]">
                {streakInfo.currentStreak} Days
              </span>
            </div>
          </div>

          <p className="text-xs text-neutral-400 italic">
            "Optimal hydration accelerates recovery, sharpens focus, and maintains daily energy."
          </p>

          <button
            onClick={closeCelebration}
            className="w-full py-3 rounded-2xl apple-btn-primary text-xs font-semibold transition cursor-pointer shadow"
          >
            Keep It Up! 💧
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
