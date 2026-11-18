import type { AvatarColor, CurrencyCode } from './user.model';

export type ExpenseCategory =
  | 'food'
  | 'groceries'
  | 'home'
  | 'utilities'
  | 'transport'
  | 'other';

export type SplitMethod = 'equal' | 'percentage' | 'custom';

/** How an amount is attributed to one participant. */
export interface ExpenseShare {
  userId: string;
  fullName: string;
  initials: string;
  avatarColor: AvatarColor;
  you: boolean;
  percentage: number;
  amount: number;
}

/** Expense-service `Expense` DTO. */
export interface Expense {
  id: string;
  groupId: string;
  groupName: string;
  title: string;
  emoji: string;
  category: ExpenseCategory;
  amount: number;
  currency: CurrencyCode;
  paidByUserId: string;
  paidByName: string;
  paidByYou: boolean;
  splitMethod: SplitMethod;
  shares: ExpenseShare[];
  /** The signed-in user's share of this expense. */
  yourShare: number;
  /** `true` when the signed-in user is the one who paid. */
  youLent: boolean;
  occurredAt: string;
  receiptUrl: string | null;
}

/** Payload for `POST /api/expenses`. */
export interface CreateExpenseRequest {
  groupId: string;
  title: string;
  emoji: string;
  category: ExpenseCategory;
  amount: number;
  paidByUserId: string;
  splitMethod: SplitMethod;
  percentages: Record<string, number> | null;
  receiptUrl: string | null;
}

/** A row of the unified group timeline (an expense or a settlement). */
export interface TimelineEntry {
  id: string;
  kind: 'expense' | 'settlement';
  title: string;
  emoji: string;
  /** e.g. "Leo paid · split equally" */
  note: string;
  /** e.g. "Your share $13.50" */
  detail: string | null;
  occurredAt: string;
  amount: number | null;
  tone: 'positive' | 'negative' | 'neutral';
}

/** Group of timeline entries sharing the same day. */
export interface TimelineDay {
  label: string;
  entries: TimelineEntry[];
}
