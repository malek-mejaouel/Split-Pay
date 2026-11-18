import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AppAvatarComponent } from '../../../shared/components/avatar/avatar';
import { AppBadgeComponent } from '../../../shared/components/badge/badge';
import { IconComponent, type IconName } from '../../../shared/components/icon/icon';
import { ExpenseModalComponent } from '../../../features/expenses/expense-modal/expense-modal';
import { SettleModalComponent } from '../../../features/settlements/settle-modal/settle-modal';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { ThemeService } from '../../services/theme.service';
import { UiModalService } from '../../services/ui-modal.service';

interface NavItem {
  path: string;
  label: string;
  icon: IconName;
  /** Optional trailing counter (the "3" next to Households). */
  badge?: number;
}

/**
 * Signed-in frame: sidebar, topbar, bottom navigation and the two global
 * overlays (add expense / settle up).
 *
 * Replaces the React `AppShell` — navigation is now real routing instead of a
 * `useState<Screen>` switch, and the theme comes from `ThemeService`.
 */
@Component({
  selector: 'app-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    IconComponent,
    AppAvatarComponent,
    AppBadgeComponent,
    ExpenseModalComponent,
    SettleModalComponent,
  ],
  templateUrl: './app-shell.html',
})
export class AppShellComponent {
  protected readonly theme = inject(ThemeService);
  protected readonly notifications = inject(NotificationService);
  protected readonly modals = inject(UiModalService);

  private readonly auth = inject(AuthService);

  protected readonly displayName = computed(() => this.auth.user()?.fullName ?? 'Maya Patel');
  protected readonly email = computed(() => this.auth.user()?.email ?? 'maya@splitpay.app');

  protected readonly overview: readonly NavItem[] = [
    { path: '/dashboard', label: 'Home', icon: 'home' },
    { path: '/households', label: 'Households', icon: 'users', badge: 3 },
    { path: '/wallet', label: 'Wallet', icon: 'wallet' },
    { path: '/recurring', label: 'Recurring', icon: 'repeat' },
    { path: '/savings', label: 'Savings', icon: 'target' },
  ];

  protected readonly account: readonly NavItem[] = [
    { path: '/notifications', label: 'Notifications', icon: 'bell' },
    { path: '/profile', label: 'Settings', icon: 'settings' },
    { path: '/design', label: 'UI kit', icon: 'grid' },
  ];

  protected readonly bottomNav: readonly NavItem[] = [
    { path: '/dashboard', label: 'Home', icon: 'home' },
    { path: '/households', label: 'Households', icon: 'users' },
    { path: '/wallet', label: 'Wallet', icon: 'wallet' },
    { path: '/savings', label: 'Save', icon: 'target' },
    { path: '/profile', label: 'More', icon: 'settings' },
  ];

  constructor() {
    // Starts the (polling) unread-counter loop. Swapping the transport for a
    // WebSocket/SSE later only changes `NotificationService`.
    this.notifications.start();
  }
}
