import { HttpErrorResponse } from '@angular/common/http';

/** Body shape returned by the gateway's error handler. */
interface GatewayErrorBody {
  message?: unknown;
  error?: unknown;
  details?: unknown;
}

function extractServerMessage(error: HttpErrorResponse): string | null {
  const payload: unknown = error.error;
  if (typeof payload === 'string' && payload.trim().length > 0) {
    return payload;
  }
  if (typeof payload === 'object' && payload !== null) {
    const body = payload as GatewayErrorBody;
    for (const candidate of [body.message, body.error, body.details]) {
      if (typeof candidate === 'string' && candidate.trim().length > 0) {
        return candidate;
      }
    }
  }
  return null;
}

/** Maps a failed HTTP call to a message a student can actually understand. */
export function toUserMessage(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) {
    return 'Something went wrong. Please try again.';
  }

  const fromServer = extractServerMessage(error);

  switch (error.status) {
    case 0:
      return 'Cannot reach the SplitPay gateway. Check that the API Gateway is running.';
    case 400:
      return fromServer ?? 'That request was not valid.';
    case 401:
      return 'Your session has expired. Please sign in again.';
    case 403:
      return fromServer ?? 'You do not have access to this action.';
    case 404:
      return fromServer ?? 'We could not find what you were looking for.';
    case 409:
      return fromServer ?? 'That conflicts with something that already exists.';
    case 422:
      return fromServer ?? 'Some fields need to be corrected.';
    case 429:
      return 'Too many requests — give it a few seconds.';
    default:
      if (error.status >= 500) {
        return fromServer ?? 'SplitPay services are having a moment. Your money is safe — try again.';
      }
      return error.message || 'Unexpected error.';
  }
}

/** `true` for the status codes where retrying makes sense. */
export function isRetryable(error: unknown): boolean {
  return error instanceof HttpErrorResponse && (error.status === 0 || error.status >= 500);
}
