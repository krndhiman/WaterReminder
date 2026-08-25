import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Dumbbell,
  Play,
  Pause,
  RotateCcw,
  Info,
} from 'lucide-react';
import { useWater } from '../context/WaterContext';

interface WorkoutHydrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WorkoutHydrationModal: React.FC<WorkoutHydrationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { addWater, updateEnvironmental, profile } = useWater();

  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [intraSipsLogged, setIntraSipsLogged] = useState(0);

  useEffect(() => {
    let interval: any = null;
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatStopwatch = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handlePreWorkoutPrime = () => {
    addWater(350, 'water', 'Pre-Workout Priming', 'flask');
  };

  const handleIntraSip = () => {
    addWater(200, 'electrolyte', 'Intra-Workout Micro-Sip', 'flask');
    setIntraSipsLogged((prev) => prev + 1);
  };

  const handlePostWorkoutFinish = () => {
    const workoutMins = Math.max(15, Math.round(seconds / 60));
    updateEnvironmental({ workoutMinutes: (profile.environmental.workoutMinutes || 0) + workoutMins });
    addWater(500, 'electrolyte', 'Post-Workout Recovery & Electrolytes', 'flask');
    setIsRunning(false);
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
                <Dumbbell className="w-5 h-5 text-[#30d158]" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Workout Hydration Timing
                </h3>
                <p className="text-xs text-neutral-400">
                  Pre, intra, and post-exercise pacing
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
            {/* Scientific Timing Explanation */}
            <div className="p-3.5 rounded-2xl apple-card space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#0a84ff]">
                <Info className="w-4 h-4" />
                <span>Hydration Timing Rationale</span>
              </div>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                During 30 minutes of training, your body sweats out <strong>0.5 to 1.0 Liters</strong>. Micro-sips during workouts preserve muscle power and cognitive focus.
              </p>
            </div>

            {/* Live Workout Timer & Stopwatch */}
            <div className="flex flex-col items-center justify-center p-5 rounded-2xl apple-card text-center space-y-2.5">
              <span className="text-[10px] uppercase font-semibold text-neutral-400">
                Live Workout Duration
              </span>

              <div className="text-4xl sm:text-5xl font-mono font-bold text-white tracking-widest">
                {formatStopwatch(seconds)}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsRunning(!isRunning)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                    isRunning
                      ? 'bg-[#ff9f0a] text-black'
                      : 'apple-btn-primary'
                  }`}
                >
                  {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isRunning ? 'Pause Workout' : 'Start Workout'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsRunning(false);
                    setSeconds(0);
                  }}
                  className="p-2 rounded-xl apple-card text-neutral-400 hover:text-white transition cursor-pointer"
                  title="Reset Timer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 3-Phase Action Step Cards */}
            <div className="space-y-2">
              {/* Phase 1: Pre-Workout Priming */}
              <div className="p-3.5 rounded-2xl apple-card flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-base">💧</span>
                  <div>
                    <h4 className="text-xs font-semibold text-white">1. Pre-Workout Priming</h4>
                    <p className="text-[11px] text-neutral-400">Pre-hydrate with 350ml before starting</p>
                  </div>
                </div>

                <button
                  onClick={handlePreWorkoutPrime}
                  className="px-3 py-1.5 rounded-xl apple-btn-secondary text-xs font-semibold transition cursor-pointer"
                >
                  +350ml
                </button>
              </div>

              {/* Phase 2: Intra-Workout Micro-Sip */}
              <div className="p-3.5 rounded-2xl apple-card flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-base">⚡</span>
                  <div>
                    <h4 className="text-xs font-semibold text-white">2. Intra-Workout Micro-Sips</h4>
                    <p className="text-[11px] text-neutral-400">
                      150–200ml sips ({intraSipsLogged} logged)
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleIntraSip}
                  className="px-3 py-1.5 rounded-xl apple-btn-secondary text-xs font-semibold transition cursor-pointer"
                >
                  +200ml Sip
                </button>
              </div>

              {/* Phase 3: Post-Workout Recovery */}
              <div className="p-3.5 rounded-2xl apple-card flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-base">🏆</span>
                  <div>
                    <h4 className="text-xs font-semibold text-white">3. Post-Workout Electrolytes</h4>
                    <p className="text-[11px] text-neutral-400">Replenish +500ml minerals and finish</p>
                  </div>
                </div>

                <button
                  onClick={handlePostWorkoutFinish}
                  className="px-3.5 py-1.5 rounded-xl apple-btn-primary text-xs font-semibold transition cursor-pointer shadow"
                >
                  Finish & Log
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-2 border-t border-white/[0.08] flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl apple-btn-secondary text-xs font-semibold transition cursor-pointer"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
