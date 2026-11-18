import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';

import { RecurringApiService } from '@app/core/api/recurring-api.service';
import { ClockService } from '@app/core/services/clock.service';
import { ToastService } from '@app/core/services/toast.service';
import type {
  RecurrenceFrequency,
  RecurringExpense,
  RecurringStatus,
  RecurringSummary,
} from '@app/models';
import { AppButtonComponent } from '@app/shared/components/button/button';
import { AppCardComponent } from '@app/shared/components/card/card';
import { AppErrorStateComponent } from '@app/shared/components/error-state/error-state';
import { IconComponent } from '@app/shared/components/icon/icon';
import { AppPageHeaderComponent } from '@app/shared/components/page-header/page-header';
import { AppSkeletonComponent } from '@app/shared/components/skeleton/skeleton';
import { AppSwitchComponent } from '@app/shared/components/switch/switch';
import { AppTagComponent, type TagTone } from '@app/shared/components/tag/tag';
import { calendarDayDiff, dueLabel } from '@app/shared/utils/date-format';

/** Copy shown for each recurrence cadence. */
const FREQUENCY_LABELS: Record<RecurrenceFrequency, string> = {
  MONTHLY: 'Monthly',
  WEEKLY: 'Weekly',
  YEARLY: 'Yearly',
};

/**
 * Recurring expenses — 30-day summary strip plus the pause/resume list.
 *
 * Ports the React `Recurring` screen: the local `useState([true, true, false])`
 * switch list is now the per-item `status` of `RecurringApiService`.
 */
@Component({
  selector: 'app-recurring-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AppPageHeaderComponent,
    AppCardComponent,
    AppButtonComponent,
    AppTagComponent,
    AppSwitchComponent,
    IconComponent,
    AppSkeletonComponent,
    AppErrorStateComponent,
  ],
  template: `
    <app-page-header
      eyebrow="SET IT & SPLIT IT"
      title="Recurring expenses"
      subtitle="Your monthly must-pays, without the monthly admin."
    >
      <button appButton icon="plus">New recurring expense</button>
    </app-page-header>

    @if (loading()) {
      <app-skeleton />
    } @else if (error()) {
      <app-error-state
        title="We couldn’t load your recurring expenses"
        message="Nothing has been charged. Try again."
        [retryable]="true"
        (retried)="reload()"
      />
    } @else {
      @if (summary(); as s) {
        <section appCard class="recurring-summary">
          <div>
            <span>NEXT 30 DAYS</span>
            <strong>{{ money(s.next30DaysTotal) }}</strong>
            <p>Your share across {{ s.activeCount }} recurring expenses</p>
          </div>
          <div class="calendar-strip">
            @for (day of s.calendar; track day.isoDate) {
              <span [class.active]="day.hasDue">
                <small>{{ day.weekday }}</small>
                {{ day.dayOfMonth }}
                @if (day.hasDue) {
                  <i></i>
                }
              </span>
            }
          </div>
        </section>
      }

      <div class="recurring-list">
        @for (item of items(); track item.id) {
          <section appCard class="recurring-row">
            <span [class]="iconClass(item)">{{ item.emoji }}</span>
            <div class="recurring-name">
              <strong>{{ item.title }}</strong>
              <span>{{ item.groupName }}</span>
            </div>
            <div>
              <small>FREQUENCY</small>
              <b>{{ frequencyLabel(item) }}</b>
            </div>
            <div>
              <small>YOUR SHARE</small>
              <b>{{ money(item.yourShare) }}</b>
            </div>
            <span appTag [tone]="tagTone(item)">{{ tagLabel(item) }}</span>
            <button
              appSwitch
              [checked]="isActive(item)"
              (checkedChange)="toggle(item, $event)"
            ></button>
            <button type="button">
              <app-icon name="more" />
            </button>
          </section>
        }
      </div>
    }
  `,
})
export class RecurringPage {
  private readonly recurring = inject(RecurringApiService);
  private readonly clock = inject(ClockService);
  private readonly toast = inject(ToastService);

  protected readonly summary = signal<RecurringSummary | null>(null);
  protected readonly items = signal<RecurringExpense[]>([]);

  protected readonly loading = signal(true);
  protected readonly error = signal(false);

  constructor() {
    this.recurring.summary().subscribe({
      next: (value) => this.summary.set(value),
      error: () => this.summary.set(null),
    });

    this.recurring.list().subscribe({
      next: (list) => {
        this.items.set(list);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }

  protected reload(): void {
    this.loading.set(true);
    this.error.set(false);

    this.recurring.summary().subscribe({
      next: (value) => this.summary.set(value),
      error: () => this.summary.set(null),
    });

    this.recurring.list().subscribe({
      next: (list) => {
        this.items.set(list);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }

  protected isActive(item: RecurringExpense): boolean {
    return item.status === 'ACTIVE';
  }

  protected iconClass(item: RecurringExpense): string {
    return `category-icon large ${this.tagTone(item)}`;
  }

  protected frequencyLabel(item: RecurringExpense): string {
    return `${FREQUENCY_LABELS[item.frequency]} · ${this.ordinal(item.dayOfMonth)}`;
  }

  protected tagLabel(item: RecurringExpense): string {
    if (item.status !== 'ACTIVE' || item.nextDueDate === null) {
      return 'Paused';
    }
    return dueLabel(item.nextDueDate, this.clock.now());
  }

  protected tagTone(item: RecurringExpense): TagTone {
    if (item.status !== 'ACTIVE' || item.nextDueDate === null) {
      return 'amber';
    }
    const days = calendarDayDiff(item.nextDueDate, this.clock.now());
    return days >= -7 ? 'coral' : 'violet';
  }

  protected money(value: number): string {
    return `$${value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  protected toggle(item: RecurringExpense, checked: boolean): void {
    const status: RecurringStatus = checked ? 'ACTIVE' : 'PAUSED';

    this.recurring.setStatus(item.id, status).subscribe({
      next: (updated) => {
        this.items.update((list) =>
          list.map((entry) => (entry.id === updated.id ? updated : entry)),
        );
        this.toast.success(
          status === 'ACTIVE' ? `${updated.title} resumed` : `${updated.title} paused`,
        );
      },
      error: () => this.toast.error('We couldn’t update that recurring expense.'),
    });
  }

  private ordinal(day: number): string {
    const mod100 = day % 100;
    if (mod100 >= 11 && mod100 <= 13) {
      return `${day}th`;
    }
    switch (day % 10) {
      case 1:
        return `${day}st`;
      case 2:
        return `${day}nd`;
      case 3:
        return `${day}rd`;
      default:
        return `${day}th`;
    }
  }
}
