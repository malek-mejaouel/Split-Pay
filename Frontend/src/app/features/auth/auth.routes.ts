import { Routes } from '@angular/router';

/**
 * Public onboarding flow (`/auth/*`).
 *
 * Rendered outside the app shell, so every page owns its own full-screen
 * layout. The parent route is protected by `guestGuard`, which keeps signed-in
 * users out of these screens.
 */
export const AUTH_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'welcome' },
  {
    path: 'welcome',
    title: 'SplitPay · Welcome',
    loadComponent: () => import('./welcome/welcome').then((m) => m.WelcomePage),
  },
  {
    path: 'sign-in',
    title: 'SplitPay · Sign in',
    loadComponent: () => import('./sign-in/sign-in').then((m) => m.SignInPage),
  },
  {
    path: 'sign-up',
    title: 'SplitPay · Sign up',
    loadComponent: () => import('./sign-up/sign-up').then((m) => m.SignUpPage),
  },
  {
    path: 'profile-setup',
    title: 'SplitPay · Your profile',
    loadComponent: () => import('./profile-setup/profile-setup').then((m) => m.ProfileSetupPage),
  },
];
