import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Trophy, Sparkles, X, Flame, CheckCircle2, Heart } from 'lucide-react';
import { useWater } from '../context/WaterContext';

export const CelebrationModal: React.FC = () => {
  const { isCelebrationOpen, closeCelebration, todayRecord, streakInfo } = useWater();

  useEffect(() => {
    if (isCelebrationOpen) {
      // Fire confetti bursts from both sides
      const end = Date.now() + 2.5 * 1000;
      const colors = ['#38bdf8', '#34d399', '#f59e0b', '#818cf8', '#ffffff'];

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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeCelebration}
          className="absolute inset-0 bg-slate-950/85 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.7, opacity: 0, y: 40 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="relative w-full max-w-md rounded-3xl glass-panel-glow p-7 z-10 text-center overflow-hidden border-2 border-emerald-400/50 shadow-[0_0_60px_rgba(52,211,153,0.3)]"
        >
          {/* Close button */}
          <button
            onClick={closeCelebration}
            className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Trophy Icon with Floating Glow */}
          <div className="relative inline-block mb-3">
            <motion.div
              animate={{ rotate: [0, -8, 8, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="p-5 rounded-3xl bg-gradient-to-tr from-amber-400 via-emerald-400 to-cyan-400 text-slate-950 shadow-xl shadow-emerald-500/30"
            >
              <Trophy className="w-12 h-12" />
            </motion.div>
            <Sparkles className="w-6 h-6 text-yellow-300 absolute -top-2 -right-2 animate-bounce" />
          </div>

          <h3 className="text-2xl font-black text-white font-heading tracking-tight">
            Daily Goal Crushed! 🎉
          </h3>
          <p className="text-sm text-cyan-200 mt-1">
            You completed your full <strong className="text-white">{todayRecord.goal} ml (4 Litres)</strong> hydration target!
          </p>

          {/* Streak & Stats Box */}
          <div className="my-5 p-4 rounded-2xl bg-slate-900/90 border border-emerald-500/30 flex items-center justify-around">
            <div className="text-center">
              <span className="text-[11px] font-bold text-slate-400 block uppercase">Total Drank</span>
              <span className="text-xl font-black text-cyan-300 font-mono">
                {todayRecord.total} ml
              </span>
            </div>

            <div className="w-px h-8 bg-slate-800" />

            <div className="text-center">
              <span className="text-[11px] font-bold text-slate-400 block uppercase flex items-center justify-center gap-1">
                <Flame className="w-3 h-3 text-amber-400 fill-amber-400" /> Streak
              </span>
              <span className="text-xl font-black text-amber-400 font-heading">
                {streakInfo.currentStreak} Days
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-300 italic mb-5">
            "Optimal hydration boosts energy, sharpens focus, and accelerates recovery!"
          </p>

          <button
            onClick={closeCelebration}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 font-extrabold text-sm transition shadow-lg shadow-emerald-500/25 cursor-pointer"
          >
            Keep It Up! 💧
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
