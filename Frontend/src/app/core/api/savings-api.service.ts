import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '@env/environment';
import {
  MOCK_ROUND_UP_HISTORY,
  MOCK_ROUND_UP_SUMMARY,
  MOCK_SAVINGS_GOALS,
  mockOf,
} from '../../mock';
import type { ContributionRequest, RoundUpEntry, RoundUpSummary, SavingsGoal } from '../../models';
import { API_PREFIX } from '../constants/api-endpoints';

/**
 * Savings — Savings service (`/api/savings` through the gateway).
 */
@Injectable({ providedIn: 'root' })
export class SavingsApiService {
  private readonly http = inject(HttpClient);

  private get base(): string {
    return `${environment.apiUrl}${API_PREFIX.savings}`;
  }

  goals(): Observable<SavingsGoal[]> {
    if (environment.useMockData) {
      return mockOf([...MOCK_SAVINGS_GOALS]);
    }
    return this.http.get<SavingsGoal[]>(`${this.base}/goals`);
  }

  roundUpSummary(): Observable<RoundUpSummary> {
    if (environment.useMockData) {
      return mockOf({ ...MOCK_ROUND_UP_SUMMARY, dailySeries: [...MOCK_ROUND_UP_SUMMARY.dailySeries] });
    }
    return this.http.get<RoundUpSummary>(`${this.base}/round-ups/summary`);
  }

  roundUpHistory(): Observable<RoundUpEntry[]> {
    if (environment.useMockData) {
      return mockOf([...MOCK_ROUND_UP_HISTORY]);
    }
    return this.http.get<RoundUpEntry[]>(`${this.base}/round-ups`);
  }

  /** Add money to a goal ("Boost by $50" in the design). */
  contribute(goalId: string, request: ContributionRequest): Observable<SavingsGoal> {
    if (environment.useMockData) {
      const found = MOCK_SAVINGS_GOALS.find((goal) => goal.id === goalId) ?? MOCK_SAVINGS_GOALS[0];
      return mockOf({ ...found, savedAmount: found.savedAmount + request.amount });
    }
    return this.http.post<SavingsGoal>(`${this.base}/goals/${goalId}/contribute`, request);
  }
}
