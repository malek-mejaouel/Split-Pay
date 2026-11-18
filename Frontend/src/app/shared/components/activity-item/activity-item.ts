import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { IconComponent } from '../icon/icon';

export type ActivityTone = 'positive' | 'negative' | 'neutral';

/**
 * One row of an activity feed (dashboard, timeline, wallet, round-ups).
 */
@Component({
  selector: 'app-activity-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    <span class="category-icon">{{ emoji() }}</span>
    <div class="activity-copy">
      <strong>{{ title() }}</strong>
      <span>{{ text() }} · {{ time() }}</span>
    </div>
    @if (amount(); as amountText) {
      <b [class]="tone()">{{ amountText }}</b>
    }
    <button type="button" class="row-arrow" aria-label="Open details">
      <app-icon name="chevron" [size]="17" />
    </button>
  `,
  host: { '[class.activity-item]': 'true' },
})
export class AppActivityItemComponent {
  readonly emoji = input.required<string>();
  readonly title = input.required<string>();
  readonly text = input('');
  readonly amount = input<string | null>(null);
  readonly tone = input<ActivityTone>('neutral');
  readonly time = input('');
}
