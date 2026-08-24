import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Droplet, Zap, Coffee, Beer, Milk, Sparkles, Check, Info } from 'lucide-react';
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
          className="relative w-full max-w-lg rounded-3xl glass-surface-glow p-6 z-10 overflow-hidden border border-cyan-500/30 max-h-[92vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-300">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white font-heading">
                  Beverage Hydration Index (BHI)
                </h3>
                <p className="text-xs text-slate-400">
                  Scientific fluid retention & cellular absorption index
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

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
            {/* Beverage Grid */}
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                Choose Drink Category
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
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
                          ? `${item.badgeColor} shadow-lg ring-1 ring-cyan-400`
                          : 'glass-card-inner hover:border-slate-700'
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
                          className={`text-[10px] font-black font-mono px-1.5 py-0.2 rounded-md ${
                            item.factor > 1
                              ? 'bg-emerald-500/30 text-emerald-300'
                              : item.factor > 0
                              ? 'bg-cyan-500/20 text-cyan-300'
                              : 'bg-rose-500/30 text-rose-300'
                          }`}
                        >
                          {item.factor > 0 ? `${Math.round(item.factor * 100)}%` : `${item.factor * 100}%`}
                        </span>
                      </div>

                      <div>
                        <span className="text-xs font-bold text-white block truncate">{item.name}</span>
                        <span className="text-[10px] text-slate-400">
                          {item.factor > 1
                            ? 'Boosted retention'
                            : item.factor === 1
                            ? 'Standard water'
                            : item.factor > 0
                            ? 'Mild diuretic'
                            : 'Dehydrating'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Beverage Science Info Card */}
            <div className="p-4 rounded-2xl glass-card-inner border border-cyan-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-cyan-400" />
                  {currentBev.name} Science Breakdown
                </span>
                <span className="text-xs font-mono font-bold text-cyan-300">
                  {currentBev.factor}x Hydration Multiplier
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{currentBev.description}</p>
            </div>

            {/* Amount Slider & Calculation Preview */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">Gross Volume Consumed</span>
                <div className="flex items-baseline gap-1">
                  <input
                    type="number"
                    min="50"
                    max="2000"
                    step="25"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-24 bg-slate-950 border border-slate-700 rounded-xl px-2 py-1 text-center text-lg font-black font-mono text-white focus:outline-none focus:border-cyan-400"
                  />
                  <span className="text-xs font-bold text-slate-400">ml</span>
                </div>
              </div>

              <input
                type="range"
                min="100"
                max="1000"
                step="25"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />

              {/* Net Hydration Result Banner */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                <span className="text-xs font-bold text-slate-400">Net Cellular Hydration:</span>
                <div className="flex items-baseline gap-1.5">
                  <span
                    className={`text-xl font-black font-heading ${
                      netHydration >= 0 ? 'text-cyan-300 text-glow-cyan' : 'text-rose-400'
                    }`}
                  >
                    {netHydration >= 0 ? `+${netHydration}` : netHydration} ml
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    ({amount}ml × {currentBev.factor}x)
                  </span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm transition shadow-lg shadow-cyan-500/25 cursor-pointer flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>
                Log {amount}ml {currentBev.name} ({netHydration >= 0 ? `+${netHydration}ml` : `${netHydration}ml`})
              </span>
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
