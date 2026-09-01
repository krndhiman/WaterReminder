import React, { useRef, useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Droplet,
  Check,
  Sparkles,
  Info,
  Sliders,
  X,
  Zap,
  Activity,
  Heart,
  ChevronRight,
  ShieldCheck,
  Flame,
} from 'lucide-react';
import { useWater } from '../context/WaterContext';
import { AvatarSilhouetteType, ProgressDisplayMode } from '../types/water';

// SVG anatomical body paths normalized to 0 0 240 400
export const SILHOUETTE_PATHS: Record<AvatarSilhouetteType, string> = {
  // Balanced / Athletic Minimalist Silhouette
  neutral:
    'M 120 12 C 134 12, 144 22, 144 36 C 144 49, 135 59, 127 62 C 127 66, 128 70, 131 73 C 145 75, 163 81, 172 92 C 178 100, 179 114, 177 130 C 175 146, 172 164, 170 184 C 168 198, 164 211, 159 215 C 156 218, 152 215, 151 208 C 153 192, 155 172, 156 154 C 157 140, 156 130, 152 128 C 148 126, 147 134, 146 146 C 145 161, 146 180, 147 195 C 148 205, 147 216, 145 226 C 144 236, 142 252, 141 268 C 140 284, 139 300, 139 316 C 139 332, 139 350, 138 366 C 137 376, 135 384, 131 388 C 127 390, 123 388, 122 382 C 122 374, 123 363, 124 348 C 125 332, 126 314, 126 296 C 126 278, 125 260, 124 243 C 123 230, 121 221, 120 218 C 119 221, 117 230, 116 243 C 115 260, 114 278, 114 296 C 114 314, 115 332, 116 348 C 117 363, 118 374, 118 382 C 117 388, 113 390, 109 388 C 105 384, 103 376, 102 366 C 101 350, 101 332, 101 316 C 101 300, 100 284, 99 268 C 98 252, 96 236, 95 226 C 93 216, 92 205, 93 195 C 94 180, 95 161, 94 146 C 93 134, 92 126, 88 128 C 84 130, 83 140, 84 154 C 85 172, 87 192, 89 208 C 88 215, 84 218, 81 215 C 76 211, 72 198, 70 184 C 68 164, 65 146, 63 130 C 61 114, 62 100, 68 92 C 77 81, 95 75, 109 73 C 112 70, 113 66, 113 62 C 105 59, 96 49, 96 36 C 96 22, 106 12, 120 12 Z',

  // Male Silhouette: Broad muscular shoulders, tapered torso
  male:
    'M 120 10 C 135 10, 146 20, 146 35 C 146 48, 137 58, 129 61 C 129 65, 131 69, 134 72 C 152 74, 172 80, 182 91 C 188 98, 187 114, 184 130 C 181 146, 177 165, 175 186 C 173 200, 168 213, 163 217 C 159 220, 155 216, 154 208 C 157 190, 160 170, 160 152 C 160 138, 159 128, 154 126 C 149 124, 147 132, 146 145 C 144 160, 145 178, 146 193 C 147 203, 146 214, 144 224 C 143 234, 141 251, 140 268 C 139 285, 138 302, 138 319 C 138 335, 138 353, 137 368 C 136 378, 134 386, 130 389 C 126 391, 122 388, 121 381 C 121 372, 122 360, 123 346 C 124 330, 125 312, 125 294 C 125 276, 124 258, 123 241 C 122 228, 121 219, 120 216 C 119 219, 118 228, 117 241 C 116 258, 115 276, 115 294 C 115 312, 116 330, 117 346 C 118 360, 119 372, 119 381 C 118 388, 114 391, 110 389 C 106 386, 104 378, 103 368 C 102 353, 102 335, 102 319 C 102 302, 101 285, 100 268 C 99 251, 97 234, 96 224 C 94 214, 93 203, 94 193 C 95 178, 96 160, 94 145 C 93 132, 91 124, 86 126 C 81 128, 80 138, 80 152 C 80 170, 83 190, 86 208 C 85 216, 81 220, 77 217 C 72 213, 67 200, 65 186 C 63 165, 59 146, 56 130 C 53 114, 52 98, 58 91 C 68 80, 88 74, 106 72 C 109 69, 111 65, 111 61 C 103 58, 94 48, 94 35 C 94 20, 105 10, 120 10 Z',

  // Female Silhouette: Hourglass curves, graceful waist
  female:
    'M 120 14 C 133 14, 142 23, 142 36 C 142 48, 134 57, 126 60 C 126 64, 127 68, 130 71 C 141 73, 156 79, 165 89 C 171 97, 171 110, 169 126 C 167 142, 164 160, 163 180 C 161 194, 157 207, 153 211 C 150 214, 146 211, 145 204 C 147 189, 150 169, 150 152 C 151 138, 149 129, 145 127 C 142 125, 140 133, 140 146 C 139 160, 141 176, 144 191 C 147 204, 148 218, 146 230 C 144 242, 142 258, 140 274 C 139 290, 138 305, 138 321 C 138 337, 137 353, 136 368 C 135 377, 133 384, 129 387 C 126 389, 122 387, 121 380 C 121 372, 122 361, 123 347 C 124 332, 125 315, 125 297 C 125 280, 124 262, 123 245 C 122 232, 121 223, 120 220 C 119 223, 118 232, 117 245 C 116 262, 115 280, 115 297 C 115 315, 116 332, 117 347 C 118 361, 119 372, 119 380 C 118 387, 114 389, 111 387 C 107 384, 105 377, 104 368 C 103 353, 102 337, 102 321 C 102 305, 101 290, 100 274 C 98 258, 96 242, 94 230 C 92 218, 93 204, 96 191 C 99 176, 101 160, 100 146 C 100 133, 98 125, 95 127 C 91 129, 89 138, 90 152 C 90 169, 93 189, 95 204 C 94 211, 90 214, 87 211 C 83 207, 79 194, 77 180 C 76 160, 73 142, 71 126 C 69 110, 69 97, 75 89 C 84 79, 99 73, 110 71 C 113 68, 114 64, 114 60 C 106 57, 98 48, 98 36 C 98 23, 107 14, 120 14 Z',

  // Cute / Chibi Avatar: Friendly rounded character silhouette
  cute:
    'M 120 12 C 142 12, 154 26, 154 46 C 154 62, 142 74, 134 78 C 146 82, 164 90, 168 104 C 172 116, 172 136, 170 156 C 168 174, 164 192, 160 196 C 156 200, 150 196, 148 188 C 150 172, 152 152, 152 136 C 152 122, 150 114, 144 112 C 138 110, 136 120, 136 136 C 136 156, 138 180, 140 202 C 142 222, 142 244, 140 264 C 138 284, 136 308, 135 330 C 134 350, 133 370, 130 382 C 127 388, 122 388, 120 380 C 119 368, 120 348, 121 324 C 122 298, 122 270, 121 242 C 120 228, 120 220, 120 216 C 120 220, 120 228, 119 242 C 118 270, 118 298, 119 324 C 120 348, 121 368, 120 380 C 118 388, 113 388, 110 382 C 107 370, 106 350, 105 330 C 104 308, 102 284, 100 264 C 98 244, 98 222, 100 202 C 102 180, 104 156, 104 136 C 104 120, 102 110, 96 112 C 90 114, 88 122, 88 136 C 88 152, 90 172, 92 188 C 90 196, 84 200, 80 196 C 76 192, 72 174, 70 156 C 68 136, 68 116, 72 104 C 76 90, 94 82, 106 78 C 98 74, 86 62, 86 46 C 86 26, 98 12, 120 12 Z',
};

// 6 Major Biological Organ Milestones
export interface OrganMilestone {
  id: string;
  name: string;
  shortName: string;
  emoji: string;
  x: number; // percentage in SVG coordinate space (0-100)
  y: number; // percentage in SVG coordinate space (0-100)
  thresholdPercent: number; // % hydration required to reach/activate this organ
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
    y: 9.5,
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
    x: 50,
    y: 35,
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
  onToggleViewMode?: () => void;
}

export const BodySilhouette: React.FC<BodySilhouetteProps> = ({
  onQuickAdd,
  onToggleViewMode,
}) => {
  const { selectedRecord, chugWarning, clearChugWarning, profile, weather, updateProfile } =
    useWater();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const grossTotal = selectedRecord.total;
  const netTotal = selectedRecord.netTotal || grossTotal;
  const percentage = Math.min(100, Math.max(0, Math.round((netTotal / selectedRecord.goal) * 100)));
  const remainingMl = Math.max(0, selectedRecord.goal - netTotal);

  const avatarType: AvatarSilhouetteType = profile.avatarType || 'neutral';
  const [selectedOrgan, setSelectedOrgan] = useState<OrganMilestone | null>(null);
  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);

  // Wave physics
  const waveAmplitudeRef = useRef<number>(4);
  const phaseRef = useRef<number>(0);
  const bubblesRef = useRef<Bubble[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  const handleBodyTap = () => {
    waveAmplitudeRef.current = 14;
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(20);
      } catch {
        // ignore
      }
    }
  };

  // Fluid canvas animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (bubblesRef.current.length === 0) {
      for (let i = 0; i < 18; i++) {
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
        // 1. Back Wave (Deep Ocean Blue)
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(0, height);
        for (let x = 0; x <= width; x += 4) {
          const wave1 =
            Math.sin(x * 0.018 + phaseRef.current + Math.PI) * (waveAmplitudeRef.current * 0.65);
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
          const wave2 = Math.sin(x * 0.022 + phaseRef.current) * waveAmplitudeRef.current;
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
          const wave2 = Math.sin(x * 0.022 + phaseRef.current) * waveAmplitudeRef.current;
          const y = baseWaterY + wave2;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
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

  const activeSilhouettePath = SILHOUETTE_PATHS[avatarType] || SILHOUETTE_PATHS.neutral;

  // Find currently active / hydrated organs
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
        className="relative w-full max-w-[320px] h-[410px] rounded-[44px] p-4 cursor-pointer apple-card overflow-hidden flex flex-col items-center justify-between shadow-2xl border border-white/[0.08]"
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

        {/* Top Floating Control Bar */}
        <div className="w-full z-20 flex items-center justify-between pt-1 px-1">
          {/* Avatar Switcher Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsAvatarPickerOpen(true);
            }}
            className="px-2.5 py-1 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] text-[10px] font-semibold text-neutral-300 flex items-center gap-1.5 transition cursor-pointer backdrop-blur-md"
            title="Choose body silhouette style"
          >
            <span className="capitalize">{avatarType}</span>
            <Sliders className="w-3 h-3 text-[#0a84ff]" />
          </button>

          {/* Biological Organ Status Badge */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedOrgan(ORGAN_MILESTONES[0]);
            }}
            className={`px-2.5 py-1 rounded-full border text-[10px] font-semibold flex items-center gap-1.5 transition cursor-pointer backdrop-blur-md ${
              hydratedOrgansCount === ORGAN_MILESTONES.length
                ? 'bg-[#30d158]/15 border-[#30d158]/30 text-[#30d158]'
                : 'bg-[#0a84ff]/10 border-[#0a84ff]/25 text-[#0a84ff]'
            }`}
            title="Tap to see biological organ hydration breakdown"
          >
            <Activity className="w-3 h-3" />
            <span>
              {hydratedOrgansCount}/{ORGAN_MILESTONES.length} Organs Hydrated
            </span>
          </button>
        </div>

        {/* Volume Scale Markers (pinned to right edge) */}
        <div className="absolute right-4 top-16 bottom-20 flex flex-col justify-between items-end text-[10px] font-mono text-neutral-500 z-20 pointer-events-none select-none">
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
            THE SVG HUMAN BODY SILHOUETTE CANVAS
        ======================================================== */}
        <div className="relative w-[210px] h-[330px] flex items-center justify-center my-auto">
          {/* SVG Definition with Unique Clip Path */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible"
            viewBox="0 0 240 400"
          >
            <defs>
              {/* Dynamic silhouette clip path */}
              <clipPath id="body-silhouette-clip">
                <path d={activeSilhouettePath} />
              </clipPath>

              {/* Glowing anatomical inner shadow */}
              <linearGradient id="body-empty-glow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2c2c2e" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#161618" stopOpacity="0.8" />
              </linearGradient>
            </defs>

            {/* Empty Body Silhouette Backdrop */}
            <path
              d={activeSilhouettePath}
              fill="url(#body-empty-glow)"
              stroke="rgba(255, 255, 255, 0.14)"
              strokeWidth="2"
              className="transition-colors duration-500"
            />
          </svg>

          {/* HTML Canvas Fluid Layer clipped inside the Body Silhouette */}
          <div
            className="absolute inset-0 w-full h-full overflow-hidden"
            style={{
              clipPath: 'url(#body-silhouette-clip)',
              WebkitClipPath: 'url(#body-silhouette-clip)',
            }}
          >
            <canvas ref={canvasRef} width={240} height={400} className="w-full h-full block" />
          </div>

          {/* Outer Silhouette Stroke Glow Layer */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible"
            viewBox="0 0 240 400"
          >
            <path
              d={activeSilhouettePath}
              fill="none"
              stroke={
                percentage >= 100
                  ? 'rgba(48, 209, 88, 0.7)'
                  : percentage > 0
                  ? 'rgba(10, 132, 255, 0.45)'
                  : 'rgba(255, 255, 255, 0.16)'
              }
              strokeWidth="2.5"
              className="transition-colors duration-500"
            />
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

      {/* ========================================================
          AVATAR SILHOUETTE SELECTOR MODAL
      ======================================================== */}
      <AnimatePresence>
        {isAvatarPickerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAvatarPickerOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md rounded-3xl apple-glass-modal p-5 sm:p-6 z-10 space-y-4 border border-white/[0.12] shadow-2xl"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-[#0a84ff]/15 border border-[#0a84ff]/25 text-[#0a84ff]">
                    <Sliders className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Body Avatar Customizer</h3>
                    <p className="text-xs text-neutral-400">
                      Choose your visual silhouette style
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAvatarPickerOpen(false)}
                  className="p-1.5 rounded-full text-neutral-400 hover:text-white bg-white/[0.08] transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Avatar Options Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                {(
                  [
                    { id: 'neutral', name: 'Athletic / Neutral', desc: 'Sleek anatomical outline', icon: '🧍' },
                    { id: 'male', name: 'Male Contour', desc: 'V-taper muscular silhouette', icon: '👨' },
                    { id: 'female', name: 'Female Contour', desc: 'Graceful hourglass curves', icon: '👩' },
                    { id: 'cute', name: 'Fun / Chibi', desc: 'Playful character avatar', icon: '🧸' },
                  ] as const
                ).map((item) => {
                  const isSelected = avatarType === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        updateProfile({ avatarType: item.id });
                        setIsAvatarPickerOpen(false);
                      }}
                      className={`p-3.5 rounded-2xl text-left border transition cursor-pointer flex flex-col justify-between space-y-2 ${
                        isSelected
                          ? 'bg-[#0a84ff]/15 border-[#0a84ff] text-white shadow-lg'
                          : 'bg-black/40 border-white/[0.06] text-neutral-300 hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-2xl">{item.icon}</span>
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-[#0a84ff] flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">{item.name}</div>
                        <div className="text-[10px] text-neutral-400">{item.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Display Mode Switcher (Body vs Classic Bottle) */}
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-white">Visual Mode</div>
                  <div className="text-[10px] text-neutral-400">
                    Switch between Human Body & Cylinder
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-black/50 p-1 rounded-xl border border-white/[0.06]">
                  <button
                    type="button"
                    onClick={() => {
                      updateProfile({ progressDisplayMode: 'body' });
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      (profile.progressDisplayMode || 'body') === 'body'
                        ? 'bg-[#0a84ff] text-white'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    🧍 Body
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      updateProfile({ progressDisplayMode: 'bottle' });
                      setIsAvatarPickerOpen(false);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      profile.progressDisplayMode === 'bottle'
                        ? 'bg-[#0a84ff] text-white'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    🍶 Cylinder
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
