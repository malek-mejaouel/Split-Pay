import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  type AbstractControl,
  type ValidationErrors,
  type ValidatorFn,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { RETURN_URL_PARAM } from '@app/core/constants/api-endpoints';
import { AuthService } from '@app/core/services/auth.service';
import { ToastService } from '@app/core/services/toast.service';
import { MOCK_CURRENT_USER } from '@app/mock';
import { AppAvatarStackComponent } from '@app/shared/components/avatar-stack/avatar-stack';
import { AppButtonComponent } from '@app/shared/components/button/button';
import { IconComponent } from '@app/shared/components/icon/icon';
import { AppInputComponent } from '@app/shared/components/input/input';
import { AppTagComponent } from '@app/shared/components/tag/tag';
import { environment } from '@env/environment';

/**
 * Re-implements the original `!email.includes('@')` check as a reactive-form
 * validator, so the design's (looser) rules and `Validators.email` both apply.
 */
const emailFormatValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = control.value;
  if (typeof value !== 'string' || value.length === 0) {
    return null;
  }
  return AuthService.isValidEmail(value) ? null : { email: true };
};

/** Demo credentials that keep the mock build usable from the very first click. */
const DEMO_EMAIL = MOCK_CURRENT_USER.email;
const DEMO_PASSWORD = 'splitpay123';

/**
 * Sign-in screen of the onboarding flow (React `Onboarding`, `signin` mode).
 */
@Component({
  selector: 'app-sign-in-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    AppButtonComponent,
    AppInputComponent,
    AppTagComponent,
    IconComponent,
    AppAvatarStackComponent,
  ],
  template: `
    <div class="auth-layout">
      <div class="auth-aside">
        <button type="button" class="onboard-brand auth-brand" routerLink="/auth/welcome">
          <span class="brand-mark">
            <i></i>
            <i></i>
          </span>
          SplitPay
        </button>
        <div class="auth-aside-copy">
          <div class="auth-illustration">
            <span class="auth-coin">$</span>
            <span class="auth-bubble">All settled!</span>
            <app-avatar-stack [count]="4" />
          </div>
          <span appTag tone="green">WELCOME BACK</span>
          <h1>Pick up right where your group left off.</h1>
          <p>Your wallet, splits, and savings goals are waiting.</p>
        </div>
        <div class="auth-trust">
          <app-icon name="lock" [size]="16" />
          Bank-level encryption · Your money stays protected
        </div>
      </div>
      <div class="auth-panel">
        <form class="auth-card" [formGroup]="form" (ngSubmit)="submit()">
          <button type="button" class="auth-back" routerLink="/auth/welcome">
            <span>←</span> Back
          </button>
          <span class="step">SIGN IN</span>
          <h1>Good to see you again</h1>
          <p>Enter your details to open your SplitPay account.</p>
          <button type="button" class="google-auth">G&nbsp;&nbsp; Continue with Google</button>
          <div class="social-divider">
            <i></i>
            or use email
            <i></i>
          </div>
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
            <span class="label-row">
              Password
              <button type="button">Forgot password?</button>
            </span>
            <div class="password-field" [class.input-error]="invalid('password')">
              <input
                [type]="showPassword() ? 'text' : 'password'"
                formControlName="password"
                placeholder="Enter your password"
                autocomplete="current-password"
              />
              <button type="button" (click)="togglePassword()">
                {{ showPassword() ? 'Hide' : 'Show' }}
              </button>
            </div>
            @if (invalid('password')) {
              <small class="field-error">Password must be at least 8 characters</small>
            }
          </label>
          <label class="remember-row">
            <input type="checkbox" formControlName="rememberMe" />
            <span>Keep me signed in</span>
          </label>
          <button appButton class="full" type="submit" [disabled]="submitting()">
            {{ submitting() ? 'Signing in…' : 'Sign in' }}
            <app-icon name="chevron" [size]="18" />
          </button>
          @if (demoMode) {
            <small class="legal">
              Demo mode: any valid email with an 8-character password works while the backend is
              offline.
            </small>
          }
          <p class="auth-switch">
            New to SplitPay?
            <button type="button" routerLink="/auth/sign-up">Create an account</button>
          </p>
        </form>
      </div>
    </div>
  `,
})
export class SignInPage {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  /** Prefills the demo credentials so the mock build works out of the box. */
  protected readonly demoMode = environment.useMockData;

  protected readonly showPassword = signal(false);
  protected readonly submitted = signal(false);
  protected readonly submitting = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    email: [
      this.demoMode ? DEMO_EMAIL : '',
      [Validators.required, Validators.email, emailFormatValidator],
    ],
    password: [
      this.demoMode ? DEMO_PASSWORD : '',
      [Validators.required, Validators.minLength(AuthService.minPasswordLength)],
    ],
    rememberMe: [true],
  });

  protected togglePassword(): void {
    this.showPassword.update((value) => !value);
  }

  protected invalid(name: 'email' | 'password'): boolean {
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

    const { email, password, rememberMe } = this.form.getRawValue();
    this.submitting.set(true);

    this.auth.login({ email, password, rememberMe }).subscribe({
      next: () => this.redirectAfterAuth(),
      error: () => {
        this.submitting.set(false);
        this.toast.error('We could not sign you in. Please check your details and try again.');
      },
    });
  }

  private redirectAfterAuth(): void {
    const returnUrl = this.route.snapshot.queryParamMap.get(RETURN_URL_PARAM) ?? '/dashboard';
    void this.router.navigateByUrl(returnUrl);
  }
}
