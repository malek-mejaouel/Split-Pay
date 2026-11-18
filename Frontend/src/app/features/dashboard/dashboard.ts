import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { DashboardApiService } from '@app/core/api/dashboard-api.service';
import { ClockService } from '@app/core/services/clock.service';
import { UiModalService } from '@app/core/services/ui-modal.service';
import type { DashboardData } from '@app/models';
import { AppActivityItemComponent } from '@app/shared/components/activity-item/activity-item';
import { AppAvatarStackComponent } from '@app/shared/components/avatar-stack/avatar-stack';
import { AppButtonComponent } from '@app/shared/components/button/button';
import { AppCardComponent } from '@app/shared/components/card/card';
import { AppErrorStateComponent } from '@app/shared/components/error-state/error-state';
import { IconComponent } from '@app/shared/components/icon/icon';
import { AppPageHeaderComponent } from '@app/shared/components/page-header/page-header';
import { AppProgressRingComponent } from '@app/shared/components/progress-ring/progress-ring';
import { AppSkeletonComponent } from '@app/shared/components/skeleton/skeleton';
import { AppTagComponent } from '@app/shared/components/tag/tag';
import {
  dueLabel,
  longDayLabelUpper,
  monthYear,
  relativeTime,
} from '@app/shared/utils/date-format';

interface ActivityView {
  id: string;
  emoji: string;
  title: string;
  text: string;
  amount: string;
  tone: 'positive' | 'negative' | 'neutral';
  time: string;
}

interface RecurringView {
  id: string;
  emoji: string;
  title: string;
  due: string;
  amount: string;
}

interface GoalView {
  name: string;
  percent: number;
  saved: string;
  target: string;
  remaining: string;
  date: string;
}

/**
 * Signed-in home page ("Dashboard" of the Figma export).
 *
 * Every figure, label and relative timestamp is derived from the aggregated
 * `DashboardData` payload — nothing is hardcoded, unlike the React reference.
 */
@Component({
  selector: 'app-dashboard-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    IconComponent,
    AppButtonComponent,
    AppCardComponent,
    AppTagComponent,
    AppProgressRingComponent,
    AppAvatarStackComponent,
    AppPageHeaderComponent,
    AppActivityItemComponent,
    AppSkeletonComponent,
    AppErrorStateComponent,
  ],
  template: `
    @if (loading()) {
      <app-skeleton />
    } @else if (error()) {
      <app-error-state
        title="Couldn’t load your overview"
        message="Your balance is safe. Try again."
        (retried)="load()"
      />
    } @else {
      @if (dashboard(); as d) {
        <app-page-header
          [eyebrow]="eyebrow()"
          [title]="'Hey ' + d.user.firstName + ', good morning'"
          subtitle="Your money and your people, all caught up."
        >
          <button appButton variant="secondary" icon="send" (click)="modals.openSettle()">
            Settle up
          </button>
          <button appButton icon="plus" (click)="modals.openExpense()">Add expense</button>
        </app-page-header>

        <div class="dashboard-grid">
          <section appCard class="balance-card">
            <div class="balance-top">
              <span>Wallet balance</span>
              <button type="button"><app-icon name="more" /></button>
            </div>
            <div class="balance-number">
              <sup>$</sup>{{ balance().whole }}<span>.{{ balance().cents }}</span>
            </div>
            <div class="balance-change">
              <app-icon name="arrowUp" [size]="14" /> {{ d.balance.changePercent }}%
              <span>this month</span>
            </div>
            <div class="balance-actions">
              <button type="button" (click)="modals.openExpense()">
                <span><app-icon name="plus" /></span>
                Add
              </button>
              <button type="button" (click)="modals.openSettle()">
                <span><app-icon name="send" /></span>
                Send
              </button>
              <button type="button" routerLink="/wallet">
                <span><app-icon name="arrowDown" /></span>
                Top up
              </button>
            </div>
            <div class="orb orb-one"></div>
            <div class="orb orb-two"></div>
          </section>

          <section appCard class="split-summary">
            <div class="card-heading">
              <div>
                <span>Split summary</span>
                <h2>All households</h2>
              </div>
              <button type="button" routerLink="/households">View all</button>
            </div>
            <div class="summary-block owed">
              <span class="summary-icon"><app-icon name="arrowDown" /></span>
              <div>
                <small>YOU ARE OWED</small>
                <strong>{{ money(d.split.owedAmount) }}</strong>
                <span>from {{ d.split.owedFromCount }} friends</span>
              </div>
              <app-avatar-stack [count]="d.split.owedFromCount" />
            </div>
            <div class="summary-divider"></div>
            <div class="summary-block owe">
              <span class="summary-icon"><app-icon name="arrowUp" /></span>
              <div>
                <small>YOU OWE</small>
                <strong>{{ money(d.split.oweAmount) }}</strong>
                <span>to {{ d.split.oweToNames.join(' & ') }}</span>
              </div>
              <app-avatar-stack [count]="d.split.oweToNames.length" />
            </div>
            <div class="net-pill">
              You’re up <strong>{{ money(netBalance()) }}</strong> overall <span>Nice!</span>
            </div>
          </section>

          <section appCard class="activity-card">
            <div class="card-heading">
              <div>
                <span>WHAT’S HAPPENING</span>
                <h2>Recent activity</h2>
              </div>
              <button type="button">See all</button>
            </div>
            <div class="activity-list">
              @for (item of activity(); track item.id) {
                <app-activity-item
                  [emoji]="item.emoji"
                  [title]="item.title"
                  [text]="item.text"
                  [amount]="item.amount"
                  [tone]="item.tone"
                  [time]="item.time"
                />
              }
            </div>
          </section>

          <section
            appCard
            class="house-card"
            [routerLink]="['/households', d.primaryGroup.id]"
          >
            <div class="house-art">
              <span>{{ d.primaryGroup.emoji }}</span>
              <div class="window one"></div>
              <div class="window two"></div>
            </div>
            <span appTag tone="violet">PRIMARY HOME</span>
            <h2>{{ d.primaryGroup.name }}</h2>
            <p>{{ d.primaryGroup.memberCount }} roommates</p>
            <div class="house-footer">
              <app-avatar-stack [count]="d.primaryGroup.memberCount" />
              <span>
                {{ netLabel(d.primaryGroup.yourNetBalance) }}
                <strong>{{ absMoney(d.primaryGroup.yourNetBalance) }}</strong>
              </span>
              <app-icon name="chevron" />
            </div>
          </section>

          <section appCard class="savings-card">
            @if (goal(); as g) {
              <div class="card-heading">
                <div>
                  <span>AUTOSAVE</span>
                  <h2>{{ g.name }}</h2>
                </div>
                <button type="button"><app-icon name="more" /></button>
              </div>
              <div class="saving-content">
                <app-progress-ring [value]="g.percent" label="funded" />
                <div>
                  <small>YOU’VE SAVED</small>
                  <strong>{{ g.saved }}<span> / {{ g.target }}</span></strong>
                  <p>{{ g.remaining }} to go · {{ g.date }}</p>
                  <button appButton variant="secondary" icon="plus" routerLink="/savings">
                    Boost goal
                  </button>
                </div>
              </div>
            }
          </section>

          <section appCard class="upcoming-card">
            <div class="card-heading">
              <div>
                <span>COMING UP</span>
                <h2>Recurring</h2>
              </div>
              <button type="button" routerLink="/recurring">Manage</button>
            </div>
            @for (item of upcoming(); track item.id) {
              <div class="due-row">
                <span class="category-icon">{{ item.emoji }}</span>
                <div>
                  <strong>{{ item.title }}</strong>
                  <span>{{ item.due }}</span>
                </div>
                <b>{{ item.amount }}</b>
              </div>
            }
          </section>
        </div>
      }
    }
  `,
})
export class DashboardPage {
  private readonly dashboardApi = inject(DashboardApiService);
  private readonly clock = inject(ClockService);
  protected readonly modals = inject(UiModalService);

  /** Frozen demo "now" (or the real clock when the mock layer is off). */
  protected readonly now = this.clock.now();

  protected readonly loading = signal(true);
  protected readonly error = signal(false);
  protected readonly dashboard = signal<DashboardData | null>(null);

  protected readonly eyebrow = computed(() => longDayLabelUpper(this.now));

  protected readonly balance = computed(() => {
    const value = this.dashboard()?.balance.balance ?? 0;
    const whole = Math.floor(value);
    const cents = Math.round((value - whole) * 100)
      .toString()
      .padStart(2, '0');
    return { whole: whole.toLocaleString('en-US'), cents };
  });

  protected readonly netBalance = computed(() => {
    const d = this.dashboard();
    return d ? d.split.owedAmount - d.split.oweAmount : 0;
  });

  protected readonly activity = computed<ActivityView[]>(() => {
    const d = this.dashboard();
    if (!d) {
      return [];
    }
    const now = this.now;
    return d.recentActivity.map((entry) => ({
      id: entry.id,
      emoji: entry.emoji,
      title: entry.title,
      text: entry.note,
      amount: this.signed(entry.amount),
      tone: entry.tone,
      time: relativeTime(entry.occurredAt, now),
    }));
  });

  protected readonly goal = computed<GoalView | null>(() => {
    const goal = this.dashboard()?.primaryGoal;
    if (!goal) {
      return null;
    }
    const saved = Math.round(goal.savedAmount);
    const remaining = Math.max(0, Math.round(goal.targetAmount - goal.savedAmount));
    return {
      name: goal.name,
      percent: goal.targetAmount > 0 ? Math.round((goal.savedAmount / goal.targetAmount) * 100) : 0,
      saved: this.money(saved, 0),
      target: this.money(Math.round(goal.targetAmount), 0),
      remaining: this.money(remaining, 0),
      date: monthYear(goal.targetDate),
    };
  });

  protected readonly upcoming = computed<RecurringView[]>(() => {
    const d = this.dashboard();
    if (!d) {
      return [];
    }
    const now = this.now;
    return d.upcomingRecurring.map((item) => ({
      id: item.id,
      emoji: item.emoji,
      title: item.title,
      due: item.nextDueDate ? dueLabel(item.nextDueDate, now) : 'Paused',
      amount: this.money(Math.round(item.amount), 0),
    }));
  });

  constructor() {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set(false);
    this.dashboardApi.get().subscribe({
      next: (data) => {
        this.dashboard.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }

  protected money(value: number, decimals = 2): string {
    return `$${value.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}`;
  }

  protected absMoney(value: number): string {
    return this.money(Math.abs(value));
  }

  protected netLabel(net: number): string {
    if (net > 0) {
      return 'You’re owed';
    }
    if (net < 0) {
      return 'You owe';
    }
    return 'All settled';
  }

  private signed(value: number | null): string {
    if (value === null) {
      return '';
    }
    const sign = value < 0 ? '\u2212' : '+';
    return `${sign}${this.money(Math.abs(value))}`;
  }
}
