import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

/**
 * Backdrop + dialog box. Content is projected, so each feature keeps its own
 * header / footer markup.
 *
 * ```html
 * <app-modal modalClass="success-modal" (closed)="close()">…</app-modal>
 * ```
 */
@Component({
  selector: 'app-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [class]="boxClasses()" (mousedown)="$event.stopPropagation()">
      <ng-content />
    </div>
  `,
  host: {
    '[class.modal-backdrop]': 'true',
    '(mousedown)': 'onBackdrop()',
  },
})
export class AppModalComponent {
  /** Extra class for the dialog box, e.g. `success-modal`. */
  readonly modalClass = input('');
  /** `false` for the success screen, which has no close affordance. */
  readonly dismissible = input(true);

  /** Emitted when the user clicks outside the dialog. */
  readonly closed = output<void>();

  protected readonly boxClasses = computed(() => {
    const extra = this.modalClass();
    return extra.length > 0 ? `modal ${extra}` : 'modal';
  });

  protected onBackdrop(): void {
    if (this.dismissible()) {
      this.closed.emit();
    }
  }
}
