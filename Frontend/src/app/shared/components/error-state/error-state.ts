import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { AppButtonComponent } from '../button/button';

/**
 * Failure state that keeps the tone reassuring ("your balance is safe").
 */
@Component({
  selector: 'app-error-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AppButtonComponent],
  template: `
    <span>!</span>
    <strong>{{ title() }}</strong>
    <p>{{ message() }}</p>
    @if (retryable()) {
      <button appButton variant="secondary" (click)="retried.emit()">Try again</button>
    }
  `,
  host: { '[class.error-mini]': 'true' },
})
export class AppErrorStateComponent {
  readonly title = input('That didn’t go through');
  readonly message = input('Your balance is safe. Try again.');
  readonly retryable = input(true);

  readonly retried = output<void>();
}
