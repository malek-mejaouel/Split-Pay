import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '@env/environment';
import { MOCK_SETTLEMENT_SUGGESTIONS, mockOf } from '../../mock';
import type {
  CreateSettlementRequest,
  Settlement,
  SettlementResult,
  SettlementSuggestion,
} from '../../models';
import { API_PREFIX } from '../constants/api-endpoints';

/**
 * Settlements — Settlement service (`/api/settlements` through the gateway).
 */
@Injectable({ providedIn: 'root' })
export class SettlementApiService {
  private readonly http = inject(HttpClient);

  private get base(): string {
    return `${environment.apiUrl}${API_PREFIX.settlements}`;
  }

  /** "Smart settle" suggestions that clear the group in the fewest payments. */
  suggestions(groupId: string): Observable<SettlementSuggestion[]> {
    if (environment.useMockData) {
      return mockOf(MOCK_SETTLEMENT_SUGGESTIONS.filter((item) => item.groupId === groupId));
    }
    return this.http.get<SettlementSuggestion[]>(`${this.base}/group/${groupId}/suggestions`);
  }

  settle(request: CreateSettlementRequest): Observable<SettlementResult> {
    if (environment.useMockData) {
      const settlement: Settlement = {
        id: `st-${Date.now()}`,
        groupId: request.groupId,
        groupName: 'Maple House',
        fromUserId: 'u-maya',
        fromName: 'Maya',
        toUserId: request.toUserId,
        toName: 'Leo',
        amount: request.amount,
        currency: 'USD',
        method: request.method,
        status: 'COMPLETED',
        createdAt: new Date().toISOString(),
        note: null,
      };
      return mockOf({ settlement, walletBalanceAfter: 284.2 - request.amount });
    }
    return this.http.post<SettlementResult>(this.base, request);
  }

  history(groupId: string): Observable<Settlement[]> {
    if (environment.useMockData) {
      return mockOf<Settlement[]>([]);
    }
    return this.http.get<Settlement[]>(`${this.base}/group/${groupId}`);
  }
}
