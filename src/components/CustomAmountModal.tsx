import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Droplet, Plus, Clock } from 'lucide-react';
import { useWater } from '../context/WaterContext';
import { BeverageType, BEVERAGE_DATABASE } from '../types/beverages';

interface CustomAmountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CustomAmountModal: React.FC<CustomAmountModalProps> = ({ isOpen, onClose }) => {
  const { addWater } = useWater();
  const [amount, setAmount] = useState<number>(300);
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
                <Droplet className="w-5 h-5 text-[#0a84ff]" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Log Custom Intake
                </h3>
                <p className="text-xs text-neutral-400">Add any volume or beverage</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-neutral-400 hover:text-white bg-white/[0.08] transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-3.5 pr-1">
            {/* Amount Display & Visual Gauge */}
            <div className="flex flex-col items-center justify-center p-5 rounded-2xl apple-card text-center">
              <span className="text-[11px] text-neutral-400 font-semibold uppercase tracking-wider mb-1">
                Volume
              </span>
              <div className="flex items-baseline gap-1">
                <input
                  type="number"
                  min="10"
                  max="4000"
                  value={amount}
                  onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
                  className="w-36 text-center text-4xl sm:text-5xl font-bold text-white bg-transparent border-b-2 border-[#0a84ff] focus:outline-none"
                />
                <span className="text-sm font-semibold text-neutral-400">ml</span>
              </div>

              {/* Slider */}
              <div className="w-full mt-3 px-2">
                <input
                  type="range"
                  min="50"
                  max="1500"
                  step="25"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full accent-[#0a84ff] cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
                />
              </div>

              {/* Quick Delta Pills */}
              <div className="flex items-center gap-1.5 mt-3 flex-wrap justify-center">
                {[-100, -50, +50, +100, +250].map((delta) => (
                  <button
                    key={delta}
                    type="button"
                    onClick={() => handleQuickIncrement(delta)}
                    className="px-3 py-1 rounded-xl bg-black/40 hover:bg-[#0a84ff]/20 text-neutral-300 text-xs font-semibold transition cursor-pointer border border-white/[0.06]"
                  >
                    {delta > 0 ? `+${delta}` : delta} ml
                  </button>
                ))}
              </div>
            </div>

            {/* Beverage Selector Grid */}
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">
                Beverage Type & Hydration Ratio
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
                          ? 'bg-[#0a84ff] text-white border-[#0a84ff] shadow-sm'
                          : 'apple-card text-neutral-300 hover:border-white/[0.2]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-base">
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
                          className={`text-[9px] font-mono font-semibold px-1.5 py-0.2 rounded-full ${
                            isSelected ? 'bg-black/20 text-white' : 'bg-neutral-800 text-neutral-400'
                          }`}
                        >
                          {Math.round(bev.factor * 100)}%
                        </span>
                      </div>
                      <span className="text-xs font-semibold truncate mt-1.5">{bev.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Offset */}
            <div className="p-3.5 rounded-2xl apple-card flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#0a84ff]" />
                <div>
                  <span className="text-xs font-semibold text-white block">Drank earlier?</span>
                  <span className="text-[10px] text-neutral-400">Log past time</span>
                </div>
              </div>

              <select
                value={timeOffsetMinutes}
                onChange={(e) => setTimeOffsetMinutes(Number(e.target.value))}
                className="bg-black/40 border border-white/[0.08] text-xs text-white rounded-xl px-2.5 py-1.5 focus:outline-none"
              >
                <option value={0}>Just Now</option>
                <option value={15}>15 mins ago</option>
                <option value={30}>30 mins ago</option>
                <option value={60}>1 hour ago</option>
                <option value={120}>2 hours ago</option>
              </select>
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl apple-btn-secondary text-xs font-semibold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl apple-btn-primary text-xs font-semibold transition cursor-pointer shadow"
              >
                Log +{amount} ml ({netHydration} ml net)
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
