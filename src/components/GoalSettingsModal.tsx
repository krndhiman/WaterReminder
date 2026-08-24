import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Target, Calculator, Check, Sparkles, Droplet } from 'lucide-react';
import { useWater } from '../context/WaterContext';

interface GoalSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoalSettingsModal: React.FC<GoalSettingsModalProps> = ({ isOpen, onClose }) => {
  const { profile, updateProfile, updateDailyGoal } = useWater();
  const [goalInput, setGoalInput] = useState<number>(profile.dailyGoal || 4000);
  const [activeTab, setActiveTab] = useState<'manual' | 'calculator'>('manual');

  // Calculator inputs
  const [weightKg, setWeightKg] = useState<number>(profile.weightKg || 70);
  const [activity, setActivity] = useState<'sedentary' | 'moderate' | 'active' | 'athlete'>(
    profile.activityLevel || 'moderate'
  );
  const [climate, setClimate] = useState<'temperate' | 'tropical' | 'hot_dry'>(
    profile.climate || 'temperate'
  );

  // Scientific baseline calculation: 35ml per kg bodyweight + activity bonus + climate bonus
  const calculateRecommendedIntake = () => {
    let base = weightKg * 35;
    if (activity === 'moderate') base += 500;
    if (activity === 'active') base += 1000;
    if (activity === 'athlete') base += 1500;

    if (climate === 'tropical') base += 400;
    if (climate === 'hot_dry') base += 750;

    return Math.round(base / 50) * 50; // Round to nearest 50ml
  };

  const calculatedValue = calculateRecommendedIntake();

  const handleApplyGoal = (val: number) => {
    updateDailyGoal(val);
    updateProfile({
      weightKg,
      activityLevel: activity,
      climate,
    });
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
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-lg rounded-3xl glass-panel-glow p-6 z-10 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-700/50">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white font-heading">Daily Water Goal</h3>
                <p className="text-xs text-slate-400">Default 4,000 ml or personalized recommendation</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex p-1 bg-slate-900/80 rounded-2xl border border-slate-800 my-4">
            <button
              onClick={() => setActiveTab('manual')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'manual'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              Set Custom Goal
            </button>

            <button
              onClick={() => setActiveTab('calculator')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'calculator'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              Hydration Calculator
            </button>
          </div>

          {/* Tab 1: Manual Goal Setter */}
          {activeTab === 'manual' ? (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-cyan-500/30 flex flex-col items-center justify-center">
                <span className="text-xs text-cyan-300 font-semibold uppercase tracking-wider mb-2">Target Volume</span>
                <div className="flex items-baseline gap-2">
                  <input
                    type="number"
                    min="1000"
                    max="10000"
                    step="100"
                    value={goalInput}
                    onChange={(e) => setGoalInput(Number(e.target.value))}
                    className="w-36 text-center text-4xl font-black font-heading text-white bg-transparent border-b-2 border-cyan-400 focus:outline-none"
                  />
                  <span className="text-sm font-bold text-slate-400">ml / day</span>
                </div>
                <span className="text-xs text-cyan-300/80 mt-1 font-mono">
                  ({(goalInput / 1000).toFixed(1)} Litres)
                </span>
              </div>

              {/* Goal Presets */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Common Daily Goals:</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: '3.0 L', ml: 3000 },
                    { label: '3.5 L', ml: 3500 },
                    { label: '4.0 L (Default)', ml: 4000 },
                    { label: '4.5 L', ml: 4500 },
                    { label: '5.0 L (Athlete)', ml: 5000 },
                    { label: '6.0 L', ml: 6000 },
                  ].map((g) => (
                    <button
                      key={g.ml}
                      type="button"
                      onClick={() => setGoalInput(g.ml)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                        goalInput === g.ml
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleApplyGoal(goalInput)}
                  className="w-full py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition shadow-lg cursor-pointer flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Save Goal ({goalInput} ml)
                </button>
              </div>
            </div>
          ) : (
            /* Tab 2: Smart Calculator */
            <div className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                {/* Weight Input */}
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Body Weight (kg)</label>
                  <input
                    type="number"
                    min="30"
                    max="200"
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                {/* Climate */}
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Climate</label>
                  <select
                    value={climate}
                    onChange={(e) => setClimate(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="temperate">Temperate / Mild</option>
                    <option value="tropical">Hot / Tropical (+400ml)</option>
                    <option value="hot_dry">Hot & Dry (+750ml)</option>
                  </select>
                </div>
              </div>

              {/* Activity Level */}
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Daily Physical Activity</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'sedentary', label: 'Sedentary (Desk job)' },
                    { id: 'moderate', label: 'Moderate (Walks/Light gym)' },
                    { id: 'active', label: 'Active (Daily Workout)' },
                    { id: 'athlete', label: 'Intense (Athlete / Heavy)' },
                  ].map((act) => (
                    <button
                      key={act.id}
                      type="button"
                      onClick={() => setActivity(act.id as any)}
                      className={`p-2.5 rounded-xl border text-left text-xs transition cursor-pointer ${
                        activity === act.id
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 font-semibold'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {act.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Calculated Result Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/80 to-blue-950/80 border border-cyan-500/40 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 block">
                    Recommended Daily Target
                  </span>
                  <span className="text-2xl font-black font-heading text-white">
                    {calculatedValue.toLocaleString()} ml
                  </span>
                  <span className="text-xs text-slate-400 block">
                    ({(calculatedValue / 1000).toFixed(1)} Litres/day)
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleApplyGoal(calculatedValue)}
                  className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs transition cursor-pointer shadow-md"
                >
                  Apply Target
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
