import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Clock, Droplet, Sparkles, X, Dumbbell, Briefcase, Plus } from 'lucide-react';
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeReminderModal}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.96, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg rounded-3xl apple-glass-modal p-5 sm:p-6 z-10 overflow-hidden max-h-[90vh] flex flex-col space-y-4"
        >
          {/* Close button */}
          <button
            onClick={closeReminderModal}
            className="absolute top-4 right-4 p-1.5 rounded-full text-neutral-400 hover:text-white bg-white/[0.08] transition cursor-pointer z-20"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Coach Persona Banner */}
          <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
            <div className="text-center pt-1">
              <div className="inline-flex items-center gap-1.5 bg-[#1c1c1e] border border-white/[0.08] px-3 py-1 rounded-full text-xs font-semibold text-neutral-200 mb-2">
                <span>{persona.emoji}</span>
                <span>{persona.name} ({persona.title})</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Hydration Check 💧
              </h3>
              <p className="text-xs text-neutral-300 mt-1 italic max-w-sm mx-auto p-3 rounded-2xl apple-card">
                "{quote}"
              </p>
            </div>

            {/* Quick 1-Tap Logging Options */}
            <div className="space-y-2">
              <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider px-1">
                Log a Sip:
              </div>

              <div className="grid grid-cols-3 gap-2">
                {presets.map((p) => {
                  const factor = BEVERAGE_DATABASE[p.beverageType]?.factor || 1.0;
                  const net = Math.round(p.amount * factor);
                  return (
                    <button
                      key={p.id}
                      onClick={() => handleSelectIntake(p.amount, p.name, p.icon, p.beverageType)}
                      className="flex flex-col items-center justify-center p-3 rounded-2xl apple-card hover:border-white/[0.2] transition-all cursor-pointer group"
                    >
                      <div className="p-2 rounded-xl bg-white/[0.06] text-white group-hover:bg-[#0a84ff] transition-all mb-1">
                        <ContainerIcon icon={p.icon} className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-bold text-white">
                        {p.amount} <span className="text-[10px] font-normal text-neutral-400">ml</span>
                      </span>
                      <span className="text-[10px] text-neutral-400 truncate max-w-full">{p.name}</span>
                      <span className="text-[9px] text-[#0a84ff] font-mono">
                        +{net}ml
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Custom Input Toggle */}
              {showCustomInput ? (
                <form onSubmit={handleCustomSubmit} className="p-3.5 rounded-2xl apple-card border border-[#0a84ff]/30 space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="ml (e.g. 300)"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(Number(e.target.value))}
                      className="flex-1 bg-black/40 border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#0a84ff] font-mono"
                      autoFocus
                    />
                    <select
                      value={selectedBev}
                      onChange={(e) => setSelectedBev(e.target.value as any)}
                      className="bg-black/40 border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    >
                      <option value="water">Water (1.0x)</option>
                      <option value="electrolyte">Electrolytes (1.2x)</option>
                      <option value="tea">Tea (0.9x)</option>
                      <option value="coffee">Coffee (0.8x)</option>
                      <option value="juice">Juice (0.85x)</option>
                    </select>
                    <button
                      type="submit"
                      className="px-4 py-2 apple-btn-primary text-xs font-semibold rounded-xl cursor-pointer transition"
                    >
                      Log
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setShowCustomInput(true)}
                  className="w-full py-1.5 text-xs font-medium text-[#0a84ff] hover:underline flex items-center justify-center gap-1 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Custom amount or other beverage</span>
                </button>
              )}
            </div>

            {/* Snooze & Delay Controls */}
            <div className="pt-3 border-t border-white/[0.08] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-neutral-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Snooze / Delay:</span>
                </span>
                <button
                  onClick={() => setShowCustomSnooze(!showCustomSnooze)}
                  className="text-[11px] text-[#0a84ff] hover:underline cursor-pointer"
                >
                  {showCustomSnooze ? 'Presets' : 'Custom Minutes'}
                </button>
              </div>

              {showCustomSnooze ? (
                <form onSubmit={handleCustomSnoozeSubmit} className="flex items-center gap-2">
                  <span className="text-xs text-neutral-300">Snooze for</span>
                  <input
                    type="number"
                    min="1"
                    max="360"
                    value={customSnoozeMinutes}
                    onChange={(e) => setCustomSnoozeMinutes(Number(e.target.value))}
                    className="w-20 bg-black/40 border border-white/[0.08] rounded-xl px-2.5 py-1.5 text-center text-xs font-bold text-white focus:outline-none focus:border-[#0a84ff]"
                  />
                  <span className="text-xs text-neutral-300">mins</span>
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-xl apple-btn-secondary text-xs font-semibold transition cursor-pointer"
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
                      className="py-2 rounded-xl apple-card text-neutral-300 text-xs font-semibold hover:border-white/[0.2] transition cursor-pointer"
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
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl apple-card text-neutral-400 hover:text-white text-[11px] font-medium transition cursor-pointer"
                >
                  <Briefcase className="w-3.5 h-3.5 text-[#ff9f0a]" />
                  <span>In Meeting (1h)</span>
                </button>
                <button
                  onClick={() => setFocusMode(90, 'gym')}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl apple-card text-neutral-400 hover:text-white text-[11px] font-medium transition cursor-pointer"
                >
                  <Dumbbell className="w-3.5 h-3.5 text-[#30d158]" />
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
