import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, X, Sparkles, Check, Volume2, HelpCircle } from 'lucide-react';
import { useWater } from '../context/WaterContext';
import { voiceRecognizer, ParsedVoiceIntake } from '../utils/voiceRecognition';
import { BEVERAGE_DATABASE } from '../types/beverages';

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
    setTranscript('Listening... Speak now (e.g. "Drank 400 ml water" or "Log a cup of coffee")');
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
          className="relative w-full max-w-md rounded-3xl glass-surface-glow p-6 z-10 overflow-hidden border border-cyan-500/40 text-center space-y-4"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2 text-left">
              <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300">
                <Mic className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white font-heading">
                  Zero-Friction Voice Logging
                </h3>
                <p className="text-xs text-slate-400">Speak naturally to log any fluid</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Glowing Animated Mic Core */}
          <div className="py-4 flex flex-col items-center justify-center">
            <button
              type="button"
              onClick={isListening ? () => voiceRecognizer.stop() : startListening}
              className={`relative p-7 rounded-full transition-all duration-300 cursor-pointer shadow-2xl ${
                isListening
                  ? 'bg-gradient-to-tr from-cyan-500 to-sky-400 text-slate-950 scale-110 shadow-cyan-500/50'
                  : 'bg-slate-900 text-cyan-400 border border-cyan-500/40 hover:bg-slate-800'
              }`}
            >
              {isListening ? (
                <Mic className="w-10 h-10 animate-pulse stroke-[2.5]" />
              ) : (
                <Mic className="w-10 h-10 stroke-[2]" />
              )}

              {/* Pulsing soundwave rings */}
              {isListening && (
                <>
                  <div className="absolute -inset-3 rounded-full border-2 border-cyan-400/40 animate-ping pointer-events-none" />
                  <div className="absolute -inset-6 rounded-full border border-cyan-400/20 animate-pulse pointer-events-none" />
                </>
              )}
            </button>

            <span className="text-xs font-bold text-slate-300 mt-4 block">
              {isListening ? '🎙️ Listening to your voice...' : 'Tap microphone to speak'}
            </span>
          </div>

          {/* Transcript / Result Box */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
            <p className="text-xs text-cyan-200 italic min-h-[36px] flex items-center justify-center">
              {transcript || 'Say: "Drank 350ml water", "1 cup of tea", "500ml electrolyte"'}
            </p>

            {parsedResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-bold text-white"
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-lg">
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
                <span className="font-mono text-cyan-300 text-sm">+{parsedResult.amount} ml</span>
              </motion.div>
            )}

            {errorMessage && (
              <p className="text-xs text-rose-400 font-medium">{errorMessage}</p>
            )}
          </div>

          {/* Voice Prompt Examples */}
          <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span>Try: "Log 400ml", "I drank coffee", "1 shaker bottle"</span>
          </div>

          {/* Confirm Button */}
          {parsedResult && (
            <button
              onClick={handleConfirmLog}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-sky-400 hover:from-cyan-400 hover:to-sky-300 text-slate-950 font-black text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Confirm & Log {parsedResult.amount} ml {parsedResult.containerName}</span>
            </button>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
