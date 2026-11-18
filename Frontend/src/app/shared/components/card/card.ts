import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Surface container of the design system.
 *
 * ```html
 * <section appCard class="balance-card">…</section>
 * ```
 *
 * The host is a real `<section class="card">`, so grid rules such as
 * `.dashboard-grid > .card` keep matching.
 */
@Component({
  selector: 'section[appCard]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content />',
  host: { '[class.card]': 'true' },
})
export class AppCardComponent {}
