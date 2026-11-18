import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { AppButtonComponent } from '../button/button';

/**
 * "Nothing to split yet" state, with an optional call to action.
 */
@Component({
  selector: 'app-empty-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AppButtonComponent],
  template: `
    <span>{{ emoji() }}</span>
    <strong>{{ title() }}</strong>
    <p>{{ message() }}</p>
    @if (actionLabel(); as label) {
      <button appButton variant="secondary" (click)="actioned.emit()">{{ label }}</button>
    }
  `,
  host: { '[class.empty-mini]': 'true' },
})
export class AppEmptyStateComponent {
  readonly emoji = input('🪁');
  readonly title = input('Nothing here yet');
  readonly message = input('');
  readonly actionLabel = input<string | null>(null);

  readonly actioned = output<void>();
}
