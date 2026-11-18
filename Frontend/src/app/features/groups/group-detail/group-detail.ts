import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { GroupApiService } from '@app/core/api/group-api.service';
import { SettlementApiService } from '@app/core/api/settlement-api.service';
import { ClockService } from '@app/core/services/clock.service';
import { UiModalService } from '@app/core/services/ui-modal.service';
import type {
  AvatarColor,
  Group,
  SettlementSuggestion,
  TimelineEntry,
} from '@app/models';
import { AppActivityItemComponent } from '@app/shared/components/activity-item/activity-item';
import { AppAvatarComponent } from '@app/shared/components/avatar/avatar';
import { AppButtonComponent } from '@app/shared/components/button/button';
import { AppCardComponent } from '@app/shared/components/card/card';
import { AppDateLabelComponent } from '@app/shared/components/date-label/date-label';
import { AppErrorStateComponent } from '@app/shared/components/error-state/error-state';
import { IconComponent } from '@app/shared/components/icon/icon';
import { AppSkeletonComponent } from '@app/shared/components/skeleton/skeleton';
import { DEMO_PEOPLE } from '@app/shared/constants/demo-people';
import { clockTime, dayLabel, monthYear, upperMonthYear } from '@app/shared/utils/date-format';

interface TimelineEntryView {
  id: string;
  emoji: string;
  title: string;
  text: string;
  amount: string;
  tone: 'positive' | 'negative' | 'neutral';
  time: string;
}

interface TimelineDayView {
  label: string;
  entries: TimelineEntryView[];
}

interface MemberView {
  userId: string;
  initials: string;
  color: AvatarColor;
  name: string;
  caption: string;
  amount: string;
  tone: 'positive' | 'negative';
}

interface AvatarView {
  initials: string;
  color: AvatarColor;
}

interface PayPathView {
  id: string;
  from: AvatarView;
  fromName: string;
  to: AvatarView;
  amount: string;
}

/**
 * One household ("GroupDetail" of the Figma export), served by the
 * `/households/:id` route.
 *
 * The route param is bound to the required `id` input (`withComponentInputBinding`),
 * and an `effect()` reloads the group, its timeline and the "smart settle"
 * suggestions whenever it changes.
 */
@Component({
  selector: 'app-group-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    IconComponent,
    AppButtonComponent,
    AppCardComponent,
    AppAvatarComponent,
    AppDateLabelComponent,
    AppActivityItemComponent,
    AppSkeletonComponent,
    AppErrorStateComponent,
  ],
  template: `
    @if (loading()) {
      <app-skeleton />
    } @else if (error()) {
      <app-error-state
        title="Couldn’t load this household"
        message="Your balance is safe. Try again."
        (retried)="load(id())"
      />
    } @else {
      @if (group(); as group) {
        <div class="group-hero">
          <div class="group-title">
            <div class="group-emoji">{{ group.emoji }}</div>
            <div>
              <span class="breadcrumb" routerLink="/households">
                Households / {{ group.name }}
              </span>
              <h1>{{ group.name }}</h1>
              <p>{{ heroSubtitle() }}</p>
            </div>
          </div>
          <div class="page-actions">
            <button appButton variant="secondary" icon="send" (click)="modals.openSettle()">
              Settle up
            </button>
            <button appButton icon="plus" (click)="modals.openExpense()">Add expense</button>
          </div>
        </div>

        <div class="member-balances">
          @for (member of memberViews(); track member.userId) {
            <section appCard class="member-card">
              <app-avatar [initials]="member.initials" [color]="member.color" />
              <div>
                <strong>{{ member.name }}</strong>
                <span>{{ member.caption }}</span>
              </div>
              <b [class.positive]="member.tone === 'positive'" [class.negative]="member.tone === 'negative'">
                {{ member.amount }}
              </b>
            </section>
          }
        </div>

        <div class="group-grid">
          <section appCard class="group-timeline">
            <div class="card-heading">
              <div>
                <span>{{ monthHeading }}</span>
                <h2>Expense timeline</h2>
              </div>
              <button type="button" class="filter-button">
                <app-icon name="filter" /> Filter
              </button>
            </div>
            @for (day of timelineDays(); track day.label) {
              <app-date-label [label]="day.label" />
              @for (entry of day.entries; track entry.id) {
                <app-activity-item
                  [emoji]="entry.emoji"
                  [title]="entry.title"
                  [text]="entry.text"
                  [amount]="entry.amount"
                  [tone]="entry.tone"
                  [time]="entry.time"
                />
              }
            }
          </section>

          <div class="side-stack">
            <section appCard class="settlement-map">
              <div class="card-heading">
                <div>
                  <span>SMART SETTLE</span>
                  <h2>Who owes whom</h2>
                </div>
              </div>
              <p>{{ payPaths().length }} payments settle everyone up.</p>
              @for (path of payPaths(); track path.id) {
                <div class="pay-path">
                  <app-avatar [initials]="path.from.initials" [color]="path.from.color" size="sm" />
                  <span>
                    <b>{{ path.fromName }}</b>
                    <small>pays</small>
                  </span>
                  <div>
                    <i></i>
                    {{ path.amount }}
                    <i></i>
                  </div>
                  <app-avatar [initials]="path.to.initials" [color]="path.to.color" size="sm" />
                </div>
              }
              <button appButton class="full" (click)="modals.openSettle()">
                Review settlements
              </button>
            </section>

            <section appCard class="group-note">
              <span>💡</span>
              <div>
                <strong>House tip</strong>
                <p>You spent 14% less on utilities than last month.</p>
              </div>
            </section>
          </div>
        </div>
      }
    }
  `,
})
export class GroupDetailPage {
  /** Bound from the `/households/:id` route (component input binding). */
  readonly id = input.required<string>();

  private readonly groupApi = inject(GroupApiService);
  private readonly settlementApi = inject(SettlementApiService);
  private readonly clock = inject(ClockService);
  protected readonly modals = inject(UiModalService);

  protected readonly now = this.clock.now();
  protected readonly monthHeading = upperMonthYear(this.now.toISOString());

  protected readonly loading = signal(true);
  protected readonly error = signal(false);
  protected readonly group = signal<Group | null>(null);
  private readonly timeline = signal<TimelineEntry[]>([]);
  private readonly suggestions = signal<SettlementSuggestion[]>([]);

  protected readonly heroSubtitle = computed(() => {
    const group = this.group();
    if (!group) {
      return '';
    }
    const parts: string[] = [];
    if (group.address) {
      parts.push(group.address);
    }
    if (group.since) {
      parts.push(`Since ${monthYear(group.since)}`);
    }
    return parts.join(' · ');
  });

  protected readonly memberViews = computed<MemberView[]>(() => {
    const group = this.group();
    if (!group) {
      return [];
    }
    return group.balances.map((balance) => ({
      userId: balance.userId,
      initials: balance.initials,
      color: balance.avatarColor,
      name: balance.you ? 'You' : balance.fullName,
      caption: balance.netAmount >= 0 ? 'gets back' : 'owes',
      amount: this.signed(balance.netAmount),
      tone: balance.netAmount >= 0 ? 'positive' : 'negative',
    }));
  });

  protected readonly timelineDays = computed<TimelineDayView[]>(() => {
    const now = this.now;
    const days: TimelineDayView[] = [];
    for (const entry of this.timeline()) {
      const label = dayLabel(entry.occurredAt, now);
      let day = days.length > 0 ? days[days.length - 1] : undefined;
      if (!day || day.label !== label) {
        day = { label, entries: [] };
        days.push(day);
      }
      day.entries.push(this.toTimelineEntryView(entry));
    }
    return days;
  });

  protected readonly payPaths = computed<PayPathView[]>(() => {
    const group = this.group();
    return this.suggestions().map((suggestion) => ({
      id: suggestion.id,
      from: this.person(group, suggestion.fromUserId, suggestion.fromInitials),
      fromName: suggestion.fromName,
      to: this.person(group, suggestion.toUserId, suggestion.toInitials),
      amount: this.money(suggestion.amount),
    }));
  });

  constructor() {
    effect(() => {
      const id = this.id();
      this.load(id);
    });
  }

  protected load(id: string): void {
    this.loading.set(true);
    this.error.set(false);
    forkJoin({
      group: this.groupApi.get(id),
      timeline: this.groupApi.timeline(id),
      suggestions: this.settlementApi.suggestions(id),
    }).subscribe({
      next: (result) => {
        this.group.set(result.group);
        this.timeline.set(result.timeline);
        this.suggestions.set(result.suggestions);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }

  private toTimelineEntryView(entry: TimelineEntry): TimelineEntryView {
    return {
      id: entry.id,
      emoji: entry.emoji,
      title: entry.title,
      text: entry.note,
      amount: entry.detail ?? this.signed(entry.amount),
      tone: entry.tone,
      time: clockTime(entry.occurredAt),
    };
  }

  private person(group: Group | null, userId: string, fallbackInitials: string): AvatarView {
    const member = group?.members.find((item) => item.userId === userId);
    if (member) {
      return { initials: member.initials, color: member.avatarColor };
    }
    const demo = DEMO_PEOPLE.find((item) => item.initials === fallbackInitials);
    if (demo) {
      return { initials: demo.initials, color: demo.avatarColor };
    }
    return { initials: fallbackInitials, color: 'lavender' };
  }

  private money(value: number): string {
    return `$${value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  private signed(value: number | null): string {
    if (value === null) {
      return '';
    }
    const sign = value < 0 ? '\u2212' : '+';
    return `${sign}${this.money(Math.abs(value))}`;
  }
}
