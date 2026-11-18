import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '@env/environment';
import { MOCK_EXPENSES, mockOf } from '../../mock';
import type { CreateExpenseRequest, Expense } from '../../models';
import { API_PREFIX } from '../constants/api-endpoints';

/**
 * Expenses — Expense service (`/api/expenses` through the gateway).
 */
@Injectable({ providedIn: 'root' })
export class ExpenseApiService {
  private readonly http = inject(HttpClient);

  private get base(): string {
    return `${environment.apiUrl}${API_PREFIX.expenses}`;
  }

  listByGroup(groupId: string): Observable<Expense[]> {
    if (environment.useMockData) {
      return mockOf(MOCK_EXPENSES.filter((expense) => expense.groupId === groupId));
    }
    return this.http.get<Expense[]>(`${this.base}/group/${groupId}`);
  }

  create(request: CreateExpenseRequest): Observable<Expense> {
    if (environment.useMockData) {
      const created: Expense = {
        id: `e-${Date.now()}`,
        groupId: request.groupId,
        groupName: 'Maple House',
        title: request.title,
        emoji: request.emoji,
        category: request.category,
        amount: request.amount,
        currency: 'USD',
        paidByUserId: request.paidByUserId,
        paidByName: 'You',
        paidByYou: true,
        splitMethod: request.splitMethod,
        shares: [],
        yourShare: request.amount / 4,
        youLent: true,
        occurredAt: new Date().toISOString(),
        receiptUrl: request.receiptUrl,
      };
      return mockOf(created);
    }
    return this.http.post<Expense>(this.base, request);
  }
}
