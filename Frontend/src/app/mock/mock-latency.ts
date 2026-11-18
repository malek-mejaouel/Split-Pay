import { Observable, delay, of } from 'rxjs';

import { environment } from '@env/environment';

/**
 * Wraps mock data in a delayed observable so the UI exercises the very same
 * loading / skeleton states it will show against the real gateway.
 */
export function mockOf<T>(data: T, latencyMs: number = environment.mockLatencyMs): Observable<T> {
  return of(data).pipe(delay(latencyMs));
}
