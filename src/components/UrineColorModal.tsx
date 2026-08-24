import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Activity, Check, Info, Sparkles, AlertTriangle, ShieldCheck, Droplet } from 'lucide-react';
import { useWater } from '../context/WaterContext';
import { URINE_COLOR_SCALE, UrineColorLevel } from '../types/biofeedback';

interface UrineColorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UrineColorModal: React.FC<UrineColorModalProps> = ({ isOpen, onClose }) => {
  const { addWater, updateEnvironmental } = useWater();
  const [selectedLevel, setSelectedLevel] = useState<number>(2); // Default pale straw (optimal)
  const [hasLogged, setHasLogged] = useState<boolean>(false);

  const currentLevelInfo = URINE_COLOR_SCALE.find((u) => u.level === selectedLevel) || URINE_COLOR_SCALE[1];

  const handleApply = () => {
    // If dehydrated (level >= 4), prompt quick water/electrolyte log
    if (selectedLevel >= 4) {
      addWater(300, selectedLevel >= 5 ? 'electrolyte' : 'water', 'Biofeedback Replenishment');
    }
    setHasLogged(true);
    setTimeout(() => {
      setHasLogged(false);
      onClose();
    }, 800);
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
          className="relative w-full max-w-lg rounded-3xl glass-surface-glow p-6 z-10 overflow-hidden border border-amber-500/40 max-h-[92vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-300">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white font-heading">
                  Urine Hydration Biofeedback
                </h3>
                <p className="text-xs text-slate-400">
                  Armstrong Clinical Scale — your body's true hydration mirror
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
            {/* Scientific Explanation Banner */}
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-300">
                <Info className="w-4 h-4" />
                <span>Why Urine Biofeedback Outperforms a Fixed 4L Goal:</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Whether you are in a Kanpur heatwave sweating 1.5L/hr, sitting in deceptive AC dry air, or resting on a cool day, urine color reflects real-time kidney water-to-solute filtration. Aim for <strong>Pale Straw (Levels 2–3)</strong>!
              </p>
            </div>

            {/* Interactive 8-Level Urine Swatch Palette */}
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                Tap Your Current Urine Shade
              </label>

              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {URINE_COLOR_SCALE.map((u) => {
                  const isSelected = selectedLevel === u.level;

                  return (
                    <button
                      key={u.level}
                      type="button"
                      onClick={() => setSelectedLevel(u.level)}
                      className={`relative flex flex-col items-center p-2 rounded-2xl border transition cursor-pointer group ${
                        isSelected
                          ? 'ring-2 ring-amber-400 scale-105 border-white bg-slate-800'
                          : 'border-slate-800 bg-slate-900/80 hover:border-slate-600'
                      }`}
                    >
                      {/* Color Drop */}
                      <div
                        className="w-8 h-10 rounded-full border border-slate-700 shadow-inner flex items-center justify-center transition-transform group-hover:scale-110"
                        style={{ backgroundColor: u.hex }}
                      >
                        {isSelected && <Check className="w-4 h-4 text-slate-950 stroke-[3]" />}
                      </div>

                      <span className="text-[10px] font-mono font-bold text-slate-400 mt-1">
                        #{u.level}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Level Clinical Analysis Card */}
            <div className="p-4 rounded-3xl glass-card-inner border border-amber-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-5 h-5 rounded-full border border-slate-600 shadow-sm"
                    style={{ backgroundColor: currentLevelInfo.hex }}
                  />
                  <h4 className="text-sm font-bold text-white">
                    Level {currentLevelInfo.level}: {currentLevelInfo.name}
                  </h4>
                </div>

                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border font-mono uppercase tracking-wider ${currentLevelInfo.badgeColor}`}
                >
                  {currentLevelInfo.hydrationStatus.replace('_', ' ')}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {currentLevelInfo.description}
              </p>

              {/* Action Recommendation */}
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider block">
                  Action Recommendation:
                </span>
                <p className="text-xs font-semibold text-white">
                  {currentLevelInfo.actionRecommendation}
                </p>
              </div>

              {/* Goal Offset Indicator */}
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-400">Biological Target Compensation:</span>
                <span
                  className={`font-mono font-bold ${
                    currentLevelInfo.goalAdjustmentMl > 0
                      ? 'text-amber-300'
                      : currentLevelInfo.goalAdjustmentMl < 0
                      ? 'text-sky-300'
                      : 'text-emerald-300'
                  }`}
                >
                  {currentLevelInfo.goalAdjustmentMl > 0
                    ? `+${currentLevelInfo.goalAdjustmentMl} ml needed`
                    : currentLevelInfo.goalAdjustmentMl < 0
                    ? `${currentLevelInfo.goalAdjustmentMl} ml (reduce plain water)`
                    : 'Target is optimal (0 ml adjustment)'}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-800">
            <button
              onClick={handleApply}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
            >
              {hasLogged ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Biofeedback Logged!</span>
                </>
              ) : (
                <>
                  <Droplet className="w-4 h-4 fill-current" />
                  <span>
                    Log Level {currentLevelInfo.level} ({currentLevelInfo.hydrationStatus.replace('_', ' ')})
                  </span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
