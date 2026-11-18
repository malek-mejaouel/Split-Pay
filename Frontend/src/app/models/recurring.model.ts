import type { CurrencyCode } from './user.model';

export type RecurrenceFrequency = 'MONTHLY' | 'WEEKLY' | 'YEARLY';

export type RecurringStatus = 'ACTIVE' | 'PAUSED';

/** Recurring-service `RecurringExpense` DTO. */
export interface RecurringExpense {
  id: string;
  title: string;
  emoji: string;
  groupId: string;
  groupName: string;
  frequency: RecurrenceFrequency;
  /** Day of the month / week the charge happens. */
  dayOfMonth: number;
  amount: number;
  /** The signed-in user's share of the recurring charge. */
  yourShare: number;
  currency: CurrencyCode;
  status: RecurringStatus;
  /** ISO date of the next charge (`null` when paused). */
  nextDueDate: string | null;
}

/** One cell of the "next 7 days" strip. */
export interface RecurringCalendarDay {
  isoDate: string;
  weekday: string;
  dayOfMonth: number;
  hasDue: boolean;
  isToday: boolean;
}

/** Aggregated figures for the recurring page. */
export interface RecurringSummary {
  next30DaysTotal: number;
  activeCount: number;
  currency: CurrencyCode;
  calendar: RecurringCalendarDay[];
}

/** Payload for `POST /api/recurring`. */
export interface CreateRecurringExpenseRequest {
  title: string;
  emoji: string;
  groupId: string;
  frequency: RecurrenceFrequency;
  dayOfMonth: number;
  amount: number;
  yourShare: number;
}

/** Body of `PATCH /api/recurring/{id}/status`. */
export interface RecurringStatusRequest {
  status: RecurringStatus;
}
