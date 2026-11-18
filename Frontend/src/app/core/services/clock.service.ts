import { InjectionToken, Injectable, inject } from '@angular/core';

/**
 * Optional fixed "now" used by the mock layer.
 *
 * When `environment.useMockData` is `true`, `app.config.ts` provides the demo
 * clock so relative labels ("12m", "Yesterday", "Due in 4 days") stay in sync
 * with the mock dataset instead of drifting with the real clock.
 */
export const DEMO_NOW = new InjectionToken<Date | null>('SPLITPAY_DEMO_NOW');

/** Single source of "now" for the whole app (easily mocked in tests). */
@Injectable({ providedIn: 'root' })
export class ClockService {
  private readonly demoNow = inject(DEMO_NOW, { optional: true });

  now(): Date {
    return this.demoNow ? new Date(this.demoNow) : new Date();
  }
}
