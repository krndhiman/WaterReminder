import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldAlert, HeartPulse, Baby, Milk, ShieldCheck, Info } from 'lucide-react';
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.96, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0, y: 15 }}
          className="relative w-full max-w-lg rounded-3xl apple-glass-modal p-5 sm:p-6 z-10 overflow-hidden max-h-[90vh] flex flex-col space-y-4"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.08] shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#1c1c1e] border border-white/[0.08] flex items-center justify-center text-lg">
                <HeartPulse className="w-5 h-5 text-[#30d158]" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Clinical & Safety Profiles
                </h3>
                <p className="text-xs text-neutral-400">
                  Life stage pacing and hyponatremia guardrails
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-neutral-400 hover:text-white bg-white/[0.08] transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
            {/* Life Stage & Medical Category */}
            <div>
              <label className="text-[10px] uppercase font-semibold text-neutral-400 block mb-2">
                Select Physiological Profile
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  {
                    id: 'standard',
                    title: 'Standard Adult',
                    desc: 'Healthy active baseline (4,000 ml default)',
                    icon: HeartPulse,
                    badge: 'Standard',
                  },
                  {
                    id: 'pregnancy',
                    title: 'Pregnancy',
                    desc: '+300ml to support maternal blood expansion',
                    icon: Baby,
                    badge: '+300ml',
                  },
                  {
                    id: 'breastfeeding',
                    title: 'Lactation & Nursing',
                    desc: '+700ml to fuel milk synthesis',
                    icon: Milk,
                    badge: '+700ml',
                  },
                  {
                    id: 'fluid_restriction',
                    title: 'Medical Fluid Limit',
                    desc: 'Prescribed cap for renal or cardiac plans',
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
                          ? 'bg-[#30d158]/10 border-[#30d158] shadow-sm'
                          : 'apple-card text-neutral-300 hover:border-white/[0.2]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="p-2 rounded-xl bg-white/[0.06] text-white">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-[9px] font-bold font-mono px-2 py-0.5 rounded-full bg-black/40 text-white border border-white/[0.08]">
                          {item.badge}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-xs font-semibold text-white">{item.title}</h4>
                        <p className="text-[11px] text-neutral-400 mt-0.5 leading-relaxed">{item.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Kidney Stones / Citrate Clinical Guide */}
            <div className="p-4 rounded-2xl apple-card space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#0a84ff]">
                <ShieldCheck className="w-4 h-4" />
                <span>Kidney Stone (Nephrolithiasis) Protocol</span>
              </div>
              <p className="text-[11px] text-neutral-300 leading-relaxed">
                For stone prevention, urology guidelines recommend maintaining urine volume &gt;2.5L/day. Adding fresh lemon or lime delivers dietary citrate, which naturally binds calcium and inhibits crystal formation.
              </p>
            </div>

            {/* Fluid Restriction Custom Limit input */}
            {clinical.lifeStage === 'fluid_restriction' && (
              <div className="p-4 rounded-2xl apple-card space-y-2">
                <label className="text-xs font-semibold text-white block">
                  Daily Hard Fluid Limit (as prescribed by your doctor)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="500"
                    max="3000"
                    step="100"
                    value={clinical.maxDailyLimit || 1800}
                    onChange={(e) => updateClinical({ maxDailyLimit: Number(e.target.value) })}
                    className="w-28 bg-black/40 border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white font-mono font-bold focus:outline-none focus:border-[#0a84ff]"
                  />
                  <span className="text-xs text-neutral-400">ml maximum / day</span>
                </div>
              </div>
            )}

            {/* Hyponatremia Chug Guardrail Toggle */}
            <div className="p-4 rounded-2xl apple-card space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-white/[0.06] text-white">
                    <ShieldAlert className="w-4 h-4 text-[#ff9f0a]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white">Kidney Absorption Guardrail</h4>
                    <p className="text-[11px] text-neutral-400">
                      Warns if logging &gt;900ml within 20 mins to promote steady absorption
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => updateClinical({ enableChugGuardrail: !clinical.enableChugGuardrail })}
                  className={`w-12 h-6 rounded-full transition relative cursor-pointer ${
                    clinical.enableChugGuardrail ? 'bg-[#30d158]' : 'bg-neutral-800'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${
                      clinical.enableChugGuardrail ? 'left-7' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              <div className="p-3 rounded-xl bg-black/30 text-[11px] text-neutral-300">
                <p>
                  Healthy kidneys filter approximately <strong>800–1,000 ml per hour</strong>. Steady pacing avoids diluting blood electrolytes and maximizes cellular hydration.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-2 border-t border-white/[0.08] flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl apple-btn-primary text-xs font-semibold transition cursor-pointer shadow"
            >
              Save Profile
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
