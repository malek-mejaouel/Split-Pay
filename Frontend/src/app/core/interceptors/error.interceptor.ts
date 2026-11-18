import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

import { ToastService } from '../services/toast.service';
import { toUserMessage } from '../utils/http-error';

/**
 * Turns every failed gateway call into a human toast message.
 *
 * The original error is re-thrown so pages can still show their own empty /
 * error state (and so `isRetryable` logic keeps working).
 */
export const errorInterceptor: HttpInterceptorFn = (request, next) => {
  const toasts = inject(ToastService);

  return next(request).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        // 401 is already handled by `authInterceptor` (session cleared + redirect).
        if (error.status !== 401) {
          toasts.error(toUserMessage(error));
        }
      } else {
        toasts.error(toUserMessage(error));
      }
      return throwError(() => error);
    }),
  );
};
