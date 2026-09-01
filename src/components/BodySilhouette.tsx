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
import { ProgressDisplayMode } from '../types/water';

// 6 Major Biological Organ Milestones
export interface OrganMilestone {
  id: string;
  name: string;
  shortName: string;
  emoji: string;
  x: number; // percentage in coordinate space (0-100)
  y: number; // percentage in coordinate space (0-100)
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
    x: 50,
    y: 10,
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
    x: 50,
    y: 25,
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
    x: 47,
    y: 34,
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
    x: 50,
    y: 47,
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
    x: 50,
    y: 57,
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
    x: 50,
    y: 77,
    thresholdPercent: 15,
    title: 'Synovial Lubrication & Cramp Defense',
    scienceNote:
      'Skeletal muscle tissue is 76% water by mass. Synovial joint fluid cushions cartilage against friction, while intracellular hydration prevents sudden muscle spasms and lactic soreness.',
    benefit: 'Replenishes joint fluid & shields from cramps',
    glowColor: '#0a84ff',
  },
];

interface Bubble {
  x: number;
  y: number;
  size: number;
  speed: number;
  alpha: number;
  sway: number;
}

interface BodySilhouetteProps {
  onQuickAdd?: () => void;
}

export const BodySilhouette: React.FC<BodySilhouetteProps> = ({ onQuickAdd }) => {
  const { selectedRecord, chugWarning, clearChugWarning, profile, weather, updateProfile } =
    useWater();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const grossTotal = selectedRecord.total;
  const netTotal = selectedRecord.netTotal || grossTotal;
  const percentage = Math.min(100, Math.max(0, Math.round((netTotal / selectedRecord.goal) * 100)));
  const remainingMl = Math.max(0, selectedRecord.goal - netTotal);

  // Active visual mode: 'male' | 'female' (cylinder is handled in App.tsx)
  const currentMode: 'male' | 'female' =
    profile.progressDisplayMode === 'female' ? 'female' : 'male';

  const [selectedOrgan, setSelectedOrgan] = useState<OrganMilestone | null>(null);

  // Wave physics
  const waveAmplitudeRef = useRef<number>(3.5);
  const phaseRef = useRef<number>(0);
  const bubblesRef = useRef<Bubble[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  const handleBodyTap = () => {
    waveAmplitudeRef.current = 12;
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(18);
      } catch {
        // ignore
      }
    }
  };

  // Fluid canvas wave animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (bubblesRef.current.length === 0) {
      for (let i = 0; i < 20; i++) {
        bubblesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2.2 + 1,
          speed: Math.random() * 0.9 + 0.35,
          alpha: Math.random() * 0.45 + 0.15,
          sway: Math.random() * Math.PI * 2,
        });
      }
    }

    let isRunning = true;

    const render = () => {
      if (!isRunning) return;

      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      phaseRef.current += 0.035;
      waveAmplitudeRef.current += (3.5 - waveAmplitudeRef.current) * 0.04;

      const currentWaterHeight = (percentage / 100) * height;
      const baseWaterY = height - currentWaterHeight;

      if (percentage > 0) {
        // 1. Back Wave (Deep Subdued Ocean Blue)
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(0, height);
        for (let x = 0; x <= width; x += 4) {
          const wave1 =
            Math.sin(x * 0.02 + phaseRef.current + Math.PI) * (waveAmplitudeRef.current * 0.65);
          const y = baseWaterY + wave1;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(width, height);
        ctx.closePath();

        const backGrad = ctx.createLinearGradient(0, baseWaterY, 0, height);
        backGrad.addColorStop(0, '#005bb5');
        backGrad.addColorStop(1, '#003366');
        ctx.fillStyle = backGrad;
        ctx.fill();
        ctx.restore();

        // 2. Front Wave (Vibrant Apple Blue)
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(0, height);
        for (let x = 0; x <= width; x += 4) {
          const wave2 = Math.sin(x * 0.024 + phaseRef.current) * waveAmplitudeRef.current;
          const y = baseWaterY + wave2;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(width, height);
        ctx.closePath();

        const frontGrad = ctx.createLinearGradient(0, baseWaterY, 0, height);
        frontGrad.addColorStop(0, '#2997ff');
        frontGrad.addColorStop(0.3, '#0a84ff');
        frontGrad.addColorStop(0.7, '#0071e3');
        frontGrad.addColorStop(1, '#004a99');
        ctx.fillStyle = frontGrad;
        ctx.fill();

        // 3. Meniscus Highlight Line
        ctx.beginPath();
        for (let x = 0; x <= width; x += 4) {
          const wave2 = Math.sin(x * 0.024 + phaseRef.current) * waveAmplitudeRef.current;
          const y = baseWaterY + wave2;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();

        // 4. Floating Micro Bubbles
        ctx.save();
        bubblesRef.current.forEach((b) => {
          b.y -= b.speed;
          b.sway += 0.035;
          const currentX = b.x + Math.sin(b.sway) * 2.5;

          if (b.y < baseWaterY) {
            b.y = height + Math.random() * 20;
            b.x = Math.random() * width;
          }

          if (b.y >= baseWaterY && b.y <= height) {
            ctx.beginPath();
            ctx.arc(currentX, b.y, b.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${b.alpha})`;
            ctx.fill();
          }
        });
        ctx.restore();
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      isRunning = false;
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [percentage]);

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
        className="relative w-full max-w-[320px] h-[430px] rounded-[44px] p-4 cursor-pointer apple-card overflow-hidden flex flex-col items-center justify-between shadow-2xl border border-white/[0.08]"
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
                updateProfile({ progressDisplayMode: 'male', avatarType: 'male' });
              }}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition cursor-pointer flex items-center gap-1 ${
                currentMode === 'male'
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
                updateProfile({ progressDisplayMode: 'female', avatarType: 'female' });
              }}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition cursor-pointer flex items-center gap-1 ${
                currentMode === 'female'
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
            title="Tap to see biological organ hydration breakdown"
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
            THE CLEAN ANATOMICAL HUMAN BODY SILHOUETTE CANVAS
        ======================================================== */}
        <div className="relative w-[210px] h-[320px] flex items-center justify-center my-auto">
          {/* SVG Definition with Clean Clip Path */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible"
            viewBox="0 0 220 380"
          >
            <defs>
              {/* Dynamic Silhouette Clip Path */}
              <clipPath id="body-silhouette-clip">
                {currentMode === 'male' ? (
                  <>
                    {/* Male Head */}
                    <ellipse cx="110" cy="36" rx="19" ry="23" />
                    {/* Male Torso, Arms & Legs */}
                    <path d="M 98,58 C 94,59 78,74 62,88 C 58,92 56,102 58,124 C 60,148 64,178 68,204 C 70,212 76,214 80,208 C 82,204 82,188 80,166 C 78,144 82,122 88,114 C 92,108 94,116 94,130 C 92,156 90,182 90,206 C 90,232 88,262 86,292 C 84,322 84,350 86,364 C 87,370 92,372 96,370 C 100,368 100,356 100,336 C 100,306 102,276 104,246 C 105,231 106,218 110,212 C 114,218 115,231 116,246 C 118,276 120,306 120,336 C 120,356 120,368 124,370 C 128,372 133,370 134,364 C 136,350 136,322 134,292 C 132,262 130,232 130,206 C 130,182 128,156 126,130 C 126,116 128,108 132,114 C 138,122 142,144 140,166 C 138,188 138,204 140,208 C 144,214 150,212 152,204 C 156,178 160,148 162,124 C 164,102 162,92 158,88 C 142,74 126,59 122,58 Z" />
                  </>
                ) : (
                  <>
                    {/* Female Head */}
                    <ellipse cx="110" cy="38" rx="17" ry="21" />
                    {/* Female Torso, Arms & Legs (Contoured hourglass curves) */}
                    <path d="M 100,58 C 96,59 84,72 70,86 C 66,90 64,100 66,122 C 68,146 72,176 76,200 C 78,208 84,210 88,204 C 90,200 90,186 88,166 C 86,146 90,126 96,116 C 98,110 98,118 98,130 C 96,155 92,180 92,205 C 92,230 90,260 88,290 C 86,320 86,348 88,362 C 89,368 94,370 98,368 C 102,366 102,355 102,335 C 102,305 103,275 104,245 C 105,230 106,218 110,212 C 114,218 115,230 116,245 C 117,275 118,305 118,335 C 118,355 118,366 122,368 C 126,370 131,368 132,362 C 134,348 134,320 132,290 C 130,260 126,230 126,205 C 126,180 122,155 120,130 C 120,118 120,110 122,116 C 128,126 132,146 130,166 C 128,186 128,200 130,204 C 134,210 140,208 142,200 C 146,176 150,146 152,122 C 154,100 152,90 148,86 C 134,72 122,59 118,58 Z" />
                  </>
                )}
              </clipPath>

              {/* Glowing anatomical inner shadow */}
              <linearGradient id="body-empty-glow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2c2c2e" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#161618" stopOpacity="0.85" />
              </linearGradient>
            </defs>

            {/* Empty Body Silhouette Backdrop */}
            {currentMode === 'male' ? (
              <g
                fill="url(#body-empty-glow)"
                stroke="rgba(255, 255, 255, 0.16)"
                strokeWidth="2"
                className="transition-colors duration-500"
              >
                <ellipse cx="110" cy="36" rx="19" ry="23" />
                <path d="M 98,58 C 94,59 78,74 62,88 C 58,92 56,102 58,124 C 60,148 64,178 68,204 C 70,212 76,214 80,208 C 82,204 82,188 80,166 C 78,144 82,122 88,114 C 92,108 94,116 94,130 C 92,156 90,182 90,206 C 90,232 88,262 86,292 C 84,322 84,350 86,364 C 87,370 92,372 96,370 C 100,368 100,356 100,336 C 100,306 102,276 104,246 C 105,231 106,218 110,212 C 114,218 115,231 116,246 C 118,276 120,306 120,336 C 120,356 120,368 124,370 C 128,372 133,370 134,364 C 136,350 136,322 134,292 C 132,262 130,232 130,206 C 130,182 128,156 126,130 C 126,116 128,108 132,114 C 138,122 142,144 140,166 C 138,188 138,204 140,208 C 144,214 150,212 152,204 C 156,178 160,148 162,124 C 164,102 162,92 158,88 C 142,74 126,59 122,58 Z" />
              </g>
            ) : (
              <g
                fill="url(#body-empty-glow)"
                stroke="rgba(255, 255, 255, 0.16)"
                strokeWidth="2"
                className="transition-colors duration-500"
              >
                <ellipse cx="110" cy="38" rx="17" ry="21" />
                <path d="M 100,58 C 96,59 84,72 70,86 C 66,90 64,100 66,122 C 68,146 72,176 76,200 C 78,208 84,210 88,204 C 90,200 90,186 88,166 C 86,146 90,126 96,116 C 98,110 98,118 98,130 C 96,155 92,180 92,205 C 92,230 90,260 88,290 C 86,320 86,348 88,362 C 89,368 94,370 98,368 C 102,366 102,355 102,335 C 102,305 103,275 104,245 C 105,230 106,218 110,212 C 114,218 115,230 116,245 C 117,275 118,305 118,335 C 118,355 118,366 122,368 C 126,370 131,368 132,362 C 134,348 134,320 132,290 C 130,260 126,230 126,205 C 126,180 122,155 120,130 C 120,118 120,110 122,116 C 128,126 132,146 130,166 C 128,186 128,200 130,204 C 134,210 140,208 142,200 C 146,176 150,146 152,122 C 154,100 152,90 148,86 C 134,72 122,59 118,58 Z" />
              </g>
            )}
          </svg>

          {/* HTML Canvas Fluid Layer clipped inside the Body Silhouette */}
          <div
            className="absolute inset-0 w-full h-full overflow-hidden"
            style={{
              clipPath: 'url(#body-silhouette-clip)',
              WebkitClipPath: 'url(#body-silhouette-clip)',
            }}
          >
            <canvas ref={canvasRef} width={220} height={380} className="w-full h-full block" />
          </div>

          {/* Outer Silhouette Stroke Glow Layer */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible"
            viewBox="0 0 220 380"
          >
            {currentMode === 'male' ? (
              <g
                fill="none"
                stroke={
                  percentage >= 100
                    ? 'rgba(48, 209, 88, 0.7)'
                    : percentage > 0
                    ? 'rgba(10, 132, 255, 0.45)'
                    : 'rgba(255, 255, 255, 0.16)'
                }
                strokeWidth="2"
                className="transition-colors duration-500"
              >
                <ellipse cx="110" cy="36" rx="19" ry="23" />
                <path d="M 98,58 C 94,59 78,74 62,88 C 58,92 56,102 58,124 C 60,148 64,178 68,204 C 70,212 76,214 80,208 C 82,204 82,188 80,166 C 78,144 82,122 88,114 C 92,108 94,116 94,130 C 92,156 90,182 90,206 C 90,232 88,262 86,292 C 84,322 84,350 86,364 C 87,370 92,372 96,370 C 100,368 100,356 100,336 C 100,306 102,276 104,246 C 105,231 106,218 110,212 C 114,218 115,231 116,246 C 118,276 120,306 120,336 C 120,356 120,368 124,370 C 128,372 133,370 134,364 C 136,350 136,322 134,292 C 132,262 130,232 130,206 C 130,182 128,156 126,130 C 126,116 128,108 132,114 C 138,122 142,144 140,166 C 138,188 138,204 140,208 C 144,214 150,212 152,204 C 156,178 160,148 162,124 C 164,102 162,92 158,88 C 142,74 126,59 122,58 Z" />
              </g>
            ) : (
              <g
                fill="none"
                stroke={
                  percentage >= 100
                    ? 'rgba(48, 209, 88, 0.7)'
                    : percentage > 0
                    ? 'rgba(10, 132, 255, 0.45)'
                    : 'rgba(255, 255, 255, 0.16)'
                }
                strokeWidth="2"
                className="transition-colors duration-500"
              >
                <ellipse cx="110" cy="38" rx="17" ry="21" />
                <path d="M 100,58 C 96,59 84,72 70,86 C 66,90 64,100 66,122 C 68,146 72,176 76,200 C 78,208 84,210 88,204 C 90,200 90,186 88,166 C 86,146 90,126 96,116 C 98,110 98,118 98,130 C 96,155 92,180 92,205 C 92,230 90,260 88,290 C 86,320 86,348 88,362 C 89,368 94,370 98,368 C 102,366 102,355 102,335 C 102,305 103,275 104,245 C 105,230 106,218 110,212 C 114,218 115,230 116,245 C 117,275 118,305 118,335 C 118,355 118,366 122,368 C 126,370 131,368 132,362 C 134,348 134,320 132,290 C 130,260 126,230 126,205 C 126,180 122,155 120,130 C 120,118 120,110 122,116 C 128,126 132,146 130,166 C 128,186 128,200 130,204 C 134,210 140,208 142,200 C 146,176 150,146 152,122 C 154,100 152,90 148,86 C 134,72 122,59 118,58 Z" />
              </g>
            )}
          </svg>

          {/* ========================================================
              INTERACTIVE ORGAN MILESTONE NODES
          ======================================================== */}
          {ORGAN_MILESTONES.map((organ) => {
            const isHydrated = percentage >= organ.thresholdPercent;
            const isSelected = selectedOrgan?.id === organ.id;

            return (
              <button
                key={organ.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedOrgan(organ);
                }}
                style={{
                  top: `${organ.y}%`,
                  left: `${organ.x}%`,
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
