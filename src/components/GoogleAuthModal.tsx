import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Cloud,
  ShieldCheck,
  Check,
  Copy,
  KeyRound,
  Info,
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
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.96, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0, y: 15 }}
          className="relative w-full max-w-md rounded-3xl apple-glass-modal p-5 sm:p-6 z-10 overflow-hidden space-y-4 max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.08] shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#1c1c1e] border border-white/[0.08] flex items-center justify-center text-lg">
                <Cloud className="w-5 h-5 text-[#0a84ff]" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Account Sync & Backup
                </h3>
                <p className="text-xs text-neutral-400">
                  Zero data loss on phone switch or reset
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

          <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
            {/* 1. Account Profile Card */}
            <form onSubmit={handleSaveProfile} className="p-4 rounded-2xl apple-card space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-semibold text-neutral-400 tracking-wider">
                  Squad Profile
                </span>
                {identity.isGoogleLinked ? (
                  <span className="text-[10px] font-semibold text-[#30d158] bg-[#30d158]/15 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    Cloud Synced
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold text-[#ff9f0a] bg-[#ff9f0a]/10 px-2 py-0.5 rounded-full">
                    Key Protected
                  </span>
                )}
              </div>

              {/* Avatar Selector */}
              <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar">
                {['💧', '⚡', '🦁', '🌸', '🚀', '🔥', '🏆', '🌿', '⭐'].map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setEditAvatar(emoji)}
                    className={`p-2 text-xl rounded-xl border transition cursor-pointer shrink-0 ${
                      editAvatar === emoji
                        ? 'bg-[#0a84ff] text-white border-[#0a84ff]'
                        : 'bg-black/30 border-white/[0.06]'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              {/* Name & Email inputs */}
              <div className="space-y-2">
                <div>
                  <label className="text-[10px] uppercase font-semibold text-neutral-400 block mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-black/40 border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#0a84ff]"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-semibold text-neutral-400 block mb-1">
                    Google / Backup Email (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. name@gmail.com"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full bg-black/40 border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#0a84ff]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl apple-btn-primary text-xs font-semibold transition cursor-pointer shadow"
              >
                {isSavedMsg ? '✓ Profile Saved!' : 'Save Profile'}
              </button>
            </form>

            {/* 2. Personal Secret Sync Key */}
            <div className="p-4 rounded-2xl apple-card space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                  <KeyRound className="w-3.5 h-3.5 text-[#0a84ff]" />
                  <span>Secret Sync Key</span>
                </div>
                <span className="text-[10px] text-neutral-400 font-mono">1-Tap Restore</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/[0.06]">
                <span className="font-mono text-xs font-bold text-white tracking-wider">
                  {identity.recoveryKey}
                </span>
                <button
                  onClick={handleCopyKey}
                  className="p-1 rounded text-neutral-400 hover:text-white transition cursor-pointer"
                  title="Copy Key"
                >
                  {copiedKey ? <Check className="w-3.5 h-3.5 text-[#30d158]" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <p className="text-[10px] text-neutral-400 leading-relaxed">
                Save this key. Entering this key on any phone restores your streaks, history, and squads.
              </p>
            </div>

            {/* 3. Restore on New Device */}
            <form onSubmit={handleRestore} className="p-4 rounded-2xl apple-card space-y-2">
              <label className="text-xs font-semibold text-white block">
                Restore Existing Account:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="e.g. AQUA-7821-X9"
                  value={restoreKeyInput}
                  onChange={(e) => setRestoreKeyInput(e.target.value)}
                  className="flex-1 bg-black/40 border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white font-mono font-bold focus:outline-none focus:border-[#0a84ff] uppercase"
                />
                <button
                  type="submit"
                  className="py-2 px-3.5 rounded-xl apple-btn-secondary text-xs font-semibold transition cursor-pointer shrink-0"
                >
                  Restore
                </button>
              </div>

              {restoreStatus && (
                <p className="text-[11px] text-[#0a84ff] font-medium text-center mt-1">
                  {restoreStatus}
                </p>
              )}
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
