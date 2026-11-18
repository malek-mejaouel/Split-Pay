import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { environment } from '@env/environment';
import { RETURN_URL_PARAM } from '../constants/api-endpoints';
import { TokenStorageService } from '../services/token-storage.service';

/**
 * Attaches the JWT to every call addressed to the API Gateway, and signs the
 * user out when the gateway answers `401`.
 *
 * It only injects `TokenStorageService` (no `HttpClient`, no `AuthService`) so
 * there is no dependency cycle between the interceptor and the HTTP client.
 */
export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const storage = inject(TokenStorageService);
  const router = inject(Router);

  const token = storage.token();
  const targetsGateway = request.url.startsWith(environment.apiUrl);

  if (token === null || !targetsGateway) {
    return next(request);
  }

  const authorized = request.clone({ setHeaders: { Authorization: `Bearer ${token}` } });

  return next(authorized).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        const returnUrl = router.url;
        storage.clear();
        void router.navigate(['/auth/sign-in'], {
          queryParams: returnUrl === '/' ? {} : { [RETURN_URL_PARAM]: returnUrl },
        });
      }
      return throwError(() => error);
    }),
  );
};
