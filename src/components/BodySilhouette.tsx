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

// 6 Major Biological Organ Milestones (normalized to 0 0 200 300 coordinate box)
export interface OrganMilestone {
  id: string;
  name: string;
  shortName: string;
  emoji: string;
  cx: number; // in 0 0 200 300 coordinate space
  cy: number; // in 0 0 200 300 coordinate space
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
    cy: 28,
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
    cy: 82,
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
    cy: 104,
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
    cy: 138,
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
    cy: 162,
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
    cy: 228,
    thresholdPercent: 15,
    title: 'Synovial Lubrication & Cramp Defense',
    scienceNote:
      'Skeletal muscle tissue is 76% water by mass. Synovial joint fluid cushions cartilage against friction, while intracellular hydration prevents sudden muscle spasms and lactic soreness.',
    benefit: 'Replenishes joint fluid & shields from cramps',
    glowColor: '#0a84ff',
  },
];

// Precision Medical Silhouettes generated from Reference Vector Diagram (ViewBox 0 0 200 300)
const MALE_BODY_PATH_D =
  'M 95.9,8.2 L 89.2,12.8 L 86.6,20.4 L 84.6,28.2 L 85.9,35.8 L 89.4,43.1 L 86.6,50.4 L 79.4,53.9 L 71.8,56.7 L 64.4,59.5 L 59.3,65.7 L 58.1,73.8 L 57.5,82.3 L 55.1,89.9 L 53.1,97.8 L 49.1,104.7 L 45.1,111.8 L 43.1,119.6 L 40.6,127.2 L 37.8,134.7 L 34.1,141.9 L 28.0,146.9 L 22.2,152.5 L 28.2,154.1 L 26.6,161.8 L 27.2,167.5 L 33.6,170.3 L 39.7,167.4 L 42.5,159.9 L 44.3,152.0 L 46.0,144.0 L 49.3,136.7 L 54.4,130.2 L 59.0,123.4 L 63.5,116.7 L 65.9,109.0 L 68.3,101.3 L 71.0,93.7 L 74.4,99.1 L 75.6,107.3 L 75.5,116.0 L 75.2,124.5 L 72.8,132.1 L 71.9,140.4 L 71.0,148.7 L 70.0,157.0 L 69.1,165.3 L 69.1,173.9 L 70.1,182.2 L 71.8,190.1 L 72.9,198.4 L 72.8,207.0 L 71.3,215.1 L 69.2,222.9 L 69.1,231.5 L 70.1,239.7 L 71.1,248.0 L 72.9,255.9 L 73.7,264.2 L 72.9,272.5 L 69.9,279.9 L 64.6,286.4 L 70.5,290.1 L 78.0,291.2 L 82.7,285.7 L 85.7,278.2 L 85.8,270.4 L 84.8,262.1 L 85.7,253.8 L 87.0,245.7 L 89.1,237.9 L 90.2,229.7 L 89.4,221.5 L 88.9,213.3 L 91.2,205.7 L 92.6,197.6 L 94.0,189.5 L 95.0,181.3 L 97.8,173.8 L 99.4,165.7 L 100.9,173.6 L 103.3,181.3 L 104.8,189.3 L 105.9,197.5 L 106.9,205.8 L 108.9,213.6 L 108.8,221.6 L 107.9,229.8 L 108.7,238.1 L 111.5,245.6 L 112.4,253.9 L 113.3,262.2 L 112.9,270.3 L 112.5,278.4 L 115.9,285.6 L 120.8,291.1 L 129.1,290.2 L 133.2,285.1 L 128.1,278.6 L 125.3,271.1 L 124.3,262.8 L 125.8,254.7 L 127.2,246.6 L 128.0,238.3 L 129.1,230.1 L 128.0,221.9 L 126.7,213.8 L 125.4,205.6 L 125.4,197.0 L 126.9,189.0 L 128.1,180.8 L 129.0,172.5 L 129.0,163.9 L 128.1,155.6 L 127.1,147.3 L 125.4,139.4 L 124.5,131.1 L 122.6,123.3 L 122.6,114.6 L 122.7,106.7 L 124.4,98.8 L 127.2,94.4 L 130.4,101.7 L 132.6,109.5 L 135.3,117.0 L 139.3,124.0 L 144.5,130.5 L 148.7,137.4 L 152.8,144.4 L 153.9,152.6 L 156.6,160.1 L 158.8,168.0 L 164.0,170.2 L 169.6,168.1 L 173.2,163.9 L 170.4,156.5 L 175.4,154.6 L 172.7,149.4 L 167.1,143.1 L 161.5,137.2 L 158.5,129.8 L 155.7,122.3 L 154.2,114.2 L 151.0,106.9 L 145.9,100.4 L 143.8,92.6 L 142.2,84.6 L 140.1,76.8 L 140.1,68.1 L 136.1,61.1 L 129.2,56.9 L 121.5,54.7 L 114.1,51.5 L 109.6,45.6 L 110.8,37.3 L 114.2,30.1 L 112.5,22.2 L 110.5,14.3 L 104.1,8.9 Z';

const FEMALE_BODY_PATH_D =
  'M 95.0,8.2 L 88.9,13.2 L 86.6,21.0 L 84.8,29.1 L 86.9,37.0 L 90.6,44.3 L 89.6,51.9 L 82.3,55.6 L 74.0,56.9 L 67.0,61.5 L 64.1,69.1 L 62.8,77.3 L 61.5,85.6 L 59.3,93.5 L 57.1,101.3 L 52.9,108.4 L 49.6,115.8 L 47.5,123.7 L 44.6,131.3 L 41.3,138.7 L 35.8,144.8 L 29.5,150.9 L 30.1,154.6 L 31.7,158.9 L 29.4,166.9 L 35.6,169.0 L 41.2,165.7 L 45.2,160.9 L 47.9,153.2 L 48.8,144.8 L 52.1,137.4 L 56.9,130.6 L 61.3,123.6 L 66.1,116.8 L 69.0,109.3 L 70.7,101.2 L 73.6,93.6 L 77.4,96.9 L 79.1,105.0 L 78.8,113.5 L 75.5,120.9 L 72.8,128.6 L 70.7,136.5 L 69.2,144.7 L 68.2,153.0 L 68.2,161.8 L 69.2,170.2 L 70.7,178.4 L 72.8,186.3 L 74.7,194.3 L 75.6,202.7 L 75.6,211.5 L 74.6,219.9 L 72.7,227.9 L 73.8,236.3 L 74.7,244.7 L 76.5,252.7 L 78.4,260.8 L 78.3,268.8 L 78.0,277.4 L 73.0,283.8 L 73.5,290.1 L 81.8,291.2 L 87.4,286.4 L 89.4,279.7 L 89.4,271.7 L 88.4,263.2 L 90.4,255.3 L 91.3,246.8 L 93.1,238.8 L 93.1,230.0 L 92.1,221.6 L 93.0,213.2 L 94.8,205.2 L 94.9,196.4 L 95.9,188.0 L 96.8,179.6 L 97.6,171.2 L 98.7,162.8 L 98.4,154.7 L 100.4,160.6 L 101.4,169.0 L 102.0,177.6 L 103.1,185.9 L 103.1,194.7 L 104.2,203.0 L 105.1,211.4 L 106.9,219.5 L 106.0,227.9 L 106.0,236.6 L 107.9,244.6 L 108.7,253.1 L 109.7,261.5 L 109.6,269.4 L 109.8,278.3 L 110.9,285.8 L 116.4,291.2 L 124.8,290.2 L 126.6,284.8 L 120.9,278.4 L 119.9,270.0 L 120.8,261.6 L 121.9,253.3 L 124.0,245.4 L 125.3,237.2 L 126.3,228.8 L 124.3,220.8 L 123.4,212.4 L 123.5,203.6 L 124.2,195.1 L 126.4,187.2 L 128.1,179.1 L 130.0,171.1 L 131.0,162.7 L 130.9,153.9 L 130.0,145.5 L 128.2,137.5 L 126.3,129.5 L 123.5,121.8 L 120.2,114.4 L 119.7,105.7 L 121.4,97.7 L 125.1,93.4 L 127.9,101.0 L 129.9,109.0 L 132.7,116.6 L 137.3,123.5 L 141.7,130.5 L 146.0,137.5 L 149.3,144.9 L 151.0,153.0 L 153.6,160.7 L 157.4,166.4 L 162.2,169.4 L 169.6,166.8 L 166.9,159.2 L 168.9,154.7 L 169.3,150.5 L 163.1,144.3 L 157.6,138.4 L 154.3,130.9 L 151.4,123.4 L 149.3,115.4 L 146.1,108.0 L 142.0,100.9 L 139.2,93.3 L 137.4,85.2 L 136.2,76.9 L 135.2,68.6 L 131.2,61.4 L 124.6,56.9 L 116.5,55.4 L 109.2,51.8 L 108.6,43.8 L 112.2,36.6 L 114.3,28.6 L 112.5,20.6 L 110.4,12.7 L 103.5,8.4 Z';

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

  // Compute precise SVG Wave Paths inside the 0 0 200 300 coordinate box
  const { frontWavePath, backWavePath, meniscusPath } = useMemo(() => {
    if (percentage <= 0) {
      return { frontWavePath: '', backWavePath: '', meniscusPath: '' };
    }

    const totalHeight = 300;
    const waterHeight = (percentage / 100) * totalHeight;
    const baseWaterY = totalHeight - waterHeight;

    // Front Wave
    let front = `M 0 300 L 0 ${baseWaterY} `;
    let meniscus = `M 0 ${baseWaterY} `;
    for (let x = 0; x <= 200; x += 5) {
      const waveY = baseWaterY + Math.sin(x * 0.035 + phase) * amplitude;
      front += `L ${x} ${waveY} `;
      meniscus += `L ${x} ${waveY} `;
    }
    front += `L 200 300 Z`;

    // Back Wave
    let back = `M 0 300 L 0 ${baseWaterY} `;
    for (let x = 0; x <= 200; x += 5) {
      const waveY = baseWaterY + Math.sin(x * 0.03 + phase + Math.PI) * (amplitude * 0.7);
      back += `L ${x} ${waveY} `;
    }
    back += `L 200 300 Z`;

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
            THE PRECISION MEDICAL VECTOR HUMAN BODY CANVAS
        ======================================================== */}
        <div className="relative w-[190px] h-[270px] flex items-center justify-center my-auto">
          <svg
            viewBox="0 0 200 300"
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

            // Compute exact relative % inside the 200x300 SVG coordinate frame
            const leftPercent = (organ.cx / 200) * 100;
            const topPercent = (organ.cy / 300) * 100;

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
