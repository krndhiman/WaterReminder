import { BeverageType, CoachPersonaType, EnvironmentalFactors, ClinicalProfile } from './beverages';

export type ContainerIconType =
  | 'cup'
  | 'mug'
  | 'glass'
  | 'bottle'
  | 'flask'
  | 'jug'
  | 'gallon'
  | 'droplet'
  | 'coffee'
  | 'zap'
  | 'beer';

export interface IntakeLog {
  id: string;
  timestamp: number; // Date.now()
  amount: number; // raw amount in ml
  beverageType: BeverageType;
  hydrationFactor: number; // e.g. 1.2 for electrolyte, 0.8 for coffee
  netHydration: number; // amount * hydrationFactor
  containerId?: string;
  containerName?: string;
  icon?: ContainerIconType;
  note?: string;
}

export interface DayRecord {
  date: string; // YYYY-MM-DD
  goal: number; // target in ml (e.g. 4000ml + environmental adjustments)
  baseGoal: number; // user base goal before climate/sweat adjustments
  logs: IntakeLog[];
  total: number; // gross volume logged
  netTotal: number; // net hydration based on BHI
}

export interface QuickPreset {
  id: string;
  name: string;
  amount: number; // in ml
  beverageType: BeverageType;
  icon: ContainerIconType;
  color?: string;
}

export interface ReminderSchedule {
  enabled: boolean;
  intervalMinutes: number; // e.g. 45
  wakeTime: string; // "07:30"
  sleepTime: string; // "22:30"
  soundEnabled: boolean;
  soundType: 'gentle_chime' | 'water_drop' | 'bubble_pop' | 'crystal_bell';
  browserNotifications: boolean;
  defaultSnoozeMinutes: number; // e.g. 15
  snoozeUntil: number | null; // timestamp
  focusModeUntil: number | null; // timestamp for meeting/gym mode
  focusModeReason?: 'meeting' | 'gym' | 'commute' | 'custom' | null;
  lastReminderTime: number | null;
  nextReminderTime: number | null;
  coachPersona: CoachPersonaType;
  smartSilenceEnabled: boolean; // Auto-silence reminder if user drank within last 30m
}

export type AvatarSilhouetteType = 'male' | 'female';
export type ProgressDisplayMode = 'male' | 'female' | 'bottle';

export interface UserProfile {
  dailyGoal: number; // base goal default 4000
  weightKg?: number;
  activityLevel?: 'sedentary' | 'moderate' | 'active' | 'athlete';
  climate?: 'temperate' | 'tropical' | 'hot_dry';
  theme: 'ocean' | 'aquamarine' | 'cyberpunk' | 'deep_sea';
  avatarType?: AvatarSilhouetteType;
  progressDisplayMode?: ProgressDisplayMode;
  environmental: EnvironmentalFactors;
  clinical: ClinicalProfile;
}

export interface HydrationPaceInfo {
  status: 'ahead' | 'on_track' | 'behind' | 'sleeping' | 'goal_completed';
  deltaMl: number; // + ahead, - behind
  expectedMlSoFar: number;
  currentIntake: number;
  netIntake: number;
  dailyGoal: number;
  hourlyTarget: number;
  activeHoursTotal: number;
  activeHoursElapsed: number;
  remainingHours: number;
  remainingMl: number;
  recalibratedHourlyPace: number;
  paceMessage: string;
  environmentalAdjustmentMl: number;
}

export interface HourlyBucket {
  hour: number; // 0 - 23
  formattedHour: string; // "9 AM", "10 AM"
  total: number; // in ml
  netTotal: number;
  logs: IntakeLog[];
  targetForHour: number;
  isPast: boolean;
  isCurrent: boolean;
  isFuture: boolean;
  isAwakeHour: boolean;
}
