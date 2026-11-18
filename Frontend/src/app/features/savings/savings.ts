import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';

import { SavingsApiService } from '@app/core/api/savings-api.service';
import { ClockService } from '@app/core/services/clock.service';
import { ToastService } from '@app/core/services/toast.service';
import type { RoundUpEntry, RoundUpSummary, SavingsGoal } from '@app/models';
import { AppActivityItemComponent } from '@app/shared/components/activity-item/activity-item';
import { AppButtonComponent } from '@app/shared/components/button/button';
import { AppCardComponent } from '@app/shared/components/card/card';
import { AppErrorStateComponent } from '@app/shared/components/error-state/error-state';
import { AppPageHeaderComponent } from '@app/shared/components/page-header/page-header';
import { AppProgressRingComponent } from '@app/shared/components/progress-ring/progress-ring';
import { AppSkeletonComponent } from '@app/shared/components/skeleton/skeleton';
import { AppSwitchComponent } from '@app/shared/components/switch/switch';
import { AppTagComponent } from '@app/shared/components/tag/tag';
import { dayMonth, monthYear, relativeTime } from '@app/shared/utils/date-format';

/**
 * Savings goals — the highlighted goal, the round-up chart and its history.
 *
 * Ports the React `Savings` screen. The former local `boosted` toggle is now a
 * real `SavingsApiService.contribute()` round-trip ("Boost by $50").
 */
@Component({
  selector: 'app-savings-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AppPageHeaderComponent,
    AppCardComponent,
    AppButtonComponent,
    AppTagComponent,
    AppSwitchComponent,
    AppProgressRingComponent,
    AppActivityItemComponent,
    AppSkeletonComponent,
    AppErrorStateComponent,
  ],
  template: `
    <app-page-header
      eyebrow="SMALL CHANGE, BIG PLANS"
      title="Savings goals"
      subtitle="Round up everyday spending and watch your plans get closer."
    >
      <button appButton icon="plus">New goal</button>
    </app-page-header>

    @if (loading()) {
      <app-skeleton />
    } @else if (error()) {
      <app-error-state
        title="We couldn’t load your savings"
        message="Your money is safe. Try again."
        [retryable]="true"
        (retried)="reload()"
      />
    } @else {
      <div class="savings-grid">
        @if (primary(); as goal) {
          <section appCard class="goal-main">
            <div class="goal-art">
              <span>{{ goal.emoji }}</span>
              <i></i>
              <i></i>
            </div>
            <div class="goal-main-head">
              <div>
                <span appTag tone="violet">ROUND-UPS ON</span>
                <h2>{{ goal.name }}</h2>
                <p>{{ goal.description }}</p>
              </div>
              <app-progress-ring [value]="primaryPercent()" label="funded" />
            </div>
            <div class="goal-numbers">
              <div>
                <span>SAVED</span>
                <strong>{{ money(goal.savedAmount) }}</strong>
              </div>
              <div>
                <span>GOAL</span>
                <strong>{{ money(goal.targetAmount, 0) }}</strong>
              </div>
              <div>
                <span>BY</span>
                <strong>{{ targetLabel(goal.targetDate) }}</strong>
              </div>
            </div>
            <div class="goal-bar">
              <i [style.width.%]="primaryPercent()"></i>
            </div>
            <button appButton icon="arrowUp" [disabled]="boosted()" (click)="boost(goal)">
              {{ boosted() ? 'Boost added!' : 'Boost by $50' }}
            </button>
          </section>
        }

        @if (roundUp(); as ru) {
          <section appCard class="roundup-card">
            <div class="card-heading">
              <div>
                <span>THIS MONTH</span>
                <h2>Round-ups</h2>
              </div>
              <span class="roundup-total">+{{ money(ru.monthTotal) }}</span>
            </div>
            <div class="mini-chart">
              @for (bar of ru.dailySeries; track $index) {
                <i [style.height.%]="bar"></i>
              }
            </div>
            <div class="chart-labels">
              <span>{{ chartStart() }}</span>
              <span>Today</span>
            </div>
            <div class="roundup-setting">
              <span>
                <strong>{{ ru.multiplier }}× multiplier</strong>
                <small>Double every round-up</small>
              </span>
              <button appSwitch [(checked)]="roundUpsEnabled"></button>
            </div>
          </section>
        }

        @if (nextGoal(); as goal) {
          <section appCard class="goal-small">
            <span class="goal-small-icon">{{ goal.emoji }}</span>
            <div>
              <span appTag tone="green">NEXT GOAL</span>
              <h2>{{ goal.name }}</h2>
              <p>{{ money(goal.savedAmount, 0) }} of {{ money(goal.targetAmount, 0) }}</p>
            </div>
            <app-progress-ring [value]="nextPercent()" label="" [small]="true" />
          </section>
        }

        <section appCard class="round-history">
          <div class="card-heading">
            <div>
              <span>LATEST</span>
              <h2>Round-up history</h2>
            </div>
            <button type="button">See all</button>
          </div>
          @for (entry of history(); track entry.id) {
            <app-activity-item
              [emoji]="entry.emoji"
              [title]="entry.title"
              [text]="entryText(entry)"
              [amount]="entryAmount(entry)"
              tone="positive"
              [time]="entryTime(entry)"
            />
          }
        </section>
      </div>
    }
  `,
})
export class SavingsPage {
  private readonly savings = inject(SavingsApiService);
  private readonly clock = inject(ClockService);
  private readonly toast = inject(ToastService);

  protected readonly goals = signal<SavingsGoal[]>([]);
  protected readonly roundUp = signal<RoundUpSummary | null>(null);
  protected readonly history = signal<RoundUpEntry[]>([]);

  protected readonly loading = signal(true);
  protected readonly error = signal(false);
  protected readonly boosted = signal(false);
  protected readonly roundUpsEnabled = signal(true);

  protected readonly primary = computed(
    () => this.goals().find((goal) => goal.primary) ?? null,
  );
  protected readonly nextGoal = computed(
    () => this.goals().find((goal) => !goal.primary) ?? null,
  );
  protected readonly primaryPercent = computed(() => this.percent(this.primary()));
  protected readonly nextPercent = computed(() => this.percent(this.nextGoal()));

  protected readonly chartStart = computed(() => {
    const now = this.clock.now();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return dayMonth(firstOfMonth.toISOString());
  });

  /** `Jul 2026` — target-date label of a goal. */
  protected readonly targetLabel = monthYear;

  constructor() {
    this.loadGoals();
    this.loadRoundUps();
  }

  protected reload(): void {
    this.loadGoals();
    this.loadRoundUps();
  }

  protected money(value: number, decimals = 2): string {
    return `$${value.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}`;
  }

  protected entryText(entry: RoundUpEntry): string {
    return `${this.money(entry.paid)} rounded to ${this.money(entry.roundedTo, 0)}`;
  }

  protected entryAmount(entry: RoundUpEntry): string {
    return `+${this.money(entry.savedAmount)}`;
  }

  protected entryTime(entry: RoundUpEntry): string {
    return relativeTime(entry.occurredAt, this.clock.now());
  }

  protected boost(goal: SavingsGoal): void {
    this.savings.contribute(goal.id, { amount: 50 }).subscribe({
      next: (updated) => {
        this.goals.update((list) =>
          list.map((entry) => (entry.id === updated.id ? updated : entry)),
        );
        this.boosted.set(true);
        this.toast.success(`Added $50 to ${updated.name}.`);
      },
      error: () => this.toast.error('We couldn’t add to that goal.'),
    });
  }

  private percent(goal: SavingsGoal | null): number {
    if (!goal || goal.targetAmount <= 0) {
      return 0;
    }
    return Math.round((goal.savedAmount / goal.targetAmount) * 100);
  }

  private loadGoals(): void {
    this.loading.set(true);
    this.error.set(false);
    this.savings.goals().subscribe({
      next: (list) => {
        this.goals.set(list);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }

  private loadRoundUps(): void {
    this.savings.roundUpSummary().subscribe({
      next: (value) => this.roundUp.set(value),
      error: () => this.roundUp.set(null),
    });

    this.savings.roundUpHistory().subscribe({
      next: (value) => this.history.set(value),
      error: () => this.history.set([]),
    });
  }
}
