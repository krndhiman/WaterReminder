import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Dumbbell,
  Play,
  Pause,
  RotateCcw,
  Check,
  Clock,
  Sparkles,
  Droplet,
  Zap,
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
  const [currentPhase, setCurrentPhase] = useState<'pre' | 'during' | 'post'>('during');

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
    setCurrentPhase('during');
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
                <Dumbbell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white font-heading">
                  Workout Hydration Timing Pacer
                </h3>
                <p className="text-xs text-slate-400">
                  Pre, intra, and post-exercise physiological pacing
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
            {/* Scientific Timing Explanation */}
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-emerald-300">
                <Info className="w-4 h-4" />
                <span>Why Timing Matters More Than Volume:</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                During 30 minutes of exertion, your body can sweat out <strong>0.5 to 1.0 Litre of fluid</strong>. Chugging water hours later does not protect muscle tissue during strain. Hydrate in micro-sips during exercise!
              </p>
            </div>

            {/* Live Workout Timer & Stopwatch */}
            <div className="flex flex-col items-center justify-center p-5 rounded-3xl bg-slate-950/80 border border-emerald-500/40 text-center space-y-3">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Live Workout Duration
              </span>

              <div className="text-4xl sm:text-5xl font-black font-mono text-white tracking-widest text-glow-cyan">
                {formatStopwatch(seconds)}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsRunning(!isRunning)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                    isRunning
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                  }`}
                >
                  {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{isRunning ? 'Pause Workout' : 'Start Workout Timer'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsRunning(false);
                    setSeconds(0);
                  }}
                  className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white border border-slate-800 transition cursor-pointer"
                  title="Reset Timer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 3-Phase Action Step Cards */}
            <div className="space-y-2.5">
              {/* Phase 1: Pre-Workout Priming */}
              <div className="p-3.5 rounded-2xl glass-card-inner flex items-center justify-between border border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="text-lg">💧</span>
                  <div>
                    <h4 className="text-xs font-bold text-white">1. Pre-Workout Priming (30m before)</h4>
                    <p className="text-[11px] text-slate-400">Pre-hydrate with 350ml for blood volume</p>
                  </div>
                </div>

                <button
                  onClick={handlePreWorkoutPrime}
                  className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition cursor-pointer"
                >
                  Log +350ml
                </button>
              </div>

              {/* Phase 2: Intra-Workout Micro-Sip */}
              <div className="p-3.5 rounded-2xl glass-card-inner flex items-center justify-between border border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="text-lg">⚡</span>
                  <div>
                    <h4 className="text-xs font-bold text-white">2. Intra-Workout Micro-Sips (Every 15m)</h4>
                    <p className="text-[11px] text-slate-400">
                      Take 150–200ml sips ({intraSipsLogged} logged this session)
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleIntraSip}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition cursor-pointer"
                >
                  Log +200ml Sip
                </button>
              </div>

              {/* Phase 3: Post-Workout Recovery */}
              <div className="p-3.5 rounded-2xl glass-card-inner flex items-center justify-between border border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="text-lg">🏆</span>
                  <div>
                    <h4 className="text-xs font-bold text-white">3. Post-Workout Electrolyte Recovery</h4>
                    <p className="text-[11px] text-slate-400">Rapid replenishment +500ml with electrolytes</p>
                  </div>
                </div>

                <button
                  onClick={handlePostWorkoutFinish}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition cursor-pointer"
                >
                  Finish & Log
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-800">
            <button
              onClick={onClose}
              className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs transition cursor-pointer"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
