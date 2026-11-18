import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '@env/environment';
import { MOCK_DASHBOARD, mockOf } from '../../mock';
import type { DashboardData } from '../../models';
import { API_PREFIX } from '../constants/api-endpoints';

/**
 * Dashboard — aggregated read model.
 *
 * The dashboard needs data owned by five different services; the gateway
 * exposes a single BFF-style endpoint so the page performs one request.
 */
@Injectable({ providedIn: 'root' })
export class DashboardApiService {
  private readonly http = inject(HttpClient);

  get(): Observable<DashboardData> {
    if (environment.useMockData) {
      return mockOf(MOCK_DASHBOARD);
    }
    return this.http.get<DashboardData>(`${environment.apiUrl}${API_PREFIX.accounts}/me/dashboard`);
  }
}
