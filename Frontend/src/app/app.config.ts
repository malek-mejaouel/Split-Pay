import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { environment } from '@env/environment';

import { routes } from './app.routes';
import { MOCK_NOW } from './mock';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { DEMO_NOW } from './core/services/clock.service';

/**
 * Root dependency-injection configuration (standalone APIs, no NgModule).
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({ scrollPositionRestoration: 'top', anchorScrolling: 'enabled' }),
    ),
    // Every HTTP call goes through the auth interceptor (Bearer + 401) and then
    // the error interceptor (gateway error -> toast).
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    // Freeze "now" on the demo clock while the mock layer is on, so the relative
    // labels ("12m", "Due in 4 days") stay in sync with the mock dataset.
    { provide: DEMO_NOW, useValue: environment.useMockData ? MOCK_NOW : null },
  ],
};
