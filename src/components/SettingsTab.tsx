import React from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Bell,
  Clock,
  Target,
  Sun,
  Volume2,
  VolumeX,
  Download,
  RotateCcw,
  ChevronRight,
  Users,
  Cloud,
  Info,
  User,
} from 'lucide-react';
import { useWater } from '../context/WaterContext';
import { COACH_PERSONAS, CoachPersonaType } from '../types/beverages';
import { getOrCreateUserIdentity } from '../utils/squadService';

interface SettingsTabProps {
  onOpenSchedule: () => void;
  onOpenGoalModal: () => void;
  onOpenWeather: () => void;
  onOpenCoachModal: () => void;
  onOpenSquads: () => void;
  onOpenGoogleSync: () => void;
  onOpenAbout: () => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  onOpenSchedule,
  onOpenGoalModal,
  onOpenWeather,
  onOpenCoachModal,
  onOpenSquads,
  onOpenGoogleSync,
  onOpenAbout,
}) => {
  const {
    coachPersona,
    schedule,
    selectedRecord,
    weather,
    isMuted,
    toggleMute,
    exportJSON,
    exportCSV,
    clearAllHistory,
    profile,
    updateProfile,
  } = useWater();

  const user = getOrCreateUserIdentity();
  const activeCoach = COACH_PERSONAS[coachPersona] || COACH_PERSONAS.biohacker;

  return (
    <div className="w-full max-w-xl mx-auto space-y-3.5">
      {/* Header */}
      <div className="text-left px-1">
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Settings
        </h2>
        <p className="text-xs text-neutral-400">
          Personalize reminders, daily targets, and squads
        </p>
      </div>

      {/* iOS Settings Grouped Cards */}
      <div className="space-y-2.5">
        {/* 0. About AquaFlow Feature Guide Card */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={onOpenAbout}
          className="w-full p-4 rounded-3xl apple-card hover:bg-[#1c1c1e] text-left transition cursor-pointer flex items-center justify-between group"
        >
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-2xl bg-[#0a84ff]/15 text-[#0a84ff]">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-white">
                  About AquaFlow
                </h3>
                <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-[#0a84ff]/15 text-[#0a84ff]">
                  Guide
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                How rolling reminders, weather boost & squads work
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-white transition" />
        </motion.button>

        {/* 1. Google Cloud Sync Card */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={onOpenGoogleSync}
          className="w-full p-4 rounded-3xl apple-card hover:bg-[#1c1c1e] text-left transition cursor-pointer flex items-center justify-between group"
        >
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-2xl bg-[#30b0c7]/15 text-[#30b0c7]">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-white">
                  Account Sync & Device Backup
                </h3>
                {user.isGoogleLinked ? (
                  <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-[#30d158]/15 text-[#30d158]">
                    Synced
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-neutral-800 text-neutral-400">
                    Key Protected
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-400">
                {user.isGoogleLinked ? `Linked as ${user.name}` : `Key: ${user.recoveryKey} · Zero data loss`}
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-white transition" />
        </motion.button>

        {/* 2. AquaSquads Card */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={onOpenSquads}
          className="w-full p-4 rounded-3xl apple-card hover:bg-[#1c1c1e] text-left transition cursor-pointer flex items-center justify-between group"
        >
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-2xl bg-[#ff9f0a]/15 text-[#ff9f0a]">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-white">
                  AquaSquads & Friend Challenges
                </h3>
                <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-[#ff9f0a]/15 text-[#ff9f0a]">
                  Social
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Join multiple squads, track leaderboards & send sips
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-white transition" />
        </motion.button>

        {/* 3. Daily Hydration Target */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={onOpenGoalModal}
          className="w-full p-4 rounded-3xl apple-card hover:bg-[#1c1c1e] text-left transition cursor-pointer flex items-center justify-between group"
        >
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-2xl bg-[#0a84ff]/15 text-[#0a84ff]">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-white">
                  Daily Water Goal
                </h3>
                <span className="text-xs font-mono font-semibold px-2 py-0.2 rounded-full bg-[#0a84ff]/15 text-[#0a84ff]">
                  {selectedRecord.goal} ml
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Baseline daily intake target (Default: 4,000 ml)
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-white transition" />
        </motion.button>

        {/* 4. Smart Reminder Schedule */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={onOpenSchedule}
          className="w-full p-4 rounded-3xl apple-card hover:bg-[#1c1c1e] text-left transition cursor-pointer flex items-center justify-between group"
        >
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-2xl bg-[#5e5ce6]/15 text-[#5e5ce6]">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-white">
                  Reminder Intervals
                </h3>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.2 rounded-full ${
                    schedule.enabled ? 'bg-[#0a84ff]/15 text-[#0a84ff]' : 'bg-neutral-800 text-neutral-400'
                  }`}
                >
                  {schedule.enabled ? `Every ${schedule.intervalMinutes}m` : 'Disabled'}
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Active {schedule.wakeTime} – {schedule.sleepTime} (Silent sleep gate)
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-white transition" />
        </motion.button>

        {/* 5. AI Coach Voice Selector */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={onOpenCoachModal}
          className="w-full p-4 rounded-3xl apple-card hover:bg-[#1c1c1e] text-left transition cursor-pointer flex items-center justify-between group"
        >
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-2xl bg-neutral-800 text-2xl">
              {activeCoach.emoji}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                Coach Voice: {activeCoach.name}
              </h3>
              <p className="text-xs text-neutral-400">
                {activeCoach.title} · {activeCoach.description}
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-white transition" />
        </motion.button>

        {/* 6. City Weather Auto-Adjustment */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={onOpenWeather}
          className="w-full p-4 rounded-3xl apple-card hover:bg-[#1c1c1e] text-left transition cursor-pointer flex items-center justify-between group"
        >
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-2xl bg-[#ff9f0a]/15 text-[#ff9f0a]">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                Weather Fluid Compensation
              </h3>
              <p className="text-xs text-neutral-400">
                {weather ? `${weather.city.split(',')[0]} (${weather.temperature}°C) · +${weather.recommendedAdjustmentMl}ml added` : 'Auto-adjusts goal for heat and humidity'}
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-white transition" />
        </motion.button>

        {/* 7. Body Silhouette & Avatar Style */}
        <div className="p-4 rounded-3xl apple-card space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 rounded-2xl bg-[#bf5af2]/15 text-[#bf5af2]">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Body Silhouette & Visual Mode
                </h3>
                <p className="text-xs text-neutral-400">
                  Custom avatar & interactive biological organ tracking
                </p>
              </div>
            </div>
          </div>

          {/* Silhouette Type Buttons */}
          <div className="grid grid-cols-4 gap-1.5 pt-1">
            {(
              [
                { id: 'neutral', label: 'Athletic', icon: '🧍' },
                { id: 'male', label: 'Male', icon: '👨' },
                { id: 'female', label: 'Female', icon: '👩' },
                { id: 'cute', label: 'Cute', icon: '🧸' },
              ] as const
            ).map((item) => {
              const isSelected = (profile.avatarType || 'neutral') === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => updateProfile({ avatarType: item.id, progressDisplayMode: 'body' })}
                  className={`p-2 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center gap-1 ${
                    isSelected && (profile.progressDisplayMode || 'body') === 'body'
                      ? 'bg-[#0a84ff]/20 border-[#0a84ff] text-white shadow-md'
                      : 'bg-black/40 border-white/[0.06] text-neutral-400 hover:text-white'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-[10px] font-semibold truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 8. Sound Toggle */}
        <div className="p-4 rounded-3xl apple-card flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-2xl bg-neutral-800 text-neutral-300">
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                Audio Water Chimes
              </h3>
              <p className="text-xs text-neutral-400">
                {isMuted ? 'Silent mode active' : 'Subtle fluid audio feedback on logging'}
              </p>
            </div>
          </div>

          <button
            onClick={toggleMute}
            className={`px-3.5 py-1.5 rounded-xl font-semibold text-xs transition cursor-pointer ${
              isMuted
                ? 'bg-neutral-800 text-neutral-400 hover:text-white'
                : 'apple-btn-primary'
            }`}
          >
            {isMuted ? 'Unmute' : 'Mute'}
          </button>
        </div>

        {/* 8. Export Data */}
        <div className="p-4 rounded-3xl apple-card space-y-3">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-2xl bg-neutral-800 text-neutral-300">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                Export Your Data
              </h3>
              <p className="text-xs text-neutral-400">
                Free export anytime to CSV or JSON backup
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={exportCSV}
              className="py-2.5 px-3 rounded-xl apple-btn-secondary font-semibold text-xs transition cursor-pointer text-center"
            >
              Export CSV
            </button>
            <button
              onClick={exportJSON}
              className="py-2.5 px-3 rounded-xl apple-btn-secondary font-semibold text-xs transition cursor-pointer text-center"
            >
              Export JSON Backup
            </button>
          </div>
        </div>

        {/* 9. History Reset */}
        <div className="flex items-center justify-end pt-1 px-1">
          <button
            onClick={clearAllHistory}
            className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-rose-400 cursor-pointer font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset History</span>
          </button>
        </div>
      </div>
    </div>
  );
};
