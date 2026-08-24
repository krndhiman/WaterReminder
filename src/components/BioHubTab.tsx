import React from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  Zap,
  Thermometer,
  Dumbbell,
  Coffee,
  HeartPulse,
  ChevronRight,
  Sun,
  ShieldCheck,
  Sparkles,
  Info,
} from 'lucide-react';
import { useWater } from '../context/WaterContext';
import { URINE_COLOR_SCALE } from '../types/biofeedback';

interface BioHubTabProps {
  onOpenUrineColor: () => void;
  onOpenElectrolytes: () => void;
  onOpenWeather: () => void;
  onOpenWorkout: () => void;
  onOpenBeverages: () => void;
  onOpenClinical: () => void;
}

export const BioHubTab: React.FC<BioHubTabProps> = ({
  onOpenUrineColor,
  onOpenElectrolytes,
  onOpenWeather,
  onOpenWorkout,
  onOpenBeverages,
  onOpenClinical,
}) => {
  const { weather, profile } = useWater();
  const activeColorLevel = URINE_COLOR_SCALE[1]; // default pale straw (optimal)

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Header Description */}
      <div className="text-center sm:text-left px-1">
        <h2 className="text-xl font-black text-white font-heading tracking-tight">
          Physiological & Environmental Hub
        </h2>
        <p className="text-xs text-slate-400">
          Dynamic biological science, electrolyte management & climate fluid compensation
        </p>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* 1. Armstrong Urine Color Biofeedback Card */}
        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={onOpenUrineColor}
          className="p-4 rounded-3xl glass-surface-glow border border-amber-500/30 text-left transition cursor-pointer flex flex-col justify-between space-y-3 group shadow-md"
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-300">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white font-heading">
                  Urine Color Biofeedback
                </h3>
                <span className="text-[11px] text-amber-300 font-semibold block">
                  Armstrong 8-Level Spectrum
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-300 transition" />
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className="w-5 h-5 rounded-full border border-white/30 shadow-md"
                style={{ backgroundColor: activeColorLevel.hex }}
              />
              <div>
                <span className="text-xs font-bold text-white block">
                  {activeColorLevel.name}
                </span>
                <span className="text-[10px] text-slate-400">
                  Tap to calibrate biological goal
                </span>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
              Level {activeColorLevel.level}
            </span>
          </div>
        </motion.button>

        {/* 2. Electrolyte & Sodium/Potassium Balance Card */}
        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={onOpenElectrolytes}
          className="p-4 rounded-3xl glass-surface-glow border border-emerald-500/30 text-left transition cursor-pointer flex flex-col justify-between space-y-3 group shadow-md"
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-300">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white font-heading">
                  Electrolyte & Salt Guard
                </h3>
                <span className="text-[11px] text-emerald-300 font-semibold block">
                  Hyponatremia & Cramp Defense
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-300 transition" />
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-white block">
                Sodium & Potassium Balance
              </span>
              <span className="text-[10px] text-slate-400">
                Prevents blood dilution during high sweat
              </span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
              WHO ORS / Salt
            </span>
          </div>
        </motion.button>

        {/* 3. Live City Weather & Heat Index Offset */}
        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={onOpenWeather}
          className="p-4 rounded-3xl glass-surface border border-sky-500/30 text-left transition cursor-pointer flex flex-col justify-between space-y-3 group shadow-md"
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-sky-500/20 text-sky-300">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white font-heading">
                  Meteorological Sync
                </h3>
                <span className="text-[11px] text-sky-300 font-semibold block">
                  Live Temperature, Humidity & UV
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-sky-300 transition" />
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-white block">
                {weather ? `${weather.city.split(',')[0]} (${weather.temperature}°C)` : 'Kanpur, India (27.3°C)'}
              </span>
              <span className="text-[10px] text-slate-400">
                {weather && weather.recommendedAdjustmentMl > 0
                  ? `Heat fluid offset: +${weather.recommendedAdjustmentMl} ml/day`
                  : 'Extreme heat & dry weather dynamic math'}
              </span>
            </div>
            <span className="text-lg">
              {weather ? weather.conditionIcon : '☀️'}
            </span>
          </div>
        </motion.button>

        {/* 4. Workout Hydration 3-Phase Timing Pacer */}
        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={onOpenWorkout}
          className="p-4 rounded-3xl glass-surface border border-slate-800 text-left transition cursor-pointer flex flex-col justify-between space-y-3 group hover:border-emerald-500/40 shadow-md"
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-emerald-500/15 text-emerald-300">
                <Dumbbell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white font-heading">
                  Workout Hydration Pacer
                </h3>
                <span className="text-[11px] text-emerald-400 font-semibold block">
                  Pre, Intra & Post-Workout Timing
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-300 transition" />
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-white block">
                Active Training Stopwatch
              </span>
              <span className="text-[10px] text-slate-400">
                150-200ml micro-sips every 15-20 minutes
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold">
              3-Phase
            </span>
          </div>
        </motion.button>

        {/* 5. Universal Beverage Hydration Index (BHI) */}
        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={onOpenBeverages}
          className="p-4 rounded-3xl glass-surface border border-slate-800 text-left transition cursor-pointer flex flex-col justify-between space-y-3 group hover:border-cyan-500/40 shadow-md"
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-cyan-500/15 text-cyan-300">
                <Coffee className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white font-heading">
                  Beverage Hydration Index
                </h3>
                <span className="text-[11px] text-cyan-300 font-semibold block">
                  Absorption Coefficients (BHI)
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-300 transition" />
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-white block">
                Tea (0.9x), Coffee (0.8x), ORS (1.2x)
              </span>
              <span className="text-[10px] text-slate-400">
                Accounts for caffeine, osmolality & alcohol
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold">
              8 Multipliers
            </span>
          </div>
        </motion.button>

        {/* 6. Clinical Health & Kidney Stone Protocol */}
        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={onOpenClinical}
          className="p-4 rounded-3xl glass-surface border border-slate-800 text-left transition cursor-pointer flex flex-col justify-between space-y-3 group hover:border-emerald-500/40 shadow-md"
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-emerald-500/15 text-emerald-300">
                <HeartPulse className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white font-heading">
                  Clinical Safety Profiles
                </h3>
                <span className="text-[11px] text-emerald-300 font-semibold block">
                  Kidney Stones & Renal Guardrails
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-300 transition" />
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-white block">
                {profile.clinical.lifeStage === 'pregnancy'
                  ? 'Pregnancy (+300ml)'
                  : profile.clinical.lifeStage === 'breastfeeding'
                  ? 'Lactation (+700ml)'
                  : 'Nephrolithiasis / Citrate'}
              </span>
              <span className="text-[10px] text-slate-400">
                Chug protection &gt;900ml/20m active
              </span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
              Safe
            </span>
          </div>
        </motion.button>
      </div>
    </div>
  );
};
