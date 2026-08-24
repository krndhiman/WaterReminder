import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sun, Wind, Dumbbell, Mountain, Check, Sparkles, Thermometer, CloudSun, MapPin } from 'lucide-react';
import { useWater } from '../context/WaterContext';

interface EnvironmentalPacerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenWeather?: () => void;
}

export const EnvironmentalPacerModal: React.FC<EnvironmentalPacerModalProps> = ({
  isOpen,
  onClose,
  onOpenWeather,
}) => {
  const { profile, updateEnvironmental, calculatedDynamicGoal, weather } = useWater();
  const env = profile.environmental;

  const workoutAdditional = Math.round((env.workoutMinutes / 30) * 350);
  const climateAdditional =
    env.liveWeatherEnabled && weather
      ? weather.recommendedAdjustmentMl
      : env.climate === 'tropical'
      ? 400
      : env.climate === 'dry_heat'
      ? 750
      : 0;

  const acAdditional = env.acOffice ? 200 : 0;
  const altitudeAdditional = env.altitudeHigh ? 300 : 0;
  const totalExtra = workoutAdditional + climateAdditional + acAdditional + altitudeAdditional;

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
          className="relative w-full max-w-lg rounded-3xl glass-surface-glow p-6 z-10 overflow-hidden border border-amber-500/30 max-h-[92vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-300">
                <Thermometer className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white font-heading">
                  Environmental & Sweat Pacer
                </h3>
                <p className="text-xs text-slate-400">
                  Live meteorological climate & perspiration compensation
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

          {/* Form controls */}
          <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
            {/* Dynamic Goal Calculation Breakdown Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/50 via-slate-900 to-cyan-950/50 border border-amber-500/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">Base Target:</span>
                <span className="text-xs font-mono font-bold text-white">{profile.dailyGoal} ml</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Environmental Adjustments:</span>
                <span className="font-mono font-bold text-amber-300">+{totalExtra} ml</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                  Total Dynamic Daily Target:
                </span>
                <span className="text-2xl font-black font-heading text-white text-glow-cyan">
                  {calculatedDynamicGoal.toLocaleString()} ml
                </span>
              </div>
            </div>

            {/* Live City Weather Integration Box */}
            <div className="p-4 rounded-2xl bg-sky-950/50 border border-sky-500/40 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CloudSun className="w-4 h-4 text-sky-400" />
                  <span className="text-xs font-bold text-white">Live City Weather Sync</span>
                </div>

                {onOpenWeather && (
                  <button
                    onClick={onOpenWeather}
                    className="text-[11px] text-sky-300 hover:underline font-semibold cursor-pointer"
                  >
                    Change City
                  </button>
                )}
              </div>

              {weather ? (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                  <div>
                    <span className="font-bold text-white flex items-center gap-1">
                      <span>{weather.conditionIcon}</span>
                      <span>{weather.city}</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {weather.temperature}°C ({weather.apparentTemperature}°C feels like) · {weather.humidity}% humidity
                    </span>
                  </div>
                  <span className="font-mono font-bold text-sky-300 text-sm">
                    +{weather.recommendedAdjustmentMl} ml
                  </span>
                </div>
              ) : (
                <div className="text-xs text-slate-400">
                  No city configured yet. Click "Change City" to search or auto-detect GPS location.
                </div>
              )}
            </div>

            {/* 1. Workout & Sweat Loss Slider */}
            <div className="p-4 rounded-2xl glass-card-inner space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Dumbbell className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white">Workout & Physical Activity</span>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-300">
                  {env.workoutMinutes} mins (+{workoutAdditional} ml)
                </span>
              </div>

              <input
                type="range"
                min="0"
                max="120"
                step="15"
                value={env.workoutMinutes}
                onChange={(e) => updateEnvironmental({ workoutMinutes: Number(e.target.value) })}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>0 mins</span>
                <span>30 mins (+350ml)</span>
                <span>60 mins (+700ml)</span>
                <span>120 mins (+1400ml)</span>
              </div>
            </div>

            {/* 2. Microclimates: AC Office & Altitude */}
            <div className="space-y-2">
              {/* AC Office */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl glass-card-inner">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-300">
                    <Wind className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Dry Air-Conditioned Office</h4>
                    <p className="text-[11px] text-slate-400">Compensates +200ml for dry air respiratory loss</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => updateEnvironmental({ acOffice: !env.acOffice })}
                  className={`w-12 h-6 rounded-full transition relative cursor-pointer ${
                    env.acOffice ? 'bg-cyan-500' : 'bg-slate-800'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${
                      env.acOffice ? 'left-7' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              {/* High Altitude */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl glass-card-inner">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-purple-500/15 text-purple-300">
                    <Mountain className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">High Altitude Elevation (&gt;2,000m)</h4>
                    <p className="text-[11px] text-slate-400">Compensates +300ml for elevated respiration</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => updateEnvironmental({ altitudeHigh: !env.altitudeHigh })}
                  className={`w-12 h-6 rounded-full transition relative cursor-pointer ${
                    env.altitudeHigh ? 'bg-cyan-500' : 'bg-slate-800'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${
                      env.altitudeHigh ? 'left-7' : 'left-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-800">
            <button
              onClick={onClose}
              className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition cursor-pointer"
            >
              Apply Dynamic Target ({calculatedDynamicGoal} ml)
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
