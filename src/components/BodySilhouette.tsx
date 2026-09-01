import React, { useRef, useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  Activity,
  Zap,
  X,
  ShieldCheck,
  Flame,
} from 'lucide-react';
import { useWater } from '../context/WaterContext';

// 6 Major Biological Organ Milestones (normalized to 0 0 200 320 coordinate box)
export interface OrganMilestone {
  id: string;
  name: string;
  shortName: string;
  emoji: string;
  cx: number; // in 0 0 200 320 coordinate space
  cy: number; // in 0 0 200 320 coordinate space
  thresholdPercent: number; // % hydration required to activate
  title: string;
  scienceNote: string;
  benefit: string;
  glowColor: string;
}

export const ORGAN_MILESTONES: OrganMilestone[] = [
  {
    id: 'brain',
    name: 'Brain & Nervous System',
    shortName: 'Brain',
    emoji: '🧠',
    cx: 100,
    cy: 32,
    thresholdPercent: 90,
    title: 'Cognitive Optimization & Alertness',
    scienceNote:
      'The brain is ~75% water. When hydration exceeds 90%, neurotransmitter transmission speeds up, reducing brain fog, improving short-term memory, and banishing dehydration headaches.',
    benefit: 'Eliminates brain fog, sharpens focus & mood',
    glowColor: '#bf5af2',
  },
  {
    id: 'lungs',
    name: 'Lungs & Respiratory Tract',
    shortName: 'Lungs',
    emoji: '🫁',
    cx: 100,
    cy: 90,
    thresholdPercent: 75,
    title: 'Moist Mucous Membranes & Oxygen Exchange',
    scienceNote:
      'We lose ~400ml of water daily just breathing. Hydration keeps the respiratory mucosal barrier thin and elastic, optimizing alveolar oxygen exchange and filtering microscopic irritants.',
    benefit: 'Maximizes VO2 efficiency & airway clarity',
    glowColor: '#5ac8fa',
  },
  {
    id: 'heart',
    name: 'Heart & Blood Plasma',
    shortName: 'Heart',
    emoji: '🫀',
    cx: 93,
    cy: 112,
    thresholdPercent: 60,
    title: 'Blood Plasma Volume & Stroke Power',
    scienceNote:
      'Blood plasma is over 90% water. Optimal hydration maintains blood volume, reducing resting cardiac strain, normalizing systolic pressure, and delivering electrolytes efficiently.',
    benefit: 'Prevents cardiac strain & balances heart rate',
    glowColor: '#ff375f',
  },
  {
    id: 'kidneys',
    name: 'Kidneys & Renal Filtration',
    shortName: 'Kidneys',
    emoji: '🫧',
    cx: 100,
    cy: 148,
    thresholdPercent: 45,
    title: 'Waste Detoxification & Mineral Balance',
    scienceNote:
      'Your kidneys filter ~150 liters of blood each day. Abundant water dilutes stone-forming crystals (calcium oxalate) and accelerates urea and metabolic waste clearance.',
    benefit: 'Flushes metabolic toxins & prevents renal stones',
    glowColor: '#30d158',
  },
  {
    id: 'digestive',
    name: 'Metabolism & Digestive Tract',
    shortName: 'Metabolism',
    emoji: '⚡',
    cx: 100,
    cy: 172,
    thresholdPercent: 30,
    title: 'Enzyme Activation & Nutrient Transport',
    scienceNote:
      'Water fuels the production of gastric juices and gastrointestinal mucosal lubrication. It prevents constipation and speeds up carbohydrate-to-glucose enzymatic breakdown.',
    benefit: 'Fuels digestive enzymes & nutrient absorption',
    glowColor: '#ff9f0a',
  },
  {
    id: 'muscles',
    name: 'Joints, Fascia & Muscular Tissue',
    shortName: 'Muscles & Joints',
    emoji: '🦵',
    cx: 100,
    cy: 240,
    thresholdPercent: 15,
    title: 'Synovial Lubrication & Cramp Defense',
    scienceNote:
      'Skeletal muscle tissue is 76% water by mass. Synovial joint fluid cushions cartilage against friction, while intracellular hydration prevents sudden muscle spasms and lactic soreness.',
    benefit: 'Replenishes joint fluid & shields from cramps',
    glowColor: '#0a84ff',
  },
];

// Precision Medical-Grade Vector Silhouettes (ViewBox 0 0 200 320)
const MALE_BODY_PATH_D =
  'M 100,10 C 108,10 114,16 115,24 C 116,25 119,27 119,33 C 119,38 116,40 114,41 C 113,47 108,54 100,54 C 92,54 87,47 86,41 C 84,40 81,38 81,33 C 81,27 84,25 85,24 C 86,16 92,10 100,10 Z M 106,54 C 106,62 108,68 112,70 C 122,74 135,80 142,88 C 146,92 148,102 147,118 C 146,132 144,148 147,162 C 149,174 153,184 154,192 C 155,195 160,200 161,206 C 162,211 157,212 154,209 C 152,212 149,222 146,222 C 143,222 141,216 142,208 C 142,202 139,188 138,176 C 137,162 135,148 134,136 C 133,124 130,112 124,106 C 122,112 120,126 120,140 C 120,154 122,168 124,180 C 125,188 126,198 125,212 C 124,228 122,246 121,262 C 120,274 122,286 122,298 C 122,306 118,312 116,314 C 118,315 122,316 120,320 C 117,322 112,321 110,318 C 108,315 108,308 108,298 C 108,286 107,274 107,262 C 107,246 106,228 105,212 C 104,198 102,185 100,180 C 98,185 96,198 95,212 C 94,228 93,246 93,262 C 93,274 92,286 92,298 C 92,308 92,315 90,318 C 88,321 83,322 80,320 C 78,316 82,315 84,314 C 82,312 78,306 78,298 C 78,286 80,274 79,262 C 78,246 76,228 75,212 C 74,198 75,188 76,180 C 78,168 80,154 80,140 C 80,126 78,112 76,106 C 70,112 67,124 66,136 C 65,148 63,162 62,176 C 61,188 58,202 58,208 C 59,216 57,222 54,222 C 51,222 48,212 46,209 C 43,212 38,211 39,206 C 40,200 45,195 46,192 C 47,184 51,174 53,162 C 56,148 54,132 53,118 C 52,102 54,92 58,88 C 65,80 78,74 88,70 C 92,68 94,62 94,54 Z';

const FEMALE_BODY_PATH_D =
  'M 100,12 C 107,12 113,18 114,25 C 115,26 118,28 118,34 C 118,38 115,40 113,41 C 111,47 106,54 100,54 C 94,54 89,47 87,41 C 85,40 82,38 82,34 C 82,28 85,26 86,25 C 87,18 93,12 100,12 Z M 104,54 C 104,62 106,68 110,70 C 118,74 128,80 134,88 C 138,92 140,102 139,118 C 138,132 137,148 140,162 C 142,174 146,184 147,192 C 148,195 153,200 154,206 C 155,211 150,212 147,209 C 145,212 143,222 140,222 C 137,222 135,216 136,208 C 136,202 133,188 132,176 C 131,162 129,148 128,136 C 127,124 124,112 119,106 C 117,112 114,124 113,138 C 112,150 114,162 118,172 C 122,182 126,192 125,206 C 124,222 121,244 120,260 C 119,274 121,286 121,298 C 121,306 117,312 115,314 C 117,315 120,316 119,320 C 116,322 111,321 109,318 C 108,315 108,308 108,298 C 108,286 107,274 107,260 C 107,244 105,222 104,206 C 103,194 102,185 100,180 C 98,185 97,194 96,206 C 95,222 93,244 93,260 C 93,274 92,286 92,298 C 92,308 92,315 91,318 C 89,321 84,322 81,320 C 80,316 83,315 85,314 C 83,312 79,306 79,298 C 79,286 81,274 80,260 C 79,244 76,222 75,206 C 74,192 78,182 82,172 C 86,162 88,150 87,138 C 86,124 83,112 81,106 C 76,112 73,124 72,136 C 71,148 69,162 68,176 C 67,188 64,202 64,208 C 65,216 63,222 60,222 C 57,222 55,212 53,209 C 50,212 45,211 46,206 C 47,200 52,195 53,192 C 54,184 58,174 60,162 C 63,148 62,132 61,118 C 60,102 62,92 66,88 C 72,80 82,74 90,70 C 94,68 96,62 96,54 Z';

interface BodySilhouetteProps {
  onQuickAdd?: () => void;
}

export const BodySilhouette: React.FC<BodySilhouetteProps> = ({ onQuickAdd }) => {
  const { selectedRecord, chugWarning, clearChugWarning, profile, weather, updateProfile } =
    useWater();

  const grossTotal = selectedRecord.total;
  const netTotal = selectedRecord.netTotal || grossTotal;
  const percentage = Math.min(100, Math.max(0, Math.round((netTotal / selectedRecord.goal) * 100)));
  const remainingMl = Math.max(0, selectedRecord.goal - netTotal);

  // Active silhouette: 'male' | 'female' (default male)
  const isFemale = profile.progressDisplayMode === 'female';
  const activeBodyPath = isFemale ? FEMALE_BODY_PATH_D : MALE_BODY_PATH_D;

  const [selectedOrgan, setSelectedOrgan] = useState<OrganMilestone | null>(null);

  // SVG Wave Animation State (pure SVG rendering, 100% aligned on all devices)
  const [phase, setPhase] = useState(0);
  const [amplitude, setAmplitude] = useState(3.5);
  const animationFrameRef = useRef<number | null>(null);

  const handleBodyTap = () => {
    setAmplitude(10);
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(18);
      } catch {
        // ignore
      }
    }
  };

  useEffect(() => {
    let isRunning = true;

    const tick = () => {
      if (!isRunning) return;
      setPhase((prev) => prev + 0.04);
      setAmplitude((prev) => prev + (3.5 - prev) * 0.05);
      animationFrameRef.current = requestAnimationFrame(tick);
    };

    animationFrameRef.current = requestAnimationFrame(tick);

    return () => {
      isRunning = false;
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  // Compute precise SVG Wave Paths inside the 0 0 200 320 coordinate box
  const { frontWavePath, backWavePath, meniscusPath } = useMemo(() => {
    if (percentage <= 0) {
      return { frontWavePath: '', backWavePath: '', meniscusPath: '' };
    }

    const totalHeight = 320;
    const waterHeight = (percentage / 100) * totalHeight;
    const baseWaterY = totalHeight - waterHeight;

    // Front Wave
    let front = `M 0 320 L 0 ${baseWaterY} `;
    let meniscus = `M 0 ${baseWaterY} `;
    for (let x = 0; x <= 200; x += 5) {
      const waveY = baseWaterY + Math.sin(x * 0.035 + phase) * amplitude;
      front += `L ${x} ${waveY} `;
      meniscus += `L ${x} ${waveY} `;
    }
    front += `L 200 320 Z`;

    // Back Wave
    let back = `M 0 320 L 0 ${baseWaterY} `;
    for (let x = 0; x <= 200; x += 5) {
      const waveY = baseWaterY + Math.sin(x * 0.03 + phase + Math.PI) * (amplitude * 0.7);
      back += `L ${x} ${waveY} `;
    }
    back += `L 200 320 Z`;

    return {
      frontWavePath: front,
      backWavePath: back,
      meniscusPath: meniscus,
    };
  }, [percentage, phase, amplitude]);

  const hydratedOrgansCount = useMemo(() => {
    return ORGAN_MILESTONES.filter((o) => percentage >= o.thresholdPercent).length;
  }, [percentage]);

  return (
    <div className="relative flex flex-col items-center justify-center select-none w-full max-w-sm mx-auto">
      {/* Chug / Speed Safety Warning */}
      {chugWarning && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full mb-3 p-3 rounded-2xl bg-[#2c1a08] border border-[#ff9f0a]/30 text-xs text-[#ff9f0a] flex items-center justify-between"
        >
          <span>{chugWarning}</span>
          <button
            onClick={clearChugWarning}
            className="font-semibold text-xs text-white/60 hover:text-white p-1 cursor-pointer"
          >
            ✕
          </button>
        </motion.div>
      )}

      {/* Main Apple-Glass Body Silhouette Card */}
      <motion.div
        whileTap={{ scale: 0.99 }}
        onClick={handleBodyTap}
        className="relative w-full max-w-[320px] rounded-[44px] p-4 cursor-pointer apple-card flex flex-col items-center justify-between shadow-2xl border border-white/[0.08] space-y-2"
      >
        {/* Background Ambient Radial Glow */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40 transition-opacity duration-700 rounded-[44px]"
          style={{
            background:
              percentage >= 100
                ? 'radial-gradient(circle at 50% 40%, rgba(48, 209, 88, 0.18), transparent 70%)'
                : 'radial-gradient(circle at 50% 60%, rgba(10, 132, 255, 0.16), transparent 70%)',
          }}
        />

        {/* Top 3-Mode Segmented Control: [ 👨 Male ] [ 👩 Female ] [ 🍶 Cylinder ] */}
        <div className="w-full z-20 flex items-center justify-between gap-1.5 pt-1 px-1">
          <div className="flex items-center gap-1 bg-black/50 p-1 rounded-2xl border border-white/[0.08] backdrop-blur-md">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                updateProfile({ progressDisplayMode: 'male' });
              }}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition cursor-pointer flex items-center gap-1 ${
                !isFemale
                  ? 'bg-[#0a84ff] text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <span>👨 Male</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                updateProfile({ progressDisplayMode: 'female' });
              }}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition cursor-pointer flex items-center gap-1 ${
                isFemale
                  ? 'bg-[#0a84ff] text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <span>👩 Female</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                updateProfile({ progressDisplayMode: 'bottle' });
              }}
              className="px-2.5 py-1 rounded-xl text-[11px] font-semibold text-neutral-400 hover:text-white transition cursor-pointer flex items-center gap-1"
              title="Switch to Cylinder Bottle view"
            >
              <span>🍶 Cylinder</span>
            </button>
          </div>

          {/* Biological Organ Status Badge */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedOrgan(ORGAN_MILESTONES[0]);
            }}
            className={`px-2.5 py-1 rounded-full border text-[10px] font-semibold flex items-center gap-1 transition cursor-pointer backdrop-blur-md shrink-0 ${
              hydratedOrgansCount === ORGAN_MILESTONES.length
                ? 'bg-[#30d158]/15 border-[#30d158]/30 text-[#30d158]'
                : 'bg-[#0a84ff]/10 border-[#0a84ff]/25 text-[#0a84ff]'
            }`}
            title="Tap to view biological organ hydration status"
          >
            <Activity className="w-3 h-3" />
            <span>{hydratedOrgansCount}/6</span>
          </button>
        </div>

        {/* Volume Scale Markers (pinned to right edge) */}
        <div className="absolute right-3.5 top-18 bottom-28 flex flex-col justify-between items-end text-[10px] font-mono text-neutral-500 z-20 pointer-events-none select-none">
          <div className="flex items-center gap-1">
            <span className={percentage >= 100 ? 'text-[#30d158] font-bold' : ''}>
              {selectedRecord.goal}ml
            </span>
            <span className="w-1.5 h-0.5 bg-neutral-600 rounded-full" />
          </div>
          <div className="flex items-center gap-1">
            <span className={percentage >= 75 ? 'text-[#0a84ff] font-medium' : ''}>
              {Math.round(selectedRecord.goal * 0.75)}ml
            </span>
            <span className="w-1.5 h-0.5 bg-neutral-700 rounded-full" />
          </div>
          <div className="flex items-center gap-1">
            <span className={percentage >= 50 ? 'text-[#0a84ff] font-medium' : ''}>
              {Math.round(selectedRecord.goal * 0.5)}ml
            </span>
            <span className="w-1.5 h-0.5 bg-neutral-700 rounded-full" />
          </div>
          <div className="flex items-center gap-1">
            <span className={percentage >= 25 ? 'text-[#0a84ff] font-medium' : ''}>
              {Math.round(selectedRecord.goal * 0.25)}ml
            </span>
            <span className="w-1.5 h-0.5 bg-neutral-700 rounded-full" />
          </div>
          <div className="flex items-center gap-1">
            <span>0ml</span>
            <span className="w-1.5 h-0.5 bg-neutral-700 rounded-full" />
          </div>
        </div>

        {/* ========================================================
            THE PRECISION ANATOMICAL VECTOR HUMAN BODY CANVAS
        ======================================================== */}
        <div className="relative w-[190px] h-[270px] flex items-center justify-center my-auto">
          <svg
            viewBox="0 0 200 320"
            className="w-full h-full overflow-visible drop-shadow-xl select-none"
          >
            <defs>
              {/* Linear Gradient for Empty Silhouette */}
              <linearGradient id="body-glass-bg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2c2c2e" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#161618" stopOpacity="0.85" />
              </linearGradient>

              {/* Linear Gradient for Front Fluid Wave */}
              <linearGradient id="body-water-front" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2997ff" />
                <stop offset="25%" stopColor="#0a84ff" />
                <stop offset="70%" stopColor="#0071e3" />
                <stop offset="100%" stopColor="#004a99" />
              </linearGradient>

              {/* Linear Gradient for Back Fluid Wave */}
              <linearGradient id="body-water-back" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#005bb5" />
                <stop offset="100%" stopColor="#002d5a" />
              </linearGradient>

              {/* The True Vector Anatomical ClipPath */}
              <clipPath id="anatomical-body-clip">
                <path d={activeBodyPath} />
              </clipPath>
            </defs>

            {/* 1. Empty Dark Glass Body Background */}
            <g
              fill="url(#body-glass-bg)"
              stroke="rgba(255, 255, 255, 0.16)"
              strokeWidth="1.8"
              className="transition-colors duration-500"
            >
              <path d={activeBodyPath} />
            </g>

            {/* 2. Fluid Wave Layer (Clipped 100% inside the Human Body) */}
            {percentage > 0 && (
              <g clipPath="url(#anatomical-body-clip)">
                {/* Back Wave */}
                <path d={backWavePath} fill="url(#body-water-back)" />
                {/* Front Wave */}
                <path d={frontWavePath} fill="url(#body-water-front)" />
                {/* Surface Meniscus Line */}
                <path
                  d={meniscusPath}
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.75)"
                  strokeWidth="2.5"
                />
              </g>
            )}

            {/* 3. Outer Silhouette Stroke & Glow */}
            <g
              fill="none"
              stroke={
                percentage >= 100
                  ? 'rgba(48, 209, 88, 0.75)'
                  : percentage > 0
                  ? 'rgba(10, 132, 255, 0.5)'
                  : 'rgba(255, 255, 255, 0.18)'
              }
              strokeWidth="2"
              className="transition-colors duration-500"
            >
              <path d={activeBodyPath} />
            </g>
          </svg>

          {/* ========================================================
              INTERACTIVE ORGAN MILESTONE NODES (Positioned relative to SVG box)
          ======================================================== */}
          {ORGAN_MILESTONES.map((organ) => {
            const isHydrated = percentage >= organ.thresholdPercent;
            const isSelected = selectedOrgan?.id === organ.id;

            // Compute exact relative % inside the 200x320 SVG coordinate frame
            const leftPercent = (organ.cx / 200) * 100;
            const topPercent = (organ.cy / 320) * 100;

            return (
              <button
                key={organ.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedOrgan(organ);
                }}
                style={{
                  top: `${topPercent}%`,
                  left: `${leftPercent}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                className={`absolute z-30 flex items-center justify-center transition cursor-pointer group ${
                  isSelected ? 'scale-125' : 'hover:scale-115'
                }`}
                title={`${organ.name} (${organ.thresholdPercent}% goal)`}
              >
                {/* Outer Glow Halo when hydrated */}
                {isHydrated && (
                  <motion.span
                    animate={{ scale: [1, 1.35, 1], opacity: [0.6, 0.2, 0.6] }}
                    transition={{ repeat: Infinity, duration: 2.2 }}
                    className="absolute w-7 h-7 rounded-full"
                    style={{ backgroundColor: organ.glowColor }}
                  />
                )}

                {/* Organ Node Pill */}
                <div
                  className={`relative w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-md transition-all border ${
                    isHydrated
                      ? 'bg-[#1c1c1e] text-white border-white/40 shadow-[0_0_10px_rgba(10,132,255,0.4)]'
                      : 'bg-black/60 text-neutral-500 border-white/[0.08] opacity-60'
                  }`}
                  style={{
                    borderColor: isHydrated ? organ.glowColor : undefined,
                  }}
                >
                  <span className="leading-none text-[11px] select-none">{organ.emoji}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* ========================================================
            BOTTOM FLOATING HYDRATION HUD (Fully padded, zero clipping)
        ======================================================== */}
        <div className="w-full z-20 flex flex-col items-center justify-center text-center bg-[#161618]/90 backdrop-blur-xl px-4 py-3 rounded-3xl border border-white/[0.08] shadow-lg pointer-events-none mt-1">
          {/* Main Net Intake Number */}
          <div className="flex items-baseline gap-1">
            <span className="text-3xl sm:text-4xl font-bold font-heading text-white tracking-tight">
              {netTotal.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-neutral-400">ml</span>
            <span className="text-xs font-bold text-[#0a84ff] ml-2">({percentage}%)</span>
          </div>

          {/* Goal breakdown & Climate Adjustment */}
          <div className="flex items-center gap-1 text-[11px] text-neutral-400 mt-0.5">
            {weather && weather.recommendedAdjustmentMl > 0 ? (
              <span className="flex items-center gap-1">
                <span>Goal: {profile.dailyGoal.toLocaleString()}</span>
                <span className="text-[#ff9f0a]">+{weather.recommendedAdjustmentMl}ml ☀️</span>
                <span>= {selectedRecord.goal.toLocaleString()}ml</span>
              </span>
            ) : (
              <span>Target: {selectedRecord.goal.toLocaleString()} ml</span>
            )}
          </div>

          {/* Remaining or Completed Pill */}
          {remainingMl > 0 ? (
            <span className="text-[10px] text-neutral-400 font-medium mt-1">
              {remainingMl.toLocaleString()} ml to 100% full hydration
            </span>
          ) : (
            <span className="text-[10px] font-semibold text-[#30d158] flex items-center gap-1 mt-1 bg-[#30d158]/10 px-2.5 py-0.5 rounded-full border border-[#30d158]/20">
              <Check className="w-3 h-3" />
              100% Biological Hydration Achieved! 🎉
            </span>
          )}
        </div>
      </motion.div>

      {/* ========================================================
          INTERACTIVE ORGAN CLINICAL DETAIL MODAL
      ======================================================== */}
      <AnimatePresence>
        {selectedOrgan && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrgan(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.96 }}
              className="relative w-full max-w-md rounded-3xl apple-glass-modal p-5 sm:p-6 z-10 overflow-hidden space-y-4 border border-white/[0.12] shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl shadow-md border border-white/20"
                    style={{ backgroundColor: `${selectedOrgan.glowColor}25` }}
                  >
                    <span>{selectedOrgan.emoji}</span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white leading-tight">
                      {selectedOrgan.name}
                    </h3>
                    <p className="text-xs text-neutral-400">
                      Activates at {selectedOrgan.thresholdPercent}% daily hydration
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedOrgan(null)}
                  className="p-1.5 rounded-full text-neutral-400 hover:text-white bg-white/[0.08] transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Hydration Status Badge */}
              <div
                className={`p-3 rounded-2xl border flex items-center justify-between text-xs font-semibold ${
                  percentage >= selectedOrgan.thresholdPercent
                    ? 'bg-[#30d158]/10 border-[#30d158]/30 text-[#30d158]'
                    : 'bg-[#ff9f0a]/10 border-[#ff9f0a]/30 text-[#ff9f0a]'
                }`}
              >
                <div className="flex items-center gap-2">
                  {percentage >= selectedOrgan.thresholdPercent ? (
                    <>
                      <ShieldCheck className="w-4 h-4 text-[#30d158]" />
                      <span>Currently 100% Hydrated & Optimized</span>
                    </>
                  ) : (
                    <>
                      <Flame className="w-4 h-4 text-[#ff9f0a]" />
                      <span>
                        Needs{' '}
                        {Math.max(
                          0,
                          Math.round(
                            (selectedRecord.goal * selectedOrgan.thresholdPercent) / 100 - netTotal
                          )
                        )}
                        ml more to fully activate
                      </span>
                    </>
                  )}
                </div>
                <span className="font-mono text-[11px]">
                  {Math.min(
                    100,
                    Math.round((percentage / selectedOrgan.thresholdPercent) * 100)
                  )}
                  %
                </span>
              </div>

              {/* Clinical Benefit Highlight */}
              <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.06] space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                  <Zap className="w-3.5 h-3.5 text-[#0a84ff]" />
                  <span>{selectedOrgan.title}</span>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  {selectedOrgan.scienceNote}
                </p>
              </div>

              {/* Quick organ switch buttons */}
              <div className="pt-2 border-t border-white/[0.08]">
                <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider block mb-2">
                  Explore other body systems:
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  {ORGAN_MILESTONES.map((o) => (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => setSelectedOrgan(o)}
                      className={`p-2 rounded-xl border text-[11px] font-medium flex items-center gap-1.5 transition cursor-pointer ${
                        selectedOrgan.id === o.id
                          ? 'bg-[#0a84ff]/20 border-[#0a84ff] text-white'
                          : 'bg-black/30 border-white/[0.06] text-neutral-400 hover:text-white'
                      }`}
                    >
                      <span>{o.emoji}</span>
                      <span className="truncate">{o.shortName}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
