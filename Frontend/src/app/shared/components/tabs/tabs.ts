import { ChangeDetectionStrategy, Component, model, input } from '@angular/core';

import { AppBadgeComponent } from '../badge/badge';

export interface TabItem<T extends string = string> {
  id: T;
  label: string;
  /** Optional counter rendered as `<b>` next to the label. */
  badge?: number;
}

/**
 * Segmented tabs, driven by the `.tabs` styles of the design.
 *
 * ```html
 * <app-tabs [items]="tabs" [(active)]="filter" />
 * ```
 */
@Component({
  selector: 'app-tabs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AppBadgeComponent],
  template: `
    @for (item of items(); track item.id) {
      <button
        type="button"
        [class.active]="item.id === active()"
        (click)="active.set(item.id)"
      >
        {{ item.label }}
        @if (item.badge !== undefined && item.badge > 0) {
          <b appBadge>{{ item.badge }}</b>
        }
      </button>
    }
  `,
  host: { '[class.tabs]': 'true' },
})
export class AppTabsComponent<T extends string = string> {
  readonly items = input.required<readonly TabItem<T>[]>();
  readonly active = model.required<T>();
}
