// Types for Social Squads, Friend Challenges & Google Cloud Sync

export interface UserIdentity {
  userId: string;
  name: string;
  avatar: string; // emoji or photo URL
  email?: string;
  isGoogleLinked: boolean;
  recoveryKey: string; // 6-character secret sync key e.g. "AQUA-7821-X9"
  lastSyncedTimestamp: number;
}

export interface SquadMember {
  userId: string;
  name: string;
  avatar: string;
  dailyGoal: number; // in ml e.g. 4000
  currentIntake: number; // in ml e.g. 2800
  streak: number; // in days e.g. 7
  lastLoggedTimestamp: number;
  role: 'leader' | 'member';
}

export interface SquadNudge {
  id: string;
  fromUserId: string;
  fromName: string;
  toUserId: string;
  timestamp: number;
  message: string;
}

export interface Squad {
  id: string; // e.g. "SQUAD-GYM-9021"
  name: string; // e.g. "CrossFit Iron Squad"
  emoji: string; // e.g. "🏋️‍♂️"
  description: string;
  createdByName: string;
  createdByUserId: string;
  createdAt: number;
  challengeType: 'daily_goal_race' | 'collective_tank'; // Race to 100% vs Combined team liters
  targetCollectiveLiters: number; // e.g. 40 Liters combined team water
  members: SquadMember[];
  nudges: SquadNudge[];
}

export interface SocialState {
  user: UserIdentity;
  squads: Squad[];
  activeSquadId: string | null;
  pendingInvites: string[];
}
