import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';

import { NotificationApiService } from '@app/core/api/notification-api.service';
import { ClockService } from '@app/core/services/clock.service';
import { NotificationService } from '@app/core/services/notification.service';
import { AppButtonComponent } from '@app/shared/components/button/button';
import { AppCardComponent } from '@app/shared/components/card/card';
import { AppEmptyStateComponent } from '@app/shared/components/empty-state/empty-state';
import { AppErrorStateComponent } from '@app/shared/components/error-state/error-state';
import { IconComponent } from '@app/shared/components/icon/icon';
import { AppPageHeaderComponent } from '@app/shared/components/page-header/page-header';
import { AppSkeletonComponent } from '@app/shared/components/skeleton/skeleton';
import { AppTabsComponent, type TabItem } from '@app/shared/components/tabs/tabs';
import { relativeTime } from '@app/shared/utils/date-format';
import type { AppNotification, NotificationFilter, NotificationTone } from '@app/models';

/** Row view-model with the relative timestamp already resolved. */
interface NotificationRow {
  id: string;
  emoji: string;
  tone: NotificationTone;
  title: string;
  body: string;
  read: boolean;
  time: string;
}

/**
 * Inbox page — replaces the React `Notifications` screen.
 *
 * The React `read` flag (badge `3 → 0`) is now real: the shell unread dot is
 * cleared on arrival, and the filter badge reflects the unread items returned
 * by the notification service.
 */
@Component({
  selector: 'app-notifications-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AppPageHeaderComponent,
    AppCardComponent,
    AppTabsComponent,
    AppSkeletonComponent,
    AppEmptyStateComponent,
    AppErrorStateComponent,
    AppButtonComponent,
    IconComponent,
  ],
  template: `
    <app-page-header
      title="Notifications"
      subtitle="The useful stuff. No spam, promise."
    >
      <button appButton variant="ghost" type="button" (click)="markAllRead()">
        Mark all as read
      </button>
    </app-page-header>

    <section appCard class="notification-list">
      <app-tabs [items]="tabs()" [active]="filter()" (activeChange)="selectFilter($event)" />

      @if (loading()) {
        <app-skeleton />
      } @else if (error()) {
        <app-error-state
          title="That didn’t go through"
          message="Your notifications are safe. Try again."
          [retryable]="true"
          (retried)="reload()"
        />
      } @else if (items().length === 0) {
        <app-empty-state
          emoji="🔔"
          title="You’re all caught up"
          message="New payments and reminders will land here."
        />
      } @else {
        @for (item of rows(); track item.id) {
          <div [class]="item.read ? 'notification-row' : 'notification-row new'">
            <span class="category-icon large {{ item.tone }}">{{ item.emoji }}</span>
            <div>
              <strong>{{ item.title }}</strong>
              <p>{{ item.body }}</p>
              <small>{{ item.time }}</small>
            </div>
            <button type="button" (click)="markRead(item.id)">
              <app-icon name="more" />
            </button>
          </div>
        }
      }
    </section>
  `,
})
export class NotificationsPage {
  private readonly api = inject(NotificationApiService);
  private readonly notifications = inject(NotificationService);
  private readonly clock = inject(ClockService);

  protected readonly filter = signal<NotificationFilter>('all');
  protected readonly items = signal<readonly AppNotification[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal(false);

  /** List rows, with the relative timestamp resolved from the frozen clock. */
  protected readonly rows = computed<readonly NotificationRow[]>(() => {
    const now = this.clock.now();
    return this.items().map((item) => ({
      id: item.id,
      emoji: item.emoji,
      tone: item.tone,
      title: item.title,
      body: item.body,
      read: item.read,
      time: relativeTime(item.occurredAt, now, 'long'),
    }));
  });

  /** Unread rows currently shown — drives the "All" tab badge. */
  private readonly unread = computed(() => this.items().filter((item) => !item.read).length);

  protected readonly tabs = computed<readonly TabItem<NotificationFilter>[]>(() => [
    { id: 'all', label: 'All', badge: this.unread() },
    { id: 'payments', label: 'Payments' },
    { id: 'reminders', label: 'Reminders' },
  ]);

  constructor() {
    // The React shell cleared the unread dot when you opened the inbox.
    this.notifications.setUnread(0);

    // Reloads whenever the active filter tab changes.
    effect(() => {
      this.load(this.filter());
    });
  }

  protected selectFilter(value: string): void {
    if (value === 'all' || value === 'payments' || value === 'reminders') {
      this.filter.set(value);
    }
  }

  protected reload(): void {
    this.load(this.filter());
  }

  protected markAllRead(): void {
    this.api.markAllRead().subscribe({
      next: () => {
        this.items.update((list) => list.map((item) => ({ ...item, read: true })));
        this.notifications.setUnread(0);
      },
      error: () => {
        /* the error interceptor already surfaced a toast */
      },
    });
  }

  protected markRead(id: string): void {
    this.api.markRead(id).subscribe({
      next: (updated) => {
        this.items.update((list) =>
          list.map((item) => (item.id === updated.id ? updated : item)),
        );
        this.notifications.setUnread(this.items().filter((item) => !item.read).length);
      },
      error: () => {
        /* the error interceptor already surfaced a toast */
      },
    });
  }

  private load(filter: NotificationFilter): void {
    this.loading.set(true);
    this.error.set(false);
    this.api.list(filter).subscribe({
      next: (items) => {
        this.items.set(items);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }
}
