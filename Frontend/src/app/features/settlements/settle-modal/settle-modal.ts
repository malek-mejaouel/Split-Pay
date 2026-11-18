import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';

import { SettlementApiService } from '@app/core/api/settlement-api.service';
import { ToastService } from '@app/core/services/toast.service';
import { UiModalService } from '@app/core/services/ui-modal.service';
import type { CreateSettlementRequest } from '@app/models';
import { AppAvatarComponent } from '@app/shared/components/avatar/avatar';
import { AppButtonComponent } from '@app/shared/components/button/button';
import { IconComponent } from '@app/shared/components/icon/icon';
import { AppModalComponent } from '@app/shared/components/modal/modal';
import { AppTagComponent } from '@app/shared/components/tag/tag';
import { DEMO_PEOPLE } from '@app/shared/constants/demo-people';

/**
 * "Settle up" overlay — a confirmation step that swaps for a confetti success
 * screen once the (mock) payment went through.
 *
 * Ported from the React `SettleModal`; the `done` state is a signal and the
 * modal closes itself through `UiModalService`.
 */
@Component({
  selector: 'app-settle-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AppModalComponent,
    AppButtonComponent,
    AppAvatarComponent,
    IconComponent,
    AppTagComponent,
  ],
  template: `
    @if (done()) {
      <app-modal modalClass="success-modal" [dismissible]="false">
        <div class="confetti">
          <i></i>
          <i></i>
          <i></i>
          <i></i>
          <i></i>
          <i></i>
        </div>
        <div class="success-icon">
          <app-icon name="check" [size]="34" />
        </div>
        <span appTag tone="green">PAYMENT COMPLETE</span>
        <h2>You're all settled!</h2>
        <p>
          You sent <strong>$13.50</strong> to Leo for Late night noodles.
        </p>
        <div class="success-avatars">
          <app-avatar [initials]="payer.initials" [color]="payer.avatarColor" />
          <span>
            <i></i>
            <app-icon name="send" [size]="16" />
            <i></i>
          </span>
          <app-avatar [initials]="payee.initials" [color]="payee.avatarColor" />
        </div>
        <button appButton class="full" type="button" (click)="close()">
          Back to Maple House
        </button>
      </app-modal>
    } @else {
      <app-modal modalClass="settle-modal" [dismissible]="true" (closed)="close()">
        <div class="modal-head">
          <div>
            <span>SMART SETTLE</span>
            <h2>Settle up</h2>
          </div>
          <button type="button" (click)="close()">
            <app-icon name="close" />
          </button>
        </div>

        <p class="modal-intro">We simplified your household debts into the fewest payments.</p>

        <div class="settle-choice selected">
          <i class="check-circle">
            <app-icon name="check" [size]="14" />
          </i>
          <app-avatar [initials]="payer.initials" [color]="payer.avatarColor" />
          <div>
            <span>You pay <strong>Leo</strong></span>
            <small>Late night noodles + groceries</small>
          </div>
          <b>$31.60</b>
        </div>

        <div class="pay-method">
          <span class="stat-icon violet">
            <app-icon name="wallet" />
          </span>
          <div>
            <strong>SplitPay wallet</strong>
            <small>Balance $284.20</small>
          </div>
          <span appTag tone="green">INSTANT</span>
          <app-icon name="chevron" />
        </div>

        <div class="settle-note">
          <app-icon name="lock" [size]="16" /> Protected by SplitPay secure payments
        </div>

        <div class="modal-footer">
          <button appButton variant="ghost" type="button" (click)="close()">Not now</button>
          <button appButton icon="send" type="button" [disabled]="saving()" (click)="confirm()">
            Pay $31.60
          </button>
        </div>
      </app-modal>
    }
  `,
})
export class SettleModalComponent {
  private readonly settlements = inject(SettlementApiService);
  private readonly modals = inject(UiModalService);
  private readonly toast = inject(ToastService);

  protected readonly done = signal(false);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);

  /** You (Maya) and the payee (Leo), matching the hardcoded design cast. */
  protected readonly payer = DEMO_PEOPLE[0];
  protected readonly payee = DEMO_PEOPLE[1];

  protected close(): void {
    this.modals.closeSettle();
  }

  protected confirm(): void {
    if (this.saving()) {
      return;
    }
    this.saving.set(true);
    this.error.set(null);

    const request: CreateSettlementRequest = {
      groupId: 'g-maple',
      toUserId: 'u-leo',
      amount: 31.6,
      method: 'wallet',
    };

    this.settlements.settle(request).subscribe({
      next: () => {
        this.saving.set(false);
        this.done.set(true);
      },
      error: () => {
        this.saving.set(false);
        this.error.set('Could not complete the payment. Please try again.');
        this.toast.error('Could not complete the payment. Please try again.');
      },
    });
  }
}
