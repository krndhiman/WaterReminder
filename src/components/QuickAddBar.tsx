import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, SlidersHorizontal } from 'lucide-react';
import { useWater } from '../context/WaterContext';
import { ContainerIcon } from './ContainerIcon';
import { QuickPreset } from '../types/water';

interface QuickAddBarProps {
  onOpenCustomModal: () => void;
  onOpenPresetEditor: () => void;
}

export const QuickAddBar: React.FC<QuickAddBarProps> = ({
  onOpenCustomModal,
  onOpenPresetEditor,
}) => {
  const { presets, quickAdd } = useWater();
  const [activePresetId, setActivePresetId] = useState<string | null>(null);

  const handleQuickAdd = (preset: QuickPreset) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(15);
      } catch (err) {
        // ignore
      }
    }

    setActivePresetId(preset.id);
    quickAdd(preset);
    setTimeout(() => setActivePresetId(null), 250);
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col gap-2.5">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
          Quick Log
        </span>

        <button
          onClick={onOpenPresetEditor}
          className="flex items-center gap-1 text-xs text-neutral-400 hover:text-white transition cursor-pointer font-medium"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Edit</span>
        </button>
      </div>

      {/* Preset Tiles Grid (Apple Minimalist Style) */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 w-full">
        {presets.map((preset, index) => {
          const isActive = activePresetId === preset.id;

          return (
            <motion.button
              key={preset.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleQuickAdd(preset)}
              className={`relative flex flex-col items-center justify-center p-3.5 rounded-2xl transition-all cursor-pointer select-none apple-card ${
                isActive
                  ? '!bg-[#0a84ff] !text-white !border-[#0a84ff]'
                  : 'hover:bg-[#1c1c1e]'
              }`}
            >
              {/* Desktop Hotkey Indicator */}
              <span className="hidden sm:block absolute top-1.5 right-1.5 text-[8px] font-mono text-neutral-500 font-semibold">
                {index + 1}
              </span>

              <div
                className={`p-1.5 rounded-xl mb-1 transition-colors ${
                  isActive ? 'text-white' : 'text-[#0a84ff]'
                }`}
              >
                <ContainerIcon icon={preset.icon} className="w-4 h-4" />
              </div>

              <span className="text-xs font-semibold text-white tracking-tight">
                +{preset.amount} <span className="text-[10px] text-neutral-400 font-normal">ml</span>
              </span>
              <span
                className={`text-[10px] truncate max-w-full font-medium mt-0.5 ${
                  isActive ? 'text-white/80' : 'text-neutral-400'
                }`}
              >
                {preset.name}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Clean Custom Log Button */}
      <button
        onClick={onOpenCustomModal}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl apple-btn-secondary text-xs font-semibold transition cursor-pointer"
      >
        <Plus className="w-3.5 h-3.5 text-[#0a84ff]" />
        <span>Custom Amount</span>
      </button>
    </div>
  );
};
