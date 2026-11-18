import type { CurrencyCode } from './user.model';

export type SettlementStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

export type SettlementMethod = 'wallet' | 'card';

/** One payment suggested by the settlement optimiser ("smart settle"). */
export interface SettlementSuggestion {
  id: string;
  groupId: string;
  fromUserId: string;
  fromName: string;
  fromInitials: string;
  toUserId: string;
  toName: string;
  toInitials: string;
  amount: number;
  currency: CurrencyCode;
  /** Short explanation of what the payment covers. */
  reason: string;
  /** `true` when the signed-in user is the payer. */
  paidByYou: boolean;
}

/** Settlement-service `Settlement` DTO. */
export interface Settlement {
  id: string;
  groupId: string;
  groupName: string;
  fromUserId: string;
  fromName: string;
  toUserId: string;
  toName: string;
  amount: number;
  currency: CurrencyCode;
  method: SettlementMethod;
  status: SettlementStatus;
  createdAt: string;
  note: string | null;
}

/** Payload for `POST /api/settlements`. */
export interface CreateSettlementRequest {
  groupId: string;
  toUserId: string;
  amount: number;
  method: SettlementMethod;
}

/** Result returned after a settlement was executed. */
export interface SettlementResult {
  settlement: Settlement;
  /** Balance left on the payer's wallet after the transfer. */
  walletBalanceAfter: number;
}
