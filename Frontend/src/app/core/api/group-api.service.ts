import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '@env/environment';
import {
  MOCK_GROUPS,
  MOCK_GROUP_SUMMARIES,
  MOCK_MAPLE_TIMELINE,
  mockOf,
} from '../../mock';
import type {
  CreateGroupRequest,
  Group,
  GroupSummary,
  JoinGroupRequest,
  TimelineEntry,
} from '../../models';
import { API_PREFIX } from '../constants/api-endpoints';

/**
 * Households — Account service (`/api/groups` through the gateway).
 */
@Injectable({ providedIn: 'root' })
export class GroupApiService {
  private readonly http = inject(HttpClient);

  private get base(): string {
    return `${environment.apiUrl}${API_PREFIX.groups}`;
  }

  /** Tiles of the households page. */
  list(): Observable<GroupSummary[]> {
    if (environment.useMockData) {
      return mockOf([...MOCK_GROUP_SUMMARIES]);
    }
    return this.http.get<GroupSummary[]>(this.base);
  }

  /** Full group payload (members + balances). */
  get(id: string): Observable<Group> {
    if (environment.useMockData) {
      const found = MOCK_GROUPS.find((group) => group.id === id) ?? MOCK_GROUPS[0];
      return mockOf({ ...found });
    }
    return this.http.get<Group>(`${this.base}/${id}`);
  }

  /** Unified expense + settlement timeline of one household. */
  timeline(id: string): Observable<TimelineEntry[]> {
    if (environment.useMockData) {
      return mockOf([...MOCK_MAPLE_TIMELINE]);
    }
    return this.http.get<TimelineEntry[]>(`${this.base}/${id}/timeline`);
  }

  create(request: CreateGroupRequest): Observable<Group> {
    if (environment.useMockData) {
      const created: Group = {
        id: `g-${Date.now()}`,
        name: request.name,
        emoji: request.emoji,
        accent: request.accent,
        address: null,
        since: new Date().toISOString().slice(0, 10),
        isPrimary: false,
        inviteCode: `SP-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
        members: MOCK_GROUPS[0].members,
        yourNetBalance: 0,
        expenseCountThisMonth: 0,
        balances: [],
      };
      return mockOf(created);
    }
    return this.http.post<Group>(this.base, request);
  }

  /** Join an existing household from an invite code. */
  join(request: JoinGroupRequest): Observable<GroupSummary> {
    if (environment.useMockData) {
      return mockOf<GroupSummary>({ ...MOCK_GROUP_SUMMARIES[1] });
    }
    return this.http.post<GroupSummary>(`${this.base}/join`, request);
  }
}
