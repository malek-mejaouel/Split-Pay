import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type TagTone = 'neutral' | 'green' | 'coral' | 'violet' | 'amber';

/**
 * Small status pill.
 *
 * ```html
 * <span appTag tone="green">PAID</span>
 * ```
 */
@Component({
  selector: 'span[appTag]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content />',
  host: {
    '[class.tag]': 'true',
    '[class.tag-neutral]': 'tone() === "neutral"',
    '[class.tag-green]': 'tone() === "green"',
    '[class.tag-coral]': 'tone() === "coral"',
    '[class.tag-violet]': 'tone() === "violet"',
    '[class.tag-amber]': 'tone() === "amber"',
  },
})
export class AppTagComponent {
  readonly tone = input<TagTone>('neutral');
}
