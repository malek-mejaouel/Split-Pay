import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '@app/core/services/auth.service';
import { ToastService } from '@app/core/services/toast.service';
import { MOCK_CURRENT_USER } from '@app/mock';
import type { CurrencyCode, CurrencyOption } from '@app/models';
import { AppAvatarComponent } from '@app/shared/components/avatar/avatar';
import { AppButtonComponent } from '@app/shared/components/button/button';
import { AppCardComponent } from '@app/shared/components/card/card';
import { IconComponent } from '@app/shared/components/icon/icon';
import { DEMO_PEOPLE } from '@app/shared/constants/demo-people';
import { environment } from '@env/environment';

/**
 * Profile setup — step 2 of 2 of the onboarding flow (React `Onboarding`,
 * `profile` mode). Collects the display name + default currency
 * (`CompleteProfileRequest`).
 */
@Component({
  selector: 'app-profile-setup-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ReactiveFormsModule, AppButtonComponent, AppCardComponent, IconComponent, AppAvatarComponent],
  template: `
    <div class="simple-auth">
      <button type="button" class="brand" routerLink="/auth/welcome">
        <span class="brand-mark">
          <i></i>
          <i></i>
        </span>
        SplitPay
      </button>
      <section appCard class="profile-setup">
        <span class="step">STEP 2 OF 2</span>
        <h1>Make it yours</h1>
        <p>Your roommates will see this in shared expenses.</p>
        <div class="avatar-upload">
          <app-avatar [initials]="person.initials" [color]="person.avatarColor" size="lg" />
          <button type="button" aria-label="Change photo">
            <app-icon name="camera" [size]="16" />
          </button>
        </div>
        <form [formGroup]="form" (ngSubmit)="submit()">
          <label>
            Display name
            <input formControlName="displayName" autocomplete="nickname" />
            @if (invalid('displayName')) {
              <small class="field-error">Please choose a display name</small>
            }
          </label>
          <label>
            Default currency
            <select formControlName="currency">
              @for (option of currencies; track option.code) {
                <option [value]="option.code">{{ option.label }}</option>
              }
            </select>
          </label>
          <button appButton class="full" type="submit" [disabled]="submitting()">
            {{ submitting() ? 'Saving…' : 'Let’s go' }}
            <app-icon name="arrowUp" [size]="18" />
          </button>
        </form>
      </section>
    </div>
  `,
})
export class ProfileSetupPage {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  /** Decorative avatar, mirroring the React `<Avatar i={0} size="lg" />`. */
  protected readonly person = DEMO_PEOPLE[0];

  protected readonly currencies: readonly CurrencyOption[] = [
    { code: 'USD', label: 'USD · US Dollar' },
    { code: 'EUR', label: 'EUR · Euro' },
    { code: 'GBP', label: 'GBP · British Pound' },
    { code: 'TND', label: 'TND · Tunisian Dinar' },
  ];

  protected readonly form = this.fb.nonNullable.group({
    displayName: [
      environment.useMockData ? MOCK_CURRENT_USER.firstName : '',
      [Validators.required],
    ],
    currency: ['USD' as CurrencyCode, [Validators.required]],
  });

  protected readonly submitted = signal(false);
  protected readonly submitting = signal(false);

  protected invalid(name: 'displayName'): boolean {
    const control = this.form.controls[name];
    return control.invalid && (this.submitted() || control.touched);
  }

  protected submit(): void {
    this.submitted.set(true);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (this.submitting()) {
      return;
    }

    const { displayName, currency } = this.form.getRawValue();
    this.submitting.set(true);

    this.auth.completeProfile({ displayName, currency }).subscribe({
      next: () => void this.router.navigateByUrl('/dashboard'),
      error: () => {
        this.submitting.set(false);
        this.toast.error('We could not save your profile. Please try again.');
      },
    });
  }
}
