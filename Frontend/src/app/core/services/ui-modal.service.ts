import { Injectable, signal } from '@angular/core';

/**
 * Owns the two global overlays of the app (add expense / settle up).
 *
 * Any page can call `openExpense()`; the shell renders the modal once, exactly
 * like the single `AppShell` of the Figma export did.
 */
@Injectable({ providedIn: 'root' })
export class UiModalService {
  private readonly expenseVisible = signal(false);
  private readonly settleVisible = signal(false);

  readonly expenseOpen = this.expenseVisible.asReadonly();
  readonly settleOpen = this.settleVisible.asReadonly();

  openExpense(): void {
    this.expenseVisible.set(true);
  }

  closeExpense(): void {
    this.expenseVisible.set(false);
  }

  openSettle(): void {
    this.settleVisible.set(true);
  }

  closeSettle(): void {
    this.settleVisible.set(false);
  }
}
