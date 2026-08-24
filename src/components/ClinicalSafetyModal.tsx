import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldAlert, HeartPulse, Baby, Milk, AlertTriangle, Check, Info, ShieldCheck } from 'lucide-react';
import { useWater } from '../context/WaterContext';

interface ClinicalSafetyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ClinicalSafetyModal: React.FC<ClinicalSafetyModalProps> = ({ isOpen, onClose }) => {
  const { profile, updateClinical } = useWater();
  const clinical = profile.clinical;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/85 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-lg rounded-3xl glass-surface-glow p-6 z-10 overflow-hidden border border-emerald-500/30 max-h-[92vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-300">
                <HeartPulse className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white font-heading">
                  Clinical & Physiological Profiles
                </h3>
                <p className="text-xs text-slate-400">
                  Medical safety profiles, kidney protection & hyponatremia guardrails
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
            {/* Life Stage & Medical Category */}
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                Select Physiological Profile
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  {
                    id: 'standard',
                    title: 'Standard Active Adult',
                    desc: 'Healthy active baseline (4,000 ml default)',
                    icon: HeartPulse,
                    badge: 'Standard',
                  },
                  {
                    id: 'pregnancy',
                    title: 'Pregnancy Support',
                    desc: '+300ml to support maternal blood volume expansion',
                    icon: Baby,
                    badge: '+300ml',
                  },
                  {
                    id: 'breastfeeding',
                    title: 'Lactation & Nursing',
                    desc: '+700ml to fuel milk synthesis and prevent maternal dehydration',
                    icon: Milk,
                    badge: '+700ml',
                  },
                  {
                    id: 'fluid_restriction',
                    title: 'Medical Fluid Limit',
                    desc: 'Hard cap for renal or cardiac health plans',
                    icon: ShieldAlert,
                    badge: 'Restricted',
                  },
                ].map((item) => {
                  const isSelected = clinical.lifeStage === item.id;
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => updateClinical({ lifeStage: item.id as any })}
                      className={`p-3.5 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-emerald-950/40 border-emerald-400 shadow-md ring-1 ring-emerald-400'
                          : 'glass-card-inner hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-300">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          {item.badge}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-white">{item.title}</h4>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{item.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Kidney Stones / Citrate Clinical Guide */}
            <div className="p-4 rounded-3xl bg-cyan-950/40 border border-cyan-500/30 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
                <ShieldCheck className="w-4 h-4" />
                <span>Kidney Stone (Nephrolithiasis) Protocol</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                For kidney stone prevention, clinical urology guidelines recommend maintaining urine volume &gt;2.5L/day. Adding citrus (lemon/lime water) delivers natural dietary citrate, which chemically binds calcium and prevents crystal nucleation.
              </p>
            </div>

            {/* Fluid Restriction Custom Limit input */}
            {clinical.lifeStage === 'fluid_restriction' && (
              <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 space-y-2">
                <label className="text-xs font-bold text-amber-300 block">
                  Daily Hard Fluid Limit (as prescribed by your physician)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="500"
                    max="3000"
                    step="100"
                    value={clinical.maxDailyLimit || 1800}
                    onChange={(e) => updateClinical({ maxDailyLimit: Number(e.target.value) })}
                    className="w-32 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono font-bold focus:outline-none focus:border-amber-400"
                  />
                  <span className="text-xs text-slate-300 font-bold">ml maximum / day</span>
                </div>
              </div>
            )}

            {/* Hyponatremia Chug Guardrail Toggle */}
            <div className="p-4 rounded-2xl glass-card-inner space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-300">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Hyponatremia & Kidney Safety Alert</h4>
                    <p className="text-[11px] text-slate-400">
                      Warns if logging &gt;900ml within 20 mins to promote steady absorption
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => updateClinical({ enableChugGuardrail: !clinical.enableChugGuardrail })}
                  className={`w-12 h-6 rounded-full transition relative cursor-pointer ${
                    clinical.enableChugGuardrail ? 'bg-emerald-500' : 'bg-slate-800'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${
                      clinical.enableChugGuardrail ? 'left-7' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300 space-y-1">
                <span className="text-emerald-300 font-bold block flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  Medical Fact:
                </span>
                <p>
                  Healthy kidneys can excrete approximately <strong>800–1,000 ml of water per hour</strong>. Chugging excessive water in minutes dilutes blood sodium and can cause cellular edema. Steady hourly pacing is much healthier and more energizing!
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-800">
            <button
              onClick={onClose}
              className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition cursor-pointer"
            >
              Save Clinical Profile
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
