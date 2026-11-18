/**
 * Mock layer.
 *
 * Every value below is ported from the hardcoded arrays of the Figma/React
 * export, so the UI is pixel-identical while the Spring services are not ready.
 *
 * Toggle it off with `environment.useMockData = false` — no component changes.
 */
import type {
  AppNotification,
  DashboardData,
  Expense,
  Group,
  GroupSummary,
  RecurringCalendarDay,
  RecurringExpense,
  RecurringSummary,
  RoundUpEntry,
  RoundUpSummary,
  SavingsGoal,
  SettlementSuggestion,
  TimelineEntry,
  User,
  UserStats,
  WalletSummary,
  WalletTransaction,
} from '../models';

/**
 * Fixed demo clock.
 *
 * The Figma design is dated "Monday, March 16" (2026-03-16 is a Monday), so all
 * mock timestamps are expressed relative to this instant. It keeps labels such
 * as "12m", "Yesterday" or "Due in 4 days" consistent with the design instead of
 * drifting with the real clock.
 */
export const MOCK_NOW = new Date('2026-03-16T21:54:00');

/** ISO timestamp `minutes` before the demo clock. */
function minutesAgo(minutes: number): string {
  return new Date(MOCK_NOW.getTime() - minutes * 60_000).toISOString();
}

/** ISO timestamp `days` before the demo clock (keeps the time of day). */
function daysAgo(days: number, hour = 12, minute = 0): string {
  const date = new Date(MOCK_NOW);
  date.setDate(date.getDate() - days);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

/** ISO timestamp `days` after the demo clock. */
function daysAhead(days: number): string {
  const date = new Date(MOCK_NOW);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

/* -------------------------------------------------------------------------- */
/* Users (Account service)                                                    */
/* -------------------------------------------------------------------------- */

export const MOCK_USERS: readonly User[] = [
  {
    id: 'u-maya',
    fullName: 'Maya Patel',
    firstName: 'Maya',
    email: 'maya@splitpay.app',
    handle: '@mayap',
    initials: 'MP',
    avatarColor: 'lavender',
    phone: '+1 (415) 555-0182',
    defaultCurrency: 'USD',
    studentVerified: true,
    createdAt: daysAgo(210),
  },
  {
    id: 'u-leo',
    fullName: 'Leo Kim',
    firstName: 'Leo',
    email: 'leo@splitpay.app',
    handle: '@leok',
    initials: 'LK',
    avatarColor: 'mint',
    phone: null,
    defaultCurrency: 'USD',
    studentVerified: true,
    createdAt: daysAgo(190),
  },
  {
    id: 'u-nora',
    fullName: 'Nora Singh',
    firstName: 'Nora',
    email: 'nora@splitpay.app',
    handle: '@noras',
    initials: 'NS',
    avatarColor: 'coral',
    phone: null,
    defaultCurrency: 'USD',
    studentVerified: true,
    createdAt: daysAgo(180),
  },
  {
    id: 'u-sam',
    fullName: 'Sam Boyd',
    firstName: 'Sam',
    email: 'sam@splitpay.app',
    handle: '@samb',
    initials: 'SB',
    avatarColor: 'blue',
    phone: null,
    defaultCurrency: 'USD',
    studentVerified: false,
    createdAt: daysAgo(150),
  },
  {
    id: 'u-iris',
    fullName: 'Iris Chen',
    firstName: 'Iris',
    email: 'iris@splitpay.app',
    handle: '@irisc',
    initials: 'IC',
    avatarColor: 'mint',
    phone: null,
    defaultCurrency: 'USD',
    studentVerified: true,
    createdAt: daysAgo(120),
  },
  {
    id: 'u-theo',
    fullName: 'Theo Ruiz',
    firstName: 'Theo',
    email: 'theo@splitpay.app',
    handle: '@theor',
    initials: 'TR',
    avatarColor: 'coral',
    phone: null,
    defaultCurrency: 'USD',
    studentVerified: false,
    createdAt: daysAgo(90),
  },
];

export const MOCK_CURRENT_USER: User = MOCK_USERS[0];

export const MOCK_USER_STATS: UserStats = {
  households: 3,
  splits: 42,
  friends: 12,
};

/* -------------------------------------------------------------------------- */
/* Groups / households (Account service)                                      */
/* -------------------------------------------------------------------------- */

export const MOCK_GROUPS: readonly Group[] = [
  {
    id: 'g-maple',
    name: 'Maple House',
    emoji: '🏠',
    accent: 'violet',
    address: '12 Maple Street',
    since: '2025-09-01',
    isPrimary: true,
    inviteCode: 'SP-8K4M',
    members: [
      { userId: 'u-maya', fullName: 'Maya Patel', initials: 'MP', avatarColor: 'lavender', you: true },
      { userId: 'u-leo', fullName: 'Leo Kim', initials: 'LK', avatarColor: 'mint', you: false },
      { userId: 'u-nora', fullName: 'Nora Singh', initials: 'NS', avatarColor: 'coral', you: false },
      { userId: 'u-sam', fullName: 'Sam Boyd', initials: 'SB', avatarColor: 'blue', you: false },
    ],
    yourNetBalance: 92.3,
    expenseCountThisMonth: 8,
    balances: [
      {
        userId: 'u-maya',
        fullName: 'Maya Patel',
        initials: 'MP',
        avatarColor: 'lavender',
        you: true,
        netAmount: 92.3,
      },
      {
        userId: 'u-leo',
        fullName: 'Leo Kim',
        initials: 'LK',
        avatarColor: 'mint',
        you: false,
        netAmount: -54.0,
      },
      {
        userId: 'u-nora',
        fullName: 'Nora Singh',
        initials: 'NS',
        avatarColor: 'coral',
        you: false,
        netAmount: -67.2,
      },
      {
        userId: 'u-sam',
        fullName: 'Sam Boyd',
        initials: 'SB',
        avatarColor: 'blue',
        you: false,
        netAmount: 28.9,
      },
    ],
  },
  {
    id: 'g-brighton',
    name: 'Brighton Weekend',
    emoji: '🌊',
    accent: 'blue',
    address: null,
    since: '2026-02-14',
    isPrimary: false,
    inviteCode: 'SP-2Q7T',
    members: [
      { userId: 'u-maya', fullName: 'Maya Patel', initials: 'MP', avatarColor: 'lavender', you: true },
      { userId: 'u-iris', fullName: 'Iris Chen', initials: 'IC', avatarColor: 'mint', you: false },
      { userId: 'u-theo', fullName: 'Theo Ruiz', initials: 'TR', avatarColor: 'coral', you: false },
      { userId: 'u-sam', fullName: 'Sam Boyd', initials: 'SB', avatarColor: 'blue', you: false },
      { userId: 'u-leo', fullName: 'Leo Kim', initials: 'LK', avatarColor: 'mint', you: false },
      { userId: 'u-nora', fullName: 'Nora Singh', initials: 'NS', avatarColor: 'coral', you: false },
    ],
    yourNetBalance: -24.8,
    expenseCountThisMonth: 3,
    balances: [
      {
        userId: 'u-maya',
        fullName: 'Maya Patel',
        initials: 'MP',
        avatarColor: 'lavender',
        you: true,
        netAmount: -24.8,
      },
    ],
  },
  {
    id: 'g-design',
    name: 'Design Crew',
    emoji: '🎓',
    accent: 'mint',
    address: null,
    since: '2025-10-02',
    isPrimary: false,
    inviteCode: null,
    members: [
      { userId: 'u-maya', fullName: 'Maya Patel', initials: 'MP', avatarColor: 'lavender', you: true },
      { userId: 'u-iris', fullName: 'Iris Chen', initials: 'IC', avatarColor: 'mint', you: false },
      { userId: 'u-nora', fullName: 'Nora Singh', initials: 'NS', avatarColor: 'coral', you: false },
      { userId: 'u-leo', fullName: 'Leo Kim', initials: 'LK', avatarColor: 'mint', you: false },
      { userId: 'u-theo', fullName: 'Theo Ruiz', initials: 'TR', avatarColor: 'coral', you: false },
    ],
    yourNetBalance: 0,
    expenseCountThisMonth: 0,
    balances: [
      {
        userId: 'u-maya',
        fullName: 'Maya Patel',
        initials: 'MP',
        avatarColor: 'lavender',
        you: true,
        netAmount: 0,
      },
    ],
  },
];

export const MOCK_GROUP_SUMMARIES: readonly GroupSummary[] = MOCK_GROUPS.map((group) => ({
  id: group.id,
  name: group.name,
  emoji: group.emoji,
  accent: group.accent,
  memberCount: group.members.length,
  members: group.members,
  yourNetBalance: group.yourNetBalance,
  inviteCode: group.inviteCode,
}));

/* -------------------------------------------------------------------------- */
/* Expenses (Expense service)                                                 */
/* -------------------------------------------------------------------------- */

export const MOCK_EXPENSES: readonly Expense[] = [
  {
    id: 'e-noodles',
    groupId: 'g-maple',
    groupName: 'Maple House',
    title: 'Late night noodles',
    emoji: '🍜',
    category: 'food',
    amount: 54,
    currency: 'USD',
    paidByUserId: 'u-leo',
    paidByName: 'Leo',
    paidByYou: false,
    splitMethod: 'equal',
    shares: [
      { userId: 'u-maya', fullName: 'Maya', initials: 'MP', avatarColor: 'lavender', you: true, percentage: 25, amount: 13.5 },
      { userId: 'u-leo', fullName: 'Leo', initials: 'LK', avatarColor: 'mint', you: false, percentage: 25, amount: 13.5 },
      { userId: 'u-nora', fullName: 'Nora', initials: 'NS', avatarColor: 'coral', you: false, percentage: 25, amount: 13.5 },
      { userId: 'u-sam', fullName: 'Sam', initials: 'SB', avatarColor: 'blue', you: false, percentage: 25, amount: 13.5 },
    ],
    yourShare: 13.5,
    youLent: false,
    occurredAt: minutesAgo(12),
    receiptUrl: null,
  },
  {
    id: 'e-electricity',
    groupId: 'g-maple',
    groupName: 'Maple House',
    title: 'Electricity · March',
    emoji: '⚡',
    category: 'utilities',
    amount: 116.8,
    currency: 'USD',
    paidByUserId: 'u-maya',
    paidByName: 'You',
    paidByYou: true,
    splitMethod: 'equal',
    shares: [
      { userId: 'u-maya', fullName: 'Maya', initials: 'MP', avatarColor: 'lavender', you: true, percentage: 25, amount: 29.2 },
      { userId: 'u-leo', fullName: 'Leo', initials: 'LK', avatarColor: 'mint', you: false, percentage: 25, amount: 29.2 },
      { userId: 'u-nora', fullName: 'Nora', initials: 'NS', avatarColor: 'coral', you: false, percentage: 25, amount: 29.2 },
      { userId: 'u-sam', fullName: 'Sam', initials: 'SB', avatarColor: 'blue', you: false, percentage: 25, amount: 29.2 },
    ],
    yourShare: 29.2,
    youLent: true,
    occurredAt: daysAgo(1, 10, 12),
    receiptUrl: null,
  },
  {
    id: 'e-groceries',
    groupId: 'g-maple',
    groupName: 'Maple House',
    title: 'Sunday groceries',
    emoji: '🛒',
    category: 'groceries',
    amount: 72.4,
    currency: 'USD',
    paidByUserId: 'u-sam',
    paidByName: 'Sam',
    paidByYou: false,
    splitMethod: 'equal',
    shares: [
      { userId: 'u-maya', fullName: 'Maya', initials: 'MP', avatarColor: 'lavender', you: true, percentage: 25, amount: 18.1 },
      { userId: 'u-leo', fullName: 'Leo', initials: 'LK', avatarColor: 'mint', you: false, percentage: 25, amount: 18.1 },
      { userId: 'u-nora', fullName: 'Nora', initials: 'NS', avatarColor: 'coral', you: false, percentage: 25, amount: 18.1 },
      { userId: 'u-sam', fullName: 'Sam', initials: 'SB', avatarColor: 'blue', you: false, percentage: 25, amount: 18.1 },
    ],
    yourShare: 18.1,
    youLent: false,
    occurredAt: daysAgo(2, 16, 16),
    receiptUrl: null,
  },
];

/** Group timeline, already grouped by day for the group detail page. */
export const MOCK_MAPLE_TIMELINE: readonly TimelineEntry[] = [
  {
    id: 't-1',
    kind: 'expense',
    title: 'Late night noodles',
    emoji: '🍜',
    note: 'Leo paid · split equally',
    detail: 'Your share $13.50',
    occurredAt: minutesAgo(12),
    amount: 13.5,
    tone: 'negative',
  },
  {
    id: 't-2',
    kind: 'expense',
    title: 'Electricity · March',
    emoji: '⚡',
    note: 'You paid · split equally',
    detail: 'You lent $87.60',
    occurredAt: daysAgo(1, 10, 12),
    amount: 87.6,
    tone: 'positive',
  },
  {
    id: 't-3',
    kind: 'settlement',
    title: 'Nora settled with you',
    emoji: '💸',
    note: 'Paid with SplitPay wallet',
    detail: null,
    occurredAt: daysAgo(1, 8, 20),
    amount: 32,
    tone: 'positive',
  },
  {
    id: 't-4',
    kind: 'expense',
    title: 'Sunday groceries',
    emoji: '🛒',
    note: 'Sam paid · split equally',
    detail: 'Your share $18.10',
    occurredAt: daysAgo(2, 16, 16),
    amount: 18.1,
    tone: 'negative',
  },
];

/** Compact feed shown on the dashboard. */
export const MOCK_DASHBOARD_ACTIVITY: readonly TimelineEntry[] = [
  {
    id: 'a-1',
    kind: 'expense',
    title: 'Late night noodles',
    emoji: '🍜',
    note: 'Leo paid $54.00',
    detail: null,
    occurredAt: minutesAgo(12),
    amount: -13.5,
    tone: 'negative',
  },
  {
    id: 'a-2',
    kind: 'expense',
    title: 'Electricity bill',
    emoji: '⚡',
    note: 'You paid $116.80',
    detail: null,
    occurredAt: daysAgo(1, 18, 40),
    amount: 87.6,
    tone: 'positive',
  },
  {
    id: 'a-3',
    kind: 'settlement',
    title: 'Nora paid you',
    emoji: '💸',
    note: 'Wallet transfer',
    detail: null,
    occurredAt: daysAgo(1, 8, 20),
    amount: 32,
    tone: 'positive',
  },
  {
    id: 'a-4',
    kind: 'expense',
    title: 'Sunday groceries',
    emoji: '🛒',
    note: 'Sam paid $72.40',
    detail: null,
    occurredAt: daysAgo(2, 16, 16),
    amount: -18.1,
    tone: 'negative',
  },
];

/* -------------------------------------------------------------------------- */
/* Settlements (Settlement service)                                           */
/* -------------------------------------------------------------------------- */

export const MOCK_SETTLEMENT_SUGGESTIONS: readonly SettlementSuggestion[] = [
  {
    id: 's-leo-maya',
    groupId: 'g-maple',
    fromUserId: 'u-leo',
    fromName: 'Leo',
    fromInitials: 'LK',
    toUserId: 'u-maya',
    toName: 'Maya',
    toInitials: 'MP',
    amount: 54,
    currency: 'USD',
    reason: 'Late night noodles + groceries',
    paidByYou: false,
  },
  {
    id: 's-nora-maya',
    groupId: 'g-maple',
    fromUserId: 'u-nora',
    fromName: 'Nora',
    fromInitials: 'NS',
    toUserId: 'u-maya',
    toName: 'Maya',
    toInitials: 'MP',
    amount: 38.3,
    currency: 'USD',
    reason: 'Electricity · March',
    paidByYou: false,
  },
  {
    id: 's-nora-sam',
    groupId: 'g-maple',
    fromUserId: 'u-nora',
    fromName: 'Nora',
    fromInitials: 'NS',
    toUserId: 'u-sam',
    toName: 'Sam',
    toInitials: 'SB',
    amount: 28.9,
    currency: 'USD',
    reason: 'Sunday groceries',
    paidByYou: false,
  },
];

/* -------------------------------------------------------------------------- */
/* Wallet (Wallet service)                                                    */
/* -------------------------------------------------------------------------- */

export const MOCK_WALLET_SUMMARY: WalletSummary = {
  balance: 284.2,
  currency: 'USD',
  moneyIn: 624,
  moneyOut: 339.8,
  transactionCount: 12,
  monthlyDelta: 140,
  cardLast4: '4821',
};

export const MOCK_WALLET_TRANSACTIONS: readonly WalletTransaction[] = [
  {
    id: 'w-1',
    direction: 'in',
    title: 'From Nora Singh',
    subtitle: 'Maple House settlement',
    emoji: '💸',
    amount: 32,
    currency: 'USD',
    occurredAt: daysAgo(1, 8, 20),
  },
  {
    id: 'w-2',
    direction: 'in',
    title: 'Wallet top up',
    subtitle: 'Visa ending 2024',
    emoji: '🏦',
    amount: 100,
    currency: 'USD',
    occurredAt: daysAgo(2, 11, 5),
  },
  {
    id: 'w-3',
    direction: 'out',
    title: 'To Leo Kim',
    subtitle: 'Late night noodles',
    emoji: '🍜',
    amount: 13.5,
    currency: 'USD',
    occurredAt: daysAgo(2, 21, 42),
  },
  {
    id: 'w-4',
    direction: 'out',
    title: 'Round-up transfer',
    subtitle: 'Summer in Lisbon',
    emoji: '◌',
    amount: 4.6,
    currency: 'USD',
    occurredAt: daysAgo(3, 19, 30),
  },
];

/* -------------------------------------------------------------------------- */
/* Recurring (Recurring service)                                              */
/* -------------------------------------------------------------------------- */

export const MOCK_RECURRING_EXPENSES: readonly RecurringExpense[] = [
  {
    id: 'r-rent',
    title: 'Rent',
    emoji: '🏡',
    groupId: 'g-maple',
    groupName: 'Maple House',
    frequency: 'MONTHLY',
    dayOfMonth: 1,
    amount: 780,
    yourShare: 780,
    currency: 'USD',
    status: 'ACTIVE',
    nextDueDate: daysAhead(4),
  },
  {
    id: 'r-wifi',
    title: 'Wi-Fi',
    emoji: '📶',
    groupId: 'g-maple',
    groupName: 'Maple House',
    frequency: 'MONTHLY',
    dayOfMonth: 24,
    amount: 18,
    yourShare: 18,
    currency: 'USD',
    status: 'ACTIVE',
    nextDueDate: daysAhead(8),
  },
  {
    id: 'r-electricity',
    title: 'Electricity',
    emoji: '⚡',
    groupId: 'g-maple',
    groupName: 'Maple House',
    frequency: 'MONTHLY',
    dayOfMonth: 28,
    amount: 36,
    yourShare: 36,
    currency: 'USD',
    status: 'PAUSED',
    nextDueDate: null,
  },
];

/** Next 7 days strip shown above the recurring list. */
function buildCalendarStrip(): RecurringCalendarDay[] {
  const weekdayLetters = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const dueDays = new Set(
    MOCK_RECURRING_EXPENSES.filter(
      (item) => item.status === 'ACTIVE' && item.nextDueDate !== null,
    ).map((item) => item.nextDueDate),
  );

  const days: RecurringCalendarDay[] = [];
  for (let offset = 1; offset <= 7; offset++) {
    const date = new Date(MOCK_NOW);
    date.setDate(date.getDate() + offset);
    const iso = date.toISOString().slice(0, 10);
    days.push({
      isoDate: iso,
      weekday: weekdayLetters[date.getDay()] ?? '',
      dayOfMonth: date.getDate(),
      hasDue: dueDays.has(iso),
      isToday: false,
    });
  }
  return days;
}

export const MOCK_RECURRING_SUMMARY: RecurringSummary = {
  next30DaysTotal: 834,
  activeCount: 3,
  currency: 'USD',
  calendar: buildCalendarStrip(),
};

/* -------------------------------------------------------------------------- */
/* Savings (Savings service)                                                  */
/* -------------------------------------------------------------------------- */

export const MOCK_SAVINGS_GOALS: readonly SavingsGoal[] = [
  {
    id: 'sg-lisbon',
    name: 'Summer in Lisbon',
    description: 'Flights, pastéis, and zero regrets.',
    emoji: '☀',
    targetAmount: 1000,
    savedAmount: 682.4,
    currency: 'USD',
    targetDate: '2026-07-01',
    status: 'ACTIVE',
    roundUpsEnabled: true,
    primary: true,
  },
  {
    id: 'sg-laptop',
    name: 'New laptop',
    description: 'A machine that keeps up with studio deadlines.',
    emoji: '💻',
    targetAmount: 1400,
    savedAmount: 240,
    currency: 'USD',
    targetDate: '2026-12-01',
    status: 'ACTIVE',
    roundUpsEnabled: false,
    primary: false,
  },
];

export const MOCK_ROUND_UP_SUMMARY: RoundUpSummary = {
  monthTotal: 34.6,
  multiplier: 2,
  dailySeries: [28, 42, 35, 62, 48, 75, 55, 90, 68, 82, 100, 78],
  fromLabel: 'Mar 1',
  toLabel: 'Today',
  currency: 'USD',
};

export const MOCK_ROUND_UP_HISTORY: readonly RoundUpEntry[] = [
  {
    id: 'ru-1',
    title: 'Campus coffee',
    emoji: '☕',
    paid: 4.2,
    roundedTo: 5,
    savedAmount: 0.8,
    occurredAt: minutesAgo(180),
  },
  {
    id: 'ru-2',
    title: 'Bus ticket',
    emoji: '🚌',
    paid: 2.75,
    roundedTo: 3,
    savedAmount: 0.25,
    occurredAt: minutesAgo(320),
  },
  {
    id: 'ru-3',
    title: 'Groceries',
    emoji: '🛒',
    paid: 18.1,
    roundedTo: 19,
    savedAmount: 0.9,
    occurredAt: daysAgo(1, 16, 16),
  },
];

/* -------------------------------------------------------------------------- */
/* Notifications (Notification service)                                       */
/* -------------------------------------------------------------------------- */

export const MOCK_NOTIFICATIONS: readonly AppNotification[] = [
  {
    id: 'n-1',
    type: 'PAYMENT',
    emoji: '💸',
    tone: 'green',
    title: 'Payment received',
    body: 'Nora paid you $32.00 for Maple House.',
    occurredAt: minutesAgo(2),
    read: false,
  },
  {
    id: 'n-2',
    type: 'REMINDER',
    emoji: '🏡',
    tone: 'coral',
    title: 'Rent is due soon',
    body: 'Your $780 share is due in 4 days.',
    occurredAt: minutesAgo(60),
    read: false,
  },
  {
    id: 'n-3',
    type: 'EXPENSE',
    emoji: '🍜',
    tone: 'violet',
    title: 'New expense from Leo',
    body: 'You owe $13.50 for Late night noodles.',
    occurredAt: daysAgo(1, 21, 42),
    read: false,
  },
  {
    id: 'n-4',
    type: 'GOAL',
    emoji: '✦',
    tone: 'amber',
    title: 'Goal milestone',
    body: 'You reached 68% of your Lisbon goal!',
    occurredAt: daysAgo(2, 9, 0),
    read: true,
  },
];

/* -------------------------------------------------------------------------- */
/* Dashboard (aggregated payload)                                             */
/* -------------------------------------------------------------------------- */

export const MOCK_DASHBOARD: DashboardData = {
  user: MOCK_CURRENT_USER,
  balance: {
    balance: 284.2,
    currency: 'USD',
    changePercent: 12.4,
  },
  split: {
    owedAmount: 186.4,
    owedFromCount: 3,
    oweAmount: 72.5,
    oweToNames: ['Leo', 'Nora'],
    currency: 'USD',
  },
  recentActivity: [...MOCK_DASHBOARD_ACTIVITY],
  primaryGroup: MOCK_GROUP_SUMMARIES[0],
  primaryGoal: MOCK_SAVINGS_GOALS[0],
  upcomingRecurring: MOCK_RECURRING_EXPENSES.filter((item) => item.status === 'ACTIVE').slice(0, 2),
  unreadNotifications: MOCK_NOTIFICATIONS.filter((item) => !item.read),
};
