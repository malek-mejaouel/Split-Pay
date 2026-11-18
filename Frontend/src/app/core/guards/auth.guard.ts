import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { RETURN_URL_PARAM } from '../constants/api-endpoints';
import { TokenStorageService } from '../services/token-storage.service';

/**
 * Blocks every shell page until a JWT is present, remembering where the user
 * wanted to go so `AuthService` can bounce them back after sign-in.
 */
export const authGuard: CanActivateFn = (_route, state) => {
  const storage = inject(TokenStorageService);
  const router = inject(Router);

  if (storage.token() !== null) {
    return true;
  }

  return router.createUrlTree(['/auth/sign-in'], {
    queryParams: { [RETURN_URL_PARAM]: state.url },
  });
};

/** Keeps signed-in users away from the sign-in / sign-up screens. */
export const guestGuard: CanActivateFn = () => {
  const storage = inject(TokenStorageService);
  const router = inject(Router);

  return storage.token() === null ? true : router.createUrlTree(['/dashboard']);
};
