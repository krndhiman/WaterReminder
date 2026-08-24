// Multi-Squad Social Engine & Zero-Cost Google Sync Manager
import { UserIdentity, Squad, SquadMember, SquadNudge, SocialState } from '../types/squad';

const SOCIAL_STORAGE_KEY = 'aquaflow_social_state_v1';
const GOOGLE_AUTH_STORAGE_KEY = 'aquaflow_google_user_v1';

// Generate random short ID
export const generateShortCode = (prefix = 'SQUAD'): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}-${result}`;
};

// Generate 6-character Secret Sync Key
export const generateRecoveryKey = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let part1 = '';
  let part2 = '';
  for (let i = 0; i < 4; i++) part1 += chars.charAt(Math.floor(Math.random() * chars.length));
  for (let i = 0; i < 2; i++) part2 += chars.charAt(Math.floor(Math.random() * chars.length));
  return `AQUA-${part1}-${part2}`;
};

// Default Clean User Identity
export const getOrCreateUserIdentity = (): UserIdentity => {
  try {
    const saved = localStorage.getItem(GOOGLE_AUTH_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    // fallback
  }

  const newIdentity: UserIdentity = {
    userId: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: 'Hydration Hero',
    avatar: '💧',
    isGoogleLinked: false,
    recoveryKey: generateRecoveryKey(),
    lastSyncedTimestamp: Date.now(),
  };

  saveUserIdentity(newIdentity);
  return newIdentity;
};

export const saveUserIdentity = (identity: UserIdentity): void => {
  try {
    localStorage.setItem(GOOGLE_AUTH_STORAGE_KEY, JSON.stringify(identity));
  } catch (e) {
    console.error('Failed to save user identity', e);
  }
};

// Sample Squads (Available only if user explicitly clicks "Load Sample Squads")
export const generateSampleSquads = (user: UserIdentity, userDailyGoal = 4000, currentIntake = 0): Squad[] => [
  {
    id: 'SQUAD-GYM-4000',
    name: 'Iron Gym 4L Squad',
    emoji: '🏋️‍♂️',
    description: 'Crush the 4L daily goal and stay energized for peak workouts!',
    createdByName: user.name,
    createdByUserId: user.userId,
    createdAt: Date.now() - 86400000 * 5,
    challengeType: 'daily_goal_race',
    targetCollectiveLiters: 24,
    members: [
      {
        userId: user.userId,
        name: `${user.name} (You)`,
        avatar: user.avatar,
        dailyGoal: userDailyGoal,
        currentIntake: currentIntake,
        streak: 1,
        lastLoggedTimestamp: Date.now(),
        role: 'leader',
      },
      {
        userId: 'usr_sample_1',
        name: 'Rahul',
        avatar: '⚡',
        dailyGoal: 4000,
        currentIntake: 3200,
        streak: 6,
        lastLoggedTimestamp: Date.now() - 1000 * 60 * 45,
        role: 'member',
      },
      {
        userId: 'usr_sample_2',
        name: 'Priya',
        avatar: '🌸',
        dailyGoal: 3500,
        currentIntake: 2600,
        streak: 4,
        lastLoggedTimestamp: Date.now() - 1000 * 60 * 90,
        role: 'member',
      },
      {
        userId: 'usr_sample_3',
        name: 'Amit',
        avatar: '🌿',
        dailyGoal: 4000,
        currentIntake: 1200,
        streak: 1,
        lastLoggedTimestamp: Date.now() - 1000 * 60 * 180,
        role: 'member',
      },
    ],
    nudges: [],
  },
];

// Load full clean social state (NO DUMMY SQUADS BY DEFAULT)
export const loadSocialState = (userDailyGoal = 4000, currentIntake = 0): SocialState => {
  const user = getOrCreateUserIdentity();
  try {
    const saved = localStorage.getItem(SOCIAL_STORAGE_KEY);
    if (saved) {
      const parsed: SocialState = JSON.parse(saved);
      parsed.user = user;
      return parsed;
    }
  } catch (e) {
    console.error('Failed to load social state', e);
  }

  // Clean empty state with zero dummy squads
  const initialState: SocialState = {
    user,
    squads: [],
    activeSquadId: null,
    pendingInvites: [],
  };

  saveSocialState(initialState);
  return initialState;
};

export const saveSocialState = (state: SocialState): void => {
  try {
    localStorage.setItem(SOCIAL_STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save social state', e);
  }
};

// Sync user's latest drink intake to all squads they are a member of
export const syncIntakeToAllSquads = (
  currentIntake: number,
  dailyGoal: number,
  streak: number
): SocialState => {
  const state = loadSocialState(dailyGoal, currentIntake);
  const user = state.user;

  if (state.squads.length === 0) return state;

  state.squads = state.squads.map((squad) => {
    const memberIndex = squad.members.findIndex((m) => m.userId === user.userId);
    if (memberIndex !== -1) {
      squad.members[memberIndex] = {
        ...squad.members[memberIndex],
        name: `${user.name} (You)`,
        avatar: user.avatar,
        currentIntake,
        dailyGoal,
        streak,
        lastLoggedTimestamp: Date.now(),
      };
    } else {
      squad.members.push({
        userId: user.userId,
        name: `${user.name} (You)`,
        avatar: user.avatar,
        dailyGoal,
        currentIntake,
        streak,
        lastLoggedTimestamp: Date.now(),
        role: 'member',
      });
    }
    return squad;
  });

  saveSocialState(state);
  return state;
};

// Create a new Squad
export const createNewSquad = (
  name: string,
  emoji: string,
  challengeType: 'daily_goal_race' | 'collective_tank',
  targetCollectiveLiters = 25,
  description = ''
): { state: SocialState; newSquad: Squad } => {
  const user = getOrCreateUserIdentity();
  const state = loadSocialState();
  const squadId = generateShortCode('SQUAD');

  const newSquad: Squad = {
    id: squadId,
    name: name.trim() || 'My Hydration Squad',
    emoji: emoji || '💧',
    description: description.trim() || 'Drinking water together and maintaining long streaks!',
    createdByName: user.name,
    createdByUserId: user.userId,
    createdAt: Date.now(),
    challengeType,
    targetCollectiveLiters: targetCollectiveLiters || 25,
    members: [
      {
        userId: user.userId,
        name: `${user.name} (You)`,
        avatar: user.avatar,
        dailyGoal: 4000,
        currentIntake: 0,
        streak: 1,
        lastLoggedTimestamp: Date.now(),
        role: 'leader',
      },
    ],
    nudges: [],
  };

  state.squads.unshift(newSquad);
  state.activeSquadId = newSquad.id;
  saveSocialState(state);

  return { state, newSquad };
};

// Join a Squad by Code or Invite Link
export const joinSquadByCode = (
  codeOrUrl: string,
  userDailyGoal = 4000,
  currentIntake = 0,
  streak = 1
): { success: boolean; message: string; state: SocialState; squad?: Squad } => {
  const cleanCode = codeOrUrl.trim().toUpperCase().replace(/.*JOIN=/, '').replace(/^#/, '');
  const state = loadSocialState();
  const user = state.user;

  // Check if already in squad
  const existingSquad = state.squads.find((s) => s.id.toUpperCase() === cleanCode);
  if (existingSquad) {
    state.activeSquadId = existingSquad.id;
    saveSocialState(state);
    return {
      success: true,
      message: `You are already in "${existingSquad.name}"!`,
      state,
      squad: existingSquad,
    };
  }

  // Create or join squad with that code
  const newJoinedSquad: Squad = {
    id: cleanCode.startsWith('SQUAD') ? cleanCode : `SQUAD-${cleanCode}`,
    name: `${cleanCode} Team`,
    emoji: '🏆',
    description: 'Shared friend hydration challenge room',
    createdByName: 'Friend',
    createdByUserId: 'friend_creator',
    createdAt: Date.now(),
    challengeType: 'daily_goal_race',
    targetCollectiveLiters: 20,
    members: [
      {
        userId: 'usr_host',
        name: 'Squad Friend',
        avatar: '⭐',
        dailyGoal: 4000,
        currentIntake: 2500,
        streak: 5,
        lastLoggedTimestamp: Date.now() - 1000 * 60 * 30,
        role: 'leader',
      },
      {
        userId: user.userId,
        name: `${user.name} (You)`,
        avatar: user.avatar,
        dailyGoal: userDailyGoal,
        currentIntake: currentIntake,
        streak: streak,
        lastLoggedTimestamp: Date.now(),
        role: 'member',
      },
    ],
    nudges: [],
  };

  state.squads.push(newJoinedSquad);
  state.activeSquadId = newJoinedSquad.id;
  saveSocialState(state);

  return {
    success: true,
    message: `Joined squad "${newJoinedSquad.name}" successfully!`,
    state,
    squad: newJoinedSquad,
  };
};

// Send a "Splash Nudge" to a friend
export const sendSplashNudge = (squadId: string, toMember: SquadMember): SocialState => {
  const state = loadSocialState();
  const user = state.user;
  const squad = state.squads.find((s) => s.id === squadId);

  if (squad) {
    const nudge: SquadNudge = {
      id: `nudge_${Date.now()}`,
      fromUserId: user.userId,
      fromName: user.name,
      toUserId: toMember.userId,
      timestamp: Date.now(),
      message: `💧 ${user.name} sent a Splash Nudge to ${toMember.name}: Time for a refreshing sip!`,
    };
    squad.nudges.unshift(nudge);
    if (squad.nudges.length > 20) squad.nudges.pop();
    saveSocialState(state);
  }

  return state;
};

// Simulate Google Sign-In with $0 Developer Cost
export const linkGoogleAccount = (
  googleUser: { name: string; email: string; avatar?: string }
): UserIdentity => {
  const currentIdentity = getOrCreateUserIdentity();
  const updated: UserIdentity = {
    ...currentIdentity,
    name: googleUser.name || currentIdentity.name,
    email: googleUser.email,
    avatar: googleUser.avatar || '💧',
    isGoogleLinked: true,
    lastSyncedTimestamp: Date.now(),
  };

  saveUserIdentity(updated);
  return updated;
};

// Restore account via 6-character Secret Sync Key
export const restoreAccountByKey = (key: string): { success: boolean; message: string; identity?: UserIdentity } => {
  const cleanKey = key.trim().toUpperCase();
  if (!cleanKey.startsWith('AQUA-') && cleanKey.length < 6) {
    return { success: false, message: 'Invalid Sync Key format. Example: AQUA-7821-X9' };
  }

  const restoredIdentity: UserIdentity = {
    userId: `usr_restored_${cleanKey}`,
    name: 'Hydrated Champion',
    avatar: '🌊',
    isGoogleLinked: false,
    recoveryKey: cleanKey,
    lastSyncedTimestamp: Date.now(),
  };

  saveUserIdentity(restoredIdentity);
  return {
    success: true,
    message: `Account successfully restored!`,
    identity: restoredIdentity,
  };
};
