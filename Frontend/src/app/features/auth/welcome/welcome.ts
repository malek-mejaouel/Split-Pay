import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AppAvatarStackComponent } from '@app/shared/components/avatar-stack/avatar-stack';
import { AppButtonComponent } from '@app/shared/components/button/button';
import { AppTagComponent } from '@app/shared/components/tag/tag';

/**
 * Public landing screen of the onboarding flow (React `Onboarding`, `welcome`
 * mode). Purely presentational — the two CTAs route to sign-up / sign-in.
 */
@Component({
  selector: 'app-welcome-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, AppButtonComponent, AppTagComponent, AppAvatarStackComponent],
  template: `
    <div class="onboarding">
      <div class="onboard-visual">
        <div class="onboard-brand">
          <span class="brand-mark">
            <i></i>
            <i></i>
          </span>
          SplitPay
        </div>
        <div class="floating-card fc-one">
          <span>🍕</span>
          <div>
            <small>Pizza night</small>
            <strong>$48.00</strong>
          </div>
          <span appTag tone="green">SPLIT 4 WAYS</span>
        </div>
        <div class="floating-card fc-two">
          <app-avatar-stack [count]="4" />
          <strong>Everyone’s even</strong>
          <span>Just like that.</span>
        </div>
        <div class="hero-ring">
          <span>$</span>
          <i>✦</i>
        </div>
        <div class="onboard-copy">
          <h1>
            Money’s easier
            <br />
            with your people.
          </h1>
          <p>Split bills, settle up, and save for what’s next—all in one happy place.</p>
        </div>
      </div>
      <div class="onboard-form">
        <div class="mobile-onboard-brand">
          <span class="brand-mark">
            <i></i>
            <i></i>
          </span>
          SplitPay
        </div>
        <div>
          <span appTag tone="violet">YOUR MONEY, MINUS THE AWKWARD</span>
          <h2>Ready to split smarter?</h2>
          <p>Join thousands of households keeping money friendly.</p>
          <button appButton class="full" type="button" routerLink="/auth/sign-up">
            Create free account
          </button>
          <button
            appButton
            variant="secondary"
            class="full"
            type="button"
            routerLink="/auth/sign-in"
          >
            I already have an account
          </button>
          <div class="social-divider">
            <i></i>
            or continue with
            <i></i>
          </div>
          <div class="social-buttons">
            <button type="button">G&nbsp; Google</button>
            <button type="button">●&nbsp; Apple</button>
          </div>
          <small class="legal">
            By continuing, you agree to our Terms and Privacy Policy.
          </small>
        </div>
      </div>
    </div>
  `,
})
export class WelcomePage {}
