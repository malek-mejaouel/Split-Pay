import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/**
 * Conic-gradient progress ring used for goal funding.
 *
 * The host element carries `.progress-ring`, and the percentage is pushed to
 * the CSS custom property `--progress` that the gradient reads.
 */
@Component({
  selector: 'app-progress-ring',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div>
      <strong>{{ value() }}%</strong>
      <span>{{ label() }}</span>
    </div>
  `,
  host: {
    '[class.progress-ring]': 'true',
    '[class.small]': 'small()',
    '[style.--progress]': 'progress()',
  },
})
export class AppProgressRingComponent {
  /** Percentage, 0–100. */
  readonly value = input.required<number>();
  readonly label = input('');
  readonly small = input(false);

  protected readonly progress = computed(() => `${this.value() * 3.6}deg`);
}
