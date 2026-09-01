import { DayRecord, QuickPreset, ReminderSchedule, UserProfile, IntakeLog } from '../types/water';
import { BEVERAGE_DATABASE } from '../types/beverages';

const STORAGE_KEYS = {
  RECORDS: 'aquaflow_records_v2',
  PRESETS: 'aquaflow_presets_v2',
  SCHEDULE: 'aquaflow_schedule_v2',
  PROFILE: 'aquaflow_profile_v2',
};

export const getTodayDateString = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatDisplayDate = (dateStr: string): string => {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const today = getTodayDateString();

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

  if (dateStr === today) return 'Today';
  if (dateStr === yesterdayStr) return 'Yesterday';

  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

export const DEFAULT_PRESETS: QuickPreset[] = [
  { id: 'p1', name: 'Water Glass', amount: 250, beverageType: 'water', icon: 'glass' },
  { id: 'p2', name: 'Electrolytes', amount: 500, beverageType: 'electrolyte', icon: 'flask' },
  { id: 'p3', name: 'Green Tea', amount: 300, beverageType: 'tea', icon: 'cup' },
  { id: 'p4', name: 'Espresso/Coffee', amount: 200, beverageType: 'coffee', icon: 'mug' },
  { id: 'p5', name: 'Hydro Bottle', amount: 750, beverageType: 'water', icon: 'bottle' },
  { id: 'p6', name: 'Mega Jug', amount: 1000, beverageType: 'water', icon: 'jug' },
];

export const DEFAULT_SCHEDULE: ReminderSchedule = {
  enabled: true,
  intervalMinutes: 45,
  wakeTime: '08:00',
  sleepTime: '22:30',
  soundEnabled: true,
  soundType: 'gentle_chime',
  browserNotifications: false,
  defaultSnoozeMinutes: 15,
  snoozeUntil: null,
  focusModeUntil: null,
  focusModeReason: null,
  lastReminderTime: null,
  nextReminderTime: null,
  coachPersona: 'biohacker',
  smartSilenceEnabled: true,
};

export const DEFAULT_PROFILE: UserProfile = {
  dailyGoal: 4000, // 4 Litres base goal
  activityLevel: 'moderate',
  climate: 'temperate',
  theme: 'ocean',
  progressDisplayMode: 'male',
  environmental: {
    acOffice: false,
    climate: 'temperate',
    workoutMinutes: 0,
    altitudeHigh: false,
    liveWeatherEnabled: true,
    cityName: '',
  },
  clinical: {
    lifeStage: 'standard',
    enableChugGuardrail: true,
  },
};

// Storage helper methods
export const loadAllDayRecords = (): Record<string, DayRecord> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RECORDS);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
};

export const saveAllDayRecords = (records: Record<string, DayRecord>) => {
  try {
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
  } catch (e) {
    console.error('Failed to save day records', e);
  }
};

export const loadDayRecord = (dateStr: string, currentGoal: number): DayRecord => {
  const records = loadAllDayRecords();
  if (records[dateStr]) {
    return records[dateStr];
  }
  return {
    date: dateStr,
    goal: currentGoal,
    baseGoal: currentGoal,
    logs: [],
    total: 0,
    netTotal: 0,
  };
};

export const loadPresets = (): QuickPreset[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRESETS);
    if (!raw) return DEFAULT_PRESETS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_PRESETS;
  } catch {
    return DEFAULT_PRESETS;
  }
};

export const savePresets = (presets: QuickPreset[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.PRESETS, JSON.stringify(presets));
  } catch (e) {
    console.error('Failed to save presets', e);
  }
};

export const loadSchedule = (): ReminderSchedule => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SCHEDULE);
    if (!raw) return DEFAULT_SCHEDULE;
    return { ...DEFAULT_SCHEDULE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SCHEDULE;
  }
};

export const saveSchedule = (schedule: ReminderSchedule) => {
  try {
    localStorage.setItem(STORAGE_KEYS.SCHEDULE, JSON.stringify(schedule));
  } catch (e) {
    console.error('Failed to save schedule', e);
  }
};

export const loadProfile = (): UserProfile => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!raw) return DEFAULT_PROFILE;
    return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PROFILE;
  }
};

export const saveProfile = (profile: UserProfile) => {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save profile', e);
  }
};

// Generate sample history with BHI and varying drink types
export const generateSampleHistory = (dailyGoal: number = 4000): Record<string, DayRecord> => {
  const records: Record<string, DayRecord> = {};
  const today = new Date();

  for (let i = 1; i <= 10; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    const completionFactors = [0.98, 1.05, 0.88, 1.12, 1.0, 0.92, 1.04, 0.82, 1.08, 1.0];
    const factor = completionFactors[(i - 1) % completionFactors.length];
    const targetMl = Math.round(dailyGoal * factor);

    const logs: IntakeLog[] = [];
    let grossTotal = 0;
    let netTotal = 0;
    const hours = [8, 9, 11, 13, 15, 17, 19, 21];

    hours.forEach((h, idx) => {
      if (grossTotal < targetMl) {
        const portion = idx === hours.length - 1 ? targetMl - grossTotal : Math.min(500, Math.round(targetMl / hours.length + (Math.random() * 80 - 40)));
        if (portion > 0) {
          const logDate = new Date(d);
          logDate.setHours(h, Math.floor(Math.random() * 50), 0);

          const drinkType = idx === 1 ? 'coffee' : idx === 3 ? 'electrolyte' : idx === 5 ? 'tea' : 'water';
          const bev = BEVERAGE_DATABASE[drinkType];
          const net = Math.round(portion * bev.factor);

          logs.push({
            id: `sample_${dateStr}_${idx}`,
            timestamp: logDate.getTime(),
            amount: portion,
            beverageType: drinkType,
            hydrationFactor: bev.factor,
            netHydration: net,
            containerName: bev.name,
            icon: portion <= 250 ? 'glass' : portion <= 500 ? 'bottle' : 'flask',
          });

          grossTotal += portion;
          netTotal += net;
        }
      }
    });

    records[dateStr] = {
      date: dateStr,
      goal: dailyGoal,
      baseGoal: dailyGoal,
      logs: logs.sort((a, b) => a.timestamp - b.timestamp),
      total: grossTotal,
      netTotal: netTotal,
    };
  }

  return records;
};

// Calculate streak
export const calculateHydrationStreak = (
  records: Record<string, DayRecord>,
  currentGoal: number
): { currentStreak: number; bestStreak: number } => {
  const today = getTodayDateString();
  let currentStreak = 0;
  let bestStreak = 0;
  let tempStreak = 0;

  const todayRecord = records[today];
  if (todayRecord && (todayRecord.netTotal || todayRecord.total) >= todayRecord.goal * 0.9) {
    currentStreak++;
  }

  const checkDate = new Date();
  checkDate.setDate(checkDate.getDate() - 1);

  for (let i = 0; i < 60; i++) {
    const dStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
    const rec = records[dStr];

    if (rec && (rec.netTotal || rec.total) >= (rec.goal || currentGoal) * 0.85) {
      if (i === currentStreak - (todayRecord && (todayRecord.netTotal || todayRecord.total) >= todayRecord.goal * 0.9 ? 1 : 0)) {
        currentStreak++;
      }
      tempStreak++;
      if (tempStreak > bestStreak) bestStreak = tempStreak;
    } else {
      tempStreak = 0;
    }
    checkDate.setDate(checkDate.getDate() - 1);
  }

  if (currentStreak > bestStreak) bestStreak = currentStreak;

  return { currentStreak, bestStreak };
};

// Data Export to JSON
export const exportDataAsJSON = (records: Record<string, DayRecord>, profile: UserProfile) => {
  const data = {
    exportedAt: new Date().toISOString(),
    profile,
    records,
  };
  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', jsonString);
  downloadAnchor.setAttribute('download', `aquaflow_hydration_export_${getTodayDateString()}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
};

// Data Export to CSV
export const exportDataAsCSV = (records: Record<string, DayRecord>) => {
  const rows = [['Date', 'Time', 'Beverage', 'Amount (ml)', 'Hydration Factor', 'Net Hydration (ml)', 'Daily Goal (ml)']];

  Object.values(records)
    .sort((a, b) => a.date.localeCompare(b.date))
    .forEach((rec) => {
      rec.logs.forEach((log) => {
        const timeStr = new Date(log.timestamp).toLocaleTimeString();
        rows.push([
          rec.date,
          timeStr,
          log.containerName || log.beverageType || 'Water',
          String(log.amount),
          String(log.hydrationFactor || 1.0),
          String(log.netHydration || log.amount),
          String(rec.goal),
        ]);
      });
    });

  const csvContent = `data:text/csv;charset=utf-8,${rows.map((e) => e.join(',')).join('\n')}`;
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `aquaflow_logs_${getTodayDateString()}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};
