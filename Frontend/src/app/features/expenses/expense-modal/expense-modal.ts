import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { ExpenseApiService } from '@app/core/api/expense-api.service';
import { ToastService } from '@app/core/services/toast.service';
import { UiModalService } from '@app/core/services/ui-modal.service';
import type { CreateExpenseRequest, ExpenseCategory } from '@app/models';
import { AppAvatarComponent } from '@app/shared/components/avatar/avatar';
import { AppButtonComponent } from '@app/shared/components/button/button';
import { IconComponent } from '@app/shared/components/icon/icon';
import { AppModalComponent } from '@app/shared/components/modal/modal';
import { DEMO_PEOPLE } from '@app/shared/constants/demo-people';

/** One of the hardcoded category pills of the design. */
interface ExpenseCategoryOption {
  value: ExpenseCategory;
  emoji: string;
  label: string;
}

/**
 * "New expense" overlay — a two-step flow (amount, then equal split of 4 people).
 *
 * Ported from the React `ExpenseModal`; the controlled inputs are now a typed
 * reactive form and the flow is driven by a `step` signal (0 = amount,
 * 1 = split). It closes itself through `UiModalService`.
 */
@Component({
  selector: 'app-expense-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    AppModalComponent,
    AppButtonComponent,
    AppAvatarComponent,
    IconComponent,
  ],
  template: `
    <app-modal (closed)="close()">
      <form [formGroup]="form" (ngSubmit)="onPrimary()">
        <div class="modal-head">
          <div>
            <span>NEW EXPENSE</span>
            <h2>{{ step() === 0 ? 'What did you spend?' : 'How should we split it?' }}</h2>
          </div>
          <button type="button" (click)="close()">
            <app-icon name="close" />
          </button>
        </div>

        <div class="step-dots">
          <i class="active"></i>
          <i [class.active]="step() === 1"></i>
        </div>

        @if (step() === 0) {
          <div class="expense-form">
            <label class="amount-input">
              <span>$</span>
              <input
                type="text"
                inputmode="decimal"
                formControlName="amount"
                placeholder="0.00"
              />
            </label>
            @if (!hasAmount()) {
              <small class="validation">Enter an amount to continue</small>
            }
            <label>
              What was it for?
              <div class="input-wrap">
                <span>🍜</span>
                <input type="text" formControlName="title" />
              </div>
            </label>
            <div>
              <label>Category</label>
              <div class="category-pills">
                @for (option of categories; track option.value) {
                  <button
                    type="button"
                    [class.active]="category() === option.value"
                    (click)="selectCategory(option.value)"
                  >
                    {{ option.emoji }} {{ option.label }}
                  </button>
                }
              </div>
            </div>
            <div class="form-grid">
              <label>
                Paid by
                <select>
                  <option>You (Maya)</option>
                  <option>Leo</option>
                </select>
              </label>
              <label>
                Household
                <select>
                  <option>Maple House</option>
                </select>
              </label>
            </div>
            <label class="receipt-upload">
              <app-icon name="camera" />
              <span>
                <strong>Add a receipt</strong>
                <small>JPG, PNG or PDF</small>
              </span>
              <app-icon name="plus" />
            </label>
          </div>
        } @else {
          <div class="split-form">
            <div class="split-total">
              <span>Expense total</span>
              <strong>\${{ splitTotal().toFixed(2) }}</strong>
            </div>
            <div class="tabs">
              <button type="button" class="active">Equal</button>
              <button type="button">Percentage</button>
              <button type="button">Custom</button>
            </div>
            @for (person of people; track person.initials; let i = $index) {
              <div class="split-person">
                <app-avatar [initials]="person.initials" [color]="person.avatarColor" size="sm" />
                <span>
                  <strong>{{ i === 0 ? 'You' : names[i] }}</strong>
                  <small>25%</small>
                </span>
                <b>\${{ perPerson().toFixed(2) }}</b>
                <i class="check-circle">
                  <app-icon name="check" [size]="14" />
                </i>
              </div>
            }
          </div>
        }

        <div class="modal-footer">
          <button appButton variant="ghost" type="button" (click)="onBack()">
            {{ step() === 0 ? 'Cancel' : 'Back' }}
          </button>
          <button
            appButton
            type="submit"
            [disabled]="step() === 0 && !hasAmount()"
          >
            {{ step() === 0 ? 'Continue' : 'Add expense' }}
          </button>
        </div>
      </form>
    </app-modal>
  `,
})
export class ExpenseModalComponent {
  private readonly expenses = inject(ExpenseApiService);
  private readonly modals = inject(UiModalService);
  private readonly toast = inject(ToastService);

  /** 0 = amount, 1 = equal-split recap. */
  protected readonly step = signal(0);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly form = inject(FormBuilder).nonNullable.group({
    amount: ['', [Validators.required]],
    title: ['Late night noodles'],
    category: ['food' as ExpenseCategory],
  });

  protected readonly categories: readonly ExpenseCategoryOption[] = [
    { value: 'food', emoji: '🍜', label: 'Food' },
    { value: 'groceries', emoji: '🛒', label: 'Groceries' },
    { value: 'home', emoji: '🏡', label: 'Home' },
    { value: 'utilities', emoji: '⚡', label: 'Utilities' },
  ];

  protected readonly people = DEMO_PEOPLE;
  protected readonly names = ['Maya', 'Leo', 'Nora', 'Sam'] as const;

  protected readonly amount = toSignal(this.form.controls.amount.valueChanges, {
    initialValue: this.form.controls.amount.value,
  });
  protected readonly category = toSignal(this.form.controls.category.valueChanges, {
    initialValue: this.form.controls.category.value,
  });

  protected readonly hasAmount = computed(() => this.amount().trim().length > 0);

  protected readonly splitTotal = computed(() => {
    const parsed = Number(this.amount());
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 54;
  });
  protected readonly perPerson = computed(() => this.splitTotal() / 4);

  protected readonly selectedCategory = computed(
    () => this.categories.find((option) => option.value === this.category()) ?? this.categories[0],
  );

  protected close(): void {
    this.modals.closeExpense();
  }

  protected selectCategory(value: ExpenseCategory): void {
    this.form.controls.category.setValue(value);
  }

  protected onBack(): void {
    if (this.step() === 0) {
      this.close();
      return;
    }
    this.step.set(0);
  }

  protected onPrimary(): void {
    if (this.step() === 0) {
      if (this.hasAmount()) {
        this.step.set(1);
      }
      return;
    }
    this.submit();
  }

  private submit(): void {
    if (this.saving() || this.form.invalid) {
      return;
    }
    this.saving.set(true);
    this.error.set(null);

    const value = this.form.getRawValue();
    const request: CreateExpenseRequest = {
      groupId: 'g-maple',
      title: value.title,
      emoji: this.selectedCategory().emoji,
      category: value.category,
      amount: Number(value.amount),
      paidByUserId: 'u-maya',
      splitMethod: 'equal',
      percentages: null,
      receiptUrl: null,
    };

    this.expenses.create(request).subscribe({
      next: () => {
        this.saving.set(false);
        this.toast.success('Expense added to Maple House');
        this.close();
      },
      error: () => {
        this.saving.set(false);
        this.error.set('Could not add the expense. Please try again.');
        this.toast.error('Could not add the expense. Please try again.');
      },
    });
  }
}
