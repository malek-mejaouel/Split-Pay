import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { GroupApiService } from '@app/core/api/group-api.service';
import type { GroupAccent, GroupSummary } from '@app/models';
import { AppAvatarStackComponent } from '@app/shared/components/avatar-stack/avatar-stack';
import { AppButtonComponent } from '@app/shared/components/button/button';
import { AppCardComponent } from '@app/shared/components/card/card';
import { AppEmptyStateComponent } from '@app/shared/components/empty-state/empty-state';
import { AppErrorStateComponent } from '@app/shared/components/error-state/error-state';
import { IconComponent } from '@app/shared/components/icon/icon';
import { AppPageHeaderComponent } from '@app/shared/components/page-header/page-header';
import { AppSkeletonComponent } from '@app/shared/components/skeleton/skeleton';
import { AppTagComponent } from '@app/shared/components/tag/tag';

interface HouseholdTileView {
  id: string;
  emoji: string;
  name: string;
  members: string;
  balanceLabel: string;
  balanceValue: string;
  accent: GroupAccent;
  count: number;
}

/**
 * Households list ("Households" of the Figma export).
 *
 * The three hardcoded tiles of the React reference are now driven by
 * `GroupApiService.list()`, so each card links to its real `GroupSummary.id`.
 */
@Component({
  selector: 'app-households-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    IconComponent,
    AppButtonComponent,
    AppCardComponent,
    AppTagComponent,
    AppAvatarStackComponent,
    AppPageHeaderComponent,
    AppSkeletonComponent,
    AppEmptyStateComponent,
    AppErrorStateComponent,
  ],
  template: `
    <app-page-header
      eyebrow="SHARED SPACES"
      title="Your households"
      subtitle="Every home, trip, and friend group in one place."
    >
      <button appButton variant="secondary">Join with code</button>
      <button appButton icon="plus">New household</button>
    </app-page-header>

    @if (loading()) {
      <app-skeleton />
    } @else if (error()) {
      <app-error-state
        title="Couldn’t load your households"
        message="Your balance is safe. Try again."
        (retried)="load()"
      />
    } @else if (tiles().length === 0) {
      <app-empty-state
        emoji="🏡"
        title="No households yet"
        message="Create your first shared space to start splitting."
      />
    } @else {
      <div class="household-grid">
        @for (tile of tiles(); track tile.id) {
          <section
            appCard
            [class]="'household-tile accent-' + tile.accent"
            [routerLink]="['/households', tile.id]"
          >
            <div class="tile-art">
              <span>{{ tile.emoji }}</span>
              <button type="button"><app-icon name="more" /></button>
            </div>
            <h2>{{ tile.name }}</h2>
            <p>{{ tile.members }}</p>
            <app-avatar-stack [count]="tile.count" />
            <div class="tile-balance">
              <span>{{ tile.balanceLabel }}</span>
              <strong>{{ tile.balanceValue }}</strong>
              <app-icon name="chevron" />
            </div>
          </section>
        }

        <section appCard class="create-house" routerLink="/households">
          <span class="create-icon"><app-icon name="plus" /></span>
          <h2>Create a new household</h2>
          <p>Split rent, trips, or Tuesday tacos.</p>
          <button appButton variant="secondary">Get started</button>
        </section>
      </div>

      <section appCard class="invite-banner">
        <div class="invite-illustration">
          <span>✦</span>
          <span>⌁</span>
          <b>SP-8K4M</b>
        </div>
        <div>
          <span appTag tone="amber">INVITE READY</span>
          <h2>Room for one more?</h2>
          <p>Share your Maple House invite code with a roommate.</p>
        </div>
        <button appButton variant="secondary">Copy invite code</button>
      </section>
    }
  `,
})
export class HouseholdsPage {
  private readonly groupApi = inject(GroupApiService);

  protected readonly loading = signal(true);
  protected readonly error = signal(false);
  private readonly groups = signal<GroupSummary[]>([]);

  protected readonly tiles = computed<HouseholdTileView[]>(() =>
    this.groups().map((group) => ({
      id: group.id,
      emoji: group.emoji,
      name: group.name,
      members: `${group.memberCount} members`,
      balanceLabel: this.netLabel(group.yourNetBalance),
      balanceValue: this.money(Math.abs(group.yourNetBalance)),
      accent: group.accent,
      count: group.memberCount,
    })),
  );

  constructor() {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set(false);
    this.groupApi.list().subscribe({
      next: (groups) => {
        this.groups.set(groups);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }

  private money(value: number): string {
    return `$${value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  private netLabel(net: number): string {
    if (net > 0) {
      return 'You’re owed';
    }
    if (net < 0) {
      return 'You owe';
    }
    return 'All settled';
  }
}
