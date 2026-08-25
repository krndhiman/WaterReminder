import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Activity, Check, Info, Droplet } from 'lucide-react';
import { useWater } from '../context/WaterContext';
import { URINE_COLOR_SCALE } from '../types/biofeedback';

interface UrineColorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UrineColorModal: React.FC<UrineColorModalProps> = ({ isOpen, onClose }) => {
  const { addWater } = useWater();
  const [selectedLevel, setSelectedLevel] = useState<number>(2);
  const [hasLogged, setHasLogged] = useState<boolean>(false);

  const currentLevelInfo = URINE_COLOR_SCALE.find((u) => u.level === selectedLevel) || URINE_COLOR_SCALE[1];

  const handleApply = () => {
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
                <Activity className="w-5 h-5 text-[#ff9f0a]" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Urine Hydration Biofeedback
                </h3>
                <p className="text-xs text-neutral-400">
                  Armstrong clinical scale physiological marker
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
            {/* Scientific Info Banner */}
            <div className="p-3.5 rounded-2xl apple-card space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#0a84ff]">
                <Info className="w-4 h-4" />
                <span>True Cellular Hydration Biomarker</span>
              </div>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                Urine shade directly mirrors kidney solute filtration and systemic plasma osmolality. Optimal hydration is <strong>Pale Straw (Levels 2–3)</strong>.
              </p>
            </div>

            {/* Interactive 8-Level Urine Swatch Palette */}
            <div>
              <label className="text-[10px] uppercase font-semibold text-neutral-400 block mb-2">
                Tap Current Urine Shade
              </label>

              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {URINE_COLOR_SCALE.map((u) => {
                  const isSelected = selectedLevel === u.level;

                  return (
                    <button
                      key={u.level}
                      type="button"
                      onClick={() => setSelectedLevel(u.level)}
                      className={`relative flex flex-col items-center p-2 rounded-2xl border transition cursor-pointer ${
                        isSelected
                          ? 'border-[#0a84ff] bg-[#0a84ff]/10 scale-105 shadow-sm'
                          : 'border-white/[0.06] bg-black/30 hover:border-white/[0.2]'
                      }`}
                    >
                      <div
                        className="w-7 h-9 rounded-full border border-white/20 shadow-inner flex items-center justify-center"
                        style={{ backgroundColor: u.hex }}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 text-black stroke-[3]" />}
                      </div>

                      <span className="text-[10px] font-mono text-neutral-400 mt-1 font-semibold">
                        #{u.level}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Level Clinical Analysis Card */}
            <div className="p-4 rounded-2xl apple-card space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                    style={{ backgroundColor: currentLevelInfo.hex }}
                  />
                  <h4 className="text-xs sm:text-sm font-semibold text-white">
                    Level {currentLevelInfo.level}: {currentLevelInfo.name}
                  </h4>
                </div>

                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-black/40 text-neutral-300 border border-white/[0.08] font-mono uppercase">
                  {currentLevelInfo.hydrationStatus.replace('_', ' ')}
                </span>
              </div>

              <p className="text-xs text-neutral-300 leading-relaxed">
                {currentLevelInfo.description}
              </p>

              {/* Action Recommendation */}
              <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] space-y-0.5">
                <span className="text-[10px] font-semibold text-[#0a84ff] uppercase tracking-wider block">
                  Recommendation:
                </span>
                <p className="text-xs text-white font-medium">
                  {currentLevelInfo.actionRecommendation}
                </p>
              </div>

              {/* Goal Offset Indicator */}
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-neutral-400">Biological Target Compensation:</span>
                <span
                  className={`font-mono font-semibold ${
                    currentLevelInfo.goalAdjustmentMl > 0
                      ? 'text-[#ff9f0a]'
                      : 'text-[#30d158]'
                  }`}
                >
                  {currentLevelInfo.goalAdjustmentMl > 0
                    ? `+${currentLevelInfo.goalAdjustmentMl} ml needed`
                    : 'Optimal (0 ml adjustment)'}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-2 border-t border-white/[0.08] flex justify-end">
            <button
              onClick={handleApply}
              className="px-5 py-2.5 rounded-xl apple-btn-primary text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 shadow"
            >
              {hasLogged ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Biofeedback Logged!</span>
                </>
              ) : (
                <>
                  <Droplet className="w-3.5 h-3.5 fill-current" />
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
