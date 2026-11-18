import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { ToastService, type ToastTone } from '../../../core/services/toast.service';
import { IconComponent, type IconName } from '../icon/icon';

const ICONS: Record<ToastTone, IconName> = {
  success: 'check',
  error: 'close',
  info: 'bell',
};

/**
 * Renders the global toast stack fed by `ToastService` (see the error
 * interceptor). Mounted once, in the app shell.
 */
@Component({
  selector: 'app-toast-container',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    @for (toast of toasts.toasts(); track toast.id) {
      <div [class]="'toast toast-' + toast.tone" role="status">
        <app-icon [name]="iconFor(toast.tone)" [size]="17" />
        <p>{{ toast.message }}</p>
        <button type="button" aria-label="Dismiss" (click)="toasts.dismiss(toast.id)">
          <app-icon name="close" [size]="14" />
        </button>
      </div>
    }
  `,
  host: { class: 'toast-stack' },
})
export class AppToastContainerComponent {
  protected readonly toasts = inject(ToastService);

  protected iconFor(tone: ToastTone): IconName {
    return ICONS[tone];
  }
}
