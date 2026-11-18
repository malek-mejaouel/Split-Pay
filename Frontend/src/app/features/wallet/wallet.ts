import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';

import { WalletApiService } from '@app/core/api/wallet-api.service';
import { ClockService } from '@app/core/services/clock.service';
import type { WalletFilter, WalletSummary, WalletTransaction } from '@app/models';
import {
  AppActivityItemComponent,
  type ActivityTone,
} from '@app/shared/components/activity-item/activity-item';
import { AppButtonComponent } from '@app/shared/components/button/button';
import { AppCardComponent } from '@app/shared/components/card/card';
import { AppEmptyStateComponent } from '@app/shared/components/empty-state/empty-state';
import { AppErrorStateComponent } from '@app/shared/components/error-state/error-state';
import { IconComponent } from '@app/shared/components/icon/icon';
import { AppPageHeaderComponent } from '@app/shared/components/page-header/page-header';
import { AppSkeletonComponent } from '@app/shared/components/skeleton/skeleton';
import { AppTabsComponent, type TabItem } from '@app/shared/components/tabs/tabs';
import { relativeTime } from '@app/shared/utils/date-format';

/**
 * Wallet — hero balance, money in / out stats and the filterable activity feed.
 *
 * Ports the React `Wallet` screen. The segmented filter is now `AppTabsComponent`,
 * and the transaction list reloads through an `effect()` whenever it changes.
 */
@Component({
  selector: 'app-wallet-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AppPageHeaderComponent,
    AppCardComponent,
    AppButtonComponent,
    IconComponent,
    AppTabsComponent,
    AppActivityItemComponent,
    AppSkeletonComponent,
    AppErrorStateComponent,
    AppEmptyStateComponent,
  ],
  template: `
    <app-page-header
      eyebrow="MONEY, READY WHEN YOU ARE"
      title="Your wallet"
      subtitle="Top up, transfer, and settle in seconds."
    >
      <button appButton icon="plus">Top up wallet</button>
    </app-page-header>

    @if (summary(); as s) {
      <div class="wallet-grid">
        <section appCard class="wallet-hero">
          <span>AVAILABLE BALANCE</span>
          <div class="balance-number">
            <sup>$</sup>{{ balanceWhole() }}<span>{{ balanceCents() }}</span>
          </div>
          <p>•••• {{ s.cardLast4 }} <span>SplitPay virtual card</span></p>
          <div>
            <button appButton variant="secondary" icon="arrowDown">
              Top up
            </button>
            <button appButton variant="secondary" icon="send">
              Transfer
            </button>
          </div>
          <div class="wallet-wave"></div>
        </section>

        <section appCard class="wallet-stat">
          <span class="stat-icon green">
            <app-icon name="arrowDown" />
          </span>
          <div>
            <span>Money in</span>
            <strong>{{ money(s.moneyIn) }}</strong>
            <small>{{ moneyInNote(s.monthlyDelta) }}</small>
          </div>
        </section>

        <section appCard class="wallet-stat">
          <span class="stat-icon coral">
            <app-icon name="arrowUp" />
          </span>
          <div>
            <span>Money out</span>
            <strong>{{ money(s.moneyOut) }}</strong>
            <small>{{ s.transactionCount }} transactions</small>
          </div>
        </section>

        <section appCard class="transactions">
          <div class="card-heading">
            <div>
              <span>WALLET ACTIVITY</span>
              <h2>Transactions</h2>
            </div>
            <button type="button">
              <app-icon name="filter" />
              Filters
            </button>
          </div>

          <app-tabs [items]="tabs" [(active)]="filter" />

          @if (listLoading()) {
            <app-skeleton />
          } @else if (listError()) {
            <app-error-state
              title="We couldn’t load your transactions"
              message="Your balance is safe. Try again."
              [retryable]="true"
              (retried)="reload()"
            />
          } @else if (transactions().length === 0) {
            <app-empty-state
              emoji="🧾"
              title="No transactions yet"
              message="Money in and out will show up here."
            />
          } @else {
            @for (tx of transactions(); track tx.id) {
              <app-activity-item
                [emoji]="tx.emoji"
                [title]="tx.title"
                [text]="tx.subtitle"
                [amount]="txAmount(tx)"
                [tone]="txTone(tx)"
                [time]="txTime(tx)"
              />
            }
          }
        </section>
      </div>
    } @else if (loading()) {
      <app-skeleton />
    } @else if (error()) {
      <app-error-state
        title="We couldn’t load your wallet"
        message="Your balance is safe. Try again."
        [retryable]="true"
        (retried)="reload()"
      />
    }
  `,
})
export class WalletPage {
  private readonly wallet = inject(WalletApiService);
  private readonly clock = inject(ClockService);

  protected readonly tabs: readonly TabItem<WalletFilter>[] = [
    { id: 'all', label: 'All' },
    { id: 'in', label: 'Money in' },
    { id: 'out', label: 'Money out' },
  ];

  protected readonly filter = signal<WalletFilter>('all');

  protected readonly summary = signal<WalletSummary | null>(null);
  protected readonly transactions = signal<WalletTransaction[]>([]);

  protected readonly loading = signal(true);
  protected readonly error = signal(false);
  protected readonly listLoading = signal(true);
  protected readonly listError = signal(false);

  protected readonly balanceWhole = computed(() => {
    const value = this.summary()?.balance ?? 0;
    return Math.floor(value).toLocaleString('en-US');
  });

  protected readonly balanceCents = computed(() => {
    const value = this.summary()?.balance ?? 0;
    const cents = Math.round((value - Math.floor(value)) * 100);
    return `.${cents.toString().padStart(2, '0')}`;
  });

  constructor() {
    this.loadSummary();

    effect(() => {
      const filter = this.filter();
      this.loadTransactions(filter);
    });
  }

  protected reload(): void {
    this.loadSummary();
    this.loadTransactions(this.filter());
  }

  protected money(value: number, decimals = 2): string {
    return `$${value.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}`;
  }

  protected moneyInNote(delta: number): string {
    return `+${this.money(delta, 0)} this month`;
  }

  protected txAmount(tx: WalletTransaction): string {
    const sign = tx.direction === 'in' ? '+' : '−';
    return `${sign}${this.money(tx.amount)}`;
  }

  protected txTone(tx: WalletTransaction): ActivityTone {
    return tx.direction === 'in' ? 'positive' : 'negative';
  }

  protected txTime(tx: WalletTransaction): string {
    return relativeTime(tx.occurredAt, this.clock.now());
  }

  private loadSummary(): void {
    this.loading.set(true);
    this.error.set(false);
    this.wallet.summary().subscribe({
      next: (value) => {
        this.summary.set(value);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }

  private loadTransactions(filter: WalletFilter): void {
    this.listLoading.set(true);
    this.listError.set(false);
    this.wallet.transactions(filter).subscribe({
      next: (items) => {
        this.transactions.set(items);
        this.listLoading.set(false);
      },
      error: () => {
        this.listError.set(true);
        this.listLoading.set(false);
      },
    });
  }
}
