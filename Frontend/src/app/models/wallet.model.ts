import type { CurrencyCode } from './user.model';

export type TransactionDirection = 'in' | 'out';

export type WalletFilter = 'all' | 'in' | 'out';

/** Wallet-service `WalletTransaction` DTO. */
export interface WalletTransaction {
  id: string;
  direction: TransactionDirection;
  title: string;
  subtitle: string;
  emoji: string;
  /** Always positive; `direction` carries the sign. */
  amount: number;
  currency: CurrencyCode;
  occurredAt: string;
}

/** Aggregated wallet figures for the wallet page hero + stat cards. */
export interface WalletSummary {
  balance: number;
  currency: CurrencyCode;
  moneyIn: number;
  moneyOut: number;
  transactionCount: number;
  monthlyDelta: number;
  cardLast4: string;
}

/** Payload for `POST /api/wallet/top-up`. */
export interface TopUpRequest {
  amount: number;
  method: 'card' | 'bank';
  cardLast4: string | null;
}

/** Payload for `POST /api/wallet/transfer`. */
export interface TransferRequest {
  toUserId: string;
  amount: number;
  note: string | null;
}
