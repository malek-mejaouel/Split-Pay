import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { DEMO_PEOPLE, type AvatarPerson } from '../../constants/demo-people';
import { AppAvatarComponent } from '../avatar/avatar';

/**
 * Overlapping avatars, with a `+n` bubble when the group is larger than four.
 *
 * ```html
 * <app-avatar-stack [count]="3" />                       <!-- decorative -->
 * <app-avatar-stack [members]="group().members" [count]="group().members.length" />
 * ```
 */
@Component({
  selector: 'app-avatar-stack',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AppAvatarComponent],
  template: `
    @for (person of visible(); track $index) {
      <app-avatar [initials]="person.initials" [color]="person.avatarColor" size="sm" />
    }
    @if (extra() > 0) {
      <span class="avatar avatar-sm avatar-more">+{{ extra() }}</span>
    }
  `,
  host: { '[class.avatar-stack]': 'true' },
})
export class AppAvatarStackComponent {
  readonly members = input<readonly AvatarPerson[]>(DEMO_PEOPLE);
  readonly count = input(4);

  /** At most four individual avatars are drawn, like the original design. */
  protected readonly visible = computed(() => this.members().slice(0, Math.min(this.count(), 4)));

  protected readonly extra = computed(() => Math.max(0, this.count() - 4));
}
