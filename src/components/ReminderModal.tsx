import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Clock, Droplet, Sparkles, X, Moon, Dumbbell, Briefcase, Plus, Zap, Coffee } from 'lucide-react';
import { useWater } from '../context/WaterContext';
import { ContainerIcon } from './ContainerIcon';
import { COACH_PERSONAS, BEVERAGE_DATABASE, BeverageType } from '../types/beverages';

export const ReminderModal: React.FC = () => {
  const {
    isReminderModalOpen,
    closeReminderModal,
    presets,
    addWater,
    snoozeReminder,
    setFocusMode,
    todayRecord,
    schedule,
    coachPersona,
  } = useWater();

  const [customAmount, setCustomAmount] = useState<number>(300);
  const [selectedBev, setSelectedBev] = useState<BeverageType>('water');
  const [showCustomInput, setShowCustomInput] = useState<boolean>(false);
  const [customSnoozeMinutes, setCustomSnoozeMinutes] = useState<number>(schedule.defaultSnoozeMinutes || 15);
  const [showCustomSnooze, setShowCustomSnooze] = useState<boolean>(false);

  const persona = COACH_PERSONAS[coachPersona] || COACH_PERSONAS.biohacker;
  const quote = persona.quotes[Math.floor(Math.random() * persona.quotes.length)];

  const handleSelectIntake = (amount: number, name: string, icon: any, bevType: BeverageType = 'water') => {
    addWater(amount, bevType, name, icon);
    closeReminderModal();
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customAmount > 0) {
      addWater(customAmount, selectedBev, BEVERAGE_DATABASE[selectedBev].name, 'droplet');
      closeReminderModal();
    }
  };

  const handleCustomSnoozeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customSnoozeMinutes > 0) {
      snoozeReminder(customSnoozeMinutes);
    }
  };

  if (!isReminderModalOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-950/85 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, y: 30 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg rounded-3xl glass-surface-glow p-6 z-10 overflow-hidden shadow-2xl border border-cyan-400/40 max-h-[92vh] flex flex-col"
        >
          {/* Close button */}
          <button
            onClick={closeReminderModal}
            className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800/80 transition cursor-pointer z-20"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Coach Persona Banner */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-4">
            <div className="text-center pt-2">
              <div className="inline-flex items-center gap-2 bg-slate-900 border border-slate-700 px-3 py-1 rounded-full text-xs font-bold text-slate-200 mb-2">
                <span>{persona.emoji}</span>
                <span>{persona.name} ({persona.title})</span>
              </div>

              <h3 className="text-2xl font-black text-white font-heading tracking-tight">
                Hydration Nudge 💧
              </h3>
              <p className="text-xs text-cyan-200/95 mt-1 italic max-w-sm mx-auto bg-cyan-950/40 p-2.5 rounded-2xl border border-cyan-500/20">
                "{quote}"
              </p>
            </div>

            {/* Quick 1-Tap Logging Options */}
            <div className="space-y-2.5">
              <div className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider px-1">
                Select Drink to Log:
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                {presets.map((p) => {
                  const factor = BEVERAGE_DATABASE[p.beverageType]?.factor || 1.0;
                  const net = Math.round(p.amount * factor);
                  return (
                    <motion.button
                      key={p.id}
                      whileHover={{ scale: 1.04, y: -2 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => handleSelectIntake(p.amount, p.name, p.icon, p.beverageType)}
                      className="flex flex-col items-center justify-center p-3 rounded-2xl bg-gradient-to-b from-slate-800/90 to-slate-900/90 hover:from-cyan-950/60 hover:to-slate-900 border border-slate-700 hover:border-cyan-400/60 transition-all cursor-pointer group shadow"
                    >
                      <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-300 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-all mb-1">
                        <ContainerIcon icon={p.icon} className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-black text-white font-heading">
                        {p.amount} <span className="text-[10px] font-normal text-slate-400">ml</span>
                      </span>
                      <span className="text-[10px] text-slate-400 truncate max-w-full">{p.name}</span>
                      <span className="text-[9px] text-cyan-300/80 font-mono">
                        Net: {net > 0 ? `+${net}ml` : `${net}ml`}
                      </span>
                    </motion.button>
                  );
                })}
              </div>

              {/* Custom Input Toggle */}
              {showCustomInput ? (
                <form onSubmit={handleCustomSubmit} className="p-3.5 rounded-2xl bg-slate-900/90 border border-cyan-500/40 space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="ml (e.g. 400)"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(Number(e.target.value))}
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400 font-mono"
                      autoFocus
                    />
                    <select
                      value={selectedBev}
                      onChange={(e) => setSelectedBev(e.target.value as any)}
                      className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    >
                      <option value="water">Pure Water (1.0x)</option>
                      <option value="electrolyte">Electrolytes (1.2x)</option>
                      <option value="tea">Tea (0.9x)</option>
                      <option value="coffee">Coffee (0.8x)</option>
                      <option value="juice">Juice (0.85x)</option>
                    </select>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl cursor-pointer transition"
                    >
                      Log
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setShowCustomInput(true)}
                  className="w-full py-1.5 text-xs font-semibold text-cyan-300 hover:text-cyan-200 flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Custom volume or other beverage?
                </button>
              )}
            </div>

            {/* Editable Snooze & Focus Controls */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Snooze / Delay:
                </span>
                <button
                  onClick={() => setShowCustomSnooze(!showCustomSnooze)}
                  className="text-[11px] text-cyan-400 hover:underline cursor-pointer"
                >
                  {showCustomSnooze ? 'Presets' : 'Custom Mins'}
                </button>
              </div>

              {showCustomSnooze ? (
                <form onSubmit={handleCustomSnoozeSubmit} className="flex items-center gap-2">
                  <span className="text-xs text-slate-300">Snooze for</span>
                  <input
                    type="number"
                    min="1"
                    max="360"
                    value={customSnoozeMinutes}
                    onChange={(e) => setCustomSnoozeMinutes(Number(e.target.value))}
                    className="w-20 bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-center text-sm font-bold text-white focus:outline-none focus:border-cyan-400"
                  />
                  <span className="text-xs text-slate-300">mins</span>
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold transition cursor-pointer"
                  >
                    Set
                  </button>
                </form>
              ) : (
                <div className="grid grid-cols-4 gap-1.5">
                  {[10, 15, 30, 60].map((mins) => (
                    <button
                      key={mins}
                      onClick={() => snoozeReminder(mins)}
                      className="py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-600 text-slate-300 text-xs font-semibold transition cursor-pointer"
                    >
                      +{mins}m
                    </button>
                  ))}
                </div>
              )}

              {/* Quick Focus Mode buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => setFocusMode(60, 'meeting')}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 text-[11px] font-medium transition cursor-pointer"
                >
                  <Briefcase className="w-3.5 h-3.5 text-amber-400" />
                  <span>In Meeting (1h)</span>
                </button>
                <button
                  onClick={() => setFocusMode(90, 'gym')}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 text-[11px] font-medium transition cursor-pointer"
                >
                  <Dumbbell className="w-3.5 h-3.5 text-emerald-400" />
                  <span>At Gym (1.5h)</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
