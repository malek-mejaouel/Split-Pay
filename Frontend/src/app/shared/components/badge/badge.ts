import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Small count chip — the design's `<b>` counter sitting next to a nav item or a
 * tab label.
 *
 * The host element *is* the `<b>`, so the contextual styles of the design
 * (`.sidebar nav button b`, `.tabs button b`) keep applying unchanged and the
 * visual result is identical to the Figma/React export.
 *
 * ```html
 * <b appBadge>3</b>
 * ```
 */
@Component({
  selector: 'b[appBadge]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content />',
  host: { '[class.badge]': 'true' },
})
export class AppBadgeComponent {}
