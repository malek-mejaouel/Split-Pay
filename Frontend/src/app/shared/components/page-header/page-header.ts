import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Page title block: eyebrow, title, subtitle, and projected actions.
 *
 * ```html
 * <app-page-header eyebrow="SHARED SPACES" title="Your households" subtitle="…">
 *   <button appButton icon="plus">New household</button>
 * </app-page-header>
 * ```
 */
@Component({
  selector: 'app-page-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div>
      @if (eyebrow(); as eyebrowText) {
        <span class="eyebrow">{{ eyebrowText }}</span>
      }
      <h1>{{ title() }}</h1>
      <p>{{ subtitle() }}</p>
    </div>
    <div class="page-actions">
      <ng-content />
    </div>
  `,
  host: { '[class.page-header]': 'true' },
})
export class AppPageHeaderComponent {
  readonly eyebrow = input<string | null>(null);
  readonly title = input.required<string>();
  readonly subtitle = input('');
}
