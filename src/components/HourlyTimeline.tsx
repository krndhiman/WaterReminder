import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Droplet, CheckCircle2, AlertCircle, Trash2, Sparkles, Zap, ChevronRight } from 'lucide-react';
import { useWater } from '../context/WaterContext';
import { ContainerIcon } from './ContainerIcon';
import { HourlyBucket } from '../types/water';

export const HourlyTimeline: React.FC = () => {
  const { hourlyBuckets, paceInfo, deleteLog, isToday } = useWater();
  const [selectedHourBucket, setSelectedHourBucket] = useState<HourlyBucket | null>(null);

  const activeHours = hourlyBuckets.filter((b) => b.isAwakeHour);
  const maxBucketAmount = Math.max(paceInfo.hourlyTarget * 1.4, ...activeHours.map((b) => b.total), 450);

  return (
    <div className="w-full max-w-4xl mx-auto rounded-3xl glass-surface p-4 sm:p-6 space-y-4 border border-slate-800/80 shadow-2xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-cyan-500/15 text-cyan-300">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-black text-white font-heading">
              Hourly Equalizer Timeline
            </h3>
            <p className="text-xs text-slate-400">
              Paced at ~{paceInfo.hourlyTarget} ml/hr across active waking hours
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(56,189,248,0.7)]" />
            <span>Target Met</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-sky-600" />
            <span>Partial</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
            <span>Empty</span>
          </div>
        </div>
      </div>

      {/* Responsive Equalizer Grid without horizontal overflow */}
      <div className="pt-4 pb-2 px-1">
        <div className="flex items-end justify-between gap-1 sm:gap-2 h-44 sm:h-52 w-full relative">
          {/* Target Pace Dashed Line */}
          <div
            className="absolute left-0 right-0 border-b border-dashed border-cyan-400/40 z-10 pointer-events-none flex items-center justify-end pr-1"
            style={{
              bottom: `${(paceInfo.hourlyTarget / maxBucketAmount) * 100}%`,
            }}
          >
            <span className="text-[8px] sm:text-[9px] font-mono font-bold text-cyan-300 bg-slate-950/90 px-1.5 py-0.5 rounded border border-cyan-500/30 shadow-md">
              Target: {paceInfo.hourlyTarget}ml
            </span>
          </div>

          {/* Hourly Column Bars */}
          {activeHours.map((bucket) => {
            const heightPercent = Math.min(100, (bucket.total / maxBucketAmount) * 100);
            const isMet = bucket.total >= bucket.targetForHour && bucket.total > 0;
            const isSelected = selectedHourBucket?.hour === bucket.hour;

            return (
              <div
                key={bucket.hour}
                onClick={() => setSelectedHourBucket(bucket)}
                className="flex-1 flex flex-col items-center justify-end h-full group cursor-pointer relative"
              >
                {/* Tooltip on hover */}
                <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-all text-[9px] font-bold text-cyan-200 bg-slate-900 px-1.5 py-0.5 rounded border border-cyan-500/40 pointer-events-none z-20 whitespace-nowrap shadow-xl">
                  {bucket.total} ml
                </div>

                {/* Vertical Bar with Equalizer Gradient */}
                <div className="w-full max-w-[24px] h-full flex items-end justify-center rounded-xl bg-slate-900/70 p-0.5 border border-slate-800/80 group-hover:border-cyan-500/50 transition">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(6, heightPercent)}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className={`w-full rounded-lg transition-all ${
                      bucket.total === 0
                        ? 'bg-slate-800/30'
                        : isMet
                        ? 'bg-gradient-to-t from-cyan-600 via-sky-500 to-cyan-300 shadow-[0_0_12px_rgba(56,189,248,0.5)]'
                        : 'bg-gradient-to-t from-sky-800 to-sky-500'
                    } ${isSelected ? 'ring-2 ring-cyan-300 ring-offset-1 ring-offset-slate-950' : ''}`}
                  />
                </div>

                {/* Hour Label */}
                <div className="mt-1.5 text-center">
                  <span
                    className={`text-[9px] sm:text-[10px] font-mono block leading-none ${
                      bucket.isCurrent
                        ? 'font-black text-cyan-300'
                        : isSelected
                        ? 'text-white font-bold'
                        : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  >
                    {bucket.hour}:00
                  </span>
                  {bucket.isCurrent && isToday && (
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mx-auto mt-1 animate-ping block" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Hour Details Drawer */}
      <AnimatePresence>
        {selectedHourBucket && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 rounded-2xl bg-slate-900/90 border border-cyan-500/30 space-y-2.5 overflow-hidden shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-cyan-300">
                  {selectedHourBucket.formattedHour} Breakdown
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Total: <strong className="text-white">{selectedHourBucket.total} ml</strong>
                </span>
              </div>

              <button
                onClick={() => setSelectedHourBucket(null)}
                className="text-[11px] text-slate-400 hover:text-white cursor-pointer px-2 py-0.5 rounded bg-slate-800/80"
              >
                Close
              </button>
            </div>

            {selectedHourBucket.logs.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-2 text-center">
                No fluids logged during this hour.
              </p>
            ) : (
              <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                {selectedHourBucket.logs.map((log) => {
                  const logTime = new Date(log.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                  return (
                    <div
                      key={log.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-cyan-500/15 text-cyan-300">
                          <ContainerIcon icon={log.icon} className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="font-semibold text-white">{log.containerName || 'Water'}</span>
                          <span className="text-[10px] text-slate-400 ml-2 font-mono">{logTime}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-bold text-cyan-300 font-mono">+{log.amount} ml</span>
                        <button
                          onClick={() => deleteLog(log.id)}
                          className="p-1 rounded text-slate-500 hover:text-rose-400 transition cursor-pointer"
                          title="Delete entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
