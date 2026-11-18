import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Native `<input>` enriched with the design's error state.
 *
 * The host element *is* the input, so `formControlName`, `type`,
 * `autocomplete`, `placeholder`… keep working exactly as in the JSX version.
 * The `invalid` flag simply toggles the `.input-error` class the design already
 * styles (`.auth-card .input-error`).
 *
 * ```html
 * <input appInput formControlName="email" [invalid]="invalid('email')" />
 * ```
 */
@Component({
  selector: 'input[appInput]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '',
  host: {
    '[class.input]': 'true',
    '[class.input-error]': 'invalid()',
  },
})
export class AppInputComponent {
  readonly invalid = input(false);
}
