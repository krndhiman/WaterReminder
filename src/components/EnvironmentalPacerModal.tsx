import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sun, Wind, Dumbbell, Mountain, Thermometer, CloudSun } from 'lucide-react';
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
                <Thermometer className="w-5 h-5 text-[#ff9f0a]" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Environmental & Sweat Pacer
                </h3>
                <p className="text-xs text-neutral-400">
                  Meteorological and perspiration compensation
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

          {/* Form controls */}
          <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
            {/* Dynamic Goal Breakdown Card */}
            <div className="p-4 rounded-2xl apple-card space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-400">Base Goal:</span>
                <span className="font-mono text-white font-semibold">{profile.dailyGoal} ml</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-400">Environmental Adjustments:</span>
                <span className="font-mono font-bold text-[#ff9f0a]">+{totalExtra} ml</span>
              </div>
              <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
                  Target Daily Volume:
                </span>
                <span className="text-2xl font-bold text-white">
                  {calculatedDynamicGoal.toLocaleString()} ml
                </span>
              </div>
            </div>

            {/* Live City Weather Integration Box */}
            <div className="p-4 rounded-2xl apple-card space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CloudSun className="w-4 h-4 text-[#0a84ff]" />
                  <span className="text-xs font-semibold text-white">Live Weather Compensation</span>
                </div>

                {onOpenWeather && (
                  <button
                    onClick={onOpenWeather}
                    className="text-[11px] text-[#0a84ff] hover:underline font-semibold cursor-pointer"
                  >
                    Change City
                  </button>
                )}
              </div>

              {weather ? (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/[0.06] text-xs">
                  <div>
                    <span className="font-semibold text-white flex items-center gap-1">
                      <span>{weather.conditionIcon}</span>
                      <span>{weather.city}</span>
                    </span>
                    <span className="text-[10px] text-neutral-400 font-mono">
                      {weather.temperature}°C ({weather.apparentTemperature}°C feels like) · {weather.humidity}% humidity
                    </span>
                  </div>
                  <span className="font-mono font-bold text-[#0a84ff] text-sm">
                    +{weather.recommendedAdjustmentMl} ml
                  </span>
                </div>
              ) : (
                <div className="text-xs text-neutral-400">
                  No city configured yet. Click "Change City" to search or auto-detect GPS location.
                </div>
              )}
            </div>

            {/* 1. Workout & Sweat Loss Slider */}
            <div className="p-4 rounded-2xl apple-card space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Dumbbell className="w-4 h-4 text-[#30d158]" />
                  <span className="text-xs font-semibold text-white">Workout & Physical Activity</span>
                </div>
                <span className="text-xs font-mono font-bold text-[#30d158]">
                  {env.workoutMinutes}m (+{workoutAdditional} ml)
                </span>
              </div>

              <input
                type="range"
                min="0"
                max="120"
                step="15"
                value={env.workoutMinutes}
                onChange={(e) => updateEnvironmental({ workoutMinutes: Number(e.target.value) })}
                className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-[#30d158]"
              />
              <div className="flex justify-between text-[10px] text-neutral-500">
                <span>0m</span>
                <span>30m (+350ml)</span>
                <span>60m (+700ml)</span>
                <span>120m (+1400ml)</span>
              </div>
            </div>

            {/* 2. Microclimates: AC Office & Altitude */}
            <div className="space-y-2">
              {/* AC Office */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl apple-card">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-white/[0.06] text-white">
                    <Wind className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white">Dry Air-Conditioned Office</h4>
                    <p className="text-[11px] text-neutral-400">Compensates +200ml for dry air respiratory loss</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => updateEnvironmental({ acOffice: !env.acOffice })}
                  className={`w-12 h-6 rounded-full transition relative cursor-pointer ${
                    env.acOffice ? 'bg-[#0a84ff]' : 'bg-neutral-800'
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
              <div className="flex items-center justify-between p-3.5 rounded-2xl apple-card">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-white/[0.06] text-white">
                    <Mountain className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white">High Altitude (&gt;2,000m)</h4>
                    <p className="text-[11px] text-neutral-400">Compensates +300ml for elevated respiration</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => updateEnvironmental({ altitudeHigh: !env.altitudeHigh })}
                  className={`w-12 h-6 rounded-full transition relative cursor-pointer ${
                    env.altitudeHigh ? 'bg-[#0a84ff]' : 'bg-neutral-800'
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
          <div className="pt-2 border-t border-white/[0.08] flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl apple-btn-primary text-xs font-semibold transition cursor-pointer shadow"
            >
              Apply Target ({calculatedDynamicGoal} ml)
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
