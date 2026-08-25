import React from 'react';
import {
  Flame,
  Bell,
  Volume2,
  VolumeX,
  Settings2,
} from 'lucide-react';
import { useWater } from '../context/WaterContext';

interface ReminderBannerProps {
  onOpenGoalModal: () => void;
  onOpenWeather: () => void;
  onOpenVoice: () => void;
  onOpenSquads: () => void;
  onOpenGoogleSync: () => void;
  onOpenAbout: () => void;
  onOpenSchedule: () => void;
}

export const ReminderBanner: React.FC<ReminderBannerProps> = ({
  onOpenGoalModal,
  onOpenWeather,
  onOpenVoice,
  onOpenSquads,
  onOpenGoogleSync,
  onOpenAbout,
  onOpenSchedule,
}) => {
  const {
    streakInfo,
    weather,
    isMuted,
    toggleMute,
    schedule,
  } = useWater();

  return (
    <div className="w-full max-w-xl mx-auto px-0.5">
      {/* Clean Apple-style single-row header */}
      <div className="flex items-center justify-between gap-2 w-full">

        {/* Left: Brand + Streak */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {/* App Icon */}
          <button
            onClick={onOpenAbout}
            className="w-10 h-10 rounded-2xl overflow-hidden border border-white/[0.08] shrink-0 cursor-pointer hover:border-white/[0.2] transition shadow-md"
            title="About AquaFlow"
          >
            <img
              src="/icon.jpg"
              alt="AquaFlow"
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to emoji if image fails
                const btn = e.currentTarget.parentElement as HTMLButtonElement;
                if (btn) {
                  e.currentTarget.style.display = 'none';
                  btn.textContent = '💧';
                  btn.style.display = 'flex';
                  btn.style.alignItems = 'center';
                  btn.style.justifyContent = 'center';
                  btn.style.fontSize = '20px';
                  btn.style.background = '#141416';
                }
              }}
            />
          </button>

          {/* Title + Streak + Weather */}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1
                onClick={onOpenAbout}
                className="text-[17px] font-bold text-white tracking-tight cursor-pointer hover:text-neutral-200 transition leading-none"
              >
                AquaFlow
              </h1>

              {/* Streak pill */}
              <div className="flex items-center gap-1 bg-[#ff9f0a]/10 border border-[#ff9f0a]/20 text-[#ff9f0a] text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0">
                <Flame className="w-2.5 h-2.5 fill-[#ff9f0a]" />
                <span>{streakInfo.currentStreak}d</span>
              </div>
            </div>

            {/* Weather subtitle — clickable */}
            <button
              onClick={onOpenWeather}
              className="flex items-center gap-1 text-[11px] text-neutral-500 hover:text-neutral-300 transition cursor-pointer truncate max-w-full mt-0.5"
              title="Set or change weather city"
            >
              <span>{weather ? weather.conditionIcon : '☀️'}</span>
              <span className="truncate">
                {weather
                  ? `${weather.city.split(',')[0]}, ${weather.temperature}°C`
                  : 'Tap to set weather'}
              </span>
              {weather && weather.recommendedAdjustmentMl > 0 && (
                <span className="text-[#0a84ff] font-medium shrink-0">
                  +{weather.recommendedAdjustmentMl}ml
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Right: 3 minimal icon buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Reminder Bell / Schedule */}
          <button
            onClick={onOpenSchedule}
            className="p-2 rounded-xl bg-[#141416] border border-white/[0.08] hover:border-white/[0.2] text-[#0a84ff] hover:text-white transition cursor-pointer"
            title="Reminder Schedule & Alerts"
          >
            <Bell className="w-4 h-4" />
          </button>

          {/* Mute toggle */}
          <button
            onClick={toggleMute}
            className={`p-2 rounded-xl border transition cursor-pointer ${
              isMuted
                ? 'bg-transparent border-transparent text-neutral-600 hover:text-neutral-400'
                : 'bg-[#141416] border-white/[0.08] hover:border-white/[0.2] text-neutral-300 hover:text-white'
            }`}
            title={isMuted ? 'Unmute sound' : 'Mute sound'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Overflow / more: opens Settings tab equivalent — repurposed as a small settings hint */}
          <button
            onClick={onOpenGoogleSync}
            className="p-2 rounded-xl bg-[#141416] border border-white/[0.08] hover:border-white/[0.2] text-neutral-400 hover:text-white transition cursor-pointer"
            title="Cloud Sync & Backup"
          >
            <Settings2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
