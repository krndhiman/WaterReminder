import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Info, Sparkles } from 'lucide-react';
import { useWater } from '../context/WaterContext';
import { BEVERAGE_DATABASE, BeverageType } from '../types/beverages';

interface BeverageSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BeverageSelectorModal: React.FC<BeverageSelectorModalProps> = ({ isOpen, onClose }) => {
  const { addWater } = useWater();
  const [selectedType, setSelectedType] = useState<BeverageType>('electrolyte');
  const [amount, setAmount] = useState<number>(350);

  const currentBev = BEVERAGE_DATABASE[selectedType];
  const netHydration = Math.round(amount * currentBev.factor);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;
    addWater(amount, selectedType, currentBev.name);
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
                <Sparkles className="w-5 h-5 text-[#0a84ff]" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Beverage Hydration Index
                </h3>
                <p className="text-xs text-neutral-400">
                  Fluid retention and cellular hydration factor
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

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-3.5 pr-1">
            {/* Beverage Grid */}
            <div>
              <label className="text-[10px] uppercase font-semibold text-neutral-400 block mb-2">
                Choose Beverage Category
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(Object.keys(BEVERAGE_DATABASE) as BeverageType[]).map((type) => {
                  const item = BEVERAGE_DATABASE[type];
                  const isSelected = selectedType === type;

                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setSelectedType(type)}
                      className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-[#0a84ff] text-white border-[#0a84ff] shadow-sm'
                          : 'apple-card text-neutral-300 hover:border-white/[0.2]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xl">
                          {type === 'water'
                            ? '💧'
                            : type === 'electrolyte'
                            ? '⚡'
                            : type === 'tea'
                            ? '🍵'
                            : type === 'coffee'
                            ? '☕'
                            : type === 'milk'
                            ? '🥛'
                            : type === 'juice'
                            ? '🍊'
                            : type === 'soda'
                            ? '🥤'
                            : '🍺'}
                        </span>
                        <span
                          className={`text-[9px] font-mono font-semibold px-1.5 py-0.2 rounded-full ${
                            isSelected
                              ? 'bg-black/20 text-white'
                              : 'bg-neutral-800 text-neutral-300'
                          }`}
                        >
                          {Math.round(item.factor * 100)}%
                        </span>
                      </div>

                      <div>
                        <span className="text-xs font-semibold block truncate">{item.name}</span>
                        <span className={`text-[10px] ${isSelected ? 'text-white/80' : 'text-neutral-400'}`}>
                          {item.factor > 1
                            ? 'Boosted retention'
                            : item.factor === 1
                            ? 'Standard fluid'
                            : item.factor > 0
                            ? 'Hydrating'
                            : 'Dehydrating'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Beverage Info Card */}
            <div className="p-3.5 rounded-2xl apple-card space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-[#0a84ff]" />
                  <span>{currentBev.name} Breakdown</span>
                </span>
                <span className="text-xs font-mono font-bold text-[#0a84ff]">
                  {currentBev.factor}x Factor
                </span>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed">{currentBev.description}</p>
            </div>

            {/* Amount Slider */}
            <div className="p-4 rounded-2xl apple-card space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">Gross Volume</span>
                <div className="flex items-baseline gap-1">
                  <input
                    type="number"
                    min="50"
                    max="2000"
                    step="25"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-20 bg-black/40 border border-white/[0.08] rounded-xl px-2 py-1 text-center text-base font-bold text-white focus:outline-none focus:border-[#0a84ff]"
                  />
                  <span className="text-xs text-neutral-400">ml</span>
                </div>
              </div>

              <input
                type="range"
                min="100"
                max="1000"
                step="25"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-[#0a84ff]"
              />

              {/* Net Hydration Result Banner */}
              <div className="pt-2 flex items-center justify-between border-t border-white/[0.08]">
                <span className="text-xs text-neutral-400">Net Hydration Gain:</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-lg font-bold text-[#0a84ff] font-mono">
                    {netHydration >= 0 ? `+${netHydration}` : netHydration} ml
                  </span>
                  <span className="text-[11px] text-neutral-400 font-mono">
                    ({amount}ml × {currentBev.factor}x)
                  </span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-1 flex items-center justify-end gap-2.5">
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
                Log {amount} ml ({netHydration} ml net)
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
