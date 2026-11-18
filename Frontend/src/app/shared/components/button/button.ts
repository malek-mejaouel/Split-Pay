import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { IconComponent, type IconName } from '../icon/icon';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

/**
 * `<button>` enriched with the design's variants.
 *
 * The host element *is* the button, so native `(click)`, `[disabled]` and
 * `class="full"` keep working exactly as in the JSX version.
 *
 * ```html
 * <button appButton variant="secondary" icon="send" (click)="settle()">Settle up</button>
 * ```
 */
@Component({
  selector: 'button[appButton]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    @if (icon(); as iconName) {
      <app-icon [name]="iconName" [size]="18" />
    }
    <ng-content />
  `,
  host: {
    '[class.button]': 'true',
    '[class.button-primary]': 'variant() === "primary"',
    '[class.button-secondary]': 'variant() === "secondary"',
    '[class.button-ghost]': 'variant() === "ghost"',
    '[class.button-danger]': 'variant() === "danger"',
    '[attr.type]': 'type()',
    '[disabled]': 'disabled()',
  },
})
export class AppButtonComponent {
  readonly variant = input<ButtonVariant>('primary');
  readonly icon = input<IconName | null>(null);
  readonly disabled = input(false);
  readonly type = input<'button' | 'submit'>('button');
}
