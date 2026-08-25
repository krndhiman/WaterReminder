import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Heart,
  Flame,
  Download,
  Upload,
  Check,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';
import { useWater } from '../context/WaterContext';

interface HealthSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HealthSyncModal: React.FC<HealthSyncModalProps> = ({ isOpen, onClose }) => {
  const { allRecords, updateEnvironmental, profile } = useWater();
  const [activeCalories, setActiveCalories] = useState<number>(450);
  const [importedStatus, setImportedStatus] = useState<string | null>(null);

  const calculatedFluidLossMl = Math.round(activeCalories * 0.95);

  const handleImportWorkoutCalories = () => {
    const workoutMins = Math.round((activeCalories / 450) * 35);
    updateEnvironmental({
      workoutMinutes: (profile.environmental.workoutMinutes || 0) + workoutMins,
    });
    setImportedStatus(`Synced! +${calculatedFluidLossMl}ml sweat compensation added from ${activeCalories} kcal workout.`);
    setTimeout(() => {
      setImportedStatus(null);
      onClose();
    }, 1200);
  };

  const handleExportHealthKitJSON = () => {
    const healthKitSamples = Object.values(allRecords).flatMap((r) =>
      r.logs.map((l) => ({
        type: 'HKQuantityTypeIdentifierDietaryWater',
        startDate: new Date(l.timestamp).toISOString(),
        endDate: new Date(l.timestamp).toISOString(),
        value: l.amount / 1000,
        unit: 'L',
        metadata: {
          HKWasUserEntered: true,
          HKBeverageType: l.beverageType,
          HKHydrationFactor: l.hydrationFactor || 1.0,
        },
      }))
    );

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(
        { schema: 'AppleHealthKit_DietaryWater_v1', totalSamples: healthKitSamples.length, samples: healthKitSamples },
        null,
        2
      )
    )}`;

    const link = document.createElement('a');
    link.href = jsonString;
    link.download = `AquaFlow_HealthKit_Sync_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
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
                <Heart className="w-5 h-5 text-[#ff453a]" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Apple Health & Biometrics
                </h3>
                <p className="text-xs text-neutral-400">
                  Metabolic calories and dietary fluid sync
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

          <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
            {/* Status message */}
            {importedStatus && (
              <div className="p-3.5 rounded-2xl bg-[#30d158]/15 border border-[#30d158]/30 text-xs text-[#30d158] flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>{importedStatus}</span>
              </div>
            )}

            {/* 1. Import Workout Energy Burned */}
            <div className="p-4 rounded-2xl apple-card space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <Flame className="w-4 h-4 text-[#ff453a]" />
                  <span>Active Workout Energy</span>
                </div>
                <span className="text-xs font-mono font-bold text-[#ff453a]">
                  {activeCalories} kcal
                </span>
              </div>

              <input
                type="range"
                min="100"
                max="1200"
                step="50"
                value={activeCalories}
                onChange={(e) => setActiveCalories(Number(e.target.value))}
                className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-[#ff453a]"
              />

              <div className="flex items-center justify-between text-xs pt-1 border-t border-white/[0.08]">
                <span className="text-neutral-400">Calculated Fluid Loss:</span>
                <span className="font-mono font-bold text-white">
                  +{calculatedFluidLossMl} ml compensation
                </span>
              </div>

              <button
                type="button"
                onClick={handleImportWorkoutCalories}
                className="w-full py-2.5 rounded-xl apple-btn-primary text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 shadow"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Sync {activeCalories} kcal Sweat Loss (+{calculatedFluidLossMl}ml)</span>
              </button>
            </div>

            {/* 2. Export to Apple HealthKit / Google Health Connect Schema */}
            <div className="p-4 rounded-2xl apple-card space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <Smartphone className="w-4 h-4 text-[#0a84ff]" />
                  <span>Apple HealthKit Export Schema</span>
                </div>
                <span className="text-[10px] font-mono text-neutral-400">HKQuantityType</span>
              </div>

              <p className="text-[11px] text-neutral-400 leading-relaxed">
                Export all historical water logs formatted for direct import into Apple Health (`HKQuantityTypeIdentifierDietaryWater`).
              </p>

              <button
                type="button"
                onClick={handleExportHealthKitJSON}
                className="w-full py-2.5 rounded-xl apple-btn-secondary text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download HealthKit Sync File (.json)</span>
              </button>
            </div>

            {/* Privacy Guarantee */}
            <div className="p-3.5 rounded-2xl apple-card text-xs text-neutral-300 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#30d158] shrink-0 mt-0.5" />
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                <strong>100% Private:</strong> AquaFlow processes all metabolic health data locally on your device without transmitting health telemetry to external servers.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-2 border-t border-white/[0.08] flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl apple-btn-secondary text-xs font-semibold transition cursor-pointer"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
