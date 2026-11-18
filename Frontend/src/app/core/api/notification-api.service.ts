import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '@env/environment';
import { MOCK_NOTIFICATIONS, mockOf } from '../../mock';
import type { AppNotification, NotificationBadge, NotificationFilter } from '../../models';
import { API_PREFIX } from '../constants/api-endpoints';

/**
 * Inbox — Notification service (`/api/notifications` through the gateway).
 */
@Injectable({ providedIn: 'root' })
export class NotificationApiService {
  private readonly http = inject(HttpClient);

  private get base(): string {
    return `${environment.apiUrl}${API_PREFIX.notifications}`;
  }

  list(filter: NotificationFilter = 'all'): Observable<AppNotification[]> {
    if (environment.useMockData) {
      return mockOf(filterNotifications(filter));
    }
    const params = new HttpParams().set('filter', filter);
    return this.http.get<AppNotification[]>(this.base, { params });
  }

  markAllRead(): Observable<AppNotification[]> {
    if (environment.useMockData) {
      return mockOf(MOCK_NOTIFICATIONS.map((item) => ({ ...item, read: true })));
    }
    return this.http.post<AppNotification[]>(`${this.base}/read-all`, {});
  }

  markRead(id: string): Observable<AppNotification> {
    if (environment.useMockData) {
      const found = MOCK_NOTIFICATIONS.find((item) => item.id === id) ?? MOCK_NOTIFICATIONS[0];
      return mockOf({ ...found, read: true });
    }
    return this.http.patch<AppNotification>(`${this.base}/${id}/read`, {});
  }

  /** Lightweight endpoint used by the polling loop for the unread badge. */
  badge(): Observable<NotificationBadge> {
    if (environment.useMockData) {
      return mockOf<NotificationBadge>({
        unread: MOCK_NOTIFICATIONS.filter((item) => !item.read).length,
      });
    }
    return this.http.get<NotificationBadge>(`${this.base}/badge`);
  }
}

function filterNotifications(filter: NotificationFilter): AppNotification[] {
  switch (filter) {
    case 'payments':
      return MOCK_NOTIFICATIONS.filter((item) => item.type === 'PAYMENT');
    case 'reminders':
      return MOCK_NOTIFICATIONS.filter((item) => item.type === 'REMINDER');
    default:
      return [...MOCK_NOTIFICATIONS];
  }
}
