import type { CurrencyCode } from './user.model';

export type GoalStatus = 'ACTIVE' | 'ACHIEVED' | 'PAUSED';

/** Savings-service `SavingsGoal` DTO. */
export interface SavingsGoal {
  id: string;
  name: string;
  description: string;
  emoji: string;
  targetAmount: number;
  savedAmount: number;
  currency: CurrencyCode;
  /** ISO date by which the goal should be reached. */
  targetDate: string;
  status: GoalStatus;
  roundUpsEnabled: boolean;
  /** `true` for the goal highlighted on the savings page. */
  primary: boolean;
}

/** One round-up captured on a card payment. */
export interface RoundUpEntry {
  id: string;
  title: string;
  emoji: string;
  /** Amount actually paid by card. */
  paid: number;
  /** Amount the payment was rounded up to. */
  roundedTo: number;
  /** Difference credited to savings. */
  savedAmount: number;
  occurredAt: string;
}

/** Aggregated round-up figures for the current month. */
export interface RoundUpSummary {
  monthTotal: number;
  multiplier: number;
  /** Daily totals, oldest first, used to draw the mini chart. */
  dailySeries: number[];
  fromLabel: string;
  toLabel: string;
  currency: CurrencyCode;
}

/** Payload for `POST /api/savings/{goalId}/contribute`. */
export interface ContributionRequest {
  amount: number;
}
