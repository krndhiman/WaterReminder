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
  Zap,
  Droplet,
  Award,
  Sparkles,
  MessageCircle,
  Send,
  Trophy,
  ArrowRight,
  ShieldCheck,
  UserPlus,
} from 'lucide-react';
import { useWater } from '../context/WaterContext';
import {
  loadSocialState,
  saveSocialState,
  createNewSquad,
  joinSquadByCode,
  sendSplashNudge,
  syncIntakeToAllSquads,
  generateSampleSquads,
  getOrCreateUserIdentity,
} from '../utils/squadService';
import { Squad, SquadMember, SocialState } from '../types/squad';

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

  // Calculate squad collective stats
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

    const { state } = createNewSquad(
      newSquadName,
      newSquadEmoji,
      challengeType,
      collectiveGoalLiters
    );
    setSocialState({ ...state });
    setActiveTab('leaderboard');
    setNewSquadName('');
  };

  const handleJoinSquad = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCodeInput.trim()) return;

    const result = joinSquadByCode(
      joinCodeInput,
      selectedRecord.goal,
      selectedRecord.total,
      streakInfo.currentStreak
    );

    setJoinStatusMsg(result.message);
    if (result.success) {
      setSocialState({ ...result.state });
      setTimeout(() => {
        setActiveTab('leaderboard');
        setJoinCodeInput('');
        setJoinStatusMsg(null);
      }, 900);
    }
  };

  const handleLoadSampleSquads = () => {
    const user = getOrCreateUserIdentity();
    const samples = generateSampleSquads(user, selectedRecord.goal, selectedRecord.total);
    const updated: SocialState = {
      ...socialState,
      squads: samples,
      activeSquadId: samples[0].id,
    };
    saveSocialState(updated);
    setSocialState(updated);
    setActiveTab('leaderboard');
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
      `💧 Join our "${currentSquad?.name}" 4L Daily Hydration Squad on AquaFlow! Squad Code: ${currentSquad?.id}\nLink: ${inviteUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/90 backdrop-blur-lg"
        />

        {/* Full Screen Modal Window */}
        <motion.div
          initial={{ scale: 0.94, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 20 }}
          className="relative w-full max-w-2xl h-[92vh] sm:h-[88vh] rounded-3xl glass-surface-glow p-5 sm:p-7 z-10 overflow-hidden border border-cyan-500/40 shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-300">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-white font-heading">
                  AquaSquads & Friend Challenges
                </h3>
                <p className="text-xs text-slate-400">
                  Compete with friends, track group streaks & stay hydrated together
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-2xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Multi-Squad Tab Switcher Pills */}
          <div className="py-3 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            {socialState.squads.map((squad) => {
              const isSelected = squad.id === currentSquad?.id && activeTab === 'leaderboard';
              return (
                <button
                  key={squad.id}
                  onClick={() => {
                    setSocialState({ ...socialState, activeSquadId: squad.id });
                    setActiveTab('leaderboard');
                  }}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-bold transition cursor-pointer border ${
                    isSelected
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md'
                      : 'glass-surface border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span>{squad.emoji}</span>
                  <span className="truncate max-w-[120px]">{squad.name}</span>
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                      isSelected ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-400'
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
              className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-2xl text-xs font-bold transition cursor-pointer border ${
                activeTab === 'create'
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md'
                  : 'glass-surface border-slate-800 text-cyan-300 hover:border-cyan-400/40'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Squad</span>
            </button>

            {/* Join by Code Button */}
            <button
              onClick={() => setActiveTab('join')}
              className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-2xl text-xs font-bold transition cursor-pointer border ${
                activeTab === 'join'
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md'
                  : 'glass-surface border-slate-800 text-amber-300 hover:border-amber-400/40'
              }`}
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>Join Code</span>
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto pr-1 py-1 space-y-4">
            {/* VIEW 1: SQUAD LEADERBOARD */}
            {activeTab === 'leaderboard' && currentSquad && (
              <div className="space-y-4">
                {/* Communal Water Reservoir Card */}
                <div className="p-4 rounded-3xl glass-surface border border-cyan-500/25 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{currentSquad.emoji}</span>
                      <div>
                        <h4 className="text-sm sm:text-base font-black text-white font-heading">
                          {currentSquad.name}
                        </h4>
                        <span className="text-xs font-mono text-cyan-300">
                          Squad Code: <strong>{currentSquad.id}</strong> · {currentSquad.members.length} Members
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-mono font-black text-cyan-300 block">
                        {(totalSquadIntakeMl / 1000).toFixed(1)} / {(totalSquadGoalMl / 1000).toFixed(1)} L
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold">
                        {squadTankPercentage}% Team Filled
                      </span>
                    </div>
                  </div>

                  {/* Team Tank Progress Bar */}
                  <div className="w-full bg-slate-950/80 h-3.5 rounded-full overflow-hidden p-0.5 border border-cyan-500/30">
                    <div
                      className="bg-gradient-to-r from-cyan-500 via-sky-400 to-emerald-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${squadTankPercentage}%` }}
                    />
                  </div>

                  {/* Invite Share Action Row */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={handleShareWhatsApp}
                      className="flex-1 py-2.5 px-3 rounded-2xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>WhatsApp Invite</span>
                    </button>

                    <button
                      onClick={handleCopyInvite}
                      className="flex-1 py-2.5 px-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLink ? 'Link Copied!' : 'Copy Code & Link'}</span>
                    </button>
                  </div>
                </div>

                {/* Nudge Confirmation Banner */}
                {nudgeSuccessMember && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-2xl bg-cyan-950/90 border border-cyan-500/50 text-xs text-cyan-300 flex items-center gap-2 shadow-lg"
                  >
                    <Droplet className="w-4 h-4 fill-cyan-400 text-cyan-400 animate-bounce" />
                    <span>Splash Nudge sent to <strong>{nudgeSuccessMember}</strong>! 💦</span>
                  </motion.div>
                )}

                {/* Member Rankings (Unlimited Members Scrollable) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Live Member Standings ({sortedMembers.length})
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Updates instantly on every sip
                    </span>
                  </div>

                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {sortedMembers.map((member, index) => {
                      const memberPercent = Math.min(
                        100,
                        Math.round((member.currentIntake / member.dailyGoal) * 100)
                      );
                      const isCurrentUser = member.userId === socialState.user.userId;

                      return (
                        <div
                          key={member.userId}
                          className={`p-3.5 rounded-2xl border transition flex items-center justify-between gap-3 ${
                            isCurrentUser
                              ? 'bg-cyan-950/40 border-cyan-400 shadow-md ring-1 ring-cyan-400/40'
                              : 'glass-surface border-slate-800'
                          }`}
                        >
                          {/* Rank + Avatar + Name */}
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <span
                              className={`w-6 text-center text-xs font-black font-mono ${
                                index === 0
                                  ? 'text-yellow-400 text-base'
                                  : index === 1
                                  ? 'text-slate-300 text-sm'
                                  : index === 2
                                  ? 'text-amber-600 text-sm'
                                  : 'text-slate-500'
                              }`}
                            >
                              {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                            </span>

                            <span className="text-2xl shrink-0">{member.avatar}</span>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs sm:text-sm font-bold text-white truncate">
                                  {member.name}
                                </span>
                                {member.role === 'leader' && (
                                  <span className="text-[8px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded-full font-bold border border-amber-500/30">
                                    Captain
                                  </span>
                                )}
                              </div>

                              {/* Progress mini bar */}
                              <div className="flex items-center gap-2 mt-1.5">
                                <div className="flex-1 bg-slate-900 h-2 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${
                                      memberPercent >= 100
                                        ? 'bg-emerald-400'
                                        : 'bg-gradient-to-r from-cyan-500 to-sky-400'
                                    }`}
                                    style={{ width: `${memberPercent}%` }}
                                  />
                                </div>
                                <span className="text-[10px] font-mono font-bold text-cyan-300 shrink-0">
                                  {member.currentIntake}ml ({memberPercent}%)
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Streak & Nudge Action */}
                          <div className="flex items-center gap-2 shrink-0">
                            <div className="flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-500/10 px-2.5 py-1.5 rounded-xl border border-amber-500/20">
                              <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              <span>{member.streak}d</span>
                            </div>

                            {!isCurrentUser && (
                              <button
                                onClick={() => handleSendNudge(member)}
                                className="p-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 transition cursor-pointer"
                                title={`Send Splash Nudge to ${member.name}`}
                              >
                                <Droplet className="w-4 h-4 fill-cyan-400" />
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

            {/* EMPTY STATE IF NO SQUADS */}
            {socialState.squads.length === 0 && activeTab === 'leaderboard' && (
              <div className="py-10 text-center space-y-4 glass-surface rounded-3xl p-6 border border-slate-800">
                <div className="w-14 h-14 rounded-3xl bg-cyan-500/15 text-cyan-300 flex items-center justify-center mx-auto text-2xl">
                  👥
                </div>
                <div>
                  <h4 className="text-base font-black text-white font-heading">
                    No Squads Joined Yet
                  </h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                    Create your first squad with friends or join an existing group with an invite code!
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
                  <button
                    onClick={() => setActiveTab('create')}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-cyan-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 cursor-pointer"
                  >
                    + Create a Squad
                  </button>
                  <button
                    onClick={() => setActiveTab('join')}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-cyan-300 font-bold text-xs hover:border-cyan-400/40 cursor-pointer"
                  >
                    Join with Code
                  </button>
                </div>
              </div>
            )}

            {/* VIEW 2: CREATE NEW SQUAD */}
            {activeTab === 'create' && (
              <form onSubmit={handleCreateSquad} className="space-y-4 p-1">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                    Squad Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kanpur Heatwave Warriors"
                    value={newSquadName}
                    onChange={(e) => setNewSquadName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                    Choose Squad Icon
                  </label>
                  <div className="flex items-center gap-2 overflow-x-auto py-1">
                    {['🏋️‍♂️', '💼', '🌸', '⚡', '🦁', '🚀', '🔥', '💧', '🏆'].map((em) => (
                      <button
                        key={em}
                        type="button"
                        onClick={() => setNewSquadEmoji(em)}
                        className={`p-3 text-2xl rounded-2xl border transition cursor-pointer ${
                          newSquadEmoji === em
                            ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md'
                            : 'glass-surface border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                    Challenge Format
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setChallengeType('daily_goal_race')}
                      className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
                        challengeType === 'daily_goal_race'
                          ? 'bg-cyan-950/60 border-cyan-400 text-white'
                          : 'glass-surface border-slate-800 text-slate-400'
                      }`}
                    >
                      <span className="text-xs font-bold block text-white">Daily 100% Race</span>
                      <span className="text-[10px] text-slate-400">Everyone aims for their 4L goal</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setChallengeType('collective_tank')}
                      className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
                        challengeType === 'collective_tank'
                          ? 'bg-cyan-950/60 border-cyan-400 text-white'
                          : 'glass-surface border-slate-800 text-slate-400'
                      }`}
                    >
                      <span className="text-xs font-bold block text-white">Communal Tank</span>
                      <span className="text-[10px] text-slate-400">Combined group volume target</span>
                    </button>
                  </div>
                </div>

                {challengeType === 'collective_tank' && (
                  <div className="space-y-1 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
                    <label className="text-xs font-bold text-cyan-300 block">
                      Target Combined Team Volume
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="5"
                        max="200"
                        value={collectiveGoalLiters}
                        onChange={(e) => setCollectiveGoalLiters(Number(e.target.value))}
                        className="w-28 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono font-bold"
                      />
                      <span className="text-xs text-slate-300 font-bold">Liters / Day</span>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 font-black text-xs transition cursor-pointer shadow-lg shadow-cyan-500/20 mt-2"
                >
                  Create Squad & Generate Invite Link
                </button>
              </form>
            )}

            {/* VIEW 3: JOIN EXISTING SQUAD WITH CODE */}
            {activeTab === 'join' && (
              <form onSubmit={handleJoinSquad} className="space-y-4 p-1">
                <div className="p-5 rounded-3xl glass-surface border border-slate-800 space-y-2">
                  <h4 className="text-sm font-bold text-white">Enter 6-Character Squad Code</h4>
                  <p className="text-xs text-slate-400">
                    Paste the squad code or invite link shared by your friend
                  </p>

                  <input
                    type="text"
                    required
                    placeholder="e.g. SQUAD-GYM-4000 or GYM-4000"
                    value={joinCodeInput}
                    onChange={(e) => setJoinCodeInput(e.target.value)}
                    className="w-full bg-slate-950 border border-cyan-500/40 rounded-2xl px-4 py-3.5 text-sm text-cyan-300 font-mono font-bold placeholder-slate-600 focus:outline-none focus:border-cyan-300 uppercase tracking-wider text-center"
                  />
                </div>

                {joinStatusMsg && (
                  <div className="p-3 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 text-xs text-cyan-200 text-center font-semibold">
                    {joinStatusMsg}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 font-black text-xs transition cursor-pointer shadow-lg shadow-cyan-500/20"
                >
                  Join Squad Now
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
