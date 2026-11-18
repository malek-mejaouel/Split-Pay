import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { AuthService } from '@app/core/services/auth.service';
import { ThemeService } from '@app/core/services/theme.service';
import { ToastService } from '@app/core/services/toast.service';
import { AppAvatarComponent } from '@app/shared/components/avatar/avatar';
import { AppButtonComponent } from '@app/shared/components/button/button';
import { AppCardComponent } from '@app/shared/components/card/card';
import { IconComponent } from '@app/shared/components/icon/icon';
import { AppPageHeaderComponent } from '@app/shared/components/page-header/page-header';
import { AppSwitchComponent } from '@app/shared/components/switch/switch';
import { AppTagComponent } from '@app/shared/components/tag/tag';
import { DEMO_PEOPLE } from '@app/shared/constants/demo-people';
import type { UserStats } from '@app/models';

/**
 * Profile & settings — replaces the React `Profile` screen.
 *
 * The old `dark` / `setDark` / `setScreen` props are gone: the theme comes from
 * `ThemeService` and sign-out goes through `AuthService.logout()`, which owns
 * the navigation. The editable personal details are a typed reactive form.
 */
@Component({
  selector: 'app-profile-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    AppPageHeaderComponent,
    AppCardComponent,
    AppButtonComponent,
    AppAvatarComponent,
    AppSwitchComponent,
    AppTagComponent,
    IconComponent,
  ],
  template: `
    <app-page-header
      title="Profile & settings"
      subtitle="Make SplitPay feel like yours."
    />

    <div class="settings-grid">
      <section appCard class="profile-card">
        <div class="avatar-edit">
          <app-avatar [initials]="avatar.initials" [color]="avatar.avatarColor" size="lg" />
          <button type="button" aria-label="Change profile photo">
            <app-icon name="camera" [size]="16" />
          </button>
        </div>
        <h2>{{ user()?.fullName ?? 'Maya Patel' }}</h2>
        <p>{{ user()?.email ?? 'maya@splitpay.app' }}</p>
        <span appTag tone="violet">VERIFIED STUDENT</span>
        <div class="profile-stats">
          <div>
            <strong>{{ stats()?.households ?? 0 }}</strong>
            <span>Households</span>
          </div>
          <div>
            <strong>{{ stats()?.splits ?? 0 }}</strong>
            <span>Splits</span>
          </div>
          <div>
            <strong>{{ stats()?.friends ?? 0 }}</strong>
            <span>Friends</span>
          </div>
        </div>
        <button appButton variant="secondary" icon="edit" type="button" (click)="toggleEditing()">
          {{ editing() ? 'Close editor' : 'Edit profile' }}
        </button>
      </section>

      <div class="settings-stack">
        @if (editing()) {
          <section appCard class="settings-card account-details">
            <div class="settings-title">
              <div>
                <h2>Personal details</h2>
                <p>This is how friends recognize you in SplitPay.</p>
              </div>
              <span appTag tone="green">SAVED LOCALLY</span>
            </div>
            <form class="profile-form-grid" [formGroup]="form" (ngSubmit)="save()">
              <label>
                Full name
                <input formControlName="fullName" />
              </label>
              <label>
                SplitPay handle
                <input formControlName="handle" />
              </label>
              <label>
                Email address
                <input type="email" formControlName="email" />
              </label>
              <label>
                Phone number
                <input type="tel" formControlName="phone" />
              </label>
            </form>
            <div class="profile-form-actions">
              <button appButton variant="ghost" type="button" (click)="cancel()">Cancel</button>
              <button appButton icon="check" type="button" (click)="save()">Save changes</button>
            </div>
          </section>
        }

        <section appCard class="settings-card">
          <h2>Preferences</h2>
          <div class="setting-row">
            <span class="setting-icon">
              <app-icon [name]="theme.isDark() ? 'moon' : 'sun'" />
            </span>
            <div>
              <strong>Dark mode</strong>
              <small>Easy on the eyes at night</small>
            </div>
            <button appSwitch [checked]="theme.isDark()" (checkedChange)="onDarkChange($event)"></button>
          </div>
          <div class="setting-row">
            <span class="setting-icon">
              <app-icon name="bell" />
            </span>
            <div>
              <strong>Push notifications</strong>
              <small>Payments, reminders, and requests</small>
            </div>
            <button
              appSwitch
              [checked]="pushEnabled()"
              (checkedChange)="pushEnabled.set($event)"
            ></button>
          </div>
          <div class="setting-row">
            <span class="setting-icon">
              <app-icon name="wallet" />
            </span>
            <div>
              <strong>Default currency</strong>
              <small>{{ user()?.defaultCurrency ?? 'USD' }} · US Dollar</small>
            </div>
            <app-icon name="chevron" />
          </div>
        </section>

        <section appCard class="settings-card">
          <h2>Security & privacy</h2>
          <div class="setting-row">
            <span class="setting-icon">
              <app-icon name="lock" />
            </span>
            <div>
              <strong>Security</strong>
              <small>Passcode, biometrics, and devices</small>
            </div>
            <app-icon name="chevron" />
          </div>
          <div class="setting-row">
            <span class="setting-icon">
              <app-icon name="users" />
            </span>
            <div>
              <strong>Invite friends</strong>
              <small>Give $5, get $5</small>
            </div>
            <app-icon name="chevron" />
          </div>
        </section>

        <button class="logout-row" type="button" (click)="logout()">
          <app-icon name="logout" /> Log out
        </button>
      </div>
    </div>
  `,
})
export class ProfilePage {
  protected readonly theme = inject(ThemeService);

  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);

  protected readonly user = this.auth.user;
  protected readonly stats = signal<UserStats | null>(null);
  protected readonly editing = signal(false);
  protected readonly pushEnabled = signal(true);

  /** React's `<Avatar i={0} />` — the first member of the demo cast. */
  protected readonly avatar = DEMO_PEOPLE[0];

  protected readonly form = inject(FormBuilder).nonNullable.group({
    fullName: ['', Validators.required],
    handle: [''],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
  });

  constructor() {
    const user = this.auth.user();
    this.form.patchValue({
      fullName: user?.fullName ?? '',
      handle: user?.handle ?? '',
      email: user?.email ?? '',
      phone: user?.phone ?? '',
    });

    this.auth.getStats().subscribe({
      next: (stats) => this.stats.set(stats),
      error: () => {
        /* the error interceptor already surfaced a toast */
      },
    });
  }

  protected toggleEditing(): void {
    this.editing.update((value) => !value);
  }

  protected cancel(): void {
    this.editing.set(false);
  }

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { fullName, handle, email, phone } = this.form.getRawValue();
    this.auth.updateProfile({ fullName, handle, email, phone }).subscribe({
      next: () => {
        this.toast.success('Profile updated');
        this.editing.set(false);
      },
      error: () => {
        /* the error interceptor already surfaced a toast */
      },
    });
  }

  protected onDarkChange(value: boolean): void {
    this.theme.set(value ? 'dark' : 'light');
  }

  protected logout(): void {
    this.auth.logout();
  }
}
