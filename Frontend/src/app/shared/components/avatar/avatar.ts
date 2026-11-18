import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import type { AvatarColor, AvatarSize } from '../../../models';

/**
 * Initials avatar.
 *
 * The host element carries the `.avatar` classes so sibling rules such as
 * `.avatar-stack .avatar + .avatar` keep working.
 *
 * ```html
 * <app-avatar initials="MP" color="lavender" size="sm" [status]="true" />
 * ```
 */
@Component({
  selector: 'app-avatar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    {{ initials() }}
    @if (status()) {
      <i></i>
    }
  `,
  host: {
    '[class.avatar]': 'true',
    '[class.avatar-sm]': 'size() === "sm"',
    '[class.avatar-md]': 'size() === "md"',
    '[class.avatar-lg]': 'size() === "lg"',
    '[class.avatar-lavender]': 'color() === "lavender"',
    '[class.avatar-mint]': 'color() === "mint"',
    '[class.avatar-coral]': 'color() === "coral"',
    '[class.avatar-blue]': 'color() === "blue"',
  },
})
export class AppAvatarComponent {
  readonly initials = input('?');
  readonly color = input<AvatarColor>('lavender');
  readonly size = input<AvatarSize>('md');
  /** Shows the little green "online" dot. */
  readonly status = input(false);
}
