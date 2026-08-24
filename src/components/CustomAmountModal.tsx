import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Droplet, Plus, Clock, Sparkles } from 'lucide-react';
import { useWater } from '../context/WaterContext';
import { BeverageType, BEVERAGE_DATABASE } from '../types/beverages';

interface CustomAmountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CustomAmountModal: React.FC<CustomAmountModalProps> = ({ isOpen, onClose }) => {
  const { addWater } = useWater();
  const [amount, setAmount] = useState<number>(350);
  const [beverageType, setBeverageType] = useState<BeverageType>('water');
  const [beverageName, setBeverageName] = useState<string>('Pure Water');
  const [timeOffsetMinutes, setTimeOffsetMinutes] = useState<number>(0);

  const handleQuickIncrement = (delta: number) => {
    setAmount((prev) => Math.max(25, Math.min(3000, prev + delta)));
  };

  const handleBeverageSelect = (type: BeverageType) => {
    setBeverageType(type);
    setBeverageName(BEVERAGE_DATABASE[type].name);
  };

  const factor = BEVERAGE_DATABASE[beverageType]?.factor || 1.0;
  const netHydration = Math.round(amount * factor);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;

    const customTimestamp = Date.now() - timeOffsetMinutes * 60 * 1000;
    addWater(amount, beverageType, beverageName, 'droplet', customTimestamp);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/90 backdrop-blur-lg"
        />

        {/* Full Screen Modal Window */}
        <motion.div
          initial={{ scale: 0.94, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 20 }}
          className="relative w-full max-w-xl h-[92vh] sm:h-auto sm:max-h-[88vh] rounded-3xl glass-surface-glow p-5 sm:p-7 z-10 overflow-hidden border border-cyan-500/40 shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-300">
                <Droplet className="w-5 h-5 fill-cyan-400/40" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-white font-heading">
                  Log Custom Intake
                </h3>
                <p className="text-xs text-slate-400">Add any beverage volume or bottle size</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-2xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-1 py-4 space-y-4">
            {/* Amount Display & Visual Gauge */}
            <div className="flex flex-col items-center justify-center p-5 rounded-3xl bg-slate-900/80 border border-cyan-500/30 text-center">
              <span className="text-xs text-cyan-300 font-bold uppercase tracking-wider mb-1">
                Volume
              </span>
              <div className="flex items-baseline gap-1">
                <input
                  type="number"
                  min="10"
                  max="4000"
                  value={amount}
                  onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
                  className="w-36 text-center text-4xl sm:text-5xl font-black font-heading text-white bg-transparent border-b-2 border-cyan-400 focus:outline-none"
                />
                <span className="text-base font-bold text-slate-400">ml</span>
              </div>

              {/* Slider */}
              <div className="w-full mt-4 px-2">
                <input
                  type="range"
                  min="50"
                  max="1500"
                  step="25"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />
              </div>

              {/* Quick Delta Pills */}
              <div className="flex items-center gap-1.5 mt-4 flex-wrap justify-center">
                {[-100, -50, +50, +100, +250].map((delta) => (
                  <button
                    key={delta}
                    type="button"
                    onClick={() => handleQuickIncrement(delta)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-cyan-500/20 hover:text-cyan-300 text-slate-300 text-xs font-bold transition cursor-pointer border border-slate-700"
                  >
                    {delta > 0 ? `+${delta}` : delta} ml
                  </button>
                ))}
              </div>
            </div>

            {/* Beverage Selector Grid */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Beverage Type
              </span>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(BEVERAGE_DATABASE) as BeverageType[]).map((type) => {
                  const bev = BEVERAGE_DATABASE[type];
                  const isSelected = beverageType === type;

                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleBeverageSelect(type)}
                      className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400 shadow-md'
                          : 'glass-surface border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-lg">
                          {type === 'coffee'
                            ? '☕'
                            : type === 'electrolyte'
                            ? '⚡'
                            : type === 'tea'
                            ? '🍵'
                            : type === 'juice'
                            ? '🧃'
                            : type === 'milk'
                            ? '🥛'
                            : '💧'}
                        </span>
                        <span
                          className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
                            isSelected ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-cyan-300'
                          }`}
                        >
                          {Math.round(bev.factor * 100)}%
                        </span>
                      </div>
                      <span className="text-xs font-bold truncate mt-2">{bev.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Offset (Did you drink this earlier?) */}
            <div className="p-3.5 rounded-2xl glass-surface border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <div>
                  <span className="text-xs font-bold text-white block">Drank earlier?</span>
                  <span className="text-[10px] text-slate-400">Log past time</span>
                </div>
              </div>

              <select
                value={timeOffsetMinutes}
                onChange={(e) => setTimeOffsetMinutes(Number(e.target.value))}
                className="bg-slate-900 border border-slate-700 text-xs text-cyan-300 rounded-xl px-2.5 py-1.5 focus:outline-none font-medium"
              >
                <option value={0}>Just Now</option>
                <option value={15}>15 mins ago</option>
                <option value={30}>30 mins ago</option>
                <option value={60}>1 hour ago</option>
                <option value={120}>2 hours ago</option>
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 font-black text-xs transition cursor-pointer shadow-lg shadow-cyan-500/25 shrink-0"
            >
              Log +{amount} ml ({netHydration} ml net)
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
