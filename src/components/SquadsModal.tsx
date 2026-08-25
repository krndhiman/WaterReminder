import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Users,
  Plus,
  Share2,
  Copy,
  Check,
  Flame,
  Droplet,
  ArrowRight,
} from 'lucide-react';
import { useWater } from '../context/WaterContext';
import {
  saveSocialState,
  createNewSquad,
  joinSquadByCode,
  sendSplashNudge,
  syncIntakeToAllSquads,
  generateSampleSquads,
  getOrCreateUserIdentity,
} from '../utils/squadService';
import { SquadMember, SocialState } from '../types/squad';

interface SquadsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SquadsModal: React.FC<SquadsModalProps> = ({ isOpen, onClose }) => {
  const { selectedRecord, streakInfo } = useWater();
  const [socialState, setSocialState] = useState<SocialState | null>(null);
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'create' | 'join'>('leaderboard');

  // Create form state
  const [newSquadName, setNewSquadName] = useState('');
  const [newSquadEmoji, setNewSquadEmoji] = useState('🏋️‍♂️');
  const [challengeType, setChallengeType] = useState<'daily_goal_race' | 'collective_tank'>('daily_goal_race');
  const [collectiveGoalLiters, setCollectiveGoalLiters] = useState(25);

  // Join form state
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [joinStatusMsg, setJoinStatusMsg] = useState<string | null>(null);

  // Feedback states
  const [copiedLink, setCopiedLink] = useState(false);
  const [nudgeSuccessMember, setNudgeSuccessMember] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const state = syncIntakeToAllSquads(
        selectedRecord.total,
        selectedRecord.goal,
        streakInfo.currentStreak
      );
      setSocialState(state);
      if (state.squads.length === 0) {
        setActiveTab('create');
      }
    }
  }, [isOpen, selectedRecord.total, selectedRecord.goal, streakInfo.currentStreak]);

  if (!isOpen || !socialState) return null;

  const currentSquad =
    socialState.squads.find((s) => s.id === socialState.activeSquadId) ||
    socialState.squads[0];

  const totalSquadIntakeMl = currentSquad
    ? currentSquad.members.reduce((acc, m) => acc + m.currentIntake, 0)
    : 0;
  const totalSquadGoalMl = currentSquad
    ? currentSquad.challengeType === 'collective_tank'
      ? currentSquad.targetCollectiveLiters * 1000
      : currentSquad.members.reduce((acc, m) => acc + m.dailyGoal, 0)
    : 1;

  const squadTankPercentage = Math.min(100, Math.round((totalSquadIntakeMl / totalSquadGoalMl) * 100));

  const sortedMembers = currentSquad
    ? [...currentSquad.members].sort(
        (a, b) => b.currentIntake / b.dailyGoal - a.currentIntake / a.dailyGoal
      )
    : [];

  const handleCreateSquad = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSquadName.trim()) return;

    const { state: updatedState, newSquad } = createNewSquad(
      newSquadName.trim(),
      newSquadEmoji,
      challengeType,
      collectiveGoalLiters
    );

    setSocialState(updatedState);
    setNewSquadName('');
    setActiveTab('leaderboard');
  };

  const handleJoinSquad = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCodeInput.trim()) return;

    setJoinStatusMsg(null);
    const result = joinSquadByCode(joinCodeInput.trim(), selectedRecord.goal, selectedRecord.total);
    setJoinStatusMsg(result.message);

    if (result.success && result.state) {
      setSocialState(result.state);
      setJoinCodeInput('');
      setTimeout(() => {
        setActiveTab('leaderboard');
        setJoinStatusMsg(null);
      }, 900);
    }
  };

  const handleSendNudge = (member: SquadMember) => {
    if (!currentSquad) return;
    const updated = sendSplashNudge(currentSquad.id, member);
    setSocialState({ ...updated });
    setNudgeSuccessMember(member.name);
    setTimeout(() => setNudgeSuccessMember(null), 2500);
  };

  const inviteUrl = `https://aquaflow.app/#join=${currentSquad?.id}`;

  const handleCopyInvite = () => {
    navigator.clipboard.writeText(
      `💧 Join our "${currentSquad?.name}" Hydration Squad on AquaFlow! Squad Code: ${currentSquad?.id} \nLink: ${inviteUrl}`
    );
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `💧 Join our "${currentSquad?.name}" Daily Hydration Squad on AquaFlow! Squad Code: ${currentSquad?.id}\nLink: ${inviteUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
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
          className="relative w-full max-w-2xl max-h-[90vh] rounded-3xl apple-glass-modal p-5 sm:p-6 z-10 overflow-hidden flex flex-col space-y-3.5"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#1c1c1e] border border-white/[0.08] flex items-center justify-center text-lg">
                <Users className="w-5 h-5 text-[#0a84ff]" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Squads & Challenges
                </h3>
                <p className="text-xs text-neutral-400">
                  Track group streaks and stay hydrated together
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

          {/* Multi-Squad Tab Switcher Pills */}
          <div className="py-1 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            {socialState.squads.map((squad) => {
              const isSelected = squad.id === currentSquad?.id && activeTab === 'leaderboard';
              return (
                <button
                  key={squad.id}
                  onClick={() => {
                    setSocialState({ ...socialState, activeSquadId: squad.id });
                    setActiveTab('leaderboard');
                  }}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer border ${
                    isSelected
                      ? 'bg-[#0a84ff] text-white border-[#0a84ff] shadow-sm'
                      : 'apple-card text-neutral-400 hover:text-white'
                  }`}
                >
                  <span>{squad.emoji}</span>
                  <span className="truncate max-w-[120px]">{squad.name}</span>
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono ${
                      isSelected ? 'bg-black/20 text-white' : 'bg-neutral-800 text-neutral-400'
                    }`}
                  >
                    {squad.members.length}
                  </span>
                </button>
              );
            })}

            {/* Create Squad Button */}
            <button
              onClick={() => setActiveTab('create')}
              className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer border ${
                activeTab === 'create'
                  ? 'bg-[#0a84ff] text-white border-[#0a84ff]'
                  : 'apple-card text-[#0a84ff] hover:text-white'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Squad</span>
            </button>

            {/* Join by Code Button */}
            <button
              onClick={() => setActiveTab('join')}
              className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer border ${
                activeTab === 'join'
                  ? 'bg-[#0a84ff] text-white border-[#0a84ff]'
                  : 'apple-card text-[#ff9f0a] hover:text-white'
              }`}
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>Join Code</span>
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
            {/* VIEW 1: SQUAD LEADERBOARD */}
            {activeTab === 'leaderboard' && currentSquad && (
              <div className="space-y-3.5">
                {/* Communal Reservoir Card */}
                <div className="p-4 rounded-2xl apple-card space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{currentSquad.emoji}</span>
                      <div>
                        <h4 className="text-sm font-bold text-white">
                          {currentSquad.name}
                        </h4>
                        <span className="text-xs font-mono text-[#0a84ff]">
                          Code: <strong>{currentSquad.id}</strong> · {currentSquad.members.length} Members
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-mono font-bold text-white block">
                        {(totalSquadIntakeMl / 1000).toFixed(1)} / {(totalSquadGoalMl / 1000).toFixed(1)} L
                      </span>
                      <span className="text-[10px] text-neutral-400 font-semibold">
                        {squadTankPercentage}% Team Filled
                      </span>
                    </div>
                  </div>

                  {/* Team Tank Progress Bar */}
                  <div className="w-full bg-black/40 h-2.5 rounded-full overflow-hidden p-0.5 border border-white/[0.04]">
                    <div
                      className="bg-[#0a84ff] h-full rounded-full transition-all duration-500"
                      style={{ width: `${squadTankPercentage}%` }}
                    />
                  </div>

                  {/* Invite Share Action Row */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={handleShareWhatsApp}
                      className="flex-1 py-2 px-3 rounded-xl bg-[#30d158]/15 hover:bg-[#30d158]/25 border border-[#30d158]/30 text-[#30d158] font-semibold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>WhatsApp Invite</span>
                    </button>

                    <button
                      onClick={handleCopyInvite}
                      className="flex-1 py-2 px-3 rounded-xl apple-card hover:border-white/[0.2] text-neutral-300 font-semibold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5 text-[#30d158]" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLink ? 'Link Copied!' : 'Copy Code & Link'}</span>
                    </button>
                  </div>
                </div>

                {/* Nudge Confirmation Banner */}
                {nudgeSuccessMember && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-xl bg-[#0a84ff]/15 border border-[#0a84ff]/30 text-xs text-white flex items-center gap-2"
                  >
                    <Droplet className="w-4 h-4 fill-current text-[#0a84ff]" />
                    <span>Splash Nudge sent to <strong>{nudgeSuccessMember}</strong>! 💦</span>
                  </motion.div>
                )}

                {/* Member Rankings */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                      Live Member Standings ({sortedMembers.length})
                    </span>
                    <span className="text-[10px] text-neutral-500 font-mono">
                      Updates in real-time
                    </span>
                  </div>

                  <div className="space-y-2">
                    {sortedMembers.map((member, index) => {
                      const memberPercent = Math.min(
                        100,
                        Math.round((member.currentIntake / member.dailyGoal) * 100)
                      );
                      const isCurrentUser = member.userId === socialState.user.userId;

                      return (
                        <div
                          key={member.userId}
                          className={`p-3 rounded-2xl apple-card transition flex items-center justify-between gap-3 ${
                            isCurrentUser
                              ? 'border-[#0a84ff]/40 bg-[#0a84ff]/5'
                              : ''
                          }`}
                        >
                          {/* Rank + Avatar + Name */}
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <span className="w-5 text-center text-xs font-mono font-bold text-neutral-400">
                              {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                            </span>

                            <span className="text-xl shrink-0">{member.avatar}</span>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs sm:text-sm font-semibold text-white truncate">
                                  {member.name}
                                </span>
                                {member.role === 'leader' && (
                                  <span className="text-[8px] bg-neutral-800 text-neutral-400 px-1.5 py-0.2 rounded-full font-semibold">
                                    Leader
                                  </span>
                                )}
                              </div>

                              {/* Progress bar */}
                              <div className="flex items-center gap-2 mt-1">
                                <div className="flex-1 bg-black/40 h-1.5 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${
                                      memberPercent >= 100 ? 'bg-[#30d158]' : 'bg-[#0a84ff]'
                                    }`}
                                    style={{ width: `${memberPercent}%` }}
                                  />
                                </div>
                                <span className="text-[10px] font-mono font-semibold text-neutral-300 shrink-0">
                                  {member.currentIntake}ml ({memberPercent}%)
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Streak & Nudge Action */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            <div className="flex items-center gap-1 text-[11px] font-semibold text-[#ff9f0a] bg-[#ff9f0a]/10 px-2 py-1 rounded-xl">
                              <Flame className="w-3 h-3 fill-current text-[#ff9f0a]" />
                              <span>{member.streak}d</span>
                            </div>

                            {!isCurrentUser && (
                              <button
                                onClick={() => handleSendNudge(member)}
                                className="p-1.5 rounded-xl apple-card text-[#0a84ff] hover:text-white transition cursor-pointer"
                                title={`Send Splash Nudge to ${member.name}`}
                              >
                                <Droplet className="w-3.5 h-3.5 fill-current" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 2: CREATE NEW SQUAD */}
            {activeTab === 'create' && (
              <form onSubmit={handleCreateSquad} className="space-y-3.5">
                <div className="p-4 rounded-2xl apple-card space-y-3">
                  <div>
                    <label className="text-[10px] uppercase font-semibold text-neutral-400 block mb-1">
                      Squad Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Morning Runners"
                      value={newSquadName}
                      onChange={(e) => setNewSquadName(e.target.value)}
                      className="w-full bg-black/40 border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#0a84ff]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-semibold text-neutral-400 block mb-1">
                      Squad Emoji Icon
                    </label>
                    <div className="flex items-center gap-2 overflow-x-auto py-1">
                      {['🏋️‍♂️', '💼', '🌸', '⚡', '🦁', '🚀', '🔥', '💧', '🏆'].map((em) => (
                        <button
                          key={em}
                          type="button"
                          onClick={() => setNewSquadEmoji(em)}
                          className={`p-2.5 text-xl rounded-xl border transition cursor-pointer ${
                            newSquadEmoji === em
                              ? 'bg-[#0a84ff] text-white border-[#0a84ff]'
                              : 'apple-card text-neutral-300'
                          }`}
                        >
                          {em}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-semibold text-neutral-400 block mb-1">
                      Challenge Format
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setChallengeType('daily_goal_race')}
                        className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                          challengeType === 'daily_goal_race'
                            ? 'bg-[#0a84ff]/15 border-[#0a84ff] text-white'
                            : 'apple-card text-neutral-400'
                        }`}
                      >
                        <span className="text-xs font-semibold block text-white">Daily 100% Race</span>
                        <span className="text-[10px] text-neutral-400">Aim for individual daily goal</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setChallengeType('collective_tank')}
                        className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                          challengeType === 'collective_tank'
                            ? 'bg-[#0a84ff]/15 border-[#0a84ff] text-white'
                            : 'apple-card text-neutral-400'
                        }`}
                      >
                        <span className="text-xs font-semibold block text-white">Communal Tank</span>
                        <span className="text-[10px] text-neutral-400">Combined group volume target</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('leaderboard')}
                    className="px-4 py-2.5 rounded-xl apple-btn-secondary text-xs font-semibold transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl apple-btn-primary text-xs font-semibold transition cursor-pointer shadow"
                  >
                    Create Squad
                  </button>
                </div>
              </form>
            )}

            {/* VIEW 3: JOIN EXISTING SQUAD WITH CODE */}
            {activeTab === 'join' && (
              <form onSubmit={handleJoinSquad} className="space-y-3.5">
                <div className="p-5 rounded-2xl apple-card space-y-2 text-center">
                  <h4 className="text-xs sm:text-sm font-semibold text-white">Enter Squad Code</h4>
                  <p className="text-[11px] text-neutral-400">
                    Paste the squad code shared by your friend or teammate
                  </p>

                  <input
                    type="text"
                    required
                    placeholder="e.g. SQUAD-GYM-4000"
                    value={joinCodeInput}
                    onChange={(e) => setJoinCodeInput(e.target.value)}
                    className="w-full bg-black/40 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white font-mono font-bold placeholder:text-neutral-600 focus:outline-none focus:border-[#0a84ff] uppercase tracking-wider text-center"
                  />
                </div>

                {joinStatusMsg && (
                  <div className="p-3 rounded-xl bg-white/[0.06] text-xs text-neutral-300 text-center font-medium">
                    {joinStatusMsg}
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('leaderboard')}
                    className="px-4 py-2.5 rounded-xl apple-btn-secondary text-xs font-semibold transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl apple-btn-primary text-xs font-semibold transition cursor-pointer shadow"
                  >
                    Join Squad
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
