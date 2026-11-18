import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '@env/environment';
import { MOCK_RECURRING_EXPENSES, MOCK_RECURRING_SUMMARY, mockOf } from '../../mock';
import type {
  CreateRecurringExpenseRequest,
  RecurringExpense,
  RecurringStatus,
  RecurringSummary,
} from '../../models';
import { API_PREFIX } from '../constants/api-endpoints';

/**
 * Recurring bills — Recurring service (`/api/recurring` through the gateway).
 */
@Injectable({ providedIn: 'root' })
export class RecurringApiService {
  private readonly http = inject(HttpClient);

  private get base(): string {
    return `${environment.apiUrl}${API_PREFIX.recurring}`;
  }

  summary(): Observable<RecurringSummary> {
    if (environment.useMockData) {
      return mockOf({ ...MOCK_RECURRING_SUMMARY, calendar: [...MOCK_RECURRING_SUMMARY.calendar] });
    }
    return this.http.get<RecurringSummary>(`${this.base}/summary`);
  }

  list(): Observable<RecurringExpense[]> {
    if (environment.useMockData) {
      return mockOf([...MOCK_RECURRING_EXPENSES]);
    }
    return this.http.get<RecurringExpense[]>(this.base);
  }

  /** Pause / resume a recurring charge. */
  setStatus(id: string, status: RecurringStatus): Observable<RecurringExpense> {
    if (environment.useMockData) {
      const found = MOCK_RECURRING_EXPENSES.find((item) => item.id === id) ?? MOCK_RECURRING_EXPENSES[0];
      return mockOf({ ...found, status });
    }
    return this.http.patch<RecurringExpense>(`${this.base}/${id}/status`, { status });
  }

  create(request: CreateRecurringExpenseRequest): Observable<RecurringExpense> {
    if (environment.useMockData) {
      const created: RecurringExpense = {
        id: `r-${Date.now()}`,
        title: request.title,
        emoji: request.emoji,
        groupId: request.groupId,
        groupName: 'Maple House',
        frequency: request.frequency,
        dayOfMonth: request.dayOfMonth,
        amount: request.amount,
        yourShare: request.yourShare,
        currency: 'USD',
        status: 'ACTIVE',
        nextDueDate: null,
      };
      return mockOf(created);
    }
    return this.http.post<RecurringExpense>(this.base, request);
  }
}
