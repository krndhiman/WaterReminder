import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Droplet, Check, Sparkles } from 'lucide-react';
import { useWater } from '../context/WaterContext';

interface Bubble {
  x: number;
  y: number;
  size: number;
  speed: number;
  alpha: number;
  sway: number;
}

export const LiquidBottle: React.FC<{ onQuickAdd?: () => void }> = ({ onQuickAdd }) => {
  const { selectedRecord, chugWarning, clearChugWarning, profile, weather, updateProfile } = useWater();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const grossTotal = selectedRecord.total;
  const netTotal = selectedRecord.netTotal || grossTotal;
  const percentage = Math.min(100, Math.max(0, Math.round((netTotal / selectedRecord.goal) * 100)));
  const remainingMl = Math.max(0, selectedRecord.goal - netTotal);

  // Wave physics
  const waveAmplitudeRef = useRef<number>(4);
  const phaseRef = useRef<number>(0);
  const bubblesRef = useRef<Bubble[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  const handleTap = () => {
    waveAmplitudeRef.current = 12;

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(15);
      } catch (e) {
        // ignore
      }
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (bubblesRef.current.length === 0) {
      for (let i = 0; i < 14; i++) {
        bubblesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2.5 + 1,
          speed: Math.random() * 1.0 + 0.4,
          alpha: Math.random() * 0.4 + 0.15,
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

      phaseRef.current += 0.03;
      waveAmplitudeRef.current += (4 - waveAmplitudeRef.current) * 0.05;

      const currentWaterHeight = (percentage / 100) * height;
      const baseWaterY = height - currentWaterHeight;

      if (percentage > 0) {
        // 1. Back Wave (Subdued Deep Blue)
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(0, height);
        for (let x = 0; x <= width; x += 4) {
          const wave1 = Math.sin(x * 0.016 + phaseRef.current + Math.PI) * (waveAmplitudeRef.current * 0.6);
          const y = baseWaterY + wave1;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(width, height);
        ctx.closePath();

        const backGrad = ctx.createLinearGradient(0, baseWaterY, 0, height);
        backGrad.addColorStop(0, '#005bb5');
        backGrad.addColorStop(1, '#003d7a');
        ctx.fillStyle = backGrad;
        ctx.fill();
        ctx.restore();

        // 2. Front Wave (Clean Apple Blue)
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(0, height);
        for (let x = 0; x <= width; x += 4) {
          const wave2 = Math.sin(x * 0.02 + phaseRef.current) * waveAmplitudeRef.current;
          const y = baseWaterY + wave2;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(width, height);
        ctx.closePath();

        const frontGrad = ctx.createLinearGradient(0, baseWaterY, 0, height);
        frontGrad.addColorStop(0, '#0a84ff');
        frontGrad.addColorStop(0.5, '#0071e3');
        frontGrad.addColorStop(1, '#005bb5');
        ctx.fillStyle = frontGrad;
        ctx.fill();

        // 3. Subtle Clean Meniscus Surface Line
        ctx.beginPath();
        for (let x = 0; x <= width; x += 4) {
          const wave2 = Math.sin(x * 0.02 + phaseRef.current) * waveAmplitudeRef.current;
          const y = baseWaterY + wave2;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();

        // 4. Subtle Micro Bubbles
        ctx.save();
        bubblesRef.current.forEach((b) => {
          b.y -= b.speed;
          b.sway += 0.03;
          const currentX = b.x + Math.sin(b.sway) * 2;

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

  return (
    <div className="relative flex flex-col items-center justify-center select-none w-full max-w-sm mx-auto">
      {/* Warning Notice */}
      {chugWarning && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full mb-3 p-3 rounded-2xl bg-[#2c1a08] border border-[#ff9f0a]/30 text-xs text-[#ff9f0a] flex items-center justify-between"
        >
          <span>{chugWarning}</span>
          <button onClick={clearChugWarning} className="font-semibold text-xs text-white/60 hover:text-white p-1">
            ✕
          </button>
        </motion.div>
      )}

      {/* Apple Minimalist Water Cylinder */}
      <motion.div
        whileTap={{ scale: 0.985 }}
        onClick={handleTap}
        className="relative w-64 h-80 sm:w-72 sm:h-88 rounded-[40px] p-3 cursor-pointer apple-card overflow-hidden flex flex-col items-center justify-between shadow-xl"
      >
        {/* Subtle Glass Ticks */}
        <div className="absolute right-3.5 top-8 bottom-8 flex flex-col justify-between items-end text-[10px] font-mono text-neutral-500 z-20 pointer-events-none select-none">
          <span>{selectedRecord.goal}ml</span>
          <span>{Math.round(selectedRecord.goal * 0.75)}ml</span>
          <span>{Math.round(selectedRecord.goal * 0.5)}ml</span>
          <span>{Math.round(selectedRecord.goal * 0.25)}ml</span>
          <span>0ml</span>
        </div>

        {/* Canvas Fluid Area */}
        <div className="absolute inset-2.5 rounded-[34px] overflow-hidden bg-[#0a0a0c]">
          <canvas ref={canvasRef} width={280} height={340} className="w-full h-full block" />
        </div>

        {/* Top 2-Mode Segmented Control: [ 🧍 Human Body ] [ 🍶 Cylinder ] */}
        <div className="w-full z-20 flex items-center justify-between gap-1.5 pt-1 px-1">
          <div className="flex items-center gap-1 bg-black/50 p-1 rounded-2xl border border-white/[0.08] backdrop-blur-md">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                updateProfile({ progressDisplayMode: 'body' });
              }}
              className="px-3 py-1 rounded-xl text-[11px] font-semibold text-neutral-400 hover:text-white transition cursor-pointer flex items-center gap-1.5"
            >
              <span>🧍 Human Body</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                updateProfile({ progressDisplayMode: 'bottle' });
              }}
              className="px-3 py-1 rounded-xl text-[11px] font-semibold bg-[#0a84ff] text-white shadow-sm transition cursor-pointer flex items-center gap-1.5"
            >
              <span>🍶 Cylinder</span>
            </button>
          </div>

          <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider pr-1">
            Progress
          </span>
        </div>

        {/* Central Clean Typography HUD */}
        <div className="z-20 flex flex-col items-center justify-center text-center bg-[#161618]/85 backdrop-blur-xl px-6 py-4 rounded-3xl border border-white/[0.08] shadow-lg pointer-events-none mb-2">
          <div className="flex items-baseline gap-1">
            <span className="text-4xl sm:text-5xl font-bold font-heading text-white tracking-tight">
              {netTotal.toLocaleString()}
            </span>
            <span className="text-sm font-semibold text-neutral-400">ml</span>
          </div>

          <div className="flex flex-col items-center gap-0.5 mt-0.5">
            {/* Base goal + weather breakdown */}
            {weather && weather.recommendedAdjustmentMl > 0 ? (
              <div className="flex items-center gap-1 text-[10px] text-neutral-500 flex-wrap justify-center">
                <span className="text-neutral-400 font-medium">{profile.dailyGoal.toLocaleString()} ml base</span>
                <span>+</span>
                <span className="text-[#ff9f0a] font-medium">{weather.recommendedAdjustmentMl} ml {weather.conditionIcon}</span>
                <span>=</span>
                <span className="text-[#0a84ff] font-semibold">{selectedRecord.goal.toLocaleString()} ml today</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-xs text-neutral-400">
                <span>Goal: {selectedRecord.goal.toLocaleString()} ml</span>
                <span>•</span>
                <span className="font-semibold text-[#0a84ff]">{percentage}%</span>
              </div>
            )}
          </div>

          {remainingMl > 0 ? (
            <span className="text-[11px] text-neutral-400 font-medium mt-1.5">
              {remainingMl.toLocaleString()} ml remaining
            </span>
          ) : (
            <span className="text-[11px] font-semibold text-[#30d158] flex items-center gap-1 mt-1.5 bg-[#30d158]/10 px-2.5 py-0.5 rounded-full border border-[#30d158]/20">
              <Check className="w-3 h-3" />
              Daily Goal Completed
            </span>
          )}
        </div>
      </motion.div>
    </div>
  );
};
