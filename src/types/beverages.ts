// Scientific Beverage Hydration Index (BHI), Coach Personas & Environmental Types
import { WeatherData } from './weather';

export type BeverageType =
  | 'water'
  | 'electrolyte'
  | 'tea'
  | 'coffee'
  | 'juice'
  | 'soda'
  | 'milk'
  | 'alcohol';

export interface BeverageDefinition {
  type: BeverageType;
  name: string;
  factor: number; // Hydration retention factor
  iconName: string;
  badgeColor: string;
  textColor: string;
  description: string;
  caffeineInfo?: string;
  electrolyteRich?: boolean;
}

export const BEVERAGE_DATABASE: Record<BeverageType, BeverageDefinition> = {
  water: {
    type: 'water',
    name: 'Pure Water',
    factor: 1.0,
    iconName: 'droplet',
    badgeColor: 'bg-cyan-500/20 border-cyan-400',
    textColor: 'text-cyan-300',
    description: 'Gold standard hydration with 100% cellular absorption.',
  },
  electrolyte: {
    type: 'electrolyte',
    name: 'Electrolytes / ORS',
    factor: 1.2,
    iconName: 'zap',
    badgeColor: 'bg-emerald-500/20 border-emerald-400',
    textColor: 'text-emerald-300',
    description: 'Super-hydration! Sodium & potassium increase fluid cellular retention by +20%.',
    electrolyteRich: true,
  },
  tea: {
    type: 'tea',
    name: 'Herbal & Green Tea',
    factor: 0.9,
    iconName: 'coffee',
    badgeColor: 'bg-teal-500/20 border-teal-400',
    textColor: 'text-teal-300',
    description: 'Rich in antioxidants with ~90% net fluid retention.',
  },
  coffee: {
    type: 'coffee',
    name: 'Coffee / Espresso',
    factor: 0.8,
    iconName: 'cup',
    badgeColor: 'bg-amber-500/20 border-amber-400',
    textColor: 'text-amber-300',
    description: 'Mild caffeine diuretic effect yields ~80% net hydration.',
    caffeineInfo: '~60-100mg caffeine',
  },
  milk: {
    type: 'milk',
    name: 'Milk / Oat / Plant Milk',
    factor: 1.1,
    iconName: 'milk',
    badgeColor: 'bg-sky-500/20 border-sky-400',
    textColor: 'text-sky-300',
    description: 'Proteins and electrolytes slow gastric emptying, aiding long-lasting hydration.',
  },
  juice: {
    type: 'juice',
    name: 'Fresh Juice / Smoothie',
    factor: 0.85,
    iconName: 'bottle',
    badgeColor: 'bg-orange-500/20 border-orange-400',
    textColor: 'text-orange-300',
    description: 'Nutrient-rich, though natural fructose slightly slows fluid transit.',
  },
  soda: {
    type: 'soda',
    name: 'Soda / Energy Drink',
    factor: 0.7,
    iconName: 'cup-soda',
    badgeColor: 'bg-rose-500/20 border-rose-400',
    textColor: 'text-rose-300',
    description: 'High osmotic sugar drag lowers net hydration to ~70%.',
  },
  alcohol: {
    type: 'alcohol',
    name: 'Beer / Cocktail / Wine',
    factor: -0.5,
    iconName: 'beer',
    badgeColor: 'bg-purple-500/20 border-purple-400',
    textColor: 'text-purple-300',
    description: 'Dehydrating! Blocks vasopressin hormone. Requires extra water to re-balance.',
  },
};

export type CoachPersonaType = 'zen' | 'biohacker' | 'gym' | 'bloom';

export interface CoachPersona {
  id: CoachPersonaType;
  name: string;
  title: string;
  emoji: string;
  avatarBg: string;
  description: string;
  quotes: string[];
}

export const COACH_PERSONAS: Record<CoachPersonaType, CoachPersona> = {
  zen: {
    id: 'zen',
    name: 'Master Zen',
    title: 'Mindful & Grounded',
    emoji: '🌿',
    avatarBg: 'from-emerald-500 to-teal-700',
    description: 'Gentle, mindful prompts that invite you to breathe, pause, and replenish your inner stillness.',
    quotes: [
      'Take a calm, mindful breath and gift your body a refreshing glass of water.',
      'Water flows effortlessly. Pause and replenish your inner stillness with a sip.',
      'A clear mind begins with a hydrated soul. Treat yourself to a cool drink.',
      'Slow down for just ten seconds. Taste the purity of life in each drop.',
    ],
  },
  biohacker: {
    id: 'biohacker',
    name: 'Dr. Synapse',
    title: 'Neuroscience & Cellular Focus',
    emoji: '🧬',
    avatarBg: 'from-cyan-500 to-blue-700',
    description: 'Science-backed insights on mitochondrial energy, brain fog prevention, and cognitive speed.',
    quotes: [
      'A 2% drop in hydration impairs cognitive processing speed by 15%. Optimize your brain with 250ml.',
      'Boost cellular ATP and mitochondrial fluid pressure with a quick hydration top-up.',
      'Prevent afternoon brain fog—hydrate now to maintain optimal blood plasma volume.',
      'Electrolytes + fluid balance = peak neurological transmission. Drink up!',
    ],
  },
  gym: {
    id: 'gym',
    name: 'Coach Titan',
    title: 'High-Performance Athlete',
    emoji: '⚡',
    avatarBg: 'from-amber-500 to-red-600',
    description: 'High-energy, relentless motivation to fuel athletic output, muscle recovery, and power.',
    quotes: [
      'Champions do not wait for thirst! Fuel those muscles with a power sip now!',
      'Hydration equals performance! Prevent cramps and accelerate protein synthesis with 400ml.',
      'Crush your 4L target! Every sip brings you closer to peak conditioning.',
      'Sweat out weakness, drink in power! Lock in your next hydration milestone!',
    ],
  },
  bloom: {
    id: 'bloom',
    name: 'AquaBloom',
    title: 'Living Botanical Companion',
    emoji: '🌸',
    avatarBg: 'from-pink-500 to-purple-600',
    description: 'Sweet, charming prompts from your virtual crystal lotus flower.',
    quotes: [
      'Your little lotus needs a sprinkle of fresh water to bloom its next golden petal!',
      'Yay, hydration time! Let us grow vibrant and glowing together with a sip!',
      'The morning dew is calling! Feed me some water to watch our crystal garden flourish.',
      'You are doing wonderfully! Let us share a refreshing drink together.',
    ],
  },
};

export interface EnvironmentalFactors {
  acOffice: boolean; // Dry air-conditioned office environment (+200ml)
  climate: 'temperate' | 'tropical' | 'dry_heat'; // Manual fallback
  workoutMinutes: number; // Workout duration (+350ml per 30 mins)
  altitudeHigh: boolean; // High altitude (+300ml)
  liveWeatherEnabled: boolean; // Enable automatic real-time city weather calculations
  cityName?: string;
}

export interface ClinicalProfile {
  lifeStage: 'standard' | 'pregnancy' | 'breastfeeding' | 'fluid_restriction';
  maxDailyLimit?: number;
  enableChugGuardrail: boolean; // Warns if drinking >900ml in <20 mins
}
