import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Loading placeholder matching `.skeleton-card` of the design system.
 *
 * ```html
 * @if (loading()) { <app-skeleton /> } @else { … }
 * ```
 */
@Component({
  selector: 'app-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @for (line of lines; track $index) {
      <i></i>
    }
  `,
  host: { '[class.skeleton-card]': 'true' },
})
export class AppSkeletonComponent {
  /** Three shimmering bars, exactly like the "Product states" specimen. */
  protected readonly lines = [0, 1, 2];
}
