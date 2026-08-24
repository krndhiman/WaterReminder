import React from 'react';
import {
  Flame,
  Mic,
  Volume2,
  VolumeX,
  Users,
  Cloud,
  Info,
} from 'lucide-react';
import { useWater } from '../context/WaterContext';

interface ReminderBannerProps {
  onOpenGoalModal: () => void;
  onOpenWeather: () => void;
  onOpenVoice: () => void;
  onOpenSquads: () => void;
  onOpenGoogleSync: () => void;
  onOpenAbout: () => void;
}

export const ReminderBanner: React.FC<ReminderBannerProps> = ({
  onOpenGoalModal,
  onOpenWeather,
  onOpenVoice,
  onOpenSquads,
  onOpenGoogleSync,
  onOpenAbout,
}) => {
  const {
    streakInfo,
    weather,
    isMuted,
    toggleMute,
  } = useWater();

  return (
    <div className="w-full max-w-xl mx-auto space-y-1.5 px-0.5">
      {/* Apple Health Minimalist Top Bar */}
      <div className="flex items-center justify-between gap-3 w-full">
        {/* Brand, Streak & Weather */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <button
            onClick={onOpenAbout}
            className="w-10 h-10 rounded-2xl bg-[#141416] border border-white/[0.08] flex items-center justify-center text-lg shrink-0 cursor-pointer hover:border-white/[0.18] transition"
            title="About AquaFlow"
          >
            💧
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1
                onClick={onOpenAbout}
                className="text-lg font-bold text-white tracking-tight cursor-pointer hover:text-neutral-300 transition"
              >
                AquaFlow
              </h1>

              {/* Minimal Streak Flame Pill */}
              <div className="flex items-center gap-1 bg-[#ff9f0a]/10 border border-[#ff9f0a]/20 text-[#ff9f0a] text-[11px] font-semibold px-2.5 py-0.5 rounded-full shrink-0">
                <Flame className="w-3 h-3 fill-[#ff9f0a]" />
                <span>{streakInfo.currentStreak}d Streak</span>
              </div>
            </div>

            {/* City Weather Line */}
            <button
              onClick={onOpenWeather}
              className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-white transition cursor-pointer truncate max-w-full font-medium"
              title="Click to view or set city weather"
            >
              <span>{weather ? weather.conditionIcon : '☀️'}</span>
              <span className="truncate">
                {weather ? `${weather.city.split(',')[0]} (${weather.temperature}°C)` : 'Set Weather'}
              </span>
              {weather && weather.recommendedAdjustmentMl > 0 && (
                <span className="text-[10px] text-[#0a84ff] font-medium shrink-0">
                  (+{weather.recommendedAdjustmentMl}ml)
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Right Action Icons (Quiet Minimalist Circles) */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Squads Button */}
          <button
            onClick={onOpenSquads}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#141416] border border-white/[0.08] hover:border-white/[0.2] text-xs font-semibold text-neutral-200 transition cursor-pointer"
            title="Squads & Challenges"
          >
            <Users className="w-3.5 h-3.5 text-[#0a84ff]" />
            <span className="hidden sm:inline">Squads</span>
          </button>

          {/* Voice Log Button */}
          <button
            onClick={onOpenVoice}
            className="p-2 rounded-xl bg-[#141416] border border-white/[0.08] hover:border-white/[0.2] text-neutral-300 hover:text-white transition cursor-pointer"
            title="Voice Log Water Intake (Hotkey: 'V')"
          >
            <Mic className="w-3.5 h-3.5 text-[#0a84ff]" />
          </button>

          {/* Cloud Sync Button */}
          <button
            onClick={onOpenGoogleSync}
            className="p-2 rounded-xl bg-[#141416] border border-white/[0.08] hover:border-white/[0.2] text-neutral-300 hover:text-white transition cursor-pointer"
            title="Cloud Sync & Backup"
          >
            <Cloud className="w-3.5 h-3.5" />
          </button>

          {/* Info Button */}
          <button
            onClick={onOpenAbout}
            className="p-2 rounded-xl bg-[#141416] border border-white/[0.08] hover:border-white/[0.2] text-neutral-400 hover:text-white transition cursor-pointer"
            title="About App"
          >
            <Info className="w-3.5 h-3.5" />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleMute}
            className={`p-2 rounded-xl border transition cursor-pointer ${
              isMuted
                ? 'bg-transparent border-transparent text-neutral-600'
                : 'bg-[#141416] border-white/[0.08] text-neutral-300 hover:text-white'
            }`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
