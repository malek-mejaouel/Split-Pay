import { Routes } from '@angular/router';

import { authGuard, guestGuard } from './core/guards/auth.guard';
import { AppShellComponent } from './core/layout/app-shell/app-shell';

/**
 * Application routes.
 *
 * - Everything below `auth/` is public (and only reachable while signed out).
 * - Everything else is rendered inside `AppShellComponent` and protected by
 *   `authGuard`; each page is lazy-loaded so the initial bundle stays small.
 */
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },

  {
    path: 'auth',
    canActivate: [guestGuard],
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },

  {
    path: '',
    component: AppShellComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        title: 'SplitPay · Home',
        loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.DashboardPage),
      },
      {
        path: 'households',
        title: 'SplitPay · Households',
        loadComponent: () =>
          import('./features/groups/households/households').then((m) => m.HouseholdsPage),
      },
      {
        path: 'households/:id',
        title: 'SplitPay · Household',
        loadComponent: () =>
          import('./features/groups/group-detail/group-detail').then((m) => m.GroupDetailPage),
      },
      {
        path: 'wallet',
        title: 'SplitPay · Wallet',
        loadComponent: () => import('./features/wallet/wallet').then((m) => m.WalletPage),
      },
      {
        path: 'recurring',
        title: 'SplitPay · Recurring',
        loadComponent: () => import('./features/recurring/recurring').then((m) => m.RecurringPage),
      },
      {
        path: 'savings',
        title: 'SplitPay · Savings',
        loadComponent: () => import('./features/savings/savings').then((m) => m.SavingsPage),
      },
      {
        path: 'notifications',
        title: 'SplitPay · Notifications',
        loadComponent: () =>
          import('./features/notifications/notifications').then((m) => m.NotificationsPage),
      },
      {
        path: 'profile',
        title: 'SplitPay · Settings',
        loadComponent: () => import('./features/profile/profile').then((m) => m.ProfilePage),
      },
      {
        path: 'design',
        title: 'SplitPay · UI kit',
        loadComponent: () =>
          import('./features/design-system/design-system').then((m) => m.DesignSystemPage),
      },
    ],
  },

  { path: '**', redirectTo: 'dashboard' },
];
