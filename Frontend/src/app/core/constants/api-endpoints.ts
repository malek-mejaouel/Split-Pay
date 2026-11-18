/**
 * Gateway route prefixes.
 *
 * The front-end only ever talks to the API Gateway. Each microservice is
 * reachable through one dedicated prefix, so if a service is renamed or moved
 * behind a different gateway route, only this file has to change.
 */
export const API_PREFIX = {
  /** Account service — auth, profile, households. */
  accounts: '/api/accounts',
  /** Account/Expense service — shared households. */
  groups: '/api/groups',
  /** Wallet service — balance, top-up, transfers, transactions. */
  wallet: '/api/wallet',
  /** Expense service — expenses and split shares. */
  expenses: '/api/expenses',
  /** Settlement service — smart settle, one-click payments. */
  settlements: '/api/settlements',
  /** Recurring service — rent, Wi-Fi, utilities. */
  recurring: '/api/recurring',
  /** Savings service — goals and round-ups. */
  savings: '/api/savings',
  /** Notification service — inbox and badges. */
  notifications: '/api/notifications',
} as const;

/** localStorage keys (single place so they can be namespaced/rotated). */
export const STORAGE_KEYS = {
  token: 'splitpay.access-token',
  refreshToken: 'splitpay.refresh-token',
  user: 'splitpay.user',
  theme: 'splitpay.theme',
} as const;

/** Query-parameter name used to remember where the user wanted to go. */
export const RETURN_URL_PARAM = 'returnUrl';
