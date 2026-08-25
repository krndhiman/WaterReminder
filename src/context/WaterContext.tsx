import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import {
  DayRecord,
  IntakeLog,
  QuickPreset,
  ReminderSchedule,
  UserProfile,
  HydrationPaceInfo,
  HourlyBucket,
  ContainerIconType,
} from '../types/water';
import {
  BeverageType,
  BEVERAGE_DATABASE,
  CoachPersonaType,
  COACH_PERSONAS,
  EnvironmentalFactors,
  ClinicalProfile,
} from '../types/beverages';
import { WeatherData } from '../types/weather';
import {
  getTodayDateString,
  loadAllDayRecords,
  saveAllDayRecords,
  loadPresets,
  savePresets,
  loadSchedule,
  saveSchedule,
  loadProfile,
  saveProfile,
  generateSampleHistory,
  calculateHydrationStreak,
  exportDataAsJSON,
  exportDataAsCSV,
  DEFAULT_PRESETS,
} from '../utils/storage';
import { soundEffects } from '../utils/soundEffects';
import {
  sendBrowserNotification,
  scheduleBackgroundNotification,
  getNotificationPermission,
} from '../utils/notifications';
import {
  fetchWeatherByCoords,
  searchCities,
  loadWeatherCache,
  saveWeatherCache,
} from '../utils/weatherService';

interface WaterContextType {
  // Current view and records
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  isToday: boolean;
  todayRecord: DayRecord;
  selectedRecord: DayRecord;
  allRecords: Record<string, DayRecord>;

  // Intake actions with BHI
  addWater: (
    amount: number,
    beverageType?: BeverageType,
    containerName?: string,
    icon?: ContainerIconType,
    customTimestamp?: number
  ) => void;
  deleteLog: (logId: string, dateStr?: string) => void;
  quickAdd: (preset: QuickPreset) => void;

  // Goals, Environmental, Clinical & Profile
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
  updateDailyGoal: (newGoal: number) => void;
  updateEnvironmental: (updates: Partial<EnvironmentalFactors>) => void;
  updateClinical: (updates: Partial<ClinicalProfile>) => void;
  calculatedDynamicGoal: number;

  // Real-time City Weather Integration
  weather: WeatherData | null;
  isLoadingWeather: boolean;
  weatherError: string | null;
  fetchWeatherForCity: (query: string) => Promise<boolean>;
  fetchWeatherByGPS: () => Promise<boolean>;
  refreshWeather: () => Promise<void>;

  // Presets
  presets: QuickPreset[];
  updatePreset: (preset: QuickPreset) => void;
  addPreset: (preset: Omit<QuickPreset, 'id'>) => void;
  deletePreset: (id: string) => void;
  resetPresets: () => void;

  // Schedule, Reminder & Snooze
  schedule: ReminderSchedule;
  updateSchedule: (updates: Partial<ReminderSchedule>) => void;
  snoozeReminder: (minutes: number) => void;
  setFocusMode: (minutes: number, reason: 'meeting' | 'gym' | 'commute' | 'custom') => void;
  clearFocusMode: () => void;
  isReminderModalOpen: boolean;
  openReminderModal: () => void;
  closeReminderModal: () => void;
  secondsUntilNextReminder: number;
  triggerManualReminderTest: () => void;
  coachPersona: CoachPersonaType;
  setCoachPersona: (persona: CoachPersonaType) => void;

  // Hourly Pacer & Analytics
  paceInfo: HydrationPaceInfo;
  hourlyBuckets: HourlyBucket[];
  streakInfo: { currentStreak: number; bestStreak: number };

  // Safety & Celebrations
  isCelebrationOpen: boolean;
  closeCelebration: () => void;
  chugWarning: string | null;
  clearChugWarning: () => void;

  // Data Tools
  loadDemoData: () => void;
  clearAllHistory: () => void;
  exportJSON: () => void;
  exportCSV: () => void;

  // Audio
  isMuted: boolean;
  toggleMute: () => void;
}

const WaterContext = createContext<WaterContextType | undefined>(undefined);

export const WaterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [profile, setProfile] = useState<UserProfile>(loadProfile);

  // Weather state
  const [weather, setWeather] = useState<WeatherData | null>(loadWeatherCache);
  const [isLoadingWeather, setIsLoadingWeather] = useState<boolean>(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  // Calculate dynamic goal with real-time weather, sweat, and clinical profiles
  const calculatedDynamicGoal = useMemo(() => {
    let goal = profile.dailyGoal || 4000;
    const env = profile.environmental;
    const clinical = profile.clinical;

    // Weather impact
    if (env.liveWeatherEnabled && weather) {
      goal += weather.recommendedAdjustmentMl;
    } else {
      if (env.climate === 'tropical') goal += 400;
      if (env.climate === 'dry_heat') goal += 750;
    }

    if (env.acOffice) goal += 200;
    if (env.workoutMinutes > 0) {
      goal += Math.round((env.workoutMinutes / 30) * 350);
    }
    if (env.altitudeHigh) goal += 300;

    if (clinical.lifeStage === 'pregnancy') goal += 300;
    if (clinical.lifeStage === 'breastfeeding') goal += 700;
    if (clinical.lifeStage === 'fluid_restriction' && clinical.maxDailyLimit) {
      goal = clinical.maxDailyLimit;
    }

    return goal;
  }, [profile, weather]);

  const todayStr = getTodayDateString();

  const [allRecords, setAllRecords] = useState<Record<string, DayRecord>>(() => {
    const existing = loadAllDayRecords();
    const prof = loadProfile();
    if (!existing[todayStr]) {
      existing[todayStr] = {
        date: todayStr,
        goal: prof.dailyGoal || 4000,
        baseGoal: prof.dailyGoal || 4000,
        logs: [],
        total: 0,
        netTotal: 0,
      };
      saveAllDayRecords(existing);
    }
    return existing;
  });

  const [presets, setPresets] = useState<QuickPreset[]>(loadPresets);
  const [schedule, setSchedule] = useState<ReminderSchedule>(loadSchedule);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState<boolean>(false);
  const [isCelebrationOpen, setIsCelebrationOpen] = useState<boolean>(false);
  const [chugWarning, setChugWarning] = useState<string | null>(null);
  const [secondsUntilNextReminder, setSecondsUntilNextReminder] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [hasCelebratedToday, setHasCelebratedToday] = useState<boolean>(false);

  // Sync state to local storage
  useEffect(() => {
    saveAllDayRecords(allRecords);
  }, [allRecords]);

  useEffect(() => {
    savePresets(presets);
  }, [presets]);

  useEffect(() => {
    saveSchedule(schedule);
  }, [schedule]);

  useEffect(() => {
    saveProfile(profile);
  }, [profile]);

  // Fetch Weather by City
  const fetchWeatherForCity = useCallback(
    async (query: string): Promise<boolean> => {
      if (!query || query.trim().length < 2) return false;
      setIsLoadingWeather(true);
      setWeatherError(null);

      try {
        const results = await searchCities(query);
        if (!results || results.length === 0) {
          setWeatherError(`Could not find city "${query}". Please check spelling.`);
          setIsLoadingWeather(false);
          return false;
        }

        const city = results[0];
        const weatherResult = await fetchWeatherByCoords(
          city.latitude,
          city.longitude,
          `${city.name}${city.admin1 ? `, ${city.admin1}` : ''}`,
          city.country
        );

        setWeather(weatherResult);
        setProfile((prev) => ({
          ...prev,
          environmental: {
            ...prev.environmental,
            cityName: `${city.name}, ${city.country}`,
            liveWeatherEnabled: true,
          },
        }));

        soundEffects.playBubblePop();
        setIsLoadingWeather(false);
        return true;
      } catch (err: any) {
        console.error('Weather fetch error:', err);
        setWeatherError('Failed to fetch weather data. Please try again.');
        setIsLoadingWeather(false);
        return false;
      }
    },
    []
  );

  // Fetch Weather by GPS Location
  const fetchWeatherByGPS = useCallback(async (): Promise<boolean> => {
    if (!navigator.geolocation) {
      setWeatherError('Geolocation is not supported by your browser.');
      return false;
    }

    setIsLoadingWeather(true);
    setWeatherError(null);

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const weatherResult = await fetchWeatherByCoords(latitude, longitude, 'Local Location', '');

            setWeather(weatherResult);
            setProfile((prev) => ({
              ...prev,
              environmental: {
                ...prev.environmental,
                cityName: 'Current Location',
                liveWeatherEnabled: true,
              },
            }));

            soundEffects.playBubblePop();
            setIsLoadingWeather(false);
            resolve(true);
          } catch (e) {
            setWeatherError('Failed to retrieve weather for current GPS coordinates.');
            setIsLoadingWeather(false);
            resolve(false);
          }
        },
        (error) => {
          setWeatherError(`Location permission denied or unavailable (${error.message}).`);
          setIsLoadingWeather(false);
          resolve(false);
        },
        { timeout: 10000 }
      );
    });
  }, []);

  const refreshWeather = useCallback(async () => {
    if (weather) {
      setIsLoadingWeather(true);
      try {
        const fresh = await fetchWeatherByCoords(
          weather.latitude,
          weather.longitude,
          weather.city,
          weather.country
        );
        setWeather(fresh);
      } catch (err) {
        console.error('Failed to refresh weather', err);
      } finally {
        setIsLoadingWeather(false);
      }
    } else {
      await fetchWeatherByGPS();
    }
  }, [weather, fetchWeatherByGPS]);

  // Initial weather load if cache is missing or stale (>20 minutes)
  useEffect(() => {
    if (!weather || Date.now() - weather.fetchedAt > 20 * 60 * 1000) {
      if (profile.environmental.cityName && profile.environmental.cityName !== 'Current Location') {
        fetchWeatherForCity(profile.environmental.cityName);
      }
    }
  }, []);

  // Auto-refresh weather every 20 minutes while app is open
  useEffect(() => {
    const REFRESH_INTERVAL = 20 * 60 * 1000; // 20 minutes
    const interval = setInterval(() => {
      if (weather) {
        // Silently refresh in background
        fetchWeatherByCoords(weather.latitude, weather.longitude, weather.city, weather.country)
          .then(setWeather)
          .catch(() => {}); // silent fail — keep old data on error
      }
    }, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [weather]);

  // Update dynamic goal in today's record
  useEffect(() => {
    setAllRecords((recs) => {
      const todayRec = recs[todayStr];
      if (todayRec && todayRec.goal !== calculatedDynamicGoal) {
        return {
          ...recs,
          [todayStr]: {
            ...todayRec,
            goal: calculatedDynamicGoal,
            baseGoal: profile.dailyGoal,
          },
        };
      }
      return recs;
    });
  }, [calculatedDynamicGoal, todayStr, profile.dailyGoal]);

  const isToday = selectedDate === todayStr;

  const todayRecord: DayRecord = useMemo(() => {
    return (
      allRecords[todayStr] || {
        date: todayStr,
        goal: calculatedDynamicGoal,
        baseGoal: profile.dailyGoal,
        logs: [],
        total: 0,
        netTotal: 0,
      }
    );
  }, [allRecords, todayStr, calculatedDynamicGoal, profile.dailyGoal]);

  const selectedRecord: DayRecord = useMemo(() => {
    return (
      allRecords[selectedDate] || {
        date: selectedDate,
        goal: calculatedDynamicGoal,
        baseGoal: profile.dailyGoal,
        logs: [],
        total: 0,
        netTotal: 0,
      }
    );
  }, [allRecords, selectedDate, calculatedDynamicGoal, profile.dailyGoal]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      soundEffects.setMuted(next);
      return next;
    });
  }, []);

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...updates }));
  }, []);

  const updateDailyGoal = useCallback((newGoal: number) => {
    setProfile((prev) => ({ ...prev, dailyGoal: newGoal }));
  }, []);

  const updateEnvironmental = useCallback((updates: Partial<EnvironmentalFactors>) => {
    setProfile((prev) => ({
      ...prev,
      environmental: { ...prev.environmental, ...updates },
    }));
  }, []);

  const updateClinical = useCallback((updates: Partial<ClinicalProfile>) => {
    setProfile((prev) => ({
      ...prev,
      clinical: { ...prev.clinical, ...updates },
    }));
  }, []);

  const setCoachPersona = useCallback((persona: CoachPersonaType) => {
    setSchedule((prev) => ({ ...prev, coachPersona: persona }));
  }, []);

  const clearChugWarning = useCallback(() => setChugWarning(null), []);

  // Add water with BHI calculation and clinical chug safety check
  const addWater = useCallback(
    (
      amount: number,
      beverageType: BeverageType = 'water',
      containerName?: string,
      icon?: ContainerIconType,
      customTimestamp?: number
    ) => {
      if (amount === 0) return;

      const logTimestamp = customTimestamp || Date.now();
      const logDateStr = selectedDate;
      const bevInfo = BEVERAGE_DATABASE[beverageType] || BEVERAGE_DATABASE.water;
      const netAmount = Math.round(amount * bevInfo.factor);

      // Clinical Chug Guardrail Check (>900ml within 20 mins)
      if (profile.clinical.enableChugGuardrail && logDateStr === todayStr) {
        const recentLogs = (allRecords[todayStr]?.logs || []).filter(
          (l) => logTimestamp - l.timestamp < 20 * 60 * 1000
        );
        const recentVolume = recentLogs.reduce((acc, item) => acc + item.amount, 0) + amount;
        if (recentVolume >= 950) {
          setChugWarning(
            `Kidney Safety Alert: You logged ${recentVolume} ml in under 20 mins. For optimal cellular absorption and to prevent hyponatremia, pace fluid intake at 250–400 ml per hour.`
          );
        }
      }

      const newLog: IntakeLog = {
        id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        timestamp: logTimestamp,
        amount: Math.round(amount),
        beverageType,
        hydrationFactor: bevInfo.factor,
        netHydration: netAmount,
        containerName: containerName || bevInfo.name,
        icon: icon || (bevInfo.iconName as ContainerIconType) || 'droplet',
      };

      setAllRecords((prev) => {
        const currentRec = prev[logDateStr] || {
          date: logDateStr,
          goal: calculatedDynamicGoal,
          baseGoal: profile.dailyGoal,
          logs: [],
          total: 0,
          netTotal: 0,
        };

        const updatedLogs = [...currentRec.logs, newLog].sort((a, b) => a.timestamp - b.timestamp);
        const newGrossTotal = updatedLogs.reduce((acc, item) => acc + item.amount, 0);
        const newNetTotal = updatedLogs.reduce((acc, item) => acc + (item.netHydration || item.amount), 0);

        // Milestone celebration
        if (
          logDateStr === todayStr &&
          (currentRec.netTotal || currentRec.total) < currentRec.goal &&
          newNetTotal >= currentRec.goal &&
          !hasCelebratedToday
        ) {
          setIsCelebrationOpen(true);
          setHasCelebratedToday(true);
          soundEffects.playCelebrationFanfare();
        } else {
          soundEffects.playWaterPour();
        }

        return {
          ...prev,
          [logDateStr]: {
            ...currentRec,
            logs: updatedLogs,
            total: newGrossTotal,
            netTotal: newNetTotal,
          },
        };
      });

      // Smart Silence Gate: Postpone next reminder automatically
      if (logDateStr === todayStr) {
        const nextTime = Date.now() + schedule.intervalMinutes * 60 * 1000;
        setSchedule((prev) => ({
          ...prev,
          lastReminderTime: Date.now(),
          nextReminderTime: nextTime,
          snoozeUntil: null,
        }));
      }
    },
    [
      selectedDate,
      profile.clinical.enableChugGuardrail,
      profile.dailyGoal,
      todayStr,
      allRecords,
      calculatedDynamicGoal,
      hasCelebratedToday,
      schedule.intervalMinutes,
    ]
  );

  const quickAdd = useCallback(
    (preset: QuickPreset) => {
      addWater(preset.amount, preset.beverageType, preset.name, preset.icon);
    },
    [addWater]
  );

  const deleteLog = useCallback(
    (logId: string, dateStr: string = selectedDate) => {
      setAllRecords((prev) => {
        const currentRec = prev[dateStr];
        if (!currentRec) return prev;

        const updatedLogs = currentRec.logs.filter((l) => l.id !== logId);
        const newGrossTotal = updatedLogs.reduce((acc, item) => acc + item.amount, 0);
        const newNetTotal = updatedLogs.reduce((acc, item) => acc + (item.netHydration || item.amount), 0);

        soundEffects.playBubblePop();

        return {
          ...prev,
          [dateStr]: {
            ...currentRec,
            logs: updatedLogs,
            total: newGrossTotal,
            netTotal: newNetTotal,
          },
        };
      });
    },
    [selectedDate]
  );

  const updatePreset = useCallback((updated: QuickPreset) => {
    setPresets((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  }, []);

  const addPreset = useCallback((presetData: Omit<QuickPreset, 'id'>) => {
    const newPreset: QuickPreset = {
      ...presetData,
      id: `p_${Date.now()}`,
    };
    setPresets((prev) => [...prev, newPreset]);
  }, []);

  const deletePreset = useCallback((id: string) => {
    setPresets((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const resetPresets = useCallback(() => {
    setPresets(DEFAULT_PRESETS);
  }, []);

  const updateSchedule = useCallback((updates: Partial<ReminderSchedule>) => {
    setSchedule((prev) => {
      const next = { ...prev, ...updates };
      if (updates.intervalMinutes && updates.intervalMinutes !== prev.intervalMinutes) {
        next.nextReminderTime = Date.now() + updates.intervalMinutes * 60 * 1000;
      }
      return next;
    });
  }, []);

  const snoozeReminder = useCallback((minutes: number) => {
    const snoozeTime = Date.now() + Math.max(1, minutes) * 60 * 1000;
    setSchedule((prev) => ({
      ...prev,
      snoozeUntil: snoozeTime,
      nextReminderTime: snoozeTime,
    }));
    setIsReminderModalOpen(false);
    soundEffects.playBubblePop();
  }, []);

  const setFocusMode = useCallback((minutes: number, reason: 'meeting' | 'gym' | 'commute' | 'custom') => {
    const until = Date.now() + minutes * 60 * 1000;
    setSchedule((prev) => ({
      ...prev,
      focusModeUntil: until,
      focusModeReason: reason,
      nextReminderTime: until,
      snoozeUntil: null,
    }));
    setIsReminderModalOpen(false);
    soundEffects.playBubblePop();
  }, []);

  const clearFocusMode = useCallback(() => {
    const nextTime = Date.now() + schedule.intervalMinutes * 60 * 1000;
    setSchedule((prev) => ({
      ...prev,
      focusModeUntil: null,
      focusModeReason: null,
      nextReminderTime: nextTime,
    }));
    soundEffects.playBubblePop();
  }, [schedule.intervalMinutes]);

  const openReminderModal = useCallback(() => {
    setIsReminderModalOpen(true);
    soundEffects.playReminderChime();
  }, []);

  const closeReminderModal = useCallback(() => {
    setIsReminderModalOpen(false);
  }, []);

  const closeCelebration = useCallback(() => {
    setIsCelebrationOpen(false);
  }, []);

  const triggerManualReminderTest = useCallback(() => {
    openReminderModal();
    const persona = COACH_PERSONAS[schedule.coachPersona] || COACH_PERSONAS.biohacker;
    const randomQuote = persona.quotes[Math.floor(Math.random() * persona.quotes.length)];

    if (getNotificationPermission() === 'granted' || schedule.browserNotifications) {
      sendBrowserNotification(`💧 ${persona.name} (${persona.emoji}): Hydration Check!`, {
        body: randomQuote,
        requireInteraction: true,
      });
    }
  }, [openReminderModal, schedule.coachPersona, schedule.browserNotifications]);

  const loadDemoData = useCallback(() => {
    const sample = generateSampleHistory(profile.dailyGoal);
    const merged = { ...sample, [todayStr]: todayRecord };
    setAllRecords(merged);
    soundEffects.playCelebrationFanfare();
  }, [profile.dailyGoal, todayStr, todayRecord]);

  const clearAllHistory = useCallback(() => {
    const blank: Record<string, DayRecord> = {
      [todayStr]: {
        date: todayStr,
        goal: calculatedDynamicGoal,
        baseGoal: profile.dailyGoal,
        logs: [],
        total: 0,
        netTotal: 0,
      },
    };
    setAllRecords(blank);
    saveAllDayRecords(blank);
  }, [todayStr, calculatedDynamicGoal, profile.dailyGoal]);

  const exportJSON = useCallback(() => {
    exportDataAsJSON(allRecords, profile);
  }, [allRecords, profile]);

  const exportCSV = useCallback(() => {
    exportDataAsCSV(allRecords);
  }, [allRecords]);

  // Reminder Engine & Timer Loop with Smart Silence Gate
  useEffect(() => {
    if (!schedule.enabled) {
      setSecondsUntilNextReminder(0);
      return;
    }

    if (!schedule.nextReminderTime) {
      const initialNext = Date.now() + schedule.intervalMinutes * 60 * 1000;
      setSchedule((prev) => ({ ...prev, nextReminderTime: initialNext }));
    }

    const interval = setInterval(() => {
      const now = new Date();
      const currentTimestamp = now.getTime();

      const [wakeH, wakeM] = schedule.wakeTime.split(':').map(Number);
      const [sleepH, sleepM] = schedule.sleepTime.split(':').map(Number);
      const wakeTimeMinutes = wakeH * 60 + wakeM;
      const sleepTimeMinutes = sleepH * 60 + sleepM;
      const nowTimeMinutes = now.getHours() * 60 + now.getMinutes();

      const isAwake = nowTimeMinutes >= wakeTimeMinutes && nowTimeMinutes <= sleepTimeMinutes;

      if (schedule.focusModeUntil && currentTimestamp >= schedule.focusModeUntil) {
        setSchedule((prev) => ({ ...prev, focusModeUntil: null, focusModeReason: null }));
      }

      if (schedule.snoozeUntil && currentTimestamp >= schedule.snoozeUntil) {
        setSchedule((prev) => ({ ...prev, snoozeUntil: null }));
      }

      const targetTime =
        schedule.snoozeUntil ||
        schedule.focusModeUntil ||
        schedule.nextReminderTime ||
        currentTimestamp + schedule.intervalMinutes * 60 * 1000;

      const remainingSeconds = Math.max(0, Math.floor((targetTime - currentTimestamp) / 1000));
      setSecondsUntilNextReminder(remainingSeconds);

      // Trigger condition with Smart Silence Gate check
      if (isAwake && !schedule.focusModeUntil && remainingSeconds <= 0) {
        const lastDrinkTime =
          schedule.lastReminderTime ||
          (todayRecord.logs.length > 0 ? todayRecord.logs[todayRecord.logs.length - 1].timestamp : null);

        const drankRecently = schedule.smartSilenceEnabled && lastDrinkTime && currentTimestamp - lastDrinkTime < 25 * 60 * 1000;

        if (!drankRecently) {
          if (!isReminderModalOpen) {
            setIsReminderModalOpen(true);
            soundEffects.playReminderChime();

            const persona = COACH_PERSONAS[schedule.coachPersona] || COACH_PERSONAS.biohacker;
            const quote = persona.quotes[Math.floor(Math.random() * persona.quotes.length)];

            // Send real OS / lock-screen notification whenever permission is granted
            if (getNotificationPermission() === 'granted' || schedule.browserNotifications) {
              sendBrowserNotification(`💧 ${persona.name} (${persona.emoji}): Hydration Time!`, {
                body: quote,
                requireInteraction: true,
              });
            }
          }
        }

        const nextTime = currentTimestamp + schedule.intervalMinutes * 60 * 1000;
        setSchedule((prev) => ({
          ...prev,
          lastReminderTime: currentTimestamp,
          nextReminderTime: nextTime,
          snoozeUntil: null,
        }));

        // Schedule background Service Worker reminder for background tabs/locked screens
        const persona = COACH_PERSONAS[schedule.coachPersona] || COACH_PERSONAS.biohacker;
        const nextQuote = persona.quotes[Math.floor(Math.random() * persona.quotes.length)];
        scheduleBackgroundNotification(
          schedule.intervalMinutes * 60 * 1000,
          `💧 ${persona.name} (${persona.emoji}): Hydration Time!`,
          nextQuote
        );
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [schedule, isReminderModalOpen, todayRecord.logs]);

  // Hourly Pacer Calculations
  const paceInfo: HydrationPaceInfo = useMemo(() => {
    const now = new Date();
    const [wakeH, wakeM] = schedule.wakeTime.split(':').map(Number);
    const [sleepH, sleepM] = schedule.sleepTime.split(':').map(Number);

    const wakeMinutes = wakeH * 60 + wakeM;
    const sleepMinutes = sleepH * 60 + sleepM;
    const totalActiveMinutes = Math.max(60, sleepMinutes - wakeMinutes);
    const totalActiveHours = totalActiveMinutes / 60;

    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const elapsedMinutes = Math.max(0, Math.min(totalActiveMinutes, currentMinutes - wakeMinutes));
    const elapsedHours = elapsedMinutes / 60;
    const remainingHours = Math.max(0.5, (totalActiveMinutes - elapsedMinutes) / 60);

    const currentIntake = isToday ? todayRecord.total : selectedRecord.total;
    const netIntake = isToday ? todayRecord.netTotal || todayRecord.total : selectedRecord.netTotal || selectedRecord.total;
    const dailyGoal = isToday ? todayRecord.goal : selectedRecord.goal;

    const hourlyTarget = Math.round(dailyGoal / totalActiveHours);
    const expectedMlSoFar = Math.round((elapsedMinutes / totalActiveMinutes) * dailyGoal);
    const deltaMl = netIntake - expectedMlSoFar;
    const remainingMl = Math.max(0, dailyGoal - netIntake);
    const recalibratedHourlyPace = Math.round(remainingMl / remainingHours);
    const envAdjustment = dailyGoal - profile.dailyGoal;

    let status: HydrationPaceInfo['status'] = 'on_track';
    let paceMessage = '';

    if (netIntake >= dailyGoal) {
      status = 'goal_completed';
      paceMessage = '🎉 Amazing! You completed your daily net hydration goal!';
    } else if (currentMinutes < wakeMinutes || currentMinutes > sleepMinutes) {
      status = 'sleeping';
      paceMessage = '🌙 Quiet hours active. Rest well and replenish tomorrow!';
    } else if (deltaMl >= 250) {
      status = 'ahead';
      paceMessage = `✨ +${deltaMl} ml ahead of schedule! Net cellular hydration is optimal.`;
    } else if (deltaMl <= -350) {
      status = 'behind';
      paceMessage = `💧 ${Math.abs(deltaMl)} ml behind. Recalibrated pace: ~${recalibratedHourlyPace} ml/hr remaining.`;
    } else {
      status = 'on_track';
      paceMessage = `⚡ On track! Maintain ~${recalibratedHourlyPace} ml/hr to hit your ${dailyGoal} ml goal.`;
    }

    return {
      status,
      deltaMl,
      expectedMlSoFar,
      currentIntake,
      netIntake,
      dailyGoal,
      hourlyTarget,
      activeHoursTotal: Math.round(totalActiveHours),
      activeHoursElapsed: Math.round(elapsedHours),
      remainingHours: Math.round(remainingHours * 10) / 10,
      remainingMl,
      recalibratedHourlyPace,
      paceMessage,
      environmentalAdjustmentMl: envAdjustment,
    };
  }, [schedule.wakeTime, schedule.sleepTime, isToday, todayRecord, selectedRecord, profile.dailyGoal]);

  // Hourly Buckets
  const hourlyBuckets: HourlyBucket[] = useMemo(() => {
    const buckets: HourlyBucket[] = [];
    const currentHour = new Date().getHours();
    const [wakeH] = schedule.wakeTime.split(':').map(Number);
    const [sleepH] = schedule.sleepTime.split(':').map(Number);

    for (let h = 0; h < 24; h++) {
      const logsInHour = selectedRecord.logs.filter((log) => {
        const d = new Date(log.timestamp);
        return d.getHours() === h;
      });

      const grossTotal = logsInHour.reduce((acc, item) => acc + item.amount, 0);
      const netTotal = logsInHour.reduce((acc, item) => acc + (item.netHydration || item.amount), 0);
      const isAwakeHour = h >= wakeH && h <= sleepH;
      const formattedHour = h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`;

      buckets.push({
        hour: h,
        formattedHour,
        total: grossTotal,
        netTotal,
        logs: logsInHour,
        targetForHour: isAwakeHour ? paceInfo.hourlyTarget : 0,
        isPast: isToday ? h < currentHour : true,
        isCurrent: isToday ? h === currentHour : false,
        isFuture: isToday ? h > currentHour : false,
        isAwakeHour,
      });
    }

    return buckets;
  }, [selectedRecord, schedule.wakeTime, schedule.sleepTime, isToday, paceInfo.hourlyTarget]);

  const streakInfo = useMemo(() => {
    return calculateHydrationStreak(allRecords, profile.dailyGoal);
  }, [allRecords, profile.dailyGoal]);

  return (
    <WaterContext.Provider
      value={{
        selectedDate,
        setSelectedDate,
        isToday,
        todayRecord,
        selectedRecord,
        allRecords,
        addWater,
        deleteLog,
        quickAdd,
        profile,
        updateProfile,
        updateDailyGoal,
        updateEnvironmental,
        updateClinical,
        calculatedDynamicGoal,
        weather,
        isLoadingWeather,
        weatherError,
        fetchWeatherForCity,
        fetchWeatherByGPS,
        refreshWeather,
        presets,
        updatePreset,
        addPreset,
        deletePreset,
        resetPresets,
        schedule,
        updateSchedule,
        snoozeReminder,
        setFocusMode,
        clearFocusMode,
        isReminderModalOpen,
        openReminderModal,
        closeReminderModal,
        secondsUntilNextReminder,
        triggerManualReminderTest,
        coachPersona: schedule.coachPersona,
        setCoachPersona,
        paceInfo,
        hourlyBuckets,
        streakInfo,
        isCelebrationOpen,
        closeCelebration,
        chugWarning,
        clearChugWarning,
        loadDemoData,
        clearAllHistory,
        exportJSON,
        exportCSV,
        isMuted,
        toggleMute,
      }}
    >
      {children}
    </WaterContext.Provider>
  );
};

export const useWater = (): WaterContextType => {
  const context = useContext(WaterContext);
  if (!context) {
    throw new Error('useWater must be used within a WaterProvider');
  }
  return context;
};
