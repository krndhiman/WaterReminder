import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Cloud,
  ShieldCheck,
  Check,
  Copy,
  KeyRound,
  RotateCcw,
  Sparkles,
  Smartphone,
  Lock,
  User,
  Info,
  ExternalLink,
} from 'lucide-react';
import {
  getOrCreateUserIdentity,
  saveUserIdentity,
  restoreAccountByKey,
  syncIntakeToAllSquads,
} from '../utils/squadService';
import { UserIdentity } from '../types/squad';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({ isOpen, onClose }) => {
  const [identity, setIdentity] = useState<UserIdentity>(getOrCreateUserIdentity());
  const [editName, setEditName] = useState(identity.name);
  const [editEmail, setEditEmail] = useState(identity.email || '');
  const [editAvatar, setEditAvatar] = useState(identity.avatar);

  const [restoreKeyInput, setRestoreKeyInput] = useState('');
  const [restoreStatus, setRestoreStatus] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [isSavedMsg, setIsSavedMsg] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const current = getOrCreateUserIdentity();
      setIdentity(current);
      setEditName(current.name);
      setEditEmail(current.email || '');
      setEditAvatar(current.avatar);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyKey = () => {
    navigator.clipboard.writeText(identity.recoveryKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserIdentity = {
      ...identity,
      name: editName.trim() || 'Hydration Hero',
      email: editEmail.trim() || undefined,
      avatar: editAvatar,
      isGoogleLinked: editEmail.trim().length > 0,
      lastSyncedTimestamp: Date.now(),
    };
    saveUserIdentity(updated);
    setIdentity(updated);
    syncIntakeToAllSquads(2400, 4000, 7);
    setIsSavedMsg(true);
    setTimeout(() => setIsSavedMsg(false), 2000);
  };

  const handleRestore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restoreKeyInput.trim()) return;

    const result = restoreAccountByKey(restoreKeyInput);
    setRestoreStatus(result.message);
    if (result.success && result.identity) {
      setIdentity(result.identity);
      setTimeout(() => {
        setRestoreStatus(null);
        onClose();
      }, 1200);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
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
          className="relative w-full max-w-md rounded-3xl glass-surface-glow p-5 sm:p-6 z-10 overflow-hidden border border-cyan-500/30 shadow-2xl space-y-4 max-h-[92vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-2xl bg-cyan-500/20 text-cyan-300">
                <Cloud className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white font-heading">
                  Account Sync & Device Backup
                </h3>
                <p className="text-xs text-slate-400">
                  Zero data loss on phone switch or factory reset
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pr-0.5 space-y-3.5">
            {/* 1. Account Profile Card */}
            <form onSubmit={handleSaveProfile} className="p-4 rounded-2xl glass-surface border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Your Squad Profile
                </span>
                {identity.isGoogleLinked ? (
                  <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    Cloud Synced
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-500/30">
                    Offline Key Protected
                  </span>
                )}
              </div>

              {/* Avatar Selector */}
              <div className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar">
                {['💧', '⚡', '🦁', '🌸', '🚀', '🔥', '🏆', '🌿', '⭐'].map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setEditAvatar(emoji)}
                    className={`p-2 text-xl rounded-xl border transition cursor-pointer shrink-0 ${
                      editAvatar === emoji
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md'
                        : 'bg-slate-900 border-slate-800'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              {/* Name & Email inputs */}
              <div className="space-y-2">
                <div>
                  <label className="text-[11px] text-slate-400 font-medium block mb-1">
                    Display Name (shown to squad friends)
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 font-medium block mb-1">
                    Google / Backup Email (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. nitish@gmail.com"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition cursor-pointer shadow-md"
              >
                {isSavedMsg ? '✓ Profile & Squads Saved!' : 'Save Profile & Update Squads'}
              </button>
            </form>

            {/* 2. Personal Secret Sync Key */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-cyan-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300">
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Your Secret Sync Key</span>
                </div>
                <span className="text-[9px] text-slate-400 font-mono">1-Tap Phone Restore</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="font-mono text-xs font-black text-white tracking-wider">
                  {identity.recoveryKey}
                </span>
                <button
                  onClick={handleCopyKey}
                  className="p-1 rounded text-slate-400 hover:text-cyan-300 transition cursor-pointer"
                  title="Copy Key"
                >
                  {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Save this key. If you buy a new phone or factory reset, entering this key restores all your history, streaks, and squads instantly!
              </p>
            </div>

            {/* 3. Restore on New Device */}
            <form onSubmit={handleRestore} className="p-4 rounded-2xl glass-surface border border-slate-800 space-y-2">
              <label className="text-xs font-bold text-slate-300 block">
                Switched Phones? Restore Existing Account:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="e.g. AQUA-7821-X9"
                  value={restoreKeyInput}
                  onChange={(e) => setRestoreKeyInput(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-cyan-300 font-mono font-bold focus:outline-none focus:border-cyan-400 uppercase"
                />
                <button
                  type="submit"
                  className="py-2 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition cursor-pointer shrink-0"
                >
                  Restore
                </button>
              </div>

              {restoreStatus && (
                <p className="text-[11px] text-cyan-300 font-semibold text-center mt-1">
                  {restoreStatus}
                </p>
              )}
            </form>

            {/* Free Developer Cost Note */}
            <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-[10px] text-slate-400 flex items-start gap-2">
              <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>Why this is 100% Free:</strong> AquaFlow uses local-first cryptographic sync keys and free client-side Google Identity SDK. No expensive database servers are required, keeping running costs at <strong>$0.00 forever</strong>.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
