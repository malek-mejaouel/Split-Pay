/** Dashboard-service (aggregated) DTOs. */
import type { AppNotification } from './notification.model';
import type { CurrencyCode, User } from './user.model';
import type { GroupSummary } from './group.model';
import type { SavingsGoal } from './savings.model';
import type { RecurringExpense } from './recurring.model';
import type { TimelineEntry } from './expense.model';

/** Hero card of the dashboard. */
export interface BalanceSnapshot {
  balance: number;
  currency: CurrencyCode;
  /** Month-over-month change, in percent (e.g. 12.4). */
  changePercent: number;
}

/** "You are owed" / "You owe" split summary. */
export interface SplitSummary {
  owedAmount: number;
  owedFromCount: number;
  oweAmount: number;
  oweToNames: string[];
  currency: CurrencyCode;
}

/** Everything the dashboard needs, in one aggregated payload. */
export interface DashboardData {
  user: User;
  balance: BalanceSnapshot;
  split: SplitSummary;
  recentActivity: TimelineEntry[];
  primaryGroup: GroupSummary;
  primaryGoal: SavingsGoal;
  upcomingRecurring: RecurringExpense[];
  unreadNotifications: AppNotification[];
}
