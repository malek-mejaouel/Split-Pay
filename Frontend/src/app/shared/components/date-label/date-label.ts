import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Day separator inside the group timeline (`TODAY`, `YESTERDAY`, `MAR 14`).
 */
@Component({
  selector: 'app-date-label',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span>{{ label() }}</span>
    <i></i>
  `,
  host: { '[class.date-label]': 'true' },
})
export class AppDateLabelComponent {
  readonly label = input.required<string>();
}
