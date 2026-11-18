import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '@env/environment';
import { MOCK_WALLET_SUMMARY, MOCK_WALLET_TRANSACTIONS, mockOf } from '../../mock';
import type {
  TopUpRequest,
  TransferRequest,
  WalletFilter,
  WalletSummary,
  WalletTransaction,
} from '../../models';
import { API_PREFIX } from '../constants/api-endpoints';

/**
 * Wallet — Wallet service (`/api/wallet` through the gateway).
 */
@Injectable({ providedIn: 'root' })
export class WalletApiService {
  private readonly http = inject(HttpClient);

  private get base(): string {
    return `${environment.apiUrl}${API_PREFIX.wallet}`;
  }

  summary(): Observable<WalletSummary> {
    if (environment.useMockData) {
      return mockOf({ ...MOCK_WALLET_SUMMARY });
    }
    return this.http.get<WalletSummary>(`${this.base}/summary`);
  }

  transactions(filter: WalletFilter = 'all'): Observable<WalletTransaction[]> {
    if (environment.useMockData) {
      const all = [...MOCK_WALLET_TRANSACTIONS];
      const filtered = filter === 'all' ? all : all.filter((item) => item.direction === filter);
      return mockOf(filtered);
    }
    const params = new HttpParams().set('direction', filter);
    return this.http.get<WalletTransaction[]>(`${this.base}/transactions`, { params });
  }

  topUp(request: TopUpRequest): Observable<WalletSummary> {
    if (environment.useMockData) {
      return mockOf<WalletSummary>({
        ...MOCK_WALLET_SUMMARY,
        balance: MOCK_WALLET_SUMMARY.balance + request.amount,
        moneyIn: MOCK_WALLET_SUMMARY.moneyIn + request.amount,
      });
    }
    return this.http.post<WalletSummary>(`${this.base}/top-up`, request);
  }

  transfer(request: TransferRequest): Observable<WalletSummary> {
    if (environment.useMockData) {
      return mockOf<WalletSummary>({
        ...MOCK_WALLET_SUMMARY,
        balance: MOCK_WALLET_SUMMARY.balance - request.amount,
        moneyOut: MOCK_WALLET_SUMMARY.moneyOut + request.amount,
      });
    }
    return this.http.post<WalletSummary>(`${this.base}/transfer`, request);
  }
}
