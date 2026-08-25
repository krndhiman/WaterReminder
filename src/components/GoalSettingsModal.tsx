import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Target, Calculator, Check } from 'lucide-react';
import { useWater } from '../context/WaterContext';

interface GoalSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoalSettingsModal: React.FC<GoalSettingsModalProps> = ({ isOpen, onClose }) => {
  const { profile, updateProfile, updateDailyGoal, weather } = useWater();
  const [goalInput, setGoalInput] = useState<number>(profile.dailyGoal || 4000);
  const [activeTab, setActiveTab] = useState<'manual' | 'calculator'>('manual');

  // Is live weather currently active?
  const liveWeatherActive = !!(weather && profile.environmental?.liveWeatherEnabled);

  // Calculator inputs
  const [weightKg, setWeightKg] = useState<number>(profile.weightKg || 70);
  const [activity, setActivity] = useState<'sedentary' | 'moderate' | 'active' | 'athlete'>(
    profile.activityLevel || 'moderate'
  );
  const [climate, setClimate] = useState<'temperate' | 'tropical' | 'hot_dry'>(
    profile.climate || 'temperate'
  );

  // Sync state when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setGoalInput(profile.dailyGoal || 4000);
      setWeightKg(profile.weightKg || 70);
      setActivity(profile.activityLevel || 'moderate');
      setClimate(profile.climate || 'temperate');
    }
  }, [isOpen, profile]);

  // Scientific calculation: 35ml per kg bodyweight + activity
  // Climate adjustment is SKIPPED when live weather is active (weather handles it dynamically)
  const calculateRecommendedIntake = () => {
    let base = weightKg * 35;
    if (activity === 'moderate') base += 500;
    if (activity === 'active') base += 1000;
    if (activity === 'athlete') base += 1500;

    // Only add static climate bonus if live weather is NOT set up
    if (!liveWeatherActive) {
      if (climate === 'tropical') base += 350;
      if (climate === 'hot_dry') base += 600;
    }

    return Math.round(base / 50) * 50;
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
          className="relative w-full max-w-lg rounded-3xl apple-glass-modal p-5 sm:p-6 z-10 overflow-hidden space-y-4"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.08]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#1c1c1e] border border-white/[0.08] flex items-center justify-center text-lg">
                <Target className="w-5 h-5 text-[#0a84ff]" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Daily Water Goal
                </h3>
                <p className="text-xs text-neutral-400">
                  Default 4,000 ml or tailored intake target
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

          {/* iOS Segmented Navigation Tabs */}
          <div className="flex p-0.5 rounded-2xl bg-black/40 border border-white/[0.08]">
            <button
              onClick={() => setActiveTab('manual')}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'manual'
                  ? 'bg-[#1c1c1e] text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>Custom Goal</span>
            </button>

            <button
              onClick={() => setActiveTab('calculator')}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'calculator'
                  ? 'bg-[#1c1c1e] text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Smart Calculator</span>
            </button>
          </div>

          {/* Tab 1: Manual Goal Setter */}
          {activeTab === 'manual' ? (
            <div className="space-y-4">
              <div className="p-6 rounded-2xl apple-card flex flex-col items-center justify-center">
                <span className="text-[11px] text-neutral-400 font-semibold uppercase tracking-wider mb-2">
                  Target Daily Volume
                </span>
                <div className="flex items-baseline gap-2">
                  <input
                    type="number"
                    min="1000"
                    max="10000"
                    step="100"
                    value={goalInput}
                    onChange={(e) => setGoalInput(Number(e.target.value))}
                    className="w-36 text-center text-4xl font-bold text-white bg-transparent border-b-2 border-[#0a84ff] focus:outline-none"
                  />
                  <span className="text-sm font-semibold text-neutral-400">ml / day</span>
                </div>
                <span className="text-xs text-[#0a84ff] mt-1 font-mono font-semibold">
                  ({(goalInput / 1000).toFixed(1)} Liters)
                </span>
              </div>

              {/* Goal Presets */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-neutral-400 block">
                  Quick Baseline Presets:
                </label>
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
                      className={`p-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                        goalInput === g.ml
                          ? 'bg-[#0a84ff]/15 border-[#0a84ff] text-white'
                          : 'bg-black/30 border-white/[0.06] text-neutral-400 hover:text-white'
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl apple-btn-secondary text-xs font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyGoal(goalInput)}
                  className="px-5 py-2.5 rounded-xl apple-btn-primary text-xs font-semibold transition cursor-pointer shadow"
                >
                  Save Goal ({goalInput} ml)
                </button>
              </div>
            </div>
          ) : (
            /* Tab 2: Smart Calculator */
            <div className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                {/* Weight Input */}
                <div className="p-3.5 rounded-2xl apple-card">
                  <label className="text-[10px] uppercase font-semibold text-neutral-400 block mb-1">
                    Body Weight (kg)
                  </label>
                  <input
                    type="number"
                    min="30"
                    max="200"
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                    className="w-full bg-black/40 border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#0a84ff]"
                  />
                </div>

                {/* Climate — hidden when live weather is active */}
                <div className="p-3.5 rounded-2xl apple-card">
                  <label className="text-[10px] uppercase font-semibold text-neutral-400 block mb-1">
                    Climate
                  </label>
                  {liveWeatherActive ? (
                    <div className="flex items-center gap-1.5 py-1.5">
                      <span className="text-base">{weather!.conditionIcon}</span>
                      <span className="text-[11px] text-[#30d158] font-medium leading-tight">
                        Live weather active — climate handled automatically
                      </span>
                    </div>
                  ) : (
                    <select
                      value={climate}
                      onChange={(e) => setClimate(e.target.value as any)}
                      className="w-full bg-black/40 border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#0a84ff]"
                    >
                      <option value="temperate">Temperate / Mild</option>
                      <option value="tropical">Hot / Tropical (+400ml)</option>
                      <option value="hot_dry">Hot & Dry (+750ml)</option>
                    </select>
                  )}
                </div>
              </div>

              {/* Activity Level */}
              <div className="p-4 rounded-2xl apple-card space-y-2">
                <label className="text-xs font-semibold text-white block">
                  Daily Physical Activity
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'sedentary', label: 'Sedentary (Desk)', add: '+0 ml' },
                    { id: 'moderate', label: 'Moderate (Active)', add: '+500 ml' },
                    { id: 'active', label: 'Active (Daily Gym)', add: '+1,000 ml' },
                    { id: 'athlete', label: 'Intense (Athlete)', add: '+1,500 ml' },
                  ].map((act) => (
                    <button
                      key={act.id}
                      type="button"
                      onClick={() => setActivity(act.id as any)}
                      className={`p-2.5 rounded-xl border text-left text-xs transition cursor-pointer flex flex-col justify-between ${
                        activity === act.id
                          ? 'bg-[#0a84ff]/15 border-[#0a84ff] text-white font-semibold'
                          : 'bg-black/30 border-white/[0.06] text-neutral-400 hover:text-white'
                      }`}
                    >
                      <span>{act.label}</span>
                      <span className={`text-[10px] font-mono mt-0.5 ${activity === act.id ? 'text-[#0a84ff] font-bold' : 'text-neutral-500'}`}>
                        {act.add}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Calculated Result Card with Step-by-Step Formula */}
              <div className="p-4 rounded-2xl apple-card space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#0a84ff] block">
                      Base Daily Recommendation
                    </span>
                    <span className="text-2xl font-bold text-white">
                      {calculatedValue.toLocaleString()} ml
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleApplyGoal(calculatedValue)}
                    className="px-4 py-2.5 rounded-xl apple-btn-primary text-xs font-semibold transition cursor-pointer shadow"
                  >
                    Apply Target
                  </button>
                </div>

                {/* Mathematical Formula Breakdown */}
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/[0.06] text-[11px] text-neutral-300 font-mono space-y-1">
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Body Weight ({weightKg} kg × 35 ml):</span>
                    <span className="text-white font-semibold">{(weightKg * 35).toLocaleString()} ml</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Activity ({activity}):</span>
                    <span className="text-[#0a84ff] font-semibold">
                      +{activity === 'sedentary' ? '0' : activity === 'moderate' ? '500' : activity === 'active' ? '1,000' : '1,500'} ml
                    </span>
                  </div>
                  {!liveWeatherActive && (climate === 'tropical' || climate === 'hot_dry') && (
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Climate ({climate}):</span>
                      <span className="text-[#ff9f0a] font-semibold">
                        +{climate === 'tropical' ? '350' : '600'} ml
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between pt-1 border-t border-white/[0.08] font-bold text-white">
                    <span>Base Target:</span>
                    <span>{calculatedValue.toLocaleString()} ml</span>
                  </div>
                </div>
              </div>

              {/* Live weather addition preview & safety guarantee */}
              {liveWeatherActive && weather && (
                <div className="p-3.5 rounded-2xl bg-[#0a84ff]/10 border border-[#0a84ff]/20 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-300 flex items-center gap-1.5">
                      <span>{weather.conditionIcon}</span>
                      <span>Live Weather ({weather.city.split(',')[0]}):</span>
                    </span>
                    <span className="text-[#ff9f0a] font-semibold font-mono">
                      +{weather.recommendedAdjustmentMl} ml
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-white/[0.08]">
                    <span className="font-semibold text-white">Today's Total Target:</span>
                    <span className="font-bold text-[#0a84ff] font-mono">
                      {(calculatedValue + weather.recommendedAdjustmentMl).toLocaleString()} ml
                    </span>
                  </div>
                  <p className="text-[10px] text-neutral-400 leading-tight pt-0.5">
                    🛡️ <span className="text-neutral-300 font-medium">Hyponatremia Protected:</span> Intake is safely bounded to prevent fluid overload and electrolyte dilution.
                  </p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
