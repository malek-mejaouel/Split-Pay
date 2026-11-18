import { ChangeDetectionStrategy, Component, model } from '@angular/core';

/**
 * Toggle switch.
 *
 * Two-way bindable: `<button appSwitch [(checked)]="darkMode" />`
 */
@Component({
  selector: 'button[appSwitch]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<span></span>',
  host: {
    '[class.switch]': 'true',
    '[class.on]': 'checked()',
    'aria-label': 'Toggle setting',
    '[attr.aria-pressed]': 'checked()',
    '(click)': 'toggle()',
  },
})
export class AppSwitchComponent {
  readonly checked = model(false);

  protected toggle(): void {
    this.checked.update((value) => !value);
  }
}
