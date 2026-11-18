import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

import { AppAvatarComponent } from '@app/shared/components/avatar/avatar';
import { AppAvatarStackComponent } from '@app/shared/components/avatar-stack/avatar-stack';
import { AppButtonComponent } from '@app/shared/components/button/button';
import { AppCardComponent } from '@app/shared/components/card/card';
import { AppEmptyStateComponent } from '@app/shared/components/empty-state/empty-state';
import { AppErrorStateComponent } from '@app/shared/components/error-state/error-state';
import { AppPageHeaderComponent } from '@app/shared/components/page-header/page-header';
import { AppProgressRingComponent } from '@app/shared/components/progress-ring/progress-ring';
import { AppSkeletonComponent } from '@app/shared/components/skeleton/skeleton';
import { AppSwitchComponent } from '@app/shared/components/switch/switch';
import { AppTagComponent } from '@app/shared/components/tag/tag';

interface ColorSwatch {
  hex: string;
  label: string;
}

/**
 * Design-system catalogue — replaces the React `DesignSystem` screen.
 *
 * Pure markup: color tokens, typography, the focused component showcase and the
 * three "product states", all built from the shared components.
 */
@Component({
  selector: 'app-design-system-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AppPageHeaderComponent,
    AppCardComponent,
    AppButtonComponent,
    AppTagComponent,
    AppSwitchComponent,
    AppAvatarComponent,
    AppAvatarStackComponent,
    AppProgressRingComponent,
    AppSkeletonComponent,
    AppEmptyStateComponent,
    AppErrorStateComponent,
  ],
  template: `
    <app-page-header
      eyebrow="SPLITPAY FOUNDATIONS · V1.0"
      title="Design system"
      subtitle="Friendly finance, built from a flexible 8px system."
    />

    <div class="design-stack">
      <section appCard class="design-section">
        <div class="design-heading">
          <span>01</span>
          <div>
            <h2>Color tokens</h2>
            <p>Accessible, expressive, and ready for light or dark mode.</p>
          </div>
        </div>
        <div class="swatches">
          @for (swatch of swatches; track swatch.hex) {
            <div>
              <i [style.background]="swatch.hex"></i>
              <strong>{{ swatch.label }}</strong>
              <span>{{ swatch.hex }}</span>
            </div>
          }
        </div>
      </section>

      <section appCard class="design-section">
        <div class="design-heading">
          <span>02</span>
          <div>
            <h2>Typography</h2>
            <p>Plus Jakarta Sans · clean, warm, and geometric.</p>
          </div>
        </div>
        <div class="type-specimen">
          <div>
            <span>DISPLAY / 48 / 700</span>
            <h1>Money is better together.</h1>
          </div>
          <div>
            <span>HEADING / 24 / 700</span>
            <h2>Maple House</h2>
            <span>BODY / 15 / 400</span>
            <p>Split the boring stuff. Save for the good stuff.</p>
          </div>
        </div>
      </section>

      <section appCard class="design-section">
        <div class="design-heading">
          <span>03</span>
          <div>
            <h2>Components</h2>
            <p>Reusable variants designed for Angular inputs and states.</p>
          </div>
        </div>
        <div class="component-showcase">
          <div>
            <label>BUTTONS</label>
            <div class="component-row">
              <button appButton>Primary</button>
              <button appButton variant="secondary">Secondary</button>
              <button appButton variant="ghost">Ghost</button>
              <button appButton variant="danger">Danger</button>
              <button appButton [disabled]="true">Disabled</button>
            </div>
          </div>
          <div>
            <label>INPUTS & CONTROLS</label>
            <div class="component-row">
              <div class="demo-input">
                <span>Email address</span>
                <strong>maya@splitpay.app</strong>
              </div>
              <div class="demo-input error">
                <span>Invite code</span>
                <strong>SP-2K</strong>
                <small>Code must be 6 characters</small>
              </div>
              <button
                appSwitch
                [checked]="demoSwitch()"
                (checkedChange)="demoSwitch.set($event)"
              ></button>
              <span appTag tone="green">PAID</span>
              <app-avatar initials="MP" color="lavender" />
              <app-avatar-stack [count]="5" />
              <app-progress-ring [value]="68" label="Funded" [small]="true" />
            </div>
          </div>
        </div>
      </section>

      <section appCard class="design-section state-section">
        <div class="design-heading">
          <span>04</span>
          <div>
            <h2>Product states</h2>
            <p>Every money moment gets a clear next step.</p>
          </div>
        </div>
        <div class="state-grid">
          <div>
            <label>LOADING</label>
            <app-skeleton />
          </div>
          <div>
            <label>EMPTY</label>
            <app-empty-state
              emoji="🪁"
              title="Nothing to split yet"
              message="Add your first expense."
            />
          </div>
          <div>
            <label>ERROR</label>
            <app-error-state
              title="That didn’t go through"
              message="Your balance is safe. Try again."
              [retryable]="false"
            />
          </div>
        </div>
      </section>

      <section appCard class="breakpoints">
        <div>
          <strong>Mobile</strong>
          <span>375px · 4 columns</span>
        </div>
        <i></i>
        <div>
          <strong>Tablet</strong>
          <span>768px · 8 columns</span>
        </div>
        <i></i>
        <div>
          <strong>Desktop</strong>
          <span>1440px · 12 columns</span>
        </div>
      </section>
    </div>
  `,
})
export class DesignSystemPage {
  protected readonly demoSwitch = signal(true);

  protected readonly swatches: readonly ColorSwatch[] = [
    { hex: '#6C4BFF', label: 'Primary / 500' },
    { hex: '#8B73FF', label: 'Primary / 400' },
    { hex: '#FF6B65', label: 'Coral / 500' },
    { hex: '#19B87A', label: 'Success / 500' },
    { hex: '#FFBF3F', label: 'Amber / 400' },
    { hex: '#161521', label: 'Ink / 900' },
  ];
}
