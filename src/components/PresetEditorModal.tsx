import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Check, RotateCcw, SlidersHorizontal, Sparkles } from 'lucide-react';
import { useWater } from '../context/WaterContext';
import { ContainerIcon } from './ContainerIcon';
import { ContainerIconType, QuickPreset } from '../types/water';
import { BEVERAGE_DATABASE, BeverageType } from '../types/beverages';

interface PresetEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AVAILABLE_ICONS: { type: ContainerIconType; label: string }[] = [
  { type: 'cup', label: 'Tea / Espresso' },
  { type: 'glass', label: 'Glass' },
  { type: 'mug', label: 'Mug' },
  { type: 'bottle', label: 'Bottle' },
  { type: 'flask', label: 'Flask / Shaker' },
  { type: 'jug', label: 'Jug' },
  { type: 'gallon', label: 'Gallon' },
  { type: 'droplet', label: 'Droplet' },
];

export const PresetEditorModal: React.FC<PresetEditorModalProps> = ({ isOpen, onClose }) => {
  const { presets, updatePreset, addPreset, deletePreset, resetPresets } = useWater();
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // New preset form state
  const [newName, setNewName] = useState('Shaker');
  const [newAmount, setNewAmount] = useState(600);
  const [newBeverageType, setNewBeverageType] = useState<BeverageType>('electrolyte');
  const [newIcon, setNewIcon] = useState<ContainerIconType>('flask');

  // Edit preset form state
  const [editName, setEditName] = useState('');
  const [editAmount, setEditAmount] = useState(250);
  const [editBeverageType, setEditBeverageType] = useState<BeverageType>('water');
  const [editIcon, setEditIcon] = useState<ContainerIconType>('glass');

  const startEdit = (preset: QuickPreset) => {
    setEditingId(preset.id);
    setEditName(preset.name);
    setEditAmount(preset.amount);
    setEditBeverageType(preset.beverageType || 'water');
    setEditIcon(preset.icon);
    setIsAddingNew(false);
  };

  const saveEdit = (id: string) => {
    if (!editName.trim() || editAmount <= 0) return;
    updatePreset({
      id,
      name: editName.trim(),
      amount: editAmount,
      beverageType: editBeverageType,
      icon: editIcon,
    });
    setEditingId(null);
  };

  const handleAddNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || newAmount <= 0) return;
    addPreset({
      name: newName.trim(),
      amount: newAmount,
      beverageType: newBeverageType,
      icon: newIcon,
    });
    setNewName('');
    setNewAmount(500);
    setIsAddingNew(false);
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
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-lg rounded-3xl glass-panel-glow p-6 z-10 max-h-[90vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-700/50">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300">
                <SlidersHorizontal className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white font-heading">Customize 1-Tap Presets</h3>
                <p className="text-xs text-slate-400">Personalize container sizes, beverage types, and icons</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto py-4 space-y-3.5 pr-1">
            {/* List of current presets */}
            {presets.map((preset) => {
              const isEditing = editingId === preset.id;
              const bev = BEVERAGE_DATABASE[preset.beverageType] || BEVERAGE_DATABASE.water;

              if (isEditing) {
                return (
                  <div
                    key={preset.id}
                    className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 space-y-3"
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-medium text-slate-300 block mb-1">Container Name</label>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-medium text-slate-300 block mb-1">Amount (ml)</label>
                        <input
                          type="number"
                          value={editAmount}
                          onChange={(e) => setEditAmount(Number(e.target.value))}
                          className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
                        />
                      </div>
                    </div>

                    {/* Beverage Type Selection */}
                    <div>
                      <label className="text-[11px] font-medium text-slate-300 block mb-1">Drink Category (BHI)</label>
                      <select
                        value={editBeverageType}
                        onChange={(e) => setEditBeverageType(e.target.value as any)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                      >
                        {Object.keys(BEVERAGE_DATABASE).map((key) => {
                          const b = BEVERAGE_DATABASE[key as BeverageType];
                          return (
                            <option key={key} value={key}>
                              {b.name} ({b.factor}x Hydration)
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    {/* Icon Selection */}
                    <div>
                      <label className="text-[11px] font-medium text-slate-300 block mb-1.5">Choose Icon</label>
                      <div className="flex flex-wrap gap-2">
                        {AVAILABLE_ICONS.map((item) => (
                          <button
                            key={item.type}
                            type="button"
                            onClick={() => setEditIcon(item.type)}
                            className={`p-2 rounded-xl border flex items-center gap-1 text-xs cursor-pointer transition ${
                              editIcon === item.type
                                ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold'
                                : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500'
                            }`}
                          >
                            <ContainerIcon icon={item.type} className="w-4 h-4" />
                            <span className="text-[10px]">{item.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Save / Cancel buttons */}
                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1.5 rounded-xl text-xs text-slate-300 hover:bg-slate-800 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => saveEdit(preset.id)}
                        className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs cursor-pointer transition"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Save
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={preset.id}
                  className="flex items-center justify-between p-3 rounded-2xl glass-card hover:border-slate-600 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-cyan-500/15 text-cyan-300">
                      <ContainerIcon icon={preset.icon} className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-white">{preset.name}</h4>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                          {bev.factor}x
                        </span>
                      </div>
                      <p className="text-xs text-cyan-300/80 font-mono">
                        {preset.amount} ml · <span className="text-slate-400">{bev.name}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => startEdit(preset)}
                      className="px-3 py-1.5 rounded-xl text-xs text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition cursor-pointer"
                    >
                      Edit
                    </button>
                    {presets.length > 2 && (
                      <button
                        onClick={() => deletePreset(preset.id)}
                        className="p-2 rounded-xl text-rose-400/80 hover:text-rose-300 hover:bg-rose-950/40 border border-transparent hover:border-rose-800 transition cursor-pointer"
                        title="Delete Preset"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Add New Preset Form Toggle */}
            {isAddingNew ? (
              <form onSubmit={handleAddNew} className="p-4 rounded-2xl bg-slate-900/90 border border-cyan-500/40 space-y-3">
                <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider">Add New Container</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-300 block mb-1">Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Gym Shaker"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-300 block mb-1">Volume (ml)</label>
                    <input
                      type="number"
                      placeholder="600"
                      value={newAmount}
                      onChange={(e) => setNewAmount(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-300 block mb-1">Drink Category (BHI)</label>
                  <select
                    value={newBeverageType}
                    onChange={(e) => setNewBeverageType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  >
                    {Object.keys(BEVERAGE_DATABASE).map((key) => {
                      const b = BEVERAGE_DATABASE[key as BeverageType];
                      return (
                        <option key={key} value={key}>
                          {b.name} ({b.factor}x)
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-300 block mb-1.5">Select Icon</label>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_ICONS.map((item) => (
                      <button
                        key={item.type}
                        type="button"
                        onClick={() => setNewIcon(item.type)}
                        className={`p-2 rounded-xl border flex items-center gap-1 text-xs cursor-pointer transition ${
                          newIcon === item.type
                            ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold'
                            : 'bg-slate-950 text-slate-300 border-slate-700 hover:border-slate-500'
                        }`}
                      >
                        <ContainerIcon icon={item.type} className="w-4 h-4" />
                        <span className="text-[10px]">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingNew(false)}
                    className="px-3 py-1.5 rounded-xl text-xs text-slate-300 hover:bg-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs cursor-pointer transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Container
                  </button>
                </div>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setIsAddingNew(true)}
                className="w-full py-2.5 rounded-2xl border border-dashed border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-cyan-300 flex items-center justify-center gap-2 text-xs font-semibold transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add Custom Preset
              </button>
            )}
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-700/50 flex items-center justify-between">
            <button
              type="button"
              onClick={resetPresets}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset to Defaults
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition cursor-pointer"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
