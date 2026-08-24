// Clinical Urine Biofeedback & Electrolyte Balance Types

export interface UrineColorLevel {
  level: number; // 1 to 8 (Armstrong Clinical Scale)
  hex: string;
  name: string;
  hydrationStatus: 'overhydrated' | 'optimal' | 'mildly_dehydrated' | 'dehydrated' | 'severely_dehydrated';
  badgeColor: string;
  description: string;
  actionRecommendation: string;
  goalAdjustmentMl: number; // dynamically adjusts daily goal based on actual biological feedback
}

export const URINE_COLOR_SCALE: UrineColorLevel[] = [
  {
    level: 1,
    hex: '#f8fafc',
    name: 'Clear / Water-Like',
    hydrationStatus: 'overhydrated',
    badgeColor: 'bg-sky-500/20 text-sky-200 border-sky-400/40',
    description: 'Completely clear. You may be overhydrating and flushing out essential sodium and potassium salts.',
    actionRecommendation: 'Ease up on plain water. Add a pinch of electrolytes or let your kidneys equilibrate.',
    goalAdjustmentMl: -300,
  },
  {
    level: 2,
    hex: '#fef08a',
    name: 'Pale Straw / Lemonade',
    hydrationStatus: 'optimal',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40',
    description: 'Gold standard! Your cellular fluid and electrolyte balance is in the ideal clinical zone.',
    actionRecommendation: 'Maintain your current steady hourly sipping rhythm.',
    goalAdjustmentMl: 0,
  },
  {
    level: 3,
    hex: '#fde047',
    name: 'Transparent Yellow',
    hydrationStatus: 'optimal',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40',
    description: 'Well-hydrated and balanced. Plasma volume is steady.',
    actionRecommendation: 'Keep drinking steadily as reminded.',
    goalAdjustmentMl: 0,
  },
  {
    level: 4,
    hex: '#facc15',
    name: 'Dark Yellow',
    hydrationStatus: 'mildly_dehydrated',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
    description: 'Mild dehydration. Your kidneys are reabsorbing water to preserve blood pressure.',
    actionRecommendation: 'Drink 250–350 ml of water over the next 30 minutes.',
    goalAdjustmentMl: 250,
  },
  {
    level: 5,
    hex: '#eab308',
    name: 'Amber / Honey',
    hydrationStatus: 'dehydrated',
    badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-400/40',
    description: 'Significant fluid deficit. Common after heat exposure or uncompensated sweat.',
    actionRecommendation: 'Drink 500 ml with electrolytes/minerals to restore fluid-sodium balance.',
    goalAdjustmentMl: 500,
  },
  {
    level: 6,
    hex: '#ca8a04',
    name: 'Dark Amber / Mustard',
    hydrationStatus: 'dehydrated',
    badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-400/40',
    description: 'Cellular dehydration. Blood viscosity is elevated and cognitive performance may dip.',
    actionRecommendation: 'Drink 600–750 ml of electrolyte-rich fluid immediately.',
    goalAdjustmentMl: 750,
  },
  {
    level: 7,
    hex: '#a16207',
    name: 'Burnt Orange / Tea',
    hydrationStatus: 'severely_dehydrated',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-400/40',
    description: 'Severe fluid deficit. Immediate fluid replenishment required.',
    actionRecommendation: 'Urgent rehydration: 800 ml oral rehydration solution (ORS) over 1 hour.',
    goalAdjustmentMl: 1000,
  },
  {
    level: 8,
    hex: '#78350f',
    name: 'Brownish / Dark Tea',
    hydrationStatus: 'severely_dehydrated',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-400/40',
    description: 'Severe dehydration or possible myoglobin/liver waste concentration.',
    actionRecommendation: 'Rehydrate urgently with electrolytes. Consult a physician if persistent.',
    goalAdjustmentMl: 1200,
  },
];

export interface BiofeedbackLog {
  id: string;
  timestamp: number;
  urineColorLevel: number;
  status: UrineColorLevel['hydrationStatus'];
  notes?: string;
}

export type WorkoutPhase = 'idle' | 'pre_workout' | 'intra_workout' | 'post_workout';

export interface WorkoutHydrationState {
  active: boolean;
  phase: WorkoutPhase;
  startTime: number | null;
  workoutDurationMinutes: number;
  sweatLossEstimateMl: number;
  electrolyteNeeded: boolean;
  preWorkoutHydrated: boolean;
  intraWorkoutSipsLogged: number;
}
