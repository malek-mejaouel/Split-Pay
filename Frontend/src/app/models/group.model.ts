import type { AvatarColor } from './user.model';

/** Accent tint used by household tiles. */
export type GroupAccent = 'violet' | 'blue' | 'mint' | 'coral' | 'amber';

/** A member of a household, as returned by the Account service. */
export interface GroupMember {
  userId: string;
  fullName: string;
  initials: string;
  avatarColor: AvatarColor;
  /** `true` when this member is the signed-in user. */
  you: boolean;
}

/** Net balance of one member inside a group (positive = gets money back). */
export interface MemberBalance {
  userId: string;
  fullName: string;
  initials: string;
  avatarColor: AvatarColor;
  you: boolean;
  /** Positive => the member is owed, negative => the member owes. */
  netAmount: number;
}

/** Account-service `Group` DTO. */
export interface Group {
  id: string;
  name: string;
  emoji: string;
  accent: GroupAccent;
  address: string | null;
  since: string | null;
  isPrimary: boolean;
  inviteCode: string | null;
  members: GroupMember[];
  /** Positive => you are owed by the group, negative => you owe. */
  yourNetBalance: number;
  expenseCountThisMonth: number;
  balances: MemberBalance[];
}

/** Lightweight shape used by the households list. */
export interface GroupSummary {
  id: string;
  name: string;
  emoji: string;
  accent: GroupAccent;
  memberCount: number;
  members: GroupMember[];
  yourNetBalance: number;
  inviteCode: string | null;
}

/** Payload for `POST /api/groups`. */
export interface CreateGroupRequest {
  name: string;
  emoji: string;
  accent: GroupAccent;
  memberEmails: string[];
}

/** Payload for `POST /api/groups/join`. */
export interface JoinGroupRequest {
  inviteCode: string;
}
