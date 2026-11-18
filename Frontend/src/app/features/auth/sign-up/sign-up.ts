import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  type AbstractControl,
  type ValidationErrors,
  type ValidatorFn,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '@app/core/services/auth.service';
import { ToastService } from '@app/core/services/toast.service';
import { MOCK_CURRENT_USER } from '@app/mock';
import { AppButtonComponent } from '@app/shared/components/button/button';
import { AppCardComponent } from '@app/shared/components/card/card';
import { IconComponent } from '@app/shared/components/icon/icon';
import { AppInputComponent } from '@app/shared/components/input/input';
import { environment } from '@env/environment';

/**
 * Mirrors the original `!email.includes('@')` rule as a reactive-form
 * validator, alongside `Validators.email`.
 */
const emailFormatValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = control.value;
  if (typeof value !== 'string' || value.length === 0) {
    return null;
  }
  return AuthService.isValidEmail(value) ? null : { email: true };
};

/**
 * Sign-up screen — step 1 of 2 of the onboarding flow (React `Onboarding`,
 * `signup` mode).
 */
@Component({
  selector: 'app-sign-up-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    AppButtonComponent,
    AppCardComponent,
    AppInputComponent,
    IconComponent,
  ],
  template: `
    <div class="simple-auth">
      <button type="button" class="brand" routerLink="/auth/welcome">
        <span class="brand-mark">
          <i></i>
          <i></i>
        </span>
        SplitPay
      </button>
      <section appCard>
        <span class="step">STEP 1 OF 2</span>
        <h1>Create your account</h1>
        <p>A few details and you’re in.</p>
        <div class="auth-benefits">
          <span>
            <app-icon name="check" [size]="13" /> Free forever for everyday splits
          </span>
          <span>
            <app-icon name="check" [size]="13" /> Set up in under two minutes
          </span>
        </div>
        <form [formGroup]="form" (ngSubmit)="submit()">
          <label>
            Full name
            <input appInput formControlName="fullName" autocomplete="name" />
            @if (invalid('fullName')) {
              <small class="field-error">Please enter your full name</small>
            }
          </label>
          <label>
            Email address
            <input
              appInput
              type="email"
              formControlName="email"
              placeholder="you@email.com"
              autocomplete="email"
              [invalid]="invalid('email')"
            />
            @if (invalid('email')) {
              <small class="field-error">Enter a valid email address</small>
            }
          </label>
          <label>
            Password
            <input
              appInput
              type="password"
              formControlName="password"
              placeholder="At least 8 characters"
              autocomplete="new-password"
              [invalid]="invalid('password')"
            />
            @if (invalid('password')) {
              <small class="field-error">Password must be at least 8 characters</small>
            }
          </label>
          <label class="remember-row terms-row">
            <input type="checkbox" formControlName="acceptedTerms" />
            <span>I agree to SplitPay’s Terms and Privacy Policy.</span>
          </label>
          <button appButton class="full" type="submit" [disabled]="submitting()">
            {{ submitting() ? 'Creating your account…' : 'Continue' }}
            <app-icon name="chevron" [size]="18" />
          </button>
          <p class="auth-switch">
            Already have an account?
            <button type="button" routerLink="/auth/sign-in">Sign in</button>
          </p>
        </form>
      </section>
    </div>
  `,
})
export class SignUpPage {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  protected readonly form = this.fb.nonNullable.group({
    fullName: [
      environment.useMockData ? MOCK_CURRENT_USER.fullName : '',
      [Validators.required, Validators.minLength(2)],
    ],
    email: ['', [Validators.required, Validators.email, emailFormatValidator]],
    password: [
      '',
      [Validators.required, Validators.minLength(AuthService.minPasswordLength)],
    ],
    acceptedTerms: [true, [Validators.requiredTrue]],
  });

  protected readonly submitted = signal(false);
  protected readonly submitting = signal(false);

  protected invalid(name: 'fullName' | 'email' | 'password'): boolean {
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

    const { fullName, email, password, acceptedTerms } = this.form.getRawValue();
    this.submitting.set(true);

    this.auth.register({ fullName, email, password, acceptedTerms }).subscribe({
      next: () => void this.router.navigate(['/auth/profile-setup']),
      error: () => {
        this.submitting.set(false);
        this.toast.error('We could not create your account. Please try again.');
      },
    });
  }
}
