import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Droplet,
  BarChart3,
  Settings,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Clock,
  Mic,
  Users,
  Cloud,
} from 'lucide-react';
import { useWater, WaterProvider } from './context/WaterContext';
import { LiquidBottle } from './components/LiquidBottle';
import { QuickAddBar } from './components/QuickAddBar';
import { ReminderBanner } from './components/ReminderBanner';
import { NotificationBanner } from './components/NotificationBanner';
import { HistoryAnalytics } from './components/HistoryAnalytics';
import { SettingsTab } from './components/SettingsTab';
import { CustomAmountModal } from './components/CustomAmountModal';
import { PresetEditorModal } from './components/PresetEditorModal';
import { ScheduleModal } from './components/ScheduleModal';
import { GoalSettingsModal } from './components/GoalSettingsModal';
import { WeatherWidgetModal } from './components/WeatherWidgetModal';
import { VoiceLoggerModal } from './components/VoiceLoggerModal';
import { SquadsModal } from './components/SquadsModal';
import { GoogleAuthModal } from './components/GoogleAuthModal';
import { AboutAppModal } from './components/AboutAppModal';
import { LockScreenGuideModal } from './components/LockScreenGuideModal';
import { ReminderModal } from './components/ReminderModal';
import { CelebrationModal } from './components/CelebrationModal';
import { ContainerIcon } from './components/ContainerIcon';
import { formatDisplayDate, getTodayDateString } from './utils/storage';
import { COACH_PERSONAS, CoachPersonaType } from './types/beverages';
import { syncIntakeToAllSquads, joinSquadByCode } from './utils/squadService';

type NavigationTab = 'hydrate' | 'history' | 'settings';

const MainLayout: React.FC = () => {
  const {
    selectedDate,
    setSelectedDate,
    selectedRecord,
    isToday,
    deleteLog,
    profile,
    streakInfo,
    presets,
    quickAdd,
    schedule,
    secondsUntilNextReminder,
    paceInfo,
    coachPersona,
    setCoachPersona,
  } = useWater();

  const [activeTab, setActiveTab] = useState<NavigationTab>('hydrate');

  // Modal open states
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [isPresetEditorOpen, setIsPresetEditorOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isWeatherModalOpen, setIsWeatherModalOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isCoachModalOpen, setIsCoachModalOpen] = useState(false);
  const [isSquadsModalOpen, setIsSquadsModalOpen] = useState(false);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isLockScreenGuideOpen, setIsLockScreenGuideOpen] = useState(false);

  const todayStr = getTodayDateString();

  // Deep Link Parser for WhatsApp / Telegram Invite Links (#join=SQUAD-XYZ)
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes('join=')) {
      const code = hash.split('join=')[1];
      if (code) {
        joinSquadByCode(code, selectedRecord.goal, selectedRecord.total, streakInfo.currentStreak);
        setIsSquadsModalOpen(true);
      }
    }
  }, []);

  // Sync latest intake to all active squads
  useEffect(() => {
    syncIntakeToAllSquads(selectedRecord.total, selectedRecord.goal, streakInfo.currentStreak);
  }, [selectedRecord.total, selectedRecord.goal, streakInfo.currentStreak]);

  // Keyboard Shortcuts (1-6 for presets, 'v' for voice)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      const keyNum = parseInt(e.key, 10);
      if (keyNum >= 1 && keyNum <= presets.length) {
        quickAdd(presets[keyNum - 1]);
      } else if (e.key.toLowerCase() === 'v') {
        setIsVoiceModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [presets, quickAdd]);

  const handlePrevDay = () => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const prev = new Date(y, m - 1, d - 1);
    const newStr = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}-${String(prev.getDate()).padStart(2, '0')}`;
    setSelectedDate(newStr);
  };

  const handleNextDay = () => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const next = new Date(y, m - 1, d + 1);
    const newStr = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}-${String(next.getDate()).padStart(2, '0')}`;
    if (newStr <= todayStr) {
      setSelectedDate(newStr);
    }
  };

  const formatCountdown = (totalSecs: number) => {
    if (totalSecs <= 0) return 'Due now';
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    if (mins >= 60) {
      const hrs = Math.floor(mins / 60);
      const remainingMins = mins % 60;
      return `${hrs}h ${remainingMins}m`;
    }
    return `${mins}m ${String(secs).padStart(2, '0')}s`;
  };

  return (
    <div className="relative min-h-screen pb-28 text-[#f5f5f7] bg-black selection:bg-[#0a84ff] selection:text-white">
      <div className="max-w-xl mx-auto px-3.5 pt-4 space-y-4">
        {/* Top Header */}
        <ReminderBanner
          onOpenGoalModal={() => setIsGoalModalOpen(true)}
          onOpenWeather={() => setIsWeatherModalOpen(true)}
          onOpenVoice={() => setIsVoiceModalOpen(true)}
          onOpenSquads={() => setIsSquadsModalOpen(true)}
          onOpenGoogleSync={() => setIsGoogleModalOpen(true)}
          onOpenAbout={() => setIsAboutModalOpen(true)}
          onOpenSchedule={() => setIsScheduleModalOpen(true)}
        />

        {/* System Notification Permission & Status Banner */}
        <NotificationBanner
          onOpenSchedule={() => setIsScheduleModalOpen(true)}
          onOpenLockScreenGuide={() => setIsLockScreenGuideOpen(true)}
        />

        {/* ========================================================
            TAB 1: HYDRATE (The Core, Clean Daily Screen)
        ======================================================== */}
        {activeTab === 'hydrate' && (
          <motion.div
            key="tab-hydrate"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="space-y-4"
          >
            {/* Minimal Next Alert Status Bar */}
            <div className="p-3.5 rounded-3xl apple-card flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-2 rounded-xl bg-[#0a84ff]/15 text-[#0a84ff] shrink-0">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <div className="truncate">
                  <span className="text-neutral-400">Next Reminder: </span>
                  <span className="font-mono font-semibold text-white">
                    {schedule.enabled ? formatCountdown(secondsUntilNextReminder) : 'Disabled'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <span
                  className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                    paceInfo.status === 'goal_completed'
                      ? 'bg-[#30d158]/15 text-[#30d158]'
                      : paceInfo.status === 'ahead'
                      ? 'bg-[#0a84ff]/15 text-[#0a84ff]'
                      : paceInfo.status === 'behind'
                      ? 'bg-[#ff9f0a]/15 text-[#ff9f0a]'
                      : 'bg-neutral-800 text-neutral-300'
                  }`}
                >
                  {paceInfo.status.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Central Apple Minimalist Fluid Hero */}
            <LiquidBottle onQuickAdd={() => setIsCustomModalOpen(true)} />

            {/* 1-Tap Quick Sips Bar */}
            <QuickAddBar
              onOpenCustomModal={() => setIsCustomModalOpen(true)}
              onOpenPresetEditor={() => setIsPresetEditorOpen(true)}
            />

            {/* Date Navigator Bar */}
            <div className="flex items-center justify-between p-2 rounded-2xl apple-card max-w-sm mx-auto">
              <button
                onClick={handlePrevDay}
                className="p-1.5 rounded-xl hover:bg-white/[0.08] text-neutral-400 hover:text-white transition cursor-pointer flex items-center gap-1 text-xs font-medium"
                title="Previous Day"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Prev</span>
              </button>

              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-white">
                  {formatDisplayDate(selectedDate)}
                </span>
                {!isToday && (
                  <button
                    onClick={() => setSelectedDate(todayStr)}
                    className="text-[9px] bg-[#0a84ff] text-white font-semibold px-1.5 py-0.2 rounded-full uppercase cursor-pointer"
                  >
                    Today
                  </button>
                )}
              </div>

              <button
                onClick={handleNextDay}
                disabled={isToday}
                className={`p-1.5 rounded-xl transition flex items-center gap-1 text-xs font-medium ${
                  isToday
                    ? 'text-neutral-700 cursor-not-allowed'
                    : 'text-neutral-400 hover:text-white hover:bg-white/[0.08] cursor-pointer'
                }`}
                title="Next Day"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Today's Sips List */}
            <div className="w-full rounded-3xl apple-card p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
                <div className="flex items-center gap-2">
                  <Droplet className="w-4 h-4 text-[#0a84ff]" />
                  <h3 className="text-xs sm:text-sm font-bold text-white">
                    {formatDisplayDate(selectedDate)}'s Sips ({selectedRecord.logs.length})
                  </h3>
                </div>

                <span className="text-xs font-mono text-neutral-300 font-semibold">
                  {selectedRecord.total.toLocaleString()} ml logged
                </span>
              </div>

              {selectedRecord.logs.length === 0 ? (
                <div className="py-6 text-center text-neutral-500 space-y-1">
                  <p className="text-xs font-medium text-neutral-400">No drinks logged yet today.</p>
                  <p className="text-[11px] text-neutral-600">
                    Tap a quick preset above or press hotkeys 1–6.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {selectedRecord.logs.slice().reverse().map((log) => {
                    const logTime = new Date(log.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    return (
                      <motion.div
                        key={log.id}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-between p-3 rounded-2xl bg-black/20 border border-white/[0.04] text-xs hover:border-white/[0.1] transition"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-[#0a84ff]/10 text-[#0a84ff]">
                            <ContainerIcon icon={log.icon} className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="font-semibold text-white block">{log.containerName || 'Water'}</span>
                            <span className="text-[10px] text-neutral-500 font-mono">{logTime}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-xs font-semibold font-mono text-white">
                            +{log.amount} ml
                          </span>
                          <button
                            onClick={() => deleteLog(log.id, selectedRecord.date)}
                            className="p-1.5 rounded-lg text-neutral-600 hover:text-rose-400 hover:bg-rose-950/20 transition cursor-pointer"
                            title="Delete entry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ========================================================
            TAB 2: HISTORY (Weekly Trends & Stats)
        ======================================================== */}
        {activeTab === 'history' && (
          <motion.div
            key="tab-history"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
          >
            <HistoryAnalytics />
          </motion.div>
        )}

        {/* ========================================================
            TAB 3: SETTINGS (Goal, Reminders, Coach Voice, Cloud, About)
        ======================================================== */}
        {activeTab === 'settings' && (
          <motion.div
            key="tab-settings"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
          >
            <SettingsTab
              onOpenSchedule={() => setIsScheduleModalOpen(true)}
              onOpenGoalModal={() => setIsGoalModalOpen(true)}
              onOpenWeather={() => setIsWeatherModalOpen(true)}
              onOpenCoachModal={() => setIsCoachModalOpen(true)}
              onOpenSquads={() => setIsSquadsModalOpen(true)}
              onOpenGoogleSync={() => setIsGoogleModalOpen(true)}
              onOpenAbout={() => setIsAboutModalOpen(true)}
            />
          </motion.div>
        )}
      </div>

      {/* ========================================================
          FLOATING 3-TAB BOTTOM APP NAVIGATION DOCK (iOS 18 Glass Pill)
      ======================================================== */}
      <div className="fixed bottom-4 left-0 right-0 z-40 max-w-xs mx-auto px-2 pointer-events-auto">
        <div className="p-1 rounded-full apple-glass shadow-2xl flex items-center justify-around">
          {/* Tab 1: Hydrate */}
          <button
            onClick={() => setActiveTab('hydrate')}
            className={`relative flex flex-col items-center justify-center py-2 px-5 rounded-full transition-all cursor-pointer ${
              activeTab === 'hydrate'
                ? 'text-white font-semibold'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            {activeTab === 'hydrate' && (
              <motion.div
                layoutId="activeTabPill"
                className="absolute inset-0 bg-white/[0.14] rounded-full -z-10"
                transition={{ type: 'spring', damping: 28, stiffness: 380 }}
              />
            )}
            <Droplet className="w-4 h-4 fill-current" />
            <span className="text-[10px] mt-0.5">Hydrate</span>
          </button>

          {/* Tab 2: History */}
          <button
            onClick={() => setActiveTab('history')}
            className={`relative flex flex-col items-center justify-center py-2 px-5 rounded-full transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'text-white font-semibold'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            {activeTab === 'history' && (
              <motion.div
                layoutId="activeTabPill"
                className="absolute inset-0 bg-white/[0.14] rounded-full -z-10"
                transition={{ type: 'spring', damping: 28, stiffness: 380 }}
              />
            )}
            <BarChart3 className="w-4 h-4" />
            <span className="text-[10px] mt-0.5">History</span>
          </button>

          {/* Tab 3: Settings */}
          <button
            onClick={() => setActiveTab('settings')}
            className={`relative flex flex-col items-center justify-center py-2 px-5 rounded-full transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'text-white font-semibold'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            {activeTab === 'settings' && (
              <motion.div
                layoutId="activeTabPill"
                className="absolute inset-0 bg-white/[0.14] rounded-full -z-10"
                transition={{ type: 'spring', damping: 28, stiffness: 380 }}
              />
            )}
            <Settings className="w-4 h-4" />
            <span className="text-[10px] mt-0.5">Settings</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          CORE IMMERSIVE FULL-SCREEN MODALS
      ======================================================== */}
      <CustomAmountModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
      />

      <PresetEditorModal
        isOpen={isPresetEditorOpen}
        onClose={() => setIsPresetEditorOpen(false)}
      />

      <ScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onOpenLockScreenGuide={() => setIsLockScreenGuideOpen(true)}
      />

      <GoalSettingsModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
      />

      <WeatherWidgetModal
        isOpen={isWeatherModalOpen}
        onClose={() => setIsWeatherModalOpen(false)}
      />

      <VoiceLoggerModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
      />

      {/* AquaSquads & Friend Challenges Modal */}
      <SquadsModal
        isOpen={isSquadsModalOpen}
        onClose={() => setIsSquadsModalOpen(false)}
      />

      {/* Google Sign-In & Zero-Cost Cloud Sync Modal */}
      <GoogleAuthModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
      />

      {/* About AquaFlow Feature Guide Modal */}
      <AboutAppModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
      />

      {/* Coach Voice Modal */}
      <AnimatePresence>
        {isCoachModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCoachModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 15 }}
              className="relative w-full max-w-xl max-h-[90vh] sm:max-h-[85vh] rounded-3xl apple-glass-modal p-6 z-10 overflow-hidden flex flex-col space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] shrink-0">
                <div>
                  <h3 className="text-base font-bold text-white">
                    Reminder Coach Voice
                  </h3>
                  <p className="text-xs text-neutral-400">Select your reminder tone</p>
                </div>

                <button
                  onClick={() => setIsCoachModalOpen(false)}
                  className="p-1.5 rounded-full text-neutral-400 hover:text-white bg-white/[0.08] transition cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2.5 flex-1 overflow-y-auto pr-1">
                {(Object.keys(COACH_PERSONAS) as CoachPersonaType[]).map((key) => {
                  const p = COACH_PERSONAS[key];
                  const isSelected = coachPersona === key;

                  return (
                    <button
                      key={key}
                      onClick={() => {
                        setCoachPersona(key);
                        setIsCoachModalOpen(false);
                      }}
                      className={`w-full p-3.5 rounded-2xl text-left transition cursor-pointer flex items-center gap-3.5 border ${
                        isSelected
                          ? 'bg-[#1c1c1e] border-[#0a84ff]'
                          : 'bg-black/30 border-white/[0.06] text-neutral-300 hover:bg-white/[0.04]'
                      }`}
                    >
                      <span className="text-2xl">{p.emoji}</span>
                      <div className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-white truncate leading-tight">{p.name}</span>
                        <span className="text-xs text-neutral-400">
                          {p.title} · {p.description}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Lock Screen & Battery Optimization Guide Modal */}
      <LockScreenGuideModal
        isOpen={isLockScreenGuideOpen}
        onClose={() => setIsLockScreenGuideOpen(false)}
      />

      {/* In-app Reminder Alert Modal */}
      <ReminderModal />

      {/* 100% Celebration Fireworks */}
      <CelebrationModal />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <WaterProvider>
      <MainLayout />
    </WaterProvider>
  );
};

export default App;
