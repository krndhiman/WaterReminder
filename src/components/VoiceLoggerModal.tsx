import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, X, Check, HelpCircle } from 'lucide-react';
import { useWater } from '../context/WaterContext';
import { voiceRecognizer, ParsedVoiceIntake } from '../utils/voiceRecognition';

interface VoiceLoggerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VoiceLoggerModal: React.FC<VoiceLoggerModalProps> = ({ isOpen, onClose }) => {
  const { addWater } = useWater();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState<string>('');
  const [parsedResult, setParsedResult] = useState<ParsedVoiceIntake | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && voiceRecognizer.isSupported) {
      startListening();
    }
    return () => {
      voiceRecognizer.stop();
    };
  }, [isOpen]);

  const startListening = () => {
    setErrorMessage(null);
    setParsedResult(null);
    setTranscript('Listening... Speak now (e.g. "Drank 300 ml water" or "1 cup of tea")');
    setIsListening(true);

    voiceRecognizer.listen(
      (result) => {
        setParsedResult(result);
        setTranscript(`"${result.rawTranscript}"`);
        setIsListening(false);
      },
      (err) => {
        setErrorMessage(err);
        setIsListening(false);
      },
      () => {
        setIsListening(false);
      }
    );
  };

  const handleConfirmLog = () => {
    if (!parsedResult) return;
    addWater(
      parsedResult.amount,
      parsedResult.beverageType,
      parsedResult.containerName,
      parsedResult.beverageType === 'electrolyte' ? 'zap' : 'droplet'
    );
    onClose();
  };

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
          className="relative w-full max-w-md rounded-3xl apple-glass-modal p-5 sm:p-6 z-10 overflow-hidden text-center space-y-4"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.08]">
            <div className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-2xl bg-[#1c1c1e] border border-white/[0.08] flex items-center justify-center text-lg">
                <Mic className="w-5 h-5 text-[#0a84ff]" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Voice Hydration Logger
                </h3>
                <p className="text-xs text-neutral-400">Speak naturally to log any fluid</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-neutral-400 hover:text-white bg-white/[0.08] transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Animated Mic */}
          <div className="py-4 flex flex-col items-center justify-center">
            <button
              type="button"
              onClick={isListening ? () => voiceRecognizer.stop() : startListening}
              className={`relative p-6 rounded-full transition-all duration-300 cursor-pointer shadow-lg ${
                isListening
                  ? 'bg-[#0a84ff] text-white scale-105 shadow-[0_0_24px_rgba(10,132,255,0.4)]'
                  : 'bg-[#1c1c1e] text-[#0a84ff] border border-white/[0.08] hover:border-white/[0.2]'
              }`}
            >
              <Mic className="w-8 h-8 stroke-[2]" />
            </button>

            <span className="text-xs font-semibold text-neutral-300 mt-3 block">
              {isListening ? '🎙️ Listening...' : 'Tap microphone to speak'}
            </span>
          </div>

          {/* Transcript / Result Box */}
          <div className="p-4 rounded-2xl apple-card space-y-2">
            <p className="text-xs text-neutral-300 italic min-h-[32px] flex items-center justify-center">
              {transcript || 'Say: "Drank 300ml water", "1 cup of tea", "500ml shaker"'}
            </p>

            {parsedResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="pt-2 border-t border-white/[0.08] flex items-center justify-between text-xs font-semibold text-white"
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-base">
                    {parsedResult.beverageType === 'coffee'
                      ? '☕'
                      : parsedResult.beverageType === 'tea'
                      ? '🍵'
                      : parsedResult.beverageType === 'electrolyte'
                      ? '⚡'
                      : '💧'}
                  </span>
                  <span>{parsedResult.containerName}</span>
                </div>
                <span className="font-mono text-[#0a84ff] text-sm font-bold">+{parsedResult.amount} ml</span>
              </motion.div>
            )}

            {errorMessage && (
              <p className="text-xs text-rose-400 font-medium">{errorMessage}</p>
            )}
          </div>

          {/* Voice Prompt Examples */}
          <div className="text-[11px] text-neutral-400 flex items-center justify-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-[#0a84ff]" />
            <span>Try: "Log 300ml water", "1 cup chai", "500ml bottle"</span>
          </div>

          {/* Confirm Button */}
          {parsedResult && (
            <button
              onClick={handleConfirmLog}
              className="w-full py-3 rounded-2xl apple-btn-primary text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-2 shadow"
            >
              <Check className="w-4 h-4" />
              <span>Log {parsedResult.amount} ml {parsedResult.containerName}</span>
            </button>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
