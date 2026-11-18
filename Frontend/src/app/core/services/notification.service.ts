import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';

import { environment } from '@env/environment';
import { NotificationApiService } from '../api/notification-api.service';

/**
 * Unread-counter store, and the place where "how we learn about new
 * notifications" is decided.
 *
 * Today it polls the gateway on an interval. When the notification service
 * gains a WebSocket or SSE endpoint, only `start()` has to change: components
 * read `unread` and `hasUnread` signals and never touch the transport.
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly api = inject(NotificationApiService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly unreadCount = signal(0);
  private timer: number | null = null;
  private started = false;

  readonly unread = this.unreadCount.asReadonly();
  readonly hasUnread = computed(() => this.unreadCount() > 0);

  /** Starts the refresh loop (idempotent). Called once by the app shell. */
  start(): void {
    if (this.started) {
      return;
    }
    this.started = true;
    this.refresh();
    this.timer = globalThis.setInterval(() => this.refresh(), environment.notificationPollMs);
    this.destroyRef.onDestroy(() => this.stop());
  }

  stop(): void {
    if (this.timer !== null) {
      globalThis.clearInterval(this.timer);
      this.timer = null;
    }
  }

  /** Pulls the current unread count from the gateway. */
  refresh(): void {
    this.api.badge().subscribe({
      next: (badge) => this.unreadCount.set(badge.unread),
      error: () => {
        /* the error interceptor already surfaced a toast */
      },
    });
  }

  /** Optimistic update after the user opened / cleared the inbox. */
  setUnread(count: number): void {
    this.unreadCount.set(Math.max(0, count));
  }
}
