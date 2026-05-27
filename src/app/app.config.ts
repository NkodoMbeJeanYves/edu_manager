import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

import { APP_ROUTES } from './app.routes';
import { authInterceptor } from '@core/interceptors/auth.interceptor';
import { tenantInterceptor } from '@core/interceptors/tenant.interceptor';
import { errorInterceptor } from '@core/interceptors/error.interceptor';
import { mockBackendInterceptor } from '@core/interceptors/mock-backend.interceptor';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(APP_ROUTES, withComponentInputBinding(), withViewTransitions()),
    provideHttpClient(
      // mockBackendInterceptor must come FIRST so it can short-circuit requests
      // to the mock URL before they reach auth/tenant/error layers.
      withInterceptors([mockBackendInterceptor, authInterceptor, tenantInterceptor, errorInterceptor]),
    ),
    provideAnimations(), provideAnimationsAsync(),
  ],
};
