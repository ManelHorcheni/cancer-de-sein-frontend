import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(), // Mode sans Zone.js
    provideRouter(routes),
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor])
    )
  ]
};