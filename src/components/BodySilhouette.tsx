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

// 6 Major Biological Organ Milestones
export interface OrganMilestone {
  id: string;
  name: string;
  shortName: string;
  emoji: string;
  cx: number; // in 0 0 200 360 coordinate space
  cy: number; // in 0 0 200 360 coordinate space
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
    cy: 36,
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
    cy: 95,
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
    cy: 118,
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
    cy: 155,
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
    cy: 185,
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
    cy: 260,
    thresholdPercent: 15,
    title: 'Synovial Lubrication & Cramp Defense',
    scienceNote:
      'Skeletal muscle tissue is 76% water by mass. Synovial joint fluid cushions cartilage against friction, while intracellular hydration prevents sudden muscle spasms and lactic soreness.',
    benefit: 'Replenishes joint fluid & shields from cramps',
    glowColor: '#0a84ff',
  },
];

// Precision Anatomical Vector Silhouettes (ViewBox 0 0 200 360)
const MALE_BODY_PATH_D =
  'M 100,14 C 112,14 116,22 116,30 C 118,32 121,34 121,42 C 121,48 117,50 115,52 C 113,58 108,66 100,66 C 92,66 87,58 85,52 C 83,50 79,48 79,42 C 79,34 82,32 84,30 C 84,22 88,14 100,14 Z M 93,66 C 93,66 92,76 92,80 C 92,80 76,86 58,94 C 54,96 52,102 52,114 C 52,126 53,145 53,145 C 53,145 50,165 48,178 C 46,192 45,202 45,202 C 43,206 36,212 35,222 C 34,228 40,230 43,226 C 44,224 45,232 46,240 C 47,244 52,244 53,240 C 55,232 56,222 56,222 C 56,222 55,208 54,202 C 54,196 56,184 57,178 C 59,165 62,148 62,148 C 62,148 68,135 70,118 C 70,118 76,138 78,155 C 80,172 74,195 74,195 C 74,195 75,230 75,230 C 75,230 78,270 78,270 C 78,270 76,302 76,302 C 76,302 84,335 84,335 C 84,335 82,348 78,354 C 76,357 82,359 86,356 C 90,353 92,345 92,335 C 92,325 92,302 92,302 C 92,302 94,270 94,270 C 94,270 95,230 95,230 C 95,230 98,198 100,195 C 102,198 105,230 105,230 C 105,230 106,270 106,270 C 106,270 108,302 108,302 C 108,302 108,325 108,335 C 108,345 110,353 114,356 C 118,359 124,357 122,354 C 118,348 116,335 116,335 C 116,335 124,302 124,302 C 124,302 122,270 122,270 C 122,270 125,230 125,230 C 125,230 126,195 126,195 C 126,195 120,172 122,155 C 124,138 130,118 130,118 C 132,135 138,148 138,148 C 138,148 141,165 143,178 C 144,184 146,196 146,202 C 145,208 144,222 144,222 C 144,222 145,232 147,240 C 148,244 153,244 154,240 C 155,232 156,224 157,226 C 160,230 166,228 165,222 C 164,212 157,206 155,202 C 155,202 154,192 152,178 C 150,165 147,145 147,145 C 147,145 148,126 148,114 C 148,102 146,96 142,94 C 124,86 108,80 108,80 C 108,76 107,66 107,66 Z';

const FEMALE_BODY_PATH_D =
  'M 100,18 C 111,18 115,25 115,33 C 117,35 120,37 120,44 C 120,49 116,51 114,53 C 112,59 106,66 100,66 C 94,66 88,59 86,53 C 84,51 80,49 80,44 C 80,37 83,35 85,33 C 85,25 89,18 100,18 Z M 95,66 C 95,66 94,76 94,78 C 94,78 80,84 66,92 C 63,94 62,100 62,110 C 62,122 61,142 61,142 C 61,142 58,165 56,178 C 54,192 52,206 52,206 C 50,210 43,215 42,222 C 41,228 47,230 50,226 C 51,224 51,232 52,240 C 53,244 58,244 59,240 C 61,232 60,222 60,222 C 60,222 60,212 60,206 C 60,200 62,188 64,178 C 66,165 69,145 69,145 C 69,145 74,132 76,118 C 76,118 84,136 85,150 C 86,168 72,192 72,192 C 72,192 74,230 74,230 C 74,230 79,270 79,270 C 79,270 78,302 78,302 C 78,302 85,335 85,335 C 85,335 83,348 80,354 C 78,357 84,359 88,356 C 92,353 93,345 93,335 C 93,325 93,302 93,302 C 93,302 94,270 94,270 C 94,270 96,230 96,230 C 96,230 98,195 100,192 C 102,195 104,230 104,230 C 104,230 106,270 106,270 C 106,270 107,302 107,302 C 107,302 107,325 107,335 C 107,345 108,353 112,356 C 116,359 122,357 120,354 C 117,348 115,335 115,335 C 115,335 122,302 122,302 C 122,302 121,270 121,270 C 121,270 126,230 126,230 C 126,230 128,192 128,192 C 128,192 114,168 115,150 C 116,136 124,118 124,118 C 126,132 131,145 131,145 C 131,145 134,165 136,178 C 138,188 140,200 140,206 C 140,212 140,222 140,222 C 140,222 139,232 141,240 C 142,244 147,244 148,240 C 149,232 149,224 150,226 C 153,230 159,228 158,222 C 157,215 150,210 148,206 C 148,206 146,192 144,178 C 142,165 139,142 139,142 C 139,142 138,122 138,110 C 138,100 137,94 134,92 C 120,84 106,78 106,78 C 106,76 105,66 105,66 Z';

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

  // Compute precise SVG Wave Paths inside the 0 0 200 360 coordinate box
  const { frontWavePath, backWavePath, meniscusPath } = useMemo(() => {
    if (percentage <= 0) {
      return { frontWavePath: '', backWavePath: '', meniscusPath: '' };
    }

    const totalHeight = 360;
    const waterHeight = (percentage / 100) * totalHeight;
    const baseWaterY = totalHeight - waterHeight;

    // Front Wave
    let front = `M 0 360 L 0 ${baseWaterY} `;
    let meniscus = `M 0 ${baseWaterY} `;
    for (let x = 0; x <= 200; x += 5) {
      const waveY = baseWaterY + Math.sin(x * 0.035 + phase) * amplitude;
      front += `L ${x} ${waveY} `;
      meniscus += `L ${x} ${waveY} `;
    }
    front += `L 200 360 Z`;

    // Back Wave
    let back = `M 0 360 L 0 ${baseWaterY} `;
    for (let x = 0; x <= 200; x += 5) {
      const waveY = baseWaterY + Math.sin(x * 0.03 + phase + Math.PI) * (amplitude * 0.7);
      back += `L ${x} ${waveY} `;
    }
    back += `L 200 360 Z`;

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
        className="relative w-full max-w-[320px] h-[450px] rounded-[44px] p-4 cursor-pointer apple-card overflow-hidden flex flex-col items-center justify-between shadow-2xl border border-white/[0.08]"
      >
        {/* Background Ambient Radial Glow */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40 transition-opacity duration-700"
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
        <div className="absolute right-3.5 top-18 bottom-22 flex flex-col justify-between items-end text-[10px] font-mono text-neutral-500 z-20 pointer-events-none select-none">
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
        <div className="relative w-[190px] h-[320px] flex items-center justify-center my-auto">
          <svg
            viewBox="0 0 200 360"
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

            // Compute exact relative % inside the 200x360 SVG coordinate frame
            const leftPercent = (organ.cx / 200) * 100;
            const topPercent = (organ.cy / 360) * 100;

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
            BOTTOM FLOATING HYDRATION HUD
        ======================================================== */}
        <div className="w-full z-20 flex flex-col items-center justify-center text-center bg-[#161618]/90 backdrop-blur-xl px-4 py-3 rounded-3xl border border-white/[0.08] shadow-lg pointer-events-none mb-1">
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
