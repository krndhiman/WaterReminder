import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  TrendingUp,
  Flame,
  Award,
  ChevronRight,
  RotateCcw,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Droplet,
} from 'lucide-react';
import { useWater } from '../context/WaterContext';
import { formatDisplayDate, getTodayDateString } from '../utils/storage';
import { DayRecord } from '../types/water';

export const HistoryAnalytics: React.FC = () => {
  const {
    allRecords,
    selectedDate,
    setSelectedDate,
    streakInfo,
    clearAllHistory,
    profile,
  } = useWater();

  const [viewRange, setViewRange] = useState<'7days' | '14days'>('7days');
  const todayStr = getTodayDateString();

  // Generate date array for the chart
  const daysCount = viewRange === '7days' ? 7 : 14;
  const chartDays: { dateStr: string; label: string; record: DayRecord }[] = [];

  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'narrow' });
    const record = allRecords[dateStr] || {
      date: dateStr,
      goal: profile.dailyGoal,
      logs: [],
      total: 0,
    };
    chartDays.push({ dateStr, label: dayLabel, record });
  }

  // Calculate stats from real recorded days only
  const allRecordedDays = Object.values(allRecords).sort((a, b) => b.date.localeCompare(a.date));
  const activeDaysWithWater = allRecordedDays.filter((r) => r.total > 0);
  const totalVolumeAllTime = activeDaysWithWater.reduce((acc, r) => acc + r.total, 0);
  const averageDailyIntake = activeDaysWithWater.length > 0
    ? Math.round(activeDaysWithWater.reduce((acc, r) => acc + r.total, 0) / activeDaysWithWater.length)
    : 0;

  const maxChartGoal = Math.max(profile.dailyGoal * 1.25, ...chartDays.map((d) => d.record.total), 4200);

  return (
    <div className="w-full max-w-xl mx-auto space-y-3.5 overflow-hidden">
      {/* 4 Apple Health Bento Metric Cards */}
      <div className="grid grid-cols-2 gap-2.5 w-full">
        {/* Streak Card */}
        <div className="p-4 rounded-3xl apple-card flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Current Streak</span>
            <Flame className="w-4 h-4 text-[#ff9f0a]" />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {streakInfo.currentStreak}
              </span>
              <span className="text-xs text-neutral-400 font-medium">days</span>
            </div>
            <span className="text-[11px] text-neutral-500 block mt-0.5">
              Best: {streakInfo.bestStreak} days
            </span>
          </div>
        </div>

        {/* Daily Average Card */}
        <div className="p-4 rounded-3xl apple-card flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Daily Average</span>
            <TrendingUp className="w-4 h-4 text-[#0a84ff]" />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {averageDailyIntake.toLocaleString()}
              </span>
              <span className="text-xs text-neutral-400 font-medium">ml</span>
            </div>
            <span className="text-[11px] text-neutral-500 block mt-0.5">
              Goal: {profile.dailyGoal} ml
            </span>
          </div>
        </div>

        {/* Total Consumed */}
        <div className="p-4 rounded-3xl apple-card flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">All-Time Total</span>
            <Droplet className="w-4 h-4 text-[#30b0c7]" />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {(totalVolumeAllTime / 1000).toFixed(1)}
              </span>
              <span className="text-xs text-neutral-400 font-medium">L</span>
            </div>
            <span className="text-[11px] text-neutral-500 block mt-0.5">
              Across {activeDaysWithWater.length} active days
            </span>
          </div>
        </div>

        {/* Completion Rate */}
        <div className="p-4 rounded-3xl apple-card flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Goal Rate</span>
            <Award className="w-4 h-4 text-[#30d158]" />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {activeDaysWithWater.length > 0
                  ? Math.round(
                      (activeDaysWithWater.filter((r) => r.total >= r.goal * 0.95).length /
                        activeDaysWithWater.length) *
                        100
                    )
                  : 0}
              </span>
              <span className="text-xs text-neutral-400 font-medium">%</span>
            </div>
            <span className="text-[11px] text-neutral-500 block mt-0.5">
              Days goal achieved
            </span>
          </div>
        </div>
      </div>

      {/* Multi-Day Activity Chart */}
      <div className="rounded-3xl apple-card p-4 sm:p-5 space-y-3 overflow-hidden w-full">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.06] pb-3">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white">
              Hydration Trends
            </h3>
            <p className="text-xs text-neutral-400">
              Daily fluid intake vs {profile.dailyGoal} ml goal
            </p>
          </div>

          {/* View Range Selector */}
          <div className="flex p-0.5 rounded-xl bg-black/40 border border-white/[0.08] text-xs">
            <button
              onClick={() => setViewRange('7days')}
              className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer text-xs ${
                viewRange === '7days' ? 'bg-[#1c1c1e] text-white shadow-sm' : 'text-neutral-400 hover:text-white'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setViewRange('14days')}
              className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer text-xs ${
                viewRange === '14days' ? 'bg-[#1c1c1e] text-white shadow-sm' : 'text-neutral-400 hover:text-white'
              }`}
            >
              14 Days
            </button>
          </div>
        </div>

        {/* Responsive Chart Container with ZERO Leaks */}
        <div className="w-full overflow-hidden">
          <div
            className={`h-48 flex items-end justify-between pt-4 px-1 relative w-full ${
              viewRange === '14days' ? 'gap-1 sm:gap-1.5' : 'gap-2 sm:gap-3'
            }`}
          >
            {/* Target 4000ml Goal Reference Line */}
            <div
              className="absolute left-0 right-0 border-b border-dashed border-[#30d158]/30 z-10 pointer-events-none flex items-center justify-end pr-1"
              style={{
                bottom: `${(profile.dailyGoal / maxChartGoal) * 100}%`,
              }}
            >
              <span className="text-[9px] font-mono font-medium text-[#30d158] bg-black/80 px-1.5 py-0.5 rounded border border-[#30d158]/20">
                {profile.dailyGoal} ml
              </span>
            </div>

            {/* Render Days */}
            {chartDays.map(({ dateStr, label, record }) => {
              const heightPercent = Math.min(100, (record.total / maxChartGoal) * 100);
              const isGoalMet = record.total >= record.goal;
              const isCurrentSelected = selectedDate === dateStr;
              const isTodayDate = dateStr === todayStr;

              return (
                <div
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className="flex-1 min-w-0 flex flex-col items-center justify-end h-full group cursor-pointer relative"
                >
                  {/* Minimal Tooltip */}
                  <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition text-[10px] font-medium text-white bg-[#1c1c1e] px-2 py-0.5 rounded-md border border-white/10 pointer-events-none z-20 whitespace-nowrap shadow-lg">
                    {formatDisplayDate(dateStr)}: {record.total.toLocaleString()} ml
                  </div>

                  {/* Vertical Bar */}
                  <div className="w-full max-w-[28px] h-full flex items-end justify-center rounded-xl bg-black/30 p-0.5 border border-white/[0.04] group-hover:border-white/20 transition">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(4, heightPercent)}%` }}
                      transition={{ duration: 0.35, ease: 'easeOut' }}
                      className={`w-full rounded-lg transition-all ${
                        record.total === 0
                          ? 'bg-neutral-800/40'
                          : isGoalMet
                          ? 'bg-[#30d158]'
                          : 'bg-[#0a84ff]'
                      } ${isCurrentSelected ? 'ring-2 ring-white/80' : ''}`}
                    />
                  </div>

                  {/* Day label */}
                  <div className="mt-1.5 text-center w-full">
                    <span
                      className={`text-[10px] font-medium block truncate ${
                        isTodayDate
                          ? 'text-[#0a84ff] font-bold'
                          : isCurrentSelected
                          ? 'text-white'
                          : 'text-neutral-500'
                      }`}
                    >
                      {isTodayDate ? 'Today' : label}
                    </span>
                    <span className="text-[9px] font-mono text-neutral-600 block truncate">
                      {record.total > 0 ? `${(record.total / 1000).toFixed(1)}L` : '-'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Past Days Detailed List */}
      <div className="rounded-3xl apple-card p-4 sm:p-5 space-y-3 overflow-hidden w-full">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-[#0a84ff]" />
            <h3 className="text-xs sm:text-sm font-bold text-white">
              Previous Days Log Archive
            </h3>
          </div>

          <button
            onClick={clearAllHistory}
            className="text-[11px] text-neutral-400 hover:text-rose-400 transition cursor-pointer font-medium"
            title="Reset history"
          >
            Clear History
          </button>
        </div>

        {/* Day Row Entries */}
        {allRecordedDays.length === 0 || (allRecordedDays.length === 1 && allRecordedDays[0].total === 0) ? (
          <div className="py-6 text-center text-neutral-500 space-y-1">
            <p className="text-xs font-medium text-neutral-400">No past drink history logged yet.</p>
            <p className="text-[11px] text-neutral-600">
              Your daily hydration records will automatically appear here as you log water each day.
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {allRecordedDays.map((record) => {
              const isSelected = selectedDate === record.date;
              const percent = Math.min(100, Math.round((record.total / record.goal) * 100));
              const isGoalAchieved = record.total >= record.goal;

              return (
                <motion.div
                  key={record.date}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedDate(record.date)}
                  className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#1c1c1e] border-[#0a84ff]/40 shadow-sm'
                      : 'bg-black/20 border-white/[0.04] hover:border-white/[0.1]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-2 rounded-xl shrink-0 ${
                        isGoalAchieved
                          ? 'bg-[#30d158]/15 text-[#30d158]'
                          : record.total > 0
                          ? 'bg-[#0a84ff]/15 text-[#0a84ff]'
                          : 'bg-neutral-800 text-neutral-500'
                      }`}
                    >
                      {isGoalAchieved ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <Droplet className="w-4 h-4" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-white truncate">
                          {formatDisplayDate(record.date)}
                        </span>
                        {record.date === todayStr && (
                          <span className="text-[9px] bg-[#0a84ff] text-white font-semibold px-1.5 py-0.2 rounded-full uppercase">
                            Today
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-neutral-400 font-mono block truncate">
                        {record.logs.length} drinks · Goal: {record.goal} ml
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <div className="text-right">
                      <span className="text-xs font-semibold font-mono text-white block">
                        {record.total.toLocaleString()} ml
                      </span>
                      <span
                        className={`text-[10px] font-medium ${
                          isGoalAchieved ? 'text-[#30d158]' : 'text-[#0a84ff]'
                        }`}
                      >
                        {percent}%
                      </span>
                    </div>

                    <ChevronRight className="w-3.5 h-3.5 text-neutral-600" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
